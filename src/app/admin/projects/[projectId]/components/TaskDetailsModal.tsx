'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '@/trpc/react';
import { TaskStatus, Priority } from '@prisma/client';
import {
  X,
  Trash2,
  Calendar,
  Clock,
  Tag,
  User,
  MessageSquare,
  Send,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Users,
  Target,
} from 'lucide-react';
import { format } from 'date-fns';

interface TaskDetailsModalProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const priorityConfig = {
  [Priority.LOW]: { label: 'Low', color: 'text-gray-400', bg: 'bg-gray-500/20', icon: null },
  [Priority.MEDIUM]: { label: 'Medium', color: 'text-blue-400', bg: 'bg-blue-500/20', icon: null },
  [Priority.HIGH]: { label: 'High', color: 'text-orange-400', bg: 'bg-orange-500/20', icon: AlertCircle },
  [Priority.URGENT]: { label: 'Urgent', color: 'text-red-400', bg: 'bg-red-500/20', icon: AlertTriangle },
};

const statusOptions = [
  { value: TaskStatus.CONCEPT, label: 'Concept' },
  { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
  { value: TaskStatus.IN_REVIEW, label: 'In Review' },
  { value: TaskStatus.COMPLETED, label: 'Completed' },
  { value: TaskStatus.APPROVED, label: 'Approved' },
];

export function TaskDetailsModal({ taskId, isOpen, onClose, onUpdate }: TaskDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: TaskStatus.CONCEPT as TaskStatus,
    priority: Priority.MEDIUM as Priority,
    dueDate: null as Date | null,
    estimatedTime: null as number | null,
    actualTime: null as number | null,
    tags: [] as string[],
    assigneeIds: [] as string[],
    milestoneId: null as string | null,
  });

  const { data: task, refetch } = api.task.get.useQuery(
    { id: taskId },
    { enabled: isOpen }
  );

  // Fetch project data to get available collaborators
  const { data: projectData } = api.project.getById.useQuery(
    { id: task?.projectId || '' },
    { enabled: !!task?.projectId && isOpen }
  );

  // Fetch project milestones
  const { data: milestones = [] } = api.milestone.list.useQuery(
    { projectId: task?.projectId || '' },
    { enabled: !!task?.projectId && isOpen }
  );

  const updateTaskMutation = api.task.update.useMutation({
    onSuccess: () => {
      refetch();
      onUpdate();
      setIsEditing(false);
    },
  });

  const deleteTaskMutation = api.task.delete.useMutation({
    onSuccess: () => {
      onUpdate();
      onClose();
    },
  });

  const addCommentMutation = api.task.addComment.useMutation({
    onSuccess: () => {
      refetch();
      setNewComment('');
    },
  });

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        estimatedTime: task.estimatedTime,
        actualTime: task.actualTime,
        tags: task.tags,
        assigneeIds: task.assignees?.map((a) => a.id) || [],
        milestoneId: task.milestoneId || null,
      });
    }
  }, [task]);

  const handleSave = () => {
    updateTaskMutation.mutate({
      id: taskId,
      ...formData,
      assigneeIds: formData.assigneeIds.length > 0 ? formData.assigneeIds : undefined,
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

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate({ id: taskId });
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate({
        taskId,
        content: newComment.trim(),
      });
    }
  };

  if (!task) return null;

  const PriorityIcon = priorityConfig[task.priority].icon;

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
            className="rounded-[25px] p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
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
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-2xl font-bold text-white bg-white/10 border border-white/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-white">{task.name}</h2>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityConfig[task.priority].bg} ${priorityConfig[task.priority].color} flex items-center gap-1`}>
                    {PriorityIcon && <PriorityIcon size={14} />}
                    {priorityConfig[task.priority].label}
                  </span>
                  {task.dueDate && (
                    <span className="text-xs text-[#888888] flex items-center gap-1">
                      <Calendar size={12} />
                      Due {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={updateTaskMutation.isPending}
                      className="px-4 py-2 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                    >
                      {updateTaskMutation.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        'Save'
                      )}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
                  title="Delete task"
                >
                  <Trash2 size={20} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-[#888888] hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <div>
                  <label className="block text-sm text-[#888888] mb-2">Description</label>
                  {isEditing ? (
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                      placeholder="Enter task description"
                    />
                  ) : (
                    <p className="text-white/80 whitespace-pre-wrap">
                      {task.description || 'No description provided'}
                    </p>
                  )}
                </div>

                {/* Comments Section */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <MessageSquare size={20} />
                    Comments ({task.taskComments?.length || 0})
                  </h3>

                  {/* Add Comment Form */}
                  <form onSubmit={handleAddComment} className="mb-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                      />
                      <button
                        type="submit"
                        disabled={!newComment.trim() || addCommentMutation.isPending}
                        className="px-4 py-3 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {task.taskComments && task.taskComments.length > 0 ? (
                      task.taskComments.map((comment) => (
                        <div
                          key={comment.id}
                          className="p-3 rounded-xl bg-white/5 border border-white/10"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7afdd6] to-[#b8a4ff] flex items-center justify-center text-xs font-semibold text-[#2c2c2b]">
                              {comment.user.name?.[0] || 'U'}
                            </div>
                            <span className="text-sm font-medium text-white">
                              {comment.user.name}
                            </span>
                            <span className="text-xs text-[#888888]">
                              {format(new Date(comment.createdAt), 'MMM dd, HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm text-white/80 ml-8">{comment.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-[#888888] py-4">No comments yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Status */}
                <div>
                  <label className="block text-sm text-[#888888] mb-2">Status</label>
                  {isEditing ? (
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-white">{statusOptions.find(s => s.value === task.status)?.label}</p>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm text-[#888888] mb-2">Priority</label>
                  {isEditing ? (
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                    >
                      {Object.entries(priorityConfig).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-white">{priorityConfig[task.priority].label}</p>
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm text-[#888888] mb-2 flex items-center gap-1">
                    <Calendar size={14} />
                    Due Date
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.dueDate ? format(formData.dueDate, 'yyyy-MM-dd') : ''}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value ? new Date(e.target.value) : null })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                    />
                  ) : (
                    <p className="text-white">
                      {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'Not set'}
                    </p>
                  )}
                </div>

                {/* Time Tracking */}
                <div>
                  <label className="block text-sm text-[#888888] mb-2 flex items-center gap-1">
                    <Clock size={14} />
                    Time Tracking
                  </label>
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="number"
                        value={formData.estimatedTime || ''}
                        onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value ? parseInt(e.target.value) : null })}
                        placeholder="Estimated (minutes)"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                      />
                      <input
                        type="number"
                        value={formData.actualTime || ''}
                        onChange={(e) => setFormData({ ...formData, actualTime: e.target.value ? parseInt(e.target.value) : null })}
                        placeholder="Actual (minutes)"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1 text-sm">
                      <p className="text-white/80">
                        Estimated: {task.estimatedTime ? `${task.estimatedTime} min` : 'Not set'}
                      </p>
                      <p className="text-white/80">
                        Actual: {task.actualTime ? `${task.actualTime} min` : 'Not set'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Assignees */}
                <div>
                  <label className="block text-sm text-[#888888] mb-2 flex items-center gap-1">
                    <Users size={14} />
                    Assignees
                  </label>
                  {isEditing ? (
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
                          No collaborators available
                        </p>
                      )}
                      {formData.assigneeIds.length > 0 && (
                        <p className="text-xs text-[#7afdd6] mt-1 px-2">
                          {formData.assigneeIds.length} assignee{formData.assigneeIds.length > 1 ? 's' : ''} selected
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {task.assignees && task.assignees.length > 0 ? (
                        task.assignees.map((assignee) => (
                          <div
                            key={assignee.id}
                            className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full"
                          >
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#7afdd6] to-[#b8a4ff] flex items-center justify-center text-xs font-semibold text-[#2c2c2b]">
                              {assignee.name?.[0] || 'U'}
                            </div>
                            <span className="text-sm text-white">{assignee.name || assignee.email}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-white/60 text-sm">No assignees</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Milestone */}
                <div>
                  <label className="block text-sm text-[#888888] mb-2 flex items-center gap-1">
                    <Target size={14} />
                    Milestone
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.milestoneId || ''}
                      onChange={(e) => setFormData({ ...formData, milestoneId: e.target.value || null })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                    >
                      <option value="" className="bg-[#1a1a19]">No Milestone</option>
                      {milestones.map((milestone) => (
                        <option key={milestone.id} value={milestone.id} className="bg-[#1a1a19]">
                          {milestone.name} ({milestone.status.replace('_', ' ')})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-white">
                      {task.milestone ? task.milestone.name : 'Not linked'}
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm text-[#888888] mb-2 flex items-center gap-1">
                    <Tag size={14} />
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {task.tags && task.tags.length > 0 ? (
                      task.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-[#7afdd6]/10 text-[#7afdd6] text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <p className="text-white/60 text-sm">No tags</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
