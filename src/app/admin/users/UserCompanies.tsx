import { useState } from 'react';
import { api } from '@/trpc/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Plus,
  X,
  Loader2,
  UserMinus,
  Shield,
} from 'lucide-react';
import { type CompanyRole } from '@prisma/client';

export function UserCompanies({
  userId,
  onUpdate,
}: {
  userId: string;
  onUpdate?: () => void;
}) {
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Get user's companies
  const { data: userCompanies, refetch: refetchCompanies } = api.company.getUserCompanies.useQuery(
    { userId },
    { enabled: !!userId }
  );

  // Get all companies
  const { data: allCompanies } = api.company.getAll.useQuery({ limit: 100 });

  const utils = api.useUtils();

  const assignToCompanyMutation = api.company.addUser.useMutation({
    onSuccess: () => {
      refetchCompanies();
      setShowAssignModal(false);
      if (onUpdate) onUpdate();
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const removeFromCompanyMutation = api.company.removeUser.useMutation({
    onSuccess: () => {
      refetchCompanies();
      if (onUpdate) onUpdate();
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleRemoveFromCompany = (companyId: string) => {
    if (confirm('Are you sure you want to remove this user from the company?')) {
      removeFromCompanyMutation.mutate({ companyId, userId });
    }
  };

  return (
    <div className="pt-4 mt-4 border-t border-[#7afdd6]/20">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-[#7afdd6]" style={{ fontFamily: '"Poppins", sans-serif' }}>
          Companies {userCompanies && `(${userCompanies.length})`}
        </h4>
        <button
          onClick={() => setShowAssignModal(true)}
          className="p-2 text-[#7afdd6] hover:bg-[#7afdd6]/20 rounded-lg transition-all"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-2">
        {!userCompanies || userCompanies.length === 0 ? (
          <p className="text-xs text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
            No companies assigned yet. Click + to assign this user to a company.
          </p>
        ) : (
          userCompanies.map((companyUser) => (
            <div
              key={companyUser.id}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-[#7afdd6]" />
                  <span className="text-sm text-white font-medium" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    {companyUser.company.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#7afdd6]/10 text-[#7afdd6] rounded text-xs font-medium">
                    <Shield size={10} />
                    {companyUser.role}
                  </span>
                  {companyUser.permissions.canCreateProjects && (
                    <span className="text-xs text-[#888888]">Create Projects</span>
                  )}
                  {companyUser.permissions.canManageUsers && (
                    <span className="text-xs text-[#888888]">Manage Users</span>
                  )}
                  {companyUser.permissions.canManageAssets && (
                    <span className="text-xs text-[#888888]">Manage Assets</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleRemoveFromCompany(companyUser.company.id)}
                disabled={removeFromCompanyMutation.isPending}
                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all disabled:opacity-50"
              >
                {removeFromCompanyMutation.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <UserMinus size={14} />
                )}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Assign to Company Modal */}
      {showAssignModal && allCompanies && (
        <AssignToCompanyModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          onSubmit={(data) => assignToCompanyMutation.mutate({ ...data, userId })}
          isLoading={assignToCompanyMutation.isPending}
          companies={allCompanies.companies}
          existingCompanyIds={userCompanies?.map((cu) => cu.company.id) || []}
        />
      )}
    </div>
  );
}

function AssignToCompanyModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  companies,
  existingCompanyIds = [],
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    companyId: string;
    role: CompanyRole;
    canCreateProjects: boolean;
    canManageUsers: boolean;
    canManageAssets: boolean;
  }) => void;
  isLoading: boolean;
  companies: Array<{ id: string; name: string; type: string }>;
  existingCompanyIds?: string[];
}) {
  // Filter out companies the user is already assigned to
  const availableCompanies = companies.filter(
    (company) => !existingCompanyIds.includes(company.id)
  );
  const [formData, setFormData] = useState({
    companyId: '',
    role: 'MEMBER' as CompanyRole,
    canCreateProjects: false,
    canManageUsers: false,
    canManageAssets: true,
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
            className="rounded-[25px] p-8 max-w-md w-full"
            style={{
              background: 'rgba(44, 44, 43, 0.95)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Assign to Company
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
                <label className="block text-sm text-[#888888] mb-2">Company *</label>
                {availableCompanies.length === 0 ? (
                  <p className="text-sm text-[#888888] p-3 bg-white/5 rounded-xl">
                    This user is already assigned to all available companies.
                  </p>
                ) : (
                  <select
                    required
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    <option value="">Select a company</option>
                    {availableCompanies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name} ({company.type})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm text-[#888888] mb-2">Role *</label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as CompanyRole })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  <option value="OWNER">Owner</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MEMBER">Member</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.canCreateProjects}
                    onChange={(e) =>
                      setFormData({ ...formData, canCreateProjects: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-[#7afdd6] focus:ring-[#7afdd6]"
                  />
                  <span className="text-white text-sm" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    Can Create Projects
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.canManageUsers}
                    onChange={(e) =>
                      setFormData({ ...formData, canManageUsers: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-[#7afdd6] focus:ring-[#7afdd6]"
                  />
                  <span className="text-white text-sm" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    Can Manage Users
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.canManageAssets}
                    onChange={(e) =>
                      setFormData({ ...formData, canManageAssets: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-[#7afdd6] focus:ring-[#7afdd6]"
                  />
                  <span className="text-white text-sm" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    Can Manage Assets
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || availableCompanies.length === 0}
                className="w-full px-4 py-3 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Assigning...
                  </>
                ) : (
                  'Assign to Company'
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
