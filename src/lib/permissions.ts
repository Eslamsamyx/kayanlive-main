/**
 * Permission System
 * Granular permission-based access control
 */

import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// =============================================================================
// PERMISSION ENUM
// =============================================================================

export enum Permission {
  // Project Management (5)
  PROJECT_CREATE = 'project:create',
  PROJECT_READ = 'project:read',
  PROJECT_UPDATE = 'project:update',
  PROJECT_DELETE = 'project:delete',
  PROJECT_MANAGE_MEMBERS = 'project:manage_members',

  // Task Management (5)
  TASK_CREATE = 'task:create',
  TASK_READ = 'task:read',
  TASK_UPDATE = 'task:update',
  TASK_DELETE = 'task:delete',
  TASK_ASSIGN = 'task:assign',

  // Asset Management (6)
  ASSET_CREATE = 'asset:create',
  ASSET_READ = 'asset:read',
  ASSET_UPDATE = 'asset:update',
  ASSET_DELETE = 'asset:delete',
  ASSET_REQUEST_DOWNLOAD = 'asset:request_download',
  ASSET_APPROVE_DOWNLOAD = 'asset:approve_download',

  // Comment System (3)
  COMMENT_CREATE = 'comment:create',
  COMMENT_READ = 'comment:read',
  COMMENT_DELETE = 'comment:delete',

  // User Management (3)
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_UPDATE_PERMISSIONS = 'user:update_permissions',

  // Admin Operations (6)
  ADMIN_FULL_ACCESS = 'admin:full_access',
  ADMIN_VIEW_AUDIT_LOGS = 'admin:view_audit_logs',
  ADMIN_MANAGE_ROLES = 'admin:manage_roles',
  ADMIN_MANAGE_COMPANIES = 'admin:manage_companies',
  ADMIN_VIEW_ANALYTICS = 'admin:view_analytics',
  ADMIN_SYSTEM_SETTINGS = 'admin:system_settings',

  // Translation Management (5)
  TRANSLATION_CREATE = 'translation:create',
  TRANSLATION_READ = 'translation:read',
  TRANSLATION_UPDATE = 'translation:update',
  TRANSLATION_REQUEST = 'translation:request',
  TRANSLATION_ASSIGN = 'translation:assign',
}

// =============================================================================
// PERMISSION CATEGORIES
// =============================================================================

export interface PermissionCategory {
  name: string;
  description: string;
  permissions: Permission[];
}

export const PERMISSION_CATEGORIES: Record<string, PermissionCategory> = {
  PROJECT: {
    name: 'Project Management',
    description: 'Create, edit, and manage projects',
    permissions: [
      Permission.PROJECT_CREATE,
      Permission.PROJECT_READ,
      Permission.PROJECT_UPDATE,
      Permission.PROJECT_DELETE,
      Permission.PROJECT_MANAGE_MEMBERS,
    ],
  },
  TASK: {
    name: 'Task Management',
    description: 'Create and manage tasks',
    permissions: [
      Permission.TASK_CREATE,
      Permission.TASK_READ,
      Permission.TASK_UPDATE,
      Permission.TASK_DELETE,
      Permission.TASK_ASSIGN,
    ],
  },
  ASSET: {
    name: 'Asset Management',
    description: 'Upload, manage, and download assets',
    permissions: [
      Permission.ASSET_CREATE,
      Permission.ASSET_READ,
      Permission.ASSET_UPDATE,
      Permission.ASSET_DELETE,
      Permission.ASSET_REQUEST_DOWNLOAD,
      Permission.ASSET_APPROVE_DOWNLOAD,
    ],
  },
  COMMENT: {
    name: 'Comments & Feedback',
    description: 'Comment on projects and tasks',
    permissions: [
      Permission.COMMENT_CREATE,
      Permission.COMMENT_READ,
      Permission.COMMENT_DELETE,
    ],
  },
  USER: {
    name: 'User Management',
    description: 'View and manage users',
    permissions: [
      Permission.USER_READ,
      Permission.USER_UPDATE,
      Permission.USER_UPDATE_PERMISSIONS,
    ],
  },
  ADMIN: {
    name: 'Administration',
    description: 'System-wide administrative access',
    permissions: [
      Permission.ADMIN_FULL_ACCESS,
      Permission.ADMIN_VIEW_AUDIT_LOGS,
      Permission.ADMIN_MANAGE_ROLES,
      Permission.ADMIN_MANAGE_COMPANIES,
      Permission.ADMIN_VIEW_ANALYTICS,
      Permission.ADMIN_SYSTEM_SETTINGS,
    ],
  },
};

