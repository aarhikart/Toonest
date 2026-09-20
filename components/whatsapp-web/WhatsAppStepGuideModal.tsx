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
      title: 'Step 1: Connect Your WhatsApp',
      subtitle: 'Scan the QR code or use an 8-digit phone code to link your phone',
      icon: QrCode,
      accentColor: 'text-[#5722AF] bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300',
      instructions: [
        {
          title: 'Option 1: Scan QR Code (Fastest)',
          desc: 'Open WhatsApp on your phone > Tap Settings (or 3 dots on top right) > Linked Devices > Link a Device > Point your camera at the QR code shown on screen.'
        },
        {
          title: 'Option 2: Use Phone Pairing Code',
          desc: 'Click the "Phone Code" tab, enter your WhatsApp phone number, and click "Get Pairing Code". Type the 8-digit code on your phone when prompted.'
        },
        {
          title: 'Works Even When Phone is Offline',
          desc: 'Once connected, your phone does not need to stay connected to Wi-Fi or mobile data. Messages send directly through your linked account.'
        }
      ],
      tips: [
        'Every user account is kept completely private and separate from others.',
        'If the QR code expires, simply tap the refresh button to get a fresh code.',
        'Use "Clear Session" if you ever want to log out or connect a different WhatsApp number.'
      ]
    },
    2: {
      title: 'Step 2: Customer List',
      subtitle: 'Add the phone numbers you want to send messages to',
      icon: Users,
      accentColor: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300',
      instructions: [
        {
          title: 'Option 1: Upload Excel or CSV File',
          desc: 'Click "Upload File" to import contacts from Excel or CSV. Keep names in the first column and phone numbers in the second column.'
        },
        {
          title: 'Option 2: Paste Phone Numbers',
          desc: 'Click "Paste Numbers" to paste phone numbers directly from your notes or sheets (e.g. "Rahul, 9876543210" or one number per line).'
        },
        {
          title: 'Automatic Country Code',
          desc: 'Select your default country code (e.g. +91 India). 10-digit numbers without a country code will be formatted automatically.'
        }
      ],
      tips: [
        'You can delete single contacts or tap the trash icon to clear the entire list.',
        'Spaces, dashes, and brackets are automatically cleaned up from phone numbers.',
        'Click "Sample Numbers" anytime to test how sending works before using real numbers.'
      ]
    },
    3: {
      title: 'Step 3: Write Message',
      subtitle: 'Type your message, personalize with customer names, and attach photos or PDFs',
      icon: MessageSquare,
      accentColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300',
      instructions: [
        {
          title: 'Add Customer Names Automatically',
          desc: 'Click {name} in the message box. Each customer will automatically receive a message with their own real name.'
        },
        {
          title: 'Attach Photos or PDF Files',
          desc: 'Attach promotional images, banners, or PDF brochures. Images are optimized so they send quickly and look clear.'
        },
        {
          title: 'Safe Waiting Time Between Messages',
          desc: 'Adjust the slider between 7 to 60 seconds. Taking safe pauses between messages keeps your WhatsApp account safe and protected from bans.'
        }
      ],
      tips: [
        'When attaching a photo with text, the text is automatically sent as the caption of the photo.',
        'Keep messages friendly, clear, and relevant so your customers enjoy reading them.',
        'Look at the WhatsApp Message Preview on the right to see exactly how your message will look.'
      ]
    },
    4: {
      title: 'Step 4: Send Messages',
      subtitle: 'Send your messages safely and track live delivery status',
      icon: Send,
      accentColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300',
      instructions: [
        {
          title: 'Start Sending One by One',
          desc: 'Click "Start Sending" to begin. Your messages will go out to each contact safely one after another with your selected delay.'
        },
        {
          title: 'Pause or Stop Anytime',
          desc: 'You can pause sending at any time to make changes, and resume or stop whenever you like.'
        },
        {
          title: 'Live Delivery Updates',
          desc: 'Watch each message show as SENT or FAILED in real time. Your finished campaign results are automatically saved in your history.'
        }
      ],
      tips: [
        'If there is a temporary network glitch, the system retries automatically to deliver your message.',
        'Check the progress bar to see how many messages have finished sending.',
        'You can look back at past results anytime by clicking "Past Campaigns".'
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
