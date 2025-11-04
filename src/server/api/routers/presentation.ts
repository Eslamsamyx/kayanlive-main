import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { PresentationStatus, SlideType } from '@prisma/client';
import { TRPCError } from '@trpc/server';

export const presentationRouter = createTRPCRouter({
  /**
   * List all presentations for a project
   */
  list: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.presentation.findMany({
        where: {
          projectId: input.projectId,
        },
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
              slides: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }),

  /**
   * Get a single presentation with all slides
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.presentation.findUnique({
        where: { id: input.id },
        include: {
          project: {
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
          slides: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      });
    }),

  /**
   * Create a presentation
   */
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        title: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.presentation.create({
        data: {
          projectId: input.projectId,
          title: input.title,
          description: input.description,
          createdBy: ctx.session.user.id,
        },
      });
    }),

  /**
   * Update a presentation
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        status: z.nativeEnum(PresentationStatus).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      return ctx.prisma.presentation.update({
        where: { id },
        data,
      });
    }),

  /**
   * Delete a presentation
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.presentation.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Create a slide
   */
  createSlide: protectedProcedure
    .input(
      z.object({
        presentationId: z.string(),
        type: z.nativeEnum(SlideType),
        title: z.string().optional(),
        content: z.string().optional(),
        imageUrl: z.string().optional(),
        videoUrl: z.string().optional(),
        chartData: z.any().optional(),
        backgroundColor: z.string().optional(),
        textColor: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { presentationId, ...data } = input;

      // Get the current number of slides to set the order
      const slidesCount = await ctx.prisma.slide.count({
        where: { presentationId },
      });

      return ctx.prisma.slide.create({
        data: {
          ...data,
          presentationId,
          order: slidesCount,
        },
      });
    }),

  /**
   * Update a slide
   */
  updateSlide: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.nativeEnum(SlideType).optional(),
        title: z.string().optional(),
        content: z.string().optional(),
        imageUrl: z.string().optional(),
        videoUrl: z.string().optional(),
        chartData: z.any().optional(),
        backgroundColor: z.string().optional(),
        textColor: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      return ctx.prisma.slide.update({
        where: { id },
        data,
      });
    }),

  /**
   * Reorder slides
   */
  reorderSlides: protectedProcedure
    .input(
      z.object({
        slides: z.array(
          z.object({
            id: z.string(),
            order: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$transaction(
        input.slides.map((slide) =>
          ctx.prisma.slide.update({
            where: { id: slide.id },
            data: { order: slide.order },
          })
        )
      );

      return { success: true };
    }),

  /**
   * Delete a slide
   */
  deleteSlide: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.slide.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
