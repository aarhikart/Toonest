'use client';

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  ExternalLink,
  Code,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface AutoClickModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const USERSCRIPT_CODE = `// ==UserScript==
// @name         ToolNest Instagram DM Auto-Clicker & Helper
// @namespace    https://toolnest.app/
// @version      1.2
// @description  Automatically clicks the "Message" button and types your prepared message into Instagram's chat composer.
// @author       ToolNest
// @match        https://www.instagram.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // 1. Check if opened from ToolNest (#toolnest or #toolnest_msg=...)
  const hash = window.location.hash || '';
  const search = window.location.search || '';
  const isToolNest = hash.includes('toolnest') || search.includes('toolnest');

  // Extract message passed in URL hash (zero clipboard permissions needed!)
  let passedMessage = '';
  if (hash.includes('toolnest_msg=')) {
    try {
      const match = hash.match(/toolnest_msg=([^&]+)/);
      if (match && match[1]) {
        passedMessage = decodeURIComponent(match[1]);
      }
    } catch (e) {
      console.warn('[ToolNest Helper] Could not decode hash message:', e);
    }
  }

  // Floating helper badge on Instagram
  function showFloatingBadge(text, isSuccess = true) {
    let badge = document.getElementById('toolnest-floating-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'toolnest-floating-badge';
      badge.style.cssText = \`
        position: fixed;
        bottom: 24px;
        left: 24px;
        z-index: 999999;
        background: \${isSuccess ? '#5722AF' : '#1e293b'};
        color: #ffffff;
        padding: 10px 16px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 12px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;
      \`;
      document.body.appendChild(badge);
    }
    badge.innerHTML = \`<span>⚡</span> \${text}\`;
    setTimeout(() => {
      if (badge) badge.style.opacity = '0.7';
    }, 4000);
  }

  // Wait for an element using MutationObserver
  function waitFor(selectorFn, timeoutMs = 8000) {
    return new Promise((resolve) => {
      const el = selectorFn();
      if (el) return resolve(el);

      const observer = new MutationObserver(() => {
        const found = selectorFn();
        if (found) {
          observer.disconnect();
          resolve(found);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeoutMs);
    });
  }

  // Find Instagram profile "Message" button
  function findMessageButton() {
    const buttons = Array.from(
      document.querySelectorAll('header div[role="button"], header button, div[role="button"], button')
    );
    return buttons.find((el) => {
      const txt = (el.innerText || el.textContent || '').trim();
      return txt === 'Message';
    });
  }

  // Find Instagram Lexical Message Input Editor (supports popup & direct page)
  function findLexicalEditor() {
    return document.querySelector(
      'div[role="textbox"][data-lexical-editor="true"], div[aria-label="Message"][contenteditable="true"], div[contenteditable="true"][role="textbox"]'
    );
  }

  // Correctly insert text into Meta's React Lexical engine
  function insertIntoLexical(editor, text) {
    if (!editor || !text) return;
    editor.focus();

    // 1. execCommand triggers Lexical's internal selection listener
    const inserted = document.execCommand('insertText', false, text);
    if (!inserted) {
      const inputEvent = new InputEvent('beforeinput', {
        inputType: 'insertText',
        data: text,
        bubbles: true,
        cancelable: true,
      });
      editor.dispatchEvent(inputEvent);
    }

    // Trigger input event
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // Automation procedure
  async function executeAutomation() {
    // If not a ToolNest trigger, don't interfere with standard browsing
    if (!isToolNest) return;

    showFloatingBadge('ToolNest Helper: Locating Message button...');

    const isProfile = !window.location.pathname.startsWith('/direct');

    if (isProfile) {
      // 1. Auto-Click "Message" button on profile
      const messageBtn = await waitFor(findMessageButton, 8000);
      if (messageBtn) {
        showFloatingBadge('Clicking Message button...');
        messageBtn.click();
      } else {
        console.log('[ToolNest Helper] Message button not detected or already in chat.');
      }
    }

    // 2. Wait for Lexical chat box
    const editor = await waitFor(findLexicalEditor, 9000);
    if (editor) {
      let textToInsert = passedMessage;

      // If not passed in hash, try reading from clipboard
      if (!textToInsert && navigator.clipboard && navigator.clipboard.readText) {
        try {
          textToInsert = await navigator.clipboard.readText();
        } catch (e) {
          console.log('[ToolNest Helper] Clipboard read denied:', e);
        }
      }

      if (textToInsert) {
        insertIntoLexical(editor, textToInsert);
        showFloatingBadge('✓ Message prepared in chat box! Hit Enter to send.');
      } else {
        showFloatingBadge('Chat box open. Press Ctrl+V to paste message.');
      }
    }
  }

  // Run on load
  if (document.readyState === 'complete') {
    executeAutomation();
  } else {
    window.addEventListener('load', executeAutomation);
  }
})();
`;

