# Campus Drop — Gemini Agent Directives

These directives apply to Google Antigravity & Gemini agents working on **Campus Drop**.

## Mandates

1. **Brand & Identity**: The application is **Campus Drop**. Never overwrite or substitute with reference app names.
2. **Architecture**:
   - Backend: Node.js WebSocket signaling server (`ws`).
   - Frontend: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4.
   - P2P Engine: WebRTC `RTCDataChannel` direct browser-to-browser streaming.
3. **Safety & Git Discipline**:
   - Work strictly on feature branches.
   - Run tests before merging to develop.
   - Preserve existing user files and historical commits.
4. **Context Maintenance**:
   - Read `CURRENT_CONTEXT.md` before initiating work.
   - Update `PROGRESS.md` and `HANDOFF.md` upon completion of a turn or milestone.
