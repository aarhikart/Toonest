import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { BoundingBox, RemovalOptions } from './types';

function getFfmpegPath(): string {
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

function getFfprobePath(): string {
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

export interface VideoMetadataProbe {
  width: number;
  height: number;
  duration: number;
  fps: number;
  hasAudio: boolean;
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

    const proc = spawn(ffprobePath, args);
    let stdout = '';
    let stderr = '';

    proc.on('error', (err) => reject(err));
    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));

    proc.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`ffprobe failed (${code}): ${stderr}`));
      }
      try {
        const data = JSON.parse(stdout);
        const videoStream = data.streams?.find((s: any) => s.codec_type === 'video');
        const audioStream = data.streams?.find((s: any) => s.codec_type === 'audio');

        const width = videoStream?.width || 1280;
        const height = videoStream?.height || 720;
        const duration = parseFloat(data.format?.duration || videoStream?.duration || '0');

        let fps = 30;
        if (videoStream?.r_frame_rate) {
          const [num, den] = videoStream.r_frame_rate.split('/').map(Number);
          if (den && num) fps = Math.round(num / den);
        }

        resolve({
          width,
          height,
          duration,
          fps,
          hasAudio: !!audioStream,
        });
      } catch (err) {
        reject(err);
      }
    });
  });
}

/**
 * Extracts a high-quality JPEG frame at a given timestamp (in seconds).
 */
export function extractFrameAtTimestamp(
  videoPath: string,
  timestamp: number,
  outputJpgPath: string
): Promise<string> {
  const ffmpegPath = getFfmpegPath();
  return new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-ss', timestamp.toFixed(2),
      '-i', videoPath,
      '-vframes', '1',
      '-q:v', '2',
      outputJpgPath,
    ];

    const proc = spawn(ffmpegPath, args);
    let stderr = '';
    proc.on('error', (err) => reject(err));
    proc.stderr.on('data', (d) => (stderr += d.toString()));

    proc.on('close', (code) => {
      if (code === 0 && fs.existsSync(outputJpgPath)) {
        resolve(outputJpgPath);
      } else {
        reject(new Error(`Failed to extract frame at ${timestamp}s: ${stderr}`));
      }
    });
  });
}

/**
 * Executes text removal filter across full video.
 */
export function processVideoTextRemoval(
  inputVideoPath: string,
  outputVideoPath: string,
  options: RemovalOptions,
  videoWidth: number,
  videoHeight: number
): Promise<void> {
  const ffmpegPath = getFfmpegPath();
  return new Promise((resolve, reject) => {
    const { method, patchColor, blurStrength, boxes } = options;

    if (!boxes || boxes.length === 0) {
      return reject(new Error('No bounding boxes specified for removal.'));
    }

    const args: string[] = ['-y', '-i', inputVideoPath];

    // Sanitize and constrain boxes to video bounds
    const validBoxes = boxes.map((b) => {
      const x = Math.max(0, Math.min(videoWidth - 2, Math.round(b.x)));
      const y = Math.max(0, Math.min(videoHeight - 2, Math.round(b.y)));
      const w = Math.max(2, Math.min(videoWidth - x, Math.round(b.width)));
      const h = Math.max(2, Math.min(videoHeight - y, Math.round(b.height)));
      return { ...b, x, y, width: w, height: h };
    });

    if (method === 'color_patch') {
      // Solid matching color patch (e.g. black box over black shorts waistband)
      // Format: drawbox=x=X:y=Y:w=W:h=H:color=HEX@1.0:t=fill
      const color = patchColor || 'black';
      const vfParts = validBoxes.map(
        (b) => `drawbox=x=${b.x}:y=${b.y}:w=${b.width}:h=${b.height}:color=${color}@1.0:t=fill`
      );
      args.push('-vf', vfParts.join(','));
      args.push('-map', '0:v');
      args.push('-map', '0:a?');
    } else if (method === 'delogo') {
      // Smooth interpolation using surrounding fabric/background pixels
      // delogo=x=X:y=Y:w=W:h=H
      const vfParts = validBoxes.map(
        (b) => `delogo=x=${b.x}:y=${b.y}:w=${b.width}:h=${b.height}`
      );
      args.push('-vf', vfParts.join(','));
      args.push('-map', '0:v');
      args.push('-map', '0:a?');
    } else {
      // Gaussian/box blur
      // Using split & crop & avgblur & overlay
      let filterComplex = '[0:v]split=2[base][crop_in];';
      const radius = Math.max(10, Math.min(40, blurStrength || 20));

      // Build chain for each box
      let currentBase = 'base';
      const filterSteps: string[] = [];

      validBoxes.forEach((b, idx) => {
        const cropOut = `blurred_${idx}`;
        const nextBase = idx === validBoxes.length - 1 ? 'v' : `temp_${idx}`;
        filterSteps.push(
          `[crop_in]crop=${b.width}:${b.height}:${b.x}:${b.y},avgblur=sizeX=${radius}:sizeY=${radius}[${cropOut}]`,
          `[${currentBase}][${cropOut}]overlay=${b.x}:${b.y}[${nextBase}]`
        );
        currentBase = nextBase;
      });

      filterComplex += filterSteps.join(';');
      args.push('-filter_complex', filterComplex);
      args.push('-map', '[v]');
      args.push('-map', '0:a?');
    }

    // High quality video encoding & stream-copy audio
    args.push('-c:v', 'libx264', '-crf', '18', '-preset', 'fast', '-pix_fmt', 'yuv420p');
    args.push('-c:a', 'copy');
    args.push('-movflags', '+faststart');
    args.push(outputVideoPath);

    const proc = spawn(ffmpegPath, args);
    let stderr = '';
    proc.on('error', (err) => reject(err));
    proc.stderr.on('data', (d) => (stderr += d.toString()));

    proc.on('close', (code) => {
      if (code === 0 && fs.existsSync(outputVideoPath)) {
        resolve();
      } else {
        reject(new Error(`Text removal processing failed (${code}): ${stderr}`));
      }
    });
  });
}
