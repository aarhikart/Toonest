import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { getAccounts } from '@/lib/automation/accounts';

export const BASE_SCRIPTS_DIR = 'C:\\Users\\HP';
export const CONFIG_FILE = path.join(BASE_SCRIPTS_DIR, 'autopost_multi_config.json');
export const SCRIPT_NAME = 'autopost_multi_api.js';
export const SCRIPT_PATH = path.join(BASE_SCRIPTS_DIR, SCRIPT_NAME);

if (!globalThis._multiApiPosterProcessStore) {
  globalThis._multiApiPosterProcessStore = {
    child: null,
    pid: null,
    status: 'IDLE', // 'IDLE' | 'RUNNING' | 'ERROR'
    startTime: null,
    logs: [],
    listeners: new Set(),
    stats: {
      totalPublished: 0,
      totalFailed: 0,
      currentSpeed: 0, // posts per minute
      activeAccountId: '',
      activeAccountName: '',
      accountStats: {},
      elapsedSec: 0,
      lastPostUrl: '',
    },
    config: {
      accounts: [],
      delaySec: 4.5,
      batchLimitPerAccount: 50,
      rotationMode: 'sequential',
      archiveFinished: true,
      captionMode: 'filename_title',
      customCaption: '',
    },
  };
}

const store = globalThis._multiApiPosterProcessStore;

export function cleanProfileLocks(dir) {
  if (!dir || !fs.existsSync(dir)) return;
  const locks = ['SingletonLock', 'lockfile', 'SingletonCookie', 'SingletonSocket'];
  for (const lockFile of locks) {
    const lockPath = path.join(dir, lockFile);
    try {
      if (fs.existsSync(lockPath)) {
        fs.rmSync(lockPath, { force: true, recursive: true });
      }
    } catch (_) {}
  }
}

/**
 * Scan account folder for pending and finished videos/photos
 */
export function getFolderMediaStats(folderPath) {
  if (!folderPath || !fs.existsSync(folderPath)) {
    return { exists: false, pendingCount: 0, finishedCount: 0 };
  }
  try {
    const validExts = ['.mp4', '.mov', '.jpg', '.jpeg', '.png', '.webp'];
    const entries = fs.readdirSync(folderPath, { withFileTypes: true });
    const pendingCount = entries.filter(
      (e) => e.isFile() && validExts.includes(path.extname(e.name).toLowerCase())
    ).length;

    let finishedCount = 0;
    const finishedDir = path.join(folderPath, 'finished_reels');
    if (fs.existsSync(finishedDir)) {
      finishedCount = fs.readdirSync(finishedDir, { withFileTypes: true }).filter(
        (e) => e.isFile() && validExts.includes(path.extname(e.name).toLowerCase())
      ).length;
    }

    return { exists: true, pendingCount, finishedCount };
  } catch (err) {
    return { exists: false, pendingCount: 0, finishedCount: 0, error: err.message };
  }
}

/**
 * Check session directory for valid cookies
 */
export function checkSessionLogin(sessionDir) {
  if (!sessionDir || !fs.existsSync(sessionDir)) {
    return { hasSession: false, isLoggedIn: false };
  }
  try {
    // Check for cookie files
    const cookiesPath = path.join(sessionDir, 'Default', 'Network', 'Cookies');
    const legacyCookies = path.join(sessionDir, 'Default', 'Cookies');
    const hasCookieFile = fs.existsSync(cookiesPath) || fs.existsSync(legacyCookies);

    return {
      hasSession: true,
      isLoggedIn: hasCookieFile,
      sessionDir,
    };
  } catch (err) {
    return { hasSession: true, isLoggedIn: false, error: err.message };
  }
}

/**
 * Get all configured accounts enriched with media stats & session status
 */
