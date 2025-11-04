import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { type Company, type CompanyType } from '@prisma/client';
import {
  Building2,
  Users,
  FolderKanban,
  Edit3,
  Trash2,
  X,
  Check,
  Mail,
  Phone,
  Globe,
  MapPin,
  Loader2,
  AlertTriangle,
  FileImage,
} from 'lucide-react';

type ExtendedCompany = Company & {
  creator: { id: string; name: string | null; email: string };
  _count: { users: number; projects: number; assets: number };
};

interface CompanyDetailsType extends ExtendedCompany {
  users: Array<{
    id: string;
    companyId: string;
    userId: string;
    role: string;
    user: {
      id: string;
      name: string | null;
      email: string;
      role: string;
      isActive: boolean;
    };
  }>;
  projects: Array<{
    id: string;
    name: string;
    status: string;
    createdAt: Date;
  }>;
}

export function StatCard({
  title,
  value,
  icon,
  gradient,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
}) {
  // Ensure value is always valid
  const displayValue = typeof value === 'number' && !isNaN(value) ? value : 0;

  return (
    <div
      className="rounded-[25px] p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
        backdropFilter: 'blur(50.5px)',
        WebkitBackdropFilter: 'blur(50.5px)',
        border: '2px solid rgba(122, 253, 214, 0.2)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)'
      }}
    >
      {/* Background gradient accent */}
      <div
        className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-2xl"
        style={{
          background: `linear-gradient(135deg, ${gradient.split(',')[0]} 0%, ${gradient.split(',')[1]} 100%)`
        }}
      />

      <div className="flex items-center justify-between relative z-10">
        {/* Icon */}
        <div
          className="p-4 rounded-[18px]"
          style={{
            background: `linear-gradient(135deg, ${gradient.split(',')[0]} 0%, ${gradient.split(',')[1]} 100%)`,
            boxShadow: `0 8px 16px ${gradient.split(',')[0]}40`
          }}
        >
          <div className="text-[#1a1a19]">
            {icon}
          </div>
        </div>

        {/* Title and Value */}
        <div className="text-right">
          <p
            className="text-xs font-medium text-[#888888] uppercase tracking-wide mb-1"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            {title}
          </p>
          <p
            className="text-4xl font-bold text-white"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            {displayValue.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export function CompanyItem({
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={onSelect}
      className={`p-6 cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'bg-gradient-to-r from-[#7afdd6]/20 to-[#b8a4ff]/20'
          : 'hover:bg-white/5'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4
              className="text-lg font-semibold text-white"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              {company.name}
            </h4>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                company.type === 'ORGANIZATION'
                  ? 'bg-[#b8a4ff]/20 text-[#b8a4ff]'
                  : 'bg-[#7afdd6]/20 text-[#7afdd6]'
              }`}
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              {company.type}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                company.isActive
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              {company.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {company.industry && (
            <p className="text-sm text-[#888888] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
              {company.industry}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-[#888888]">
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{company._count.users} users</span>
            </div>
            <div className="flex items-center gap-1">
              <FolderKanban size={14} />
              <span>{company._count.projects} projects</span>
            </div>
            <div className="flex items-center gap-1">
              <FileImage size={14} />
              <span>{company._count.assets} assets</span>
            </div>
          </div>

          <p className="text-xs text-[#888888] mt-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Created {format(new Date(company.createdAt), 'MMM dd, yyyy')}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-300"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function CompanyDetails({
  company,
  onUpdate,
}: {
  company: CompanyDetailsType;
  onUpdate: (data: any) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: company.name,
    email: company.email || '',
    phone: company.phone || '',
    industry: company.industry || '',
    website: company.website || '',
    country: company.country || '',
    city: company.city || '',
    address: company.address || '',
    isActive: company.isActive,
  });

  const handleSubmit = () => {
    onUpdate(formData);
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
      <div className="px-6 py-4 border-b border-[#7afdd6]/20 flex items-center justify-between">
        <h3
          className="text-lg font-medium text-[#7afdd6]"
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          Company Details
        </h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 text-[#7afdd6] hover:bg-[#7afdd6]/20 rounded-lg transition-all duration-300"
        >
          {isEditing ? <X size={20} /> : <Edit3 size={20} />}
        </button>
      </div>

      <div className="p-6 space-y-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#888888] mb-2">Company Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#888888] mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#888888] mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#888888] mb-2">Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#888888] mb-2">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#888888] mb-2">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                />
              </div>

              <div>
                <label className="block text-sm text-[#888888] mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 bg-white/10 text-[#7afdd6] focus:ring-[#7afdd6]"
                />
                <span className="text-white">Active</span>
              </label>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full px-4 py-3 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="text-2xl font-bold text-white mb-2">{company.name}</h4>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  company.type === 'ORGANIZATION'
                    ? 'bg-[#b8a4ff]/20 text-[#b8a4ff]'
                    : 'bg-[#7afdd6]/20 text-[#7afdd6]'
                }`}
              >
                {company.type}
              </span>
            </div>

            {company.email && (
              <div className="flex items-center gap-3 text-[#888888]">
                <Mail size={16} className="text-[#7afdd6]" />
                <span>{company.email}</span>
              </div>
            )}

            {company.phone && (
              <div className="flex items-center gap-3 text-[#888888]">
                <Phone size={16} className="text-[#7afdd6]" />
                <span>{company.phone}</span>
              </div>
            )}

            {company.website && (
              <div className="flex items-center gap-3 text-[#888888]">
                <Globe size={16} className="text-[#7afdd6]" />
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:text-[#7afdd6]">
                  {company.website}
                </a>
              </div>
            )}

            {(company.city || company.country) && (
              <div className="flex items-center gap-3 text-[#888888]">
                <MapPin size={16} className="text-[#7afdd6]" />
                <span>{[company.city, company.country].filter(Boolean).join(', ')}</span>
              </div>
            )}

            <div className="pt-4 border-t border-[#7afdd6]/20">
              <h5 className="text-sm font-semibold text-[#7afdd6] mb-3">Statistics</h5>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{company._count.users}</div>
                  <div className="text-xs text-[#888888]">Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{company._count.projects}</div>
                  <div className="text-xs text-[#888888]">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{company._count.assets}</div>
                  <div className="text-xs text-[#888888]">Assets</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#7afdd6]/20">
              <h5 className="text-sm font-semibold text-[#7afdd6] mb-3">Users</h5>
              <div className="space-y-2">
                {company.users.slice(0, 5).map((cu) => (
                  <div key={cu.id} className="flex items-center justify-between">
                    <div>
                      <div className="text-white text-sm">{cu.user.name || cu.user.email}</div>
                      <div className="text-xs text-[#888888]">{cu.role}</div>
                    </div>
                  </div>
                ))}
                {company.users.length > 5 && (
                  <div className="text-xs text-[#888888]">+{company.users.length - 5} more</div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#7afdd6]/20">
              <h5 className="text-sm font-semibold text-[#7afdd6] mb-3">Recent Projects</h5>
              <div className="space-y-2">
                {company.projects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between">
                    <div>
                      <div className="text-white text-sm">{project.name}</div>
                      <div className="text-xs text-[#888888]">{project.status}</div>
                    </div>
                    <div className="text-xs text-[#888888]">
                      {format(new Date(project.createdAt), 'MMM dd')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function CreateCompanyModal({
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
    email: '',
    phone: '',
    industry: '',
    website: '',
    type: 'ORGANIZATION' as CompanyType,
    country: '',
    city: '',
    address: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-[25px] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              background: 'rgba(44, 44, 43, 0.95)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Create New Company
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-[#888888] hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[#888888] mb-2">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  placeholder="Enter company name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#888888] mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                    placeholder="company@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#888888] mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#888888] mb-2">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                    placeholder="Technology, Healthcare, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#888888] mb-2">Type *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CompanyType })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  >
                    <option value="ORGANIZATION">Organization</option>
                    <option value="PERSONAL">Personal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#888888] mb-2">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  placeholder="https://example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#888888] mb-2">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                    placeholder="United States"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#888888] mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                    placeholder="New York"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#888888] mb-2">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  placeholder="123 Main St, Suite 100"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Company'
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DeleteConfirmModal({
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
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-[25px] p-8 max-w-md w-full"
            style={{
              background: 'rgba(44, 44, 43, 0.95)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(255, 77, 77, 0.3)',
            }}
          >
            <div className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="text-red-400" size={24} />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Delete Company
              </h2>

              <p className="text-[#888888] mb-6" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Are you sure you want to delete <span className="text-white font-semibold">{company.name}</span>?
                This action cannot be undone.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 disabled:opacity-50"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Cancel
                </button>

                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Toast({
  toast,
  onRemove,
}: {
  toast: { id: string; message: string; type: 'success' | 'error' | 'info' | 'warning' };
  onRemove: (id: string) => void;
}) {
  const colors = {
    success: 'from-green-500 to-emerald-600',
    error: 'from-red-500 to-red-600',
    info: 'from-blue-500 to-blue-600',
    warning: 'from-yellow-500 to-orange-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`bg-gradient-to-r ${colors[toast.type]} text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 min-w-[300px]`}
    >
      <span className="flex-1" style={{ fontFamily: '"Poppins", sans-serif' }}>
        {toast.message}
      </span>
      <button onClick={() => onRemove(toast.id)} className="p-1 hover:bg-white/20 rounded-lg transition-all">
        <X size={16} />
      </button>
    </motion.div>
  );
}
