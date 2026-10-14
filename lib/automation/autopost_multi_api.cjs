/**
 * ============================================================================
 * ToolNest - Multi-Account Direct API Instagram Reels & Post Publisher
 * ============================================================================
 * - Pure HTTP Headless posting (Zero browser windows open during posting)
 * - Multi-Account Rotation (cars, gym, food, pipe, motivation, cricket, etc.)
 * - Full Video (.mp4) Reels upload pipeline (rupload_igvideo + configure_to_clips)
 * - Full Photo (.jpg, .png, .webp) upload pipeline (rupload_igphoto + configure)
 * - Safe Pacing & Configurable Batch Limits (20 to 100 posts per account)
 * - Automatic Filename-to-Title Caption generation + Hashtags
 * - Error isolation: if one account hits a limit, automatically rotates to next
 * ============================================================================
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

process.on('unhandledRejection', (reason) => {
  console.error('[Multi-Poster Rejection Handled]:', reason && reason.message ? reason.message : reason);
});
process.on('uncaughtException', (err) => {
  console.error('[Multi-Poster Exception Handled]:', err.message);
});

const BASE_SCRIPTS_DIR = 'C:\\Users\\HP';
const CONFIG_FILE = path.join(BASE_SCRIPTS_DIR, 'autopost_multi_config.json');

// Default fallback configuration
let config = {
  accounts: [],
  delaySec: 4.5,
  batchLimitPerAccount: 50,
  rotationMode: 'sequential', // 'sequential' | 'round_robin'
  archiveFinished: true,
  captionMode: 'filename_title', // 'filename_title' | 'custom'
  customCaption: '',
  loginOnly: false,
};

if (fs.existsSync(CONFIG_FILE)) {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
    config = { ...config, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error reading autopost_multi_config.json:', e.message);
  }
}

const DELAY_MS = Math.max(1000, Math.round((config.delaySec || 4.5) * 1000));
const BATCH_LIMIT = Math.max(1, Math.min(500, config.batchLimitPerAccount || 50));
const ROTATION_MODE = config.rotationMode || 'sequential';
const ARCHIVE_FINISHED = config.archiveFinished !== false;
const CAPTION_MODE = config.captionMode || 'filename_title';
const CUSTOM_CAPTION = (config.customCaption || '').trim();

console.log('================================================================');
console.log('   🎬 ToolNest Multi-Account Direct API Reels & Post Engine');
console.log('================================================================');
console.log(`⏱️ Post Delay:           ${config.delaySec || 4.5}s (~${Math.round(60 / (config.delaySec || 4.5))} posts/hour safe pacing)`);
console.log(`🎯 Limit Per Account:    ${BATCH_LIMIT} posts`);
console.log(`🔄 Rotation Strategy:    ${ROTATION_MODE.toUpperCase()}`);
console.log(`📦 Auto-Archive:         ${ARCHIVE_FINISHED ? 'Yes (move to finished_reels)' : 'No (loop in-place)'}`);
console.log(`📝 Caption Mode:         ${CAPTION_MODE}`);
console.log(`👥 Selected Accounts:    ${config.accounts ? config.accounts.length : 0} account(s)`);
console.log('================================================================\n');

if (!config.accounts || config.accounts.length === 0) {
  console.error('❌ [System] No accounts selected to post! Please select at least one account.');
  process.exit(1);
}

// 1x1 minimal valid JPEG buffer for cover thumbnail
const SAMPLE_JPEG_THUMB = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
  'base64'
);

const VIDEO_EXTS = ['.mp4', '.mov', '.m4v'];
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

function cleanProfileLocks(dir) {
  if (!dir || !fs.existsSync(dir)) return;
  const locks = ['SingletonLock', 'lockfile', 'SingletonCookie', 'SingletonSocket'];
  for (const file of locks) {
    const fullPath = path.join(dir, file);
    try {
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    } catch (_) {}
  }
}

/**
 * Format video filename into human readable title + hashtags
 */
function generateCaption(filename, hashtags, mode, customCaption) {
  if (mode === 'custom' && customCaption) {
    return customCaption;
  }
  let baseName = path.parse(filename).name;
  baseName = baseName.replace(/^(tab\d+_)+/, '');
  baseName = baseName.replace(/_+[-]+_+|[-]+_+|_+[-]+/g, '-');
  baseName = baseName.replace(/_+/g, ' ');
  baseName = baseName.replace(/\s*-\s*/g, '-');
  baseName = baseName.replace(/\s+/g, ' ').trim();
  if (baseName.length > 0) {
    baseName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
  }
  const tags = hashtags || '#reels #viral #explore #trending';
  return `${baseName}\n\n${tags}`;
}

