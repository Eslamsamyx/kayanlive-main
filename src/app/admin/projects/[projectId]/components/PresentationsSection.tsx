'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/trpc/react';
import { Presentation, Plus, Eye, Edit3, Trash2, Layout, X, Loader2, Presentation as PresentationIcon } from 'lucide-react';
import { format } from 'date-fns';
import { PresentationStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';

const statusConfig = {
  [PresentationStatus.DRAFT]: { label: 'Draft', color: 'text-gray-400', bg: 'bg-gray-500/20' },
  [PresentationStatus.REVIEW]: { label: 'Review', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  [PresentationStatus.READY]: { label: 'Ready', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  [PresentationStatus.PRESENTING]: { label: 'Presenting', color: 'text-green-400', bg: 'bg-green-500/20' },
  [PresentationStatus.COMPLETED]: { label: 'Completed', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  [PresentationStatus.ARCHIVED]: { label: 'Archived', color: 'text-gray-600', bg: 'bg-gray-500/10' },
};

export function PresentationsSection({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPresentation, setEditingPresentation] = useState<any>(null);

  const utils = api.useUtils();
  const { data: presentations = [] } = api.presentation.list.useQuery({ projectId });

  const createMutation = api.presentation.create.useMutation({
    onSuccess: (data) => {
      utils.presentation.list.invalidate();
      setIsCreateModalOpen(false);
      // Navigate to slide editor
      router.push(`/admin/projects/${projectId}/presentations/${data.id}/edit`);
    },
  });

  const updateMutation = api.presentation.update.useMutation({
    onSuccess: () => {
      utils.presentation.list.invalidate();
      setEditingPresentation(null);
    },
  });

  const deleteMutation = api.presentation.delete.useMutation({
    onSuccess: () => {
      utils.presentation.list.invalidate();
    },
  });

  const handleDelete = (presentationId: string) => {
    if (window.confirm('Are you sure you want to delete this presentation?')) {
      deleteMutation.mutate({ id: presentationId });
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Presentations
          </h2>
          <p className="text-[#888888] text-sm">
            {presentations.length} {presentations.length === 1 ? 'presentation' : 'presentations'}
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          <Plus size={16} />
          New Presentation
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {presentations.length === 0 ? (
          <div className="col-span-full rounded-[25px] p-12 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(122, 253, 214, 0.2)',
            }}
          >
            <Presentation className="mx-auto mb-4 text-[#7afdd6]" size={48} />
            <p className="text-[#888888]">No presentations yet</p>
          </div>
        ) : (
          presentations.map((pres, index) => {
            const status = statusConfig[pres.status];
            return (
              <motion.div
                key={pres.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-[25px] p-6 hover:shadow-xl transition-all duration-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(122, 253, 214, 0.2)',
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-[#7afdd6]/20 to-[#b8a4ff]/20 rounded-xl">
                    <Layout size={24} className="text-[#7afdd6]" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/projects/${projectId}/presentations/${pres.id}`);
                      }}
                      className="p-2 text-[#888888] hover:text-[#7afdd6] hover:bg-[#7afdd6]/10 rounded-xl transition-colors"
                      title="View/Present"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/projects/${projectId}/presentations/${pres.id}/edit`);
                      }}
                      className="p-2 text-[#888888] hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                      title="Edit Slides"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(pres.id);
                      }}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">{pres.title}</h3>
                {pres.description && (
                  <p className="text-sm text-white/60 mb-4 line-clamp-2">{pres.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                    {status.label}
                  </span>
                  <span className="text-xs text-[#888888]">
                    {pres._count?.slides || 0} slides
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-[#888888]">
                    Created {format(new Date(pres.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create Presentation Modal */}
      <CreatePresentationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(data) => createMutation.mutate({ ...data, projectId })}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}

// Create Presentation Modal Component
function CreatePresentationModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string }) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({ title: '', description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
      });
      setFormData({ title: '', description: '' });
    }
  };

  const handleClose = () => {
    setFormData({ title: '', description: '' });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-[25px] p-8 max-w-lg w-full"
            style={{
              background: 'rgba(44, 44, 43, 0.95)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)',
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Create Presentation</h2>
                <p className="text-[#888888] text-sm">
                  Create a new presentation for your project
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-[#888888] hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[#888888] mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] transition-all"
                  placeholder="e.g., Q4 Marketing Review"
                  autoFocus
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm text-[#888888] mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] transition-all"
                  placeholder="Brief description of your presentation..."
                  disabled={isLoading}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !formData.title.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Create & Edit Slides
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
