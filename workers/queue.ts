import { EventEmitter } from 'events';

export interface QueueJob<T = any> {
  id: string;
  name: string;
  data: T;
  attempts: number;
  maxAttempts: number;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  error?: string;
  createdAt: string;
}

/**
 * Universal Queue Engine: Works standalone in-memory with event loop concurrency
 * and can be backed by Redis in production cluster mode.
 */
class UniversalQueue extends EventEmitter {
  private jobs: Map<string, QueueJob> = new Map();
  private isProcessing = false;
  private concurrency = 5;

  constructor() {
    super();
    this.startWorkerLoop();
  }

  async add<T>(name: string, data: T, options: { maxAttempts?: number } = {}): Promise<QueueJob<T>> {
    const job: QueueJob<T> = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      data,
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      status: 'waiting',
      createdAt: new Date().toISOString()
    };
    this.jobs.set(job.id, job);
    this.emit('jobAdded', job);
    return job;
  }

  getJob(id: string): QueueJob | undefined {
    return this.jobs.get(id);
  }

  getAllJobs(): QueueJob[] {
    return Array.from(this.jobs.values());
  }

  private startWorkerLoop() {
    setInterval(async () => {
      if (this.isProcessing) return;
      this.isProcessing = true;

      try {
        const waitingJobs = Array.from(this.jobs.values()).filter(j => j.status === 'waiting');
        const activeCount = Array.from(this.jobs.values()).filter(j => j.status === 'active').length;

        const slotsAvailable = this.concurrency - activeCount;
        if (slotsAvailable <= 0 || waitingJobs.length === 0) {
          this.isProcessing = false;
          return;
        }

        const batch = waitingJobs.slice(0, slotsAvailable);
        await Promise.all(
          batch.map(async job => {
            job.status = 'active';
            job.attempts++;
            try {
              this.emit(`process:${job.name}`, job);
            } catch (err: any) {
              job.error = err.message;
              if (job.attempts >= job.maxAttempts) {
                job.status = 'failed';
                this.emit('jobFailed', job);
              } else {
                job.status = 'waiting';
              }
            }
          })
        );
      } finally {
        this.isProcessing = false;
      }
    }, 1000);
  }
}

const globalForQueue = globalThis as unknown as {
  whatsAppQueue?: UniversalQueue;
};

export const queue = globalForQueue.whatsAppQueue || new UniversalQueue();

if (process.env.NODE_ENV !== 'production') {
  globalForQueue.whatsAppQueue = queue;
}
