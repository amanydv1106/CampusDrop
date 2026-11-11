# Campus Drop — Vercel Deployment Guide

This guide details how to deploy **Campus Drop** to Vercel and connect the WebSocket signaling backend.

---

## 1. Architectural Architecture on Vercel

Campus Drop is divided into two distinct components:
1. **Frontend (Next.js 16 + React 19 + Tailwind CSS v4)**:
   - **100% compatible with Vercel**. Runs natively on Vercel's global Edge/Serverless CDN with automatic HTTPS, asset optimization, and instant deployments.
2. **Backend (Node.js WebSocket Signaling Server)**:
   - Vercel is a **serverless** platform (functions spin down after request completion). Persistent, stateful WebSocket connections (RFC 6455) for peer room grouping require a persistent Node.js process.
   - Therefore, the signaling server runs on a persistent host (e.g., Render, Railway, Fly.io, or your campus server), while Vercel hosts the frontend.
   - The two connect seamlessly via the `NEXT_PUBLIC_WS_URL` environment variable.

---

## 2. Deploying Frontend to Vercel (Step-by-Step)

### Step 1: Import Repository
1. Log in to [Vercel](https://vercel.com).
2. Click **"Add New..."** -> **"Project"**.
3. Import your GitHub repository: `amanydv1106/CampusDrop`.

### Step 2: Configure Project Settings
In the Vercel project configuration screen:
- **Framework Preset**: `Next.js` (automatically selected)
- **Root Directory**: Click *Edit* and select **`frontend`**
- **Build Command**: `next build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### Step 3: Add Environment Variables
Under **Environment Variables**, add:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_WS_URL` | `wss://campusdrop-signaling.onrender.com` | Secure WebSocket URL of your signaling server |

> **Note**: If testing without a live cloud signaling server, you can leave it blank; it will default to connecting to local/intranet WebSocket `ws://<host>:3001`.

### Step 4: Click Deploy
Click **"Deploy"**. Vercel will build the Next.js 16 frontend in ~30 seconds and provide a live production URL (e.g., `https://campusdrop.vercel.app`).

---

## 3. Deploying the Signaling Backend (Free Cloud Options)

To enable peer discovery and WebRTC SDP negotiation on the public internet, deploy `backend/` to any persistent container/Node.js host:

### Option A: Render.com (Recommended Free Option)
1. Go to [Render Dashboard](https://dashboard.render.com/) -> **New Web Service**.
2. Connect your GitHub repository: `amanydv1106/CampusDrop`.
3. Set the following options:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Plan**: `Free`
4. Click **Deploy Web Service**.
5. Copy your Render URL: `https://campusdrop-backend.onrender.com`.
6. Replace `https://` with `wss://` (e.g., `wss://campusdrop-backend.onrender.com`) and paste it as `NEXT_PUBLIC_WS_URL` in your Vercel project settings!

### Option B: Railway.app
1. Go to [Railway](https://railway.app/) -> **New Project** -> **Deploy from GitHub repo**.
2. Select `amanydv1106/CampusDrop`.
3. In settings, set **Root Directory** to `/backend`.
4. Railway will automatically detect Node.js and start `node src/server.js`.
5. Generate a domain (e.g., `campusdrop.up.railway.app`) and use `wss://campusdrop.up.railway.app` as your `NEXT_PUBLIC_WS_URL`.

---

## 4. Verification

Once deployed:
1. Open your Vercel deployment URL (e.g. `https://campusdrop.vercel.app`).
2. Open a second browser tab or open on your smartphone.
3. Both devices will connect to the signaling server via `wss://`, display on the radar, and establish direct WebRTC DataChannel connections for high-speed file transfers.
