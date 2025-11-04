'use client';

import { api } from '@/trpc/react';
import Link from 'next/link';
import { Bell, ArrowRight, CheckCircle, Clock } from 'lucide-react';

export function NotificationsPreviewWidget() {
  const { data: notifications, isLoading } = api.notification.list.useQuery({
    limit: 5,
  });

  const { data: unreadCount } = api.notification.getUnreadCount.useQuery();

  const getNotificationIcon = (type: string) => {
    // Add more types as needed based on your notification types
    return <Bell className="w-4 h-4" />;
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED':
      case 'TASK_UPDATED':
        return 'text-blue-400';
      case 'TASK_COMPLETED':
      case 'PROJECT_COMPLETED':
        return 'text-green-400';
      case 'MEETING_SCHEDULED':
      case 'MEETING_REMINDER':
        return 'text-purple-400';
      case 'COMMENT_ADDED':
        return 'text-yellow-400';
      case 'PROJECT_UPDATED':
        return 'text-[#7afdd6]';
      default:
        return 'text-[#b2b2b2]';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return notificationDate.toLocaleDateString();
  };

  return (
    <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#7afdd6]" />
            Notifications
          </h2>
          {unreadCount !== undefined && unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <Link
          href="/en/dashboard/notifications"
          className="text-[#7afdd6] hover:text-[#6ee8c5] text-sm font-semibold flex items-center gap-1 transition-colors"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7afdd6] mx-auto"></div>
        </div>
      ) : !notifications || notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-[#666] mx-auto mb-3" />
          <p className="text-[#b2b2b2]">No notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border transition-all ${
                !notification.read
                  ? 'border-[#7afdd6]/30 bg-[#7afdd6]/5'
                  : 'border-[#333] bg-[#1a1a19]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    !notification.read ? 'bg-[#7afdd6]/20' : 'bg-[#333]'
                  }`}
                >
                  <div className={getNotificationColor(notification.type)}>
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className={`text-sm font-semibold ${
                      !notification.read ? 'text-white' : 'text-[#b2b2b2]'
                    }`}>
                      {notification.title}
                    </h4>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-[#7afdd6] rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>

                  <p className="text-xs text-[#666] mb-2 line-clamp-2">
                    {notification.message}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-[#666]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(notification.createdAt)}
                    </span>

                    {notification.project && (
                      <span className="truncate">
                        {notification.project.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
