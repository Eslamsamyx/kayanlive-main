import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up test data...');
  const users = await prisma.user.deleteMany({ where: { email: { contains: 'kayanlive.test' } } });
  const categories = await prisma.category.deleteMany({ where: { name: { startsWith: 'TEST' } } });
  console.log(`✅ Deleted ${users.count} users, ${categories.count} categories`);
}

main().finally(() => prisma.$disconnect());
