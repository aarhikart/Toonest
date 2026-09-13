'use client';

import React, { useState, useMemo } from 'react';
import {
  Image as ImageIcon,
  Download,
  Copy,
  Check,
  ExternalLink,
  Search,
  Maximize2,
  FileArchive,
  Layers,
  Sparkles,
} from 'lucide-react';
import JSZip from 'jszip';
import { ExtractedWebData, ExtractedImage } from '@/lib/web-extractor/types';

interface ExtractedMediaTabProps {
  data: ExtractedWebData;
}

export const ExtractedMediaTab: React.FC<ExtractedMediaTabProps> = ({ data }) => {
  const [search, setSearch] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<ExtractedImage | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  const images = data.images || [];

  const filteredImages = useMemo(() => {
    if (!search.trim()) return images;
    const q = search.toLowerCase().trim();
    return images.filter(
      (img) =>
        img.src.toLowerCase().includes(q) ||
        img.alt.toLowerCase().includes(q) ||
        (img.title && img.title.toLowerCase().includes(q))
    );
  }, [images, search]);

  const handleCopy = (src: string) => {
    navigator.clipboard.writeText(src);
    setCopiedUrl(src);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDownloadSingle = async (img: ExtractedImage) => {
    try {
      const res = await fetch(img.src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = img.src.split('.').pop()?.split('?')[0] || 'jpg';
      a.download = `image-${Date.now()}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(img.src, '_blank');
    }
  };

  const handleDownloadAllZip = async () => {
    if (images.length === 0 || isZipping) return;
    setIsZipping(true);
    setZipProgress(0);

    try {
      const zip = new JSZip();
      const folder = zip.folder(`${data.domain}-images`);

      let processed = 0;
      const targetImages = images.slice(0, 50); // limit to 50 for performance

      for (let i = 0; i < targetImages.length; i++) {
        const img = targetImages[i];
        try {
          // If data URI
          if (img.src.startsWith('data:')) {
            const base64Data = img.src.split(',')[1];
            if (base64Data) {
              folder?.file(`image-${i + 1}.png`, base64Data, { base64: true });
            }
          } else {
            const res = await fetch(img.src);
            if (res.ok) {
              const blob = await res.blob();
              const ext = img.src.split('.').pop()?.split('?')[0] || 'jpg';
              folder?.file(`image-${i + 1}.${ext}`, blob);
            }
          }
        } catch {
          // continue
        }
        processed++;
        setZipProgress(Math.round((processed / targetImages.length) * 100));
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const dlUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = dlUrl;
      a.download = `${data.domain}-all-images.zip`;
      a.click();
      URL.revokeObjectURL(dlUrl);
    } catch (e) {
      console.error('Failed to create ZIP', e);
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Extracted Media &amp; Images ({images.length})
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {filteredImages.length} images matching filter
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search images by name or alt..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#5722AF]"
            />
          </div>

          <button
            type="button"
            onClick={handleDownloadAllZip}
            disabled={images.length === 0 || isZipping}
            className="px-3.5 py-1.5 rounded-xl bg-[#5722AF] hover:bg-[#481c91] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <FileArchive className="w-3.5 h-3.5" />
            <span>{isZipping ? `Zipping ${zipProgress}%` : 'Download All as ZIP'}</span>
          </button>
        </div>
      </div>

      {/* Image Cards Grid */}
      {filteredImages.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {filteredImages.map((img, i) => {
            const isCopied = copiedUrl === img.src;
            return (
              <div
                key={i}
                className="group relative flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-xs hover:shadow-lg"
              >
                {/* Image Frame */}
                <div
                  onClick={() => setPreviewImage(img)}
                  className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950 cursor-pointer"
                >
                  <img
                    src={img.src}
                    alt={img.alt || 'Web image'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://via.placeholder.com/300x300/18181b/71717a?text=Broken+Image';
                    }}
                  />

                  {/* Dimensions pill */}
                  {img.width && img.height && (
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-mono text-white">
                      {img.width}x{img.height}
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(img);
                      }}
                      title="Preview"
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs transition-colors cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(img.src);
                      }}
                      title="Copy URL"
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs transition-colors cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadSingle(img);
                      }}
                      title="Download"
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-2.5 flex flex-col justify-between flex-1 text-xs">
                  <p
                    className="font-medium text-zinc-700 dark:text-zinc-300 truncate"
                    title={img.alt || img.src}
                  >
                    {img.alt || img.src.split('/').pop()?.split('?')[0] || 'Image'}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-mono truncate mt-0.5">
                    {img.src}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <ImageIcon className="w-10 h-10 text-zinc-400 mx-auto mb-2 opacity-50" />
          <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No images matched</h4>
          <p className="text-xs text-zinc-500 mt-1">Try clearing your search query.</p>
        </div>
      )}

      {/* Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl flex flex-col"
          >
            <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-3 text-xs">
              <span className="font-mono text-zinc-300 truncate flex-1">{previewImage.src}</span>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-zinc-400 hover:text-white px-2 py-1 rounded-lg hover:bg-zinc-800"
              >
                Close
              </button>
            </div>
            <div className="p-4 flex items-center justify-center overflow-auto max-h-[70vh]">
              <img src={previewImage.src} alt="Preview" className="max-w-full max-h-[65vh] object-contain rounded-lg" />
            </div>
            <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleCopy(previewImage.src)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy URL</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadSingle(previewImage)}
                className="px-3 py-1.5 rounded-lg bg-[#5722AF] hover:bg-[#481c91] text-xs font-bold text-white flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Image</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
