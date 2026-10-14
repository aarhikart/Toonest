import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export const BASE_SCRIPTS_DIR = 'C:\\Users\\HP';
export const CONFIG_FILE = path.join(BASE_SCRIPTS_DIR, 'autopost_fast_config.json');
export const BROWSER_SCRIPT_NAME = 'autopost_fast_instagram.js';
export const API_SCRIPT_NAME = 'autopost_fast_api.js';
export const SCRIPT_NAME = API_SCRIPT_NAME;
export const DEFAULT_IMAGES_FOLDER = 'C:\\Users\\HP\\Documents\\uploaded\\10M-images';
export const SESSION_DIR = path.join(BASE_SCRIPTS_DIR, 'ig_fastposter_session');
export const ACCOUNTS_FILE = path.join(BASE_SCRIPTS_DIR, 'autopost_fast_accounts.json');

// Supported image / video extensions for upload
export const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.heic', '.heif', '.mp4', '.mov'];

if (!globalThis._fastPosterProcessStore) {
  globalThis._fastPosterProcessStore = {
    child: null,
    pid: null,
    status: 'IDLE', // 'IDLE' | 'RUNNING' | 'ERROR'
    startTime: null,
    logs: [],
    listeners: new Set(),
    stats: {
      totalPosted: 0,
      currentSpeed: 0, // posts per minute
      currentLoop: 1,
      currentImageIndex: 0,
      totalAvailableImages: 0,
      activeTabs: 0,
      failedCount: 0,
      lastImageName: '',
    },
    config: {
      folder: DEFAULT_IMAGES_FOLDER,
      tabs: 4,
      turboMode: true,
      delaySec: 1.0,
      maxLimit: 10000000,
      caption: '',
    },
  };
}

const store = globalThis._fastPosterProcessStore;

/**
 * Clean Chromium profile locks defensively to prevent ProcessSingleton failures
 */
export function cleanProfileLocks(dir = SESSION_DIR) {
  if (!dir) return;
  try {
    if (!fs.existsSync(dir)) return;
    const locks = ['SingletonLock', 'lockfile', 'SingletonCookie', 'SingletonSocket'];
    for (const lockFile of locks) {
      const lockPath = path.join(dir, lockFile);
      try {
        if (fs.existsSync(lockPath)) {
          fs.rmSync(lockPath, { force: true, recursive: true });
        }
      } catch (_) {}
    }
  } catch (err) {
    console.error(`[FastPoster] Error cleaning locks in ${dir}:`, err.message);
  }
}

/**
 * Scan folder for image/video files without modifying or moving them
 */
export function scanImagesFolder(folderPath = DEFAULT_IMAGES_FOLDER) {
  const targetDir = folderPath || DEFAULT_IMAGES_FOLDER;
  try {
    if (!fs.existsSync(targetDir)) {
      return {
        exists: false,
        folder: targetDir,
        count: 0,
        files: [],
        error: `Folder does not exist: ${targetDir}`,
      };
    }

    const entries = fs.readdirSync(targetDir, { withFileTypes: true });
    const files = entries
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .filter((name) => {
        const ext = path.extname(name).toLowerCase();
        return SUPPORTED_EXTENSIONS.includes(ext);
      })
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    return {
      exists: true,
      folder: targetDir,
      count: files.length,
      files: files.slice(0, 100), // Preview up to 100 file names
      totalSize: files.length,
    };
  } catch (err) {
    return {
      exists: false,
      folder: targetDir,
      count: 0,
      files: [],
      error: err.message,
    };
  }
}

