'use client';

import React from 'react';
import { ToastInfo } from '@/lib/types';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastInfo[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
          info: <Info className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8] shrink-0" />,
        };

        const borderStyles = {
          success: 'border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-[#151923]',
          error: 'border-rose-200 dark:border-rose-900/50 bg-white dark:bg-[#151923]',
          warning: 'border-amber-200 dark:border-amber-900/50 bg-white dark:bg-[#151923]',
          info: 'border-[#D8C7F8] dark:border-[#5722AF]/40 bg-white dark:bg-[#151923]',
        };

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-200 animate-in fade-in slide-in-from-bottom-3 ${borderStyles[toast.type]}`}
          >
            {icons[toast.type]}
            <div className="flex-1 text-sm">
              {toast.title && (
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">
                  {toast.title}
                </div>
              )}
              <div className="text-zinc-600 dark:text-zinc-300 leading-snug">
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
