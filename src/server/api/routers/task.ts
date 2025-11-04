import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { TaskStatus, Priority, type PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';

/**
 * Helper function to automatically update milestone progress based on task completion
 */
async function updateMilestoneProgress(prisma: PrismaClient, milestoneId: string) {
  // Get all tasks for this milestone
  const tasks = await prisma.task.findMany({
    where: { milestoneId },
    select: { status: true },
  });

  if (tasks.length === 0) {
    // No tasks, set progress to 0
    await prisma.milestone.update({
      where: { id: milestoneId },
      data: { progress: 0 },
    });
    return;
  }

  // Count completed and approved tasks
  const completedCount = tasks.filter(
    (task) => task.status === TaskStatus.COMPLETED || task.status === TaskStatus.APPROVED
  ).length;

  // Calculate progress percentage
  const progress = Math.round((completedCount / tasks.length) * 100);

  // Update milestone progress
  await prisma.milestone.update({
    where: { id: milestoneId },
    data: { progress },
  });
}

export const taskRouter = createTRPCRouter({
  /**
   * List all tasks for a project
   */
  list: protectedProcedure
    .input(z.object({ projectId: z.string() }))
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

      // Check access
      if (
        ctx.session.user.role !== 'ADMIN' &&
        project.company.users.length === 0
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this project',
        });
      }

      return ctx.prisma.task.findMany({
        where: {
          projectId: input.projectId,
        },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          priority: true,
          dueDate: true,
          estimatedTime: true,
          actualTime: true,
          tags: true,
          order: true,
          completedAt: true,
          createdAt: true,
          updatedAt: true,
          milestoneId: true,
          assignees: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: {
          order: 'asc',
        },
      });
    }),

  /**
   * List all tasks across all accessible projects
   */
  listAll: protectedProcedure.query(async ({ ctx }) => {
    // Build where clause based on user role
    const where: any = {};

    if (ctx.session.user.role !== 'ADMIN') {
      // Get user's companies
      const userCompanies = await ctx.prisma.companyUser.findMany({
        where: { userId: ctx.session.user.id },
        select: { companyId: true },
      });

      const companyIds = userCompanies.map((uc) => uc.companyId);

      if (companyIds.length === 0) {
        return [];
      }

      where.project = {
        companyId: { in: companyIds },
        deletedAt: null,
      };
    } else {
      where.project = {
        deletedAt: null,
      };
    }

    return ctx.prisma.task.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        estimatedTime: true,
        actualTime: true,
        tags: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
        assignees: {
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
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }),

  /**
   * Get a single task by ID
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          priority: true,
          dueDate: true,
          estimatedTime: true,
          actualTime: true,
          tags: true,
          order: true,
          completedAt: true,
          createdAt: true,
          updatedAt: true,
          projectId: true,
          milestoneId: true,
          assignees: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
          taskComments: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          milestone: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      });

      if (!task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      return task;
    }),

  /**
   * Create a new task
   */
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string().min(1),
        description: z.string().optional(),
        status: z.nativeEnum(TaskStatus),
        priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
        dueDate: z.date().optional(),
        estimatedTime: z.number().min(0).optional(),
        tags: z.array(z.string()).default([]),
        assigneeIds: z.array(z.string()).optional(),
        milestoneId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify project access
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.projectId },
        include: {
          tasks: true,
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

      // Check permission
      if (
        ctx.session.user.role !== 'ADMIN' &&
        project.company.users.length === 0
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to create tasks in this project',
        });
      }

      const task = await ctx.prisma.task.create({
        data: {
          projectId: input.projectId,
          name: input.name,
          description: input.description,
          status: input.status,
          priority: input.priority,
          dueDate: input.dueDate,
          estimatedTime: input.estimatedTime,
          tags: input.tags,
          milestoneId: input.milestoneId,
          order: project.tasks.length,
          assignees: input.assigneeIds
            ? {
                connect: input.assigneeIds.map((id) => ({ id })),
              }
            : undefined,
        },
        include: {
          assignees: {
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
            },
          },
        },
      });

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: 'PROJECT_UPDATED',
          performedBy: ctx.session.user.id,
          details: {
            taskId: task.id,
            taskName: task.name,
            action: 'task_created',
          },
        },
      });

      // Update milestone progress if task is linked to a milestone
      if (task.milestoneId) {
        await updateMilestoneProgress(ctx.prisma, task.milestoneId);
      }

      // Send notifications to assigned users
      if (task.assignees && task.assignees.length > 0) {
        const { queueNotification } = await import('@/lib/queue');
        for (const assignee of task.assignees) {
          await queueNotification({
            userId: assignee.id,
            type: 'TASK_ASSIGNED',
            title: 'New Task Assigned',
            message: `You have been assigned to task "${task.name}" in project "${task.project.name}"`,
            data: {
              taskId: task.id,
              taskName: task.name,
              projectId: task.project.id,
              projectName: task.project.name,
              assignedBy: ctx.session.user.name,
            },
            projectId: task.project.id,
            taskId: task.id,
          });
        }
      }

      return task;
    }),

  /**
   * Update a task
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional().nullable(),
        status: z.nativeEnum(TaskStatus).optional(),
        priority: z.nativeEnum(Priority).optional(),
        dueDate: z.date().optional().nullable(),
        estimatedTime: z.number().min(0).optional().nullable(),
        actualTime: z.number().min(0).optional().nullable(),
        tags: z.array(z.string()).optional(),
        assigneeIds: z.array(z.string()).optional(),
        milestoneId: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, assigneeIds, ...data } = input;

      // Get the current task
      const currentTask = await ctx.prisma.task.findUnique({
        where: { id },
        include: {
          assignees: true,
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

      if (!currentTask) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      // Check permission
      if (
        ctx.session.user.role !== 'ADMIN' &&
        currentTask.project.company.users.length === 0
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this task',
        });
      }

      // Check if task is being marked as completed
      const completionData: { completedAt?: Date | null } = {};
      if (
        data.status === TaskStatus.COMPLETED &&
        currentTask.status !== TaskStatus.COMPLETED
      ) {
        completionData.completedAt = new Date();
      } else if (
        data.status &&
        data.status !== TaskStatus.COMPLETED &&
        currentTask.status === TaskStatus.COMPLETED
      ) {
        // Clear completedAt if task is being un-completed
        completionData.completedAt = null;
      }

      // Update the task
      const updatedTask = await ctx.prisma.task.update({
        where: { id },
        data: {
          ...data,
          ...completionData,
          assignees: assigneeIds
            ? {
                set: assigneeIds.map((id) => ({ id })),
              }
            : undefined,
        },
        include: {
          assignees: {
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
            },
          },
        },
      });

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: 'PROJECT_UPDATED',
          performedBy: ctx.session.user.id,
          details: {
            taskId: updatedTask.id,
            taskName: updatedTask.name,
            action: 'task_updated',
            changes: data,
          },
        },
      });

      // Update milestone progress if task status changed or milestone changed
      if (data.status || data.milestoneId !== undefined) {
        // Update new milestone if exists
        if (updatedTask.milestoneId) {
          await updateMilestoneProgress(ctx.prisma, updatedTask.milestoneId);
        }
        // Update old milestone if task was moved from another milestone
        if (currentTask.milestoneId && currentTask.milestoneId !== updatedTask.milestoneId) {
          await updateMilestoneProgress(ctx.prisma, currentTask.milestoneId);
        }
      }

      // Send notifications for status changes and assignee changes
      const { queueNotification } = await import('@/lib/queue');

      // Notify on status change
      if (input.status && currentTask.status !== input.status) {
        for (const assignee of updatedTask.assignees) {
          await queueNotification({
            userId: assignee.id,
            type: 'TASK_UPDATED',
            title: 'Task Status Changed',
            message: `Task "${updatedTask.name}" status changed from ${currentTask.status} to ${input.status}`,
            data: {
              taskId: updatedTask.id,
              taskName: updatedTask.name,
              oldStatus: currentTask.status,
              newStatus: input.status,
              updatedBy: ctx.session.user.name,
            },
            projectId: updatedTask.project.id,
            taskId: updatedTask.id,
          });
        }
      }

      // Notify on assignee changes
      if (assigneeIds) {
        const oldAssigneeIds = currentTask.assignees.map((a) => a.id);
        const newAssignees = updatedTask.assignees.filter(
          (a) => !oldAssigneeIds.includes(a.id)
        );
        const removedAssigneeIds = oldAssigneeIds.filter(
          (id) => !assigneeIds.includes(id)
        );

        // Notify newly assigned users
        for (const assignee of newAssignees) {
          await queueNotification({
            userId: assignee.id,
            type: 'TASK_ASSIGNED',
            title: 'Assigned to Task',
            message: `You have been assigned to task "${updatedTask.name}" in project "${updatedTask.project.name}"`,
            data: {
              taskId: updatedTask.id,
              taskName: updatedTask.name,
              projectId: updatedTask.project.id,
              projectName: updatedTask.project.name,
              assignedBy: ctx.session.user.name,
            },
            projectId: updatedTask.project.id,
            taskId: updatedTask.id,
          });
        }

        // Notify removed assignees
        for (const removedId of removedAssigneeIds) {
          await queueNotification({
            userId: removedId,
            type: 'TASK_UNASSIGNED',
            title: 'Removed from Task',
            message: `You have been removed from task "${updatedTask.name}"`,
            data: {
              taskId: updatedTask.id,
              taskName: updatedTask.name,
              removedBy: ctx.session.user.name,
            },
            projectId: updatedTask.project.id,
            taskId: updatedTask.id,
          });
        }
      }

      return updatedTask;
    }),

  /**
   * Delete a task
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({
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

      if (!task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      // Check permission
      if (
        ctx.session.user.role !== 'ADMIN' &&
        task.project.company.users.length === 0
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this task',
        });
      }

      // Store milestone ID before deleting task
      const milestoneId = task.milestoneId;

      await ctx.prisma.task.delete({
        where: { id: input.id },
      });

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: 'PROJECT_UPDATED',
          performedBy: ctx.session.user.id,
          details: {
            taskId: task.id,
            taskName: task.name,
            action: 'task_deleted',
          },
        },
      });

      // Update milestone progress if task was linked to a milestone
      if (milestoneId) {
        await updateMilestoneProgress(ctx.prisma, milestoneId);
      }

      return { success: true };
    }),

  /**
   * Update task order (for drag and drop in Kanban)
   */
  updateOrder: protectedProcedure
    .input(
      z.object({
        tasks: z.array(
          z.object({
            id: z.string(),
            order: z.number(),
            status: z.nativeEnum(TaskStatus),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get all current task statuses
      const currentTasks = await ctx.prisma.task.findMany({
        where: {
          id: {
            in: input.tasks.map((t) => t.id),
          },
        },
        select: {
          id: true,
          status: true,
        },
      });

      // Create a map for quick lookup
      const currentStatusMap = new Map(
        currentTasks.map((t) => [t.id, t.status])
      );

      // Track which milestones need progress updates
      const milestonesToUpdate = new Set<string>();

      await ctx.prisma.$transaction(
        input.tasks.map((task) => {
          const currentStatus = currentStatusMap.get(task.id);

          const updateData: any = {
            order: task.order,
            status: task.status,
          };

          // Set completedAt when task is marked as completed
          if (
            currentStatus &&
            task.status === TaskStatus.COMPLETED &&
            currentStatus !== TaskStatus.COMPLETED
          ) {
            updateData.completedAt = new Date();
          } else if (
            currentStatus &&
            task.status !== TaskStatus.COMPLETED &&
            currentStatus === TaskStatus.COMPLETED
          ) {
            updateData.completedAt = null;
          }

          return ctx.prisma.task.update({
            where: { id: task.id },
            data: updateData,
          });
        })
      );

      // Update milestone progress for affected milestones
      // Get all tasks with milestones to check which ones need updating
      const updatedTasksWithMilestones = await ctx.prisma.task.findMany({
        where: {
          id: { in: input.tasks.map((t) => t.id) },
          milestoneId: { not: null },
        },
        select: { milestoneId: true },
      });

      // Update progress for each affected milestone
      for (const task of updatedTasksWithMilestones) {
        if (task.milestoneId) {
          milestonesToUpdate.add(task.milestoneId);
        }
      }

      // Update all affected milestones
      await Promise.all(
        Array.from(milestonesToUpdate).map((milestoneId) =>
          updateMilestoneProgress(ctx.prisma, milestoneId)
        )
      );

      return { success: true };
    }),

  /**
   * Add a comment to a task
   */
  addComment: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify task exists and user has access
      const task = await ctx.prisma.task.findUnique({
        where: { id: input.taskId },
        include: {
          assignees: { select: { id: true, name: true } },
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

      if (!task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      if (
        ctx.session.user.role !== 'ADMIN' &&
        task.project.company.users.length === 0
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to comment on this task',
        });
      }

      const comment = await ctx.prisma.taskComment.create({
        data: {
          taskId: input.taskId,
          content: input.content,
          userId: ctx.session.user.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      // Notify task assignees about the new comment
      const { queueNotification } = await import('@/lib/queue');

      for (const assignee of task.assignees) {
        // Don't notify the comment author
        if (assignee.id !== ctx.session.user.id) {
          await queueNotification({
            userId: assignee.id,
            type: 'TASK_COMMENT',
            title: 'New Comment on Task',
            message: `${ctx.session.user.name} commented on task "${task.name}": ${input.content.substring(0, 100)}${input.content.length > 100 ? '...' : ''}`,
            data: {
              taskId: task.id,
              taskName: task.name,
              commentId: comment.id,
              commentContent: input.content,
              commentedBy: ctx.session.user.name,
            },
            projectId: task.project.id,
            taskId: task.id,
          });
        }
      }

      return comment;
    }),
});
