import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { NotificationService } from '@/lib/notification-service';

export const meetingRouter = createTRPCRouter({
  /**
   * List all meetings
   */
  list: protectedProcedure
    .input(
      z.object({
        projectId: z.string().optional(),
        upcoming: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input.projectId) {
        where.projectId = input.projectId;
      }

      if (input.upcoming) {
        where.startTime = {
          gte: new Date(),
        };
      }

      // If not admin, filter by user's projects
      if (ctx.session.user.role !== 'ADMIN' && !input.projectId) {
        const userCompanies = await ctx.prisma.companyUser.findMany({
          where: { userId: ctx.session.user.id },
          select: { companyId: true },
        });

        const companyIds = userCompanies.map((uc) => uc.companyId);

        where.OR = [
          {
            attendees: {
              some: {
                id: ctx.session.user.id,
              },
            },
          },
          {
            project: {
              companyId: { in: companyIds },
            },
          },
        ];
      }

      return ctx.prisma.meeting.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          attendees: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          _count: {
            select: {
              attendees: true,
            },
          },
        },
        orderBy: {
          startTime: 'asc',
        },
      });
    }),

  /**
   * Get a single meeting
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.meeting.findUnique({
        where: { id: input.id },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          attendees: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
        },
      });
    }),

  /**
   * Create a meeting
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        startTime: z.date(),
        endTime: z.date(),
        location: z.string().optional(),
        agenda: z.string().optional(),
        projectId: z.string().optional(),
        attendeeIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const meeting = await ctx.prisma.meeting.create({
        data: {
          title: input.title,
          description: input.description,
          startTime: input.startTime,
          endTime: input.endTime,
          location: input.location,
          agenda: input.agenda,
          projectId: input.projectId,
          attendees: {
            connect: input.attendeeIds.map((id) => ({ id })),
          },
        },
      });

      // Create notifications for attendees
      const notificationService = new NotificationService(ctx.prisma);
      await notificationService.createMeetingNotification(
        input.attendeeIds,
        meeting,
        input.projectId || null,
        'SCHEDULED'
      );

      return meeting;
    }),

  /**
   * Update a meeting
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        startTime: z.date().optional(),
        endTime: z.date().optional(),
        location: z.string().optional(),
        agenda: z.string().optional(),
        minutes: z.string().optional(),
        attendeeIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, attendeeIds, ...data } = input;

      const meeting = await ctx.prisma.meeting.update({
        where: { id },
        data: {
          ...data,
          attendees: attendeeIds
            ? {
                set: attendeeIds.map((id) => ({ id })),
              }
            : undefined,
        },
        include: {
          attendees: true,
        },
      });

      // Notify attendees of update
      if (attendeeIds) {
        const notificationService = new NotificationService(ctx.prisma);
        await notificationService.createMeetingNotification(
          attendeeIds,
          {
            id: meeting.id,
            title: meeting.title,
            startTime: meeting.startTime,
          },
          meeting.projectId,
          'UPDATED'
        );
      }

      return meeting;
    }),

  /**
   * Delete a meeting
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.meeting.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
