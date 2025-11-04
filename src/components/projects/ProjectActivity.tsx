'use client';

import { api } from '@/trpc/react';
import {
  Activity,
  FolderPlus,
  Edit,
  Target,
  CheckCircle,
  MessageSquare,
  Package,
  Share,
  Calendar,
  CheckSquare,
  User,
} from 'lucide-react';

interface ProjectActivityProps {
  projectId: string;
  limit?: number;
  preview?: boolean;
}

export function ProjectActivity({ projectId, limit = 20, preview = false }: ProjectActivityProps) {
  const { data: activities, isLoading } = api.audit.getProjectActivity.useQuery({
    projectId,
    limit,
  });

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      FolderPlus,
      Edit,
      Target,
      CheckCircle,
      MessageSquare,
      Package,
      Share,
      Calendar,
      CheckSquare,
      Activity,
      User,
    };

    const Icon = iconMap[iconName] || Activity;
    return <Icon className="w-4 h-4" />;
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      blue: {
        bg: 'bg-blue-900/20',
        text: 'text-blue-400',
        border: 'border-blue-700/30',
      },
      purple: {
        bg: 'bg-purple-900/20',
        text: 'text-purple-400',
        border: 'border-purple-700/30',
      },
      green: {
        bg: 'bg-green-900/20',
        text: 'text-green-400',
        border: 'border-green-700/30',
      },
      yellow: {
        bg: 'bg-yellow-900/20',
        text: 'text-yellow-400',
        border: 'border-yellow-700/30',
      },
      cyan: {
        bg: 'bg-[#7afdd6]/10',
        text: 'text-[#7afdd6]',
        border: 'border-[#7afdd6]/30',
      },
      orange: {
        bg: 'bg-orange-900/20',
        text: 'text-orange-400',
        border: 'border-orange-700/30',
      },
      gray: {
        bg: 'bg-gray-900/20',
        text: 'text-gray-400',
        border: 'border-gray-700/30',
      },
    };

    return colorMap[color] || colorMap.gray;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks}w ago`;
    }

    return activityDate.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7afdd6] mx-auto"></div>
        <p className="text-[#b2b2b2] mt-4 text-sm">Loading activity...</p>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="w-12 h-12 text-[#666] mx-auto mb-3" />
        <p className="text-[#b2b2b2]">No activity yet</p>
        <p className="text-xs text-[#666] mt-2">
          Activity will appear here as work progresses
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const colors = getColorClasses(activity.color);
        const isLast = index === activities.length - 1;

        return (
          <div key={activity.id} className="relative">
            {/* Timeline Line */}
            {!preview && !isLast && (
              <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-[#333]" />
            )}

            {/* Activity Item */}
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${colors.bg} ${colors.border}`}
              >
                <div className={colors.text}>{getIcon(activity.icon)}</div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-sm">{activity.title}</h4>
                    <p className="text-[#b2b2b2] text-sm mt-0.5">{activity.description}</p>
                  </div>
                  <span className="text-xs text-[#666] whitespace-nowrap">
                    {formatTime(activity.timestamp)}
                  </span>
                </div>

                {/* User Info */}
                {activity.user && (
                  <div className="flex items-center gap-2 mt-2">
                    {activity.user.image ? (
                      <img
                        src={activity.user.image}
                        alt={activity.user.name || activity.user.email || 'User'}
                        className="w-5 h-5 rounded-full"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[#7afdd6]/20 flex items-center justify-center">
                        <User className="w-3 h-3 text-[#7afdd6]" />
                      </div>
                    )}
                    <span className="text-xs text-[#666]">
                      {activity.user.name || activity.user.email}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {preview && activities.length >= limit && (
        <div className="text-center pt-4">
          <p className="text-sm text-[#7afdd6] hover:text-[#6ee8c5] cursor-pointer font-semibold">
            View All Activity →
          </p>
        </div>
      )}
    </div>
  );
}
