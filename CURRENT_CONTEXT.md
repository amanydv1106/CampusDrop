# Peer Flow — Current Context

**Last Updated**: 2026-11-13  
**Project Phase**: Phase Nineteen (Global Production Domain Binding & Vercel Rebranding to Peer Flow)  
**Active Git Branch**: `develop`  
**Remote Repository**: `https://github.com/amanydv1106/CampusDrop.git`  
**Primary Live Frontend (Vercel)**: `https://peer-flow-app.vercel.app`  
**Alternative Live Frontend (Vercel)**: `https://peer-flow-share.vercel.app`, `https://peerflow-p2p.vercel.app`, `https://campus-drop-two.vercel.app`  
**Live Production App (Render)**: `https://campus-drop-signaling.onrender.com`  
**Live WebSocket Signaling**: `wss://campus-drop-signaling.onrender.com/server`  
**Signaling Health Check**: `https://campus-drop-signaling.onrender.com/health`  

---

## Active Status Summary

1. **Brand Name Transition to Peer Flow**:
   - Rebranded the platform name across the entire application to **Peer Flow** per user directive.
   - Header brand title updated to `PeerFlow` (`Peer<span class="brand-highlight">Flow</span>`).
   - Browser tab document titles updated to `Peer Flow | Transfer Files Cross-Platform Free & Fast` and dynamically across all file transfer states.
2. **New Wireless Wave Brand Logo & Tab Favicon**:
   - Replaced top-left brand icon with a sleek wireless peer broadcast wave icon (`(( • ))`) with central node and concentric arcs.
   - Generated high-res SVG and PNG favicons (`favicon.svg`, `favicon-96x96.png`, `apple-touch-icon.png`, PWA icons) with blue gradient squircle and crisp white broadcast waves matching the user reference photo.
3. **Backend & Signaling Rebranding**:
   - Updated backend signaling server `/health` endpoint to report `service: "Peer Flow Signaling Server"`.
   - Updated startup server logs and automated integration tests to verify Peer Flow signaling.
4. **WebSocket URL Normalization & PWA Fresh Delivery**:
   - Sanitized `wsServerDomain` in `network.js` to strip trailing slashes and ensure exactly one `/server` path in all environments.
   - Standardized `signalingServer` in `config.json`, `/config`, and `route.js` to `"campus-drop-signaling.onrender.com"`.
   - Upgraded Service Worker cache version to `v2.2.1` (`peerflow-cache-v2.2.1`) across frontend and backend.
5. **Multi-Cloud Deployments**:
   - Frontend Next.js deployment hosted on Vercel at `https://campus-drop-two.vercel.app`.
   - Backend WebSocket signaling server hosted on Render at `https://campus-drop-signaling.onrender.com`.
   - Verified automated test suite passing 100%.