/**
 * Extract active Instagram session credentials from Playwright persistent profile
 */
async function extractSessionCredentials(sessionDir) {
  cleanProfileLocks(sessionDir);
  try {
    const ctx = await chromium.launchPersistentContext(sessionDir, {
      headless: true,
      args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    });
    const cookies = await ctx.cookies('https://www.instagram.com');
    await ctx.close();

    const sessionCookie = cookies.find((c) => c.name === 'sessionid');
    const csrfCookie = cookies.find((c) => c.name === 'csrftoken');
    const userCookie = cookies.find((c) => c.name === 'ds_user_id');

    if (!sessionCookie || !csrfCookie) {
      return { ok: false, error: 'No active session cookies found. Please log in first.' };
    }

    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
    const csrfToken = csrfCookie.value;
    const userId = userCookie ? userCookie.value : 'Authenticated User';

    return { ok: true, cookieHeader, csrfToken, userId };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get media items available in account's folder
 */
function getAccountMediaFiles(folderPath) {
  if (!folderPath || !fs.existsSync(folderPath)) return [];
  try {
    const items = fs.readdirSync(folderPath, { withFileTypes: true });
    return items
      .filter((i) => i.isFile())
      .map((i) => i.name)
      .filter((name) => {
        const ext = path.extname(name).toLowerCase();
        return VIDEO_EXTS.includes(ext) || IMAGE_EXTS.includes(ext);
      })
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  } catch (err) {
    console.error(`Error reading ${folderPath}:`, err.message);
    return [];
  }
}

/**
 * Upload Video (.mp4) as Reel via Direct API
 */
async function postDirectVideoReel({ account, filename, filePath, credentials, caption }) {
  const { cookieHeader, csrfToken } = credentials;
  const uploadId = Date.now().toString() + Math.floor(Math.random() * 1000);
  const entityName = `fb_uploader_${uploadId}`;
  const videoBuffer = fs.readFileSync(filePath);

  // Step 1: Initialize rupload session
  const initRes = await fetch(`https://i.instagram.com/rupload_igvideo/${entityName}`, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'X-IG-App-ID': '936619743392459',
      'X-CSRFToken': csrfToken,
      'Cookie': cookieHeader,
    },
  });

  // Step 2: Binary Video upload
  const ruploadParams = JSON.stringify({
    'client-passthrough': '1',
    'is_clips_video': '1',
    'for_album': false,
    'is_sidecar': '0',
    'media_type': 2,
    'upload_id': uploadId,
    'upload_media_duration_ms': 15000,
    'upload_media_height': 1024,
    'upload_media_width': 576,
    'video_format': '',
    'video_transform': null,
  });

  const uploadRes = await fetch(`https://i.instagram.com/rupload_igvideo/${entityName}`, {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'X-Instagram-Rupload-Params': ruploadParams,
      'X-Entity-Name': entityName,
      'X-Entity-Length': videoBuffer.length.toString(),
      'Offset': '0',
      'X-IG-App-ID': '936619743392459',
      'X-CSRFToken': csrfToken,
      'Cookie': cookieHeader,
      'Content-Type': 'application/octet-stream',
    },
    body: videoBuffer,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text().catch(() => '');
    throw new Error(`Video upload failed HTTP ${uploadRes.status}: ${errText.substring(0, 120)}`);
  }

  // Step 3: Poster thumbnail upload
  const thumbRes = await fetch(`https://i.instagram.com/rupload_igphoto/${entityName}`, {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Content-Type': 'image/jpeg',
      'X-Instagram-Rupload-Params': JSON.stringify({
        media_type: 2,
        upload_id: uploadId,
        upload_media_height: 1024,
        upload_media_width: 576,
      }),
      'X-Entity-Name': entityName,
      'X-Entity-Length': SAMPLE_JPEG_THUMB.length.toString(),
      'X-Entity-Type': 'image/jpeg',
      'Offset': '0',
      'X-IG-App-ID': '936619743392459',
      'X-CSRFToken': csrfToken,
      'Cookie': cookieHeader,
    },
    body: SAMPLE_JPEG_THUMB,
  });

  // Step 4: Configure to Clips (polling for transcode completion)
  let lastData = null;
  for (let attempt = 1; attempt <= 12; attempt++) {
    const configRes = await fetch('https://www.instagram.com/api/v1/media/configure_to_clips/', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://www.instagram.com',
        'Referer': 'https://www.instagram.com/',
        'X-IG-App-ID': '936619743392459',
        'X-CSRFToken': csrfToken,
        'Cookie': cookieHeader,
      },
      body: new URLSearchParams({
        upload_id: uploadId,
        caption: caption,
        source_type: 'library',
        clips_share_preview_to_feed: '1',
        disable_comments: '0',
        like_and_view_counts_disabled: '0',
        video_subtitles_enabled: '0',
        archive_only: 'false',
        media_share_flow: 'creation_flow',
      }),
    });

    lastData = await configRes.json().catch(() => ({}));

    if (lastData.status === 'ok') {
      const mediaCode = lastData.media?.code || lastData.media?.id || 'OK';
      return { ok: true, mediaCode, uploadId, type: 'reel' };
    }

    if (lastData.message && lastData.message.includes('Transcode not finished yet')) {
      // Instagram server is processing video transcode
      await new Promise((r) => setTimeout(r, 3500));
      continue;
    }

    const msg = lastData.message || lastData.feedback_message || JSON.stringify(lastData);
    throw new Error(`Configure reel failed: ${msg.substring(0, 120)}`);
  }

  throw new Error('Configure reel timed out waiting for Instagram transcode.');
}

