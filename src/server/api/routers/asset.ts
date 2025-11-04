import { z } from 'zod';
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
  createPermissionProcedure,
  Permission,
} from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import {
  AssetType,
  Visibility,
  UsageType,
  UploadStatus,
  ProcessingStatus,
  TagCategory,
  AuditAction,
} from '@prisma/client';
import {
  uploadFile,
  getPresignedUrl,
  deleteFile,
  getFileType,
} from '@/lib/s3';
import {
  queueAssetProcessing,
  queueThumbnailGeneration,
  queueVariantGeneration,
  queueAnalytics,
} from '@/lib/queue';

export const assetRouter = createTRPCRouter({
  /**
   * Create a new asset
   * Requires ASSET_CREATE permission
   */
  create: createPermissionProcedure(Permission.ASSET_CREATE)
    .input(
      z.object({
        name: z.string().min(1),
        type: z.nativeEnum(AssetType),
        fileName: z.string(),
        filePath: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
        description: z.string().optional(),
        tags: z.array(z.string()).optional(),
        companyId: z.string().optional(), // If linking to company
        projectId: z.string().optional(), // If linking to project
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Create the asset
      const asset = await ctx.prisma.asset.create({
        data: {
          name: input.name,
          originalName: input.fileName, // Store original filename
          type: input.type,
          fileName: input.fileName,
          filePath: input.filePath,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          description: input.description,
          tags: input.tags || [],
          uploadedBy: userId,
        },
      });

      // Link to company if provided
      if (input.companyId) {
        // Verify user has access to company
        const companyUser = await ctx.prisma.companyUser.findUnique({
          where: {
            companyId_userId: {
              companyId: input.companyId,
              userId,
            },
          },
        });

        if (!companyUser && ctx.session.user.role !== 'ADMIN') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have access to this company',
          });
        }

        await ctx.prisma.companyAsset.create({
          data: {
            companyId: input.companyId,
            assetId: asset.id,
            addedBy: userId,
          },
        });
      }

      // Link to project if provided
      if (input.projectId) {
        // Verify user has access to project
        const projectCollaborator = await ctx.prisma.projectCollaborator.findUnique({
          where: {
            projectId_userId: {
              projectId: input.projectId,
              userId,
            },
          },
        });

        if (!projectCollaborator && ctx.session.user.role !== 'ADMIN') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have access to this project',
          });
        }

        await ctx.prisma.projectAsset.create({
          data: {
            projectId: input.projectId,
            assetId: asset.id,
            addedBy: userId,
          },
        });
      }

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          action: 'ASSET_UPLOADED',
          userId,
          performedBy: userId,
          details: {
            assetId: asset.id,
            assetName: asset.name,
            assetType: asset.type,
          },
        },
      });

      return { asset };
    }),

  /**
   * List assets with filtering (alias for getAll)
   */
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        type: z.nativeEnum(AssetType).optional(),
        companyId: z.string().optional(),
        projectId: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, type, companyId, projectId, page, limit } = input;
      const skip = (page - 1) * limit;
      const userId = ctx.session.user.id;
      const isAdmin = ctx.session.user.role === 'ADMIN';

      // Build where clause
      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (type) {
        where.type = type;
      }

      // Get assets
      const [assets, total] = await Promise.all([
        ctx.prisma.asset.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            uploader: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        ctx.prisma.asset.count({ where }),
      ]);

      return {
        assets,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  /**
   * Get all assets with filtering
   */
  getAll: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        type: z.nativeEnum(AssetType).optional(),
        companyId: z.string().optional(),
        projectId: z.string().optional(),
        favoritesOnly: z.boolean().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, type, companyId, projectId, favoritesOnly, page, limit } = input;
      const skip = (page - 1) * limit;
      const userId = ctx.session.user.id;
      const isAdmin = ctx.session.user.role === 'ADMIN';

      // Build where clause
      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (type) {
        where.type = type;
      }

      // Filter by company
      if (companyId) {
        where.companies = {
          some: { companyId },
        };
      }

      // Filter by project
      if (projectId) {
        where.projects = {
          some: { projectId },
        };
      }

      // Filter by favorites
      if (favoritesOnly) {
        where.favorites = {
          some: {
            userId,
          },
        };
      }

      // Non-admin users can only see assets from their companies or projects
      if (!isAdmin) {
        where.OR = [
          // Assets uploaded by user
          { uploadedBy: userId },
          // Assets in user's companies
          {
            companies: {
              some: {
                company: {
                  users: {
                    some: { userId },
                  },
                },
              },
            },
          },
          // Assets in user's projects
          {
            projects: {
              some: {
                project: {
                  collaborators: {
                    some: { userId },
                  },
                },
              },
            },
          },
        ];
      }

      const [assets, total] = await Promise.all([
        ctx.prisma.asset.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            uploader: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            projects: {
              include: {
                project: {
                  select: {
                    id: true,
                    name: true,
                    company: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
            companies: {
              include: {
                company: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            _count: {
              select: {
                projects: true,
                companies: true,
              },
            },
          },
        }),
        ctx.prisma.asset.count({ where }),
      ]);

      return {
        assets,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: page,
          perPage: limit,
        },
      };
    }),

  /**
   * Get asset by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const asset = await ctx.prisma.asset.findUnique({
        where: { id: input.id },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          projects: {
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                  company: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          companies: {
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!asset) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Asset not found',
        });
      }

      return asset;
    }),

  /**
   * Update asset metadata
   * Requires ASSET_UPDATE permission
   */
  update: createPermissionProcedure(Permission.ASSET_UPDATE)
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const userId = ctx.session.user.id;

      // Check if user has permission to update
      const asset = await ctx.prisma.asset.findUnique({
        where: { id },
        include: {
          companies: {
            include: {
              company: {
                include: {
                  users: {
                    where: { userId },
                  },
                },
              },
            },
          },
        },
      });

      if (!asset) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Asset not found',
        });
      }

      const isOwner = asset.uploadedBy === userId;
      const isAdmin = ctx.session.user.role === 'ADMIN';
      const hasCompanyAccess = asset.companies.some(
        (ca) => ca.company.users.some((cu) => cu.canManageAssets)
      );

      if (!isOwner && !isAdmin && !hasCompanyAccess) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this asset',
        });
      }

      const updatedAsset = await ctx.prisma.asset.update({
        where: { id },
        data,
      });

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          action: 'ASSET_UPDATED',
          userId,
          performedBy: userId,
          details: {
            assetId: id,
            changes: data,
          },
        },
      });

      return { asset: updatedAsset };
    }),

  /**
   * Delete asset (soft delete)
   * Requires ASSET_DELETE permission
   */
  delete: createPermissionProcedure(Permission.ASSET_DELETE)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if user has permission to delete
      const asset = await ctx.prisma.asset.findUnique({
        where: { id: input.id },
        include: {
          companies: {
            include: {
              company: {
                include: {
                  users: {
                    where: { userId },
                  },
                },
              },
            },
          },
        },
      });

      if (!asset) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Asset not found',
        });
      }

      const isOwner = asset.uploadedBy === userId;
      const isAdmin = ctx.session.user.role === 'ADMIN';
      const hasCompanyAccess = asset.companies.some(
        (ca) => ca.company.users.some((cu) => cu.canManageAssets)
      );

      if (!isOwner && !isAdmin && !hasCompanyAccess) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this asset',
        });
      }

      await ctx.prisma.asset.update({
        where: { id: input.id },
        data: { isArchived: true },
      });

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          action: 'ASSET_DELETED',
          userId,
          performedBy: userId,
          details: {
            assetId: input.id,
            assetName: asset.name,
          },
        },
      });

      return { success: true };
    }),

  /**
   * Link asset to project
   */
  linkToProject: protectedProcedure
    .input(
      z.object({
        assetId: z.string(),
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify user has access to project
      const projectCollaborator = await ctx.prisma.projectCollaborator.findUnique({
        where: {
          projectId_userId: {
            projectId: input.projectId,
            userId,
          },
        },
      });

      if (!projectCollaborator && ctx.session.user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this project',
        });
      }

      // Check if already linked
      const existing = await ctx.prisma.projectAsset.findUnique({
        where: {
          projectId_assetId: {
            projectId: input.projectId,
            assetId: input.assetId,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Asset is already linked to this project',
        });
      }

      await ctx.prisma.projectAsset.create({
        data: {
          projectId: input.projectId,
          assetId: input.assetId,
          addedBy: userId,
        },
      });

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          action: 'ASSET_LINKED_TO_PROJECT',
          userId,
          performedBy: userId,
          details: {
            assetId: input.assetId,
            projectId: input.projectId,
          },
        },
      });

      return { success: true };
    }),

  /**
   * Unlink asset from project
   */
  unlinkFromProject: protectedProcedure
    .input(
      z.object({
        assetId: z.string(),
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify user has access to project
      const projectCollaborator = await ctx.prisma.projectCollaborator.findUnique({
        where: {
          projectId_userId: {
            projectId: input.projectId,
            userId,
          },
        },
      });

      if (!projectCollaborator && ctx.session.user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this project',
        });
      }

      await ctx.prisma.projectAsset.delete({
        where: {
          projectId_assetId: {
            projectId: input.projectId,
            assetId: input.assetId,
          },
        },
      });

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          action: 'ASSET_UNLINKED_FROM_PROJECT',
          userId,
          performedBy: userId,
          details: {
            assetId: input.assetId,
            projectId: input.projectId,
          },
        },
      });

      return { success: true };
    }),

  /**
   * Link asset to a company
   * Requires project access or admin role
   */
  linkToCompany: protectedProcedure
    .input(
      z.object({
        assetId: z.string(),
        companyId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify user has access to company
      const companyUser = await ctx.prisma.companyUser.findUnique({
        where: {
          companyId_userId: {
            companyId: input.companyId,
            userId,
          },
        },
      });

      if (!companyUser && ctx.session.user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this company',
        });
      }

      // Check if already linked
      const existing = await ctx.prisma.companyAsset.findUnique({
        where: {
          companyId_assetId: {
            companyId: input.companyId,
            assetId: input.assetId,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Asset is already linked to this company',
        });
      }

      await ctx.prisma.companyAsset.create({
        data: {
          companyId: input.companyId,
          assetId: input.assetId,
          addedBy: userId,
        },
      });

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          action: 'ASSET_LINKED_TO_COMPANY',
          userId,
          performedBy: userId,
          details: {
            assetId: input.assetId,
            companyId: input.companyId,
          },
        },
      });

      return { success: true };
    }),

  /**
   * Unlink asset from a company
   * Requires company access or admin role
   */
  unlinkFromCompany: protectedProcedure
    .input(
      z.object({
        assetId: z.string(),
        companyId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify user has access to company
      const companyUser = await ctx.prisma.companyUser.findUnique({
        where: {
          companyId_userId: {
            companyId: input.companyId,
            userId,
          },
        },
      });

      if (!companyUser && ctx.session.user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this company',
        });
      }

      await ctx.prisma.companyAsset.delete({
        where: {
          companyId_assetId: {
            companyId: input.companyId,
            assetId: input.assetId,
          },
        },
      });

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          action: 'ASSET_UNLINKED_FROM_COMPANY',
          userId,
          performedBy: userId,
          details: {
            assetId: input.assetId,
            companyId: input.companyId,
          },
        },
      });

      return { success: true };
    }),

  /**
   * Get stats for assets
   */
  getStorageStats: protectedProcedure.query(async ({ ctx }) => {
    // Calculate total storage used
    const assets = await ctx.prisma.asset.findMany({
      select: {
        fileSize: true,
        type: true,
      },
    });

    const totalBytes = assets.reduce((sum, asset) => sum + Number(asset.fileSize || 0), 0);
    const totalGB = totalBytes / (1024 * 1024 * 1024);

    // Calculate storage by type
    const storageByType: Record<string, number> = {
      IMAGE: 0,
      VIDEO: 0,
      DOCUMENT: 0,
      AUDIO: 0,
      MODEL_3D: 0,
      OTHER: 0,
    };

    assets.forEach((asset) => {
      const sizeGB = Number(asset.fileSize || 0) / (1024 * 1024 * 1024);
      if (storageByType[asset.type] !== undefined) {
        storageByType[asset.type] += sizeGB;
      }
    });

    return {
      totalBytes,
      totalGB: parseFloat(totalGB.toFixed(2)),
      totalMB: parseFloat((totalBytes / (1024 * 1024)).toFixed(2)),
      storageByType: {
        IMAGE: parseFloat(storageByType.IMAGE.toFixed(3)),
        VIDEO: parseFloat(storageByType.VIDEO.toFixed(3)),
        DOCUMENT: parseFloat(storageByType.DOCUMENT.toFixed(3)),
        AUDIO: parseFloat(storageByType.AUDIO.toFixed(3)),
        MODEL_3D: parseFloat(storageByType.MODEL_3D.toFixed(3)),
        OTHER: parseFloat(storageByType.OTHER.toFixed(3)),
      },
      assetCount: assets.length,
    };
  }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const isAdmin = ctx.session.user.role === 'ADMIN';

    // Build where clause for user's accessible assets
    const where: any = {};
    if (!isAdmin) {
      where.OR = [
        { uploadedBy: userId },
        {
          companies: {
            some: {
              company: {
                users: {
                  some: { userId },
                },
              },
            },
          },
        },
        {
          projects: {
            some: {
              project: {
                collaborators: {
                  some: { userId },
                },
              },
            },
          },
        },
      ];
    }

    const [total, byType] = await Promise.all([
      ctx.prisma.asset.count({ where }),
      ctx.prisma.asset.groupBy({
        by: ['type'],
        _count: true,
        where,
      }),
    ]);

    const typeDistribution = byType.reduce(
      (acc, item) => {
        acc[item.type] = item._count;
        return acc;
      },
      {} as Record<AssetType, number>
    );

    return {
      total,
      typeDistribution,
    };
  }),

  // =========================================================================
  // DAM SYSTEM ENHANCEMENTS
  // =========================================================================

  /**
   * Upload asset to S3 with automatic processing
   */
  uploadToS3: protectedProcedure
    .input(
      z.object({
        fileBuffer: z.string(), // Base64 encoded file
        filename: z.string(),
        mimeType: z.string(),
        name: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        visibility: z.nativeEnum(Visibility).default('INTERNAL'),
        usage: z.nativeEnum(UsageType).default('INTERNAL'),
        companyId: z.string().optional(),
        projectId: z.string().optional(),
        eventName: z.string().optional(),
        campaign: z.string().optional(),
        tagIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Decode base64 buffer
      const buffer = Buffer.from(input.fileBuffer, 'base64');

      // Upload to S3
      const uploadResult = await uploadFile({
        buffer,
        filename: input.filename,
        mimeType: input.mimeType,
        prefix: 'assets',
        metadata: {
          uploadedBy: userId,
          companyId: input.companyId || '',
          projectId: input.projectId || '',
        },
      });

      // Determine asset type
      const assetType = getFileType(input.mimeType) as AssetType;

      // Create asset record
      const asset = await ctx.prisma.asset.create({
        data: {
          name: input.name || input.filename,
          title: input.title,
          description: input.description,
          type: assetType,
          fileName: input.filename,
          originalName: input.filename,
          fileSize: BigInt(uploadResult.size),
          mimeType: input.mimeType,
          format: input.filename.split('.').pop()?.toLowerCase() || '',
          fileKey: uploadResult.fileKey,
          filePath: uploadResult.url,
          checksum: uploadResult.checksum,
          uploadStatus: UploadStatus.COMPLETED,
          processingStatus: ProcessingStatus.PENDING,
          category: input.category,
          visibility: input.visibility,
          usage: input.usage,
          eventName: input.eventName,
          campaign: input.campaign,
          company: input.companyId,
          project: input.projectId,
          uploadedBy: userId,
        },
      });

      // Link to company if provided
      if (input.companyId) {
        await ctx.prisma.companyAsset.create({
          data: {
            companyId: input.companyId,
            assetId: asset.id,
            addedBy: userId,
          },
        });
      }

      // Link to project if provided
      if (input.projectId) {
        await ctx.prisma.projectAsset.create({
          data: {
            projectId: input.projectId,
            assetId: asset.id,
            addedBy: userId,
          },
        });
      }

      // Add tags if provided
      if (input.tagIds && input.tagIds.length > 0) {
        await Promise.all(
          input.tagIds.map((tagId) =>
            ctx.prisma.assetTagRelation.create({
              data: {
                assetId: asset.id,
                tagId,
                addedBy: userId,
              },
            })
          )
        );
      }

      // Queue processing jobs
      const processingJob = {
        assetId: asset.id,
        fileKey: uploadResult.fileKey,
        fileType: assetType,
        mimeType: input.mimeType,
        originalFilename: input.filename,
      };

      await queueAssetProcessing(processingJob);

      // High priority thumbnail generation
      if (assetType === 'IMAGE' || assetType === 'VIDEO') {
        await queueThumbnailGeneration({
          ...processingJob,
          fileType: assetType as 'IMAGE' | 'VIDEO',
        });
      }

      // Queue variant generation for images
      if (assetType === 'IMAGE') {
        await queueVariantGeneration({
          ...processingJob,
          fileType: 'IMAGE' as const,
          variants: ['THUMBNAIL', 'PREVIEW', 'WEB_OPTIMIZED', 'MOBILE'],
        });
      }

      // Track upload activity
      await queueAnalytics({
        type: 'ASSET_VIEW',
        assetId: asset.id,
        userId,
        data: { action: 'upload' },
        timestamp: new Date(),
      });

      return { asset, uploadResult };
    }),

  /**
   * Get presigned download URL for asset
   */
  getDownloadUrl: protectedProcedure
    .input(
      z.object({
        assetId: z.string(),
        download: z.boolean().default(true),
        expiresIn: z.number().default(3600), // 1 hour
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const asset = await ctx.prisma.asset.findUnique({
        where: { id: input.assetId },
      });

      if (!asset) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Asset not found',
        });
      }

      // Check download permissions
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: { canDownloadDirectly: true, role: true },
      });

      // If user doesn't have direct download access, check for approved request
      if (!user?.canDownloadDirectly && user?.role !== 'ADMIN') {
        const approvedRequest = await ctx.prisma.downloadRequest.findFirst({
          where: {
            assetId: input.assetId,
            userId,
            status: 'APPROVED',
          },
        });

        if (!approvedRequest) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message:
              'You need to request download access for this asset. Your download request must be approved first.',
          });
        }
      }

      const url = await getPresignedUrl({
        fileKey: asset.fileKey!,
        expiresIn: input.expiresIn,
        download: input.download,
        filename: asset.originalName,
      });

      // Track download
      if (input.download) {
        await ctx.prisma.assetDownload.create({
          data: {
            assetId: asset.id,
            userId,
          },
        });

        // Increment download count
        await ctx.prisma.asset.update({
          where: { id: asset.id },
          data: {
            downloadCount: { increment: 1 },
          },
        });

        // Queue analytics
        await queueAnalytics({
          type: 'ASSET_DOWNLOAD',
          assetId: asset.id,
          userId,
          data: {},
          timestamp: new Date(),
        });
      }

      return { url };
    }),

  /**
   * Advanced search with filters
   */
  advancedSearch: protectedProcedure
    .input(
      z.object({
        query: z.string().optional(),
        type: z.nativeEnum(AssetType).optional(),
        category: z.string().optional(),
        visibility: z.nativeEnum(Visibility).optional(),
        usage: z.nativeEnum(UsageType).optional(),
        tagIds: z.array(z.string()).optional(),
        eventName: z.string().optional(),
        campaign: z.string().optional(),
        uploadedAfter: z.date().optional(),
        uploadedBefore: z.date().optional(),
        minFileSize: z.number().optional(),
        maxFileSize: z.number().optional(),
        companyId: z.string().optional(),
        projectId: z.string().optional(),
        favoritesOnly: z.boolean().optional(),
        readyForPublishing: z.boolean().optional(),
        isArchived: z.boolean().optional(),
        sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'fileSize', 'viewCount', 'downloadCount']).default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const isAdmin = ctx.session.user.role === 'ADMIN';
      const skip = (input.page - 1) * input.limit;

      const where: any = {
        isArchived: input.isArchived ?? false,
      };

      // Full-text search
      if (input.query) {
        where.OR = [
          { name: { contains: input.query, mode: 'insensitive' } },
          { title: { contains: input.query, mode: 'insensitive' } },
          { description: { contains: input.query, mode: 'insensitive' } },
        ];
      }

      // Filters
      if (input.type) where.type = input.type;
      if (input.category) where.category = input.category;
      if (input.visibility) where.visibility = input.visibility;
      if (input.usage) where.usage = input.usage;
      if (input.eventName) where.eventName = input.eventName;
      if (input.campaign) where.campaign = input.campaign;
      if (input.readyForPublishing !== undefined) {
        where.readyForPublishing = input.readyForPublishing;
      }

      // Date range
      if (input.uploadedAfter || input.uploadedBefore) {
        where.createdAt = {};
        if (input.uploadedAfter) where.createdAt.gte = input.uploadedAfter;
        if (input.uploadedBefore) where.createdAt.lte = input.uploadedBefore;
      }

      // File size range
      if (input.minFileSize || input.maxFileSize) {
        where.fileSize = {};
        if (input.minFileSize) where.fileSize.gte = input.minFileSize;
        if (input.maxFileSize) where.fileSize.lte = input.maxFileSize;
      }

      // Tag filtering
      if (input.tagIds && input.tagIds.length > 0) {
        where.tagRelations = {
          some: {
            tagId: { in: input.tagIds },
          },
        };
      }

      // Company filter
      if (input.companyId) {
        where.companies = {
          some: { companyId: input.companyId },
        };
      }

      // Project filter
      if (input.projectId) {
        where.projects = {
          some: { projectId: input.projectId },
        };
      }

      // Favorites filter
      if (input.favoritesOnly) {
        where.favorites = {
          some: { userId },
        };
      }

      // IMPORTANT: Non-admin users can only see assets from their companies or projects
      // This ensures clients only see assets they have access to
      if (!isAdmin) {
        const accessConditions: any[] = [
          // Assets uploaded by user
          { uploadedBy: userId },
          // Assets in user's companies
          {
            companies: {
              some: {
                company: {
                  users: {
                    some: { userId },
                  },
                },
              },
            },
          },
          // Assets in user's projects
          {
            projects: {
              some: {
                project: {
                  collaborators: {
                    some: { userId },
                  },
                },
              },
            },
          },
        ];

        // Combine with existing OR conditions if they exist
        if (where.OR) {
          // If there's already an OR from search, we need to AND it with access control
          where.AND = [
            { OR: where.OR },
            { OR: accessConditions },
          ];
          delete where.OR;
        } else {
          where.OR = accessConditions;
        }
      }

      const [assets, total] = await Promise.all([
        ctx.prisma.asset.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { [input.sortBy]: input.sortOrder },
          include: {
            uploader: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            tagRelations: {
              include: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    color: true,
                    category: true,
                  },
                },
              },
            },
            variants: {
              select: {
                id: true,
                variantType: true,
                fileKey: true,
                width: true,
                height: true,
                fileSize: true,
              },
            },
            favorites: {
              where: { userId },
              select: { userId: true },
            },
            _count: {
              select: {
                collections: true,
                downloads: true,
                reviews: true,
              },
            },
          },
        }),
        ctx.prisma.asset.count({ where }),
      ]);

      // Track search
      if (input.query) {
        await ctx.prisma.searchHistory.create({
          data: {
            userId,
            query: input.query,
            filters: input,
            resultCount: total,
          },
        });
      }

      return {
        assets: assets.map((asset) => ({
          ...asset,
          isFavorite: asset.favorites.length > 0,
          tags: asset.tagRelations.map((tr) => tr.tag),
        })),
        pagination: {
          total,
          pages: Math.ceil(total / input.limit),
          currentPage: input.page,
          perPage: input.limit,
        },
      };
    }),

  /**
   * Add asset to favorites
   */
  addToFavorites: protectedProcedure
    .input(z.object({ assetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await ctx.prisma.assetFavorite.create({
        data: {
          userId,
          assetId: input.assetId,
        },
      });

      return { success: true };
    }),

  /**
   * Remove asset from favorites
   */
  removeFromFavorites: protectedProcedure
    .input(z.object({ assetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await ctx.prisma.assetFavorite.delete({
        where: {
          userId_assetId: {
            userId,
            assetId: input.assetId,
          },
        },
      });

      return { success: true };
    }),

  /**
   * Get user's favorite assets
   */
  getFavorites: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const skip = (input.page - 1) * input.limit;

      const [favorites, total] = await Promise.all([
        ctx.prisma.assetFavorite.findMany({
          where: { userId },
          skip,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
          include: {
            asset: {
              include: {
                uploader: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                tagRelations: {
                  include: {
                    tag: true,
                  },
                },
              },
            },
          },
        }),
        ctx.prisma.assetFavorite.count({ where: { userId } }),
      ]);

      return {
        assets: favorites.map((f) => f.asset),
        pagination: {
          total,
          pages: Math.ceil(total / input.limit),
          currentPage: input.page,
          perPage: input.limit,
        },
      };
    }),

  /**
   * Add tags to asset
   */
  addTags: protectedProcedure
    .input(
      z.object({
        assetId: z.string(),
        tagIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await Promise.all(
        input.tagIds.map((tagId) =>
          ctx.prisma.assetTagRelation.create({
            data: {
              assetId: input.assetId,
              tagId,
              addedBy: userId,
            },
          })
        )
      );

      // Update tag usage counts
      await Promise.all(
        input.tagIds.map((tagId) =>
          ctx.prisma.tag.update({
            where: { id: tagId },
            data: { usageCount: { increment: 1 } },
          })
        )
      );

      return { success: true };
    }),

  /**
   * Remove tags from asset
   */
  removeTags: protectedProcedure
    .input(
      z.object({
        assetId: z.string(),
        tagIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await Promise.all(
        input.tagIds.map((tagId) =>
          ctx.prisma.assetTagRelation.delete({
            where: {
              assetId_tagId: {
                assetId: input.assetId,
                tagId,
              },
            },
          })
        )
      );

      // Update tag usage counts
      await Promise.all(
        input.tagIds.map((tagId) =>
          ctx.prisma.tag.update({
            where: { id: tagId },
            data: { usageCount: { decrement: 1 } },
          })
        )
      );

      return { success: true };
    }),

  /**
   * Archive asset
   */
  archive: protectedProcedure
    .input(z.object({ assetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.asset.update({
        where: { id: input.assetId },
        data: { isArchived: true },
      });

      return { success: true };
    }),

  /**
   * Unarchive asset
   */
  unarchive: protectedProcedure
    .input(z.object({ assetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.asset.update({
        where: { id: input.assetId },
        data: { isArchived: false },
      });

      return { success: true };
    }),

  /**
   * Track asset view
   */
  trackView: protectedProcedure
    .input(z.object({ assetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Increment view count
      await ctx.prisma.asset.update({
        where: { id: input.assetId },
        data: {
          viewCount: { increment: 1 },
        },
      });

      // Queue analytics
      await queueAnalytics({
        type: 'ASSET_VIEW',
        assetId: input.assetId,
        userId,
        data: {},
        timestamp: new Date(),
      });

      return { success: true };
    }),

  /**
   * Get asset variants (thumbnails, previews, etc.)
   */
  getVariants: protectedProcedure
    .input(z.object({ assetId: z.string() }))
    .query(async ({ ctx, input }) => {
      const variants = await ctx.prisma.assetVariant.findMany({
        where: { assetId: input.assetId },
        orderBy: { createdAt: 'desc' },
      });

      // Generate presigned URLs for each variant
      const variantsWithUrls = await Promise.all(
        variants.map(async (variant) => ({
          ...variant,
          url: await getPresignedUrl({
            fileKey: variant.fileKey,
            expiresIn: 3600,
          }),
        }))
      );

      return { variants: variantsWithUrls };
    }),

  /**
   * Batch delete assets
   */
  batchDelete: protectedProcedure
    .input(z.object({ assetIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get assets to delete (with permission check)
      const assets = await ctx.prisma.asset.findMany({
        where: {
          id: { in: input.assetIds },
          uploadedBy: userId, // Only allow deleting own assets
        },
        select: {
          id: true,
          fileKey: true,
        },
      });

      if (assets.length === 0) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No assets found or insufficient permissions',
        });
      }

      // Soft delete in database
      await ctx.prisma.asset.updateMany({
        where: {
          id: { in: assets.map((a) => a.id) },
        },
        data: {
          isArchived: true,
        },
      });

      // Optionally delete from S3 (uncomment if hard delete is needed)
      // await Promise.all(
      //   assets.map((asset) => deleteFile(asset.fileKey!))
      // );

      return {
        success: true,
        deletedCount: assets.length,
      };
    }),

  /**
   * Get assets by project with full details
   */
  getByProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const projectAssets = await ctx.prisma.projectAsset.findMany({
        where: { projectId: input.projectId },
        include: {
          asset: {
            include: {
              uploader: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              tagRelations: {
                include: {
                  tag: true,
                },
              },
              variants: true,
            },
          },
        },
        orderBy: { addedAt: 'desc' },
      });

      // Import storage detection
      const { isS3Available } = await import('@/lib/s3');

      // Generate URLs and transform assets for frontend
      const assetsWithUrls = projectAssets.map((pa) => {
        const asset = pa.asset;

        // Generate URL based on storage backend
        let url: string;

        if (isS3Available) {
          // S3 Storage - generate S3 URL
          const cdnUrl = process.env.AWS_CLOUDFRONT_URL;
          const bucketName = process.env.AWS_S3_BUCKET || 'kayanlive-assets';
          const region = process.env.AWS_REGION || 'us-east-1';

          if (cdnUrl) {
            // Use CloudFront CDN if available
            url = asset.fileKey
              ? `${cdnUrl}/${asset.fileKey}`
              : asset.filePath
                ? `${cdnUrl}/${asset.filePath}`
                : '';
          } else {
            // Use direct S3 URL
            url = asset.fileKey
              ? `https://${bucketName}.s3.${region}.amazonaws.com/${asset.fileKey}`
              : asset.filePath
                ? `https://${bucketName}.s3.${region}.amazonaws.com/${asset.filePath}`
                : '';
          }
        } else {
          // Local Storage - generate local API URL
          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
          url = asset.fileKey
            ? `${baseUrl}/api/files/${asset.fileKey}`
            : asset.filePath
              ? `${baseUrl}/api/files/${asset.filePath}`
              : '';
        }

        return {
          ...asset,
          filename: asset.fileName,
          url,
          uploadedAt: asset.createdAt,
          fileSize: Number(asset.fileSize),
        };
      });

      return {
        assets: assetsWithUrls,
      };
    }),
});
