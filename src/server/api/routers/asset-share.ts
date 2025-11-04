import { z } from 'zod';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { nanoid } from 'nanoid';
import { hash, compare } from 'bcryptjs';
import { getPresignedUrl } from '@/lib/s3';

// Helper function to extract IP address from headers
function getClientIp(headers: Headers): string {
  // Try various headers that may contain the client IP
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can be comma-separated, take the first one (client IP)
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    if (ips[0]) return ips[0];
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp;

  const cfConnectingIp = headers.get('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIp) return cfConnectingIp;

  const trueClientIp = headers.get('true-client-ip'); // Akamai
  if (trueClientIp) return trueClientIp;

  return 'Unknown';
}

export const assetShareRouter = createTRPCRouter({
  /**
   * List all share links (admin view) with advanced filtering, sorting, and pagination
   */
  listAll: protectedProcedure
    .input(
      z.object({
        isActive: z.boolean().optional(),
        search: z.string().optional(),
        hasPassword: z.boolean().optional(),
        expiryStatus: z.enum(['ALL', 'EXPIRED', 'EXPIRING_SOON', 'NEVER']).optional(),
        createdFrom: z.date().optional(),
        createdTo: z.date().optional(),
        sortBy: z.enum(['createdAt', 'expiresAt', 'viewCount', 'downloadCount', 'assetName']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(5).max(100).default(25),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};
      const page = input?.page || 1;
      const pageSize = input?.pageSize || 25;
      const skip = (page - 1) * pageSize;

      // Active/Inactive filter
      if (input?.isActive !== undefined) {
        where.isActive = input.isActive;
      }

      // Search filter (asset name or creator name/email)
      if (input?.search) {
        where.OR = [
          {
            asset: {
              name: {
                contains: input.search,
                mode: 'insensitive',
              },
            },
          },
          {
            createdBy: {
              OR: [
                {
                  name: {
                    contains: input.search,
                    mode: 'insensitive',
                  },
                },
                {
                  email: {
                    contains: input.search,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          },
        ];
      }

      // Password filter
      if (input?.hasPassword !== undefined) {
        where.hasPassword = input.hasPassword;
      }

      // Expiry status filter
      if (input?.expiryStatus && input.expiryStatus !== 'ALL') {
        const now = new Date();
        const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        if (input.expiryStatus === 'EXPIRED') {
          where.expiresAt = {
            lt: now,
            not: null,
          };
        } else if (input.expiryStatus === 'EXPIRING_SOON') {
          where.expiresAt = {
            gte: now,
            lte: in24Hours,
          };
        } else if (input.expiryStatus === 'NEVER') {
          where.expiresAt = null;
        }
      }

      // Date range filter
      if (input?.createdFrom || input?.createdTo) {
        where.createdAt = {};
        if (input.createdFrom) {
          where.createdAt.gte = input.createdFrom;
        }
        if (input.createdTo) {
          where.createdAt.lte = input.createdTo;
        }
      }

      // Sorting
      let orderBy: any = { createdAt: 'desc' }; // Default sort
      if (input?.sortBy) {
        const sortOrder = input.sortOrder || 'desc';
        if (input.sortBy === 'assetName') {
          orderBy = { asset: { name: sortOrder } };
        } else {
          orderBy = { [input.sortBy]: sortOrder };
        }
      }

      // Get total count for pagination
      const totalCount = await ctx.prisma.assetShareLink.count({ where });

      // Get paginated results
      const shareLinks = await ctx.prisma.assetShareLink.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          asset: {
            select: {
              id: true,
              name: true,
              type: true,
              fileName: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return {
        shareLinks: shareLinks.map((sl) => ({
          ...sl,
          url: `${process.env.NEXTAUTH_URL}/share/${sl.token}`,
          hasPassword: !!sl.password,
        })),
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
          hasMore: page * pageSize < totalCount,
        },
      };
    }),

  /**
   * Create a share link for an asset
   */
  create: protectedProcedure
    .input(
      z.object({
        assetId: z.string(),
        password: z.string().optional(),
        expiresAt: z.date().optional(),
        maxDownloads: z.number().optional(),
        allowDownload: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify user has access to asset
      const asset = await ctx.prisma.asset.findUnique({
        where: { id: input.assetId },
      });

      if (!asset) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Asset not found',
        });
      }

      // Prevent sharing assets without files
      if (!asset.fileKey) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot create share link: Asset file has not been uploaded',
        });
      }

      // Hash password if provided
      const hashedPassword = input.password
        ? await hash(input.password, 10)
        : null;

      // Generate unique token
      const token = nanoid(32);

      const shareLink = await ctx.prisma.assetShareLink.create({
        data: {
          token,
          assetId: input.assetId,
          createdById: userId,
          password: hashedPassword,
          expiresAt: input.expiresAt,
          maxDownloads: input.maxDownloads,
          allowDownload: input.allowDownload,
          isActive: true,
        },
      });

      // Log activity
      await ctx.prisma.assetActivity.create({
        data: {
          type: 'ASSET_SHARED',
          description: 'Created share link for asset',
          userId,
          assetId: input.assetId,
          metadata: {
            shareLinkId: shareLink.id,
            hasPassword: !!input.password,
            expiresAt: input.expiresAt?.toISOString(),
          },
        },
      });

      return {
        shareLink: {
          ...shareLink,
          url: `${process.env.NEXTAUTH_URL}/share/${token}`,
        },
      };
    }),

  /**
   * Get all share links for an asset
   */
  listByAsset: protectedProcedure
    .input(z.object({ assetId: z.string() }))
    .query(async ({ ctx, input }) => {
      const shareLinks = await ctx.prisma.assetShareLink.findMany({
        where: { assetId: input.assetId },
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return {
        shareLinks: shareLinks.map((sl) => ({
          ...sl,
          url: `${process.env.NEXTAUTH_URL}/share/${sl.token}`,
          hasPassword: !!sl.password,
        })),
      };
    }),

  /**
   * Get share link details (public endpoint)
   */
  getByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const shareLink = await ctx.prisma.assetShareLink.findUnique({
        where: { token: input.token },
        include: {
          asset: {
            select: {
              id: true,
              name: true,
              title: true,
              description: true,
              type: true,
              mimeType: true,
              fileName: true,
              fileSize: true,
              width: true,
              height: true,
              duration: true,
              thumbnailKey: true,
              previewKey: true,
              fileKey: true,
              createdAt: true,
              uploader: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!shareLink) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Share link not found',
        });
      }

      // Check if link is active
      if (!shareLink.isActive) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This share link has been deactivated',
        });
      }

      // Check if expired
      if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This share link has expired',
        });
      }

      // Check download limit
      if (
        shareLink.maxDownloads &&
        shareLink.currentDownloads >= shareLink.maxDownloads
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Download limit reached for this share link',
        });
      }

      // Log view access
      const clientIp = getClientIp(ctx.headers);
      await ctx.prisma.shareLinkAccess.create({
        data: {
          shareLinkId: shareLink.id,
          accessType: 'VIEW',
          ipAddress: clientIp,
          userAgent: ctx.headers.get('user-agent') || null,
          referrer: ctx.headers.get('referer') || null,
        },
      });

      // Update share link view count and last accessed
      await ctx.prisma.assetShareLink.update({
        where: { id: shareLink.id },
        data: {
          viewCount: { increment: 1 },
          lastAccessedAt: new Date(),
        },
      });

      // Generate preview URLs based on asset type
      let previewUrl: string | null = null;
      let thumbnailUrl: string | null = null;

      // Determine the best preview source based on asset type
      let previewKey: string | null = null;

      switch (shareLink.asset.type) {
        case 'IMAGE':
          // For images, prefer previewKey (optimized) or fall back to original file
          previewKey = shareLink.asset.previewKey || shareLink.asset.fileKey;
          break;
        case 'VIDEO':
          // For videos, prefer previewKey (transcoded) over original
          previewKey = shareLink.asset.previewKey || shareLink.asset.fileKey;
          break;
        case 'AUDIO':
          // For audio, use the actual file (no visual preview needed)
          previewKey = shareLink.asset.fileKey;
          break;
        case 'DOCUMENT':
          // For documents, ALWAYS use the actual file for preview (especially PDFs)
          // PDFs and other documents can be previewed inline
          previewKey = shareLink.asset.fileKey;
          break;
        case 'MODEL_3D':
        case 'DESIGN':
          // For 3D models and designs, use fileKey for download, thumbnail for preview
          previewKey = shareLink.asset.thumbnailKey || shareLink.asset.fileKey;
          break;
        default:
          // Fallback: try file first, then preview, then thumbnail
          previewKey = shareLink.asset.fileKey || shareLink.asset.previewKey || shareLink.asset.thumbnailKey;
      }

      // Generate preview URL if we have a key (public access for share links)
      if (previewKey) {
        try {
          previewUrl = await getPresignedUrl({
            fileKey: previewKey,
            expiresIn: 3600,
            publicAccess: true, // Allow unauthenticated access via share link
          });

          // Log successful URL generation
          console.log(`[SHARE] Generated preview URL for asset ${shareLink.asset.id}, type: ${shareLink.asset.type}, key: ${previewKey}`);
        } catch (error) {
          console.error(`[SHARE] Failed to generate preview URL for asset ${shareLink.asset.id}:`, error);
          previewUrl = null;
        }
      } else {
        console.warn(`[SHARE] No preview key available for asset ${shareLink.asset.id}, type: ${shareLink.asset.type}`);
      }

      // Always generate thumbnail URL if available (for fallback display)
      if (shareLink.asset.thumbnailKey) {
        try {
          thumbnailUrl = await getPresignedUrl({
            fileKey: shareLink.asset.thumbnailKey,
            expiresIn: 3600,
            publicAccess: true, // Allow unauthenticated access via share link
          });
        } catch (error) {
          console.error(`[SHARE] Failed to generate thumbnail URL for asset ${shareLink.asset.id}:`, error);
          thumbnailUrl = null;
        }
      }

      return {
        shareLink: {
          ...shareLink,
          hasPassword: !!shareLink.password,
          password: undefined, // Don't expose password hash
        },
        asset: {
          ...shareLink.asset,
          previewUrl,
          thumbnailUrl,
        },
      };
    }),

  /**
   * Verify password for password-protected share link
   */
  verifyPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const shareLink = await ctx.prisma.assetShareLink.findUnique({
        where: { token: input.token },
      });

      if (!shareLink || !shareLink.password) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid share link or no password required',
        });
      }

      const isValid = await compare(input.password, shareLink.password);

      if (!isValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Incorrect password',
        });
      }

      return { success: true };
    }),

  /**
   * Get download URL for shared asset
   */
  getSharedDownloadUrl: publicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const shareLink = await ctx.prisma.assetShareLink.findUnique({
        where: { token: input.token },
        include: {
          asset: {
            select: {
              id: true,
              fileKey: true,
              originalName: true,
            },
          },
        },
      });

      if (!shareLink) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Share link not found',
        });
      }

      // Check if link is active
      if (!shareLink.isActive) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This share link has been deactivated',
        });
      }

      // Check if expired
      if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This share link has expired',
        });
      }

      // Check download limit
      if (
        shareLink.maxDownloads &&
        shareLink.currentDownloads >= shareLink.maxDownloads
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Download limit reached for this share link',
        });
      }

      // Verify password if required
      if (shareLink.password) {
        if (!input.password) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Password required',
          });
        }

        const isValid = await compare(input.password, shareLink.password);
        if (!isValid) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Incorrect password',
          });
        }
      }

      // Check if download is allowed
      if (!shareLink.allowDownload) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Downloads are not allowed for this share link',
        });
      }

      // Generate download URL (with public access for share links)
      const downloadUrl = await getPresignedUrl({
        fileKey: shareLink.asset.fileKey!,
        expiresIn: 3600, // 1 hour
        download: true,
        filename: shareLink.asset.originalName,
        publicAccess: true, // Allow unauthenticated access via share link
      });

      // Increment download count
      await ctx.prisma.assetShareLink.update({
        where: { id: shareLink.id },
        data: {
          currentDownloads: { increment: 1 },
          lastAccessedAt: new Date(),
        },
      });

      // Log access with new ShareLinkAccess model
      const clientIp = getClientIp(ctx.headers);
      await ctx.prisma.shareLinkAccess.create({
        data: {
          shareLinkId: shareLink.id,
          accessType: 'DOWNLOAD',
          ipAddress: clientIp,
          userAgent: ctx.headers.get('user-agent') || null,
          referrer: ctx.headers.get('referer') || null,
        },
      });

      // Update share link download count
      await ctx.prisma.assetShareLink.update({
        where: { id: shareLink.id },
        data: {
          downloadCount: { increment: 1 },
        },
      });

      return { url: downloadUrl };
    }),

  /**
   * Update share link settings
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        password: z.string().optional(),
        expiresAt: z.date().optional().nullable(),
        maxDownloads: z.number().optional().nullable(),
        allowDownload: z.boolean().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id, password, ...updateData } = input;

      // Check ownership
      const shareLink = await ctx.prisma.assetShareLink.findUnique({
        where: { id },
      });

      if (!shareLink) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Share link not found',
        });
      }

      if (shareLink.createdById !== userId && ctx.session.user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this share link',
        });
      }

      // Hash new password if provided
      const data: any = { ...updateData };
      if (password !== undefined) {
        data.password = password ? await hash(password, 10) : null;
      }

      const updatedShareLink = await ctx.prisma.assetShareLink.update({
        where: { id },
        data,
      });

      return { shareLink: updatedShareLink };
    }),

  /**
   * Delete (deactivate) share link
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check ownership
      const shareLink = await ctx.prisma.assetShareLink.findUnique({
        where: { id: input.id },
      });

      if (!shareLink) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Share link not found',
        });
      }

      if (shareLink.createdById !== userId && ctx.session.user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this share link',
        });
      }

      // Deactivate instead of hard delete
      await ctx.prisma.assetShareLink.update({
        where: { id: input.id },
        data: { isActive: false },
      });

      // Log activity
      await ctx.prisma.assetActivity.create({
        data: {
          type: 'SHARE_LINK_REVOKED',
          description: 'Revoked share link',
          userId,
          assetId: shareLink.assetId,
          metadata: {
            shareLinkId: shareLink.id,
          },
        },
      });

      return { success: true };
    }),

  /**
   * Reactivate a previously revoked share link
   */
  reactivate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check ownership
      const shareLink = await ctx.prisma.assetShareLink.findUnique({
        where: { id: input.id },
      });

      if (!shareLink) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Share link not found',
        });
      }

      if (shareLink.createdById !== userId && ctx.session.user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to reactivate this share link',
        });
      }

      // Check if link is expired
      if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot reactivate an expired link. Create a new one instead.',
        });
      }

      // Reactivate the link
      await ctx.prisma.assetShareLink.update({
        where: { id: input.id },
        data: { isActive: true },
      });

      // Log activity
      await ctx.prisma.assetActivity.create({
        data: {
          type: 'ASSET_SHARED', // Using ASSET_SHARED for reactivation
          description: 'Reactivated share link',
          userId,
          assetId: shareLink.assetId,
          metadata: {
            shareLinkId: shareLink.id,
            action: 'reactivated',
          },
        },
      });

      return { success: true };
    }),

  /**
   * Get access logs for share link
   */
  getAccessLogs: protectedProcedure
    .input(
      z.object({
        shareLinkId: z.string(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const skip = (input.page - 1) * input.limit;

      // Check ownership
      const shareLink = await ctx.prisma.assetShareLink.findUnique({
        where: { id: input.shareLinkId },
      });

      if (!shareLink) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Share link not found',
        });
      }

      if (shareLink.createdById !== userId && ctx.session.user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view access logs',
        });
      }

      const [logs, total] = await Promise.all([
        ctx.prisma.shareLinkAccess.findMany({
          where: { shareLinkId: input.shareLinkId },
          skip,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.prisma.shareLinkAccess.count({
          where: { shareLinkId: input.shareLinkId },
        }),
      ]);

      return {
        logs,
        pagination: {
          total,
          pages: Math.ceil(total / input.limit),
          currentPage: input.page,
          perPage: input.limit,
        },
      };
    }),

  /**
   * Get share link statistics
   */
  getStats: protectedProcedure
    .input(z.object({ shareLinkId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check ownership
      const shareLink = await ctx.prisma.assetShareLink.findUnique({
        where: { id: input.shareLinkId },
      });

      if (!shareLink) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Share link not found',
        });
      }

      if (shareLink.createdById !== userId && ctx.session.user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view stats',
        });
      }

      // Get access count by type using new model
      const accessByType = await ctx.prisma.shareLinkAccess.groupBy({
        by: ['accessType'],
        where: { shareLinkId: input.shareLinkId },
        _count: true,
      });

      // Get unique IP addresses
      const uniqueIPs = await ctx.prisma.shareLinkAccess.findMany({
        where: { shareLinkId: input.shareLinkId },
        distinct: ['ipAddress'],
        select: { ipAddress: true },
      });

      // Get top countries
      const topCountries = await ctx.prisma.shareLinkAccess.groupBy({
        by: ['country'],
        where: {
          shareLinkId: input.shareLinkId,
          country: { not: null },
        },
        _count: true,
        orderBy: { _count: { country: 'desc' } },
        take: 5,
      });

      const totalAccesses = accessByType.reduce((sum, item) => sum + item._count, 0);

      const stats = {
        totalAccesses,
        uniqueVisitors: uniqueIPs.length,
        viewCount: shareLink.viewCount,
        downloadCount: shareLink.downloadCount,
        currentDownloads: shareLink.currentDownloads,
        maxDownloads: shareLink.maxDownloads,
        isActive: shareLink.isActive,
        isExpired: shareLink.expiresAt ? new Date() > shareLink.expiresAt : false,
        createdAt: shareLink.createdAt,
        lastAccessedAt: shareLink.lastAccessedAt,
        accessByType: accessByType.reduce(
          (acc, item) => {
            acc[item.accessType] = item._count;
            return acc;
          },
          {} as Record<string, number>
        ),
        topCountries: topCountries.map((c) => ({
          country: c.country,
          count: c._count,
        })),
      };

      return { stats };
    }),
});
