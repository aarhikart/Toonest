'use client';

import React, { useRef, useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  Sliders,
  Smartphone,
  CheckCheck,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X,
  HelpCircle,
  Globe,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Copy,
  Check,
  LifeBuoy,
  AlertTriangle,
  Info,
  Flame,
  Scale,
  ShieldAlert
} from 'lucide-react';
import { WebContact, AntiBanProfile } from '@/lib/whatsapp-web/types';
import { WhatsAppSenderEngine, ANTI_BAN_PROFILES } from '@/lib/whatsapp-web/sender';

export interface MediaAttachment {
  name: string;
  type: string;
  size: number;
  dataUrl: string; // Base64 data URL
  isImage: boolean;
}

interface WhatsAppMessageComposerProps {
  message: string;
  onMessageChange: (msg: string) => void;
  delaySeconds: number;
  onDelayChange: (delay: number) => void;
  media: MediaAttachment | null;
  onMediaChange: (media: MediaAttachment | null) => void;
  previewContact?: WebContact;
  onOpenGuide?: () => void;
  antiBanProfile?: AntiBanProfile;
  onProfileChange?: (profile: AntiBanProfile) => void;
  includeOptOutFooter?: boolean;
}

function getShortFileName(name: string, maxLen = 22): string {
  if (!name || name.length <= maxLen) return name;
  const lastDot = name.lastIndexOf('.');
  if (lastDot > 0 && lastDot > name.length - 6) {
    const ext = name.slice(lastDot);
    const base = name.slice(0, lastDot);
    const keep = Math.max(maxLen - ext.length - 3, 6);
    return base.slice(0, keep) + '...' + ext;
  }
  return name.slice(0, maxLen - 3) + '...';
}

