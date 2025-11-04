'use client';

import { api } from '@/trpc/react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Filter } from 'lucide-react';
import { useState } from 'react';
import { CommentForm } from './CommentForm';
import { CommentCard } from './CommentCard';
import { CommentableType } from '@prisma/client';

interface CommentThreadProps {
  commentableType: CommentableType;
  commentableId: string;
  title?: string;
}

export function CommentThread({
  commentableType,
  commentableId,
  title = 'Comments',
}: CommentThreadProps) {
  const [showResolved, setShowResolved] = useState(false);

  const { data: commentsData, isLoading } = api.comment.list.useQuery({
    commentableType,
    commentableId,
    includeReplies: true,
    includeResolved: showResolved,
  });

  const { data: countData } = api.comment.getCount.useQuery({
    commentableType,
    commentableId,
    includeResolved: showResolved,
  });

  const comments = commentsData?.comments ?? [];
  const topLevelComments = comments.filter((c) => !c.parentId);
  const commentCount = countData?.count ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-32 bg-[#1a1a19] rounded animate-pulse" />
          <div className="h-8 w-24 bg-[#1a1a19] rounded animate-pulse" />
        </div>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-[#333] bg-[#2c2c2b] p-4">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-[#1a1a19]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-[#1a1a19] rounded" />
                <div className="h-16 bg-[#1a1a19] rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#7afdd6]" />
          <h3 className="text-lg font-semibold text-white">
            {title}
            {commentCount > 0 && (
              <span className="ml-2 text-sm font-normal text-[#666]">
                ({commentCount})
              </span>
            )}
          </h3>
        </div>

        <button
          onClick={() => setShowResolved(!showResolved)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            showResolved
              ? 'border-[#7afdd6] bg-[#7afdd6]/10 text-[#7afdd6]'
              : 'border-[#333] text-[#666] hover:border-[#7afdd6] hover:text-[#7afdd6]'
          }`}
        >
          <Filter className="h-3 w-3" />
          {showResolved ? 'Hide Resolved' : 'Show Resolved'}
        </button>
      </div>

      {/* New Comment Form */}
      <CommentForm
        commentableType={commentableType}
        commentableId={commentableId}
      />

      {/* Comments List */}
      {topLevelComments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-[#333] bg-[#2c2c2b]">
          <MessageSquare className="h-12 w-12 text-[#666] mb-3" />
          <p className="text-[#b2b2b2] text-sm">
            No comments yet. Be the first to comment!
          </p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-4">
            {topLevelComments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                commentableType={commentableType}
                commentableId={commentableId}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