export function getAllAccountsEnriched() {
  const accounts = getAccounts();

  return accounts.map((acc) => {
    const sessionDir = acc.sessionDir
      ? (path.isAbsolute(acc.sessionDir) ? acc.sessionDir : path.join(BASE_SCRIPTS_DIR, acc.sessionDir))
      : path.join(BASE_SCRIPTS_DIR, `ig_${acc.id}_session`);

    const mediaStats = getFolderMediaStats(acc.folder);
    const sessionInfo = checkSessionLogin(sessionDir);

    return {
      ...acc,
      sessionDir,
      sessionExists: sessionInfo.hasSession,
      isLoggedIn: sessionInfo.isLoggedIn,
      pendingCount: mediaStats.pendingCount,
      finishedCount: mediaStats.finishedCount,
      folderExists: mediaStats.exists,
    };
  });
}

/**
 * Add log entry and notify SSE listeners
 */
export function pushLog(text) {
  const line = String(text).replace(/\r/g, '');
  store.logs.push(line);
  if (store.logs.length > 500) {
    store.logs.shift();
  }

  // Parse stdout for live stats
  if (line.includes('Switched to: @')) {
    const match = line.match(/Switched to: @([^\s]+)/);
    if (match) store.stats.activeAccountName = match[1];
  }

  if (line.includes('✔ [SUCCESS] Posted to')) {
    const urlMatch = line.match(/(https:\/\/instagram\.com\/p\/[^\s\)]+)/);
    if (urlMatch) store.stats.lastPostUrl = urlMatch[1];
    store.stats.totalPublished++;

    if (store.startTime) {
      const elapsedMins = (Date.now() - store.startTime) / 60000;
      store.stats.currentSpeed = elapsedMins > 0.05
        ? Math.round(store.stats.totalPublished / elapsedMins)
        : store.stats.totalPublished * 10;
    }
  }

  if (line.includes('❌ [ERROR]')) {
    store.stats.totalFailed++;
  }

  // Notify listeners
  for (const listener of store.listeners) {
    try {
      listener(line);
    } catch (_) {}
  }
}

export function addLogListener(fn) {
  store.listeners.add(fn);
  return () => store.listeners.delete(fn);
}

export function clearLogs() {
  store.logs = [];
}

/**
 * Start Multi-Account Direct API Poster
 */
export function startMultiPoster(userConfig = {}) {
  if (store.child && store.status === 'RUNNING') {
    throw new Error('Multi-Account poster is already actively running!');
  }

  const selectedAccounts = userConfig.accounts || [];
  if (selectedAccounts.length === 0) {
    throw new Error('Please select at least one account to start posting!');
  }

  const mergedConfig = {
    accounts: selectedAccounts,
    delaySec: typeof userConfig.delaySec === 'number' ? userConfig.delaySec : 4.5,
    batchLimitPerAccount: typeof userConfig.batchLimitPerAccount === 'number' ? userConfig.batchLimitPerAccount : 50,
    rotationMode: userConfig.rotationMode || 'sequential',
    archiveFinished: userConfig.archiveFinished !== false,
    captionMode: userConfig.captionMode || 'filename_title',
    customCaption: userConfig.customCaption || '',
  };

  store.config = mergedConfig;
  store.status = 'RUNNING';
  store.startTime = Date.now();
  store.logs = [];
  store.stats = {
    totalPublished: 0,
    totalFailed: 0,
    currentSpeed: 0,
    activeAccountId: selectedAccounts[0]?.id || '',
    activeAccountName: selectedAccounts[0]?.name || '',
    accountStats: {},
    elapsedSec: 0,
    lastPostUrl: '',
  };

  selectedAccounts.forEach((acc) => {
    store.stats.accountStats[acc.id] = { published: 0, failed: 0, status: 'IDLE' };
  });

  // Write config file
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(mergedConfig, null, 2), 'utf8');

  pushLog(`🚀 [System] Launching Multi-Account Direct API Engine with ${selectedAccounts.length} account(s)...`);
  pushLog(`📁 Config saved to: ${CONFIG_FILE}`);

  // Clean locks for all selected sessions
  selectedAccounts.forEach((acc) => {
    const sessionDir = acc.sessionDir || path.join(BASE_SCRIPTS_DIR, `ig_${acc.id}_session`);
    cleanProfileLocks(sessionDir);
  });

  const child = spawn('node', [SCRIPT_PATH], {
    cwd: BASE_SCRIPTS_DIR,
    env: { ...process.env, NODE_ENV: 'production' },
    windowsHide: true,
  });

  store.child = child;
  store.pid = child.pid;

  pushLog(`✔ [System] Engine process spawned (PID: ${child.pid})`);

  child.stdout.on('data', (chunk) => {
    const text = chunk.toString();
    const lines = text.split('\n');
    lines.forEach((l) => {
      if (l.trim()) pushLog(l);
    });
  });

  child.stderr.on('data', (chunk) => {
    const text = chunk.toString();
    const lines = text.split('\n');
    lines.forEach((l) => {
      if (l.trim()) pushLog(`[STDERR] ${l}`);
    });
  });

  child.on('error', (err) => {
    store.status = 'ERROR';
    pushLog(`❌ [Process Error]: ${err.message}`);
  });

  child.on('close', (code) => {
    store.status = 'IDLE';
    store.child = null;
    store.pid = null;
    pushLog(`🏁 [Process Exit]: Multi-Account engine exited with code ${code}.`);
  });

  return {
    success: true,
    pid: child.pid,
    accountsCount: selectedAccounts.length,
    config: mergedConfig,
  };
}

