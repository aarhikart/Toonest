const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

process.on('unhandledRejection', (reason) => {
  console.error('[Worker Rejection Handled]:', reason && reason.message ? reason.message : reason);
});
process.on('uncaughtException', (err) => {
  console.error('[Worker Exception Handled]:', err.message);
});

const CONCURRENT_TABS = Math.max(1, parseInt(process.env.CONCURRENT_TABS || process.argv[2] || '2', 10));
const POST_LIMIT = Math.max(0, parseInt(process.env.POST_LIMIT || process.argv[3] || '0', 10));
const ACCOUNT_INDEX = Math.max(0, parseInt(process.env.ACCOUNT_INDEX || process.argv[4] || '0', 10));

let totalClaimed = 0;
let totalFinished = 0;

// Continuous parallel workers (no waiting between tabs - all tabs post at the same time)

const videosFolder = __VIDEOS_FOLDER__;
const finishedFolder = path.join(videosFolder, 'finished_reels');
const inProgressFolder = path.join(videosFolder, 'in_progress');

[finishedFolder, inProgressFolder].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Recover any stuck videos left in in_progress from previous abrupt termination
try {
  if (fs.existsSync(inProgressFolder)) {
    const stuckFiles = fs.readdirSync(inProgressFolder);
    stuckFiles.forEach(file => {
      const fullPath = path.join(inProgressFolder, file);
      const cleanName = file.replace(/^(tab\d+_)+/, '');
      const restoredPath = path.join(videosFolder, cleanName);
      try {
        fs.renameSync(fullPath, restoredPath);
      } catch (_) {}
    });
  }
} catch (_) {}

// Tags for content
const HASHTAGS = __HASHTAGS__;

// Clean filename into human readable title + hashtags
function generateCaption(filename) {
  let baseName = path.parse(filename).name;
  baseName = baseName.replace(/^(tab\d+_)+/, '');
  baseName = baseName.replace(/_+[-]+_+|[-]+_+|_+[-]+/g, '-');
  baseName = baseName.replace(/_+/g, ' ');
  baseName = baseName.replace(/\s*-\s*/g, '-');
  baseName = baseName.replace(/\s+/g, ' ').trim();
  if (baseName.length > 0) {
    baseName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
  }
  return `${baseName}\n\n${HASHTAGS}`;
}


// Atomic file locking so no two tabs post the same video
function claimNextVideo(tabNumber) {
  if (POST_LIMIT > 0 && totalClaimed >= POST_LIMIT) {
    return null;
  }
  let allEntries = [];
  try {
    allEntries = fs.readdirSync(videosFolder, { withFileTypes: true });
  } catch (_) {
    return null;
  }
  const availableFiles = allEntries
    .filter(entry => entry.isFile() && path.extname(entry.name).toLowerCase() === '.mp4')
    .map(entry => entry.name)
    .sort();

  if (availableFiles.length === 0) return null;

  for (const targetFile of availableFiles) {
    const cleanTarget = targetFile.replace(/^(tab\d+_)+/, '');
    const originalPath = path.join(videosFolder, targetFile);
    const claimedPath = path.join(inProgressFolder, `tab${tabNumber}_${cleanTarget}`);
    try {
      fs.renameSync(originalPath, claimedPath);
      totalClaimed++;
      return { originalName: cleanTarget, currentPath: claimedPath };
    } catch (_) {
      continue;
    }
  }
  return null;
}


function cleanProfileLocks(dir) {
  if (!fs.existsSync(dir)) return;
  const locks = ['SingletonLock', 'lockfile', 'SingletonCookie', 'SingletonSocket'];
  locks.forEach(file => {
    const fullPath = path.join(dir, file);
    try {
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    } catch (e) {}
  });
}

async function dismissPopups(page) {
  // 1. "Not Now" / "Cancel" for notifications
  try {
    const notNow = page.locator('button:has-text("Not Now"):visible, div[role="button"]:has-text("Not Now"):visible').first();
    if (await notNow.isVisible({ timeout: 500 }).catch(() => false)) {
      await notNow.click({ force: true, timeout: 2000, noWaitAfter: true }).catch(async () => {
        await notNow.evaluate(el => el.click()).catch(() => {});
      });
      await page.waitForTimeout(1000);
    }
  } catch (_) {}

  // 2. Discard dialog if active
  try {
    const discardBtn = page.locator('button:has-text("Discard"):visible, div[role="button"]:has-text("Discard"):visible').first();
    if (await discardBtn.isVisible({ timeout: 400 }).catch(() => false)) {
      await discardBtn.click({ force: true, timeout: 2000, noWaitAfter: true }).catch(async () => {
        await discardBtn.evaluate(el => el.click()).catch(() => {});
      });
      await page.waitForTimeout(1000);
    }
  } catch (_) {}
}

