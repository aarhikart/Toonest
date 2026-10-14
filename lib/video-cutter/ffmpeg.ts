import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { ZipArchive } from 'archiver';
import { VideoMetadataProbe } from '@/lib/video-text/ffmpeg';
import { VideoCutterSessionPaths, setCuttingProgress } from './storage';
import { ClipMetadata, EndingVideoMetadata } from './types';

// Resolve ffmpeg binary path
export function getFfmpegPath(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ffmpegStatic = require('ffmpeg-static');
    if (ffmpegStatic && fs.existsSync(ffmpegStatic)) {
      return ffmpegStatic;
    }
  } catch {}

  const localWinPath = path.join(process.cwd(), 'node_modules/ffmpeg-static/ffmpeg.exe');
  if (fs.existsSync(localWinPath)) return localWinPath;

  return 'ffmpeg';
}

// Resolve ffprobe binary path
export function getFfprobePath(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ffprobeStatic = require('ffprobe-static');
    if (ffprobeStatic?.path && fs.existsSync(ffprobeStatic.path)) {
      return ffprobeStatic.path;
    }
  } catch {}

  const localWinPath = path.join(
    process.cwd(),
    'node_modules/ffprobe-static/bin/win32/x64/ffprobe.exe'
  );
  if (fs.existsSync(localWinPath)) return localWinPath;

  const localWinPath2 = path.join(process.cwd(), 'node_modules/ffprobe-static/ffprobe.exe');
  if (fs.existsSync(localWinPath2)) return localWinPath2;

  return 'ffprobe';
}

