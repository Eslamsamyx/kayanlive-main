import { PrismaClient, UserRole, CompanyType, CompanyRole, ProjectStatus, AssetType, Visibility, UsageType, UploadStatus, ProcessingStatus, ArticleStatus, ArticleType, LeadStatus, TagCategory, TaskStatus, Priority, MilestoneStatus, NotificationType, InvitationStatus, DownloadRequestStatus, ReviewStatus, AssetActivityType, CommentableType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting COMPREHENSIVE seed for KayanLive...\n');
  console.log('This will create realistic test data for ALL admin sections\n');

  // ============================================================================
  // 1. CLEAR EXISTING DATA
  // ============================================================================
  console.log('🗑️  Clearing existing data...');
  await prisma.$transaction([
    // Clear in correct order (respecting foreign keys)
    prisma.shareLinkAccess.deleteMany(),
    prisma.assetExternalAccessLog.deleteMany(),
    prisma.leadActivity.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.assetActivity.deleteMany(),
    prisma.assetAnalytics.deleteMany(),
    prisma.assetVariant.deleteMany(),
    prisma.assetShareLink.deleteMany(),
    prisma.assetExternalLink.deleteMany(),
    prisma.assetCollection.deleteMany(),
    prisma.collection.deleteMany(),
    prisma.assetTagRelation.deleteMany(),
    prisma.assetReview.deleteMany(),
    prisma.assetFavorite.deleteMany(),
    prisma.assetDownload.deleteMany(),
    prisma.assetMetadata.deleteMany(),
    prisma.searchHistory.deleteMany(),
    prisma.projectAsset.deleteMany(),
    prisma.companyAsset.deleteMany(),
    prisma.downloadRequest.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.clientUpload.deleteMany(),
    prisma.taskComment.deleteMany(),
    prisma.task.deleteMany(),
    prisma.milestone.deleteMany(),
    prisma.slide.deleteMany(),
    prisma.presentation.deleteMany(),
    prisma.meeting.deleteMany(),
    prisma.invitation.deleteMany(),
    prisma.asset.deleteMany(),
    prisma.articleTag.deleteMany(),
    prisma.articleComment.deleteMany(),
    prisma.articleAnalytics.deleteMany(),
    prisma.articleRevision.deleteMany(),
    prisma.translationRevision.deleteMany(),
    prisma.translationRequest.deleteMany(),
    prisma.articleTranslation.deleteMany(),
    prisma.article.deleteMany(),
    prisma.tagTranslation.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.categoryTranslation.deleteMany(),
    prisma.category.deleteMany(),
    prisma.mediaFile.deleteMany(),
    prisma.submissionAnswer.deleteMany(),
    prisma.uploadedFile.deleteMany(),
    prisma.questionnaireSubmission.deleteMany(),
    prisma.exhibitionLead.deleteMany(),
    prisma.exhibitorContact.deleteMany(),
    prisma.exhibitionExhibitor.deleteMany(),
    prisma.calendarEvent.deleteMany(),
    prisma.participationStatus.deleteMany(),
    prisma.exhibition.deleteMany(),
    prisma.exhibitor.deleteMany(),
    prisma.organizer.deleteMany(),
    prisma.venue.deleteMany(),
    prisma.projectCollaborator.deleteMany(),
    prisma.project.deleteMany(),
    prisma.lead.deleteMany(),
    prisma.companyUser.deleteMany(),
    prisma.company.deleteMany(),
    prisma.notificationPreferences.deleteMany(),
    prisma.roleTemplate.deleteMany(),
    prisma.post.deleteMany(),
    prisma.account.deleteMany(),
    prisma.session.deleteMany(),
    prisma.user.deleteMany(),
  ]);
  console.log('✅ Cleared all existing data\n');

  // ============================================================================
  // 2. CREATE USERS (15 users covering all roles)
  // ============================================================================
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    // Admins
    prisma.user.create({ data: { name: 'Admin User', email: 'admin@kayanlive.com', password: hashedPassword, role: UserRole.ADMIN, emailVerified: new Date(), image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', canDownloadDirectly: true, additionalPermissions: [] } }),
    prisma.user.create({ data: { name: 'Super Admin', email: 'superadmin@kayanlive.com', password: hashedPassword, role: UserRole.ADMIN, emailVerified: new Date(), image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SuperAdmin', canDownloadDirectly: true } }),

    // Moderator
    prisma.user.create({ data: { name: 'Moderator User', email: 'moderator@kayanlive.com', password: hashedPassword, role: UserRole.MODERATOR, emailVerified: new Date(), image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Moderator' } }),

    // Content Team
    prisma.user.create({ data: { name: 'Sarah Johnson', email: 'sarah@kayanlive.com', password: hashedPassword, role: UserRole.CONTENT_CREATOR, emailVerified: new Date(), image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', bio: 'Content writer with 5+ years experience' } }),
    prisma.user.create({ data: { name: 'Ahmed Hassan', email: 'ahmed@kayanlive.com', password: hashedPassword, role: UserRole.TRANSLATOR, emailVerified: new Date(), image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed', bio: 'Arabic translator' } }),

    // Creative Team
    prisma.user.create({ data: { name: 'Michael Chen', email: 'michael@kayanlive.com', password: hashedPassword, role: UserRole.ART_DIRECTOR, emailVerified: new Date(), image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' } }),
    prisma.user.create({ data: { name: 'Emma Davis', email: 'emma@kayanlive.com', password: hashedPassword, role: UserRole.DESIGNER, emailVerified: new Date(), image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' } }),
    prisma.user.create({ data: { name: 'Alex Rodriguez', email: 'alex@kayanlive.com', password: hashedPassword, role: UserRole.DESIGNER_3D, emailVerified: new Date(), image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' } }),
    prisma.user.create({ data: { name: 'Sophia Lee', email: 'sophia@kayanlive.com', password: hashedPassword, role: UserRole.DESIGNER_2D, emailVerified: new Date(), image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia' } }),

    // Production Team
    prisma.user.create({ data: { name: 'James Wilson', email: 'james@kayanlive.com', password: hashedPassword, role: UserRole.VIDEO_EDITOR, emailVerified: new Date(), image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James' } }),
    prisma.user.create({ data: { name: 'Olivia Brown', email: 'olivia@kayanlive.com', password: hashedPassword, role: UserRole.MOTION_GRAPHICS, emailVerified: new Date(), image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia' } }),

    // Tech Team
    prisma.user.create({ data: { name: 'Tom Harris', email: 'tom@kayanlive.com', password: hashedPassword, role: UserRole.WEB_DEVELOPER, emailVerified: new Date(), image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom' } }),

    // Management
    prisma.user.create({ data: { name: 'Lisa Anderson', email: 'lisa@kayanlive.com', password: hashedPassword, role: UserRole.PROJECT_MANAGER, emailVerified: new Date(), image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa' } }),

    // Clients
    prisma.user.create({ data: { name: 'John Smith', email: 'john@techcorp.example.com', password: hashedPassword, role: UserRole.CLIENT, emailVerified: new Date(), image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' } }),
    prisma.user.create({ data: { name: 'Maria Garcia', email: 'maria@mediamax.example.com', password: hashedPassword, role: UserRole.CLIENT, emailVerified: new Date(), image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria' } }),
  ]);

  const [admin, superAdmin, moderator, sarah, ahmed, michael, emma, alex, sophia, james, olivia, tom, lisa, johnClient, mariaClient] = users;
  console.log(`✅ Created ${users.length} users\n`);

  // ============================================================================
  // 3. CREATE COMPANIES
  // ============================================================================
  console.log('🏢 Creating companies...');
  const companies = await Promise.all([
    prisma.company.create({ data: { name: 'TechCorp Solutions', type: CompanyType.ORGANIZATION, industry: 'Technology', website: 'https://techcorp.example.com', email: 'contact@techcorp.example.com', phone: '+1-555-0100', address: '123 Tech Street, Silicon Valley, CA 94025', city: 'San Francisco', country: 'USA', logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=TechCorp', createdBy: johnClient.id } }),
    prisma.company.create({ data: { name: 'MediaMax Studios', type: CompanyType.ORGANIZATION, industry: 'Entertainment', website: 'https://mediamax.example.com', email: 'info@mediamax.example.com', phone: '+1-555-0200', address: '456 Media Blvd, Los Angeles, CA 90028', city: 'Los Angeles', country: 'USA', logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=MediaMax', createdBy: mariaClient.id } }),
    prisma.company.create({ data: { name: 'Fashion Forward Inc', type: CompanyType.ORGANIZATION, industry: 'Fashion & Retail', website: 'https://fashionforward.example.com', email: 'hello@fashionforward.example.com', phone: '+1-555-0300', address: '789 Fashion Ave, New York, NY 10018', city: 'New York', country: 'USA', logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=Fashion', createdBy: emma.id } }),
    prisma.company.create({ data: { name: 'Real Estate Ventures', type: CompanyType.ORGANIZATION, industry: 'Real Estate', website: 'https://reventures.example.com', email: 'info@reventures.example.com', phone: '+971-4-555-0400', address: 'Dubai Marina, Dubai, UAE', city: 'Dubai', country: 'UAE', logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=RealEstate', createdBy: admin.id } }),
    prisma.company.create({ data: { name: 'Government Services', type: CompanyType.ORGANIZATION, industry: 'Government', email: 'contact@gov.example.com', phone: '+966-11-555-0500', address: 'Riyadh, Saudi Arabia', city: 'Riyadh', country: 'Saudi Arabia', logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=Gov', createdBy: admin.id } }),
  ]);

  const [techCorp, mediaMax, fashionForward, realEstate, govServices] = companies;

  // Assign users to companies
  await prisma.companyUser.createMany({
    data: [
      { companyId: techCorp.id, userId: johnClient.id, role: CompanyRole.OWNER, canCreateProjects: true, canManageUsers: true },
      { companyId: techCorp.id, userId: lisa.id, role: CompanyRole.ADMIN, canCreateProjects: true, canManageUsers: true },
      { companyId: techCorp.id, userId: tom.id, role: CompanyRole.MEMBER, canCreateProjects: false },

      { companyId: mediaMax.id, userId: mariaClient.id, role: CompanyRole.OWNER, canCreateProjects: true, canManageUsers: true },
      { companyId: mediaMax.id, userId: michael.id, role: CompanyRole.ADMIN, canCreateProjects: true },
      { companyId: mediaMax.id, userId: james.id, role: CompanyRole.MEMBER },
      { companyId: mediaMax.id, userId: olivia.id, role: CompanyRole.MEMBER },

      { companyId: fashionForward.id, userId: emma.id, role: CompanyRole.OWNER, canCreateProjects: true, canManageUsers: true },
      { companyId: fashionForward.id, userId: sophia.id, role: CompanyRole.MEMBER },

      { companyId: realEstate.id, userId: admin.id, role: CompanyRole.OWNER, canCreateProjects: true, canManageUsers: true },
      { companyId: realEstate.id, userId: alex.id, role: CompanyRole.MEMBER },

      { companyId: govServices.id, userId: admin.id, role: CompanyRole.OWNER, canCreateProjects: true, canManageUsers: true },
      { companyId: govServices.id, userId: lisa.id, role: CompanyRole.ADMIN, canCreateProjects: true },
    ]
  });
  console.log(`✅ Created ${companies.length} companies with user assignments\n`);

  // ============================================================================
  // 4. CREATE PROJECTS
  // ============================================================================
  console.log('📁 Creating projects...');
  const projects = await Promise.all([
    prisma.project.create({ data: { name: 'Website Redesign 2025', description: 'Complete overhaul of corporate website', companyId: techCorp.id, status: ProjectStatus.IN_PROGRESS, startDate: new Date('2025-01-15'), endDate: new Date('2025-04-30'), budget: 50000, createdBy: johnClient.id } }),
    prisma.project.create({ data: { name: 'Mobile App Development', description: 'iOS and Android native apps', companyId: techCorp.id, status: ProjectStatus.PLANNING, startDate: new Date('2025-02-01'), endDate: new Date('2025-08-31'), budget: 120000, createdBy: lisa.id } }),
    prisma.project.create({ data: { name: 'Brand Video Campaign', description: '30-second TV commercial and social media content', companyId: mediaMax.id, status: ProjectStatus.IN_PROGRESS, startDate: new Date('2025-01-10'), endDate: new Date('2025-03-15'), budget: 75000, createdBy: mariaClient.id } }),
    prisma.project.create({ data: { name: 'Documentary Production', description: 'Feature-length documentary', companyId: mediaMax.id, status: ProjectStatus.DRAFT, budget: 200000, createdBy: michael.id } }),
    prisma.project.create({ data: { name: 'Spring Collection Photoshoot', description: 'Fashion photography for 2025 spring collection', companyId: fashionForward.id, status: ProjectStatus.COMPLETED, startDate: new Date('2024-11-01'), endDate: new Date('2024-12-20'), budget: 35000, createdBy: emma.id } }),
    prisma.project.create({ data: { name: 'E-commerce Platform', description: 'Online shopping platform with AR try-on', companyId: fashionForward.id, status: ProjectStatus.REVIEW, startDate: new Date('2024-10-01'), endDate: new Date('2025-02-28'), budget: 90000, createdBy: emma.id } }),
    prisma.project.create({ data: { name: 'Luxury Villa 3D Visualization', description: 'Photorealistic 3D renders and walkthrough', companyId: realEstate.id, status: ProjectStatus.IN_PROGRESS, startDate: new Date('2025-01-05'), endDate: new Date('2025-02-28'), budget: 45000, createdBy: admin.id } }),
    prisma.project.create({ data: { name: 'Real Estate Portal', description: 'Property listing and management platform', companyId: realEstate.id, status: ProjectStatus.PLANNING, budget: 80000, createdBy: admin.id } }),
    prisma.project.create({ data: { name: 'Public Awareness Campaign', description: 'Multi-channel awareness campaign', companyId: govServices.id, status: ProjectStatus.IN_PROGRESS, startDate: new Date('2025-01-01'), endDate: new Date('2025-06-30'), budget: 150000, createdBy: admin.id } }),
    prisma.project.create({ data: { name: 'Annual Report Design', description: 'Design and layout of 2024 annual report', companyId: govServices.id, status: ProjectStatus.ARCHIVED, startDate: new Date('2024-12-01'), endDate: new Date('2024-12-31'), budget: 25000, createdBy: admin.id } }),
  ]);

  // Add collaborators to projects
  await prisma.projectCollaborator.createMany({
    data: [
      { projectId: projects[0].id, userId: tom.id, role: 'LEAD', canEdit: true, canDelete: true, canInvite: true, addedBy: johnClient.id },
      { projectId: projects[0].id, userId: sophia.id, role: 'MEMBER', canEdit: true, addedBy: johnClient.id },
      { projectId: projects[1].id, userId: tom.id, role: 'LEAD', canEdit: true, canDelete: true, addedBy: lisa.id },
      { projectId: projects[2].id, userId: james.id, role: 'LEAD', canEdit: true, canDelete: true, canInvite: true, addedBy: mariaClient.id },
      { projectId: projects[2].id, userId: olivia.id, role: 'MEMBER', canEdit: true, addedBy: mariaClient.id },
      { projectId: projects[4].id, userId: sophia.id, role: 'MEMBER', canEdit: true, addedBy: emma.id },
      { projectId: projects[6].id, userId: alex.id, role: 'LEAD', canEdit: true, canDelete: true, addedBy: admin.id },
    ]
  });
  console.log(`✅ Created ${projects.length} projects with collaborators\n`);

  // ============================================================================
  // 5. CREATE CATEGORIES AND TAGS
  // ============================================================================
  console.log('🏷️  Creating categories and tags...');
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Company News', slug: 'company-news', description: 'Latest updates from KayanLive', locale: 'en', createdById: sarah.id, color: '#3B82F6' } }),
    prisma.category.create({ data: { name: 'Industry Insights', slug: 'industry-insights', description: 'Event industry trends and analysis', locale: 'en', createdById: sarah.id, color: '#10B981' } }),
    prisma.category.create({ data: { name: 'Case Studies', slug: 'case-studies', description: 'Project success stories', locale: 'en', createdById: sarah.id, color: '#F59E0B' } }),
    prisma.category.create({ data: { name: 'Event Management', slug: 'event-management', description: 'Tips and best practices', locale: 'en', createdById: sarah.id, color: '#8B5CF6' } }),
  ]);

  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'Dubai', slug: 'dubai', category: TagCategory.REGION, locale: 'en', createdById: sarah.id, color: '#EF4444' } }),
    prisma.tag.create({ data: { name: 'Saudi Arabia', slug: 'saudi-arabia', category: TagCategory.REGION, locale: 'en', createdById: sarah.id, color: '#10B981' } }),
    prisma.tag.create({ data: { name: 'Exhibition', slug: 'exhibition', category: TagCategory.PLATFORM, locale: 'en', createdById: sarah.id, color: '#3B82F6' } }),
    prisma.tag.create({ data: { name: 'Conference', slug: 'conference', category: TagCategory.PLATFORM, locale: 'en', createdById: sarah.id, color: '#8B5CF6' } }),
    prisma.tag.create({ data: { name: 'Technology', slug: 'technology', category: TagCategory.INDUSTRY, locale: 'en', createdById: sarah.id, color: '#06B6D4' } }),
    prisma.tag.create({ data: { name: 'Branding', slug: 'branding', category: TagCategory.PURPOSE, locale: 'en', createdById: sarah.id, color: '#F59E0B' } }),
    prisma.tag.create({ data: { name: 'Modern', slug: 'modern', category: TagCategory.STYLE, locale: 'en', createdById: sarah.id } }),
    prisma.tag.create({ data: { name: 'Luxury', slug: 'luxury', category: TagCategory.THEME, locale: 'en', createdById: sarah.id } }),
  ]);

  console.log(`✅ Created ${categories.length} categories and ${tags.length} tags\n`);

  // ============================================================================
  // 6. CREATE ARTICLES
  // ============================================================================
  console.log('📝 Creating articles with translations...');

  const article1 = await prisma.article.create({
    data: {
      title: 'KayanLive Launches Innovative Exhibition Solutions',
      slug: 'kayanlive-launches-innovative-exhibition-solutions',
      excerpt: 'Discover how our new tech-driven exhibition services are transforming the events industry across the GCC.',
      content: '<h2>Revolutionary Exhibition Technology</h2><p>KayanLive is proud to announce our latest innovation in exhibition management...</p>',
      locale: 'en',
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.NEWS,
      publishedAt: new Date('2025-01-15'),
      metaTitle: 'KayanLive Launches Innovative Exhibition Solutions | Company News',
      metaDescription: 'Learn about KayanLive\'s new tech-driven exhibition services transforming events across the GCC region.',
      authorId: sarah.id,
      categoryId: categories[0].id,
      isFeatured: true,
      isPinned: true,
      readingTime: 5,
      viewCount: 1250,
      featuredImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
    }
  });

  await prisma.articleTag.createMany({
    data: [
      { articleId: article1.id, tagId: tags[0].id },
      { articleId: article1.id, tagId: tags[2].id },
      { articleId: article1.id, tagId: tags[4].id },
    ]
  });

  // Add Arabic translation
  await prisma.articleTranslation.create({
    data: {
      articleId: article1.id,
      locale: 'ar',
      title: 'كيان لايف تطلق حلول معارض مبتكرة',
      slug: 'kayanlive-launches-innovative-exhibition-solutions-ar',
      excerpt: 'اكتشف كيف تعمل خدماتنا الجديدة المدعومة بالتكنولوجيا على تحويل صناعة الفعاليات في دول مجلس التعاون الخليجي.',
      content: '<h2>تكنولوجيا المعارض الثورية</h2><p>يسر كيان لايف أن تعلن عن أحدث ابتكاراتها في إدارة المعارض...</p>',
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date('2025-01-15'),
      translatorId: ahmed.id,
      viewCount: 850,
    }
  });

  const article2 = await prisma.article.create({
    data: {
      title: 'Top 10 Event Management Trends for 2025',
      slug: 'top-10-event-management-trends-2025',
      excerpt: 'Stay ahead of the curve with these emerging trends in event planning and execution.',
      content: '<h2>Event Industry Evolution</h2><p>As we move into 2025, the event management landscape continues to evolve...</p>',
      locale: 'en',
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.BLOG_POST,
      publishedAt: new Date('2025-01-10'),
      authorId: sarah.id,
      categoryId: categories[1].id,
      isFeatured: true,
      readingTime: 8,
      viewCount: 2340,
      featuredImage: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200',
    }
  });

  await prisma.articleTag.createMany({
    data: [
      { articleId: article2.id, tagId: tags[3].id },
      { articleId: article2.id, tagId: tags[4].id },
    ]
  });

  const article3 = await prisma.article.create({
    data: {
      title: 'Case Study: TechExpo 2024 Success Story',
      slug: 'case-study-techexpo-2024',
      excerpt: 'How we delivered a world-class technology exhibition for 10,000+ attendees.',
      content: '<h2>Project Overview</h2><p>TechExpo 2024 was our most ambitious project to date...</p>',
      locale: 'en',
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.CASE_STUDY,
      publishedAt: new Date('2024-12-20'),
      authorId: michael.id,
      categoryId: categories[2].id,
      readingTime: 12,
      viewCount: 1890,
      featuredImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200',
    }
  });

  // Draft articles
  await prisma.article.create({
    data: {
      title: 'Upcoming Article: Future of Hybrid Events',
      slug: 'future-of-hybrid-events-draft',
      excerpt: 'Draft content about hybrid event trends',
      content: '<p>Content in progress...</p>',
      locale: 'en',
      status: ArticleStatus.DRAFT,
      type: ArticleType.BLOG_POST,
      authorId: sarah.id,
      categoryId: categories[1].id,
    }
  });

  await prisma.article.create({
    data: {
      title: 'Pending Review: New Service Announcement',
      slug: 'new-service-announcement-pending',
      excerpt: 'Awaiting editorial review',
      content: '<p>Service announcement content...</p>',
      locale: 'en',
      status: ArticleStatus.PENDING_REVIEW,
      type: ArticleType.ANNOUNCEMENT,
      authorId: moderator.id,
      categoryId: categories[0].id,
    }
  });

  console.log('✅ Created 5 articles with translations\n');

  // ============================================================================
  // 7. CREATE COMPREHENSIVE ASSETS
  // ============================================================================
  console.log('🖼️  Creating assets with full metadata...');

  const assets = [];

  // Images
  for (let i = 1; i <= 15; i++) {
    const asset = await prisma.asset.create({
      data: {
        name: `Exhibition Photo ${i}`,
        title: `High-res exhibition photograph ${i}`,
        description: `Professional photography from event ${i}`,
        type: AssetType.IMAGE,
        fileName: `exhibition-${i}.jpg`,
        originalName: `Exhibition_Photo_${i}.jpg`,
        fileSize: BigInt(Math.floor(Math.random() * 5000000) + 1000000),
        mimeType: 'image/jpeg',
        format: 'jpg',
        fileKey: `assets/images/2025/01/exhibition-${i}.jpg`,
        thumbnailKey: `thumbnails/2025/01/exhibition-${i}.jpg`,
        previewKey: `previews/2025/01/exhibition-${i}.jpg`,
        uploadStatus: UploadStatus.COMPLETED,
        processingStatus: ProcessingStatus.COMPLETED,
        width: 3840,
        height: 2160,
        visibility: i % 3 === 0 ? Visibility.EXTERNAL : Visibility.INTERNAL,
        usage: i % 2 === 0 ? UsageType.PUBLIC : UsageType.INTERNAL,
        readyForPublishing: i % 2 === 0,
        category: i % 3 === 0 ? 'Marketing' : 'Brand',
        eventName: `Event ${Math.ceil(i / 3)}`,
        productionYear: 2025,
        uploadedBy: i % 3 === 0 ? michael.id : sophia.id,
        tags: ['exhibition', 'photography', '2025'],
      }
    });
    assets.push(asset);
  }

  // Videos
  for (let i = 1; i <= 8; i++) {
    const asset = await prisma.asset.create({
      data: {
        name: `Event Highlight Video ${i}`,
        title: `Event promotional video ${i}`,
        description: `4K video highlights from event ${i}`,
        type: AssetType.VIDEO,
        fileName: `event-video-${i}.mp4`,
        originalName: `Event_Highlight_${i}.mp4`,
        fileSize: BigInt(Math.floor(Math.random() * 500000000) + 100000000),
        mimeType: 'video/mp4',
        format: 'mp4',
        fileKey: `assets/videos/2025/01/event-video-${i}.mp4`,
        thumbnailKey: `thumbnails/2025/01/event-video-${i}.jpg`,
        previewKey: `previews/2025/01/event-video-${i}-preview.mp4`,
        uploadStatus: UploadStatus.COMPLETED,
        processingStatus: i > 6 ? ProcessingStatus.PROCESSING : ProcessingStatus.COMPLETED,
        width: 3840,
        height: 2160,
        duration: Math.floor(Math.random() * 180) + 30,
        visibility: Visibility.INTERNAL,
        usage: UsageType.PUBLIC,
        readyForPublishing: i <= 6,
        category: 'Marketing',
        eventName: `Event ${i}`,
        productionYear: 2025,
        uploadedBy: james.id,
        tags: ['video', 'event', '4k'],
      }
    });
    assets.push(asset);
  }

  // 3D Models
  for (let i = 1; i <= 5; i++) {
    const asset = await prisma.asset.create({
      data: {
        name: `3D Booth Design ${i}`,
        title: `Exhibition booth 3D model ${i}`,
        description: `Photorealistic 3D model of exhibition booth design`,
        type: AssetType.MODEL_3D,
        fileName: `booth-design-${i}.fbx`,
        originalName: `Booth_Design_${i}.fbx`,
        fileSize: BigInt(Math.floor(Math.random() * 50000000) + 10000000),
        mimeType: 'application/octet-stream',
        format: 'fbx',
        fileKey: `assets/3d/2025/01/booth-design-${i}.fbx`,
        thumbnailKey: `thumbnails/2025/01/booth-design-${i}.jpg`,
        previewKey: `previews/2025/01/booth-design-${i}.glb`,
        uploadStatus: UploadStatus.COMPLETED,
        processingStatus: ProcessingStatus.COMPLETED,
        visibility: Visibility.INTERNAL,
        usage: UsageType.INTERNAL,
        category: 'Design',
        uploadedBy: alex.id,
        tags: ['3d', 'booth', 'design'],
      }
    });
    assets.push(asset);
  }

  // Documents
  for (let i = 1; i <= 10; i++) {
    const asset = await prisma.asset.create({
      data: {
        name: `Project Proposal ${i}`,
        title: `Client proposal document ${i}`,
        description: `Detailed project proposal and quotation`,
        type: AssetType.DOCUMENT,
        fileName: `proposal-${i}.pdf`,
        originalName: `Project_Proposal_${i}.pdf`,
        fileSize: BigInt(Math.floor(Math.random() * 5000000) + 500000),
        mimeType: 'application/pdf',
        format: 'pdf',
        fileKey: `assets/documents/2025/01/proposal-${i}.pdf`,
        thumbnailKey: `thumbnails/2025/01/proposal-${i}.jpg`,
        uploadStatus: UploadStatus.COMPLETED,
        processingStatus: ProcessingStatus.COMPLETED,
        visibility: Visibility.INTERNAL,
        usage: UsageType.INTERNAL,
        category: 'Business',
        uploadedBy: lisa.id,
        tags: ['proposal', 'document', 'business'],
      }
    });
    assets.push(asset);
  }

  // Design files
  for (let i = 1; i <= 7; i++) {
    const asset = await prisma.asset.create({
      data: {
        name: `Brand Design ${i}`,
        title: `Brand identity design file ${i}`,
        description: `Complete brand design package`,
        type: AssetType.DESIGN,
        fileName: `brand-design-${i}.psd`,
        originalName: `Brand_Design_${i}.psd`,
        fileSize: BigInt(Math.floor(Math.random() * 100000000) + 20000000),
        mimeType: 'image/vnd.adobe.photoshop',
        format: 'psd',
        fileKey: `assets/design/2025/01/brand-design-${i}.psd`,
        thumbnailKey: `thumbnails/2025/01/brand-design-${i}.jpg`,
        uploadStatus: UploadStatus.COMPLETED,
        processingStatus: ProcessingStatus.COMPLETED,
        visibility: Visibility.INTERNAL,
        usage: UsageType.INTERNAL,
        category: 'Brand',
        uploadedBy: emma.id,
        tags: ['design', 'brand', 'psd'],
      }
    });
    assets.push(asset);
  }

  // Link assets to projects and companies
  await prisma.projectAsset.createMany({
    data: [
      { projectId: projects[0].id, assetId: assets[0].id, addedBy: tom.id },
      { projectId: projects[0].id, assetId: assets[1].id, addedBy: tom.id },
      { projectId: projects[2].id, assetId: assets[15].id, addedBy: james.id },
      { projectId: projects[2].id, assetId: assets[16].id, addedBy: james.id },
      { projectId: projects[6].id, assetId: assets[23].id, addedBy: alex.id },
    ]
  });

  await prisma.companyAsset.createMany({
    data: [
      { companyId: techCorp.id, assetId: assets[0].id, addedBy: johnClient.id },
      { companyId: mediaMax.id, assetId: assets[15].id, addedBy: mariaClient.id },
      { companyId: realEstate.id, assetId: assets[23].id, addedBy: admin.id },
    ]
  });

  console.log(`✅ Created ${assets.length} assets\n`);

  // Create Asset Share Links
  console.log('🔗 Creating asset share links...');
  await prisma.assetShareLink.createMany({
    data: [
      {
        token: 'active-share-link-1',
        assetId: assets[0].id,
        createdById: michael.id,
        allowDownload: true,
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        viewCount: 45,
        downloadCount: 12,
      },
      {
        token: 'protected-share-link-2',
        assetId: assets[5].id,
        createdById: sarah.id,
        password: await bcrypt.hash('sharepass123', 10),
        allowDownload: true,
        isActive: true,
        maxDownloads: 50,
        currentDownloads: 23,
        viewCount: 89,
        downloadCount: 23,
      },
      {
        token: 'expired-share-link-3',
        assetId: assets[10].id,
        createdById: admin.id,
        allowDownload: false,
        isActive: true,
        expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Expired 5 days ago
        viewCount: 120,
        downloadCount: 0,
      },
    ]
  });
  console.log('✅ Created share links\n');

  // Create Download Requests
  console.log('📥 Creating download requests...');
  await prisma.downloadRequest.createMany({
    data: [
      { userId: johnClient.id, assetId: assets[2].id, status: DownloadRequestStatus.PENDING, reason: 'Need for client presentation' },
      { userId: mariaClient.id, assetId: assets[7].id, status: DownloadRequestStatus.APPROVED, reviewedBy: admin.id, reviewedAt: new Date(), reason: 'Marketing campaign use' },
      { userId: tom.id, assetId: assets[12].id, status: DownloadRequestStatus.REJECTED, reviewedBy: moderator.id, reviewedAt: new Date(), reason: 'Personal portfolio' },
      { userId: johnClient.id, assetId: assets[18].id, status: DownloadRequestStatus.PENDING, reason: 'Project documentation' },
    ]
  });
  console.log('✅ Created download requests\n');

  // Create Asset Reviews
  await prisma.assetReview.createMany({
    data: [
      { assetId: assets[0].id, reviewerId: moderator.id, status: ReviewStatus.APPROVED, comments: 'Excellent quality, approved for publishing' },
      { assetId: assets[5].id, reviewerId: michael.id, status: ReviewStatus.NEEDS_REVISION, comments: 'Good but needs color correction' },
      { assetId: assets[10].id, reviewerId: admin.id, status: ReviewStatus.REJECTED, comments: 'Quality not suitable for client presentation' },
    ]
  });

  // Create Favorites
  await prisma.assetFavorite.createMany({
    data: [
      { userId: johnClient.id, assetId: assets[0].id },
      { userId: johnClient.id, assetId: assets[5].id },
      { userId: mariaClient.id, assetId: assets[15].id },
      { userId: michael.id, assetId: assets[2].id },
    ]
  });

  // ============================================================================
  // 8. CREATE COLLECTIONS
  // ============================================================================
  console.log('📚 Creating collections...');
  const collection1 = await prisma.collection.create({
    data: {
      name: 'TechExpo 2024 Assets',
      description: 'All photos and videos from TechExpo 2024',
      coverImage: assets[0].fileKey!,
      isPublic: false,
      isPinned: true,
      createdById: michael.id,
    }
  });

  const collection2 = await prisma.collection.create({
    data: {
      name: 'Brand Guidelines',
      description: 'Official brand assets and guidelines',
      isPublic: true,
      createdById: emma.id,
    }
  });

  await prisma.assetCollection.createMany({
    data: [
      { collectionId: collection1.id, assetId: assets[0].id, position: 0, addedBy: michael.id },
      { collectionId: collection1.id, assetId: assets[1].id, position: 1, addedBy: michael.id },
      { collectionId: collection1.id, assetId: assets[15].id, position: 2, addedBy: michael.id },
      { collectionId: collection2.id, assetId: assets[38].id, position: 0, addedBy: emma.id },
      { collectionId: collection2.id, assetId: assets[39].id, position: 1, addedBy: emma.id },
    ]
  });
  console.log('✅ Created 2 collections\n');

  // ============================================================================
  // 9. CREATE EXHIBITIONS
  // ============================================================================
  console.log('🎪 Creating exhibitions...');
  const venue1 = await prisma.venue.create({
    data: { name: 'Dubai World Trade Centre', address: 'Sheikh Zayed Road', city: 'Dubai', country: 'UAE' }
  });

  const venue2 = await prisma.venue.create({
    data: { name: 'Riyadh International Convention Center', city: 'Riyadh', country: 'Saudi Arabia' }
  });

  const organizer1 = await prisma.organizer.create({
    data: { name: 'Global Events Ltd', email: 'info@globalevents.com', website: 'https://globalevents.com' }
  });

  const exhibition1 = await prisma.exhibition.create({
    data: {
      name: 'GITEX Technology Week 2025',
      slug: 'gitex-technology-week-2025',
      industry: 'Technology',
      startDate: new Date('2025-10-15'),
      endDate: new Date('2025-10-19'),
      durationDays: 5,
      status: 'confirmed',
      eventWebsite: 'https://gitex.com',
      venueId: venue1.id,
      organizerId: organizer1.id,
    }
  });

  const exhibition2 = await prisma.exhibition.create({
    data: {
      name: 'Saudi Food & Hospitality Expo 2025',
      slug: 'saudi-food-hospitality-expo-2025',
      industry: 'Food & Hospitality',
      startDate: new Date('2025-05-20'),
      endDate: new Date('2025-05-23'),
      durationDays: 4,
      status: 'confirmed',
      venueId: venue2.id,
      organizerId: organizer1.id,
    }
  });

  // Create exhibitors and leads
  const exhibitor1 = await prisma.exhibitor.create({
    data: { name: 'Microsoft', website: 'https://microsoft.com', industry: 'Technology', country: 'USA' }
  });

  const exhibitor2 = await prisma.exhibitor.create({
    data: { name: 'Samsung Electronics', website: 'https://samsung.com', industry: 'Electronics', country: 'South Korea' }
  });

  await prisma.exhibitionExhibitor.createMany({
    data: [
      { exhibitionId: exhibition1.id, exhibitorId: exhibitor1.id, standNumber: 'H1-A01', standSizeSqm: 120 },
      { exhibitionId: exhibition1.id, exhibitorId: exhibitor2.id, standNumber: 'H1-B05', standSizeSqm: 200 },
    ]
  });

  await prisma.exhibitionLead.createMany({
    data: [
      {
        exhibitorId: exhibitor1.id,
        exhibitionId: exhibition1.id,
        status: 'contacted',
        contactName: 'David Johnson',
        contactEmail: 'david.johnson@microsoft.com',
        contactPhone: '+1-555-0123',
        qualityScore: 85,
        leadSource: 'exhibition_list',
        standSize: 120,
        previousClient: false,
        lastContactDate: new Date('2025-01-10'),
        nextFollowUpDate: new Date('2025-01-20'),
      },
      {
        exhibitorId: exhibitor2.id,
        exhibitionId: exhibition1.id,
        status: 'proposal_sent',
        contactName: 'Kim Min-ji',
        contactEmail: 'minji.kim@samsung.com',
        contactPhone: '+82-2-555-0456',
        qualityScore: 92,
        leadSource: 'referral',
        standSize: 200,
        previousClient: true,
        proposalSentDate: new Date('2025-01-12'),
        proposalDeadline: new Date('2025-01-25'),
        lastContactDate: new Date('2025-01-12'),
        nextFollowUpDate: new Date('2025-01-18'),
      },
    ]
  });

  console.log('✅ Created exhibitions with leads\n');

  // ============================================================================
  // 10. CREATE WEBSITE LEADS
  // ============================================================================
  console.log('📋 Creating website leads...');
  await prisma.lead.createMany({
    data: [
      {
        fullName: 'Ahmed Al-Rashid',
        email: 'ahmed@example.com',
        phone: '+966-50-555-0100',
        organization: 'Tech Innovations KSA',
        eventType: 'Product Launch',
        budget: '$50,000 - $100,000',
        goals: 'Launch new product line in Saudi market',
        isUrgent: true,
        status: LeadStatus.NEW,
        source: 'contact_form',
        companyId: null,
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'product-launch-2025',
      },
      {
        fullName: 'Fatima Hassan',
        email: 'fatima@example.com',
        phone: '+971-50-555-0200',
        organization: 'Dubai Real Estate Group',
        eventType: 'Corporate Event',
        budget: '$75,000 - $150,000',
        goals: 'Annual stakeholder meeting',
        status: LeadStatus.CONTACTED,
        source: 'contact_form',
        assignedTo: lisa.id,
        notes: 'Follow up scheduled for next week',
      },
      {
        fullName: 'Mohammed Al-Otaibi',
        email: 'mohammed@example.com',
        phone: '+966-11-555-0300',
        organization: 'Saudi Tourism Authority',
        eventType: 'Exhibition',
        budget: 'Above $150,000',
        goals: 'Tourism promotion exhibition',
        status: LeadStatus.QUALIFIED,
        source: 'website',
        assignedTo: admin.id,
        companyId: govServices.id,
      },
    ]
  });
  console.log('✅ Created website leads\n');

  // ============================================================================
  // 11. CREATE TASKS AND MILESTONES
  // ============================================================================
  console.log('✅ Creating tasks and milestones...');

  const milestone1 = await prisma.milestone.create({
    data: {
      name: 'Design Phase Complete',
      description: 'All design mockups approved',
      projectId: projects[0].id,
      dueDate: new Date('2025-02-15'),
      status: MilestoneStatus.IN_PROGRESS,
      progress: 75,
      deliverables: ['Homepage mockup', 'Inner pages mockup', 'Mobile designs'],
      startDate: new Date('2025-01-15'),
    }
  });

  const milestone2 = await prisma.milestone.create({
    data: {
      name: 'Video Production Complete',
      description: 'Final video delivered and approved',
      projectId: projects[2].id,
      dueDate: new Date('2025-03-01'),
      status: MilestoneStatus.COMPLETED,
      progress: 100,
      signedOffBy: michael.id,
      signedOffAt: new Date('2025-02-28'),
      clientApproval: true,
      approvedBy: mariaClient.id,
      approvedAt: new Date('2025-02-28'),
    }
  });

  await prisma.task.createMany({
    data: [
      { name: 'Create homepage design', description: 'Design main landing page', projectId: projects[0].id, milestoneId: milestone1.id, status: TaskStatus.COMPLETED, priority: Priority.HIGH, dueDate: new Date('2025-01-25'), order: 1, completedAt: new Date('2025-01-24') },
      { name: 'Design contact form', description: 'Create contact form UI', projectId: projects[0].id, milestoneId: milestone1.id, status: TaskStatus.IN_PROGRESS, priority: Priority.MEDIUM, dueDate: new Date('2025-02-05'), order: 2 },
      { name: 'Mobile responsive review', description: 'Test all pages on mobile', projectId: projects[0].id, milestoneId: milestone1.id, status: TaskStatus.CONCEPT, priority: Priority.LOW, dueDate: new Date('2025-02-10'), order: 3 },
      { name: 'Film main sequences', description: 'Shoot primary video content', projectId: projects[2].id, milestoneId: milestone2.id, status: TaskStatus.COMPLETED, priority: Priority.URGENT, completedAt: new Date('2025-02-15') },
      { name: 'Edit rough cut', description: 'First edit pass', projectId: projects[2].id, milestoneId: milestone2.id, status: TaskStatus.COMPLETED, priority: Priority.HIGH, completedAt: new Date('2025-02-22') },
      { name: 'Final color grading', description: 'Professional color correction', projectId: projects[2].id, milestoneId: milestone2.id, status: TaskStatus.COMPLETED, priority: Priority.MEDIUM, completedAt: new Date('2025-02-27') },
    ]
  });

  console.log('✅ Created milestones and tasks\n');

  // ============================================================================
  // 12. CREATE MEETINGS
  // ============================================================================
  console.log('🤝 Creating meetings...');
  await prisma.meeting.createMany({
    data: [
      {
        title: 'Project Kickoff Meeting',
        description: 'Initial project planning and team alignment',
        startTime: new Date('2025-01-15T10:00:00'),
        endTime: new Date('2025-01-15T11:30:00'),
        location: 'Conference Room A',
        agenda: '1. Project overview\n2. Team introductions\n3. Timeline review\n4. Q&A',
        projectId: projects[0].id,
      },
      {
        title: 'Design Review',
        description: 'Review homepage mockups',
        startTime: new Date('2025-01-25T14:00:00'),
        endTime: new Date('2025-01-25T15:00:00'),
        location: 'Virtual - Zoom',
        projectId: projects[0].id,
      },
      {
        title: 'Video Production Meeting',
        description: 'Pre-production planning',
        startTime: new Date('2025-02-01T09:00:00'),
        endTime: new Date('2025-02-01T11:00:00'),
        location: 'Studio',
        projectId: projects[2].id,
      },
    ]
  });
  console.log('✅ Created meetings\n');

  // ============================================================================
  // 13. CREATE NOTIFICATIONS
  // ============================================================================
  console.log('🔔 Creating notifications...');
  await prisma.notification.createMany({
    data: [
      { userId: tom.id, type: NotificationType.TASK_ASSIGNED, title: 'New Task Assigned', message: 'You have been assigned to "Create homepage design"', read: true, taskId: (await prisma.task.findFirst({ where: { name: 'Create homepage design' }}))?.id },
      { userId: tom.id, type: NotificationType.TASK_DUE_SOON, title: 'Task Due Soon', message: 'Task "Design contact form" is due in 2 days', read: false },
      { userId: mariaClient.id, type: NotificationType.MILESTONE_APPROVED, title: 'Milestone Approved', message: 'Video Production milestone has been completed', read: false, projectId: projects[2].id },
      { userId: johnClient.id, type: NotificationType.ASSET_DOWNLOAD_APPROVED, title: 'Download Approved', message: 'Your download request has been approved', read: false },
      { userId: james.id, type: NotificationType.PROJECT_MEMBER_ADDED, title: 'Added to Project', message: 'You were added to Brand Video Campaign', read: true, projectId: projects[2].id },
    ]
  });
  console.log('✅ Created notifications\n');

  // ============================================================================
  // 14. CREATE INVITATIONS
  // ============================================================================
  console.log('✉️  Creating project invitations...');
  await prisma.invitation.createMany({
    data: [
      {
        email: 'newmember@example.com',
        token: 'invitation-token-1',
        status: InvitationStatus.PENDING,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        projectId: projects[0].id,
        role: 'MEMBER',
        invitedById: johnClient.id,
      },
      {
        email: sophia.email,
        token: 'invitation-token-2',
        status: InvitationStatus.ACCEPTED,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        projectId: projects[0].id,
        role: 'MEMBER',
        invitedById: johnClient.id,
        acceptedById: sophia.id,
      },
    ]
  });
  console.log('✅ Created invitations\n');

  // ============================================================================
  // 15. CREATE COMMENTS (Threaded)
  // ============================================================================
  console.log('💬 Creating comments...');
  const comment1 = await prisma.comment.create({
    data: {
      content: 'This looks great! Love the color scheme.',
      commentableType: CommentableType.TASK,
      commentableId: (await prisma.task.findFirst({ where: { name: 'Create homepage design' }}))!.id,
      authorId: johnClient.id,
      taskId: (await prisma.task.findFirst({ where: { name: 'Create homepage design' }}))?.id,
    }
  });

  await prisma.comment.create({
    data: {
      content: 'Thanks! I\'ll send over the final version tomorrow.',
      commentableType: CommentableType.TASK,
      commentableId: (await prisma.task.findFirst({ where: { name: 'Create homepage design' }}))!.id,
      authorId: tom.id,
      parentId: comment1.id,
      taskId: (await prisma.task.findFirst({ where: { name: 'Create homepage design' }}))?.id,
    }
  });

  await prisma.comment.create({
    data: {
      content: 'Milestone looks on track. Great work team!',
      commentableType: CommentableType.MILESTONE,
      commentableId: milestone1.id,
      authorId: lisa.id,
      milestoneId: milestone1.id,
    }
  });

  console.log('✅ Created comments with threading\n');

  // ============================================================================
  // 16. CREATE CLIENT UPLOADS
  // ============================================================================
  console.log('📤 Creating client uploads...');
  await prisma.clientUpload.createMany({
    data: [
      {
        fileName: 'brand-guidelines.pdf',
        fileKey: 'client-uploads/2025/01/brand-guidelines.pdf',
        fileSize: BigInt(5242880),
        mimeType: 'application/pdf',
        description: 'Our brand guidelines for reference',
        folder: 'brand',
        projectId: projects[0].id,
        uploadedBy: johnClient.id,
      },
      {
        fileName: 'product-images.zip',
        fileKey: 'client-uploads/2025/01/product-images.zip',
        fileSize: BigInt(52428800),
        mimeType: 'application/zip',
        description: 'Product photography',
        folder: 'assets',
        projectId: projects[0].id,
        uploadedBy: johnClient.id,
      },
    ]
  });
  console.log('✅ Created client uploads\n');

  // ============================================================================
  // 17. CREATE QUESTIONNAIRE SUBMISSIONS
  // ============================================================================
  console.log('📋 Creating questionnaire submissions...');
  const submission1 = await prisma.questionnaireSubmission.create({
    data: {
      questionnaireId: 'project-brief',
      userId: johnClient.id,
      projectId: projects[0].id,
      isComplete: true,
      submittedAt: new Date('2025-01-10'),
      companyName: 'TechCorp Solutions',
      contactPerson: 'John Smith',
      email: 'john@techcorp.example.com',
      industry: 'Technology',
    }
  });

  await prisma.submissionAnswer.createMany({
    data: [
      { submissionId: submission1.id, questionId: 1, questionType: 'text', section: 'Client Details', textValue: 'TechCorp Solutions' },
      { submissionId: submission1.id, questionId: 2, questionType: 'select', section: 'Event Details', textValue: 'Product Launch' },
      { submissionId: submission1.id, questionId: 3, questionType: 'text', section: 'Budget', textValue: '$50,000 - $100,000' },
    ]
  });

  console.log('✅ Created questionnaire submissions\n');

  // ============================================================================
  // 18. CREATE AUDIT LOGS
  // ============================================================================
  console.log('📊 Creating audit logs...');
  await prisma.auditLog.createMany({
    data: [
      { userId: admin.id, action: 'USER_CREATED', performedBy: admin.id, entityType: 'User', entityId: johnClient.id, metadata: { newValues: { email: 'john@techcorp.example.com', role: 'CLIENT' }}},
      { userId: johnClient.id, action: 'PROJECT_CREATED', performedBy: johnClient.id, entityType: 'Project', entityId: projects[0].id, metadata: { projectName: 'Website Redesign 2025' }},
      { userId: tom.id, action: 'ASSET_UPLOADED', performedBy: tom.id, entityType: 'Asset', entityId: assets[0].id, metadata: { assetType: 'IMAGE', fileName: 'exhibition-1.jpg' }},
      { userId: admin.id, action: 'COMPANY_CREATED', performedBy: admin.id, entityType: 'Company', entityId: techCorp.id, metadata: { companyName: 'TechCorp Solutions' }},
      { userId: michael.id, action: 'ARTICLE_PUBLISHED', performedBy: michael.id, entityType: 'Article', entityId: article1.id, metadata: { title: 'KayanLive Launches Innovative Exhibition Solutions' }},
    ]
  });
  console.log('✅ Created audit logs\n');

  // ============================================================================
  // FINAL SUMMARY
  // ============================================================================
  console.log('\n🎉 COMPREHENSIVE SEED COMPLETED!\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 DATABASE SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`👥 Users: ${users.length} (All roles covered)`);
  console.log(`🏢 Companies: ${companies.length} (with user roles)`);
  console.log(`📁 Projects: ${projects.length} (all statuses)`);
  console.log(`📝 Articles: 5 (with translations)`);
  console.log(`🏷️  Categories: ${categories.length} | Tags: ${tags.length}`);
  console.log(`🖼️  Assets: ${assets.length} (images, videos, 3D, docs, designs)`);
  console.log(`📚 Collections: 2`);
  console.log(`🎪 Exhibitions: 2 (with leads)`);
  console.log(`✅ Tasks: 6 | Milestones: 2`);
  console.log(`🤝 Meetings: 3`);
  console.log(`🔗 Share Links: 3`);
  console.log(`📥 Download Requests: 4`);
  console.log(`🔔 Notifications: 5`);
  console.log(`✉️  Invitations: 2`);
  console.log(`💬 Comments: 3 (with threading)`);
  console.log(`📤 Client Uploads: 2`);
  console.log(`📋 Leads: 3 (website) + 2 (exhibition)`);
  console.log(`📋 Questionnaire Submissions: 1`);
  console.log(`📊 Audit Logs: 5+`);
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📌 LOGIN CREDENTIALS (All users):');
  console.log('Password: password123\n');
  console.log('✅ ADMIN ACCOUNTS:');
  console.log('   • admin@kayanlive.com');
  console.log('   • superadmin@kayanlive.com\n');
  console.log('✅ TEAM ACCOUNTS:');
  console.log('   • moderator@kayanlive.com (Moderator)');
  console.log('   • sarah@kayanlive.com (Content Creator)');
  console.log('   • ahmed@kayanlive.com (Translator)');
  console.log('   • michael@kayanlive.com (Art Director)');
  console.log('   • emma@kayanlive.com (Designer)');
  console.log('   • alex@kayanlive.com (3D Designer)');
  console.log('   • sophia@kayanlive.com (2D Designer)');
  console.log('   • james@kayanlive.com (Video Editor)');
  console.log('   • olivia@kayanlive.com (Motion Graphics)');
  console.log('   • tom@kayanlive.com (Web Developer)');
  console.log('   • lisa@kayanlive.com (Project Manager)\n');
  console.log('✅ CLIENT ACCOUNTS:');
  console.log('   • john@techcorp.example.com');
  console.log('   • maria@mediamax.example.com\n');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('🚀 Ready to test ALL admin features!');
  console.log('   Visit: http://localhost:3001/admin\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
