import { z } from 'zod';
import {
  createTRPCRouter,
  protectedProcedure,
} from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';

export const collectionRouter = createTRPCRouter({
  /**
   * Get all collections (admin view)
   */
  listAll: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        isPublic: z.boolean().optional(),
        isPinned: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input?.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { description: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      if (input?.isPublic !== undefined) {
        where.isPublic = input.isPublic;
      }

      if (input?.isPinned !== undefined) {
        where.isPinned = input.isPinned;
      }

      const collections = await ctx.prisma.collection.findMany({
        where,
        orderBy: [
          { isPinned: 'desc' },
          { sortOrder: 'asc' },
          { createdAt: 'desc' },
        ],
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              assets: true,
            },
          },
        },
      });

      return {
        collections,
        total: collections.length,
      };
    }),

  /**
   * Get collection stats (admin view)
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const [total, publicCount, pinnedCount] = await Promise.all([
      ctx.prisma.collection.count(),
      ctx.prisma.collection.count({ where: { isPublic: true } }),
      ctx.prisma.collection.count({ where: { isPinned: true } }),
    ]);

    return {
      total,
      public: publicCount,
      pinned: pinnedCount,
      private: total - publicCount,
    };
  }),

  /**
   * Create a new collection
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        coverImage: z.string().optional(),
        isPublic: z.boolean().default(false),
        isPinned: z.boolean().default(false),
        assetIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const collection = await ctx.prisma.collection.create({
        data: {
          name: input.name,
          description: input.description,
          coverImage: input.coverImage,
          isPublic: input.isPublic,
          isPinned: input.isPinned,
          createdById: userId,
          ...(input.assetIds && input.assetIds.length > 0 && {
            assets: {
              create: input.assetIds.map((assetId, index) => ({
                assetId,
                position: index,
                addedBy: userId,
              })),
            },
          }),
        },
      });

      // Log activity for each asset added
      if (input.assetIds && input.assetIds.length > 0) {
        await ctx.prisma.assetActivity.create({
          data: {
            type: 'COLLECTION_CREATED',
            description: `Created collection "${input.name}" with ${input.assetIds.length} assets`,
            userId,
            collectionId: collection.id,
          },
        });
      }

      return { collection };
    }),

  /**
   * Get all collections for current user
   */
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        isPublic: z.boolean().optional(),
        isPinned: z.boolean().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const skip = (input.page - 1) * input.limit;

      const where: any = {
        createdById: userId,
      };

      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { description: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      if (input.isPublic !== undefined) {
        where.isPublic = input.isPublic;
      }

      if (input.isPinned !== undefined) {
        where.isPinned = input.isPinned;
      }

      const [collections, total] = await Promise.all([
        ctx.prisma.collection.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: [
            { isPinned: 'desc' },
            { sortOrder: 'asc' },
            { createdAt: 'desc' },
          ],
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                assets: true,
              },
            },
          },
        }),
        ctx.prisma.collection.count({ where }),
      ]);

      return {
        collections,
        pagination: {
          total,
          pages: Math.ceil(total / input.limit),
          currentPage: input.page,
          perPage: input.limit,
        },
      };
    }),

  /**
   * Get collection by ID with assets
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const collection = await ctx.prisma.collection.findUnique({
        where: { id: input.id },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assets: {
            include: {
              asset: {
                include: {
                  uploader: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                  tagRelations: {
                    include: {
                      tag: true,
                    },
                  },
                  variants: {
                    where: {
                      variantType: 'THUMBNAIL',
                    },
                    take: 1,
                  },
                },
              },
            },
            orderBy: { position: 'asc' },
          },
        },
      });

      if (!collection) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Collection not found',
        });
      }

      return {
        ...collection,
        assets: collection.assets.map((ac) => ({
          ...ac.asset,
          position: ac.position,
          addedAt: ac.addedAt,
        })),
      };
    }),

  /**
   * Update collection
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        coverImage: z.string().optional(),
        isPublic: z.boolean().optional(),
        isPinned: z.boolean().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const userId = ctx.session.user.id;

      // Check ownership
      const collection = await ctx.prisma.collection.findUnique({
        where: { id },
      });

      if (!collection) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Collection not found',
        });
      }

      if (collection.createdById !== userId && ctx.session.user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this collection',
        });
      }

      const updatedCollection = await ctx.prisma.collection.update({
        where: { id },
        data,
      });

      return { collection: updatedCollection };
    }),

  /**
   * Delete collection
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check ownership
      const collection = await ctx.prisma.collection.findUnique({
        where: { id: input.id },
      });

      if (!collection) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Collection not found',
        });
      }

      if (collection.createdById !== userId && ctx.session.user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this collection',
        });
      }

      await ctx.prisma.collection.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Add asset to collection
   */
  addAsset: protectedProcedure
    .input(
      z.object({
        collectionId: z.string(),
        assetId: z.string(),
        position: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check ownership
      const collection = await ctx.prisma.collection.findUnique({
        where: { id: input.collectionId },
      });

      if (!collection) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Collection not found',
        });
      }

      if (collection.createdById !== userId && ctx.session.user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to modify this collection',
        });
      }

      // Check if already exists
      const existing = await ctx.prisma.assetCollection.findUnique({
        where: {
          collectionId_assetId: {
            collectionId: input.collectionId,
            assetId: input.assetId,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Asset is already in this collection',
        });
      }

      // Get next position if not provided
      const position =
        input.position !== undefined
          ? input.position
          : await ctx.prisma.assetCollection
              .count({
                where: { collectionId: input.collectionId },
              })
              .then((count) => count);

      await ctx.prisma.assetCollection.create({
        data: {
          collectionId: input.collectionId,
          assetId: input.assetId,
          position,
          addedBy: userId,
        },
      });

      // Log activity
      await ctx.prisma.assetActivity.create({
        data: {
          type: 'ASSET_ADDED_TO_COLLECTION',
          description: `Added asset to collection: ${collection.name}`,
          userId,
          assetId: input.assetId,
          collectionId: input.collectionId,
        },
      });

      return { success: true };
    }),

  /**
   * Remove asset from collection
   */
  removeAsset: protectedProcedure
    .input(
      z.object({
        collectionId: z.string(),
        assetId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check ownership
      const collection = await ctx.prisma.collection.findUnique({
        where: { id: input.collectionId },
      });

      if (!collection) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Collection not found',
        });
      }

      if (collection.createdById !== userId && ctx.session.user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to modify this collection',
        });
      }

      await ctx.prisma.assetCollection.delete({
        where: {
          collectionId_assetId: {
            collectionId: input.collectionId,
            assetId: input.assetId,
          },
        },
      });

      // Log activity
      await ctx.prisma.assetActivity.create({
        data: {
          type: 'ASSET_REMOVED_FROM_COLLECTION',
          description: `Removed asset from collection: ${collection.name}`,
          userId,
          assetId: input.assetId,
          collectionId: input.collectionId,
        },
      });

      return { success: true };
    }),

  /**
   * Reorder assets in collection
   */
  reorderAssets: protectedProcedure
    .input(
      z.object({
        collectionId: z.string(),
        assetPositions: z.array(
          z.object({
            assetId: z.string(),
            position: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check ownership
      const collection = await ctx.prisma.collection.findUnique({
        where: { id: input.collectionId },
      });

      if (!collection) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Collection not found',
        });
      }

      if (collection.createdById !== userId && ctx.session.user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to modify this collection',
        });
      }

      // Update positions
      await Promise.all(
        input.assetPositions.map((ap) =>
          ctx.prisma.assetCollection.update({
            where: {
              collectionId_assetId: {
                collectionId: input.collectionId,
                assetId: ap.assetId,
              },
            },
            data: {
              position: ap.position,
            },
          })
        )
      );

      return { success: true };
    }),

  /**
   * Batch add assets to collection
   */
  batchAddAssets: protectedProcedure
    .input(
      z.object({
        collectionId: z.string(),
        assetIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check ownership
      const collection = await ctx.prisma.collection.findUnique({
        where: { id: input.collectionId },
      });

      if (!collection) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Collection not found',
        });
      }

      if (collection.createdById !== userId && ctx.session.user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to modify this collection',
        });
      }

      // Get current max position
      const maxPosition = await ctx.prisma.assetCollection
        .findMany({
          where: { collectionId: input.collectionId },
          select: { position: true },
          orderBy: { position: 'desc' },
          take: 1,
        })
        .then((result) => (result[0]?.position ?? -1));

      // Add assets with sequential positions
      await Promise.all(
        input.assetIds.map((assetId, index) =>
          ctx.prisma.assetCollection.create({
            data: {
              collectionId: input.collectionId,
              assetId,
              position: maxPosition + index + 1,
              addedBy: userId,
            },
          })
        )
      );

      // Log activity
      await ctx.prisma.assetActivity.create({
        data: {
          type: 'COLLECTION_UPDATED',
          description: `Added ${input.assetIds.length} assets to collection: ${collection.name}`,
          userId,
          collectionId: input.collectionId,
        },
      });

      return { success: true, addedCount: input.assetIds.length };
    }),

  /**
   * Get public collections (for sharing)
   */
  getPublicCollections: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      const [collections, total] = await Promise.all([
        ctx.prisma.collection.findMany({
          where: { isPublic: true },
          skip,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                assets: true,
              },
            },
          },
        }),
        ctx.prisma.collection.count({ where: { isPublic: true } }),
      ]);

      return {
        collections,
        pagination: {
          total,
          pages: Math.ceil(total / input.limit),
          currentPage: input.page,
          perPage: input.limit,
        },
      };
    }),
});
