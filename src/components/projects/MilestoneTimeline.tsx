'use client';

import { CheckCircle2, Clock, Target, Calendar, AlertCircle, TrendingUp, Package } from 'lucide-react';
import { useState } from 'react';
import { api } from '@/trpc/react';
import { useSession } from 'next-auth/react';

interface Milestone {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  progress: number | null;
  dueDate: Date | null;
  startDate: Date | null;
  deliverables: string[];
  signedOffAt: Date | null;
  approvedAt: Date | null;
  feedback?: string | null;
  _count?: {
    tasks: number;
  };
}

interface MilestoneTimelineProps {
  projectId: string;
  milestones?: Milestone[];
  isLoading?: boolean;
  isClient?: boolean;
  onApprove?: (milestoneId: string) => void;
}

export function MilestoneTimeline({
  projectId,
  milestones: providedMilestones,
  isLoading: providedIsLoading,
  isClient: providedIsClient,
  onApprove,
}: MilestoneTimelineProps) {
  const { data: session } = useSession();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Fetch milestones if not provided
  const { data: fetchedMilestones, isLoading: fetchedIsLoading } = api.milestone.list.useQuery(
    { projectId },
    { enabled: !providedMilestones }
  );

  const milestones = providedMilestones || fetchedMilestones || [];
  const isLoading = providedIsLoading ?? fetchedIsLoading;
  const isClient = providedIsClient ?? (session?.user?.role === 'CLIENT');

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          color: 'text-gray-400',
          bgColor: 'bg-gray-900/30',
          borderColor: 'border-gray-700',
          icon: Clock,
          label: 'Not Started',
          description: 'Waiting to begin',
        };
      case 'IN_PROGRESS':
        return {
          color: 'text-blue-400',
          bgColor: 'bg-blue-900/30',
          borderColor: 'border-blue-700',
          icon: TrendingUp,
          label: 'In Progress',
          description: 'Team is working on this',
        };
      case 'IN_REVIEW':
        return {
          color: 'text-[#7afdd6]',
          bgColor: 'bg-[#7afdd6]/10',
          borderColor: 'border-[#7afdd6]',
          icon: AlertCircle,
          label: 'Ready for Review',
          description: 'Your approval is needed',
        };
      case 'COMPLETED':
        return {
          color: 'text-green-400',
          bgColor: 'bg-green-900/30',
          borderColor: 'border-green-700',
          icon: CheckCircle2,
          label: 'Completed',
          description: 'Successfully delivered',
        };
      case 'CANCELLED':
        return {
          color: 'text-red-400',
          bgColor: 'bg-red-900/30',
          borderColor: 'border-red-700',
          icon: AlertCircle,
          label: 'Cancelled',
          description: 'No longer active',
        };
      default:
        return {
          color: 'text-gray-400',
          bgColor: 'bg-gray-900/30',
          borderColor: 'border-gray-700',
          icon: Clock,
          label: status,
          description: '',
        };
    }
  };

  const isOverdue = (dueDate: Date | null, status: string) => {
    if (!dueDate || status === 'COMPLETED' || status === 'CANCELLED') return false;
    return new Date(dueDate) < new Date();
  };

  const getDaysUntil = (dueDate: Date) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7afdd6] mx-auto"></div>
        <p className="text-[#b2b2b2] mt-4">Loading milestones...</p>
      </div>
    );
  }

  if (milestones.length === 0) {
    return (
      <div className="bg-[#2c2c2b] rounded-xl p-12 border border-[#333] text-center">
        <Target className="w-16 h-16 text-[#666] mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Milestones Yet</h3>
        <p className="text-[#b2b2b2]">
          Milestones will be added as your project progresses
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#333]" />

        {/* Milestones */}
        <div className="space-y-6">
          {milestones.map((milestone, index) => {
            const statusConfig = getStatusConfig(milestone.status);
            const StatusIcon = statusConfig.icon;
            const overdue = isOverdue(milestone.dueDate, milestone.status);
            const needsReview = milestone.status === 'IN_REVIEW';
            const isExpanded = expandedId === milestone.id;

            return (
              <div key={milestone.id} className="relative pl-16">
                {/* Timeline Dot */}
                <div className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center ${statusConfig.bgColor} border-2 ${statusConfig.borderColor}`}>
                  <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
                </div>

                {/* Milestone Card */}
                <div
                  className={`bg-[#2c2c2b] rounded-xl border transition-all ${
                    needsReview
                      ? 'border-[#7afdd6] shadow-lg shadow-[#7afdd6]/20'
                      : 'border-[#333] hover:border-[#7afdd6]/50'
                  }`}
                >
                  {/* Header */}
                  <div className="p-6">
                    {needsReview && (
                      <div className="mb-4 flex items-center gap-2 pb-4 border-b border-[#7afdd6]/30">
                        <div className="w-2 h-2 bg-[#7afdd6] rounded-full animate-pulse" />
                        <span className="text-sm font-semibold text-[#7afdd6] uppercase tracking-wide">
                          Your Approval Needed
                        </span>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {milestone.name}
                        </h3>
                        {milestone.description && (
                          <p className="text-[#b2b2b2] text-sm line-clamp-2">
                            {milestone.description}
                          </p>
                        )}
                      </div>

                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center gap-1.5 whitespace-nowrap ${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.color}`}
                      >
                        <StatusIcon size={14} />
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {milestone.progress !== null && milestone.progress !== undefined && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-[#b2b2b2]">Progress</span>
                          <span className="text-xs font-semibold text-white">
                            {milestone.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-[#333] rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] transition-all duration-500 rounded-full"
                            style={{ width: `${milestone.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Meta Information */}
                    <div className="flex items-center gap-6 text-sm flex-wrap">
                      {milestone.dueDate && (
                        <div className={`flex items-center gap-2 ${overdue ? 'text-red-400' : 'text-[#b2b2b2]'}`}>
                          {overdue ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : (
                            <Calendar className="w-4 h-4" />
                          )}
                          <span>
                            {overdue ? 'Overdue' : 'Due'}: {new Date(milestone.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {!overdue && milestone.dueDate && getDaysUntil(milestone.dueDate) <= 7 && milestone.status !== 'COMPLETED' && (
                        <span className="text-yellow-400 font-semibold text-sm">
                          {getDaysUntil(milestone.dueDate) === 0
                            ? 'Due today'
                            : `${getDaysUntil(milestone.dueDate)} days left`}
                        </span>
                      )}

                      {milestone.deliverables && milestone.deliverables.length > 0 && (
                        <div className="flex items-center gap-2 text-[#b2b2b2]">
                          <Package className="w-4 h-4" />
                          <span>{milestone.deliverables.length} deliverable{milestone.deliverables.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>

                    {/* Deliverables List */}
                    {milestone.deliverables && milestone.deliverables.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-[#333]">
                        <h4 className="text-sm font-semibold text-white mb-2">Deliverables:</h4>
                        <ul className="space-y-1">
                          {milestone.deliverables.map((deliverable, idx) => (
                            <li key={idx} className="text-sm text-[#b2b2b2] flex items-start gap-2">
                              <span className="text-[#7afdd6] mt-1">•</span>
                              <span>{deliverable}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Client Feedback */}
                    {milestone.feedback && (
                      <div className="mt-4 pt-4 border-t border-[#333]">
                        <h4 className="text-sm font-semibold text-white mb-2">Your Feedback:</h4>
                        <p className="text-sm text-[#b2b2b2] italic bg-[#1a1a19] p-3 rounded-lg">
                          "{milestone.feedback}"
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    {isClient && needsReview && onApprove && (
                      <div className="mt-4 pt-4 border-t border-[#333]">
                        <button
                          onClick={() => onApprove(milestone.id)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#7afdd6] text-[#2c2c2b] rounded-lg hover:bg-[#6ee8c5] transition-all font-semibold"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          Review & Approve Milestone
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
