import test from "node:test";
import assert from "node:assert/strict";
import { RoomManager } from "../src/roomManager.js";
import { generateDisplayName } from "../src/utils/nameGenerator.js";

test("generateDisplayName returns two capitalized words", () => {
  const name = generateDisplayName();
  assert.ok(typeof name === "string");
  const parts = name.split(" ");
  assert.equal(parts.length, 2);
  assert.ok(parts[0].length > 0);
  assert.ok(parts[1].length > 0);
});

test("RoomManager: local room hashing and isolation", () => {
  const rm = new RoomManager();

  const mockWs1 = {};
  const mockWs2 = {};
  const mockWs3 = {};

  // Peer 1 and 2 share same public IP
  rm.registerPeer("peer-1", mockWs1, {
    name: "Aqua Falcon",
    device: { type: "desktop" },
    ip: "203.0.113.10"
  });

  rm.registerPeer("peer-2", mockWs2, {
    name: "Golden Tiger",
    device: { type: "smartphone" },
    ip: "203.0.113.10"
  });

  // Peer 3 is on different IP
  rm.registerPeer("peer-3", mockWs3, {
    name: "Crimson Eagle",
    device: { type: "laptop" },
    ip: "198.51.100.5"
  });

  // Peer 1 should see Peer 2, but NOT Peer 3
  const visibleTo1 = rm.getVisiblePeers("peer-1");
  assert.equal(visibleTo1.length, 1);
  assert.equal(visibleTo1[0].peerId, "peer-2");

  // Peer 3 should see no one
  const visibleTo3 = rm.getVisiblePeers("peer-3");
  assert.equal(visibleTo3.length, 0);
});

test("RoomManager: 6-digit pair key generation and claim", () => {
  const rm = new RoomManager();
  const ws1 = {};
  const ws2 = {};

  rm.registerPeer("peer-host", ws1, { name: "Host", ip: "1.1.1.1" });
  rm.registerPeer("peer-client", ws2, { name: "Client", ip: "2.2.2.2" });

  // Initially cross-network, cannot see each other
  assert.equal(rm.getVisiblePeers("peer-host").length, 0);

  // Host generates key
  const key = rm.generatePairKey("peer-host");
  assert.match(key, /^\d{6}$/);

  // Client claims key
  const claimResult = rm.claimPairKey("peer-client", key);
  assert.ok(claimResult);
  assert.equal(claimResult.hostPeer.peerId, "peer-host");
  assert.equal(claimResult.claimingPeer.peerId, "peer-client");
  assert.ok(claimResult.pairingSecret.startsWith("sec_"));

  // Now both see each other cross-network!
  const hostSees = rm.getVisiblePeers("peer-host");
  const clientSees = rm.getVisiblePeers("peer-client");

  assert.equal(hostSees.length, 1);
  assert.equal(hostSees[0].peerId, "peer-client");
  assert.equal(hostSees[0].paired, true);

  assert.equal(clientSees.length, 1);
  assert.equal(clientSees[0].peerId, "peer-host");
  assert.equal(clientSees[0].paired, true);
});

test("RoomManager: temporary public room transitions", () => {
  const rm = new RoomManager();
  const ws1 = {};
  const ws2 = {};

  // Different public IPs, so no LAN visibility
  rm.registerPeer("peer-a", ws1, { name: "A", ip: "198.51.100.10" });
  rm.registerPeer("peer-b", ws2, { name: "B", ip: "203.0.113.20" });

  // Initially cross-network, cannot see each other
  assert.equal(rm.getVisiblePeers("peer-a").length, 0);

  // Peer A joins public room "CAMPUS"
  rm.joinPublicRoom("peer-a", "CAMPUS");
  assert.equal(rm.getVisiblePeers("peer-a").length, 0);

  // Peer B joins same room "CAMPUS"
  rm.joinPublicRoom("peer-b", "CAMPUS");

  const aSees = rm.getVisiblePeers("peer-a");
  assert.equal(aSees.length, 1);
  assert.equal(aSees[0].peerId, "peer-b");
  assert.equal(aSees[0].room, true);

  // Peer A leaves public room
  rm.leavePublicRoom("peer-a");
  const bSeesAfterLeave = rm.getVisiblePeers("peer-b");
  assert.equal(bSeesAfterLeave.length, 0);
});

test("RoomManager: unregister peer cleans up all references", () => {
  const rm = new RoomManager();
  rm.registerPeer("peer-temp", {}, { name: "Temp", ip: "127.0.0.1" });
  assert.equal(rm.peers.size, 1);

  rm.unregisterPeer("peer-temp");
  assert.equal(rm.peers.size, 0);
  assert.equal(rm.getVisiblePeers("peer-temp").length, 0);
});
