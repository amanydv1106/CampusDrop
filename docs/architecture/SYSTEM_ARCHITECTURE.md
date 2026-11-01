# Campus Drop — System Architecture

```mermaid
flowchart TB
    subgraph ClientA ["Campus Drop Client A (Sender)"]
        UI_A["Next.js Responsive UI\nRadar & Peer Node"]
        TM_A["TransferManager\n(Chunker & Backpressure)"]
        SC_A["SignalingClient (ws)"]
        DC_A["RTCDataChannel"]
    end

    subgraph SignalingServer ["Signaling Server (Port 3001)"]
        HTTP["HTTP Health & Status (/health)"]
        WSS["WebSocket Server Engine"]
        RM["RoomManager\n(IP Hash, Public Rooms, Pairing Keys)"]
    end

    subgraph ClientB ["Campus Drop Client B (Receiver)"]
        UI_B["Next.js Responsive UI\nAccept/Reject Dialog"]
        TM_B["TransferManager\n(Assembler & Downloader)"]
        SC_B["SignalingClient (ws)"]
        DC_B["RTCDataChannel"]
    end

    SC_A <-->|WebSocket: SDP/ICE/Join| WSS
    SC_B <-->|WebSocket: SDP/ICE/Join| WSS
    WSS <--> RM

    DC_A <===>|Encrypted P2P Data Stream (WebRTC)| DC_B
```

---

## 1. Architectural Principles

1. **Zero Intermediate Storage**:
   Files stream peer-to-peer. The signaling server never buffers, receives, writes, or relays file data except under explicitly enabled emergency websocket fallback configurations.
2. **Decoupled Signaling**:
   The signaling server is completely decoupled from frontend hosting, allowing horizontal scaling and independent cloud deployment.
3. **Graceful Degradation**:
   When direct P2P connections are blocked by aggressive symmetric corporate or cellular NATs, the system surfaces clear diagnostics and supports STUN/TURN traversal.
4. **Resilient State Machine**:
   Every transfer maintains an explicit lifecycle: `pending` -> `transferring` -> `completed` / `cancelled` / `error`.
