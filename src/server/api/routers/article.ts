import { z } from 'zod';
import { createTRPCRouter, publicProcedure, contentCreatorProcedure, moderatorProcedure } from '@/server/api/trpc';
import { ArticleStatus, ArticleType, PublishScheduleType, UserRole, AuditAction, type PrismaClient, type Prisma } from '@prisma/client';

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

// Schema definitions
const createArticleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  locale: z.enum(['en', 'ar', 'fr', 'zh', 'ru']).default('en'),
  status: z.nativeEnum(ArticleStatus).default('DRAFT'),
  type: z.nativeEnum(ArticleType).default('BLOG_POST'),
  publishScheduleType: z.nativeEnum(PublishScheduleType).default('MANUAL'),
  scheduledAt: z.date().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  canonicalUrl: z.string().optional(),
  allowComments: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).default([]),
  featuredImage: z.string().optional(),
  featuredImageAlt: z.string().optional(),
  gallery: z.array(z.string()).default([]),
  template: z.string().optional(),
  customCss: z.string().optional(),
  customJs: z.string().optional(),
  structuredData: z.any().optional(),
});

const updateArticleSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  status: z.nativeEnum(ArticleStatus).optional(),
  type: z.nativeEnum(ArticleType).optional(),
  publishScheduleType: z.nativeEnum(PublishScheduleType).optional(),
  scheduledAt: z.date().nullable().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  canonicalUrl: z.string().optional(),
  allowComments: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  categoryId: z.string().nullable().optional(),
  tagIds: z.array(z.string()).optional(),
  featuredImage: z.string().optional(),
  featuredImageAlt: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  template: z.string().optional(),
  customCss: z.string().optional(),
  customJs: z.string().optional(),
  structuredData: z.any().optional(),
});

const articleListSchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(ArticleStatus).optional(),
  type: z.nativeEnum(ArticleType).optional(),
  locale: z.enum(['en', 'ar', 'fr', 'zh', 'ru']).optional(),
  categoryId: z.string().optional(),
  authorId: z.string().optional(),
  isFeatured: z.boolean().optional(),
  page: z.number().default(1),
  limit: z.number().default(10),
  sortBy: z.enum(['createdAt', 'updatedAt', 'publishedAt', 'title', 'viewCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const changeStatusSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(ArticleStatus),
  publishedAt: z.date().optional(),
  rejectionReason: z.string().optional(),
});

