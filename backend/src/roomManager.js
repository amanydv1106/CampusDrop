import crypto from "crypto";

export class RoomManager {
  constructor() {
    // peerId -> peerSession { peerId, ws, name, device, ip, localRoomId, publicRoomId, pairedSecrets }
    this.peers = new Map();

    // localRoomId (e.g. hashed IP) -> Set of peerIds
    this.localRooms = new Map();

    // publicRoomId (e.g. 5-char code) -> Set of peerIds
    this.publicRooms = new Map();

    // 6-digit pairKey -> { peerId, expiresAt }
    this.pendingPairKeys = new Map();

    // pairingSecret (32-char hex) -> Set of peerIds
    this.pairedSecrets = new Map();

    // Periodically clean expired pair keys
    setInterval(() => this.cleanupExpiredPairKeys(), 60000);
  }

  // Get a normalized local room key from client IP
  getLocalRoomKey(ip) {
    if (!ip || ip === "::1" || ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")) {
      // Local development or private LAN
      return "local_dev_lan";
    }
    // Hash the public IP to protect privacy
    return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
  }

  registerPeer(peerId, ws, meta) {
    const localRoomId = this.getLocalRoomKey(meta.ip);
    const peer = {
      peerId,
      ws,
      name: meta.name,
      device: meta.device,
      ip: meta.ip,
      localRoomId,
      publicRoomId: meta.publicRoomId || null,
      pairedSecrets: new Set(meta.pairedSecrets || [])
    };

    this.peers.set(peerId, peer);

    // Add to local room
    if (!this.localRooms.has(localRoomId)) {
      this.localRooms.set(localRoomId, new Set());
    }
    this.localRooms.get(localRoomId).add(peerId);

    // Add to public room if requested
    if (peer.publicRoomId) {
      if (!this.publicRooms.has(peer.publicRoomId)) {
        this.publicRooms.set(peer.publicRoomId, new Set());
      }
      this.publicRooms.get(peer.publicRoomId).add(peerId);
    }

    // Register paired secrets
    for (const secret of peer.pairedSecrets) {
      if (!this.pairedSecrets.has(secret)) {
        this.pairedSecrets.set(secret, new Set());
      }
      this.pairedSecrets.get(secret).add(peerId);
    }

    return peer;
  }

  unregisterPeer(peerId) {
    const peer = this.peers.get(peerId);
    if (!peer) return null;

    // Remove from local room
    if (peer.localRoomId && this.localRooms.has(peer.localRoomId)) {
      const room = this.localRooms.get(peer.localRoomId);
      room.delete(peerId);
      if (room.size === 0) this.localRooms.delete(peer.localRoomId);
    }

    // Remove from public room
    if (peer.publicRoomId && this.publicRooms.has(peer.publicRoomId)) {
      const room = this.publicRooms.get(peer.publicRoomId);
      room.delete(peerId);
      if (room.size === 0) this.publicRooms.delete(peer.publicRoomId);
    }

    // Remove from paired secrets
    for (const secret of peer.pairedSecrets) {
      if (this.pairedSecrets.has(secret)) {
        const secretPeers = this.pairedSecrets.get(secret);
        secretPeers.delete(peerId);
        if (secretPeers.size === 0) this.pairedSecrets.delete(secret);
      }
    }

    // Remove any pending pair keys created by this peer
    for (const [key, val] of this.pendingPairKeys.entries()) {
      if (val.peerId === peerId) {
        this.pendingPairKeys.delete(key);
      }
    }

    this.peers.delete(peerId);
    return peer;
  }

