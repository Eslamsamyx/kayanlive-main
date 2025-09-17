import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { LeadStatus } from '@prisma/client';

const createLeadSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  organization: z.string().optional(),
  eventType: z.string().optional(),
  budget: z.string().optional(),
  goals: z.string().optional(),
  isUrgent: z.boolean().default(false),
  source: z.string().default('contact_form'),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  referrer: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
});

const updateLeadSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(LeadStatus).optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
});

export const leadRouter = createTRPCRouter({
  create: publicProcedure
    .input(createLeadSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.lead.create({
        data: input,
      });
    }),

  getAll: publicProcedure
    .input(
      z.object({
        status: z.nativeEnum(LeadStatus).optional(),
        page: z.number().default(1),
        limit: z.number().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { status, page, limit } = input;
      const skip = (page - 1) * limit;

      const where = status ? { status } : {};

      const [leads, total] = await Promise.all([
        ctx.prisma.lead.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.prisma.lead.count({ where }),
      ]);

      return {
        leads,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.lead.findUnique({
        where: { id: input.id },
      });
    }),

  update: publicProcedure
    .input(updateLeadSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      return ctx.prisma.lead.update({
        where: { id },
        data: updateData,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.lead.delete({
        where: { id: input.id },
      });
    }),

  getStats: publicProcedure.query(async ({ ctx }) => {
    const [total, new_, contacted, qualified, won, lost] = await Promise.all([
      ctx.prisma.lead.count(),
      ctx.prisma.lead.count({ where: { status: 'NEW' } }),
      ctx.prisma.lead.count({ where: { status: 'CONTACTED' } }),
      ctx.prisma.lead.count({ where: { status: 'QUALIFIED' } }),
      ctx.prisma.lead.count({ where: { status: 'WON' } }),
      ctx.prisma.lead.count({ where: { status: 'LOST' } }),
    ]);

    return {
      total,
      new: new_,
      contacted,
      qualified,
      won,
      lost,
    };
  }),
});