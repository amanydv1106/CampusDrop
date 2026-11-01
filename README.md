# Campus Drop

A modern, secure, peer-to-peer file-sharing platform designed for seamless device-to-device transfers across local networks and the internet.

---

## Overview

**Campus Drop** allows users to send images, documents, videos, and text directly between devices (Windows, macOS, Linux, iOS, Android) without uploading files to third-party servers. All peer-to-peer communication is end-to-end encrypted via WebRTC.

### Core Features

- ⚡ **Zero-Setup LAN Discovery**: Automatic device detection on local Wi-Fi or subnet.
- 🔒 **End-to-End Encrypted**: Files stream directly browser-to-browser over WebRTC `RTCDataChannel`.
- 🔑 **Permanent Device Pairing**: Connect devices across different networks using a 6-digit code or QR code.
- 🌐 **Temporary Public Rooms**: 5-character room codes for ad-hoc sharing across cellular data or VPNs.
- 📦 **Large File Support**: 64KB chunking with backpressure flow control to ensure transfer stability.
- 💬 **Instant Text & Link Sharing**: Rapid clipboard and message transfers directly between peers.
- 📱 **Responsive PWA**: Installable web application with dark/light themes and mobile share sheet integration.

---

## Project Structure

```text
campus-drop/
├── backend/                  # Node.js WebSocket Signaling Server
│   ├── src/
│   │   ├── roomManager.js    # Local/Public/Pairing room management
│   │   ├── server.js         # HTTP + WebSocket signaling entrypoint
│   │   └── utils/            # Name generation & helpers
│   └── package.json
├── frontend/                 # Next.js 16 Web Application (React 19, TypeScript, Tailwind CSS v4)
│   ├── app/                  # Next.js App Router (Layout & Pages)
│   ├── src/
│   │   └── features/
│   │       └── campusDrop/   # Core Campus Drop components, services, and hooks
│   └── package.json
├── docs/                     # Engineering, Architecture & QA Specifications
│   ├── reverse-engineering/
│   ├── architecture/
│   ├── project/
│   ├── design/
│   ├── testing/
│   └── deployment/
└── .agents/                  # Antigravity Skills & Tooling Configuration
```

---

## Getting Started

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x

### 1. Start the Signaling Server (Backend)
```bash
cd backend
npm install
npm run dev
```
The signaling server will start on `http://localhost:3001` (WebSocket: `ws://localhost:3001`).

### 2. Start the Web Client (Frontend)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Security & Privacy Invariants

- **No File Logging**: File payloads never transit through or get stored on the signaling server.
- **Privacy Hashing**: Client IP addresses are hashed with SHA-256 before generating local room identifiers.
- **Pairing Secrets**: Secrets are exchanged securely and kept strictly on client devices (`IndexedDB` / `localStorage`).

---

## License
MIT