async function insertCaption(page, text) {
  const captionBox = page.locator('div[aria-label*="caption"][contenteditable="true"], div[role="textbox"][contenteditable="true"]').first();
  await captionBox.waitFor({ state: 'visible', timeout: 20000 });
  await captionBox.click({ force: true, timeout: 3000, noWaitAfter: true }).catch(async () => {
    await captionBox.evaluate(el => el.focus()).catch(() => {});
  });
  await page.waitForTimeout(1000);

  // Method 1: Lexical-compatible DataTransfer Paste (works reliably in background and foreground)
  await page.evaluate((captionText) => {
    const el = document.querySelector('div[aria-label*="caption"][contenteditable="true"], div[role="textbox"][contenteditable="true"]');
    if (!el) return false;
    el.focus();
    const dt = new DataTransfer();
    dt.setData('text/plain', captionText);
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: dt,
      bubbles: true,
      cancelable: true
    });
    el.dispatchEvent(pasteEvent);
    return el.innerText.length > 0;
  }, text);

  await page.waitForTimeout(1000);
  const boxContent = await captionBox.innerText().catch(() => '');
  if (!boxContent || boxContent.trim().length === 0) {
    console.log('Direct paste missed, typing into caption box...');
    await captionBox.focus();
    await captionBox.pressSequentially(text, { delay: 1 });
    await page.waitForTimeout(1000);
  }
}

