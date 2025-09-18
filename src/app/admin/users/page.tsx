'use client';

import { useState, useEffect } from 'react';
import { api } from '@/trpc/react';
import { UserRole, User } from '@prisma/client';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Edit3, Calendar, Mail, Shield, Clock, UserCheck, UserX, Users as UsersIcon, Plus, Key, History, MoreVertical, Trash2, X, Check, AlertTriangle, Loader2 } from 'lucide-react';
import Dropdown, { DropdownOption } from '@/components/ui/Dropdown';
import { useSession } from 'next-auth/react';

type ExtendedUser = User & {
  lastLogin?: Date | null;
  isActive: boolean;
};

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

type ViewMode = 'users' | 'audit';

type BulkAction = 'changeRole' | 'toggleStatus' | 'delete';

interface AuditLog {
  id: string;
  action: string;
  createdAt: Date | string;
  user?: { name?: string | null; email: string };
  performer?: { name?: string | null; email: string };
  details?: unknown;
}

interface AuditData {
  logs: AuditLog[];
  pages: number;
}

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'lastLogin' | 'name' | 'email'>('createdAt');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('users');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<BulkAction>('changeRole');
  const [bulkActionData, setBulkActionData] = useState<{ role?: UserRole; isActive?: boolean }>({});
  const [userToDelete, setUserToDelete] = useState<ExtendedUser | null>(null);
  const [auditPage, setAuditPage] = useState(1);

  const { data: session } = useSession();

  const { data: usersData, refetch } = api.user.getAll.useQuery({
    search: searchTerm || undefined,
    role: roleFilter === 'ALL' ? undefined : (roleFilter as UserRole),
    isActive: statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE',
    page: currentPage,
    limit: 10,
    sortBy,
    sortOrder,
  });

  const { data: userDetails, refetch: refetchUserDetails } = api.user.getById.useQuery(
    { id: selectedUser! },
    { enabled: !!selectedUser }
  );

  const { data: userAnalytics } = api.user.getAnalytics.useQuery({});

  const { data: auditData } = api.user.getAuditLog.useQuery(
    {
      userId: selectedUser || undefined,
      page: auditPage,
      limit: 10,
    },
    { enabled: viewMode === 'audit' }
  );

  const utils = api.useUtils();

  const updateUserMutation = api.user.update.useMutation({
    onSuccess: async () => {
      // Invalidate and refetch user list
      refetch();
      // Immediately refetch user details to ensure fresh data
      if (selectedUser) {
        await refetchUserDetails();
      }
      // Invalidate analytics
      utils.user.getAnalytics.invalidate();
      addToast('User updated successfully', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Failed to update user', 'error');
    },
  });

  const toggleStatusMutation = api.user.toggleStatus.useMutation({
    onSuccess: async () => {
      // Invalidate and refetch user list
      refetch();
      // Immediately refetch user details to ensure fresh data
      if (selectedUser) {
        await refetchUserDetails();
      }
      // Invalidate analytics
      utils.user.getAnalytics.invalidate();
      addToast('User status updated successfully', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Failed to update user status', 'error');
    },
  });

  const createUserMutation = api.user.create.useMutation({
    onSuccess: async () => {
      refetch();
      utils.user.getAnalytics.invalidate();
      setShowCreateModal(false);
      addToast('User created successfully', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Failed to create user', 'error');
    },
  });

  const changePasswordMutation = api.user.changePassword.useMutation({
    onSuccess: () => {
      setShowPasswordModal(false);
      addToast('Password changed successfully', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Failed to change password', 'error');
    },
  });

  const deleteUserMutation = api.user.delete.useMutation({
    onSuccess: async () => {
      refetch();
      utils.user.getAnalytics.invalidate();
      setShowDeleteModal(false);
      setUserToDelete(null);
      if (selectedUser === userToDelete?.id) {
        setSelectedUser(null);
      }
      addToast('User deleted successfully', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Failed to delete user', 'error');
    },
  });

  const bulkUpdateMutation = api.user.bulkUpdate.useMutation({
    onSuccess: (result) => {
      refetch();
      utils.user.getAnalytics.invalidate();
      setShowBulkModal(false);
      setSelectedUsers([]);
      addToast(`Successfully updated ${result.count} users`, 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Bulk operation failed', 'error');
    },
  });

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleUserUpdate = async (userId: string, updateData: Partial<ExtendedUser>) => {
    // Filter out null values and ensure proper typing
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([, value]) => value !== null)
    );

    await updateUserMutation.mutateAsync({
      id: userId,
      ...cleanUpdateData,
      performedBy: session?.user?.id || 'unknown',
      ipAddress: 'admin-panel',
      userAgent: navigator.userAgent,
    } as Parameters<typeof updateUserMutation.mutateAsync>[0]);
  };

  const handleToggleStatus = async (userId: string) => {
    await toggleStatusMutation.mutateAsync({
      id: userId,
      ipAddress: 'admin-panel',
      userAgent: navigator.userAgent,
    });
  };

  const handleSelectUser = (userId: string, selected: boolean) => {
    setSelectedUsers(prev =>
      selected
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedUsers(selected ? filteredUsers.map(user => user.id) : []);
  };

  const handleBulkAction = async () => {
    if (selectedUsers.length === 0) return;

    const actionData: { role?: UserRole; isActive?: boolean } = {};
    if (bulkAction === 'changeRole' && bulkActionData.role) {
      actionData.role = bulkActionData.role;
    } else if (bulkAction === 'toggleStatus' && bulkActionData.isActive !== undefined) {
      actionData.isActive = bulkActionData.isActive;
    }

    if (bulkAction === 'delete') {
      // Handle bulk delete - would need a separate mutation
      addToast('Bulk delete functionality would be implemented here', 'info');
      return;
    }

    await bulkUpdateMutation.mutateAsync({
      userIds: selectedUsers,
      ...actionData,
      ipAddress: 'admin-panel',
      userAgent: navigator.userAgent,
    });
  };

  const handleDeleteUser = (user: ExtendedUser) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      await deleteUserMutation.mutateAsync({ id: userToDelete.id });
    }
  };

  const isAdmin = session?.user?.role === 'ADMIN';

  const roleOptions: DropdownOption[] = [
    { value: 'ALL', label: 'All Roles' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'MODERATOR', label: 'Moderator' },
    { value: 'CONTENT_CREATOR', label: 'Content Creator' },
  ];

  const statusOptions: DropdownOption[] = [
    { value: 'ALL', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ];

  const sortOptions: DropdownOption[] = [
    { value: 'createdAt', label: 'Registration Date' },
    { value: 'lastLogin', label: 'Last Login' },
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
  ];

  const filteredUsers = usersData?.users || [];

  return (
    <div className="space-y-8">
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
          User Management
        </h1>
        <p className="text-[#888888] text-lg">Manage users, roles, and permissions with precision</p>
      </motion.div>

      {/* Analytics Cards */}
      {userAnalytics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <AnalyticsCard
            title="Total Users"
            value={userAnalytics.totalUsers}
            icon={<UsersIcon size={24} />}
            gradient="from-[#7afdd6] to-[#b8a4ff]"
          />
          <AnalyticsCard
            title="Active Users"
            value={userAnalytics.activeUsers}
            icon={<UserCheck size={24} />}
            gradient="from-[#b8a4ff] to-[#7afdd6]"
          />
          <AnalyticsCard
            title="Admins"
            value={userAnalytics.roleDistribution.admins}
            icon={<Shield size={24} />}
            gradient="from-[#7afdd6] to-[#A095E1]"
          />
          <AnalyticsCard
            title="Recent Logins"
            value={userAnalytics.loginStats.usersWithLogin}
            icon={<Clock size={24} />}
            gradient="from-[#A095E1] to-[#7afdd6]"
          />
        </motion.div>
      )}

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#888888]" size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:border-transparent transition-all duration-300"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          />
        </div>

        <div className="flex gap-4 items-center">
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('users')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                viewMode === 'users'
                  ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b]'
                  : 'bg-white/10 text-[#888888] hover:bg-white/20 hover:text-white'
              }`}
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              <UsersIcon className="inline mr-2" size={16} />
              Users
            </button>
            <button
              onClick={() => setViewMode('audit')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                viewMode === 'audit'
                  ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b]'
                  : 'bg-white/10 text-[#888888] hover:bg-white/20 hover:text-white'
              }`}
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              <History className="inline mr-2" size={16} />
              Audit Log
            </button>
          </div>

          {viewMode === 'users' && (
            <>
              {/* Create User Button - Only for Admins */}
              {isAdmin && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  <Plus size={16} />
                  Create User
                </button>
              )}

              {/* Bulk Actions */}
              {selectedUsers.length > 0 && (
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-xl font-semibold hover:bg-orange-500/30 transition-all duration-300 flex items-center gap-2"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  <MoreVertical size={16} />
                  Actions ({selectedUsers.length})
                </button>
              )}

              {/* Role Filter */}
              <Dropdown
                value={roleFilter}
                onValueChange={(value) => setRoleFilter(value)}
                options={roleOptions}
                placeholder="Filter by role"
                variant="filter"
                icon={<Filter size={20} />}
                className="min-w-[180px]"
              />

              {/* Status Filter */}
              <Dropdown
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
                options={statusOptions}
                placeholder="Filter by status"
                variant="filter"
                icon={<UserCheck size={20} />}
                className="min-w-[160px]"
              />

              {/* Sort Options */}
              <Dropdown
                value={sortBy}
                onValueChange={(value) => setSortBy(value as typeof sortBy)}
                options={sortOptions}
                placeholder="Sort by"
                variant="filter"
                className="min-w-[160px]"
              />
            </>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div
            className="rounded-[25px] overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)'
            }}
          >
            {viewMode === 'users' ? (
              <>
                <div className="px-6 py-4 border-b border-[#7afdd6]/20">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-[#7afdd6]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                      Users ({filteredUsers.length})
                    </h3>
                    {filteredUsers.length > 0 && (
                      <label className="flex items-center gap-2 text-sm text-[#888888] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 border border-[#7afdd6] rounded transition-all ${
                          selectedUsers.length === filteredUsers.length && filteredUsers.length > 0
                            ? 'bg-[#7afdd6]'
                            : selectedUsers.length > 0
                            ? 'bg-[#7afdd6]/50'
                            : 'bg-transparent'
                        }`}>
                          {selectedUsers.length > 0 && (
                            <Check size={12} className="text-[#2c2c2b] ml-0.5 mt-0.5" />
                          )}
                        </div>
                        <span style={{ fontFamily: '"Poppins", sans-serif' }}>
                          Select All
                        </span>
                      </label>
                    )}
                  </div>
                </div>
                <div className="divide-y divide-[#7afdd6]/10">
                  {filteredUsers.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <UserItem
                        user={user as ExtendedUser}
                        isSelected={selectedUser === user.id}
                        isChecked={selectedUsers.includes(user.id)}
                        onSelect={() => setSelectedUser(user.id)}
                        onCheck={(checked) => handleSelectUser(user.id, checked)}
                        onUserUpdate={handleUserUpdate}
                        onToggleStatus={handleToggleStatus}
                        onDelete={() => handleDeleteUser(user as ExtendedUser)}
                        currentUserRole={session?.user?.role ?? 'CONTENT_CREATOR'}
                      />
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <AuditLogViewer
                auditData={auditData}
                currentPage={auditPage}
                onPageChange={setAuditPage}
                selectedUserId={selectedUser}
              />
            )}
          </div>

          {/* Pagination */}
          {usersData && usersData.pages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-6 flex justify-center"
            >
              <div className="flex gap-2">
                {Array.from({ length: usersData.pages }, (_, i) => i + 1).map((page) => (
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
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* User Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-1"
        >
          {selectedUser && userDetails ? (
            <UserDetails
              user={userDetails as ExtendedUser}
              onUserUpdate={handleUserUpdate}
              onPasswordChange={() => setShowPasswordModal(true)}
              onDelete={() => handleDeleteUser(userDetails as ExtendedUser)}
              currentUserRole={session?.user?.role ?? 'CONTENT_CREATOR'}
            />
          ) : (
            <div
              className="rounded-[25px] p-8 text-center"
              style={{
                background: 'rgba(255, 255, 255, 0.01)',
                backdropFilter: 'blur(50.5px)',
                WebkitBackdropFilter: 'blur(50.5px)',
                border: '2px solid rgba(122, 253, 214, 0.3)'
              }}
            >
              <Eye className="mx-auto mb-4 text-[#7afdd6]" size={48} />
              <p className="text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                {viewMode === 'users' ? 'Select a user to view details' : 'Audit log for all users'}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-md p-4 rounded-lg shadow-lg transition-all duration-300 transform ${
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : toast.type === 'error'
                ? 'bg-red-500 text-white'
                : toast.type === 'warning'
                ? 'bg-yellow-500 text-white'
                : 'bg-blue-500 text-white'
            } animate-in slide-in-from-right`}
            role="alert"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0">
                  {toast.type === 'success' && (
                    <Check className="w-5 h-5" />
                  )}
                  {toast.type === 'error' && (
                    <X className="w-5 h-5" />
                  )}
                  {toast.type === 'warning' && (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                  {toast.type === 'info' && (
                    <Eye className="w-5 h-5" />
                  )}
                </div>
                <span className="text-sm font-medium" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  {toast.message}
                </span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 text-white/80 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded-md p-1"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (data) => { await createUserMutation.mutateAsync(data); }}
          isLoading={createUserMutation.isPending}
        />
      )}

      {showPasswordModal && selectedUser && (
        <PasswordChangeModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onSubmit={async (data) => { await changePasswordMutation.mutateAsync(data); }}
          isLoading={changePasswordMutation.isPending}
          userId={selectedUser}
        />
      )}

      {showDeleteModal && userToDelete && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setUserToDelete(null);
          }}
          onConfirm={confirmDelete}
          isLoading={deleteUserMutation.isPending}
          user={userToDelete}
        />
      )}

      {showBulkModal && (
        <BulkActionModal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          onSubmit={handleBulkAction}
          isLoading={bulkUpdateMutation.isPending}
          selectedCount={selectedUsers.length}
          action={bulkAction}
          onActionChange={setBulkAction}
          actionData={bulkActionData}
          onActionDataChange={setBulkActionData}
        />
      )}
    </div>
  );
}

