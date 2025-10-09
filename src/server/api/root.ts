import { createTRPCRouter } from '@/server/api/trpc';
import { postRouter } from '@/server/api/routers/post';
import { leadRouter } from '@/server/api/routers/lead';
import { userRouter } from '@/server/api/routers/user';
import { articleRouter } from '@/server/api/routers/article';
import { questionnaireRouter } from '@/server/api/routers/questionnaire';

export const appRouter = createTRPCRouter({
  post: postRouter,
  lead: leadRouter,
  user: userRouter,
  article: articleRouter,
  questionnaire: questionnaireRouter,
});

export type AppRouter = typeof appRouter;