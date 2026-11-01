import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { RoomManager } from "../src/roomManager.js";

// Helper to create a standalone test server instance on an ephemeral port
function createTestServer() {
  return new Promise((resolve) => {
    const roomManager = new RoomManager();
    const server = http.createServer((req, res) => {
      if (req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok" }));
        return;
      }
      res.writeHead(404);
      res.end();
    });

    const wss = new WebSocketServer({ server });

    function sendJson(ws, msg) {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(msg));
      }
    }

    wss.on("connection", (ws, req) => {
      const clientIp = req.socket.remoteAddress || "127.0.0.1";
      let currentPeerId = null;

      ws.on("message", (raw) => {
        const msg = JSON.parse(raw.toString());

        if (msg.type === "join") {
          currentPeerId = msg.peerId;
          const peer = roomManager.registerPeer(currentPeerId, ws, {
            name: msg.name || "Test Peer",
            device: msg.device || { type: "desktop" },
            ip: clientIp,
            publicRoomId: msg.roomId || null,
            pairedSecrets: msg.pairedSecrets || []
          });

          sendJson(ws, {
            type: "welcome",
            self: { peerId: peer.peerId, name: peer.name },
            peers: roomManager.getVisiblePeers(currentPeerId)
          });

          const recipients = roomManager.getNotificationRecipients(currentPeerId);
          for (const recipient of recipients) {
            sendJson(recipient.ws, {
              type: "peer-joined",
              peer: { peerId: peer.peerId, name: peer.name }
            });
          }
        }

        if (msg.type === "signal") {
          const recipient = roomManager.peers.get(msg.recipientId);
          if (recipient) {
            sendJson(recipient.ws, {
              type: "signal",
              senderId: currentPeerId,
              data: msg.data
            });
          }
        }
      });

      ws.on("close", () => {
        if (currentPeerId) {
          roomManager.unregisterPeer(currentPeerId);
          const recipients = roomManager.getNotificationRecipients(currentPeerId);
          for (const recipient of recipients) {
            sendJson(recipient.ws, {
              type: "peer-left",
              peerId: currentPeerId
            });
          }
        }
      });
    });

    server.listen(0, () => {
      const port = server.address().port;
      resolve({
        port,
        close: () =>
          new Promise((done) => {
            wss.close(() => {
              server.close(done);
            });
          })
      });
    });
  });
}

test("Signaling Server: End-to-end WebSocket peer discovery & WebRTC signaling", async () => {
  const { port, close } = await createTestServer();
  const wsUrl = `ws://localhost:${port}`;

  const ws1 = new WebSocket(wsUrl);
  const ws2 = new WebSocket(wsUrl);

  await Promise.all([
    new Promise((res) => ws1.on("open", res)),
    new Promise((res) => ws2.on("open", res))
  ]);

  // Client 1 joins
  const client1WelcomePromise = new Promise((res) => {
    ws1.on("message", (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.type === "welcome") res(msg);
    });
  });

  ws1.send(JSON.stringify({ type: "join", peerId: "peer-1", name: "Peer One" }));
  const welcome1 = await client1WelcomePromise;
  assert.equal(welcome1.self.peerId, "peer-1");
  assert.equal(welcome1.peers.length, 0); // First peer sees nobody

  // Client 2 joins -> Client 1 should get "peer-joined" notification
  const client1PeerJoinedPromise = new Promise((res) => {
    ws1.on("message", (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.type === "peer-joined") res(msg);
    });
  });

  const client2WelcomePromise = new Promise((res) => {
    ws2.on("message", (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.type === "welcome") res(msg);
    });
  });

  ws2.send(JSON.stringify({ type: "join", peerId: "peer-2", name: "Peer Two" }));
  const [peerJoinedNotice, welcome2] = await Promise.all([
    client1PeerJoinedPromise,
    client2WelcomePromise
  ]);

  assert.equal(peerJoinedNotice.peer.peerId, "peer-2");
  assert.equal(welcome2.peers.length, 1);
  assert.equal(welcome2.peers[0].peerId, "peer-1");

  // Client 1 relays WebRTC Offer signal to Client 2
  const client2SignalPromise = new Promise((res) => {
    ws2.on("message", (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.type === "signal") res(msg);
    });
  });

  ws1.send(
    JSON.stringify({
      type: "signal",
      recipientId: "peer-2",
      data: { sdp: "v=0\r\no=CampusDrop..." }
    })
  );

  const receivedSignal = await client2SignalPromise;
  assert.equal(receivedSignal.senderId, "peer-1");
  assert.equal(receivedSignal.data.sdp, "v=0\r\no=CampusDrop...");

  // Cleanup
  ws1.close();
  ws2.close();
  await close();
});
