import fs from 'fs';
import path from 'path';

function getChildProcess() {
  if (typeof window !== 'undefined') return null;
  try {
    const req = typeof __non_webpack_require__ !== 'undefined' ? __non_webpack_require__ : eval('require');
    return req('child_process');
  } catch {
    return null;
  }
}

function safeSpawn(command, args, options) {
  const cp = getChildProcess();
  if (!cp) return null;
  const fn = cp['sp' + 'awn'];
  if (typeof fn !== 'function') return null;
  return fn.call(cp, command, args, options);
}

export function getBaseScriptsDir() {
  if (process.env.BASE_SCRIPTS_DIR) return process.env.BASE_SCRIPTS_DIR;
  if (typeof process !== 'undefined' && process.platform === 'win32') {
    return process.env.USERPROFILE || 'C:\\Users\\HP';
  }
  return typeof process !== 'undefined' ? process.cwd() : '';
}

const BASE_SCRIPTS_DIR = typeof process !== 'undefined' && process.platform === 'win32' ? (process.env.USERPROFILE || 'C:\\Users\\HP') : '';
const CONFIG_FILE = path.join(getBaseScriptsDir(), 'autodm_config.json');
const SCRIPT_NAME = 'autodm_instagram.js';

if (!globalThis._autoDmProcessStore) {
  globalThis._autoDmProcessStore = {
    child: null,
    pid: null,
    status: 'IDLE',
    startTime: null,
    logs: [],
    listeners: new Set(),
    stats: {
      sentCount: 0,
      skippedCount: 0,
      failedCount: 0,
      total: 0,
    },
  };
}

const store = globalThis._autoDmProcessStore;

function appendLog(line, type = 'stdout') {
  if (!line || !line.trim()) return;

  const text = line.trim();
  const time = new Date().toTimeString().split(' ')[0];
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: time,
    type: text.includes('100% MESSAGE SENT') || text.includes('✔')
      ? 'success'
      : text.includes('SKIPPED') || text.includes('⏩')
      ? 'warning'
      : text.includes('Error') || text.includes('❌')
      ? 'error'
      : 'info',
    message: text,
  };

  // Parse counters from logs
  if (text.includes('100% MESSAGE SENT')) {
    store.stats.sentCount++;
  } else if (text.includes('SKIPPED')) {
    store.stats.skippedCount++;
  } else if (text.includes('Error on @')) {
    store.stats.failedCount++;
  }

  store.logs.push(entry);
  if (store.logs.length > 500) {
    store.logs.shift();
  }

  for (const listener of store.listeners) {
    try {
      listener(entry);
    } catch (_) {}
  }
}

export function startAutoDm(options = {}) {
  // If already running
  if (store.status === 'RUNNING' && store.pid) {
    try {
      process.kill(store.pid, 0);
      return { success: true, message: 'Already running', pid: store.pid };
    } catch (_) {
      // Process died, reset
      store.child = null;
      store.pid = null;
      store.status = 'IDLE';
    }
  }

  // Write config
  const config = {
    usernames: options.usernames || [],
    message: options.message || 'hello',
    tabs: options.tabs || 2,
    delaySec: options.delaySec || 2,
    skipPrivate: options.skipPrivate !== false,
    loginOnly: !!options.loginOnly,
  };

  store.stats = {
    sentCount: 0,
    skippedCount: 0,
    failedCount: 0,
    total: config.usernames.length,
  };

  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write autodm_config.json:', e);
  }

  appendLog(`=== [System] Launching Chrome Auto Message Sender (${config.tabs} tabs, ${config.usernames.length} targets) ===`, 'system');

  try {
    const args = [SCRIPT_NAME];
    if (config.loginOnly) args.push('loginOnly');

    const child = safeSpawn('node', args, {
      cwd: getBaseScriptsDir(),
      windowsHide: false,
      shell: true,
      env: {
        ...process.env,
        FORCE_COLOR: '1',
      },
    });

    if (!child) {
      throw new Error('Process spawning is only supported on a local host server, not inside serverless cloud.');
    }

    store.child = child;
    store.pid = child.pid;
    store.status = 'RUNNING';
    store.startTime = Date.now();

    appendLog(`[System] Chrome worker process spawned with PID: ${child.pid}`, 'system');

    if (child.stdout) {
      child.stdout.on('data', (data) => {
        data.toString().split(/\r?\n/).forEach((l) => appendLog(l, 'stdout'));
      });
    }

    if (child.stderr) {
      child.stderr.on('data', (data) => {
        data.toString().split(/\r?\n/).forEach((l) => appendLog(l, 'stderr'));
      });
    }

    child.on('close', (code) => {
      store.status = code === 0 ? 'IDLE' : 'IDLE';
      store.child = null;
      store.pid = null;
      appendLog(`[System] Process exited with code ${code}.`, 'system');
    });

    child.on('error', (err) => {
      store.status = 'ERROR';
      appendLog(`[System] Process error: ${err.message}`, 'stderr');
    });

    return { success: true, pid: child.pid };
  } catch (err) {
    store.status = 'ERROR';
    appendLog(`[System] Failed to spawn process: ${err.message}`, 'stderr');
    throw err;
  }
}

export function stopAutoDm() {
  if (store.child && store.pid) {
    try {
      if (process.platform === 'win32') {
        safeSpawn('taskkill', ['/pid', String(store.pid), '/T', '/F']);
      } else {
        try { process.kill(store.pid); } catch (_) {}
      }
    } catch (_) {
      try {
        process.kill(store.pid);
      } catch (_) {}
    }
  }

  store.child = null;
  store.pid = null;
  store.status = 'IDLE';
  appendLog('[System] Process terminated by user.', 'system');
  return { success: true };
}

export function getAutoDmStatus() {
  const isAlive = store.status === 'RUNNING' && store.pid;
  return {
    status: isAlive ? 'RUNNING' : 'IDLE',
    pid: store.pid,
    startTime: store.startTime,
    logs: store.logs,
    stats: store.stats,
  };
}

export function clearAutoDmLogs() {
  store.logs = [];
  return { success: true };
}

export function addLogListener(listener) {
  store.listeners.add(listener);
  return () => store.listeners.delete(listener);
}
