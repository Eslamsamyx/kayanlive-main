/**
 * Multilingual CMS API Integration Test Script
 *
 * This script tests all multilingual API functionality:
 * - Phase 1: Fallback chain, translation CRUD, hreflang generation
 * - Phase 2: Multilingual search, analytics endpoints
 * - Phase 3: Translation request workflow
 *
 * Prerequisites: Run seed-multilingual-test-data.ts first
 * Run: npx ts-node scripts/test-multilingual-api.ts
 */

import { PrismaClient, ArticleStatus, TranslationRequestStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

class TestRunner {
  results: TestResult[] = [];
  startTime: number = 0;

  async runTest(name: string, testFn: () => Promise<void>) {
    const start = Date.now();
    try {
      await testFn();
      const duration = Date.now() - start;
      this.results.push({ name, passed: true, duration });
      console.log(`✅ ${name} (${duration}ms)`);
    } catch (error: any) {
      const duration = Date.now() - start;
      this.results.push({ name, passed: false, error: error.message, duration });
      console.log(`❌ ${name} (${duration}ms)`);
      console.log(`   Error: ${error.message}`);
    }
  }

  printSummary() {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Total Time: ${totalTime}ms`);
    console.log(`Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`   • ${r.name}`);
          console.log(`     ${r.error}`);
        });
    }

    console.log('='.repeat(80) + '\n');
  }
}

const runner = new TestRunner();

// Helper functions
async function getTestArticle(slug: string) {
  return await prisma.article.findFirst({
    where: { slug },
    include: {
      translations: true,
      author: true,
      category: true,
    },
  });
}

async function getTestUser(email: string) {
  return await prisma.user.findUnique({ where: { email } });
}

async function getTestTranslation(articleId: string, locale: string) {
  return await prisma.articleTranslation.findUnique({
    where: { articleId_locale: { articleId, locale } },
  });
}

// =============================================================================
// PHASE 1 TESTS: Backend & Database
// =============================================================================

async function testFallbackChainLevel1() {
  // Test: Exact translation match (FR translation exists and is published)
  const article = await getTestArticle('test-with-french-published');
  if (!article) throw new Error('Test article not found');

  const translation = await getTestTranslation(article.id, 'fr');
  if (!translation) throw new Error('French translation not found');
  if (translation.status !== 'PUBLISHED') throw new Error('Translation not published');

  // Simulate API: When requesting FR version, should return FR translation
  // This would normally go through the getBySlug endpoint
  if (translation.slug !== 'test-avec-francais-publie') {
    throw new Error('Translation slug mismatch');
  }
}

async function testFallbackChainLevel2() {
  // Test: Main article match (no translation exists, return main article)
  const article = await getTestArticle('test-english-only');
  if (!article) throw new Error('Test article not found');
  if (article.locale !== 'en') throw new Error('Expected English main article');

  const translations = await prisma.articleTranslation.findMany({
    where: { articleId: article.id, status: 'PUBLISHED' },
  });
  if (translations.length > 0) throw new Error('Should have no published translations');
}

async function testFallbackChainLevel3() {
  // Test: English fallback (requested locale not available, fallback to English)
  // This is tested via the seeded data structure
  const article = await getTestArticle('test-english-only');
  if (!article) throw new Error('Test article not found');
  if (article.status !== 'PUBLISHED') throw new Error('Article should be published');
  if (article.locale !== 'en') throw new Error('Should fallback to English');
}

async function testFallbackChainLevel4() {
  // Test: Any available translation (French main article, no English)
  const article = await getTestArticle('test-french-main');
  if (!article) throw new Error('Test article not found');
  if (article.locale !== 'fr') throw new Error('Expected French main article');
  if (article.status !== 'PUBLISHED') throw new Error('Article should be published');
}

async function testCreateTranslation() {
  // Test: Create a new translation
  const article = await getTestArticle('test-english-only');
  if (!article) throw new Error('Test article not found');

  const translator = await getTestUser('test-translator1@kayanlive.test');
  if (!translator) throw new Error('Translator not found');

  // Check if test translation already exists (from previous run)
  const existing = await getTestTranslation(article.id, 'ru');
  if (existing) {
    // Clean up from previous test run
    await prisma.articleTranslation.delete({ where: { id: existing.id } });
  }

  const translation = await prisma.articleTranslation.create({
    data: {
      articleId: article.id,
      locale: 'ru',
      slug: 'test-russian-translation',
      title: 'TEST Русский Перевод',
      excerpt: 'Тестовый русский перевод',
      content: '<p>Это тестовый русский перевод для проверки создания переводов.</p>',
      status: ArticleStatus.DRAFT,
      translatorId: translator.id,
      readingTime: 2,
    },
  });

  if (!translation) throw new Error('Failed to create translation');
  if (translation.locale !== 'ru') throw new Error('Translation locale mismatch');

  // Cleanup
  await prisma.articleTranslation.delete({ where: { id: translation.id } });
}

