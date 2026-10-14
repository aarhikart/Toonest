/**
 * ToolNest - Ultra Fast Instagram Auto Poster Console Script Generator
 *
 * Generates an in-page DevTools console script for users running directly on instagram.com
 */

export interface FastPosterConsoleOptions {
  turboMode?: boolean;
  delaySec?: number;
  maxLimit?: number;
  caption?: string;
}

export function generateFastPosterConsoleScript(options: FastPosterConsoleOptions = {}): string {
  const {
    turboMode = true,
    delaySec = 1.0,
    maxLimit = 10000000,
    caption = '',
  } = options;

  return `/**
 * ============================================================================
 * ToolNest - Ultra Fast Instagram In-Browser Auto Poster (HUD Edition)
 * ============================================================================
 * HOW TO USE:
 * 1. Open https://www.instagram.com/ in your browser (log in).
 * 2. Press F12 -> Console tab.
 * 3. Paste this code and press Enter.
 * 4. Drop or select images when prompted, and the script loops automatically!
 * ============================================================================
 */

(async function ultraFastInstagramPoster() {
  'use strict';

  if (!window.location.hostname.includes('instagram.com')) {
    alert('⚠️ Please run this script on https://www.instagram.com/');
    return;
  }

  const TURBO_MODE = ${turboMode};
  const DELAY_MS = ${Math.max(500, delaySec * 1000)};
  const MAX_LIMIT = ${maxLimit};
  const CAPTION = ${JSON.stringify(caption)};

  let totalPosted = 0;
  let isRunning = true;
  const startTime = Date.now();

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Create floating HUD
  let hud = document.getElementById('toolnest-fastposter-hud');
  if (hud) hud.remove();

  hud = document.createElement('div');
  hud.id = 'toolnest-fastposter-hud';
  hud.innerHTML = \`
    <div style="position: fixed; bottom: 20px; right: 20px; z-index: 999999; background: #0f172a; color: #f8fafc; border: 1px solid #38bdf8; border-radius: 12px; padding: 16px 20px; font-family: sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.5); min-width: 280px;">
      <div style="font-weight: 700; font-size: 14px; color: #38bdf8; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span>🚀 Fast Auto Poster</span>
        <span id="hud-status" style="font-size: 11px; padding: 2px 8px; border-radius: 999px; background: #10b981; color: #fff;">RUNNING</span>
      </div>
      <div style="font-size: 24px; font-weight: 800; color: #fff; margin: 4px 0;" id="hud-count">0 Posts</div>
      <div style="font-size: 12px; color: #94a3b8; display: flex; justify-content: space-between; margin-top: 6px;">
        <span id="hud-speed">Speed: ~0/min</span>
        <span id="hud-elapsed">Time: 0s</span>
      </div>
      <div style="margin-top: 12px; display: flex; gap: 8px;">
        <button id="hud-stop-btn" style="flex: 1; background: #ef4444; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">Stop</button>
      </div>
    </div>
  \`;
  document.body.appendChild(hud);

  document.getElementById('hud-stop-btn').onclick = () => {
    isRunning = false;
    document.getElementById('hud-status').innerText = 'STOPPED';
    document.getElementById('hud-status').style.background = '#64748b';
  };

  function updateHUD() {
    const elapsedSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const speed = Math.round((totalPosted / elapsedSec) * 60);
    const countEl = document.getElementById('hud-count');
    const speedEl = document.getElementById('hud-speed');
    const timeEl = document.getElementById('hud-elapsed');
    if (countEl) countEl.innerText = totalPosted + ' Posts';
    if (speedEl) speedEl.innerText = 'Speed: ~' + speed + '/min';
    if (timeEl) timeEl.innerText = 'Time: ' + elapsedSec + 's';
  }

  const nextBtnSelector = 'div[role="dialog"] div[role="button"]:has-text("Next"), div[role="dialog"] button:has-text("Next"), div[role="button"]:has-text("Next"), button:has-text("Next")';
  const shareBtnSelector = 'div[role="dialog"] div[role="button"]:has-text("Share"), div[role="dialog"] button:has-text("Share"), div[role="button"]:has-text("Share"), button:has-text("Share")';
  const createBtnSelector = 'svg[aria-label="New post"], svg[aria-label="Create"], div[role="button"]:has(svg[aria-label="New post"]), div[role="button"]:has(svg[aria-label="Create"])';

  console.log('%c🚀 [ToolNest Fast Poster] Console Runner Initialized!', 'color: #38bdf8; font-weight: bold; font-size: 14px;');
  console.log('%cTip: For automatic file picking from C:\\\\Users\\\\HP\\\\Documents\\\\uploaded\\\\10M-images, use the ToolNest Playwright Engine directly on the dashboard!', 'color: #f59e0b;');

  while (isRunning) {
    if (MAX_LIMIT > 0 && totalPosted >= MAX_LIMIT) break;

    // Check if Create modal is open
    let modal = document.querySelector('div[aria-label="Create new post"], div[role="dialog"]');
    if (!modal) {
      const createIcon = document.querySelector('svg[aria-label="New post"], svg[aria-label="Create"]');
      if (createIcon) {
        const btn = createIcon.closest('div[role="button"], a') || createIcon;
        btn.click();
        await sleep(800);
      }
    }

    // Check for Next buttons
    const nextBtns = Array.from(document.querySelectorAll('div[role="button"], button')).filter(b => (b.innerText || '').trim() === 'Next');
    if (nextBtns.length > 0) {
      nextBtns[0].click();
      await sleep(600);
      continue;
    }

    // Check for Share button
    const shareBtns = Array.from(document.querySelectorAll('div[role="button"], button')).filter(b => (b.innerText || '').trim() === 'Share');
    if (shareBtns.length > 0) {
      shareBtns[0].click();
      totalPosted++;
      updateHUD();
      console.log('🚀 Clicked Share! Total: ' + totalPosted);

      if (TURBO_MODE) {
        await sleep(1200);
        const closeBtn = document.querySelector('svg[aria-label="Close"], [aria-label="Close"]');
        if (closeBtn) {
          (closeBtn.closest('div[role="button"], button') || closeBtn).click();
        }
      } else {
        await sleep(4000);
      }
    }

    await sleep(DELAY_MS);
  }

  console.log('🏁 Auto Poster finished or stopped. Total posts: ' + totalPosted);
})();
`;
}
