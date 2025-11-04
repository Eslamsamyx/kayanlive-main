import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure, moderatorProcedure, canManageUser } from '@/server/api/trpc';
import { UserRole, AuditAction, type PrismaClient, type Prisma } from '@prisma/client';
import bcryptjs from 'bcryptjs';

// Helper function to create audit log
const createAuditLog = async (
  prisma: PrismaClient,
  userId: string,
  action: AuditAction,
  performedBy: string,
  details?: Prisma.InputJsonValue,
  ipAddress?: string,
  userAgent?: string
) => {
  return prisma.auditLog.create({
    data: {
      userId,
      action,
      performedBy,
      details,
      ipAddress,
      userAgent,
    },
  });
};

const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(UserRole).default('CONTENT_CREATOR'),
});

const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(UserRole).optional(),
  emailVerified: z.date().nullable().optional(),
  isActive: z.boolean().optional(),
});

const bulkUpdateSchema = z.object({
  userIds: z.array(z.string()),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
});

const advancedSearchSchema = z.object({
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  page: z.number().default(1),
  limit: z.number().default(10),
  sortBy: z.enum(['createdAt', 'updatedAt', 'lastLogin', 'name', 'email']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const changePasswordSchema = z.object({
  id: z.string(),
  currentPassword: z.string(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export const userRouter = createTRPCRouter({
  create: adminProcedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      const { password, ...userData } = input;

      // Check if user already exists
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcryptjs.hash(password, 12);

      const createdUser = await ctx.prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Create audit log
      await createAuditLog(
        ctx.prisma,
        ctx.session.user.id,
        'USER_CREATED' as AuditAction,
        ctx.session.user.id,
        { createdUserId: createdUser.id, userEmail: createdUser.email, role: createdUser.role }
      );

      return createdUser;
    }),

  getAll: moderatorProcedure
    .input(advancedSearchSchema)
    .query(async ({ ctx, input }) => {
      const { search, role, isActive, page, limit, sortBy, sortOrder } = input;
      const skip = (page - 1) * limit;

      // Build where clause for advanced filtering
      const where: Record<string, unknown> = {};

      if (role) where.role = role;
      if (isActive !== undefined) where.isActive = isActive;

      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        ctx.prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            emailVerified: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        ctx.prisma.user.count({ where }),
      ]);

      return {
        users,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      };
    }),

  getById: moderatorProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }),

  update: moderatorProcedure
    .input(updateUserSchema.extend({
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ipAddress, userAgent, ...updateData } = input;
      const performedBy = ctx.session.user.id;
      const currentUserRole = ctx.session.user.role;

      // Get target user to check permissions
      const targetUser = await ctx.prisma.user.findUnique({
        where: { id },
        select: { role: true, email: true, name: true },
      });

      if (!targetUser) {
        throw new Error('User not found');
      }

      // Check if current user can manage target user
      if (!canManageUser(currentUserRole, targetUser.role)) {
        throw new Error('Insufficient permissions to manage this user');
      }

      // Check email uniqueness if email is being updated
      if (updateData.email) {
        const existingUser = await ctx.prisma.user.findUnique({
          where: { email: updateData.email },
        });

        if (existingUser && existingUser.id !== id) {
          throw new Error('A user with this email already exists');
        }
      }

      // Get original user data for audit
      const originalUser = await ctx.prisma.user.findUnique({
        where: { id },
        select: { role: true, isActive: true, name: true, email: true },
      });

      const updatedUser = await ctx.prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Create audit log
      await createAuditLog(
        ctx.prisma,
        performedBy,
        'USER_UPDATED' as AuditAction,
        performedBy,
        { updatedUserId: id, originalUser, updateData },
        ipAddress,
        userAgent
      );

      return updatedUser;
    }),

  changePassword: adminProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, currentPassword, newPassword } = input;

      // Get user with password
      const user = await ctx.prisma.user.findUnique({
        where: { id },
        select: { password: true },
      });

      if (!user || !user.password) {
        throw new Error('User not found or no password set');
      }

      // Verify current password
      const isValidPassword = await bcryptjs.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcryptjs.hash(newPassword, 12);

      return ctx.prisma.user.update({
        where: { id },
        data: { password: hashedNewPassword },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const targetUser = await ctx.prisma.user.findUnique({
        where: { id: input.id },
        select: { email: true, name: true, role: true },
      });

      if (!targetUser) {
        throw new Error('User not found');
      }

      const deletedUser = await ctx.prisma.user.delete({
        where: { id: input.id },
      });

      // Create audit log
      await createAuditLog(
        ctx.prisma,
        ctx.session.user.id,
        'USER_DELETED' as AuditAction,
        ctx.session.user.id,
        { deletedUserId: input.id, deletedUserEmail: targetUser.email, deletedUserRole: targetUser.role }
      );

      return deletedUser;
    }),

  authenticate: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          password: true,
        },
      });

      if (!user || !user.password) {
        throw new Error('Invalid credentials');
      }

      const isValidPassword = await bcryptjs.compare(input.password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }),

  toggleStatus: moderatorProcedure
    .input(z.object({
      id: z.string(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ipAddress, userAgent } = input;
      const performedBy = ctx.session.user.id;
      const currentUserRole = ctx.session.user.role;

      const user = await ctx.prisma.user.findUnique({
        where: { id },
        select: { isActive: true, email: true, role: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Check if current user can manage target user
      if (!canManageUser(currentUserRole, user.role)) {
        throw new Error('Insufficient permissions to manage this user');
      }

      const newStatus = !user.isActive;
      const action = newStatus ? 'USER_ACTIVATED' : 'USER_DEACTIVATED';

      const updatedUser = await ctx.prisma.user.update({
        where: { id },
        data: { isActive: newStatus },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      // Create audit log
      await createAuditLog(
        ctx.prisma,
        performedBy,
        action as AuditAction,
        performedBy,
        { targetUserId: id, previousStatus: user.isActive, newStatus },
        ipAddress,
        userAgent
      );

      return updatedUser;
    }),

  bulkUpdate: moderatorProcedure
    .input(bulkUpdateSchema.extend({
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userIds, ipAddress, userAgent, ...updateData } = input;
      const performedBy = ctx.session.user.id;
      const currentUserRole = ctx.session.user.role;

      // For moderators, check they can't bulk update admin users
      if (currentUserRole === 'MODERATOR') {
        const adminUsers = await ctx.prisma.user.count({
          where: {
            id: { in: userIds },
            role: 'ADMIN'
          }
        });
        if (adminUsers > 0) {
          throw new Error('Moderators cannot bulk update admin users');
        }
      }

      const result = await ctx.prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: updateData,
      });

      // Create audit log for bulk operation
      await createAuditLog(
        ctx.prisma,
        performedBy,
        'BULK_UPDATE' as AuditAction,
        performedBy,
        { userIds, updateData, affectedCount: result.count },
        ipAddress,
        userAgent
      );

      return result;
    }),

  getAuditLog: moderatorProcedure
    .input(z.object({
      userId: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { userId, page, limit } = input;
      const skip = (page - 1) * limit;

      const where = userId ? { userId } : {};

      const [logs, total] = await Promise.all([
        ctx.prisma.auditLog.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { email: true, name: true },
            },
            performer: {
              select: { email: true, name: true },
            },
          },
        }),
        ctx.prisma.auditLog.count({ where }),
      ]);

      return {
        logs,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      };
    }),

  updateLastLogin: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Users can only update their own last login
      if (ctx.session.user.id !== input.userId) {
        throw new Error('Can only update your own login time');
      }
      return ctx.prisma.user.update({
        where: { id: input.userId },
        data: { lastLogin: new Date() },
        select: { id: true, lastLogin: true },
      });
    }),

  getAnalytics: moderatorProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = input;

      // Base where clause for date filtering
      const dateFilter = startDate && endDate ? {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      } : {};

      const [
        totalUsers,
        activeUsers,
        recentRegistrations,
        roleDistribution,
        loginStats
      ] = await Promise.all([
        ctx.prisma.user.count(),
        ctx.prisma.user.count({ where: { isActive: true } }),
        ctx.prisma.user.count({ where: dateFilter }),
        Promise.all([
          ctx.prisma.user.count({ where: { role: 'ADMIN' } }),
          ctx.prisma.user.count({ where: { role: 'MODERATOR' } }),
          ctx.prisma.user.count({ where: { role: 'CONTENT_CREATOR' } }),
        ]),
        ctx.prisma.user.count({ where: { lastLogin: { not: null } } }),
      ]);

      return {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        recentRegistrations,
        roleDistribution: {
          admins: roleDistribution[0],
          moderators: roleDistribution[1],
          contentCreators: roleDistribution[2],
        },
        loginStats: {
          usersWithLogin: loginStats,
          usersNeverLoggedIn: totalUsers - loginStats,
        },
      };
    }),

  getStats: moderatorProcedure.query(async ({ ctx }) => {
    // Get all role counts dynamically
    const allRoles = Object.values(UserRole);

    const [total, ...roleCounts] = await Promise.all([
      ctx.prisma.user.count(),
      ...allRoles.map(role =>
        ctx.prisma.user.count({ where: { role } })
      ),
    ]);

    // Build role distribution object
    const roleDistribution: Record<string, number> = {};
    allRoles.forEach((role, index) => {
      roleDistribution[role] = roleCounts[index] || 0;
    });

    return {
      total,
      roleDistribution,
    };
  }),
});