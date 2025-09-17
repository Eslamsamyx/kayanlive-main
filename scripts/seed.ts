import { prisma } from '../src/lib/prisma';
import { createDefaultAdmin } from '../src/lib/auth';

async function main() {
  console.log('🌱 Seeding database...');

  try {
    // Create default admin user
    await createDefaultAdmin();
    console.log('✅ Default admin user created/verified');

    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });