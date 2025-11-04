'use client';

import { api } from '@/trpc/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoreVertical,
  Reply,
  Edit2,
  Trash2,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';
import { CommentForm } from './CommentForm';
import { useSession } from 'next-auth/react';
import { CommentableType } from '@prisma/client';

interface CommentCardProps {
  comment: any; // Full comment with author and replies
  commentableType: CommentableType;
  commentableId: string;
  isReply?: boolean;
}

export function CommentCard({
  comment,
  commentableType,
  commentableId,
  isReply = false,
}: CommentCardProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showMenu, setShowMenu] = useState(false);

  const utils = api.useUtils();

  const updateMutation = api.comment.update.useMutation({
    onSuccess: () => {
      toast.success('Comment updated');
      setIsEditing(false);
      utils.comment.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update comment');
    },
  });

  const deleteMutation = api.comment.delete.useMutation({
    onSuccess: () => {
      toast.success('Comment deleted');
      utils.comment.list.invalidate();
      utils.comment.getCount.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete comment');
    },
  });

  const resolveMutation = api.comment.resolve.useMutation({
    onSuccess: (data) => {
      toast.success(data.resolved ? 'Comment resolved' : 'Comment reopened');
      utils.comment.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update comment');
    },
  });

  const handleUpdate = () => {
    if (!editContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    updateMutation.mutate({
      commentId: comment.id,
      content: editContent.trim(),
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this comment?')) {
      deleteMutation.mutate({ commentId: comment.id });
    }
  };

  const handleResolve = () => {
    resolveMutation.mutate({
      commentId: comment.id,
      resolved: !comment.resolved,
    });
  };

  const isAuthor = session?.user?.id === comment.authorId;
  const isAdmin = session?.user?.role === 'ADMIN';
  const canEdit = isAuthor || isAdmin;
  const canDelete = isAuthor || isAdmin;
  const canResolve = !isReply; // Only top-level comments can be resolved

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${isReply ? 'ml-12' : ''} ${
        comment.resolved ? 'opacity-60' : ''
      }`}
    >
      <div className="rounded-xl border border-[#333] bg-[#2c2c2b] p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7afdd6] text-[#2c2c2b] font-semibold text-sm">
              {comment.author.name?.[0]?.toUpperCase() || '?'}
            </div>

            {/* Author Info */}
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white">
                  {comment.author.name || 'Unknown User'}
                </p>
                {comment.resolved && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[#7afdd6]/10 text-[#7afdd6]">
                    <CheckCircle2 className="h-3 w-3" />
                    Resolved
                  </span>
                )}
              </div>
              <p className="text-xs text-[#666]" title={format(new Date(comment.createdAt), 'PPpp')}>
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                {comment.updatedAt !== comment.createdAt && ' (edited)'}
              </p>
            </div>
          </div>

          {/* Actions Menu */}
          {canEdit && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="rounded-lg p-1.5 hover:bg-[#1a1a19] transition-colors"
              >
                <MoreVertical className="h-4 w-4 text-[#666]" />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-8 z-10 w-40 rounded-lg border border-[#333] bg-[#2c2c2b] shadow-lg overflow-hidden"
                  >
                    {canEdit && (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-[#1a1a19] transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>
                    )}
                    {canResolve && (
                      <button
                        onClick={() => {
                          handleResolve();
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-[#1a1a19] transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {comment.resolved ? 'Reopen' : 'Resolve'}
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => {
                          handleDelete();
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-[#1a1a19] transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="space-y-3 mb-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full rounded-lg border border-[#333] bg-[#1a1a19] px-4 py-3 text-sm text-white placeholder:text-[#666] focus:border-[#7afdd6] focus:outline-none focus:ring-1 focus:ring-[#7afdd6] resize-none"
              rows={3}
              maxLength={5000}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
                disabled={updateMutation.isPending}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#b2b2b2] hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={updateMutation.isPending || !editContent.trim()}
                className="rounded-lg bg-[#7afdd6] px-3 py-1.5 text-sm font-medium text-[#2c2c2b] hover:bg-[#6ee8c5] transition-colors disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
        )}

        {/* Actions */}
        {!isEditing && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1.5 text-xs font-medium text-[#666] hover:text-[#7afdd6] transition-colors"
            >
              <Reply className="h-3.5 w-3.5" />
              Reply
            </button>
            {comment.replies && comment.replies.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-[#666]">
                <MessageCircle className="h-3.5 w-3.5" />
                {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Reply Form */}
      <AnimatePresence>
        {isReplying && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-12 mt-3"
          >
            <CommentForm
              commentableType={commentableType}
              commentableId={commentableId}
              parentId={comment.id}
              placeholder="Write a reply..."
              onSuccess={() => setIsReplying(false)}
              onCancel={() => setIsReplying(false)}
              compact
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply: any) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              commentableType={commentableType}
              commentableId={commentableId}
              isReply
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
