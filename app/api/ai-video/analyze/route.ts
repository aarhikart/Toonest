import { NextRequest, NextResponse } from 'next/server';
import { validateVideoUrl, validateUploadedFile } from '@/lib/ai-video/validator';
import { getAIVideoDetector } from '@/lib/ai-video/providers/detector-provider';
import { VideoAnalysisInput, VideoMetadata } from '@/lib/ai-video/types';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Mode A: JSON Request with Video URL
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { url, clientMetadata } = body;

      const urlValidation = validateVideoUrl(url);
      if (!urlValidation.isValid) {
        return NextResponse.json(
          {
            success: false,
            error: urlValidation.error || 'Invalid video URL provided.',
            isPlatformUrl: urlValidation.isPlatformUrl,
          },
          { status: 400 }
        );
      }

      const detector = getAIVideoDetector();
      const input: VideoAnalysisInput = {
        type: 'url',
        url: urlValidation.sanitizedUrl,
        clientMetadata: clientMetadata as Partial<VideoMetadata>,
      };

      const result = await detector.analyze(input);
      return NextResponse.json(result);
    }

    // Mode B: Multipart Form Data with Uploaded Video File
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = (formData.get('file') || formData.get('video')) as File | null;
      const clientMetadataRaw = formData.get('clientMetadata') as string | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No video file was uploaded.' },
          { status: 400 }
        );
      }

      const fileValidation = validateUploadedFile(
        file.size,
        file.type,
        file.name
      );
      if (!fileValidation.isValid) {
        return NextResponse.json(
          { success: false, error: fileValidation.error },
          { status: 400 }
        );
      }

      let clientMetadata: Partial<VideoMetadata> | undefined;
      if (clientMetadataRaw) {
        try {
          clientMetadata = JSON.parse(clientMetadataRaw);
        } catch {
          // Ignore
        }
      }

      const arrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      const detector = getAIVideoDetector();
      const input: VideoAnalysisInput = {
        type: 'file',
        fileBuffer,
        filename: file.name,
        mimeType: file.type || 'video/mp4',
        fileSize: file.size,
        clientMetadata,
      };

      const result = await detector.analyze(input);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, error: 'Unsupported Content-Type header.' },
      { status: 415 }
    );
  } catch (err: any) {
    console.error('AI video analysis API error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'An internal error occurred while processing the video.',
      },
      { status: 500 }
    );
  }
}
