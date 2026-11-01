# Campus Drop — Claude Agent Guidelines

This file supplements agent operating procedures for Claude-compatible models working on **Campus Drop**.

## Quick References
- **Project**: Campus Drop (Peer-to-Peer Encrypted File Sharing)
- **Signaling Server**: `backend/src/server.js` (Port 3001)
- **Web Client**: `frontend/` (Next.js 16, Port 3000)
- **Core Transfer Engine**: `frontend/src/features/campusDrop/services/transferManager.ts`
- **Signaling Client**: `frontend/src/features/campusDrop/services/signaling.ts`

## Build & Test Commands
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

## Critical Invariants
- Application name is **Campus Drop** everywhere.
- WebRTC transfers must use chunked ArrayBuffers (64KB) with backpressure flow control.
- Never commit secrets or expose pairing codes in logs.