export function formatSecondsToTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return '00:00:00';
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function probeVideo(filePath: string): Promise<VideoMetadataProbe> {
  const ffprobePath = getFfprobePath();
  return new Promise((resolve, reject) => {
    const args = [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      filePath,
    ];

    // @ts-ignore
    const child = spawn(/*turbopackIgnore: true*/ ffprobePath, args, { windowsHide: true });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => {
      stdout += d.toString();
    });

    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`ffprobe failed with code ${code}: ${stderr}`));
      }

      try {
        const data = JSON.parse(stdout);
        const videoStream = data.streams?.find((s: any) => s.codec_type === 'video');
        const audioStream = data.streams?.find((s: any) => s.codec_type === 'audio');

        let duration = parseFloat(data.format?.duration || '0');
        if (!duration && videoStream?.duration) {
          duration = parseFloat(videoStream.duration);
        }

        let fps = 30;
        if (videoStream?.r_frame_rate) {
          const [num, den] = videoStream.r_frame_rate.split('/').map(Number);
          if (den && den > 0) fps = Math.round(num / den);
        }

        resolve({
          width: videoStream?.width || 1280,
          height: videoStream?.height || 720,
          duration: Math.max(duration, 0),
          fps: fps || 30,
          hasAudio: !!audioStream,
        });
      } catch (err) {
        reject(new Error(`Failed to parse ffprobe output: ${err}`));
      }
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to run ffprobe: ${err.message}`));
    });
  });
}

// Resolve a cross-platform font file path for FFmpeg's drawtext filter to avoid Fontconfig crashes
export function getSystemFontPath(): string | null {
  const candidates = [
    // Windows
    'C:/Windows/Fonts/arial.ttf',
    'C:/Windows/Fonts/segoeui.ttf',
    'C:/Windows/Fonts/calibri.ttf',
    'C:/Windows/Fonts/tahoma.ttf',
    // Linux
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
    '/usr/share/fonts/TTF/DejaVuSans.ttf',
    // macOS
    '/System/Library/Fonts/Helvetica.ttc',
    '/Library/Fonts/Arial.ttf',
  ];

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    } catch {}
  }

  return null;
}

export function getDrawtextFilter(text: string): string {
  const fontPath = getSystemFontPath();
  const fontParam = fontPath ? `fontfile='${fontPath.replace(/\\/g, '/').replace(/:/g, '\\:')}':` : '';
  return `drawtext=${fontParam}text='${text}':x=28:y=28:fontsize=32:fontcolor=white:box=1:boxcolor=black@0.65:boxborderw=10`;
}

export async function normalizeEndingVideo(
  mainVideoPath: string,
  endingVideoPath: string,
  outputPath: string
): Promise<EndingVideoMetadata> {
  const ffmpegPath = getFfmpegPath();
  const mainProbe = await probeVideo(mainVideoPath);
  const endingProbe = await probeVideo(endingVideoPath);

  const targetWidth = mainProbe.width || 1280;
  const targetHeight = mainProbe.height || 720;
  const targetFps = mainProbe.fps || 30;

  const args: string[] = ['-i', endingVideoPath];

  // If ending video lacks audio, synthesize silent stereo 44100Hz audio so concat never fails
  if (!endingProbe.hasAudio) {
    args.push('-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100');
    args.push('-map', '0:v:0', '-map', '1:a:0');
  } else {
    args.push('-map', '0:v:0', '-map', '0:a:0?');
  }

  args.push(
    '-vf', `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${targetFps}`,
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-ar', '44100',
    '-ac', '2',
    '-b:a', '128k',
    '-shortest',
    '-y',
    outputPath
  );

  await new Promise<void>((resolve, reject) => {
    // @ts-ignore
    const child = spawn(/*turbopackIgnore: true*/ ffmpegPath, args, { windowsHide: true });
    let stderr = '';
    child.stderr.on('data', (d) => { stderr += d.toString(); });
    child.on('close', (code) => {
      if (code !== 0) return reject(new Error(`Failed to normalize ending video: ${stderr}`));
      resolve();
    });
    child.on('error', reject);
  });

  const stats = fs.statSync(outputPath);
  const normProbe = await probeVideo(outputPath);

  return {
    filename: path.basename(endingVideoPath),
    fileSize: stats.size,
    duration: normProbe.duration || endingProbe.duration || 0,
    formattedDuration: formatSecondsToTime(normProbe.duration || endingProbe.duration || 0),
    width: targetWidth,
    height: targetHeight,
  };
}

/**
 * Cuts the video into equal segments using FFmpeg.
 * If an ending video is provided, appends the ending video to the end of every generated clip!
 */
export async function cutVideoIntoSegments(
  paths: VideoCutterSessionPaths,
  clipDurationSeconds: number,
  originalFilename: string,
  totalVideoDuration: number,
  overlayWatermark: boolean = false,
  includeEndingVideo: boolean = false,
  includeLogo: boolean = false
): Promise<ClipMetadata[]> {
  const ffmpegPath = getFfmpegPath();
  const segmentSec = Math.max(1, Math.round(clipDurationSeconds));
  const totalExpectedClips = Math.ceil(totalVideoDuration / segmentSec) || 1;

  const isMkv = originalFilename.toLowerCase().endsWith('.mkv') || paths.originalPath.toLowerCase().endsWith('.mkv');
  const clipExt = isMkv ? '.mkv' : '.mp4';
  const hasEnding = includeEndingVideo && fs.existsSync(paths.endingNormPath);
  const hasLogo = includeLogo && fs.existsSync(paths.logoPath);

  // Calculate proportional logo size and padding so it is "not too big and not too small"
  let targetLogoWidth = 192;
  let targetLogoHeight = 108;
  let padX = 24;
  let padY = 24;

  if (hasLogo) {
    try {
      const mainProbe = await probeVideo(paths.originalPath);
      const vWidth = mainProbe.width || 1280;
      const vHeight = mainProbe.height || 720;
      const isVertical = vHeight > vWidth;

      // Fit proportionally: ~14% of width for landscape (20% for portrait), bounded by ~10% of height
      targetLogoWidth = Math.max(48, Math.round(vWidth * (isVertical ? 0.20 : 0.14)));
      targetLogoHeight = Math.max(36, Math.round(vHeight * (isVertical ? 0.07 : 0.10)));

      // Resolution-aware margin from top-right corner
      padX = Math.max(16, Math.round(vWidth * 0.022));
      padY = Math.max(16, Math.round(vHeight * 0.022));
    } catch (_) {}
  }

  const featuresSuffix = `${hasLogo ? ' + Logo' : ''}${hasEnding ? ' + Ending Video' : ''}`;

  setCuttingProgress(paths.sessionId, {
    stage: 'cutting',
    percent: 15,
    message: `Splitting into ${totalExpectedClips} clips (${Math.round(segmentSec / 60)} min each)${featuresSuffix}...`,
    totalClips: totalExpectedClips,
    currentClip: 0,
  });

  let endingDurationSec = 0;
  let hasEndingAudio = false;
  if (hasEnding) {
    try {
      const eProbe = await probeVideo(paths.endingNormPath);
      endingDurationSec = eProbe.duration || 0;
      hasEndingAudio = eProbe.hasAudio;
    } catch (_) {}
  }

  let hasMainAudio = true;
  try {
    const mProbe = await probeVideo(paths.originalPath);
    hasMainAudio = mProbe.hasAudio;
  } catch (_) {}

  if (hasEnding) {
    // Cut each segment and concatenate with normalized ending video (plus optional logo overlay)
    for (let i = 0; i < totalExpectedClips; i++) {
      const clipIndex = i + 1;
      const startSec = i * segmentSec;
      const endSec = Math.min((i + 1) * segmentSec, totalVideoDuration);
      const durationSec = Math.max(1, endSec - startSec);
      const outFilename = `video${clipIndex}${clipExt}`;
      const outPath = path.join(paths.clipsDir, outFilename);

      setCuttingProgress(paths.sessionId, {
        stage: 'cutting',
        percent: Math.min(68, Math.round(15 + (i / totalExpectedClips) * 50)),
        message: `Cutting Part #${clipIndex} of ${totalExpectedClips}${featuresSuffix}...`,
        totalClips: totalExpectedClips,
        currentClip: clipIndex,
      });

      const args = [
        '-ss', startSec.toString(),
        '-t', durationSec.toString(),
        '-i', paths.originalPath,
        '-i', paths.endingNormPath,
      ];

      let inputCount = 2;
      let logoInputIdx = -1;
      if (hasLogo) {
        logoInputIdx = inputCount++;
        args.push('-i', paths.logoPath);
      }

      let silentMainInputIdx = -1;
      if (!hasMainAudio && hasEndingAudio) {
        silentMainInputIdx = inputCount++;
        args.push('-f', 'lavfi', '-t', durationSec.toString(), '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100');
      }

      const hasAudioOutput = hasMainAudio || hasEndingAudio;

      let filterComplex = '';
      if (hasAudioOutput) {
        const a0 = hasMainAudio
          ? '[0:a]aformat=sample_rates=44100:channel_layouts=stereo[a0];'
          : `[${silentMainInputIdx}:a]aformat=sample_rates=44100:channel_layouts=stereo[a0];`;
        const a1 = '[1:a]aformat=sample_rates=44100:channel_layouts=stereo[a1];';
        filterComplex = `[0:v]setsar=1,format=yuv420p[v0];${a0}[1:v]setsar=1,format=yuv420p[v1];${a1}[v0][a0][v1][a1]concat=n=2:v=1:a=1[v_concat][a]`;
      } else {
        filterComplex = '[0:v]setsar=1,format=yuv420p[v0];[1:v]setsar=1,format=yuv420p[v1];[v0][v1]concat=n=2:v=1:a=0[v_concat]';
      }

      let currentVideoNode = 'v_concat';
      if (hasLogo && logoInputIdx !== -1) {
        filterComplex += `;[${logoInputIdx}:v]format=rgba,scale=${targetLogoWidth}:${targetLogoHeight}:force_original_aspect_ratio=decrease[logo];[${currentVideoNode}][logo]overlay=W-w-${padX}:${padY}:eof_action=repeat[v_logo]`;
        currentVideoNode = 'v_logo';
      }

      if (overlayWatermark) {
        filterComplex += `;[${currentVideoNode}]${getDrawtextFilter(`Part #${clipIndex}`)}[v]`;
      } else {
        filterComplex += `;[${currentVideoNode}]null[v]`;
      }

      args.push(
        '-filter_complex', filterComplex,
        '-map', '[v]'
      );

      if (hasAudioOutput) {
        args.push(
          '-map', '[a]',
          '-c:a', 'aac',
          '-ar', '44100',
          '-ac', '2',
          '-b:a', '128k'
        );
      }

      args.push(
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-y',
        outPath
      );

      await new Promise<void>((resolve, reject) => {
        // @ts-ignore
        const child = spawn(/*turbopackIgnore: true*/ ffmpegPath, args, { windowsHide: true });
        let stderr = '';
        child.stderr.on('data', (d) => { stderr += d.toString(); });
        child.on('close', (code) => {
          if (code !== 0) return reject(new Error(`Failed cutting clip ${clipIndex} with ending video: ${stderr}`));
          resolve();
        });
        child.on('error', reject);
      });
    }
  } else if (hasLogo) {
    // Cut each clip with Logo positioned on the top-right corner
    for (let i = 0; i < totalExpectedClips; i++) {
      const clipIndex = i + 1;
      const startSec = i * segmentSec;
      const endSec = Math.min((i + 1) * segmentSec, totalVideoDuration);
      const durationSec = Math.max(1, endSec - startSec);
      const outFilename = `video${clipIndex}${clipExt}`;
      const outPath = path.join(paths.clipsDir, outFilename);

      setCuttingProgress(paths.sessionId, {
        stage: 'cutting',
        percent: Math.min(68, Math.round(15 + (i / totalExpectedClips) * 50)),
        message: `Rendering Part #${clipIndex} of ${totalExpectedClips}${featuresSuffix}...`,
        totalClips: totalExpectedClips,
        currentClip: clipIndex,
      });

      let filterComplex = `[1:v]format=rgba,scale=${targetLogoWidth}:${targetLogoHeight}:force_original_aspect_ratio=decrease[logo];[0:v]setsar=1[v0];[v0][logo]overlay=W-w-${padX}:${padY}:eof_action=repeat[v_logo]`;
      if (overlayWatermark) {
        filterComplex += `;[v_logo]${getDrawtextFilter(`Part #${clipIndex}`)}[v]`;
      } else {
        filterComplex += `;[v_logo]null[v]`;
      }

      const args = [
        '-ss', startSec.toString(),
        '-i', paths.originalPath,
        '-t', durationSec.toString(),
        '-i', paths.logoPath,
        '-filter_complex', filterComplex,
        '-map', '[v]',
        '-map', '0:a?',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-c:a', 'copy',
        '-y',
        outPath,
      ];

      await new Promise<void>((resolve, reject) => {
        // @ts-ignore
        const child = spawn(/*turbopackIgnore: true*/ ffmpegPath, args, { windowsHide: true });
        let stderr = '';
        child.stderr.on('data', (d) => { stderr += d.toString(); });
        child.on('close', (code) => {
          if (code !== 0) return reject(new Error(`Failed cutting clip ${clipIndex} with logo: ${stderr}`));
          resolve();
        });
        child.on('error', reject);
      });
    }
  } else if (overlayWatermark) {
    // Cut each clip with Part #1, Part #2, ... rendered in the top-left corner
    for (let i = 0; i < totalExpectedClips; i++) {
      const clipIndex = i + 1;
      const startSec = i * segmentSec;
      const endSec = Math.min((i + 1) * segmentSec, totalVideoDuration);
      const durationSec = Math.max(1, endSec - startSec);
      const outFilename = `video${clipIndex}${clipExt}`;
      const outPath = path.join(paths.clipsDir, outFilename);

      setCuttingProgress(paths.sessionId, {
        stage: 'cutting',
        percent: Math.min(68, Math.round(15 + (i / totalExpectedClips) * 50)),
        message: `Rendering Part #${clipIndex} of ${totalExpectedClips}...`,
        totalClips: totalExpectedClips,
        currentClip: clipIndex,
      });

      const args = [
        '-ss', startSec.toString(),
        '-i', paths.originalPath,
        '-t', durationSec.toString(),
        '-vf', `setsar=1,${getDrawtextFilter(`Part #${clipIndex}`)}`,
        '-map', '0:v:0',
        '-map', '0:a?',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-c:a', 'copy',
        '-y',
        outPath,
      ];

      await new Promise<void>((resolve, reject) => {
        // @ts-ignore
        const child = spawn(/*turbopackIgnore: true*/ ffmpegPath, args, { windowsHide: true });
        let stderr = '';
        child.stderr.on('data', (d) => { stderr += d.toString(); });
        child.on('close', (code) => {
          if (code !== 0) return reject(new Error(`Failed cutting clip ${clipIndex}: ${stderr}`));
          resolve();
        });
        child.on('error', reject);
      });
    }
  } else {
    // Ultra-fast lossless stream copy segmenting directly to video1, video2, ...
    const outputPattern = path.join(paths.clipsDir, `video%d${clipExt}`);

    const args = [
      '-i', paths.originalPath,
      '-c', 'copy',
      '-map', '0:v:0',
      '-map', '0:a:0?',
      '-segment_time', segmentSec.toString(),
      '-segment_start_number', '1',
      '-f', 'segment',
      '-reset_timestamps', '1',
      '-y',
      outputPattern,
    ];

    await new Promise<void>((resolve, reject) => {
      // @ts-ignore
      const child = spawn(/*turbopackIgnore: true*/ ffmpegPath, args, { windowsHide: true });
      let stderr = '';

      child.stderr.on('data', (d) => {
        stderr += d.toString();
      });

      child.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(`FFmpeg segment cutting failed with exit code ${code}: ${stderr}`));
        }
        resolve();
      });

      child.on('error', (err) => {
        reject(new Error(`Failed to execute FFmpeg: ${err.message}`));
      });
    });
  }

  setCuttingProgress(paths.sessionId, {
    stage: 'cutting',
    percent: 70,
    message: 'Analyzing generated clips...',
  });

  // Read generated clips (video1.mp4 / video1.mkv, ...)
  const files = fs.readdirSync(paths.clipsDir)
    .filter((f) => f.startsWith('video') && (f.endsWith('.mp4') || f.endsWith('.mkv')))
    .sort((a, b) => {
      const numA = parseInt(a.replace(/[^0-9]/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/[^0-9]/g, ''), 10) || 0;
      return numA - numB;
    });

  if (files.length === 0) {
    throw new Error('No video clips were generated. Check the source video file.');
  }

  const clips: ClipMetadata[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fullPath = path.join(paths.clipsDir, file);
    const stats = fs.statSync(fullPath);

    const clipIndex = i + 1;
    const startSec = i * segmentSec;
    const endSec = Math.min((i + 1) * segmentSec, totalVideoDuration);
    const durationSec = Math.max(1, endSec - startSec);
    const totalClipDuration = durationSec + (hasEnding ? endingDurationSec : 0);

    const itemExt = file.toLowerCase().endsWith('.mkv') ? '.mkv' : '.mp4';
    const simpleName = `video${clipIndex}${itemExt}`;

    clips.push({
      index: clipIndex,
      filename: file,
      displayName: simpleName,
      startTime: startSec,
      endTime: endSec,
      startTimeFormatted: formatSecondsToTime(startSec),
      endTimeFormatted: formatSecondsToTime(endSec) + (hasEnding ? ' (+ Ending Video)' : ''),
      durationSeconds: Math.round(totalClipDuration),
      durationFormatted: formatSecondsToTime(totalClipDuration),
      sizeBytes: stats.size,
      downloadUrl: `/api/video-cutter/clip/${paths.sessionId}/${file}`,
      previewUrl: `/api/video-cutter/clip/${paths.sessionId}/${file}?preview=1`,
    });
  }

  return clips;
}

