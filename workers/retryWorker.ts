import { queue, QueueJob } from './queue';

export class RetryWorker {
  constructor() {
    queue.on('jobFailed', (job: QueueJob) => {
      this.handleJobFailure(job);
    });
  }

  handleJobFailure(job: QueueJob) {
    console.warn(`[RetryWorker] Job ${job.id} (${job.name}) failed after ${job.attempts} attempts. Error: ${job.error}`);
    // Future expansion: dead-letter queue, alert triggers or webhooks
  }
}

export const retryWorker = new RetryWorker();