// =============================================================================
// DEFAULT ROLE PERMISSIONS
// =============================================================================

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // ADMIN: Full access to everything
  ADMIN: Object.values(Permission),

  // MODERATOR: Project management, asset approval, user management (limited)
  MODERATOR: [
    // Project & Task Management
    Permission.PROJECT_READ,
    Permission.PROJECT_UPDATE,
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_ASSIGN,

    // Asset Management
    Permission.ASSET_READ,
    Permission.ASSET_UPDATE,
    Permission.ASSET_APPROVE_DOWNLOAD,

    // Comments
    Permission.COMMENT_CREATE,
    Permission.COMMENT_READ,
    Permission.COMMENT_DELETE,

    // User Management (limited)
    Permission.USER_READ,
    Permission.USER_UPDATE,
  ],

  // CONTENT_CREATOR: Create and manage assets, read projects/tasks
  CONTENT_CREATOR: [
    // Project & Task (read only)
    Permission.PROJECT_READ,
    Permission.TASK_READ,

    // Asset Management (full)
    Permission.ASSET_CREATE,
    Permission.ASSET_READ,
    Permission.ASSET_UPDATE,
    Permission.ASSET_DELETE,
    Permission.ASSET_REQUEST_DOWNLOAD,

    // Comments
    Permission.COMMENT_CREATE,
    Permission.COMMENT_READ,
  ],

  // CLIENT: View projects, tasks, and assets; request downloads
  CLIENT: [
    // Project & Task (read only)
    Permission.PROJECT_READ,
    Permission.TASK_READ,

    // Asset (view and request)
    Permission.ASSET_READ,
    Permission.ASSET_REQUEST_DOWNLOAD,

    // Comments
    Permission.COMMENT_CREATE,
    Permission.COMMENT_READ,
  ],

  // Creative Roles: Start with CONTENT_CREATOR base, add role-specific permissions

  // ART_DIRECTOR: CONTENT_CREATOR + project management
  ART_DIRECTOR: [
    Permission.PROJECT_READ,
    Permission.TASK_READ,
    Permission.ASSET_CREATE,
    Permission.ASSET_READ,
    Permission.ASSET_UPDATE,
    Permission.ASSET_DELETE,
    Permission.ASSET_REQUEST_DOWNLOAD,
    Permission.COMMENT_CREATE,
    Permission.COMMENT_READ,
    // Additional permissions for Art Director
    Permission.PROJECT_UPDATE,
    Permission.TASK_CREATE,
    Permission.TASK_ASSIGN,
  ],

  // DESIGNER: Same as CONTENT_CREATOR
  DESIGNER: [
    Permission.PROJECT_READ,
    Permission.TASK_READ,
    Permission.ASSET_CREATE,
    Permission.ASSET_READ,
    Permission.ASSET_UPDATE,
    Permission.ASSET_DELETE,
    Permission.ASSET_REQUEST_DOWNLOAD,
    Permission.COMMENT_CREATE,
    Permission.COMMENT_READ,
  ],

  // VIDEO_EDITOR: Same as CONTENT_CREATOR
  VIDEO_EDITOR: [
    Permission.PROJECT_READ,
    Permission.TASK_READ,
    Permission.ASSET_CREATE,
    Permission.ASSET_READ,
    Permission.ASSET_UPDATE,
    Permission.ASSET_DELETE,
    Permission.ASSET_REQUEST_DOWNLOAD,
    Permission.COMMENT_CREATE,
    Permission.COMMENT_READ,
  ],

  // 3D/2D DESIGNERS: Same as CONTENT_CREATOR
  DESIGNER_3D: [
    Permission.PROJECT_READ,
    Permission.TASK_READ,
    Permission.ASSET_CREATE,
    Permission.ASSET_READ,
    Permission.ASSET_UPDATE,
    Permission.ASSET_DELETE,
    Permission.ASSET_REQUEST_DOWNLOAD,
    Permission.COMMENT_CREATE,
    Permission.COMMENT_READ,
  ],

  DESIGNER_2D: [
    Permission.PROJECT_READ,
    Permission.TASK_READ,
    Permission.ASSET_CREATE,
    Permission.ASSET_READ,
    Permission.ASSET_UPDATE,
    Permission.ASSET_DELETE,
    Permission.ASSET_REQUEST_DOWNLOAD,
    Permission.COMMENT_CREATE,
    Permission.COMMENT_READ,
  ],

  // VFX_CGI: Same as CONTENT_CREATOR
  VFX_CGI: [
    Permission.PROJECT_READ,
    Permission.TASK_READ,
    Permission.ASSET_CREATE,
    Permission.ASSET_READ,
    Permission.ASSET_UPDATE,
    Permission.ASSET_DELETE,
    Permission.ASSET_REQUEST_DOWNLOAD,
    Permission.COMMENT_CREATE,
    Permission.COMMENT_READ,
  ],

  // MOTION_GRAPHICS: Same as CONTENT_CREATOR
  MOTION_GRAPHICS: [
    Permission.PROJECT_READ,
    Permission.TASK_READ,
    Permission.ASSET_CREATE,
    Permission.ASSET_READ,
    Permission.ASSET_UPDATE,
    Permission.ASSET_DELETE,
    Permission.ASSET_REQUEST_DOWNLOAD,
    Permission.COMMENT_CREATE,
    Permission.COMMENT_READ,
  ],

  // WEB_DEVELOPER: Same as CONTENT_CREATOR
  WEB_DEVELOPER: [
    Permission.PROJECT_READ,
    Permission.TASK_READ,
    Permission.ASSET_CREATE,
    Permission.ASSET_READ,
    Permission.ASSET_UPDATE,
    Permission.ASSET_DELETE,
    Permission.ASSET_REQUEST_DOWNLOAD,
    Permission.COMMENT_CREATE,
    Permission.COMMENT_READ,
  ],

  // UI_UX_DESIGNER: Same as CONTENT_CREATOR
  UI_UX_DESIGNER: [
    Permission.PROJECT_READ,
    Permission.TASK_READ,
    Permission.ASSET_CREATE,
    Permission.ASSET_READ,
    Permission.ASSET_UPDATE,
    Permission.ASSET_DELETE,
    Permission.ASSET_REQUEST_DOWNLOAD,
    Permission.COMMENT_CREATE,
    Permission.COMMENT_READ,
  ],

  // ANIMATOR: Same as CONTENT_CREATOR
  ANIMATOR: [
    Permission.PROJECT_READ,
    Permission.TASK_READ,
    Permission.ASSET_CREATE,
    Permission.ASSET_READ,
    Permission.ASSET_UPDATE,
    Permission.ASSET_DELETE,
    Permission.ASSET_REQUEST_DOWNLOAD,
    Permission.COMMENT_CREATE,
    Permission.COMMENT_READ,
  ],

  // PROJECT_MANAGER: PROJECT_MANAGER + task management
  PROJECT_MANAGER: [
    Permission.PROJECT_CREATE,
    Permission.PROJECT_READ,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_MANAGE_MEMBERS,
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    Permission.TASK_ASSIGN,
    Permission.ASSET_READ,
    Permission.ASSET_REQUEST_DOWNLOAD,
    Permission.COMMENT_CREATE,
    Permission.COMMENT_READ,
    Permission.COMMENT_DELETE,
  ],

  // TRANSLATOR: Translation management only
  TRANSLATOR: [
    // Translation Management (full)
    Permission.TRANSLATION_CREATE,
    Permission.TRANSLATION_READ,
    Permission.TRANSLATION_UPDATE,
    Permission.TRANSLATION_REQUEST,

    // Comments (to provide feedback)
    Permission.COMMENT_CREATE,
    Permission.COMMENT_READ,
  ],
};

