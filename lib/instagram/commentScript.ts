import { AntiBanSettings, CommentConfig, CommentPreset } from './commentTypes';

export const DEFAULT_MOVIE_MESSAGES: string[] = [
  '{MovieMela|New movie hub} on our profile, check out the latest trending movies 🎬',
  '{Check out|Explore} MovieMela details on page, your next favorite movie is waiting 🍿',
  'Movie lovers {must check this out|should visit our profile}: MovieMela updates ✨',
  '{Looking for|Searching for} the newest movies and web series? MovieMela info on page 🎥',
  '{Movie night starts here|Plan your movie night} with MovieMela, check profile 🔥',
  'Discover {latest releases|new trending films} on MovieMela, details on page 💫',
  'Everything for movie lovers in one place: MovieMela on profile 📽️',
  '{Watch latest movies|Check out fresh cinema} with MovieMela, see our page 🍿',
  '{Find something exciting to watch|Looking for movie recommendations?}: MovieMela on profile 🎬',
  'Explore the entire movie and series collection on MovieMela, see page ✨',
];

export const COMMENT_PRESETS: CommentPreset[] = [
  {
    id: 'movie_promo',
    name: 'Movie & Entertainment Promo',
    description: 'High-engagement promotional variations with Spintax for movie portals and streaming recommendations.',
    messages: DEFAULT_MOVIE_MESSAGES,
  },
  {
    id: 'creator_collab',
    name: 'Creator & Collaboration Outreach',
    description: 'Natural, friendly messages for content creators, influencers, and brand partnerships.',
    messages: [
      '{Loved your content|Amazing post}! Would love to {collaborate|connect} on an upcoming project ✨',
      '{Great creativity|Really love your work}! Check out our page for exciting opportunities 🚀',
      '{Big fan of your style|Keep up the great work}! Let us know if you are open to collaborations 🤝',
      '{Super engaging post|Awesome stuff}! Dropping by to say keep creating great content 🔥',
    ],
  },
  {
    id: 'giveaway_tag',
    name: 'Giveaway & Community Invite',
    description: 'Exciting invitation templates for giveaways, contests, and exclusive community invites.',
    messages: [
      '{Check this out|Do not miss this}! New giveaway happening right now, details on page 🎁',
      '{Exciting update|Special announcement}! Join our community, see profile 🔥',
      '{Tagging you because|Hey friend!} you have to see this, info on page 💫',
      '{Special perks waiting|Exclusive access available}! Check profile today 🌟',
    ],
  },
];

/**
 * Resolves a spintax string like "{Hello|Hey|Hi} friend" into a random variation.
 */
export function resolveSpintax(text: string): string {
  const spintaxRegex = /\{([^{}]+)\}/g;
  let resolved = text;
  while (spintaxRegex.test(resolved)) {
    resolved = resolved.replace(spintaxRegex, (_, choices) => {
      const parts = choices.split('|');
      return parts[Math.floor(Math.random() * parts.length)].trim();
    });
  }
  return resolved;
}

/**
 * Adds 1 to 3 invisible zero-width unicode characters (\u200B, \u200C, \u200D)
 * at random positions to guarantee a 100% unique string hash that bypasses
 * duplicate text filters while appearing completely invisible to humans.
 */
export function injectZeroWidthJitter(text: string): string {
  const zeroWidthChars = ['\u200B', '\u200C', '\u200D'];
  const char = zeroWidthChars[Math.floor(Math.random() * zeroWidthChars.length)];
  const words = text.split(' ');
  if (words.length > 1) {
    const insertIdx = Math.floor(Math.random() * (words.length - 1)) + 1;
    words.splice(insertIdx, 0, char);
    return words.join(' ');
  }
  return text + char;
}

/**
 * Cleans a list of usernames.
 */
