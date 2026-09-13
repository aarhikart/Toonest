/**
 * ToolNest Instagram DM Browser Console Auto-Sender Script Generator
 *
 * Generates vanilla JavaScript that the user pastes into Chrome/Firefox/Edge DevTools Console
 * on https://www.instagram.com/ to automatically message profiles sequentially.
 */

export interface ConsoleScriptOptions {
  minDelaySec?: number;
  maxDelaySec?: number;
  autoSend?: boolean;
  mode?: 'profile' | 'direct';
}

export function generateConsoleScript(
  usernames: string[],
  message: string,
  options: ConsoleScriptOptions = {}
): string {
  const {
    minDelaySec = 2,
    maxDelaySec = 3,
    autoSend = true,
  } = options;

  // Clean and sanitize usernames: remove @, strip any trailing text like "free movie"
  const cleanList = usernames
    .map((u) => u.trim().split(/\s+/)[0].replace(/^@+/, '').replace(/[^a-zA-Z0-9._]/g, ''))
    .filter((u) => u.length > 0);

  const serializedUsers = JSON.stringify(cleanList, null, 2);
  const serializedMessage = JSON.stringify(message);

  return `/**
 * ============================================================================
 * ToolNest - Instagram DM Browser Console Fast Auto-Sender (v4.0 Ultra-Fast)
 * ============================================================================
 * - 2-Second Cooldown Delay between users
 * - Immediate Skip if account has no "Message" button (private/restricted)
 * - Fast 150ms element polling & verified delivery
 * ============================================================================
 * HOW TO RUN:
 * 1. Open https://www.instagram.com/ in your browser (make sure you are logged in).
 * 2. Press F12 (or Right Click -> Inspect -> click the "Console" tab).
 * 3. Paste this entire script into the console and press Enter.
 * ============================================================================
 */

(async function () {
  'use strict';

  // 1. Target Usernames & Message
  const RAW_USERNAMES = ${serializedUsers};
  const MESSAGE = ${serializedMessage};
  const MIN_DELAY_SEC = ${minDelaySec};
  const MAX_DELAY_SEC = ${maxDelaySec};
  const AUTO_SEND = ${autoSend};

  if (!window.location.hostname.includes('instagram.com')) {
    alert('⚠️ Please run this script on https://www.instagram.com/');
    return;
  }

  // Sanitize usernames
  const USERNAMES = RAW_USERNAMES
    .map((u) => String(u).trim().split(/\\s+/)[0].replace(/^@+/, '').replace(/[^a-zA-Z0-9._]/g, ''))
    .filter((u) => u.length > 0);

  if (USERNAMES.length === 0) {
    alert('⚠️ No valid usernames found in the list.');
    return;
  }

  // State
  let sentCount = 0;
  let skippedCount = 0;
  let isPaused = false;
  let isStopped = false;
  let workerWindow = null;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const getRandomDelay = () => Math.floor(Math.random() * (MAX_DELAY_SEC - MIN_DELAY_SEC + 1) + MIN_DELAY_SEC) * 1000;

  // Build On-Screen Floating Progress HUD
  const existingHud = document.getElementById('toolnest-sender-hud');
  if (existingHud) existingHud.remove();

  const hud = document.createElement('div');
  hud.id = 'toolnest-sender-hud';
  hud.style.cssText = \`
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 99999999;
    width: 360px;
    background: #0f172a;
    color: #f8fafc;
    border: 2px solid #5722AF;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 13px;
    line-height: 1.5;
  \`;

  hud.innerHTML = \`
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; border-bottom:1px solid #334155; padding-bottom:10px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="background:#5722AF; color:#fff; width:26px; height:26px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-weight:bold;">⚡</span>
        <strong style="font-size:14px; font-weight:bold; color:#fff;">ToolNest Fast Auto-Sender</strong>
      </div>
      <span id="tn-hud-counter" style="font-size:12px; font-weight:bold; color:#a78bfa;">0 / \${USERNAMES.length}</span>
    </div>

    <div style="margin-bottom:10px;">
      <div style="font-size:11px; color:#94a3b8; text-transform:uppercase; font-weight:bold;">Current Target</div>
      <div id="tn-hud-user" style="font-size:16px; font-weight:bold; color:#38bdf8; margin-top:2px;">Starting...</div>
    </div>

    <div style="margin-bottom:14px;">
      <div style="font-size:11px; color:#94a3b8; text-transform:uppercase; font-weight:bold;">Live Status</div>
      <div id="tn-hud-status" style="font-size:12px; color:#cbd5e1; margin-top:2px;">Starting...</div>
    </div>

    <div style="background:#334155; border-radius:999px; height:8px; overflow:hidden; margin-bottom:16px;">
      <div id="tn-hud-bar" style="background:#5722AF; width:0%; height:100%; transition:width 0.3s ease;"></div>
    </div>

    <div style="display:flex; gap:8px;">
      <button id="tn-btn-pause" style="flex:1; padding:8px; border-radius:10px; border:none; background:#334155; color:#fff; font-weight:bold; cursor:pointer;">Pause</button>
      <button id="tn-btn-stop" style="flex:1; padding:8px; border-radius:10px; border:none; background:#e11d48; color:#fff; font-weight:bold; cursor:pointer;">Stop</button>
    </div>
  \`;
  document.body.appendChild(hud);

  const hudUser = document.getElementById('tn-hud-user');
  const hudStatus = document.getElementById('tn-hud-status');
  const hudCounter = document.getElementById('tn-hud-counter');
  const hudBar = document.getElementById('tn-hud-bar');
  const btnPause = document.getElementById('tn-btn-pause');
  const btnStop = document.getElementById('tn-btn-stop');

  btnPause.onclick = () => {
    isPaused = !isPaused;
    btnPause.innerText = isPaused ? 'Resume' : 'Pause';
    btnPause.style.background = isPaused ? '#10b981' : '#334155';
    updateStatus(isPaused ? '⏸️ Paused.' : 'Resuming...');
  };

  btnStop.onclick = () => {
    isStopped = true;
    updateStatus('🛑 Stopped by user.');
    if (workerWindow && !workerWindow.closed) workerWindow.close();
  };

  function updateStatus(text) {
    if (hudStatus) hudStatus.innerText = text;
    console.log('[ToolNest Auto-Sender]', text);
  }

  function updateProgress() {
    const totalProcessed = sentCount + skippedCount;
    const pct = Math.round((totalProcessed / USERNAMES.length) * 100);
    if (hudCounter) hudCounter.innerText = \`\${sentCount} sent (\${skippedCount} skipped) / \${USERNAMES.length}\`;
    if (hudBar) hudBar.style.width = \`\${pct}%\`;
  }

  // Fast polling element waiter (checks every 150ms)
  function waitForWorkerElement(workerWin, selectorFn, timeoutMs = 3000, intervalMs = 150) {
    return new Promise((resolve) => {
      const start = Date.now();
      const interval = setInterval(() => {
        try {
          if (!workerWin || workerWin.closed) {
            clearInterval(interval);
            resolve(null);
            return;
          }
          const doc = workerWin.document;
          if (doc && doc.body) {
            const found = selectorFn(doc);
            if (found) {
              clearInterval(interval);
              resolve(found);
              return;
            }
          }
        } catch (err) {}

        if (Date.now() - start > timeoutMs) {
          clearInterval(interval);
          resolve(null);
        }
      }, intervalMs);
    });
  }

  // Insert text into Meta Lexical editor and force React reconciliation
  function insertIntoLexical(win, editor, text) {
    win.focus();
    editor.focus();

    try {
      const selection = win.getSelection();
      const range = win.document.createRange();
      range.selectNodeContents(editor);
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (e) {}

    win.document.execCommand('insertText', false, text);

    editor.dispatchEvent(new win.InputEvent('beforeinput', {
      inputType: 'insertText',
      data: text,
      bubbles: true,
      cancelable: true,
      view: win
    }));

    editor.dispatchEvent(new win.InputEvent('input', {
      inputType: 'insertText',
      data: text,
      bubbles: true,
      cancelable: false,
      view: win
    }));

    editor.dispatchEvent(new Event('input', { bubbles: true }));
    editor.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Full pointer & mouse click simulator for React buttons
  function fullClick(win, element) {
    if (!element) return;
    try {
      element.focus();
      const opts = { bubbles: true, cancelable: true, view: win };
      element.dispatchEvent(new win.PointerEvent('pointerdown', opts));
      element.dispatchEvent(new win.MouseEvent('mousedown', opts));
      element.dispatchEvent(new win.PointerEvent('pointerup', opts));
      element.dispatchEvent(new win.MouseEvent('mouseup', opts));
      element.dispatchEvent(new win.MouseEvent('click', opts));
      if (typeof element.click === 'function') element.click();
    } catch (err) {}
  }

  // Comprehensive Send button finder
  function findSendAction(doc, editor) {
    if (editor) {
      const parent = editor.closest('form, div[style*="--x-height"], div[style*="height"], section, div[role="main"]') || editor.parentElement;
      if (parent) {
        const localBtns = Array.from(parent.querySelectorAll('div[role="button"], button, [aria-label]'));
        for (const el of localBtns) {
          const txt = (el.innerText || el.textContent || '').trim().toLowerCase();
          const aria = (el.getAttribute('aria-label') || '').trim().toLowerCase();
          if (txt === 'send' || aria === 'send' || txt === 'send message') {
            return el;
          }
        }
      }
    }

    const allButtons = Array.from(doc.querySelectorAll('div[role="button"], button'));
    for (const b of allButtons) {
      const txt = (b.innerText || b.textContent || '').trim().toLowerCase();
      if (txt === 'send' || txt === 'send message') return b;
    }

    const ariaEls = Array.from(doc.querySelectorAll('[aria-label]'));
    for (const el of ariaEls) {
      const aria = (el.getAttribute('aria-label') || '').trim().toLowerCase();
      if (aria === 'send' || aria === 'send message') return el;
    }

    return null;
  }

  // Dispatch Enter key sequence to Lexical editor
  function pressEnterKey(win, editor) {
    editor.focus();
    const eventInit = {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      charCode: 13,
      bubbles: true,
      cancelable: true,
      view: win
    };
    editor.dispatchEvent(new win.KeyboardEvent('keydown', eventInit));
    editor.dispatchEvent(new win.KeyboardEvent('keypress', eventInit));
    editor.dispatchEvent(new win.InputEvent('beforeinput', {
      inputType: 'insertParagraph',
      bubbles: true,
      cancelable: true,
      view: win
    }));
    editor.dispatchEvent(new win.KeyboardEvent('keyup', eventInit));
  }

  function isEditorEmpty(editor) {
    if (!editor) return true;
    const txt = (editor.textContent || editor.innerText || '').trim();
    return txt.length === 0;
  }

  function findMessageButton(doc) {
    const elements = Array.from(
      doc.querySelectorAll('header div[role="button"], header button, div[role="button"], button')
    );
    return elements.find((el) => {
      const txt = (el.innerText || el.textContent || '').trim().toLowerCase();
      return txt === 'message';
    });
  }

  function findLexicalEditor(doc) {
    return doc.querySelector(
      'div[role="textbox"][data-lexical-editor="true"], div[aria-label="Message"][contenteditable="true"], div[contenteditable="true"][role="textbox"]'
    );
  }

  updateStatus('Fast Engine Ready. Starting...');
  await sleep(600);

  // Main Loop
  for (let i = 0; i < USERNAMES.length; i++) {
    if (isStopped) break;
    while (isPaused) { await sleep(500); if (isStopped) break; }
    if (isStopped) break;

    const username = USERNAMES[i];
    if (!username) continue;

    if (hudUser) hudUser.innerText = \`@\${username}\`;
    updateStatus(\`Opening @\${username}...\`);

    const targetUrl = \`https://www.instagram.com/\${username}/\`;
    workerWindow = window.open(targetUrl, 'tn_worker', 'width=980,height=820,left=100,top=100');

    if (!workerWindow) {
      alert('⚠️ Pop-up blocked! Please click the pop-up icon in your address bar, select "Always allow pop-ups for instagram.com", and run again.');
      hud.remove();
      return;
    }

    // 1. FAST DETECTION: Check for "Message" button (max 3 seconds)
    updateStatus('Looking for "Message" button...');
    const messageBtn = await waitForWorkerElement(workerWindow, findMessageButton, 3200, 150);

    if (messageBtn) {
      updateStatus('Found "Message" button! Clicking...');
      fullClick(workerWindow, messageBtn);
    } else {
      // Check if chat box is already open
      const alreadyOpenEditor = findLexicalEditor(workerWindow.document);
      if (!alreadyOpenEditor) {
        // NO MESSAGE BUTTON -> IMMEDIATELY SKIP! No waiting!
        updateStatus(\`⚡ No "Message" button for @\${username}. Skipping immediately!\`);
        skippedCount++;
        updateProgress();
        await sleep(600);
        continue;
      }
    }

    // 2. FAST CHAT BOX DETECTION (max 3.5 seconds)
    updateStatus('Finding message box...');
    const editor = await waitForWorkerElement(workerWindow, findLexicalEditor, 3500, 150);

    if (!editor) {
      updateStatus(\`⚡ Could not open chat for @\${username}. Skipping immediately!\`);
      skippedCount++;
      updateProgress();
      await sleep(600);
      continue;
    }

    // 3. Fast Type Message
    updateStatus('Typing message...');
    insertIntoLexical(workerWindow, editor, MESSAGE);
    await sleep(400);

    // 4. Fast Send with Active Verification
    if (AUTO_SEND) {
      updateStatus('Sending message...');
      let confirmedSent = false;

      // Try sending and confirm text box empties
      for (let attempt = 1; attempt <= 3; attempt++) {
        const sendBtn = findSendAction(workerWindow.document, editor);

        if (sendBtn) {
          fullClick(workerWindow, sendBtn);
        } else {
          pressEnterKey(workerWindow, editor);
        }

        await sleep(700);

        if (isEditorEmpty(editor)) {
          confirmedSent = true;
          break;
        }
      }

      if (confirmedSent) {
        sentCount++;
        updateProgress();
        updateStatus(\`✓ Sent to @\${username}!\`);
      } else {
        // Try enter one more time
        pressEnterKey(workerWindow, editor);
        await sleep(800);
        if (isEditorEmpty(editor)) {
          sentCount++;
          updateProgress();
          updateStatus(\`✓ Sent to @\${username}!\`);
        } else {
          skippedCount++;
          updateProgress();
          updateStatus(\`⚠️ Could not send to @\${username} (skipped).\`);
        }
      }

      // Fast network delivery grace (1.5 seconds)
      await sleep(1500);
    }

    // 5. Fast 2-Second Cooldown Delay before next user
    if (i < USERNAMES.length - 1 && !isStopped) {
      const delayMs = getRandomDelay();
      const delaySec = Math.max(1, Math.round(delayMs / 1000));
      for (let sec = delaySec; sec > 0; sec--) {
        if (isStopped) break;
        while (isPaused) { await sleep(500); if (isStopped) break; }
        updateStatus(\`Next profile in \${sec}s...\`);
        await sleep(1000);
      }
    }
  }

  // Finished
  if (!isStopped) {
    updateStatus(\`🎉 Finished! \${sentCount} sent, \${skippedCount} skipped.\`);
    if (hudUser) hudUser.innerText = 'Completed!';
    await sleep(2500);
    if (workerWindow && !workerWindow.closed) workerWindow.close();
  }
})();
`;
}
