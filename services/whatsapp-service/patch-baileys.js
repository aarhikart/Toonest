const fs = require('fs');
const path = require('path');

// 1. Patch messages-recv.js for proper @lid retry resolution
const messagesRecvFile = path.join(__dirname, 'node_modules', '@whiskeysockets', 'baileys', 'lib', 'Socket', 'messages-recv.js');

if (fs.existsSync(messagesRecvFile)) {
  let content = fs.readFileSync(messagesRecvFile, 'utf8');

  // Replace sendMessagesAgain with LID resolver
  const sendMessagesAgainRegex = /const sendMessagesAgain = async \(key, ids, retryNode\) => \{[\s\S]*?\n    \};(?=\s*const handleReceipt)/;
  
  const newSendMessagesAgain = `const sendMessagesAgain = async (key, ids, retryNode) => {
        // Resolve original message from message store
        const msgs = await Promise.all(ids.map(id => getMessage({ ...key, id })));
        let relayJid = key.remoteJid;
        
        // If the retry receipt comes from a LID (multi-device companion), resolve to original phone JID
        if (relayJid.endsWith('@lid') && typeof config.resolveLidToJid === 'function') {
            const resolved = config.resolveLidToJid(ids[0], relayJid);
            if (resolved && !resolved.endsWith('@lid')) {
                logger.info({ id: ids[0], lid: relayJid, resolved }, 'sendMessagesAgain: resolved LID retry to original chat JID');
                relayJid = resolved;
            }
        }
        
        // If resolved to a phone JID, participant must be the phone JID, NOT the LID
        const participant = relayJid.endsWith('@lid') ? (key.participant || relayJid) : relayJid;
        const sendToAll = !jidDecode(participant)?.device || key.remoteJid.endsWith('@lid');
        
        if (!participant.endsWith('@lid')) {
            await assertSessions([participant], true);
        }
        if (isJidGroup(relayJid)) {
            await authState.keys.set({ 'sender-key-memory': { [relayJid]: null } });
        }
        logger.debug({ participant, sendToAll, relayJid }, 'forced new session for retry recp');
        for (const [i, msg] of msgs.entries()) {
            if (msg) {
                updateSendMessageAgainCount(ids[i], participant);
                const msgRelayOpts = { messageId: ids[i] };
                if (sendToAll) {
                    msgRelayOpts.useUserDevicesCache = false;
                }
                else {
                    msgRelayOpts.participant = {
                        jid: participant,
                        count: +retryNode.attrs.count
                    };
                }
                await relayMessage(relayJid, msg, msgRelayOpts);
            }
            else {
                logger.debug({ jid: relayJid, id: ids[i] }, 'recv retry request, but message not available');
            }
        }
    };`;

  if (sendMessagesAgainRegex.test(content)) {
    content = content.replace(sendMessagesAgainRegex, newSendMessagesAgain);
    fs.writeFileSync(messagesRecvFile, content, 'utf8');
    console.log('[patch-baileys] Successfully patched sendMessagesAgain in messages-recv.js');
  } else {
    console.warn('[patch-baileys] sendMessagesAgain regex did not match in messages-recv.js');
  }
} else {
  console.warn('[patch-baileys] messages-recv.js not found');
}

// 2. Patch session_cipher.js in libsignal to prevent noisy console spam on Bad MAC
const sessionCipherFile = path.join(__dirname, 'node_modules', 'libsignal', 'src', 'session_cipher.js');
if (fs.existsSync(sessionCipherFile)) {
  let content = fs.readFileSync(sessionCipherFile, 'utf8');
  const targetLogging = `        console.error("Failed to decrypt message with any known session...");
        for (const e of errs) {
            console.error("Session error:" + e, e.stack);
        }`;
  
  const quietLogging = `        // Suppress noisy stack traces for Bad MAC on obsolete/companion sessions
        if (!errs.some(e => e && e.message && e.message.includes('Bad MAC'))) {
            console.error("Failed to decrypt message with any known session...");
            for (const e of errs) {
                console.error("Session error:" + e);
            }
        }`;

  // Match CRLF and LF
  const targetRegex = /console\.error\("Failed to decrypt message with any known session\.\.\."\);\r?\n\s*for \(const e of errs\) \{\r?\n\s*console\.error\("Session error:" \+ e, e\.stack\);\r?\n\s*\}/;

  if (targetRegex.test(content)) {
    content = content.replace(targetRegex, quietLogging.trim());
    fs.writeFileSync(sessionCipherFile, content, 'utf8');
    console.log('[patch-baileys] Successfully patched session_cipher.js to suppress Bad MAC spam');
  } else {
    console.log('[patch-baileys] session_cipher.js already patched or regex did not match');
  }
}
