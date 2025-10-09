import { z } from 'zod';
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import {
  sanitizeText,
  sanitizeEmail,
  sanitizeJson,
  sanitizeFileMetadata,
  sanitizeCompanyName,
} from '@/server/utils/sanitization';

// Schema for submission answer
const SubmissionAnswerSchema = z.object({
  questionId: z.number(),
  questionType: z.string(),
  section: z.string(),
  textValue: z.string().nullable().optional(),
  jsonValue: z.any().optional(),
});

// Schema for file upload
const FileUploadSchema = z.object({
  questionId: z.number(),
  fileName: z.string(),
  originalName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  filePath: z.string(),
});

// Schema for questionnaire submission
const QuestionnaireSubmissionSchema = z.object({
  questionnaireId: z.string(),
  companyName: z.string().optional(),
  contactPerson: z.string().optional(),
  email: z.string().email().optional(),
  industry: z.string().optional(),
  answers: z.array(SubmissionAnswerSchema),
  uploadedFiles: z.array(FileUploadSchema).optional().default([]),
  isComplete: z.boolean().default(true),
});

export const questionnaireRouter = createTRPCRouter({
  /**
   * CLIENT: Submit questionnaire (authenticated clients only)
   * Links submission to the logged-in user
   */
  submit: protectedProcedure
    .input(QuestionnaireSubmissionSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Sanitize all text inputs
        const sanitizedData = {
          companyName: input.companyName ? sanitizeCompanyName(input.companyName) : null,
          contactPerson: input.contactPerson ? sanitizeText(input.contactPerson) : null,
          email: input.email ? sanitizeEmail(input.email) : null,
          industry: input.industry ? sanitizeText(input.industry) : null,
        };

        // Create submission with transaction for data integrity
        const submission = await ctx.prisma.$transaction(async (tx) => {
          const newSubmission = await tx.questionnaireSubmission.create({
            data: {
              questionnaireId: sanitizeText(input.questionnaireId) || input.questionnaireId,
              userId: ctx.session.user.id, // Link to authenticated user
              ...sanitizedData,
              isComplete: input.isComplete,
              submittedAt: input.isComplete ? new Date() : null,
              answers: {
                create: input.answers.map((answer) => ({
                  questionId: answer.questionId,
                  questionType: sanitizeText(answer.questionType) || answer.questionType,
                  section: sanitizeText(answer.section) || answer.section,
                  textValue: answer.textValue ? sanitizeText(answer.textValue) : null,
                  jsonValue: answer.jsonValue ? sanitizeJson(answer.jsonValue) : null,
                })),
              },
              uploadedFiles: {
                create: input.uploadedFiles?.map((file) => {
                  const sanitizedMetadata = sanitizeFileMetadata({
                    fileName: file.fileName,
                    originalName: file.originalName,
                    mimeType: file.mimeType,
                    filePath: file.filePath,
                  });

                  return {
                    questionId: file.questionId,
                    fileName: sanitizedMetadata.fileName || file.fileName,
                    originalName: sanitizedMetadata.originalName || file.originalName,
                    fileSize: file.fileSize,
                    mimeType: sanitizedMetadata.mimeType || file.mimeType,
                    filePath: sanitizedMetadata.filePath || file.filePath,
                  };
                }) || [],
              },
            },
            include: {
              answers: true,
              uploadedFiles: true,
            },
          });

          return newSubmission;
        });

        return {
          success: true,
          submissionId: submission.id,
          message: 'Questionnaire submitted successfully',
        };
      } catch (error) {
        console.error('Error submitting questionnaire:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to submit questionnaire. Please try again.',
        });
      }
    }),

  /**
   * CLIENT: Save draft (for auto-save functionality)
   * Links draft to the logged-in user
   */
  saveDraft: protectedProcedure
    .input(
      z.object({
        questionnaireId: z.string(),
        answers: z.array(SubmissionAnswerSchema),
        companyName: z.string().optional(),
        contactPerson: z.string().optional(),
        email: z.string().email().optional().nullable(),
        industry: z.string().optional(),
        draftId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const sanitizedData = {
          companyName: input.companyName ? sanitizeCompanyName(input.companyName) : null,
          contactPerson: input.contactPerson ? sanitizeText(input.contactPerson) : null,
          email: input.email ? sanitizeEmail(input.email) : null,
          industry: input.industry ? sanitizeText(input.industry) : null,
        };

        if (input.draftId) {
          // Update existing draft (verify ownership)
          const existingDraft = await ctx.prisma.questionnaireSubmission.findFirst({
            where: {
              id: input.draftId,
              userId: ctx.session.user.id, // Ensure user owns this draft
            },
          });

          if (!existingDraft) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Draft not found or access denied',
            });
          }

          const draft = await ctx.prisma.questionnaireSubmission.update({
            where: { id: input.draftId },
            data: {
              ...sanitizedData,
              updatedAt: new Date(),
              answers: {
                deleteMany: {},
                create: input.answers.map((answer) => ({
                  questionId: answer.questionId,
                  questionType: sanitizeText(answer.questionType) || answer.questionType,
                  section: sanitizeText(answer.section) || answer.section,
                  textValue: answer.textValue ? sanitizeText(answer.textValue) : null,
                  jsonValue: answer.jsonValue ? sanitizeJson(answer.jsonValue) : null,
                })),
              },
            },
          });

          return { success: true, draftId: draft.id, message: 'Draft updated' };
        } else {
          // Create new draft
          const draft = await ctx.prisma.questionnaireSubmission.create({
            data: {
              questionnaireId: input.questionnaireId,
              userId: ctx.session.user.id, // Link to authenticated user
              ...sanitizedData,
              isComplete: false,
              answers: {
                create: input.answers.map((answer) => ({
                  questionId: answer.questionId,
                  questionType: sanitizeText(answer.questionType) || answer.questionType,
                  section: sanitizeText(answer.section) || answer.section,
                  textValue: answer.textValue ? sanitizeText(answer.textValue) : null,
                  jsonValue: answer.jsonValue ? sanitizeJson(answer.jsonValue) : null,
                })),
              },
            },
          });

          return { success: true, draftId: draft.id, message: 'Draft created' };
        }
      } catch (error) {
        console.error('Error saving draft:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save draft',
        });
      }
    }),

  /**
   * CLIENT: Get own submissions
   * Returns only submissions created by the logged-in user
   */
  getMySubmissions: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
        isComplete: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const submissions = await ctx.prisma.questionnaireSubmission.findMany({
        where: {
          userId: ctx.session.user.id, // Scoped to current user
          ...(input.isComplete !== undefined && { isComplete: input.isComplete }),
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          answers: true,
          uploadedFiles: true,
        },
      });

      let nextCursor: string | undefined;
      if (submissions.length > input.limit) {
        const nextItem = submissions.pop();
        nextCursor = nextItem!.id;
      }

      return { submissions, nextCursor };
    }),

  /**
   * CLIENT: Get single submission (own only)
   * Ensures user can only access their own submissions
   */
  getMySubmission: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const submission = await ctx.prisma.questionnaireSubmission.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id, // Ensure ownership
        },
        include: {
          answers: { orderBy: { questionId: 'asc' } },
          uploadedFiles: true,
        },
      });

      if (!submission) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Submission not found',
        });
      }

      return submission;
    }),

  /**
   * ADMIN: Get all submissions
   * Admin can view all client submissions
   */
  getAllSubmissions: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
        questionnaireId: z.string().optional(),
        isComplete: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const submissions = await ctx.prisma.questionnaireSubmission.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: {
          ...(input.questionnaireId && { questionnaireId: input.questionnaireId }),
          ...(input.isComplete !== undefined && { isComplete: input.isComplete }),
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          answers: true,
          uploadedFiles: true,
        },
      });

      let nextCursor: string | undefined;
      if (submissions.length > input.limit) {
        const nextItem = submissions.pop();
        nextCursor = nextItem!.id;
      }

      return { submissions, nextCursor };
    }),

  /**
   * ADMIN: Get specific submission
   * Admin can view any submission with full details
   */
  getSubmission: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const submission = await ctx.prisma.questionnaireSubmission.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          answers: { orderBy: { questionId: 'asc' } },
          uploadedFiles: true,
        },
      });

      if (!submission) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Submission not found',
        });
      }

      return submission;
    }),

  /**
   * ADMIN: Get submission statistics
   * Overview metrics for admin dashboard
   */
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [total, completed, recent, byUser] = await Promise.all([
      ctx.prisma.questionnaireSubmission.count(),
      ctx.prisma.questionnaireSubmission.count({
        where: { isComplete: true },
      }),
      ctx.prisma.questionnaireSubmission.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      ctx.prisma.questionnaireSubmission.groupBy({
        by: ['userId'],
        _count: true,
      }),
    ]);

    return {
      totalSubmissions: total,
      completedSubmissions: completed,
      draftSubmissions: total - completed,
      recentSubmissions: recent,
      totalClients: byUser.length,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }),
});
