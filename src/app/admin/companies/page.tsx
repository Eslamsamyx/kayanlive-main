'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { CompanyType, type Company } from '@prisma/client';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Building2,
  Users,
  FolderKanban,
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  Loader2,
  AlertTriangle,
  Mail,
  Phone,
  Globe,
  MapPin,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { StatCard } from './components';

type ExtendedCompany = Company & {
  creator: { id: string; name: string | null; email: string };
  _count: { users: number; projects: number; assets: number };
};

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export default function CompaniesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<ExtendedCompany | null>(null);

  const { data: session } = useSession();

  const { data: companiesData, refetch } = api.company.getAll.useQuery({
    search: searchTerm || undefined,
    type: typeFilter === 'ALL' ? undefined : (typeFilter as CompanyType),
    isActive: statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE',
    page: currentPage,
    limit: 20,
  });

  const { data: companyDetails } = api.company.getById.useQuery(
    { id: selectedCompany! },
    { enabled: !!selectedCompany }
  );

  const { data: companyStats } = api.company.getStats.useQuery();

  const utils = api.useUtils();

  const createCompanyMutation = api.company.create.useMutation({
    onSuccess: () => {
      refetch();
      utils.company.getStats.invalidate();
      setShowCreateModal(false);
      addToast('Company created successfully', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Failed to create company', 'error');
    },
  });

  const updateCompanyMutation = api.company.update.useMutation({
    onSuccess: () => {
      refetch();
      addToast('Company updated successfully', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Failed to update company', 'error');
    },
  });

  const deleteCompanyMutation = api.company.delete.useMutation({
    onSuccess: () => {
      refetch();
      utils.company.getStats.invalidate();
      setShowDeleteModal(false);
      setCompanyToDelete(null);
      if (selectedCompany === companyToDelete?.id) {
        setSelectedCompany(null);
      }
      addToast('Company deleted successfully', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Failed to delete company', 'error');
    },
  });

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const filteredCompanies = companiesData?.companies || [];

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
            lineHeight: '1.1',
          }}
        >
          Company Management
        </h1>
        <p className="text-[#888888] text-lg">
          Manage companies, assign users, and oversee projects
        </p>
      </motion.div>

      {/* Stats Cards */}
      {companyStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <StatCard
            title="Total Companies"
            value={companyStats.total}
            icon={<Building2 size={24} />}
            gradient="#7afdd6, #b8a4ff"
          />
          <StatCard
            title="Active"
            value={companyStats.active}
            icon={<Check size={24} />}
            gradient="#b8a4ff, #7afdd6"
          />
          <StatCard
            title="Organizations"
            value={companyStats.typeDistribution.ORGANIZATION || 0}
            icon={<Users size={24} />}
            gradient="#7afdd6, #A095E1"
          />
          <StatCard
            title="Personal"
            value={companyStats.typeDistribution.PERSONAL || 0}
            icon={<FolderKanban size={24} />}
            gradient="#A095E1, #7afdd6"
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
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#888888]"
            size={20}
          />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:border-transparent transition-all duration-300"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          />
        </div>

        <div className="flex gap-4 items-center">
          {/* Create Company Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            <Plus size={16} />
            Create Company
          </button>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            <option value="ALL">All Types</option>
            <option value="ORGANIZATION">Organizations</option>
            <option value="PERSONAL">Personal</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Companies List */}
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
              border: '2px solid rgba(122, 253, 214, 0.3)',
            }}
          >
            <div className="px-6 py-4 border-b border-[#7afdd6]/20">
              <h3
                className="text-lg font-medium text-[#7afdd6]"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Companies ({filteredCompanies.length})
              </h3>
            </div>
            <div className="divide-y divide-[#7afdd6]/10">
              {filteredCompanies.map((company, index) => (
                <CompanyItem
                  key={company.id}
                  company={company}
                  isSelected={selectedCompany === company.id}
                  onSelect={() => setSelectedCompany(company.id)}
                  onDelete={() => {
                    setCompanyToDelete(company);
                    setShowDeleteModal(true);
                  }}
                  index={index}
                />
              ))}
            </div>
          </div>

          {/* Pagination */}
          {companiesData && companiesData.pages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex gap-2">
                {Array.from({ length: companiesData.pages }, (_, i) => i + 1).map((page) => (
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
            </div>
          )}
        </motion.div>

        {/* Company Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-1"
        >
          {selectedCompany && companyDetails ? (
            <CompanyDetails
              company={companyDetails}
              onUpdate={(data) => updateCompanyMutation.mutate({ id: selectedCompany, ...data })}
            />
          ) : (
            <div
              className="rounded-[25px] p-8 text-center"
              style={{
                background: 'rgba(255, 255, 255, 0.01)',
                backdropFilter: 'blur(50.5px)',
                WebkitBackdropFilter: 'blur(50.5px)',
                border: '2px solid rgba(122, 253, 214, 0.3)',
              }}
            >
              <Building2 className="mx-auto mb-4 text-[#7afdd6]" size={48} />
              <p
                className="text-[#888888]"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Select a company to view details
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateCompanyModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => createCompanyMutation.mutate(data)}
          isLoading={createCompanyMutation.isPending}
        />
      )}

      {showDeleteModal && companyToDelete && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setCompanyToDelete(null);
          }}
          onConfirm={() => deleteCompanyMutation.mutate({ id: companyToDelete.id })}
          isLoading={deleteCompanyMutation.isPending}
          company={companyToDelete}
        />
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT IMPLEMENTATIONS
// ============================================================================

/**
 * CompanyItem - List item for a company
 */
function CompanyItem({
  company,
  isSelected,
  onSelect,
  onDelete,
  index,
}: {
  company: ExtendedCompany;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={onSelect}
      className={`p-6 cursor-pointer transition-all duration-300 hover:bg-white/5 ${
        isSelected ? 'bg-white/10' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Building2
              size={20}
              className={isSelected ? 'text-[#7afdd6]' : 'text-[#888888]'}
            />
            <h4
              className={`font-semibold truncate ${
                isSelected ? 'text-[#7afdd6]' : 'text-white'
              }`}
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              {company.name}
            </h4>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                company.isActive
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {company.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-[#888888]">
            <span>{company.type}</span>
            <span>•</span>
            <span>{company._count.users} users</span>
            <span>•</span>
            <span>{company._count.projects} projects</span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * CompanyDetails - Detailed view of a company
 */
function CompanyDetails({
  company,
  onUpdate,
}: {
  company: any;
  onUpdate: (data: any) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: company.name,
    email: company.email || '',
    phone: company.phone || '',
    website: company.website || '',
    address: company.address || '',
  });

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  return (
    <div
      className="rounded-[25px] overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.01)',
        backdropFilter: 'blur(50.5px)',
        WebkitBackdropFilter: 'blur(50.5px)',
        border: '2px solid rgba(122, 253, 214, 0.3)',
      }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#7afdd6]/20 flex items-center justify-between">
        <h3
          className="text-lg font-medium text-[#7afdd6]"
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          Company Details
        </h3>
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="p-2 text-[#7afdd6] hover:bg-[#7afdd6]/10 rounded-lg transition-colors"
        >
          {isEditing ? <Check size={18} /> : <Edit3 size={18} />}
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm text-[#888888] mb-2">Company Name</label>
          {isEditing ? (
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            />
          ) : (
            <p className="text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
              {company.name}
            </p>
          )}
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm text-[#888888] mb-2">Type</label>
          <p className="text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
            {company.type}
          </p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm text-[#888888] mb-2">Email</label>
          {isEditing ? (
            <input
              type="email"
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            />
          ) : (
            <p className="text-white flex items-center gap-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
              <Mail size={16} className="text-[#888888]" />
              {company.email || 'Not provided'}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm text-[#888888] mb-2">Phone</label>
          {isEditing ? (
            <input
              type="tel"
              value={editData.phone}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            />
          ) : (
            <p className="text-white flex items-center gap-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
              <Phone size={16} className="text-[#888888]" />
              {company.phone || 'Not provided'}
            </p>
          )}
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm text-[#888888] mb-2">Website</label>
          {isEditing ? (
            <input
              type="url"
              value={editData.website}
              onChange={(e) => setEditData({ ...editData, website: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            />
          ) : (
            <p className="text-white flex items-center gap-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
              <Globe size={16} className="text-[#888888]" />
              {company.website || 'Not provided'}
            </p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm text-[#888888] mb-2">Address</label>
          {isEditing ? (
            <textarea
              value={editData.address}
              onChange={(e) => setEditData({ ...editData, address: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6] resize-none"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            />
          ) : (
            <p className="text-white flex items-start gap-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
              <MapPin size={16} className="text-[#888888] mt-1" />
              {company.address || 'Not provided'}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="pt-4 border-t border-[#7afdd6]/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[#7afdd6]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                {company._count?.users || 0}
              </p>
              <p className="text-xs text-[#888888]">Users</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#7afdd6]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                {company._count?.projects || 0}
              </p>
              <p className="text-xs text-[#888888]">Projects</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#7afdd6]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                {company._count?.assets || 0}
              </p>
              <p className="text-xs text-[#888888]">Assets</p>
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="pt-4 border-t border-[#7afdd6]/20 text-xs text-[#888888] space-y-1">
          <p>Created: {format(new Date(company.createdAt), 'MMM dd, yyyy')}</p>
          <p>Updated: {format(new Date(company.updatedAt), 'MMM dd, yyyy')}</p>
          <p>Created by: {company.creator?.name || company.creator?.email}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * CreateCompanyModal - Modal for creating a new company
 */
function CreateCompanyModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'ORGANIZATION' as CompanyType,
    email: '',
    phone: '',
    website: '',
    industry: '',
    address: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit({
      ...formData,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      website: formData.website || undefined,
      industry: formData.industry || undefined,
      address: formData.address || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1a1a1a] rounded-[25px] max-w-2xl w-full shadow-xl overflow-hidden"
        style={{
          border: '2px solid rgba(122, 253, 214, 0.3)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#7afdd6]/20">
          <h2
            className="text-2xl font-bold text-[#7afdd6]"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            Create New Company
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-[#888888] hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Name */}
            <div className="md:col-span-2">
              <label className="block text-sm text-[#888888] mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                placeholder="Enter company name"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm text-[#888888] mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as CompanyType })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                <option value="ORGANIZATION">Organization</option>
                <option value="PERSONAL">Personal</option>
              </select>
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm text-[#888888] mb-2">Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                placeholder="e.g., Technology"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-[#888888] mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                placeholder="company@example.com"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm text-[#888888] mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                placeholder="+1 (555) 123-4567"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              />
            </div>

            {/* Website */}
            <div className="md:col-span-2">
              <label className="block text-sm text-[#888888] mb-2">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                placeholder="https://example.com"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm text-[#888888] mb-2">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] resize-none"
                placeholder="Enter company address"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Company'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/**
 * DeleteConfirmModal - Confirmation dialog for deleting a company
 */
function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  company,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  company: ExtendedCompany;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1a1a1a] rounded-[25px] max-w-md w-full shadow-xl overflow-hidden"
        style={{
          border: '2px solid rgba(255, 107, 107, 0.3)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-red-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle size={24} className="text-red-400" />
            </div>
            <h2
              className="text-xl font-bold text-white"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              Delete Company
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-[#888888] hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Are you sure you want to delete <span className="text-white font-semibold">{company.name}</span>?
          </p>

          <div
            className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
          >
            <p className="text-sm text-red-400" style={{ fontFamily: '"Poppins", sans-serif' }}>
              <strong>Warning:</strong> This action cannot be undone. All associated data including:
            </p>
            <ul className="mt-2 text-sm text-red-400 list-disc list-inside space-y-1">
              <li>{company._count.users} users</li>
              <li>{company._count.projects} projects</li>
              <li>{company._count.assets} assets</li>
            </ul>
            <p className="mt-2 text-sm text-red-400">
              will be permanently deleted.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={18} />
                Delete Company
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Toast - Notification toast component
 */
function Toast({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const bgColor = {
    success: 'from-green-500/20 to-green-600/20 border-green-500/30',
    error: 'from-red-500/20 to-red-600/20 border-red-500/30',
    warning: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
    info: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
  };

  const iconColor = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`bg-gradient-to-r ${bgColor[toast.type]} border rounded-xl p-4 shadow-lg min-w-[300px] backdrop-blur-lg`}
    >
      <div className="flex items-center gap-3">
        {toast.type === 'success' && <Check size={20} className={iconColor[toast.type]} />}
        {toast.type === 'error' && <X size={20} className={iconColor[toast.type]} />}
        {toast.type === 'warning' && <AlertTriangle size={20} className={iconColor[toast.type]} />}
        {toast.type === 'info' && <AlertTriangle size={20} className={iconColor[toast.type]} />}
        <p
          className="flex-1 text-white text-sm"
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          {toast.message}
        </p>
        <button
          onClick={() => onRemove(toast.id)}
          className="text-white/50 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
}