async function runWorker(page, tabNumber) {
  while (true) {
    const videoData = claimNextVideo(tabNumber);
    if (!videoData) {
      if (POST_LIMIT > 0 && totalClaimed >= POST_LIMIT) {
        console.log(`[Tab ${tabNumber}] Post limit reached (${POST_LIMIT} videos). Worker finished.`);
      } else {
        console.log(`[Tab ${tabNumber}] No more videos available.`);
      }
      break;
    }
    const { originalName, currentPath } = videoData;
    const finalCaption = generateCaption(originalName);
    console.log(`\n========================================`);
    console.log(`[Tab ${tabNumber}] Posting (${totalClaimed}${POST_LIMIT > 0 ? `/${POST_LIMIT}` : ''}): ${originalName}`);
    console.log(`[Tab ${tabNumber}] Caption Preview: ${finalCaption.split('\n')[0]} + hashtags`);
    console.log(`========================================`);

    try {
      // Always ensure we are on the Instagram home feed (so we are never stuck on profile page where video uploads fail!)
      if (page.url() !== 'https://www.instagram.com/') {
        console.log(`[Tab ${tabNumber}] Navigating back to Instagram home feed...`);
        await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded' }).catch(() => {});
        await page.waitForTimeout(1000);
      }

      await page.bringToFront().catch(() => {});
      await page.waitForTimeout(1000);
      await dismissPopups(page);

        // 1. Find & Click "Create" / "New post"
        const createSelector = 'a:has(svg[aria-label="New post"]):visible, div[role="button"]:has(svg[aria-label="New post"]):visible, svg[aria-label="New post"]:visible, svg[aria-label="Create"]:visible, a[href="#"]:has-text("Create"):visible, span:text-is("Create"):visible, div[role="button"]:has-text("Create"):visible';
        let createBtn = page.locator(createSelector).first();
        await createBtn.waitFor({ state: 'visible', timeout: 20000 });
        await createBtn.click({ force: true, timeout: 3000, noWaitAfter: true }).catch(async () => {
          await createBtn.evaluate(el => (el.closest('a, div[role="button"], button') || el).click()).catch(() => {});
        });
        // 1-second cadence after click
        await page.waitForTimeout(1000);

        // 2. Check if Create Dialog opened directly, otherwise check for submenu "Post"
        const createDialog = page.locator('div[role="dialog"]').first();
        const dialogDirectlyOpened = await createDialog.isVisible({ timeout: 1000 }).catch(() => false);
        if (!dialogDirectlyOpened) {
          try {
            const postItem = page.locator('svg[aria-label="Post"]:visible, span:text-is("Post"):visible, div[role="button"]:has-text("Post"):visible').first();
            if (await postItem.isVisible({ timeout: 1500 }).catch(() => false)) {
              await postItem.click({ force: true, timeout: 3000, noWaitAfter: true }).catch(async () => {
                await postItem.evaluate(el => (el.closest('div[role="button"], button, a') || el).click()).catch(() => {});
              });
              // 1-second cadence after click
              await page.waitForTimeout(1000);
            }
          } catch (_) {}
        }

        // 3. Wait for Create Dialog and attach file
        await createDialog.waitFor({ state: 'visible', timeout: 20000 });
        const fileInput = page.locator('div[role="dialog"] input[type="file"], input[type="file"]').first();
        await fileInput.waitFor({ state: 'attached', timeout: 20000 });
        await fileInput.setInputFiles(currentPath);
        console.log(`[Tab ${tabNumber}] File attached: ${originalName}`);
        // 1-second cadence after file attached
        await page.waitForTimeout(1000);

        // 4. Robust wait for Next button with active Reels announcement auto-dismissal
        const okBtn = page.locator('button:has-text("OK"):visible, div[role="button"]:has-text("OK"):visible').first();
        const nextBtnSelector = 'div[role="dialog"] div[role="button"]:has-text("Next"):visible, div[role="dialog"] button:has-text("Next"):visible, div[role="dialog"] span:text-is("Next"):visible, div[role="dialog"] div:text-is("Next"):visible, div[role="button"]:has-text("Next"):visible';
        const next1 = page.locator(nextBtnSelector).first();

        let nextReady = false;
        const startTime = Date.now();
        while (Date.now() - startTime < 60000) {
          if (await okBtn.isVisible().catch(() => false)) {
            console.log(`[Tab ${tabNumber}] Dismissing Reels announcement dialog...`);
            await okBtn.click({ force: true, timeout: 2000, noWaitAfter: true }).catch(async () => {
              await okBtn.evaluate(el => el.click()).catch(() => {});
            });
            await page.waitForTimeout(1000);
          }
          if (await next1.isVisible().catch(() => false)) {
            nextReady = true;
            break;
          }
          await page.waitForTimeout(500);
        }

        if (!nextReady) {
          throw new Error('Timeout waiting for Next button after 60s');
        }
        await page.waitForTimeout(1000);

        // 5. Select "Original" aspect ratio if available
        try {
          const cropBtn = page.locator('button:has(svg[aria-label="Select crop"]):visible, div[role="button"]:has(svg[aria-label="Select crop"]):visible, div[role="dialog"] svg[aria-label="Select crop"]:visible').first();
          if (await cropBtn.isVisible({ timeout: 1000 })) {
            await cropBtn.click({ force: true, timeout: 2000, noWaitAfter: true }).catch(async () => {
              await cropBtn.evaluate(el => el.click()).catch(() => {});
            });
            await page.waitForTimeout(1000);
            const originalOption = page.locator('div[role="button"]:has(span:text-is("Original")):visible, span:text-is("Original"):visible').first();
            if (await originalOption.isVisible({ timeout: 1000 })) {
              await originalOption.click({ force: true, timeout: 2000, noWaitAfter: true }).catch(async () => {
                await originalOption.evaluate(el => el.click()).catch(() => {});
              });
              await page.waitForTimeout(1000);
            }
          }
        } catch (_) {}

        // 6. Click 1st Next (Filters/Trim step)
        await next1.click({ force: true, timeout: 4000, noWaitAfter: true }).catch(async () => {
          await next1.evaluate(el => (el.closest('div[role="button"], button') || el).click()).catch(() => {});
        });
        // 1-second cadence after 1st Next
        await page.waitForTimeout(1000);

        // 7. Click 2nd Next (Caption step)
        const next2 = page.locator(nextBtnSelector).first();
        await next2.waitFor({ state: 'visible', timeout: 30000 });
        await next2.click({ force: true, timeout: 4000, noWaitAfter: true }).catch(async () => {
          await next2.evaluate(el => (el.closest('div[role="button"], button') || el).click()).catch(() => {});
        });
        // 1-second cadence after 2nd Next
        await page.waitForTimeout(1000);

        // 8. Inject Caption and Hashtags (fast DataTransfer paste)
        console.log(`[Tab ${tabNumber}] Inserting caption and tags...`);
        await insertCaption(page, finalCaption);
        await page.waitForTimeout(1000);

        // 9. Click Share
        const shareBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Share"):visible, div[role="dialog"] button:has-text("Share"):visible, div[role="button"]:has-text("Share"):visible, button:has-text("Share"):visible').last();
        await shareBtn.waitFor({ state: 'visible', timeout: 20000 });
        await shareBtn.click({ force: true, timeout: 4000, noWaitAfter: true }).catch(async () => {
          await shareBtn.evaluate(el => (el.closest('div[role="button"], button') || el).click()).catch(() => {});
        });
        console.log(`[Tab ${tabNumber}] Upload started for: ${originalName}`);
        await page.waitForTimeout(1000);

      // 10. Wait for Done button or upload confirmation
      console.log(`[Tab ${tabNumber}] Waiting for post to finish sharing & Done button...`);
      const doneBtnSelector = 'div[role="button"]:has-text("Done"):visible, button:has-text("Done"):visible, div[role="dialog"] div[role="button"]:has-text("Done"):visible, div[role="dialog"] button:has-text("Done"):visible';
      const sharedSuccessSelector = 'div[role="dialog"]:has-text("shared"), div[role="dialog"]:has-text("Shared"), div[role="dialog"] svg[aria-label="Animated checkmark"]';

      const uploadStartTime = Date.now();
      while (Date.now() - uploadStartTime < 180000) {
        const doneBtn = page.locator(doneBtnSelector).first();
        if (await doneBtn.isVisible().catch(() => false)) {
          console.log(`[Tab ${tabNumber}] Done button detected! Clicking...`);
          await doneBtn.click({ force: true, timeout: 3000, noWaitAfter: true }).catch(async () => {
            await doneBtn.evaluate(el => el.click()).catch(() => {});
          });
          await page.waitForTimeout(1000);
          break;
        }
        const sharedInd = page.locator(sharedSuccessSelector).first();
        if (await sharedInd.isVisible().catch(() => false)) {
          console.log(`[Tab ${tabNumber}] Shared confirmation detected! Closing dialog...`);
          await page.waitForTimeout(1000);
          const doneBtnAfter = page.locator(doneBtnSelector).first();
          if (await doneBtnAfter.isVisible().catch(() => false)) {
            await doneBtnAfter.click({ force: true, timeout: 3000, noWaitAfter: true }).catch(async () => {
              await doneBtnAfter.evaluate(el => el.click()).catch(() => {});
            });
            await page.waitForTimeout(1000);
          } else {
            const closeBtn = page.locator('div[role="dialog"] svg[aria-label="Close"]:visible, div[role="dialog"] [aria-label="Close"]:visible, svg[aria-label="Close"]:visible').first();
            if (await closeBtn.isVisible().catch(() => false)) {
              await closeBtn.click({ force: true, timeout: 3000, noWaitAfter: true }).catch(async () => {
                await closeBtn.evaluate(el => (el.closest('div[role="button"], button') || el).click()).catch(() => {});
              });
              await page.waitForTimeout(1000);
            }
          }
          break;
        }
        const dialogStillOpen = await page.locator('div[role="dialog"]').first().isVisible().catch(() => false);
        if (!dialogStillOpen && (Date.now() - uploadStartTime > 4000)) {
          break;
        }
        await page.waitForTimeout(500);
      }

      // Cleanly close modal if still lingering
      try {
        const closeBtn = page.locator('div[role="dialog"] svg[aria-label="Close"]:visible, div[role="dialog"] [aria-label="Close"]:visible, svg[aria-label="Close"]:visible').first();
        if (await closeBtn.isVisible().catch(() => false)) {
          await closeBtn.click({ force: true, timeout: 2000, noWaitAfter: true }).catch(async () => {
            await closeBtn.evaluate(el => (el.closest('div[role="button"], button') || el).click()).catch(() => {});
          });
          await page.waitForTimeout(1000);
        }
      } catch (_) {}

      totalFinished++;
      console.log(`[Tab ${tabNumber}] Successfully shared: ${originalName} (Total posted: ${totalFinished}${POST_LIMIT > 0 ? ` / ${POST_LIMIT}` : ''})`);

      const cleanFilename = originalName.replace(/^(tab\d+_)+/, '');
      const destination = path.join(finishedFolder, cleanFilename);
      fs.renameSync(currentPath, destination);

      // 1-second cadence before proceeding to next video
      await page.waitForTimeout(1000);

    } catch (err) {
      console.error(`[Tab ${tabNumber}] Error on ${originalName}:`, err.message);
      if (POST_LIMIT > 0 && totalClaimed > 0) {
        totalClaimed--;
      }
      const cleanFilename = path.basename(currentPath).replace(/^(tab\d+_)+/, '');
      const recoveryPath = path.join(videosFolder, cleanFilename);
      if (fs.existsSync(currentPath)) {
        try {
          fs.renameSync(currentPath, recoveryPath);
        } catch (_) {}
      }
      // If an error occurred, gently dismiss any open dialog
      try {
        const closeBtn = page.locator('div[role="dialog"] svg[aria-label="Close"]:visible, div[role="dialog"] [aria-label="Close"]:visible').first();
        if (await closeBtn.isVisible({ timeout: 500 }).catch(() => false)) {
          await closeBtn.click({ force: true, timeout: 2000, noWaitAfter: true }).catch(async () => {
            await closeBtn.evaluate(el => (el.closest('div[role="button"], button') || el).click()).catch(() => {});
          });
          await page.waitForTimeout(500);
          const discardBtn = page.locator('button:has-text("Discard"):visible, div[role="button"]:has-text("Discard"):visible').first();
          if (await discardBtn.isVisible({ timeout: 500 }).catch(() => false)) {
            await discardBtn.click({ force: true, timeout: 2000, noWaitAfter: true }).catch(async () => {
              await discardBtn.evaluate(el => el.click()).catch(() => {});
            });
            await page.waitForTimeout(500);
          }
        }
      } catch (_) {}
      await page.waitForTimeout(2000);
    }
  }
}

