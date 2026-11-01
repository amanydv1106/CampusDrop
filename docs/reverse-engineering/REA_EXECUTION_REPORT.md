# Campus Drop — REA Execution Report

**Target Analyzed**: `https://pairdrop.net` & `https://github.com/schlagmichdoch/PairDrop`  
**Date**: 2026-11-01  
**Methodology**: Reverse Engineering Agent (REA) Skill Protocol & Static Reference Architecture Reconnaissance.

---

## 1. Executive Summary

This report documents the architectural, protocol, and interface analysis of the reference peer-to-peer file-sharing platform. Findings from this investigation establish the technical baseline for **Campus Drop** while ensuring total independence in product branding, asset ownership, and codebase structure.

---

## 2. Evidence Classification Standard

Per project mandates, all findings are categorized under four strict confidence levels:
- **VERIFIED**: Empirically confirmed by code inspection and protocol validation.
- **STRONGLY INDICATED**: Directly observable in network schemas and DOM attributes.
- **INFERRED**: Deduced from standard WebRTC/WebSocket design patterns.
- **UNKNOWN**: Explicitly undetermined without live multi-NAT network packet captures.

---

## 3. Core Findings & Observations

### Finding REA-001: Signaling & Peer Discovery Protocol
- **Observation**: Peers discover each other by connecting to a centralized WebSocket server that groups clients by IP subnets.
- **Evidence**: `backend/src/server.js` and PairDrop's `server/index.js`.
- **Classification**: **VERIFIED**
- **Technical Implication**: Hashing client public IP addresses with SHA-256 (`crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16)`) enables local subnet discovery without leaking raw IP addresses across peers.

### Finding REA-002: Direct WebRTC RTCDataChannel File Transmission
- **Observation**: File transfers do not upload to or stream through the signaling server during standard operations.
- **Evidence**: WebSocket frames only convey `join`, `welcome`, `signal` (SDP/ICE), and `peer-joined`. Once the WebRTC peer connection is established, binary data flows strictly through `RTCDataChannel`.
- **Classification**: **VERIFIED**
- **Technical Implication**: Campus Drop backend remains lightweight, stateless, and zero-storage, drastically minimizing operating bandwidth and infrastructure costs.

### Finding REA-003: 64KB Chunking & Backpressure Control
- **Observation**: Sending large files (>10MB) in a single slice causes WebRTC buffer overflows and peer disconnects.
- **Evidence**: Transmission is segmented into 64KB chunks (`CHUNK_SIZE = 65536`).
- **Classification**: **VERIFIED**
- **Technical Implication**: Senders must observe `channel.bufferedAmount` and throttle writes above 512KB, resuming only upon the `bufferedamountlow` event.

### Finding REA-004: Cross-Network Pairing via Cryptographic Shared Secrets
- **Observation**: Devices on disparate networks establish visibility through 6-digit PIN codes or QR codes without registering user accounts.
- **Evidence**: Pairing keys map to a temporary in-memory claim table on the signaling server, which returns a permanent 32-character secret saved to client-side `IndexedDB`.
- **Classification**: **VERIFIED**
- **Technical Implication**: Campus Drop clients include their stored secrets in the initial WebSocket `join` handshake; the signaling server notifies mutually paired peers regardless of IP differences.

### Finding REA-005: Large File Memory Mitigation (OPFS)
- **Observation**: Buffering multi-gigabyte files entirely in JavaScript heap memory causes mobile browser tabs to crash.
- **Evidence**: Reference utilizes the Origin Private File System (OPFS) and File System Access API Web Workers to stream incoming chunks directly to disk.
- **Classification**: **STRONGLY INDICATED**
- **Technical Implication**: Campus Drop must incorporate OPFS direct-to-disk streaming for files exceeding 500MB to guarantee resilience on memory-constrained mobile devices.
