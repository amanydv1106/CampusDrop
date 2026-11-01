# Campus Drop — Roadmap

## Phase 1: Planning, Reverse Engineering & Governance (Current)
- [x] Discover REA skill and catalog capabilities.
- [x] Reverse engineer reference features (discovery, WebRTC chunking, pairing, rooms).
- [x] Establish Git repository, branch strategy, and governance rules.
- [ ] Author comprehensive documentation in `docs/`.

## Phase 2: Core Infrastructure & Signaling (Milestone v0.2.0)
- [ ] Verify signaling server test coverage (LAN grouping, public rooms, pairing secrets).
- [ ] Implement robust STUN/TURN fallback configuration.
- [ ] Add rate limiting and message validation to WebSocket server.

## Phase 3: P2P Data Transfer & Resilience (Milestone v0.3.0)
- [ ] Verify 64KB chunking and backpressure flow control across desktop & mobile.
- [ ] Implement ZIP bundling for multi-file transfers.
- [ ] Implement OPFS Web Worker streaming for files > 1GB.

## Phase 4: Device Pairing & Public Rooms (Milestone v0.4.0)
- [ ] Verify 6-digit key exchange and QR code pairing.
- [ ] Test cross-network file sharing in temporary public rooms.
- [ ] Audit client-side secret persistence in IndexedDB.

## Phase 5: PWA, UI/UX & Polish (Milestone v0.5.0)
- [ ] Configure installable PWA (`manifest.json`, `service-worker.js`).
- [ ] Integrate Web Share Target API for native mobile sharing.
- [ ] Complete responsive design audits (360px, 390px, 768px, 1280px, 1440px).

## Phase 6: Production Verification & Release (Milestone v1.0.0)
- [ ] Automated end-to-end testing with Playwright.
- [ ] Security audit: sanitize filenames, rate limit signaling, zero file logging.
- [ ] Production deployment guide (Docker, Nginx, HTTPS, WSS).
