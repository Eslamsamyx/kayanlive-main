'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/trpc/react';
import { MilestoneStatus } from '@prisma/client';
import {
  Target,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ThumbsUp,
  MessageSquare,
  Loader2,
  Calendar,
  ListChecks,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';

interface Milestone {
  id: string;
  name: string;
  description?: string | null;
  status: MilestoneStatus;
  progress: number;
  dueDate: Date;
  startDate?: Date | null;
  deliverables: string[];
  signedOffBy: string | null;
  signedOffAt: Date | null;
  clientApproval: boolean;
  approvedBy: string | null;
  approvedAt: Date | null;
  feedback: string | null;
  _count?: {
    tasks: number;
  };
}

const statusConfig = {
  [MilestoneStatus.PENDING]: { label: 'Pending', color: 'text-gray-400', bg: 'bg-gray-500/20', icon: Clock },
  [MilestoneStatus.IN_PROGRESS]: { label: 'In Progress', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: Clock },
  [MilestoneStatus.IN_REVIEW]: { label: 'In Review', color: 'text-blue-400', bg: 'bg-blue-500/20', icon: AlertCircle },
  [MilestoneStatus.COMPLETED]: { label: 'Completed', color: 'text-green-400', bg: 'bg-green-500/20', icon: CheckCircle2 },
  [MilestoneStatus.DELAYED]: { label: 'Delayed', color: 'text-orange-400', bg: 'bg-orange-500/20', icon: AlertCircle },
  [MilestoneStatus.CANCELLED]: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/20', icon: XCircle },
};

export function MilestonesSection({ projectId }: { projectId: string }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [approvalMilestone, setApprovalMilestone] = useState<Milestone | null>(null);
  const [approvalFeedback, setApprovalFeedback] = useState('');
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());
  const [linkingMilestone, setLinkingMilestone] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'unlink' | 'signoff' | 'delete';
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
  } | null>(null);

  const { data: milestones = [], refetch } = api.milestone.list.useQuery({ projectId });
  const { data: allTasks = [], refetch: refetchTasks } = api.task.list.useQuery({ projectId });

  const createMutation = api.milestone.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsCreateModalOpen(false);
    },
  });

  const updateMutation = api.milestone.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingMilestone(null);
    },
  });

  const signOffMutation = api.milestone.signOff.useMutation({
    onSuccess: () => refetch(),
  });

  const approveMutation = api.milestone.approve.useMutation({
    onSuccess: () => {
      refetch();
      setApprovalMilestone(null);
      setApprovalFeedback('');
    },
  });

  const deleteMutation = api.milestone.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const linkTaskMutation = api.task.update.useMutation({
    onSuccess: () => {
      refetchTasks();
      refetch();
    },
  });

  const toggleMilestoneExpanded = (milestoneId: string) => {
    setExpandedMilestones((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(milestoneId)) {
        newSet.delete(milestoneId);
      } else {
        newSet.add(milestoneId);
      }
      return newSet;
    });
  };

  const getTasksForMilestone = (milestoneId: string) => {
    return allTasks.filter((task) => task.milestoneId === milestoneId);
  };

  const getUnlinkedTasks = () => {
    return allTasks.filter((task) => !task.milestoneId);
  };

  const handleLinkTask = (taskId: string, milestoneId: string) => {
    linkTaskMutation.mutate({
      id: taskId,
      milestoneId: milestoneId,
    });
    setLinkingMilestone(null);
  };

  const handleUnlinkTask = (taskId: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'unlink',
      title: 'Unlink Task',
      message: 'Are you sure you want to unlink this task from the milestone?',
      confirmText: 'Unlink',
      onConfirm: () => {
        linkTaskMutation.mutate({
          id: taskId,
          milestoneId: null,
        });
        setConfirmDialog(null);
      },
    });
  };

  const handleSignOff = (milestoneId: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'signoff',
      title: 'Sign Off Milestone',
      message: 'Are you sure you want to sign off this milestone for client review?',
      confirmText: 'Sign Off',
      onConfirm: () => {
        signOffMutation.mutate({ milestoneId });
        setConfirmDialog(null);
      },
    });
  };

  const handleApprove = (approved: boolean) => {
    if (!approvalMilestone) return;

    approveMutation.mutate({
      milestoneId: approvalMilestone.id,
      approved,
      feedback: approvalFeedback.trim() || undefined,
    });
  };

  const handleDelete = (milestoneId: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      title: 'Delete Milestone',
      message: 'Are you sure you want to delete this milestone? This action cannot be undone.',
      confirmText: 'Delete',
      onConfirm: () => {
        deleteMutation.mutate({ id: milestoneId });
        setConfirmDialog(null);
      },
    });
  };

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Project Milestones
          </h2>
          <p className="text-[#888888] text-sm">
            {milestones.length} {milestones.length === 1 ? 'milestone' : 'milestones'}
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          <Plus size={16} />
          New Milestone
        </button>
      </motion.div>

      {/* Milestones List */}
      <div className="space-y-4">
        {milestones.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-[25px] p-12 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(122, 253, 214, 0.2)',
            }}
          >
            <Target className="mx-auto mb-4 text-[#7afdd6]" size={48} />
            <p className="text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
              No milestones yet. Create one to track project progress.
            </p>
          </motion.div>
        ) : (
          milestones.map((milestone, index) => {
            const StatusIcon = statusConfig[milestone.status].icon;

            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-[25px] p-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(122, 253, 214, 0.2)',
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">{milestone.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[milestone.status].bg} ${statusConfig[milestone.status].color} flex items-center gap-1`}>
                        <StatusIcon size={14} />
                        {statusConfig[milestone.status].label}
                      </span>
                      {milestone.clientApproval && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 flex items-center gap-1">
                          <CheckCircle2 size={14} />
                          Client Approved
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {milestone.description && (
                      <p className="text-sm text-white/70 mb-2">{milestone.description}</p>
                    )}

                    {/* Meta info */}
                    <div className="flex items-center gap-4 text-xs text-[#888888]">
                      <div className="flex items-center gap-1">
                        <ListChecks size={14} />
                        <span>{milestone._count?.tasks || 0} tasks</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>Due {format(new Date(milestone.dueDate), 'MMM dd, yyyy')}</span>
                      </div>
                      {milestone.startDate && (
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>Started {format(new Date(milestone.startDate), 'MMM dd')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingMilestone(milestone)}
                      className="p-2 text-[#888888] hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(milestone.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#888888]">Progress</span>
                    <span className="text-sm font-semibold text-white">{milestone.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${milestone.progress}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="h-full bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff]"
                    />
                  </div>
                </div>

                {/* Deliverables */}
                {milestone.deliverables && milestone.deliverables.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Deliverables:</h4>
                    <div className="space-y-1">
                      {milestone.deliverables.map((deliverable, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-white/80">
                          <CheckCircle2 size={14} className="text-[#7afdd6]" />
                          {deliverable}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Approval Status */}
                <div className="border-t border-white/10 pt-4 space-y-3">
                  {/* Team Sign-off */}
                  {milestone.signedOffBy && milestone.signedOffAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <ThumbsUp size={14} className="text-blue-400" />
                      <span className="text-white/80">
                        Signed off on {format(new Date(milestone.signedOffAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}

                  {/* Client Approval */}
                  {milestone.clientApproval && milestone.approvedBy && milestone.approvedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={14} className="text-green-400" />
                      <span className="text-white/80">
                        Client approved on {format(new Date(milestone.approvedAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}

                  {/* Feedback */}
                  {milestone.feedback && (
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={14} className="text-[#7afdd6]" />
                        <span className="text-sm font-semibold text-white">Feedback:</span>
                      </div>
                      <p className="text-sm text-white/80">{milestone.feedback}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {!milestone.signedOffBy && milestone.status === MilestoneStatus.IN_PROGRESS && (
                      <button
                        onClick={() => handleSignOff(milestone.id)}
                        disabled={signOffMutation.isPending}
                        className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {signOffMutation.isPending ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <ThumbsUp size={14} />
                        )}
                        Sign Off for Review
                      </button>
                    )}

                    {milestone.signedOffBy && !milestone.clientApproval && milestone.status === MilestoneStatus.IN_REVIEW && (
                      <button
                        onClick={() => setApprovalMilestone(milestone)}
                        className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle2 size={14} />
                        Client Review
                      </button>
                    )}
                  </div>

                  {/* Linked Tasks Section */}
                  <div className="border-t border-white/10 mt-4 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => toggleMilestoneExpanded(milestone.id)}
                        className="flex items-center gap-2 text-sm font-semibold text-white hover:text-[#7afdd6] transition-colors"
                      >
                        {expandedMilestones.has(milestone.id) ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                        Tasks ({getTasksForMilestone(milestone.id).length})
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setLinkingMilestone(linkingMilestone === milestone.id ? null : milestone.id)}
                          className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center gap-1.5 text-xs"
                        >
                          <LinkIcon size={12} />
                          {linkingMilestone === milestone.id ? 'Cancel' : 'Link Task'}
                        </button>
                      </div>
                    </div>

                    {/* Task Linking Dropdown */}
                    {linkingMilestone === milestone.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-3 p-3 bg-white/5 rounded-xl border border-purple-500/20"
                      >
                        <p className="text-xs text-[#888888] mb-2">Select a task to link:</p>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {getUnlinkedTasks().length > 0 ? (
                            getUnlinkedTasks().map((task) => (
                              <button
                                key={task.id}
                                onClick={() => handleLinkTask(task.id, milestone.id)}
                                className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
                              >
                                <div className="text-sm text-white group-hover:text-[#7afdd6]">{task.name}</div>
                                <div className="text-xs text-[#888888]">{task.status.replace('_', ' ')}</div>
                              </button>
                            ))
                          ) : (
                            <p className="text-xs text-[#888888] text-center py-4">
                              No unlinked tasks available. All tasks are already linked to milestones or create a new task.
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Expanded Tasks List */}
                    {expandedMilestones.has(milestone.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        {getTasksForMilestone(milestone.id).length > 0 ? (
                          getTasksForMilestone(milestone.id).map((task) => (
                            <div
                              key={task.id}
                              className="p-3 bg-white/5 rounded-lg border border-white/10 hover:border-[#7afdd6]/30 transition-colors group"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className="text-sm font-medium text-white group-hover:text-[#7afdd6]">
                                      {task.name}
                                    </h5>
                                    <span className="px-2 py-0.5 bg-white/10 text-xs rounded-full text-[#888888]">
                                      {task.status.replace('_', ' ')}
                                    </span>
                                    {task.priority !== 'LOW' && (
                                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                                        task.priority === 'URGENT' ? 'bg-red-500/20 text-red-400' :
                                        task.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                                        'bg-blue-500/20 text-blue-400'
                                      }`}>
                                        {task.priority}
                                      </span>
                                    )}
                                  </div>
                                  {task.description && (
                                    <p className="text-xs text-[#888888] line-clamp-1">{task.description}</p>
                                  )}
                                  <div className="flex items-center gap-3 mt-1 text-xs text-[#888888]">
                                    {task.dueDate && (
                                      <div className="flex items-center gap-1">
                                        <Calendar size={10} />
                                        {format(new Date(task.dueDate), 'MMM dd')}
                                      </div>
                                    )}
                                    {task.assignees && task.assignees.length > 0 && (
                                      <div className="flex -space-x-1">
                                        {task.assignees.slice(0, 2).map((assignee) => (
                                          <div
                                            key={assignee.id}
                                            className="w-5 h-5 rounded-full bg-gradient-to-br from-[#7afdd6] to-[#b8a4ff] flex items-center justify-center text-[10px] font-semibold text-[#2c2c2b] border border-[#2c2c2b]"
                                            title={assignee.name || ''}
                                          >
                                            {assignee.name?.[0] || 'U'}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleUnlinkTask(task.id)}
                                  className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                  title="Unlink task"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-[#888888] text-center py-4">
                            No tasks linked yet. Link existing tasks or create new ones.
                          </p>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmDialog(null)}
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
                border: `2px solid ${
                  confirmDialog.type === 'delete' ? 'rgba(255, 77, 77, 0.3)' :
                  confirmDialog.type === 'unlink' ? 'rgba(184, 164, 255, 0.3)' :
                  'rgba(122, 253, 214, 0.3)'
                }`,
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              <div className="text-center">
                <div className={`mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center ${
                  confirmDialog.type === 'delete' ? 'bg-red-500/20' :
                  confirmDialog.type === 'unlink' ? 'bg-purple-500/20' :
                  'bg-blue-500/20'
                }`}>
                  <AlertTriangle className={
                    confirmDialog.type === 'delete' ? 'text-red-400' :
                    confirmDialog.type === 'unlink' ? 'text-purple-400' :
                    'text-blue-400'
                  } size={24} />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  {confirmDialog.title}
                </h2>

                <p className="text-[#888888] mb-6">
                  {confirmDialog.message}
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={() => setConfirmDialog(null)}
                    className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={confirmDialog.onConfirm}
                    disabled={linkTaskMutation.isPending || signOffMutation.isPending || deleteMutation.isPending}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                      confirmDialog.type === 'delete' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
                      confirmDialog.type === 'unlink' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' :
                      'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    }`}
                  >
                    {(linkTaskMutation.isPending || signOffMutation.isPending || deleteMutation.isPending) ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      confirmDialog.confirmText
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Client Approval Modal */}
      <AnimatePresence>
        {approvalMilestone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setApprovalMilestone(null)}
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
              <h3 className="text-xl font-bold text-white mb-4">Client Review</h3>
              <p className="text-white/80 mb-4">
                Review milestone: <strong>{approvalMilestone.name}</strong>
              </p>

              <div className="mb-6">
                <label className="block text-sm text-[#888888] mb-2">Feedback (optional)</label>
                <textarea
                  value={approvalFeedback}
                  onChange={(e) => setApprovalFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  placeholder="Provide feedback..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(true)}
                  disabled={approveMutation.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {approveMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Check size={16} />
                      Approve
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleApprove(false)}
                  disabled={approveMutation.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <X size={16} />
                  Request Changes
                </button>
              </div>

              <button
                onClick={() => setApprovalMilestone(null)}
                className="w-full mt-3 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Milestone Modal - Simplified for now */}
      {(isCreateModalOpen || editingMilestone) && (
        <CreateMilestoneModal
          isOpen={isCreateModalOpen || !!editingMilestone}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingMilestone(null);
          }}
          projectId={projectId}
          milestone={editingMilestone}
          onSuccess={() => {
            refetch();
            setIsCreateModalOpen(false);
            setEditingMilestone(null);
          }}
        />
      )}
    </div>
  );
}

// Create Milestone Modal Component
function CreateMilestoneModal({
  isOpen,
  onClose,
  projectId,
  milestone,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  milestone: Milestone | null;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: milestone?.name || '',
    description: milestone?.description || '',
    dueDate: milestone ? new Date((milestone as any).dueDate) : new Date(),
    startDate: milestone?.startDate ? new Date((milestone as any).startDate) : undefined,
    deliverables: milestone?.deliverables || [],
    deliverableInput: '',
    progress: milestone?.progress || 0,
  });

  const createMutation = api.milestone.create.useMutation({
    onSuccess: () => onSuccess(),
  });

  const updateMutation = api.milestone.update.useMutation({
    onSuccess: () => onSuccess(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (milestone) {
      updateMutation.mutate({
        milestoneId: milestone.id,
        name: formData.name,
        description: formData.description,
        dueDate: formData.dueDate,
        startDate: formData.startDate,
        deliverables: formData.deliverables,
        progress: formData.progress,
      });
    } else {
      createMutation.mutate({
        projectId,
        name: formData.name,
        description: formData.description,
        dueDate: formData.dueDate,
        startDate: formData.startDate,
        deliverables: formData.deliverables,
      });
    }
  };

  const handleAddDeliverable = () => {
    if (formData.deliverableInput.trim()) {
      setFormData({
        ...formData,
        deliverables: [...formData.deliverables, formData.deliverableInput.trim()],
        deliverableInput: '',
      });
    }
  };

  const handleRemoveDeliverable = (index: number) => {
    setFormData({
      ...formData,
      deliverables: formData.deliverables.filter((_, i) => i !== index),
    });
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
            className="rounded-[25px] p-8 max-w-2xl w-full"
            style={{
              background: 'rgba(44, 44, 43, 0.95)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)',
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {milestone ? 'Edit Milestone' : 'Create Milestone'}
              </h2>
              <button onClick={onClose} className="p-2 text-[#888888] hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[#888888] mb-2">
                  Milestone Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  placeholder="Enter milestone name"
                />
              </div>

              <div>
                <label className="block text-sm text-[#888888] mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  placeholder="Enter milestone description"
                />
              </div>

              <div>
                <label className="block text-sm text-[#888888] mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value ? new Date(e.target.value) : undefined })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                />
              </div>

              <div>
                <label className="block text-sm text-[#888888] mb-2">
                  Due Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.dueDate.toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, dueDate: new Date(e.target.value) })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                />
              </div>

              {milestone && (
                <div>
                  <label className="block text-sm text-[#888888] mb-2">
                    Progress: {formData.progress}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-[#888888] mb-2">Deliverables</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.deliverableInput}
                      onChange={(e) => setFormData({ ...formData, deliverableInput: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDeliverable())}
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                      placeholder="Add a deliverable"
                    />
                    <button
                      type="button"
                      onClick={handleAddDeliverable}
                      className="px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {formData.deliverables.length > 0 && (
                    <div className="space-y-1">
                      {formData.deliverables.map((deliverable, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-xl">
                          <span className="text-sm text-white">{deliverable}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDeliverable(idx)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin mx-auto" />
                  ) : milestone ? (
                    'Save Changes'
                  ) : (
                    'Create Milestone'
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20"
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
