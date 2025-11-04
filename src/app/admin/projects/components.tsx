import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { type ProjectStatus, type Project } from '@prisma/client';
import { api } from '@/trpc/react';
import Link from 'next/link';
import {
  FolderKanban,
  Users,
  Building2,
  Edit3,
  Trash2,
  X,
  Check,
  Loader2,
  AlertTriangle,
  Calendar,
  DollarSign,
  FileQuestion,
  UserPlus,
  UserMinus,
  Plus,
  Shield,
  Edit,
  XCircle,
  ArrowRight,
} from 'lucide-react';

type ExtendedProject = Project & {
  company: { id: string; name: string };
  creator: { id: string; name: string | null; email: string };
  _count?: { collaborators?: number; questionnaires?: number; assets?: number };
};

type ProjectDetailsType = ExtendedProject & {
  collaborators: Array<{
    id: string;
    role: string;
    canEdit: boolean;
    canDelete: boolean;
    canInvite: boolean;
    user: {
      id: string;
      name: string | null;
      email: string;
      role: string;
    };
  }>;
  questionnaires: Array<{
    id: string;
    questionnaireId: string;
    isComplete: boolean;
    submittedAt: Date | null;
    createdAt: Date;
  }>;
};

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-500/20 text-gray-400',
  PLANNING: 'bg-blue-500/20 text-blue-400',
  IN_PROGRESS: 'bg-yellow-500/20 text-yellow-400',
  REVIEW: 'bg-purple-500/20 text-purple-400',
  COMPLETED: 'bg-green-500/20 text-green-400',
  ARCHIVED: 'bg-red-500/20 text-red-400',
};

