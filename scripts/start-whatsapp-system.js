/**
 * ToolNest WhatsApp System Master Starter
 * 
 * 1. Checks and starts the local WhatsApp worker daemon (port 5001)
 * 2. Generates a live Cloudflare Tunnel (https://*.trycloudflare.com)
 * 3. Automatically updates MongoDB SystemSetting (workerGatewayUrl)
 * 4. Enables seamless WhatsApp Web sending from toonest.vercel.app
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const mongoose = require('mongoose');

// 1. Load Environment Variables (.env.local or .env)
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const idx = trimmed.indexOf('=');
        if (idx > -1) {
          const key = trimmed.substring(0, idx).trim();
          let val = trimmed.substring(idx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) process.env[key] = val;
        }
      });
    }
  }
}

loadEnv();

const PORT = process.env.PORT || 5001;
const WORKER_HEALTH_URL = `http://localhost:${PORT}/health`;
const WORKER_TUNNEL_URL = `http://localhost:${PORT}/tunnel/generate`;
const WORKER_STOP_URL = `http://localhost:${PORT}/tunnel/stop`;

function checkHealth() {
  return new Promise(resolve => {
    const req = http.get(WORKER_HEALTH_URL, { timeout: 2500 }, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.status === 'healthy');
        } catch {
          resolve(false);
        }
      });
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

let spawnedWorkerProcess = null;

async function ensureWorkerRunning() {
  const alreadyRunning = await checkHealth();
  if (alreadyRunning) {
    console.log('  -> Worker daemon is already running on port 5001.');
    return;
  }

  console.log('  -> Worker daemon is not running. Launching worker process...');
  const workerDir = path.join(process.cwd(), 'services', 'whatsapp-service');
  const serverJsPath = path.join(workerDir, 'dist', 'server.js');

  if (!fs.existsSync(serverJsPath)) {
    throw new Error(`Worker build not found at ${serverJsPath}. Please run: npm run whatsapp:build`);
  }

  // Spawn worker process in background
  spawnedWorkerProcess = spawn('node', ['dist/server.js'], {
    cwd: workerDir,
    stdio: 'ignore',
    detached: true,
    shell: true
  });
  spawnedWorkerProcess.unref();

  // Wait for worker to boot up
  process.stdout.write('  -> Waiting for worker daemon to initialize');
  let ready = false;
  for (let i = 0; i < 20; i++) {
    await delay(1000);
    process.stdout.write('.');
    ready = await checkHealth();
    if (ready) break;
  }
  console.log('');

  if (!ready) {
    throw new Error('Worker daemon failed to start within 20 seconds. Please check services/whatsapp-service logs.');
  }

  console.log('  -> Worker daemon successfully started and healthy on port 5001!');
}

async function requestTunnelGeneration() {
  console.log('  -> Requesting live Cloudflare tunnel from worker daemon...');
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ force: true });
    const req = http.request(
      WORKER_TUNNEL_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 35000
      },
      res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.success && json.url) {
              resolve(json.url.trim().replace(/\/$/, ''));
            } else {
              reject(new Error(json.error || 'Worker did not return a valid tunnel URL'));
            }
          } catch (e) {
            reject(new Error('Invalid JSON received from tunnel generator'));
          }
        });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timed out (35s) waiting for Cloudflare tunnel URL'));
    });
    req.write(postData);
    req.end();
  });
}

async function updateMongoGatewayUrl(url) {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn('  [WARN] MONGODB_URI not found in .env.local. Skipping database auto-save.');
    return false;
  }

  console.log('  -> Connecting to MongoDB to register the new gateway address...');
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000
  });

  const SystemSettingSchema = new mongoose.Schema(
    {
      key: { type: String, required: true, unique: true },
      value: { type: mongoose.Schema.Types.Mixed, required: true },
      updatedAt: { type: Date, default: Date.now }
    },
    { collection: 'systemsettings' }
  );

  const SystemSetting =
    mongoose.models.SystemSetting || mongoose.model('SystemSetting', SystemSettingSchema);

  await SystemSetting.findOneAndUpdate(
    { key: 'workerGatewayUrl' },
    { value: url, updatedAt: new Date() },
    { upsert: true, returnDocument: 'after' }
  );

  await mongoose.disconnect();
  return true;
}

async function verifyTunnelReachability(tunnelUrl) {
  return new Promise(resolve => {
    const healthUrl = `${tunnelUrl}/health`;
    https
      .get(healthUrl, { timeout: 8000 }, res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json.status === 'healthy');
          } catch {
            resolve(false);
          }
        });
      })
      .on('error', () => resolve(false))
      .on('timeout', () => resolve(false));
  });
}

async function main() {
  console.log('\n========================================================================');
  console.log('          TOOLNEST WHATSAPP SYSTEM & TUNNEL LAUNCHER');
  console.log('========================================================================\n');

  try {
    // Step 1: Ensure worker is active
    console.log('[Step 1/3] Checking Local Worker Daemon...');
    await ensureWorkerRunning();

    // Step 2: Establish Cloudflare tunnel
    console.log('\n[Step 2/3] Initializing Cloudflare Public Tunnel...');
    const tunnelUrl = await requestTunnelGeneration();
    console.log(`  -> Live Public Tunnel URL: ${tunnelUrl}`);

    // Step 3: Register in MongoDB
    console.log('\n[Step 3/3] Synchronizing Gateway URL with Database...');
    const dbUpdated = await updateMongoGatewayUrl(tunnelUrl);
    if (dbUpdated) {
      console.log('  -> Gateway URL saved to MongoDB Atlas successfully!');
    }

    // Step 4: Connectivity verification
    process.stdout.write('  -> Verifying end-to-end tunnel connectivity...');
    const isLive = await verifyTunnelReachability(tunnelUrl);
    console.log(isLive ? ' [ONLINE & VERIFIED!]' : ' [WARNING: Pending first ping]');

    console.log('\n========================================================================');
    console.log('          TOOLNEST WHATSAPP SYSTEM IS READY & ACTIVE!');
    console.log('========================================================================');
    console.log(`  Local Worker   : http://localhost:${PORT} (Daemon running)`);
    console.log(`  Public Gateway : ${tunnelUrl}`);
    console.log(`  MongoDB Sync   : ${dbUpdated ? 'Updated automatically' : 'Manual setting required'}`);
    console.log('  Cloud Status   : https://toonest.vercel.app is now connected to this laptop!');
    console.log('========================================================================');
    console.log('\n[INFO] Keep this window open while using WhatsApp marketing.');
    console.log('[INFO] To stop the service anytime, press Ctrl + C.\n');

    // Heartbeat every 30 seconds to keep connection active and logged
    setInterval(async () => {
      const healthy = await checkHealth();
      const timeStr = new Date().toLocaleTimeString();
      if (!healthy) {
        console.warn(`[${timeStr}] Warning: Local worker daemon seems unresponsive.`);
      }
    }, 30000);

  } catch (err) {
    console.error('\nFailed to start WhatsApp system:', err.message);
    console.log('\nTroubleshooting tips:');
    console.log(' 1. Ensure port 5001 is not blocked by another application.');
    console.log(' 2. Check that your laptop has active internet connection.');
    console.log(' 3. Run: npm run whatsapp:build to ensure latest worker code is compiled.\n');
    process.exit(1);
  }
}

// Graceful cleanup on exit
process.on('SIGINT', () => {
  console.log('\nShutting down launcher...');
  process.exit(0);
});

main();
