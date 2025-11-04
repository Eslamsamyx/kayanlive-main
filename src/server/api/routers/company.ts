import { z } from 'zod';
import {
  createTRPCRouter,
  adminProcedure,
  protectedProcedure,
} from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { CompanyType, CompanyRole } from '@prisma/client';

export const companyRouter = createTRPCRouter({
  /**
   * ADMIN: Create company
   * Only system admins can create new companies
   */
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Company name is required'),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        industry: z.string().optional(),
        website: z.string().url().optional().or(z.literal('')),
        type: z.nativeEnum(CompanyType).default('ORGANIZATION'),
        country: z.string().optional(),
        city: z.string().optional(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.prisma.company.create({
        data: {
          ...input,
          createdBy: ctx.session.user.id,
        },
        include: {
          creator: {
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
          action: 'COMPANY_CREATED',
          performedBy: ctx.session.user.id,
          details: {
            companyId: company.id,
            name: company.name,
            type: company.type,
          },
        },
      });

      return company;
    }),

  /**
   * ADMIN: Get all companies with pagination and filtering
   */
  getAll: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        type: z.nativeEnum(CompanyType).optional(),
        isActive: z.boolean().optional(),
        page: z.number().default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, type, isActive, page, limit } = input;
      const skip = (page - 1) * limit;

      const where: any = { deletedAt: null };

      if (type) where.type = type;
      if (isActive !== undefined) where.isActive = isActive;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { industry: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [companies, total] = await Promise.all([
        ctx.prisma.company.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                users: true,
                projects: true,
                assets: true,
              },
            },
          },
        }),
        ctx.prisma.company.count({ where }),
      ]);

      return {
        companies,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      };
    }),

  /**
   * ADMIN: Get single company by ID
   */
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const company = await ctx.prisma.company.findUnique({
        where: { id: input.id },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          users: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                  isActive: true,
                },
              },
            },
          },
          projects: {
            select: {
              id: true,
              name: true,
              status: true,
              createdAt: true,
            },
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              users: true,
              projects: true,
              assets: true,
            },
          },
        },
      });

      if (!company) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Company not found',
        });
      }

      return company;
    }),

  /**
   * ADMIN: Update company
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional().or(z.literal('')),
        phone: z.string().optional(),
        industry: z.string().optional(),
        website: z.string().url().optional().or(z.literal('')),
        country: z.string().optional(),
        city: z.string().optional(),
        address: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const company = await ctx.prisma.company.update({
        where: { id },
        data: updateData,
      });

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: 'COMPANY_UPDATED',
          performedBy: ctx.session.user.id,
          details: {
            companyId: company.id,
            changes: updateData,
          },
        },
      });

      return company;
    }),

  /**
   * ADMIN: Delete company (soft delete)
   */
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.prisma.company.update({
        where: { id: input.id },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      });

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: 'COMPANY_DELETED',
          performedBy: ctx.session.user.id,
          details: {
            companyId: company.id,
            name: company.name,
          },
        },
      });

      return company;
    }),

  /**
   * ADMIN: Add user to company
   */
  addUser: adminProcedure
    .input(
      z.object({
        companyId: z.string(),
        userId: z.string(),
        role: z.nativeEnum(CompanyRole).default('MEMBER'),
        canCreateProjects: z.boolean().default(false),
        canManageUsers: z.boolean().default(false),
        canManageAssets: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { companyId, userId, role, canCreateProjects, canManageUsers, canManageAssets } =
        input;

      // Check if user exists
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Check if company exists
      const company = await ctx.prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Company not found',
        });
      }

      // Check if user is already in company
      const existing = await ctx.prisma.companyUser.findUnique({
        where: {
          companyId_userId: {
            companyId,
            userId,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User is already a member of this company',
        });
      }

      const companyUser = await ctx.prisma.companyUser.create({
        data: {
          companyId,
          userId,
          role,
          canCreateProjects,
          canManageUsers,
          canManageAssets,
          invitedBy: ctx.session.user.id,
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
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Update user role to CLIENT if not already an admin/moderator
      if (user.role === 'CONTENT_CREATOR') {
        await ctx.prisma.user.update({
          where: { id: userId },
          data: { role: 'CLIENT' },
        });
      }

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: 'COMPANY_USER_ADDED',
          performedBy: ctx.session.user.id,
          details: {
            companyId,
            userId,
            role,
            companyName: company.name,
            userName: user.name || user.email,
          },
        },
      });

      return companyUser;
    }),

  /**
   * ADMIN: Remove user from company
   */
  removeUser: adminProcedure
    .input(
      z.object({
        companyId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { companyId, userId } = input;

      const companyUser = await ctx.prisma.companyUser.findUnique({
        where: {
          companyId_userId: {
            companyId,
            userId,
          },
        },
        include: {
          user: true,
          company: true,
        },
      });

      if (!companyUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User is not a member of this company',
        });
      }

      await ctx.prisma.companyUser.delete({
        where: {
          companyId_userId: {
            companyId,
            userId,
          },
        },
      });

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: 'COMPANY_USER_REMOVED',
          performedBy: ctx.session.user.id,
          details: {
            companyId,
            userId,
            companyName: companyUser.company.name,
            userName: companyUser.user.name || companyUser.user.email,
          },
        },
      });

      return { success: true };
    }),

  /**
   * ADMIN: Update user role in company
   */
  updateUserRole: adminProcedure
    .input(
      z.object({
        companyId: z.string(),
        userId: z.string(),
        role: z.nativeEnum(CompanyRole),
        canCreateProjects: z.boolean().optional(),
        canManageUsers: z.boolean().optional(),
        canManageAssets: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { companyId, userId, role, canCreateProjects, canManageUsers, canManageAssets } =
        input;

      const updateData: any = { role };
      if (canCreateProjects !== undefined) updateData.canCreateProjects = canCreateProjects;
      if (canManageUsers !== undefined) updateData.canManageUsers = canManageUsers;
      if (canManageAssets !== undefined) updateData.canManageAssets = canManageAssets;

      const companyUser = await ctx.prisma.companyUser.update({
        where: {
          companyId_userId: {
            companyId,
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

      return companyUser;
    }),

  /**
   * Protected: Get user's companies
   * Returns all companies the current user belongs to
   */
  getMyCompanies: protectedProcedure.query(async ({ ctx }) => {
    const companies = await ctx.prisma.companyUser.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        company: {
          include: {
            _count: {
              select: {
                projects: true,
                users: true,
                assets: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    return companies.map((cu) => ({
      ...cu.company,
      myRole: cu.role,
      permissions: {
        canCreateProjects: cu.canCreateProjects,
        canManageUsers: cu.canManageUsers,
        canManageAssets: cu.canManageAssets,
      },
      joinedAt: cu.joinedAt,
    }));
  }),

  /**
   * ADMIN: Get companies for a specific user
   * Returns all companies a specific user belongs to
   */
  getUserCompanies: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const companies = await ctx.prisma.companyUser.findMany({
        where: {
          userId: input.userId,
        },
        include: {
          company: {
            include: {
              _count: {
                select: {
                  projects: true,
                  users: true,
                  assets: true,
                },
              },
            },
          },
        },
        orderBy: {
          joinedAt: 'desc',
        },
      });

      return companies.map((cu) => ({
        id: cu.id,
        company: cu.company,
        role: cu.role,
        permissions: {
          canCreateProjects: cu.canCreateProjects,
          canManageUsers: cu.canManageUsers,
          canManageAssets: cu.canManageAssets,
        },
        joinedAt: cu.joinedAt,
      }));
    }),

  /**
   * ADMIN: Get company statistics
   */
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [total, active, byType] = await Promise.all([
      ctx.prisma.company.count({
        where: { deletedAt: null },
      }),
      ctx.prisma.company.count({
        where: {
          deletedAt: null,
          isActive: true,
        },
      }),
      ctx.prisma.company.groupBy({
        by: ['type'],
        where: { deletedAt: null },
        _count: true,
      }),
    ]);

    const typeDistribution: Record<string, number> = {};
    byType.forEach((item) => {
      typeDistribution[item.type] = item._count;
    });

    return {
      total,
      active,
      inactive: total - active,
      typeDistribution,
    };
  }),
});