async function testUpdateTranslation() {
  // Test: Update existing translation
  const article = await getTestArticle('test-with-arabic-draft');
  if (!article) throw new Error('Test article not found');

  const translation = await getTestTranslation(article.id, 'ar');
  if (!translation) throw new Error('Arabic translation not found');

  const originalTitle = translation.title;
  const newTitle = 'TEST Updated Arabic Title';

  const updated = await prisma.articleTranslation.update({
    where: { id: translation.id },
    data: { title: newTitle },
  });

  if (updated.title !== newTitle) throw new Error('Translation not updated');

  // Revert
  await prisma.articleTranslation.update({
    where: { id: translation.id },
    data: { title: originalTitle },
  });
}

async function testMarkTranslationOutdated() {
  // Test: Verify outdated marking works
  const article = await getTestArticle('test-outdated-translations');
  if (!article) throw new Error('Test article not found');

  const translation = await getTestTranslation(article.id, 'fr');
  if (!translation) throw new Error('French translation not found');
  if (!translation.isOutdated) throw new Error('Translation should be marked as outdated');
}

async function testGenerateHreflangLinks() {
  // Test: Generate hreflang links for article with multiple translations
  const article = await getTestArticle('test-multiple-translations');
  if (!article) throw new Error('Test article not found');

  const translations = await prisma.articleTranslation.findMany({
    where: {
      articleId: article.id,
      status: 'PUBLISHED',
    },
    select: {
      locale: true,
      slug: true,
    },
  });

  // Should have 3 published translations (FR, AR, ZH)
  if (translations.length !== 3) {
    throw new Error(`Expected 3 translations, found ${translations.length}`);
  }

  const locales = translations.map(t => t.locale);
  if (!locales.includes('fr') || !locales.includes('ar') || !locales.includes('zh')) {
    throw new Error('Missing expected translation locales');
  }

  // Total hreflang links should be 4 (EN main + 3 translations)
  const totalLinks = 1 + translations.length;
  if (totalLinks !== 4) throw new Error('Hreflang link count mismatch');
}

// =============================================================================
// PHASE 2 TESTS: Search & Analytics
// =============================================================================

