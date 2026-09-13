'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Sliders,
  Check,
  Plus,
  Trash2,
  Share2,
  Bookmark,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  SocialPlatform,
  PresetCategory,
  SocialMediaPreset,
  SocialMediaConfig,
} from '@/lib/socialMediaTypes';
import { SOCIAL_MEDIA_PRESETS, getPresetById } from '@/lib/socialMediaPresets';
import { calculateAspectRatio } from '@/lib/socialMediaEngine';

interface PlatformPresetSelectorProps {
  config: SocialMediaConfig;
  onSelectPreset: (preset: SocialMediaPreset) => void;
  onCustomSizeChange: (width: number, height: number, unit: 'px' | 'percent') => void;
}

const PLATFORMS: { id: SocialPlatform | 'all'; label: string }[] = [
  { id: 'all', label: 'All Platforms' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'x', label: 'X (Twitter)' },
  { id: 'pinterest', label: 'Pinterest' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'snapchat', label: 'Snapchat' },
  { id: 'custom', label: 'Custom Size' },
];

const CATEGORIES: { id: PresetCategory; label: string }[] = [
  { id: 'all', label: 'All Formats' },
  { id: 'posts', label: 'Posts & Feeds' },
  { id: 'stories', label: 'Stories & Reels' },
  { id: 'covers', label: 'Covers & Banners' },
  { id: 'thumbnails', label: 'Thumbnails' },
  { id: 'profile', label: 'Profile Icons' },
];

export function PlatformPresetSelector({
  config,
  onSelectPreset,
  onCustomSizeChange,
}: PlatformPresetSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<PresetCategory>('all');

  // Custom presets stored in localStorage
  const [customPresets, setCustomPresets] = useState<SocialMediaPreset[]>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    if (config.presetId === 'custom') {
      setSelectedPlatform('custom');
    }
  }, [config.presetId]);

  // Load custom presets
  useEffect(() => {
    try {
      const saved = localStorage.getItem('toolnest_social_presets');
      if (saved) {
        setCustomPresets(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSaveCustomPreset = () => {
    if (!newPresetName.trim()) return;
    const w = config.customWidth || 1080;
    const h = config.customHeight || 1080;
    const newPreset: SocialMediaPreset = {
      id: `custom-${Date.now()}`,
      platform: 'custom',
      category: 'custom',
      name: newPresetName.trim(),
      width: w,
      height: h,
      aspectRatio: calculateAspectRatio(w, h),
      description: 'User saved custom dimensions',
      isCustom: true,
    };

    const updated = [...customPresets, newPreset];
    setCustomPresets(updated);
    try {
      localStorage.setItem('toolnest_social_presets', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setNewPresetName('');
    setShowSaveModal(false);
    onSelectPreset(newPreset);
  };

  const handleDeleteCustomPreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    try {
      localStorage.setItem('toolnest_social_presets', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Filter presets
  const filteredPresets = useMemo(() => {
    let list = [...SOCIAL_MEDIA_PRESETS, ...customPresets];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.platform.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          `${p.width}x${p.height}`.includes(q) ||
          p.aspectRatio.includes(q)
      );
    } else {
      if (selectedPlatform !== 'all') {
        list = list.filter((p) => p.platform === selectedPlatform);
      }
      if (selectedCategory !== 'all') {
        list = list.filter((p) => p.category === selectedCategory);
      }
    }

    return list;
  }, [searchQuery, selectedPlatform, selectedCategory, customPresets]);

  const activePreset = getPresetById(config.presetId);
  const liveCustomAspect = calculateAspectRatio(config.customWidth, config.customHeight);

  return (
    <div className="bg-white dark:bg-[#131620] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Top Search & Preset Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Choose Social Platform & Size
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Select an official platform preset or specify custom pixel dimensions.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search size (e.g. Story, YouTube)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
          />
        </div>
      </div>

      {/* Platform Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-zinc-100 dark:border-zinc-800">
        {PLATFORMS.map((platform) => {
          const isSelected = selectedPlatform === platform.id && !searchQuery;

          return (
            <button
              key={platform.id}
              type="button"
              onClick={() => {
                setSelectedPlatform(platform.id);
                setSearchQuery('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#5722AF] text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {platform.label}
            </button>
          );
        })}
      </div>

      {/* Category Pills (when not in search or custom) */}
      {!searchQuery && selectedPlatform !== 'custom' && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  isSelected
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      )}

      {/* CUSTOM SIZE MODE */}
      {selectedPlatform === 'custom' ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Custom Dimensions
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Specify exact width, height, and unit measurements.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#5722AF] dark:text-[#9B6BE8] px-2.5 py-1 rounded-lg bg-[#5722AF]/10">
                Aspect Ratio: {liveCustomAspect}
              </span>
              {!showSaveModal ? (
                <button
                  type="button"
                  onClick={() => setShowSaveModal(true)}
                  className="px-3 py-1 text-xs font-bold rounded-lg border border-[#5722AF]/30 text-[#5722AF] dark:text-[#9B6BE8] hover:bg-[#5722AF]/10 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Save Preset</span>
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Preset Name..."
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    className="text-xs px-2 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 w-28 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveCustomPreset();
                      if (e.key === 'Escape') setShowSaveModal(false);
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveCustomPreset}
                    className="p-1 rounded bg-[#5722AF] text-white"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSaveModal(false)}
                    className="text-xs text-zinc-400 px-1"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Width
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  min={16}
                  max={8000}
                  value={config.customWidth}
                  onChange={(e) =>
                    onCustomSizeChange(
                      Number(e.target.value),
                      config.customHeight,
                      config.customUnit
                    )
                  }
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Height
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  min={16}
                  max={8000}
                  value={config.customHeight}
                  onChange={(e) =>
                    onCustomSizeChange(
                      config.customWidth,
                      Number(e.target.value),
                      config.customUnit
                    )
                  }
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Unit
              </label>
              <select
                value={config.customUnit}
                onChange={(e) =>
                  onCustomSizeChange(
                    config.customWidth,
                    config.customHeight,
                    e.target.value as 'px' | 'percent'
                  )
                }
                className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
              >
                <option value="px">Pixels (px)</option>
                <option value="percent">Percentage (%)</option>
              </select>
            </div>
          </div>
        </div>
      ) : (
        /* PRESETS GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto pr-0.5">
          {filteredPresets.length === 0 ? (
            <div className="col-span-full text-center py-8 text-xs text-zinc-400">
              No presets found matching your search. Try another keyword or create a custom size.
            </div>
          ) : (
            filteredPresets.map((preset) => {
              const isSelected = config.presetId === preset.id;

              return (
                <div
                  key={preset.id}
                  onClick={() => onSelectPreset(preset)}
                  className={`relative p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#5722AF] bg-[#5722AF]/5 dark:bg-[#5722AF]/15 shadow-sm ring-1 ring-[#5722AF]'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:border-zinc-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-zinc-400 dark:text-zinc-500">
                        {preset.platform}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        {preset.aspectRatio}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1">
                      {preset.name}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                      {preset.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                    <span className="font-mono text-xs font-bold text-[#5722AF] dark:text-[#9B6BE8]">
                      {preset.width} × {preset.height} px
                    </span>

                    {preset.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCustomPreset(preset.id, e)}
                        className="text-zinc-400 hover:text-red-500 transition-colors"
                        title="Delete custom preset"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}

                    {isSelected && !preset.isCustom && (
                      <span className="w-5 h-5 rounded-full bg-[#5722AF] text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