/**
 * Bundles all generated clips into a single ZIP file using Archiver (STORE mode).
 * Because MP4 video streams are already compressed, store mode avoids CPU bottlenecks
 * and packages the ZIP file in seconds.
 */
export async function bundleClipsToZip(
  paths: VideoCutterSessionPaths,
  clips: ClipMetadata[],
  zipFilename: string
): Promise<number> {
  setCuttingProgress(paths.sessionId, {
    stage: 'zipping',
    percent: 75,
    message: `Packaging ${clips.length} clips into ${zipFilename}...`,
  });

  return new Promise<number>((resolve, reject) => {
    const output = fs.createWriteStream(paths.zipPath);
    const archive = new ZipArchive({
      zlib: { level: 0 }, // Store without compression for instant packaging of MP4s
    });

    output.on('close', () => {
      const stats = fs.statSync(paths.zipPath);
      setCuttingProgress(paths.sessionId, {
        stage: 'completed',
        percent: 100,
        message: 'All clips generated and bundled successfully!',
      });
      resolve(stats.size);
    });

    archive.on('error', (err) => {
      reject(new Error(`Failed to create ZIP archive: ${err.message}`));
    });

    archive.pipe(output);

    // Append each clip with its descriptive display name
    for (const clip of clips) {
      const clipFilePath = path.join(paths.clipsDir, clip.filename);
      archive.file(clipFilePath, { name: clip.displayName });
    }

    archive.finalize().catch(reject);
  });
}
