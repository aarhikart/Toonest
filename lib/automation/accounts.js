import fs from 'fs';
import path from 'path';

export const BASE_SCRIPTS_DIR = 'C:\\Users\\HP';
export const ACCOUNTS_FILE = path.join(BASE_SCRIPTS_DIR, 'autopost_accounts.json');

export const DEFAULT_ACCOUNTS = [
  {
    id: 'cars',
    name: 'Cars Account',
    category: 'Automotive & Supercars',
    scriptName: 'autopost_reels.js',
    scriptPath: path.join(BASE_SCRIPTS_DIR, 'autopost_reels.js'),
    folder: 'C:\\Users\\HP\\Documents\\uploaded\\completed',
    sessionDir: path.join(BASE_SCRIPTS_DIR, 'ig_reels_session'),
    color: '#3b82f6', // blue
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    description: 'Instagram Car reels autoposting & hashtag optimization',
    isBuiltIn: true,
  },
  {
    id: 'gym',
    name: 'Gym Account',
    category: 'Fitness & Bodybuilding',
    scriptName: 'autopost_gym.js',
    scriptPath: path.join(BASE_SCRIPTS_DIR, 'autopost_gym.js'),
    folder: 'C:\\Users\\HP\\Documents\\uploaded\\gymcompleted',
    sessionDir: path.join(BASE_SCRIPTS_DIR, 'ig_gym_session'),
    color: '#10b981', // emerald
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    description: 'Gym workouts & fitness reels autoposting to Instagram',
    isBuiltIn: true,
  },
  {
    id: 'food',
    name: 'Food Account',
    category: 'Cooking & Street Food',
    scriptName: 'autopost_food.js',
    scriptPath: path.join(BASE_SCRIPTS_DIR, 'autopost_food.js'),
    folder: 'C:\\Users\\HP\\Documents\\uploaded\\foodvideos',
    sessionDir: path.join(BASE_SCRIPTS_DIR, 'ig_foodvideos_session'),
    color: '#f59e0b', // amber
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    description: 'Food & recipe reels autoposting with auto-captioning',
    isBuiltIn: true,
  },
  {
    id: 'pipe',
    name: 'Pipes Account',
    category: 'Industrial & Engineering',
    scriptName: 'autopost_pipe.js',
    scriptPath: path.join(BASE_SCRIPTS_DIR, 'autopost_pipe.js'),
    folder: 'C:\\Users\\HP\\Documents\\uploaded\\pipevideos',
    sessionDir: path.join(BASE_SCRIPTS_DIR, 'ig_pipevideos_session'),
    color: '#8b5cf6', // purple
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    description: 'Pipe, plumbing & engineering video clips autoposting',
    isBuiltIn: true,
  },
  {
    id: 'moviemela',
    name: 'MovieMela Account',
    category: 'Cinema & Entertainment',
    scriptName: 'autopost_moviemela.js',
    scriptPath: path.join(BASE_SCRIPTS_DIR, 'autopost_moviemela.js'),
    folder: 'C:\\Users\\HP\\Documents\\uploaded\\moviemela',
    sessionDir: path.join(BASE_SCRIPTS_DIR, 'ig_moviemela_session'),
    color: '#ec4899', // pink
    badgeBg: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    description: 'Movie scenes, dialogue & viral cinema reel clips',
    isBuiltIn: true,
  },
];

/**
 * Load custom user-created accounts from persistent JSON file
 */
