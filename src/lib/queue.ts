import Queue from 'bull';
import Redis from 'ioredis';

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// Create Redis clients
const createRedisClient = () => new Redis(redisConfig);

// Job queue configurations
const QUEUE_OPTIONS = {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 500, // Keep last 500 failed jobs
  },
};

// =============================================================================
// ASSET PROCESSING QUEUE
// =============================================================================

export interface AssetProcessingJob {
  assetId: string;
  fileKey: string;
  fileType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'MODEL_3D' | 'DESIGN' | 'OTHER';
  mimeType: string;
  originalFilename: string;
}

export const assetProcessingQueue = new Queue<AssetProcessingJob>(
  'asset-processing',
  QUEUE_OPTIONS
);

// Add job to process asset
export const queueAssetProcessing = async (
  job: AssetProcessingJob
): Promise<void> => {
  await assetProcessingQueue.add(job, {
    priority: job.fileType === 'IMAGE' ? 1 : job.fileType === 'VIDEO' ? 2 : 3,
  });
};

// =============================================================================
// THUMBNAIL GENERATION QUEUE
// =============================================================================

export interface ThumbnailJob {
  assetId: string;
  fileKey: string;
  fileType: 'IMAGE' | 'VIDEO';
  mimeType: string;
  originalFilename: string;
}

export const thumbnailQueue = new Queue<ThumbnailJob>(
  'thumbnail-generation',
  QUEUE_OPTIONS
);

// Add job to generate thumbnail
export const queueThumbnailGeneration = async (
  job: ThumbnailJob
): Promise<void> => {
  await thumbnailQueue.add(job, {
    priority: 1, // High priority for thumbnails
  });
};

// =============================================================================
// VARIANT GENERATION QUEUE
// =============================================================================

export interface VariantJob {
  assetId: string;
  fileKey: string;
  fileType: 'IMAGE' | 'VIDEO';
  mimeType: string;
  originalFilename: string;
  variants: string[]; // ['THUMBNAIL', 'PREVIEW', 'WEB_OPTIMIZED', 'MOBILE']
}

export const variantQueue = new Queue<VariantJob>(
  'variant-generation',
  QUEUE_OPTIONS
);

// Add job to generate variants
export const queueVariantGeneration = async (
  job: VariantJob
): Promise<void> => {
  await variantQueue.add(job, {
    priority: 2,
  });
};

// =============================================================================
// EMAIL QUEUE
// =============================================================================

export interface EmailJob {
  to: string | string[];
  subject: string;
  template: string;
  data: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export const emailQueue = new Queue<EmailJob>('email', QUEUE_OPTIONS);

// Add job to send email
export const queueEmail = async (job: EmailJob): Promise<void> => {
  await emailQueue.add(job, {
    priority: 3,
  });
};

// =============================================================================
// NOTIFICATION QUEUE
// =============================================================================

export interface NotificationJob {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  projectId?: string;
  taskId?: string;
  milestoneId?: string;
  meetingId?: string;
}

export const notificationQueue = new Queue<NotificationJob>(
  'notification',
  QUEUE_OPTIONS
);

// Add job to create notification
export const queueNotification = async (
  job: NotificationJob
): Promise<void> => {
  await notificationQueue.add(job, {
    priority: 1, // High priority for notifications
  });
};

// =============================================================================
// ANALYTICS QUEUE
// =============================================================================

export interface AnalyticsJob {
  type: 'ASSET_VIEW' | 'ASSET_DOWNLOAD' | 'ASSET_SHARE' | 'SEARCH' | 'ACTIVITY';
  assetId?: string;
  userId?: string;
  data: Record<string, any>;
  timestamp: Date;
}

export const analyticsQueue = new Queue<AnalyticsJob>(
  'analytics',
  QUEUE_OPTIONS
);

// Add job to track analytics
export const queueAnalytics = async (job: AnalyticsJob): Promise<void> => {
  await analyticsQueue.add(job, {
    priority: 5, // Lower priority for analytics
    delay: 1000, // Batch analytics with 1s delay
  });
};

// =============================================================================
// CLEANUP QUEUE (Delete old files, expired links, etc.)
// =============================================================================

export interface CleanupJob {
  type: 'EXPIRED_LINKS' | 'OLD_VARIANTS' | 'TEMP_FILES' | 'OLD_ANALYTICS';
  data?: Record<string, any>;
}

export const cleanupQueue = new Queue<CleanupJob>('cleanup', QUEUE_OPTIONS);

// Add job to cleanup
export const queueCleanup = async (job: CleanupJob): Promise<void> => {
  await cleanupQueue.add(job, {
    priority: 10, // Lowest priority
  });
};

// Schedule recurring cleanup jobs
export const scheduleRecurringCleanup = async (): Promise<void> => {
  // Clean up expired links daily at 2 AM
  await cleanupQueue.add(
    { type: 'EXPIRED_LINKS' },
    {
      repeat: {
        cron: '0 2 * * *', // Daily at 2 AM
      },
    }
  );

  // Clean up old analytics monthly
  await cleanupQueue.add(
    { type: 'OLD_ANALYTICS' },
    {
      repeat: {
        cron: '0 3 1 * *', // Monthly on the 1st at 3 AM
      },
    }
  );

  // Clean up temp files every hour
  await cleanupQueue.add(
    { type: 'TEMP_FILES' },
    {
      repeat: {
        cron: '0 * * * *', // Every hour
      },
    }
  );
};

// =============================================================================
// QUEUE MONITORING & HEALTH
// =============================================================================

export interface QueueStats {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
}

export const getQueueStats = async (
  queue: Queue.Queue
): Promise<QueueStats> => {
  const [waiting, active, completed, failed, delayed, isPaused] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
    queue.isPaused(),
  ]);

  return {
    name: queue.name,
    waiting,
    active,
    completed,
    failed,
    delayed,
    paused: isPaused,
  };
};

