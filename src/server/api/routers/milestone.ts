import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { MilestoneStatus } from '@prisma/client';
import { TRPCError } from '@trpc/server';

export const milestoneRouter = createTRPCRouter({
  /**
   * Get all milestones for a project
   */
  list: protectedProcedure
    .input(z.object({ projectId: z.string() }))
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

      return ctx.prisma.milestone.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          signedOffUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          approvedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              tasks: true,
            },
          },
        },
        orderBy: {
          dueDate: 'asc',
        },
      });
    }),

  /**
   * Get a single milestone
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.milestone.findUnique({
        where: { id: input.id },
        include: {
          tasks: {
            select: {
              id: true,
              name: true,
              status: true,
              priority: true,
              dueDate: true,
              assignees: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          signedOffUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          approvedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }),

  /**
   * Create a milestone
   */
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string().min(1),
        description: z.string().optional(),
        dueDate: z.date(),
        startDate: z.date().optional(),
        deliverables: z.array(z.string()).default([]),
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

      if (
        ctx.session.user.role !== 'ADMIN' &&
        project.company.users.length === 0
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to create milestones',
        });
      }

      const milestone = await ctx.prisma.milestone.create({
        data: {
          projectId: input.projectId,
          name: input.name,
          description: input.description,
          dueDate: input.dueDate,
          startDate: input.startDate,
          deliverables: input.deliverables,
        },
      });

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: 'PROJECT_UPDATED',
          performedBy: ctx.session.user.id,
          details: {
            milestoneId: milestone.id,
            milestoneName: milestone.name,
            action: 'milestone_created',
          },
        },
      });

      return milestone;
    }),

  /**
   * Update a milestone
   */
  update: protectedProcedure
    .input(
      z.object({
        milestoneId: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        status: z.nativeEnum(MilestoneStatus).optional(),
        progress: z.number().min(0).max(100).optional(),
        dueDate: z.date().optional(),
        startDate: z.date().optional(),
        deliverables: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { milestoneId, ...data } = input;

      const milestone = await ctx.prisma.milestone.findUnique({
        where: { id: milestoneId },
        include: {
          project: {
            include: {
              company: {
                include: {
                  users: {
                    where: { userId: ctx.session.user.id },
                  },
                },
              },
            },
          },
        },
      });

      if (!milestone) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Milestone not found',
        });
      }

      if (
        ctx.session.user.role !== 'ADMIN' &&
        milestone.project.company.users.length === 0
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this milestone',
        });
      }

      const updatedMilestone = await ctx.prisma.milestone.update({
        where: { id: milestoneId },
        data,
      });

      return updatedMilestone;
    }),

  /**
   * Sign off a milestone (internal approval)
   */
  signOff: protectedProcedure
    .input(z.object({ milestoneId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const milestone = await ctx.prisma.milestone.findUnique({
        where: { id: input.milestoneId },
        include: {
          project: {
            include: {
              company: {
                include: {
                  users: {
                    where: { userId: ctx.session.user.id },
                  },
                },
              },
            },
          },
        },
      });

      if (!milestone) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Milestone not found',
        });
      }

      if (
        ctx.session.user.role !== 'ADMIN' &&
        milestone.project.company.users.length === 0
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to sign off this milestone',
        });
      }

      const updated = await ctx.prisma.milestone.update({
        where: { id: input.milestoneId },
        data: {
          signedOffBy: ctx.session.user.id,
          signedOffAt: new Date(),
          status: MilestoneStatus.IN_REVIEW,
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              company: {
                select: {
                  users: {
                    where: {
                      user: { role: "CLIENT" },
                    },
                    select: {
                      userId: true,
                      user: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Notify client users about milestone ready for approval
      const { queueNotification } = await import('@/lib/queue');

      for (const companyUser of updated.project.company.users) {
        await queueNotification({
          userId: companyUser.userId,
          type: 'MILESTONE_REVIEW',
          title: 'Milestone Ready for Approval',
          message: `Milestone "${milestone.name}" in project "${updated.project.name}" is ready for your approval`,
          data: {
            milestoneId: updated.id,
            milestoneName: milestone.name,
            projectId: updated.project.id,
            projectName: updated.project.name,
            signedOffBy: ctx.session.user.name,
          },
          projectId: updated.project.id,
          milestoneId: updated.id,
        });
      }

      return updated;
    }),

  /**
   * Approve or reject milestone (client approval)
   */
  approve: protectedProcedure
    .input(
      z.object({
        milestoneId: z.string(),
        approved: z.boolean(),
        feedback: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const milestone = await ctx.prisma.milestone.findUnique({
        where: { id: input.milestoneId },
      });

      if (!milestone) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Milestone not found',
        });
      }

      const updated = await ctx.prisma.milestone.update({
        where: { id: input.milestoneId },
        data: {
          clientApproval: input.approved,
          approvedBy: input.approved ? ctx.session.user.id : null,
          approvedAt: input.approved ? new Date() : null,
          feedback: input.feedback,
          status: input.approved
            ? MilestoneStatus.COMPLETED
            : MilestoneStatus.IN_PROGRESS,
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              company: {
                select: {
                  users: {
                    where: {
                      user: { role: {
                        in: ['ADMIN', 'MODERATOR', 'CONTENT_CREATOR'],
                      } },
                    },
                    select: {
                      userId: true,
                      user: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Notify team about client's decision
      const { queueNotification } = await import('@/lib/queue');

      for (const companyUser of updated.project.company.users) {
        await queueNotification({
          userId: companyUser.userId,
          type: input.approved ? 'MILESTONE_APPROVED' : 'MILESTONE_REJECTED',
          title: input.approved ? 'Milestone Approved' : 'Milestone Needs Revision',
          message: input.approved
            ? `Milestone "${milestone.name}" has been approved by ${ctx.session.user.name}`
            : `Milestone "${milestone.name}" needs revision. Feedback: ${input.feedback || 'No feedback provided'}`,
          data: {
            milestoneId: updated.id,
            milestoneName: milestone.name,
            projectId: updated.project.id,
            projectName: updated.project.name,
            approved: input.approved,
            feedback: input.feedback,
            approvedBy: ctx.session.user.name,
          },
          projectId: updated.project.id,
          milestoneId: updated.id,
        });
      }

      return updated;
    }),

  /**
   * Get pending approvals (milestones in review status)
   */
  getPendingApprovals: protectedProcedure
    .input(
      z.object({
        projectId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Admin can see all pending approvals
      if (ctx.session.user.role === 'ADMIN') {
        return ctx.prisma.milestone.findMany({
          where: {
            status: MilestoneStatus.IN_REVIEW,
            ...(input.projectId && { projectId: input.projectId }),
          },
          include: {
            project: {
              select: {
                id: true,
                name: true,
                company: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            tasks: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
            signedOffUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            dueDate: 'asc',
          },
        });
      }

      // For non-admin users, get their company IDs
      const userCompanies = await ctx.prisma.companyUser.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        select: {
          companyId: true,
        },
      });

      const companyIds = userCompanies.map((uc) => uc.companyId);

      if (companyIds.length === 0) {
        return [];
      }

      // Get milestones in review status for user's companies
      return ctx.prisma.milestone.findMany({
        where: {
          status: MilestoneStatus.IN_REVIEW,
          project: {
            companyId: {
              in: companyIds,
            },
          },
          ...(input.projectId && { projectId: input.projectId }),
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          tasks: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          signedOffUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          dueDate: 'asc',
        },
      });
    }),

  /**
   * Delete a milestone
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const milestone = await ctx.prisma.milestone.findUnique({
        where: { id: input.id },
        include: {
          project: {
            include: {
              company: {
                include: {
                  users: {
                    where: { userId: ctx.session.user.id },
                  },
                },
              },
            },
          },
        },
      });

      if (!milestone) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Milestone not found',
        });
      }

      if (
        ctx.session.user.role !== 'ADMIN' &&
        milestone.project.company.users.length === 0
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this milestone',
        });
      }

      await ctx.prisma.milestone.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
