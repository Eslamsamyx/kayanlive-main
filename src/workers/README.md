# Kayan Live Background Workers

This directory contains the background worker system for processing asynchronous jobs in the Kayan Live ecosystem.

## Overview

The worker system processes jobs from 7 different queues using Bull and Redis:

1. **Asset Processing** - Process uploaded assets (extract metadata, analyze files)
2. **Thumbnail Generation** - Generate thumbnails for images and videos
3. **Variant Generation** - Generate multiple sizes/formats of assets
4. **Email** - Send transactional and notification emails via AWS SES
5. **Notification** - Create in-app notifications for users
6. **Analytics** - Record asset views, downloads, searches, and activities
7. **Cleanup** - Scheduled maintenance tasks (expired links, old files, etc.)

## Architecture

```
src/workers/
├── index.ts          # Main worker entry point - registers all processors
├── processors.ts     # Job processor implementations for each queue
└── README.md         # This file
```

## Running the Workers

### Development Mode (with auto-reload)
```bash
npm run worker:dev
```

### Production Mode
```bash
npm run worker
```

## Configuration

### Environment Variables

```env
# Redis Configuration (required)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# AWS Configuration (required)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=kayanlive-assets

# AWS SES Configuration (required for emails)
AWS_SES_REGION=us-east-1
EMAIL_FROM=noreply@kayanlive.com
EMAIL_FROM_NAME=Kayan Live

# Database (required)
DATABASE_URL=postgresql://user:password@host:5432/kayanlive
```

### Concurrency Settings

The worker system processes jobs concurrently. Current settings in `index.ts`:

- **Asset Processing**: 2 concurrent jobs
- **Thumbnail Generation**: 5 concurrent jobs
- **Variant Generation**: 3 concurrent jobs
- **Email**: 10 concurrent jobs
- **Notification**: 10 concurrent jobs
- **Analytics**: 5 concurrent jobs
- **Cleanup**: 1 job at a time

You can adjust these based on your server capacity and requirements.

## Job Processors

### 1. Asset Processing

Processes uploaded assets to extract metadata:

- **Images**: Extract dimensions, color space, alpha channel using Sharp
- **Videos**: Extract duration, resolution, codec (TODO: ffmpeg integration)
- **Audio**: Extract duration, bitrate, channels (TODO: ffmpeg integration)
- **Documents**: Extract text, page count (TODO: implementation)

**Job Data**: `AssetProcessingJob`
```typescript
{
  assetId: string;
  fileKey: string;
  fileType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'MODEL_3D' | 'DESIGN' | 'OTHER';
  mimeType: string;
  originalFilename: string;
}
```

### 2. Thumbnail Generation

Generates preview thumbnails for assets:

- **Images**: 200x200 JPEG thumbnail using Sharp
- **Videos**: Extract first frame as thumbnail (TODO: ffmpeg integration)

**Job Data**: `ThumbnailJob`
```typescript
{
  assetId: string;
  fileKey: string;
  fileType: 'IMAGE' | 'VIDEO';
  mimeType: string;
  originalFilename: string;
}
```

### 3. Variant Generation

Generates multiple sizes/formats of assets:

**Variant Sizes**:
- `THUMBNAIL`: 200x200, 80% quality
- `PREVIEW`: 800x600, 85% quality
- `WEB_OPTIMIZED`: 1920x1080, 85% quality
- `MOBILE`: 640x480, 80% quality

**Job Data**: `VariantJob`
```typescript
{
  assetId: string;
  fileKey: string;
  fileType: 'IMAGE' | 'VIDEO';
  mimeType: string;
  originalFilename: string;
  variants: string[]; // ['THUMBNAIL', 'PREVIEW', 'WEB_OPTIMIZED', 'MOBILE']
}
```

### 4. Email

Sends emails via AWS SES using the email service:

- Template-based emails (welcome, task-assignment, etc.)
- Plain emails with HTML/text content
- Attachments support

**Job Data**: `EmailJob`
```typescript
{
  to: string | string[];
  subject: string;
  template: string; // Template name (optional)
  data: Record<string, any>; // Template data or { html, text }
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}
```

**Available Templates**:
- `welcome` - Welcome new users
- `project-invitation` - Project invitation
- `task-assignment` - Task assignment notification
- `asset-shared` - Asset sharing notification
- `lead-created` - New lead notification
- `meeting-reminder` - Meeting reminder
- `password-reset` - Password reset
- `notification` - Generic notification

### 5. Notification

Creates in-app notifications for users:

**Job Data**: `NotificationJob`
```typescript
{
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
```

### 6. Analytics

Records analytics events:

**Event Types**:
- `ASSET_VIEW` - Asset viewed
- `ASSET_DOWNLOAD` - Asset downloaded
- `ASSET_SHARE` - Asset shared
- `SEARCH` - Search performed
- `ACTIVITY` - Generic activity

**Job Data**: `AnalyticsJob`
```typescript
{
  type: 'ASSET_VIEW' | 'ASSET_DOWNLOAD' | 'ASSET_SHARE' | 'SEARCH' | 'ACTIVITY';
  assetId?: string;
  userId?: string;
  data: Record<string, any>;
  timestamp: Date;
}
```

