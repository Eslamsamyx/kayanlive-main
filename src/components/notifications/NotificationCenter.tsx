'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/trpc/react';
import { Bell, X, Check, CheckCheck, Trash2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { NotificationType } from '@prisma/client';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  projectId: string | null;
  taskId: string | null;
  milestoneId: string | null;
  meetingId: string | null;
  data: any;
}

const notificationIcons: Record<NotificationType, { color: string; bg: string }> = {
  [NotificationType.TASK_ASSIGNED]: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
  [NotificationType.TASK_STATUS_CHANGED]: { color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  [NotificationType.TASK_DUE_SOON]: { color: 'text-orange-400', bg: 'bg-orange-500/20' },
  [NotificationType.TASK_COMMENT_ADDED]: { color: 'text-green-400', bg: 'bg-green-500/20' },
  [NotificationType.MILESTONE_APPROVED]: { color: 'text-green-400', bg: 'bg-green-500/20' },
  [NotificationType.MILESTONE_SIGNED_OFF]: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
  [NotificationType.MILESTONE_DUE_SOON]: { color: 'text-orange-400', bg: 'bg-orange-500/20' },
  [NotificationType.PROJECT_UPDATED]: { color: 'text-purple-400', bg: 'bg-purple-500/20' },
  [NotificationType.PROJECT_MEMBER_ADDED]: { color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  [NotificationType.PROJECT_MEMBER_REMOVED]: { color: 'text-gray-400', bg: 'bg-gray-500/20' },
  [NotificationType.MEETING_SCHEDULED]: { color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
  [NotificationType.MEETING_UPDATED]: { color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
  [NotificationType.ASSET_UPLOADED]: { color: 'text-teal-400', bg: 'bg-teal-500/20' },
  [NotificationType.ASSET_DOWNLOAD_REQUESTED]: { color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  [NotificationType.ASSET_DOWNLOAD_APPROVED]: { color: 'text-green-400', bg: 'bg-green-500/20' },
  [NotificationType.ASSET_DOWNLOAD_REJECTED]: { color: 'text-red-400', bg: 'bg-red-500/20' },
  [NotificationType.PRESENTATION_CREATED]: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
  [NotificationType.PRESENTATION_UPDATED]: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
  [NotificationType.INVITATION_RECEIVED]: { color: 'text-pink-400', bg: 'bg-pink-500/20' },
  [NotificationType.TRANSLATION_REQUESTED]: { color: 'text-purple-400', bg: 'bg-purple-500/20' },
  [NotificationType.TRANSLATION_ASSIGNED]: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
  [NotificationType.TRANSLATION_COMPLETED]: { color: 'text-green-400', bg: 'bg-green-500/20' },
  [NotificationType.TRANSLATION_OUTDATED]: { color: 'text-orange-400', bg: 'bg-orange-500/20' },
  [NotificationType.TRANSLATION_REVIEW_REQUESTED]: { color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
};

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: notifications = [], refetch } = api.notification.list.useQuery(
    { unreadOnly: filter === 'unread' },
    { refetchInterval: 30000 } // Poll every 30 seconds
  );

  const { data: unreadCount = 0, refetch: refetchCount } = api.notification.getUnreadCount.useQuery(
    undefined,
    { refetchInterval: 30000 }
  );

  const markAsReadMutation = api.notification.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
      refetchCount();
    },
  });

  const markAllAsReadMutation = api.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      refetch();
      refetchCount();
    },
  });

  const deleteMutation = api.notification.delete.useMutation({
    onSuccess: () => {
      refetch();
      refetchCount();
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      markAsReadMutation.mutate({ id: notification.id });
    }

    // Navigate to relevant resource
    if (notification.projectId && notification.taskId) {
      router.push(`/admin/projects/${notification.projectId}?tab=tasks&taskId=${notification.taskId}`);
      setIsOpen(false);
    } else if (notification.projectId && notification.milestoneId) {
      router.push(`/admin/projects/${notification.projectId}?tab=milestones`);
      setIsOpen(false);
    } else if (notification.projectId && notification.meetingId) {
      router.push(`/admin/projects/${notification.projectId}?tab=meetings`);
      setIsOpen(false);
    } else if (notification.projectId) {
      router.push(`/admin/projects/${notification.projectId}`);
      setIsOpen(false);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate({ id: notificationId });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 text-[#888888] hover:text-white transition-colors rounded-xl hover:bg-white/10"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center text-xs font-bold text-[#2c2c2b] rounded-full"
            style={{
              background: 'linear-gradient(90deg, #7afdd6 0%, #b8a4ff 100%)',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 right-8 w-96 max-h-[600px] rounded-[25px] overflow-hidden shadow-2xl"
            style={{
              background: 'rgba(44, 44, 43, 0.98)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)',
              fontFamily: '"Poppins", sans-serif',
              zIndex: 9999,
            }}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-[#888888] hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-xl text-sm font-medium transition-all ${
                    filter === 'all'
                      ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b]'
                      : 'text-[#888888] hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 rounded-xl text-sm font-medium transition-all ${
                    filter === 'unread'
                      ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b]'
                      : 'text-[#888888] hover:text-white'
                  }`}
                >
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </button>
              </div>

              {/* Actions */}
              {notifications.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      disabled={markAllAsReadMutation.isPending}
                      className="flex items-center gap-1 px-3 py-1 text-xs text-[#7afdd6] hover:text-white transition-colors disabled:opacity-50"
                    >
                      <CheckCheck size={14} />
                      Mark all as read
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[480px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={48} className="mx-auto mb-4 text-[#888888]" />
                  <p className="text-[#888888]">
                    {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                      onDelete={(e) => handleDelete(notification.id, e)}
                      onMarkAsRead={() =>
                        !notification.read &&
                        markAsReadMutation.mutate({ id: notification.id })
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationItem({
  notification,
  onClick,
  onDelete,
  onMarkAsRead,
}: {
  notification: Notification;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onMarkAsRead: () => void;
}) {
  const config = notificationIcons[notification.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 cursor-pointer transition-colors relative ${
        notification.read ? 'hover:bg-white/5' : 'bg-white/5 hover:bg-white/10'
      }`}
      onClick={onClick}
    >
      {/* Unread Indicator */}
      {!notification.read && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff]" />
      )}

      <div className="flex gap-3 pl-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
          <Bell size={18} className={config.color} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`text-sm font-semibold ${notification.read ? 'text-white/80' : 'text-white'}`}>
              {notification.title}
            </h4>
            <span className="text-xs text-[#888888] whitespace-nowrap">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className={`text-sm ${notification.read ? 'text-white/60' : 'text-white/80'} line-clamp-2`}>
            {notification.message}
          </p>

          {/* Actions */}
          <div className="flex gap-2 mt-2">
            {!notification.read && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead();
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs text-[#7afdd6] hover:text-white transition-colors"
              >
                <Check size={12} />
                Mark as read
              </button>
            )}
            <button
              onClick={onDelete}
              className="flex items-center gap-1 px-2 py-1 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 size={12} />
              Delete
            </button>
            {(notification.taskId || notification.milestoneId || notification.meetingId) && (
              <button
                className="flex items-center gap-1 px-2 py-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ExternalLink size={12} />
                View
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