export const getAllQueueStats = async (): Promise<QueueStats[]> => {
  const queues = [
    assetProcessingQueue,
    thumbnailQueue,
    variantQueue,
    emailQueue,
    notificationQueue,
    analyticsQueue,
    cleanupQueue,
  ];

  return Promise.all(queues.map(getQueueStats));
};

// Pause all queues
export const pauseAllQueues = async (): Promise<void> => {
  const queues = [
    assetProcessingQueue,
    thumbnailQueue,
    variantQueue,
    emailQueue,
    notificationQueue,
    analyticsQueue,
    cleanupQueue,
  ];

  await Promise.all(queues.map(q => q.pause()));
};

// Resume all queues
export const resumeAllQueues = async (): Promise<void> => {
  const queues = [
    assetProcessingQueue,
    thumbnailQueue,
    variantQueue,
    emailQueue,
    notificationQueue,
    analyticsQueue,
    cleanupQueue,
  ];

  await Promise.all(queues.map(q => q.resume()));
};

// Clear all queues (removes all jobs)
export const clearAllQueues = async (): Promise<void> => {
  const queues = [
    assetProcessingQueue,
    thumbnailQueue,
    variantQueue,
    emailQueue,
    notificationQueue,
    analyticsQueue,
    cleanupQueue,
  ];

  await Promise.all(queues.map(q => q.empty()));
};

// Graceful shutdown
export const gracefulShutdown = async (): Promise<void> => {
  console.log('Shutting down queues gracefully...');

  const queues = [
    assetProcessingQueue,
    thumbnailQueue,
    variantQueue,
    emailQueue,
    notificationQueue,
    analyticsQueue,
    cleanupQueue,
  ];

  // Close all queues
  await Promise.all(queues.map(q => q.close()));

  console.log('All queues closed');
};

// Handle process signals for graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Error handling for queues
const setupQueueErrorHandlers = (queue: Queue.Queue) => {
  queue.on('error', (error) => {
    console.error(`Queue ${queue.name} error:`, error);
  });

  queue.on('failed', (job, err) => {
    console.error(`Job ${job.id} in queue ${queue.name} failed:`, err);
  });

  queue.on('stalled', (job) => {
    console.warn(`Job ${job.id} in queue ${queue.name} stalled`);
  });
};

// Setup error handlers for all queues
[
  assetProcessingQueue,
  thumbnailQueue,
  variantQueue,
  emailQueue,
  notificationQueue,
  analyticsQueue,
  cleanupQueue,
].forEach(setupQueueErrorHandlers);
