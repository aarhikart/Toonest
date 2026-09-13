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
import { SavedShadow, ShadowConfig } from '@/lib/boxShadow/shadowTypes';
import { generateBoxShadowCss } from '@/lib/boxShadow/shadowEngine';

interface SavedShadowsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedShadows: SavedShadow[];
  historyShadows: SavedShadow[];
  onLoadShadow: (config: ShadowConfig) => void;
  onDeleteSaved: (id: string) => void;
  onDeleteHistory: (id: string) => void;
  onClearHistory: () => void;
  onRenameSaved: (id: string, newName: string) => void;
  onDuplicateSaved: (item: SavedShadow) => void;
}

export function SavedShadowsDrawer({
  isOpen,
  onClose,
  savedShadows,
  historyShadows,
  onLoadShadow,
  onDeleteSaved,
  onDeleteHistory,
  onClearHistory,
  onRenameSaved,
  onDuplicateSaved,
}: SavedShadowsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'saved' | 'history'>('saved');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyCss = (config: ShadowConfig, id: string) => {
    const css = generateBoxShadowCss(config.layers);
    navigator.clipboard.writeText(`box-shadow: ${css};`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleFinishRename = (id: string) => {
    if (tempName.trim()) {
      onRenameSaved(id, tempName.trim());
    }
    setEditingId(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-[#12151c] w-full max-w-md h-full flex flex-col shadow-2xl border-l border-zinc-200 dark:border-zinc-800 transition-colors">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8]">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Saved & History
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {savedShadows.length} saved favorites • {historyShadows.length} recent
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'saved'
                ? 'border-[#5722AF] text-[#5722AF] dark:text-[#9B6BE8]'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Favorites ({savedShadows.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-[#5722AF] text-[#5722AF] dark:text-[#9B6BE8]'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({historyShadows.length})</span>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: SAVED FAVORITES */}
          {activeTab === 'saved' && (
            <div>
              {savedShadows.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/20">
                  <Bookmark className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    No saved shadows yet
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Click "Save Shadow" in the toolbar to bookmark your custom presets locally.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedShadows.map((item) => {
                    const css = generateBoxShadowCss(item.config.layers);
                    const isCopied = copiedId === item.id;
                    const isEditing = editingId === item.id;

                    return (
                      <div
                        key={item.id}
                        className="group rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 p-3 space-y-2.5 transition-all hover:border-[#5722AF]/40"
                      >
                        <div className="flex items-center justify-between">
                          {isEditing ? (
                            <input
                              type="text"
                              value={tempName}
                              onChange={(e) => setTempName(e.target.value)}
                              onBlur={() => handleFinishRename(item.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleFinishRename(item.id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              autoFocus
                              className="text-xs font-bold bg-white dark:bg-zinc-800 border rounded px-1.5 py-0.5 outline-none"
                            />
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[170px]">
                                {item.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingId(item.id);
                                  setTempName(item.name);
                                }}
                                className="p-0.5 rounded text-zinc-400 hover:text-zinc-700"
                                title="Rename"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleCopyCss(item.config, item.id)}
                              className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                              title="Copy CSS"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => onDuplicateSaved(item)}
                              className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                              title="Duplicate"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteSaved(item.id)}
                              className="p-1 rounded text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Visual Preview */}
                        <div
                          onClick={() => {
                            onLoadShadow(item.config);
                            onClose();
                          }}
                          className="w-full h-16 rounded-lg flex items-center justify-center p-3 border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:ring-2 hover:ring-[#5722AF] transition-all"
                          style={{ backgroundColor: item.config.preview.previewBg }}
                          title="Click to load"
                        >
                          <div
                            className="w-16 h-8 rounded-md bg-white dark:bg-zinc-900"
                            style={{ boxShadow: css }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RECENT HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                  Last {historyShadows.length} configurations
                </span>
                {historyShadows.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearHistory}
                    className="text-[11px] font-semibold text-red-500 hover:underline"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {historyShadows.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/20">
                  <History className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    No history yet
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {historyShadows.map((item) => {
                    const css = generateBoxShadowCss(item.config.layers);
                    return (
                      <div
                        key={item.id}
                        className="group flex items-center gap-3 p-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 hover:border-[#5722AF]/40 transition-all"
                      >
                        <div
                          onClick={() => {
                            onLoadShadow(item.config);
                            onClose();
                          }}
                          className="w-16 h-12 rounded-lg flex items-center justify-center p-2 border border-zinc-200 dark:border-zinc-700 shrink-0 cursor-pointer"
                          style={{ backgroundColor: item.config.preview.previewBg }}
                        >
                          <div
                            className="w-8 h-5 rounded bg-white dark:bg-zinc-900"
                            style={{ boxShadow: css }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {item.config.layers.length} {item.config.layers.length === 1 ? 'layer' : 'layers'}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              onLoadShadow(item.config);
                              onClose();
                            }}
                            className="px-2 py-1 rounded text-xs font-bold text-[#5722AF] dark:text-[#9B6BE8] hover:underline flex items-center gap-0.5"
                          >
                            Load <ArrowRight className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteHistory(item.id)}
                            className="p-1 rounded text-zinc-400 hover:text-red-500"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
