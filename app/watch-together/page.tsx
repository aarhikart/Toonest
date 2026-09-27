'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import {
  Tv,
  Film,
  Users,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Volume2,
  Share2,
  MonitorPlay,
  Play,
  Info,
  ChevronDown,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { StreamingPlatform } from '@/lib/watch-room/types';

export default function WatchTogetherHubPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Create room state
  const [hostName, setHostName] = useState('');
  const [roomTitle, setRoomTitle] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<StreamingPlatform>('netflix');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Join room state
  const [joinCode, setJoinCode] = useState('');
  const [guestName, setGuestName] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  // FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const platforms: {
    id: StreamingPlatform;
    name: string;
    icon: string;
    color: string;
    badge: string;
  }[] = [
    {
      id: 'netflix',
      name: 'Netflix',
      icon: '🎬',
      color: 'bg-red-600 text-white',
      badge: 'border-red-500/40 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40',
    },
    {
      id: 'hotstar',
      name: 'Disney+ Hotstar',
      icon: '🌟',
      color: 'bg-blue-600 text-white',
      badge: 'border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40',
    },
    {
      id: 'prime',
      name: 'Prime Video',
      icon: '📦',
      color: 'bg-sky-600 text-white',
      badge: 'border-sky-500/40 text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40',
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: '📺',
      color: 'bg-rose-600 text-white',
      badge: 'border-rose-500/40 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40',
    },
    {
      id: 'other',
      name: 'Other / Custom Tab',
      icon: '🌐',
      color: 'bg-purple-600 text-white',
      badge: 'border-purple-500/40 text-[#5722AF] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40',
    },
  ];

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostName.trim()) {
      setCreateError('Please enter your name as Host.');
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const hostPeerId = `host_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const res = await fetch('/api/watch-room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: hostName.trim(),
          hostPeerId,
          platform: selectedPlatform,
          title: roomTitle.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setCreateError(data.error || 'Failed to create room. Please try again.');
        setIsCreating(false);
        return;
      }

      // Store host credentials locally
      if (typeof window !== 'undefined') {
        localStorage.setItem(`watch_peer_${data.roomId}`, hostPeerId);
        localStorage.setItem(`watch_name_${data.roomId}`, hostName.trim());
        localStorage.setItem(`watch_host_${data.roomId}`, '1');
        localStorage.setItem(`watch_platform_${data.roomId}`, selectedPlatform);
      }

      const params = new URLSearchParams();
      params.set('platform', selectedPlatform);
      params.set('host', hostName.trim());
      if (roomTitle.trim()) {
        params.set('title', roomTitle.trim());
      }

      router.push(`/watch-room/${data.roomId}?${params.toString()}`);
    } catch (err: any) {
      console.error('Create room error:', err);
      setCreateError('Network error occurred. Please check your connection.');
      setIsCreating(false);
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    let raw = joinCode.trim();
    if (raw.includes('/watch-room/')) {
      const match = raw.match(/\/watch-room\/([A-Za-z0-9_-]+)/i);
      if (match && match[1]) {
        raw = match[1];
      }
    }
    const cleanCode = raw.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!cleanCode) {
      setJoinError('Please enter a room code.');
      return;
    }

    if (cleanCode.length < 3) {
      setJoinError('Invalid room code length.');
      return;
    }

    if (guestName.trim()) {
      localStorage.setItem(`watch_name_${cleanCode}`, guestName.trim());
    }

    router.push(`/watch-room/${cleanCode}`);
  };

  const faqs = [
    {
      q: 'How does Watch Together work?',
      a: 'The Host starts a virtual cinema room, opens their chosen streaming platform or video in a browser tab, and shares their screen and tab audio using native browser WebRTC. Friends can join with a link and watch in real time with zero delay.',
    },
    {
      q: 'How do I share movie sound / audio with my friends?',
      a: 'When you click "Start Screen Share", select the "Chrome Tab" (or "Browser Tab") where your video is playing and make sure the "Also share tab audio" checkbox is checked at the bottom of the browser popup. This streams both HD video and stereo sound!',
    },
    {
      q: 'Do my friends need to create an account or sign in to Netflix/Hotstar?',
      a: 'No! Friends join your room directly with a display name through your shared room link. They do not need accounts, logins, or app installs.',
    },
    {
      q: 'Can friends join on phones or tablets?',
      a: 'Yes. The virtual cinema player is fully responsive and supports inline video playback on desktop, laptops, tablets, and smartphones.',
    },
    {
      q: 'Does ToolNest record, proxy, or access my streaming passwords?',
      a: 'Never. ToolNest uses direct peer-to-peer WebRTC screen transmission. It does not touch your streaming credentials, does not download files, and does not record or store streams.',
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0d14] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      <Header
        activeToolName="Watch Together (Cinema)"
        onOpenHelp={() => {}}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenHelp={() => {}}
        activeToolId="watch-together"
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5722AF]/10 dark:bg-purple-950/60 text-[#5722AF] dark:text-purple-300 text-xs font-bold ring-1 ring-[#5722AF]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Virtual Cinema & Screen Sharing</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            Watch Together
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
           HP Stream movies, series, and videos with friends in real-time. Native peer-to-peer screen sharing with stereo audio and zero lag.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Peer-to-Peer WebRTC</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-[#5722AF] dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-semibold">
              <Volume2 className="w-3.5 h-3.5 text-[#5722AF]" />
              <span>Tab Audio Sync</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              <span>Zero Account Needed</span>
            </div>
          </div>
        </div>

        {/* Action Cards: Create Room & Join Room */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Card 1: Create a Watch Room (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="w-9 h-9 rounded-2xl bg-[#5722AF]/10 dark:bg-purple-950/60 flex items-center justify-center text-[#5722AF] dark:text-purple-300">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Create a Watch Room
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Host a room, share your tab, and invite friends
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="host-name"
                  className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider"
                >
                  Your Name (Host) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="host-name"
                  type="text"
                  required
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="e.g. Hitesh"
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5722AF] text-sm transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="room-title"
                  className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider"
                >
                  Room Title / Movie Name <span className="text-zinc-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="room-title"
                  type="text"
                  value={roomTitle}
                  onChange={(e) => setRoomTitle(e.target.value)}
                  placeholder="e.g. Inception Movie Night"
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5722AF] text-sm transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Select Intended Platform Badge
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {platforms.map((p) => {
                    const isSelected = selectedPlatform === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPlatform(p.id)}
                        className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#5722AF] ring-2 ring-[#5722AF]/20 bg-[#5722AF]/5 dark:bg-purple-950/30 font-bold text-zinc-900 dark:text-zinc-100'
                            : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 text-xs'
                        }`}
                      >
                        <span className="text-lg">{p.icon}</span>
                        <span className="text-xs truncate">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-0.5">
                  Platform badge informs friends what service you will be screening from your browser tab.
                </p>
              </div>

              {createError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                  {createError}
                </div>
              )}

              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#5722AF] hover:bg-[#682BC9] text-white font-bold text-sm shadow-md shadow-[#5722AF]/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isCreating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating Cinema Room...</span>
                  </>
                ) : (
                  <>
                    <MonitorPlay className="w-4 h-4" />
                    <span>Create Watch Room</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Card 2: Join an Existing Room (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Join a Watch Room
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Have a room code? Enter it below
                </p>
              </div>
            </div>

            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="join-code"
                  className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider"
                >
                  Room Code (e.g. ABC123)
                </label>
                <input
                  id="join-code"
                  type="text"
                  required
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 uppercase tracking-widest font-mono text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#5722AF] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="guest-name"
                  className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider"
                >
                  Your Display Name
                </label>
                <input
                  id="guest-name"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Rahul"
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5722AF] text-sm transition-all"
                />
              </div>

              {joinError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                  {joinError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter Cinema Room</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-[#5722AF]" />
                <span>Invited by a link?</span>
              </div>
              <p>
                If your host sent you a direct link like <code className="text-[#5722AF] font-mono">/watch-room/ABC123</code>, you can simply open that URL directly in your browser.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="text-center max-w-md mx-auto space-y-1">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              How Watch Together Works
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              3 simple steps to a private virtual cinema session
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="w-8 h-8 rounded-full bg-[#5722AF]/10 dark:bg-purple-950/80 text-[#5722AF] dark:text-purple-300 font-bold flex items-center justify-center text-sm mx-auto md:mx-0">
                1
              </div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Create & Share Link</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Create a room above and copy your unique room URL. Send it to friends over WhatsApp, Telegram, or Discord.
              </p>
            </div>

            <div className="space-y-2 text-center md:text-left">
              <div className="w-8 h-8 rounded-full bg-[#5722AF]/10 dark:bg-purple-950/80 text-[#5722AF] dark:text-purple-300 font-bold flex items-center justify-center text-sm mx-auto md:mx-0">
                2
              </div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Share Your Browser Tab</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Open Netflix, Hotstar, or YouTube in another tab. In the Watch Room, click "Start Screen Share", select that tab, and enable "Share tab audio".
              </p>
            </div>

            <div className="space-y-2 text-center md:text-left">
              <div className="w-8 h-8 rounded-full bg-[#5722AF]/10 dark:bg-purple-950/80 text-[#5722AF] dark:text-purple-300 font-bold flex items-center justify-center text-sm mx-auto md:mx-0">
                3
              </div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Enjoy Cinema Synchronized</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Your shared screen and sound stream to everyone in real time with cinema theater mode and fullscreen options.
              </p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Frequently Asked Questions
          </h2>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="py-3.5">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left gap-4 cursor-pointer"
                  >
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 transition-transform ${
                        isOpen ? 'rotate-180 text-[#5722AF]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pt-2.5">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Privacy & Legal Notice */}
        <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-5 text-xs text-zinc-600 dark:text-zinc-400 space-y-2">
          <div className="flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200">
            <Info className="w-4 h-4 text-[#5722AF]" />
            <span>Virtual Cinema Screen-Sharing Notice</span>
          </div>
          <p className="leading-relaxed">
            This tool provides a private WebRTC peer-to-peer screen-sharing room. It does not scrape, download, or bypass DRM from Netflix, Hotstar, Prime Video, or any other media provider. The Host is solely responsible for playing authorized content in their own browser and choosing which window or tab to share via the browser's standard display media dialog.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
