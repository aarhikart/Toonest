@echo off
title ToolNest WhatsApp Service & Tunnel Launcher
cd /d "%~dp0"

echo ================================================================
echo           TOOLNEST WHATSAPP SYSTEM & TUNNEL LAUNCHER
echo ================================================================
echo.
echo Starting WhatsApp Worker Daemon and Cloudflare Tunnel...
echo.

node scripts/start-whatsapp-system.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] System encountered an error.
    echo Press any key to exit...
    pause >nul
)
