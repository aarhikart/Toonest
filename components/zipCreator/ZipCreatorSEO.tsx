'use client';

import React from 'react';
import {
  FileArchive,
  Layers,
  FolderTree,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Lock,
  Zap,
} from 'lucide-react';

export function ZipCreatorSEO() {
  return (
    <section className="py-10 sm:py-16 border-t border-zinc-200/80 dark:border-zinc-800 space-y-12">
      {/* 1. Overview */}
      <div className="max-w-4xl mx-auto space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
          Create ZIP Files Online — Free, Fast & In-Browser
        </h2>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          ToolNest <strong>ZIP Creator</strong> is a secure, privacy-first web utility that combines
          multiple files and complete directory structures into a single compressed <code>.zip</code>{' '}
          archive. Whether you need to package high-resolution photos, bundle code projects, organize
          client deliverables, or archive documents, you can do it all without installing third-party
          desktop software or uploading your sensitive personal files to a remote cloud server.
        </p>
      </div>

      {/* 2. Step by Step Guide */}
      <div className="max-w-4xl mx-auto space-y-6">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>How to Create a ZIP File in 7 Simple Steps</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
              <span className="w-6 h-6 rounded-full bg-[#5722AF] text-white flex items-center justify-center text-xs">
                1
              </span>
              <span>Add Your Files</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 pl-8">
              Click &quot;Add Files&quot;, drag and drop files from your desktop, or paste images directly
              from your clipboard into the drop zone.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
              <span className="w-6 h-6 rounded-full bg-[#5722AF] text-white flex items-center justify-center text-xs">
                2
              </span>
              <span>Add Folders If Needed</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 pl-8">
              Use &quot;Add Folder&quot; to import complete directories. The browser automatically maintains
              the nested directory structure.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
              <span className="w-6 h-6 rounded-full bg-[#5722AF] text-white flex items-center justify-center text-xs">
                3
              </span>
              <span>Organize & Rename Files</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 pl-8">
              Create new folders, drag files between directories, rename items individually, or use
              the Bulk Rename feature with custom patterns.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
              <span className="w-6 h-6 rounded-full bg-[#5722AF] text-white flex items-center justify-center text-xs">
                4
              </span>
              <span>Choose Compression Settings</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 pl-8">
              Select your preferred DEFLATE compression level: Store (uncompressed), Fast, Balanced,
              or Maximum.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
              <span className="w-6 h-6 rounded-full bg-[#5722AF] text-white flex items-center justify-center text-xs">
                5
              </span>
              <span>Enter ZIP Filename</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 pl-8">
              Give your archive a clear, custom name. The .zip extension is automatically managed and
              sanitized.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
              <span className="w-6 h-6 rounded-full bg-[#5722AF] text-white flex items-center justify-center text-xs">
                6
              </span>
              <span>Create the ZIP Archive</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 pl-8">
              Hit &quot;Create ZIP&quot; to compile your files in real time. Watch live progress and inspect the
              resulting size comparison.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#5722AF]/5 dark:bg-[#5722AF]/15 border border-[#5722AF]/20 dark:border-[#5722AF]/30 space-y-1.5 md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-[#5722AF] dark:text-[#9B6BE8]">
              <span className="w-6 h-6 rounded-full bg-[#5722AF] text-white flex items-center justify-center text-xs">
                7
              </span>
              <span>Instant Local Download</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 pl-8">
              Click &quot;Download ZIP&quot; to save the file instantly to your device. You can also preview the
              internal structure before downloading.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Why Create a ZIP File? */}
      <div className="max-w-4xl mx-auto space-y-6">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <FileArchive className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>Why Create a ZIP File?</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div className="font-bold text-zinc-900 dark:text-white">Combine Multiple Files</div>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              Consolidate dozens of documents, screenshots, and assets into one neat container for
              clean storage.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="font-bold text-zinc-900 dark:text-white">Easier Sharing & Email</div>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              Email clients and messaging apps prefer single-file attachments over dozens of loose
              files.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FolderTree className="w-4 h-4" />
            </div>
            <div className="font-bold text-zinc-900 dark:text-white">Preserve Folder Structures</div>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              Keep your nested directories, categories, and relative paths intact so colleagues see
              the exact organization you intended.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div className="font-bold text-zinc-900 dark:text-white">Reduce Transfer Overhead</div>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              Transferring a single archive over network connections avoids round-trip latency
              penalties from uploading files individually.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div className="font-bold text-zinc-900 dark:text-white">100% In-Browser Privacy</div>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              Unlike traditional cloud ZIP services, your files are processed in local browser
              memory and never stored on remote servers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="font-bold text-zinc-900 dark:text-white">Universal Compatibility</div>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              Standard DEFLATE archives open seamlessly on Windows File Explorer, macOS Archive
              Utility, Linux, Android, and iOS without third-party utilities.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
