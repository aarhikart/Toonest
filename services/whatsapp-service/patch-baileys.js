const fs = require('fs');
const path = require('path');

// 1. Patch messages-recv.js for proper @lid retry resolution and reliable Signal retry delivery
const messagesRecvFile = path.join(__dirname, 'node_modules', '@whiskeysockets', 'baileys', 'lib', 'Socket', 'messages-recv.js');

if (fs.existsSync(messagesRecvFile)) {
  let content = fs.readFileSync(messagesRecvFile, 'utf8');

  // Replace sendMessagesAgain with improved retry handler (supports Windows \r\n and Linux \n)
  const sendMessagesAgainRegex = /const sendMessagesAgain = async \(key, ids, retryNode\) => \{[\s\S]*?\r?\n\s*\};(?=\s*const handleReceipt)/;
  
  const newSendMessagesAgain = `const sendMessagesAgain = async (key, ids, retryNode) => {
        // 1. Resolve original messages from message store
        const msgs = await Promise.all(ids.map(id => getMessage({ ...key, id })));
        let relayJid = key.remoteJid;
        
        // 2. Resolve LID to original phone JID if receipt came from a LID
        if (relayJid.endsWith('@lid') && typeof config.resolveLidToJid === 'function') {
            const resolved = config.resolveLidToJid(ids[0], relayJid);
            if (resolved && !resolved.endsWith('@lid')) {
                logger.info({ id: ids[0], lid: relayJid, resolved }, 'sendMessagesAgain: resolved LID retry to original chat JID');
                relayJid = resolved;
            }
        }
        
        // 3. Determine target participant JID (must be a valid phone JID, not LID)
        const rawParticipant = key.participant || key.remoteJid;
        let participant = rawParticipant;
        if (participant.endsWith('@lid') && relayJid.endsWith('@s.whatsapp.net')) {
            const device = jidDecode(participant)?.device;
            const phoneUser = jidDecode(relayJid)?.user;
            participant = jidEncode(phoneUser, 's.whatsapp.net', device);
        }
        
        const retryCount = +(retryNode?.attrs?.count || 1);
        
        // 4. CRITICAL: Never force-wipe open Signal sessions on first retry (retryCount === 1)!
        // Only re-fetch if session is completely missing or repeated retry failure (retryCount > 2)
        if (!participant.endsWith('@lid')) {
            await assertSessions([participant], retryCount > 2);
        }
        if (isJidGroup(relayJid)) {
            await authState.keys.set({ 'sender-key-memory': { [relayJid]: null } });
        }
        logger.debug({ participant, relayJid, retryCount }, 'sendMessagesAgain: prepared retry dispatch');
        for (const [i, msg] of msgs.entries()) {
            if (msg) {
                updateSendMessageAgainCount(ids[i], participant);
                const msgRelayOpts = {
                    messageId: ids[i],
                    participant: {
                        jid: participant,
                        count: retryCount
                    },
                    additionalAttributes: {
                        device_fanout: 'false'
                    },
                    useUserDevicesCache: false
                };
                await relayMessage(relayJid, msg, msgRelayOpts);
                logger.info({ id: ids[i], relayJid, participant, retryCount }, 'sendMessagesAgain: retry response dispatched successfully');
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
