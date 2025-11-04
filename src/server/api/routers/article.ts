import { z } from 'zod';
import { createTRPCRouter, publicProcedure, contentCreatorProcedure, moderatorProcedure } from '@/server/api/trpc';
import { ArticleStatus, ArticleType, PublishScheduleType, UserRole, AuditAction, TranslationRequestStatus, TranslationPriority, type PrismaClient, type Prisma } from '@prisma/client';

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

  // Status & Publishing
  status: z.nativeEnum(ArticleStatus).default('DRAFT'),
  scheduledAt: z.date().optional(),

  // SEO & Metadata
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterImage: z.string().optional(),
  canonicalUrl: z.string().optional(),

  // Content Settings
  readingTime: z.number().optional(),
  allowComments: z.boolean().default(true),

  // Images & Media
  featuredImage: z.string().optional(),
  featuredImageAlt: z.string().optional(),
  gallery: z.array(z.string()).default([]),

  // Advanced Features
  template: z.string().optional(),
  customCss: z.string().optional(),
  customJs: z.string().optional(),
  structuredData: z.any().optional(),

  // Translation Tracking
  sourceVersion: z.number().optional(),
});

const updateTranslationSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  status: z.nativeEnum(ArticleStatus).optional(),
  scheduledAt: z.date().nullable().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterImage: z.string().optional(),
  canonicalUrl: z.string().optional(),
  readingTime: z.number().optional(),
  allowComments: z.boolean().optional(),
  featuredImage: z.string().optional(),
  featuredImageAlt: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  template: z.string().optional(),
  customCss: z.string().optional(),
  customJs: z.string().optional(),
  structuredData: z.any().optional(),
  isOutdated: z.boolean().optional(),
});

const bulkActionSchema = z.object({
  articleIds: z.array(z.string()),
  action: z.enum(['delete', 'changeStatus', 'changeCategory', 'addTags', 'removeTags']),
  status: z.nativeEnum(ArticleStatus).optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
});

// Translation Request schemas
const createTranslationRequestSchema = z.object({
  articleId: z.string(),
  requestedLocale: z.enum(['en', 'ar', 'fr', 'zh', 'ru']),
  priority: z.nativeEnum(TranslationPriority).default('MEDIUM'),
  dueDate: z.date().optional(),
  notes: z.string().optional(),
});

const assignTranslationRequestSchema = z.object({
  id: z.string(),
  assignedToId: z.string(),
});

const updateTranslationRequestStatusSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(TranslationRequestStatus),
  translationId: z.string().optional(), // Link when completed
});

