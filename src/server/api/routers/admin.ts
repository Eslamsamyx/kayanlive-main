import { z } from 'zod';
import {
  createTRPCRouter,
  adminProcedure,
  createPermissionProcedure,
  Permission,
} from '@/server/api/trpc';
import { UserRole, AuditAction, type PrismaClient, type Prisma } from '@prisma/client';
import {
  DEFAULT_ROLE_PERMISSIONS,
  AUDIT_ACTIONS,
  canManageUserByRole,
} from '@/lib/permissions';

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

// Validation schemas
const updateUserPermissionsSchema = z.object({
  userId: z.string(),
  permissions: z.array(z.nativeEnum(Permission)),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

const toggleDownloadAccessSchema = z.object({
  userId: z.string(),
  canDownloadDirectly: z.boolean(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

const roleTemplateSchema = z.object({
  role: z.nativeEnum(UserRole),
  permissions: z.array(z.nativeEnum(Permission)),
  category: z.string(),
  description: z.string().optional(),
});

const updateRoleTemplateSchema = roleTemplateSchema.extend({
  id: z.string(),
});

const auditLogFilterSchema = z.object({
  userId: z.string().optional(),
  action: z.nativeEnum(AuditAction).optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  page: z.number().default(1),
  limit: z.number().default(50),
  sortBy: z.enum(['createdAt', 'action', 'userId']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const adminRouter = createTRPCRouter({
  // ============================================
  // PERMISSION MANAGEMENT
  // ============================================

  /**
   * Update user's additional permissions beyond their role defaults
   * Requires USER_UPDATE_PERMISSIONS permission
   */
  updateUserPermissions: createPermissionProcedure(Permission.USER_UPDATE_PERMISSIONS)
    .input(updateUserPermissionsSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId, permissions, ipAddress, userAgent } = input;
      const performedBy = ctx.session.user.id;
      const currentUserRole = ctx.session.user.role;

      // Get target user
      const targetUser = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: {
          role: true,
          additionalPermissions: true,
          email: true,
          name: true,
        },
      });

      if (!targetUser) {
        throw new Error('User not found');
      }

      // Check if current user can manage target user
      if (!canManageUserByRole(currentUserRole, targetUser.role)) {
        throw new Error('Insufficient permissions to manage this user');
      }

      // Update user permissions
      const updatedUser = await ctx.prisma.user.update({
        where: { id: userId },
        data: {
          additionalPermissions: permissions,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          additionalPermissions: true,
        },
      });

      // Create enhanced audit log
      await createEnhancedAuditLog(
        ctx.prisma,
        userId,
        AuditAction.USER_PERMISSIONS_UPDATED,
        performedBy,
        'User',
        userId,
        {
          oldValues: { additionalPermissions: targetUser.additionalPermissions },
          newValues: { additionalPermissions: permissions },
          additionalData: {
            targetUserEmail: targetUser.email,
            targetUserRole: targetUser.role,
          },
        },
        ipAddress,
        userAgent
      );

      return updatedUser;
    }),

  /**
   * Toggle user's direct download access (bypass approval workflow)
   * Requires USER_UPDATE_PERMISSIONS permission
   */
  toggleDownloadAccess: createPermissionProcedure(Permission.USER_UPDATE_PERMISSIONS)
    .input(toggleDownloadAccessSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId, canDownloadDirectly, ipAddress, userAgent } = input;
      const performedBy = ctx.session.user.id;
      const currentUserRole = ctx.session.user.role;

      // Get target user
      const targetUser = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: {
          role: true,
          canDownloadDirectly: true,
          email: true,
        },
      });

      if (!targetUser) {
        throw new Error('User not found');
      }

      // Check if current user can manage target user
      if (!canManageUserByRole(currentUserRole, targetUser.role)) {
        throw new Error('Insufficient permissions to manage this user');
      }

      // Update download access
      const updatedUser = await ctx.prisma.user.update({
        where: { id: userId },
        data: { canDownloadDirectly },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          canDownloadDirectly: true,
        },
      });

      // Create enhanced audit log
      await createEnhancedAuditLog(
        ctx.prisma,
        userId,
        AuditAction.USER_DOWNLOAD_ACCESS_CHANGED,
        performedBy,
        'User',
        userId,
        {
          oldValues: { canDownloadDirectly: targetUser.canDownloadDirectly },
          newValues: { canDownloadDirectly },
          additionalData: {
            targetUserEmail: targetUser.email,
            targetUserRole: targetUser.role,
          },
        },
        ipAddress,
        userAgent
      );

      return updatedUser;
    }),

  /**
   * Get user's full permissions (role defaults + additional permissions)
   * Requires ADMIN_FULL_ACCESS permission
   */
  getUserPermissions: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const permissions = await ctx.permissionChecker.getUserPermissions(input.userId);

      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        select: {
          role: true,
          additionalPermissions: true,
        },
      });

      return {
        allPermissions: permissions,
        rolePermissions: user?.role
          ? DEFAULT_ROLE_PERMISSIONS[user.role] || []
          : [],
        additionalPermissions: user?.additionalPermissions || [],
      };
    }),

  // ============================================
  // ROLE TEMPLATE MANAGEMENT
  // ============================================

  /**
   * Get all role templates (customized role permissions)
   * Requires ADMIN_MANAGE_ROLES permission
   */
  getAllRoleTemplates: createPermissionProcedure(Permission.ADMIN_MANAGE_ROLES)
    .query(async ({ ctx }) => {
      const templates = await ctx.prisma.roleTemplate.findMany({
        include: {
          updatedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      // Include default permissions for roles without templates
      const allRoles = Object.keys(DEFAULT_ROLE_PERMISSIONS) as UserRole[];
      const templatesMap = new Map(templates.map((t) => [t.role, t]));

      return allRoles.map((role) => {
        const template = templatesMap.get(role);
        if (template) {
          return template;
        }

        // Return default permissions for roles without custom templates
        return {
          id: `default-${role}`,
          role,
          permissions: DEFAULT_ROLE_PERMISSIONS[role] || [],
          category: 'Default',
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          updatedById: null,
          updatedBy: null,
          isDefault: true,
        };
      });
    }),

  /**
   * Get role template by role
   * Requires ADMIN_MANAGE_ROLES permission
   */
  getRoleTemplate: createPermissionProcedure(Permission.ADMIN_MANAGE_ROLES)
    .input(z.object({ role: z.nativeEnum(UserRole) }))
    .query(async ({ ctx, input }) => {
      const template = await ctx.prisma.roleTemplate.findUnique({
        where: { role: input.role },
        include: {
          updatedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (template) {
        return template;
      }

      // Return default permissions if no custom template exists
      return {
        id: `default-${input.role}`,
        role: input.role,
        permissions: DEFAULT_ROLE_PERMISSIONS[input.role] || [],
        category: 'Default',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedById: null,
        updatedBy: null,
        isDefault: true,
      };
    }),

  /**
   * Create or update role template (customize role permissions)
   * Requires ADMIN_MANAGE_ROLES permission
   */
  upsertRoleTemplate: createPermissionProcedure(Permission.ADMIN_MANAGE_ROLES)
    .input(roleTemplateSchema.extend({
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { ipAddress, userAgent, ...templateData } = input;
      const performedBy = ctx.session.user.id;

      // Check if template already exists
      const existingTemplate = await ctx.prisma.roleTemplate.findUnique({
        where: { role: input.role },
      });

      const isUpdate = !!existingTemplate;

      // Upsert role template
      const template = await ctx.prisma.roleTemplate.upsert({
        where: { role: input.role },
        create: {
          ...templateData,
          updatedById: performedBy,
        },
        update: {
          ...templateData,
          updatedById: performedBy,
        },
        include: {
          updatedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Create enhanced audit log
      await createEnhancedAuditLog(
        ctx.prisma,
        performedBy,
        isUpdate ? AuditAction.ROLE_TEMPLATE_UPDATED : AuditAction.ROLE_TEMPLATE_CREATED,
        performedBy,
        'RoleTemplate',
        template.id,
        {
          oldValues: existingTemplate
            ? {
                permissions: existingTemplate.permissions,
                description: existingTemplate.description,
              }
            : undefined,
          newValues: {
            permissions: templateData.permissions,
            description: templateData.description,
          },
          additionalData: {
            role: input.role,
            category: input.category,
          },
        },
        ipAddress,
        userAgent
      );

      return template;
    }),

  /**
   * Delete role template (reset to default permissions)
   * Requires ADMIN_MANAGE_ROLES permission
   */
  deleteRoleTemplate: createPermissionProcedure(Permission.ADMIN_MANAGE_ROLES)
    .input(z.object({
      role: z.nativeEnum(UserRole),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { role, ipAddress, userAgent } = input;
      const performedBy = ctx.session.user.id;

      // Get template before deletion for audit log
      const template = await ctx.prisma.roleTemplate.findUnique({
        where: { role },
      });

      if (!template) {
        throw new Error('Role template not found');
      }

      // Delete template
      await ctx.prisma.roleTemplate.delete({
        where: { role },
      });

      // Create enhanced audit log
      await createEnhancedAuditLog(
        ctx.prisma,
        performedBy,
        AuditAction.ROLE_TEMPLATE_DELETED,
        performedBy,
        'RoleTemplate',
        template.id,
        {
          oldValues: {
            permissions: template.permissions,
            description: template.description,
          },
          additionalData: {
            role,
            category: template.category,
          },
        },
        ipAddress,
        userAgent
      );

      return { success: true, role };
    }),

  // ============================================
  // ENHANCED AUDIT LOGGING
  // ============================================

  /**
   * Get audit logs with advanced filtering
   * Requires ADMIN_VIEW_AUDIT_LOGS permission
   */
  getAuditLogs: createPermissionProcedure(Permission.ADMIN_VIEW_AUDIT_LOGS)
    .input(auditLogFilterSchema)
    .query(async ({ ctx, input }) => {
      const {
        userId,
        action,
        entityType,
        entityId,
        startDate,
        endDate,
        page,
        limit,
        sortBy,
        sortOrder,
      } = input;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: Record<string, unknown> = {};

      if (userId) where.userId = userId;
      if (action) where.action = action;
      if (entityType) where.entityType = entityType;
      if (entityId) where.entityId = entityId;

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) (where.createdAt as Record<string, unknown>).gte = startDate;
        if (endDate) (where.createdAt as Record<string, unknown>).lte = endDate;
      }

      const [logs, total] = await Promise.all([
        ctx.prisma.auditLog.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
              },
            },
            performer: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
              },
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

  /**
   * Get audit logs for a specific entity
   * Requires ADMIN_VIEW_AUDIT_LOGS permission
   */
  getEntityAuditLogs: createPermissionProcedure(Permission.ADMIN_VIEW_AUDIT_LOGS)
    .input(z.object({
      entityType: z.string(),
      entityId: z.string(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { entityType, entityId, page, limit } = input;
      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        ctx.prisma.auditLog.findMany({
          where: {
            entityType,
            entityId,
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            performer: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
              },
            },
          },
        }),
        ctx.prisma.auditLog.count({
          where: {
            entityType,
            entityId,
          },
        }),
      ]);

      return {
        logs,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      };
    }),

  /**
   * Get audit log statistics
   * Requires ADMIN_VIEW_AUDIT_LOGS permission
   */
  getAuditLogStats: createPermissionProcedure(Permission.ADMIN_VIEW_AUDIT_LOGS)
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = input;

      const dateFilter = startDate && endDate ? {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      } : {};

      const [
        totalLogs,
        actionCounts,
        entityTypeCounts,
        topPerformers,
      ] = await Promise.all([
        ctx.prisma.auditLog.count({ where: dateFilter }),

        // Count by action
        ctx.prisma.auditLog.groupBy({
          by: ['action'],
          where: dateFilter,
          _count: true,
          orderBy: {
            _count: {
              action: 'desc',
            },
          },
          take: 10,
        }),

        // Count by entity type
        ctx.prisma.auditLog.groupBy({
          by: ['entityType'],
          where: {
            ...dateFilter,
            entityType: { not: null },
          },
          _count: true,
          orderBy: {
            _count: {
              entityType: 'desc',
            },
          },
          take: 10,
        }),

        // Top performers (users with most actions)
        ctx.prisma.auditLog.groupBy({
          by: ['performedBy'],
          where: dateFilter,
          _count: true,
          orderBy: {
            _count: {
              performedBy: 'desc',
            },
          },
          take: 10,
        }),
      ]);

      // Get performer details
      const performerIds = topPerformers.map((p) => p.performedBy);
      const performers = await ctx.prisma.user.findMany({
        where: { id: { in: performerIds } },
        select: { id: true, name: true, email: true, role: true },
      });

      const performersMap = new Map(performers.map((p) => [p.id, p]));

      return {
        totalLogs,
        actionCounts: actionCounts.map((a) => ({
          action: a.action,
          count: a._count,
        })),
        entityTypeCounts: entityTypeCounts.map((e) => ({
          entityType: e.entityType,
          count: e._count,
        })),
        topPerformers: topPerformers.map((p) => ({
          performer: performersMap.get(p.performedBy),
          count: p._count,
        })),
      };
    }),

  /**
   * Get available audit actions for filtering
   */
  getAvailableAuditActions: adminProcedure.query(() => {
    return AUDIT_ACTIONS;
  }),
});
