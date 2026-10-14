import { spawn, spawnSync, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { ACCOUNTS, BASE_SCRIPTS_DIR, getAccountById, getAccounts, getFolderVideoStats } from './accounts.js';

// Maximum lines kept per account in the memory log ring buffer
const MAX_LOG_LINES = 500;

// Initialize persistent global singleton store
if (!globalThis._playwrightProcessStore) {
  globalThis._playwrightProcessStore = {
    // accountId -> { child, pid, startTime, status: 'IDLE'|'RUNNING'|'ERROR', logs: [], lastError: null, exitCode: null }
    accounts: {},
    // Set of listener functions: (event) => void
    listeners: new Set(),
  };
}

const store = globalThis._playwrightProcessStore;

/**
 * Ensure an account record is initialized in the runtime store
 */
export function ensureAccountInStore(accId) {
  if (!store.accounts[accId]) {
    store.accounts[accId] = {
      accountId: accId,
      child: null,
      pid: null,
      startTime: null,
      status: 'IDLE',
      logs: [],
      lastError: null,
      exitCode: null,
    };
  }
  return store.accounts[accId];
}

// Ensure all current accounts are initialized in store
for (const acc of getAccounts()) {
  ensureAccountInStore(acc.id);
}

/**
 * Clean Chromium profile locks defensively to prevent ProcessSingleton failures
 */
function cleanProfileLocks(sessionDir) {
  if (!sessionDir) return;
  try {
    if (!fs.existsSync(/*turbopackIgnore: true*/ sessionDir)) return;
    const locks = ['SingletonLock', 'lockfile', 'SingletonCookie', 'SingletonSocket'];
    for (const lockFile of locks) {
      const lockPath = path.join(/*turbopackIgnore: true*/ sessionDir, lockFile);
      try {
        if (fs.existsSync(/*turbopackIgnore: true*/ lockPath)) {
          fs.rmSync(lockPath, { force: true, recursive: true });
        }
      } catch (_) {}
    }
  } catch (err) {
    console.error(`[ProcessManager] Error cleaning locks in ${sessionDir}:`, err.message);
  }
}

/**
 * Safely recover any in_progress videos back into the root queue folder
 */
function restoreInProgressVideos(folder) {
  if (!folder) return;
  try {
    const inProgressDir = path.join(folder, 'in_progress');
    if (fs.existsSync(inProgressDir)) {
      const files = fs.readdirSync(inProgressDir);
      for (const file of files) {
        const fullPath = path.join(inProgressDir, file);
        const cleanName = file.replace(/^(tab\d+_)+/, '');
        const targetPath = path.join(folder, cleanName);
        try {
          fs.renameSync(fullPath, targetPath);
        } catch (_) {}
      }
    }
  } catch (_) {}
}

/**
 * Format timestamp: HH:MM:SS
 */
function getTimestamp() {
  const now = new Date();
  return now.toTimeString().split(' ')[0];
}

/**
 * Append formatted log line and broadcast to real-time SSE listeners
 */
function appendLog(accountId, rawData, streamType = 'stdout') {
  const target = store.accounts[accountId];
  if (!target) return;

  const text = rawData.toString();
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    if (!line.trim() && lines.length > 1) continue;

    const timestamp = getTimestamp();
    const logEntry = {
      accountId,
      timestamp,
      stream: streamType, // 'stdout' | 'stderr' | 'system'
      message: line,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };

    target.logs.push(logEntry);
    if (target.logs.length > MAX_LOG_LINES) {
      target.logs.shift();
    }

    // Broadcast to active SSE listeners
    for (const listener of store.listeners) {
      try {
        listener(logEntry);
      } catch (_) {}
    }
  }
}

/**
 * Check if a process with given PID is still actually alive on Windows
 */