/**
 * Stop Multi-Account Poster
 */
export function stopMultiPoster() {
  if (!store.child && store.status !== 'RUNNING') {
    return { success: true, message: 'Already stopped' };
  }

  const pid = store.pid;
  pushLog(`🛑 [System] Stopping Multi-Account Engine (PID: ${pid})...`);

  try {
    if (pid) {
      spawn('taskkill', ['/pid', String(pid), '/T', '/F']);
    }
  } catch (err) {
    console.error('[MultiPoster] Error killing PID:', err.message);
  }

  store.status = 'IDLE';
  store.child = null;
  store.pid = null;
  pushLog(`✔ [System] Multi-Account Engine stopped successfully.`);

  return { success: true, message: 'Process terminated' };
}

/**
 * Open interactive Chrome window for logging into a specific account
 */
export function openLoginBrowser(accountId) {
  const accounts = getAllAccountsEnriched();
  const acc = accounts.find((a) => a.id === accountId);
  if (!acc) {
    throw new Error(`Account ID '${accountId}' not found.`);
  }

  const sessionDir = acc.sessionDir;
  cleanProfileLocks(sessionDir);

  pushLog(`🌐 [Login] Launching interactive Chrome for @${acc.name || acc.id}...`);

  // Small node script to open Chrome with session directory
  const loginScript = `
    const { chromium } = require('playwright');
    (async () => {
      const ctx = await chromium.launchPersistentContext(${JSON.stringify(sessionDir)}, {
        headless: false,
        args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
        viewport: null,
      });
      const page = ctx.pages()[0] || await ctx.newPage();
      await page.goto('https://www.instagram.com/');
      console.log('Login browser open for ${acc.id}. Close window when logged in.');
    })();
  `;

  const child = spawn('node', ['-e', loginScript], {
    cwd: BASE_SCRIPTS_DIR,
    detached: true,
    stdio: 'ignore',
  });
  child.unref();

  return { success: true, account: acc.name || acc.id, sessionDir };
}

/**
 * Get current system status
 */
export function getMultiPosterStatus() {
  if (store.startTime && store.status === 'RUNNING') {
    store.stats.elapsedSec = Math.round((Date.now() - store.startTime) / 1000);
  }

  return {
    status: store.status,
    pid: store.pid,
    startTime: store.startTime,
    stats: store.stats,
    config: store.config,
    logs: store.logs,
  };
}
