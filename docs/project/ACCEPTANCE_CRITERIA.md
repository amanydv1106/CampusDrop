# Campus Drop — Acceptance Criteria

## 1. Acceptance Criteria Checklist

### AC-01: Local Network Auto-Discovery
- [x] Given two browser instances on the same local network / IP address, both devices automatically discover each other without manual user action.
- [x] Display names and randomized animal/color adjectives are generated and rendered accurately.
- [x] Editing a device name updates the name on all observer peers in real time via `peer-updated` WebSocket message.

### AC-02: Peer-to-Peer File Transfer
- [x] Given a file selected by drag-and-drop or file picker, the sender establishes an `RTCDataChannel` connection.
- [x] The receiver receives a modal prompt containing the filename, size (formatted in KB/MB/GB), and type.
- [x] When the receiver accepts, binary chunks stream over the data channel with visual progress indicator (0% to 100%).
- [x] When complete, the file downloads automatically with the exact byte content and filename matching the original.

### AC-03: Device Pairing
- [x] Given Device A generates a pairing key, a 6-digit key (formatted `XXX XXX`) and QR code render on screen.
- [x] Given Device B enters the 6-digit key, both devices confirm pairing success.
- [x] A persistent 32-character pairing secret is saved to `localStorage`/`IndexedDB` on both clients.
- [x] Refreshing both browsers restores paired visibility even across different networks.

### AC-04: Public Rooms
- [x] Entering a 5-character room code (e.g., `ALPHA`) switches the client's peer list strictly to other clients in `ALPHA`.
- [x] Sharing a direct link `https://campusdrop.local/?room=ALPHA` automatically joins the room upon loading.
- [x] Leaving the room cleanly restores local network peer discovery.

### AC-05: Direct Text Sharing
- [x] Right-clicking or long-pressing a peer opens the "Send Message" dialog.
- [x] Entering text and submitting beams the message across `RTCDataChannel`.
- [x] Receiver displays `ReceiveMessageDialog` with one-click "Copy to Clipboard" action and audible notification.

### AC-06: Responsive Design & Accessibility
- [x] The layout is fully responsive and verified on mobile (360px - 390px), tablet (768px), and desktop (1024px - 1440px).
- [x] Color contrast satisfies WCAG 2.1 AAA requirements.
- [x] All modals support keyboard `Escape` to close and focus trapping.