function appendLog(line, type = 'stdout') {
  if (!line || !line.trim()) return;

  const text = line.trim();
  const time = new Date().toTimeString().split(' ')[0];

  let logType = 'info';
  if (text.includes('✔') || text.includes('Successfully shared') || text.includes('Shared!') || text.includes('100%')) {
    logType = 'success';
  } else if (text.includes('Warning') || text.includes('⚠️') || text.includes('⏩')) {
    logType = 'warning';
  } else if (text.includes('Error') || text.includes('❌') || text.includes('Failed')) {
    logType = 'error';
  } else if (text.includes('[System]') || text.includes('===') || text.includes('🚀')) {
    logType = 'system';
  }

  // Parse counters & stats from stdout
  const totalMatch = text.match(/Total:\s*(\d+)/i) || text.match(/Total posted:\s*(\d+)/i);
  if (totalMatch) {
    store.stats.totalPosted = parseInt(totalMatch[1], 10);
  }

  const loopMatch = text.match(/Loop:\s*(\d+)/i);
  if (loopMatch) {
    store.stats.currentLoop = parseInt(loopMatch[1], 10);
  }

  const speedMatch = text.match(/Speed:\s*~?(\d+)/i);
  if (speedMatch) {
    store.stats.currentSpeed = parseInt(speedMatch[1], 10);
  } else if (store.startTime && store.stats.totalPosted > 0) {
    const elapsedMinutes = (Date.now() - store.startTime) / 60000;
    if (elapsedMinutes > 0.05) {
      store.stats.currentSpeed = Math.round(store.stats.totalPosted / elapsedMinutes);
    }
  }

  const fileMatch = text.match(/(?:Loaded|shared|Uploading):\s*([^\s()]+\.(?:jpg|jpeg|png|webp|avif|mp4))/i);
  if (fileMatch) {
    store.stats.lastImageName = fileMatch[1];
  }

  if (text.includes('❌') || text.includes('Error on')) {
    store.stats.failedCount++;
  }

  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: time,
    type: logType,
    message: text,
  };

  store.logs.push(entry);
  if (store.logs.length > 600) {
    store.logs.shift();
  }

  for (const listener of store.listeners) {
    try {
      listener(entry);
    } catch (_) {}
  }
}

/**
 * Start Ultra Fast Instagram Auto Poster
 */