function isPidAlive(pid) {
  if (!pid) return false;
  try {
    // Sending signal 0 checks for existence without killing
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Start a single automation script by accountId
 */
export function startScript(accountId, options = {}) {
  const account = getAccountById(accountId);
  if (!account) {
    throw new Error(`Account "${accountId}" not found.`);
  }

  const rawTabs = typeof options === 'number' ? options : (options?.tabs || 2);
  const safeTabs = Math.max(1, Math.min(20, parseInt(rawTabs, 10) || 2));
  const rawLimit = options?.postLimit !== undefined ? options.postLimit : (options?.loopCount || 0);
  const postLimit = Math.max(0, parseInt(rawLimit, 10) || 0);
  const accountIndex = typeof options?.accountIndex === 'number' ? Math.max(0, options.accountIndex) : 0;

  const record = ensureAccountInStore(account.id);

  // If already marked running, check if process is really alive
  if (record.status === 'RUNNING' && record.pid && isPidAlive(record.pid)) {
    return {
      success: true,
      message: `${account.name} is already running (PID: ${record.pid}, Tabs: ${record.tabs || safeTabs}, Limit: ${record.postLimit || 'All'}).`,
      pid: record.pid,
      status: 'RUNNING',
      tabs: record.tabs || safeTabs,
      postLimit: record.postLimit || postLimit,
    };
  }

  // 1. Defensively clean profile locks for this account's session
  cleanProfileLocks(account.sessionDir);

  // 2. Clear old error state
  record.lastError = null;
  record.exitCode = null;
  record.tabs = safeTabs;
  record.postLimit = postLimit;

  appendLog(
    account.id,
    `=== [System] Launching ${account.name} (${account.scriptName}) with ${safeTabs} tabs ${postLimit > 0 ? `(Post limit: ${postLimit} videos)` : '(Posting all available videos)'} ===`,
    'system'
  );

  try {
    // 3. Spawn child process on Windows with tabs, postLimit, and accountIndex passed as CLI args & env vars
    const child = spawn('node', [account.scriptName, String(safeTabs), String(postLimit), String(accountIndex)], {
      cwd: BASE_SCRIPTS_DIR,
      windowsHide: false,
      shell: true,
      env: {
        ...process.env,
        CONCURRENT_TABS: String(safeTabs),
        POST_LIMIT: String(postLimit),
        ACCOUNT_INDEX: String(accountIndex),
        FORCE_COLOR: '1',
      },
    });

    const pid = child.pid;
    record.child = child;
    record.pid = pid;
    record.startTime = Date.now();
    record.status = 'RUNNING';

    appendLog(account.id, `[System] Process spawned with PID: ${pid} (${safeTabs} tabs, limit: ${postLimit > 0 ? `${postLimit} posts` : 'unlimited'})`, 'system');

    // Handle stdout
    if (child.stdout) {
      child.stdout.on('data', (chunk) => {
        appendLog(account.id, chunk, 'stdout');
      });
    }

    // Handle stderr
    if (child.stderr) {
      child.stderr.on('data', (chunk) => {
        appendLog(account.id, chunk, 'stderr');
      });
    }

    // Handle process exit / close
    child.on('close', (code, signal) => {
      record.status = code === 0 ? 'IDLE' : (code === null ? 'IDLE' : 'ERROR');
      record.exitCode = code;
      record.child = null;
      record.pid = null;

      const exitMsg = signal
        ? `[System] Process terminated by signal ${signal}.`
        : `[System] Process exited with code ${code}.`;
      appendLog(account.id, exitMsg, code === 0 ? 'system' : 'stderr');
    });

    child.on('error', (err) => {
      record.status = 'ERROR';
      record.lastError = err.message;
      record.child = null;
      record.pid = null;
      appendLog(account.id, `[System Error] Failed to start process: ${err.message}`, 'stderr');
    });

    return {
      success: true,
      message: `${account.name} started successfully.`,
      pid,
      status: 'RUNNING',
    };
  } catch (err) {
    record.status = 'ERROR';
    record.lastError = err.message;
    appendLog(account.id, `[System Error] Spawn failure: ${err.message}`, 'stderr');
    throw err;
  }
}

/**
 * Safely kill an individual account's child process tree using Windows taskkill & PowerShell
 */
export function stopScript(accountId) {
  const account = getAccountById(accountId);
  if (!account) {
    throw new Error(`Account "${accountId}" not found.`);
  }

  const record = ensureAccountInStore(account.id);
  const pid = record.pid;

  appendLog(account.id, `[System] Initiating process termination (PID: ${pid || 'Scanning'})...`, 'system');

  if (pid) {
    // Windows taskkill /pid <PID> /f /t ensures the process and all child Chromium tabs are killed
    try {
      spawnSync('taskkill', ['/pid', String(pid), '/f', '/t'], { windowsHide: true });
      appendLog(account.id, `[System] Process tree (PID: ${pid}) taskkilled.`, 'system');
    } catch (e) {
      appendLog(account.id, `[System] Taskkill notice: ${e.message}`, 'system');
    }
  }

  // Fallback direct kill if child object exists
  if (record.child) {
    try {
      record.child.kill('SIGKILL');
    } catch (_) {}
  }

  // Targeted PowerShell sweep for any detached node/chromium processes running this script or session
  try {
    const sessionDirName = path.basename(account.sessionDir);
    const script = `
    $ErrorActionPreference = 'SilentlyContinue'
    $processes = Get-CimInstance Win32_Process | Where-Object { 
        $_.CommandLine -like '*${account.scriptName}*' -or 
        $_.CommandLine -like '*${sessionDirName}*'
    }
    foreach ($p in $processes) {
        try {
            Stop-Process -Id $p.ProcessId -Force
        } catch {}
    }
    `;
    const b64 = Buffer.from(script, 'utf16le').toString('base64');
    spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', b64], {
      windowsHide: true,
      timeout: 5000,
    });
  } catch (_) {}

  record.status = 'IDLE';
  record.child = null;
  record.pid = null;

  // Restore any interrupted videos from in_progress back to queue folder
  restoreInProgressVideos(account.folder);

  // Clean locks after termination
  cleanProfileLocks(account.sessionDir);

  appendLog(account.id, `[System] Script stopped and session locks released.`, 'system');

  return {
    success: true,
    message: `${account.name} stopped.`,
    status: 'IDLE',
  };
}

