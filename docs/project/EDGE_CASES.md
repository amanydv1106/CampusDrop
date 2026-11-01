# Campus Drop — Edge Cases & Failure Recovery

| Edge Case ID | Scenario | Expected Behavior & Recovery Mechanism |
| :--- | :--- | :--- |
| **EDGE-001** | Sender closes browser tab mid-transfer. | Receiver detects `RTCDataChannel.onclose`, displays an explicit error alert ("Sender disconnected unexpectedly"), cleans up partial buffers, and resets dialog. |
| **EDGE-002** | Receiver declines incoming file. | Receiver sends `{ type: "header-ack", accepted: false }`. Sender immediately aborts reading, updates status to `cancelled`, and plays error chime. |
| **EDGE-003** | Sender transmits 0-byte (empty) file. | Sender sends header with `size: 0`, sends `TransferComplete` immediately without chunks. Receiver generates empty blob and saves. |
| **EDGE-004** | Two peers click to transfer to each other simultaneously. | Simultaneous SDP offers are resolved using standard WebRTC "polite peer" glare handling (`isPolite` flag based on peer ID lexical comparison). |
| **EDGE-005** | Wi-Fi network reconnects / IP changes. | WebSocket client triggers exponential reconnection. Upon reconnecting with new IP, client sends `join` with persistent `peerId` and `pairedSecrets`, restoring pairing and updating peer list. |
| **EDGE-006** | Invalid pairing code entered. | Signaling server returns `{ type: "pair-error", message: "Invalid or expired pairing code." }`. UI highlights input field in red without closing modal. |
| **EDGE-007** | Duplicate file names transferred simultaneously. | Receiver prepends timestamp or increments index (e.g., `document (1).pdf`) to prevent filesystem collision. |
| **EDGE-008** | Browser background tab throttling. | WebRTC DataChannel remains active in background tabs; Desktop Notification is dispatched when transfer finishes so the user is immediately alerted. |
