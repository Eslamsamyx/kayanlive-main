import {
  assetProcessingQueue,
  thumbnailQueue,
  variantQueue,
  emailQueue,
  notificationQueue,
  analyticsQueue,
  cleanupQueue,
  scheduleRecurringCleanup,
} from '@/lib/queue';
import {
  processAssetProcessing,
  processThumbnailGeneration,
  processVariantGeneration,
  processEmail,
  processNotification,
  processAnalytics,
  processCleanup,
  handleJobError,
  handleJobStalled,
  gracefulShutdown,
} from './processors';

// =============================================================================
// WORKER CONFIGURATION
// =============================================================================

const CONCURRENCY = {
  assetProcessing: 2, // 2 concurrent asset processing jobs
  thumbnail: 5, // 5 concurrent thumbnail generation jobs
  variant: 3, // 3 concurrent variant generation jobs
  email: 10, // 10 concurrent email sending jobs
  notification: 10, // 10 concurrent notification creation jobs
  analytics: 5, // 5 concurrent analytics recording jobs
  cleanup: 1, // 1 cleanup job at a time
};

// =============================================================================
// REGISTER PROCESSORS
// =============================================================================

console.log('🚀 Starting Kayan Live background workers...');

// Asset Processing Queue
assetProcessingQueue.process(
  CONCURRENCY.assetProcessing,
  async (job) => {
    console.log(`[Asset Processing] Job ${job.id} started`);
    await processAssetProcessing(job);
    console.log(`[Asset Processing] Job ${job.id} completed`);
  }
);

// Thumbnail Generation Queue
thumbnailQueue.process(
  CONCURRENCY.thumbnail,
  async (job) => {
    console.log(`[Thumbnail] Job ${job.id} started`);
    await processThumbnailGeneration(job);
    console.log(`[Thumbnail] Job ${job.id} completed`);
  }
);

// Variant Generation Queue
variantQueue.process(
  CONCURRENCY.variant,
  async (job) => {
    console.log(`[Variant] Job ${job.id} started`);
    await processVariantGeneration(job);
    console.log(`[Variant] Job ${job.id} completed`);
  }
);

// Email Queue
emailQueue.process(
  CONCURRENCY.email,
  async (job) => {
    console.log(`[Email] Job ${job.id} started`);
    await processEmail(job);
    console.log(`[Email] Job ${job.id} completed`);
  }
);

// Notification Queue
notificationQueue.process(
  CONCURRENCY.notification,
  async (job) => {
    console.log(`[Notification] Job ${job.id} started`);
    await processNotification(job);
    console.log(`[Notification] Job ${job.id} completed`);
  }
);

// Analytics Queue
analyticsQueue.process(
  CONCURRENCY.analytics,
  async (job) => {
    console.log(`[Analytics] Job ${job.id} started`);
    await processAnalytics(job);
    console.log(`[Analytics] Job ${job.id} completed`);
  }
);

// Cleanup Queue
cleanupQueue.process(
  CONCURRENCY.cleanup,
  async (job) => {
    console.log(`[Cleanup] Job ${job.id} started`);
    await processCleanup(job);
    console.log(`[Cleanup] Job ${job.id} completed`);
  }
);

// =============================================================================
// ERROR HANDLERS
// =============================================================================

const queues = [
  { queue: assetProcessingQueue, name: 'Asset Processing' },
  { queue: thumbnailQueue, name: 'Thumbnail' },
  { queue: variantQueue, name: 'Variant' },
  { queue: emailQueue, name: 'Email' },
  { queue: notificationQueue, name: 'Notification' },
  { queue: analyticsQueue, name: 'Analytics' },
  { queue: cleanupQueue, name: 'Cleanup' },
];

queues.forEach(({ queue, name }) => {
  queue.on('error', (error) => {
    console.error(`❌ [${name}] Queue error:`, error);
  });

  queue.on('failed', (job, err) => {
    console.error(`❌ [${name}] Job ${job.id} failed:`, err.message);
    handleJobError(job, err);
  });

  queue.on('stalled', (job) => {
    console.warn(`⚠️  [${name}] Job ${job.id} stalled`);
    handleJobStalled(job);
  });

  queue.on('completed', (job) => {
    console.log(`✅ [${name}] Job ${job.id} completed`);
  });

  queue.on('active', (job) => {
    console.log(`🔄 [${name}] Job ${job.id} active`);
  });

  queue.on('waiting', (jobId) => {
    console.log(`⏳ [${name}] Job ${jobId} waiting`);
  });

  queue.on('removed', (job) => {
    console.log(`🗑️  [${name}] Job ${job.id} removed`);
  });
});

// =============================================================================
// SCHEDULE RECURRING JOBS
// =============================================================================

(async () => {
  try {
    await scheduleRecurringCleanup();
    console.log('✅ Recurring cleanup jobs scheduled');
  } catch (error) {
    console.error('❌ Failed to schedule recurring jobs:', error);
  }
})();

// =============================================================================
// GRACEFUL SHUTDOWN
// =============================================================================

process.on('SIGTERM', async () => {
  console.log('📴 SIGTERM received, shutting down gracefully...');
  await gracefulShutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('📴 SIGINT received, shutting down gracefully...');
  await gracefulShutdown();
  process.exit(0);
});

// =============================================================================
// HEALTH CHECK
// =============================================================================

const logQueueHealth = async () => {
  const health: Record<string, any> = {};

  for (const { queue, name } of queues) {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    health[name] = {
      waiting,
      active,
      completed,
      failed,
      delayed,
    };
  }

  console.log('\n📊 Queue Health Check:');
  console.table(health);
};

// Log health check every 5 minutes
setInterval(logQueueHealth, 5 * 60 * 1000);

// Initial health check after 10 seconds
setTimeout(logQueueHealth, 10000);

// =============================================================================
// STARTUP
// =============================================================================

console.log('✅ All workers registered and running');
console.log('📊 Queue concurrency:', CONCURRENCY);
console.log('🔄 Waiting for jobs...');
