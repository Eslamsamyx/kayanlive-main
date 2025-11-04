'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { api } from '@/trpc/react';
import Link from 'next/link';
import { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  X,
  Trash2,
  FolderKanban,
  CheckSquare,
  CalendarDays,
  Award,
  AlertCircle,
} from 'lucide-react';

type FilterType = 'ALL' | 'UNREAD';

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL');

  const utils = api.useUtils();

  // Fetch notifications
  const { data: notifications, isLoading, error } = api.notification.list.useQuery({
    unreadOnly: selectedFilter === 'UNREAD',
    limit: 50,
  });

  // Fetch unread count
  const { data: unreadCount } = api.notification.getUnreadCount.useQuery();

  // Mutations
  const markAsRead = api.notification.markAsRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.getUnreadCount.invalidate();
    },
  });

  const markAllAsRead = api.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.getUnreadCount.invalidate();
    },
  });

  const deleteNotification = api.notification.delete.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.getUnreadCount.invalidate();
    },
  });

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    redirect('/login');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a19] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7afdd6] mx-auto mb-4"></div>
          <p className="text-[#b2b2b2]">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1a19] p-6">
        <div className="bg-red-900/20 border border-red-700 rounded-xl p-6">
          <h3 className="text-red-400 font-semibold mb-2">Error Loading Notifications</h3>
          <p className="text-[#b2b2b2]">{error.message}</p>
        </div>
      </div>
    );
  }

  const allNotifications = notifications || [];

  return (
    <div className="min-h-screen bg-[#1a1a19] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
              <p className="text-[#b2b2b2] text-lg">
                Stay updated with your project activities
              </p>
            </div>
            {unreadCount && unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
                className="px-4 py-2 bg-[#7afdd6] text-[#2c2c2b] rounded-lg hover:bg-[#6ee8c5] transition-all font-semibold text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark All as Read
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-[#7afdd6]/10">
                  <Bell className="w-6 h-6 text-[#7afdd6]" />
                </div>
                <div>
                  <p className="text-[#b2b2b2] text-sm font-semibold">Total</p>
                  <p className="text-3xl font-bold text-white">{allNotifications.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-400/10">
                  <AlertCircle className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-[#b2b2b2] text-sm font-semibold">Unread</p>
                  <p className="text-3xl font-bold text-white">{unreadCount || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedFilter('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                selectedFilter === 'ALL'
                  ? 'bg-[#7afdd6] text-[#2c2c2b]'
                  : 'bg-[#1a1a19] text-[#b2b2b2] hover:bg-[#333] border border-[#333]'
              }`}
            >
              All Notifications ({allNotifications.length})
            </button>
            <button
              onClick={() => setSelectedFilter('UNREAD')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                selectedFilter === 'UNREAD'
                  ? 'bg-[#7afdd6] text-[#2c2c2b]'
                  : 'bg-[#1a1a19] text-[#b2b2b2] hover:bg-[#333] border border-[#333]'
              }`}
            >
              Unread ({unreadCount || 0})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {allNotifications.length === 0 ? (
          <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-12 text-center">
            <Bell className="w-16 h-16 text-[#666] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {selectedFilter === 'UNREAD' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-[#b2b2b2]">
              {selectedFilter === 'UNREAD'
                ? 'You\'re all caught up!'
                : 'Notifications will appear here when you have activity'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {allNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={() => markAsRead.mutate({ id: notification.id })}
                onDelete={() => deleteNotification.mutate({ id: notification.id })}
                isMarkingAsRead={markAsRead.isPending}
                isDeleting={deleteNotification.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Notification Card Component
function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
  isMarkingAsRead,
  isDeleting,
}: {
  notification: any;
  onMarkAsRead: () => void;
  onDelete: () => void;
  isMarkingAsRead: boolean;
  isDeleting: boolean;
}) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'PROJECT_UPDATE':
        return <FolderKanban className="w-5 h-5 text-[#7afdd6]" />;
      case 'TASK_ASSIGNED':
      case 'TASK_UPDATE':
        return <CheckSquare className="w-5 h-5 text-blue-400" />;
      case 'MEETING_SCHEDULED':
      case 'MEETING_UPDATE':
        return <CalendarDays className="w-5 h-5 text-purple-400" />;
      case 'MILESTONE_COMPLETED':
        return <Award className="w-5 h-5 text-green-400" />;
      default:
        return <Bell className="w-5 h-5 text-[#7afdd6]" />;
    }
  };

  const getRelatedEntityLink = () => {
    if (notification.project) {
      return `/en/dashboard/projects/${notification.project.id}`;
    }
    if (notification.task) {
      return `/en/dashboard/tasks`;
    }
    if (notification.meeting) {
      return `/en/dashboard/meetings`;
    }
    return null;
  };

  const relatedLink = getRelatedEntityLink();
  const cardClassName = `block bg-[#2c2c2b] rounded-xl shadow-lg border p-4 transition-all group ${
    notification.read
      ? 'border-[#333] hover:border-[#444]'
      : 'border-[#7afdd6]/30 bg-[#7afdd6]/5 hover:border-[#7afdd6]/50'
  }`;

  const CardContent = (
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          <div className={`p-2.5 rounded-lg ${notification.read ? 'bg-[#1a1a19]' : 'bg-[#7afdd6]/10'}`}>
            {getNotificationIcon(notification.type)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <p className="text-white font-semibold mb-1 group-hover:text-[#7afdd6] transition-colors">
                {notification.title}
              </p>
              {notification.message && (
                <p className="text-[#b2b2b2] text-sm line-clamp-2">
                  {notification.message}
                </p>
              )}
            </div>
            {!notification.read && (
              <div className="w-2 h-2 bg-[#7afdd6] rounded-full flex-shrink-0 mt-2 animate-pulse" />
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs text-[#666]">
              <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
              <span>{new Date(notification.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
              {notification.project && (
                <span className="flex items-center gap-1 text-[#7afdd6]">
                  <FolderKanban className="w-3 h-3" />
                  {notification.project.name}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!notification.read && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onMarkAsRead();
                  }}
                  disabled={isMarkingAsRead}
                  className="p-1.5 rounded-lg text-[#7afdd6] hover:bg-[#7afdd6]/10 transition-all disabled:opacity-50"
                  title="Mark as read"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete();
                }}
                disabled={isDeleting}
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-50"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
  );

  if (relatedLink) {
    return (
      <Link href={relatedLink} className={cardClassName}>
        {CardContent}
      </Link>
    );
  }

  return (
    <div className={cardClassName}>
      {CardContent}
    </div>
  );
}
