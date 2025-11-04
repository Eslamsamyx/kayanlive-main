import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';

export const auditRouter = createTRPCRouter({
  /**
   * Get activity feed for a project
   * Returns client-friendly activity descriptions
   */
  getProjectActivity: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify user has access to the project
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

      // Get relevant audit logs for the project
      const logs = await ctx.prisma.auditLog.findMany({
        where: {
          OR: [
            // Project-level actions
            {
              entityType: 'Project',
              entityId: input.projectId,
            },
            // Actions related to project entities (via metadata)
            {
              metadata: {
                path: ['projectId'],
                equals: input.projectId,
              },
            },
            // Actions related to project entities (via details)
            {
              details: {
                path: ['projectId'],
                equals: input.projectId,
              },
            },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: input.limit,
      });

      // Transform audit logs into client-friendly activity items
      const activities = logs.map((log) => {
        const activityType = translateActionToClientFriendly(
          log.action,
          log.details,
          log.metadata
        );

        return {
          id: log.id,
          type: activityType.type,
          title: activityType.title,
          description: activityType.description,
          icon: activityType.icon,
          color: activityType.color,
          user: log.user,
          timestamp: log.createdAt,
          metadata: log.metadata || log.details,
        };
      });

      return activities;
    }),

  /**
   * Get activity feed for a company
   */
  getCompanyActivity: protectedProcedure
    .input(
      z.object({
        companyId: z.string(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify user has access to the company
      const companyUser = await ctx.prisma.companyUser.findUnique({
        where: {
          companyId_userId: {
            companyId: input.companyId,
            userId: ctx.session.user.id,
          },
        },
      });

      if (!companyUser && ctx.session.user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this company',
        });
      }

      // Get audit logs related to the company
      const logs = await ctx.prisma.auditLog.findMany({
        where: {
          OR: [
            {
              entityType: 'Company',
              entityId: input.companyId,
            },
            {
              metadata: {
                path: ['companyId'],
                equals: input.companyId,
              },
            },
            {
              details: {
                path: ['companyId'],
                equals: input.companyId,
              },
            },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: input.limit,
      });

      const activities = logs.map((log) => {
        const activityType = translateActionToClientFriendly(
          log.action,
          log.details,
          log.metadata
        );

        return {
          id: log.id,
          type: activityType.type,
          title: activityType.title,
          description: activityType.description,
          icon: activityType.icon,
          color: activityType.color,
          user: log.user,
          timestamp: log.createdAt,
          metadata: log.metadata || log.details,
        };
      });

      return activities;
    }),
});

/**
 * Translate audit actions into client-friendly descriptions
 */
function translateActionToClientFriendly(
  action: string,
  details: any,
  metadata: any
): {
  type: string;
  title: string;
  description: string;
  icon: string;
  color: string;
} {
  const data = metadata || details || {};

  // Project Actions
  if (action === 'PROJECT_CREATED') {
    return {
      type: 'project',
      title: 'Project Started',
      description: `New project "${data.projectName || 'Untitled'}" has been created`,
      icon: 'FolderPlus',
      color: 'blue',
    };
  }

  if (action === 'PROJECT_UPDATED') {
    return {
      type: 'project',
      title: 'Project Updated',
      description: `Project details have been updated`,
      icon: 'Edit',
      color: 'blue',
    };
  }

  // Milestone Actions
  if (action.includes('MILESTONE')) {
    if (data.action === 'milestone_created') {
      return {
        type: 'milestone',
        title: 'New Milestone',
        description: `Milestone "${data.milestoneName}" has been added to the project`,
        icon: 'Target',
        color: 'purple',
      };
    }

    if (data.approved === true) {
      return {
        type: 'approval',
        title: 'Milestone Approved',
        description: `Milestone "${data.milestoneName}" has been approved`,
        icon: 'CheckCircle',
        color: 'green',
      };
    }

    if (data.approved === false) {
      return {
        type: 'feedback',
        title: 'Milestone Needs Revision',
        description: `Feedback provided on "${data.milestoneName}"${
          data.feedback ? `: ${data.feedback}` : ''
        }`,
        icon: 'MessageSquare',
        color: 'yellow',
      };
    }
  }

  // Asset/Deliverable Actions
  if (action === 'ASSET_UPLOADED') {
    return {
      type: 'deliverable',
      title: 'New Deliverable',
      description: `File "${data.assetName}" has been delivered`,
      icon: 'Package',
      color: 'cyan',
    };
  }

  if (action === 'ASSET_SHARED') {
    return {
      type: 'deliverable',
      title: 'File Shared',
      description: `Asset "${data.assetName}" has been shared with you`,
      icon: 'Share',
      color: 'cyan',
    };
  }

  // Meeting Actions
  if (action.includes('MEETING')) {
    return {
      type: 'meeting',
      title: 'Meeting Scheduled',
      description: `Meeting "${data.meetingTitle || 'Untitled'}" has been scheduled`,
      icon: 'Calendar',
      color: 'orange',
    };
  }

  // Task Actions (for internal visibility)
  if (action.includes('TASK')) {
    if (data.action === 'task_created') {
      return {
        type: 'task',
        title: 'Task Added',
        description: `New task "${data.taskName}" has been added`,
        icon: 'CheckSquare',
        color: 'gray',
      };
    }

    if (data.action === 'task_completed') {
      return {
        type: 'task',
        title: 'Task Completed',
        description: `Task "${data.taskName}" has been completed`,
        icon: 'CheckCircle',
        color: 'green',
      };
    }
  }

  // Generic fallback
  return {
    type: 'general',
    title: 'Activity',
    description: action.replace(/_/g, ' ').toLowerCase(),
    icon: 'Activity',
    color: 'gray',
  };
}
