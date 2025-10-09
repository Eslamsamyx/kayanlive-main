import { prisma } from '../src/lib/prisma';
import { createDefaultAdmin } from '../src/lib/auth';
import bcryptjs from 'bcryptjs';
import { UserRole } from '@prisma/client';

async function main() {
  console.log('🌱 Seeding database...');

  try {
    // Create default admin user from env
    await createDefaultAdmin();
    console.log('✅ Default admin user created/verified');

    // Create test admin account
    const testAdminEmail = 'admin@kayanlive.com';
    const testAdminPassword = 'admin123';

    const existingAdmin = await prisma.user.findUnique({
      where: { email: testAdminEmail }
    });

    if (!existingAdmin) {
      const hashedPassword = await bcryptjs.hash(testAdminPassword, 12);
      await prisma.user.create({
        data: {
          email: testAdminEmail,
          name: 'Test Admin',
          password: hashedPassword,
          role: UserRole.ADMIN,
          emailVerified: new Date(),
        }
      });
      console.log('✅ Test admin created: admin@kayanlive.com / admin123');
    } else {
      console.log('ℹ️  Test admin already exists: admin@kayanlive.com');
    }

    // Create test client accounts
    const testClients = [
      {
        email: 'client1@example.com',
        name: 'John Doe',
        password: 'client123'
      },
      {
        email: 'client2@example.com',
        name: 'Jane Smith',
        password: 'client123'
      },
      {
        email: 'client3@example.com',
        name: 'Bob Johnson',
        password: 'client123'
      }
    ];

    for (const client of testClients) {
      const existingClient = await prisma.user.findUnique({
        where: { email: client.email }
      });

      if (!existingClient) {
        const hashedPassword = await bcryptjs.hash(client.password, 12);
        await prisma.user.create({
          data: {
            email: client.email,
            name: client.name,
            password: hashedPassword,
            role: UserRole.CLIENT,
            emailVerified: new Date(),
          }
        });
        console.log(`✅ Test client created: ${client.email} / ${client.password}`);
      } else {
        console.log(`ℹ️  Test client already exists: ${client.email}`);
      }
    }

    console.log('\n📋 Test Accounts Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 ADMIN ACCOUNTS:');
    console.log('   Email: admin@kayanlive.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('👤 CLIENT ACCOUNTS:');
    console.log('   Email: client1@example.com | Password: client123');
    console.log('   Email: client2@example.com | Password: client123');
    console.log('   Email: client3@example.com | Password: client123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n🎉 Database seeded successfully!');
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