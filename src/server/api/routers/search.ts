import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const searchRouter = createTRPCRouter({
  /**
   * Get user's search history
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const history = await ctx.prisma.searchHistory.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: input.limit,
        select: {
          id: true,
          query: true,
          resultCount: true,
          createdAt: true,
        },
      });

      return history;
    }),

  /**
   * Get popular search queries (for suggestions)
   */
  getPopularSearches: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get most frequent searches across all users
      const popularSearches = await ctx.prisma.searchHistory.groupBy({
        by: ['query'],
        _count: {
          query: true,
        },
        where: {
          query: {
            not: '',
          },
        },
        orderBy: {
          _count: {
            query: 'desc',
          },
        },
        take: input.limit,
      });

      return popularSearches.map((item) => ({
        query: item.query,
        count: item._count.query,
      }));
    }),

  /**
   * Get search suggestions based on query prefix
   */
  getSuggestions: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(10).default(5),
      })
    )
    .query(async ({ ctx, input }) => {
      if (input.query.length < 2) {
        return { assetNames: [], recentSearches: [] };
      }

      // Get matching asset names
      const assets = await ctx.prisma.asset.findMany({
        where: {
          OR: [
            {
              name: {
                contains: input.query,
                mode: 'insensitive',
              },
            },
            {
              title: {
                contains: input.query,
                mode: 'insensitive',
              },
            },
          ],
        },
        select: {
          name: true,
          title: true,
        },
        take: input.limit,
        distinct: ['name'],
      });

      // Get matching recent searches from user
      const recentSearches = await ctx.prisma.searchHistory.findMany({
        where: {
          userId: ctx.session.user.id,
          query: {
            contains: input.query,
            mode: 'insensitive',
          },
        },
        select: {
          query: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 3,
        distinct: ['query'],
      });

      return {
        assetNames: assets.map((a) => a.name || a.title || '').filter(Boolean),
        recentSearches: recentSearches.map((s) => s.query),
      };
    }),

  /**
   * Clear search history
   */
  clearHistory: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.searchHistory.deleteMany({
      where: {
        userId: ctx.session.user.id,
      },
    });

    return { success: true };
  }),

  /**
   * Delete specific search from history
   */
  deleteHistoryItem: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.searchHistory.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id, // Ensure user owns this search
        },
      });

      return { success: true };
    }),

  /**
   * Get trending searches (recent + popular combined)
   */
  getTrending: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Get searches from last 24 hours
      const trendingSearches = await ctx.prisma.searchHistory.groupBy({
        by: ['query'],
        where: {
          createdAt: {
            gte: oneDayAgo,
          },
          query: {
            not: '',
          },
        },
        _count: {
          query: true,
        },
        orderBy: {
          _count: {
            query: 'desc',
          },
        },
        take: input.limit,
      });

      return trendingSearches.map((item) => ({
        query: item.query,
        count: item._count.query,
      }));
    }),
});
