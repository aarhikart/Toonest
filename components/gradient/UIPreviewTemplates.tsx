'use client';

import React, { useState } from 'react';
import {
  Layout,
  Type,
  Smartphone,
  CreditCard,
  Sparkles,
  ArrowRight,
  User,
  Heart,
  Share2,
} from 'lucide-react';
import { GradientConfig } from '@/lib/gradient/gradientTypes';
import { generateGradientCss } from '@/lib/gradient/gradientEngine';

interface UIPreviewTemplatesProps {
  config: GradientConfig;
}

type TemplateTab =
  | 'hero'
  | 'button'
  | 'card'
  | 'text'
  | 'mobile'
  | 'profile'
  | 'navbar';

export function UIPreviewTemplates({ config }: UIPreviewTemplatesProps) {
  const [activeTemplate, setActiveTemplate] = useState<TemplateTab>('hero');
  const [textSize, setTextSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');
  const [customText, setCustomText] = useState('Create Something Beautiful');

  const cssValue = generateGradientCss(config);

  const textSizeClass = {
    sm: 'text-2xl sm:text-3xl',
    md: 'text-3xl sm:text-4xl',
    lg: 'text-4xl sm:text-5xl md:text-6xl',
    xl: 'text-5xl sm:text-6xl md:text-7xl',
  }[textSize];

  return (
    <div className="w-full bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-6 shadow-xs transition-colors space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8]">
            <Layout className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Real UI Component Previews
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Test your gradient across real-world digital product templates
            </p>
          </div>
        </div>

        {/* Template Selector Tabs */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 overflow-x-auto text-xs">
          {[
            { id: 'hero' as TemplateTab, label: 'Hero Section' },
            { id: 'button' as TemplateTab, label: 'Buttons' },
            { id: 'card' as TemplateTab, label: 'Card' },
            { id: 'text' as TemplateTab, label: 'Gradient Text' },
            { id: 'mobile' as TemplateTab, label: 'Mobile App' },
            { id: 'profile' as TemplateTab, label: 'Profile' },
            { id: 'navbar' as TemplateTab, label: 'Navbar' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTemplate(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeTemplate === tab.id
                  ? 'bg-[#5722AF] text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Display Box */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 bg-zinc-50 dark:bg-zinc-900/40 min-h-[320px] flex items-center justify-center">
        {/* 1. HERO SECTION TEMPLATE */}
        {activeTemplate === 'hero' && (
          <div
            className="w-full max-w-2xl rounded-2xl p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden"
            style={{ background: cssValue }}
          >
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold border border-white/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next Generation Platform</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-sm">
                Build Faster with Modern Gradients
              </h2>

              <p className="text-sm text-white/90 max-w-md mx-auto leading-relaxed">
                Elevate your brand aesthetic with mathematically blended CSS gradients ready for production.
              </p>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-xl bg-white text-zinc-900 text-xs font-bold shadow-lg hover:bg-white/90 transition-all"
                >
                  Get Started Free
                </button>
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-xl bg-black/20 backdrop-blur-md text-white border border-white/30 text-xs font-bold hover:bg-black/30 transition-all"
                >
                  Live Demo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. BUTTONS TEMPLATE */}
        {activeTemplate === 'button' && (
          <div className="space-y-6 text-center">
            <div className="text-xs text-zinc-500 font-semibold">
              Interactive Buttons with Active States
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {/* Primary Gradient CTA */}
              <button
                type="button"
                className="px-6 py-3 rounded-xl text-white font-bold text-sm shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center gap-2"
                style={{ background: cssValue }}
              >
                <span>Primary Gradient Action</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Pill Variant */}
              <button
                type="button"
                className="px-5 py-2.5 rounded-full text-white font-semibold text-xs shadow-md hover:opacity-90 active:scale-95 transition-all"
                style={{ background: cssValue }}
              >
                Pill Variant
              </button>

              {/* Gradient Border Button */}
              <div
                className="p-[2px] rounded-xl shadow-xs"
                style={{ background: cssValue }}
              >
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-[10px] bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-xs font-bold hover:bg-transparent hover:text-white transition-all"
                >
                  Gradient Border
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. CARD TEMPLATE */}
        {activeTemplate === 'card' && (
          <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            {/* Top gradient banner */}
            <div className="h-32 w-full p-4 flex items-end justify-between" style={{ background: cssValue }}>
              <span className="px-2.5 py-1 rounded-md bg-black/40 text-white text-[11px] font-bold backdrop-blur-xs">
                Featured Product
              </span>
            </div>
            <div className="p-5 space-y-3">
              <h4 className="font-bold text-base text-zinc-900 dark:text-white">
                Premium Design System
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Clean visual tokens and accessible components generated entirely in your browser.
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-bold text-zinc-900 dark:text-white">$49.00</span>
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-lg text-white text-xs font-bold shadow-xs hover:opacity-90 transition-opacity"
                  style={{ background: cssValue }}
                >
                  Purchase
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. GRADIENT TEXT TEMPLATE */}
        {activeTemplate === 'text' && (
          <div className="w-full max-w-2xl text-center space-y-4">
            {/* Font size selectors */}
            <div className="flex items-center justify-center gap-2">
              {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setTextSize(sz)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase border ${
                    textSize === sz
                      ? 'bg-[#5722AF] text-white border-[#5722AF]'
                      : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            {/* Editable Text Heading */}
            <div className="py-4">
              <h1
                className={`font-black tracking-tight leading-tight transition-all select-none ${textSizeClass}`}
                style={{
                  background: cssValue,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {customText}
              </h1>
            </div>

            <div className="max-w-md mx-auto">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Type custom text..."
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-center outline-none"
              />
            </div>
          </div>
        )}

        {/* 5. MOBILE APP TEMPLATE */}
        {activeTemplate === 'mobile' && (
          <div className="w-64 rounded-3xl overflow-hidden shadow-2xl border-4 border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
            {/* Mobile Header Banner */}
            <div className="p-5 pt-8 text-white space-y-2 shadow-md" style={{ background: cssValue }}>
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                Dashboard
              </div>
              <div className="text-xl font-black">Welcome Back</div>
              <div className="text-xs opacity-90">$14,280.00</div>
            </div>

            {/* Content List */}
            <div className="p-4 space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-between">
                <span className="font-semibold">Recent Transfer</span>
                <span className="font-bold text-emerald-500">+$240</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-between">
                <span className="font-semibold">Cloud Subscription</span>
                <span className="font-bold text-red-500">-$29</span>
              </div>
            </div>
          </div>
        )}

        {/* 6. PROFILE TEMPLATE */}
        {activeTemplate === 'profile' && (
          <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center">
            <div className="h-24 w-full" style={{ background: cssValue }} />
            <div className="px-5 pb-5 -mt-10">
              <div className="w-20 h-20 rounded-full border-4 border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-800 mx-auto flex items-center justify-center text-zinc-500 shadow-md">
                <User className="w-8 h-8" />
              </div>
              <h4 className="mt-2 font-bold text-sm text-zinc-900 dark:text-white">
                Alex Morgan
              </h4>
              <p className="text-xs text-zinc-500">Senior Product Designer</p>

              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  type="button"
                  className="px-4 py-1.5 rounded-lg text-white text-xs font-bold shadow-xs hover:opacity-90"
                  style={{ background: cssValue }}
                >
                  Follow
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 7. NAVBAR TEMPLATE */}
        {activeTemplate === 'navbar' && (
          <div className="w-full max-w-xl space-y-4">
            <div
              className="w-full p-4 rounded-xl text-white flex items-center justify-between shadow-lg"
              style={{ background: cssValue }}
            >
              <div className="font-black text-sm tracking-tight flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>ToolNest App</span>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-xs font-semibold opacity-90">
                <span>Features</span>
                <span>Pricing</span>
                <span>Docs</span>
              </div>
              <button
                type="button"
                className="px-3 py-1 rounded-lg bg-white text-zinc-900 text-xs font-bold shadow-sm"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
