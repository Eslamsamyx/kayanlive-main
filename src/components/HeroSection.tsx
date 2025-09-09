'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Play, Users, Sparkles, TrendingUp } from 'lucide-react';

interface HeroSectionProps {
  featuredStreamerId?: string;
  featuredStreamerName?: string;
  featuredStreamerAvatar?: string;
  featuredStreamTitle?: string;
  featuredStreamThumbnail?: string;
  viewerCount?: number;
  category?: string;
}

export default function HeroSection({
  featuredStreamerName = 'TopStreamer',
  featuredStreamerAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Featured',
  featuredStreamTitle = 'Live Now: Amazing Content Stream',
  featuredStreamThumbnail = 'https://picsum.photos/seed/hero/1200/600',
  viewerCount = 25842,
  category = 'Featured'
}: HeroSectionProps) {
  const t = useTranslations();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">
                  {t('home.title')}
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                {t('home.subtitle')}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-400">
                  Live Streaming
                </span>
              </h1>
              
              <p className="text-xl text-purple-100 max-w-lg">
                Join thousands of creators and viewers in the ultimate streaming experience
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-300" />
                  <span className="text-3xl font-bold">50K+</span>
                </div>
                <p className="text-sm text-purple-200">Active Streamers</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-purple-300" />
                  <span className="text-3xl font-bold">1M+</span>
                </div>
                <p className="text-sm text-purple-200">Monthly Views</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-300" />
                  <span className="text-3xl font-bold">24/7</span>
                </div>
                <p className="text-sm text-purple-200">Live Content</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <button className="group relative px-8 py-4 bg-white text-purple-900 font-bold rounded-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200">
                <span className="relative z-10">{t('home.cta')}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {t('home.cta')}
                </span>
              </button>
              
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200">
                {t('watch')} Now
              </button>
            </div>
          </div>

          {/* Right Content - Featured Stream */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl group cursor-pointer">
              {/* Live Badge */}
              <div className="absolute top-4 left-4 z-20 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                LIVE NOW
              </div>

              {/* Viewer Count */}
              <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                {(viewerCount / 1000).toFixed(1)}K watching
              </div>

              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-900">
                <Image
                  src={featuredStreamThumbnail}
                  alt={featuredStreamTitle}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Play className="w-8 h-8 text-purple-900 ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>

              {/* Stream Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden ring-3 ring-purple-500">
                    <Image
                      src={featuredStreamerAvatar}
                      alt={featuredStreamerName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{featuredStreamerName}</h3>
                    <p className="text-sm text-gray-300">{category}</p>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-white line-clamp-2">
                  {featuredStreamTitle}
                </h4>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-pink-400 rounded-full opacity-20 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}