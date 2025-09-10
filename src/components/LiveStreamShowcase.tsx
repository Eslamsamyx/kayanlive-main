'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Play, Users, Heart, Share2, Bell, MoreVertical } from 'lucide-react';

interface LiveStreamShowcaseProps {
  streamId: string;
  title: string;
  description?: string;
  streamerName: string;
  streamerAvatar: string;
  thumbnail: string;
  viewerCount: number;
  likes: number;
  category: string;
  tags?: string[];
  isFollowing?: boolean;
  streamUrl?: string;
}

export default function LiveStreamShowcase({
  title,
  description = '',
  streamerName,
  streamerAvatar,
  thumbnail,
  viewerCount,
  likes,
  category,
  tags = [],
  isFollowing = false
}: LiveStreamShowcaseProps) {
  const t = useTranslations();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [following, setFollowing] = useState(isFollowing);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleFollow = () => {
    setFollowing(!following);
  };

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
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
      {/* Stream Player Area */}
      <div className="relative aspect-video bg-black group">
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover"
          priority
        />
        
        {/* Live Indicator */}
        <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 z-10">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          LIVE
        </div>

        {/* Viewer Count */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 z-10">
          <Users className="w-4 h-4" />
          {formatCount(viewerCount)} watching
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <button className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200">
            <Play className="w-8 h-8 text-purple-900 ml-1" fill="currentColor" />
          </button>
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-4 left-4 bg-purple-600/90 text-white px-3 py-1 rounded-full text-xs font-medium z-10">
          {category}
        </div>
      </div>

      {/* Stream Info Section */}
      <div className="p-6">
        {/* Title and Actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h2>
            {description && (
              <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                {description}
              </p>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleLike}
              className={`p-2 rounded-lg transition-colors ${
                isLiked 
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-sm font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Streamer Info and Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            {/* Streamer Avatar */}
            <div className="relative w-14 h-14 rounded-full overflow-hidden ring-3 ring-purple-500">
              <Image
                src={streamerAvatar}
                alt={streamerName}
                fill
                className="object-cover"
              />
            </div>
            
            {/* Streamer Details */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {streamerName}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {formatCount(likeCount)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {formatCount(viewerCount)}
                </span>
              </div>
            </div>
          </div>

          {/* Follow Button */}
          <button
            onClick={handleFollow}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
              following
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300'
                : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            <Bell className="w-4 h-4" />
            {following ? 'Following' : 'Follow'}
          </button>
        </div>

        {/* Watch Button */}
        <button className="w-full mt-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
          {t('watch')} Stream
        </button>
      </div>
    </div>
  );
}