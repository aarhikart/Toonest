'use client';

import React, { useState } from 'react';
import { ConversionSettings } from '@/lib/converterTypes';
import { Tag, ChevronDown, ChevronUp } from 'lucide-react';

interface NamingSettingsProps {
  settings: ConversionSettings;
  onChange: (settings: ConversionSettings) => void;
  sampleName?: string;
}

export function NamingSettings({
  settings,
  onChange,
  sampleName = 'photo',
}: NamingSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateNaming = (patch: Partial<ConversionSettings['naming']>) => {
    onChange({
      ...settings,
      naming: { ...settings.naming, ...patch },
    });
  };

  const ext = settings.targetFormat;
  let previewResult = `${sampleName}.${ext}`;
  if (settings.naming.mode === 'suffix') {
    previewResult = `${sampleName}-${ext}.${ext}`;
  } else if (settings.naming.mode === 'custom') {
    previewResult = `${settings.naming.customName || 'converted'}.${ext}`;
  } else if (settings.naming.mode === 'numbered') {
    const num = String(settings.naming.startNumber).padStart(
      settings.naming.numberPadding,
      '0'
    );
    previewResult = `${settings.naming.prefix || ''}${num}${settings.naming.suffix || ''}.${ext}`;
  }

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-[#131722] overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-[#161a26] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8]">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-900 dark:text-white">
              Output Filename Format
            </div>
            <div className="text-[11px] font-mono text-[#5722AF] dark:text-[#9B6BE8]">
              Preview: {previewResult}
            </div>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-zinc-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        )}
      </button>

      {isOpen && (
        <div className="p-5 border-t border-zinc-100 dark:border-zinc-800/80 space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'original', label: 'Keep Original', desc: `photo.${ext}` },
              { id: 'suffix', label: 'Add Format Suffix', desc: `photo-${ext}.${ext}` },
              { id: 'custom', label: 'Custom Name', desc: 'custom.ext' },
              { id: 'numbered', label: 'Sequential Numbering', desc: `001.${ext}` },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  updateNaming({
                    mode: opt.id as ConversionSettings['naming']['mode'],
                  })
                }
                className={`p-3 rounded-xl border text-left transition-all ${
                  settings.naming.mode === opt.id
                    ? 'border-[#5722AF] bg-[#5722AF]/5 text-[#5722AF] dark:text-[#9B6BE8] font-bold shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-[#1a202e] text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                }`}
              >
                <div className="text-xs">{opt.label}</div>
                <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                  {opt.desc}
                </div>
              </button>
            ))}
          </div>

          {/* Custom Name input */}
          {settings.naming.mode === 'custom' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Custom Output Name:
              </label>
              <input
                type="text"
                value={settings.naming.customName}
                onChange={(e) => updateNaming({ customName: e.target.value })}
                placeholder="e.g. converted-image"
                className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700 rounded-xl"
              />
            </div>
          )}

          {/* Numbered options */}
          {settings.naming.mode === 'numbered' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="text-[11px] text-zinc-400">Prefix</label>
                <input
                  type="text"
                  placeholder="e.g. img-"
                  value={settings.naming.prefix}
                  onChange={(e) => updateNaming({ prefix: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-[#1a202e] border border-zinc-200 dark:border-zinc-700"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400">Suffix</label>
                <input
                  type="text"
                  placeholder="e.g. -final"
                  value={settings.naming.suffix}
                  onChange={(e) => updateNaming({ suffix: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-[#1a202e] border border-zinc-200 dark:border-zinc-700"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400">Start Number</label>
                <input
                  type="number"
                  min="0"
                  value={settings.naming.startNumber}
                  onChange={(e) =>
                    updateNaming({
                      startNumber: parseInt(e.target.value, 10) || 1,
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-[#1a202e] border border-zinc-200 dark:border-zinc-700"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400">Zero Padding</label>
                <select
                  value={settings.naming.numberPadding}
                  onChange={(e) =>
                    updateNaming({
                      numberPadding: parseInt(e.target.value, 10) || 1,
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-[#1a202e] border border-zinc-200 dark:border-zinc-700"
                >
                  <option value={1}>1 (1, 2, 3)</option>
                  <option value={2}>01 (01, 02)</option>
                  <option value={3}>001 (001, 002)</option>
                  <option value={4}>0001 (0001, 0002)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