export const WhatsAppMessageComposer: React.FC<WhatsAppMessageComposerProps> = ({
  message,
  onMessageChange,
  delaySeconds,
  onDelayChange,
  media,
  onMediaChange,
  previewContact,
  onOpenGuide,
  antiBanProfile = 'balanced',
  onProfileChange,
  includeOptOutFooter = true
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUnbanModalOpen, setIsUnbanModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [appealLanguage, setAppealLanguage] = useState<'en' | 'hi' | 'review'>('review');

  const selectedProfile: AntiBanProfile = antiBanProfile || 'balanced';
  const profileConfig = ANTI_BAN_PROFILES[selectedProfile] || ANTI_BAN_PROFILES.balanced;

  const safetyAnalysis = WhatsAppSenderEngine.calculateAntiBanScore(
    message,
    delaySeconds,
    includeOptOutFooter,
    selectedProfile
  );

  const appeals = WhatsAppSenderEngine.getUnbanAppealTemplate(previewContact?.phoneNumber);

  const copyToClipboard = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const insertVariable = (varName: string) => {
    onMessageChange(message + ` ${varName} `);
  };

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const sampleContact: WebContact = previewContact || {
    id: 'preview',
    name: 'Alex Wright',
    phoneNumber: '+12025550143',
    status: 'PENDING'
  };

  const rawInterpolated = WhatsAppSenderEngine.interpolate(message, sampleContact);
  const formattedPreview = WhatsAppSenderEngine.formatMessageUrls(rawInterpolated);
  const detectedUrl = WhatsAppSenderEngine.extractFirstUrl(formattedPreview);

  // Split message into text chunks and clickable blue hyperlinks
  const renderMessageContent = (text: string) => {
    if (!text) return 'Compose your message text...';
    const urlPattern = /(https?:\/\/[^\s]+)/gi;
    const parts = text.split(urlPattern);

    return parts.map((part, i) => {
      if (/^https?:\/\/[^\s]+/i.test(part)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#027eb5] dark:text-[#53bdeb] underline font-medium hover:opacity-85 break-all cursor-pointer"
          >
            {part}
          </a>
        );
      }
      return <React.Fragment key={i}>{part}</React.Fragment>;
    });
  };

  const presets = [
    {
      label: 'Spintax Promo (Safest)',
      text: '{Hello|Hi|Greetings} {name}! 🎉 {We are excited to share|Check out} our exclusive 25% discount this week. Reply to this message to claim your code!'
    },
    {
      label: 'Friendly Customer Update',
      text: '{Hi|Hello|Dear} {name}, {quick update regarding your order|hope you are having a wonderful day! Here is your update}. Let us know if you need any assistance.'
    },
    {
      label: 'Website Link Promo',
      text: '{Hi|Hello|Hey} {name}! 🚀 {Explore our online platform|Check out our automation tools} at https://toonest.vercel.app. Enjoy seamless access!'
    },
    {
      label: 'Warm Welcome',
      text: '{Hey|Hello|Hi} {name}! {Welcome to ToolNest|Delighted to have you with us}. Feel free to ask any questions!'
    }
  ];

  const optimizeImage = (file: File): Promise<{ dataUrl: string; size: number }> => {
    return new Promise((resolve) => {
      // For PDFs or non-images, return raw dataUrl
      if (!file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const dataUrl = evt.target?.result as string;
          resolve({ dataUrl, size: file.size });
        };
        reader.readAsDataURL(file);
        return;
      }

      // For images, optimize using off-screen HTML5 Canvas (max 1600px dimension, JPEG 0.85)
      // This prevents HTTP 413 (Payload Too Large) on Vercel and cloud proxies
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ dataUrl: evt.target?.result as string, size: file.size });
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          const approxBytes = Math.round((compressedDataUrl.length - 22) * 0.75);
          resolve({ dataUrl: compressedDataUrl, size: approxBytes });
        };
        img.onerror = () => {
          resolve({ dataUrl: evt.target?.result as string, size: file.size });
        };
        img.src = evt.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      alert('Attachment size must be under 25MB.');
      return;
    }

    if (file.type === 'application/pdf' && file.size > 4.2 * 1024 * 1024) {
      alert('PDF documents must be under 4MB for reliable transmission. Please compress or select a smaller PDF.');
      return;
    }

    try {
      const { dataUrl, size } = await optimizeImage(file);
      onMediaChange({
        name: file.name,
        type: file.type.startsWith('image/') ? 'image/jpeg' : file.type,
        size,
        dataUrl,
        isImage: file.type.startsWith('image/')
      });
    } catch {
      alert('Failed to process attachment.');
    }

    e.target.value = '';
  };

  return (
    <div className="bg-gradient-to-br from-white via-white to-zinc-50/80 dark:from-[#131620] dark:via-zinc-900 dark:to-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3 sm:pb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#5722AF]/10 dark:bg-purple-950/40 text-[#5722AF] dark:text-purple-300 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
              Write Message
            </h3>
            {onOpenGuide && (
              <button
                type="button"
                onClick={onOpenGuide}
                title="View Guide"
                className="p-1 rounded-lg hidden text-zinc-400 hover:text-[#5722AF] dark:hover:text-purple-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer shrink-0"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Variable & Preview Controls */}
        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          <span className="text-[11px] font-semibold text-zinc-400 hidden sm:inline">Insert:</span>
          <button
            type="button"
            onClick={() => insertVariable('{name}')}
            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900 text-[#5722AF] dark:text-purple-300 rounded-lg text-xs font-mono font-bold transition cursor-pointer"
            title="Click to insert customer's name"
          >
            {'{name}'}
          </button>
          <button
            type="button"
            onClick={() => insertVariable('{Hello|Hi|Greetings}')}
            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1 border border-amber-200/80 dark:border-amber-800/80"
            title="Insert Spintax options {Hello|Hi|Greetings} so every recipient receives unique words"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>{'{Spin}'}</span>
          </button>
          <button
            type="button"
            onClick={() => insertVariable('{phone}')}
            className="px-2.5 hidden py-1 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900 text-[#5722AF] dark:text-purple-300 rounded-lg text-xs font-mono font-bold transition cursor-pointer"
            title="Click to insert customer's phone number"
          >
            {'{phone}'}
          </button>
          <button
            type="button"
            onClick={() => setIsPreviewModalOpen(true)}
            className="px-2.5 py-1 bg-[#5722AF]/10 hover:bg-[#5722AF]/20 text-[#5722AF] dark:text-purple-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-[#5722AF]/20 dark:border-purple-800/40"
            title="Preview how message looks on WhatsApp"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Preview Message</span>
          </button>
        </div>
      </div>

      {/* Main Composer Form - Full Width */}
      <div className="space-y-4">
        <div>
          <textarea
            rows={4}
            value={message}
            onChange={e => onMessageChange(e.target.value)}
            placeholder="Hi {name}, thank you for choosing ToolNest! Your order is being processed..."
            className="w-full text-xs p-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#5722AF] leading-relaxed"
          />
          <div className="flex justify-between items-center text-[11px] text-zinc-400 mt-1">
            <span>Dynamic Variables: {"{name}"}</span>
            <span>{message.length} characters</span>
          </div>
        </div>

        {/* Media Attachment Selector */}
        <div className="space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelected}
            accept="image/*,application/pdf"
            className="hidden"
          />

          {!media ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#5722AF] rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 flex items-center justify-center gap-2 transition bg-zinc-50/50 dark:bg-zinc-800/30"
            >
              <Paperclip className="w-3.5 h-3.5 text-[#5722AF]" />
              Attach Image or PDF Document (Optional)
            </button>
          ) : (
            <div className="space-y-2">
              <div className="p-2.5 sm:p-3 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 rounded-xl flex items-center justify-between gap-2.5 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
                  {media.isImage ? (
                    <img src={media.dataUrl} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-purple-200 shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                      PDF
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div
                      className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate block"
                      title={media.name}
                    >
                      {getShortFileName(media.name, 22)}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">{(media.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onMediaChange(null)}
                  className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0"
                  title="Remove attachment"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 px-3 py-1.5 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Keep tab open while sending image campaigns</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Presets */}
        <div>
          <span className="text-[11px] font-semibold text-zinc-500 block mb-1.5">Load Template Preset:</span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onMessageChange(p.text)}
                className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-[11px] font-medium text-zinc-700 dark:text-zinc-300 transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Anti-Ban Protection Profiles Quick-Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5722AF] dark:text-purple-400" />
              Anti-Ban Protection Profile:
            </span>
            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
              {profileConfig.name}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(Object.values(ANTI_BAN_PROFILES) as typeof ANTI_BAN_PROFILES[AntiBanProfile][]).map((prof) => {
              const isSelected = selectedProfile === prof.id;
              return (
                <button
                  key={prof.id}
                  type="button"
                  onClick={() => {
                    if (onProfileChange) onProfileChange(prof.id);
                    onDelayChange(prof.recommendedDelay);
                  }}
                  className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#5722AF] bg-purple-50/70 dark:bg-purple-950/40 dark:border-purple-600 shadow-xs ring-1 ring-[#5722AF]/30'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                      {prof.id === 'warmup' ? '🛡️ Warm-Up' : prof.id === 'balanced' ? '⚖️ Standard' : '⚡ Fast Mode'}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                      {prof.recommendedDelay}s delay
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-tight">
                    {prof.recommendedFor}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Anti-Ban Dynamic Delay Slider */}
        <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#5722AF]" />
              Message Interval Pacing:
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                delaySeconds >= 24
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : delaySeconds >= 15
                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
              }`}>
                {delaySeconds >= 24 ? '🛡️ Ultra Safe' : delaySeconds >= 15 ? '⚖️ Safe Balanced' : '⚠️ Higher Risk'}
              </span>
              <span className="font-bold text-[#5722AF] dark:text-purple-300">{delaySeconds < 10 ? 10 : delaySeconds}s</span>
            </div>
          </div>
          <div className="space-y-1">
            <input
              type="range"
              min={10}
              max={60}
              value={delaySeconds < 10 ? 10 : delaySeconds}
              onChange={e => onDelayChange(Math.max(10, Math.min(60, parseInt(e.target.value, 10) || 10)))}
              className="w-full accent-[#5722AF] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>10s (Fast/Risky)</span>
              <span>18s (Safe)</span>
              <span>30s</span>
              <span>60s (Ultra-Safe)</span>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 leading-tight">
            The sender automatically adds randomized micro-jitters (+1.5s to 7s) and typing presence before each dispatch to simulate human cadence.
          </p>
        </div>

        {/* Live Anti-Ban Safety Score Meter */}
        <div className="p-3.5 bg-gradient-to-br from-purple-50/70 via-white to-purple-50/30 dark:from-purple-950/30 dark:via-zinc-900/60 dark:to-transparent border border-purple-200/80 dark:border-purple-800/60 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#5722AF] dark:text-purple-400" />
              <span className="text-xs font-bold text-zinc-900 dark:text-white">Anti-Ban Safety Rating:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                safetyAnalysis.rating === 'ultra_safe'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                  : safetyAnalysis.rating === 'good'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
                  : safetyAnalysis.rating === 'moderate'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
              }`}>
                {safetyAnalysis.score}% {safetyAnalysis.rating === 'ultra_safe' ? '🛡️ Ultra Safe' : safetyAnalysis.rating === 'good' ? '⚖️ Good' : safetyAnalysis.rating === 'moderate' ? '⚠️ Moderate Risk' : '🚨 High Risk'}
              </span>
            </div>
          </div>

          {/* Progress Gauge */}
          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                safetyAnalysis.rating === 'ultra_safe'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : safetyAnalysis.rating === 'good'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  : safetyAnalysis.rating === 'moderate'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                  : 'bg-gradient-to-r from-rose-500 to-red-600'
              }`}
              style={{ width: `${safetyAnalysis.score}%` }}
            />
          </div>

          {/* Anti-Ban Checklist Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
            <div className={`p-1.5 rounded-lg border flex items-center gap-1.5 ${
              safetyAnalysis.hasSpintax
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800/50 dark:text-emerald-300'
                : 'bg-amber-50/70 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800/50 dark:text-amber-300'
            }`}>
              {safetyAnalysis.hasSpintax ? <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />}
              <span className="truncate">Spintax {safetyAnalysis.hasSpintax ? 'Active' : 'Missing'}</span>
            </div>

            <div className={`p-1.5 rounded-lg border flex items-center gap-1.5 ${
              safetyAnalysis.isDelaySafe
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800/50 dark:text-emerald-300'
                : 'bg-amber-50/70 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800/50 dark:text-amber-300'
            }`}>
              {safetyAnalysis.isDelaySafe ? <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />}
              <span className="truncate">{delaySeconds}s Delay {safetyAnalysis.isDelaySafe ? 'Safe' : 'Risky'}</span>
            </div>

            <div className={`p-1.5 rounded-lg border flex items-center gap-1.5 ${
              safetyAnalysis.hasOptOut
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800/50 dark:text-emerald-300'
                : 'bg-amber-50/70 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800/50 dark:text-amber-300'
            }`}>
              {safetyAnalysis.hasOptOut ? <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />}
              <span className="truncate">Opt-Out {safetyAnalysis.hasOptOut ? 'Active' : 'Disabled'}</span>
            </div>

            <div className={`p-1.5 rounded-lg border flex items-center gap-1.5 ${
              safetyAnalysis.hasPersonalization
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800/50 dark:text-emerald-300'
                : 'bg-zinc-100 border-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400'
            }`}>
              {safetyAnalysis.hasPersonalization ? <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> : <Info className="w-3 h-3 text-zinc-400 shrink-0" />}
              <span className="truncate">{safetyAnalysis.hasPersonalization ? '{name} Tagged' : 'No {name}'}</span>
            </div>
          </div>

          {/* Cold Link Guard Advisory Banner */}
          {safetyAnalysis.hasUrl && (
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <strong>Anti-Ban Link Guard Warning:</strong>
                <p className="leading-tight">
                  Sending links in first cold messages to unsaved numbers has a high spam report rate. Tip: Ask contacts to reply first (e.g. <em>&quot;Reply 1 to get our website link&quot;</em>) to protect your number!
                </p>
              </div>
            </div>
          )}

          {/* Unban Appeal Assistant Action Button */}
          <div className="pt-1 flex items-center justify-between border-t border-purple-100 dark:border-purple-900/50">
            <span className="text-[10px] text-zinc-500">Need to recover a blocked WhatsApp number?</span>
            <button
              type="button"
              onClick={() => setIsUnbanModalOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5722AF] dark:text-purple-300 hover:underline cursor-pointer"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-[#5722AF] dark:text-purple-400" />
              <span>Official Unban Appeal Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official WhatsApp Unban Appeal Assistant Modal */}
      {isUnbanModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsUnbanModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white dark:bg-[#131620] rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-gradient-to-r from-purple-50 via-white to-purple-50 dark:from-purple-950/40 dark:via-zinc-900 dark:to-purple-950/30 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-sm">
                <LifeBuoy className="w-5 h-5 text-[#5722AF] dark:text-purple-400" />
                <span>WhatsApp Official Unban Appeal Assistant</span>
              </div>
              <button
                type="button"
                onClick={() => setIsUnbanModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl space-y-1 text-blue-900 dark:text-blue-200">
                <strong>Why WhatsApp Accounts Get Blocked Under 50 Messages:</strong>
                <p className="text-[11px] leading-relaxed">
                  Meta&apos;s anti-spam AI monitors recipient behavior. If contacts who haven&apos;t saved your number tap the red <strong>&quot;Report as Spam&quot;</strong> button, or if messages are sent at rapid mechanical speeds (&lt;15s) without Spintax variations, Meta automatically flags the account. Over 90% of first-time bans are reversed within 4–24 hours when submitting this official review!
                </p>
              </div>

              {/* Language / Format Tab Selector */}
              <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <button
                  type="button"
                  onClick={() => setAppealLanguage('review')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    appealLanguage === 'review'
                      ? 'bg-[#5722AF] text-white shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                  }`}
                >
                  1. In-App Review (WhatsApp App)
                </button>
                <button
                  type="button"
                  onClick={() => setAppealLanguage('en')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    appealLanguage === 'en'
                      ? 'bg-[#5722AF] text-white shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                  }`}
                >
                  2. English Support Email
                </button>
                <button
                  type="button"
                  onClick={() => setAppealLanguage('hi')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    appealLanguage === 'hi'
                      ? 'bg-[#5722AF] text-white shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                  }`}
                >
                  3. Hindi Support Email
                </button>
              </div>

              {appealLanguage === 'review' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Step 1: Open WhatsApp on your phone and tap &quot;Request a review&quot;
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(appeals.inAppReviewText, 'review')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#5722AF] text-white rounded-lg text-xs font-bold hover:bg-[#471994] transition cursor-pointer"
                    >
                      {copiedKey === 'review' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'review' ? 'Copied!' : 'Copy Text'}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-zinc-100 dark:bg-zinc-900/80 rounded-xl border border-zinc-200 dark:border-zinc-800 font-sans text-xs whitespace-pre-wrap select-all text-zinc-800 dark:text-zinc-200">
                    {appeals.inAppReviewText}
                  </pre>
                </div>
              )}

              {appealLanguage === 'en' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                        Email to: <code>support@whatsapp.com</code>
                      </span>
                      <span className="text-[11px] text-zinc-500">Subject: {appeals.emailSubject}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:support@whatsapp.com?subject=${encodeURIComponent(appeals.emailSubject)}&body=${encodeURIComponent(appeals.emailBody)}`}
                        className="px-2.5 py-1 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                      >
                        Open Email
                      </a>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(appeals.emailBody, 'en')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#5722AF] text-white rounded-lg text-xs font-bold hover:bg-[#471994] transition cursor-pointer"
                      >
                        {copiedKey === 'en' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'en' ? 'Copied!' : 'Copy Email'}</span>
                      </button>
                    </div>
                  </div>
                  <pre className="p-3 bg-zinc-100 dark:bg-zinc-900/80 rounded-xl border border-zinc-200 dark:border-zinc-800 font-sans text-[11px] whitespace-pre-wrap select-all text-zinc-800 dark:text-zinc-200 max-h-56 overflow-y-auto">
                    {appeals.emailBody}
                  </pre>
                </div>
              )}

              {appealLanguage === 'hi' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                        ईमेल: <code>support@whatsapp.com</code>
                      </span>
                      <span className="text-[11px] text-zinc-500">विषय: WhatsApp खाता अनब्लॉक करने हेतु</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(appeals.hindiAppealText, 'hi')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#5722AF] text-white rounded-lg text-xs font-bold hover:bg-[#471994] transition cursor-pointer"
                    >
                      {copiedKey === 'hi' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'hi' ? 'Copied!' : 'कॉपी करें'}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-zinc-100 dark:bg-zinc-900/80 rounded-xl border border-zinc-200 dark:border-zinc-800 font-sans text-[11px] whitespace-pre-wrap select-all text-zinc-800 dark:text-zinc-200">
                    {appeals.hindiAppealText}
                  </pre>
                </div>
              )}

              {/* 4 Steps to prevent future bans */}
              <div className="p-3 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 rounded-xl space-y-1">
                <span className="font-bold text-[#5722AF] dark:text-purple-300 block">
                  3 Rules to Prevent Bans on Unbanned or New Numbers:
                </span>
                <ol className="list-decimal list-inside text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1">
                  <li><strong>Day 1 Warm-Up:</strong> Send no more than 10–15 messages on day 1 with the <strong>🛡️ Warm-Up (25s)</strong> profile.</li>
                  <li><strong>Always Use Spintax:</strong> Click <code>&#123;Spin&#125;</code> to ensure every message text hash is completely unique.</li>
                  <li><strong>Keep Opt-Out Enabled:</strong> Recipients will reply STOP instead of clicking WhatsApp&apos;s red &quot;Report Spam&quot; button.</li>
                </ol>
              </div>
            </div>

            <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-800/80 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsUnbanModalOpen(false)}
                className="px-4 py-1.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive WhatsApp Message Preview Popup Modal */}
      {isPreviewModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsPreviewModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#131620] rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-xs sm:text-sm">
                <Smartphone className="w-4 h-4 text-[#5722AF] dark:text-purple-400" />
                <span>WhatsApp Message Preview</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer"
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Smartphone Mockup Body */}
            <div className="p-3 sm:p-4 overflow-y-auto overflow-x-hidden flex flex-col items-center justify-center bg-zinc-100/60 dark:bg-zinc-900/60">
              <div className="w-full max-w-xs bg-[#efeae2] dark:bg-[#0b141a] rounded-2xl shadow-md border border-zinc-300 dark:border-zinc-700 overflow-hidden">
                {/* WhatsApp Chat Bar Header */}
                <div className="bg-[#5722AF] text-white text-[11px] font-semibold px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                      {(sampleContact.name || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold leading-tight">{sampleContact.name}</div>
                      <div className="text-[9px] text-white/80 leading-none">Online</div>
                    </div>
                  </div>
                  <span className="text-[9px] opacity-80 shrink-0">WhatsApp Web</span>
                </div>

                {/* Message Bubble Container */}
                <div className="p-3 min-h-[140px] flex items-end justify-end">
                  <div className="bg-white dark:bg-[#1f2c34] text-zinc-900 dark:text-zinc-100 p-2.5 rounded-2xl rounded-tr-xs shadow-xs text-xs max-w-[95%] space-y-2 break-words overflow-hidden">
                    {media && media.isImage && (
                      <img src={media.dataUrl} alt="Attached image" className="rounded-xl max-h-40 w-full object-cover" />
                    )}
                    {media && !media.isImage && (
                      <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center gap-2 text-[11px] font-mono min-w-0">
                        <FileText className="w-4 h-4 text-red-500 shrink-0" />
                        <span className="truncate" title={media.name}>{getShortFileName(media.name, 18)}</span>
                      </div>
                    )}

                    <p className="leading-relaxed whitespace-pre-line text-zinc-800 dark:text-zinc-200 text-xs text-left">
                      {renderMessageContent(formattedPreview || 'Compose your message text...')}
                    </p>
                    <div className="flex items-center justify-end gap-1 text-[9px] text-zinc-400">
                      <span>12:00 PM</span>
                      <CheckCheck className="w-3 h-3 text-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-1.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