/**
 * Start automation scripts concurrently (all accounts or selected subset)
 */
export function startAllScripts(options = {}) {
  const results = {};
  const allAccounts = getAccounts();

  // If specific accountIds are provided, only start the selected accounts
  const selectedIds = Array.isArray(options.accountIds) && options.accountIds.length > 0
    ? options.accountIds.map((id) => String(id).toLowerCase().trim())
    : null;

  const targetAccounts = selectedIds
    ? allAccounts.filter((acc) => selectedIds.includes(acc.id.toLowerCase()))
    : allAccounts;

  for (let i = 0; i < targetAccounts.length; i++) {
    const acc = targetAccounts[i];
    try {
      results[acc.id] = startScript(acc.id, { ...options, accountIndex: i });
    } catch (err) {
      results[acc.id] = { success: false, error: err.message, status: 'ERROR' };
    }
  }
  return results;
}

/**
 * Stop all active automation scripts (Emergency Stop All)
 */
export function stopAllScripts() {
  const results = {};
  const allAccounts = getAccounts();

  for (const acc of allAccounts) {
    try {
      results[acc.id] = stopScript(acc.id);
    } catch (err) {
      results[acc.id] = { success: false, error: err.message };
    }
  }

  // Universal emergency sweep for all accounts and Chromium instances
  try {
    const script = `
    $ErrorActionPreference = 'SilentlyContinue'
    $processes = Get-CimInstance Win32_Process | Where-Object { 
        $_.CommandLine -like '*autopost_*.js*' -or 
        $_.CommandLine -like '*_session*'
    }
    foreach ($p in $processes) {
        try {
            Stop-Process -Id $p.ProcessId -Force
        } catch {}
    }
    `;
    const b64 = Buffer.from(script, 'utf16le').toString('base64');
    spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', b64], {
      windowsHide: true,
      timeout: 10000,
    });
  } catch (e) {
    console.error('[ProcessManager] Error running emergency kill sweep:', e.message);
  }

  // Defensive lock cleanup & restore for all accounts
  for (const acc of allAccounts) {
    cleanProfileLocks(acc.sessionDir);
    restoreInProgressVideos(acc.folder);
    const record = store.accounts[acc.id];
    if (record) {
      record.status = 'IDLE';
      record.child = null;
      record.pid = null;
      appendLog(acc.id, `=== [System] Emergency Stop All executed successfully ===`, 'system');
    }
  }

  return results;
}

