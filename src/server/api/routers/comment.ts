import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { CommentableType } from '@prisma/client';

export const commentRouter = createTRPCRouter({
  /**
   * Create a comment on any entity
   */
  create: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1).max(5000),
        commentableType: z.nativeEnum(CommentableType),
        commentableId: z.string(),
        parentId: z.string().optional(),
        mentions: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify access to the entity being commented on
      await verifyCommentAccess(
        ctx,
        input.commentableType,
        input.commentableId
      );

      // If replying to a comment, verify parent exists
      if (input.parentId) {
        const parentComment = await ctx.prisma.comment.findUnique({
          where: { id: input.parentId },
        });

        if (!parentComment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Parent comment not found',
          });
        }
      }

      // Create comment with entity-specific relations
      const relationField = getRelationField(input.commentableType);
      const comment = await ctx.prisma.comment.create({
        data: {
          content: input.content,
          commentableType: input.commentableType,
          commentableId: input.commentableId,
          authorId: ctx.session.user.id,
          parentId: input.parentId,
          mentions: input.mentions,
          [relationField]: { connect: { id: input.commentableId } },
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      // Send notifications to mentioned users
      if (input.mentions.length > 0) {
        const { queueNotification } = await import('@/lib/queue');

        for (const userId of input.mentions) {
          if (userId !== ctx.session.user.id) {
            // Don't notify yourself
            await queueNotification({
              userId,
              type: 'PROJECT_UPDATED',
              title: 'You were mentioned',
              message: `${ctx.session.user.name} mentioned you in a comment`,
              data: {
                commentId: comment.id,
                commentableType: input.commentableType,
                commentableId: input.commentableId,
              },
            });
          }
        }
      }

      // Notify parent comment author if this is a reply
      if (input.parentId) {
        const parentComment = await ctx.prisma.comment.findUnique({
          where: { id: input.parentId },
          select: { authorId: true },
        });

        if (
          parentComment &&
          parentComment.authorId !== ctx.session.user.id
        ) {
          const { queueNotification } = await import('@/lib/queue');
          await queueNotification({
            userId: parentComment.authorId,
            type: 'PROJECT_UPDATED',
            title: 'New reply to your comment',
            message: `${ctx.session.user.name} replied to your comment`,
            data: {
              commentId: comment.id,
              parentId: input.parentId,
            },
          });
        }
      }

      return comment;
    }),

  /**
   * Get comments for an entity
   */
  list: protectedProcedure
    .input(
      z.object({
        commentableType: z.nativeEnum(CommentableType),
        commentableId: z.string(),
        includeReplies: z.boolean().default(true),
        includeResolved: z.boolean().default(true),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify access
      await verifyCommentAccess(
        ctx,
        input.commentableType,
        input.commentableId
      );

      const comments = await ctx.prisma.comment.findMany({
        where: {
          commentableType: input.commentableType,
          commentableId: input.commentableId,
          isDeleted: false,
          parentId: input.includeReplies ? undefined : null, // Only top-level if not including replies
          ...(! input.includeResolved && { resolved: false }),
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          replies: input.includeReplies
            ? {
                where: { isDeleted: false },
                include: {
                  author: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      image: true,
                    },
                  },
                },
                orderBy: { createdAt: 'asc' },
              }
            : false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: input.limit + 1,
        ...(input.cursor && {
          cursor: { id: input.cursor },
          skip: 1,
        }),
      });

      let nextCursor: string | undefined = undefined;
      if (comments.length > input.limit) {
        const nextItem = comments.pop();
        nextCursor = nextItem?.id;
      }

      return {
        comments,
        nextCursor,
      };
    }),

  /**
   * Get a single comment with its thread
   */
  getThread: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const comment = await ctx.prisma.comment.findUnique({
        where: { id: input.commentId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          parent: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          replies: {
            where: { isDeleted: false },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!comment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Comment not found',
        });
      }

      // Verify access to the entity
      await verifyCommentAccess(
        ctx,
        comment.commentableType,
        comment.commentableId
      );

      return comment;
    }),

  /**
   * Update a comment (only own comments)
   */
  update: protectedProcedure
    .input(
      z.object({
        commentId: z.string(),
        content: z.string().min(1).max(5000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.prisma.comment.findUnique({
        where: { id: input.commentId },
      });

      if (!comment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Comment not found',
        });
      }

      // Only author or admin can update
      if (
        comment.authorId !== ctx.session.user.id &&
        ctx.session.user.role !== 'ADMIN'
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only edit your own comments',
        });
      }

      const updated = await ctx.prisma.comment.update({
        where: { id: input.commentId },
        data: {
          content: input.content,
          updatedAt: new Date(),
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      return updated;
    }),

  /**
   * Delete a comment (soft delete)
   */
  delete: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.prisma.comment.findUnique({
        where: { id: input.commentId },
      });

      if (!comment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Comment not found',
        });
      }

      // Only author or admin can delete
      if (
        comment.authorId !== ctx.session.user.id &&
        ctx.session.user.role !== 'ADMIN'
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only delete your own comments',
        });
      }

      // Soft delete to preserve thread structure
      await ctx.prisma.comment.update({
        where: { id: input.commentId },
        data: {
          isDeleted: true,
          content: '[deleted]',
        },
      });

      return { success: true };
    }),

  /**
   * Resolve/unresolve a comment
   */
  resolve: protectedProcedure
    .input(
      z.object({
        commentId: z.string(),
        resolved: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.prisma.comment.findUnique({
        where: { id: input.commentId },
      });

      if (!comment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Comment not found',
        });
      }

      // Verify access to the entity
      await verifyCommentAccess(
        ctx,
        comment.commentableType,
        comment.commentableId
      );

      const updated = await ctx.prisma.comment.update({
        where: { id: input.commentId },
        data: {
          resolved: input.resolved,
          resolvedBy: input.resolved ? ctx.session.user.id : null,
          resolvedAt: input.resolved ? new Date() : null,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      // Notify comment author if someone else resolved it
      if (
        input.resolved &&
        comment.authorId !== ctx.session.user.id
      ) {
        const { queueNotification } = await import('@/lib/queue');
        await queueNotification({
          userId: comment.authorId,
          type: 'PROJECT_UPDATED',
          title: 'Comment resolved',
          message: `${ctx.session.user.name} resolved your comment`,
          data: {
            commentId: comment.id,
          },
        });
      }

      return updated;
    }),

  /**
   * Get comment count for an entity
   */
  getCount: protectedProcedure
    .input(
      z.object({
        commentableType: z.nativeEnum(CommentableType),
        commentableId: z.string(),
        includeResolved: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const count = await ctx.prisma.comment.count({
        where: {
          commentableType: input.commentableType,
          commentableId: input.commentableId,
          isDeleted: false,
          ...(! input.includeResolved && { resolved: false }),
        },
      });

      return { count };
    }),
});

/**
 * Verify user has access to comment on an entity
 */
async function verifyCommentAccess(
  ctx: any,
  type: CommentableType,
  id: string
) {
  const prisma = ctx.prisma;
  const userId = ctx.session.user.id;
  const userRole = ctx.session.user.role;

  // Admin has access to everything
  if (userRole === 'ADMIN') return;

  switch (type) {
    case 'PROJECT': {
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          company: {
            include: {
              users: { where: { userId } },
            },
          },
        },
      });

      if (!project || project.company.users.length === 0) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this project',
        });
      }
      break;
    }

    case 'TASK': {
      const task = await prisma.task.findUnique({
        where: { id },
        include: {
          project: {
            include: {
              company: {
                include: {
                  users: { where: { userId } },
                },
              },
            },
          },
        },
      });

      if (!task || task.project.company.users.length === 0) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this task',
        });
      }
      break;
    }

    case 'MILESTONE': {
      const milestone = await prisma.milestone.findUnique({
        where: { id },
        include: {
          project: {
            include: {
              company: {
                include: {
                  users: { where: { userId } },
                },
              },
            },
          },
        },
      });

      if (!milestone || milestone.project.company.users.length === 0) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this milestone',
        });
      }
      break;
    }

    case 'ASSET': {
      const asset = await prisma.asset.findUnique({
        where: { id },
        include: {
          companies: {
            include: {
              company: {
                include: {
                  users: { where: { userId } },
                },
              },
            },
          },
        },
      });

      if (!asset || asset.companies.length === 0) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this asset',
        });
      }
      break;
    }

    case 'UPLOAD': {
      const upload = await prisma.clientUpload.findUnique({
        where: { id },
        include: {
          project: {
            include: {
              company: {
                include: {
                  users: { where: { userId } },
                },
              },
            },
          },
        },
      });

      if (!upload || upload.project.company.users.length === 0) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this upload',
        });
      }
      break;
    }
  }
}

/**
 * Get the relation field name for a commentable type
 */
function getRelationField(type: CommentableType): string {
  switch (type) {
    case 'PROJECT':
      return 'projectId';
    case 'TASK':
      return 'taskId';
    case 'MILESTONE':
      return 'milestoneId';
    case 'ASSET':
      return 'assetId';
    case 'UPLOAD':
      return 'clientUploadId';
    default:
      throw new Error(`Unknown commentable type: ${type}`);
  }
}
