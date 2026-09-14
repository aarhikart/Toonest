const fs = require('fs');
const path = require('path');

// 1. Patch messages-recv.js for proper @lid retry resolution and reliable Signal retry delivery
const messagesRecvFile = path.join(__dirname, 'node_modules', '@whiskeysockets', 'baileys', 'lib', 'Socket', 'messages-recv.js');

if (fs.existsSync(messagesRecvFile)) {
  let content = fs.readFileSync(messagesRecvFile, 'utf8');

  // Replace sendMessagesAgain with improved retry handler (supports Windows \r\n and Linux \n)
  const sendMessagesAgainRegex = /const sendMessagesAgain = async \(key, ids, retryNode\) => \{[\s\S]*?\r?\n\s*\};(?=\s*const handleReceipt)/;
  
  const newSendMessagesAgain = `const sendMessagesAgain = async (key, ids, retryNode) => {
        try {
            console.log('[WhatsApp Worker] sendMessagesAgain triggered for message(s):', ids);
            // 1. Resolve original messages from message store
            const msgs = await Promise.all(ids.map(id => getMessage({ ...key, id })));
            let relayJid = key.remoteJid;
            
            // 2. Resolve LID to original phone JID if receipt came from a LID
            if (relayJid.endsWith('@lid') && typeof config.resolveLidToJid === 'function') {
                const resolved = config.resolveLidToJid(ids[0], relayJid);
                if (resolved && !resolved.endsWith('@lid')) {
                    console.log('[WhatsApp Worker] sendMessagesAgain: Resolved LID ' + relayJid + ' -> ' + resolved);
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
            const sendToAll = !jidDecode(participant)?.device;
            
            // 4. Force fresh PreKey bundle ONLY on valid phone JID (never query WhatsApp for @lid)
            if (!participant.endsWith('@lid')) {
                try {
                    await assertSessions([participant], true);
                } catch (sessErr) {
                    console.warn('[WhatsApp Worker] assertSessions participant retry warning:', sessErr?.message || sessErr);
                }
            }
            if (relayJid !== participant && relayJid.endsWith('@s.whatsapp.net') && !isJidGroup(relayJid)) {
                try {
                    await assertSessions([relayJid], true);
                } catch (sessErr) {
                    console.warn('[WhatsApp Worker] assertSessions relayJid retry warning:', sessErr?.message || sessErr);
                }
            }
            if (isJidGroup(relayJid)) {
                await authState.keys.set({ 'sender-key-memory': { [relayJid]: null } });
            }
            
            // 5. Re-dispatch original messages with proper device fanout
            for (const [i, msg] of msgs.entries()) {
                if (msg) {
                    updateSendMessageAgainCount(ids[i], participant);
                    const msgRelayOpts = { messageId: ids[i] };
                    if (sendToAll) {
                        msgRelayOpts.useUserDevicesCache = false;
                    } else {
                        msgRelayOpts.participant = {
                            jid: participant,
                            count: retryCount
                        };
                    }
                    try {
                        console.log('[WhatsApp Worker] Relaying message ' + ids[i] + ' to ' + relayJid + ' (sendToAll: ' + sendToAll + ', count: ' + retryCount + ')...');
                        await relayMessage(relayJid, msg, msgRelayOpts);
                        console.log('[WhatsApp Worker] Successfully dispatched retry response for message ' + ids[i] + ' to ' + relayJid + ' (participant: ' + participant + ', count: ' + retryCount + ')');
                    } catch (relayErr) {
                        console.error('[WhatsApp Worker] Error during relayMessage in retry:', relayErr);
                    }
                } else {
                    console.warn('[WhatsApp Worker] recv retry request for ' + ids[i] + ', but message not found in store');
                }
            }
        } catch (fatalRetryErr) {
            console.error('[WhatsApp Worker] Fatal error in sendMessagesAgain:', fatalRetryErr);
        }
    };`;

  if (sendMessagesAgainRegex.test(content)) {
    content = content.replace(sendMessagesAgainRegex, newSendMessagesAgain);
    console.log('[patch-baileys] Successfully patched sendMessagesAgain in messages-recv.js');
  } else {
    console.log('[patch-baileys] sendMessagesAgain already patched or regex did not match');
  }

  // B. Patch fromMe calculation in handleReceipt to ensure retry receipts are never marked fromMe = false
  const fromMeRegex = /const fromMe = !attrs\.recipient \|\| \(\(attrs\.type === 'retry' \|\| attrs\.type === 'sender'\) && isNodeFromMe\);/;
  const newFromMe = "const fromMe = !attrs.recipient || attrs.type === 'retry' || ((attrs.type === 'sender') && isNodeFromMe);";
  if (fromMeRegex.test(content)) {
    content = content.replace(fromMeRegex, newFromMe);
    console.log('[patch-baileys] Successfully patched handleReceipt fromMe check in messages-recv.js');
  } else {
    console.log('[patch-baileys] handleReceipt fromMe check already patched');
  }

  // C. Patch if (attrs.type === 'retry') block to guarantee key.fromMe = true and bypass drop
  const retryBlockRegex = /if \(attrs\.type === 'retry'\) \{\r?\n\s*\/\/ correctly set who is asking for the retry\r?\n\s*key\.participant = key\.participant \|\| attrs\.from;\r?\n\s*const retryNode = getBinaryNodeChild\(node, 'retry'\);\r?\n\s*if \(willSendMessageAgain\(ids\[0\], key\.participant\)\) \{\r?\n\s*if \(key\.fromMe\) \{/;
  
  const newRetryBlock = `if (attrs.type === 'retry') {
                        // correctly set who is asking for the retry
                        key.participant = key.participant || attrs.from;
                        key.fromMe = true; // Patch: Ensure retry requests always trigger sendMessagesAgain
                        const retryNode = getBinaryNodeChild(node, 'retry');
                        if (willSendMessageAgain(ids[0], key.participant)) {
                            if (key.fromMe || true) {`;

  if (retryBlockRegex.test(content)) {
    content = content.replace(retryBlockRegex, newRetryBlock);
    console.log('[patch-baileys] Successfully patched retryBlock in messages-recv.js');
  } else {
    console.log('[patch-baileys] retryBlock already patched or regex did not match');
  }

  fs.writeFileSync(messagesRecvFile, content, 'utf8');
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
