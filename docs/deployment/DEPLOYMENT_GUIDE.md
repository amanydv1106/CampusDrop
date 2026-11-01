# Campus Drop — Production Deployment Guide

## 1. Production Architecture Overview

In production, **Campus Drop** is deployed with:
1. **Frontend**: Next.js Node server or static export behind Nginx/Caddy on port 3000.
2. **Backend**: WebSocket signaling server on port 3001.
3. **Reverse Proxy (Nginx)**: Terminating TLS 1.3, handling HTTPS for web assets and routing `/ws` or port 3001 via Secure WebSockets (`wss://`).
4. **STUN/TURN**: Coturn server providing NAT traversal for cross-network and symmetric NAT clients.

---

## 2. Docker Compose Deployment

```yaml
version: "3.8"

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: campusdrop-backend
    restart: always
    environment:
      - PORT=3001
      - NODE_ENV=production
    ports:
      - "3001:3001"
    networks:
      - campusdrop-net

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: campusdrop-frontend
    restart: always
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_WS_URL=wss://drop.campus.edu/ws
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - campusdrop-net

networks:
  campusdrop-net:
    driver: bridge
```

---

## 3. Nginx Reverse Proxy Configuration

```nginx
server {
    listen 80;
    server_name drop.campus.edu;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name drop.campus.edu;

    ssl_certificate /etc/letsencrypt/live/drop.campus.edu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/drop.campus.edu/privkey.pem;

    # Frontend Next.js app
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket Signaling Server
    location /ws {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

---

## 4. Environment Variables Reference

| Variable | Scope | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Backend | `3001` | TCP port for HTTP and WebSocket server. |
| `NEXT_PUBLIC_WS_URL` | Frontend | `ws://localhost:3001` | Public WebSocket signaling URL accessed by client browsers. |
| `STUN_SERVER` | Frontend/Backend | `stun:stun.l.google.com:19302` | Primary STUN server for ICE candidate discovery. |
| `TURN_SERVER` | Frontend/Backend | Optional | TURN server URL for symmetric NAT traversal. |