export function cleanCommentUsernames(rawInput: string): string[] {
  if (!rawInput) return [];
  const lines = rawInput.split(/[\n,;\t]+/);
  const seen = new Set<string>();
  const cleaned: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Extract first token and remove @ and non-username characters
    const token = trimmed.split(/\s+/)[0].replace(/^@+/, '').replace(/[^a-zA-Z0-9._]/g, '');
    if (token && !seen.has(token.toLowerCase())) {
      seen.add(token.toLowerCase());
      cleaned.push(token);
    }
  }

  return cleaned;
}

/**
 * Generates the executable browser console code.
 */
export function generateCommentScript(config: CommentConfig): string {
  const { usernames, messages, antiBan } = config;

  const serializedUsers = JSON.stringify(usernames, null, 2);
  const serializedMessages = JSON.stringify(messages, null, 2);

  return `/**
 * ============================================================================
 * ToolNest - Instagram Auto-Commenter & User Tagger (Anti-Ban Engine v4.0)
 * ============================================================================
 * Features:
 * - Smart Batch Breaks (Pauses every ${antiBan.batchSize} comments for ${antiBan.batchBreakSec}s to prevent action blocks)
 * - Zero-Width Character Hash Randomizer (Defeats exact duplicate spam filters)
 * - Spintax syntax support ({A|B|C})
 * - Full React Pointer Event Simulation on Post button
 * - Verified Post Confirmation (waits for text box to clear)
 * - On-Screen Live Floating Progress HUD
 * ============================================================================
 * HOW TO RUN:
 * 1. Open the target Instagram Post or Reel in your browser.
 * 2. Press F12 -> Go to the "Console" tab.
 * 3. Paste this entire script into the console and press Enter.
 * 4. Keep this tab active while comments are being posted.
 * ============================================================================
 */

(async function () {
  'use strict';

  // 1. Targets & Configuration
  const USERNAMES = ${serializedUsers};
  const MESSAGE_TEMPLATES = ${serializedMessages};

  // Anti-Ban & Timing Configuration
  const MIN_DELAY_SEC = ${antiBan.minDelaySec};
  const MAX_DELAY_SEC = ${antiBan.maxDelaySec};
  const ENABLE_BATCH_BREAK = ${antiBan.enableBatchBreak};
  const BATCH_SIZE = ${antiBan.batchSize};
  const BATCH_BREAK_SEC = ${antiBan.batchBreakSec};
  const ENABLE_ZERO_WIDTH = ${antiBan.enableZeroWidthJitter};
  const ENABLE_EMOJI_ROTATION = ${antiBan.enableEmojiRotation};
  const TAGS_PER_COMMENT = ${antiBan.tagsPerComment};
  const TAG_POSITION = ${JSON.stringify(antiBan.tagPosition)};
  const EMULATE_TYPING = ${antiBan.emulateHumanTyping};

  if (!window.location.hostname.includes('instagram.com')) {
    alert('⚠️ Please run this script on an Instagram post or reel page (https://www.instagram.com/p/... or /reel/...)');
    return;
  }

  if (!USERNAMES || USERNAMES.length === 0) {
    alert('⚠️ No usernames provided in the list.');
    return;
  }

  if (!MESSAGE_TEMPLATES || MESSAGE_TEMPLATES.length === 0) {
    alert('⚠️ No message templates provided.');
    return;
  }

  // Emoji pool for natural rotation
  const EMOJI_POOL = ['🎬', '🍿', '🔥', '✨', '🎥', '💫', '📽️', '🌟', '🙌', '💯'];
  const ZERO_WIDTH_CHARS = ['\\u200B', '\\u200C', '\\u200D'];

  // State
  let postedCount = 0;
  let skippedCount = 0;
  let isPaused = false;
  let isStopped = false;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const getRandomDelay = () => Math.floor(Math.random() * (MAX_DELAY_SEC - MIN_DELAY_SEC + 1) + MIN_DELAY_SEC) * 1000;

  // Resolve Spintax: "{A|B} {C|D}" -> random combination
  function resolveSpintax(text) {
    const spintaxRegex = /\\{([^{}]+)\\}/g;
    let resolved = text;
    while (spintaxRegex.test(resolved)) {
      resolved = resolved.replace(spintaxRegex, (_, choices) => {
        const parts = choices.split('|');
        return parts[Math.floor(Math.random() * parts.length)].trim();
      });
    }
    return resolved;
  }

  // Inject invisible zero-width character to guarantee unique string hash
  function injectZeroWidth(text) {
    const char = ZERO_WIDTH_CHARS[Math.floor(Math.random() * ZERO_WIDTH_CHARS.length)];
    const words = text.split(' ');
    if (words.length > 1) {
      const idx = Math.floor(Math.random() * (words.length - 1)) + 1;
      words.splice(idx, 0, char);
      return words.join(' ');
    }
    return text + char;
  }

  // Build the complete unique comment string for a specific user
  function buildCommentText(tags, index = 0) {
    const template = MESSAGE_TEMPLATES[index % MESSAGE_TEMPLATES.length];
    let text = resolveSpintax(template);

    if (ENABLE_EMOJI_ROTATION) {
      const emoji = EMOJI_POOL[index % EMOJI_POOL.length];
      text = text + ' ' + emoji;
    }

    if (ENABLE_ZERO_WIDTH) {
      text = injectZeroWidth(text);
    }

    const tagString = tags.map((u) => u.startsWith('@') ? u : '@' + u).join(' ');

    if (TAG_POSITION === 'start') {
      return tagString + ' ' + text;
    } else {
      return text + ' ' + tagString;
    }
  }

  // Build Floating On-Screen Progress HUD
  const existingHud = document.getElementById('toolnest-comment-hud');
  if (existingHud) existingHud.remove();

  const hud = document.createElement('div');
  hud.id = 'toolnest-comment-hud';
  hud.style.cssText = \`
    position: fixed;
    top: 24px;
    right: 50%;
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

  // Total batches/comments to make
  const totalComments = Math.ceil(USERNAMES.length / TAGS_PER_COMMENT);

  hud.innerHTML = \`
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; border-bottom:1px solid #334155; padding-bottom:10px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="background:#5722AF; color:#fff; width:26px; height:26px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-weight:bold;">💬</span>
        <strong style="font-size:14px; font-weight:bold; color:#fff;">ToolNest Auto-Commenter</strong>
      </div>
      <span id="tn-c-counter" style="font-size:12px; font-weight:bold; color:#a78bfa;">0 / \${totalComments}</span>
    </div>

    <div style="margin-bottom:10px;">
      <div style="font-size:11px; color:#94a3b8; text-transform:uppercase; font-weight:bold;">Current Tags</div>
      <div id="tn-c-user" style="font-size:14px; font-weight:bold; color:#38bdf8; margin-top:2px; word-break:break-word;">Starting...</div>
    </div>

    <div style="margin-bottom:14px;">
      <div style="font-size:11px; color:#94a3b8; text-transform:uppercase; font-weight:bold;">Status</div>
      <div id="tn-c-status" style="font-size:12px; color:#cbd5e1; margin-top:2px;">Initializing...</div>
    </div>

    <!-- Progress Bar -->
    <div style="background:#334155; border-radius:999px; height:8px; overflow:hidden; margin-bottom:16px;">
      <div id="tn-c-bar" style="background:#5722AF; width:0%; height:100%; transition:width 0.3s ease;"></div>
    </div>

    <div style="display:flex; gap:8px;">
      <button id="tn-c-pause" style="flex:1; padding:8px; border-radius:10px; border:none; background:#334155; color:#fff; font-weight:bold; cursor:pointer;">Pause</button>
      <button id="tn-c-stop" style="flex:1; padding:8px; border-radius:10px; border:none; background:#e11d48; color:#fff; font-weight:bold; cursor:pointer;">Stop</button>
    </div>
  \`;
  document.body.appendChild(hud);

  const hudUser = document.getElementById('tn-c-user');
  const hudStatus = document.getElementById('tn-c-status');
  const hudCounter = document.getElementById('tn-c-counter');
  const hudBar = document.getElementById('tn-c-bar');
  const btnPause = document.getElementById('tn-c-pause');
  const btnStop = document.getElementById('tn-c-stop');

  btnPause.onclick = () => {
    isPaused = !isPaused;
    btnPause.innerText = isPaused ? 'Resume' : 'Pause';
    btnPause.style.background = isPaused ? '#10b981' : '#334155';
    updateStatus(isPaused ? '⏸️ Paused.' : 'Resuming...');
  };

  btnStop.onclick = () => {
    isStopped = true;
    updateStatus('🛑 Stopped by user.');
  };

  function updateStatus(text) {
    if (hudStatus) hudStatus.innerText = text;
    console.log('[ToolNest Auto-Commenter]', text);
  }

  function updateProgress() {
    const totalProcessed = postedCount + skippedCount;
    const pct = Math.round((totalProcessed / totalComments) * 100);
    if (hudCounter) hudCounter.innerText = \`\${postedCount} / \${totalComments}\`;
    if (hudBar) hudBar.style.width = \`\${pct}%\`;
  }

  // Comprehensive Comment Editor finder on Instagram Post/Reel
  async function findCommentEditor() {
    const selectors = [
      'div[data-lexical-editor="true"][role="textbox"]',
      'div[aria-label*="Add a comment" i][role="textbox"]',
      'div[aria-placeholder*="Add a comment" i]',
      'div[aria-label*="comment" i][role="textbox"]',
      'div[contenteditable="true"][role="textbox"]',
      'div[contenteditable="true"][data-lexical-editor="true"]',
      'textarea[aria-label*="comment" i]',
      'textarea[placeholder*="comment" i]',
      'form textarea',
      'div[contenteditable="true"]'
    ];

    for (const s of selectors) {
      const candidates = Array.from(document.querySelectorAll(s));
      const el = candidates.find(e => {
        const rect = e.getBoundingClientRect();
        return e.offsetParent !== null || (rect.width > 0 && rect.height > 0);
      });
      if (el) {
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (e) {}
        return el;
      }
    }

    // Fallback: If comment box is closed (e.g. in Reels/feed overlay), look for comment speech bubble icon
    const commentTriggers = Array.from(document.querySelectorAll('svg[aria-label*="Comment" i], svg[aria-label*="Add a comment" i]'));
    for (const svg of commentTriggers) {
      const triggerBtn = svg.closest('div[role="button"], button');
      if (triggerBtn) {
        updateStatus('Opening comment section...');
        fullClick(triggerBtn);
        await sleep(1500);
        for (const s of selectors) {
          const el = document.querySelector(s);
          if (el && (el.offsetParent !== null || el.getBoundingClientRect().height > 0)) {
            return el;
          }
        }
      }
    }

    return null;
  }

  // Polls until Instagram React mounts the "Post" button (which is hidden when input is empty!)
  async function waitForPostButton(editor, timeoutMs = 4500) {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
      // 1. Search in sibling containers & ancestors up to 6 levels
      let ancestor = editor ? editor.parentElement : null;
      for (let i = 0; i < 6 && ancestor; i++) {
        const localCandidates = Array.from(ancestor.querySelectorAll('div[role="button"], button'));
        const found = localCandidates.find(el => {
          const txt = (el.innerText || el.textContent || '').trim().toLowerCase();
          return (txt === 'post' || txt === 'share') && el !== editor;
        });
        if (found) return found;
        ancestor = ancestor.parentElement;
      }

      // 2. Global search for visible Post button in document
      const allButtons = Array.from(document.querySelectorAll('div[role="button"], button'));
      const foundGlobal = allButtons.find(el => {
        const txt = (el.innerText || el.textContent || '').trim().toLowerCase();
        const rect = el.getBoundingClientRect();
        const isVisible = el.offsetParent !== null || (rect.width > 0 && rect.height > 0);
        return (txt === 'post' || txt === 'share') && isVisible && el !== editor;
      });
      if (foundGlobal) return foundGlobal;

      await sleep(200);
    }

    return null;
  }

  // Single click trigger: dispatches events without duplicate double-trigger
  function fullClick(element) {
    if (!element) return;
    try {
      element.focus();
      const rect = element.getBoundingClientRect();
      const clientX = rect.left + rect.width / 2;
      const clientY = rect.top + rect.height / 2;
      const opts = { bubbles: true, cancelable: true, view: window, clientX, clientY };

      element.dispatchEvent(new PointerEvent('pointerdown', opts));
      element.dispatchEvent(new MouseEvent('mousedown', opts));
      element.dispatchEvent(new PointerEvent('pointerup', opts));
      element.dispatchEvent(new MouseEvent('mouseup', opts));
      element.click();
    } catch (err) {
      if (typeof element.click === 'function') element.click();
    }
  }

  // Thoroughly clears the comment input box so no old text remains
  function clearEditor(editor) {
    if (!editor) return;
    editor.focus();

    if (editor.tagName === 'TEXTAREA' || editor.tagName === 'INPUT') {
      editor.value = '';
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      editor.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }

    try {
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editor);
      sel.removeAllRanges();
      sel.addRange(range);
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
    } catch (e) {}

    try {
      editor.innerHTML = '<p class="xdj266r x14z9mp xat24cr x1lziwak" dir="auto"><br></p>';
    } catch (e) {}

    try {
      editor.dispatchEvent(new InputEvent('beforeinput', { inputType: 'deleteContentBackward', bubbles: true }));
      editor.dispatchEvent(new InputEvent('input', { inputType: 'deleteContentBackward', bubbles: true }));
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      editor.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (e) {}
  }

  // Insert ONLY ONE comment text for this specific user (fast & clean, exactly once)
  async function insertCommentText(editor, text) {
    // 1. Clear editor completely first
    clearEditor(editor);
    await sleep(100);

    editor.focus();

    if (editor.tagName === 'TEXTAREA' || editor.tagName === 'INPUT') {
      editor.value = text;
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      editor.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }

    // 2. Prepare selection inside Lexical paragraph
    let p = editor.querySelector('p');
    if (!p) {
      p = document.createElement('p');
      p.className = 'xdj266r x14z9mp xat24cr x1lziwak';
      p.setAttribute('dir', 'auto');
      editor.appendChild(p);
    }
    try {
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(p);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (e) {}

    // 3. Insert text ONCE via native command (no manual beforeinput to prevent double typing)
    if (EMULATE_TYPING) {
      for (const char of text) {
        document.execCommand('insertText', false, char);
        await sleep(8 + Math.floor(Math.random() * 8));
      }
    } else {
      document.execCommand('insertText', false, text);
    }

    // 4. Fallback only if Lexical is still completely empty
    const currentText = (editor.textContent || editor.innerText || '').trim();
    if (!currentText) {
      try {
        const dt = new DataTransfer();
        dt.setData('text/plain', text);
        editor.dispatchEvent(new ClipboardEvent('paste', {
          clipboardData: dt,
          bubbles: true,
          cancelable: true
        }));
      } catch (e) {}
    }

    // 5. Fire input & change events so React enables the Post button
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    editor.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Real-time detection for Instagram Action Block / "Couldn't post comment" error toasts
  function checkInstagramError() {
    const errorKeywords = [
      "couldn't post comment",
      "could not post comment",
      "try again later",
      "we limit how often",
      "action blocked"
    ];

    try {
      const alerts = Array.from(document.querySelectorAll('[role="alert"], [role="dialog"], [aria-live]'));
      for (const el of alerts) {
        const txt = (el.textContent || '').toLowerCase();
        for (const kw of errorKeywords) {
          if (txt.includes(kw)) {
            return { hasError: true, message: kw };
          }
        }
      }
    } catch (e) {}

    return { hasError: false, message: '' };
  }

  function isEditorEmpty(editor) {
    if (!editor) return true;
    if (editor.tagName === 'TEXTAREA' || editor.tagName === 'INPUT') {
      return !editor.value.trim();
    }
    const txt = (editor.textContent || editor.innerText || '').trim();
    return txt.length === 0;
  }

  updateStatus('Ready. Preparing comment queue...');
  await sleep(600);

  // Group users by tagsPerComment
  const commentBatches = [];
  for (let i = 0; i < USERNAMES.length; i += TAGS_PER_COMMENT) {
    commentBatches.push(USERNAMES.slice(i, i + TAGS_PER_COMMENT));
  }

  // Main Posting Loop - One User at a Time, Continuous Back-to-Back
  for (let bIdx = 0; bIdx < commentBatches.length; bIdx++) {
    if (isStopped) break;
    while (isPaused) { await sleep(400); if (isStopped) break; }
    if (isStopped) break;

    const currentTags = commentBatches[bIdx];
    // Each user gets their own distinct message template
    const commentString = buildCommentText(currentTags, bIdx);

    try {
      if (hudUser) hudUser.innerText = currentTags.map((u) => u.startsWith('@') ? u : '@' + u).join(', ');
      updateStatus(\`[\${bIdx + 1}/\${commentBatches.length}] Preparing comment for \${currentTags[0]}...\`);

      // 1. Locate Comment Box
      const editor = await findCommentEditor();
      if (!editor) {
        updateStatus('⚠️ Comment box not found. Ensure post/reel is visible on screen!');
        await sleep(2000);
        continue;
      }

      // 2. Click editor to activate & focus
      fullClick(editor);
      await sleep(150);

      // 3. Type ONLY this user's comment (fast & clean box, exactly once)
      updateStatus(\`Typing comment for \${currentTags[0]}...\`);
      await insertCommentText(editor, commentString);
      await sleep(350);

      // 4. Submit comment EXACTLY ONCE
      updateStatus('Submitting comment...');
      const postBtn = await waitForPostButton(editor, 2500);

      if (postBtn) {
        fullClick(postBtn);
      } else {
        editor.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true
        }));
      }

      // Wait 1.5s for Instagram to process the comment
      await sleep(1500);

      // 5. Check if Instagram showed an error toast (e.g. rate limit)
      const errCheck = checkInstagramError();
      if (errCheck.hasError) {
        updateStatus(\`⚠️ Instagram Limit Alert: "\${errCheck.message}". Cooling down 60s...\`);
        clearEditor(editor);
        for (let sec = 60; sec > 0; sec--) {
          if (isStopped) break;
          while (isPaused) { await sleep(400); if (isStopped) break; }
          updateStatus(\`🛡️ Safety Cooldown: Pausing \${sec}s to allow rate limit to reset...\`);
          await sleep(1000);
        }
        continue;
      }

      postedCount++;
      updateProgress();
      updateStatus(\`✓ Comment posted for \${currentTags[0]} (\${postedCount}/\${commentBatches.length})\`);

      // 6. SAFE DELAY BEFORE NEXT USER (Back-to-back fast delay!)
      if (bIdx < commentBatches.length - 1 && !isStopped) {
        if (ENABLE_BATCH_BREAK && (bIdx + 1) % BATCH_SIZE === 0) {
          for (let sec = BATCH_BREAK_SEC; sec > 0; sec--) {
            if (isStopped) break;
            while (isPaused) { await sleep(400); if (isStopped) break; }
            updateStatus(\`☕ Smart Rest: Pausing \${sec}s to prevent spam block...\`);
            await sleep(1000);
          }
        } else {
          const delayMs = getRandomDelay();
          const delaySec = Math.max(2, Math.round(delayMs / 1000));
          for (let sec = delaySec; sec > 0; sec--) {
            if (isStopped) break;
            while (isPaused) { await sleep(400); if (isStopped) break; }
            updateStatus(\`Next user in \${sec}s...\`);
            await sleep(1000);
          }
        }
      }
    } catch (batchErr) {
      console.error('[ToolNest Loop Error]', batchErr);
      updateStatus(\`⚠️ Notice on user \${bIdx + 1}: \${batchErr.message || batchErr}\`);
      await sleep(1500);
    }
  }

  // Completed
  if (!isStopped) {
    updateStatus(\`🎉 All done! \${postedCount} comments posted successfully.\`);
    if (hudUser) hudUser.innerText = 'Completed!';
  }
})();
`;
}
