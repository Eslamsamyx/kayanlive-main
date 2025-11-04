import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive seed...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.assetActivity.deleteMany(),
    prisma.assetAnalytics.deleteMany(),
    prisma.assetVariant.deleteMany(),
    prisma.assetShareLink.deleteMany(),
    prisma.assetCollection.deleteMany(),
    prisma.collection.deleteMany(),
    prisma.assetTagRelation.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.projectAsset.deleteMany(),
    prisma.companyAsset.deleteMany(),
    prisma.asset.deleteMany(),
    prisma.meeting.deleteMany(),
    prisma.task.deleteMany(),
    prisma.milestone.deleteMany(),
    prisma.projectCollaborator.deleteMany(),
    prisma.project.deleteMany(),
    prisma.lead.deleteMany(),
    prisma.exhibition.deleteMany(),
    prisma.article.deleteMany(),
    prisma.category.deleteMany(),
    prisma.companyUser.deleteMany(),
    prisma.company.deleteMany(),
    prisma.searchHistory.deleteMany(),
    prisma.account.deleteMany(),
    prisma.session.deleteMany(),
    prisma.user.deleteMany(),
  ]);
  console.log('✅ Cleared existing data\n');

  // Create hashed password once
  const hashedPassword = await bcrypt.hash('password123', 10);

  //  1. Users
  console.log('👥 Creating users...');
  
  const users = await Promise.all([
    prisma.user.create({ data: { name: 'Admin User', email: 'admin@kayanlive.com', password: hashedPassword, role: UserRole.ADMIN, emailVerified: new Date(), image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin' } }),
    prisma.user.create({ data: { name: 'Moderator User', email: 'moderator@kayanlive.com', password: hashedPassword, role: UserRole.MODERATOR, emailVerified: new Date(), image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Moderator' } }),
    prisma.user.create({ data: { name: 'Sarah Johnson', email: 'sarah@kayanlive.com', password: hashedPassword, role: UserRole.CONTENT_CREATOR, emailVerified: new Date(), image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' } }),
    prisma.user.create({ data: { name: 'Michael Chen', email: 'michael@kayanlive.com', password: hashedPassword, role: UserRole.ART_DIRECTOR, emailVerified: new Date(), image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' } }),
    prisma.user.create({ data: { name: 'Emma Davis', email: 'emma@kayanlive.com', password: hashedPassword, role: UserRole.DESIGNER, emailVerified: new Date(), image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' } }),
    prisma.user.create({ data: { name: 'James Wilson', email: 'james@kayanlive.com', password: hashedPassword, role: UserRole.VIDEO_EDITOR, emailVerified: new Date(), image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James' } }),
    prisma.user.create({ data: { name: 'Lisa Anderson', email: 'lisa@kayanlive.com', password: hashedPassword, role: UserRole.PROJECT_MANAGER, emailVerified: new Date(), image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa' } }),
    prisma.user.create({ data: { name: 'Client Representative', email: 'client@example.com', password: hashedPassword, role: UserRole.CLIENT, emailVerified: new Date(), image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Client' } }),
    prisma.user.create({ data: { name: 'Alex Rodriguez', email: 'alex@kayanlive.com', password: hashedPassword, role: UserRole.DESIGNER_3D, emailVerified: new Date(), image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' } }),
    prisma.user.create({ data: { name: 'Tom Harris', email: 'tom@kayanlive.com', password: hashedPassword, role: UserRole.WEB_DEVELOPER, emailVerified: new Date(), image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom' } }),
  ]);

  const [adminUser, moderatorUser, contentCreator, artDirector, designer, videoEditor, projectManager, clientUser, designer3d, webDeveloper] = users;
  console.log('✅ Created 10 users\n');

  // 2. Companies
  console.log('🏢 Creating companies...');
  const [company1, company2, company3] = await Promise.all([
    prisma.company.create({ data: { name: 'TechCorp Solutions', industry: 'Technology', website: 'https://techcorp.example.com', email: 'contact@techcorp.example.com', phone: '+1-555-0100', address: '123 Tech Street, Silicon Valley, CA 94025', logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=TechCorp', createdBy: clientUser.id } }),
    prisma.company.create({ data: { name: 'MediaMax Studios', industry: 'Entertainment', website: 'https://mediamax.example.com', email: 'info@mediamax.example.com', phone: '+1-555-0200', address: '456 Media Blvd, Los Angeles, CA 90028', logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=MediaMax', createdBy: artDirector.id } }),
    prisma.company.create({ data: { name: 'Fashion Forward Inc', industry: 'Fashion & Retail', website: 'https://fashionforward.example.com', email: 'hello@fashionforward.example.com', phone: '+1-555-0300', address: '789 Fashion Ave, New York, NY 10018', logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=Fashion', createdBy: designer.id } }),
  ]);
  await prisma.companyUser.createMany({ data: [
    { companyId: company1.id, userId: clientUser.id, role: 'OWNER' },
    { companyId: company1.id, userId: projectManager.id, role: 'ADMIN' },
    { companyId: company2.id, userId: artDirector.id, role: 'MEMBER' },
    { companyId: company3.id, userId: designer.id, role: 'MEMBER' },
  ]});
  console.log('✅ Created 3 companies\n');

  // Done for this basic seed
  console.log('\n🎉 Basic seed completed!\n');
  console.log('===============================================');
  console.log('📊 SUMMARY');
  console.log('===============================================');
  console.log('👥 Users: 10');
  console.log('🏢 Companies: 3');
  console.log('===============================================');
  console.log('\n📌 LOGIN CREDENTIALS (All users):');
  console.log('Password: password123');
  console.log('\n✅ Admin: admin@kayanlive.com');
  console.log('✅ Moderator: moderator@kayanlive.com');
  console.log('✅ Content Creator: sarah@kayanlive.com');
  console.log('✅ Art Director: michael@kayanlive.com');
  console.log('✅ Designer: emma@kayanlive.com');
  console.log('✅ Video Editor: james@kayanlive.com');
  console.log('✅ Project Manager: lisa@kayanlive.com');
  console.log('✅ Client: client@example.com');
  console.log('✅ 3D Designer: alex@kayanlive.com');
  console.log('✅ Web Developer: tom@kayanlive.com\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
