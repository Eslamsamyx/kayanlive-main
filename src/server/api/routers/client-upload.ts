import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { uploadFile } from '@/lib/s3';

export const clientUploadRouter = createTRPCRouter({
  /**
   * Upload file to project
   * Clients can only upload to their company's projects
   */
  upload: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        fileName: z.string(),
        fileData: z.string(), // Base64 encoded file
        mimeType: z.string(),
        description: z.string().optional(),
        folder: z.string().optional().default('general'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify project access
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.projectId },
        include: {
          company: {
            include: {
              users: {
                where: { userId: ctx.session.user.id },
              },
            },
          },
        },
      });

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      // Check if user has access to this project's company
      if (
        ctx.session.user.role !== 'ADMIN' &&
        project.company.users.length === 0
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this project',
        });
      }

      // Convert base64 to buffer
      const buffer = Buffer.from(input.fileData, 'base64');

      // Upload to storage
      const uploadResult = await uploadFile({
        buffer,
        filename: input.fileName,
        mimeType: input.mimeType,
        prefix: `client-uploads/${input.projectId}`,
        metadata: {
          projectId: input.projectId,
          uploadedBy: ctx.session.user.id,
          folder: input.folder,
        },
      });

      // Create database record
      const clientUpload = await ctx.prisma.clientUpload.create({
        data: {
          fileName: input.fileName,
          fileKey: uploadResult.fileKey,
          fileSize: BigInt(uploadResult.size),
          mimeType: input.mimeType,
          description: input.description,
          folder: input.folder,
          projectId: input.projectId,
          uploadedBy: ctx.session.user.id,
        },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      // Notify project team
      const { queueNotification } = await import('@/lib/queue');

      // Get project team members
      const teamMembers = await ctx.prisma.companyUser.findMany({
        where: {
          companyId: project.companyId,
          userId: { not: ctx.session.user.id }, // Don't notify uploader
          role: { in: ['ADMIN', 'OWNER', 'MEMBER'] },
        },
        select: { userId: true },
      });

      // Send notifications to team
      for (const member of teamMembers) {
        await queueNotification({
          userId: member.userId,
          type: 'PROJECT_UPDATED',
          title: 'New Client Upload',
          message: `${ctx.session.user.name} uploaded ${input.fileName} to ${project.name}`,
          data: {
            projectId: project.id,
            uploadId: clientUpload.id,
            fileName: input.fileName,
          },
          projectId: project.id,
        });
      }

      return {
        upload: clientUpload,
        url: uploadResult.url,
      };
    }),

  /**
   * Get all uploads for a project
   */
  list: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        folder: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify project access
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.projectId },
        include: {
          company: {
            include: {
              users: {
                where: { userId: ctx.session.user.id },
              },
            },
          },
        },
      });

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      if (
        ctx.session.user.role !== 'ADMIN' &&
        project.company.users.length === 0
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this project',
        });
      }

      const uploads = await ctx.prisma.clientUpload.findMany({
        where: {
          projectId: input.projectId,
          ...(input.folder && { folder: input.folder }),
        },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          comments: {
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: input.limit + 1,
        ...(input.cursor && {
          cursor: {
            id: input.cursor,
          },
          skip: 1,
        }),
      });

      let nextCursor: string | undefined = undefined;
      if (uploads.length > input.limit) {
        const nextItem = uploads.pop();
        nextCursor = nextItem?.id;
      }

      return {
        uploads: uploads.map((upload) => ({
          ...upload,
          fileSize: Number(upload.fileSize),
          commentCount: upload.comments.length,
        })),
        nextCursor,
      };
    }),

  /**
   * Get folders/categories for a project
   */
  getFolders: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const folders = await ctx.prisma.clientUpload.findMany({
        where: { projectId: input.projectId },
        select: { folder: true },
        distinct: ['folder'],
      });

      return folders
        .map((f) => f.folder)
        .filter((f): f is string => f !== null);
    }),

  /**
   * Get single upload details
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const upload = await ctx.prisma.clientUpload.findUnique({
        where: { id: input.id },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              companyId: true,
            },
          },
          comments: {
            where: { isDeleted: false },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!upload) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Upload not found',
        });
      }

      // Check access
      const hasAccess = await ctx.prisma.companyUser.findFirst({
        where: {
          companyId: upload.project.companyId,
          userId: ctx.session.user.id,
        },
      });

      if (!hasAccess && ctx.session.user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this upload',
        });
      }

      return {
        ...upload,
        fileSize: Number(upload.fileSize),
      };
    }),

  /**
   * Delete upload
   * Only uploader or admin can delete
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const upload = await ctx.prisma.clientUpload.findUnique({
        where: { id: input.id },
        include: {
          project: {
            select: {
              companyId: true,
            },
          },
        },
      });

      if (!upload) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Upload not found',
        });
      }

      // Check if user can delete
      const canDelete =
        upload.uploadedBy === ctx.session.user.id ||
        ctx.session.user.role === 'ADMIN';

      if (!canDelete) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only delete your own uploads',
        });
      }

      // Delete from storage
      const { deleteFile } = await import('@/lib/s3');
      try {
        await deleteFile(upload.fileKey);
      } catch (error) {
        // Log error but continue with database deletion
        console.error('Failed to delete file from storage:', error);
      }

      // Delete from database (cascade will delete comments)
      await ctx.prisma.clientUpload.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Update upload metadata
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        description: z.string().optional(),
        folder: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const upload = await ctx.prisma.clientUpload.findUnique({
        where: { id: input.id },
      });

      if (!upload) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Upload not found',
        });
      }

      // Only uploader or admin can update
      if (
        upload.uploadedBy !== ctx.session.user.id &&
        ctx.session.user.role !== 'ADMIN'
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only update your own uploads',
        });
      }

      const { id, ...updateData } = input;

      const updated = await ctx.prisma.clientUpload.update({
        where: { id },
        data: updateData,
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      return {
        ...updated,
        fileSize: Number(updated.fileSize),
      };
    }),
});
