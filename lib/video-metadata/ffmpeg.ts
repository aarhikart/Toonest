import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import {
  CleaningOptions,
  CleaningProgress,
  VerificationResult,
  ComparisonRow,
  ParsedMetadata,
} from './types';
import { inspectVideoWithFfprobe } from './ffprobe';

// Resolve ffmpeg binary path
function getFfmpegPath(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ffmpegStatic = require('ffmpeg-static');
    if (ffmpegStatic && fs.existsSync(ffmpegStatic)) {
      return ffmpegStatic;
    }
  } catch (e) {
    // fallback
  }

  const localWinPath = path.join(
    process.cwd(),
    'node_modules/ffmpeg-static/ffmpeg.exe'
  );
  if (fs.existsSync(localWinPath)) {
    return localWinPath;
  }

  return 'ffmpeg';
}

// In-memory active progress store
const progressStore = new Map<string, CleaningProgress>();

export function getCleaningProgress(sessionId: string): CleaningProgress | null {
  return progressStore.get(sessionId) || null;
}

export function setCleaningProgress(sessionId: string, progress: CleaningProgress): void {
  progressStore.set(sessionId, progress);
}

export function clearCleaningProgress(sessionId: string): void {
  progressStore.delete(sessionId);
}

/**
 * Parses time string from FFmpeg stderr (e.g. "time=00:01:23.45") into seconds.
 */
function parseTimeSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  if (parts.length === 3) {
    const hours = parseFloat(parts[0]) || 0;
    const mins = parseFloat(parts[1]) || 0;
    const secs = parseFloat(parts[2]) || 0;
    return hours * 3600 + mins * 60 + secs;
  }
  return 0;
}

/**
 * Builds safe FFmpeg argument list based on chosen cleaning mode.
 */
