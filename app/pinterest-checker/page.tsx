'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import {
  FolderPlus,
  FileCheck,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Database,
  Layers,
  FileText,
  Play,
  X,
  Plus,
  Eye,
  Film,
  CheckSquare,
  Files
} from 'lucide-react';

interface ParsedPinItem {
  id: string;
  title: string;
  videoUrl: string;
  pinUrl: string;
  rawCardHtml: string;
  sourceFile?: string;
}

interface UploadedFileInfo {
  id: string;
  name: string;
  size: number;
  pinCount: number;
}

interface GalleryInfo {
  name: string;
  count: number;
  updatedAt: string;
}

interface GallerySavedItem {
  id: string;
  title: string;
  savedAt: string;
}

export default function PinterestCheckerPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Galleries State
  const [galleries, setGalleries] = useState<GalleryInfo[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<string>('food');
  const [isLoadingGalleries, setIsLoadingGalleries] = useState(false);

  // New Gallery Modal
  const [showNewGalleryModal, setShowNewGalleryModal] = useState(false);
  const [newGalleryInput, setNewGalleryInput] = useState('');
  const [galleryActionError, setGalleryActionError] = useState<string | null>(null);

  // Gallery Items (Saved in JSON)
  const [savedItems, setSavedItems] = useState<GallerySavedItem[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [dbSearchTerm, setDbSearchTerm] = useState('');

  // Multi-File Upload & Parsed Pins State
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([]);
  const [parsedPins, setParsedPins] = useState<ParsedPinItem[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Filtering & View
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'existing'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Save/Download Status
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch list of galleries
  const fetchGalleries = async () => {
    setIsLoadingGalleries(true);
    try {
      const res = await fetch('/api/pinterest-checker/galleries');
      const data = await res.json();
      if (data.success && Array.isArray(data.galleries)) {
        setGalleries(data.galleries);
        if (data.galleries.length > 0 && !data.galleries.some((g: GalleryInfo) => g.name === selectedGallery)) {
          setSelectedGallery(data.galleries[0].name);
        }
      }
    } catch (err: any) {
      console.error('Error fetching galleries:', err);
    } finally {
      setIsLoadingGalleries(false);
    }
  };

  // Fetch saved items of selected gallery
  const fetchSavedItems = async (galleryName: string) => {
    if (!galleryName) return;
    setIsLoadingSaved(true);
    try {
      const res = await fetch(`/api/pinterest-checker/gallery?name=${encodeURIComponent(galleryName)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setSavedItems(data.items);
      } else {
        setSavedItems([]);
      }
    } catch (err: any) {
      console.error('Error fetching gallery items:', err);
      setSavedItems([]);
    } finally {
      setIsLoadingSaved(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  useEffect(() => {
    if (selectedGallery) {
      fetchSavedItems(selectedGallery);
    }
  }, [selectedGallery]);

  // Set of existing IDs for fast O(1) comparison
  const existingIdSet = useMemo(() => {
    return new Set(savedItems.map((item) => String(item.id).trim()));
  }, [savedItems]);

  // Handle creating a new gallery
  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryInput.trim()) return;

    setGalleryActionError(null);
    try {
      const res = await fetch('/api/pinterest-checker/galleries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGalleryInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create gallery.');
      }

      setGalleries(data.galleries);
      setSelectedGallery(data.gallery.name);
      setNewGalleryInput('');
      setShowNewGalleryModal(false);
      setSuccessMessage(`Gallery "${data.gallery.name}.json" ready!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setGalleryActionError(err.message || 'Error creating gallery.');
    }
  };

  // Handle deleting a gallery
  const handleDeleteGallery = async (name: string) => {
    if (!confirm(`Are you sure you want to delete the gallery "${name}.json"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/pinterest-checker/galleries?name=${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setGalleries(data.galleries);
        if (selectedGallery === name) {
          const next = data.galleries.length > 0 ? data.galleries[0].name : '';
          setSelectedGallery(next);
        }
      }
    } catch (err: any) {
      alert(`Error deleting gallery: ${err.message}`);
    }
  };

  // Handle deleting a single item from active gallery
  const handleDeleteItem = async (id: string) => {
    try {
      const res = await fetch(
        `/api/pinterest-checker/gallery?name=${encodeURIComponent(selectedGallery)}&id=${encodeURIComponent(id)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (data.success) {
        setSavedItems((prev) => prev.filter((item) => item.id !== id));
        fetchGalleries();
      }
    } catch (err: any) {
      alert(`Error deleting item: ${err.message}`);
    }
  };

  // Extract cards, IDs, and titles from an individual HTML string
  const extractCardsFromHtml = (htmlString: string, sourceName: string): ParsedPinItem[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    const cardNodes = doc.querySelectorAll('.card');
    const extracted: ParsedPinItem[] = [];

    cardNodes.forEach((card, index) => {
      // 1. Extract Pin ID
      let pinId = '';

      // Strategy A: From .btn-zinc or a[href*="/pin/"]
      const pinLink = card.querySelector('a.btn.btn-zinc, a[href*="/pin/"]') as HTMLAnchorElement | null;
      if (pinLink && pinLink.href) {
        const match = pinLink.href.match(/\/pin\/(\d+)/i);
        if (match) pinId = match[1];
      }

      // Strategy B: From download attribute in .btn-red (e.g. video_54324739250713113.mp4)
      if (!pinId) {
        const dlLink = card.querySelector('a[download*="video_"]') as HTMLAnchorElement | null;
        if (dlLink) {
          const dlAttr = dlLink.getAttribute('download') || '';
          const match = dlAttr.match(/video_(\d+)/i);
          if (match) pinId = match[1];
        }
      }

      // Strategy C: Regex in card HTML
      if (!pinId) {
        const match = card.outerHTML.match(/\/pin\/(\d{10,25})/i);
        if (match) pinId = match[1];
      }

      if (!pinId) {
        pinId = `unknown_${sourceName}_${index}`;
      }

      // 2. Extract Title
      const titleEl = card.querySelector('.title');
      const title = titleEl ? (titleEl.textContent || '').trim() : '';

      // 3. Extract Video URL
      const videoEl = card.querySelector('video') as HTMLVideoElement | null;
      let videoUrl = '';
      if (videoEl) {
        videoUrl = videoEl.getAttribute('data-src') || videoEl.getAttribute('src') || '';
        if (!videoUrl) {
          const srcEl = videoEl.querySelector('source');
          if (srcEl) videoUrl = srcEl.getAttribute('src') || '';
        }
      }
      if (!videoUrl) {
        const redBtn = card.querySelector('a.btn.btn-red') as HTMLAnchorElement | null;
        if (redBtn && redBtn.href) videoUrl = redBtn.href;
      }

      // 4. Extract Pin Page URL
      const pinUrl = pinLink ? pinLink.href : `https://www.pinterest.com/pin/${pinId}/`;

      extracted.push({
        id: pinId,
        title,
        videoUrl,
        pinUrl,
        rawCardHtml: card.outerHTML,
        sourceFile: sourceName,
      });
    });

    return extracted;
  };

  // Process Multiple HTML Files
  const handleFilesSelected = async (files: File[]) => {
    if (!files || files.length === 0) return;

    setIsParsing(true);
    setParseError(null);

    const readFileAsync = (file: File): Promise<{ name: string; size: number; content: string }> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve({ name: file.name, size: file.size, content: e.target?.result as string });
        reader.onerror = reject;
        reader.readAsText(file);
      });
    };

    try {
      const fileDataList = await Promise.all(files.map(readFileAsync));
      const newFileInfos: UploadedFileInfo[] = [];
      const pinMap = new Map<string, ParsedPinItem>();

      // Preserve previously uploaded pins unless cleared
      parsedPins.forEach((p) => pinMap.set(p.id, p));

      let totalCardsFound = 0;

      for (const f of fileDataList) {
        const cards = extractCardsFromHtml(f.content, f.name);
        totalCardsFound += cards.length;
        cards.forEach((card) => {
          if (!pinMap.has(card.id)) {
            pinMap.set(card.id, card);
          }
        });

        newFileInfos.push({
          id: `${f.name}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: f.name,
          size: f.size,
          pinCount: cards.length,
        });
      }

      if (totalCardsFound === 0 && pinMap.size === 0) {
        throw new Error('No Pinterest video cards or pin links found in the selected files.');
      }

      setUploadedFiles((prev) => [...prev, ...newFileInfos]);
      setParsedPins(Array.from(pinMap.values()));
      setSuccessMessage(`Processed ${files.length} file(s)! Found ${pinMap.size} total unique pins.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setParseError(err.message || 'Failed to parse uploaded HTML files.');
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelected(Array.from(e.target.files));
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter(
        (f) => f.name.endsWith('.html') || f.name.endsWith('.htm')
      );
      if (validFiles.length > 0) {
        handleFilesSelected(validFiles);
      } else {
        setParseError('Please drop .html or .htm files only.');
      }
    }
  };

  // Remove a specific uploaded file from current session
  const handleRemoveUploadedFile = (fileInfo: UploadedFileInfo) => {
    const updatedFiles = uploadedFiles.filter((f) => f.id !== fileInfo.id);
    setUploadedFiles(updatedFiles);

    // Recompute pins excluding this file
    const remainingPins = parsedPins.filter((p) => p.sourceFile !== fileInfo.name);
    setParsedPins(remainingPins);
  };

  // Clear all uploaded files
  const handleClearAllUploaded = () => {
    setUploadedFiles([]);
    setParsedPins([]);
    setParseError(null);
  };

  // Quick Load User's Sample
  const handleLoadSample = () => {
    const sampleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Extracted Videos (10)</title>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
</head>
<body>
  <header><h1>Extracted Pinterest Videos</h1><div class="count">Total: 10</div></header>
  <div class="grid">
    <div class="card">
      <div class="video-box"><video id="vid-0" controls="" playsinline="" preload="metadata" data-src="https://v1.pinimg.com/videos/iht/av1Mp4-enabled-v3-t/7e/f1/d0/7ef1d0354a90cc7372b722db591de282_240w.mp4" src="https://v1.pinimg.com/videos/iht/av1Mp4-enabled-v3-t/7e/f1/d0/7ef1d0354a90cc7372b722db591de282_240w.mp4"></video></div>
      <div class="meta">
        <div class="title">Cozy Gamer room</div>
        <div class="actions">
          <a class="btn btn-red" href="https://v1.pinimg.com/videos/iht/av1Mp4-enabled-v3-t/7e/f1/d0/7ef1d0354a90cc7372b722db591de282_240w.mp4" download="video_54324739250713113.mp4">Download MP4</a>
          <a class="btn btn-zinc" href="https://www.pinterest.com/pin/54324739250713113/" target="_blank">Pin Page</a>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="video-box"><video id="vid-1" controls="" playsinline="" preload="metadata" data-src="https://v1.pinimg.com/videos/iht/hevcMp4V3/9e/05/1a/9e051a2ffad5d941b5a3b8b717705d80_360w.mp4" src="https://v1.pinimg.com/videos/iht/hevcMp4V3/9e/05/1a/9e051a2ffad5d941b5a3b8b717705d80_360w.mp4"></video></div>
      <div class="meta">
        <div class="title">Small space, smart design. This elevated loft layout transforms every inch...</div>
        <div class="actions">
          <a class="btn btn-red" href="https://v1.pinimg.com/videos/iht/hevcMp4V3/9e/05/1a/9e051a2ffad5d941b5a3b8b717705d80_360w.mp4" download="video_655766395787062781.mp4">Download MP4</a>
          <a class="btn btn-zinc" href="https://www.pinterest.com/pin/655766395787062781/" target="_blank">Pin Page</a>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="video-box"><video id="vid-2" controls="" playsinline="" preload="metadata" data-src="https://v1.pinimg.com/videos/iht/hevcMp4V3/80/d6/08/80d608f1402a168038ac5bf371a5d8b3_360w.mp4" src="https://v1.pinimg.com/videos/iht/hevcMp4V3/80/d6/08/80d608f1402a168038ac5bf371a5d8b3_360w.mp4"></video></div>
      <div class="meta">
        <div class="title">✨ Inspiração - Uma casa toda em branco e preto prova que a elegância está na simplicidade.</div>
        <div class="actions">
          <a class="btn btn-red" href="https://v1.pinimg.com/videos/iht/hevcMp4V3/80/d6/08/80d608f1402a168038ac5bf371a5d8b3_360w.mp4" download="video_1141732943086109248.mp4">Download MP4</a>
          <a class="btn btn-zinc" href="https://www.pinterest.com/pin/1141732943086109248/" target="_blank">Pin Page</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
    const cards = extractCardsFromHtml(sampleHtml, 'sample_batch.html');
    setUploadedFiles([
      { id: 'sample', name: 'sample_batch.html', size: sampleHtml.length, pinCount: cards.length },
    ]);
    setParsedPins(cards);
  };

  // Classified pins
  const newPins = useMemo(() => {
    return parsedPins.filter((pin) => !existingIdSet.has(pin.id));
  }, [parsedPins, existingIdSet]);

  const existingPins = useMemo(() => {
    return parsedPins.filter((pin) => existingIdSet.has(pin.id));
  }, [parsedPins, existingIdSet]);

  // Displayed pins according to tab & search
  const displayedPins = useMemo(() => {
    let list: ParsedPinItem[] = [];
    if (activeTab === 'all') list = parsedPins;
    else if (activeTab === 'new') list = newPins;
    else if (activeTab === 'existing') list = existingPins;

    if (!searchTerm.trim()) return list;

    const query = searchTerm.toLowerCase();
    return list.filter(
      (pin) => pin.id.toLowerCase().includes(query) || pin.title.toLowerCase().includes(query)
    );
  }, [parsedPins, newPins, existingPins, activeTab, searchTerm]);

  // Generate ONE Single Merged HTML file containing all specified cards
  const buildFilteredHtml = (pinsToInclude: ParsedPinItem[]) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Extracted Videos (${pinsToInclude.length})</title>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #09090b; color: #f4f4f5; padding: 24px; }
    header { margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #27272a; padding-bottom: 16px; }
    h1 { font-size: 20px; font-weight: 700; }
    .count { font-size: 14px; color: #a1a1aa; }
    .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
    @media (max-width: 1400px) { .grid { grid-template-columns: repeat(4, 1fr); } }
    @media (max-width: 1050px) { .grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 720px) { .grid { grid-template-columns: repeat(2, 1fr); } }
    .card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; content-visibility: auto; contain-intrinsic-size: 240px 420px; }
    .video-box { position: relative; width: 100%; aspect-ratio: 9/16; background: #000; }
    video { width: 100%; height: 100%; object-fit: cover; }
    .meta { padding: 12px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
    .title { font-size: 12px; font-weight: 500; line-height: 1.4; max-height: 2.8em; overflow: hidden; text-overflow: ellipsis; }
    .actions { display: flex; gap: 6px; margin-top: auto; }
    .btn { flex: 1; text-align: center; font-size: 11px; font-weight: 600; text-decoration: none; padding: 7px 8px; border-radius: 6px; }
    .btn-red { background: #e60023; color: #fff; }
    .btn-zinc { background: #27272a; color: #e4e4e7; }
    .btn:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <header>
    <h1>Extracted Pinterest Videos (${selectedGallery.toUpperCase()})</h1>
    <div class="count">Total: ${pinsToInclude.length}</div>
  </header>

  <div class="grid">
    ${pinsToInclude.map((p) => p.rawCardHtml).join('\n    ')}
  </div>
</body>
</html>`;
  };

  // Trigger browser file download
  const triggerDownload = (content: string, filename: string, mimeType = 'text/html') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Primary Action: Save All New IDs to JSON and Download ONE Merged Filtered HTML File
  const handleSaveAndDownload = async () => {
    if (newPins.length === 0) {
      alert('All items in these files already exist in the gallery JSON! No new items to save.');
      return;
    }

    setIsSaving(true);
    try {
      // 1. Save all new unique items into the server gallery JSON
      const res = await fetch('/api/pinterest-checker/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gallery: selectedGallery,
          items: newPins.map((p) => ({ id: p.id, title: p.title })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save items to gallery.');
      }

      // 2. Generate and download ONE merged filtered HTML file with ONLY the new pins
      const filteredHtml = buildFilteredHtml(newPins);
      const downloadName = `${selectedGallery}_merged_new_${newPins.length}_pins.html`;
      triggerDownload(filteredHtml, downloadName);

      // 3. Refresh saved items from server
      await fetchSavedItems(selectedGallery);
      await fetchGalleries();

      setSuccessMessage(
        `Success! Saved ${data.addedCount} new pins across all uploaded files into "${selectedGallery}.json" & downloaded 1 merged HTML file ("${downloadName}")!`
      );
      setTimeout(() => setSuccessMessage(null), 7000);
    } catch (err: any) {
      alert(`Error saving and downloading: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Download ONE Merged HTML without saving
  const handleDownloadFilteredOnly = () => {
    const targetPins = newPins.length > 0 ? newPins : parsedPins;
    const html = buildFilteredHtml(targetPins);
    triggerDownload(html, `${selectedGallery}_merged_${targetPins.length}_pins.html`);
  };

  // Export gallery JSON directly
  const handleExportJson = () => {
    const jsonStr = JSON.stringify(savedItems, null, 2);
    triggerDownload(jsonStr, `${selectedGallery}_gallery.json`, 'application/json');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Header onToggleSidebar={() => setSidebarOpen(true)} onOpenHelp={() => {}} activeToolName="Pinterest Checker" />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpenHelp={() => {}} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Top Header & Page Description */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-rose-900/20">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Pinterest Gallery & ID Checker
                  <span className="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-medium">
                    Multi-File Batch
                  </span>
                </h1>
                <p className="text-sm text-zinc-400">
                  Upload multiple Pinterest HTML files, deduplicate IDs against your gallery JSON, and download 1 merged clean HTML file.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDatabaseModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-sm font-medium transition shadow-sm"
            >
              <Database className="w-4 h-4 text-rose-400" />
              <span>Inspect Database ({savedItems.length})</span>
            </button>
            <button
              onClick={handleLoadSample}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-sm font-medium transition shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Load Sample Batch</span>
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-sm font-medium">{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Gallery Selector & Management Bar */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Target Gallery:</span>
              <div className="relative">
                <select
                  value={selectedGallery}
                  onChange={(e) => setSelectedGallery(e.target.value)}
                  className="bg-zinc-950 border border-zinc-700 hover:border-zinc-600 text-white rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 pr-9 cursor-pointer appearance-none min-w-[180px]"
                >
                  {galleries.map((g) => (
                    <option key={g.name} value={g.name}>
                      {g.name} ({g.count} pins saved)
                    </option>
                  ))}
                  {galleries.length === 0 && <option value="food">food (0 pins saved)</option>}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
                  <Layers className="w-4 h-4" />
                </div>
              </div>

              <button
                onClick={() => setShowNewGalleryModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-900/30 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Gallery</span>
              </button>

              <button
                onClick={() => fetchGalleries()}
                title="Refresh Galleries"
                className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGalleries ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Gallery Info Pill */}
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800">
                JSON File: <strong className="text-zinc-200">data/galleries/{selectedGallery}.json</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800">
                Total Saved: <strong className="text-emerald-400">{savedItems.length}</strong>
              </span>
              {selectedGallery && galleries.some((g) => g.name === selectedGallery) && (
                <button
                  onClick={() => handleDeleteGallery(selectedGallery)}
                  title="Delete Gallery File"
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Upload & Parsing Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Multi-File Upload Box */}
          <div className="lg:col-span-1 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-rose-400" />
                  Upload HTML Export Files
                </h2>
                {uploadedFiles.length > 0 && (
                  <button
                    onClick={handleClearAllUploaded}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                Select or drop <strong>multiple HTML files</strong> at once. They will be merged automatically.
              </p>

              {/* Drag and Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 group ${
                  isDragging
                    ? 'border-rose-500 bg-rose-950/30 scale-[1.01]'
                    : 'border-zinc-700 hover:border-rose-500/60 bg-zinc-950/60 hover:bg-rose-950/10'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-zinc-900 group-hover:bg-rose-900/30 flex items-center justify-center text-zinc-400 group-hover:text-rose-400 transition">
                  <Files className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm font-medium text-zinc-200 group-hover:text-rose-300">
                    Click to select multiple HTML files
                  </span>
                  <p className="text-xs text-zinc-500 mt-1">Or drag & drop files here (Shift/Ctrl to select multiple)</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".html,.htm"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* Uploaded Files Badges List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-xs font-semibold text-zinc-400 flex items-center justify-between">
                    <span>Uploaded Files ({uploadedFiles.length}):</span>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add More
                    </button>
                  </div>
                  <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between gap-2 p-2 rounded-lg bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-300"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                          <span className="truncate font-medium" title={file.name}>
                            {file.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {file.pinCount} pins
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveUploadedFile(file);
                            }}
                            className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {parseError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{parseError}</span>
              </div>
            )}
          </div>

          {/* Real-Time Comparison Stats & Action Center */}
          <div className="lg:col-span-2 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Merged Comparison for &quot;{selectedGallery}.json&quot;
                </h2>
                {parsedPins.length > 0 && (
                  <span className="text-xs text-zinc-400 font-mono">
                    {uploadedFiles.length} file(s) · {parsedPins.length} unique pins
                  </span>
                )}
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-4">
                  <div className="text-xs text-zinc-400 font-medium">Total Extracted</div>
                  <div className="text-2xl font-bold text-white mt-1">{parsedPins.length}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Unique cards across files</div>
                </div>

                <div className="bg-zinc-950/70 border border-amber-500/20 rounded-xl p-4">
                  <div className="text-xs text-amber-400 font-medium">Already in JSON</div>
                  <div className="text-2xl font-bold text-amber-300 mt-1">{existingPins.length}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Duplicate pins skipped</div>
                </div>

                <div className="bg-zinc-950/70 border border-emerald-500/20 rounded-xl p-4">
                  <div className="text-xs text-emerald-400 font-medium">New Pins Found</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">{newPins.length}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Fresh items ready to save</div>
                </div>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={handleSaveAndDownload}
                disabled={isSaving || parsedPins.length === 0 || newPins.length === 0}
                className="flex-1 min-w-[260px] inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-white font-semibold text-sm shadow-lg shadow-emerald-950/40 transition cursor-pointer disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isSaving
                    ? 'Saving & Merging HTML...'
                    : `Save New (${newPins.length}) & Download 1 Merged HTML`}
                </span>
              </button>

              <button
                onClick={handleDownloadFilteredOnly}
                disabled={parsedPins.length === 0}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-semibold transition disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Merged HTML Only</span>
              </button>

              <button
                onClick={handleExportJson}
                disabled={savedItems.length === 0}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-semibold transition disabled:opacity-50"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Export {selectedGallery}.json</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pin Inspection & Table Section */}
        {parsedPins.length > 0 && (
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-1.5 p-1 bg-zinc-950 rounded-xl border border-zinc-800 w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'all'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  All ({parsedPins.length})
                </button>
                <button
                  onClick={() => setActiveTab('new')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'new'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-emerald-400 hover:text-emerald-300'
                  }`}
                >
                  New Only ({newPins.length})
                </button>
                <button
                  onClick={() => setActiveTab('existing')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'existing'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-amber-400 hover:text-amber-300'
                  }`}
                >
                  Duplicates ({existingPins.length})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter by title or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Grid of Parsed Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[700px] overflow-y-auto pr-1">
              {displayedPins.map((pin) => {
                const isExisting = existingIdSet.has(pin.id);
                return (
                  <div
                    key={pin.id}
                    className={`bg-zinc-950 border rounded-xl overflow-hidden flex flex-col transition hover:border-zinc-700 shadow-md ${
                      isExisting ? 'border-amber-500/20' : 'border-emerald-500/30'
                    }`}
                  >
                    {/* Video Player Box */}
                    <div className="relative w-full aspect-[9/16] bg-black overflow-hidden flex items-center justify-center">
                      {pin.videoUrl ? (
                        <video
                          src={pin.videoUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-zinc-600 gap-1">
                          <Film className="w-8 h-8" />
                          <span className="text-[10px]">No Video Preview</span>
                        </div>
                      )}

                      {/* Status Tag on Top Right */}
                      <div className="absolute top-2 right-2">
                        {isExisting ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/40 backdrop-blur-sm">
                            Already in JSON
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 backdrop-blur-sm">
                            New Pin
                          </span>
                        )}
                      </div>

                      {/* Source file tag on Top Left */}
                      {pin.sourceFile && (
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-zinc-950/80 text-zinc-400 border border-zinc-800 backdrop-blur-sm max-w-[130px] truncate block" title={pin.sourceFile}>
                            {pin.sourceFile}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="p-3.5 flex flex-col gap-2 flex-1 justify-between">
                      <div>
                        {/* ID row */}
                        <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                          <span className="font-mono text-[11px] text-zinc-300 truncate max-w-[150px]">
                            ID: {pin.id}
                          </span>
                          <button
                            onClick={() => copyToClipboard(pin.id)}
                            title="Copy Pin ID"
                            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                          >
                            {copiedId === pin.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Title */}
                        <p className="text-xs text-zinc-200 font-medium line-clamp-2 leading-relaxed" title={pin.title}>
                          {pin.title || 'Untitled Pin'}
                        </p>
                      </div>

                      {/* Bottom Links */}
                      <div className="flex items-center gap-2 pt-2 border-t border-zinc-900 mt-2">
                        <a
                          href={pin.pinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[11px] text-zinc-300 font-medium transition"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Pin Page</span>
                        </a>

                        {pin.videoUrl && (
                          <a
                            href={pin.videoUrl}
                            target="_blank"
                            download={`video_${pin.id}.mp4`}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-rose-900/30 hover:bg-rose-900/50 text-rose-300 text-[11px] font-medium transition"
                          >
                            <Download className="w-3 h-3" />
                            <span>MP4</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {displayedPins.length === 0 && (
              <div className="text-center py-12 text-zinc-500 text-sm">
                No pins match the current filter or search criteria.
              </div>
            )}
          </div>
        )}

        {/* Database Modal (Inspect Gallery JSON) */}
        {showDatabaseModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
              {/* Modal Header */}
              <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Database className="w-5 h-5 text-rose-400" />
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Gallery Database: &quot;{selectedGallery}.json&quot;
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {savedItems.length} total pin IDs stored in <code>data/galleries/{selectedGallery}.json</code>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDatabaseModal(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar in Modal */}
              <div className="p-4 border-b border-zinc-800 bg-zinc-950/60 flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search saved IDs or titles..."
                    value={dbSearchTerm}
                    onChange={(e) => setDbSearchTerm(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <button
                  onClick={handleExportJson}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {savedItems
                  .filter((item) => {
                    if (!dbSearchTerm.trim()) return true;
                    const q = dbSearchTerm.toLowerCase();
                    return item.id.toLowerCase().includes(q) || item.title.toLowerCase().includes(q);
                  })
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-4 hover:border-zinc-700 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-rose-400 font-semibold">{item.id}</span>
                          <span className="text-[10px] text-zinc-500">
                            {item.savedAt ? new Date(item.savedAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 truncate mt-0.5" title={item.title}>
                          {item.title || 'Untitled'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copyToClipboard(item.id)}
                          title="Copy ID"
                          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          title="Delete ID from JSON"
                          className="p-1.5 rounded hover:bg-rose-950 text-zinc-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                {savedItems.length === 0 && (
                  <div className="text-center py-16 text-zinc-500 text-sm">
                    No pins saved in &quot;{selectedGallery}.json&quot; yet. Upload HTML file(s) and click &quot;Save New IDs&quot; to populate it!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* New Gallery Modal */}
        {showNewGalleryModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-rose-500" />
                  Create New Gallery
                </h3>
                <button
                  onClick={() => setShowNewGalleryModal(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateGallery} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Gallery Name (e.g. food, cars, gym, home-decor)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. food"
                    value={newGalleryInput}
                    onChange={(e) => setNewGalleryInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    autoFocus
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Will create <code>data/galleries/{newGalleryInput.trim().toLowerCase() || 'name'}.json</code>
                  </p>
                </div>

                {galleryActionError && (
                  <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-500/30">
                    {galleryActionError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewGalleryModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-900/30 transition"
                  >
                    Create Gallery
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
