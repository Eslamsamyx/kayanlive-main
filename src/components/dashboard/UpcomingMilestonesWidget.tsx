'use client';

import { api } from '@/trpc/react';
import Link from 'next/link';
import { Target, Calendar, CheckCircle2, Clock, AlertCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { useSession } from 'next-auth/react';

export function UpcomingMilestonesWidget() {
  const { data: session } = useSession();
  const { data: projects, isLoading: projectsLoading } = api.project.getMyProjects.useQuery();

  // Get all milestones from user's projects
  const projectIds = projects?.map(p => p.id) || [];

  // Fetch milestones for all projects
  const milestoneQueries = projectIds.map(projectId =>
    api.milestone.list.useQuery({ projectId }, { enabled: projectIds.length > 0 })
  );

  const allMilestones = milestoneQueries
    .flatMap(query => query.data || [])
    .filter(milestone => milestone.status !== 'COMPLETED' && milestone.status !== 'CANCELLED');

  // Sort by due date (upcoming first)
  const sortedMilestones = allMilestones.sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const displayMilestones = sortedMilestones.slice(0, 5);
  const isLoading = projectsLoading || milestoneQueries.some(q => q.isLoading);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          color: 'text-gray-400',
          bgColor: 'bg-gray-900/30',
          borderColor: 'border-gray-700',
          icon: Clock,
          label: 'Not Started',
        };
      case 'IN_PROGRESS':
        return {
          color: 'text-blue-400',
          bgColor: 'bg-blue-900/30',
          borderColor: 'border-blue-700',
          icon: TrendingUp,
          label: 'In Progress',
        };
      case 'IN_REVIEW':
        return {
          color: 'text-[#7afdd6]',
          bgColor: 'bg-[#7afdd6]/10',
          borderColor: 'border-[#7afdd6]',
          icon: AlertCircle,
          label: 'Ready for Your Review',
        };
      case 'COMPLETED':
        return {
          color: 'text-green-400',
          bgColor: 'bg-green-900/30',
          borderColor: 'border-green-700',
          icon: CheckCircle2,
          label: 'Completed',
        };
      default:
        return {
          color: 'text-gray-400',
          bgColor: 'bg-gray-900/30',
          borderColor: 'border-gray-700',
          icon: Clock,
          label: status,
        };
    }
  };

  const isOverdue = (dueDate: Date | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getDaysUntil = (dueDate: Date) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProjectForMilestone = (projectId: string) => {
    return projects?.find(p => p.id === projectId);
  };

  return (
    <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-[#7afdd6]" />
          Project Milestones
        </h2>
        <Link
          href="/en/dashboard/projects"
          className="text-[#7afdd6] hover:text-[#6ee8c5] text-sm font-semibold flex items-center gap-1 transition-colors"
        >
          View Projects
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7afdd6] mx-auto"></div>
        </div>
      ) : displayMilestones.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-[#666] mx-auto mb-3" />
          <p className="text-[#b2b2b2]">No active milestones</p>
          <p className="text-xs text-[#666] mt-2">Milestones will appear here as projects progress</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayMilestones.map((milestone) => {
            const statusConfig = getStatusConfig(milestone.status);
            const StatusIcon = statusConfig.icon;
            const project = getProjectForMilestone(milestone.projectId);
            const overdue = milestone.dueDate ? isOverdue(milestone.dueDate) : false;
            const daysUntil = milestone.dueDate ? getDaysUntil(milestone.dueDate) : null;
            const needsReview = milestone.status === 'IN_REVIEW';

            return (
              <div
                key={milestone.id}
                className={`p-4 rounded-lg border transition-all ${
                  needsReview
                    ? 'border-[#7afdd6] bg-[#7afdd6]/5'
                    : 'border-[#333] bg-[#1a1a19] hover:border-[#7afdd6]/50'
                }`}
              >
                {needsReview && (
                  <div className="mb-3 flex items-center gap-2 pb-3 border-b border-[#7afdd6]/30">
                    <div className="w-2 h-2 bg-[#7afdd6] rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-[#7afdd6] uppercase tracking-wide">
                      Awaiting Your Approval
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1 text-sm">
                      {milestone.name}
                    </h3>
                    {project && (
                      <p className="text-xs text-[#666]">{project.name}</p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center gap-1 ${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.color}`}
                  >
                    <StatusIcon size={12} />
                    {needsReview ? 'Review' : milestone.status.replace('_', ' ')}
                  </span>
                </div>

                {milestone.description && (
                  <p className="text-xs text-[#b2b2b2] mb-3 line-clamp-2">
                    {milestone.description}
                  </p>
                )}

                {/* Progress Bar */}
                {milestone.progress !== null && milestone.progress !== undefined && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#b2b2b2]">Progress</span>
                      <span className="text-xs font-semibold text-white">{milestone.progress}%</span>
                    </div>
                    <div className="w-full bg-[#333] rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] transition-all duration-500 rounded-full"
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Due Date */}
                {milestone.dueDate && (
                  <div className="flex items-center gap-4 text-xs">
                    <div className={`flex items-center gap-1 ${overdue ? 'text-red-400' : 'text-[#b2b2b2]'}`}>
                      {overdue ? (
                        <AlertCircle className="w-3 h-3" />
                      ) : (
                        <Calendar className="w-3 h-3" />
                      )}
                      <span>
                        {overdue ? 'Overdue' : 'Due'}: {new Date(milestone.dueDate).toLocaleDateString()}
                      </span>
                    </div>

                    {!overdue && daysUntil !== null && daysUntil <= 7 && (
                      <span className="text-yellow-400 font-semibold">
                        {daysUntil === 0 ? 'Due today' : `${daysUntil} days left`}
                      </span>
                    )}
                  </div>
                )}

                {/* Deliverables Count */}
                {milestone.deliverables && milestone.deliverables.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#333]">
                    <div className="flex items-center gap-2 text-xs text-[#b2b2b2]">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{milestone.deliverables.length} deliverable{milestone.deliverables.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                )}

                {/* Action Button for Review */}
                {needsReview && (
                  <Link
                    href={`/en/dashboard/approvals?milestoneId=${milestone.id}`}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#7afdd6] text-[#2c2c2b] rounded-lg hover:bg-[#6ee8c5] transition-all font-semibold text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Review & Approve
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
