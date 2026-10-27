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
  CheckCircle2
} from 'lucide-react';
import { WebContact } from '@/lib/whatsapp-web/types';
import { WhatsAppSenderEngine } from '@/lib/whatsapp-web/sender';

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
  onOpenGuide
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      label: 'Special Offer',
      text: 'Hi {name}! 🎉 We are excited to offer you an exclusive 25% discount this week. Reply to this message to claim your code!'
    },
    {
      label: 'Website Link Promo',
      text: 'Hi {name}! 🚀 Check out our latest online tools and automation platform at https://toonest.vercel.app. Enjoy seamless access!'
    },
    {
      label: 'Meeting / Order Notice',
      text: 'Hello {name}, this is a quick reminder regarding your upcoming appointment. Let us know if you need to reschedule.'
    },
    {
      label: 'Warm Welcome',
      text: 'Hey {name}! Welcome to ToolNest. We are delighted to have you with us. Feel free to ask any questions!'
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

        {/* Anti-Ban Delay Slider */}
        <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#5722AF]" />
              Safe Delay Between Messages:
            </span>
            <span className="font-bold text-[#5722AF] dark:text-purple-300">{delaySeconds < 7 ? 7 : delaySeconds} seconds</span>
          </div>
          <div className="space-y-1">
            <input
              type="range"
              min={7}
              max={60}
              value={delaySeconds < 7 ? 7 : delaySeconds}
              onChange={e => onDelayChange(Math.max(7, Math.min(60, parseInt(e.target.value, 10) || 7)))}
              className="w-full accent-[#5722AF] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>7s (Min)</span>
              <span>30s</span>
              <span>60s (Max)</span>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500">
            Safe waiting time between 7 to 60 seconds. Pausing between messages protects your WhatsApp account from being blocked.
          </p>
        </div>
      </div>

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
