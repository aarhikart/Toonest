@echo off
title ToolNest WhatsApp Cloudflare Tunnel
echo =======================================================
echo Starting ToolNest WhatsApp Cloudflare Tunnel...
echo Forwarding to local worker on port 5001
echo =======================================================
echo.
npx cloudflared tunnel --url http://localhost:5001
pause
