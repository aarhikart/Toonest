'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  ArrowLeftRight,
  Grid,
  Ruler,
  CheckSquare,
  FileText,
  RotateCw,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
  Sliders,
  RotateCcw,
  Square,
  Layers,
} from 'lucide-react';
import {
  DevicePreset,
  DeviceCategory,
  Orientation,
  TestSession,
  BrowserTarget,
  TestStatus,
} from '@/lib/responsive/types';
import { DEVICE_PRESETS, COMMON_VIEWPORT_SIZES } from '@/lib/responsive/devices';
import { saveTestSessionToHistory } from '@/lib/responsive/storage';
import { URLInput } from './URLInput';
import { DeviceSelector } from './DeviceSelector';
import { CustomViewport } from './CustomViewport';
import { OrientationToggle } from './OrientationToggle';
import { PreviewToolbar } from './PreviewToolbar';
import { PreviewFrame } from './PreviewFrame';
import { ComparisonView } from './ComparisonView';
import { MultiDevicePreview } from './MultiDevicePreview';
import { BreakpointTester } from './BreakpointTester';
import { ResponsiveChecks } from './ResponsiveChecks';
import { BrowserChecklist } from './BrowserChecklist';
import { DeviceOrientationMatrix } from './DeviceOrientationMatrix';
import { NotesPanel } from './NotesPanel';
import { TestReport } from './TestReport';
import { TestHistory } from './TestHistory';

type ViewMode = 'single' | 'compare' | 'multi' | 'breakpoint' | 'checks' | 'report';