export function ProjectItem({
  project,
  isSelected,
  onSelect,
  onDelete,
  index,
}: {
  project: ExtendedProject;
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
              {project.name}
            </h4>
            <span
              className={`px-2 py-1 rounded-full text-xs ${statusColors[project.status]}`}
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              {project.status}
            </span>
          </div>

          {project.description && (
            <p className="text-sm text-[#888888] mb-2 line-clamp-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
              {project.description}
            </p>
          )}

          <div className="flex items-center gap-2 mb-2">
            <Building2 size={14} className="text-[#7afdd6]" />
            <span className="text-xs text-[#888888]">{project.company.name}</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#888888]">
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{project._count?.collaborators || 0} collaborators</span>
            </div>
            <div className="flex items-center gap-1">
              <FileQuestion size={14} />
              <span>{project._count?.questionnaires || 0} briefs</span>
            </div>
            {project.budget && (
              <div className="flex items-center gap-1">
                <DollarSign size={14} />
                <span>${project.budget.toLocaleString()}</span>
              </div>
            )}
          </div>

          {project.startDate && (
            <div className="flex items-center gap-2 mt-2 text-xs text-[#888888]">
              <Calendar size={14} className="text-[#7afdd6]" />
              <span>{format(new Date(project.startDate), 'MMM dd, yyyy')}</span>
              {project.endDate && (
                <>
                  <span>→</span>
                  <span>{format(new Date(project.endDate), 'MMM dd, yyyy')}</span>
                </>
              )}
            </div>
          )}
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

export function ProjectDetails({
  project,
  onUpdate,
  onAddCollaborator,
  onRemoveCollaborator,
  onLinkQuestionnaire,
  onUnlinkQuestionnaire,
}: {
  project: ProjectDetailsType;
  onUpdate: (data: any) => void;
  onAddCollaborator: () => void;
  onRemoveCollaborator: (userId: string) => void;
  onLinkQuestionnaire: () => void;
  onUnlinkQuestionnaire: (submissionId: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || '',
    status: project.status,
    startDate: project.startDate ? new Date(project.startDate) : null,
    endDate: project.endDate ? new Date(project.endDate) : null,
    budget: project.budget || null,
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
          Project Details
        </h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 text-[#7afdd6] hover:bg-[#7afdd6]/20 rounded-lg transition-all duration-300"
        >
          {isEditing ? <X size={20} /> : <Edit3 size={20} />}
        </button>
      </div>

      {/* View Full Project Button */}
      <div className="px-6 pt-6">
        <Link href={`/admin/projects/${project.id}`}>
          <button
            className="w-full px-6 py-4 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 group"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            <FolderKanban size={20} />
            <span>Open Project Management</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>
        <p className="text-xs text-[#888888] text-center mt-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
          Access Kanban board, milestones, meetings, and assets
        </p>
      </div>

      <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#888888] mb-2">Project Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#888888] mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#888888] mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
              >
                <option value="DRAFT">Draft</option>
                <option value="PLANNING">Planning</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#888888] mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate ? format(formData.startDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value ? new Date(e.target.value) : null })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                />
              </div>

              <div>
                <label className="block text-sm text-[#888888] mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.endDate ? format(formData.endDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value ? new Date(e.target.value) : null })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#888888] mb-2">Budget ($)</label>
              <input
                type="number"
                value={formData.budget || ''}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
              />
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
              <h4 className="text-2xl font-bold text-white mb-2">{project.name}</h4>
              <span
                className={`px-3 py-1 rounded-full text-sm ${statusColors[project.status]}`}
              >
                {project.status}
              </span>
            </div>

            {project.description && (
              <p className="text-[#888888]">{project.description}</p>
            )}

            <div className="flex items-center gap-3 text-[#888888]">
              <Building2 size={16} className="text-[#7afdd6]" />
              <span>{project.company.name}</span>
            </div>

            {project.startDate && (
              <div className="flex items-center gap-3 text-[#888888]">
                <Calendar size={16} className="text-[#7afdd6]" />
                <span>
                  {format(new Date(project.startDate), 'MMM dd, yyyy')}
                  {project.endDate && ` → ${format(new Date(project.endDate), 'MMM dd, yyyy')}`}
                </span>
              </div>
            )}

            {project.budget && (
              <div className="flex items-center gap-3 text-[#888888]">
                <DollarSign size={16} className="text-[#7afdd6]" />
                <span>${project.budget.toLocaleString()}</span>
              </div>
            )}

            <div className="pt-4 border-t border-[#7afdd6]/20">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-semibold text-[#7afdd6]">Collaborators</h5>
                <button
                  onClick={onAddCollaborator}
                  className="p-2 text-[#7afdd6] hover:bg-[#7afdd6]/20 rounded-lg transition-all"
                >
                  <UserPlus size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {project.collaborators.map((collab) => (
                  <div key={collab.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex-1">
                      <div className="text-white text-sm">{collab.user.name || collab.user.email}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#888888]">{collab.role}</span>
                        <div className="flex gap-1">
                          {collab.canEdit && <span title="Can Edit"><Shield size={12} className="text-[#7afdd6]" /></span>}
                          {collab.canDelete && <span title="Can Delete"><Trash2 size={12} className="text-red-400" /></span>}
                          {collab.canInvite && <span title="Can Invite"><UserPlus size={12} className="text-blue-400" /></span>}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveCollaborator(collab.user.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                    >
                      <UserMinus size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#7afdd6]/20">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-semibold text-[#7afdd6]">Questionnaire Submissions</h5>
                <button
                  onClick={onLinkQuestionnaire}
                  className="p-2 text-[#7afdd6] hover:bg-[#7afdd6]/20 rounded-lg transition-all"
                  title="Link Questionnaire"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {project.questionnaires.map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex-1">
                      <div className="text-white text-sm">{submission.questionnaireId}</div>
                      <div className="text-xs text-[#888888]">
                        {submission.isComplete ? (
                          <span className="text-green-400">Completed</span>
                        ) : (
                          <span className="text-yellow-400">In Progress</span>
                        )}
                        {' · '}
                        {format(new Date(submission.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    <button
                      onClick={() => onUnlinkQuestionnaire(submission.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                      title="Unlink Questionnaire"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {project.questionnaires.length === 0 && (
                  <p className="text-sm text-[#888888]">No submissions yet</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  companies,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  companies: Array<{ id: string; name: string }>;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    companyId: '',
    status: 'DRAFT' as ProjectStatus,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    budget: undefined as number | undefined,
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
                Create New Project
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
                <label className="block text-sm text-[#888888] mb-2">Project Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm text-[#888888] mb-2">Company *</label>
                <select
                  required
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                >
                  <option value="">Select a company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#888888] mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  placeholder="Enter project description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#888888] mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PLANNING">Planning</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#888888] mb-2">Budget ($)</label>
                  <input
                    type="number"
                    value={formData.budget || ''}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#888888] mb-2">Start Date</label>
                  <input
                    type="date"
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value ? new Date(e.target.value) : undefined })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#888888] mb-2">End Date</label>
                  <input
                    type="date"
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value ? new Date(e.target.value) : undefined })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  />
                </div>
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
                  'Create Project'
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
  project,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  project: ExtendedProject;
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
                Delete Project
              </h2>

              <p className="text-[#888888] mb-6" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Are you sure you want to delete <span className="text-white font-semibold">{project.name}</span>?
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

export function AddCollaboratorModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  companyId,
  projectId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  companyId: string;
  projectId: string;
}) {
  const [formData, setFormData] = useState({
    userId: '',
    role: 'MEMBER',
    canEdit: true,
    canDelete: false,
    canInvite: false,
  });

  // Get available collaborators (company users who aren't already collaborators)
  const { data: availableUsers = [], isLoading: isLoadingUsers } = api.project.getAvailableCollaborators.useQuery(
    { projectId },
    { enabled: isOpen }
  );

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
                Add Collaborator
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
                <label className="block text-sm text-[#888888] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>User *</label>
                <select
                  required
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full px-4 py-3 bg-[#2c2c2b] border border-[#7afdd6]/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6] hover:border-[#7afdd6]/50 transition-all appearance-none cursor-pointer"
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%237afdd6' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="" className="bg-[#1a1a19] text-gray-400">
                    {isLoadingUsers ? 'Loading users...' : availableUsers.length === 0 ? 'No users available' : 'Select a user'}
                  </option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id} className="bg-[#1a1a19] text-white py-2">
                      {user.name || user.email} ({user.role})
                    </option>
                  ))}
                </select>
                {!isLoadingUsers && availableUsers.length === 0 && (
                  <p className="text-xs text-yellow-400 mt-2">
                    All company users are already collaborators on this project.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-[#888888] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 bg-[#2c2c2b] border border-[#7afdd6]/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6] hover:border-[#7afdd6]/50 transition-all appearance-none cursor-pointer"
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%237afdd6' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="LEAD" className="bg-[#1a1a19] text-white py-2">Lead</option>
                  <option value="MEMBER" className="bg-[#1a1a19] text-white py-2">Member</option>
                  <option value="VIEWER" className="bg-[#1a1a19] text-white py-2">Viewer</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.canEdit}
                    onChange={(e) => setFormData({ ...formData, canEdit: e.target.checked })}
                    className="w-5 h-5 rounded border-2 border-[#7afdd6]/30 bg-[#2c2c2b] text-[#7afdd6] focus:ring-2 focus:ring-[#7afdd6] focus:ring-offset-0 checked:bg-[#7afdd6] checked:border-[#7afdd6] hover:border-[#7afdd6]/50 transition-all cursor-pointer"
                    style={{ accentColor: '#7afdd6' }}
                  />
                  <span className="text-white group-hover:text-[#7afdd6] transition-colors" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    Can Edit
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.canDelete}
                    onChange={(e) => setFormData({ ...formData, canDelete: e.target.checked })}
                    className="w-5 h-5 rounded border-2 border-[#7afdd6]/30 bg-[#2c2c2b] text-[#7afdd6] focus:ring-2 focus:ring-[#7afdd6] focus:ring-offset-0 checked:bg-[#7afdd6] checked:border-[#7afdd6] hover:border-[#7afdd6]/50 transition-all cursor-pointer"
                    style={{ accentColor: '#7afdd6' }}
                  />
                  <span className="text-white group-hover:text-[#7afdd6] transition-colors" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    Can Delete
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.canInvite}
                    onChange={(e) => setFormData({ ...formData, canInvite: e.target.checked })}
                    className="w-5 h-5 rounded border-2 border-[#7afdd6]/30 bg-[#2c2c2b] text-[#7afdd6] focus:ring-2 focus:ring-[#7afdd6] focus:ring-offset-0 checked:bg-[#7afdd6] checked:border-[#7afdd6] hover:border-[#7afdd6]/50 transition-all cursor-pointer"
                    style={{ accentColor: '#7afdd6' }}
                  />
                  <span className="text-white group-hover:text-[#7afdd6] transition-colors" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    Can Invite
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || isLoadingUsers || availableUsers.length === 0 || !formData.userId}
                className="w-full px-4 py-3 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Collaborator'
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function LinkQuestionnaireModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  questionnaires,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (submissionId: string) => void;
  isLoading: boolean;
  questionnaires: Array<{
    id: string;
    questionnaireId: string;
    isComplete: boolean;
    submittedAt: Date | null;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
}) {
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQuestionnaire) {
      onSubmit(selectedQuestionnaire);
      setSelectedQuestionnaire('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-[25px] p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            style={{
              background: 'rgba(20, 20, 19, 0.95)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-2xl font-semibold text-[#7afdd6]"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Link Questionnaire
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <label
                  className="text-sm font-medium text-white"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Select Questionnaire
                </label>

                {questionnaires.length === 0 ? (
                  <div className="text-center p-6 bg-white/5 rounded-xl">
                    <FileQuestion className="mx-auto mb-3 text-[#7afdd6]" size={48} />
                    <p className="text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                      No available questionnaires to link
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {questionnaires.map((q) => (
                      <div
                        key={q.id}
                        onClick={() => setSelectedQuestionnaire(q.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedQuestionnaire === q.id
                            ? 'border-[#7afdd6] bg-[#7afdd6]/10'
                            : 'border-white/10 bg-white/5 hover:border-[#7afdd6]/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-white font-medium" style={{ fontFamily: '"Poppins", sans-serif' }}>
                                {q.questionnaireId}
                              </h4>
                              {q.isComplete ? (
                                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                                  Completed
                                </span>
                              ) : (
                                <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                                  In Progress
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                              <div>Submitted by: {q.user.name || q.user.email}</div>
                              <div>Created: {format(new Date(q.createdAt), 'MMM dd, yyyy')}</div>
                            </div>
                          </div>
                          {selectedQuestionnaire === q.id && (
                            <Check size={24} className="text-[#7afdd6] flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {questionnaires.length > 0 && (
                <button
                  type="submit"
                  disabled={isLoading || !selectedQuestionnaire}
                  className="w-full px-4 py-3 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Linking...
                    </>
                  ) : (
                    'Link Questionnaire'
                  )}
                </button>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
