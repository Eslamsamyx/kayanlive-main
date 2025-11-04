import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

export const favoriteRouter = createTRPCRouter({
  // Toggle favorite status for an asset
  toggle: protectedProcedure
    .input(
      z.object({
        assetId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { assetId } = input;
      const userId = ctx.session.user.id;

      // Check if already favorited
      const existing = await ctx.prisma.assetFavorite.findUnique({
        where: {
          userId_assetId: {
            userId,
            assetId,
          },
        },
      });

      if (existing) {
        // Remove favorite
        await ctx.prisma.assetFavorite.delete({
          where: {
            userId_assetId: {
              userId,
              assetId,
            },
          },
        });
        return { favorited: false };
      } else {
        // Add favorite
        await ctx.prisma.assetFavorite.create({
          data: {
            userId,
            assetId,
          },
        });
        return { favorited: true };
      }
    }),

  // Get all favorites for the current user
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;
      const userId = ctx.session.user.id;

      const favorites = await ctx.prisma.assetFavorite.findMany({
        where: {
          userId,
        },
        take: limit + 1,
        cursor: cursor ? { userId_assetId: { userId, assetId: cursor } } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          asset: {
            include: {
              uploader: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (favorites.length > limit) {
        const nextItem = favorites.pop();
        nextCursor = nextItem?.assetId;
      }

      return {
        favorites,
        nextCursor,
      };
    }),

  // Check if an asset is favorited
  check: protectedProcedure
    .input(
      z.object({
        assetId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { assetId } = input;
      const userId = ctx.session.user.id;

      const favorite = await ctx.prisma.assetFavorite.findUnique({
        where: {
          userId_assetId: {
            userId,
            assetId,
          },
        },
      });

      return { isFavorited: !!favorite };
    }),

  // Get favorite count for an asset
  count: protectedProcedure
    .input(
      z.object({
        assetId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { assetId } = input;

      const count = await ctx.prisma.assetFavorite.count({
        where: {
          assetId,
        },
      });

      return { count };
    }),

  // Get user's favorite IDs (for bulk checking)
  userFavoriteIds: protectedProcedure
    .input(
      z.object({
        assetIds: z.array(z.string()),
      })
    )
    .query(async ({ ctx, input }) => {
      const { assetIds } = input;
      const userId = ctx.session.user.id;

      const favorites = await ctx.prisma.assetFavorite.findMany({
        where: {
          userId,
          assetId: {
            in: assetIds,
          },
        },
        select: {
          assetId: true,
        },
      });

      return favorites.map((f) => f.assetId);
    }),
});
