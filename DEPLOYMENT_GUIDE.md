# ToolNest WhatsApp Bulk Marketing Platform: Multi-Platform Deployment Guide

This guide covers running and deploying ToolNest's WhatsApp Web Multi-Device platform across hosting environments, including **Hostinger VPS / Dedicated Servers**, **Docker**, **PM2**, and **Vercel**.

---

## 1. Architecture Overview

WhatsApp Web Multi-Device relies on a persistent TCP/WebSocket connection with WhatsApp servers (handled by `@whiskeysockets/baileys`).

```
┌─────────────────────────────────────────────────────────┐
│                      Client Browser                     │
│               (/whatsapp-marketing UI)                 │
└────────────┬───────────────────────────────┬────────────┘
             │                               │
             │ (1. Daemon Mode)              │ (2. Browser Direct Fallback)
             ▼                               ▼
┌─────────────────────────┐      ┌─────────────────────────┐
│     Next.js Gateway     │      │   Direct WhatsApp Web   │
│ (/api/whatsapp-service) │      │  (web.whatsapp.com/send)│
└────────────┬────────────┘      └─────────────────────────┘
             │
             │ HTTP / JSON (x-service-key)
             ▼
┌─────────────────────────────────────────────────────────┐
│       Persistent WhatsApp Worker Daemon (Port 5001)     │
│   • Multi-Device Baileys Engine                         │
│   • Real QR Code / 8-Digit Pairing Code generation      │
│   • Persistent Session Keys in ./sessions/              │
│   • Rate-limited Message & Media Dispatcher             │
└──────────────────────────┬──────────────────────────────┘
                           │
                           │ Persistent Secure WebSocket
                           ▼
                 WhatsApp Official Servers
```

---

## 2. Deployment on Hostinger VPS / Linux / Ubuntu / Debian

On Hostinger VPS, both Next.js and the WhatsApp worker run side-by-side using **PM2** so they run 24/7 without disconnecting.

### Step 1: Clone and Install Dependencies
```bash
cd /var/www/toolnest

# Install root Next.js dependencies
npm install

# Install WhatsApp worker dependencies
cd services/whatsapp-service
npm install
npm run build
cd ../..
```

### Step 2: Environment Variables (`.env.local` / `.env`)
In `/var/www/toolnest/.env.local`:
```env
PORT=3000
WHATSAPP_SERVICE_URL=http://localhost:5001
WHATSAPP_SERVICE_SECRET=toolnest_secure_service_token_2026
```

### Step 3: Start with PM2 (24/7 Persistent Daemon)
```bash
# Install PM2 globally
npm install -g pm2

# Build Next.js
npm run build

# Start WhatsApp Persistent Worker on Port 5001
pm2 start "cd services/whatsapp-service && node dist/server.js" --name "whatsapp-worker"

# Start Next.js on Port 3000
pm2 start "npm start" --name "toolnest-web"

# Save PM2 process list and configure auto-start on boot
pm2 save
pm2 startup
```

---

## 3. Deployment on Vercel (Serverless)

Vercel functions are stateless and cannot host a persistent WebSocket directly. ToolNest supports two setups for Vercel:

### Option A: Hybrid (Vercel Frontend + VPS/Cloud Worker) — **Recommended**
1. Run the `services/whatsapp-service` worker on a persistent VPS (Hostinger, Render, Railway, Fly.io, or DigitalOcean).
2. In your Vercel Project Settings → **Environment Variables**, set:
   - `WHATSAPP_SERVICE_URL`: `https://your-worker.yourdomain.com` (or your VPS IP e.g. `http://192.168.1.1:5001`)
   - `WHATSAPP_SERVICE_SECRET`: `toolnest_secure_service_token_2026`
3. Now all campaigns started from Vercel are proxied securely to your persistent worker!

### Option B: Browser Direct Mode (Zero-Server Fallback on Vercel)
If you don't have a remote worker:
1. Open `/whatsapp-marketing`.
2. Select **Browser Direct** in the campaign dispatcher.
3. ToolNest uses client-side WhatsApp Web tabs (`web.whatsapp.com/send?phone=...&text=...`), allowing you to send messages without any backend daemon.
