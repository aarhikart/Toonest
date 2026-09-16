'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  X,
  Layers,
  Sparkles,
  Image as ImageIcon,
  FileArchive,
  Scissors,
  Minimize2,
  Maximize2,
  RefreshCw,
  FileText,
  Hash,
  Binary,
  Shield,
  HelpCircle,
  Sun,
  Moon,
  ExternalLink,
  ChevronRight,
  CheckCircle,
  Info,
  Stamp,
  Type,
  Share2,
  Globe,
  PackageOpen,
  Palette,
  Square,
  Film,
  ShieldAlert,
  Percent,
  Calculator,
  Calendar,
  CalendarClock,
  Landmark,
  Wallet,
  Receipt,
  Send,
  MessageSquare,
  Smartphone,
  Monitor,
} from 'lucide-react';


interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHelp: () => void;
  activeToolId?: string; // 'bulk-rename' | 'converter'
}

export function Sidebar({
  isOpen,
  onClose,
  onOpenHelp,
  activeToolId = 'bulk-rename',
}: SidebarProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const hasDarkClass = document.documentElement.classList.contains('dark');
    setIsDark(hasDarkClass);
  }, [isOpen]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('toolnest_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('toolnest_theme', 'light');
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const imageTools = [
    {
      id: 'bulk-rename',
      name: 'Image Bulk Rename',
      desc: 'Batch rename with patterns & sequence numbers',
      icon: <ImageIcon className="w-4 h-4" />,
      href: '/',
      badge: 'Available',
    },
    {
      id: 'converter',
      name: 'Image Format Converter',
      desc: 'Convert between PNG, JPG, WebP, & AVIF',
      icon: <RefreshCw className="w-4 h-4" />,
      href: '/convert',
      badge: 'Available',
    },
    {
      id: 'compressor',
      name: 'Image Compressor',
      desc: 'Lossless & lossy web compression',
      icon: <Minimize2 className="w-4 h-4" />,
      href: '/compress',
      badge: 'Available',
    },
    {
      id: 'resizer',
      name: 'Image Resize',
      desc: 'Change width, height, & proportions',
      icon: <Scissors className="w-4 h-4" />,
      href: '/resize',
      badge: 'Available',
    },
    {
      id: 'pixel-size',
      name: 'Image Pixel Size Changer',
      desc: 'Change exact pixel width & height',
      icon: <Maximize2 className="w-4 h-4" />,
      href: '/pixel-size',
      badge: 'Available',
    },
    {
      id: 'metadata',
      name: 'Image Metadata Viewer',
      desc: 'View EXIF, camera, GPS, & technical data',
      icon: <Info className="w-4 h-4" />,
      href: '/metadata',
      badge: 'Available',
    },
    {
      id: 'watermark',
      name: 'Image Watermark Tool',
      desc: 'Add text or logo watermarks in bulk',
      icon: <Stamp className="w-4 h-4" />,
      href: '/watermark',
      badge: 'Available',
    },
    {
      id: 'image-text-overlay',
      name: 'Image Text Overlay',
      desc: 'Add custom text & typography layers in bulk',
      icon: <Type className="w-4 h-4" />,
      href: '/image-text-overlay',
      badge: 'Available',
    },
    {
      id: 'social-media-resizer',
      name: 'Social Media Resizer',
      desc: 'Crop & resize for Instagram, YouTube, etc.',
      icon: <Share2 className="w-4 h-4" />,
      href: '/social-media-image-resizer',
      badge: 'Available',
    },
    {
      id: 'favicon-generator',
      name: 'Favicon Generator',
      desc: 'Generate ICO, PNG, Apple Touch, & PWA icons',
      icon: <Globe className="w-4 h-4" />,
      href: '/favicon-generator',
      badge: 'Available',
    },
  ];

  const designTools = [
    {
      id: 'color-palette-generator',
      name: 'Color Palette Generator',
      desc: 'Create harmonious schemes, WCAG & contrast',
      icon: <Palette className="w-4 h-4" />,
      href: '/color-palette-generator',
      badge: 'Available',
    },
    {
      id: 'gradient-generator',
      name: 'Gradient Generator',
      desc: 'Linear, radial, conic CSS gradients & export',
      icon: <Layers className="w-4 h-4" />,
      href: '/gradient-generator',
      badge: 'Available',
    },
    {
      id: 'box-shadow-generator',
      name: 'Box Shadow Generator',
      desc: 'Multi-layer CSS box shadows, presets & export',
      icon: <Layers className="w-4 h-4" />,
      href: '/box-shadow-generator',
      badge: 'Available',
    },
    {
      id: 'border-radius-generator',
      name: 'Border Radius Generator',
      desc: 'Custom 4-corner & elliptical CSS border-radius',
      icon: <Square className="w-4 h-4" />,
      href: '/border-radius-generator',
      badge: 'Available',
    },
  ];

  const fileTools = [
    {
      id: 'zip-creator',
      name: 'ZIP Creator',
      desc: 'Create, organize, & compress ZIP archives',
      icon: <FileArchive className="w-4 h-4" />,
      href: '/zip-creator',
      badge: 'Available',
    },
    {
      id: 'zip-extractor',
      name: 'ZIP Extractor',
      desc: 'Open, browse, & selectively extract ZIP files',
      icon: <PackageOpen className="w-4 h-4" />,
      href: '/zip-extractor',
      badge: 'Available',
    },
    {
      id: 'pdf-to-jpg',
      name: 'PDF to JPG Converter',
      desc: 'Convert PDF pages to high-res JPG images',
      icon: <FileText className="w-4 h-4" />,
      href: '/pdf-to-jpg',
      badge: 'Available',
    },
    {
      id: 'pdf-to-png',
      name: 'PDF to PNG Converter',
      desc: 'Lossless PDF conversion with transparency',
      icon: <ImageIcon className="w-4 h-4" />,
      href: '/pdf-to-png',
      badge: 'Available',
    },
    {
      id: 'jpg-to-pdf',
      name: 'JPG to PDF Converter',
      desc: 'Merge JPG images into a clean PDF document',
      icon: <FileText className="w-4 h-4" />,
      href: '/jpg-to-pdf',
      badge: 'Available',
    },
    {
      id: 'pdf-tools',
      name: 'PDF Merge & Split',
      desc: 'Combine or extract pages in-browser',
      icon: <FileText className="w-4 h-4" />,
      badge: 'Coming Soon',
    },
    {
      id: 'checksum',
      name: 'File Hash & Checksum',
      desc: 'SHA-256, MD5 client verification',
      icon: <Hash className="w-4 h-4" />,
      badge: 'Coming Soon',
    },
    {
      id: 'base64',
      name: 'Base64 File Converter',
      desc: 'Encode and decode data URIs',
      icon: <Binary className="w-4 h-4" />,
      badge: 'Coming Soon',
    },
  ];

  const textTools = [
    {
      id: 'word-counter',
      name: 'Word Counter',
      desc: 'Count words, characters, sentences, & lines',
      icon: <FileText className="w-4 h-4" />,
      href: '/word-counter',
      badge: 'Available',
    },
    {
      id: 'text-case-converter',
      name: 'Text Case Converter',
      desc: 'UPPERCASE, lowercase, & smart Title Case',
      icon: <Type className="w-4 h-4" />,
      href: '/text-case-converter',
      badge: 'Available',
    },
  ];

  const socialTools = [
    {
      id: 'ai-video-detector',
      name: 'AI Video Detector',
      desc: 'Detect synthetic visual & temporal AI artifacts',
      icon: <ShieldAlert className="w-4 h-4" />,
      href: '/ai-video-detector',
      badge: 'Available',
    },
    {
      id: 'instagram-reel-downloader',
      name: 'Instagram Reel Downloader',
      desc: 'Save public Instagram Reels in HD MP4 with audio',
      icon: <Film className="w-4 h-4" />,
      href: '/instagram-reel-downloader',
      badge: 'Available',
    },
    {
      id: 'instagram-dm-assistant',
      name: 'Instagram DM Assistant',
      desc: 'Manual DM assistant & username list manager',
      icon: <Send className="w-4 h-4" />,
      href: '/instagram-dm-assistant',
      badge: 'Available',
    },
    {
      id: 'instagram-auto-commenter',
      name: 'Instagram Auto Commenter',
      desc: 'Auto comment & user tag script generator with anti-bot protection',
      icon: <MessageSquare className="w-4 h-4" />,
      href: '/instagram-auto-commenter',
      badge: 'Available',
    },
    {
      id: 'movie-stream-embed',
      name: 'Movie Stream & Embed Hub',
      desc: 'In-page cinema stream player & multi-server embed generator',
      icon: <Film className="w-4 h-4" />,
      href: '/movie-stream-embed',
      badge: 'Available',
    },
    {
      id: 'website-data-extractor',
      name: 'Website Data Extractor',
      desc: 'In-page live web browser & data scraper for text, images, links & tables',
      icon: <Globe className="w-4 h-4" />,
      href: '/website-data-extractor',
      badge: 'Available',
    },
    {
      id: 'responsive-website-tester',
      name: 'Website Responsive Tester',
      desc: 'Test website across phones, tablets, laptops & desktop screen sizes',
      icon: <Smartphone className="w-4 h-4" />,
      href: '/responsive-website-tester',
      badge: 'Available',
    },
    {
      id: 'website-access-upload-tester',
      name: 'Website Access & Upload Tester',
      desc: 'Test site reachability, corporate firewall filters & upload compatibility',
      icon: <Globe className="w-4 h-4" />,
      href: '/website-access-upload-tester',
      badge: 'Available',
    },
    {
      id: 'website-viewer',
      name: 'Website Viewer',
      desc: 'In-app browser to open, navigate, and test live websites',
      icon: <Monitor className="w-4 h-4" />,
      href: '/website-viewer',
      badge: 'Available',
    },
    {
      id: 'whatsapp-marketing',
      name: 'WhatsApp Marketing Platform',
      desc: 'Official Meta Cloud API campaign dispatcher, templates & audience manager',
      icon: <MessageSquare className="w-4 h-4" />,
      href: '/whatsapp-marketing',
      badge: 'Available',
    },
  ];

  const calculatorTools = [
    {
      id: 'percentage-calculator',
      name: 'Percentage Calculator',
      desc: 'Calculate percentages, increases, discounts, & tips',
      icon: <Percent className="w-4 h-4" />,
      href: '/percentage-calculator',
      badge: 'Available',
    },
    {
      id: 'gst-calculator',
      name: 'GST Calculator',
      desc: 'Add/remove GST, CGST/SGST, & invoice breakdown',
      icon: <Receipt className="w-4 h-4" />,
      href: '/gst-calculator',
      badge: 'Available',
    },
    {
      id: 'emi-calculator',
      name: 'EMI Calculator',
      desc: 'Calculate loan EMI, interest, & amortization',
      icon: <Landmark className="w-4 h-4" />,
      href: '/emi-calculator',
      badge: 'Available',
    },
    {
      id: 'salary-calculator',
      name: 'Salary Calculator',
      desc: 'CTC to in-hand take-home & New vs Old Tax',
      icon: <Wallet className="w-4 h-4" />,
      href: '/salary-calculator',
      badge: 'Available',
    },
    {
      id: 'age-calculator',
      name: 'Age Calculator',
      desc: 'Calculate exact age in years, months, & days',
      icon: <Calendar className="w-4 h-4" />,
      href: '/age-calculator',
      badge: 'Available',
    },
    {
      id: 'date-time-difference-calculator',
      name: 'Date & Time Difference',
      desc: 'Calculate exact difference between dates or times',
      icon: <CalendarClock className="w-4 h-4" />,
      href: '/date-time-difference-calculator',
      badge: 'Available',
    },
  ];



  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="ToolNest Navigation Sidebar">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Off-canvas sidebar panel */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-white dark:bg-[#0f121a] border-r border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-left duration-200 ease-out">
        {/* Sidebar Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5722AF] rounded-xl"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5722AF] to-[#7B45D1] flex items-center justify-center text-white shadow-sm shadow-[#5722AF]/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-base text-zinc-900 dark:text-white leading-tight">
                ToolNest
              </div>
              <div className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                Web Utility Suite
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Image Tools Category */}
          <div className="space-y-1.5">
            <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
              <span>Image Tools</span>
              <span className="text-[10px] font-medium text-[#5722AF] dark:text-[#9B6BE8]">
                10 Available
              </span>
            </div>
            <div className="space-y-1">
              {imageTools.map((tool) => {
                const isActive = tool.id === activeToolId;
                const isComingSoon = tool.badge === 'Coming Soon';

                const content = (
                  <div
                    className={`w-full p-2.5 rounded-xl flex items-start gap-3 transition-all ${
                      isActive
                        ? 'bg-[#5722AF]/10 dark:bg-[#5722AF]/20 border border-[#5722AF]/25 dark:border-[#5722AF]/40 text-zinc-900 dark:text-white'
                        : isComingSoon
                        ? 'text-zinc-500 dark:text-zinc-400 opacity-60 cursor-default'
                        : 'hover:bg-zinc-100/80 dark:hover:bg-[#161a26] text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        isActive
                          ? 'bg-[#5722AF] text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate">{tool.name}</span>
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                            isActive
                              ? 'bg-[#5722AF] text-white'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                          }`}
                        >
                          {isActive ? 'Active Tool' : tool.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                        {tool.desc}
                      </p>
                    </div>
                  </div>
                );

                if (isComingSoon) {
                  return <div key={tool.id}>{content}</div>;
                }

                return (
                  <Link key={tool.id} href={tool.href} onClick={onClose}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Design & Color Tools Category */}
          <div className="space-y-1.5">
            <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
              <span>Design & Color Tools</span>
              <span className="text-[10px] font-medium text-[#5722AF] dark:text-[#9B6BE8]">
                4 Available
              </span>
            </div>
            <div className="space-y-1">
              {designTools.map((tool) => {
                const isActive = tool.id === activeToolId;
                const isComingSoon = tool.badge === 'Coming Soon';

                const content = (
                  <div
                    className={`w-full p-2.5 rounded-xl flex items-start gap-3 transition-all ${
                      isActive
                        ? 'bg-[#5722AF]/10 dark:bg-[#5722AF]/20 border border-[#5722AF]/25 dark:border-[#5722AF]/40 text-zinc-900 dark:text-white'
                        : isComingSoon
                        ? 'text-zinc-500 dark:text-zinc-400 opacity-60 cursor-default'
                        : 'hover:bg-zinc-100/80 dark:hover:bg-[#161a26] text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        isActive
                          ? 'bg-[#5722AF] text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate">{tool.name}</span>
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                            isActive
                              ? 'bg-[#5722AF] text-white'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                          }`}
                        >
                          {isActive ? 'Active Tool' : tool.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                        {tool.desc}
                      </p>
                    </div>
                  </div>
                );

                if (isComingSoon || !tool.href) {
                  return <div key={tool.id}>{content}</div>;
                }

                return (
                  <Link key={tool.id} href={tool.href} onClick={onClose}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* File & Document Tools Category */}
          <div className="space-y-1.5">
            <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
              <span>File & Document Tools</span>
              <span className="text-[10px] font-medium text-[#5722AF] dark:text-[#9B6BE8]">
                5 Available
              </span>
            </div>
            <div className="space-y-1">
              {fileTools.map((tool) => {
                const isActive = tool.id === activeToolId;
                const isComingSoon = tool.badge === 'Coming Soon';

                const content = (
                  <div
                    className={`w-full p-2.5 rounded-xl flex items-start gap-3 transition-all ${
                      isActive
                        ? 'bg-[#5722AF]/10 dark:bg-[#5722AF]/20 border border-[#5722AF]/25 dark:border-[#5722AF]/40 text-zinc-900 dark:text-white'
                        : isComingSoon
                        ? 'text-zinc-500 dark:text-zinc-400 opacity-60 cursor-default'
                        : 'hover:bg-zinc-100/80 dark:hover:bg-[#161a26] text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        isActive
                          ? 'bg-[#5722AF] text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate">{tool.name}</span>
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                            isActive
                              ? 'bg-[#5722AF] text-white'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                          }`}
                        >
                          {isActive ? 'Active Tool' : tool.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                        {tool.desc}
                      </p>
                    </div>
                  </div>
                );

                if (isComingSoon || !tool.href) {
                  return <div key={tool.id}>{content}</div>;
                }

                return (
                  <Link key={tool.id} href={tool.href} onClick={onClose}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Social & Video Tools Category */}
          <div className="space-y-1.5">
            <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
              <span>Social & Video Tools</span>
              <span className="text-[10px] font-medium text-[#5722AF] dark:text-[#9B6BE8]">
                {socialTools.length} Available
              </span>
            </div>
            <div className="space-y-1">
              {socialTools.map((tool) => {
                const isActive = tool.id === activeToolId;
                const isComingSoon = tool.badge === 'Coming Soon';

                const content = (
                  <div
                    className={`w-full p-2.5 rounded-xl flex items-start gap-3 transition-all ${
                      isActive
                        ? 'bg-[#5722AF]/10 dark:bg-[#5722AF]/20 border border-[#5722AF]/25 dark:border-[#5722AF]/40 text-zinc-900 dark:text-white'
                        : isComingSoon
                        ? 'text-zinc-500 dark:text-zinc-400 opacity-60 cursor-default'
                        : 'hover:bg-zinc-100/80 dark:hover:bg-[#161a26] text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        isActive
                          ? 'bg-[#5722AF] text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate">{tool.name}</span>
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                            isActive
                              ? 'bg-[#5722AF] text-white'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                          }`}
                        >
                          {isActive ? 'Active Tool' : tool.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                        {tool.desc}
                      </p>
                    </div>
                  </div>
                );

                if (isComingSoon || !tool.href) {
                  return <div key={tool.id}>{content}</div>;
                }

                return (
                  <Link key={tool.id} href={tool.href} onClick={onClose}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Text Tools Category */}
          <div className="space-y-1.5">
            <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
              <span>Text Tools</span>
              <span className="text-[10px] font-medium text-[#5722AF] dark:text-[#9B6BE8]">
                2 Available
              </span>
            </div>
            <div className="space-y-1">
              {textTools.map((tool) => {
                const isActive = tool.id === activeToolId;
                const isComingSoon = tool.badge === 'Coming Soon';

                const content = (
                  <div
                    className={`w-full p-2.5 rounded-xl flex items-start gap-3 transition-all ${
                      isActive
                        ? 'bg-[#5722AF]/10 dark:bg-[#5722AF]/20 border border-[#5722AF]/25 dark:border-[#5722AF]/40 text-zinc-900 dark:text-white'
                        : isComingSoon
                        ? 'text-zinc-500 dark:text-zinc-400 opacity-60 cursor-default'
                        : 'hover:bg-zinc-100/80 dark:hover:bg-[#161a26] text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        isActive
                          ? 'bg-[#5722AF] text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate">{tool.name}</span>
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                            isActive
                              ? 'bg-[#5722AF] text-white'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                          }`}
                        >
                          {isActive ? 'Active Tool' : tool.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                        {tool.desc}
                      </p>
                    </div>
                  </div>
                );

                if (isComingSoon || !tool.href) {
                  return <div key={tool.id}>{content}</div>;
                }

                return (
                  <Link key={tool.id} href={tool.href} onClick={onClose}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Calculator Tools Category */}
          <div className="space-y-1.5">
            <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
              <span>Calculator Tools</span>
              <span className="text-[10px] font-medium text-[#5722AF] dark:text-[#9B6BE8]">
                6 Available
              </span>
            </div>
            <div className="space-y-1">
              {calculatorTools.map((tool) => {
                const isActive = tool.id === activeToolId;
                const isComingSoon = tool.badge === 'Coming Soon';

                const content = (
                  <div
                    className={`w-full p-2.5 rounded-xl flex items-start gap-3 transition-all ${
                      isActive
                        ? 'bg-[#5722AF]/10 dark:bg-[#5722AF]/20 border border-[#5722AF]/25 dark:border-[#5722AF]/40 text-zinc-900 dark:text-white'
                        : isComingSoon
                        ? 'text-zinc-500 dark:text-zinc-400 opacity-60 cursor-default'
                        : 'hover:bg-zinc-100/80 dark:hover:bg-[#161a26] text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        isActive
                          ? 'bg-[#5722AF] text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate">{tool.name}</span>
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                            isActive
                              ? 'bg-[#5722AF] text-white'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                          }`}
                        >
                          {isActive ? 'Active Tool' : tool.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                        {tool.desc}
                      </p>
                    </div>
                  </div>
                );

                if (isComingSoon || !tool.href) {
                  return <div key={tool.id}>{content}</div>;
                }

                return (
                  <Link key={tool.id} href={tool.href} onClick={onClose}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Platform Links */}
          <div className="space-y-1 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
            <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
              Resources
            </div>
            <a
              href="#how-it-works"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors"
            >
              <span>How It Works</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            </a>
            <a
              href="#privacy-section"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors"
            >
              <span>Privacy & Security</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            </a>
            <a
              href="#faq-section"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors"
            >
              <span>Frequently Asked Questions</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            </a>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenHelp();
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
                <span>Shortcuts & Guide</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-[#0c0e14]/60 space-y-3">
          {/* Synchronized Theme Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Interface Theme
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 shadow-xs hover:border-[#5722AF] dark:hover:border-[#9B6BE8] transition-colors"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Light</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% Client-Side</span>
            </div>
            <span>ToolNest v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