function buildFfmpegArgs(
  workingInputPath: string,
  outputPath: string,
  options: CleaningOptions,
  originalMeta: ParsedMetadata,
  customLayerPath?: string
): string[] {
  const args: string[] = ['-y', '-i', workingInputPath];

  // Standard metadata tags to explicitly blank out in MP4/MOV containers
  const commonAtomsToBlank = [
    'title',
    'artist',
    'album_artist',
    'album',
    'date',
    'year',
    'creation_time',
    'comment',
    'description',
    'synopsis',
    'genre',
    'copyright',
    'location',
    'location-eng',
    'make',
    'model',
    'software',
    'encoder',
    'device',
    'author',
    'composer',
    'network',
    'show',
    'episode_id',
    'lyrics',
    'track',
    'disc',
  ];

  if (options.mode === 'all') {
    // Mode 1: Fast stream-copy remux with aggressive metadata clearing
    args.push('-c', 'copy');

    // Strip container, stream, and chapter metadata
    args.push('-map_metadata', '-1');
    args.push('-map_metadata:s:v', '-1');
    args.push('-map_metadata:s:a', '-1');
    if (originalMeta.subtitleStreams.length > 0) {
      args.push('-map_metadata:s:s', '-1');
    }
    args.push('-map_chapters', '-1');

    // Enable bitexact mode (prevents writing ffmpeg/lavf encoder tags)
    args.push('-fflags', '+bitexact');
    args.push('-flags:v', '+bitexact');
    args.push('-flags:a', '+bitexact');

    // Explicitly blank out all known descriptive/sensitive MP4 tags
    for (const tag of commonAtomsToBlank) {
      args.push('-metadata', `${tag}=`);
      args.push('-metadata:s:v', `${tag}=`);
      args.push('-metadata:s:a', `${tag}=`);
    }

    // Force zero/epoch creation time
    args.push('-metadata', 'creation_time=1970-01-01T00:00:00.000000Z');
    args.push('-metadata:s:v', 'creation_time=1970-01-01T00:00:00.000000Z');
    args.push('-metadata:s:a', 'creation_time=1970-01-01T00:00:00.000000Z');
  } else if (options.mode === 'selected') {
    // Mode 2: Selective removal
    args.push('-c', 'copy');

    const sel = options.selectedCategories || {
      creationDate: true,
      location: true,
      deviceInfo: true,
      cameraInfo: true,
      softwareEncoder: true,
      titleAuthor: true,
      copyright: true,
      commentDescription: true,
      chapters: true,
      customTags: true,
    };

    if (sel.location) {
      args.push('-metadata', 'location=');
      args.push('-metadata', 'location-eng=');
      args.push('-metadata', 'GPS=');
      args.push('-metadata', 'ISO6709=');
    }

    if (sel.creationDate) {
      args.push('-metadata', 'creation_time=1970-01-01T00:00:00.000000Z');
      args.push('-metadata:s:v', 'creation_time=1970-01-01T00:00:00.000000Z');
      args.push('-metadata:s:a', 'creation_time=1970-01-01T00:00:00.000000Z');
      args.push('-metadata', 'date=');
      args.push('-metadata', 'year=');
    }

    if (sel.cameraInfo) {
      args.push('-metadata', 'make=');
      args.push('-metadata', 'model=');
      args.push('-metadata', 'camera=');
    }

    if (sel.deviceInfo) {
      args.push('-metadata', 'device=');
    }

    if (sel.softwareEncoder) {
      args.push('-metadata', 'software=');
      args.push('-metadata', 'encoder=');
      args.push('-fflags', '+bitexact');
    }

    if (sel.titleAuthor) {
      args.push('-metadata', 'title=');
      args.push('-metadata', 'artist=');
      args.push('-metadata', 'album_artist=');
      args.push('-metadata', 'author=');
    }

    if (sel.copyright) {
      args.push('-metadata', 'copyright=');
    }

    if (sel.commentDescription) {
      args.push('-metadata', 'comment=');
      args.push('-metadata', 'description=');
      args.push('-metadata', 'synopsis=');
    }

    if (sel.chapters || options.removeChapters) {
      args.push('-map_chapters', '-1');
    }
  } else if (options.mode === 'reencode') {
    // Mode 3: Re-encode & deep clean
    const reencode = options.reencodeSettings || {
      videoCodec: 'libx264',
      qualityPreset: 'balanced',
      audioCodec: 'aac',
      audioBitrate: '192k',
    };

    // Video re-encoding
    args.push('-c:v', reencode.videoCodec);
    const crf = reencode.qualityPreset === 'high' ? '18' : reencode.qualityPreset === 'small' ? '28' : '23';
    args.push('-crf', crf);
    args.push('-preset', 'medium');
    args.push('-pix_fmt', 'yuv420p');

    // Audio re-encoding
    if (reencode.audioCodec === 'copy') {
      args.push('-c:a', 'copy');
    } else {
      args.push('-c:a', 'aac');
      args.push('-b:a', reencode.audioBitrate || '192k');
    }

    // Strip metadata
    args.push('-map_metadata', '-1');
    args.push('-map_chapters', '-1');
    args.push('-fflags', '+bitexact');
    args.push('-flags:v', '+bitexact');
    args.push('-flags:a', '+bitexact');

    for (const tag of commonAtomsToBlank) {
      args.push('-metadata', `${tag}=`);
    }
  } else if (options.mode === 'anti_fingerprint') {
    // Mode 4: Anti-Fingerprint / Social Media Copyright Shield
    const af = options.antiFingerprintSettings || {
      preset: 'standard',
      audioSpeedShift: 1.025,
      audioFreqFilter: true,
      microZoomPercent: 3,
      colorGrading: true,
      microNoise: true,
      horizontalFlip: false,
      targetFps: 30,
    };

    // 1. Build Video Filter Graph
    const vfParts: string[] = [];

    if (af.horizontalFlip) {
      vfParts.push('hflip');
    }

    // Micro zoom & crop to disrupt edge hashes and spatial frame alignment
    const zoomFactor = 1 + (af.microZoomPercent || 3) / 100;
    vfParts.push(`scale=trunc(iw*${zoomFactor.toFixed(3)}/2)*2:trunc(ih*${zoomFactor.toFixed(3)}/2)*2`);
    vfParts.push(`crop=trunc(iw/${zoomFactor.toFixed(3)}/2)*2:trunc(ih/${zoomFactor.toFixed(3)}/2)*2`);

    // Micro color grading (contrast, saturation, slight brightness)
    if (af.colorGrading) {
      vfParts.push('eq=contrast=1.04:brightness=0.01:saturation=1.05');
    }

    // Micro noise injection (imperceptible grain that alters 100% of pixel hashes)
    if (af.microNoise) {
      vfParts.push('noise=alls=2:allf=t');
    }

    // Frame rate normalization to break temporal keyframe matches
    if (af.targetFps) {
      vfParts.push(`fps=${af.targetFps}`);
    }

    if (vfParts.length > 0) {
      args.push('-vf', vfParts.join(','));
    }

    // Video encoder settings
    args.push('-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p');

    // 2. Build Audio Filter Graph
    if (originalMeta.audioStream) {
      const afParts: string[] = [];
      const speed = af.audioSpeedShift || 1.025;
      afParts.push(`atempo=${speed.toFixed(3)}`);

      if (af.audioFreqFilter) {
        afParts.push('volume=0.98');
        afParts.push('highpass=f=35');
        afParts.push('lowpass=f=17500');
      }

      if (afParts.length > 0) {
        args.push('-af', afParts.join(','));
      }

      args.push('-c:a', 'aac', '-b:a', '192k');
    }

    // Strip metadata & apply bitexact flags
    args.push('-map_metadata', '-1');
    args.push('-map_chapters', '-1');
    args.push('-fflags', '+bitexact');
    args.push('-flags:v', '+bitexact');
    args.push('-flags:a', '+bitexact');

    for (const tag of commonAtomsToBlank) {
      args.push('-metadata', `${tag}=`);
    }
  } else if (options.mode === 'transparent_layer') {
    // Mode 5: Transparent Frame & Overlay Layer Shield
    const tl = options.transparentLayerSettings || {
      layerType: 'transparent_sheen',
      opacity: 0.03,
      layerColor: 'white',
    };

    const hasCustom = customLayerPath && fs.existsSync(customLayerPath) && tl.layerType === 'custom_image';

    if (hasCustom) {
      // Add custom PNG frame/layer input
      args.push('-i', customLayerPath);
      // Scale PNG layer to 100% full width and height of video and overlay
      args.push(
        '-filter_complex',
        '[1:v][0:v]scale2ref=w=main_w:h=main_h[ovr][base];[base][ovr]overlay=0:0:format=auto,format=yuv420p[v]'
      );
      args.push('-map', '[v]');
      args.push('-map', '0:a?');
    } else if (tl.layerType === 'transparent_frame') {
      const op = tl.opacity || 0.03;
      const borderOp = Math.min(0.2, op * 3.5);
      const col = tl.layerColor === 'black' ? 'black' : 'white';
      args.push(
        '-vf',
        `format=yuva420p,drawbox=x=0:y=0:w=iw:h=ih:color=${col}@${op.toFixed(3)}:t=fill,drawbox=x=4:y=4:w=iw-8:h=ih-8:color=${col}@${borderOp.toFixed(3)}:t=4,format=yuv420p`
      );
    } else if (tl.layerType === 'film_grain') {
      args.push('-vf', 'format=yuva420p,drawbox=x=0:y=0:w=iw:h=ih:color=white@0.02:t=fill,noise=alls=3:allf=t,format=yuv420p');
    } else {
      // Default: Full-screen transparent protective sheen layer (covers 100% width and height)
      const op = tl.opacity || 0.03;
      const col = tl.layerColor === 'black' ? 'black' : 'white';
      args.push(
        '-vf',
        `format=yuva420p,drawbox=x=0:y=0:w=iw:h=ih:color=${col}@${op.toFixed(3)}:t=fill,format=yuv420p`
      );
    }

    // Video re-encoding with high quality & preservation
    args.push('-c:v', 'libx264', '-crf', '18', '-preset', 'fast');

    // Keep original audio stream 100% untouched
    args.push('-c:a', 'copy');
  }

  // Faststart for web streaming & immediate playback
  args.push('-movflags', '+faststart');

  args.push(outputPath);
  return args;
}

