# Campus Drop — Technical Analysis & Reverse Engineering

## 1. Frontend Technology & Architecture

- **Rendering Engine**: React / Next.js with Client Components (`"use client"`).
- **Styling Architecture**: Modern Tailwind CSS utility layers with dark/light CSS variables.
- **Visual Display**: Custom HTML5 Canvas / SVG radar component with pulsating wave animations representing active discovery loops.
- **Audio Feedback**: Synthesized audio frequency alerts using Web Audio API (`AudioContext`) for device joins, transfer prompts, transfer completions, and errors.
- **Client Storage**:
  - `localStorage`: Non-sensitive UI preferences (theme mode, custom device name).
  - `IndexedDB`: Binary chunks, pairing secrets, and Web Share Target incoming files.

---

## 2. Backend Signaling Architecture

- **Server Runtime**: Node.js with native `http` module.
- **WebSocket Protocol**: `ws` (RFC 6455 compliant).
- **State Store**: In-memory maps:
  - `peers`: `peerId -> { ws, name, device, ip, localRoomId, publicRoomId, pairedSecrets }`
  - `localRooms`: `localRoomId -> Set<peerId>`
  - `publicRooms`: `publicRoomId -> Set<peerId>`
  - `pendingPairKeys`: `pairKey -> { peerId, expiresAt }`
  - `pairedSecrets`: `secret -> Set<peerId>`
- **Health & Monitoring**: Standalone `GET /health` endpoint returning JSON metadata:
  ```json
  {
    "status": "ok",
    "service": "CampusDrop Signaling Server",
    "version": "1.0.0",
    "activePeers": 4,
    "activePublicRooms": 1
  }
  ```

---

## 3. WebRTC Data Channel Protocol Specification

### Message Formats over `RTCDataChannel`:

1. **Transfer Header**:
   ```json
   {
     "type": "header",
     "transferId": "d1c2-3e4f-...",
     "name": "lecture_notes.pdf",
     "size": 15482910,
     "mimeType": "application/pdf"
   }
   ```

2. **Header Acknowledgment (Accept / Reject)**:
   ```json
   {
     "type": "header-ack",
     "transferId": "d1c2-3e4f-...",
     "accepted": true
   }
   ```

3. **Binary Data Chunks**:
   - Transmitted as raw `ArrayBuffer` slices (64KB each).
   - Sender tracks `bufferedAmount`.

4. **Transfer Complete**:
   ```json
   {
     "type": "complete",
     "transferId": "d1c2-3e4f-..."
   }
   ```

5. **Direct Text Sharing**:
   ```json
   {
     "type": "text-message",
     "text": "https://campusdrop.local/join",
     "timestamp": 1730472000000
   }
   ```