/**
 * Get comprehensive status for all accounts (default and custom)
 */
export function getAllStatus() {
  const accountsStatus = {};
  let runningCount = 0;
  const allAccounts = getAccounts();

  for (const acc of allAccounts) {
    const record = ensureAccountInStore(acc.id);

    // Verify liveness if marked RUNNING
    let effectiveStatus = record.status;
    if (effectiveStatus === 'RUNNING' && record.pid && !isPidAlive(record.pid)) {
      effectiveStatus = 'IDLE';
      record.status = 'IDLE';
      record.pid = null;
      record.child = null;
    }

    if (effectiveStatus === 'RUNNING') {
      runningCount++;
    }

    const uptimeSeconds = record.startTime && effectiveStatus === 'RUNNING'
      ? Math.floor((Date.now() - record.startTime) / 1000)
      : 0;

    const folderStats = getFolderVideoStats(acc.folder);

    accountsStatus[acc.id] = {
      id: acc.id,
      name: acc.name,
      category: acc.category,
      scriptName: acc.scriptName,
      scriptPath: acc.scriptPath,
      folder: acc.folder,
      color: acc.color,
      badgeBg: acc.badgeBg,
      description: acc.description,
      hashtags: acc.hashtags || '',
      isCustom: !!acc.isCustom,
      isBuiltIn: !acc.isCustom,
      status: effectiveStatus,
      pid: record.pid,
      tabs: record.tabs || 2,
      startTime: record.startTime,
      uptimeSeconds,
      logCount: record.logs.length,
      lastError: record.lastError,
      exitCode: record.exitCode,
      folderStats,
    };
  }

  return {
    accounts: accountsStatus,
    runningCount,
    totalCount: allAccounts.length,
    timestamp: Date.now(),
  };
}

/**
 * Get in-memory logs for a specific account (or all accounts)
 */
export function getLogs(accountId, limit = 200) {
  if (accountId) {
    const record = store.accounts[accountId];
    if (!record) return [];
    return record.logs.slice(-limit);
  }

  // Combine logs from all accounts and sort by timestamp
  const allLogs = [];
  for (const acc of ACCOUNTS) {
    const record = store.accounts[acc.id];
    if (record && record.logs) {
      allLogs.push(...record.logs);
    }
  }
  return allLogs.sort((a, b) => a.id.localeCompare(b.id)).slice(-limit);
}

/**
 * Register an SSE log listener function
 */
export function subscribeToLogs(listener) {
  store.listeners.add(listener);
  return () => {
    store.listeners.delete(listener);
  };
}

// Graceful cleanup on server shutdown
if (!globalThis._automationShutdownRegistered) {
  globalThis._automationShutdownRegistered = true;

  const handleShutdown = () => {
    console.log('[ProcessManager] Server shutting down, terminating child processes...');
    stopAllScripts();
  };

  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);
  process.on('beforeExit', handleShutdown);
}