  updatePeerName(peerId, newName) {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.name = newName;
      return true;
    }
    return false;
  }

  joinPublicRoom(peerId, roomId) {
    const peer = this.peers.get(peerId);
    if (!peer) return false;

    // Leave old public room if any
    if (peer.publicRoomId && this.publicRooms.has(peer.publicRoomId)) {
      this.publicRooms.get(peer.publicRoomId).delete(peerId);
    }

    peer.publicRoomId = roomId;
    if (!this.publicRooms.has(roomId)) {
      this.publicRooms.set(roomId, new Set());
    }
    this.publicRooms.get(roomId).add(peerId);
    return true;
  }

  leavePublicRoom(peerId) {
    const peer = this.peers.get(peerId);
    if (!peer || !peer.publicRoomId) return false;

    const roomId = peer.publicRoomId;
    if (this.publicRooms.has(roomId)) {
      this.publicRooms.get(roomId).delete(peerId);
    }
    peer.publicRoomId = null;
    return roomId;
  }

  // Create a 6-digit pair key for this peer
  generatePairKey(peerId) {
    let key;
    do {
      key = Math.floor(100000 + Math.random() * 900000).toString();
    } while (this.pendingPairKeys.has(key));

    this.pendingPairKeys.set(key, {
      peerId,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    return key;
  }

  // Validate a 6-digit pair key and connect two peers permanently
  claimPairKey(claimingPeerId, key) {
    const entry = this.pendingPairKeys.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.pendingPairKeys.delete(key);
      return null;
    }

    const hostPeerId = entry.peerId;
    if (hostPeerId === claimingPeerId) return null; // Can't pair with self

    const hostPeer = this.peers.get(hostPeerId);
    const claimingPeer = this.peers.get(claimingPeerId);
    if (!hostPeer || !claimingPeer) return null;

    // Successfully paired! Consume key
    this.pendingPairKeys.delete(key);

    // Generate shared secret
    const pairingSecret = "sec_" + crypto.randomBytes(16).toString("hex");

    hostPeer.pairedSecrets.add(pairingSecret);
    claimingPeer.pairedSecrets.add(pairingSecret);

    if (!this.pairedSecrets.has(pairingSecret)) {
      this.pairedSecrets.set(pairingSecret, new Set());
    }
    this.pairedSecrets.get(pairingSecret).add(hostPeerId);
    this.pairedSecrets.get(pairingSecret).add(claimingPeerId);

    return {
      hostPeer,
      claimingPeer,
      pairingSecret
    };
  }

  cleanupExpiredPairKeys() {
    const now = Date.now();
    for (const [key, val] of this.pendingPairKeys.entries()) {
      if (now > val.expiresAt) {
        this.pendingPairKeys.delete(key);
      }
    }
  }

  // Find all peers visible to a given peer
  getVisiblePeers(peerId) {
    const self = this.peers.get(peerId);
    if (!self) return [];

    const visibleSet = new Set();

    // 1. Local Network peers
    if (self.localRoomId && this.localRooms.has(self.localRoomId)) {
      for (const id of this.localRooms.get(self.localRoomId)) {
        if (id !== peerId) visibleSet.add(id);
      }
    }

    // 2. Public Room peers
    if (self.publicRoomId && this.publicRooms.has(self.publicRoomId)) {
      for (const id of this.publicRooms.get(self.publicRoomId)) {
        if (id !== peerId) visibleSet.add(id);
      }
    }

    // 3. Paired peers across any network
    for (const secret of self.pairedSecrets) {
      if (this.pairedSecrets.has(secret)) {
        for (const id of this.pairedSecrets.get(secret)) {
          if (id !== peerId) visibleSet.add(id);
        }
      }
    }

    const result = [];
    for (const id of visibleSet) {
      const p = this.peers.get(id);
      if (p) {
        // Determine relationship
        const isPaired = Array.from(self.pairedSecrets).some(sec => p.pairedSecrets.has(sec));
        const inSameRoom = Boolean(self.publicRoomId && p.publicRoomId === self.publicRoomId);

        result.push({
          peerId: p.peerId,
          name: p.name,
          device: p.device,
          paired: isPaired,
          room: inSameRoom
        });
      }
    }

    return result;
  }

  // Find which other peers should be notified when this peer joins/changes/leaves
  getNotificationRecipients(peerId) {
    const visiblePeers = this.getVisiblePeers(peerId);
    return visiblePeers.map(p => this.peers.get(p.peerId)).filter(Boolean);
  }
}