function AnalyticsCard({ title, value, icon, gradient }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div
      className="rounded-[25px] p-6"
      style={{
        background: 'rgba(255, 255, 255, 0.01)',
        backdropFilter: 'blur(50.5px)',
        WebkitBackdropFilter: 'blur(50.5px)',
        border: '1px solid rgba(122, 253, 214, 0.2)'
      }}
    >
      <div className="flex items-center justify-between">
        <div className={`bg-gradient-to-r ${gradient} text-[#2c2c2b] p-3 rounded-[15px]`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
            {title}
          </p>
          <p className="text-2xl font-bold text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
            {value.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function UserItem({ user, isSelected, isChecked, onSelect, onCheck, onUserUpdate, onToggleStatus, onDelete, currentUserRole }: {
  user: ExtendedUser;
  isSelected: boolean;
  isChecked: boolean;
  onSelect: () => void;
  onCheck: (checked: boolean) => void;
  onUserUpdate: (id: string, data: Partial<ExtendedUser>) => void;
  onToggleStatus: (id: string) => void;
  onDelete: () => void;
  currentUserRole: UserRole;
}) {
  const roleColors = {
    ADMIN: 'from-red-400 to-red-600',
    MODERATOR: 'from-blue-400 to-blue-600',
    CONTENT_CREATOR: 'from-green-400 to-green-600',
  };

  const roleOptions: DropdownOption[] = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'MODERATOR', label: 'Moderator' },
    { value: 'CONTENT_CREATOR', label: 'Content Creator' },
  ];

  const canEditUser = currentUserRole === 'ADMIN' ||
    (currentUserRole === 'MODERATOR' && user.role !== 'ADMIN');

  return (
    <div
      className={`p-6 cursor-pointer transition-all duration-300 relative overflow-hidden ${
        isSelected ? 'bg-white/10' : 'hover:bg-white/5'
      }`}
      onClick={onSelect}
    >
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#7afdd6] to-[#b8a4ff]" />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Checkbox */}
          <label
            className="flex items-center cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => onCheck(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-4 h-4 border border-[#7afdd6] rounded transition-all ${
              isChecked ? 'bg-[#7afdd6]' : 'bg-transparent hover:bg-[#7afdd6]/20'
            }`}>
              {isChecked && (
                <Check size={12} className="text-[#2c2c2b] ml-0.5 mt-0.5" />
              )}
            </div>
          </label>

          <div className="flex items-center gap-3 flex-1">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
              style={{
                background: 'linear-gradient(135deg, #7afdd6 0%, #b8a4ff 100%)',
                color: '#2c2c2b'
              }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="text-lg font-medium text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                {user.name || 'No Name'}
              </h4>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-[#888888]">
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-[#888888]">
            <Mail size={14} />
            <span>{user.email}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#888888]">
            <Calendar size={14} />
            <span>Joined {format(new Date(user.createdAt), 'MMM dd, yyyy')}</span>
          </div>

          {user.lastLogin && (
            <div className="flex items-center gap-2 text-sm text-[#888888]">
              <Clock size={14} />
              <span>Last login {format(new Date(user.lastLogin), 'MMM dd, yyyy')}</span>
            </div>
          )}
        </div>

        <div className="ml-4 flex flex-col gap-2">
          {/* Role Dropdown */}
          {canEditUser ? (
            <div
              className={`bg-gradient-to-r ${roleColors[user.role]} rounded-full p-[1px]`}
              onClick={(e) => e.stopPropagation()}
            >
              <Dropdown
                value={user.role}
                onValueChange={(value) => {
                  onUserUpdate(user.id, { role: value as UserRole });
                }}
                options={roleOptions}
                variant="status"
                size="sm"
                className="bg-transparent border-0 text-white rounded-full min-w-[120px]"
              />
            </div>
          ) : (
            <span
              className={`text-xs font-medium px-3 py-2 rounded-full bg-gradient-to-r ${
                roleColors[user.role]
              } text-white`}
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              {user.role.replace('_', ' ')}
            </span>
          )}

          <div className="flex gap-1">
            {/* Status Toggle */}
            {canEditUser && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStatus(user.id);
                }}
                className={`text-xs px-2 py-1 rounded-full transition-all duration-300 ${
                  user.isActive
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                }`}
                title={user.isActive ? 'Deactivate user' : 'Activate user'}
              >
                {user.isActive ? <UserX size={12} /> : <UserCheck size={12} />}
              </button>
            )}

            {/* Delete Button - Only for Admins */}
            {currentUserRole === 'ADMIN' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-300"
                title="Delete user"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserDetails({ user, onUserUpdate, onPasswordChange, onDelete, currentUserRole }: {
  user: ExtendedUser;
  onUserUpdate: (id: string, data: Partial<ExtendedUser>) => void;
  onPasswordChange: () => void;
  onDelete: () => void;
  currentUserRole: UserRole;
}) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    name: user.name || '',
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    emailVerified: !!user.emailVerified
  });

  // Update editValues when user data changes (after successful updates)
  useEffect(() => {
    const newValues = {
      name: user.name || '',
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      emailVerified: !!user.emailVerified
    };

    // Only update if we're not currently editing to prevent overwriting user input
    if (!editingField) {
      setEditValues(newValues);
    }
  }, [user.name, user.email, user.role, user.isActive, user.emailVerified, editingField]);

  const handleSave = (field: string) => {
    const updateData: Partial<ExtendedUser> = {};

    if (field === 'name') {
      updateData.name = editValues.name;
    } else if (field === 'email') {
      updateData.email = editValues.email;
    } else if (field === 'role') {
      updateData.role = editValues.role;
    } else if (field === 'isActive') {
      updateData.isActive = editValues.isActive;
    } else if (field === 'emailVerified') {
      updateData.emailVerified = editValues.emailVerified ? new Date() : null;
    }

    onUserUpdate(user.id, updateData);
    setEditingField(null);
  };

  const handleCancel = () => {
    setEditValues({
      name: user.name || '',
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      emailVerified: !!user.emailVerified
    });
    setEditingField(null);
  };

  const canEdit = currentUserRole === 'ADMIN' ||
    (currentUserRole === 'MODERATOR' && user.role !== 'ADMIN');

  const canEditRole = currentUserRole === 'ADMIN';
  const canEditEmail = currentUserRole === 'ADMIN';
  const canEditStatus = currentUserRole === 'ADMIN';
  const canEditEmailVerified = currentUserRole === 'ADMIN';

  const roleOptions: DropdownOption[] = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'MODERATOR', label: 'Moderator' },
    { value: 'CONTENT_CREATOR', label: 'Content Creator' },
  ];

  return (
    <div
      className="rounded-[25px] p-6"
      style={{
        background: 'rgba(255, 255, 255, 0.01)',
        backdropFilter: 'blur(50.5px)',
        WebkitBackdropFilter: 'blur(50.5px)',
        border: '2px solid rgba(122, 253, 214, 0.3)'
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-[#7afdd6]" style={{ fontFamily: '"Poppins", sans-serif' }}>
          User Details
        </h3>
        <div className="flex gap-2">
          {/* Password Change Button - Only for Admins */}
          {currentUserRole === 'ADMIN' && (
            <button
              onClick={onPasswordChange}
              className="p-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-all duration-300"
              title="Change password"
            >
              <Key size={16} />
            </button>
          )}
          {/* Delete Button - Only for Admins */}
          {currentUserRole === 'ADMIN' && (
            <button
              onClick={onDelete}
              className="p-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all duration-300"
              title="Delete user"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{
              background: 'linear-gradient(135deg, #7afdd6 0%, #b8a4ff 100%)',
              color: '#2c2c2b'
            }}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Name Field */}
        <EditableField
          label="Name"
          value={user.name || 'No name set'}
          isEditing={editingField === 'name'}
          canEdit={canEdit}
          onEdit={() => setEditingField('name')}
          onSave={() => handleSave('name')}
          onCancel={handleCancel}
          renderEditor={() => (
            <input
              value={editValues.name}
              onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:border-transparent transition-all duration-300"
              placeholder="Enter name..."
              style={{ fontFamily: '"Poppins", sans-serif' }}
            />
          )}
        />

        {/* Email Field */}
        <EditableField
          label="Email"
          value={user.email}
          isEditing={editingField === 'email'}
          canEdit={canEditEmail}
          onEdit={() => setEditingField('email')}
          onSave={() => handleSave('email')}
          onCancel={handleCancel}
          renderEditor={() => (
            <input
              type="email"
              value={editValues.email}
              onChange={(e) => setEditValues(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:border-transparent transition-all duration-300"
              placeholder="Enter email..."
              style={{ fontFamily: '"Poppins", sans-serif' }}
            />
          )}
        />

        {/* Role Field */}
        <EditableField
          label="Role"
          value={user.role.replace('_', ' ')}
          isEditing={editingField === 'role'}
          canEdit={canEditRole}
          onEdit={() => setEditingField('role')}
          onSave={() => handleSave('role')}
          onCancel={handleCancel}
          renderEditor={() => (
            <Dropdown
              value={editValues.role}
              onValueChange={(value) => setEditValues(prev => ({ ...prev, role: value as UserRole }))}
              options={roleOptions}
              placeholder="Select role"
              className="w-full"
            />
          )}
        />

        {/* Status Field */}
        <EditableField
          label="Status"
          value={editValues.isActive ? 'Active' : 'Inactive'}
          isEditing={editingField === 'isActive'}
          canEdit={canEditStatus}
          onEdit={() => setEditingField('isActive')}
          onSave={() => handleSave('isActive')}
          onCancel={handleCancel}
          renderEditor={() => (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setEditValues(prev => ({ ...prev, isActive: true }))}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                  editValues.isActive
                    ? 'bg-green-500 text-white'
                    : 'bg-white/10 text-[#888888] hover:bg-white/20'
                }`}
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Active
              </button>
              <button
                onClick={() => setEditValues(prev => ({ ...prev, isActive: false }))}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                  !editValues.isActive
                    ? 'bg-red-500 text-white'
                    : 'bg-white/10 text-[#888888] hover:bg-white/20'
                }`}
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Inactive
              </button>
            </div>
          )}
        />

        {/* Email Verified Field */}
        <EditableField
          label="Email Verified"
          value={editValues.emailVerified ? 'Yes' : 'No'}
          isEditing={editingField === 'emailVerified'}
          canEdit={canEditEmailVerified}
          onEdit={() => setEditingField('emailVerified')}
          onSave={() => handleSave('emailVerified')}
          onCancel={handleCancel}
          renderEditor={() => (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setEditValues(prev => ({ ...prev, emailVerified: true }))}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                  editValues.emailVerified
                    ? 'bg-green-500 text-white'
                    : 'bg-white/10 text-[#888888] hover:bg-white/20'
                }`}
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Yes
              </button>
              <button
                onClick={() => setEditValues(prev => ({ ...prev, emailVerified: false }))}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                  !editValues.emailVerified
                    ? 'bg-red-500 text-white'
                    : 'bg-white/10 text-[#888888] hover:bg-white/20'
                }`}
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                No
              </button>
            </div>
          )}
        />

        <DetailField
          label="Joined"
          value={format(new Date(user.createdAt), 'MMM dd, yyyy HH:mm')}
        />
        {user.lastLogin && (
          <DetailField
            label="Last Login"
            value={format(new Date(user.lastLogin), 'MMM dd, yyyy HH:mm')}
          />
        )}
      </div>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-[#7afdd6] block mb-1" style={{ fontFamily: '"Poppins", sans-serif' }}>
        {label}
      </label>
      <p className="text-sm text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
        {value}
      </p>
    </div>
  );
}

function EditableField({
  label,
  value,
  isEditing,
  canEdit,
  onEdit,
  onSave,
  onCancel,
  renderEditor
}: {
  label: string;
  value: string;
  isEditing: boolean;
  canEdit: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  renderEditor: () => React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-[#7afdd6]" style={{ fontFamily: '"Poppins", sans-serif' }}>
          {label}
        </label>
        {!isEditing && canEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-xs text-[#888888] hover:text-[#7afdd6] transition-colors duration-200"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            <Edit3 size={12} />
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div>
          {renderEditor()}
          <div className="mt-3 flex gap-2">
            <button
              onClick={onSave}
              className="px-4 py-2 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] text-xs rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              Save
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-white/10 text-[#888888] text-xs rounded-xl hover:bg-white/20 hover:text-white transition-all duration-300"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
          {value}
        </p>
      )}
    </div>
  );
}

// Audit Log Viewer Component
function AuditLogViewer({ auditData, currentPage, onPageChange }: {
  auditData: AuditData | undefined;
  currentPage: number;
  onPageChange: (page: number) => void;
  selectedUserId?: string | null;
}) {
  const logs = auditData?.logs || [];
  const totalPages = auditData?.pages || 1;

  const actionLabels: Record<string, string> = {
    USER_CREATED: 'User Created',
    USER_UPDATED: 'User Updated',
    USER_DELETED: 'User Deleted',
    USER_ACTIVATED: 'User Activated',
    USER_DEACTIVATED: 'User Deactivated',
    BULK_UPDATE: 'Bulk Update',
    PASSWORD_CHANGED: 'Password Changed',
  };

  return (
    <>
      <div className="px-6 py-4 border-b border-[#7afdd6]/20">
        <h3 className="text-lg font-medium text-[#7afdd6]" style={{ fontFamily: '"Poppins", sans-serif' }}>
          Audit Log ({logs.length})
        </h3>
      </div>
      <div className="divide-y divide-[#7afdd6]/10 max-h-[600px] overflow-y-auto">
        {logs.map((log: AuditLog, index: number) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-[#7afdd6]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    {actionLabels[log.action] || log.action}
                  </span>
                  <span className="text-xs text-[#888888]">
                    {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>

                <div className="text-sm text-white mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  {log.user ? (
                    <span>User: {log.user.name || log.user.email}</span>
                  ) : (
                    <span>System Action</span>
                  )}
                </div>

                {log.performer && (
                  <div className="text-xs text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    Performed by: {log.performer.name || log.performer.email}
                  </div>
                )}

                {log.details != null && (
                  <div className="mt-2 p-2 bg-white/5 rounded-lg">
                    <pre className="text-xs text-[#888888] whitespace-pre-wrap">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-[#7afdd6]/20 flex justify-center">
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] font-semibold'
                    : 'bg-white/10 text-[#888888] hover:bg-white/20 hover:text-[#7afdd6]'
                }`}
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// Create User Modal Component
function CreateUserModal({ isOpen, onClose, onSubmit, isLoading }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; password: string; role: UserRole }) => Promise<void>;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CONTENT_CREATOR' as UserRole,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({ name: '', email: '', password: '', role: 'CONTENT_CREATOR' });
      setErrors({});
    } catch {
      // Error is handled by the mutation's onError
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="bg-[#2c2c2b] rounded-[25px] p-6 w-full max-w-md mx-4"
        style={{
          background: 'rgba(255, 255, 255, 0.01)',
          backdropFilter: 'blur(50.5px)',
          WebkitBackdropFilter: 'blur(50.5px)',
          border: '2px solid rgba(122, 253, 214, 0.3)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium text-[#7afdd6]" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Create New User
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X size={20} className="text-[#888888]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#7afdd6] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full p-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] transition-all ${
                errors.name ? 'border-red-400' : 'border-white/20'
              }`}
              placeholder="Enter full name"
              style={{ fontFamily: '"Poppins", sans-serif' }}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#7afdd6] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full p-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] transition-all ${
                errors.email ? 'border-red-400' : 'border-white/20'
              }`}
              placeholder="Enter email address"
              style={{ fontFamily: '"Poppins", sans-serif' }}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#7afdd6] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Password *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`w-full p-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] transition-all ${
                errors.password ? 'border-red-400' : 'border-white/20'
              }`}
              placeholder="Enter password (min 6 characters)"
              style={{ fontFamily: '"Poppins", sans-serif' }}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#7afdd6] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Role
            </label>
            <Dropdown
              value={formData.role}
              onValueChange={(value) => handleChange('role', value)}
              options={[
                { value: 'CONTENT_CREATOR', label: 'Content Creator' },
                { value: 'MODERATOR', label: 'Moderator' },
                { value: 'ADMIN', label: 'Admin' }
              ]}
              placeholder="Select role"
              className="w-full"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/10 text-[#888888] rounded-xl font-medium hover:bg-white/20 hover:text-white transition-all"
              style={{ fontFamily: '"Poppins", sans-serif' }}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              style={{ fontFamily: '"Poppins", sans-serif' }}
              disabled={isLoading}
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Password Change Modal Component
function PasswordChangeModal({ isOpen, onClose, onSubmit, isLoading, userId }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { id: string; currentPassword: string; newPassword: string }) => Promise<void>;
  isLoading: boolean;
  userId: string;
}) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: 'weak', color: 'text-red-400' };
    if (password.length < 8) return { strength: 'fair', color: 'text-yellow-400' };
    if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) {
      return { strength: 'strong', color: 'text-green-400' };
    }
    return { strength: 'good', color: 'text-blue-400' };
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!formData.newPassword) newErrors.newPassword = 'New password is required';
    else if (formData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit({
        id: userId,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      // Reset form on success
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
    } catch {
      // Error is handled by the mutation's onError
    }
  };

  if (!isOpen) return null;

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="bg-[#2c2c2b] rounded-[25px] p-6 w-full max-w-md mx-4"
        style={{
          background: 'rgba(255, 255, 255, 0.01)',
          backdropFilter: 'blur(50.5px)',
          WebkitBackdropFilter: 'blur(50.5px)',
          border: '2px solid rgba(122, 253, 214, 0.3)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium text-[#7afdd6]" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Change Password
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X size={20} className="text-[#888888]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#7afdd6] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Current Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => handleChange('currentPassword', e.target.value)}
                className={`w-full p-3 pr-10 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] transition-all ${
                  errors.currentPassword ? 'border-red-400' : 'border-white/20'
                }`}
                placeholder="Enter current password"
                style={{ fontFamily: '"Poppins", sans-serif' }}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#888888] hover:text-white"
              >
                {showPasswords.current ? <Eye size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-red-400 text-sm mt-1">{errors.currentPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#7afdd6] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
              New Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleChange('newPassword', e.target.value)}
                className={`w-full p-3 pr-10 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] transition-all ${
                  errors.newPassword ? 'border-red-400' : 'border-white/20'
                }`}
                placeholder="Enter new password"
                style={{ fontFamily: '"Poppins", sans-serif' }}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#888888] hover:text-white"
              >
                {showPasswords.new ? <Eye size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {formData.newPassword && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-white/10 rounded-full h-2">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      passwordStrength.strength === 'weak' ? 'w-1/4 bg-red-400' :
                      passwordStrength.strength === 'fair' ? 'w-2/4 bg-yellow-400' :
                      passwordStrength.strength === 'good' ? 'w-3/4 bg-blue-400' :
                      'w-full bg-green-400'
                    }`}
                  />
                </div>
                <span className={`text-xs ${passwordStrength.color} capitalize`}>
                  {passwordStrength.strength}
                </span>
              </div>
            )}
            {errors.newPassword && (
              <p className="text-red-400 text-sm mt-1">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#7afdd6] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className={`w-full p-3 pr-10 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] transition-all ${
                  errors.confirmPassword ? 'border-red-400' : 'border-white/20'
                }`}
                placeholder="Confirm new password"
                style={{ fontFamily: '"Poppins", sans-serif' }}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#888888] hover:text-white"
              >
                {showPasswords.confirm ? <Eye size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/10 text-[#888888] rounded-xl font-medium hover:bg-white/20 hover:text-white transition-all"
              style={{ fontFamily: '"Poppins", sans-serif' }}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              style={{ fontFamily: '"Poppins", sans-serif' }}
              disabled={isLoading}
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Delete Confirmation Modal Component
function DeleteConfirmModal({ isOpen, onClose, onConfirm, isLoading, user }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  user: ExtendedUser;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="bg-[#2c2c2b] rounded-[25px] p-6 w-full max-w-md mx-4"
        style={{
          background: 'rgba(255, 255, 255, 0.01)',
          backdropFilter: 'blur(50.5px)',
          WebkitBackdropFilter: 'blur(50.5px)',
          border: '2px solid rgba(239, 68, 68, 0.3)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle size={24} className="text-red-400" />
            </div>
            <h3 className="text-xl font-medium text-red-400" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Delete User
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X size={20} className="text-[#888888]" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-white mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Are you sure you want to delete this user? This action cannot be undone.
          </p>

          <div className="bg-white/10 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold"
                style={{
                  background: 'linear-gradient(135deg, #7afdd6 0%, #b8a4ff 100%)',
                  color: '#2c2c2b'
                }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-lg font-medium text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  {user.name || 'No Name'}
                </h4>
                <p className="text-sm text-[#888888]">{user.email}</p>
                <p className="text-xs text-[#888888]">{user.role.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
            <p className="text-red-400 text-sm" style={{ fontFamily: '"Poppins", sans-serif' }}>
              <strong>Warning:</strong> This will permanently delete the user account and all associated data. This action cannot be reversed.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white/10 text-[#888888] rounded-xl font-medium hover:bg-white/20 hover:text-white transition-all"
            style={{ fontFamily: '"Poppins", sans-serif' }}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all duration-300 flex items-center justify-center gap-2"
            style={{ fontFamily: '"Poppins", sans-serif' }}
            disabled={isLoading}
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {isLoading ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Bulk Action Modal Component
function BulkActionModal({ isOpen, onClose, onSubmit, isLoading, selectedCount, action, onActionChange, actionData, onActionDataChange }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  isLoading: boolean;
  selectedCount: number;
  action: BulkAction;
  onActionChange: (action: BulkAction) => void;
  actionData: { role?: UserRole; isActive?: boolean };
  onActionDataChange: (data: { role?: UserRole; isActive?: boolean }) => void;
}) {
  if (!isOpen) return null;

  const actionLabels = {
    changeRole: 'Change Role',
    toggleStatus: 'Toggle Status',
    delete: 'Delete Users'
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="bg-[#2c2c2b] rounded-[25px] p-6 w-full max-w-md mx-4"
        style={{
          background: 'rgba(255, 255, 255, 0.01)',
          backdropFilter: 'blur(50.5px)',
          WebkitBackdropFilter: 'blur(50.5px)',
          border: '2px solid rgba(122, 253, 214, 0.3)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium text-[#7afdd6]" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Bulk Actions ({selectedCount} users)
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X size={20} className="text-[#888888]" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#7afdd6] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Select Action
            </label>
            <select
              value={action}
              onChange={(e) => onActionChange(e.target.value as BulkAction)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6] transition-all"
              style={{ fontFamily: '"Poppins", sans-serif' }}
              disabled={isLoading}
            >
              <option value="changeRole">Change Role</option>
              <option value="toggleStatus">Toggle Status</option>
              <option value="delete">Delete Users</option>
            </select>
          </div>

          {action === 'changeRole' && (
            <div>
              <label className="block text-sm font-medium text-[#7afdd6] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                New Role
              </label>
              <select
                value={actionData.role || 'CONTENT_CREATOR'}
                onChange={(e) => onActionDataChange({ ...actionData, role: e.target.value as UserRole })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6] transition-all"
                style={{ fontFamily: '"Poppins", sans-serif' }}
                disabled={isLoading}
              >
                <option value="CONTENT_CREATOR">Content Creator</option>
                <option value="MODERATOR">Moderator</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          )}

          {action === 'toggleStatus' && (
            <div>
              <label className="block text-sm font-medium text-[#7afdd6] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Set Status
              </label>
              <select
                value={actionData.isActive === undefined ? '' : actionData.isActive ? 'active' : 'inactive'}
                onChange={(e) => onActionDataChange({
                  ...actionData,
                  isActive: e.target.value === 'active'
                })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6] transition-all"
                style={{ fontFamily: '"Poppins", sans-serif' }}
                disabled={isLoading}
              >
                <option value="">Select status...</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}

          {action === 'delete' && (
            <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
              <p className="text-red-400 text-sm" style={{ fontFamily: '"Poppins", sans-serif' }}>
                <strong>Warning:</strong> This will permanently delete {selectedCount} users and all their associated data. This action cannot be reversed.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white/10 text-[#888888] rounded-xl font-medium hover:bg-white/20 hover:text-white transition-all"
            style={{ fontFamily: '"Poppins", sans-serif' }}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              action === 'delete'
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] hover:shadow-lg'
            }`}
            style={{ fontFamily: '"Poppins", sans-serif' }}
            disabled={isLoading || (action === 'changeRole' && !actionData.role) || (action === 'toggleStatus' && actionData.isActive === undefined)}
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {isLoading ? 'Processing...' : `${actionLabels[action]} (${selectedCount})`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}