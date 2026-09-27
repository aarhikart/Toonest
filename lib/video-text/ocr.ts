import { createWorker } from 'tesseract.js';
import { BoundingBox } from './types';
import crypto from 'crypto';
import path from 'path';

let sharedWorker: any = null;

async function getWorker() {
  if (!sharedWorker) {
    const workerPath = path.join(
      process.cwd(),
      'node_modules/tesseract.js/src/worker-script/node/index.js'
    );
    sharedWorker = await createWorker('eng', 1, { workerPath });
  }
  return sharedWorker;
}

export async function detectTextInImage(imagePath: string): Promise<BoundingBox[]> {
  try {
    const worker = await getWorker();
    const ret = await worker.recognize(imagePath);

    const boxes: BoundingBox[] = [];

    // Check lines first for cleaner phrases (e.g. "YOUCAN")
    const lines = ret.data?.lines || [];
    for (const line of lines) {
      const cleanText = line.text?.trim();
      if (cleanText && cleanText.length > 1 && line.confidence > 35) {
        const x0 = line.bbox.x0;
        const y0 = line.bbox.y0;
        const w = line.bbox.x1 - x0;
        const h = line.bbox.y1 - y0;

        // Add padding around text to ensure full coverage
        const padX = Math.round(w * 0.08);
        const padY = Math.round(h * 0.15);

        boxes.push({
          id: crypto.randomUUID(),
          text: cleanText,
          confidence: Math.round(line.confidence),
          x: Math.max(0, x0 - padX),
          y: Math.max(0, y0 - padY),
          width: w + padX * 2,
          height: h + padY * 2,
        });
      }
    }

    // If no multi-word lines, fall back to individual words
    if (boxes.length === 0 && ret.data?.words) {
      for (const word of ret.data.words) {
        const cleanText = word.text?.trim();
        if (cleanText && cleanText.length > 1 && word.confidence > 35) {
          const x0 = word.bbox.x0;
          const y0 = word.bbox.y0;
          const w = word.bbox.x1 - x0;
          const h = word.bbox.y1 - y0;

          const padX = Math.round(w * 0.08);
          const padY = Math.round(h * 0.15);

          boxes.push({
            id: crypto.randomUUID(),
            text: cleanText,
            confidence: Math.round(word.confidence),
            x: Math.max(0, x0 - padX),
            y: Math.max(0, y0 - padY),
            width: w + padX * 2,
            height: h + padY * 2,
          });
        }
      }
    }

    return boxes;
  } catch (err) {
    console.error('[OCR] Error running Tesseract detection:', err);
    return [];
  }
}
