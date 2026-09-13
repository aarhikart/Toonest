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
  Download,
} from 'lucide-react';
import { SavedGradient, GradientConfig } from '@/lib/gradient/gradientTypes';
import { generateGradientCss, generateJson } from '@/lib/gradient/gradientEngine';

interface SavedGradientsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedGradients: SavedGradient[];
  historyGradients: SavedGradient[];
  onLoadGradient: (config: GradientConfig) => void;
  onDeleteSaved: (id: string) => void;
  onDeleteHistory: (id: string) => void;
  onClearHistory: () => void;
  onRenameSaved: (id: string, newName: string) => void;
  onDuplicateSaved: (item: SavedGradient) => void;
}

export function SavedGradientsDrawer({
  isOpen,
  onClose,
  savedGradients,
  historyGradients,
  onLoadGradient,
  onDeleteSaved,
  onDeleteHistory,
  onClearHistory,
  onRenameSaved,
  onDuplicateSaved,
}: SavedGradientsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'saved' | 'history'>('saved');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyCss = (config: GradientConfig, id: string) => {
    const css = generateGradientCss(config);
    navigator.clipboard.writeText(`background: ${css};`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleStartRename = (item: SavedGradient) => {
    setEditingId(item.id);
    setTempName(item.name);
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
                {savedGradients.length} favorites • {historyGradients.length} recent
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector: Favorites vs History */}
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
            <span>Saved Favorites ({savedGradients.length})</span>
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
            <span>History ({historyGradients.length})</span>
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: SAVED FAVORITES */}
          {activeTab === 'saved' && (
            <div>
              {savedGradients.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/20">
                  <Bookmark className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    No saved gradients yet
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Click "Save Gradient" to store your favorite color configurations locally.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedGradients.map((item) => {
                    const css = generateGradientCss(item.config);
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
                                onClick={() => handleStartRename(item)}
                                className="p-0.5 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
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
                              className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
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
                              className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                              title="Duplicate"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteSaved(item.id)}
                              className="p-1 rounded text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Visual Gradient Swatch */}
                        <div
                          onClick={() => {
                            onLoadGradient(item.config);
                            onClose();
                          }}
                          className="w-full h-14 rounded-lg shadow-inner cursor-pointer border border-zinc-300 dark:border-zinc-700 hover:ring-2 hover:ring-[#5722AF] transition-all flex items-end justify-end p-1.5"
                          style={{ background: css }}
                          title="Click to load this gradient"
                        >
                          <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            Load <ArrowRight className="w-2.5 h-2.5" />
                          </span>
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
                  Last {historyGradients.length} generated gradients
                </span>
                {historyGradients.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearHistory}
                    className="text-[11px] font-semibold text-red-500 hover:underline"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {historyGradients.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/20">
                  <History className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    No history yet
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Gradients you create or randomize will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {historyGradients.map((item) => {
                    const css = generateGradientCss(item.config);
                    return (
                      <div
                        key={item.id}
                        className="group flex items-center gap-3 p-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 hover:border-[#5722AF]/40 transition-all"
                      >
                        <div
                          onClick={() => {
                            onLoadGradient(item.config);
                            onClose();
                          }}
                          className="w-16 h-12 rounded-lg shadow-inner cursor-pointer border border-zinc-300 dark:border-zinc-700 shrink-0 hover:ring-2 hover:ring-[#5722AF]"
                          style={{ background: css }}
                          title="Click to load"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-zinc-400 capitalize">
                            {item.config.type} • {item.config.stops.length} stops
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              onLoadGradient(item.config);
                              onClose();
                            }}
                            className="px-2 py-1 rounded text-xs font-bold text-[#5722AF] dark:text-[#9B6BE8] hover:underline flex items-center gap-0.5"
                          >
                            Load <ArrowRight className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteHistory(item.id)}
                            className="p-1 rounded text-zinc-400 hover:text-red-500 transition-colors"
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

        {/* Drawer Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