// =============================================================================
// PERMISSION CHECKER
// =============================================================================

export class PermissionChecker {
  constructor(private db: typeof prisma) {}

  /**
   * Check if user has a specific permission
   * Considers: role default permissions + additional permissions
   */
  async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { role: true, additionalPermissions: true },
    });

    if (!user) return false;

    // Get role template permissions (if customized)
    const roleTemplate = await this.db.roleTemplate.findUnique({
      where: { role: user.role },
    });

    const rolePermissions =
      roleTemplate?.permissions || DEFAULT_ROLE_PERMISSIONS[user.role] || [];

    // Check if permission exists in role or additional permissions
    return (
      rolePermissions.includes(permission) ||
      user.additionalPermissions.includes(permission)
    );
  }

  /**
   * Check if user has ALL of the specified permissions
   */
  async hasAllPermissions(
    userId: string,
    permissions: Permission[]
  ): Promise<boolean> {
    for (const permission of permissions) {
      if (!(await this.hasPermission(userId, permission))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if user has ANY of the specified permissions
   */
  async hasAnyPermission(
    userId: string,
    permissions: Permission[]
  ): Promise<boolean> {
    for (const permission of permissions) {
      if (await this.hasPermission(userId, permission)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { role: true, additionalPermissions: true },
    });

    if (!user) return [];

    const roleTemplate = await this.db.roleTemplate.findUnique({
      where: { role: user.role },
    });

    const rolePermissions =
      roleTemplate?.permissions || DEFAULT_ROLE_PERMISSIONS[user.role] || [];

    // Merge and deduplicate
    return Array.from(
      new Set([...rolePermissions, ...user.additionalPermissions])
    ) as Permission[];
  }

  /**
   * Check if user has a specific role
   */
  async hasRole(userId: string, role: UserRole): Promise<boolean> {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    return user?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  async hasAnyRole(userId: string, roles: UserRole[]): Promise<boolean> {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    return user ? roles.includes(user.role) : false;
  }
}

// =============================================================================
// AUDIT LOG ACTIONS
// =============================================================================

export const AUDIT_ACTIONS = {
  // User Management
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  USER_PERMISSIONS_UPDATED: 'USER_PERMISSIONS_UPDATED',
  USER_DOWNLOAD_ACCESS_CHANGED: 'USER_DOWNLOAD_ACCESS_CHANGED',
  USER_ACTIVATED: 'USER_ACTIVATED',
  USER_DEACTIVATED: 'USER_DEACTIVATED',
  USER_LOGIN: 'LOGIN_ATTEMPT',
  USER_LOGOUT: 'USER_LOGOUT',

  // Role Management
  ROLE_TEMPLATE_CREATED: 'ROLE_TEMPLATE_CREATED',
  ROLE_TEMPLATE_UPDATED: 'ROLE_TEMPLATE_UPDATED',
  ROLE_TEMPLATE_DELETED: 'ROLE_TEMPLATE_DELETED',
  ROLE_CHANGED: 'ROLE_CHANGED',

  // Project Management
  PROJECT_CREATED: 'PROJECT_CREATED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  PROJECT_DELETED: 'PROJECT_DELETED',
  PROJECT_COLLABORATOR_ADDED: 'PROJECT_COLLABORATOR_ADDED',
  PROJECT_COLLABORATOR_REMOVED: 'PROJECT_COLLABORATOR_REMOVED',
  PROJECT_COLLABORATOR_UPDATED: 'PROJECT_COLLABORATOR_UPDATED',

  // Invitation System
  INVITATION_SENT: 'INVITATION_SENT',
  INVITATION_ACCEPTED: 'INVITATION_ACCEPTED',
  INVITATION_EXPIRED: 'INVITATION_EXPIRED',
  INVITATION_CANCELLED: 'INVITATION_CANCELLED',

  // Asset Management
  ASSET_UPLOADED: 'ASSET_UPLOADED',
  ASSET_UPDATED: 'ASSET_UPDATED',
  ASSET_DELETED: 'ASSET_DELETED',
  ASSET_DOWNLOADED: 'ASSET_DOWNLOADED',
  ASSET_SHARED: 'ASSET_SHARED',

  // Download Requests
  DOWNLOAD_REQUEST_APPROVED: 'DOWNLOAD_REQUEST_APPROVED',
  DOWNLOAD_REQUEST_REJECTED: 'DOWNLOAD_REQUEST_REJECTED',

  // Company Management
  COMPANY_CREATED: 'COMPANY_CREATED',
  COMPANY_UPDATED: 'COMPANY_UPDATED',
  COMPANY_DELETED: 'COMPANY_DELETED',
  COMPANY_USER_ADDED: 'COMPANY_USER_ADDED',
  COMPANY_USER_REMOVED: 'COMPANY_USER_REMOVED',
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get role category for UI grouping
 */
export function getRoleCategory(role: UserRole): string {
  const categories: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Management',
    [UserRole.PROJECT_MANAGER]: 'Management',
    [UserRole.MODERATOR]: 'Management',
    [UserRole.ART_DIRECTOR]: 'Creative Leadership',
    [UserRole.DESIGNER]: 'Creative',
    [UserRole.VIDEO_EDITOR]: 'Post-Production',
    [UserRole.DESIGNER_3D]: '3D & VFX',
    [UserRole.DESIGNER_2D]: 'Design',
    [UserRole.VFX_CGI]: '3D & VFX',
    [UserRole.MOTION_GRAPHICS]: 'Motion & Animation',
    [UserRole.WEB_DEVELOPER]: 'Technical',
    [UserRole.UI_UX_DESIGNER]: 'Design',
    [UserRole.ANIMATOR]: 'Motion & Animation',
    [UserRole.CLIENT]: 'External',
    [UserRole.CONTENT_CREATOR]: 'Content',
    [UserRole.TRANSLATOR]: 'Content',
  };

  return categories[role] || 'General';
}

/**
 * Get role description for UI
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Full system administration access with all permissions',
    [UserRole.PROJECT_MANAGER]:
      'Manages projects, timelines, and team coordination',
    [UserRole.MODERATOR]:
      'Moderates content, approves downloads, and manages users',
    [UserRole.ART_DIRECTOR]: 'Leads creative direction and visual strategy',
    [UserRole.DESIGNER]: 'Creates visual designs and graphics',
    [UserRole.VIDEO_EDITOR]: 'Edits and produces video content',
    [UserRole.DESIGNER_3D]: 'Creates 3D models, scenes, and assets',
    [UserRole.DESIGNER_2D]: 'Specializes in 2D graphics and illustrations',
    [UserRole.VFX_CGI]: 'Creates visual effects and CGI elements',
    [UserRole.MOTION_GRAPHICS]: 'Designs animated graphics and motion content',
    [UserRole.WEB_DEVELOPER]: 'Develops and maintains web applications',
    [UserRole.UI_UX_DESIGNER]: 'Designs user interfaces and user experiences',
    [UserRole.ANIMATOR]: 'Creates character and object animations',
    [UserRole.CLIENT]: 'External client with limited viewing access',
    [UserRole.CONTENT_CREATOR]: 'Creates and manages digital content',
    [UserRole.TRANSLATOR]: 'Translates content into multiple languages',
  };

  return descriptions[role] || 'Standard user role';
}

/**
 * Check if user can manage another user (for permission updates)
 */
export function canManageUserByRole(
  currentUserRole: UserRole,
  targetUserRole: UserRole
): boolean {
  // ADMIN can manage everyone
  if (currentUserRole === UserRole.ADMIN) return true;

  // MODERATOR can manage everyone except ADMIN
  if (
    currentUserRole === UserRole.MODERATOR &&
    targetUserRole !== UserRole.ADMIN
  ) {
    return true;
  }

  return false;
}