export const AutoClickModal: React.FC<AutoClickModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'userscript' | 'direct_explanation'>('userscript');

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(USERSCRIPT_CODE);
      setCopied(true);
      onShowToast('Helper Userscript copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onShowToast('Please manually select and copy the code below.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Instagram Auto-Click &amp; Auto-Fill Assistant
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automate clicking the &ldquo;Message&rdquo; button &amp; typing into Instagram&apos;s chat box
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4 flex gap-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('userscript')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'userscript'
                ? 'border-[#5722AF] text-[#5722AF] dark:text-[#9B6BE8]'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Method 1: Tampermonkey Auto-Click Script (Full Auto)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('direct_explanation')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'direct_explanation'
                ? 'border-[#5722AF] text-[#5722AF] dark:text-[#9B6BE8]'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Method 2: Direct DM Mode (No Setup Required)
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          {activeTab === 'userscript' ? (
            <>
              {/* Context Explanation */}
              <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                  <span>Why is a browser script used here?</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Web browsers enforce a strict security rule called the <strong>Same-Origin Policy (SOP)</strong>.
                  A web page on <code>toolnest.app</code> or <code>localhost</code> is blocked by Chrome/Firefox from clicking buttons
                  or writing text inside an external <code>instagram.com</code> tab.
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  This <strong>Tampermonkey Userscript</strong> runs locally inside your browser on <code>instagram.com</code>.
                  It detects when ToolNest opens a profile, automatically clicks the <strong>Message</strong> button, and puts your message directly into Instagram&apos;s text box!
                </p>
              </div>

              {/* Quick 3-Step Setup Guide */}
              <div className="space-y-3">
                <div className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Quick 60-Second Setup Guide
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-lg bg-[#5722AF] text-white font-bold text-xs flex items-center justify-center">
                        1
                      </span>
                      <a
                        href="https://www.tampermonkey.net/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-[#5722AF] dark:text-[#9B6BE8] hover:underline inline-flex items-center gap-0.5"
                      >
                        Install <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                      Install Tampermonkey
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      Free extension for Chrome, Edge, Firefox, or Brave.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <span className="w-6 h-6 rounded-lg bg-[#5722AF] text-white font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                      Create New Script
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      Click the Tampermonkey icon in your browser &rarr; <strong>&ldquo;Create a new script&rdquo;</strong>.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <span className="w-6 h-6 rounded-lg bg-[#5722AF] text-white font-bold text-xs flex items-center justify-center">
                      3
                    </span>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                      Paste &amp; Save
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      Paste the code below and press <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[9px]">Ctrl+S</kbd> to save.
                    </p>
                  </div>
                </div>
              </div>

              {/* Code Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Code className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                    <span>Helper Userscript Code</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#5722AF] hover:bg-[#481c91] text-white shadow-xs'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied Code!' : 'Copy Script Code'}</span>
                  </button>
                </div>

                <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-56 leading-relaxed">
                  <pre>{USERSCRIPT_CODE}</pre>
                </div>
              </div>

              {/* Verified Features */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Verified Features Included in Script:</span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    Auto-clicks Instagram &ldquo;Message&rdquo; button
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    Waits for the 360x521px chat box
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    Focuses &amp; fills Lexical contenteditable box
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    Only triggers when opened from ToolNest
                  </li>
                </ul>
              </div>
            </>
          ) : (
            /* Direct DM Mode Tab */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200 text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>No Extensions Needed: Direct DM Mode</span>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  If you do not wish to install a browser script, you can use ToolNest&apos;s built-in <strong>&ldquo;Direct DM Mode&rdquo;</strong>.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-900 dark:text-white">How Direct DM Mode Works:</div>
                <ol className="list-decimal pl-5 space-y-2 text-slate-600 dark:text-slate-300 leading-relaxed">
                  <li>
                    ToolNest opens the direct conversation URL:
                    <code className="block mt-1 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#5722AF] dark:text-[#9B6BE8] font-mono text-[11px]">
                      https://www.instagram.com/direct/t/{'{username}'}/
                    </code>
                  </li>
                  <li>
                    This skips the profile page entirely and <strong>directly opens the chat screen</strong> with that user.
                  </li>
                  <li>
                    ToolNest automatically copies your message when you click the button.
                  </li>
                  <li>
                    You just press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">Ctrl+V</kbd> and <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">Enter</kbd>!
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            100% private &bull; Client-side only &bull; No credentials stored
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
