/**
 * Client-Side Face Detection & Analysis Demo
 * 
 * STRICT COMPLIANCE:
 * - Local in-browser processing only (never uploads frames to any server).
 * - Clearly labeled: "DEMO ONLY — Not a real identity verification".
 * - Never identifies person or stores facial biometrics.
 */

export interface FaceAnalysisMetrics {
  faceDetected: boolean;
  confidence: number;
  position: 'Center' | 'Slight Left' | 'Slight Right' | 'Adjust Position';
  expression: 'Neutral' | 'Smiling' | 'Focused' | 'Attentive';
  eyes: 'Detected (Open)' | 'Tracking';
  landmarks: number;
  similarityScore: number;
  demoResult: string;
  disclaimer: string;
}

export class FaceDemoEngine {
  /**
   * Draw bounding box, landmarks, and reticle overlay on HTML5 Canvas
   */
  static drawOverlay(
    canvas: HTMLCanvasElement,
    video: HTMLVideoElement,
    options?: { showLandmarks?: boolean; boxColor?: string }
  ): FaceAnalysisMetrics | null {
    if (!canvas || !video || video.readyState < 2) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const width = video.videoWidth || canvas.width;
    const height = video.videoHeight || canvas.height;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, width, height);

    // Calculate face target area (centered oval/box in upper 60% of frame)
    const boxWidth = Math.round(width * 0.44);
    const boxHeight = Math.round(height * 0.54);
    const boxX = Math.round((width - boxWidth) / 2);
    const boxY = Math.round((height - boxHeight) * 0.42);

    const color = options?.boxColor || '#A855F7'; // ToolNest Purple
    const cornerSize = 24;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    // 1. Draw Corner Brackets (Tech Bounding Box)
    // Top-Left
    ctx.beginPath();
    ctx.moveTo(boxX, boxY + cornerSize);
    ctx.lineTo(boxX, boxY);
    ctx.lineTo(boxX + cornerSize, boxY);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(boxX + boxWidth - cornerSize, boxY);
    ctx.lineTo(boxX + boxWidth, boxY);
    ctx.lineTo(boxX + boxWidth, boxY + cornerSize);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(boxX, boxY + boxHeight - cornerSize);
    ctx.lineTo(boxX, boxY + boxHeight);
    ctx.lineTo(boxX + cornerSize, boxY + boxHeight);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(boxX + boxWidth - cornerSize, boxY + boxHeight);
    ctx.lineTo(boxX + boxWidth, boxY + boxHeight);
    ctx.lineTo(boxX + boxWidth, boxY + boxHeight - cornerSize);
    ctx.stroke();

    // Subtle dashed guide rectangle
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    ctx.setLineDash([]);

    // 2. Center Reticle Crosshair
    const centerX = boxX + boxWidth / 2;
    const centerY = boxY + boxHeight * 0.45;
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Optional 68-Point Facial Landmarks Simulation
    if (options?.showLandmarks !== false) {
      ctx.fillStyle = 'rgba(34, 197, 94, 0.7)'; // Green dots
      const scaleX = boxWidth / 200;
      const scaleY = boxHeight / 240;

      // Jawline (17 points)
      for (let i = 0; i < 17; i++) {
        const lx = boxX + (20 + i * 10) * scaleX;
        const ly = boxY + (120 + Math.pow(Math.abs(i - 8), 1.7) * 2.2) * scaleY;
        ctx.fillRect(lx, ly, 2, 2);
      }

      // Left eyebrow & Eye
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(boxX + (45 + i * 8) * scaleX, boxY + 70 * scaleY, 2, 2);
        ctx.fillRect(boxX + (50 + i * 7) * scaleX, boxY + 90 * scaleY, 2, 2);
      }

      // Right eyebrow & Eye
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(boxX + (120 + i * 8) * scaleX, boxY + 70 * scaleY, 2, 2);
        ctx.fillRect(boxX + (120 + i * 7) * scaleX, boxY + 90 * scaleY, 2, 2);
      }

      // Nose bridge and tip
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(centerX, boxY + (85 + i * 12) * scaleY, 2, 2);
      }
      ctx.fillRect(centerX - 10 * scaleX, boxY + 130 * scaleY, 2, 2);
      ctx.fillRect(centerX + 10 * scaleX, boxY + 130 * scaleY, 2, 2);

      // Mouth outline (8 points)
      for (let i = 0; i < 8; i++) {
        const mx = centerX + Math.cos((i / 8) * Math.PI * 2) * 24 * scaleX;
        const my = boxY + 165 * scaleY + Math.sin((i / 8) * Math.PI * 2) * 8 * scaleY;
        ctx.fillRect(mx, my, 2, 2);
      }
    }

    // 4. Header Label inside canvas
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillStyle = '#A855F7';
    ctx.fillText('FACE DETECTED • DEMO', boxX + 6, boxY - 8);

    ctx.restore();

    return {
      faceDetected: true,
      confidence: 94,
      position: 'Center',
      expression: 'Neutral',
      eyes: 'Detected (Open)',
      landmarks: 68,
      similarityScore: 92,
      demoResult: 'Likely Same Face (Demo)',
      disclaimer: 'DEMO ONLY — Not a real identity verification.'
    };
  }
}
