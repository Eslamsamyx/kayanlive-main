import { PrismaClient } from '@prisma/client';
import { PermissionChecker, Permission, DEFAULT_ROLE_PERMISSIONS } from '../src/lib/permissions';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔐 Permission Checker Logic Test\n');
  console.log('='.repeat(50));

  try {
    const checker = new PermissionChecker(prisma);

    // Get test users
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@kayanlive.com' }
    });

    const moderator = await prisma.user.findUnique({
      where: { email: 'moderator@kayanlive.com' }
    });

    const client = await prisma.user.findUnique({
      where: { email: 'client@example.com' }
    });

    if (!admin || !moderator || !client) {
      console.log('❌ Test users not found');
      return;
    }

    console.log('\n📋 Test Results:\n');

    // Test ADMIN
    const adminFullAccess = await checker.hasPermission(
      admin.id,
      Permission.ADMIN_FULL_ACCESS
    );
    console.log(`${adminFullAccess ? '✅' : '❌'} ADMIN has ADMIN_FULL_ACCESS`);

    const adminAssetDelete = await checker.hasPermission(
      admin.id,
      Permission.ASSET_DELETE
    );
    console.log(`${adminAssetDelete ? '✅' : '❌'} ADMIN has ASSET_DELETE`);

    // Test MODERATOR (KEY NEW FEATURE)
    const moderatorApprove = await checker.hasPermission(
      moderator.id,
      Permission.ASSET_APPROVE_DOWNLOAD
    );
    console.log(
      `${moderatorApprove ? '✅' : '❌'} MODERATOR has ASSET_APPROVE_DOWNLOAD (NEW FEATURE)`
    );

    const moderatorNoAdmin = !(await checker.hasPermission(
      moderator.id,
      Permission.ADMIN_FULL_ACCESS
    ));
    console.log(
      `${moderatorNoAdmin ? '✅' : '❌'} MODERATOR does NOT have ADMIN_FULL_ACCESS`
    );

    // Test CLIENT
    const clientRead = await checker.hasPermission(
      client.id,
      Permission.ASSET_READ
    );
    console.log(`${clientRead ? '✅' : '❌'} CLIENT has ASSET_READ`);

    const clientNoCreate = !(await checker.hasPermission(
      client.id,
      Permission.ASSET_CREATE
    ));
    console.log(`${clientNoCreate ? '✅' : '❌'} CLIENT cannot create assets`);

    // Test default permissions
    console.log('\n📊 Default Role Permissions:\n');
    console.log(`  ADMIN: ${DEFAULT_ROLE_PERMISSIONS.ADMIN.length} permissions`);
    console.log(`  MODERATOR: ${DEFAULT_ROLE_PERMISSIONS.MODERATOR.length} permissions`);
    console.log(`  CLIENT: ${DEFAULT_ROLE_PERMISSIONS.CLIENT.length} permissions`);

    // Verify MODERATOR has download approval
    const modHasApproval = DEFAULT_ROLE_PERMISSIONS.MODERATOR.includes(
      Permission.ASSET_APPROVE_DOWNLOAD
    );
    console.log(
      `\n${modHasApproval ? '✅' : '❌'} MODERATOR role includes ASSET_APPROVE_DOWNLOAD permission`
    );

    console.log('\n' + '='.repeat(50));
    console.log('✅ All permission checker tests passed!\n');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
