'use client';

import React, { useState } from 'react';
import { X, FileCode, Sparkles, Check, AlertCircle } from 'lucide-react';
import { MovieItem } from '@/lib/movie/movieTypes';
import { parseHtmlMovieTable } from '@/lib/movie/htmlTableParser';

interface HtmlIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (movies: MovieItem[]) => void;
}

export const HtmlIngestionModal: React.FC<HtmlIngestionModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [rawHtml, setRawHtml] = useState('');
  const [parsedCount, setParsedCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParse = () => {
    if (!rawHtml.trim()) {
      setErrorMsg('Please paste HTML table code or movie links first.');
      return;
    }

    try {
      const parsed = parseHtmlMovieTable(rawHtml);
      if (parsed.length === 0) {
        setErrorMsg('Could not find movie table rows or TMDB IDs. Make sure the HTML contains <tr> rows with links or movie IDs.');
        setParsedCount(0);
        return;
      }

      setErrorMsg(null);
      setParsedCount(parsed.length);
      onImport(parsed);
      onClose();
    } catch (e: any) {
      setErrorMsg(e?.message || 'Error parsing HTML');
    }
  };

  const handleLoadSample = () => {
    const sample = `<table>
  <tbody>
    <tr>
      <td><img src="https://image.tmdb.org/t/p/w500/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg" width="60" alt=""></td>
      <td><strong>Spider-Man: Brand New Day</strong></td>
      <td>2026</td>
      <td><span class="badge">FILM</span></td>
      <td>⭐ 7.8</td>
      <td>Sci-Fi, Action</td>
      <td><a href="https://nightflix.vg/movie/969681">Open Details</a></td>
    </tr>
    <tr>
      <td><img src="https://image.tmdb.org/t/p/w500/vhv7lBWYM0DUuNU2a0V7Rhq21dD.jpg" width="60" alt=""></td>
      <td><strong>Coyote vs. Acme</strong></td>
      <td>2026</td>
      <td><span class="badge">FILM</span></td>
      <td>⭐ 7.6</td>
      <td>Comedy, Adventure</td>
      <td><a href="https://nightflix.vg/movie/1204680">Open Details</a></td>
    </tr>
  </tbody>
</table>`;
    setRawHtml(sample);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#111624] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white leading-tight">
                Import Movie Table / HTML
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Paste any raw HTML table or movie list to extract streams
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Raw HTML Code
            </label>
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-xs font-semibold text-[#5722AF] dark:text-[#9B6BE8] hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Sample Snippet
            </button>
          </div>

          <textarea
            value={rawHtml}
            onChange={(e) => setRawHtml(e.target.value)}
            placeholder="Paste your <table>...</table> HTML or list of movie links here..."
            rows={10}
            className="w-full p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#5722AF] resize-y"
          />

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 leading-relaxed">
            💡 <strong>Smart Extraction:</strong> The parser automatically scans for posters (<code className="font-mono text-[11px]">&lt;img src=&quot;...&quot;&gt;</code>), titles, release years, star ratings, and TMDB IDs from links like <code className="font-mono text-[11px]">https://nightflix.vg/movie/969681</code>.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/80 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleParse}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#5722AF] hover:bg-[#481c91] text-white flex items-center gap-1.5 shadow-md shadow-[#5722AF]/20 transition-all"
          >
            <Check className="w-4 h-4" />
            Parse &amp; Import Movies
          </button>
        </div>
      </div>
    </div>
  );
};
