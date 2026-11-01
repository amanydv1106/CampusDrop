# Campus Drop — Product Requirements Document (PRD)

**Product Name**: Campus Drop  
**Version**: 1.0.0  
**Target Audience**: University students, researchers, campus staff, and privacy-conscious users seeking frictionless, fast local and cross-network file sharing.

---

## 1. Problem Statement

File sharing across devices in campus environments (between Windows, macOS, Android, iOS, and Linux) often suffers from:
1. Incompatible proprietary ecosystems (AirDrop restricted to Apple, Quick Share restricted to Android/Windows).
2. Requirement to install heavy third-party software, register accounts, or upload private files to external cloud storage providers.
3. Slow transfer speeds over bandwidth-capped internet connections when devices are physically adjacent on the same local network.

---

## 2. Product Objectives

1. **Zero Setup**: Open the browser URL and begin discovering nearby peers instantly.
2. **True P2P Streaming**: Files transmit directly between browsers via WebRTC `RTCDataChannel`, achieving full local network transfer speeds.
3. **Privacy First**: Zero file payloads pass through or get stored on signaling servers. IP addresses are hashed using SHA-256 for local discovery grouping.
4. **Internet Connectivity**: Cross-network sharing through 5-character temporary public rooms and persistent 6-digit device pairing.
5. **Universal Compatibility**: Fully responsive interface working across modern mobile, tablet, laptop, and desktop browsers, installable as a Progressive Web App (PWA).

---

## 3. Core Functional Requirements

### FR-01: Local Network Auto-Discovery
- The signaling server groups clients by hashing the public IP address.
- Devices receive a random, friendly display name (e.g. "Crimson Falcon", "Emerald Lynx") and device type icon.
- Users can customize their display name locally at any time.

### FR-02: Peer-to-Peer File Transfer
- Drag and drop or click to select one or multiple files.
- Sender sends a metadata header (`name`, `size`, `mimeType`).
- Receiver displays an interactive acceptance dialog with file preview.
- Transfer proceeds with 64KB chunking and backpressure throttling (`bufferedamountlow`).
- Receiver triggers direct browser download upon transfer completion.

### FR-03: Permanent Device Pairing
- Devices can generate a temporary 6-digit code or QR code.
- Another device enters the code or scans the QR code to pair.
- Both devices exchange a persistent cryptographic 32-character secret stored in `IndexedDB`.
- Paired devices discover each other automatically regardless of network differences.

### FR-04: Temporary Public Rooms
- Users can create or join a public room with a 5-character alphanumeric code (e.g., `K9XYZ`).
- Clients inside a public room see all other peers in that room.
- Leaving the room returns the client to their local network peer group.

### FR-05: Direct Text Messaging
- Send arbitrary text snippets, links, or clipboard contents to any peer without creating a file.
- Receiver displays a modal dialog with a one-click copy button and auto-linked URLs.

### FR-06: Progressive Web App & System Share Target
- Service worker caching for fast offline shell loading.
- Web Share Target API enabling native mobile share sheets to beam files directly into Campus Drop.

---

## 4. Non-Functional Requirements

- **Performance**: Capable of sustaining 40+ MB/s transfers on modern Wi-Fi 6 LANs; memory overhead capped below 100MB RAM even for multi-gigabyte files.
- **Security**: DTLS-SRTP encryption on all WebRTC data channels; TLS 1.3 on WebSocket signaling.
- **Reliability**: Automatic WebSocket reconnection with exponential backoff; seamless ICE recovery.
- **Accessibility**: WCAG 2.1 Level AAA color contrast compliance; fully keyboard navigable dialogs.