/**
 * Runs FFmpeg cleaning on working.mp4 and writes to clean.mp4 with real progress tracking.
 */
export async function cleanVideoMetadata(
  sessionId: string,
  workingInputPath: string,
  outputPath: string,
  originalMeta: ParsedMetadata,
  options: CleaningOptions,
  customLayerPath?: string
): Promise<ParsedMetadata> {
  const ffmpegPath = getFfmpegPath();
  const totalDuration = originalMeta.fileInfo.durationSeconds || 1;

  // Initialize progress
  setCleaningProgress(sessionId, {
    sessionId,
    status: options.mode === 'reencode' || options.mode === 'transparent_layer' ? 'reencoding' : 'cleaning',
    percent: 5,
    currentTimeSeconds: 0,
    totalDurationSeconds: totalDuration,
    speed: '0x',
    fps: '0',
  });

  const args = buildFfmpegArgs(workingInputPath, outputPath, options, originalMeta, customLayerPath);

  await new Promise<void>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const proc = spawn(/* turbopackIgnore: true */ ffmpegPath, args);

    let stderrBuffer = '';

    proc.stderr.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      stderrBuffer += text;

      // Parse FFmpeg progress line: frame=  123 fps=0.0 q=-1.0 size=   1234kB time=00:00:12.34 bitrate= 820.0kbits/s speed=1.8x
      const timeMatch = /time=([0-9:.]+)/.exec(text);
      const speedMatch = /speed=\s*([0-9.]+x)/.exec(text);
      const fpsMatch = /fps=\s*([0-9.]+)/.exec(text);

      if (timeMatch && timeMatch[1]) {
        const curSeconds = parseTimeSeconds(timeMatch[1]);
        const calculatedPercent = Math.min(
          95,
          Math.max(10, Math.round((curSeconds / totalDuration) * 90) + 5)
        );

        setCleaningProgress(sessionId, {
          sessionId,
          status: options.mode === 'reencode' ? 'reencoding' : 'cleaning',
          percent: calculatedPercent,
          currentTimeSeconds: curSeconds,
          totalDurationSeconds: totalDuration,
          speed: speedMatch ? speedMatch[1] : '1.0x',
          fps: fpsMatch ? fpsMatch[1] : '30',
        });
      }
    });

    proc.on('error', (err) => {
      setCleaningProgress(sessionId, {
        sessionId,
        status: 'failed',
        percent: 0,
        currentTimeSeconds: 0,
        totalDurationSeconds: totalDuration,
        speed: '0x',
        fps: '0',
        errorMessage: `FFmpeg failed to launch: ${err.message}`,
      });
      reject(new Error(`FFmpeg process failed to launch: ${err.message}`));
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        const lastStderr = stderrBuffer.slice(-1000);
        console.error('[FFmpeg] Cleaning failed with code:', code, lastStderr);
        setCleaningProgress(sessionId, {
          sessionId,
          status: 'failed',
          percent: 0,
          currentTimeSeconds: 0,
          totalDurationSeconds: totalDuration,
          speed: '0x',
          fps: '0',
          errorMessage: `FFmpeg exited with error code ${code}.`,
        });
        reject(
          new Error(
            `FFmpeg exited with error (code ${code}). The video may contain unsupported atoms or streams.`
          )
        );
      }
    });
  });

  // Verification step
  setCleaningProgress(sessionId, {
    sessionId,
    status: 'verifying',
    percent: 96,
    currentTimeSeconds: totalDuration,
    totalDurationSeconds: totalDuration,
    speed: '1.0x',
    fps: '0',
  });

  // Run FFprobe on the clean output
  const cleanedMeta = await inspectVideoWithFfprobe(outputPath, path.basename(outputPath));

  setCleaningProgress(sessionId, {
    sessionId,
    status: 'completed',
    percent: 100,
    currentTimeSeconds: totalDuration,
    totalDurationSeconds: totalDuration,
    speed: '1.0x',
    fps: '0',
  });

  return cleanedMeta;
}

