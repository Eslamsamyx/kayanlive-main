/**
 * Multilingual CMS Test Data Seeding Script
 *
 * This script creates comprehensive test data for all multilingual features:
 * - Test users (Admin, Translators, Content Creator)
 * - Test articles in multiple scenarios
 * - Translations in various states
 * - Translation requests in all workflow states
 * - Analytics data for testing metrics
 *
 * Run: npx ts-node scripts/seed-multilingual-test-data.ts
 */

import { PrismaClient, UserRole, ArticleStatus, ArticleType, TranslationRequestStatus, TranslationPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Test user credentials
const TEST_PASSWORD = 'Test123456!';
const TEST_USERS = {
  admin: 'test-admin@kayanlive.test',
  translator1: 'test-translator1@kayanlive.test',
  translator2: 'test-translator2@kayanlive.test',
  contentCreator: 'test-creator@kayanlive.test',
};

interface TestDataIds {
  users: {
    admin: string;
    translator1: string;
    translator2: string;
    contentCreator: string;
  };
  category: string;
  articles: {
    englishOnly: string;
    withFrenchPublished: string;
    withArabicDraft: string;
    frenchMain: string;
    outdatedTranslations: string;
    multipleTranslations: string;
  };
  translations: {
    french1: string;
    arabicDraft: string;
    frenchOutdated: string;
    frenchMulti: string;
    arabicMulti: string;
    chineseMulti: string;
  };
}

async function main() {
  console.log('🌍 Starting Multilingual CMS Test Data Seeding...\n');

  try {
    // Check if test data already exists
    const existingTestUser = await prisma.user.findFirst({
      where: { email: { contains: 'kayanlive.test' } }
    });

    if (existingTestUser) {
      console.log('⚠️  Test data already exists. Run cleanup script first if you want to reseed.');
      console.log('   Run: npx ts-node scripts/cleanup-multilingual-test-data.ts\n');
      return;
    }

    const ids: TestDataIds = {
      users: { admin: '', translator1: '', translator2: '', contentCreator: '' },
      category: '',
      articles: {
        englishOnly: '',
        withFrenchPublished: '',
        withArabicDraft: '',
        frenchMain: '',
        outdatedTranslations: '',
        multipleTranslations: '',
      },
      translations: {
        french1: '',
        arabicDraft: '',
        frenchOutdated: '',
        frenchMulti: '',
        arabicMulti: '',
        chineseMulti: '',
      },
    };

    // Step 1: Create test users
    console.log('👥 Creating test users...');
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);

    const admin = await prisma.user.create({
      data: {
        email: TEST_USERS.admin,
        name: 'Test Admin',
        password: hashedPassword,
        role: UserRole.ADMIN,
        isActive: true,
      },
    });
    ids.users.admin = admin.id;
    console.log(`   ✅ Created admin: ${admin.email}`);

    const translator1 = await prisma.user.create({
      data: {
        email: TEST_USERS.translator1,
        name: 'Test Translator 1',
        password: hashedPassword,
        role: UserRole.TRANSLATOR,
        isActive: true,
      },
    });
    ids.users.translator1 = translator1.id;
    console.log(`   ✅ Created translator 1: ${translator1.email}`);

    const translator2 = await prisma.user.create({
      data: {
        email: TEST_USERS.translator2,
        name: 'Test Translator 2',
        password: hashedPassword,
        role: UserRole.TRANSLATOR,
        isActive: true,
      },
    });
    ids.users.translator2 = translator2.id;
    console.log(`   ✅ Created translator 2: ${translator2.email}`);

    const contentCreator = await prisma.user.create({
      data: {
        email: TEST_USERS.contentCreator,
        name: 'Test Content Creator',
        password: hashedPassword,
        role: UserRole.CONTENT_CREATOR,
        isActive: true,
      },
    });
    ids.users.contentCreator = contentCreator.id;
    console.log(`   ✅ Created content creator: ${contentCreator.email}\n`);

    // Step 2: Create test category
    console.log('📁 Creating test category...');
    const category = await prisma.category.create({
      data: {
        name: 'TEST Category',
        slug: 'test-category',
        description: 'Test category for multilingual testing',
        createdById: ids.users.admin, // Use admin as category creator
      },
    });
    ids.category = category.id;
    console.log(`   ✅ Created category: ${category.name}\n`);

    // Step 3: Create test articles with different scenarios
    console.log('📝 Creating test articles...');

    // Article 1: English only (no translations)
    const article1 = await prisma.article.create({
      data: {
        title: 'TEST English Only Article',
        slug: 'test-english-only',
        locale: 'en',
        excerpt: 'This article has no translations - tests fallback to English',
        content: '<p>This is an English-only article for testing fallback scenarios.</p>',
        status: ArticleStatus.PUBLISHED,
        type: ArticleType.BLOG_POST,
        publishedAt: new Date(),
        authorId: ids.users.contentCreator,
        categoryId: ids.category,
        featuredImage: 'https://via.placeholder.com/800x400/7afdd6/2c2c2b?text=English+Only',
        metaTitle: 'TEST English Only Article',
        metaDescription: 'Testing fallback to English when no translation exists',
        readingTime: 2,
      },
    });
    ids.articles.englishOnly = article1.id;
    console.log(`   ✅ Article 1: ${article1.title} (no translations)`);

    // Article 2: English with French published translation
    const article2 = await prisma.article.create({
      data: {
        title: 'TEST Article With French Translation',
        slug: 'test-with-french-published',
        locale: 'en',
        excerpt: 'This article has a published French translation',
        content: '<p>This article tests the exact translation match scenario.</p>',
        status: ArticleStatus.PUBLISHED,
        type: ArticleType.BLOG_POST,
        publishedAt: new Date(),
        authorId: ids.users.contentCreator,
        categoryId: ids.category,
        featuredImage: 'https://via.placeholder.com/800x400/b8a4ff/2c2c2b?text=With+French',
        metaTitle: 'TEST Article With French Translation',
        metaDescription: 'Testing exact translation match',
        readingTime: 3,
      },
    });
    ids.articles.withFrenchPublished = article2.id;

    const translation1 = await prisma.articleTranslation.create({
      data: {
        articleId: article2.id,
        locale: 'fr',
        slug: 'test-avec-francais-publie',
        title: 'TEST Article Avec Traduction Française',
        excerpt: 'Cet article a une traduction française publiée',
        content: '<p>Cet article teste le scénario de correspondance exacte de traduction.</p>',
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
        translatorId: ids.users.translator1,
        featuredImage: 'https://via.placeholder.com/800x400/b8a4ff/2c2c2b?text=Avec+Francais',
        metaTitle: 'TEST Article Avec Traduction Française',
        metaDescription: 'Test de correspondance exacte de traduction',
        readingTime: 3,
      },
    });
    ids.translations.french1 = translation1.id;
    console.log(`   ✅ Article 2: ${article2.title} + French translation`);

    // Article 3: English with Arabic draft translation
    const article3 = await prisma.article.create({
      data: {
        title: 'TEST Article With Arabic Draft',
        slug: 'test-with-arabic-draft',
        locale: 'en',
        excerpt: 'This article has an unpublished Arabic translation',
        content: '<p>This article tests that draft translations are not shown publicly.</p>',
        status: ArticleStatus.PUBLISHED,
        type: ArticleType.BLOG_POST,
        publishedAt: new Date(),
        authorId: ids.users.contentCreator,
        categoryId: ids.category,
        featuredImage: 'https://via.placeholder.com/800x400/7afdd6/2c2c2b?text=Arabic+Draft',
        metaTitle: 'TEST Article With Arabic Draft',
        metaDescription: 'Testing that draft translations are not shown',
        readingTime: 2,
      },
    });
    ids.articles.withArabicDraft = article3.id;

    const translation2 = await prisma.articleTranslation.create({
      data: {
        articleId: article3.id,
        locale: 'ar',
        slug: 'test-maa-masuda-arabia',
        title: 'TEST مقالة مع مسودة عربية',
        excerpt: 'هذه المقالة لديها ترجمة عربية غير منشورة',
        content: '<p>هذه المقالة تختبر أن الترجمات المسودة غير معروضة علنًا.</p>',
        status: ArticleStatus.DRAFT, // DRAFT status
        translatorId: ids.users.translator2,
        featuredImage: 'https://via.placeholder.com/800x400/7afdd6/2c2c2b?text=Arabic+Draft',
        readingTime: 2,
      },
    });
    ids.translations.arabicDraft = translation2.id;
    console.log(`   ✅ Article 3: ${article3.title} + Arabic draft (not shown)`);

    // Article 4: French main article (non-English main)
    const article4 = await prisma.article.create({
      data: {
        title: 'TEST Article Principal Français',
        slug: 'test-french-main',
        locale: 'fr',
        excerpt: 'Ceci est un article principal en français',
        content: '<p>Cet article teste les articles principaux non anglais.</p>',
        status: ArticleStatus.PUBLISHED,
        type: ArticleType.BLOG_POST,
        publishedAt: new Date(),
        authorId: ids.users.contentCreator,
        categoryId: ids.category,
        featuredImage: 'https://via.placeholder.com/800x400/b8a4ff/2c2c2b?text=French+Main',
        metaTitle: 'TEST Article Principal Français',
        metaDescription: 'Test d\'article principal non anglais',
        readingTime: 2,
      },
    });
    ids.articles.frenchMain = article4.id;
    console.log(`   ✅ Article 4: ${article4.title} (French main article)`);

    // Article 5: English with outdated French translation
    const article5 = await prisma.article.create({
      data: {
        title: 'TEST Article With Outdated Translation',
        slug: 'test-outdated-translations',
        locale: 'en',
        excerpt: 'This article has an outdated translation',
        content: '<p>This article tests the outdated translation marking feature. Updated content!</p>',
        status: ArticleStatus.PUBLISHED,
        type: ArticleType.BLOG_POST,
        publishedAt: new Date(),
        authorId: ids.users.contentCreator,
        categoryId: ids.category,
        featuredImage: 'https://via.placeholder.com/800x400/7afdd6/2c2c2b?text=Outdated',
        metaTitle: 'TEST Article With Outdated Translation',
        metaDescription: 'Testing outdated translation marking',
        readingTime: 3,
        updatedAt: new Date(), // Recently updated
      },
    });
    ids.articles.outdatedTranslations = article5.id;

    const translation3 = await prisma.articleTranslation.create({
      data: {
        articleId: article5.id,
        locale: 'fr',
        slug: 'test-traductions-obsoletes',
        title: 'TEST Article Avec Traduction Obsolète',
        excerpt: 'Cet article a une traduction obsolète',
        content: '<p>Cet article teste la fonctionnalité de marquage de traduction obsolète.</p>',
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        translatorId: ids.users.translator1,
        isOutdated: true, // Marked as outdated
        lastSyncedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        readingTime: 3,
      },
    });
    ids.translations.frenchOutdated = translation3.id;
    console.log(`   ✅ Article 5: ${article5.title} + French outdated translation`);

    // Article 6: English with multiple published translations
    const article6 = await prisma.article.create({
      data: {
        title: 'TEST Article With Multiple Translations',
        slug: 'test-multiple-translations',
        locale: 'en',
        excerpt: 'This article has translations in French, Arabic, and Chinese',
        content: '<p>This article tests hreflang generation with multiple published translations.</p>',
        status: ArticleStatus.PUBLISHED,
        type: ArticleType.BLOG_POST,
        publishedAt: new Date(),
        authorId: ids.users.contentCreator,
        categoryId: ids.category,
        featuredImage: 'https://via.placeholder.com/800x400/b8a4ff/2c2c2b?text=Multiple',
        metaTitle: 'TEST Article With Multiple Translations',
        metaDescription: 'Testing hreflang generation with multiple translations',
        readingTime: 4,
      },
    });
    ids.articles.multipleTranslations = article6.id;

    const translationFr = await prisma.articleTranslation.create({
      data: {
        articleId: article6.id,
        locale: 'fr',
        slug: 'test-traductions-multiples',
        title: 'TEST Article Avec Traductions Multiples',
        excerpt: 'Cet article a des traductions en français, arabe et chinois',
        content: '<p>Cet article teste la génération hreflang avec plusieurs traductions publiées.</p>',
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
        translatorId: ids.users.translator1,
        readingTime: 4,
      },
    });
    ids.translations.frenchMulti = translationFr.id;

    const translationAr = await prisma.articleTranslation.create({
      data: {
        articleId: article6.id,
        locale: 'ar',
        slug: 'test-tarjamat-mutaadida',
        title: 'TEST مقالة مع ترجمات متعددة',
        excerpt: 'هذه المقالة لديها ترجمات بالفرنسية والعربية والصينية',
        content: '<p>هذه المقالة تختبر توليد hreflang مع ترجمات متعددة منشورة.</p>',
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
        translatorId: ids.users.translator2,
        readingTime: 4,
      },
    });
    ids.translations.arabicMulti = translationAr.id;

    const translationZh = await prisma.articleTranslation.create({
      data: {
        articleId: article6.id,
        locale: 'zh',
        slug: 'test-duozhong-fanyi',
        title: 'TEST 多种翻译的文章',
        excerpt: '这篇文章有法语、阿拉伯语和中文翻译',
        content: '<p>这篇文章测试了使用多个已发布翻译生成hreflang。</p>',
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
        translatorId: ids.users.translator1,
        readingTime: 4,
      },
    });
    ids.translations.chineseMulti = translationZh.id;
    console.log(`   ✅ Article 6: ${article6.title} + 3 translations (FR, AR, ZH)\n`);

    // Step 4: Create translation requests in various states
    console.log('📋 Creating translation requests...');

    // Request 1: PENDING (no assignee)
    const request1 = await prisma.translationRequest.create({
      data: {
        articleId: ids.articles.englishOnly,
        requestedLocale: 'fr',
        requestedById: ids.users.contentCreator,
        status: TranslationRequestStatus.PENDING,
        priority: TranslationPriority.MEDIUM,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        notes: 'Please translate this article to French for our French audience.',
      },
    });
    console.log(`   ✅ Request 1: PENDING - French translation for "English Only" article`);

    // Request 2: ASSIGNED (assigned to translator1)
    const request2 = await prisma.translationRequest.create({
      data: {
        articleId: ids.articles.englishOnly,
        requestedLocale: 'ar',
        requestedById: ids.users.contentCreator,
        assignedToId: ids.users.translator1,
        status: TranslationRequestStatus.ASSIGNED,
        priority: TranslationPriority.HIGH,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        notes: 'High priority - needed for Arabic launch campaign.',
      },
    });
    console.log(`   ✅ Request 2: ASSIGNED - Arabic translation assigned to Translator 1`);

    // Request 3: IN_PROGRESS (translator2 working)
    const request3 = await prisma.translationRequest.create({
      data: {
        articleId: ids.articles.frenchMain,
        requestedLocale: 'en',
        requestedById: ids.users.contentCreator,
        assignedToId: ids.users.translator2,
        status: TranslationRequestStatus.IN_PROGRESS,
        priority: TranslationPriority.MEDIUM,
        notes: 'Translating French main article to English.',
      },
    });
    console.log(`   ✅ Request 3: IN_PROGRESS - English translation being worked on`);

    // Request 4: COMPLETED (linked to translation)
    const request4 = await prisma.translationRequest.create({
      data: {
        articleId: ids.articles.withFrenchPublished,
        requestedLocale: 'fr',
        requestedById: ids.users.contentCreator,
        assignedToId: ids.users.translator1,
        status: TranslationRequestStatus.COMPLETED,
        priority: TranslationPriority.MEDIUM,
        translationId: ids.translations.french1,
        notes: 'Completed successfully.',
      },
    });
    console.log(`   ✅ Request 4: COMPLETED - Linked to French translation`);

    // Request 5: CANCELLED (with reason)
    const request5 = await prisma.translationRequest.create({
      data: {
        articleId: ids.articles.englishOnly,
        requestedLocale: 'ru',
        requestedById: ids.users.contentCreator,
        status: TranslationRequestStatus.CANCELLED,
        priority: TranslationPriority.LOW,
        notes: 'Cancelled - Article no longer relevant. Original notes: Please translate to Russian.',
      },
    });
    console.log(`   ✅ Request 5: CANCELLED - Russian translation cancelled\n`);

    // Step 5: Create analytics data
    console.log('📊 Creating analytics data...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create analytics for articles with views
    const analyticsData = [
      { articleId: article1.id, locale: 'en', views: 1500, uniqueViews: 1200 },
      { articleId: article2.id, locale: 'en', views: 2000, uniqueViews: 1600 },
      { articleId: article2.id, locale: 'fr', views: 800, uniqueViews: 650 },
      { articleId: article3.id, locale: 'en', views: 1200, uniqueViews: 900 },
      { articleId: article4.id, locale: 'fr', views: 1800, uniqueViews: 1400 },
      { articleId: article5.id, locale: 'en', views: 1000, uniqueViews: 800 },
      { articleId: article5.id, locale: 'fr', views: 400, uniqueViews: 320 },
      { articleId: article6.id, locale: 'en', views: 3000, uniqueViews: 2400 },
      { articleId: article6.id, locale: 'fr', views: 1200, uniqueViews: 950 },
      { articleId: article6.id, locale: 'ar', views: 900, uniqueViews: 720 },
      { articleId: article6.id, locale: 'zh', views: 1500, uniqueViews: 1200 },
    ];

    for (const data of analyticsData) {
      await prisma.articleAnalytics.create({
        data: {
          articleId: data.articleId,
          date: today,
          locale: data.locale,
          views: data.views,
          uniqueViews: data.uniqueViews,
        },
      });
    }
    console.log(`   ✅ Created analytics data for ${analyticsData.length} article-locale combinations\n`);

    // Print summary
    console.log('✅ Test data seeding completed successfully!\n');
    console.log('📋 Summary:');
    console.log(`   • 4 test users created`);
    console.log(`   • 1 test category created`);
    console.log(`   • 6 test articles created`);
    console.log(`   • 6 translations created (5 published, 1 draft)`);
    console.log(`   • 5 translation requests created (all workflow states)`);
    console.log(`   • ${analyticsData.length} analytics records created\n`);

    console.log('🔑 Test User Credentials:');
    console.log(`   Admin:           ${TEST_USERS.admin}`);
    console.log(`   Translator 1:    ${TEST_USERS.translator1}`);
    console.log(`   Translator 2:    ${TEST_USERS.translator2}`);
    console.log(`   Content Creator: ${TEST_USERS.contentCreator}`);
    console.log(`   Password (all):  ${TEST_PASSWORD}\n`);

    console.log('🧪 Next Steps:');
    console.log('   1. Run API tests: npx ts-node scripts/test-multilingual-api.ts');
    console.log('   2. Test manually using the guide: MULTILINGUAL_TESTING_GUIDE.md');
    console.log('   3. Clean up when done: npx ts-node scripts/cleanup-multilingual-test-data.ts\n');

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
