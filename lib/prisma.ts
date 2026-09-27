import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Safely records an Instagram download request without breaking the API
 * if the database connection is currently unavailable or unconfigured.
 */
export async function recordInstagramDownload(data: {
  sourceUrl: string;
  mediaType?: string | null;
  status: 'SUCCESS' | 'FAILED' | 'ERROR';
}) {
  try {
    if (!process.env.DATABASE_URL) {
      // Database URL not configured in this environment
      return null;
    }
    return await prisma.instagramDownload.create({
      data: {
        sourceUrl: data.sourceUrl,
        mediaType: data.mediaType || 'unknown',
        status: data.status,
      },
    });
  } catch (err: any) {
    console.warn('[Prisma] Could not record InstagramDownload:', err?.message || err);
    return null;
  }
}

export default prisma;
