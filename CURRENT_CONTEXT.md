# Campus Drop — Current Context

**Last Updated**: 2026-11-11  
**Project Phase**: Phase Thirteen (Full Cloud Production Deployment — Vercel & Render)  
**Active Git Branch**: `develop`  
**Latest Stable Tag**: `v1.0.0` (on `main`, pushed to `origin`)  
**Remote Repository**: `https://github.com/amanydv1106/CampusDrop.git`  
**Live Production Frontend**: `https://campus-drop-two.vercel.app`  
**Live Signaling Server (WSS)**: `wss://campus-drop-signaling.onrender.com`  
**Signaling Health Check**: `https://campus-drop-signaling.onrender.com/health`  

---

## Active Status Summary

1. **Cloud Production Deployment**:
   - **Frontend**: Hosted on Vercel (`campus-drop`, ID: `prj_9CWSL6p0US2TjTbGeWKq13Q23V47`). Live production URL: `https://campus-drop-two.vercel.app`.
   - **Backend**: Hosted on Render (`campus-drop-signaling`, ID: `srv-dbpveabrjlhs73b867og`). Live WebSocket endpoint: `wss://campus-drop-signaling.onrender.com`.
   - **Environment Variable**: `NEXT_PUBLIC_WS_URL = wss://campus-drop-signaling.onrender.com` baked directly into the Vercel production Next.js client bundles.
   - **Live E2E Verification**: Real multi-client discovery, join handshake, and SDP signaling relay verified live across the cloud infrastructure.
2. **Reference Parity & Alignment (PairDrop)**:
   - Full reverse engineering & feature comparison completed against `https://github.com/schlagmichdoch/PairDrop.git`.
   - Feature parity across WebRTC DataChannel (64KB chunks), backpressure (512KB threshold), ephemeral rooms, 6-digit PIN pairing, direct text chat, and PWA Web Share Target.
   - Clean, modern Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 architecture with zero external database dependencies.
3. **Build & Live Runtime Verification**:
   - Backend WebSocket signaling server running live on `http://localhost:3001` (`/health` returning 200 OK).
   - Frontend Next.js production server running live on `http://localhost:3000` (serving HTML, JS bundles, and PWA assets).
   - Automated test suite: 6/6 backend tests passing, 3/3 frontend tests passing (monorepo `npm test` 100% pass rate).
   - Live E2E verification test suite (`verify_e2e_live.mjs`) passing 100% with real WebSocket discovery, 6-digit pairing, SDP signaling relay, and graceful disconnection.
3. **Features Verified & Active**:
   - Subnet LAN discovery with SHA-256 IP tokenization.
   - WebRTC DataChannel streaming with backpressure pacing.
   - 6-digit key exchange & URL hash auto-pairing (`/#123456`).
   - Temporary 5-character public rooms with instant URL joining (`?room=XYZ` or `#XYZ`).
   - Instant "Copy Link" feedback button in pairing and room dialogs.
   - Multiple file batch transfers and drag-and-drop overlay.
   - Direct text messaging with one-click clipboard copy.
   - Full PWA with Service Worker, Web App Manifest, and Web Share Target API.
