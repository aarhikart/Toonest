'use client';

import React, { useState } from 'react';
import { RenameConfig, CaseTransform } from '@/lib/types';
import {
  Settings,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Sliders,
  FileText,
  RotateCcw,
  Check,
  Hash,
} from 'lucide-react';

interface RenameSettingsProps {
  config: RenameConfig;
  onChange: (newConfig: RenameConfig) => void;
  onReset: () => void;
  samplePreview: string;
}

export function RenameSettings({
  config,
  onChange,
  onReset,
  samplePreview,
}: RenameSettingsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateConfig = (patch: Partial<RenameConfig>) => {
    onChange({ ...config, ...patch });
  };

  const insertPatternTag = (tag: string) => {
    const current = config.pattern || '';
    updateConfig({ pattern: current + tag });
  };

  return (
    <div className="bg-white dark:bg-[#131722] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm p-6 sm:p-7 space-y-6">
      {/* Card Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white leading-none">
              Rename Settings
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Configure naming schema and real-time transformation rules
            </p>
          </div>
        </div>

        {/* Mode Toggle Pills */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-[#1a202e] p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => updateConfig({ mode: 'standard' })}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              config.mode === 'standard'
                ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Standard Mode
          </button>
          <button
            type="button"
            onClick={() => updateConfig({ mode: 'pattern' })}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              config.mode === 'pattern'
                ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Custom Pattern
          </button>
        </div>
      </div>

      {/* Main Settings Form */}
      {config.mode === 'standard' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Base Name */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
              <span>Base Name</span>
              <span className="text-[11px] font-normal text-zinc-400">e.g. &quot;product&quot;, &quot;vacation&quot;</span>
            </label>
            <input
              type="text"
              value={config.baseName}
              onChange={(e) => updateConfig({ baseName: e.target.value })}
              placeholder="e.g. product-image"
              className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700 rounded-xl focus:border-[#5722AF] dark:focus:border-[#9B6BE8] focus:bg-white dark:focus:bg-[#131722] transition-colors"
            />
          </div>

          {/* Start Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
              <span>Start Number</span>
              <span className="text-[11px] font-normal text-zinc-400">Default: 1</span>
            </label>
            <input
              type="number"
              min="0"
              value={config.startNumber}
              onChange={(e) => updateConfig({ startNumber: parseInt(e.target.value, 10) || 0 })}
              className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700 rounded-xl focus:border-[#5722AF] dark:focus:border-[#9B6BE8] focus:bg-white dark:focus:bg-[#131722] transition-colors"
            />
          </div>

          {/* Number Padding */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Number Padding
            </label>
            <select
              value={config.numberPadding}
              onChange={(e) => updateConfig({ numberPadding: parseInt(e.target.value, 10) })}
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700 rounded-xl focus:border-[#5722AF] dark:focus:border-[#9B6BE8] focus:bg-white dark:focus:bg-[#131722] transition-colors"
            >
              <option value={1}>1 (e.g. 1, 2, 3)</option>
              <option value={2}>01 (e.g. 01, 02)</option>
              <option value={3}>001 (e.g. 001, 002)</option>
              <option value={4}>0001 (e.g. 0001, 0002)</option>
            </select>
          </div>

          {/* Separator */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Separator
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Hyphen ( - )', val: '-' },
                { label: 'Underscore ( _ )', val: '_' },
                { label: 'Space (   )', val: ' ' },
                { label: 'None', val: '' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => updateConfig({ separator: item.val })}
                  className={`py-2 px-2.5 text-xs font-medium rounded-xl border transition-all truncate text-center ${
                    config.separator === item.val
                      ? 'border-[#5722AF] bg-[#5722AF]/10 text-[#5722AF] dark:border-[#9B6BE8] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8]'
                      : 'border-zinc-200 dark:border-zinc-700/80 bg-zinc-50 dark:bg-[#1a202e] text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Custom Pattern Mode */
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Custom Rename Pattern
              </label>
              <span className="text-[11px] text-zinc-400">
                Click tags below to insert placeholders
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={config.pattern}
                onChange={(e) => updateConfig({ pattern: e.target.value })}
                placeholder="e.g. {name}-{number}"
                className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700 rounded-xl focus:border-[#5722AF] dark:focus:border-[#9B6BE8] focus:bg-white dark:focus:bg-[#131722] font-mono transition-colors"
              />
            </div>
          </div>

          {/* Quick placeholder tags */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 mr-1">Available Tags:</span>
            {[
              { tag: '{name}', desc: 'Original name' },
              { tag: '{number}', desc: 'Sequence number' },
              { tag: '{date}', desc: 'Current date' },
              { tag: '{extension}', desc: 'File extension' },
            ].map(({ tag, desc }) => (
              <button
                key={tag}
                type="button"
                onClick={() => insertPatternTag(tag)}
                className="px-2.5 py-1 text-xs font-mono rounded-lg bg-zinc-100 hover:bg-[#5722AF]/10 dark:bg-[#1a202e] dark:hover:bg-[#5722AF]/20 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:text-[#5722AF] dark:hover:text-[#9B6BE8] hover:border-[#5722AF]/40 transition-colors"
                title={desc}
              >
                + {tag}
              </button>
            ))}
          </div>

          {/* Pattern number padding and start number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Start Number for {'{number}'}
              </label>
              <input
                type="number"
                min="0"
                value={config.startNumber}
                onChange={(e) => updateConfig({ startNumber: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Number Padding for {'{number}'}
              </label>
              <select
                value={config.numberPadding}
                onChange={(e) => updateConfig({ numberPadding: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700 rounded-xl"
              >
                <option value={1}>1 (e.g. 1, 2, 3)</option>
                <option value={2}>01 (e.g. 01, 02)</option>
                <option value={3}>001 (e.g. 001, 002)</option>
                <option value={4}>0001 (e.g. 0001, 0002)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Live Sample Format Callout */}
      <div className="p-3.5 rounded-xl bg-[#5722AF]/5 dark:bg-[#5722AF]/10 border border-[#5722AF]/15 dark:border-[#5722AF]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
          <Sparkles className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>Live Pattern Preview:</span>
        </div>
        <div className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-white dark:bg-[#1a202e] text-[#5722AF] dark:text-[#9B6BE8] border border-[#5722AF]/20 shadow-xs truncate max-w-md">
          {samplePreview || 'product-001.jpg'}
        </div>
      </div>

      {/* Advanced Options Accordion */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors py-1"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Advanced Renaming Options</span>
            {(config.prefix ||
              config.suffix ||
              config.findText ||
              config.caseTransform !== 'none' ||
              config.removeSpaces ||
              config.removeSpecialChars ||
              !config.preserveExtension) && (
              <span className="w-2 h-2 rounded-full bg-[#5722AF] dark:bg-[#9B6BE8]" />
            )}
          </div>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </button>

        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 animate-in fade-in duration-150">
            {/* Prefix */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Add Prefix
              </label>
              <input
                type="text"
                value={config.prefix}
                onChange={(e) => updateConfig({ prefix: e.target.value })}
                placeholder="e.g. 2026-"
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700 rounded-xl"
              />
            </div>

            {/* Suffix */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Add Suffix
              </label>
              <input
                type="text"
                value={config.suffix}
                onChange={(e) => updateConfig({ suffix: e.target.value })}
                placeholder="e.g. -final"
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700 rounded-xl"
              />
            </div>

            {/* Case Transform */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Convert Filename Case
              </label>
              <select
                value={config.caseTransform}
                onChange={(e) => updateConfig({ caseTransform: e.target.value as CaseTransform })}
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700 rounded-xl"
              >
                <option value="none">Preserve Original Case</option>
                <option value="lowercase">lowercase (e.g. image-001)</option>
                <option value="uppercase">UPPERCASE (e.g. IMAGE-001)</option>
                <option value="titlecase">Title Case (e.g. Image-001)</option>
              </select>
            </div>

            {/* Replace Text: Find */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Replace Text (Find)
              </label>
              <input
                type="text"
                value={config.findText}
                onChange={(e) => updateConfig({ findText: e.target.value })}
                placeholder="e.g. IMG_"
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700 rounded-xl"
              />
            </div>

            {/* Replace Text: With */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Replace With
              </label>
              <input
                type="text"
                value={config.replaceText}
                onChange={(e) => updateConfig({ replaceText: e.target.value })}
                placeholder="e.g. product-"
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700 rounded-xl"
              />
            </div>

            {/* Preserve Extension */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                File Extension
              </label>
              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={config.preserveExtension}
                    onChange={(e) => updateConfig({ preserveExtension: e.target.checked })}
                    className="w-4 h-4 rounded text-[#5722AF] focus:ring-[#5722AF]"
                  />
                  <span>Preserve original (.jpg, .png)</span>
                </label>
              </div>
              {!config.preserveExtension && (
                <input
                  type="text"
                  value={config.customExtension}
                  onChange={(e) => updateConfig({ customExtension: e.target.value })}
                  placeholder="e.g. jpg"
                  className="mt-1.5 w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700 rounded-lg"
                />
              )}
            </div>

            {/* Switches: Remove Spaces & Clean Special Chars */}
            <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={config.removeSpaces}
                  onChange={(e) => updateConfig({ removeSpaces: e.target.checked })}
                  className="w-4 h-4 rounded text-[#5722AF] focus:ring-[#5722AF]"
                />
                <span>Remove Spaces (convert spaces to hyphens)</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={config.removeSpecialChars}
                  onChange={(e) => updateConfig({ removeSpecialChars: e.target.checked })}
                  className="w-4 h-4 rounded text-[#5722AF] focus:ring-[#5722AF]"
                />
                <span>Remove Special Characters (sanitize for safe filenames)</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer: Reset to defaults */}
      <div className="flex items-center justify-end pt-2">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Settings to Defaults</span>
        </button>
      </div>
    </div>
  );
}