/**
 * Upload Photo via Direct API
 */
async function postDirectPhoto({ account, filename, filePath, credentials, caption }) {
  const { cookieHeader, csrfToken } = credentials;
  const uploadId = Date.now().toString() + Math.floor(Math.random() * 1000);
  const entityName = `fb_uploader_${uploadId}`;
  const imageBuffer = fs.readFileSync(filePath);

  const ruploadParams = JSON.stringify({
    media_type: 1,
    upload_id: uploadId,
    upload_media_height: 1080,
    upload_media_width: 1080,
  });

  // Step 1: Upload photo binary
  const uploadRes = await fetch(`https://www.instagram.com/rupload_igphoto/${entityName}`, {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'X-Instagram-Rupload-Params': ruploadParams,
      'X-Entity-Name': entityName,
      'X-Entity-Length': imageBuffer.length.toString(),
      'Offset': '0',
      'X-IG-App-ID': '936619743392459',
      'X-ASBD-ID': '129477',
      'X-CSRFToken': csrfToken,
      'Cookie': cookieHeader,
      'Content-Type': 'image/jpeg',
    },
    body: imageBuffer,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text().catch(() => '');
    throw new Error(`Photo upload failed HTTP ${uploadRes.status}: ${errText.substring(0, 100)}`);
  }

  // Step 2: Configure & Publish
  const configureRes = await fetch('https://www.instagram.com/api/v1/media/configure/', {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://www.instagram.com',
      'Referer': 'https://www.instagram.com/',
      'X-IG-App-ID': '936619743392459',
      'X-ASBD-ID': '129477',
      'X-CSRFToken': csrfToken,
      'Cookie': cookieHeader,
    },
    body: new URLSearchParams({
      upload_id: uploadId,
      caption: caption,
      source_type: 'library',
      custom_accessibility_caption: '',
      disable_comments: '0',
      like_and_view_counts_disabled: '0',
    }),
  });

  const configData = await configureRes.json().catch(() => ({}));
  if (configData.status !== 'ok') {
    const msg = configData.message || configData.feedback_message || JSON.stringify(configData);
    throw new Error(`Configure photo failed: ${msg.substring(0, 120)}`);
  }

  const mediaCode = configData.media?.code || configData.media?.id || 'OK';
  return { ok: true, mediaCode, uploadId, type: 'photo' };
}

/**
 * Handle archive / moving of completed video
 */
function archiveCompletedFile(folderPath, filename) {
  if (!ARCHIVE_FINISHED) return;
  try {
    const finishedDir = path.join(folderPath, 'finished_reels');
    if (!fs.existsSync(finishedDir)) {
      fs.mkdirSync(finishedDir, { recursive: true });
    }
    const currentPath = path.join(folderPath, filename);
    const destPath = path.join(finishedDir, filename);
    if (fs.existsSync(currentPath)) {
      fs.renameSync(currentPath, destPath);
    }
  } catch (err) {
    console.warn(`[Archive Warning] Failed to move ${filename} to finished_reels:`, err.message);
  }
}

