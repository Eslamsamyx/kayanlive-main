import { createTRPCRouter } from '@/server/api/trpc';
import { postRouter } from '@/server/api/routers/post';
import { leadRouter } from '@/server/api/routers/lead';
import { userRouter } from '@/server/api/routers/user';
import { articleRouter } from '@/server/api/routers/article';

export const appRouter = createTRPCRouter({
  post: postRouter,
  lead: leadRouter,
  user: userRouter,
  article: articleRouter,
});

export type AppRouter = typeof appRouter;