### 7. Cleanup

Scheduled maintenance tasks:

**Cleanup Types**:
- `EXPIRED_LINKS` - Deactivate expired share links (daily at 2 AM)
- `OLD_VARIANTS` - Remove variants for deleted assets
- `TEMP_FILES` - Remove pending uploads older than 24 hours (hourly)
- `OLD_ANALYTICS` - Delete analytics older than 1 year (monthly)

**Job Data**: `CleanupJob`
```typescript
{
  type: 'EXPIRED_LINKS' | 'OLD_VARIANTS' | 'TEMP_FILES' | 'OLD_ANALYTICS';
  data?: Record<string, any>;
}
```

## Error Handling

### Automatic Retries

All jobs are configured with automatic retries:

- **Max Attempts**: 3
- **Backoff Strategy**: Exponential (2s, 4s, 8s)
- **Job Retention**:
  - Last 100 completed jobs
  - Last 500 failed jobs

### Error Events

The worker system emits events for monitoring:

- `error` - Queue-level error
- `failed` - Job failed after all retries
- `stalled` - Job stalled (processing took too long)
- `completed` - Job completed successfully
- `active` - Job started processing
- `waiting` - Job queued for processing
- `removed` - Job removed from queue

### Logging

All jobs log their lifecycle:
- ✅ Completed
- ❌ Failed
- ⚠️ Stalled
- 🔄 Active
- ⏳ Waiting

## Health Monitoring

### Health Check

The worker logs queue health every 5 minutes:

```
📊 Queue Health Check:
┌──────────────────────┬─────────┬────────┬───────────┬────────┬─────────┐
│        (index)       │ waiting │ active │ completed │ failed │ delayed │
├──────────────────────┼─────────┼────────┼───────────┼────────┼─────────┤
│ Asset Processing     │    12   │   2    │   1523    │   5    │    0    │
│ Thumbnail            │     3   │   4    │   2841    │   2    │    0    │
│ Email                │     0   │   2    │   1234    │   1    │    0    │
└──────────────────────┴─────────┴────────┴───────────┴────────┴─────────┘
```

### Metrics

Monitor these metrics:
- Queue depth (waiting jobs)
- Processing rate (completed/minute)
- Error rate (failed/total)
- Stall rate (stalled/total)
- Average processing time

## Graceful Shutdown

The worker handles shutdown signals gracefully:

```bash
# SIGTERM or SIGINT
kill <worker-pid>
```

Shutdown process:
1. Stop accepting new jobs
2. Wait for active jobs to complete
3. Close database connections
4. Exit cleanly

## Deployment

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

CMD ["npm", "run", "worker"]
```

### Docker Compose

```yaml
services:
  worker:
    build: .
    command: npm run worker
    environment:
      - REDIS_HOST=redis
      - DATABASE_URL=postgresql://user:pass@postgres:5432/kayanlive
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    depends_on:
      - redis
      - postgres
    restart: always
```

### Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start worker
pm2 start npm --name "kayanlive-worker" -- run worker

# Monitor
pm2 monit

# Logs
pm2 logs kayanlive-worker

# Restart
pm2 restart kayanlive-worker

# Stop
pm2 stop kayanlive-worker
```

## Development

### Adding a New Queue

1. Define job type in `/src/lib/queue.ts`:
```typescript
export interface MyJobType {
  data: string;
}

export const myQueue = new Queue<MyJobType>('my-queue', QUEUE_OPTIONS);

export const queueMyJob = async (job: MyJobType): Promise<void> => {
  await myQueue.add(job);
};
```

2. Implement processor in `/src/workers/processors.ts`:
```typescript
export const processMyJob = async (job: Job<MyJobType>): Promise<void> => {
  const { data } = job.data;
  // Process job
};
```

3. Register processor in `/src/workers/index.ts`:
```typescript
myQueue.process(CONCURRENCY.myQueue, async (job) => {
  await processMyJob(job);
});
```

### Testing

Test individual processors:

```typescript
import { processEmail } from './processors';

const mockJob = {
  data: {
    to: 'test@example.com',
    subject: 'Test',
    template: 'welcome',
    data: { userName: 'John' },
  },
};

await processEmail(mockJob as any);
```

## Troubleshooting

### Worker not processing jobs

1. Check Redis connection:
```bash
redis-cli -h $REDIS_HOST -p $REDIS_PORT ping
```

2. Check queue stats:
```typescript
import { getAllQueueStats } from '@/lib/queue';
const stats = await getAllQueueStats();
console.log(stats);
```

3. Check for stalled jobs:
```bash
# In Redis CLI
KEYS bull:*:stalled
```

### High memory usage

- Reduce concurrency settings
- Implement job result pruning
- Monitor asset processing jobs (they load files into memory)

### Email failures

- Verify AWS SES configuration
- Check email addresses are verified (sandbox mode)
- Review SES sending limits
- Check email template rendering

### S3 failures

- Verify AWS credentials and permissions
- Check S3 bucket exists and is accessible
- Review file size limits
- Monitor S3 storage quotas

## Resources

- [Bull Documentation](https://github.com/OptimalBits/bull)
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [Redis Documentation](https://redis.io/documentation)