const createTranslationSchema = z.object({
  articleId: z.string(),
  locale: z.enum(['en', 'ar', 'fr', 'zh', 'ru']),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

const bulkActionSchema = z.object({
  articleIds: z.array(z.string()),
  action: z.enum(['delete', 'changeStatus', 'changeCategory', 'addTags', 'removeTags']),
  status: z.nativeEnum(ArticleStatus).optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
});

// Helper functions
const canUserManageArticle = (userRole: UserRole, articleAuthorId: string, userId: string): boolean => {
  if (userRole === 'ADMIN') return true;
  if (userRole === 'MODERATOR') return true;
  if (userRole === 'CONTENT_CREATOR' && articleAuthorId === userId) return true;
  return false;
};

const canUserPublish = (userRole: UserRole): boolean => {
  return userRole === 'ADMIN' || userRole === 'MODERATOR';
};

const getArticleInclude = () => ({
  author: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  tags: {
    include: {
      tag: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
  translations: true,
  _count: {
    select: {
      comments: true,
      revisions: true,
    },
  },
});

export const articleRouter = createTRPCRouter({
  // Create new article
  create: contentCreatorProcedure
    .input(createArticleSchema.extend({
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { ipAddress, userAgent, tagIds, ...articleData } = input;
      const performedBy = ctx.session.user.id;

      // Create slug if not provided
      if (!articleData.slug) {
        const baseSlug = articleData.title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();

        let uniqueSlug = baseSlug;
        let counter = 1;

        while (await ctx.prisma.article.findUnique({ where: { slug: uniqueSlug } })) {
          uniqueSlug = `${baseSlug}-${counter}`;
          counter++;
        }

        articleData.slug = uniqueSlug;
      }

      // Calculate reading time (average 200 WPM)
      const wordCount = articleData.content.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200);

      const article = await ctx.prisma.article.create({
        data: {
          ...articleData,
          authorId: performedBy,
          readingTime,
          tags: tagIds.length > 0 ? {
            create: tagIds.map(tagId => ({ tagId }))
          } : undefined,
        },
        include: getArticleInclude(),
      });

      // Create initial revision
      await ctx.prisma.articleRevision.create({
        data: {
          articleId: article.id,
          version: 1,
          title: article.title,
          content: article.content,
          excerpt: article.excerpt,
          changeLog: 'Initial version',
          createdById: performedBy,
        },
      });

      // Audit log
      await createAuditLog(
        ctx.prisma,
        performedBy,
        'ARTICLE_CREATED' as AuditAction,
        performedBy,
        { articleId: article.id, articleTitle: article.title, status: article.status },
        ipAddress,
        userAgent
      );

      return article;
    }),

  // Get all articles with filters
  getAll: publicProcedure
    .input(articleListSchema)
    .query(async ({ ctx, input }) => {
      const { search, status, type, locale, categoryId, authorId, isFeatured, page, limit, sortBy, sortOrder } = input;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.ArticleWhereInput = {};

      if (status) where.status = status;
      if (type) where.type = type;
      if (locale) where.locale = locale;
      if (categoryId) where.categoryId = categoryId;
      if (authorId) where.authorId = authorId;
      if (isFeatured !== undefined) where.isFeatured = isFeatured;

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [articles, total] = await Promise.all([
        ctx.prisma.article.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: getArticleInclude(),
        }),
        ctx.prisma.article.count({ where }),
      ]);

      return {
        articles,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      };
    }),

  // Get article by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const article = await ctx.prisma.article.findUnique({
        where: { id: input.id },
        include: {
          ...getArticleInclude(),
          revisions: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
              createdBy: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });

      if (!article) {
        throw new Error('Article not found');
      }

      return article;
    }),

  // Get article by slug
  getBySlug: publicProcedure
    .input(z.object({
      slug: z.string(),
      locale: z.enum(['en', 'ar', 'fr', 'zh', 'ru']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { slug, locale } = input;

      // First try to find by main article slug
      let article = await ctx.prisma.article.findUnique({
        where: { slug },
        include: getArticleInclude(),
      });

      // If not found and locale specified, try translation
      if (!article && locale) {
        const translation = await ctx.prisma.articleTranslation.findUnique({
          where: {
            locale_slug: { locale, slug }
          },
          include: {
            article: {
              include: getArticleInclude(),
            },
          },
        });

        if (translation) {
          article = translation.article;
        }
      }

      if (!article) {
        throw new Error('Article not found');
      }

      // Increment view count for published articles
      if (article.status === 'PUBLISHED') {
        await ctx.prisma.article.update({
          where: { id: article.id },
          data: { viewCount: { increment: 1 } },
        });
      }

      return article;
    }),

  // Update article
  update: contentCreatorProcedure
    .input(updateArticleSchema.extend({
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
      changeLog: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ipAddress, userAgent, changeLog, tagIds, ...updateData } = input;
      const performedBy = ctx.session.user.id;
      const userRole = ctx.session.user.role;

      // Get original article and check permissions
      const originalArticle = await ctx.prisma.article.findUnique({
        where: { id },
        select: { authorId: true, title: true, content: true, excerpt: true },
      });

      if (!originalArticle) {
        throw new Error('Article not found');
      }

      // Check if user can manage this article
      if (!canUserManageArticle(userRole, originalArticle.authorId, performedBy)) {
        throw new Error('Insufficient permissions');
      }

      // Calculate reading time if content changed
      let readingTimeUpdate = {};
      if (updateData.content) {
        const wordCount = updateData.content.split(/\s+/).length;
        readingTimeUpdate = { readingTime: Math.ceil(wordCount / 200) };
      }

      // Handle tag updates
      let tagUpdates = {};
      if (tagIds !== undefined) {
        tagUpdates = {
          tags: {
            deleteMany: {},
            create: tagIds.map(tagId => ({ tagId })),
          }
        };
      }

      const article = await ctx.prisma.article.update({
        where: { id },
        data: {
          ...updateData,
          ...readingTimeUpdate,
          ...tagUpdates,
        },
        include: getArticleInclude(),
      });

      // Create revision if content changed
      if (updateData.title || updateData.content || updateData.excerpt) {
        // Get the latest version number
        const latestRevision = await ctx.prisma.articleRevision.findFirst({
          where: { articleId: id },
          orderBy: { version: 'desc' },
          select: { version: true },
        });

        const nextVersion = (latestRevision?.version || 0) + 1;

        await ctx.prisma.articleRevision.create({
          data: {
            articleId: id,
            version: nextVersion,
            title: updateData.title || originalArticle.title,
            content: updateData.content || originalArticle.content,
            excerpt: updateData.excerpt || originalArticle.excerpt,
            changeLog: changeLog || 'Updated article',
            createdById: performedBy,
          },
        });
      }

      // Audit log
      await createAuditLog(
        ctx.prisma,
        performedBy,
        'ARTICLE_UPDATED' as AuditAction,
        performedBy,
        {
          articleId: id,
          originalData: originalArticle,
          updatedFields: Object.keys(updateData),
          changeLog
        },
        ipAddress,
        userAgent
      );

      return article;
    }),

  // Change article status (workflow)
  changeStatus: contentCreatorProcedure
    .input(changeStatusSchema.extend({
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, status, publishedAt, rejectionReason, ipAddress, userAgent } = input;
      const performedBy = ctx.session.user.id;
      const userRole = ctx.session.user.role;

      // Get article and check permissions
      const article = await ctx.prisma.article.findUnique({
        where: { id },
        select: { authorId: true, status: true, title: true },
      });

      if (!article) {
        throw new Error('Article not found');
      }

      // Check status change permissions
      if (status === 'PUBLISHED' && !canUserPublish(userRole)) {
        throw new Error('Only admins and moderators can publish articles');
      }

      if (!canUserManageArticle(userRole, article.authorId, performedBy)) {
        throw new Error('Insufficient permissions');
      }

      const updateData: { status: ArticleStatus; publishedAt?: Date | null; rejectionReason?: string | null } = { status };

      // Set published date for published articles
      if (status === 'PUBLISHED' && !publishedAt) {
        updateData.publishedAt = new Date();
      } else if (publishedAt) {
        updateData.publishedAt = publishedAt;
      }

      const updatedArticle = await ctx.prisma.article.update({
        where: { id },
        data: updateData,
        include: getArticleInclude(),
      });

      // Audit log
      await createAuditLog(
        ctx.prisma,
        performedBy,
        'ARTICLE_STATUS_CHANGED' as AuditAction,
        performedBy,
        {
          articleId: id,
          articleTitle: article.title,
          previousStatus: article.status,
          newStatus: status,
          rejectionReason,
          publishedAt: updateData.publishedAt
        },
        ipAddress,
        userAgent
      );

      return updatedArticle;
    }),

  // Delete article
  delete: contentCreatorProcedure
    .input(z.object({
      id: z.string(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ipAddress, userAgent } = input;
      const performedBy = ctx.session.user.id;
      const userRole = ctx.session.user.role;

      // Get article and check permissions
      const article = await ctx.prisma.article.findUnique({
        where: { id },
        select: { authorId: true, title: true },
      });

      if (!article) {
        throw new Error('Article not found');
      }

      if (!canUserManageArticle(userRole, article.authorId, performedBy)) {
        throw new Error('Insufficient permissions');
      }

      // Delete article (cascades to related records)
      await ctx.prisma.article.delete({
        where: { id },
      });

      // Audit log
      await createAuditLog(
        ctx.prisma,
        performedBy,
        'ARTICLE_ARCHIVED' as AuditAction,
        performedBy,
        { articleId: id, articleTitle: article.title },
        ipAddress,
        userAgent
      );

      return { success: true };
    }),

  // Bulk operations
  bulkAction: moderatorProcedure
    .input(bulkActionSchema.extend({
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { articleIds, action, status, categoryId, tagIds, ipAddress, userAgent } = input;
      const performedBy = ctx.session.user.id;

      let result;

      switch (action) {
        case 'delete':
          result = await ctx.prisma.article.deleteMany({
            where: { id: { in: articleIds } },
          });
          break;

        case 'changeStatus':
          if (!status) throw new Error('Status is required');
          result = await ctx.prisma.article.updateMany({
            where: { id: { in: articleIds } },
            data: {
              status,
              ...(status === 'PUBLISHED' ? { publishedAt: new Date() } : {})
            },
          });
          break;

        case 'changeCategory':
          result = await ctx.prisma.article.updateMany({
            where: { id: { in: articleIds } },
            data: { categoryId },
          });
          break;

        default:
          throw new Error('Invalid bulk action');
      }

      // Audit log
      await createAuditLog(
        ctx.prisma,
        performedBy,
        'BULK_UPDATE' as AuditAction,
        performedBy,
        {
          action,
          articleIds,
          affectedCount: result.count,
          status,
          categoryId,
          tagIds
        },
        ipAddress,
        userAgent
      );

      return result;
    }),

  // Create translation
  createTranslation: contentCreatorProcedure
    .input(createTranslationSchema.extend({
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { articleId, ipAddress, userAgent, ...translationData } = input;
      const performedBy = ctx.session.user.id;
      const userRole = ctx.session.user.role;

      // Check permissions
      const article = await ctx.prisma.article.findUnique({
        where: { id: articleId },
        select: { authorId: true, title: true },
      });

      if (!article) {
        throw new Error('Article not found');
      }

      if (!canUserManageArticle(userRole, article.authorId, performedBy)) {
        throw new Error('Insufficient permissions');
      }

      // Create unique slug for translation
      let uniqueSlug = translationData.slug;
      let counter = 1;

      while (await ctx.prisma.articleTranslation.findUnique({
        where: { locale_slug: { locale: translationData.locale, slug: uniqueSlug } }
      })) {
        uniqueSlug = `${translationData.slug}-${counter}`;
        counter++;
      }

      const translation = await ctx.prisma.articleTranslation.create({
        data: {
          ...translationData,
          slug: uniqueSlug,
          articleId,
        },
      });

      // Audit log
      await createAuditLog(
        ctx.prisma,
        performedBy,
        'ARTICLE_UPDATED' as AuditAction,
        performedBy,
        {
          articleId,
          action: 'translation_created',
          locale: translationData.locale,
          originalTitle: article.title
        },
        ipAddress,
        userAgent
      );

      return translation;
    }),

  // Get article analytics
  getAnalytics: publicProcedure
    .input(z.object({
      articleId: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      page: z.number().default(1),
      limit: z.number().default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { articleId, startDate, endDate, page, limit } = input;
      const skip = (page - 1) * limit;

      const where: Prisma.ArticleAnalyticsWhereInput = {};
      if (articleId) where.articleId = articleId;
      if (startDate && endDate) {
        where.date = {
          gte: startDate,
          lte: endDate,
        };
      }

      const [analytics, total] = await Promise.all([
        ctx.prisma.articleAnalytics.findMany({
          where,
          skip,
          take: limit,
          orderBy: { date: 'desc' },
          include: {
            article: {
              select: { id: true, title: true, slug: true },
            },
          },
        }),
        ctx.prisma.articleAnalytics.count({ where }),
      ]);

      return {
        analytics,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      };
    }),

  // Get article stats
  getStats: publicProcedure.query(async ({ ctx }) => {
    const [
      total,
      published,
      draft,
      pendingReview,
      featured,
      totalViews,
      recentArticles
    ] = await Promise.all([
      ctx.prisma.article.count(),
      ctx.prisma.article.count({ where: { status: 'PUBLISHED' } }),
      ctx.prisma.article.count({ where: { status: 'DRAFT' } }),
      ctx.prisma.article.count({ where: { status: 'PENDING_REVIEW' } }),
      ctx.prisma.article.count({ where: { isFeatured: true } }),
      ctx.prisma.article.aggregate({ _sum: { viewCount: true } }),
      ctx.prisma.article.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      total,
      published,
      draft,
      pendingReview,
      featured,
      totalViews: totalViews._sum.viewCount || 0,
      recentArticles,
    };
  }),

  // Get categories
  getCategories: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
  }),

  // Get tags
  getTags: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
  }),

  // Get analytics for articles dashboard
  getDashboardAnalytics: publicProcedure
    .input(z.object({
      authorId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { authorId } = input;

      const where = authorId ? { authorId } : {};

      const [
        totalArticles,
        publishedArticles,
        draftArticles,
        pendingReview,
        totalViews,
        totalShares,
        avgReadingTime,
        statusCounts,
        typeCounts,
        localeCounts
      ] = await Promise.all([
        ctx.prisma.article.count({ where }),
        ctx.prisma.article.count({ where: { ...where, status: 'PUBLISHED' } }),
        ctx.prisma.article.count({ where: { ...where, status: 'DRAFT' } }),
        ctx.prisma.article.count({ where: { ...where, status: 'PENDING_REVIEW' } }),
        ctx.prisma.article.aggregate({
          where,
          _sum: { viewCount: true }
        }),
        ctx.prisma.article.aggregate({
          where,
          _sum: { shareCount: true }
        }),
        ctx.prisma.article.aggregate({
          where,
          _avg: { readingTime: true }
        }),
        ctx.prisma.article.groupBy({
          where,
          by: ['status'],
          _count: { status: true }
        }),
        ctx.prisma.article.groupBy({
          where,
          by: ['type'],
          _count: { type: true }
        }),
        ctx.prisma.article.groupBy({
          where,
          by: ['locale'],
          _count: { locale: true }
        })
      ]);

      const byStatus: Record<string, number> = {};
      statusCounts.forEach(item => {
        byStatus[item.status] = item._count.status;
      });

      const byType: Record<string, number> = {};
      typeCounts.forEach(item => {
        byType[item.type] = item._count.type;
      });

      const byLocale: Record<string, number> = {};
      localeCounts.forEach(item => {
        byLocale[item.locale] = item._count.locale;
      });

      return {
        totalArticles,
        publishedArticles,
        draftArticles,
        pendingReview,
        totalViews: totalViews._sum.viewCount || 0,
        totalShares: totalShares._sum.shareCount || 0,
        avgReadingTime: Math.round(avgReadingTime._avg.readingTime || 0),
        byStatus,
        byType,
        byLocale,
      };
    }),

  // Bulk update articles
  bulkUpdate: moderatorProcedure
    .input(z.object({
      ids: z.array(z.string()),
      data: z.object({
        status: z.nativeEnum(ArticleStatus).optional(),
        type: z.nativeEnum(ArticleType).optional(),
        isFeatured: z.boolean().optional(),
        categoryId: z.string().nullable().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const { ids, data } = input;

      const result = await ctx.prisma.article.updateMany({
        where: { id: { in: ids } },
        data,
      });

      return result;
    }),
});