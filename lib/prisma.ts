import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Lazy, safe Prisma client getter.
 * Never executes at build-time or when DATABASE_URL is not provided,
 * preventing Vercel build crashes during static analysis / page data collection.
 */
export function getPrisma(): PrismaClient | null {
  if (typeof window !== 'undefined') return null;
  if (!process.env.DATABASE_URL) return null;

  try {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      });
    }
    return globalForPrisma.prisma;
  } catch (err) {
    console.warn('[Prisma] Client initialization deferred:', err);
    return null;
  }
}

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = getPrisma();
    if (!client) {
      return () => Promise.resolve(null);
    }
    return (client as any)[prop];
  },
});

/**
 * Safely records an Instagram download request without breaking the API
 * if the database connection or table is unavailable.
 */
export async function recordInstagramDownload(data: {
  sourceUrl: string;
  mediaType?: string | null;
  status: 'SUCCESS' | 'FAILED' | 'ERROR';
}) {
  try {
    const client = getPrisma();
    if (!client || !(client as any).instagramDownload) {
      return null;
    }
    return await (client as any).instagramDownload.create({
      data: {
        sourceUrl: data.sourceUrl,
        mediaType: data.mediaType || 'unknown',
        status: data.status,
      },
    });
  } catch (err: any) {
    return null;
  }
}

export default prisma;
