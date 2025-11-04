'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { UserRole } from '@prisma/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Users,
  Settings,
  Search,
  Filter,
  Edit3,
  Check,
  X,
  AlertTriangle,
  Loader2,
  Key,
  Lock,
  Download,
  Save,
  RotateCcw,
} from 'lucide-react';
import { Permission, PERMISSION_CATEGORIES, DEFAULT_ROLE_PERMISSIONS } from '@/lib/permissions';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type TabMode = 'users' | 'roles';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export default function PermissionsPage() {
  const [activeTab, setActiveTab] = useState<TabMode>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: session } = useSession();
  const router = useRouter();

  // Check if user is admin
  if (session?.user?.role !== 'ADMIN') {
    router.push('/admin/dashboard');
    return null;
  }

  const showToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // Queries
  const { data: usersData, refetch: refetchUsers } = api.user.getAll.useQuery({
    search: searchTerm || undefined,
    role: roleFilter === 'ALL' ? undefined : roleFilter,
    page: currentPage,
    limit: 20,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const { data: userPermissions, refetch: refetchUserPermissions } =
    api.admin.getUserPermissions.useQuery(
      { userId: selectedUserId! },
      { enabled: !!selectedUserId }
    );

  const { data: roleTemplates, refetch: refetchRoleTemplates } =
    api.admin.getAllRoleTemplates.useQuery(undefined, {
      enabled: activeTab === 'roles',
    });

  const { data: selectedRoleTemplate, refetch: refetchSelectedRoleTemplate } =
    api.admin.getRoleTemplate.useQuery(
      { role: selectedRole! },
      { enabled: !!selectedRole }
    );

  // Mutations
  const updatePermissionsMutation = api.admin.updateUserPermissions.useMutation({
    onSuccess: () => {
      showToast('User permissions updated successfully', 'success');
      refetchUsers();
      refetchUserPermissions();
    },
    onError: (error) => {
      showToast(error.message || 'Failed to update permissions', 'error');
    },
  });

  const toggleDownloadMutation = api.admin.toggleDownloadAccess.useMutation({
    onSuccess: () => {
      showToast('Download access updated successfully', 'success');
      refetchUsers();
    },
    onError: (error) => {
      showToast(error.message || 'Failed to update download access', 'error');
    },
  });

  const upsertRoleTemplateMutation = api.admin.upsertRoleTemplate.useMutation({
    onSuccess: () => {
      showToast('Role template updated successfully', 'success');
      refetchRoleTemplates();
      refetchSelectedRoleTemplate();
    },
    onError: (error) => {
      showToast(error.message || 'Failed to update role template', 'error');
    },
  });

  const deleteRoleTemplateMutation = api.admin.deleteRoleTemplate.useMutation({
    onSuccess: () => {
      showToast('Role template reset to defaults', 'success');
      refetchRoleTemplates();
      setSelectedRole(null);
    },
    onError: (error) => {
      showToast(error.message || 'Failed to reset role template', 'error');
    },
  });

  return (
    <div className="space-y-8">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
                toast.type === 'success'
                  ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                  : toast.type === 'error'
                    ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                    : toast.type === 'warning'
                      ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400'
                      : 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
              }`}
            >
              {toast.type === 'success' && <Check className="w-5 h-5" />}
              {toast.type === 'error' && <X className="w-5 h-5" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
              <span className="text-sm font-medium">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1
          className="text-4xl md:text-6xl font-normal mb-4 capitalize"
          style={{
            background: 'linear-gradient(90deg, #b8a4ff 0%, #7afdd6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: '"Poppins", sans-serif',
            lineHeight: '1.1'
          }}
        >
          Permission Management
        </h1>
        <p className="text-[#888888] text-lg">Manage user permissions and role templates across the system</p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex gap-3 mb-6"
      >
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b]'
              : 'bg-white/10 text-[#888888] hover:bg-white/20 hover:text-white'
          }`}
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          <Users className="w-5 h-5" />
          User Permissions
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'roles'
              ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b]'
              : 'bg-white/10 text-[#888888] hover:bg-white/20 hover:text-white'
          }`}
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          <Settings className="w-5 h-5" />
          Role Templates
        </button>
      </motion.div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:border-transparent transition-all duration-300"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:border-transparent transition-all duration-300"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              <option value="ALL">All Roles</option>
              {Object.values(UserRole).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Users List */}
          <div className="grid gap-4">
            {usersData?.users.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[25px] p-6 hover:border-[#7afdd6]/50 transition-all duration-300 cursor-pointer"
                style={{
                  background: 'rgba(255, 255, 255, 0.01)',
                  backdropFilter: 'blur(50.5px)',
                  WebkitBackdropFilter: 'blur(50.5px)',
                  border: '2px solid rgba(122, 253, 214, 0.3)'
                }}
                onClick={() => setSelectedUserId(user.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                        {user.name || 'Unknown User'}
                      </h3>
                      <span className="px-3 py-1 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] text-xs font-medium rounded-full" style={{ fontFamily: '"Poppins", sans-serif' }}>
                        {user.role}
                      </span>
                      {!user.isActive && (
                        <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full" style={{ fontFamily: '"Poppins", sans-serif' }}>
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-[#888888] text-sm" style={{ fontFamily: '"Poppins", sans-serif' }}>{user.email}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUserId(user.id);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-[#7afdd6]/20 to-[#b8a4ff]/20 hover:from-[#7afdd6]/30 hover:to-[#b8a4ff]/30 text-[#7afdd6] rounded-xl transition-all duration-300 flex items-center gap-2"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    <Key className="w-4 h-4" />
                    Manage Permissions
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {usersData && usersData.pages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: usersData.pages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] font-semibold'
                        : 'bg-white/10 text-[#888888] hover:bg-white/20 hover:text-[#7afdd6]'
                    }`}
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="grid gap-6">
          {roleTemplates?.map((template) => (
            <motion.div
              key={template.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[25px] p-6"
              style={{
                background: 'rgba(255, 255, 255, 0.01)',
                backdropFilter: 'blur(50.5px)',
                WebkitBackdropFilter: 'blur(50.5px)',
                border: '2px solid rgba(122, 253, 214, 0.3)'
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    {template.role}
                  </h3>
                  <p className="text-[#888888] text-sm" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    {template.description || `Default ${template.role.toLowerCase()} permissions`}
                  </p>
                  {!template.id && (
                    <span className="inline-block mt-2 px-3 py-1 bg-white/10 text-[#888888] text-xs font-medium rounded-full" style={{ fontFamily: '"Poppins", sans-serif' }}>
                      Using Defaults
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedRole(template.role)}
                  className="px-4 py-2 bg-gradient-to-r from-[#7afdd6]/20 to-[#b8a4ff]/20 hover:from-[#7afdd6]/30 hover:to-[#b8a4ff]/30 text-[#7afdd6] rounded-xl transition-all duration-300 flex items-center gap-2"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Template
                </button>
              </div>
              <div className="text-sm text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                <strong>{template.permissions.length}</strong> permissions assigned
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* User Permission Modal */}
      {selectedUserId && userPermissions && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[25px] max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              background: 'rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)'
            }}
          >
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  User Permissions
                </h2>
                <button
                  onClick={() => setSelectedUserId(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#888888]" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <p className="text-[#888888] mb-6" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Manage additional permissions beyond the default role permissions
              </p>

              {/* Permission Categories */}
              <div className="space-y-6">
                {Object.entries(PERMISSION_CATEGORIES).map(
                  ([category, { name, description, permissions }]) => (
                    <div
                      key={category}
                      className="bg-white/5 border border-white/20 rounded-xl p-4"
                    >
                      <h3 className="text-lg font-semibold text-white mb-1" style={{ fontFamily: '"Poppins", sans-serif' }}>
                        {name}
                      </h3>
                      <p className="text-sm text-[#888888] mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
                        {description}
                      </p>
                      <div className="grid gap-2">
                        {permissions.map((permission) => (
                          <label
                            key={permission}
                            className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer transition-all duration-300"
                          >
                            <input
                              type="checkbox"
                              checked={userPermissions.allPermissions.includes(
                                permission
                              )}
                              className="w-5 h-5 text-[#7afdd6] bg-white/10 border-white/20 rounded focus:ring-[#7afdd6]"
                              readOnly
                            />
                            <span className="text-sm text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                              {permission}
                            </span>
                            {userPermissions.rolePermissions.includes(
                              permission
                            ) && (
                              <span className="ml-auto px-2 py-1 bg-gradient-to-r from-[#7afdd6]/20 to-[#b8a4ff]/20 text-[#7afdd6] text-xs rounded-full" style={{ fontFamily: '"Poppins", sans-serif' }}>
                                From Role
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Role Template Editor Modal */}
      {selectedRole && selectedRoleTemplate && (
        <RoleTemplateEditorModal
          role={selectedRole}
          template={{
            ...selectedRoleTemplate,
            permissions: selectedRoleTemplate.permissions as Permission[],
          }}
          onClose={() => setSelectedRole(null)}
          onSave={(permissions: Permission[]) => {
            upsertRoleTemplateMutation.mutate({
              role: selectedRole,
              permissions,
              category: 'custom',
              description: `Custom ${selectedRole.toLowerCase()} permissions`,
            });
          }}
          onReset={() => {
            if (selectedRoleTemplate.id && confirm('Are you sure you want to reset this role template to defaults?')) {
              deleteRoleTemplateMutation.mutate({ role: selectedRole });
            }
          }}
          isLoading={upsertRoleTemplateMutation.isPending || deleteRoleTemplateMutation.isPending}
        />
      )}
    </div>
  );
}

// Role Template Editor Modal Component
function RoleTemplateEditorModal({
  role,
  template,
  onClose,
  onSave,
  onReset,
  isLoading,
}: {
  role: UserRole;
  template: {
    id?: string | null;
    role: UserRole;
    permissions: Permission[];
    description?: string | null;
  };
  onClose: () => void;
  onSave: (permissions: Permission[]) => void;
  onReset: () => void;
  isLoading: boolean;
}) {
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(
    template.permissions
  );

  const togglePermission = (permission: Permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSave = () => {
    onSave(selectedPermissions);
  };

  const handleSelectAll = () => {
    const allPermissions = Object.values(PERMISSION_CATEGORIES).flatMap(
      (cat) => cat.permissions
    );
    setSelectedPermissions(allPermissions);
  };

  const handleDeselectAll = () => {
    setSelectedPermissions([]);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-[25px] max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        style={{
          background: 'rgba(255, 255, 255, 0.01)',
          backdropFilter: 'blur(50.5px)',
          WebkitBackdropFilter: 'blur(50.5px)',
          border: '2px solid rgba(122, 253, 214, 0.3)',
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h2
                className="text-2xl font-bold text-white mb-1"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Edit {role} Template
              </h2>
              {!template.id && (
                <p className="text-sm text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Currently using default permissions
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[#888888]" />
            </button>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="p-6 border-b border-white/20 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 flex items-center gap-2 text-sm"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              <Check className="w-4 h-4" />
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 flex items-center gap-2 text-sm"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              <X className="w-4 h-4" />
              Deselect All
            </button>
          </div>
          <div className="text-sm text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
            <strong className="text-[#7afdd6]">{selectedPermissions.length}</strong> permissions selected
          </div>
        </div>

        {/* Permission Categories */}
        <div className="p-6 space-y-6">
          {Object.entries(PERMISSION_CATEGORIES).map(
            ([category, { name, description, permissions }]) => (
              <div
                key={category}
                className="bg-white/5 border border-white/20 rounded-xl p-4"
              >
                <h3
                  className="text-lg font-semibold text-white mb-1"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  {name}
                </h3>
                <p
                  className="text-sm text-[#888888] mb-4"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  {description}
                </p>
                <div className="grid gap-2">
                  {permissions.map((permission) => (
                    <label
                      key={permission}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer transition-all duration-300"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission)}
                        onChange={() => togglePermission(permission)}
                        className="w-5 h-5 text-[#7afdd6] bg-white/10 border-white/20 rounded focus:ring-[#7afdd6] cursor-pointer"
                      />
                      <span
                        className="text-sm text-white"
                        style={{ fontFamily: '"Poppins", sans-serif' }}
                      >
                        {permission}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/20 flex items-center justify-between">
          <button
            onClick={onReset}
            disabled={isLoading || !template.id}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] hover:from-[#7afdd6]/80 hover:to-[#b8a4ff]/80 text-[#2c2c2b] rounded-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Template
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