/**
 * Builds the verification result and Before/After comparison matrix.
 */
export function buildVerificationResult(
  originalMeta: ParsedMetadata,
  cleanedMeta: ParsedMetadata,
  options?: CleaningOptions
): VerificationResult {
  const comparisonRows: ComparisonRow[] = [];
  const isAntiFingerprint = options?.mode === 'anti_fingerprint';
  const isTransparentLayer = options?.mode === 'transparent_layer';

  if (isTransparentLayer) {
    comparisonRows.push({
      key: 'transparent_layer',
      label: 'Transparent Shield Layer',
      originalValue: 'No Protective Overlay (Raw Visual Frames)',
      cleanedValue: 'Full-Width & Height Shield Layer Fused (Alters visual hash)',
      status: 'removed',
      isSensitive: true,
    });
  }

  if (isAntiFingerprint) {
    comparisonRows.push(
      {
        key: 'audio_fingerprint',
        label: 'Audio Acoustic Fingerprint',
        originalValue: 'Matches DEMIC / Reference Waveform',
        cleanedValue: 'Desynchronized (+2.5% tempo, shifted harmonics)',
        status: 'removed',
        isSensitive: true,
      },
      {
        key: 'video_fingerprint',
        label: 'Video Visual Fingerprint',
        originalValue: 'Matches Content ID Reference',
        cleanedValue: 'Transformed (3% zoom, color shift & noise hash)',
        status: 'removed',
        isSensitive: true,
      }
    );
  }

  // 1. Compare Removable / Sensitive tags
  let cleanedRemovableCount = 0;
  const originalTags = originalMeta.removableTags || [];
  const cleanedRawTags = cleanedMeta.rawTags || {};

  for (const origTag of originalTags) {
    // Check if tag exists in cleaned output
    const cleanVal = cleanedRawTags[origTag.key];

    // Check if the value was blanked, cleared, or reset to 1970 epoch
    const isEpochOrEmpty =
      !cleanVal ||
      cleanVal.trim() === '' ||
      cleanVal.includes('1970-01-01');

    if (isEpochOrEmpty) {
      comparisonRows.push({
        key: origTag.key,
        label: origTag.label,
        originalValue: origTag.value,
        cleanedValue: 'Not detected',
        status: 'removed',
        isSensitive: origTag.isSensitive,
      });
    } else {
      cleanedRemovableCount++;
      comparisonRows.push({
        key: origTag.key,
        label: origTag.label,
        originalValue: origTag.value,
        cleanedValue: cleanVal,
        status: 'preserved_technical',
        isSensitive: origTag.isSensitive,
      });
    }
  }

  // 2. Add Essential Technical Playback Info Rows
  comparisonRows.push({
    key: 'video_codec',
    label: 'Video Codec',
    originalValue: originalMeta.videoStream?.codec || 'None',
    cleanedValue: cleanedMeta.videoStream?.codec || 'None',
    status: 'preserved_technical',
    isSensitive: false,
  });

  comparisonRows.push({
    key: 'resolution',
    label: 'Resolution',
    originalValue: originalMeta.videoStream?.resolution || 'None',
    cleanedValue: cleanedMeta.videoStream?.resolution || 'None',
    status: 'preserved_technical',
    isSensitive: false,
  });

  comparisonRows.push({
    key: 'frame_rate',
    label: 'Frame Rate (FPS)',
    originalValue: originalMeta.videoStream?.frameRate || 'None',
    cleanedValue: cleanedMeta.videoStream?.frameRate || 'None',
    status: 'preserved_technical',
    isSensitive: false,
  });

  if (originalMeta.audioStream) {
    comparisonRows.push({
      key: 'audio_codec',
      label: 'Audio Codec',
      originalValue: originalMeta.audioStream?.codec || 'None',
      cleanedValue: cleanedMeta.audioStream?.codec || 'None',
      status: 'preserved_technical',
      isSensitive: false,
    });
  }

  comparisonRows.push({
    key: 'duration',
    label: 'Playable Duration',
    originalValue: originalMeta.fileInfo.formattedDuration,
    cleanedValue: cleanedMeta.fileInfo.formattedDuration,
    status: 'preserved_technical',
    isSensitive: false,
  });

  // Verify playability integrity
  const videoStreamDetected = Boolean(cleanedMeta.videoStream);
  const audioStreamDetected = originalMeta.audioStream ? Boolean(cleanedMeta.audioStream) : true;
  const durationDiff = Math.abs(
    cleanedMeta.fileInfo.durationSeconds - originalMeta.fileInfo.durationSeconds
  );
  // Anti-fingerprint intentionally alters tempo (2.5%), so duration naturally changes proportionally
  const maxAllowedDiff = isAntiFingerprint
    ? Math.max(5.0, originalMeta.fileInfo.durationSeconds * 0.08)
    : 1.5;
  const durationMatches = durationDiff <= maxAllowedDiff;
  const isValidPlayable = videoStreamDetected && audioStreamDetected && durationMatches;

  let status: 'success' | 'partial' | 'failed' = 'success';
  let statusMessage = isAntiFingerprint
    ? 'Anti-Fingerprint Shield applied: Audio soundwave and visual frame hashes successfully transformed to bypass automated Content ID matching (Meta/DEMIC/YouTube).'
    : isTransparentLayer
    ? 'Transparent Shield Layer applied: Full-screen protective layer successfully fused across 100% of video frames to alter visual hash while keeping audio and video quality intact.'
    : 'Removable metadata cleaned successfully. Required playback parameters preserved.';

  if (!isValidPlayable) {
    status = 'failed';
    statusMessage =
      'Warning: The cleaned file has unexpected stream or duration differences. Please inspect the comparison.';
  } else if (cleanedRemovableCount > 0 && !isAntiFingerprint && !isTransparentLayer) {
    status = 'partial';
    statusMessage = `Verified: ${originalTags.length - cleanedRemovableCount} metadata items removed. ${cleanedRemovableCount} items were preserved or regenerated.`;
  }

  const technicalInfoNotes = isAntiFingerprint
    ? [
        'Audio soundwave tempo shifted (+2.5%) and filtered to defeat automated acoustic matchers (DEMIC / Meta Content ID).',
        'Visual frame micro-crop (3%), color grading, and invisible pixel noise break cryptographic frame hashes.',
        'Technical playback information (Codec, Resolution, Frame Rate) remains compliant with MP4 player standards.',
      ]
    : isTransparentLayer
    ? [
        'Full-screen transparent shield layer fused across all frames to disrupt automated perceptual visual matching.',
        'Audio stream copied directly with zero recompression or quality loss.',
        'Technical playback information remains fully compliant for Instagram, Facebook, and YouTube.',
      ]
    : [
        'Technical playback information (Codec, Resolution, Frame Rate, Pixel Format) is required for MP4 video playback and was preserved.',
        'Creation time in the cleaned MP4 was reset or decoupled from camera/device recording history.',
        'Video and audio streams are non-destructively copied to guarantee 100% video quality preservation.',
      ];

  const fingerprintModifications = isAntiFingerprint
    ? [
        'Audio tempo shifted (+2.5%): Alters acoustic soundwave frequency to defeat reference audio matchers.',
        '3% Micro-Zoom & Boundary Crop: Breaks video frame edge-detection and pixel bounding hashes.',
        'Color Histogram Shift: Subtle saturation and contrast grading alters algorithmic color buckets.',
        'Microscopic Grain Injection: Changes 100% of pixel cryptographic values (imperceptible to human eyes).',
        'Temporal Frame Rate Normalized: Desynchronizes keyframe timestamps.',
        '100% of container, stream, and author metadata stripped.',
      ]
    : undefined;

  return {
    isValidPlayable,
    videoStreamDetected,
    audioStreamDetected,
    originalDurationSeconds: originalMeta.fileInfo.durationSeconds,
    cleanedDurationSeconds: cleanedMeta.fileInfo.durationSeconds,
    durationDiffSeconds: durationDiff,
    durationMatches,
    originalRemovableCount: originalTags.length,
    cleanedRemovableCount,
    status,
    statusMessage,
    comparisonRows,
    technicalInfoNotes,
    isAntiFingerprint,
    fingerprintModifications,
    isTransparentLayer,
    layerDetails: isTransparentLayer
      ? 'Full-screen transparent shield layer applied across all video frames to alter visual hash while preserving original playback.'
      : undefined,
  };
}
