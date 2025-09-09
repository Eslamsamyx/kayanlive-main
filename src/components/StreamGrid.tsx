'use client';

import StreamCard from './StreamCard';
import { useTranslations } from 'next-intl';

interface Stream {
  id: string;
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

interface StreamGridProps {
  streams: Stream[];
  title?: string;
}

export default function StreamGrid({ streams, title }: StreamGridProps) {
  const t = useTranslations();

  return (
    <section className="py-8">
      {title && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {streams.map((stream) => (
          <StreamCard
            key={stream.id}
            title={stream.title}
            streamerName={stream.streamerName}
            streamerAvatar={stream.streamerAvatar}
            thumbnail={stream.thumbnail}
            viewerCount={stream.viewerCount}
            likes={stream.likes}
            category={stream.category}
            isLive={stream.isLive}
            duration={stream.duration}
          />
        ))}
      </div>

      {streams.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {t('noStreamsAvailable')}
          </p>
        </div>
      )}
    </section>
  );
}