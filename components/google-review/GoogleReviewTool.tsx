'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Terminal,
  Copy,
  Check,
  Download,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  Clock,
  Star,
  Settings2,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Layers,
  MessageSquare,
  AlertTriangle,
  ChevronRight,
  Send,
  Zap,
} from 'lucide-react';
import {
  GoogleReviewConfig,
  DEFAULT_HOTEL_REVIEWS,
  generateGoogleReviewScript,
} from '@/lib/google-review/reviewScriptGenerator';

export const GoogleReviewTool: React.FC = () => {
  // State: Reviews List (prefilled with user's exact 10 messages)
  const [reviews, setReviews] = useState<string[]>(DEFAULT_HOTEL_REVIEWS);
  const [newReviewText, setNewReviewText] = useState<string>('');

  // State: Settings
  const [rating, setRating] = useState<number>(5);
  const [enableAspects, setEnableAspects] = useState<boolean>(true);
  const [autoSubmit, setAutoSubmit] = useState<boolean>(true);
  const [loopCount, setLoopCount] = useState<number>(10);
  const [delayBetweenReviewsMs, setDelayBetweenReviewsMs] = useState<number>(5000);

  // UI state
  const [copied, setCopied] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 2800);
  };

  // Generate the clean, tested JavaScript script
  const generatedScript = useMemo(() => {
    const config: GoogleReviewConfig = {
      rating,
      enableAspects,
      reviews,
      loopCount,
      delayBetweenReviewsMs,
      autoSubmit,
    };
    return generateGoogleReviewScript(config);
  }, [rating, enableAspects, reviews, loopCount, delayBetweenReviewsMs, autoSubmit]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedScript);
      setCopied(true);
      showToast('Code copied! Paste into Chrome DevTools console (F12).');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Please select and copy the code manually.');
    }
  };

  const handleDownloadCode = () => {
    const blob = new Blob([generatedScript], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `google_review_bot.js`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast('Downloaded google_review_bot.js');
  };

  const handleAddReview = () => {
    if (!newReviewText.trim()) return;
    setReviews((prev) => [...prev, newReviewText.trim()]);
    setNewReviewText('');
    showToast('New review added to loop.');
  };

  const handleDeleteReview = (index: number) => {
    setReviews((prev) => prev.filter((_, i) => i !== index));
    showToast('Review removed.');
  };

  const handleResetDefaults = () => {
    setReviews(DEFAULT_HOTEL_REVIEWS);
    setRating(5);
    setEnableAspects(true);
    setAutoSubmit(true);
    setDelayBetweenReviewsMs(5000);
    showToast('Reset to default 10 review messages.');
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#11141e] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#5722af] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5722AF]/15 via-[#8C52FF]/5 to-transparent border border-[#5722AF]/20 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#5722AF]/15 text-[#5722AF] dark:text-[#B68BFF] border border-[#5722AF]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Console Auto Feedback Loop</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Google Review Auto Feedback Loop Generator
            </h1>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
              Generate ready-to-run JavaScript code for your browser console. It clicks{' '}
              <code className="text-[#5722AF] dark:text-[#B68BFF] font-semibold">Write a review</code>, selects 5 stars, enters feedback text with synthetic input events to enable the Post button, clicks <code className="text-[#5722AF] dark:text-[#B68BFF] font-semibold">Post</code>, dismisses the confirmation, and loops through all 10 messages automatically.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopyCode}
              type="button"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#5722AF] to-[#8C52FF] hover:from-[#491c96] hover:to-[#783be3] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Code!' : 'Copy JavaScript Code'}</span>
            </button>
            <button
              onClick={handleDownloadCode}
              type="button"
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-sm border border-zinc-200 dark:border-zinc-700 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>Download .js</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Controls & Right Code Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Configuration (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card 1: Review Messages Manager */}
          <div className="bg-white dark:bg-[#11141e] rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#5722AF]/10 text-[#5722AF] dark:text-[#B68BFF]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-zinc-900 dark:text-white">
                    Feedback Messages Pool ({reviews.length} Messages)
                  </h2>
                  <p className="text-xs text-zinc-500">
                    The bot loops through these messages one-by-one.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-2.5 py-1 rounded-xl text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 transition-all cursor-pointer flex items-center gap-1"
                title="Reset to original 10 messages"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Reviews List */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {reviews.map((msg, index) => (
                <div
                  key={index}
                  className="group relative flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 hover:border-[#5722AF]/40 transition-all"
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <span className="shrink-0 w-6 h-6 rounded-lg bg-[#5722AF]/10 text-[#5722AF] dark:text-[#B68BFF] text-xs font-bold flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed break-words">
                      {msg}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteReview(index)}
                    className="shrink-0 text-zinc-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Custom Message Box */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddReview();
                }}
                placeholder="Add custom review feedback..."
                className="flex-1 px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[#5722AF]"
              />
              <button
                type="button"
                onClick={handleAddReview}
                className="px-4 py-2.5 rounded-2xl bg-[#5722AF] hover:bg-[#491c96] text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Card 2: Settings & Controls */}
          <div className="bg-white dark:bg-[#11141e] rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-zinc-900 dark:text-white">
                  Rating & Loop Controls
                </h2>
                <p className="text-xs text-zinc-500">
                  Configure star rating and wait time between loop iterations.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Star Rating */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Star Rating (data-rating)
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRating(val)}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        rating >= val ? 'text-amber-500 hover:scale-110' : 'text-zinc-300 dark:text-zinc-700'
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                  <span className="text-xs font-bold ml-2 text-zinc-800 dark:text-zinc-200">
                    {rating} Stars
                  </span>
                </div>
              </div>

              {/* Delay Between Reviews */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Wait Delay Between Loops
                </span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                  <select
                    value={delayBetweenReviewsMs}
                    onChange={(e) => setDelayBetweenReviewsMs(Number(e.target.value))}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200"
                  >
                    <option value={3000}>3 Seconds (Fast)</option>
                    <option value={5000}>5 Seconds (Recommended)</option>
                    <option value={8000}>8 Seconds (Safe)</option>
                    <option value={12000}>12 Seconds (Slow)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-1">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSubmit}
                  onChange={(e) => setAutoSubmit(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5722AF] focus:ring-[#5722AF] cursor-pointer"
                />
                <span>Auto-Click Post Button (<code className="font-mono text-[11px] text-[#5722AF]">postBtn.click()</code>)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableAspects}
                  onChange={(e) => setEnableAspects(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5722AF] focus:ring-[#5722AF] cursor-pointer"
                />
                <span>Also rate Hotel Aspects (Rooms, Service, Location) if available</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Code Generator & Instructions (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Code Viewer Card */}
          <div className="bg-[#11141e] rounded-3xl border border-[#5722af]/30 p-6 shadow-xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-zinc-400 ml-2">google_review_bot.js</span>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3.5 py-1.5 rounded-xl bg-[#5722af] hover:bg-[#491c96] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Code Box */}
            <div className="relative">
              <pre className="p-4 rounded-2xl bg-[#090b10] border border-zinc-800/80 font-mono text-[11px] leading-relaxed text-zinc-300 overflow-x-auto max-h-[460px] overflow-y-auto selection:bg-[#5722af] selection:text-white">
                <code>{generatedScript}</code>
              </pre>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
              <span>Lines: ~{generatedScript.split('\n').length}</span>
              <span>Size: {(new Blob([generatedScript]).size / 1024).toFixed(1)} KB</span>
            </div>
          </div>

          {/* Quick Guide */}
          <div className="bg-white dark:bg-[#11141e] rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#5722AF]" />
              <span>How to Run in Console</span>
            </h3>

            <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#5722AF]/10 text-[#5722AF] font-bold flex items-center justify-center shrink-0">1</span>
                <span>Open Google Maps / Google Hotels review page in Chrome or Edge.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#5722AF]/10 text-[#5722AF] font-bold flex items-center justify-center shrink-0">2</span>
                <span>Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">F12</kbd> (or <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">Ctrl + Shift + J</kbd>) to open the Console.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#5722AF]/10 text-[#5722AF] font-bold flex items-center justify-center shrink-0">3</span>
                <span>Paste the code and press <b>Enter</b> to start the loop!</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-500 font-bold flex items-center justify-center shrink-0">4</span>
                <span>To stop anytime, type <code className="font-mono font-bold text-rose-500">window.stopReviewLoop = true;</code> and hit Enter.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
