import { db } from '../lib/whatsapp/db';
import { queue } from './queue';

export class SchedulerWorker {
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    this.start();
  }

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.checkScheduledCampaigns();
    }, 5000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  checkScheduledCampaigns() {
    const campaigns = db.getCampaigns();
    const now = new Date();

    for (const cmp of campaigns) {
      if (cmp.status === 'SCHEDULED' && cmp.scheduledAt) {
        const scheduledTime = new Date(cmp.scheduledAt);
        if (scheduledTime <= now) {
          cmp.status = 'QUEUED';
          queue.add('DISPATCH_CAMPAIGN', { campaignId: cmp.id });
        }
      }
    }
  }
}

export const schedulerWorker = new SchedulerWorker();
