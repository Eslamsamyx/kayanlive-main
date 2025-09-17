import { createTRPCRouter } from '@/server/api/trpc';
import { postRouter } from '@/server/api/routers/post';
import { leadRouter } from '@/server/api/routers/lead';
import { userRouter } from '@/server/api/routers/user';

export const appRouter = createTRPCRouter({
  post: postRouter,
  lead: leadRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;