'use client';

import React, { useEffect } from 'react';
import {
  X,
  QrCode,
  Smartphone,
  Users,
  MessageSquare,
  Send,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  FileText,
  Clock,
  ArrowRight,
  Layers,
  Zap
} from 'lucide-react';

interface WhatsAppStepGuideModalProps {
  step: number | null; // 1, 2, 3, 4
  onClose: () => void;
  onSelectStep?: (step: number) => void;
}

export const WhatsAppStepGuideModal: React.FC<WhatsAppStepGuideModalProps> = ({
  step,
  onClose,
  onSelectStep
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (step === null) return null;

  const stepsData: Record<number, {
    title: string;
    subtitle: string;
    icon: any;
    accentColor: string;
    instructions: { title: string; desc: string }[];
    tips: string[];
  }> = {
    1: {
      title: 'Step 1: Connect WhatsApp Account',
      subtitle: 'Link your WhatsApp using QR Code or 8-Digit Pairing Code',
      icon: QrCode,
      accentColor: 'text-[#5722AF] bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300',
      instructions: [
        {
          title: 'Method A: QR Code Scan (Recommended)',
          desc: 'Open WhatsApp on your mobile phone > Settings (or 3 dots) > Linked Devices > Link a Device > Scan the live QR Code shown on screen.'
        },
        {
          title: 'Method B: 8-Digit Phone Pairing',
          desc: 'Switch to the "Phone Number" tab, enter your phone number with country code, and click "Get Pairing Code". Enter the 8-digit code on your phone when prompted.'
        },
        {
          title: 'Multi-Device Independence',
          desc: 'Your phone does not need to stay online once connected. Messages dispatch directly through the multi-device worker session.'
        }
      ],
      tips: [
        'Each user logged in retains their own isolated session without crossing over.',
        'If the QR code expires, click the refresh button to generate a brand-new code.',
        'Use the "Delete Browser Data" button if you ever need to reset the connection completely.'
      ]
    },
    2: {
      title: 'Step 2: Audience & Phone Numbers',
      subtitle: 'Add and organize the contacts who will receive your campaign',
      icon: Users,
      accentColor: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300',
      instructions: [
        {
          title: 'Import Option 1: CSV / Text File Upload',
          desc: 'Click "CSV Upload" to import contacts. Supported format: First column for Name, second column for Phone Number.'
        },
        {
          title: 'Import Option 2: Bulk Copy & Paste',
          desc: 'Click "Bulk Paste" to paste a list of numbers from Excel or notepad (e.g. "Rohan, 9876543210" or one number per line).'
        },
        {
          title: 'Automatic Country Code Formatting',
          desc: 'Select your default country code (e.g. +91 India). 10-digit numbers without country codes are automatically formatted with the chosen dial code.'
        }
      ],
      tips: [
        'You can delete individual contacts or click the trash icon to clear the entire list.',
        'Numbers are automatically sanitized (spaces, dashes, and parentheses are removed).',
        'Click "Load Sample" anytime to test the flow with demo contacts.'
      ]
    },
    3: {
      title: 'Step 3: Message Template & Media',
      subtitle: 'Craft personalized messages with dynamic tags, images, and documents',
      icon: MessageSquare,
      accentColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300',
      instructions: [
        {
          title: 'Personalization with Dynamic Tags',
          desc: 'Insert {name} and {phone} tags into your message. Each recipient receives a customized message with their actual name.'
        },
        {
          title: 'Smart Media Attachments (Images & PDFs)',
          desc: 'Attach promotional images or PDF brochures. Images are automatically optimized for crisp display on WhatsApp without causing upload size errors.'
        },
        {
          title: 'Anti-Ban Delay Throttling',
          desc: 'Adjust the interval slider between messages (7 to 60 seconds). Random micro-delays are added automatically to emulate human behavior and protect your number.'
        }
      ],
      tips: [
        'When attaching an image with text, the text is sent as a caption under the image.',
        'Keep messages friendly and relevant to achieve higher engagement and response rates.',
        'Check the live preview card on the right to see exactly how your message looks.'
      ]
    },
    4: {
      title: 'Step 4: Dispatch Campaign & Telemetry',
      subtitle: 'Start sequential message delivery with real-time tracking',
      icon: Send,
      accentColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300',
      instructions: [
        {
          title: 'Sequential Message Dispatch',
          desc: 'Click "Start Campaign" to begin dispatching. Contacts are processed one by one in safe rate-limited intervals.'
        },
        {
          title: 'Pause, Resume & Stop Controls',
          desc: 'You can pause the campaign at any moment to adjust templates, and resume or stop whenever desired.'
        },
        {
          title: 'Real-Time Telemetry & Automatic Cloud Recording',
          desc: 'Inspect live status for each recipient (SENT or FAILED). Completed campaign metrics and logs are automatically stored in MongoDB for administrative tracking.'
        }
      ],
      tips: [
        'The dispatcher automatically retries temporary network timeouts to ensure high delivery rates.',
        'Review the progress bar to monitor completion percentage in real time.',
        'Past campaigns can be reviewed anytime via the "Past Campaigns" drawer.'
      ]
    }
  };

  const currentData = stepsData[step] || stepsData[1];
  const IconComponent = currentData.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-5 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#5722AF]/10 dark:bg-[#5722AF]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${currentData.accentColor}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                {currentData.title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {currentData.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Tabs */}
        {onSelectStep && (
          <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl relative z-10 text-xs">
            {[1, 2, 3, 4].map(sNum => (
              <button
                key={sNum}
                onClick={() => onSelectStep(sNum)}
                className={`py-1.5 text-center font-semibold rounded-lg transition cursor-pointer ${
                  step === sNum
                    ? 'bg-white dark:bg-zinc-900 text-[#5722AF] dark:text-purple-300 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                Step {sNum}
              </button>
            ))}
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 relative z-10 text-xs sm:text-sm">
          {/* Instructions List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              How It Works
            </h4>
            <div className="space-y-2.5">
              {currentData.instructions.map((inst, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 space-y-1"
                >
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-purple-300 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span>{inst.title}</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-6 leading-relaxed">
                    {inst.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Pro Tips</span>
            </h4>
            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
              {currentData.tips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between relative z-10">
          <div className="text-[11px] text-zinc-400">
            Step {step} of 4 &bull; WhatsApp Marketing Studio
          </div>
          <div className="flex items-center gap-2">
            {step < 4 && onSelectStep ? (
              <button
                onClick={() => onSelectStep(step + 1)}
                className="px-3.5 py-1.5 rounded-xl bg-[#5722AF] hover:bg-[#471b92] text-white text-xs font-semibold flex items-center gap-1 transition shadow-2xs cursor-pointer"
              >
                <span>Next Step Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-[#5722AF] hover:bg-[#471b92] text-white text-xs font-semibold transition cursor-pointer"
              >
                Got It
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