const getTranslationRequestsSchema = z.object({
  status: z.nativeEnum(TranslationRequestStatus).optional(),
  locale: z.enum(['en', 'ar', 'fr', 'zh', 'ru']).optional(),
  assignedToId: z.string().optional(),
  requestedById: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'priority']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Helper functions
const canUserManageArticle = (userRole: UserRole, articleAuthorId: string, userId: string): boolean => {
  if (userRole === 'ADMIN') return true;
  if (userRole === 'MODERATOR') return true;
  if (userRole === 'CONTENT_CREATOR' && articleAuthorId === userId) return true;
  return false;
};

const canUserTranslate = (userRole: UserRole, translatorId: string | null, userId: string): boolean => {
  if (userRole === 'ADMIN') return true;
  if (userRole === 'MODERATOR') return true;
  if (userRole === 'TRANSLATOR' && translatorId === userId) return true;
  if (userRole === 'TRANSLATOR' && !translatorId) return true; // Can create new translation
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
  translations: {
    include: {
      translator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
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

        while (await ctx.prisma.article.findUnique({
          where: { locale_slug: { locale: articleData.locale, slug: uniqueSlug } }
        })) {
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

  // Get all articles with filters (multilingual search)
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

      // Multilingual search: Search in both main article and translations
      if (search) {
        where.OR = [
          // Search in main article
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
          // Search in translations
          {
            translations: {
              some: {
                ...(locale ? { locale } : {}),
                OR: [
                  { title: { contains: search, mode: 'insensitive' } },
                  { content: { contains: search, mode: 'insensitive' } },
                  { excerpt: { contains: search, mode: 'insensitive' } },
                ],
              },
            },
          },
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

      // Enhance results with search metadata
      const enhancedArticles = articles.map((article) => {
        let matchedField: 'title' | 'content' | 'excerpt' | 'translation' | null = null;
        let matchedTranslation: { locale: string; title: string } | null = null;

        if (search) {
          const searchLower = search.toLowerCase();

          // Check which field matched
          if (article.title.toLowerCase().includes(searchLower)) {
            matchedField = 'title';
          } else if (article.content.toLowerCase().includes(searchLower)) {
            matchedField = 'content';
          } else if (article.excerpt?.toLowerCase().includes(searchLower)) {
            matchedField = 'excerpt';
          } else {
            // Check if a translation matched
            const matchingTranslation = article.translations.find((t) =>
              t.title.toLowerCase().includes(searchLower) ||
              t.content.toLowerCase().includes(searchLower) ||
              t.excerpt?.toLowerCase().includes(searchLower)
            );

            if (matchingTranslation) {
              matchedField = 'translation';
              matchedTranslation = {
                locale: matchingTranslation.locale,
                title: matchingTranslation.title,
              };
            }
          }
        }

        return {
          ...article,
          _searchMeta: search ? {
            matchedField,
            matchedTranslation,
            isTranslationMatch: matchedField === 'translation',
          } : null,
        };
      });

      return {
        articles: enhancedArticles,
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

  // Get article by slug with fallback chain
  getBySlug: publicProcedure
    .input(z.object({
      slug: z.string(),
      locale: z.enum(['en', 'ar', 'fr', 'zh', 'ru']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { slug, locale } = input;
      const requestedLocale = locale || 'en';

      let article = null;
      let translation = null;
      let isFallback = false;
      let actualLocale = requestedLocale;

      // FALLBACK CHAIN IMPLEMENTATION

      // 1. Try exact translation for requested locale
      if (locale) {
        translation = await ctx.prisma.articleTranslation.findUnique({
          where: { locale_slug: { locale, slug } },
          include: {
            article: { include: getArticleInclude() },
            translator: { select: { id: true, name: true, email: true } },
          },
        });

        if (translation && translation.status === 'PUBLISHED') {
          article = translation.article;
          actualLocale = locale;

          // Track translation view
          await ctx.prisma.articleTranslation.update({
            where: { id: translation.id },
            data: { viewCount: { increment: 1 } },
          });
        }
      }

      // 2. If not found, try main article with same slug and locale
      if (!article) {
        article = await ctx.prisma.article.findUnique({
          where: { locale_slug: { locale: requestedLocale, slug } },
          include: getArticleInclude(),
        });

        if (article && article.status === 'PUBLISHED') {
          actualLocale = article.locale as 'en' | 'ar' | 'fr' | 'zh' | 'ru';
        } else {
          article = null;
        }
      }

      // 3. Fallback to default language (en)
      if (!article && requestedLocale !== 'en') {
        article = await ctx.prisma.article.findUnique({
          where: { locale_slug: { locale: 'en', slug } },
          include: getArticleInclude(),
        });

        if (article && article.status === 'PUBLISHED') {
          actualLocale = 'en';
          isFallback = true;
        } else {
          article = null;
        }
      }

      // 4. Try any translation of the article (by checking all articles with this slug)
      if (!article) {
        const allArticles = await ctx.prisma.article.findMany({
          where: { slug, status: 'PUBLISHED' },
          include: getArticleInclude(),
          take: 1,
        });

        if (allArticles.length > 0) {
          article = allArticles[0];
          actualLocale = article.locale as 'en' | 'ar' | 'fr' | 'zh' | 'ru';
          isFallback = true;
        }
      }

      if (!article) {
        throw new Error('Article not found');
      }

      // Increment main article view count
      await ctx.prisma.article.update({
        where: { id: article.id },
        data: { viewCount: { increment: 1 } },
      });

      // Track analytics per locale
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await ctx.prisma.articleAnalytics.upsert({
        where: {
          articleId_date_locale: {
            articleId: article.id,
            date: today,
            locale: actualLocale,
          },
        },
        update: { views: { increment: 1 }, uniqueViews: { increment: 1 } },
        create: {
          articleId: article.id,
          date: today,
          locale: actualLocale,
          views: 1,
          uniqueViews: 1,
        },
      });

      return {
        ...article,
        _meta: {
          requestedLocale,
          actualLocale,
          isFallback,
          translation: translation ? {
            id: translation.id,
            status: translation.status,
            translator: translation.translator,
            translatedAt: translation.translatedAt,
            isOutdated: translation.isOutdated,
          } : null,
        },
      };
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

        // Mark all translations as outdated when content changes
        await ctx.prisma.articleTranslation.updateMany({
          where: { articleId: id },
          data: { isOutdated: true },
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

      // Calculate reading time if not provided
      const readingTime = translationData.readingTime || Math.ceil(translationData.content.split(/\s+/).length / 200);

      const translation = await ctx.prisma.articleTranslation.create({
        data: {
          ...translationData,
          slug: uniqueSlug,
          articleId,
          translatorId: performedBy,
          readingTime,
        },
        include: {
          translator: { select: { id: true, name: true, email: true } },
          article: { select: { id: true, title: true, slug: true } },
        },
      });

      // Create initial revision
      await ctx.prisma.translationRevision.create({
        data: {
          translationId: translation.id,
          version: 1,
          title: translation.title,
          content: translation.content,
          excerpt: translation.excerpt,
          changeLog: 'Initial translation',
          createdById: performedBy,
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

  // Update translation
  updateTranslation: contentCreatorProcedure
    .input(updateTranslationSchema.extend({
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
      changeLog: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ipAddress, userAgent, changeLog, ...updateData } = input;
      const performedBy = ctx.session.user.id;
      const userRole = ctx.session.user.role;

      // Get original translation
      const originalTranslation = await ctx.prisma.articleTranslation.findUnique({
        where: { id },
        select: {
          translatorId: true,
          title: true,
          content: true,
          excerpt: true,
          articleId: true,
          locale: true,
        },
      });

      if (!originalTranslation) {
        throw new Error('Translation not found');
      }

      // Check permissions
      if (!canUserTranslate(userRole, originalTranslation.translatorId, performedBy)) {
        throw new Error('Insufficient permissions');
      }

      // Calculate reading time if content changed
      let readingTimeUpdate = {};
      if (updateData.content) {
        const wordCount = updateData.content.split(/\s+/).length;
        readingTimeUpdate = { readingTime: Math.ceil(wordCount / 200) };
      }

      // Update translation
      const translation = await ctx.prisma.articleTranslation.update({
        where: { id },
        data: {
          ...updateData,
          ...readingTimeUpdate,
          lastSyncedAt: new Date(),
        },
        include: {
          translator: { select: { id: true, name: true, email: true } },
          article: { select: { id: true, title: true, slug: true } },
        },
      });

      // Create revision if content changed
      if (updateData.title || updateData.content || updateData.excerpt) {
        const latestRevision = await ctx.prisma.translationRevision.findFirst({
          where: { translationId: id },
          orderBy: { version: 'desc' },
          select: { version: true },
        });

        const nextVersion = (latestRevision?.version || 0) + 1;

        await ctx.prisma.translationRevision.create({
          data: {
            translationId: id,
            version: nextVersion,
            title: updateData.title || originalTranslation.title,
            content: updateData.content || originalTranslation.content,
            excerpt: updateData.excerpt || originalTranslation.excerpt,
            changeLog: changeLog || 'Updated translation',
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
          translationId: id,
          articleId: originalTranslation.articleId,
          locale: originalTranslation.locale,
          action: 'translation_updated',
          updatedFields: Object.keys(updateData),
          changeLog,
        },
        ipAddress,
        userAgent
      );

      return translation;
    }),

  // Change translation status
  changeTranslationStatus: contentCreatorProcedure
    .input(z.object({
      id: z.string(),
      status: z.nativeEnum(ArticleStatus),
      publishedAt: z.date().optional(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, status, publishedAt, ipAddress, userAgent } = input;
      const performedBy = ctx.session.user.id;
      const userRole = ctx.session.user.role;

      // Get translation
      const translation = await ctx.prisma.articleTranslation.findUnique({
        where: { id },
        select: {
          translatorId: true,
          status: true,
          locale: true,
          articleId: true,
          title: true,
        },
      });

      if (!translation) {
        throw new Error('Translation not found');
      }

      // Check permissions
      if (status === 'PUBLISHED' && !canUserPublish(userRole)) {
        throw new Error('Only admins and moderators can publish translations');
      }

      if (!canUserTranslate(userRole, translation.translatorId, performedBy)) {
        throw new Error('Insufficient permissions');
      }

      const updateData: { status: ArticleStatus; publishedAt?: Date | null } = { status };

      // Set published date for published translations
      if (status === 'PUBLISHED' && !publishedAt) {
        updateData.publishedAt = new Date();
      } else if (publishedAt) {
        updateData.publishedAt = publishedAt;
      } else if (status !== 'PUBLISHED') {
        updateData.publishedAt = null;
      }

      const updatedTranslation = await ctx.prisma.articleTranslation.update({
        where: { id },
        data: updateData,
        include: {
          translator: { select: { id: true, name: true, email: true } },
          article: { select: { id: true, title: true, slug: true } },
        },
      });

      // Audit log
      await createAuditLog(
        ctx.prisma,
        performedBy,
        'ARTICLE_STATUS_CHANGED' as AuditAction,
        performedBy,
        {
          translationId: id,
          articleId: translation.articleId,
          locale: translation.locale,
          translationTitle: translation.title,
          previousStatus: translation.status,
          newStatus: status,
          publishedAt: updateData.publishedAt,
        },
        ipAddress,
        userAgent
      );

      return updatedTranslation;
    }),

  // Get hreflang links for SEO
  getHreflangLinks: publicProcedure
    .input(z.object({ articleId: z.string() }))
    .query(async ({ ctx, input }) => {
      const article = await ctx.prisma.article.findUnique({
        where: { id: input.articleId },
        select: {
          locale: true,
          slug: true,
          status: true,
        },
      });

      if (!article) {
        throw new Error('Article not found');
      }

      const translations = await ctx.prisma.articleTranslation.findMany({
        where: {
          articleId: input.articleId,
          status: 'PUBLISHED',
        },
        select: {
          locale: true,
          slug: true,
        },
      });

      const links = [];

      // Add main article if published
      if (article.status === 'PUBLISHED') {
        links.push({
          locale: article.locale,
          slug: article.slug,
          href: `/${article.locale}/${article.slug}`,
        });
      }

      // Add published translations
      translations.forEach((translation) => {
        links.push({
          locale: translation.locale,
          slug: translation.slug,
          href: `/${translation.locale}/${translation.slug}`,
        });
      });

      // Determine default locale (x-default) - prefer English, fallback to main article locale
      const defaultLink = links.find((l) => l.locale === 'en') || links.find((l) => l.locale === article.locale) || links[0];

      return {
        links,
        xDefault: defaultLink?.href || null,
      };
    }),

  // ============================================================
  // PHASE 2: ANALYTICS & SEARCH ENHANCEMENTS
  // ============================================================

  // Get translation coverage metrics
  getTranslationCoverage: moderatorProcedure.query(async ({ ctx }) => {
    // Total articles count
    const totalArticles = await ctx.prisma.article.count({
      where: { status: 'PUBLISHED' },
    });

    // Count translations per locale
    const translationsByLocale = await ctx.prisma.articleTranslation.groupBy({
      by: ['locale'],
      where: { status: 'PUBLISHED' },
      _count: { locale: true },
    });

    // Get article distribution by locale
    const articlesByLocale = await ctx.prisma.article.groupBy({
      by: ['locale'],
      where: { status: 'PUBLISHED' },
      _count: { locale: true },
    });

    // Calculate coverage per locale
    const locales: ('en' | 'ar' | 'fr' | 'zh' | 'ru')[] = ['en', 'ar', 'fr', 'zh', 'ru'];
    const coverage = locales.map((locale) => {
      const articlesInLocale = articlesByLocale.find((a) => a.locale === locale)?._count.locale || 0;
      const translationsInLocale = translationsByLocale.find((t) => t.locale === locale)?._count.locale || 0;
      const totalContent = articlesInLocale + translationsInLocale;
      const coveragePercent = totalArticles > 0 ? Math.round((totalContent / totalArticles) * 100) : 0;

      return {
        locale,
        articlesCount: articlesInLocale,
        translationsCount: translationsInLocale,
        totalContent,
        coveragePercent,
        missingTranslations: totalArticles - totalContent,
      };
    });

    return {
      totalArticles,
      coverage,
      summary: {
        totalTranslations: translationsByLocale.reduce((sum, t) => sum + t._count.locale, 0),
        avgCoverage: Math.round(coverage.reduce((sum, c) => sum + c.coveragePercent, 0) / locales.length),
      },
    };
  }),

  // Get performance metrics per locale
  getLocalePerformance: moderatorProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      locale: z.enum(['en', 'ar', 'fr', 'zh', 'ru']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, locale } = input;

      // Build date filter
      const dateFilter: { gte?: Date; lte?: Date } | undefined =
        startDate && endDate ? { gte: startDate, lte: endDate } : undefined;

      // Get analytics aggregated by locale
      const localeStats = await ctx.prisma.articleAnalytics.groupBy({
        by: ['locale'],
        where: {
          ...(locale ? { locale } : {}),
          ...(dateFilter ? { date: dateFilter } : {}),
        },
        _sum: {
          views: true,
          uniqueViews: true,
        },
        _count: { locale: true },
      });

      // Get article counts per locale
      const articleCounts = await ctx.prisma.article.groupBy({
        by: ['locale'],
        where: { status: 'PUBLISHED' },
        _count: { locale: true },
      });

      // Get translation counts per locale
      const translationCounts = await ctx.prisma.articleTranslation.groupBy({
        by: ['locale'],
        where: { status: 'PUBLISHED' },
        _count: { locale: true },
      });

      // Combine data
      const performance = localeStats.map((stat) => {
        const articles = articleCounts.find((a) => a.locale === stat.locale)?._count.locale || 0;
        const translations = translationCounts.find((t) => t.locale === stat.locale)?._count.locale || 0;
        const totalContent = articles + translations;
        const avgViewsPerContent = totalContent > 0 ? Math.round((stat._sum.views || 0) / totalContent) : 0;

        return {
          locale: stat.locale,
          views: stat._sum.views || 0,
          uniqueViews: stat._sum.uniqueViews || 0,
          articlesCount: articles,
          translationsCount: translations,
          totalContent,
          avgViewsPerContent,
        };
      });

      return {
        performance: performance.sort((a, b) => b.views - a.views),
        dateRange: { startDate, endDate },
      };
    }),

  // Get outdated translations needing updates
  getOutdatedTranslations: moderatorProcedure
    .input(z.object({
      locale: z.enum(['en', 'ar', 'fr', 'zh', 'ru']).optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { locale, page, limit } = input;
      const skip = (page - 1) * limit;

      const where: Prisma.ArticleTranslationWhereInput = {
        isOutdated: true,
        ...(locale ? { locale } : {}),
      };

      const [translations, total] = await Promise.all([
        ctx.prisma.articleTranslation.findMany({
          where,
          skip,
          take: limit,
          orderBy: { updatedAt: 'desc' },
          include: {
            article: {
              select: {
                id: true,
                title: true,
                slug: true,
                locale: true,
                updatedAt: true,
              },
            },
            translator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        ctx.prisma.articleTranslation.count({ where }),
      ]);

      return {
        translations,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      };
    }),

  // Get comprehensive translation statistics
  getTranslationStats: moderatorProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = input;

      // Build date filter
      const dateFilter: { gte?: Date; lte?: Date } | undefined =
        startDate && endDate ? { gte: startDate, lte: endDate } : undefined;

      const [
        totalTranslations,
        publishedTranslations,
        draftTranslations,
        outdatedCount,
        totalViews,
        translationsByLocale,
        recentTranslations,
      ] = await Promise.all([
        ctx.prisma.articleTranslation.count(),
        ctx.prisma.articleTranslation.count({ where: { status: 'PUBLISHED' } }),
        ctx.prisma.articleTranslation.count({ where: { status: 'DRAFT' } }),
        ctx.prisma.articleTranslation.count({ where: { isOutdated: true } }),
        ctx.prisma.articleTranslation.aggregate({ _sum: { viewCount: true } }),
        ctx.prisma.articleTranslation.groupBy({
          by: ['locale'],
          _count: { locale: true },
        }),
        ctx.prisma.articleTranslation.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        }),
      ]);

      const byLocale: Record<string, number> = {};
      translationsByLocale.forEach((item) => {
        byLocale[item.locale] = item._count.locale;
      });

      return {
        totalTranslations,
        publishedTranslations,
        draftTranslations,
        outdatedCount,
        totalViews: totalViews._sum.viewCount || 0,
        avgViewsPerTranslation: publishedTranslations > 0
          ? Math.round((totalViews._sum.viewCount || 0) / publishedTranslations)
          : 0,
        recentTranslations,
        byLocale,
        healthScore: publishedTranslations > 0
          ? Math.round(((publishedTranslations - outdatedCount) / publishedTranslations) * 100)
          : 100,
      };
    }),

  // Get top performing translations
  getTopTranslations: moderatorProcedure
    .input(z.object({
      locale: z.enum(['en', 'ar', 'fr', 'zh', 'ru']).optional(),
      limit: z.number().default(10),
      orderBy: z.enum(['viewCount', 'shareCount']).default('viewCount'),
    }))
    .query(async ({ ctx, input }) => {
      const { locale, limit, orderBy } = input;

      const translations = await ctx.prisma.articleTranslation.findMany({
        where: {
          status: 'PUBLISHED',
          ...(locale ? { locale } : {}),
        },
        take: limit,
        orderBy: { [orderBy]: 'desc' },
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
              locale: true,
            },
          },
          translator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return {
        translations,
        orderBy,
      };
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

  // ============================================================
  // PHASE 3: TRANSLATION REQUESTS & WORKFLOW
  // ============================================================

  // Create translation request
  createTranslationRequest: contentCreatorProcedure
    .input(createTranslationRequestSchema.extend({
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { articleId, requestedLocale, priority, dueDate, notes, ipAddress, userAgent } = input;
      const performedBy = ctx.session.user.id;

      // Verify article exists
      const article = await ctx.prisma.article.findUnique({
        where: { id: articleId },
        select: { id: true, title: true, locale: true },
      });

      if (!article) {
        throw new Error('Article not found');
      }

      // Check if translation already exists
      const existingTranslation = await ctx.prisma.articleTranslation.findUnique({
        where: { articleId_locale: { articleId, locale: requestedLocale } },
      });

      if (existingTranslation) {
        throw new Error('Translation already exists for this locale');
      }

      // Check if request already exists
      const existingRequest = await ctx.prisma.translationRequest.findFirst({
        where: {
          articleId,
          requestedLocale,
          status: { in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] },
        },
      });

      if (existingRequest) {
        throw new Error('Active translation request already exists for this locale');
      }

      // Create translation request
      const request = await ctx.prisma.translationRequest.create({
        data: {
          articleId,
          requestedLocale,
          requestedById: performedBy,
          priority,
          dueDate,
          notes,
          status: 'PENDING',
        },
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
              locale: true,
            },
          },
          requestedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Audit log
      await createAuditLog(
        ctx.prisma,
        performedBy,
        'ARTICLE_UPDATED' as AuditAction,
        performedBy,
        {
          action: 'translation_request_created',
          requestId: request.id,
          articleId,
          articleTitle: article.title,
          requestedLocale,
          priority,
        },
        ipAddress,
        userAgent
      );

      return request;
    }),

  // Assign translation request
  assignTranslationRequest: moderatorProcedure
    .input(assignTranslationRequestSchema.extend({
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, assignedToId, ipAddress, userAgent } = input;
      const performedBy = ctx.session.user.id;

      // Get request
      const request = await ctx.prisma.translationRequest.findUnique({
        where: { id },
        select: {
          status: true,
          articleId: true,
          requestedLocale: true,
          article: { select: { title: true } },
        },
      });

      if (!request) {
        throw new Error('Translation request not found');
      }

      if (request.status !== 'PENDING') {
        throw new Error('Only pending requests can be assigned');
      }

      // Verify translator exists and has TRANSLATOR role
      const translator = await ctx.prisma.user.findUnique({
        where: { id: assignedToId },
        select: { id: true, name: true, email: true, role: true },
      });

      if (!translator) {
        throw new Error('Translator not found');
      }

      if (translator.role !== 'TRANSLATOR' && translator.role !== 'ADMIN') {
        throw new Error('User must have TRANSLATOR or ADMIN role');
      }

      // Update request
      const updatedRequest = await ctx.prisma.translationRequest.update({
        where: { id },
        data: {
          assignedToId,
          status: 'ASSIGNED',
        },
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
              locale: true,
            },
          },
          requestedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Create notification for translator
      await ctx.prisma.notification.create({
        data: {
          userId: assignedToId,
          type: 'TRANSLATION_ASSIGNED',
          title: 'Translation Request Assigned',
          message: `You have been assigned to translate "${request.article.title}" to ${request.requestedLocale}`,
          articleId: request.articleId,
          translationRequestId: id,
        },
      });

      // Audit log
      await createAuditLog(
        ctx.prisma,
        performedBy,
        'ARTICLE_UPDATED' as AuditAction,
        performedBy,
        {
          action: 'translation_request_assigned',
          requestId: id,
          articleId: request.articleId,
          articleTitle: request.article.title,
          assignedToId,
          assignedToName: translator.name,
        },
        ipAddress,
        userAgent
      );

      return updatedRequest;
    }),

  // Update translation request status
  updateTranslationRequestStatus: contentCreatorProcedure
    .input(updateTranslationRequestStatusSchema.extend({
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, status, translationId, ipAddress, userAgent } = input;
      const performedBy = ctx.session.user.id;
      const userRole = ctx.session.user.role;

      // Get request
      const request = await ctx.prisma.translationRequest.findUnique({
        where: { id },
        select: {
          status: true,
          assignedToId: true,
          requestedById: true,
          articleId: true,
          requestedLocale: true,
          article: { select: { title: true } },
        },
      });

      if (!request) {
        throw new Error('Translation request not found');
      }

      // Check permissions
      const canUpdate =
        userRole === 'ADMIN' ||
        userRole === 'MODERATOR' ||
        request.assignedToId === performedBy ||
        request.requestedById === performedBy;

      if (!canUpdate) {
        throw new Error('Insufficient permissions');
      }

      // Status transition validation
      const validTransitions: Record<TranslationRequestStatus, TranslationRequestStatus[]> = {
        PENDING: ['ASSIGNED', 'CANCELLED'],
        ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
        IN_PROGRESS: ['COMPLETED', 'ASSIGNED', 'CANCELLED'],
        COMPLETED: [], // Cannot change from completed
        CANCELLED: [], // Cannot change from cancelled
      };

      if (!validTransitions[request.status].includes(status)) {
        throw new Error(`Cannot transition from ${request.status} to ${status}`);
      }

      // If completing, verify translation is provided
      if (status === 'COMPLETED' && !translationId) {
        throw new Error('Translation ID is required when completing a request');
      }

      // If translation provided, verify it exists and matches
      if (translationId) {
        const translation = await ctx.prisma.articleTranslation.findUnique({
          where: { id: translationId },
          select: { articleId: true, locale: true },
        });

        if (!translation) {
          throw new Error('Translation not found');
        }

        if (translation.articleId !== request.articleId || translation.locale !== request.requestedLocale) {
          throw new Error('Translation does not match request');
        }
      }

      // Update request
      const updatedRequest = await ctx.prisma.translationRequest.update({
        where: { id },
        data: {
          status,
          ...(translationId ? { translationId } : {}),
        },
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
              locale: true,
            },
          },
          requestedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          translation: true,
        },
      });

      // Create notification based on status
      if (status === 'COMPLETED' && request.requestedById !== performedBy) {
        await ctx.prisma.notification.create({
          data: {
            userId: request.requestedById,
            type: 'TRANSLATION_COMPLETED',
            title: 'Translation Completed',
            message: `Translation of "${request.article.title}" to ${request.requestedLocale} has been completed`,
            articleId: request.articleId,
            translationRequestId: id,
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
          action: 'translation_request_status_updated',
          requestId: id,
          articleId: request.articleId,
          articleTitle: request.article.title,
          previousStatus: request.status,
          newStatus: status,
          translationId,
        },
        ipAddress,
        userAgent
      );

      return updatedRequest;
    }),

  // Get translation requests with filters
  getTranslationRequests: contentCreatorProcedure
    .input(getTranslationRequestsSchema)
    .query(async ({ ctx, input }) => {
      const { status, locale, assignedToId, requestedById, page, limit, sortBy, sortOrder } = input;
      const skip = (page - 1) * limit;
      const userRole = ctx.session.user.role;
      const userId = ctx.session.user.id;

      // Build where clause
      const where: Prisma.TranslationRequestWhereInput = {};

      if (status) where.status = status;
      if (locale) where.requestedLocale = locale;
      if (assignedToId) where.assignedToId = assignedToId;
      if (requestedById) where.requestedById = requestedById;

      // Non-admin/moderator users can only see their own requests
      if (userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
        where.OR = [
          { requestedById: userId },
          { assignedToId: userId },
        ];
      }

      const [requests, total] = await Promise.all([
        ctx.prisma.translationRequest.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            article: {
              select: {
                id: true,
                title: true,
                slug: true,
                locale: true,
              },
            },
            requestedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            translation: {
              select: {
                id: true,
                status: true,
                title: true,
              },
            },
          },
        }),
        ctx.prisma.translationRequest.count({ where }),
      ]);

      return {
        requests,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      };
    }),

  // Cancel translation request
  cancelTranslationRequest: contentCreatorProcedure
    .input(z.object({
      id: z.string(),
      reason: z.string().optional(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, reason, ipAddress, userAgent } = input;
      const performedBy = ctx.session.user.id;
      const userRole = ctx.session.user.role;

      // Get request
      const request = await ctx.prisma.translationRequest.findUnique({
        where: { id },
        select: {
          status: true,
          requestedById: true,
          assignedToId: true,
          articleId: true,
          requestedLocale: true,
          article: { select: { title: true } },
        },
      });

      if (!request) {
        throw new Error('Translation request not found');
      }

      // Check permissions
      const canCancel =
        userRole === 'ADMIN' ||
        userRole === 'MODERATOR' ||
        request.requestedById === performedBy;

      if (!canCancel) {
        throw new Error('Only admins, moderators, or the requester can cancel requests');
      }

      // Cannot cancel completed requests
      if (request.status === 'COMPLETED') {
        throw new Error('Cannot cancel completed translation requests');
      }

      if (request.status === 'CANCELLED') {
        throw new Error('Request is already cancelled');
      }

      // Update request
      const updatedRequest = await ctx.prisma.translationRequest.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          notes: reason ? `Cancelled: ${reason}` : 'Cancelled',
        },
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
              locale: true,
            },
          },
          requestedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Notify assigned translator if any
      if (request.assignedToId && request.assignedToId !== performedBy) {
        await ctx.prisma.notification.create({
          data: {
            userId: request.assignedToId,
            type: 'TRANSLATION_REQUESTED', // Reusing type for cancellation notice
            title: 'Translation Request Cancelled',
            message: `Translation request for "${request.article.title}" to ${request.requestedLocale} has been cancelled`,
            articleId: request.articleId,
            translationRequestId: id,
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
          action: 'translation_request_cancelled',
          requestId: id,
          articleId: request.articleId,
          articleTitle: request.article.title,
          reason,
        },
        ipAddress,
        userAgent
      );

      return updatedRequest;
    }),
});