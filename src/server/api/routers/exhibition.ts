import { z } from 'zod';
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';

export const exhibitionRouter = createTRPCRouter({
  // =============================================================================
  // EXHIBITION MANAGEMENT
  // =============================================================================

  /**
   * Create a new exhibition
   */
  createExhibition: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        industry: z.string().optional(),
        startDate: z.date(),
        endDate: z.date(),
        status: z.enum(['confirmed', 'tentative']).default('confirmed'),
        eventWebsite: z.string().optional(),
        venueId: z.string().optional(),
        organizerId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Calculate duration
      const durationDays = Math.ceil(
        (input.endDate.getTime() - input.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const exhibition = await ctx.prisma.exhibition.create({
        data: {
          ...input,
          durationDays,
        },
      });

      return { exhibition };
    }),

  /**
   * List all exhibitions with filters
   */
  listExhibitions: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        industry: z.string().optional(),
        status: z.enum(['confirmed', 'tentative']).optional(),
        fromDate: z.date().optional(),
        toDate: z.date().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      const where: any = {};

      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { industry: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      if (input.industry) {
        where.industry = input.industry;
      }

      if (input.status) {
        where.status = input.status;
      }

      if (input.fromDate || input.toDate) {
        where.startDate = {};
        if (input.fromDate) where.startDate.gte = input.fromDate;
        if (input.toDate) where.startDate.lte = input.toDate;
      }

      const [exhibitions, total] = await Promise.all([
        ctx.prisma.exhibition.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { startDate: 'asc' },
          include: {
            venue: true,
            organizer: true,
            participationStatus: true,
            _count: {
              select: {
                exhibitors: true,
                leads: true,
              },
            },
          },
        }),
        ctx.prisma.exhibition.count({ where }),
      ]);

      return {
        exhibitions,
        pagination: {
          total,
          pages: Math.ceil(total / input.limit),
          currentPage: input.page,
          perPage: input.limit,
        },
      };
    }),

  /**
   * Get exhibition by ID
   */
  getExhibitionById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const exhibition = await ctx.prisma.exhibition.findUnique({
        where: { id: input.id },
        include: {
          venue: true,
          organizer: true,
          participationStatus: true,
          exhibitors: {
            include: {
              exhibitor: {
                include: {
                  contacts: true,
                },
              },
            },
          },
          leads: {
            include: {
              exhibitor: true,
              activities: {
                orderBy: { createdAt: 'desc' },
                take: 5,
              },
            },
          },
        },
      });

      if (!exhibition) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Exhibition not found',
        });
      }

      return { exhibition };
    }),

  /**
   * Get exhibition by slug
   */
  getExhibitionBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const exhibition = await ctx.prisma.exhibition.findUnique({
        where: { slug: input.slug },
        include: {
          venue: true,
          organizer: true,
          participationStatus: true,
          exhibitors: {
            include: {
              exhibitor: {
                include: {
                  contacts: true,
                },
              },
            },
          },
          leads: {
            include: {
              exhibitor: true,
              activities: {
                orderBy: { createdAt: 'desc' },
                take: 5,
              },
            },
          },
        },
      });

      if (!exhibition) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Exhibition not found',
        });
      }

      return { exhibition };
    }),

  /**
   * Update exhibition
   */
  updateExhibition: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        slug: z.string().optional(),
        industry: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        status: z.enum(['confirmed', 'tentative']).optional(),
        eventWebsite: z.string().optional(),
        venueId: z.string().optional().nullable(),
        organizerId: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Recalculate duration if dates changed
      if (data.startDate || data.endDate) {
        const exhibition = await ctx.prisma.exhibition.findUnique({
          where: { id },
        });

        if (!exhibition) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Exhibition not found',
          });
        }

        const startDate = data.startDate || exhibition.startDate;
        const endDate = data.endDate || exhibition.endDate;

        const durationDays = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        Object.assign(data, { durationDays });
      }

      const exhibition = await ctx.prisma.exhibition.update({
        where: { id },
        data,
      });

      return { exhibition };
    }),

  /**
   * Delete exhibition
   */
  deleteExhibition: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.exhibition.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Set participation status for exhibition
   */
  setParticipationStatus: protectedProcedure
    .input(
      z.object({
        exhibitionId: z.string(),
        status: z.enum([
          'not_participating',
          'evaluating',
          'visiting',
          'supporting_client',
          'exhibiting',
        ]),
        teamLead: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { exhibitionId, ...data } = input;

      const participationStatus = await ctx.prisma.participationStatus.upsert({
        where: { exhibitionId },
        update: data,
        create: {
          exhibitionId,
          ...data,
        },
      });

      return { participationStatus };
    }),

  // =============================================================================
  // EXHIBITOR MANAGEMENT
  // =============================================================================

  /**
   * Create exhibitor
   */
  createExhibitor: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        website: z.string().optional(),
        industry: z.string().optional(),
        country: z.string().optional(),
        companyProfileLink: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const exhibitor = await ctx.prisma.exhibitor.create({
        data: input,
      });

      return { exhibitor };
    }),

  /**
   * List exhibitors
   */
  listExhibitors: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        industry: z.string().optional(),
        country: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      const where: any = {};

      if (input.search) {
        where.name = { contains: input.search, mode: 'insensitive' };
      }

      if (input.industry) {
        where.industry = input.industry;
      }

      if (input.country) {
        where.country = input.country;
      }

      const [exhibitors, total] = await Promise.all([
        ctx.prisma.exhibitor.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { name: 'asc' },
          include: {
            contacts: {
              where: { isPrimary: true },
              take: 1,
            },
            _count: {
              select: {
                exhibitions: true,
                leads: true,
              },
            },
          },
        }),
        ctx.prisma.exhibitor.count({ where }),
      ]);

      return {
        exhibitors,
        pagination: {
          total,
          pages: Math.ceil(total / input.limit),
          currentPage: input.page,
          perPage: input.limit,
        },
      };
    }),

  /**
   * Link exhibitor to exhibition
   */
  linkExhibitorToExhibition: protectedProcedure
    .input(
      z.object({
        exhibitionId: z.string(),
        exhibitorId: z.string(),
        standNumber: z.string().optional(),
        standSizeSqm: z.number().optional(),
        category: z.string().optional(),
        remarks: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const link = await ctx.prisma.exhibitionExhibitor.create({
        data: input,
      });

      return { link };
    }),

  /**
   * Add contact to exhibitor
   */
  addContact: protectedProcedure
    .input(
      z.object({
        exhibitorId: z.string(),
        name: z.string(),
        title: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        mobile: z.string().optional(),
        isPrimary: z.boolean().default(false),
        department: z.string().optional(),
        linkedIn: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // If setting as primary, unset other primary contacts
      if (input.isPrimary) {
        await ctx.prisma.exhibitorContact.updateMany({
          where: {
            exhibitorId: input.exhibitorId,
            isPrimary: true,
          },
          data: {
            isPrimary: false,
          },
        });
      }

      const contact = await ctx.prisma.exhibitorContact.create({
        data: input,
      });

      return { contact };
    }),

  /**
   * Update contact
   */
  updateContact: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        title: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        mobile: z.string().optional(),
        isPrimary: z.boolean().optional(),
        department: z.string().optional(),
        linkedIn: z.string().optional(),
        notes: z.string().optional(),
        lastContacted: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // If setting as primary, get exhibitorId and unset others
      if (data.isPrimary) {
        const contact = await ctx.prisma.exhibitorContact.findUnique({
          where: { id },
        });

        if (contact) {
          await ctx.prisma.exhibitorContact.updateMany({
            where: {
              exhibitorId: contact.exhibitorId,
              isPrimary: true,
              id: { not: id },
            },
            data: {
              isPrimary: false,
            },
          });
        }
      }

      const contact = await ctx.prisma.exhibitorContact.update({
        where: { id },
        data,
      });

      return { contact };
    }),

  // =============================================================================
  // LEAD MANAGEMENT
  // =============================================================================

  /**
   * Create lead from exhibition
   */
  createLead: protectedProcedure
    .input(
      z.object({
        exhibitorId: z.string(),
        exhibitionId: z.string(),
        contactName: z.string().optional(),
        contactEmail: z.string().optional(),
        contactPhone: z.string().optional(),
        contactRole: z.string().optional(),
        qualityScore: z.number().min(0).max(100).default(50),
        leadSource: z.string().optional(),
        standSize: z.number().optional(),
        competitorQuotes: z.string().optional(),
        decisionTimeframe: z.string().optional(),
        previousClient: z.boolean().default(false),
        preferredDesignStyle: z.string().optional(),
        specialRequirements: z.string().optional(),
        notes: z.string().optional(),
        nextFollowUpDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const lead = await ctx.prisma.exhibitionLead.create({
        data: input,
      });

      // Create initial activity
      await ctx.prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          type: 'note',
          description: 'Lead created',
        },
      });

      return { lead };
    }),

  /**
   * List leads with filters
   */
  listLeads: protectedProcedure
    .input(
      z.object({
        exhibitionId: z.string().optional(),
        exhibitorId: z.string().optional(),
        status: z
          .enum([
            'new',
            'qualified',
            'contacted',
            'proposal_sent',
            'negotiating',
            'won',
            'lost',
            'disqualified',
          ])
          .optional(),
        minQualityScore: z.number().optional(),
        followUpDueBefore: z.date().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      const where: any = {};

      if (input.exhibitionId) {
        where.exhibitionId = input.exhibitionId;
      }

      if (input.exhibitorId) {
        where.exhibitorId = input.exhibitorId;
      }

      if (input.status) {
        where.status = input.status;
      }

      if (input.minQualityScore !== undefined) {
        where.qualityScore = { gte: input.minQualityScore };
      }

      if (input.followUpDueBefore) {
        where.nextFollowUpDate = {
          lte: input.followUpDueBefore,
          not: null,
        };
      }

      const [leads, total] = await Promise.all([
        ctx.prisma.exhibitionLead.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
          include: {
            exhibitor: {
              select: {
                id: true,
                name: true,
                industry: true,
                country: true,
              },
            },
            exhibition: {
              select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true,
              },
            },
            project: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
            _count: {
              select: {
                activities: true,
              },
            },
          },
        }),
        ctx.prisma.exhibitionLead.count({ where }),
      ]);

      return {
        leads,
        pagination: {
          total,
          pages: Math.ceil(total / input.limit),
          currentPage: input.page,
          perPage: input.limit,
        },
      };
    }),

  /**
   * Get lead by ID with full details
   */
  getLeadById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const lead = await ctx.prisma.exhibitionLead.findUnique({
        where: { id: input.id },
        include: {
          exhibitor: {
            include: {
              contacts: true,
            },
          },
          exhibition: {
            include: {
              venue: true,
              organizer: true,
            },
          },
          project: true,
          activities: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!lead) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Lead not found',
        });
      }

      return { lead };
    }),

  /**
   * Update lead
   */
  updateLead: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z
          .enum([
            'new',
            'qualified',
            'contacted',
            'proposal_sent',
            'negotiating',
            'won',
            'lost',
            'disqualified',
          ])
          .optional(),
        contactName: z.string().optional(),
        contactEmail: z.string().optional(),
        contactPhone: z.string().optional(),
        contactRole: z.string().optional(),
        qualityScore: z.number().min(0).max(100).optional(),
        standSize: z.number().optional(),
        competitorQuotes: z.string().optional(),
        decisionTimeframe: z.string().optional(),
        preferredDesignStyle: z.string().optional(),
        specialRequirements: z.string().optional(),
        notes: z.string().optional(),
        lastContactDate: z.date().optional(),
        nextFollowUpDate: z.date().optional(),
        proposalSentDate: z.date().optional(),
        proposalDeadline: z.date().optional(),
        wonLostReason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const lead = await ctx.prisma.exhibitionLead.update({
        where: { id },
        data,
      });

      // Log status change as activity
      if (data.status) {
        await ctx.prisma.leadActivity.create({
          data: {
            leadId: id,
            type: 'note',
            description: `Status changed to: ${data.status}`,
          },
        });
      }

      return { lead };
    }),

  /**
   * Add activity to lead
   */
  addLeadActivity: protectedProcedure
    .input(
      z.object({
        leadId: z.string(),
        type: z.enum(['call', 'email', 'meeting', 'proposal', 'note']),
        description: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const activity = await ctx.prisma.leadActivity.create({
        data: input,
      });

      // Update last contact date
      await ctx.prisma.exhibitionLead.update({
        where: { id: input.leadId },
        data: {
          lastContactDate: new Date(),
        },
      });

      return { activity };
    }),

  /**
   * Convert lead to project
   */
  convertLeadToProject: protectedProcedure
    .input(
      z.object({
        leadId: z.string(),
        projectName: z.string(),
        projectDescription: z.string().optional(),
        companyId: z.string(),
        startDate: z.date().optional(),
        budget: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { leadId, ...projectData } = input;

      // Get lead details
      const lead = await ctx.prisma.exhibitionLead.findUnique({
        where: { id: leadId },
      });

      if (!lead) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Lead not found',
        });
      }

      if (lead.status === 'won' && lead.projectId) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Lead is already converted to a project',
        });
      }

      // Create project
      const project = await ctx.prisma.project.create({
        data: {
          name: projectData.projectName,
          description: projectData.projectDescription,
          companyId: projectData.companyId,
          startDate: projectData.startDate,
          budget: projectData.budget,
          status: 'PLANNING',
          createdBy: userId,
        },
      });

      // Update lead
      await ctx.prisma.exhibitionLead.update({
        where: { id: leadId },
        data: {
          status: 'won',
          projectId: project.id,
        },
      });

      // Create activity
      await ctx.prisma.leadActivity.create({
        data: {
          leadId,
          type: 'note',
          description: `Converted to project: ${project.name}`,
        },
      });

      return { project, lead };
    }),

  /**
   * Get lead conversion statistics
   */
  getLeadStats: protectedProcedure
    .input(
      z.object({
        exhibitionId: z.string().optional(),
        fromDate: z.date().optional(),
        toDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input.exhibitionId) {
        where.exhibitionId = input.exhibitionId;
      }

      if (input.fromDate || input.toDate) {
        where.createdAt = {};
        if (input.fromDate) where.createdAt.gte = input.fromDate;
        if (input.toDate) where.createdAt.lte = input.toDate;
      }

      const [total, byStatus, avgQualityScore] = await Promise.all([
        ctx.prisma.exhibitionLead.count({ where }),
        ctx.prisma.exhibitionLead.groupBy({
          by: ['status'],
          where,
          _count: true,
        }),
        ctx.prisma.exhibitionLead.aggregate({
          where,
          _avg: {
            qualityScore: true,
          },
        }),
      ]);

      const statusDistribution = byStatus.reduce(
        (acc, item) => {
          acc[item.status] = item._count;
          return acc;
        },
        {} as Record<string, number>
      );

      const wonCount = statusDistribution['won'] || 0;
      const conversionRate = total > 0 ? (wonCount / total) * 100 : 0;

      return {
        total,
        statusDistribution,
        avgQualityScore: avgQualityScore._avg.qualityScore || 0,
        conversionRate: Math.round(conversionRate * 100) / 100,
        wonCount,
      };
    }),

  /**
   * Send follow-up email to lead(s)
   */
  sendFollowUpEmail: protectedProcedure
    .input(
      z.object({
        leadIds: z.array(z.string()).min(1),
        subject: z.string().min(1),
        body: z.string().min(1),
        template: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get all leads
      const leads = await ctx.prisma.exhibitionLead.findMany({
        where: {
          id: { in: input.leadIds },
        },
        select: {
          id: true,
          contactName: true,
          contactEmail: true,
          exhibitor: {
            select: {
              name: true,
            },
          },
        },
      });

      if (leads.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No leads found',
        });
      }

      // Queue emails for each lead
      const { queueEmail } = await import('@/lib/queue');

      for (const lead of leads) {
        await queueEmail({
          to: lead.contactEmail!,
          subject: input.subject,
          template: input.template || "follow-up-email",
          data: {
            html: input.body
              .replace(/\{\{name\}\}/g, lead.contactName || 'there')
              .replace(/\{\{companyName\}\}/g, lead.exhibitor?.name || 'your company')
              .replace(/\{\{senderName\}\}/g, ctx.session.user.name || 'The Team'),
            text: input.body
              .replace(/\{\{name\}\}/g, lead.contactName || 'there')
              .replace(/\{\{companyName\}\}/g, lead.exhibitor?.name || 'your company')
              .replace(/\{\{senderName\}\}/g, ctx.session.user.name || 'The Team')
              .replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
          },
        });

        // Update lead last contact date
        await ctx.prisma.exhibitionLead.update({
          where: { id: lead.id },
          data: {
            lastContactDate: new Date(),
            notes: `Follow-up email sent: ${input.subject}`,
          },
        });
      }

      return {
        success: true,
        emailsSent: leads.length,
        leads: leads.map((l) => ({ id: l.id, email: l.contactEmail })),
      };
    }),
});
