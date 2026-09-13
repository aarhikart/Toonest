'use client';

import React from 'react';
import {
  ShieldAlert,
  Cpu,
  Video,
  Eye,
  FileCheck,
  AlertOctagon,
  Sparkles,
  Layers,
} from 'lucide-react';

export const AIVideoSEO: React.FC = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AI Video Detector - Deepfake & Synthetic Video Analysis',
    url: 'https://toolnest.com/ai-video-detector',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    description:
      'Professional AI video detector and deepfake analyzer. Inspect video uploads and direct URLs for synthetic temporal artifacts, face manipulations, and AI generative signatures.',
    featureList: [
      'Visual artifact detection across video frames',
      'Temporal consistency and optical flow analysis',
      'Audio-visual lip-sync verification',
      'Container metadata and codec inspection',
      'Timestamped evidence timeline with video player seeking',
      'Comprehensive audit report download in TXT and JSON formats',
      'Zero fake percentages - transparent probabilistic assessment',
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <article className="w-full max-w-5xl mx-auto py-12 px-4 space-y-12 text-slate-700 dark:text-slate-300">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Intro Educational Section */}
      <div className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Understanding AI Video Detection & Synthetic Media Forensics
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
          The rapid rise of generative diffusion models—including OpenAI Sora, Runway Gen-3,
          Kling AI, Luma Dream Machine, and Stable Video Diffusion—has transformed video creation.
          While these models empower digital creators, they also create unprecedented challenges
          for misinformation, digital impersonation, and authentication. Detecting whether a
          video is synthetic requires analyzing multi-dimensional signals across individual frames,
          inter-frame transitions, audio waveforms, and underlying container structures.
        </p>
      </div>

      {/* 4 Pillars of Detection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            1. Spatial & Visual Artifacts
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Diffusion algorithms often produce telltale anatomical and geometrical errors. These
            include non-Euclidean perspective warping, irregular finger counts, asymmetrical
            pupils, impossible reflections in mirrors or water, and recurring high-frequency grid
            artifacts embedded by latent upscalers.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            2. Temporal Coherence & Optical Flow
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Authentic optical cameras capture continuous physical momentum. Generative video
            engines struggle to maintain object identity across time. Detection algorithms track
            vector field motions to flag textures that morph, swim, flicker, or dissolve abruptly
            between consecutive video frames.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            3. Audio-Visual Lip Synchronization
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            In talking-head videos and deepfake speech replacement, detectors calculate the
            temporal alignment between phonemes (spoken sound frequencies) and visemes (visual lip
            and jaw movements). Discrepancies between mouth aperture and speech onset strongly
            point toward AI dubbing or re-enactment.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            4. Container Metadata & Compression
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Real camera sensors write structured EXIF, atom headers (moov/mdat), and camera-specific
            chroma subsampling profiles. Synthetic video generators and web renderers often emit
            standardized FFmpeg container markers, stripped metadata, or non-standard frame rates
            (e.g., fractional 24.12 FPS).
          </p>
        </div>
      </div>

      {/* Responsible Use & Ethics Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <AlertOctagon className="w-6 h-6 text-purple-600 dark:text-purple-400 shrink-0" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Responsible AI Usage & Verification Guidelines
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          No automated AI detection software should ever be treated as definitive or indisputable
          evidence. False positives can occur when genuine videos undergo aggressive compression,
          denoising filters, or social media transcoding. False negatives can occur when videos are
          created using state-of-the-art generators or recorded off physical screens.
        </p>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          We advocate for multi-source verification: corroborate digital findings with human
          critical thinking, primary source attribution, and cryptographic provenance standards
          such as C2PA (Coalition for Content Provenance and Authenticity).
        </p>
      </div>
    </article>
  );
};
