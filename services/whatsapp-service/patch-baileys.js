const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'node_modules', '@whiskeysockets', 'baileys', 'lib', 'Socket', 'messages-recv.js');

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  // Match both CRLF and LF
  const targetRegex = /const sendToAll = !jidDecode\(participant\)\?\.device;\r?\n\s*await assertSessions\(\[participant\], true\);/;
  const replacement = `const sendToAll = !jidDecode(participant)?.device;\n        if (!participant.endsWith('@lid')) {\n            await assertSessions([participant], true);\n        }`;

  if (content.includes("!participant.endsWith('@lid')")) {
    console.log('[patch-baileys] messages-recv.js is already patched.');
  } else if (targetRegex.test(content)) {
    content = content.replace(targetRegex, replacement);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('[patch-baileys] Successfully patched messages-recv.js to protect @lid Signal sessions.');
  } else {
    console.warn('[patch-baileys] Target snippet not found in messages-recv.js. Verify Baileys version.');
  }
} else {
  console.log('[patch-baileys] Baileys messages-recv.js not found at expected path.');
}