(async () => {
  if (ACCOUNT_INDEX > 0) {
    console.log(`[Batch Stagger] Delaying __ACCOUNT_NAME__ browser launch by ${ACCOUNT_INDEX * 4}s to prevent CPU/disk spikes...`);
    await new Promise(r => setTimeout(r, ACCOUNT_INDEX * 4000));
  }
  const sessionDir = path.join(__dirname, __SESSION_DIR__);
  cleanProfileLocks(sessionDir);
  const context = await chromium.launchPersistentContext(sessionDir, {
    headless: false,
    args: [
      '--start-maximized',
      '--disable-notifications',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-background-media-suspend',
      '--disable-features=CalculateNativeWinOcclusion,BackgroundVideoTrackOptimization',
      '--no-sandbox'
    ],
    permissions: ['clipboard-read', 'clipboard-write']
  });
  const pages = [];
  const firstPage = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
  pages.push(firstPage);
  console.log('Checking Instagram session for __ACCOUNT_NAME__...');
  await firstPage.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded' });
  await firstPage.waitForTimeout(1000);
  const authSelector = 'svg[aria-label="New post"], svg[aria-label="Create"], svg[aria-label="Home"], a[href*="/direct/"], svg[aria-label="Search"], img[alt*="profile"], a[href*="/explore/"]';
  const loginSelector = 'input[name="username"], input[name="password"]';
  let isAuthenticated = false;
  const startCheck = Date.now();
  while (Date.now() - startCheck < 30000) {
    const authEl = await firstPage.$(authSelector).catch(() => null);
    if (authEl) {
      isAuthenticated = true;
      break;
    }
    const currentUrl = firstPage.url();
    if (currentUrl.includes('/accounts/login') || currentUrl.includes('/accounts/emailsignup')) {
      const loginEl = await firstPage.$(loginSelector).catch(() => null);
      if (loginEl) {
        isAuthenticated = false;
        break;
      }
    }
    await firstPage.waitForTimeout(500);
  }
  const isLoginPage = firstPage.url().includes('/accounts/login') || (await firstPage.$(loginSelector).catch(() => null));
  if (!isAuthenticated && isLoginPage) {
    console.log('\n===============================================================');
    console.log('>>> ACTION REQUIRED: PLEASE LOG INTO YOUR __ACCOUNT_NAME__ ACCOUNT <<<');
    console.log('>>> Open the browser window and enter credentials. <<<');
    console.log('>>> Script is paused waiting for your login to finish...        <<<');
    console.log('===============================================================\n');
    await firstPage.bringToFront();
    await firstPage.waitForSelector(authSelector, { timeout: 0 });
    console.log('\n>>> __ACCOUNT_NAME__ login verified! Session saved. <<<\n');
    await firstPage.waitForTimeout(2000);
  } else {
    console.log('__ACCOUNT_NAME__ session verified! Proceeding with uploads...');
  }
  if (CONCURRENT_TABS > 1) {
    console.log(`Opening ${CONCURRENT_TABS - 1} additional worker tab(s) for __ACCOUNT_NAME__${POST_LIMIT > 0 ? ` (Post limit: ${POST_LIMIT})` : ''}...`);
    for (let i = 1; i < CONCURRENT_TABS; i++) {
      const newP = await context.newPage();
      pages.push(newP);
      await newP.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded' }).catch(() => {});
      await newP.waitForTimeout(1000);
    }
  }
  console.log('Starting parallel upload workers for __ACCOUNT_NAME__...');
  await Promise.all(pages.map((p, idx) => runWorker(p, idx + 1)));
  console.log('\nAll videos processed across all tabs for __ACCOUNT_NAME__!');
  await context.close();
})();
