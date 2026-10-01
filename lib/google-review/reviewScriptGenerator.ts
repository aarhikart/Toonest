/**
 * Google Review Auto Feedback Loop Script Generator
 * Accurately isolates the <iframe name="goog-reviews-write-widget"> and targets
 * .lv4IMd[aria-label="Rating stars"] .s2xyy[data-rating="5"].
 */

export interface GoogleReviewConfig {
  rating: number;
  enableAspects: boolean;
  reviews: string[];
  loopCount: number;
  delayBetweenReviewsMs: number;
  autoSubmit: boolean;
}

export const DEFAULT_HOTEL_REVIEWS: string[] = [
  "Excellent room service and very clean environment. Highly recommended!",
  "Great hospitality, the staff was polite and attended to all our requests quickly.",
  "Loved the ambiance and quick check-in process. Will definitely visit again.",
  "Very comfortable stay. Room service was prompt and the food was delicious.",
  "Spacious rooms, well-maintained facilities, and courteous staff members.",
  "Outstanding experience from start to finish. Everything exceeded expectations.",
  "The staff went above and beyond to make our stay relaxing and comfortable.",
  "Top-notch cleanliness and very quiet atmosphere. Perfect for a peaceful stay.",
  "Quick response from the front desk and room service was on point.",
  "Wonderful experience overall. Clean rooms, good food, and friendly service."
];

