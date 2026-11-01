# Campus Drop — Agent Operating Guidelines

Welcome to the **Campus Drop** engineering environment. This document governs all autonomous and pair-programming agents operating within this repository.

---

## 1. Project Identity & Mandatory Naming Instructions

- **Official Project Name**: Campus Drop
- **Repository Name**: `campus-drop`
- **Application Name**: Campus Drop
- **Package Name**: `campus-drop`
- **Product Description**: A modern, secure, peer-to-peer file-sharing platform.

### Strict Naming Rules
1. The new application must be called **Campus Drop** everywhere:
   - Application UI & branding
   - Website title & browser metadata
   - PWA metadata & `manifest.json`
   - README & all technical documentation
   - Package metadata & deployment configuration
   - Push/Desktop notifications
   - Release descriptions & commit messages
2. **Never** use the reference application's name as the new application's identity.
3. The reference application (`PairDrop`) and repository (`schlagmichdoch/PairDrop`) may be mentioned **only** when discussing external reference analysis, technical comparisons, or attribution.
4. Do not copy protected brand assets, logos, or icons without authorization. Create and maintain an independent Campus Drop visual identity.

---

## 2. Engineering Team Roles

When operating in this codebase, adopt structured engineering discipline:
- **Senior Software Architect**: Enforce system boundary separation (Signaling vs DataChannel).
- **WebRTC Specialist**: Oversee SDP negotiation, ICE lifecycle, DataChannel chunking (64KB), and backpressure management.
- **Frontend / UI/UX Engineer**: Maintain responsive, accessible design (Desktop 1440px down to Mobile 360px), dark/light themes, and radar animations.
- **Backend Engineer**: Maintain low-latency, scalable WebSocket signaling, room isolation, and heartbeat integrity.
- **Security Engineer**: Enforce end-to-end P2P encryption, sanitization of metadata, private IP hashing, and non-routing of file payloads through servers.
- **Git Specialist**: Protect history, employ atomic checkpoints, prevent hard resets, and maintain clean branch hygiene.

---

## 3. Git Version Control Policy

- **Protected Branches**: `main` must always remain stable and deployable.
- **Integration Branch**: `develop` serves as the primary integration branch.
- **Feature Branches**: All work must occur on dedicated branches (`feature/campus-drop-*`, `fix/campus-drop-*`, `refactor/campus-drop-*`).
- **Checkpoints**: Commit checkpoints before significant architectural or WebRTC changes (`checkpoint: <description>`).
- **Forbidden Commands**: Never run `git reset --hard`, `git clean -fd`, or `git push --force` without explicit user instruction.
- **User Work**: Never discard or overwrite existing user code.

---

## 4. WebRTC & Networking Standards

- **Chunk Size**: Standardize on **64 KB** (`65,536 bytes`) per binary chunk.
- **Backpressure**: Monitor `RTCDataChannel.bufferedAmount`. If buffered amount exceeds **512 KB**, pause transmission and await `bufferedamountlow`.
- **Signaling Server Scope**: File bytes **never** touch the signaling server during standard operations. WebSockets exist solely for SDP/ICE exchange, peer discovery, room grouping, and explicit fallback relay if configured.
- **Large Files**: Employ Origin Private File System (OPFS) and Web Workers where available to avoid browser memory saturation.

---

## 5. Continuity & Documentation Maintenance

Whenever completing tasks or handing off sessions:
1. Update `PROGRESS.md` with current feature statuses (`NOT ANALYZED`, `ANALYZED`, `PLANNED`, `IN DEVELOPMENT`, `IMPLEMENTED`, `TESTING`, `VERIFIED`).
2. Log architectural decisions in `DECISIONS.md`.
3. Track unresolved bugs or risks in `KNOWN_ISSUES.md`.
4. Keep `CURRENT_CONTEXT.md` and `HANDOFF.md` accurate for seamless multi-agent continuity.
