import { initTRPC, TRPCError } from '@trpc/server';
import { type NextRequest } from 'next/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { type UserRole } from '@prisma/client';

interface CreateContextOptions {
  session: Session | null;
}

interface CreateTRPCContextOptions {
  req: NextRequest;
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
  };
};

export const createTRPCContext = async (opts: CreateTRPCContextOptions) => {
  // Get the session from the server using the getServerSession wrapper function
  // For App Router, we don't need to pass req/res to getServerSession
  const session = await getServerSession(authOptions);

  return createInnerTRPCContext({
    session,
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