export function generateGoogleReviewScript(config: GoogleReviewConfig): string {
  const reviewsJson = JSON.stringify(
    config.reviews && config.reviews.length > 0 ? config.reviews : DEFAULT_HOTEL_REVIEWS,
    null,
    2
  );
  const rating = config.rating || 5;
  const loopCount = config.loopCount || 10;
  const delayMs = config.delayBetweenReviewsMs || 5000;
  const enableAspects = config.enableAspects !== false;
  const autoSubmit = config.autoSubmit !== false;

  return `// ====================================================================
// 🚀 Google Review Auto Feedback Loop (Iframe Target: goog-reviews-write-widget)
// ====================================================================

const reviewMessages = ${reviewsJson};

window.stopReviewLoop = false;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: Dispatches real mouse events to trigger Google's jsaction handler
function triggerMouseClick(el) {
  if (!el) return false;
  try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}

  const win = el.ownerDocument ? el.ownerDocument.defaultView || window : window;
  const rect = el.getBoundingClientRect();
  const x = Math.round(rect.left + (rect.width ? rect.width / 2 : 15));
  const y = Math.round(rect.top + (rect.height ? rect.height / 2 : 15));

  const opts = {
    bubbles: true,
    cancelable: true,
    composed: true,
    view: win,
    clientX: x,
    clientY: y,
    button: 0
  };

  ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach((type) => {
    try {
      const isPointer = type.startsWith('pointer');
      const EvtClass = isPointer && win.PointerEvent ? win.PointerEvent : win.MouseEvent;
      el.dispatchEvent(new EvtClass(type, opts));
    } catch (e) {}
  });

  if (typeof el.click === 'function') {
    try { el.click(); } catch (e) {}
  }
  return true;
}

// Special Star Clicker: Targets star div, inner path, and sends Space key
function click5StarRating(doc) {
  // Specifically look for the primary rating container (.lv4IMd[aria-label*="Rating stars"])
  const starContainer = doc.querySelector('.lv4IMd[aria-label*="Rating stars"], .RAKQ3e .lv4IMd');
  const star5 = starContainer 
    ? starContainer.querySelector('.s2xyy[data-rating="${rating}"]')
    : doc.querySelector('.s2xyy[data-rating="${rating}"], div[role="radio"][data-rating="${rating}"]');

  if (!star5) {
    console.warn("⚠️ 5-star element not found in review popup.");
    return false;
  }

  star5.focus();

  // 1. Click star container with coordinates
  triggerMouseClick(star5);

  // 2. Click inner path & svg element
  const path = star5.querySelector('path');
  if (path) triggerMouseClick(path);

  const svg = star5.querySelector('svg');
  if (svg) triggerMouseClick(svg);

  // 3. Keyboard trigger (Space & Enter)
  const win = star5.ownerDocument ? star5.ownerDocument.defaultView || window : window;
  try {
    star5.dispatchEvent(new win.KeyboardEvent('keydown', { key: ' ', code: 'Space', keyCode: 32, bubbles: true }));
    star5.dispatchEvent(new win.KeyboardEvent('keyup', { key: ' ', code: 'Space', keyCode: 32, bubbles: true }));
    star5.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
  } catch (e) {}

  console.log("⭐ Clicked 5 stars! aria-checked:", star5.getAttribute('aria-checked'), "rating:", star5.parentElement?.getAttribute('data-rating'));
  return true;
}

// Helper: Sets Google textarea value using native descriptor and dispatches events
function setGoogleTextarea(textarea, text) {
  if (!textarea) return false;
  textarea.focus();

  const win = textarea.ownerDocument ? textarea.ownerDocument.defaultView || window : window;
  const nativeSetter = Object.getOwnPropertyDescriptor(win.HTMLTextAreaElement.prototype, 'value')?.set;
  if (nativeSetter) {
    nativeSetter.call(textarea, text);
  } else {
    textarea.value = text;
  }

  textarea.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  textarea.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  try {
    textarea.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    textarea.dispatchEvent(new win.KeyboardEvent('keyup', { key: 'a', bubbles: true }));
  } catch (e) {}
  return true;
}

// Locates the actual review popup document (inside goog-reviews-write-widget iframe)
async function getReviewPopupDoc(timeoutMs = 15000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (window.stopReviewLoop) return null;

    // Check 1: We are executing directly in the iframe
    if (window.name === 'goog-reviews-write-widget' || document.querySelector('.lv4IMd[aria-label*="Rating stars"]')) {
      return document;
    }

    // Check 2: We are executing in 'top', find the iframe
    const iframe = document.querySelector('iframe[name="goog-reviews-write-widget"], iframe.goog-reviews-write-widget');
    if (iframe) {
      try {
        const idoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (idoc && idoc.querySelector('.lv4IMd[aria-label*="Rating stars"], .s2xyy[data-rating="${rating}"], textarea[jsname="YPqjbf"]')) {
          return idoc;
        }
      } catch (err) {
        console.warn("⚠️ Cross-origin security blocked direct access from 'top'. Please select 'goog-reviews-write-widget' in the Console dropdown.");
        return null;
      }
    }

    await sleep(350);
  }

  return null;
}

async function runReviewFlow(messageIndex = 0) {
  console.log(\`\\n========================================\`);
  console.log(\`▶️ Processing Review \${messageIndex + 1}/\${reviewMessages.length}: "\${reviewMessages[messageIndex]}"\`);
  console.log(\`========================================\`);

  // Step 1: Connect to review popup
  let doc = await getReviewPopupDoc(2000);

  if (!doc) {
    console.log("Step 1: Opening 'Write a review' popup...");
    const writeBtn = document.querySelector('button[jsname="uge3Rd"], span.Y7kaaf button') 
      || Array.from(document.querySelectorAll('button')).find(b => (b.textContent || '').trim().toLowerCase().includes('write a review'));

    if (writeBtn) {
      triggerMouseClick(writeBtn);
      console.log("✅ Clicked 'Write a review' button.");
    }
    doc = await getReviewPopupDoc(15000);
  }

  if (!doc) {
    console.error("❌ Could not connect to review widget.");
    console.log("%c💡 TIP: In DevTools Console at the top-left, change the 'top' dropdown to 'goog-reviews-write-widget' and run again!", "color: #fbbf24; font-weight: bold; font-size: 13px;");
    return;
  }

  console.log("✅ Review widget connected!");

  // Step 2: Select 5 Stars
  await sleep(1500);
  click5StarRating(doc);

  // Optional: Rate Hotel Aspects (Rooms, Service, Location)
  await sleep(800);
  const aspectRooms = doc.querySelector('div[data-question-id="HOTELS_ASPECT_ROOMS"] .s2xyy[data-rating="${rating}"]');
  if (aspectRooms) { triggerMouseClick(aspectRooms); }

  const aspectService = doc.querySelector('div[data-question-id="HOTELS_ASPECT_SERVICES"] .s2xyy[data-rating="${rating}"]');
  if (aspectService) { triggerMouseClick(aspectService); }

  const aspectLocation = doc.querySelector('div[data-question-id="HOTELS_ASPECT_LOCATION"] .s2xyy[data-rating="${rating}"]');
  if (aspectLocation) { triggerMouseClick(aspectLocation); }

  await sleep(1500);
  if (window.stopReviewLoop) return;

  // Step 3: Enter Feedback Text
  const textarea = doc.querySelector('textarea[aria-label="Enter review"], textarea#c2, textarea[jsname="YPqjbf"]');
  if (textarea) {
    setGoogleTextarea(textarea, reviewMessages[messageIndex]);
    console.log(\`✍️ Step 3: Entered review message: "\${reviewMessages[messageIndex]}"\`);
  } else {
    console.warn("⚠️ Step 3: Textarea not found in popup.");
  }

  await sleep(2000);
  if (window.stopReviewLoop) return;

  // Step 4: Click Post Button
  const postBtn = doc.querySelector('button[jsname="IJM3w"], div.kEocrb button, .bTLhlf button.nCP5yc') 
    || Array.from(doc.querySelectorAll('button')).find(b => (b.textContent || '').trim().toLowerCase() === 'post');

  if (postBtn) {
    if (postBtn.disabled) {
      postBtn.removeAttribute('disabled');
      postBtn.disabled = false;
      postBtn.classList.remove('VfPpkd-LgbsSe-OWXEXe-dgl2Hf');
    }
${
  autoSubmit
    ? `    triggerMouseClick(postBtn);
    console.log("🚀 Step 4: Clicked 'Post' button successfully!");`
    : `    console.log("ℹ️ Step 4: Post button ready. (autoSubmit=false, run postBtn.click() manually)");`
}
  } else {
    console.warn("⚠️ Step 4: Post button not found.");
  }

  await sleep(4000);
  if (window.stopReviewLoop) return;

  // Step 5: Close Done dialog if present
  const doneBtn = doc.querySelector('button[aria-label="Done"], button[aria-label="Close"]') 
    || Array.from(doc.querySelectorAll('button, [role="button"]')).find(b => (b.textContent || '').trim().toLowerCase() === 'done')
    || document.querySelector('button[aria-label="Done"], button[aria-label="Close"]');

  if (doneBtn) {
    triggerMouseClick(doneBtn);
    console.log("✅ Step 5: Clicked 'Done' confirmation button.");
  }

  console.log(\`🎉 Review \${messageIndex + 1} finished!\`);
}

// Main execution loop: iterates through reviewMessages
async function runReviewLoop() {
  const total = Math.min(${loopCount}, reviewMessages.length);
  console.log(\`🚀 Starting auto review loop for \${total} messages...\`);
  console.log("👉 To STOP anytime, run: window.stopReviewLoop = true;");

  for (let i = 0; i < total; i++) {
    if (window.stopReviewLoop) {
      console.log("⏹️ Review loop stopped by user.");
      break;
    }

    await runReviewFlow(i);

    if (i < total - 1 && !window.stopReviewLoop) {
      console.log(\`⏳ Waiting ${delayMs / 1000}s before next review in loop...\`);
      await sleep(${delayMs});
    }
  }

  console.log("\\n🏁 All reviews completed successfully!");
}

// Start the loop automatically
runReviewLoop();
`;
}
