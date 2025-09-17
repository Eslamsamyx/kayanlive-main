import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { UserRole } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(UserRole).default('CONTENT_CREATOR'),
});

const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  emailVerified: z.date().optional(),
});

const changePasswordSchema = z.object({
  id: z.string(),
  currentPassword: z.string(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export const userRouter = createTRPCRouter({
  create: publicProcedure
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

      return ctx.prisma.user.create({
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
    }),

  getAll: publicProcedure
    .input(
      z.object({
        role: z.nativeEnum(UserRole).optional(),
        page: z.number().default(1),
        limit: z.number().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { role, page, limit } = input;
      const skip = (page - 1) * limit;

      const where = role ? { role } : {};

      const [users, total] = await Promise.all([
        ctx.prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            emailVerified: true,
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

  getById: publicProcedure
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

  update: publicProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      return ctx.prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }),

  changePassword: publicProcedure
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

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.delete({
        where: { id: input.id },
      });
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

  getStats: publicProcedure.query(async ({ ctx }) => {
    const [total, admins, moderators, contentCreators] = await Promise.all([
      ctx.prisma.user.count(),
      ctx.prisma.user.count({ where: { role: 'ADMIN' } }),
      ctx.prisma.user.count({ where: { role: 'MODERATOR' } }),
      ctx.prisma.user.count({ where: { role: 'CONTENT_CREATOR' } }),
    ]);

    return {
      total,
      admins,
      moderators,
      contentCreators,
    };
  }),
});