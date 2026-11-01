import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { RoomManager } from "./roomManager.js";
import { generateDisplayName } from "./utils/nameGenerator.js";

const PORT = process.env.PORT || 3001;
const roomManager = new RoomManager();

// Create native HTTP Server
const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === "/health" || req.url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        service: "CampusDrop Signaling Server",
        version: "1.0.0",
        activePeers: roomManager.peers.size,
        activePublicRooms: roomManager.publicRooms.size
      })
    );
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

// Create WebSocket Server attached to HTTP server
const wss = new WebSocketServer({ server });

function sendJson(ws, message) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify(message));
    } catch (err) {
      console.error("[WebSocket Send Error]", err);
    }
  }
}

wss.on("connection", (ws, req) => {
  // Extract client IP (handle proxies if X-Forwarded-For present)
  const forwarded = req.headers["x-forwarded-for"];
  const clientIp = forwarded ? forwarded.split(",")[0].trim() : req.socket.remoteAddress;

  let currentPeerId = null;

  // Heartbeat ping-pong
  ws.isAlive = true;
  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      switch (msg.type) {
        case "join": {
          currentPeerId = msg.peerId;
          const name = msg.name || generateDisplayName();
          const device = msg.device || { type: "desktop", os: "Unknown" };
          const pairedSecrets = Array.isArray(msg.pairedSecrets) ? msg.pairedSecrets : [];
          const publicRoomId = msg.roomId || null;

          const peer = roomManager.registerPeer(currentPeerId, ws, {
            name,
            device,
            ip: clientIp,
            publicRoomId,
            pairedSecrets
          });

          // 1. Send welcome message back to connecting peer
          const visiblePeers = roomManager.getVisiblePeers(currentPeerId);
          sendJson(ws, {
            type: "welcome",
            self: {
              peerId: peer.peerId,
              name: peer.name,
              device: peer.device,
              ip: clientIp,
              publicRoomId: peer.publicRoomId
            },
            peers: visiblePeers
          });

          // 2. Notify all peers who can see this new peer
          const recipients = roomManager.getNotificationRecipients(currentPeerId);
          for (const recipient of recipients) {
            sendJson(recipient.ws, {
              type: "peer-joined",
              peer: {
                peerId: peer.peerId,
                name: peer.name,
                device: peer.device,
                paired: Array.from(peer.pairedSecrets).some((s) => recipient.pairedSecrets.has(s)),
                room: Boolean(peer.publicRoomId && peer.publicRoomId === recipient.publicRoomId)
              }
            });
          }
          console.log(`[Join] Peer ${peer.name} (${currentPeerId}) connected from ${clientIp}`);
          break;
        }

        case "update-name": {
          if (!currentPeerId) return;
          const newName = msg.name?.trim();
          if (!newName) return;

          roomManager.updatePeerName(currentPeerId, newName);

          // Broadcast name change to all observers
          const recipients = roomManager.getNotificationRecipients(currentPeerId);
          for (const recipient of recipients) {
            sendJson(recipient.ws, {
              type: "peer-updated",
              peer: {
                peerId: currentPeerId,
                name: newName
              }
            });
          }
          break;
        }

        case "join-room": {
          if (!currentPeerId) return;
          const roomId = msg.roomId?.trim().toUpperCase();
          if (!roomId) return;

          // Notify old room members before switching
          const oldRecipients = roomManager.getNotificationRecipients(currentPeerId);

          roomManager.joinPublicRoom(currentPeerId, roomId);

          // Notify old room members that peer left them
          for (const recipient of oldRecipients) {
            sendJson(recipient.ws, {
              type: "peer-left",
              peerId: currentPeerId
            });
          }

          // Send updated peers list to current peer
          const newVisiblePeers = roomManager.getVisiblePeers(currentPeerId);
          sendJson(ws, {
            type: "room-joined",
            roomId,
            peers: newVisiblePeers
          });

          // Notify new room members
          const newRecipients = roomManager.getNotificationRecipients(currentPeerId);
          const selfPeer = roomManager.peers.get(currentPeerId);
          for (const recipient of newRecipients) {
            sendJson(recipient.ws, {
              type: "peer-joined",
              peer: {
                peerId: currentPeerId,
                name: selfPeer.name,
                device: selfPeer.device,
                paired: false,
                room: true
              }
            });
          }
          console.log(`[Room] Peer ${currentPeerId} joined public room ${roomId}`);
          break;
        }

        case "leave-room": {
          if (!currentPeerId) return;
          const oldRoomId = roomManager.leavePublicRoom(currentPeerId);

          if (oldRoomId) {
            // Send updated peers list (back to local network only)
            const visiblePeers = roomManager.getVisiblePeers(currentPeerId);
            sendJson(ws, {
              type: "room-left",
              peers: visiblePeers
            });

            // Notify remaining peers
            const recipients = roomManager.getNotificationRecipients(currentPeerId);
            const selfPeer = roomManager.peers.get(currentPeerId);
            for (const recipient of recipients) {
              sendJson(recipient.ws, {
                type: "peer-joined",
                peer: {
                  peerId: currentPeerId,
                  name: selfPeer.name,
                  device: selfPeer.device,
                  paired: false,
                  room: false
                }
              });
            }
          }
          break;
        }

        case "request-pair-key": {
          if (!currentPeerId) return;
          const pairKey = roomManager.generatePairKey(currentPeerId);
          sendJson(ws, {
            type: "pair-key-generated",
            pairKey
          });
          break;
        }

        case "submit-pair-key": {
          if (!currentPeerId) return;
          const key = msg.pairKey?.replace(/\s+/g, "").trim();
          if (!key) return;

          const result = roomManager.claimPairKey(currentPeerId, key);
          if (!result) {
            sendJson(ws, {
              type: "pair-error",
              message: "Invalid or expired pairing code."
            });
            return;
          }

          const { hostPeer, claimingPeer, pairingSecret } = result;

          // Notify both peers of successful permanent pairing
          sendJson(claimingPeer.ws, {
            type: "pair-success",
            pairingSecret,
            peer: {
              peerId: hostPeer.peerId,
              name: hostPeer.name,
              device: hostPeer.device,
              paired: true
            }
          });

          sendJson(hostPeer.ws, {
            type: "pair-success",
            pairingSecret,
            peer: {
              peerId: claimingPeer.peerId,
              name: claimingPeer.name,
              device: claimingPeer.device,
              paired: true
            }
          });

          console.log(`[Pair] Paired ${hostPeer.name} with ${claimingPeer.name}`);
          break;
        }

        case "signal": {
          // Relays WebRTC Offer, Answer, or ICE candidate
          const recipientId = msg.recipientId;
          const recipient = roomManager.peers.get(recipientId);
          if (recipient) {
            sendJson(recipient.ws, {
              type: "signal",
              senderId: currentPeerId,
              data: msg.data
            });
          }
          break;
        }

        case "relay-transfer": {
          // WebSocket fallback for restrictive networks where WebRTC is blocked
          const recipientId = msg.recipientId;
          const recipient = roomManager.peers.get(recipientId);
          if (recipient) {
            sendJson(recipient.ws, {
              type: "relay-transfer",
              senderId: currentPeerId,
              payload: msg.payload
            });
          }
          break;
        }

        case "ping": {
          sendJson(ws, { type: "pong" });
          break;
        }

        default:
          console.warn("[Unknown Message Type]", msg.type);
      }
    } catch (err) {
      console.error("[Message Parsing Error]", err);
    }
  });

  ws.on("close", () => {
    if (currentPeerId) {
      const removedPeer = roomManager.unregisterPeer(currentPeerId);
      if (removedPeer) {
        const recipients = roomManager.getNotificationRecipients(currentPeerId);
        for (const recipient of recipients) {
          sendJson(recipient.ws, {
            type: "peer-left",
            peerId: currentPeerId
          });
        }
        console.log(`[Disconnect] Peer ${removedPeer.name} disconnected`);
      }
    }
  });

  ws.on("error", (err) => {
    console.error(`[Socket Error] peer: ${currentPeerId}`, err);
  });
});

// Periodic heartbeat
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on("close", () => {
  clearInterval(interval);
});

server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` CampusDrop Signaling Server running     `);
  console.log(` Port: ${PORT}                           `);
  console.log(` WebSocket Endpoint: ws://localhost:${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/health`);
  console.log(`=========================================`);
});
