import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { type UserRole } from '@prisma/client';
import { PermissionChecker, Permission } from '@/lib/permissions';
import { headers } from 'next/headers';

interface CreateContextOptions {
  session: Session | null;
  headers: Headers;
}


const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
    permissionChecker: new PermissionChecker(prisma),
    headers: opts.headers,
  };
};

export const createTRPCContext = async () => {
  // Get the session from the server using the getServerSession wrapper function
  // For App Router, we don't need to pass req/res to getServerSession
  const session = await getServerSession(authOptions);
  const headersList = await headers();

  return createInnerTRPCContext({
    session,
    headers: headersList,
  });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 * This is the base piece you use to build new queries and mutations on your tRPC API.
 * It does not guarantee that a user querying is authorized, but you can still access user session
 * data if they are logged in.
 */
export const publicProcedure = t.procedure;

/**
 * Protected (authenticated) procedure
 * If you want a query or mutation to ONLY be accessible to logged in users, use this.
 * It verifies that the user is authenticated and throws if not.
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: ctx.session,
    },
  });
});

/**
 * Admin-only procedure
 * Requires the user to be authenticated and have ADMIN role
 */
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== 'ADMIN') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required'
    });
  }
  return next({ ctx });
});

/**
 * Moderator or Admin procedure
 * Requires the user to be authenticated and have MODERATOR or ADMIN role
 */
export const moderatorProcedure = protectedProcedure.use(({ ctx, next }) => {
  const userRole = ctx.session.user.role;
  if (!['ADMIN', 'MODERATOR'].includes(userRole)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Moderator or Admin access required'
    });
  }
  return next({ ctx });
});

/**
 * Content Creator, Moderator, or Admin procedure
 * Requires the user to be authenticated and have any valid role
 */
export const contentCreatorProcedure = protectedProcedure.use(({ ctx, next }) => {
  const userRole = ctx.session.user.role;
  if (!['ADMIN', 'MODERATOR', 'CONTENT_CREATOR'].includes(userRole)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Content access required'
    });
  }
  return next({ ctx });
});

/**
 * Role-based procedure factory
 * Creates a procedure that requires one of the specified roles
 */
export const createRoleBasedProcedure = (requiredRoles: UserRole[]) => {
  return protectedProcedure.use(({ ctx, next }) => {
    const userRole = ctx.session.user.role;
    if (!requiredRoles.includes(userRole)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Access denied. Required roles: ${requiredRoles.join(', ')}`
      });
    }
    return next({ ctx });
  });
};

/**
 * Helper function to check if user can manage another user
 * Used for user management operations
 */
export const canManageUser = (currentUserRole: UserRole, targetUserRole: UserRole): boolean => {
  if (currentUserRole === 'ADMIN') return true;
  if (currentUserRole === 'MODERATOR' && targetUserRole !== 'ADMIN') return true;
  return false;
};

/**
 * Permission-based procedure factory
 * Creates a procedure that requires a specific permission
 * @param requiredPermission - The permission required to access this endpoint
 */
export const createPermissionProcedure = (requiredPermission: Permission) => {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const userId = ctx.session.user.id;
    const hasPermission = await ctx.permissionChecker.hasPermission(
      userId,
      requiredPermission
    );

    if (!hasPermission) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Missing required permission: ${requiredPermission}`,
      });
    }

    return next({ ctx });
  });
};

/**
 * Multi-permission procedure factory
 * Creates a procedure that requires multiple permissions
 * @param requiredPermissions - Array of permissions required
 * @param mode - 'all' requires all permissions, 'any' requires at least one
 */
export const createMultiPermissionProcedure = (
  requiredPermissions: Permission[],
  mode: 'all' | 'any' = 'all'
) => {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const userId = ctx.session.user.id;
    const hasPermissions =
      mode === 'all'
        ? await ctx.permissionChecker.hasAllPermissions(userId, requiredPermissions)
        : await ctx.permissionChecker.hasAnyPermission(userId, requiredPermissions);

    if (!hasPermissions) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Missing required permissions: ${requiredPermissions.join(', ')} (mode: ${mode})`,
      });
    }

    return next({ ctx });
  });
};

// Export Permission enum for use in routers
export { Permission };