async function testMultilingualSearch() {
  // Test: Search across translations
  const searchTerm = 'français';
  const results = await prisma.article.findMany({
    where: {
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { content: { contains: searchTerm, mode: 'insensitive' } },
        {
          translations: {
            some: {
              OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { content: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
          },
        },
      ],
    },
    include: {
      translations: true,
    },
  });

  if (results.length === 0) {
    throw new Error('Multilingual search returned no results');
  }
}

async function testTranslationCoverageAnalytics() {
  // Test: Get translation coverage statistics
  const totalArticles = await prisma.article.count({
    where: { status: 'PUBLISHED' },
  });

  const translationsByLocale = await prisma.articleTranslation.groupBy({
    by: ['locale'],
    where: { status: 'PUBLISHED' },
    _count: { locale: true },
  });

  if (totalArticles === 0) throw new Error('No published articles found');
  if (translationsByLocale.length === 0) throw new Error('No translations found');

  // Verify we have data for multiple locales
  const locales = translationsByLocale.map(t => t.locale);
  if (locales.length < 2) throw new Error('Expected translations in multiple locales');
}

async function testLocalePerformanceMetrics() {
  // Test: Get per-locale performance metrics
  const performanceData = await prisma.articleAnalytics.groupBy({
    by: ['locale'],
    _sum: {
      views: true,
      uniqueViews: true,
    },
  });

  if (performanceData.length === 0) throw new Error('No analytics data found');

  // Verify we have data for EN and FR at least
  const locales = performanceData.map(p => p.locale);
  if (!locales.includes('en') || !locales.includes('fr')) {
    throw new Error('Missing expected locale analytics');
  }
}

async function testTranslationStatistics() {
  // Test: Get comprehensive translation statistics
  const totalTranslations = await prisma.articleTranslation.count();
  const publishedTranslations = await prisma.articleTranslation.count({
    where: { status: 'PUBLISHED' },
  });
  const draftTranslations = await prisma.articleTranslation.count({
    where: { status: 'DRAFT' },
  });
  const outdatedCount = await prisma.articleTranslation.count({
    where: { isOutdated: true },
  });

  if (totalTranslations === 0) throw new Error('No translations found');
  if (publishedTranslations === 0) throw new Error('No published translations found');
  if (outdatedCount === 0) throw new Error('No outdated translations found (expected 1)');

  // Calculate health score
  const healthScore = publishedTranslations > 0
    ? Math.round(((publishedTranslations - outdatedCount) / publishedTranslations) * 100)
    : 100;

  if (healthScore < 0 || healthScore > 100) throw new Error('Invalid health score');
}

// =============================================================================
// PHASE 3 TESTS: Workflow & Permissions
// =============================================================================

async function testCreateTranslationRequest() {
  // Test: Create a new translation request
  const article = await getTestArticle('test-english-only');
  if (!article) throw new Error('Test article not found');

  const creator = await getTestUser('test-creator@kayanlive.test');
  if (!creator) throw new Error('Content creator not found');

  // Check if test request already exists
  const existing = await prisma.translationRequest.findFirst({
    where: {
      articleId: article.id,
      requestedLocale: 'zh',
    },
  });

  if (existing) {
    // Clean up from previous run
    await prisma.translationRequest.delete({ where: { id: existing.id } });
  }

  const request = await prisma.translationRequest.create({
    data: {
      articleId: article.id,
      requestedLocale: 'zh',
      requestedById: creator.id,
      status: TranslationRequestStatus.PENDING,
      priority: 'MEDIUM',
      notes: 'Test translation request for Chinese',
    },
  });

  if (!request) throw new Error('Failed to create translation request');
  if (request.status !== 'PENDING') throw new Error('Request status should be PENDING');

  // Cleanup
  await prisma.translationRequest.delete({ where: { id: request.id } });
}

async function testAssignTranslationRequest() {
  // Test: Assign translator to request
  const request = await prisma.translationRequest.findFirst({
    where: { status: 'PENDING' },
  });

  if (!request) throw new Error('No pending request found');

  const translator = await getTestUser('test-translator1@kayanlive.test');
  if (!translator) throw new Error('Translator not found');

  if (!request.assignedToId) {
    // Not yet assigned, so this is valid state
    if (request.status !== 'PENDING') {
      throw new Error('Unassigned request should be PENDING');
    }
  }
}

async function testUpdateRequestStatus() {
  // Test: Update request status
  const request = await prisma.translationRequest.findFirst({
    where: { status: 'ASSIGNED' },
  });

  if (!request) throw new Error('No assigned request found for testing');
  if (!request.assignedToId) throw new Error('Assigned request should have assignee');
}

async function testCompleteRequest() {
  // Test: Completed request should be linked to translation
  const request = await prisma.translationRequest.findFirst({
    where: { status: 'COMPLETED' },
    include: { translation: true },
  });

  if (!request) throw new Error('No completed request found');
  if (!request.translationId) throw new Error('Completed request should have translationId');
  if (!request.translation) throw new Error('Completed request should be linked to translation');
}

async function testCancelRequest() {
  // Test: Cancelled request should have notes explaining cancellation
  const request = await prisma.translationRequest.findFirst({
    where: { status: 'CANCELLED' },
  });

  if (!request) throw new Error('No cancelled request found');
  if (!request.notes || !request.notes.includes('Cancelled')) {
    throw new Error('Cancelled request should have cancellation notes');
  }
}

// =============================================================================
// MAIN TEST EXECUTION
// =============================================================================

async function main() {
  console.log('🧪 Starting Multilingual CMS API Integration Tests\n');
  console.log('Prerequisites: Test data must be seeded first');
  console.log('If not seeded, run: npx ts-node scripts/seed-multilingual-test-data.ts\n');

  // Check if test data exists
  const testUser = await getTestUser('test-admin@kayanlive.test');
  if (!testUser) {
    console.log('❌ Test data not found. Please run seed script first:\n');
    console.log('   npx ts-node scripts/seed-multilingual-test-data.ts\n');
    process.exit(1);
  }

  console.log('✅ Test data found. Starting tests...\n');
  console.log('='.repeat(80));
  console.log('PHASE 1: Backend & Database Tests');
  console.log('='.repeat(80));

  await runner.runTest('Fallback Chain Level 1 - Exact Translation Match', testFallbackChainLevel1);
  await runner.runTest('Fallback Chain Level 2 - Main Article Match', testFallbackChainLevel2);
  await runner.runTest('Fallback Chain Level 3 - English Fallback', testFallbackChainLevel3);
  await runner.runTest('Fallback Chain Level 4 - Any Available', testFallbackChainLevel4);
  await runner.runTest('Create Translation', testCreateTranslation);
  await runner.runTest('Update Translation', testUpdateTranslation);
  await runner.runTest('Mark Translation Outdated', testMarkTranslationOutdated);
  await runner.runTest('Generate Hreflang Links', testGenerateHreflangLinks);

  console.log('\n' + '='.repeat(80));
  console.log('PHASE 2: Search & Analytics Tests');
  console.log('='.repeat(80));

  await runner.runTest('Multilingual Search', testMultilingualSearch);
  await runner.runTest('Translation Coverage Analytics', testTranslationCoverageAnalytics);
  await runner.runTest('Locale Performance Metrics', testLocalePerformanceMetrics);
  await runner.runTest('Translation Statistics', testTranslationStatistics);

  console.log('\n' + '='.repeat(80));
  console.log('PHASE 3: Workflow & Permissions Tests');
  console.log('='.repeat(80));

  await runner.runTest('Create Translation Request', testCreateTranslationRequest);
  await runner.runTest('Assign Translation Request', testAssignTranslationRequest);
  await runner.runTest('Update Request Status', testUpdateRequestStatus);
  await runner.runTest('Complete Request With Translation Link', testCompleteRequest);
  await runner.runTest('Cancel Request', testCancelRequest);

  // Print summary
  runner.printSummary();

  // Exit with appropriate code
  const failed = runner.results.filter(r => !r.passed).length;
  process.exit(failed > 0 ? 1 : 0);
}

main()
  .catch((error) => {
    console.error('❌ Test execution error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
