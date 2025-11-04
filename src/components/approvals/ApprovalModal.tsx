'use client';

import { api } from '@/trpc/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  User,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';

interface ApprovalModalProps {
  milestoneId: string;
  onClose: () => void;
}

export function ApprovalModal({ milestoneId, onClose }: ApprovalModalProps) {
  const [feedback, setFeedback] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const utils = api.useUtils();

  const { data: milestone, isLoading } = api.milestone.get.useQuery({
    id: milestoneId,
  });

  const approveMutation = api.milestone.approve.useMutation({
    onSuccess: (data) => {
      toast.success(
        data.clientApproval
          ? 'Milestone approved successfully'
          : 'Feedback submitted successfully'
      );
      utils.milestone.getPendingApprovals.invalidate();
      utils.milestone.list.invalidate();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to process approval');
    },
  });

  const handleApprove = () => {
    setActionType('approve');
    setShowFeedbackForm(true);
  };

  const handleReject = () => {
    setActionType('reject');
    setShowFeedbackForm(true);
  };

  const handleSubmit = () => {
    if (actionType === 'reject' && !feedback.trim()) {
      toast.error('Please provide feedback for rejection');
      return;
    }

    approveMutation.mutate({
      milestoneId,
      approved: actionType === 'approve',
      feedback: feedback.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-3xl rounded-xl border border-[#333] bg-[#2c2c2b] p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-2/3 bg-[#1a1a19] rounded" />
            <div className="h-4 w-1/2 bg-[#1a1a19] rounded" />
            <div className="h-32 bg-[#1a1a19] rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!milestone) {
    return null;
  }

  const isOverdue = milestone.dueDate && new Date(milestone.dueDate) < new Date();
  const completedTasks = milestone.tasks.filter((t) => t.status === 'COMPLETED').length;
  const totalTasks = milestone.tasks.length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border border-[#333] bg-[#2c2c2b] shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-[#2c2c2b] border-b border-[#333] px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-bold text-white">{milestone.name}</h2>
                  {isOverdue && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-500/10 text-red-400">
                      <AlertCircle className="h-3 w-3" />
                      Overdue
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-yellow-500/10 text-yellow-400">
                    <Clock className="h-3 w-3" />
                    Pending Approval
                  </span>
                </div>
                <p className="text-sm text-[#b2b2b2]">
                  Project: {milestone.project.name}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-[#1a1a19] transition-colors"
              >
                <X className="h-5 w-5 text-[#b2b2b2]" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-[#7afdd6]" />
                <span className="text-[#666]">Due Date:</span>
                <span className="text-white">
                  {milestone.dueDate ? format(new Date(milestone.dueDate), 'MMM d, yyyy') : 'No due date'}
                </span>
              </div>

              {milestone.signedOffUser && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-[#7afdd6]" />
                  <span className="text-[#666]">Signed Off By:</span>
                  <span className="text-white">{milestone.signedOffUser.name}</span>
                </div>
              )}

              {milestone.startDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-[#7afdd6]" />
                  <span className="text-[#666]">Start Date:</span>
                  <span className="text-white">
                    {format(new Date(milestone.startDate), 'MMM d, yyyy')}
                  </span>
                </div>
              )}

              {milestone.progress !== null && milestone.progress !== undefined && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-[#7afdd6]" />
                  <span className="text-[#666]">Progress:</span>
                  <span className="text-white">{milestone.progress}%</span>
                </div>
              )}
            </div>

            {/* Description */}
            {milestone.description && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#7afdd6]" />
                  Description
                </h3>
                <p className="text-sm text-[#b2b2b2] leading-relaxed">
                  {milestone.description}
                </p>
              </div>
            )}

            {/* Tasks */}
            {milestone.tasks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">
                  Tasks ({completedTasks}/{totalTasks} completed)
                </h3>
                <div className="h-2 bg-[#1a1a19] rounded-full overflow-hidden mb-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${taskProgress}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-[#7afdd6]"
                  />
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {milestone.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 rounded-lg bg-[#1a1a19] p-3"
                    >
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded ${
                          task.status === 'COMPLETED'
                            ? 'bg-[#7afdd6]'
                            : 'border-2 border-[#333]'
                        }`}
                      >
                        {task.status === 'COMPLETED' && (
                          <CheckCircle2 className="h-4 w-4 text-[#2c2c2b]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{task.name}</p>
                        {task.dueDate && (
                          <p className="text-xs text-[#666]">
                            Due: {format(new Date(task.dueDate), 'MMM d')}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          task.status === 'COMPLETED'
                            ? 'bg-[#7afdd6]/10 text-[#7afdd6]'
                            : task.status === 'IN_PROGRESS'
                              ? 'bg-blue-500/10 text-blue-400'
                              : 'bg-[#333] text-[#666]'
                        }`}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deliverables */}
            {milestone.deliverables && milestone.deliverables.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Deliverables</h3>
                <div className="grid gap-2">
                  {milestone.deliverables.map((deliverable, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-lg bg-[#1a1a19] px-4 py-2"
                    >
                      <FileText className="h-4 w-4 text-[#7afdd6]" />
                      <span className="text-sm text-white">{deliverable}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback Form */}
            {showFeedbackForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="border border-[#333] rounded-lg p-4 bg-[#1a1a19]"
              >
                <label className="block text-sm font-semibold text-white mb-2">
                  {actionType === 'approve' ? 'Approval Note (Optional)' : 'Feedback (Required)'}
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={
                    actionType === 'approve'
                      ? 'Add any additional notes...'
                      : 'Please provide specific feedback on what needs to be changed...'
                  }
                  className="w-full h-32 bg-[#2c2c2b] border border-[#333] rounded-lg px-4 py-3 text-sm text-white placeholder:text-[#666] focus:border-[#7afdd6] focus:outline-none focus:ring-1 focus:ring-[#7afdd6] resize-none"
                />
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-[#2c2c2b] border-t border-[#333] px-6 py-4">
            {!showFeedbackForm ? (
              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  disabled={approveMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-red-500/50 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                  <XCircle className="h-5 w-5" />
                  Request Changes
                </button>
                <button
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#7afdd6] px-4 py-3 text-sm font-medium text-[#2c2c2b] hover:bg-[#6ee8c5] transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Approve Milestone
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowFeedbackForm(false);
                    setActionType(null);
                    setFeedback('');
                  }}
                  disabled={approveMutation.isPending}
                  className="px-4 py-3 text-sm font-medium text-[#b2b2b2] hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={approveMutation.isPending}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors disabled:opacity-50 ${
                    actionType === 'approve'
                      ? 'bg-[#7afdd6] text-[#2c2c2b] hover:bg-[#6ee8c5]'
                      : 'border border-red-500/50 text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  {approveMutation.isPending ? (
                    <>Processing...</>
                  ) : actionType === 'approve' ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      Confirm Approval
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5" />
                      Submit Feedback
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
