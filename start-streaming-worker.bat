@echo off
title ToolNest Streaming Worker Daemon
cd /d "d:\Aarhi_kart\ToolNest\toolnest"
echo =======================================================
echo   Starting ToolNest Streaming Worker on port 5002...
echo =======================================================
node services/streaming-worker/server.js
pause
