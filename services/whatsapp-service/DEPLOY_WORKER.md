# WhatsApp Persistent Worker Deployment Guide

This worker runs a persistent **Baileys WebSocket Multi-Device WhatsApp connection**.

## Why a Persistent Worker is Required
- **Vercel Serverless Limitation**: Vercel functions freeze/terminate after 10–60 seconds and use ephemeral storage.
- **Persistent Worker Advantage**: Runs continuously on a container/VM with a persistent disk volume, maintaining the WebSocket connection and saving session keys across browser reloads or site redeployments.

---

## 1-Click Cloud Deployment Options

### Option A: Railway (Recommended)
1. Fork or push this repository to GitHub.
2. In [Railway](https://railway.app), click **New Project** &rarr; **Deploy from GitHub repo**.
3. Set root directory to `services/whatsapp-service`.
4. Add a **Persistent Volume** mounted at `/app/sessions`.
5. Set Environment Variables:
   - `PORT=5001`
   - `WHATSAPP_SERVICE_SECRET=your_super_secret_token_here`
   - `WHATSAPP_SESSIONS_DIR=/app/sessions`
6. Copy your Railway public domain (e.g. `https://wa-worker-production.up.railway.app`).

---

### Option B: Render
1. Create a **Web Service** on [Render](https://render.com).
2. Root Directory: `services/whatsapp-service`.
3. Environment: `Node`, Build Command: `npm install && npm run build`, Start Command: `npm start`.
4. Attach a persistent disk to `/app/sessions`.
5. Set `WHATSAPP_SERVICE_SECRET` and `WHATSAPP_SESSIONS_DIR=/app/sessions`.

---

### Option C: VPS / Docker Compose
```bash
cd services/whatsapp-service
docker build -t toolnest-wa-worker .
docker run -d \
  --name wa-worker \
  -p 5001:5001 \
  -v $(pwd)/sessions:/app/sessions \
  -e WHATSAPP_SERVICE_SECRET=your_super_secret_token_here \
  toolnest-wa-worker
```

---

## Connecting Vercel to Your Worker
In your Vercel Project Dashboard (`Settings > Environment Variables`):
```env
WHATSAPP_SERVICE_URL=https://your-worker-url.railway.app
WHATSAPP_SERVICE_SECRET=your_super_secret_token_here
```
