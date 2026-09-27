import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import {
  ParsedMetadata,
  FileInfo,
  VideoStreamInfo,
  AudioStreamInfo,
  SubtitleStreamInfo,
  ChapterInfo,
  RemovableTag,
  SensitiveHighlight,
} from './types';

const execFileAsync = promisify(execFile);

// Resolve ffprobe binary path
function getFfprobePath(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ffprobeStatic = require('ffprobe-static');
    if (ffprobeStatic && ffprobeStatic.path && fs.existsSync(ffprobeStatic.path)) {
      return ffprobeStatic.path;
    }
  } catch (e) {
    // fallback
  }

  // Common fallbacks for Windows / Linux
  const localWinPath = path.join(
    process.cwd(),
    'node_modules/ffprobe-static/bin/win32/x64/ffprobe.exe'
  );
  if (fs.existsSync(localWinPath)) {
    return localWinPath;
  }

  return 'ffprobe';
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hrs = Math.floor(mins / 60);

  if (hrs > 0) {
    const remMins = mins % 60;
    return `${hrs.toString().padStart(2, '0')}:${remMins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Categorizes a metadata tag into its privacy/descriptive type.
 */
function inspectTag(
  key: string,
  value: string
): {
  isSensitive: boolean;
  sensitiveCategory?: 'location' | 'device' | 'camera' | 'creation_time' | 'software' | 'author';
  sensitiveReason?: string;
  category: 'descriptive' | 'sensitive' | 'technical' | 'custom';
  label: string;
} {
  const lKey = key.toLowerCase();

  // Location / GPS
  if (
    lKey.includes('location') ||
    lKey.includes('gps') ||
    lKey.includes('iso6709') ||
    lKey.includes('latitude') ||
    lKey.includes('longitude') ||
    lKey.includes('xyz')
  ) {
    return {
      isSensitive: true,
      sensitiveCategory: 'location',
      sensitiveReason: 'Contains geographic coordinates or location tags.',
      category: 'sensitive',
      label: 'Location / GPS Coordinates',
    };
  }

  // Camera Make & Model
  if (lKey.includes('make') || lKey.includes('model') || lKey.includes('camera') || lKey.includes('lens')) {
    return {
      isSensitive: true,
      sensitiveCategory: 'camera',
      sensitiveReason: 'Exposes hardware camera manufacturer or lens model.',
      category: 'sensitive',
      label: 'Camera / Hardware Model',
    };
  }

  // Device information
  if (
    lKey.includes('device') ||
    lKey.includes('android.') ||
    lKey.includes('apple.quicktime') ||
    lKey.includes('serial')
  ) {
    return {
      isSensitive: true,
      sensitiveCategory: 'device',
      sensitiveReason: 'Exposes device identity or operating system details.',
      category: 'sensitive',
      label: 'Device Details',
    };
  }

  // Creation Time
  if (lKey === 'creation_time' || lKey.endsWith('creation_time') || lKey === 'date' || lKey === 'year') {
    return {
      isSensitive: true,
      sensitiveCategory: 'creation_time',
      sensitiveReason: 'Contains original recording date and timestamp.',
      category: 'sensitive',
      label: 'Recording Timestamp',
    };
  }

  // Software & Encoder
  if (lKey === 'software' || lKey === 'encoder' || lKey === 'writing_application' || lKey.includes('tool')) {
    return {
      isSensitive: true,
      sensitiveCategory: 'software',
      sensitiveReason: 'Exposes video editing software or operating system tool.',
      category: 'sensitive',
      label: 'Software / Encoder Tool',
    };
  }

  // Author / Copyright / Artist
  if (
    lKey === 'artist' ||
    lKey === 'author' ||
    lKey === 'composer' ||
    lKey === 'copyright' ||
    lKey === 'publisher'
  ) {
    return {
      isSensitive: true,
      sensitiveCategory: 'author',
      sensitiveReason: 'Identifies creator, author name, or owner.',
      category: 'sensitive',
      label: 'Author / Creator Identity',
    };
  }

  // Descriptive Tags
  const descriptiveKeys = [
    'title',
    'comment',
    'description',
    'synopsis',
    'album',
    'genre',
    'track',
    'disc',
    'episode_id',
    'network',
  ];
  if (descriptiveKeys.includes(lKey)) {
    return {
      isSensitive: false,
      category: 'descriptive',
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
    };
  }

  // Known technical container tags
  const technicalKeys = ['major_brand', 'minor_version', 'compatible_brands', 'handler_name', 'vendor_id'];
  if (technicalKeys.includes(lKey)) {
    return {
      isSensitive: false,
      category: 'technical',
      label: key,
    };
  }

  return {
    isSensitive: false,
    category: 'custom',
    label: key,
  };
}

/**
 * Runs FFprobe on a file and parses structured metadata.
 */
export async function inspectVideoWithFfprobe(
  filePath: string,
  displayFilename?: string
): Promise<ParsedMetadata> {
  const ffprobePath = getFfprobePath();

  const args = [
    '-v',
    'quiet',
    '-print_format',
    'json',
    '-show_format',
    '-show_streams',
    '-show_chapters',
    filePath,
  ];

  let stdout = '';
  try {
    const res = await execFileAsync(ffprobePath, args, {
      timeout: 25000,
      maxBuffer: 10 * 1024 * 1024,
    });
    stdout = res.stdout;
  } catch (err: any) {
    throw new Error(
      `FFprobe inspection failed: ${err.message || 'Could not parse media container. The file may be corrupt.'}`
    );
  }

  let probeData: any = {};
  try {
    probeData = JSON.parse(stdout);
  } catch (e) {
    throw new Error('Failed to parse FFprobe JSON output.');
  }

  const format = probeData.format || {};
  const streams: any[] = Array.isArray(probeData.streams) ? probeData.streams : [];
  const chaptersData: any[] = Array.isArray(probeData.chapters) ? probeData.chapters : [];

  // 1. File Information
  const fileSize = format.size ? parseInt(format.size, 10) : fs.statSync(filePath).size;
  const durationSec = format.duration ? parseFloat(format.duration) : 0;
  const bitrateNum = format.bit_rate ? parseInt(format.bit_rate, 10) : 0;

  const fileInfo: FileInfo = {
    filename: displayFilename || path.basename(filePath),
    fileSize,
    formattedSize: formatBytes(fileSize),
    formatName: format.format_long_name || format.format_name || 'QuickTime / MP4',
    durationSeconds: durationSec,
    formattedDuration: formatDuration(durationSec),
    bitrate: bitrateNum,
    formattedBitrate: bitrateNum > 0 ? `${Math.round(bitrateNum / 1000)} kbps` : 'Unknown',
    container: 'MPEG-4 Part 14 (.mp4)',
  };

  // 2. Video Stream
  const videoRaw = streams.find((s) => s.codec_type === 'video');
  let videoStream: VideoStreamInfo | null = null;
  if (videoRaw) {
    let frameRate = 'Unknown';
    if (videoRaw.avg_frame_rate && videoRaw.avg_frame_rate !== '0/0') {
      const parts = videoRaw.avg_frame_rate.split('/');
      if (parts.length === 2 && parseInt(parts[1], 10) > 0) {
        frameRate = `${(parseInt(parts[0], 10) / parseInt(parts[1], 10)).toFixed(2)} fps`;
      }
    } else if (videoRaw.r_frame_rate) {
      frameRate = `${videoRaw.r_frame_rate} fps`;
    }

    const width = videoRaw.width || 0;
    const height = videoRaw.height || 0;

    videoStream = {
      codec: (videoRaw.codec_name || 'Unknown').toUpperCase(),
      profile: videoRaw.profile || 'Default',
      width,
      height,
      resolution: width && height ? `${width} × ${height}` : 'Unknown',
      frameRate,
      pixelFormat: videoRaw.pix_fmt || 'yuv420p',
      colorSpace: videoRaw.color_space || 'Unspecified',
      colorPrimaries: videoRaw.color_primaries || 'Unspecified',
      colorTransfer: videoRaw.color_transfer || 'Unspecified',
      colorRange: videoRaw.color_range || 'Unspecified',
      rotation: videoRaw.tags?.rotate || videoRaw.side_data_list?.[0]?.rotation || undefined,
      bitrate: videoRaw.bit_rate ? `${Math.round(parseInt(videoRaw.bit_rate, 10) / 1000)} kbps` : undefined,
    };
  }

  // 3. Audio Stream
  const audioRaw = streams.find((s) => s.codec_type === 'audio');
  let audioStream: AudioStreamInfo | null = null;
  if (audioRaw) {
    audioStream = {
      codec: (audioRaw.codec_name || 'Unknown').toUpperCase(),
      profile: audioRaw.profile,
      sampleRate: audioRaw.sample_rate ? `${audioRaw.sample_rate} Hz` : 'Unknown',
      channels: audioRaw.channels || 2,
      channelLayout: audioRaw.channel_layout || (audioRaw.channels === 1 ? 'mono' : 'stereo'),
      bitrate: audioRaw.bit_rate ? `${Math.round(parseInt(audioRaw.bit_rate, 10) / 1000)} kbps` : undefined,
      language: audioRaw.tags?.language || undefined,
    };
  }

  // 4. Subtitle Streams
  const subtitleStreams: SubtitleStreamInfo[] = streams
    .filter((s) => s.codec_type === 'subtitle')
    .map((s, idx) => ({
      index: idx + 1,
      codec: (s.codec_name || 'Unknown').toUpperCase(),
      language: s.tags?.language,
      title: s.tags?.title,
    }));

  const otherStreamsCount = streams.filter(
    (s) => s.codec_type !== 'video' && s.codec_type !== 'audio' && s.codec_type !== 'subtitle'
  ).length;

  // 5. Chapters
  const chapters: ChapterInfo[] = chaptersData.map((c, i) => ({
    id: c.id || i + 1,
    start: parseFloat(c.start_time || '0'),
    end: parseFloat(c.end_time || '0'),
    title: c.tags?.title || `Chapter ${i + 1}`,
  }));

  // 6. Merge format tags and stream tags into flat dictionary
  const rawTags: Record<string, string> = {};
  if (format.tags) {
    for (const [k, v] of Object.entries(format.tags)) {
      if (typeof v === 'string') rawTags[k] = v;
    }
  }

  streams.forEach((s, idx) => {
    if (s.tags) {
      for (const [k, v] of Object.entries(s.tags)) {
        if (typeof v === 'string') {
          // If format tag already has it, prefix with stream index
          const tagKey = rawTags[k] ? `stream_${idx}_${k}` : k;
          rawTags[tagKey] = v;
        }
      }
    }
  });

  // 7. Parse Removable & Sensitive Tags
  const removableTags: RemovableTag[] = [];
  const sensitiveHighlights: SensitiveHighlight[] = [];

  for (const [key, value] of Object.entries(rawTags)) {
    const inspected = inspectTag(key, value);

    removableTags.push({
      key,
      label: inspected.label,
      value,
      category: inspected.category,
      isSensitive: inspected.isSensitive,
      sensitiveReason: inspected.sensitiveReason,
    });

    if (inspected.isSensitive && inspected.sensitiveCategory) {
      sensitiveHighlights.push({
        category: inspected.sensitiveCategory,
        label: inspected.label,
        value,
        key,
      });
    }
  }

  return {
    fileInfo,
    videoStream,
    audioStream,
    subtitleStreams,
    otherStreamsCount,
    chapters,
    rawTags,
    removableTags,
    sensitiveHighlights,
    rawFfprobeJson: probeData,
  };
}
