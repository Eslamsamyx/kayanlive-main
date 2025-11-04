'use client';

import { api } from '@/trpc/react';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { CommentableType } from '@prisma/client';

interface CommentFormProps {
  commentableType: CommentableType;
  commentableId: string;
  parentId?: string;
  placeholder?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  compact?: boolean;
}

export function CommentForm({
  commentableType,
  commentableId,
  parentId,
  placeholder = 'Write a comment...',
  onSuccess,
  onCancel,
  compact = false,
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);

  const utils = api.useUtils();

  const createMutation = api.comment.create.useMutation({
    onSuccess: () => {
      toast.success(parentId ? 'Reply posted' : 'Comment posted');
      setContent('');
      setMentions([]);
      utils.comment.list.invalidate({
        commentableType,
        commentableId,
      });
      utils.comment.getCount.invalidate({
        commentableType,
        commentableId,
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to post comment');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    // Extract mentions from content (simple @username pattern)
    const mentionPattern = /@(\w+)/g;
    const extractedMentions: string[] = [];
    let match;
    while ((match = mentionPattern.exec(content)) !== null) {
      extractedMentions.push(match[1]);
    }

    createMutation.mutate({
      content: content.trim(),
      commentableType,
      commentableId,
      parentId,
      mentions: extractedMentions,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const charCount = content.length;
  const maxChars = 5000;

  return (
    <form onSubmit={handleSubmit} className={compact ? 'space-y-2' : 'space-y-3'}>
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={compact ? 2 : 3}
          maxLength={maxChars}
          className="w-full rounded-lg border border-[#333] bg-[#1a1a19] px-4 py-3 text-sm text-white placeholder:text-[#666] focus:border-[#7afdd6] focus:outline-none focus:ring-1 focus:ring-[#7afdd6] resize-none"
        />
        {charCount > 0 && (
          <div className="absolute bottom-2 right-2 text-xs text-[#666]">
            {charCount}/{maxChars}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[#666]">
          <kbd className="px-1.5 py-0.5 rounded bg-[#1a1a19] border border-[#333] text-[#b2b2b2]">
            ⌘/Ctrl
          </kbd>{' '}
          +{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-[#1a1a19] border border-[#333] text-[#b2b2b2]">
            Enter
          </kbd>{' '}
          to send
        </p>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={createMutation.isPending}
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#b2b2b2] hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={createMutation.isPending || !content.trim()}
            className="flex items-center gap-2 rounded-lg bg-[#7afdd6] px-4 py-2 text-sm font-medium text-[#2c2c2b] hover:bg-[#6ee8c5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? (
              'Posting...'
            ) : (
              <>
                <Send className="h-4 w-4" />
                {parentId ? 'Reply' : 'Comment'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mentions hint */}
      {content.includes('@') && (
        <p className="text-xs text-[#666]">
          💡 Tip: Users mentioned with @username will be notified
        </p>
      )}
    </form>
  );
}
