/**
 * ToolNest Standalone Streaming Worker Daemon
 * 
 * Runs independently from Next.js serverless functions.
 * Ingests YouTube Live (or HLS) streams and re-streams to Facebook Live / Instagram Live via FFmpeg.
 * Supports simultaneous dual-streaming via FFmpeg's tee muxer.
 * Syncs real-time telemetry and logs with MongoDB Atlas.
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const { spawn, execFile } = require('child_process');
const { promisify } = require('util');
const { Readable } = require('stream');
const execFileAsync = promisify(execFile);

// 1. Load Root Environment (.env.local or .env)
function loadEnv() {
  const rootDir = path.resolve(__dirname, '../..');
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.join(rootDir, file);
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

// Resolve root dependencies
const rootDir = path.resolve(__dirname, '../..');
let ffmpegPath = '';
try {
  ffmpegPath = require('ffmpeg-static');
} catch (e) {
  try {
    ffmpegPath = require(path.join(rootDir, 'node_modules/ffmpeg-static'));
  } catch (err) {
    ffmpegPath = 'ffmpeg';
  }
}

let mongoose = null;
try {
  mongoose = require('mongoose');
} catch (e) {
  try {
    mongoose = require(path.join(rootDir, 'node_modules/mongoose'));
  } catch (err) {
    console.warn('[Worker] Mongoose not found:', err.message);
  }
}

let Innertube = null;
try {
  const ytModule = require('youtubei.js');
  Innertube = ytModule.Innertube;
} catch (e) {
  try {
    const ytModule = require(path.join(rootDir, 'node_modules/youtubei.js/dist/src/index.js'));
    Innertube = ytModule.Innertube;
  } catch (err) {
    console.warn('[Worker] youtubei.js not found:', err.message);
  }
}

const PORT = parseInt(process.env.STREAMING_WORKER_PORT || '5002', 10);
const MONGODB_URI = process.env.MONGODB_URI;

// In-Memory active streams registry
// streamId -> { child, streamId, youtubeUrl, target, destinations, status, health, logs, isStopping, youtubeStream }
const activeStreams = new Map();

// 2. Connect to MongoDB Atlas
let isMongoConnected = false;
async function initMongo() {
  if (!mongoose || !MONGODB_URI) {
    console.log('[Worker] MongoDB URI not provided or Mongoose missing, running in in-memory mode');
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });
    isMongoConnected = true;
    console.log('[Worker] Connected to MongoDB Atlas successfully');
  } catch (err) {
    console.warn('[Worker] MongoDB Atlas connection warning:', err.message);
  }
}
initMongo();

// Helpers to update MongoDB session
async function updateSessionInDb(streamId, updates) {
  if (!isMongoConnected || !mongoose) return;
  try {
    const LiveStreamSession = mongoose.models.LiveStreamSession || mongoose.model('LiveStreamSession', new mongoose.Schema({}, { strict: false }));
    await LiveStreamSession.updateOne({ streamId }, { $set: updates, $push: updates.newLog ? { logs: updates.newLog } : {} });
  } catch (err) {
    // Non-blocking
  }
}

// 3. YouTube Stream URL Resolver
const YT_REGEX = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/)|^)([\w-]{11})(?:[^\w-]|$)/;

async function resolveYouTubeSource(inputUrl) {
  const trimmed = (inputUrl || '').trim();

  // If directly an HLS (.m3u8) or RTMP stream, use directly
  if (trimmed.includes('.m3u8') || trimmed.startsWith('rtmp://') || trimmed.startsWith('rtmps://')) {
    return {
      type: 'direct_url',
      url: trimmed,
      title: 'Direct Stream Feed',
    };
  }

  // Check 1: Prioritize local yt-dlp binary (extracts authenticated HLS playlists with full n-sig deciphering)
  const ytdlpPath = path.join(rootDir, 'bin', 'yt-dlp.exe');
  if (fs.existsSync(ytdlpPath)) {
    try {
      console.log('[Worker] Resolving live stream via yt-dlp...');
      const { stdout } = await execFileAsync(
        ytdlpPath,
        ['--no-warnings', '--no-check-certificates', '--print', '%(title)s', '-g', trimmed],
        { timeout: 30000 }
      );
      const lines = stdout.trim().split(/\r?\n/).filter(Boolean);
      if (lines.length >= 2) {
        const title = lines[0] || 'YouTube Live Source';
        const videoUrl = lines[1];
        const audioUrl = lines[2] || null;
        return {
          type: 'ytdlp_stream',
          title,
          videoUrl,
          audioUrl,
        };
      }
    } catch (ytdlpErr) {
      console.warn('[Worker] yt-dlp extraction notice:', ytdlpErr.message);
    }
  }

  const match = trimmed.match(YT_REGEX);
  if (!match || !match[1]) {
    throw new Error('Invalid YouTube Live URL. Please provide a valid YouTube video or live URL.');
  }

  const videoId = match[1];
  if (!Innertube) {
    throw new Error('YouTube ingestion engine is not available on worker.');
  }

  const yt = await Innertube.create();
  const info = await yt.getInfo(videoId);
  const title = info.basic_info?.title || 'YouTube Live Source';

  // Check 2: Live HLS manifest
  const hlsUrl = info.streaming_data?.hls_manifest_url;
  if (hlsUrl) {
    return {
      type: 'direct_url',
      url: hlsUrl,
      title,
      videoId,
    };
  }

  // Check 3: DASH manifest
  const dashUrl = info.streaming_data?.dash_manifest_url;
  if (dashUrl) {
    return {
      type: 'direct_url',
      url: dashUrl,
      title,
      videoId,
    };
  }

  // Check 4: Check adaptive or progressive formats with direct URLs
  const allFormats = [...(info.streaming_data?.formats || []), ...(info.streaming_data?.adaptive_formats || [])];
  const directFormat = allFormats.find(f => f.has_video && f.url);
  if (directFormat && directFormat.url) {
    return {
      type: 'direct_url',
      url: directFormat.url,
      title,
      videoId,
    };
  }

  // Check 5: Piped stream download via Innertube
  try {
    const readableWebStream = await yt.download(videoId, { type: 'video+audio', quality: 'best' });
    if (readableWebStream) {
      return {
        type: 'piped_stream',
        stream: readableWebStream,
        title,
        videoId,
      };
    }
  } catch (err) {
    console.warn('[Worker] Failed to open download stream for video:', err.message);
  }

  throw new Error(`Could not resolve streamable media for YouTube video "${title}". Stream may be private, ended, or restricted.`);
}

// 4. Construct Destination RTMP Targets
function buildDestinationUrls(target, destinations) {
  const result = [];
  for (const d of destinations) {
    if (target === 'both' || target === d.platform) {
      const cleanUrl = (d.rtmpUrl || '').trim().replace(/\/$/, '');
      const cleanKey = (d.streamKey || '').trim();
      if (cleanUrl && cleanKey) {
        result.push({
          platform: d.platform,
          fullRtmpUrl: `${cleanUrl}/${cleanKey}`,
        });
      }
    }
  }
  return result;
}

// 5. Start Stream Engine
async function startStreamingProcess({ streamId, youtubeUrl, target, destinations }) {
  if (activeStreams.has(streamId)) {
    const existing = activeStreams.get(streamId);
    if (existing.status === 'LIVE' || existing.status === 'STARTING') {
      return existing;
    }
  }

  const streamState = {
    streamId,
    youtubeUrl,
    target,
    destinations,
    status: 'STARTING',
    sourceTitle: 'Initializing...',
    startTime: Date.now(),
    health: {
      status: 'idle',
      fps: 0,
      bitrate: '0kbits/s',
      duration: '00:00:00',
      speed: '0x',
      droppedFrames: 0,
    },
    logs: [],
    isStopping: false,
    child: null,
  };
  activeStreams.set(streamId, streamState);

  const addLog = (level, message) => {
    const entry = { timestamp: new Date(), level, message };
    streamState.logs.push(entry);
    if (streamState.logs.length > 200) streamState.logs.shift(); // Keep last 200 logs
    updateSessionInDb(streamId, {
      status: streamState.status,
      health: streamState.health,
      newLog: entry,
    });
  };

  addLog('info', `Starting live stream session ${streamId}`);
  addLog('info', `Ingesting YouTube source: ${youtubeUrl}`);
  addLog('info', `Target destinations: ${target}`);

  // Validate destinations
  const targetEndpoints = buildDestinationUrls(target, destinations);
  if (targetEndpoints.length === 0) {
    streamState.status = 'ERROR';
    const err = 'No valid destination RTMP URLs or Stream Keys provided.';
    addLog('error', err);
    updateSessionInDb(streamId, { status: 'ERROR', errorMessage: err });
    throw new Error(err);
  }

  // Resolve YouTube source
  let resolvedSource = null;
  try {
    resolvedSource = await resolveYouTubeSource(youtubeUrl);
    streamState.sourceTitle = resolvedSource.title;
    addLog('info', `Resolved live source: "${resolvedSource.title}" (mode: ${resolvedSource.type})`);
  } catch (err) {
    streamState.status = 'ERROR';
    addLog('error', `Failed to resolve source: ${err.message}`);
    updateSessionInDb(streamId, { status: 'ERROR', errorMessage: err.message });
    throw err;
  }

  // Construct FFmpeg Arguments
  const ffmpegArgs = [
    '-hide_banner',
    '-loglevel', 'info',
    '-y',
  ];

  // Input configuration
  if (resolvedSource.type === 'ytdlp_stream') {
    ffmpegArgs.push(
      '-re',
      '-thread_queue_size', '1024',
      '-i', resolvedSource.videoUrl
    );
    if (resolvedSource.audioUrl) {
      ffmpegArgs.push(
        '-thread_queue_size', '1024',
        '-i', resolvedSource.audioUrl,
        '-map', '0:v:0',
        '-map', '1:a:0'
      );
    }
  } else if (resolvedSource.type === 'direct_url') {
    ffmpegArgs.push(
      '-re',
      '-thread_queue_size', '1024',
      '-headers', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36\r\n',
      '-i', resolvedSource.url
    );
  } else {
    // Piped stream from Innertube
    ffmpegArgs.push('-re', '-i', 'pipe:0');
  }

  // Video & Audio Transcoding Flags optimized for Facebook & Instagram Live
  // Facebook/Instagram Live specs: H.264, 30fps/60fps, keyframe interval 2s (g=60), AAC 44.1kHz stereo
  ffmpegArgs.push(
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-tune', 'zerolatency',
    '-b:v', '3000k',
    '-maxrate', '3500k',
    '-bufsize', '6000k',
    '-pix_fmt', 'yuv420p',
    '-g', '60',
    '-keyint_min', '60',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', '44100',
    '-ac', '2'
  );

  // Destination Output Flags
  if (targetEndpoints.length === 1) {
    // Single destination
    const dest = targetEndpoints[0];
    addLog('info', `Streaming to ${dest.platform}: ${dest.fullRtmpUrl.split('/').slice(0, 3).join('/')}/...`);
    ffmpegArgs.push('-f', 'flv', dest.fullRtmpUrl);
  } else {
    // Dual Streaming via tee muxer
    const teeParts = targetEndpoints.map(d => `[f=flv:onfail=ignore]${d.fullRtmpUrl}`);
    const teeString = teeParts.join('|');
    addLog('info', `Streaming simultaneously to Both (${targetEndpoints.map(d => d.platform).join(', ')}) using tee muxer`);
    ffmpegArgs.push('-f', 'tee', teeString);
  }

  addLog('info', `Spawning FFmpeg process: ${ffmpegPath}`);

  // Spawn FFmpeg Process
  const child = spawn(ffmpegPath, ffmpegArgs, {
    stdio: [resolvedSource.type === 'piped_stream' ? 'pipe' : 'ignore', 'pipe', 'pipe'],
  });
  streamState.child = child;

  // If piped stream, pipe web stream chunks into child.stdin
  if (resolvedSource.type === 'piped_stream' && resolvedSource.stream) {
    (async () => {
      try {
        const reader = resolvedSource.stream.getReader();
        while (true) {
          if (streamState.isStopping) break;
          const { done, value } = await reader.read();
          if (done) break;
          if (value && child.stdin && !child.stdin.destroyed) {
            const canWrite = child.stdin.write(Buffer.from(value));
            if (!canWrite) {
              await new Promise(res => child.stdin.once('drain', res));
            }
          }
        }
      } catch (err) {
        addLog('warn', `Pipe stream notice: ${err.message}`);
      }
    })();
  }

  // Parse stderr for real-time telemetry (FFmpeg outputs stats to stderr)
  let lastTelemetryUpdate = Date.now();
  let stderrBuffer = '';

  child.stderr.on('data', chunk => {
    const text = chunk.toString();
    stderrBuffer += text;

    // Check for start confirmation
    if (streamState.status === 'STARTING') {
      if (text.includes('Stream #') || text.includes('Output #0') || text.includes('frame=')) {
        streamState.status = 'LIVE';
        streamState.health.status = 'healthy';
        addLog('info', 'Live stream connection established! Broadcasting active.');
        updateSessionInDb(streamId, {
          status: 'LIVE',
          startedAt: new Date(),
          sourceTitle: streamState.sourceTitle,
        });
      }
    }

    // Parse FFmpeg progress line:
    // frame=  123 fps= 30.0 q=28.0 size=    1234kB time=00:00:04.12 bitrate=2450.2kbits/s speed=1.00x
    const match = text.match(/frame=\s*(\d+)\s+fps=\s*([\d\.]+)\s+q=.*size=\s*(\d+kB)\s+time=([\d:.]+)\s+bitrate=\s*([\d\.]+kbits\/s)\s+speed=\s*([\d\.]+x)/);
    if (match) {
      streamState.health.fps = parseFloat(match[2]) || 30;
      streamState.health.duration = match[4] || '00:00:00';
      streamState.health.bitrate = match[5] || '3000kbits/s';
      streamState.health.speed = match[6] || '1.0x';
      streamState.health.status = 'healthy';

      // Throttle DB telemetry updates to every 4 seconds
      if (Date.now() - lastTelemetryUpdate > 4000) {
        lastTelemetryUpdate = Date.now();
        updateSessionInDb(streamId, { health: streamState.health });
      }
    }

    // Keep log buffer manageable and extract meaningful notices
    const lines = stderrBuffer.split('\n');
    if (lines.length > 1) {
      stderrBuffer = lines.pop(); // keep remainder
      for (const line of lines) {
        const clean = line.trim();
        if (!clean) continue;
        if (clean.includes('Error') || clean.includes('Connection refused') || clean.includes('Failed to')) {
          addLog('error', clean);
        } else if (clean.includes('warning') || clean.includes('Non-monotonous')) {
          addLog('warn', clean);
        } else if (clean.includes('Output #') || clean.includes('Metadata:') || clean.includes('Stream mapping:')) {
          addLog('info', clean);
        }
      }
    }
  });

  // Handle process termination
  child.on('close', (code, signal) => {
    addLog('info', `FFmpeg process closed with code ${code}, signal: ${signal || 'none'}`);
    const wasGraceful = streamState.isStopping;
    streamState.status = wasGraceful ? 'STOPPED' : (code === 0 ? 'STOPPED' : 'ERROR');
    streamState.health.status = 'idle';

    const updates = {
      status: streamState.status,
      stoppedAt: new Date(),
      health: streamState.health,
    };
    if (!wasGraceful && code !== 0) {
      updates.errorMessage = `FFmpeg terminated unexpectedly with code ${code}`;
    }
    updateSessionInDb(streamId, updates);
    activeStreams.delete(streamId);
  });

  child.on('error', err => {
    addLog('error', `Process error: ${err.message}`);
    streamState.status = 'ERROR';
    updateSessionInDb(streamId, {
      status: 'ERROR',
      errorMessage: err.message,
    });
    activeStreams.delete(streamId);
  });

  return streamState;
}

// 6. Stop Stream Engine
async function stopStreamingProcess(streamId) {
  const streamState = activeStreams.get(streamId);
  if (!streamState) {
    // If not active in memory, update DB to STOPPED
    await updateSessionInDb(streamId, { status: 'STOPPED', stoppedAt: new Date() });
    return { success: true, message: 'Stream was not active or already stopped.' };
  }

  streamState.isStopping = true;
  streamState.status = 'STOPPING';
  const entry = { timestamp: new Date(), level: 'info', message: 'Stopping live stream session gracefully...' };
  streamState.logs.push(entry);

  updateSessionInDb(streamId, {
    status: 'STOPPING',
    newLog: entry,
  });

  if (streamState.child) {
    try {
      // 1. Try sending 'q' to stdin for clean FLV/RTMP finalization
      if (streamState.child.stdin && !streamState.child.stdin.destroyed) {
        streamState.child.stdin.write('q\n');
      }

      // 2. Fallback timeout to SIGINT / SIGKILL
      setTimeout(() => {
        if (streamState.child && !streamState.child.killed) {
          try {
            streamState.child.kill('SIGINT');
          } catch (e) {}
          setTimeout(() => {
            if (streamState.child && !streamState.child.killed) {
              try {
                streamState.child.kill('SIGKILL');
              } catch (e) {}
            }
          }, 2000);
        }
      }, 1500);
    } catch (e) {
      console.warn('[Worker] Error stopping child process:', e.message);
    }
  }

  return { success: true, streamId, status: 'STOPPING' };
}

// 7. Scheduled Streams Monitor
setInterval(async () => {
  if (!isMongoConnected || !mongoose) return;
  try {
    const LiveStreamSession = mongoose.models.LiveStreamSession;
    if (!LiveStreamSession) return;

    const now = new Date();
    // Find scheduled streams ready to start
    const pendingSessions = await LiveStreamSession.find({
      status: 'READY',
      scheduledStartTime: { $ne: null, $lte: now },
    }).limit(3);

    for (const session of pendingSessions) {
      console.log(`[Worker] Triggering scheduled stream ${session.streamId} at ${now.toISOString()}`);
      try {
        await startStreamingProcess({
          streamId: session.streamId,
          youtubeUrl: session.youtubeUrl,
          target: session.target,
          destinations: session.destinations,
        });
      } catch (err) {
        console.error(`[Worker] Failed scheduled stream ${session.streamId}:`, err.message);
      }
    }
  } catch (err) {
    // Ignore interval error
  }
}, 10000); // Check every 10 seconds

// 8. HTTP API Server
const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Worker-Secret');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Helper for JSON response
  const sendJson = (statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  // Read Body helper
  const readBody = () => {
    return new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => (data += chunk));
      req.on('end', () => {
        try {
          resolve(data ? JSON.parse(data) : {});
        } catch (err) {
          reject(new Error('Invalid JSON payload'));
        }
      });
      req.on('error', reject);
    });
  };

  try {
    // GET /health
    if (req.method === 'GET' && (pathname === '/health' || pathname === '/')) {
      return sendJson(200, {
        status: 'ok',
        worker: 'toolnest-streaming-worker',
        port: PORT,
        isMongoConnected,
        activeStreams: Array.from(activeStreams.keys()),
        uptime: process.uptime(),
      });
    }

    // POST /api/stream/start
    if (req.method === 'POST' && pathname === '/api/stream/start') {
      const body = await readBody();
      const { streamId, youtubeUrl, target, destinations } = body;

      if (!streamId || !youtubeUrl || !target) {
        return sendJson(400, { error: 'streamId, youtubeUrl, and target are required' });
      }

      const streamState = await startStreamingProcess({ streamId, youtubeUrl, target, destinations });
      return sendJson(200, {
        success: true,
        streamId,
        status: streamState.status,
        sourceTitle: streamState.sourceTitle,
      });
    }

    // POST /api/stream/stop
    if (req.method === 'POST' && pathname === '/api/stream/stop') {
      const body = await readBody();
      const { streamId } = body;
      if (!streamId) {
        return sendJson(400, { error: 'streamId is required' });
      }
      const result = await stopStreamingProcess(streamId);
      return sendJson(200, result);
    }

    // GET /api/stream/status/:streamId
    if (req.method === 'GET' && pathname.startsWith('/api/stream/status/')) {
      const streamId = pathname.replace('/api/stream/status/', '');
      const active = activeStreams.get(streamId);

      if (active) {
        return sendJson(200, {
          streamId,
          isLive: active.status === 'LIVE',
          status: active.status,
          sourceTitle: active.sourceTitle,
          health: active.health,
          logs: active.logs.slice(-50),
          isWorkerActive: true,
        });
      }

      // Check DB if available
      if (isMongoConnected && mongoose) {
        const LiveStreamSession = mongoose.models.LiveStreamSession;
        if (LiveStreamSession) {
          const session = await LiveStreamSession.findOne({ streamId });
          if (session) {
            return sendJson(200, {
              streamId,
              isLive: session.status === 'LIVE',
              status: session.status,
              sourceTitle: session.sourceTitle,
              health: session.health,
              logs: (session.logs || []).slice(-50),
              isWorkerActive: false,
            });
          }
        }
      }

      return sendJson(404, { error: 'Stream session not found' });
    }

    // 404 Not Found
    return sendJson(404, { error: 'Endpoint not found' });
  } catch (err) {
    console.error(`[Worker] Error handling ${req.method} ${pathname}:`, err.message);
    return sendJson(500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  ToolNest Streaming Worker Daemon Online on port ${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/health`);
  console.log(`  Ingestion: YouTube Live via youtubei.js & FFmpeg`);
  console.log(`  Destinations: Facebook Live & Instagram Live (Tee Muxer)`);
  console.log(`=======================================================`);
});
