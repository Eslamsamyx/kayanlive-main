import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { startOfDay, subDays, format } from "date-fns";

export const analyticsRouter = createTRPCRouter({
  // Overview statistics (ADMIN only - system-wide data)
  overview: adminProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    // Total assets
    const totalAssets = await ctx.prisma.asset.count();

    // Total storage usage
    const storageResult = await ctx.prisma.asset.aggregate({
      _sum: {
        fileSize: true,
      },
    });
    const totalStorage = Number(storageResult._sum.fileSize ?? 0);

    // Total views and downloads from analytics
    const analyticsResult = await ctx.prisma.assetAnalytics.aggregate({
      _sum: {
        views: true,
        downloads: true,
      },
    });
    const totalViews = analyticsResult._sum.views ?? 0;
    const totalDownloads = analyticsResult._sum.downloads ?? 0;

    // Recent uploads (last 30 days)
    const recentUploads = await ctx.prisma.asset.count({
      where: {
        uploadedAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Active users (users with activity in last 30 days)
    const activeUsers = await ctx.prisma.assetActivity.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      distinct: ['userId'],
      select: {
        userId: true,
      },
    });

    return {
      totalAssets,
      totalStorage,
      totalViews,
      totalDownloads,
      recentUploads,
      activeUsersCount: activeUsers.length,
    };
  }),

  // Trends over time (ADMIN only)
  trends: adminProcedure
    .input(
      z.object({
        days: z.number().min(1).max(365).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const startDate = startOfDay(subDays(now, input.days));

      // Get analytics data grouped by date
      const analyticsData = await ctx.prisma.assetAnalytics.groupBy({
        by: ['date'],
        where: {
          date: {
            gte: startDate,
          },
        },
        _sum: {
          views: true,
          downloads: true,
        },
        orderBy: {
          date: 'asc',
        },
      });

      // Get uploads grouped by date
      const uploadsData = await ctx.prisma.asset.groupBy({
        by: ['uploadedAt'],
        where: {
          uploadedAt: {
            gte: startDate,
          },
        },
        _count: {
          id: true,
        },
      });

      // Create a map for uploads by date
      const uploadsMap = new Map<string, number>();
      uploadsData.forEach((item) => {
        const dateKey = format(startOfDay(item.uploadedAt), 'yyyy-MM-dd');
        uploadsMap.set(dateKey, item._count.id);
      });

      // Combine data
      const trends = analyticsData.map((item) => {
        const dateKey = format(item.date, 'yyyy-MM-dd');
        return {
          date: dateKey,
          views: item._sum.views ?? 0,
          downloads: item._sum.downloads ?? 0,
          uploads: uploadsMap.get(dateKey) ?? 0,
        };
      });

      return trends;
    }),

  // File types distribution (ADMIN only)
  fileTypes: adminProcedure.query(async ({ ctx }) => {
    const distribution = await ctx.prisma.asset.groupBy({
      by: ['type'],
      _count: {
        id: true,
      },
      _sum: {
        fileSize: true,
      },
    });

    return distribution.map((item) => ({
      type: item.type,
      count: item._count.id,
      totalSize: Number(item._sum.fileSize ?? 0),
    }));
  }),

  // Top content (most viewed/downloaded) (ADMIN only)
  topContent: adminProcedure
    .input(
      z.object({
        metric: z.enum(['views', 'downloads']).default('views'),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const assets = await ctx.prisma.asset.findMany({
        take: input.limit,
        orderBy: {
          [input.metric === 'views' ? 'viewCount' : 'downloadCount']: 'desc',
        },
        where: {
          OR: [
            { viewCount: { gt: 0 } },
            { downloadCount: { gt: 0 } },
          ],
        },
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
      });

      return assets;
    }),

  // Asset-specific analytics (ADMIN only)
  assetAnalytics: adminProcedure
    .input(
      z.object({
        assetId: z.string(),
        days: z.number().min(1).max(365).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const startDate = startOfDay(subDays(new Date(), input.days));

      const analytics = await ctx.prisma.assetAnalytics.findMany({
        where: {
          assetId: input.assetId,
          date: {
            gte: startDate,
          },
        },
        orderBy: {
          date: 'asc',
        },
      });

      return analytics.map((item) => ({
        date: format(item.date, 'yyyy-MM-dd'),
        views: item.views,
        downloads: item.downloads,
      }));
    }),

  // Record a view (ADMIN only)
  recordView: adminProcedure
    .input(
      z.object({
        assetId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const today = startOfDay(new Date());

      // Update or create daily analytics
      await ctx.prisma.assetAnalytics.upsert({
        where: {
          assetId_date: {
            assetId: input.assetId,
            date: today,
          },
        },
        create: {
          assetId: input.assetId,
          date: today,
          views: 1,
          downloads: 0,
        },
        update: {
          views: {
            increment: 1,
          },
        },
      });

      // Update cumulative count on Asset
      await ctx.prisma.asset.update({
        where: { id: input.assetId },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      });

      // Record activity
      await ctx.prisma.assetActivity.create({
        data: {
          type: 'ASSET_VIEWED',
          description: 'Asset viewed',
          userId: ctx.session.user.id,
          assetId: input.assetId,
        },
      });

      return { success: true };
    }),

  // Record a download (ADMIN only)
  recordDownload: adminProcedure
    .input(
      z.object({
        assetId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const today = startOfDay(new Date());

      // Update or create daily analytics
      await ctx.prisma.assetAnalytics.upsert({
        where: {
          assetId_date: {
            assetId: input.assetId,
            date: today,
          },
        },
        create: {
          assetId: input.assetId,
          date: today,
          views: 0,
          downloads: 1,
        },
        update: {
          downloads: {
            increment: 1,
          },
        },
      });

      // Update cumulative count on Asset
      await ctx.prisma.asset.update({
        where: { id: input.assetId },
        data: {
          downloadCount: {
            increment: 1,
          },
        },
      });

      // Record activity
      await ctx.prisma.assetActivity.create({
        data: {
          type: 'ASSET_DOWNLOADED',
          description: 'Asset downloaded',
          userId: ctx.session.user.id,
          assetId: input.assetId,
        },
      });

      return { success: true };
    }),

  // Recent activity (ADMIN only)
  recentActivity: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const activities = await ctx.prisma.assetActivity.findMany({
        take: input.limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          asset: {
            select: {
              id: true,
              name: true,
              fileName: true,
              type: true,
            },
          },
        },
      });

      return activities;
    }),
});
