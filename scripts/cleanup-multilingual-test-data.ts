/**
 * Multilingual CMS Test Data Cleanup Script
 *
 * This script removes all test data created by seed-multilingual-test-data.ts:
 * - Test users (*.kayanlive.test emails)
 * - Test articles (TEST_* titles)
 * - Test translations
 * - Test translation requests
 * - Test analytics data
 * - Test category
 *
 * Run: npx ts-node scripts/cleanup-multilingual-test-data.ts
 */

import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

// Create readline interface for confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log('🗑️  Multilingual CMS Test Data Cleanup\n');

  try {
    // Check if test data exists
    const testUsers = await prisma.user.count({
      where: { email: { contains: 'kayanlive.test' } },
    });

    const testArticles = await prisma.article.count({
      where: { title: { startsWith: 'TEST' } },
    });

    const testCategory = await prisma.category.count({
      where: { name: { startsWith: 'TEST' } },
    });

    if (testUsers === 0 && testArticles === 0 && testCategory === 0) {
      console.log('✅ No test data found. Nothing to clean up.\n');
      rl.close();
      return;
    }

    // Show what will be deleted
    console.log('📋 Test data found:');
    console.log(`   • ${testUsers} test users`);
    console.log(`   • ${testArticles} test articles (with translations, requests, analytics)`);
    console.log(`   • ${testCategory} test category`);
    console.log('');

    // Ask for confirmation
    const answer = await question('⚠️  Are you sure you want to delete all test data? (yes/no): ');

    if (answer.toLowerCase() !== 'yes') {
      console.log('\n❌ Cleanup cancelled.\n');
      rl.close();
      return;
    }

    console.log('\n🧹 Cleaning up test data...\n');

    // Step 1: Delete translation requests
    console.log('📋 Deleting translation requests...');
    const requests = await prisma.translationRequest.deleteMany({
      where: {
        article: {
          title: { startsWith: 'TEST' },
        },
      },
    });
    console.log(`   ✅ Deleted ${requests.count} translation requests`);

    // Step 2: Delete article analytics
    console.log('📊 Deleting article analytics...');
    const analytics = await prisma.articleAnalytics.deleteMany({
      where: {
        article: {
          title: { startsWith: 'TEST' },
        },
      },
    });
    console.log(`   ✅ Deleted ${analytics.count} analytics records`);

    // Step 3: Delete article translations
    console.log('🌍 Deleting article translations...');
    const translations = await prisma.articleTranslation.deleteMany({
      where: {
        article: {
          title: { startsWith: 'TEST' },
        },
      },
    });
    console.log(`   ✅ Deleted ${translations.count} translations`);

    // Step 4: Delete articles
    console.log('📝 Deleting test articles...');
    const articles = await prisma.article.deleteMany({
      where: { title: { startsWith: 'TEST' } },
    });
    console.log(`   ✅ Deleted ${articles.count} articles`);

    // Step 5: Delete test category
    console.log('📁 Deleting test category...');
    const category = await prisma.category.deleteMany({
      where: { name: { startsWith: 'TEST' } },
    });
    console.log(`   ✅ Deleted ${category.count} categories`);

    // Step 6: Delete test users (do this last because of foreign key constraints)
    console.log('👥 Deleting test users...');
    const users = await prisma.user.deleteMany({
      where: { email: { contains: 'kayanlive.test' } },
    });
    console.log(`   ✅ Deleted ${users.count} users`);

    console.log('\n✅ Test data cleanup completed successfully!\n');
    console.log('📋 Summary:');
    console.log(`   • ${users.count} users deleted`);
    console.log(`   • ${articles.count} articles deleted`);
    console.log(`   • ${translations.count} translations deleted`);
    console.log(`   • ${requests.count} translation requests deleted`);
    console.log(`   • ${analytics.count} analytics records deleted`);
    console.log(`   • ${category.count} categories deleted\n`);

    console.log('🔄 You can now reseed test data if needed:');
    console.log('   npx ts-node scripts/seed-multilingual-test-data.ts\n');

  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
    throw error;
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
