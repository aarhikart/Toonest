# ToolNest WhatsApp Bulk Marketing Platform: Multi-Platform Deployment Guide

This guide explains how to get a **100% working WhatsApp Web connection & campaign delivery** when your Next.js application is hosted on **Vercel (`https://toonest.vercel.app`)**, **Hostinger VPS**, or **Docker**.

---

## 1. Why Vercel Needs a Persistent Worker

- Next.js on Vercel runs in **Stateless Serverless Functions**.
- Vercel functions freeze/shut down after each HTTP request, which terminates long-running WebSockets.
- Real WhatsApp Web Multi-Device links (`@whiskeysockets/baileys`) require an **active, persistent connection** to generate real pairing QR codes and receive instant delivery confirmations.
- **Solution**: The Next.js frontend on Vercel connects to your persistent WhatsApp Worker Daemon via a secure gateway proxy.

---

## 2. Three Ways to Run on Vercel (`toonest.vercel.app`)

### Approach 1: Connect via Free Public Tunnel (Fastest & Zero Setup)
If your worker is already running on your computer on port 5001:

1. In your local terminal, expose port 5001 using any free tunnel:
   ```bash
   npx localtunnel --port 5001
   # OR with ngrok:
   ngrok http 5001
   ```
2. It gives you a public HTTPS URL (e.g., `https://toolnest-wa.loca.lt` or `https://xxxx.ngrok-free.app`).
3. Open **`https://toonest.vercel.app/whatsapp-marketing`**.
4. Click the **Settings Gear ⚙️** next to *WhatsApp Web Authentication*.
5. Paste your public tunnel URL into **Worker Service URL** and click **Save & Connect**.
6. **The real WhatsApp QR Code will appear instantly on your Vercel site!**
7. Scan with your phone &rarr; Dashboard turns **ACTIVE** &rarr; Send messages 100%!

---

### Approach 2: Deploy Free Cloud Worker to Render.com / Railway (24/7 Always-On)
To have your worker run 24/7 in the cloud without keeping your PC on:

1. Create a free account at [Render.com](https://render.com).
2. Click **New + &gt; Web Service** and connect your GitHub repository.
3. Set the following:
   - **Root Directory**: `services/whatsapp-service`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/server.js`
   - **Environment Variables**:
     - `PORT` = `5001`
     - `WHATSAPP_SERVICE_SECRET` = `toolnest_secure_service_token_2026`
4. Render deploys it and gives you a free HTTPS URL:
   `https://your-worker-name.onrender.com`
5. In your **Vercel Project Settings &gt; Environment Variables**:
   - Add: `WHATSAPP_SERVICE_URL` = `https://your-worker-name.onrender.com`
   - Add: `WHATSAPP_SERVICE_SECRET` = `toolnest_secure_service_token_2026`
6. Now `toonest.vercel.app` permanently connects to your 24/7 cloud worker!

---

### Approach 3: Browser Direct Mode (Zero Server Needed)
If you don't want to run any backend worker at all:
1. On `https://toonest.vercel.app/whatsapp-marketing`, scroll to **Step 4: Campaign Engine**.
2. Switch the dispatch toggle to **Browser Direct**.
3. Add your contacts and click **Start Campaign**.
4. ToolNest will launch WhatsApp Web chats sequentially with pre-filled personalized messages with 1 click per contact!

---

## 3. Hostinger VPS / Linux / Ubuntu Deployment

On Hostinger VPS, both Next.js and the worker run together locally using PM2:

```bash
# 1. Build and start WhatsApp worker
cd services/whatsapp-service
npm install && npm run build
pm2 start "node dist/server.js" --name "whatsapp-worker"

# 2. Build and start Next.js
cd ../..
npm install && npm run build
pm2 start "npm start" --name "toolnest-web"

# 3. Save PM2 processes
pm2 save
pm2 startup
```

Both services will run 24/7 side-by-side on your Hostinger VPS!
