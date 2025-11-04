'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '@/trpc/react';
import { TaskStatus, Priority } from '@prisma/client';
import { X, Plus, Loader2, Calendar, Tag, Users, Target } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  initialStatus: TaskStatus;
  onSuccess: () => void;
}

const priorityOptions = [
  { value: Priority.LOW, label: 'Low', color: 'text-gray-400' },
  { value: Priority.MEDIUM, label: 'Medium', color: 'text-blue-400' },
  { value: Priority.HIGH, label: 'High', color: 'text-orange-400' },
  { value: Priority.URGENT, label: 'Urgent', color: 'text-red-400' },
];

export function CreateTaskModal({
  isOpen,
  onClose,
  projectId,
  initialStatus,
  onSuccess,
}: CreateTaskModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: Priority.MEDIUM as Priority,
    dueDate: undefined as Date | undefined,
    estimatedTime: undefined as number | undefined,
    tags: [] as string[],
    tagInput: '',
    assigneeIds: [] as string[],
    milestoneId: undefined as string | undefined,
  });

  // Fetch project collaborators for assignee selection
  const { data: projectData } = api.project.getById.useQuery(
    { id: projectId },
    { enabled: isOpen }
  );

  // Fetch project milestones
  const { data: milestones = [] } = api.milestone.list.useQuery(
    { projectId },
    { enabled: isOpen }
  );

  const createTaskMutation = api.task.create.useMutation({
    onSuccess: () => {
      setFormData({
        name: '',
        description: '',
        priority: Priority.MEDIUM,
        dueDate: undefined,
        estimatedTime: undefined,
        tags: [],
        tagInput: '',
        assigneeIds: [],
        milestoneId: undefined,
      });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate({
      projectId,
      name: formData.name,
      description: formData.description || undefined,
      status: initialStatus,
      priority: formData.priority,
      dueDate: formData.dueDate,
      estimatedTime: formData.estimatedTime,
      tags: formData.tags,
      assigneeIds: formData.assigneeIds.length > 0 ? formData.assigneeIds : undefined,
      milestoneId: formData.milestoneId,
    });
  };

  const toggleAssignee = (userId: string) => {
    setFormData({
      ...formData,
      assigneeIds: formData.assigneeIds.includes(userId)
        ? formData.assigneeIds.filter((id) => id !== userId)
        : [...formData.assigneeIds, userId],
    });
  };

  const handleAddTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.tagInput.trim()],
        tagInput: '',
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
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
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Create New Task</h2>
              <button
                onClick={onClose}
                className="p-2 text-[#888888] hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Task Name */}
              <div>
                <label className="block text-sm text-[#888888] mb-2">
                  Task Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  placeholder="Enter task name"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-[#888888] mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  placeholder="Enter task description"
                />
              </div>

              {/* Assignees */}
              <div>
                <label className="block text-sm text-[#888888] mb-2 flex items-center gap-1">
                  <Users size={14} />
                  Assign To
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-white/5 border border-white/10 rounded-xl">
                  {projectData?.collaborators && projectData.collaborators.length > 0 ? (
                    projectData.collaborators.map((collab) => (
                      <label
                        key={collab.user.id}
                        className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors group"
                      >
                        <input
                          type="checkbox"
                          checked={formData.assigneeIds.includes(collab.user.id)}
                          onChange={() => toggleAssignee(collab.user.id)}
                          className="w-4 h-4 rounded border-2 border-[#7afdd6]/30 bg-[#2c2c2b] text-[#7afdd6] focus:ring-2 focus:ring-[#7afdd6] focus:ring-offset-0 checked:bg-[#7afdd6] checked:border-[#7afdd6] hover:border-[#7afdd6]/50 transition-all cursor-pointer"
                          style={{ accentColor: '#7afdd6' }}
                        />
                        <div className="flex-1">
                          <div className="text-white text-sm group-hover:text-[#7afdd6] transition-colors">
                            {collab.user.name || collab.user.email}
                          </div>
                          <div className="text-xs text-[#888888]">{collab.role}</div>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-[#888888] text-center py-2">
                      No collaborators available. Add collaborators to the project first.
                    </p>
                  )}
                </div>
                {formData.assigneeIds.length > 0 && (
                  <p className="text-xs text-[#7afdd6] mt-1">
                    {formData.assigneeIds.length} assignee{formData.assigneeIds.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              {/* Milestone Selection */}
              <div>
                <label className="block text-sm text-[#888888] mb-2 flex items-center gap-1">
                  <Target size={14} />
                  Milestone (Optional)
                </label>
                <select
                  value={formData.milestoneId || ''}
                  onChange={(e) => setFormData({ ...formData, milestoneId: e.target.value || undefined })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                >
                  <option value="" className="bg-[#1a1a19]">No Milestone</option>
                  {milestones.map((milestone) => (
                    <option key={milestone.id} value={milestone.id} className="bg-[#1a1a19]">
                      {milestone.name} ({milestone.status.replace('_', ' ')})
                    </option>
                  ))}
                </select>
                {milestones.length === 0 && (
                  <p className="text-xs text-[#888888] mt-1">
                    No milestones available. Create a milestone first to link tasks.
                  </p>
                )}
                {formData.milestoneId && (
                  <p className="text-xs text-[#7afdd6] mt-1">
                    Task will be linked to selected milestone
                  </p>
                )}
              </div>

              {/* Priority and Due Date Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <div>
                  <label className="block text-sm text-[#888888] mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  >
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm text-[#888888] mb-2 flex items-center gap-1">
                    <Calendar size={14} />
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate ? formData.dueDate.toISOString().split('T')[0] : ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dueDate: e.target.value ? new Date(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  />
                </div>
              </div>

              {/* Estimated Time */}
              <div>
                <label className="block text-sm text-[#888888] mb-2">
                  Estimated Time (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.estimatedTime || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedTime: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  placeholder="e.g., 120"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm text-[#888888] mb-2 flex items-center gap-1">
                  <Tag size={14} />
                  Tags
                </label>
                <div className="space-y-2">
                  {/* Tag Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.tagInput}
                      onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                      onKeyDown={handleKeyDown}
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                      placeholder="Add a tag"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Tags Display */}
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-[#7afdd6]/10 text-[#7afdd6] text-xs rounded-full flex items-center gap-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-red-400 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Info */}
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-sm text-blue-400">
                  This task will be created in the <strong>{initialStatus.replace('_', ' ')}</strong> column
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createTaskMutation.isPending || !formData.name.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createTaskMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Create Task
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Error Message */}
              {createTaskMutation.error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-sm text-red-400">
                    {createTaskMutation.error.message || 'Failed to create task'}
                  </p>
                </div>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
