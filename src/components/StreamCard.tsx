'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Eye, Heart, MessageCircle } from 'lucide-react';

interface StreamCardProps {
  title: string;
  streamerName: string;
  streamerAvatar: string;
  thumbnail: string;
  viewerCount: number;
  likes: number;
  category: string;
  isLive?: boolean;
  duration?: string;
}

export default function StreamCard({
  title,
  streamerName,
  streamerAvatar,
  thumbnail,
  viewerCount,
  likes,
  category,
  isLive = false,
  duration
}: StreamCardProps) {
  const t = useTranslations();
  const locale = useLocale();

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Thumbnail Container */}
      <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700">
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Live Badge */}
        {isLive && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            LIVE
          </div>
        )}
        
        {/* Duration Badge */}
        {!isLive && duration && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
            {duration}
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 right-3 bg-purple-600/90 text-white px-3 py-1 rounded-full text-xs font-medium">
          {category}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {t('watch')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Streamer Info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple-600">
            <Image
              src={streamerAvatar}
              alt={streamerName}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
              {streamerName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              {t('streamer')}
            </p>
          </div>
        </div>

        {/* Stream Title */}
        <h4 className="font-medium text-gray-800 dark:text-gray-200 line-clamp-2 mb-3 min-h-[2.5rem]">
          {title}
        </h4>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {formatCount(viewerCount)}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {formatCount(likes)}
            </span>
          </div>
          <button className="hover:text-purple-600 transition-colors">
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}