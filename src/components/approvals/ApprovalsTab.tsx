'use client';

import { api } from '@/trpc/react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Calendar, AlertCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { ApprovalModal } from './ApprovalModal';

interface ApprovalsTabProps {
  projectId?: string;
}

export function ApprovalsTab({ projectId }: ApprovalsTabProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);

  const { data: approvals, isLoading } = api.milestone.getPendingApprovals.useQuery({
    projectId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-[#333] bg-[#2c2c2b] p-6">
            <div className="h-6 w-2/3 bg-[#1a1a19] rounded mb-3" />
            <div className="h-4 w-1/3 bg-[#1a1a19] rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!approvals || approvals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CheckCircle2 className="h-16 w-16 text-[#7afdd6] mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Pending Approvals</h3>
        <p className="text-[#b2b2b2] max-w-md">
          All milestones are up to date. You&apos;ll be notified when new milestones need your approval.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {approvals.map((milestone) => {
          const isOverdue = milestone.dueDate && new Date(milestone.dueDate) < new Date();
          const completedTasks = milestone.tasks.filter((t) => t.status === 'COMPLETED').length;
          const totalTasks = milestone.tasks.length;
          const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

          return (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-[#333] bg-[#2c2c2b] p-6 hover:border-[#7afdd6] transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">{milestone.name}</h3>
                    {isOverdue && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-500/10 text-red-400">
                        <AlertCircle className="h-3 w-3" />
                        Overdue
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-[#b2b2b2]">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Due: {milestone.dueDate ? format(new Date(milestone.dueDate), 'MMM d, yyyy') : 'No due date'}
                    </span>
                    <span>Project: {milestone.project.name}</span>
                    {milestone.signedOffUser && (
                      <span>Signed off by: {milestone.signedOffUser.name}</span>
                    )}
                  </div>

                  {milestone.description && (
                    <p className="text-sm text-[#b2b2b2] mt-2 line-clamp-2">
                      {milestone.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setSelectedMilestone(milestone.id)}
                  className="flex items-center gap-2 rounded-lg border border-[#333] px-4 py-2 text-sm font-medium text-[#b2b2b2] hover:border-[#7afdd6] hover:text-[#7afdd6] transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  Review
                </button>
              </div>

              {/* Task Progress */}
              {totalTasks > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-[#666] mb-1">
                    <span>Tasks Progress</span>
                    <span>{completedTasks}/{totalTasks} completed</span>
                  </div>
                  <div className="h-2 bg-[#1a1a19] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${taskProgress}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-[#7afdd6]"
                    />
                  </div>
                </div>
              )}

              {/* Deliverables Preview */}
              {milestone.deliverables && milestone.deliverables.length > 0 && (
                <div>
                  <p className="text-xs text-[#666] mb-2">Deliverables:</p>
                  <div className="flex flex-wrap gap-2">
                    {milestone.deliverables.slice(0, 3).map((deliverable, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-1 rounded text-xs bg-[#1a1a19] text-[#b2b2b2]"
                      >
                        {deliverable}
                      </span>
                    ))}
                    {milestone.deliverables.length > 3 && (
                      <span className="inline-block px-2 py-1 rounded text-xs bg-[#1a1a19] text-[#666]">
                        +{milestone.deliverables.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Approval Modal */}
      {selectedMilestone && (
        <ApprovalModal
          milestoneId={selectedMilestone}
          onClose={() => setSelectedMilestone(null)}
        />
      )}
    </>
  );
}
