/**
 * Permission System Validation Test Script
 * Tests core permission logic without requiring UI interaction
 */

import { PrismaClient } from '@prisma/client';
import { PermissionChecker, Permission, DEFAULT_ROLE_PERMISSIONS } from '../src/lib/permissions';

const prisma = new PrismaClient();

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

const results: TestResult[] = [];

function logTest(name: string, passed: boolean, details?: string, error?: string) {
  results.push({ name, passed, details, error });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (details) console.log(`   ${details}`);
  if (error) console.log(`   Error: ${error}`);
}

async function main() {
  console.log('\n🧪 Permission System Validation Tests\n');
  console.log('═'.repeat(60));

  const permissionChecker = new PermissionChecker(prisma);

  // ========================================
  // TEST 1: Database Schema Validation
  // ========================================
  console.log('\n📊 Test Group 1: Database Schema\n');

  try {
    // Check User table has new fields
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        additionalPermissions: true,
        canDownloadDirectly: true,
      },
      take: 5,
    });

    logTest(
      'User table has additionalPermissions field',
      users.every(u => Array.isArray(u.additionalPermissions)),
      `Found ${users.length} users with additionalPermissions array`
    );

    logTest(
      'User table has canDownloadDirectly field',
      users.every(u => typeof u.canDownloadDirectly === 'boolean'),
      `All users have boolean canDownloadDirectly value`
    );
  } catch (error) {
    logTest('User table schema validation', false, undefined, (error as Error).message);
  }

  try {
    // Check RoleTemplate table exists
    const roleTemplates = await prisma.roleTemplate.findMany();
    logTest(
      'RoleTemplate table exists and accessible',
      true,
      `Found ${roleTemplates.length} role templates`
    );
  } catch (error) {
    logTest('RoleTemplate table validation', false, undefined, (error as Error).message);
  }

  try {
    // Check Invitation table exists
    const invitations = await prisma.invitation.findMany({ take: 1 });
    logTest(
      'Invitation table exists and accessible',
      true,
      `Invitation table schema validated`
    );
  } catch (error) {
    logTest('Invitation table validation', false, undefined, (error as Error).message);
  }

  try {
    // Check AuditLog has enhanced fields
    const auditLogs = await prisma.auditLog.findMany({
      select: { entityType: true, entityId: true, metadata: true },
      take: 1,
    });
    logTest(
      'AuditLog has enhanced fields (entityType, entityId, metadata)',
      true,
      `Enhanced audit logging schema validated`
    );
  } catch (error) {
    logTest('AuditLog schema validation', false, undefined, (error as Error).message);
  }

  // ========================================
  // TEST 2: Test Users Exist
  // ========================================
  console.log('\n👥 Test Group 2: Test Users\n');

  const testEmails = [
    'admin@kayanlive.com',
    'moderator@kayanlive.com',
    'sarah@kayanlive.com',
    'client@example.com',
  ];

  for (const email of testEmails) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, role: true },
      });

      logTest(
        `Test user exists: ${email}`,
        !!user,
        user ? `Role: ${user.role}` : 'User not found'
      );
    } catch (error) {
      logTest(`Test user check: ${email}`, false, undefined, (error as Error).message);
    }
  }

  // ========================================
  // TEST 3: Permission Checker Logic
  // ========================================
  console.log('\n🔐 Test Group 3: Permission Checker Logic\n');

  try {
    // Get test users
    const admin = await prisma.user.findUnique({ where: { email: 'admin@kayanlive.com' } });
    const moderator = await prisma.user.findUnique({ where: { email: 'moderator@kayanlive.com' } });
    const contentCreator = await prisma.user.findUnique({ where: { email: 'sarah@kayanlive.com' } });
    const client = await prisma.user.findUnique({ where: { email: 'client@example.com' } });

    if (!admin || !moderator || !contentCreator || !client) {
      logTest('Permission tests', false, undefined, 'Required test users not found');
    } else {
      // Test ADMIN permissions
      const adminHasFullAccess = await permissionChecker.hasPermission(
        admin.id,
        Permission.ADMIN_FULL_ACCESS
      );
      logTest(
        'ADMIN has ADMIN_FULL_ACCESS permission',
        adminHasFullAccess,
        'ADMIN should have all permissions'
      );

      const adminHasAssetDelete = await permissionChecker.hasPermission(
        admin.id,
        Permission.ASSET_DELETE
      );
      logTest(
        'ADMIN has ASSET_DELETE permission',
        adminHasAssetDelete,
        'ADMIN should have all permissions including asset deletion'
      );

      // Test MODERATOR permissions (KEY: Should have ASSET_APPROVE_DOWNLOAD)
      const moderatorCanApprove = await permissionChecker.hasPermission(
        moderator.id,
        Permission.ASSET_APPROVE_DOWNLOAD
      );
      logTest(
        'MODERATOR has ASSET_APPROVE_DOWNLOAD permission',
        moderatorCanApprove,
        '🆕 NEW FEATURE: Moderators can now approve downloads (was ADMIN-only)'
      );

      const moderatorNoFullAccess = !(await permissionChecker.hasPermission(
        moderator.id,
        Permission.ADMIN_FULL_ACCESS
      ));
      logTest(
        'MODERATOR does NOT have ADMIN_FULL_ACCESS',
        moderatorNoFullAccess,
        'Moderators should not have full admin access'
      );

      // Test CONTENT_CREATOR permissions
      const creatorCanCreate = await permissionChecker.hasPermission(
        contentCreator.id,
        Permission.ASSET_CREATE
      );
      logTest(
        'CONTENT_CREATOR has ASSET_CREATE permission',
        creatorCanCreate,
        'Content creators can create assets'
      );

      const creatorCannotApprove = !(await permissionChecker.hasPermission(
        contentCreator.id,
        Permission.ASSET_APPROVE_DOWNLOAD
      ));
      logTest(
        'CONTENT_CREATOR cannot approve downloads',
        creatorCannotApprove,
        'Content creators should not have approval rights'
      );

      // Test CLIENT permissions
      const clientCanRead = await permissionChecker.hasPermission(
        client.id,
        Permission.ASSET_READ
      );
      logTest(
        'CLIENT has ASSET_READ permission',
        clientCanRead,
        'Clients can view assets'
      );

      const clientCanRequest = await permissionChecker.hasPermission(
        client.id,
        Permission.ASSET_REQUEST_DOWNLOAD
      );
      logTest(
        'CLIENT has ASSET_REQUEST_DOWNLOAD permission',
        clientCanRequest,
        'Clients can request downloads'
      );

      const clientCannotCreate = !(await permissionChecker.hasPermission(
        client.id,
        Permission.ASSET_CREATE
      ));
      logTest(
        'CLIENT cannot create assets',
        clientCannotCreate,
        'Clients should be read-only for assets'
      );

      const clientCannotApprove = !(await permissionChecker.hasPermission(
        client.id,
        Permission.ASSET_APPROVE_DOWNLOAD
      ));
      logTest(
        'CLIENT cannot approve downloads',
        clientCannotApprove,
        'Clients should not have approval rights'
      );
    }
  } catch (error) {
    logTest('Permission checker logic tests', false, undefined, (error as Error).message);
  }

  // ========================================
  // TEST 4: Additional Permissions Logic
  // ========================================
  console.log('\n➕ Test Group 4: Additional Permissions\n');

  try {
    const client = await prisma.user.findUnique({ where: { email: 'client@example.com' } });

    if (client) {
      // Add additional permission to CLIENT
      await prisma.user.update({
        where: { id: client.id },
        data: {
          additionalPermissions: [Permission.ASSET_CREATE],
        },
      });

      const clientNowCanCreate = await permissionChecker.hasPermission(
        client.id,
        Permission.ASSET_CREATE
      );

      logTest(
        'CLIENT with additional ASSET_CREATE permission can create',
        clientNowCanCreate,
        'Additional permissions override role defaults'
      );

      // Clean up - remove additional permission
      await prisma.user.update({
        where: { id: client.id },
        data: { additionalPermissions: [] },
      });

      logTest('Cleaned up test additional permissions', true);
    }
  } catch (error) {
    logTest('Additional permissions test', false, undefined, (error as Error).message);
  }

  // ========================================
  // TEST 5: Default Role Permissions
  // ========================================
  console.log('\n📋 Test Group 5: Default Role Permissions\n');

  try {
    const adminPerms = DEFAULT_ROLE_PERMISSIONS.ADMIN;
    logTest(
      'ADMIN has all 28 permissions',
      adminPerms.length === 28,
      `ADMIN has ${adminPerms.length} permissions`
    );

    const moderatorPerms = DEFAULT_ROLE_PERMISSIONS.MODERATOR;
    const hasApproveDownload = moderatorPerms.includes(Permission.ASSET_APPROVE_DOWNLOAD);
    logTest(
      'MODERATOR role includes ASSET_APPROVE_DOWNLOAD',
      hasApproveDownload,
      `🆕 NEW FEATURE: Moderator has ${moderatorPerms.length} permissions including download approval`
    );

    const clientPerms = DEFAULT_ROLE_PERMISSIONS.CLIENT;
    const clientReadOnly =
      clientPerms.includes(Permission.ASSET_READ) &&
      !clientPerms.includes(Permission.ASSET_CREATE) &&
      !clientPerms.includes(Permission.ASSET_DELETE);
    logTest(
      'CLIENT role is read-only for assets',
      clientReadOnly,
      `CLIENT has ${clientPerms.length} permissions (read-only focus)`
    );
  } catch (error) {
    logTest('Default role permissions validation', false, undefined, (error as Error).message);
  }

  // ========================================
  // TEST 6: Download Access Flag
  // ========================================
  console.log('\n⬇️ Test Group 6: Direct Download Access\n');

  try {
    const client = await prisma.user.findUnique({ where: { email: 'client@example.com' } });

    if (client) {
      // Test default value
      logTest(
        'CLIENT default canDownloadDirectly is false',
        client.canDownloadDirectly === false,
        'Users start without direct download access'
      );

      // Set to true
      await prisma.user.update({
        where: { id: client.id },
        data: { canDownloadDirectly: true },
      });

      const updatedClient = await prisma.user.findUnique({
        where: { id: client.id },
        select: { canDownloadDirectly: true },
      });

      logTest(
        'Can toggle canDownloadDirectly flag',
        updatedClient?.canDownloadDirectly === true,
        'Direct download access can be granted per-user'
      );

      // Reset
      await prisma.user.update({
        where: { id: client.id },
        data: { canDownloadDirectly: false },
      });

      logTest('Reset canDownloadDirectly flag', true);
    }
  } catch (error) {
    logTest('Download access flag test', false, undefined, (error as Error).message);
  }

  // ========================================
  // TEST 7: Multi-Permission Checks
  // ========================================
  console.log('\n🔢 Test Group 7: Multiple Permission Checks\n');

  try {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@kayanlive.com' } });
    const client = await prisma.user.findUnique({ where: { email: 'client@example.com' } });

    if (admin && client) {
      // Test hasAllPermissions (AND)
      const adminHasAll = await permissionChecker.hasAllPermissions(admin.id, [
        Permission.ASSET_CREATE,
        Permission.ASSET_DELETE,
        Permission.ADMIN_FULL_ACCESS,
      ]);
      logTest(
        'ADMIN hasAllPermissions([CREATE, DELETE, FULL_ACCESS]) = true',
        adminHasAll,
        'AND logic works correctly'
      );

      const clientHasAll = await permissionChecker.hasAllPermissions(client.id, [
        Permission.ASSET_READ,
        Permission.ASSET_CREATE,
      ]);
      logTest(
        'CLIENT hasAllPermissions([READ, CREATE]) = false',
        !clientHasAll,
        'CLIENT missing ASSET_CREATE, AND logic correctly returns false'
      );

      // Test hasAnyPermission (OR)
      const clientHasAny = await permissionChecker.hasAnyPermission(client.id, [
        Permission.ASSET_READ,
        Permission.ASSET_CREATE,
      ]);
      logTest(
        'CLIENT hasAnyPermission([READ, CREATE]) = true',
        clientHasAny,
        'CLIENT has ASSET_READ, OR logic correctly returns true'
      );
    }
  } catch (error) {
    logTest('Multi-permission checks', false, undefined, (error as Error).message);
  }

  // ========================================
  // FINAL SUMMARY
  // ========================================
  console.log('\n' + '═'.repeat(60));
  console.log('\n📊 TEST SUMMARY\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n⚠️  FAILED TESTS:\n');
    results
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`  ❌ ${r.name}`);
        if (r.error) console.log(`     ${r.error}`);
      });
  }

  console.log('\n' + '═'.repeat(60));

  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Permission system is working correctly.\n');
  } else {
    console.log('\n⚠️  Some tests failed. Review the errors above.\n');
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error('\n❌ Fatal Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
