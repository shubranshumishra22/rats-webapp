// server/src/services/scheduler.service.ts

import cron from 'node-cron';
import { processEventReminders } from './reminder.service';
import { processScheduledPosts } from './social-media.service';

/**
 * Initialize all scheduled tasks
 */
export function initScheduledTasks(): void {
  // Schedule event reminder processing to run every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('Running scheduled task: Process event reminders');
    await processEventReminders();
  });
  
  // Schedule social media post processing to run every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled task: Process scheduled social media posts');
    await processScheduledPosts();
  });
  
  // You can add more scheduled tasks here as needed
}