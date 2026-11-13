# Campus Drop — Architecture Decision Records (ADR)

## ADR-001: Independent Identity as "Campus Drop"
- **Context**: The project builds on peer-to-peer file sharing principles popularized by PairDrop and Snapdrop, but must stand as a fully independent product.
- **Decision**: Brand the application exclusively as **Campus Drop** across all code, metadata, UI, and documentation. Never use external brand assets or names.
- **Status**: Accepted.

## ADR-002: Standalone WebSocket Signaling Architecture
- **Context**: Low-latency peer discovery and WebRTC negotiation requires persistent bidirectional communication.
- **Decision**: Implement a native Node.js WebSocket signaling server using the `ws` library on port 3001, decoupled from the Next.js frontend.
- **Consequences**: Enables horizontal scaling of signaling servers, independent containerization, and zero overhead on frontend SSR/SSG.
- **Status**: Accepted.

## ADR-003: Direct-to-Peer DataChannel File Transfer
- **Context**: Privacy and bandwidth efficiency demand that files do not transit through the application server.
- **Decision**: Stream files directly over WebRTC `RTCDataChannel` using 64KB chunks with backpressure flow control (`bufferedamountlow`). Provide an optional WebSocket fallback relay only when WebRTC is strictly blocked by symmetric corporate firewalls.
- **Status**: Accepted.

## ADR-004: Client-Side Persistent Pairing
- **Context**: Users need to transfer files across different networks without re-entering pairing codes each time.
- **Decision**: Store 32-character pairing secrets in browser `localStorage`/`IndexedDB`. Devices announce their known secrets on connection; the signaling server matches overlapping secrets to establish visibility.
- **Status**: Superseded by ADR-005 (simplified to Public Rooms).

## ADR-005: Custom Modern UI Redesign & Streamlined Feature Set
- **Context**: The user requested an original homepage appearance to eliminate visual resemblance to reference applications, and requested the removal of language selection and permanent pairing options to streamline the UX.
- **Decision**: Redesign the frontend with a modern cyber-indigo/neon-cyan aesthetic, centered dashed orbital radar canvas, branded top navigation bar with live P2P status badge, beacon empty state card with quick room join CTA, floating dock footer, and squircle peer cards. Remove language selector button and dialog (defaulting cleanly to English) and remove permanent 6-digit pairing dialogs while retaining temporary public rooms and automatic subnet LAN discovery.
- **Status**: Accepted.
