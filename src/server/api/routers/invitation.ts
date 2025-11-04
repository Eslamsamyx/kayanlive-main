import { z } from 'zod';
import { randomBytes } from 'crypto';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  createPermissionProcedure,
  Permission,
} from '@/server/api/trpc';
import { InvitationStatus, AuditAction, type PrismaClient, type Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { sendTemplateEmail } from '@/lib/email';

// Helper function to create enhanced audit log
const createEnhancedAuditLog = async (
  prisma: PrismaClient,
  userId: string,
  action: AuditAction,
  performedBy: string,
  entityType?: string,
  entityId?: string,
  metadata?: {
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    additionalData?: Record<string, unknown>;
  },
  ipAddress?: string,
  userAgent?: string
) => {
  return prisma.auditLog.create({
    data: {
      userId,
      action,
      performedBy,
      entityType,
      entityId,
      metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
      ipAddress,
      userAgent,
    },
  });
};

// Generate secure random token
const generateInvitationToken = (): string => {
  return randomBytes(32).toString('hex');
};

// Validation schemas
const sendInvitationSchema = z.object({
  email: z.string().email('Invalid email address'),
  projectId: z.string(),
  role: z.enum(['LEAD', 'MEMBER', 'VIEWER']).default('MEMBER'),
  permissions: z.object({
    canEdit: z.boolean().optional(),
    canDelete: z.boolean().optional(),
    canInvite: z.boolean().optional(),
  }).optional(),
  message: z.string().optional(),
  expiresInHours: z.number().min(1).max(168).default(24), // Default 24 hours, max 7 days
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

const acceptInvitationSchema = z.object({
  token: z.string(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

const cancelInvitationSchema = z.object({
  invitationId: z.string(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

const resendInvitationSchema = z.object({
  invitationId: z.string(),
  expiresInHours: z.number().min(1).max(168).default(24),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export const invitationRouter = createTRPCRouter({
  /**
   * Send project invitation via email
   * Requires PROJECT_MANAGE_MEMBERS permission
   */
  send: createPermissionProcedure(Permission.PROJECT_MANAGE_MEMBERS)
    .input(sendInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        email,
        projectId,
        role,
        permissions,
        message,
        expiresInHours,
        ipAddress,
        userAgent,
      } = input;
      const inviterId = ctx.session.user.id;

      // Verify project exists and user has access
      const project = await ctx.prisma.project.findUnique({
        where: { id: projectId },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          collaborators: {
            where: { userId: inviterId },
          },
        },
      });

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      // Check if user has permission to invite (must be LEAD or have canInvite permission)
      const userCollaborator = project.collaborators.find(
        (c) => c.userId === inviterId
      );

      if (!userCollaborator) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not a collaborator on this project',
        });
      }

      const canInvite =
        userCollaborator.role === 'LEAD' || userCollaborator.canInvite;

      if (!canInvite) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to invite users to this project',
        });
      }

      // Check if user is already a collaborator
      const existingCollaborator = await ctx.prisma.projectCollaborator.findFirst(
        {
          where: {
            projectId,
            user: {
              email: email.toLowerCase(),
            },
          },
          include: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        }
      );

      if (existingCollaborator) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `${existingCollaborator.user.name || existingCollaborator.user.email} is already a collaborator on this project`,
        });
      }

      // Check if there's a pending invitation for this email
      const existingInvitation = await ctx.prisma.invitation.findFirst({
        where: {
          email: email.toLowerCase(),
          projectId,
          status: InvitationStatus.PENDING,
          expires: {
            gt: new Date(),
          },
        },
      });

      if (existingInvitation) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'There is already a pending invitation for this email',
        });
      }

      // Generate invitation token
      const token = generateInvitationToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiresInHours);

      // Create invitation
      const invitation = await ctx.prisma.invitation.create({
        data: {
          email: email.toLowerCase(),
          token,
          status: InvitationStatus.PENDING,
          expires: expiresAt,
          projectId,
          role,
          permissions: permissions ? (permissions as Prisma.InputJsonValue) : undefined,
          invitedById: inviterId,
        },
        include: {
          invitedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              description: true,
              company: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      // Send invitation email
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const acceptUrl = `${baseUrl}/invitations/accept?token=${token}`;

      try {
        await sendTemplateEmail({
          to: email,
          template: 'invitation',
          data: {
            inviterName: invitation.invitedBy.name || invitation.invitedBy.email,
            projectName: invitation.project.name,
            projectDescription: invitation.project.description || 'No description provided',
            companyName: invitation.project.company.name,
            role: role.toLowerCase(),
            acceptUrl,
            expiresInHours,
            message: message || '',
            hasMessage: !!message,
          },
        });
      } catch (error) {
        // If email fails, delete the invitation
        await ctx.prisma.invitation.delete({
          where: { id: invitation.id },
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send invitation email',
        });
      }

      // Create audit log
      await createEnhancedAuditLog(
        ctx.prisma,
        inviterId,
        AuditAction.INVITATION_SENT,
        inviterId,
        'Invitation',
        invitation.id,
        {
          additionalData: {
            email,
            projectId,
            projectName: project.name,
            role,
            expiresAt: expiresAt.toISOString(),
          },
        },
        ipAddress,
        userAgent
      );

      return invitation;
    }),

  /**
   * Accept invitation by token (public endpoint)
   */
  accept: protectedProcedure
    .input(acceptInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      const { token, ipAddress, userAgent } = input;
      const userId = ctx.session.user.id;
      const userEmail = ctx.session.user.email;

      if (!userEmail) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User email is required',
        });
      }

      // Find invitation
      const invitation = await ctx.prisma.invitation.findUnique({
        where: { token },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              companyId: true,
            },
          },
          invitedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!invitation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invitation not found',
        });
      }

      // Verify invitation is for this user's email
      if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This invitation is not for your email address',
        });
      }

      // Check if invitation is still valid
      if (invitation.status !== InvitationStatus.PENDING) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `This invitation has already been ${invitation.status.toLowerCase()}`,
        });
      }

      if (invitation.expires < new Date()) {
        // Mark as expired
        await ctx.prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: InvitationStatus.EXPIRED },
        });

        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This invitation has expired',
        });
      }

      // Check if user is already a collaborator
      const existingCollaborator = await ctx.prisma.projectCollaborator.findUnique(
        {
          where: {
            projectId_userId: {
              projectId: invitation.projectId,
              userId,
            },
          },
        }
      );

      if (existingCollaborator) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'You are already a collaborator on this project',
        });
      }

      // Create project collaborator
      const collaborator = await ctx.prisma.projectCollaborator.create({
        data: {
          userId,
          projectId: invitation.projectId,
          role: invitation.role,
          canEdit: (invitation.permissions as { canEdit?: boolean })?.canEdit ?? true,
          canDelete: (invitation.permissions as { canDelete?: boolean })?.canDelete ?? false,
          canInvite: (invitation.permissions as { canInvite?: boolean })?.canInvite ?? false,
          addedBy: invitation.invitedById,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
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

      // Update invitation status
      await ctx.prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          status: InvitationStatus.ACCEPTED,
          acceptedById: userId,
        },
      });

      // Create audit log
      await createEnhancedAuditLog(
        ctx.prisma,
        userId,
        AuditAction.INVITATION_ACCEPTED,
        userId,
        'Invitation',
        invitation.id,
        {
          additionalData: {
            projectId: invitation.projectId,
            projectName: invitation.project.name,
            invitedById: invitation.invitedById,
            role: invitation.role,
          },
        },
        ipAddress,
        userAgent
      );

      return collaborator;
    }),

  /**
   * Cancel invitation
   * Requires PROJECT_MANAGE_MEMBERS permission or must be invitation sender
   */
  cancel: protectedProcedure
    .input(cancelInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      const { invitationId, ipAddress, userAgent } = input;
      const userId = ctx.session.user.id;

      // Find invitation
      const invitation = await ctx.prisma.invitation.findUnique({
        where: { id: invitationId },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!invitation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invitation not found',
        });
      }

      // Check permission: must be sender or have PROJECT_MANAGE_MEMBERS permission
      const hasPermission = await ctx.permissionChecker.hasPermission(
        userId,
        Permission.PROJECT_MANAGE_MEMBERS
      );

      if (invitation.invitedById !== userId && !hasPermission) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to cancel this invitation',
        });
      }

      // Check if invitation can be cancelled
      if (invitation.status !== InvitationStatus.PENDING) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot cancel invitation with status: ${invitation.status}`,
        });
      }

      // Update invitation status
      const cancelledInvitation = await ctx.prisma.invitation.update({
        where: { id: invitationId },
        data: {
          status: InvitationStatus.CANCELLED,
        },
      });

      // Create audit log
      await createEnhancedAuditLog(
        ctx.prisma,
        userId,
        AuditAction.INVITATION_CANCELLED,
        userId,
        'Invitation',
        invitationId,
        {
          oldValues: { status: invitation.status },
          newValues: { status: InvitationStatus.CANCELLED },
          additionalData: {
            projectId: invitation.projectId,
            projectName: invitation.project.name,
            invitedEmail: invitation.email,
          },
        },
        ipAddress,
        userAgent
      );

      return cancelledInvitation;
    }),

  /**
   * Resend invitation email
   * Requires PROJECT_MANAGE_MEMBERS permission or must be invitation sender
   */
  resend: protectedProcedure
    .input(resendInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      const { invitationId, expiresInHours, ipAddress, userAgent } = input;
      const userId = ctx.session.user.id;

      // Find invitation
      const invitation = await ctx.prisma.invitation.findUnique({
        where: { id: invitationId },
        include: {
          invitedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              description: true,
              company: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!invitation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invitation not found',
        });
      }

      // Check permission
      const hasPermission = await ctx.permissionChecker.hasPermission(
        userId,
        Permission.PROJECT_MANAGE_MEMBERS
      );

      if (invitation.invitedById !== userId && !hasPermission) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to resend this invitation',
        });
      }

      // Can only resend pending or expired invitations
      if (
        invitation.status !== InvitationStatus.PENDING &&
        invitation.status !== InvitationStatus.EXPIRED
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot resend invitation with status: ${invitation.status}`,
        });
      }

      // Generate new token and expiration
      const newToken = generateInvitationToken();
      const newExpiresAt = new Date();
      newExpiresAt.setHours(newExpiresAt.getHours() + expiresInHours);

      // Update invitation
      const updatedInvitation = await ctx.prisma.invitation.update({
        where: { id: invitationId },
        data: {
          token: newToken,
          status: InvitationStatus.PENDING,
          expires: newExpiresAt,
        },
        include: {
          invitedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              description: true,
              company: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      // Resend invitation email
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const acceptUrl = `${baseUrl}/invitations/accept?token=${newToken}`;

      await sendTemplateEmail({
        to: invitation.email,
        template: 'invitation',
        data: {
          inviterName: updatedInvitation.invitedBy.name || updatedInvitation.invitedBy.email,
          projectName: updatedInvitation.project.name,
          projectDescription: updatedInvitation.project.description || 'No description provided',
          companyName: updatedInvitation.project.company.name,
          role: invitation.role.toLowerCase(),
          acceptUrl,
          expiresInHours,
          message: '',
          hasMessage: false,
        },
      });

      // Create audit log
      await createEnhancedAuditLog(
        ctx.prisma,
        userId,
        AuditAction.INVITATION_SENT,
        userId,
        'Invitation',
        invitationId,
        {
          additionalData: {
            action: 'resend',
            email: invitation.email,
            projectId: invitation.projectId,
            projectName: invitation.project.name,
            newExpiresAt: newExpiresAt.toISOString(),
          },
        },
        ipAddress,
        userAgent
      );

      return updatedInvitation;
    }),

  /**
   * Get sent invitations (invitations you sent)
   */
  getSent: protectedProcedure
    .input(z.object({
      projectId: z.string().optional(),
      status: z.nativeEnum(InvitationStatus).optional(),
      page: z.number().default(1),
      limit: z.number().default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { projectId, status, page, limit } = input;
      const userId = ctx.session.user.id;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {
        invitedById: userId,
      };

      if (projectId) where.projectId = projectId;
      if (status) where.status = status;

      const [invitations, total] = await Promise.all([
        ctx.prisma.invitation.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            project: {
              select: {
                id: true,
                name: true,
                company: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            acceptedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        ctx.prisma.invitation.count({ where }),
      ]);

      return {
        invitations,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      };
    }),

  /**
   * Get received invitations (invitations for your email)
   */
  getReceived: protectedProcedure
    .input(z.object({
      status: z.nativeEnum(InvitationStatus).optional(),
      page: z.number().default(1),
      limit: z.number().default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { status, page, limit } = input;
      const userEmail = ctx.session.user.email;
      const skip = (page - 1) * limit;

      if (!userEmail) {
        return {
          invitations: [],
          total: 0,
          pages: 0,
          currentPage: page,
        };
      }

      const where: Record<string, unknown> = {
        email: userEmail.toLowerCase(),
      };

      if (status) where.status = status;

      const [invitations, total] = await Promise.all([
        ctx.prisma.invitation.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            project: {
              select: {
                id: true,
                name: true,
                description: true,
                company: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            invitedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        ctx.prisma.invitation.count({ where }),
      ]);

      return {
        invitations,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      };
    }),

  /**
   * Get invitation by token (public endpoint for preview)
   */
  getByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const invitation = await ctx.prisma.invitation.findUnique({
        where: { token: input.token },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              description: true,
              company: {
                select: {
                  name: true,
                },
              },
            },
          },
          invitedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!invitation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invitation not found',
        });
      }

      // Check if expired
      const isExpired = invitation.expires < new Date();

      return {
        ...invitation,
        isExpired,
      };
    }),

  /**
   * Get project invitations (for project managers)
   */
  getByProject: createPermissionProcedure(Permission.PROJECT_READ)
    .input(z.object({
      projectId: z.string(),
      status: z.nativeEnum(InvitationStatus).optional(),
      page: z.number().default(1),
      limit: z.number().default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { projectId, status, page, limit } = input;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {
        projectId,
      };

      if (status) where.status = status;

      const [invitations, total] = await Promise.all([
        ctx.prisma.invitation.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            invitedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            acceptedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        ctx.prisma.invitation.count({ where }),
      ]);

      return {
        invitations,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      };
    }),
});