export function startFastPoster(options = {}) {
  // If user requests loginOnly, ensure any previously running poster is stopped
  // to prevent Chrome profile lock contention (ProcessSingleton)
  if (options.loginOnly) {
    if (store.status === 'RUNNING' || store.child) {
      stopFastPoster();
    }
  } else if (store.status === 'RUNNING' && store.pid) {
    try {
      process.kill(store.pid, 0);
      return { success: true, message: 'Fast Auto Poster is already running', pid: store.pid };
    } catch (_) {
      store.child = null;
      store.pid = null;
      store.status = 'IDLE';
    }
  }

  const folder = options.folder || DEFAULT_IMAGES_FOLDER;
  const scan = scanImagesFolder(folder);

  if (!options.loginOnly && scan.count === 0) {
    throw new Error(`No images found in "${folder}". Please add images (.jpg, .png, etc.) to the folder.`);
  }

  const maxAllowedWorkers = options.engine === 'browser' ? 10 : 1000;
  const safeTabs = Math.max(1, Math.min(maxAllowedWorkers, parseInt(options.tabs || 4, 10) || 4));
  const safeDelay = Math.max(0.05, Math.min(10, parseFloat(options.delaySec || 0.5) || 0.5));
  const safeLimit = Math.max(0, parseInt(options.maxLimit || 10000000, 10) || 10000000);
  const turboMode = options.turboMode !== false; // Default true (optimistic restart)
  const caption = (options.caption || '').trim();
  const loginOnly = !!options.loginOnly;
  const rawSessionDir = options.sessionDir || store.config?.sessionDir || 'ig_fastposter_session';
  const sessionDir = normalizeSessionName(rawSessionDir);

  const config = {
    folder,
    tabs: safeTabs,
    turboMode,
    delaySec: safeDelay,
    maxLimit: safeLimit,
    caption,
    loginOnly,
    sessionDir,
  };

  store.config = config;
  store.stats = {
    totalPosted: 0,
    currentSpeed: 0,
    currentLoop: 1,
    currentImageIndex: 0,
    totalAvailableImages: scan.count,
    activeTabs: safeTabs,
    failedCount: 0,
    lastImageName: '',
  };

  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write autopost_fast_config.json:', e);
  }

  const activeSessionPath = path.isAbsolute(sessionDir) ? sessionDir : path.join(BASE_SCRIPTS_DIR, sessionDir);
  try {
    fs.mkdirSync(activeSessionPath, { recursive: true });
  } catch (_) {}
  cleanProfileLocks(activeSessionPath);

  if (loginOnly) {
    appendLog(`=== [System] Launching Fresh Chrome Window to Log Into Instagram: ${sessionDir} ===`, 'system');
    appendLog(`[System] Profile Directory: ${activeSessionPath}`, 'system');
    appendLog(`[System] Chrome is opening. Please log into your Instagram account. Window stays open until closed.`, 'info');
  } else {
    appendLog(
      `=== [System] Launching Ultra Fast Auto Poster (${safeTabs} tabs, Session: ${sessionDir}, Folder: ${folder}, Turbo: ${turboMode ? 'ON' : 'OFF'}, Images: ${scan.count}) ===`,
      'system'
    );
  }

  try {
    const chosenScript = loginOnly ? BROWSER_SCRIPT_NAME : (options.engine === 'browser' ? BROWSER_SCRIPT_NAME : API_SCRIPT_NAME);
    const args = [chosenScript];
    if (loginOnly) args.push('loginOnly');

    const child = spawn('node', args, {
      cwd: BASE_SCRIPTS_DIR,
      windowsHide: false,
      shell: true,
      env: {
        ...process.env,
        FORCE_COLOR: '1',
      },
    });

    store.child = child;
    store.pid = child.pid;
    store.status = 'RUNNING';
    store.startTime = Date.now();

    appendLog(`[System] Fast Poster process spawned with PID: ${child.pid}`, 'system');

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
      store.status = 'IDLE';
      store.child = null;
      store.pid = null;
      appendLog(`[System] Process exited with code ${code}.`, 'system');
    });

    child.on('error', (err) => {
      store.status = 'ERROR';
      appendLog(`[System] Process error: ${err.message}`, 'stderr');
    });

    return { success: true, pid: child.pid, config };
  } catch (err) {
    store.status = 'ERROR';
    appendLog(`[System] Failed to spawn process: ${err.message}`, 'stderr');
    throw err;
  }
}

/**
 * Stop Ultra Fast Auto Poster
 */
