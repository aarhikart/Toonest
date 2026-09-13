'use client';

import React, { useState } from 'react';
import {
  X,
  Bookmark,
  History,
  Trash2,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Edit2,
} from 'lucide-react';
import {
  SavedRadiusPreset,
  BorderRadiusConfig,
} from '@/lib/borderRadius/borderRadiusTypes';
import { generateBorderRadiusCss } from '@/lib/borderRadius/borderRadiusEngine';

interface SavedRadiusDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedPresets: SavedRadiusPreset[];
  historyPresets: SavedRadiusPreset[];
  onLoadPreset: (config: BorderRadiusConfig) => void;
  onDeleteSaved: (id: string) => void;
  onDeleteHistory: (id: string) => void;
  onClearHistory: () => void;
  onRenameSaved: (id: string, newName: string) => void;
  onDuplicateSaved: (item: SavedRadiusPreset) => void;
}

export function SavedRadiusDrawer({
  isOpen,
  onClose,
  savedPresets,
  historyPresets,
  onLoadPreset,
  onDeleteSaved,
  onDeleteHistory,
  onClearHistory,
  onRenameSaved,
  onDuplicateSaved,
}: SavedRadiusDrawerProps) {
  const [activeTab, setActiveTab] = useState<'saved' | 'history'>('saved');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartRename = (item: SavedRadiusPreset) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const handleSaveRename = (id: string) => {
    if (editName.trim()) {
      onRenameSaved(id, editName.trim());
    }
    setEditingId(null);
  };

  const handleCopyCss = (cfg: BorderRadiusConfig, id: string) => {
    const css = `border-radius: ${generateBorderRadiusCss(cfg)};`;
    navigator.clipboard.writeText(css);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const items = activeTab === 'saved' ? savedPresets : historyPresets;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#12151c] border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-200 ease-out">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Border Radius Library
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 pt-3 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`pb-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'saved'
                ? 'border-[#5722AF] text-[#5722AF] dark:text-[#9B6BE8]'
                : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Presets ({savedPresets.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'history'
                ? 'border-[#5722AF] text-[#5722AF] dark:text-[#9B6BE8]'
                : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Recent History ({historyPresets.length})</span>
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                {activeTab === 'saved' ? <Bookmark className="w-5 h-5" /> : <History className="w-5 h-5" />}
              </div>
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                {activeTab === 'saved' ? 'No saved presets yet' : 'No recent history'}
              </p>
              <p className="text-[11px] text-zinc-400 max-w-[220px] mx-auto">
                {activeTab === 'saved'
                  ? 'Click "Save" in the top bar to store your custom shapes in favorites.'
                  : 'Shapes you test or generate are recorded here automatically.'}
              </p>
            </div>
          ) : (
            items.map((item) => {
              const radiusCss = generateBorderRadiusCss(item.config);

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-[#151722] hover:border-[#5722AF]/50 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    {/* Title or Edit Input */}
                    {editingId === item.id ? (
                      <div className="flex items-center gap-1 flex-1">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(item.id)}
                          className="w-full px-2 py-0.5 rounded-md border border-[#5722AF] bg-white dark:bg-[#12121A] text-xs font-medium text-zinc-900 dark:text-white"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(item.id)}
                          className="px-2 py-0.5 rounded-md bg-[#5722AF] text-white text-[11px] font-semibold"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                          {item.name}
                        </span>
                        {activeTab === 'saved' && (
                          <button
                            type="button"
                            onClick={() => handleStartRename(item)}
                            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            title="Rename"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}

                    <div className="text-[10px] text-zinc-400 shrink-0 font-mono">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>

                  {/* Thumbnail and CSS String */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-10 rounded-md bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center shrink-0 overflow-hidden">
                      <div
                        style={{
                          borderRadius: radiusCss,
                          backgroundColor: item.config.preview.elementBg,
                        }}
                        className="w-8 h-6 shadow-2xs"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-mono text-zinc-600 dark:text-zinc-300 truncate">
                        {radiusCss}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {item.config.unit} • {item.config.isElliptical ? 'Elliptical' : 'Standard'}
                      </div>
                    </div>
                  </div>

                  {/* Item Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopyCss(item.config, item.id)}
                        className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Copy CSS"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {activeTab === 'saved' && (
                        <button
                          type="button"
                          onClick={() => onDuplicateSaved(item)}
                          className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Duplicate"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          activeTab === 'saved'
                            ? onDeleteSaved(item.id)
                            : onDeleteHistory(item.id)
                        }
                        className="p-1 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onLoadPreset(item.config);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#5722AF] text-white text-[11px] font-semibold hover:bg-[#491B93] transition-colors"
                    >
                      <span>Load Shape</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {activeTab === 'history' && historyPresets.length > 0 && (
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/80 flex justify-end">
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
