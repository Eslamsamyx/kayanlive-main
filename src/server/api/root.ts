import { createTRPCRouter } from '@/server/api/trpc';
import { postRouter } from '@/server/api/routers/post';
import { leadRouter } from '@/server/api/routers/lead';
import { userRouter } from '@/server/api/routers/user';
import { articleRouter } from '@/server/api/routers/article';
import { questionnaireRouter } from '@/server/api/routers/questionnaire';
import { companyRouter } from '@/server/api/routers/company';
import { projectRouter } from '@/server/api/routers/project';
import { assetRouter } from '@/server/api/routers/asset';
import { taskRouter } from '@/server/api/routers/task';
import { milestoneRouter } from '@/server/api/routers/milestone';
import { notificationRouter } from '@/server/api/routers/notification';
import { meetingRouter } from '@/server/api/routers/meeting';
import { presentationRouter } from '@/server/api/routers/presentation';
import { downloadRequestRouter } from '@/server/api/routers/download-request';

// DAM System Routers
import { collectionRouter } from '@/server/api/routers/collection';
import { assetShareRouter } from '@/server/api/routers/asset-share';

// Exhibition System Routers
import { exhibitionRouter } from '@/server/api/routers/exhibition';

// Client Portal Routers
import { clientUploadRouter } from '@/server/api/routers/client-upload';
import { commentRouter } from '@/server/api/routers/comment';
import { favoriteRouter } from '@/server/api/routers/favorite';

// Admin & Permission System
import { adminRouter } from '@/server/api/routers/admin';
import { invitationRouter } from '@/server/api/routers/invitation';

// Analytics
import { analyticsRouter } from '@/server/api/routers/analytics';

// Search
import { searchRouter } from '@/server/api/routers/search';

// Audit & Activity
import { auditRouter } from '@/server/api/routers/audit';

export const appRouter = createTRPCRouter({
  // Core
  post: postRouter,
  lead: leadRouter,
  user: userRouter,
  article: articleRouter,
  questionnaire: questionnaireRouter,

  // Company & Projects
  company: companyRouter,
  project: projectRouter,

  // Task Management
  task: taskRouter,
  milestone: milestoneRouter,
  notification: notificationRouter,
  meeting: meetingRouter,
  presentation: presentationRouter,
  downloadRequest: downloadRequestRouter,

  // Digital Asset Management (DAM)
  asset: assetRouter,
  collection: collectionRouter,
  assetShare: assetShareRouter,

  // Exhibition & Lead Management
  exhibition: exhibitionRouter,

  // Client Portal
  clientUpload: clientUploadRouter,
  comment: commentRouter,
  favorite: favoriteRouter,

  // Admin & Permission System
  admin: adminRouter,
  invitation: invitationRouter,

  // Analytics
  analytics: analyticsRouter,

  // Search
  search: searchRouter,

  // Audit & Activity
  audit: auditRouter,
});

export type AppRouter = typeof appRouter;