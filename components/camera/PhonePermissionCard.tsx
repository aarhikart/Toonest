'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Mic, Shield, AlertTriangle, Key, ArrowRight, Loader2, Lock } from 'lucide-react';

interface PhonePermissionCardProps {
  roomId: string;
  requiresPin: boolean;
  onPermissionGranted: (stream: MediaStream, isAudioAllowed: boolean) => void;
  onRequestJoin: (pin?: string) => Promise<{ success: boolean; error?: string }>;
}

export const PhonePermissionCard: React.FC<PhonePermissionCardProps> = ({
  roomId,
  requiresPin,
  onPermissionGranted,
  onRequestJoin
}) => {
  const [pin, setPin] = useState('');
  const [isPinValidated, setIsPinValidated] = useState(!requiresPin);
  const [isSubmittingPin, setIsSubmittingPin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isSecureContext, setIsSecureContext] = useState(true);

  // Check secure context (HTTPS requirement)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocalhost =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
      setIsSecureContext(window.isSecureContext || isLocalhost);
    }
  }, []);

  const handleValidatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setPinError('Please enter the 6-digit Room PIN.');
      return;
    }
    setIsSubmittingPin(true);
    setPinError(null);

    const res = await onRequestJoin(pin.trim());
    if (res.success) {
      setIsPinValidated(true);
    } else {
      setPinError(res.error || 'Invalid Room PIN.');
    }
    setIsSubmittingPin(false);
  };

  const handleRequestMedia = async () => {
    setIsLoadingMedia(true);
    setPermissionError(null);

    // First attempt: Request both Video & Audio
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });
      onPermissionGranted(stream, true);
      return;
    } catch (err: any) {
      console.warn('[PhonePermissionCard] Dual video+audio request failed, testing video only:', err);

      // If microphone is blocked or unavailable, retry with video only (as required by Section 20)
      try {
        const videoOnlyStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        onPermissionGranted(videoOnlyStream, false);
        return;
      } catch (videoErr: any) {
        // Both video and audio were denied
        if (
          videoErr.name === 'NotAllowedError' ||
          videoErr.name === 'PermissionDeniedError'
        ) {
          setPermissionError(
            'Camera or microphone permission was denied. Please allow camera access in your mobile browser settings and reload this page.'
          );
        } else if (
          videoErr.name === 'NotFoundError' ||
          videoErr.name === 'DevicesNotFoundError'
        ) {
          setPermissionError('No camera device was detected on this mobile device.');
        } else if (
          videoErr.name === 'NotReadableError' ||
          videoErr.name === 'TrackStartError'
        ) {
          setPermissionError(
            'Camera could not be started because another application may be using it.'
          );
        } else {
          setPermissionError(
            videoErr.message || 'Failed to acquire camera stream.'
          );
        }
      }
    } finally {
      setIsLoadingMedia(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-5 sm:p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#5722AF]/10 dark:bg-purple-950/60 text-[#5722AF] dark:text-purple-300 flex items-center justify-center ring-8 ring-purple-50 dark:ring-purple-950/30">
          <Camera className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
          Connect Your Camera
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Room: <strong className="font-mono text-purple-600 dark:text-purple-400">{roomId}</strong>
        </p>
      </div>

      {/* HTTPS Security Context Check */}
      {!isSecureContext && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 rounded-2xl border border-amber-200 dark:border-amber-900 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Camera access requires HTTPS.</span>
            <span>Mobile browsers restrict media access to secure HTTPS origins.</span>
          </div>
        </div>
      )}

      {/* PIN Authentication Step (if required) */}
      {!isPinValidated ? (
        <form onSubmit={handleValidatePin} className="space-y-4">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-2">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#5722AF]" />
              Enter Room PIN
            </label>
            <input
              type="text"
              maxLength={6}
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 482913"
              className="w-full text-center text-lg font-mono font-bold tracking-widest p-3 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#5722AF]"
            />
            {pinError && <p className="text-[11px] text-rose-600 font-semibold">{pinError}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmittingPin || pin.length < 6}
            className="w-full py-3 px-4 rounded-xl bg-[#5722AF] hover:bg-[#491c96] text-white font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmittingPin ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Verify PIN & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        /* Permission Consent Card */
        <div className="space-y-5">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60 space-y-3">
            <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">
              This demo needs explicit access to your camera and microphone:
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 p-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700/60">
                <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-[#5722AF] dark:text-purple-300 flex items-center justify-center shrink-0">
                  <Camera className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Camera:</span>
                  <span className="text-[11px] text-zinc-400">Used for live video transmission to your laptop</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700/60">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Mic className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Microphone:</span>
                  <span className="text-[11px] text-zinc-400">Used for live audio transmission to your laptop</span>
                </div>
              </div>
            </div>
          </div>

          {permissionError && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-900 text-xs space-y-1">
              <span className="font-bold block">Permission Denied or Device Unavailable</span>
              <p className="text-[11px] leading-relaxed">{permissionError}</p>
            </div>
          )}

          {/* Primary Permission Button */}
          <button
            type="button"
            onClick={handleRequestMedia}
            disabled={isLoadingMedia}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#5722AF] to-purple-600 hover:from-[#491c96] hover:to-purple-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-purple-500/25 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
          >
            {isLoadingMedia ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Requesting Browser Permission...</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                <span>Allow Camera & Microphone</span>
              </>
            )}
          </button>

          {/* Privacy Notice */}
          <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/30 text-[11px] text-purple-900/80 dark:text-purple-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-200">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Privacy Notice</span>
            </div>
            <p className="leading-relaxed">
              Your camera and microphone are accessed only after you explicitly click Allow. No video is recorded or stored on any server.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