export function getCustomAccounts() {
  try {
    if (!fs.existsSync(ACCOUNTS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(ACCOUNTS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[Accounts] Error loading custom accounts:', err.message);
    return [];
  }
}

/**
 * Persist custom accounts to JSON file
 */
export function saveCustomAccounts(accounts) {
  try {
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[Accounts] Error saving custom accounts:', err.message);
    throw err;
  }
}

/**
 * Get all combined accounts (default built-in accounts + custom user accounts)
 */
export function getAccounts() {
  const custom = getCustomAccounts();
  return [...DEFAULT_ACCOUNTS, ...custom];
}

/**
 * Dynamic Proxy export for ACCOUNTS so code using ACCOUNTS array methods works seamlessly
 */
export const ACCOUNTS = new Proxy([], {
  get(target, prop) {
    const list = getAccounts();
    if (prop === 'length') return list.length;
    if (prop === Symbol.iterator) return list[Symbol.iterator].bind(list);
    if (typeof list[prop] === 'function') return list[prop].bind(list);
    if (!isNaN(prop)) return list[prop];
    return list[prop];
  }
});

/**
 * Get account definition by id or scriptName
 */
export function getAccountById(idOrName) {
  if (!idOrName) return null;
  const query = String(idOrName).toLowerCase().trim();
  const allAccounts = getAccounts();
  return (
    allAccounts.find(
      (acc) =>
        acc.id.toLowerCase() === query ||
        acc.scriptName?.toLowerCase() === query ||
        acc.name?.toLowerCase() === query
    ) || null
  );
}

/**
 * Check queue count of .mp4 videos waiting in the target folder
 */
export function getFolderVideoStats(folderPath) {
  try {
    if (!folderPath || !fs.existsSync(folderPath)) {
      return { exists: false, pendingCount: 0, finishedCount: 0, inProgressCount: 0 };
    }

    const entries = fs.readdirSync(folderPath, { withFileTypes: true });
    const pendingVideos = entries.filter(
      (e) => e.isFile() && path.extname(e.name).toLowerCase() === '.mp4'
    ).length;

    let finishedCount = 0;
    let inProgressCount = 0;

    const finishedDir = path.join(folderPath, 'finished_reels');
    if (fs.existsSync(finishedDir)) {
      finishedCount = fs.readdirSync(finishedDir, { withFileTypes: true }).filter(
        (e) => e.isFile() && path.extname(e.name).toLowerCase() === '.mp4'
      ).length;
    }

    const inProgressDir = path.join(folderPath, 'in_progress');
    if (fs.existsSync(inProgressDir)) {
      inProgressCount = fs.readdirSync(inProgressDir, { withFileTypes: true }).filter(
        (e) => e.isFile() && path.extname(e.name).toLowerCase() === '.mp4'
      ).length;
    }

    return {
      exists: true,
      pendingCount: pendingVideos,
      finishedCount,
      inProgressCount,
    };
  } catch (err) {
    return { exists: false, pendingCount: 0, finishedCount: 0, inProgressCount: 0, error: err.message };
  }
}

/**
 * Generate code for a standalone Node.js Playwright runner script for any custom account
 */
export function generateAccountScriptTemplate(account) {
  const safeSessionDir = 'ig_' + account.id + '_session';
  const hashtags = account.hashtags || '#reels #viral #explore #trending #instagram';

  const templatePath = path.join(process.cwd(), 'lib', 'automation', 'runner_template.cjs');
  let template = '';
  if (fs.existsSync(templatePath)) {
    template = fs.readFileSync(templatePath, 'utf8');
  } else {
    const fallbackPath = path.resolve(__dirname, 'runner_template.cjs');
    if (fs.existsSync(fallbackPath)) {
      template = fs.readFileSync(fallbackPath, 'utf8');
    }
  }

  if (!template) {
    throw new Error('Automation runner template file (runner_template.cjs) could not be loaded.');
  }

  return template
    .replace('__VIDEOS_FOLDER__', JSON.stringify(account.folder))
    .replace('__HASHTAGS__', JSON.stringify(hashtags))
    .replace('__SESSION_DIR__', JSON.stringify(safeSessionDir))
    .replaceAll('__ACCOUNT_NAME_UPPER__', (account.name || 'ACCOUNT').toUpperCase())
    .replaceAll('__ACCOUNT_NAME__', account.name || 'Account');
}

/**
 * Add a new custom Instagram automation account
 */
export function addCustomAccount({ name, category, folder, hashtags, color }) {
  if (!name || !name.trim()) {
    throw new Error('Account name is required.');
  }
  if (!folder || !folder.trim()) {
    throw new Error('Local video folder path is required.');
  }

  const cleanName = name.trim();
  const cleanFolder = path.normalize(folder.trim());

  // Generate unique ID based on name
  let id = cleanName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!id) id = `account_${Date.now()}`;

  const allAccounts = getAccounts();
  if (allAccounts.some((a) => a.id === id)) {
    id = `${id}_${Date.now().toString().slice(-4)}`;
  }

  // Ensure directories exist
  try {
    if (!fs.existsSync(cleanFolder)) {
      fs.mkdirSync(cleanFolder, { recursive: true });
    }
    const finishedDir = path.join(cleanFolder, 'finished_reels');
    const inProgressDir = path.join(cleanFolder, 'in_progress');
    if (!fs.existsSync(finishedDir)) fs.mkdirSync(finishedDir, { recursive: true });
    if (!fs.existsSync(inProgressDir)) fs.mkdirSync(inProgressDir, { recursive: true });
  } catch (err) {
    throw new Error(`Failed to initialize video directory "${cleanFolder}": ${err.message}`);
  }

  const scriptName = `autopost_${id}.js`;
  const scriptPath = path.join(/*turbopackIgnore: true*/ BASE_SCRIPTS_DIR, scriptName);
  const sessionDir = path.join(/*turbopackIgnore: true*/ BASE_SCRIPTS_DIR, 'ig_' + id + '_session');

  // Ensure session directory exists
  try {
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }
  } catch (_) {}

  // Color & Badge style
  const chosenColor = color || '#06b6d4'; // default cyan
  const badgeBg = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';

  const newAccount = {
    id,
    name: cleanName,
    category: category?.trim() || 'Custom Automation',
    scriptName,
    scriptPath,
    folder: cleanFolder,
    sessionDir,
    color: chosenColor,
    badgeBg,
    description: `Instagram ${cleanName} reels autoposting from ${cleanFolder}`,
    hashtags: hashtags?.trim() || '#reels #viral #explore #trending',
    isCustom: true,
    createdAt: Date.now(),
  };

  // Generate and save the Playwright script
  const scriptCode = generateAccountScriptTemplate(newAccount);
  try {
    fs.writeFileSync(scriptPath, scriptCode, 'utf8');
  } catch (err) {
    throw new Error(`Failed to write Playwright script "${scriptPath}": ${err.message}`);
  }

  // Save to custom accounts persistent JSON
  const existingCustom = getCustomAccounts();
  existingCustom.push(newAccount);
  saveCustomAccounts(existingCustom);

  return newAccount;
}

/**
 * Delete a custom account
 */
export function deleteCustomAccount(accountId) {
  if (!accountId) throw new Error('Account ID is required.');
  const id = accountId.toLowerCase().trim();

  // Protect built-in accounts
  if (DEFAULT_ACCOUNTS.some((a) => a.id === id)) {
    throw new Error('Default core accounts cannot be deleted.');
  }

  const existingCustom = getCustomAccounts();
  const filtered = existingCustom.filter((a) => a.id !== id);

  if (filtered.length === existingCustom.length) {
    throw new Error(`Account "${accountId}" was not found.`);
  }

  saveCustomAccounts(filtered);
  return { success: true, message: `Account "${accountId}" removed.` };
}

