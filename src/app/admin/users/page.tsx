'use client';

import { useState, useEffect } from 'react';
import { api } from '@/trpc/react';
import { UserRole, User } from '@prisma/client';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Edit3, Calendar, Mail, Shield, Clock, UserCheck, UserX, Users as UsersIcon } from 'lucide-react';
import Dropdown, { DropdownOption } from '@/components/ui/Dropdown';
import { useSession } from 'next-auth/react';

type ExtendedUser = User & {
  lastLogin?: Date | null;
  isActive: boolean;
};

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'lastLogin' | 'name' | 'email'>('createdAt');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');

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

  const { data: userDetails } = api.user.getById.useQuery(
    { id: selectedUser! },
    { enabled: !!selectedUser }
  );

  const { data: userAnalytics } = api.user.getAnalytics.useQuery({});

  const utils = api.useUtils();

  const updateUserMutation = api.user.update.useMutation({
    onSuccess: () => {
      // Invalidate and refetch user list
      refetch();
      // Invalidate and refetch user details
      if (selectedUser) {
        utils.user.getById.invalidate({ id: selectedUser });
      }
      // Invalidate analytics
      utils.user.getAnalytics.invalidate();
    },
  });

  const toggleStatusMutation = api.user.toggleStatus.useMutation({
    onSuccess: () => {
      // Invalidate and refetch user list
      refetch();
      // Invalidate and refetch user details
      if (selectedUser) {
        utils.user.getById.invalidate({ id: selectedUser });
      }
      // Invalidate analytics
      utils.user.getAnalytics.invalidate();
    },
  });

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
      performedBy: session?.user?.id || 'unknown',
      ipAddress: 'admin-panel',
      userAgent: navigator.userAgent,
    });
  };

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

        <div className="flex gap-4">
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
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Users List */}
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
            <div className="px-6 py-4 border-b border-[#7afdd6]/20">
              <h3 className="text-lg font-medium text-[#7afdd6]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Users ({filteredUsers.length})
              </h3>
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
                    onSelect={() => setSelectedUser(user.id)}
                    onUserUpdate={handleUserUpdate}
                    onToggleStatus={handleToggleStatus}
                    currentUserRole={session?.user?.role ?? 'CONTENT_CREATOR'}
                  />
                </motion.div>
              ))}
            </div>
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
                Select a user to view details
              </p>
            </div>
          )}
        </motion.div>
      </div>
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

function UserItem({ user, isSelected, onSelect, onUserUpdate, onToggleStatus, currentUserRole }: {
  user: ExtendedUser;
  isSelected: boolean;
  onSelect: () => void;
  onUserUpdate: (id: string, data: Partial<ExtendedUser>) => void;
  onToggleStatus: (id: string) => void;
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
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
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

          {/* Status Toggle */}
          {canEditUser && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus(user.id);
              }}
              className={`text-xs px-3 py-1 rounded-full transition-all duration-300 ${
                user.isActive
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              }`}
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              {user.isActive ? <UserX size={12} /> : <UserCheck size={12} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function UserDetails({ user, onUserUpdate, currentUserRole }: {
  user: ExtendedUser;
  onUserUpdate: (id: string, data: Partial<ExtendedUser>) => void;
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
    setEditValues({
      name: user.name || '',
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      emailVerified: !!user.emailVerified
    });
  }, [user.name, user.email, user.role, user.isActive, user.emailVerified]);

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
      <h3 className="text-lg font-medium text-[#7afdd6] mb-6" style={{ fontFamily: '"Poppins", sans-serif' }}>
        User Details
      </h3>

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
          value={user.isActive ? 'Active' : 'Inactive'}
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
          value={user.emailVerified ? 'Yes' : 'No'}
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