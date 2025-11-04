'use client';

import { api } from '@/trpc/react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export function PendingApprovalsWidget() {
  const { data: approvals, isLoading } = api.milestone.getPendingApprovals.useQuery({});

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#333] bg-[#2c2c2b] p-6">
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-[#1a1a19] rounded mb-4" />
          <div className="h-16 bg-[#1a1a19] rounded" />
        </div>
      </div>
    );
  }

  const pendingCount = approvals?.length ?? 0;
  const overdueCount = approvals?.filter(
    (a) => a.dueDate && new Date(a.dueDate) < new Date()
  ).length ?? 0;
  const dueSoonCount = approvals?.filter((a) => {
    if (!a.dueDate) return false;
    const dueDate = new Date(a.dueDate);
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    return dueDate > today && dueDate <= threeDaysFromNow;
  }).length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[#333] bg-[#2c2c2b] p-6 hover:border-[#7afdd6] transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Pending Approvals</h3>
        {pendingCount > 0 && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7afdd6] text-[#2c2c2b] text-xs font-bold">
            {pendingCount}
          </span>
        )}
      </div>

      {pendingCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-[#7afdd6] mb-3" />
          <p className="text-[#b2b2b2] text-sm">No pending approvals</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-lg bg-[#1a1a19] p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-[#7afdd6]" />
                <span className="text-xs text-[#666]">Total</span>
              </div>
              <p className="text-2xl font-bold text-white">{pendingCount}</p>
            </div>

            {overdueCount > 0 && (
              <div className="rounded-lg bg-red-500/10 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-xs text-red-400">Overdue</span>
                </div>
                <p className="text-2xl font-bold text-red-400">{overdueCount}</p>
              </div>
            )}

            {dueSoonCount > 0 && (
              <div className="rounded-lg bg-yellow-500/10 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs text-yellow-400">Due Soon</span>
                </div>
                <p className="text-2xl font-bold text-yellow-400">{dueSoonCount}</p>
              </div>
            )}
          </div>

          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {approvals?.slice(0, 3).map((approval) => {
              const isOverdue = approval.dueDate && new Date(approval.dueDate) < new Date();
              return (
                <Link
                  key={approval.id}
                  href={`/dashboard/projects/${approval.project.id}?tab=approvals`}
                  className="block rounded-lg bg-[#1a1a19] p-3 hover:bg-[#1a1a19]/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {approval.name}
                      </p>
                      <p className="text-xs text-[#666] truncate">
                        {approval.project.name}
                      </p>
                    </div>
                    {approval.dueDate && (
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          isOverdue
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-[#7afdd6]/10 text-[#7afdd6]'
                        }`}
                      >
                        {format(new Date(approval.dueDate), 'MMM d')}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          <Link
            href="/dashboard/approvals"
            className="block w-full rounded-lg bg-[#7afdd6] px-4 py-2 text-center text-sm font-medium text-[#2c2c2b] hover:bg-[#6ee8c5] transition-colors"
          >
            View All Approvals
          </Link>
        </>
      )}
    </motion.div>
  );
}
