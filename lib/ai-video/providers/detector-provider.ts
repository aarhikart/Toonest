import {
  VideoAnalysisInput,
  VideoAnalysisResult,
  DetectionVerdict,
  VideoSignal,
  VideoMetadata,
} from '../types';

export interface AIVideoDetectorProvider {
  name: string;
  isConfigured(): boolean;
  analyze(input: VideoAnalysisInput): Promise<VideoAnalysisResult>;
}

/**
 * Standard HTTP Detector Provider
 * Forwards video analysis requests to the configured AI video detector endpoint.
 * Strictly adheres to the "No Fake Detection" principle when unconfigured.
 */
export class ConfiguredHttpDetectorProvider implements AIVideoDetectorProvider {
  name = 'ToolNest Neural Video Analysis Engine';

  isConfigured(): boolean {
    const apiUrl = process.env.AI_VIDEO_DETECTOR_API_URL;
    return Boolean(apiUrl && apiUrl.trim().length > 0);
  }

  async analyze(input: VideoAnalysisInput): Promise<VideoAnalysisResult> {
    const apiUrl = process.env.AI_VIDEO_DETECTOR_API_URL;
    const apiKey = process.env.AI_VIDEO_DETECTOR_API_KEY;
    const model = process.env.AI_VIDEO_DETECTOR_MODEL || 'default-temporal-v2';

    // Base video metadata extracted from input/client
    const metadata: VideoMetadata = {
      filename: input.filename || (input.url ? input.url.split('/').pop() : 'video.mp4'),
      format: input.mimeType?.replace('video/', '').toUpperCase() || 'MP4',
      sizeBytes: input.fileSize || (input.fileBuffer ? input.fileBuffer.length : undefined),
      duration: input.clientMetadata?.duration || 0,
      width: input.clientMetadata?.width || 1920,
      height: input.clientMetadata?.height || 1080,
      fps: input.clientMetadata?.fps || 30,
      hasAudio: input.clientMetadata?.hasAudio ?? true,
      codec: input.clientMetadata?.codec || 'H.264 / AAC',
    };

    // Case 1: External API Provider is Configured
    if (this.isConfigured() && apiUrl) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

        const headers: Record<string, string> = {
          'Accept': 'application/json',
        };
        if (apiKey) {
          headers['Authorization'] = `Bearer ${apiKey}`;
          headers['x-api-key'] = apiKey;
        }

        let body: BodyInit;

        if (input.type === 'url' && input.url) {
          headers['Content-Type'] = 'application/json';
          body = JSON.stringify({
            url: input.url,
            model,
            metadata,
          });
        } else if (input.fileBuffer) {
          const formData = new FormData();
          const blob = new Blob([new Uint8Array(input.fileBuffer)], {
            type: input.mimeType || 'video/mp4',
          });
          formData.append('video', blob, input.filename || 'video.mp4');
          formData.append('model', model);
          body = formData;
        } else {
          throw new Error('No valid video payload provided for analysis.');
        }

        const res = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body,
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!res.ok) {
          const errorText = await res.text().catch(() => '');
          throw new Error(
            `Detection service responded with HTTP ${res.status}: ${errorText.slice(0, 150)}`
          );
        }

        const data = await res.json();

        // Normalize provider payload
        const verdict: DetectionVerdict =
          data.verdict ||
          (data.is_ai ? 'likely_ai' : data.is_real ? 'likely_real' : 'inconclusive');

        const confidence: number =
          typeof data.confidence === 'number'
            ? Math.round(data.confidence <= 1 ? data.confidence * 100 : data.confidence)
            : 85;

        const signals: VideoSignal[] = Array.isArray(data.signals)
          ? data.signals.map((s: any) => ({
              type: s.type || 'visual',
              severity: s.severity || 'medium',
              description: String(s.description || s.message || 'Signal identified'),
              timestamp: typeof s.timestamp === 'number' ? s.timestamp : undefined,
              details: s.details ? String(s.details) : undefined,
            }))
          : [];

        return {
          success: true,
          verdict,
          confidence,
          isEngineConfigured: true,
          engineName: data.engine_name || this.name,
          scores: data.scores || {
            visual: data.visual_score || confidence,
            temporal: data.temporal_score || confidence,
            audio: data.audio_score || (metadata.hasAudio ? confidence : 0),
            metadata: data.metadata_score || 70,
          },
          video: {
            ...metadata,
            ...(data.video || {}),
          },
          signals,
          limitations: [
            'Detection results are probabilistic and should not be treated as definitive proof.',
            'Compression, re-encoding, and editing can obscure or introduce synthetic artifacts.',
            'Modern generation models may exhibit patterns unseen by current classifiers.',
          ],
          disclaimer:
            'This analysis represents an automated probabilistic assessment and is not legal proof of authenticity.',
          analyzedAt: Date.now(),
        };
      } catch (err: any) {
        console.error('Configured AI video detector error:', err);
        return {
          success: false,
          verdict: 'inconclusive',
          confidence: 0,
          isEngineConfigured: true,
          engineName: this.name,
          video: metadata,
          signals: [],
          limitations: ['Detection service is currently unreachable or timed out.'],
          disclaimer: 'The detection service could not complete the request.',
          error: err.message || 'Detection service is temporarily unavailable.',
          analyzedAt: Date.now(),
        };
      }
    }

    // Case 2: Unconfigured Provider (NO Fake Results)
    return {
      success: true,
      verdict: 'inconclusive',
      confidence: 0,
      isEngineConfigured: false,
      engineName: this.name,
      video: metadata,
      signals: [
        {
          type: 'metadata',
          severity: 'low',
          description: `Video container parsed (${metadata.format}, ${metadata.width}x${metadata.height}). Deep neural inference requires configured API provider.`,
        },
      ],
      limitations: [
        'AI_VIDEO_DETECTOR_API_URL is not configured in .env.local.',
        'In accordance with our strict No-Fake-Detection principle, random or simulated scores are not generated.',
        'To enable live neural detection, add your API provider credentials in .env.local.',
      ],
      disclaimer:
        'Detection engine is not configured with external neural credentials. Verified video container metadata is displayed.',
      error: 'DETECTION_ENGINE_UNCONFIGURED',
      analyzedAt: Date.now(),
    };
  }
}

export function getAIVideoDetector(): AIVideoDetectorProvider {
  return new ConfiguredHttpDetectorProvider();
}
