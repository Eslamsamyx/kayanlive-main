import { z } from 'zod';
import {
  createTRPCRouter,
  adminProcedure,
  protectedProcedure,
} from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { ProjectStatus } from '@prisma/client';

export const projectRouter = createTRPCRouter({
  /**
   * Create project
   * Admin or company members with canCreateProjects permission
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Project name is required'),
        description: z.string().optional(),
        companyId: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        budget: z.number().optional(),
        status: z.nativeEnum(ProjectStatus).default('DRAFT'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to create projects in this company
      if (ctx.session.user.role !== 'ADMIN') {
        const companyUser = await ctx.prisma.companyUser.findUnique({
          where: {
            companyId_userId: {
              companyId: input.companyId,
              userId: ctx.session.user.id,
            },
          },
        });

        if (!companyUser || !companyUser.canCreateProjects) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message:
              'You do not have permission to create projects in this company',
          });
        }
      }

      const project = await ctx.prisma.project.create({
        data: {
          ...input,
          createdBy: ctx.session.user.id,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Automatically add creator as project lead
      await ctx.prisma.projectCollaborator.create({
        data: {
          projectId: project.id,
          userId: ctx.session.user.id,
          role: 'LEAD',
          canEdit: true,
          canDelete: true,
          canInvite: true,
          addedBy: ctx.session.user.id,
        },
      });

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: 'PROJECT_CREATED',
          performedBy: ctx.session.user.id,
          details: {
            projectId: project.id,
            projectName: project.name,
            companyId: project.companyId,
            companyName: project.company.name,
          },
        },
      });

      return project;
    }),

  /**
   * Get all projects
   * Filtered by company membership for non-admin users
   */
  getAll: protectedProcedure
    .input(
      z.object({
        companyId: z.string().optional(),
        status: z.nativeEnum(ProjectStatus).optional(),
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { companyId, status, search, page, limit } = input;
      const skip = (page - 1) * limit;

      const where: any = { deletedAt: null };

      // If not admin, only show projects from companies user belongs to
      if (ctx.session.user.role !== 'ADMIN') {
        const userCompanies = await ctx.prisma.companyUser.findMany({
          where: { userId: ctx.session.user.id },
          select: { companyId: true },
        });

        const companyIds = userCompanies.map((uc) => uc.companyId);

        if (companyIds.length === 0) {
          return {
            projects: [],
            total: 0,
            pages: 0,
            currentPage: page,
          };
        }

        where.companyId = { in: companyIds };
      }

      if (companyId) where.companyId = companyId;
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [projects, total] = await Promise.all([
        ctx.prisma.project.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                collaborators: true,
                questionnaires: true,
                assets: true,
              },
            },
          },
        }),
        ctx.prisma.project.count({ where }),
      ]);

      return {
        projects,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      };
    }),

  /**
   * Get project by ID
   * Checks if user has access to the project
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.id },
        include: {
          company: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          collaborators: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
          questionnaires: {
            select: {
              id: true,
              questionnaireId: true,
              isComplete: true,
              submittedAt: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              assets: true,
              collaborators: true,
              questionnaires: true,
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

      // Check if user has access to this project
      if (ctx.session.user.role !== 'ADMIN') {
        const hasAccess = await ctx.prisma.companyUser.findUnique({
          where: {
            companyId_userId: {
              companyId: project.companyId,
              userId: ctx.session.user.id,
            },
          },
        });

        if (!hasAccess) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have access to this project',
          });
        }
      }

      return project;
    }),

  /**
   * Update project
   * Only admins or project leads can update
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        status: z.nativeEnum(ProjectStatus).optional(),
        startDate: z.date().optional().nullable(),
        endDate: z.date().optional().nullable(),
        budget: z.number().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Check if user has permission to update
      if (ctx.session.user.role !== 'ADMIN') {
        const collaboration = await ctx.prisma.projectCollaborator.findUnique({
          where: {
            projectId_userId: {
              projectId: id,
              userId: ctx.session.user.id,
            },
          },
        });

        if (!collaboration || !collaboration.canEdit) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to update this project',
          });
        }
      }

      const project = await ctx.prisma.project.update({
        where: { id },
        data: updateData,
        include: {
          company: {
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
            projectId: project.id,
            projectName: project.name,
            changes: updateData,
          },
        },
      });

      return project;
    }),

  /**
   * Delete project (soft delete)
   * Only admins or project leads with canDelete permission
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to delete
      if (ctx.session.user.role !== 'ADMIN') {
        const collaboration = await ctx.prisma.projectCollaborator.findUnique({
          where: {
            projectId_userId: {
              projectId: input.id,
              userId: ctx.session.user.id,
            },
          },
        });

        if (!collaboration || !collaboration.canDelete) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to delete this project',
          });
        }
      }

      const project = await ctx.prisma.project.update({
        where: { id: input.id },
        data: {
          deletedAt: new Date(),
        },
      });

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: 'PROJECT_DELETED',
          performedBy: ctx.session.user.id,
          details: {
            projectId: project.id,
            projectName: project.name,
          },
        },
      });

      return project;
    }),

  /**
   * Add collaborator to project
   */
  addCollaborator: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string(),
        role: z.string().default('MEMBER'), // LEAD, MEMBER, VIEWER
        canEdit: z.boolean().default(true),
        canDelete: z.boolean().default(false),
        canInvite: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user has permission to add collaborators
      if (ctx.session.user.role !== 'ADMIN') {
        const myCollaboration = await ctx.prisma.projectCollaborator.findUnique({
          where: {
            projectId_userId: {
              projectId: input.projectId,
              userId: ctx.session.user.id,
            },
          },
        });

        if (!myCollaboration?.canInvite) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You cannot add collaborators to this project',
          });
        }
      }

      // Check if user is already a collaborator
      const existing = await ctx.prisma.projectCollaborator.findUnique({
        where: {
          projectId_userId: {
            projectId: input.projectId,
            userId: input.userId,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User is already a collaborator on this project',
        });
      }

      // Verify project exists
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.projectId },
        select: { id: true },
      });

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      // Verify user exists
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        select: { id: true },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const collaborator = await ctx.prisma.projectCollaborator.create({
        data: {
          projectId: input.projectId,
          userId: input.userId,
          role: input.role,
          canEdit: input.canEdit,
          canDelete: input.canDelete,
          canInvite: input.canInvite,
          addedBy: ctx.session.user.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: 'PROJECT_COLLABORATOR_ADDED',
          performedBy: ctx.session.user.id,
          details: {
            projectId: input.projectId,
            userId: input.userId,
            role: input.role,
          },
        },
      });

      return collaborator;
    }),

  /**
   * Remove collaborator from project
   */
  removeCollaborator: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user has permission
      if (ctx.session.user.role !== 'ADMIN') {
        const myCollaboration = await ctx.prisma.projectCollaborator.findUnique({
          where: {
            projectId_userId: {
              projectId: input.projectId,
              userId: ctx.session.user.id,
            },
          },
        });

        if (!myCollaboration?.canInvite) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You cannot remove collaborators from this project',
          });
        }
      }

      await ctx.prisma.projectCollaborator.delete({
        where: {
          projectId_userId: {
            projectId: input.projectId,
            userId: input.userId,
          },
        },
      });

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: 'PROJECT_COLLABORATOR_REMOVED',
          performedBy: ctx.session.user.id,
          details: {
            projectId: input.projectId,
            userId: input.userId,
          },
        },
      });

      return { success: true };
    }),

  /**
   * Update collaborator permissions
   */
  updateCollaborator: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string(),
        role: z.string().optional(),
        canEdit: z.boolean().optional(),
        canDelete: z.boolean().optional(),
        canInvite: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { projectId, userId, ...updateData } = input;

      // Verify user has permission
      if (ctx.session.user.role !== 'ADMIN') {
        const myCollaboration = await ctx.prisma.projectCollaborator.findUnique({
          where: {
            projectId_userId: {
              projectId,
              userId: ctx.session.user.id,
            },
          },
        });

        if (!myCollaboration?.canInvite) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You cannot update collaborator permissions',
          });
        }
      }

      const collaborator = await ctx.prisma.projectCollaborator.update({
        where: {
          projectId_userId: {
            projectId,
            userId,
          },
        },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return collaborator;
    }),

  /**
   * Get my projects
   * Returns projects where user is a collaborator
   */
  getMyProjects: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.prisma.projectCollaborator.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        project: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                collaborators: true,
                questionnaires: true,
                assets: true,
              },
            },
          },
        },
      },
      orderBy: {
        addedAt: 'desc',
      },
    });

    return projects.map((pc) => ({
      ...pc.project,
      myRole: pc.role,
      permissions: {
        canEdit: pc.canEdit,
        canDelete: pc.canDelete,
        canInvite: pc.canInvite,
      },
    }));
  }),

  /**
   * ADMIN: Get project statistics
   */
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [total, byStatus] = await Promise.all([
      ctx.prisma.project.count({
        where: { deletedAt: null },
      }),
      ctx.prisma.project.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: true,
      }),
    ]);

    const statusDistribution: Record<string, number> = {};
    byStatus.forEach((item) => {
      statusDistribution[item.status] = item._count;
    });

    return {
      total,
      statusDistribution,
    };
  }),

  /**
   * Link questionnaire submission to project
   */
  linkQuestionnaire: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        submissionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user has permission to edit project
      if (ctx.session.user.role !== 'ADMIN') {
        const collaboration = await ctx.prisma.projectCollaborator.findUnique({
          where: {
            projectId_userId: {
              projectId: input.projectId,
              userId: ctx.session.user.id,
            },
          },
        });

        if (!collaboration?.canEdit) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to link questionnaires to this project',
          });
        }
      }

      // Verify submission exists
      const submission = await ctx.prisma.questionnaireSubmission.findUnique({
        where: { id: input.submissionId },
      });

      if (!submission) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Questionnaire submission not found',
        });
      }

      // Check if already linked to a different project
      if (submission.projectId && submission.projectId !== input.projectId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This questionnaire is already linked to another project',
        });
      }

      // Link the submission to the project
      const updatedSubmission = await ctx.prisma.questionnaireSubmission.update({
        where: { id: input.submissionId },
        data: { projectId: input.projectId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: 'QUESTIONNAIRE_LINKED_TO_PROJECT',
          performedBy: ctx.session.user.id,
          details: {
            projectId: input.projectId,
            submissionId: input.submissionId,
            questionnaireId: submission.questionnaireId,
          },
        },
      });

      return updatedSubmission;
    }),

  /**
   * Unlink questionnaire submission from project
   */
  unlinkQuestionnaire: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        submissionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user has permission to edit project
      if (ctx.session.user.role !== 'ADMIN') {
        const collaboration = await ctx.prisma.projectCollaborator.findUnique({
          where: {
            projectId_userId: {
              projectId: input.projectId,
              userId: ctx.session.user.id,
            },
          },
        });

        if (!collaboration?.canEdit) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to unlink questionnaires from this project',
          });
        }
      }

      // Verify submission exists and is linked to this project
      const submission = await ctx.prisma.questionnaireSubmission.findUnique({
        where: { id: input.submissionId },
      });

      if (!submission) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Questionnaire submission not found',
        });
      }

      if (submission.projectId !== input.projectId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This questionnaire is not linked to this project',
        });
      }

      // Unlink the submission from the project
      await ctx.prisma.questionnaireSubmission.update({
        where: { id: input.submissionId },
        data: { projectId: null },
      });

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: 'QUESTIONNAIRE_UNLINKED_FROM_PROJECT',
          performedBy: ctx.session.user.id,
          details: {
            projectId: input.projectId,
            submissionId: input.submissionId,
            questionnaireId: submission.questionnaireId,
          },
        },
      });

      return { success: true };
    }),

  /**
   * Get available questionnaires (not linked to any project or linked to this project)
   */
  getAvailableQuestionnaires: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get all questionnaires that are either not linked to any project
      // or already linked to this project
      const questionnaires = await ctx.prisma.questionnaireSubmission.findMany({
        where: {
          OR: [
            { projectId: null },
            { projectId: input.projectId },
          ],
        },
        include: {
          user: {
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

      return questionnaires;
    }),

  /**
   * Get available company users who can be added as collaborators
   */
  getAvailableCollaborators: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify project exists
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.projectId },
        select: { id: true },
      });

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      // Get existing collaborators
      const existingCollaborators = await ctx.prisma.projectCollaborator.findMany({
        where: { projectId: input.projectId },
        select: { userId: true },
      });

      const existingCollaboratorIds = existingCollaborators.map((c) => c.userId);

      // Get all users who are not already collaborators
      const whereClause: any = {
        id: {
          notIn: existingCollaboratorIds,
        },
      };

      if (input.search) {
        whereClause.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { email: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      const users = await ctx.prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      return users;
    }),
});
