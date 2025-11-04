import { z } from 'zod';
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
  createPermissionProcedure,
  Permission,
} from '@/server/api/trpc';
import { DownloadRequestStatus, AuditAction } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { NotificationService } from '@/lib/notification-service';

export const downloadRequestRouter = createTRPCRouter({
  /**
   * List all download requests (admin/moderator view)
   * Requires ASSET_APPROVE_DOWNLOAD permission
   */
  listAll: createPermissionProcedure(Permission.ASSET_APPROVE_DOWNLOAD)
    .input(
      z.object({
        status: z.nativeEnum(DownloadRequestStatus).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input.status) {
        where.status = input.status;
      }

      return ctx.prisma.downloadRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          asset: {
            select: {
              id: true,
              name: true,
              type: true,
              fileName: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }),

  /**
   * List user's download requests
   */
  listMy: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.downloadRequest.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            type: true,
            fileName: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }),

  /**
   * Create a download request
   * Requires ASSET_REQUEST_DOWNLOAD permission
   */
  create: createPermissionProcedure(Permission.ASSET_REQUEST_DOWNLOAD)
    .input(
      z.object({
        assetId: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if asset exists
      const asset = await ctx.prisma.asset.findUnique({
        where: { id: input.assetId },
      });

      if (!asset) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Asset not found',
        });
      }

      // Check if there's already a pending request
      const existingRequest = await ctx.prisma.downloadRequest.findFirst({
        where: {
          userId: ctx.session.user.id,
          assetId: input.assetId,
          status: DownloadRequestStatus.PENDING,
        },
      });

      if (existingRequest) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You already have a pending request for this asset',
        });
      }

      const request = await ctx.prisma.downloadRequest.create({
        data: {
          userId: ctx.session.user.id,
          assetId: input.assetId,
          reason: input.reason,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          asset: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });

      // Notify admins
      const admins = await ctx.prisma.user.findMany({
        where: {
          role: 'ADMIN',
          isActive: true,
        },
        select: {
          id: true,
        },
      });

      const notificationService = new NotificationService(ctx.prisma);
      await notificationService.createDownloadRequestNotification(
        admins.map((a) => a.id),
        request as any,
        'REQUESTED'
      );

      return request;
    }),

  /**
   * Review a download request (approve/reject)
   * Requires ASSET_APPROVE_DOWNLOAD permission
   */
  review: createPermissionProcedure(Permission.ASSET_APPROVE_DOWNLOAD)
    .input(
      z.object({
        id: z.string(),
        approved: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.prisma.downloadRequest.findUnique({
        where: { id: input.id },
        include: {
          user: true,
          asset: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });

      if (!request) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Download request not found',
        });
      }

      const updated = await ctx.prisma.downloadRequest.update({
        where: { id: input.id },
        data: {
          status: input.approved
            ? DownloadRequestStatus.APPROVED
            : DownloadRequestStatus.REJECTED,
          reviewedBy: ctx.session.user.id,
          reviewedAt: new Date(),
        },
      });

      // Notify the requester
      const notificationService = new NotificationService(ctx.prisma);
      await notificationService.createDownloadRequestNotification(
        [request.userId],
        request as any,
        input.approved ? 'APPROVED' : 'REJECTED'
      );

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId: request.userId,
          action: input.approved
            ? AuditAction.DOWNLOAD_REQUEST_APPROVED
            : AuditAction.DOWNLOAD_REQUEST_REJECTED,
          performedBy: ctx.session.user.id,
          entityType: 'DownloadRequest',
          entityId: request.id,
          metadata: {
            assetId: request.asset.id,
            assetName: request.asset.name,
            requesterId: request.userId,
            requesterEmail: request.user.email,
          },
        },
      });

      return updated;
    }),
});
