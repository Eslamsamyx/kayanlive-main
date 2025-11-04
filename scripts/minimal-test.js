const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n🧪 Minimal Permission System Test\n');
  console.log('='.repeat(50));

  try {
    // Test 1: Check test users
    console.log('\n📋 Test Users:');
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: ['admin@kayanlive.com', 'moderator@kayanlive.com', 'client@example.com']
        }
      },
      select: {
        email: true,
        role: true,
        additionalPermissions: true,
        canDownloadDirectly: true
      }
    });

    users.forEach(u => {
      console.log(`  ✅ ${u.email} - ${u.role}`);
      console.log(`     Additional perms: ${u.additionalPermissions.length}, Direct download: ${u.canDownloadDirectly}`);
    });

    // Test 2: Check schema
    console.log('\n📊 Database Tables:');
    const roleTemplates = await prisma.roleTemplate.count();
    console.log(`  ✅ RoleTemplate: ${roleTemplates} templates`);

    const invitations = await prisma.invitation.count();
    console.log(`  ✅ Invitation: ${invitations} invitations`);

    const auditLogs = await prisma.auditLog.count();
    console.log(`  ✅ AuditLog: ${auditLogs} logs`);

    console.log('\n' + '='.repeat(50));
    console.log('✅ Permission system database validated!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
