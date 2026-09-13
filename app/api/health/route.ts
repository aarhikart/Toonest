import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ToolNest WhatsApp Marketing Platform',
    version: 'v21.0',
    compliance: 'Official Meta WhatsApp Business API',
    uptime: process.uptime()
  });
}