export function stopFastPoster() {
  if (store.child && store.pid) {
    try {
      spawn('taskkill', ['/pid', String(store.pid), '/T', '/F']);
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

/**
 * Get current status & statistics
 */
export function getFastPosterStatus() {
  const isAlive = store.status === 'RUNNING' && store.pid;
  return {
    status: isAlive ? 'RUNNING' : 'IDLE',
    pid: store.pid,
    startTime: store.startTime,
    logs: store.logs,
    stats: store.stats,
    config: store.config,
  };
}

export function clearFastPosterLogs() {
  store.logs = [];
  return { success: true };
}

export function addLogListener(listener) {
  store.listeners.add(listener);
  return () => store.listeners.delete(listener);
}

/**
 * Normalizes any user-entered account name into an ig_*_session identifier
 */
export function normalizeSessionName(rawName) {
  if (!rawName) return 'ig_fastposter_session';
  let clean = String(rawName).trim().toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_');
  clean = clean.replace(/^_/, '').replace(/_$/, '');
  if (!clean) return 'ig_fastposter_session';
  if (!clean.startsWith('ig_')) {
    clean = 'ig_' + clean;
  }
  if (!clean.endsWith('_session')) {
    clean = clean + '_session';
  }
  return clean;
}

export function formatAccountDisplayName(sessionId, rawInput) {
  if (rawInput && typeof rawInput === 'string' && rawInput.trim()) {
    const trimmed = rawInput.trim();
    if (!trimmed.startsWith('ig_') && !trimmed.endsWith('_session')) {
      return trimmed
        .replace(/_/g, ' ')
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
  }
  const stripped = sessionId.replace(/^ig_/, '').replace(/_session$/, '');
  return stripped
    .replace(/_/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function getSavedAccounts() {
  try {
    if (fs.existsSync(ACCOUNTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'));
      if (typeof data === 'object' && data !== null) return data;
    }
  } catch (_) {}
  return {};
}

export function registerAccount(sessionId, displayName) {
  try {
    const accounts = getSavedAccounts();
    accounts[sessionId] = displayName || formatAccountDisplayName(sessionId);
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save account to autopost_fast_accounts.json:', e);
  }
}

/**
 * Scan system for all available Instagram sessions
 */
export function listAvailableInstagramAccounts() {
  const baseDir = BASE_SCRIPTS_DIR;
  const saved = getSavedAccounts();
  let dirs = [];
  try {
    dirs = fs.readdirSync(baseDir).filter((d) => d.startsWith('ig_') && d.endsWith('_session'));
  } catch (_) {}

  // Include any accounts that were explicitly registered in autopost_fast_accounts.json
  for (const savedId of Object.keys(saved)) {
    if (!dirs.includes(savedId)) {
      dirs.push(savedId);
      try {
        fs.mkdirSync(path.join(baseDir, savedId), { recursive: true });
      } catch (_) {}
    }
  }

  // Ensure default fastposter session is in list
  if (!dirs.includes('ig_fastposter_session')) {
    dirs.unshift('ig_fastposter_session');
  }

  const knownNames = {
    'ig_fastposter_session': 'Ultra Fast Poster (@mootivation_drive)',
    'ig_motivation_session': 'Motivation Drive (@mootivation_drive)',
    'ig_reels_session': 'Cars Account (@cars)',
    'ig_gym_session': 'Gym Fitness Account',
    'ig_foodvideos_session': 'Food Videos Account',
    'ig_pipevideos_session': 'Pipes & Engineering Account',
    'ig_moviemela_session': 'MovieMela Cinema Account',
    'ig_cricket_session': 'Cricket Highlights Account',
    'ig_designer_session': 'Designer Account',
    'ig_nails_art_drive_session': 'Nails Art Account',
    'ig_smart_gadget_session': 'Smart Gadget Account',
    'ig_dm_session': 'DM Assistant Session',
    'ig_test_gaming_session': 'Gaming Account',
    ...saved,
  };

  const active = normalizeSessionName(store.config?.sessionDir || 'ig_fastposter_session');

  return dirs.map((d) => ({
    id: d,
    name: knownNames[d] || formatAccountDisplayName(d),
    path: path.join(baseDir, d),
    isCurrent: d === active || path.join(baseDir, d) === active,
  }));
}

/**
 * Switch the active account session
 */
export function switchAccountSession(sessionName, rawInput) {
  if (!sessionName) return { success: false, error: 'sessionName is required' };
  const cleanId = normalizeSessionName(sessionName);
  const friendlyName = formatAccountDisplayName(cleanId, rawInput || sessionName);

  registerAccount(cleanId, friendlyName);

  const sessionPath = path.isAbsolute(cleanId) ? cleanId : path.join(BASE_SCRIPTS_DIR, cleanId);
  try {
    fs.mkdirSync(sessionPath, { recursive: true });
  } catch (_) {}
  cleanProfileLocks(sessionPath);

  store.config = {
    ...store.config,
    sessionDir: cleanId,
  };

  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(store.config, null, 2), 'utf8');
  } catch (_) {}

  appendLog(`[System] Switched active Instagram account session to: ${cleanId} (${friendlyName})`, 'system');
  return { success: true, sessionDir: cleanId, name: friendlyName };
}