export const ResponsiveTester: React.FC = () => {
  const [url, setUrl] = useState<string>('https://example.com');
  const [activeMode, setActiveMode] = useState<ViewMode>('single');
  const [selectedPreset, setSelectedPreset] = useState<DevicePreset>(DEVICE_PRESETS[4]); // Standard iPhone
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [customWidth, setCustomWidth] = useState<number>(390);
  const [customHeight, setCustomHeight] = useState<number>(844);
  const [zoom, setZoom] = useState<number>(1);
  const [showDeviceFrame, setShowDeviceFrame] = useState<boolean>(true);
  const [showSafeArea, setShowSafeArea] = useState<boolean>(false);
  const [touchMode, setTouchMode] = useState<boolean>(false);
  const [dpr, setDpr] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(Date.now());

  // QA Test Session State
  const [session, setSession] = useState<TestSession>({
    id: `session-${Date.now()}`,
    url: 'https://example.com',
    timestamp: new Date().toISOString(),
    deviceStatuses: {},
    orientationMatrix: {},
    browserChecklist: {
      chrome: 'untested',
      firefox: 'untested',
      safari: 'untested',
      edge: 'untested',
      'ios-safari': 'untested',
      'android-chrome': 'untested',
    },
    selectedIssues: [],
    accessibilityChecks: [],
    notes: '',
    testedViewportsCount: 0,
  });

  // Read URL search params on client mount if present
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('url');
    const widthParam = params.get('width');
    const heightParam = params.get('height');

    if (urlParam) {
      setUrl(urlParam);
      setSession((prev) => ({ ...prev, url: urlParam }));
    }
    if (widthParam && heightParam) {
      const w = Number(widthParam);
      const h = Number(heightParam);
      if (w >= 200 && h >= 300) {
        setCustomWidth(w);
        setCustomHeight(h);
      }
    }
  }, []);

  // Save session changes to history
  useEffect(() => {
    if (url && (Object.keys(session.deviceStatuses).length > 0 || session.notes)) {
      saveTestSessionToHistory(session);
    }
  }, [session, url]);

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    setSession((prev) => ({
      ...prev,
      url: newUrl,
      id: `session-${Date.now()}`,
      timestamp: new Date().toISOString(),
    }));
    setReloadKey(Date.now());
  };

  const handleSelectPreset = (preset: DevicePreset) => {
    setSelectedPreset(preset);
    const w = orientation === 'portrait' ? preset.width : preset.height;
    const h = orientation === 'portrait' ? preset.height : preset.width;
    setCustomWidth(w);
    setCustomHeight(h);
    setDpr(preset.dpr);
  };

  const handleCustomApply = (w: number, h: number) => {
    setCustomWidth(w);
    setCustomHeight(h);
  };

  const handleToggleOrientation = () => {
    const next = orientation === 'portrait' ? 'landscape' : 'portrait';
    setOrientation(next);
    // Flip width and height
    const tempW = customWidth;
    setCustomWidth(customHeight);
    setCustomHeight(tempW);
  };

  const handleSetOrientation = (newOri: Orientation) => {
    if (newOri === orientation) return;
    setOrientation(newOri);
    const tempW = customWidth;
    setCustomWidth(customHeight);
    setCustomHeight(tempW);
  };

  // Quick mark status for currently active device
  const handleMarkCurrentStatus = (status: TestStatus) => {
    setSession((prev) => {
      const updatedStatuses = { ...prev.deviceStatuses, [selectedPreset.id]: status };
      const currentMatrix = prev.orientationMatrix[selectedPreset.id] || { portrait: 'untested', landscape: 'untested' };
      const updatedMatrix = {
        ...prev.orientationMatrix,
        [selectedPreset.id]: {
          ...currentMatrix,
          [orientation]: status,
        },
      };
      return {
        ...prev,
        deviceStatuses: updatedStatuses,
        orientationMatrix: updatedMatrix,
      };
    });
  };

  const handleResetTest = () => {
    if (session.notes || Object.keys(session.deviceStatuses).length > 0) {
      if (!confirm('Are you sure you want to reset all test statuses, notes, and QA checklists?')) {
        return;
      }
    }
    setSession({
      id: `session-${Date.now()}`,
      url,
      timestamp: new Date().toISOString(),
      deviceStatuses: {},
      orientationMatrix: {},
      browserChecklist: {
        chrome: 'untested',
        firefox: 'untested',
        safari: 'untested',
        edge: 'untested',
        'ios-safari': 'untested',
        'android-chrome': 'untested',
      },
      selectedIssues: [],
      accessibilityChecks: [],
      notes: '',
      testedViewportsCount: 0,
    });
  };

  const activeDeviceStatus = session.deviceStatuses[selectedPreset.id] || 'untested';

  return (
    <div className="space-y-6">
      {/* Top URL Input Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Target Website URL
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetTest}
              className="text-xs text-zinc-500 hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Test</span>
            </button>
          </div>
        </div>

        <URLInput
          url={url}
          onUrlChange={handleUrlChange}
          onReload={() => setReloadKey(Date.now())}
        />
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs">
        <button
          type="button"
          onClick={() => setActiveMode('single')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeMode === 'single'
              ? 'bg-[#5722AF] text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Single Viewport</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('compare')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeMode === 'compare'
              ? 'bg-[#5722AF] text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Side-by-Side (Compare)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('multi')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeMode === 'multi'
              ? 'bg-[#5722AF] text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Multi-Device (4 Screens)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('breakpoint')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeMode === 'breakpoint'
              ? 'bg-[#5722AF] text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>Breakpoint Ruler</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('checks')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeMode === 'checks'
              ? 'bg-[#5722AF] text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>QA Matrix &amp; Checklists</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('report')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeMode === 'report'
              ? 'bg-[#5722AF] text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Test Report</span>
        </button>
      </div>

      {/* MODE 1: Single Viewport Testing */}
      {activeMode === 'single' && (
        <div className="space-y-6">
          {/* Viewport Control Bar */}
          <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Left: Custom Size Inputs & Orientation */}
              <div className="flex items-center gap-3 flex-wrap">
                <CustomViewport
                  currentWidth={customWidth}
                  currentHeight={customHeight}
                  onApply={handleCustomApply}
                />

                <OrientationToggle
                  orientation={orientation}
                  onToggle={handleToggleOrientation}
                  onSetOrientation={handleSetOrientation}
                />
              </div>

              {/* Right: Quick Pass/Warn/Fail logger for current active viewport */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-500">QA Status:</span>
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
                  <button
                    type="button"
                    onClick={() => handleMarkCurrentStatus('pass')}
                    className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer ${
                      activeDeviceStatus === 'pass'
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-emerald-500'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Pass</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkCurrentStatus('warning')}
                    className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer ${
                      activeDeviceStatus === 'warning'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-amber-500'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Warn</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkCurrentStatus('fail')}
                    className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer ${
                      activeDeviceStatus === 'fail'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-rose-500'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Fail</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Device Preset Grid */}
            <DeviceSelector
              selectedPreset={selectedPreset}
              orientation={orientation}
              onSelectPreset={handleSelectPreset}
              testedStatuses={session.deviceStatuses}
            />

            {/* Quick Common Screen Sizes Strip */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto text-[11px] text-zinc-500">
              <span className="font-semibold whitespace-nowrap mr-1">Common Viewports:</span>
              {COMMON_VIEWPORT_SIZES.slice(0, 10).map((sz) => (
                <button
                  key={sz.label}
                  type="button"
                  onClick={() => {
                    setCustomWidth(sz.width);
                    setCustomHeight(sz.height);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 whitespace-nowrap cursor-pointer"
                >
                  {sz.width}×{sz.height}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Preview Toolbar */}
          <PreviewToolbar
            zoom={zoom}
            onZoomChange={(z) => setZoom(z)}
            onFitToScreen={() => setZoom(0.75)}
            showDeviceFrame={showDeviceFrame}
            onToggleDeviceFrame={() => setShowDeviceFrame(!showDeviceFrame)}
            showSafeArea={showSafeArea}
            onToggleSafeArea={() => setShowSafeArea(!showSafeArea)}
            touchMode={touchMode}
            onToggleTouchMode={() => setTouchMode(!touchMode)}
            dpr={dpr}
            onDprChange={(d) => setDpr(d)}
            onRefresh={() => setReloadKey(Date.now())}
            onOpenExternal={() => window.open(url, '_blank')}
            onOpenInWindow={() => {
              window.open(url, 'ResponsiveTest', `width=${customWidth},height=${customHeight}`);
            }}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          />

          {/* Main Preview Stage */}
          <PreviewFrame
            url={url}
            preset={selectedPreset}
            width={customWidth}
            height={customHeight}
            orientation={orientation}
            zoom={zoom}
            showDeviceFrame={showDeviceFrame}
            showSafeArea={showSafeArea}
            touchMode={touchMode}
            dpr={dpr}
            onRefresh={() => setReloadKey(Date.now())}
          />
        </div>
      )}

      {/* MODE 2: Side-by-Side Comparison */}
      {activeMode === 'compare' && (
        <ComparisonView url={url} orientation={orientation} />
      )}

      {/* MODE 3: Multi-Device Preview */}
      {activeMode === 'multi' && (
        <MultiDevicePreview url={url} />
      )}

      {/* MODE 4: Breakpoint Tester */}
      {activeMode === 'breakpoint' && (
        <BreakpointTester
          url={url}
          currentWidth={customWidth}
          onSelectWidth={(w) => setCustomWidth(w)}
        />
      )}

      {/* MODE 5: QA Checklists & Matrix */}
      {activeMode === 'checks' && (
        <div className="space-y-6">
          <BrowserChecklist
            statuses={session.browserChecklist}
            onUpdateStatus={(browser, st) => {
              setSession((prev) => ({
                ...prev,
                browserChecklist: { ...prev.browserChecklist, [browser]: st },
              }));
            }}
          />

          <DeviceOrientationMatrix
            matrix={session.orientationMatrix}
            onUpdateMatrix={(deviceId, ori, st) => {
              setSession((prev) => {
                const existing = prev.orientationMatrix[deviceId] || { portrait: 'untested', landscape: 'untested' };
                return {
                  ...prev,
                  orientationMatrix: {
                    ...prev.orientationMatrix,
                    [deviceId]: { ...existing, [ori]: st },
                  },
                };
              });
            }}
          />

          <ResponsiveChecks
            selectedIssues={session.selectedIssues}
            onToggleIssue={(id) => {
              setSession((prev) => {
                const exists = prev.selectedIssues.includes(id);
                return {
                  ...prev,
                  selectedIssues: exists
                    ? prev.selectedIssues.filter((i) => i !== id)
                    : [...prev.selectedIssues, id],
                };
              });
            }}
            accessibilityChecks={session.accessibilityChecks}
            onToggleAccessibility={(id) => {
              setSession((prev) => {
                const exists = prev.accessibilityChecks.includes(id);
                return {
                  ...prev,
                  accessibilityChecks: exists
                    ? prev.accessibilityChecks.filter((i) => i !== id)
                    : [...prev.accessibilityChecks, id],
                };
              });
            }}
          />

          <NotesPanel
            notes={session.notes}
            onChangeNotes={(notes) => setSession((prev) => ({ ...prev, notes }))}
          />
        </div>
      )}

      {/* MODE 6: Test Report */}
      {activeMode === 'report' && (
        <TestReport session={session} />
      )}

      {/* Bottom Row: Recent Test History */}
      <TestHistory
        onLoadSession={(loaded) => {
          setSession(loaded);
          setUrl(loaded.url);
          setReloadKey(Date.now());
        }}
      />
    </div>
  );
};
