# Campus Drop — Known Issues & Risk Register

| Issue ID | Severity | Description | Mitigation / Plan | Status |
| :--- | :--- | :--- | :--- | :--- |
| **ISSUE-001** | Medium | Low-memory mobile devices may crash during file transfers exceeding 1GB if buffered in memory. | Implement Web Worker streaming to Origin Private File System (OPFS) and File System Access API. | Open |
| **ISSUE-002** | Medium | Symmetric NAT or restrictive corporate firewalls can block direct WebRTC P2P connections. | Provide WebSocket relay fallback and configure public STUN/TURN servers. | Open |
| **ISSUE-003** | Low | QR code visual scanning can be affected by dark/light theme background contrast. | Ensure QR codes render with explicit white quiet zones and contrasting dark modules regardless of active app theme. | Resolved |