// Global execution state
let totalPublishedGlobal = 0;
let totalFailedGlobal = 0;
const accountStats = {};
const sessionCache = {};
const startTime = Date.now();

(async () => {
  console.log(`[Init] Validating sessions for ${config.accounts.length} selected accounts...`);

  const activeAccounts = [];

  for (const acc of config.accounts) {
    accountStats[acc.id] = { published: 0, failed: 0, status: 'IDLE' };
    const sessionDir = acc.sessionDir
      ? (path.isAbsolute(acc.sessionDir) ? acc.sessionDir : path.join(BASE_SCRIPTS_DIR, acc.sessionDir))
      : path.join(BASE_SCRIPTS_DIR, `ig_${acc.id}_session`);

    console.log(`[Auth] Checking session for @${acc.name || acc.id} (${path.basename(sessionDir)})...`);
    const auth = await extractSessionCredentials(sessionDir);

    if (!auth.ok) {
      console.warn(`⚠️ [Auth Warning] Skipping @${acc.name || acc.id}: ${auth.error}`);
      accountStats[acc.id].status = 'AUTH_ERROR';
      continue;
    }

    sessionCache[acc.id] = { ...auth, sessionDir };
    activeAccounts.push({ ...acc, sessionDir });
    console.log(`✔ [Auth OK] @${acc.name || acc.id} authenticated! (User ID: ${auth.userId})`);
  }

  if (activeAccounts.length === 0) {
    console.error('\n❌ [System] No authenticated accounts available! Please log into at least one account first.');
    process.exit(1);
  }

  console.log(`\n🚀 [System] Ready to post across ${activeAccounts.length} authenticated accounts!`);
  console.log(`⏱️ Throttled safe delay: ${config.delaySec || 4.5}s per post.\n`);

  if (ROTATION_MODE === 'sequential') {
    // Sequential Mode: Finish account target (e.g. 50 posts) then move to next account
    for (let accIdx = 0; accIdx < activeAccounts.length; accIdx++) {
      const acc = activeAccounts[accIdx];
      const credentials = sessionCache[acc.id];
      const accTargetLimit = acc.batchLimit || BATCH_LIMIT;

      console.log(`\n================================================================`);
      console.log(`🎯 [Account ${accIdx + 1}/${activeAccounts.length}] Switched to: @${acc.name || acc.id}`);
      console.log(`📁 Source Folder: ${acc.folder}`);
      console.log(`🎯 Target Batch Limit: ${accTargetLimit} posts`);
      console.log(`================================================================\n`);

      accountStats[acc.id].status = 'POSTING';
      let accPostedCount = 0;

      while (accPostedCount < accTargetLimit) {
        const availableFiles = getAccountMediaFiles(acc.folder);
        if (availableFiles.length === 0) {
          console.log(`[Account @${acc.name || acc.id}] 📂 No more media files available in folder.`);
          break;
        }

        const nextFile = availableFiles[0];
        const filePath = path.join(acc.folder, nextFile);
        const ext = path.extname(nextFile).toLowerCase();
        const isVideo = VIDEO_EXTS.includes(ext);

        const caption = generateCaption(nextFile, acc.hashtags, CAPTION_MODE, CUSTOM_CAPTION);

        console.log(`[Account @${acc.name || acc.id}] 📤 Posting (${accPostedCount + 1}/${accTargetLimit}): ${nextFile} [${isVideo ? 'VIDEO REEL' : 'PHOTO'}]`);
        console.log(`   Caption: ${caption.split('\n')[0]}...`);

        try {
          let postResult;
          if (isVideo) {
            postResult = await postDirectVideoReel({
              account: acc,
              filename: nextFile,
              filePath,
              credentials,
              caption,
            });
          } else {
            postResult = await postDirectPhoto({
              account: acc,
              filename: nextFile,
              filePath,
              credentials,
              caption,
            });
          }

          accPostedCount++;
          totalPublishedGlobal++;
          accountStats[acc.id].published++;

          const elapsedMins = (Date.now() - startTime) / 60000;
          const speed = elapsedMins > 0.05 ? Math.round(totalPublishedGlobal / elapsedMins) : totalPublishedGlobal * 10;

          console.log(`✔ [SUCCESS] Posted to @${acc.name || acc.id} -> https://instagram.com/p/${postResult.mediaCode} (Acc: ${accPostedCount}/${accTargetLimit} | Total: ${totalPublishedGlobal} | Speed: ~${speed} posts/min)`);

          // Archive file
          archiveCompletedFile(acc.folder, nextFile);

          // Pacing delay
          if (accPostedCount < accTargetLimit) {
            await new Promise((r) => setTimeout(r, DELAY_MS));
          }
        } catch (err) {
          totalFailedGlobal++;
          accountStats[acc.id].failed++;
          console.error(`❌ [ERROR] Failed to post ${nextFile} on @${acc.name || acc.id}:`, err.message);

          if (err.message.includes('User restricted') || err.message.includes('integ')) {
            console.error(`\n⚠️ [Account Action Block] @${acc.name || acc.id} has an upload block from Instagram.`);
            console.error(`   Automatically skipping to the next account to keep automation safe.\n`);
            accountStats[acc.id].status = 'RESTRICTED';
            break;
          } else if (err.message.includes('feedback_required') || err.message.includes('429')) {
            console.warn(`⚠️ [Rate Limit] Instagram 429 feedback required. Pausing 15s before next attempt...`);
            await new Promise((r) => setTimeout(r, 15000));
          } else {
            // General retry delay
            await new Promise((r) => setTimeout(r, 3000));
          }
        }
      }

      if (accountStats[acc.id].status !== 'RESTRICTED') {
        accountStats[acc.id].status = 'COMPLETED';
      }
      console.log(`✔ [Batch Done] Account @${acc.name || acc.id} finished with ${accPostedCount} posts.`);
    }
  } else {
    // Round-Robin Mode: 1 post per account cyclically until all accounts reach batch limit
    console.log(`[Mode] Executing Round-Robin rotation across ${activeAccounts.length} accounts...`);
    let anyAccountRemaining = true;
    let roundIndex = 0;

    while (anyAccountRemaining) {
      roundIndex++;
      anyAccountRemaining = false;

      for (let accIdx = 0; accIdx < activeAccounts.length; accIdx++) {
        const acc = activeAccounts[accIdx];
        const credentials = sessionCache[acc.id];
        const accTargetLimit = acc.batchLimit || BATCH_LIMIT;

        if (accountStats[acc.id].status === 'RESTRICTED' || accountStats[acc.id].published >= accTargetLimit) {
          continue;
        }

        const availableFiles = getAccountMediaFiles(acc.folder);
        if (availableFiles.length === 0) {
          continue;
        }

        anyAccountRemaining = true;
        const nextFile = availableFiles[0];
        const filePath = path.join(acc.folder, nextFile);
        const isVideo = VIDEO_EXTS.includes(path.extname(nextFile).toLowerCase());
        const caption = generateCaption(nextFile, acc.hashtags, CAPTION_MODE, CUSTOM_CAPTION);

        console.log(`\n[Round ${roundIndex}] 📤 Posting on @${acc.name || acc.id}: ${nextFile} (${accountStats[acc.id].published + 1}/${accTargetLimit})`);

        try {
          let postResult;
          if (isVideo) {
            postResult = await postDirectVideoReel({
              account: acc,
              filename: nextFile,
              filePath,
              credentials,
              caption,
            });
          } else {
            postResult = await postDirectPhoto({
              account: acc,
              filename: nextFile,
              filePath,
              credentials,
              caption,
            });
          }

          totalPublishedGlobal++;
          accountStats[acc.id].published++;

          console.log(`✔ [SUCCESS] Posted to @${acc.name || acc.id} -> https://instagram.com/p/${postResult.mediaCode} (Total: ${totalPublishedGlobal})`);
          archiveCompletedFile(acc.folder, nextFile);

          await new Promise((r) => setTimeout(r, DELAY_MS));
        } catch (err) {
          totalFailedGlobal++;
          accountStats[acc.id].failed++;
          console.error(`❌ [ERROR] Failed on @${acc.name || acc.id}:`, err.message);

          if (err.message.includes('User restricted')) {
            console.error(`⚠️ @${acc.name || acc.id} restricted. Skipping in future rounds.`);
            accountStats[acc.id].status = 'RESTRICTED';
          }
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
    }
  }

  const elapsedSec = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n================================================================`);
  console.log(`🎉 [Completed] All selected accounts finished posting run!`);
  console.log(`📊 Total Posts Published:  ${totalPublishedGlobal}`);
  console.log(`❌ Total Failures:         ${totalFailedGlobal}`);
  console.log(`⏱️ Total Time Elapsed:     ${elapsedSec}s (${Math.round(elapsedSec / 60)}m)`);
  console.log(`================================================================\n`);
})();
