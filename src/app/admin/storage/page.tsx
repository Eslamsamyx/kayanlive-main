'use client';

import { api } from '@/trpc/react';
import { HardDrive, Folder, Image, Video, FileText, Music, Box, Loader2, Database, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StoragePage() {
  const { data: assetStats, isLoading: statsLoading } = api.asset.getStats.useQuery();
  const { data: storageData, isLoading: storageLoading } = api.asset.getStorageStats.useQuery();

  const isLoading = statsLoading || storageLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-[#7afdd6] mx-auto mb-4" />
          <p className="text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>Loading storage data...</p>
        </div>
      </div>
    );
  }

  // Real storage data from database
  const totalAssets = storageData?.assetCount || 0;
  const usedStorageGB = storageData?.totalGB || 0;
  const usedStorageMB = storageData?.totalMB || 0;

  // Storage by type (in GB)
  const storageByTypeGB = storageData?.storageByType || {
    IMAGE: 0,
    VIDEO: 0,
    DOCUMENT: 0,
    AUDIO: 0,
    MODEL_3D: 0,
    OTHER: 0,
  };

  // Asset counts by type
  const typeDistribution = assetStats?.typeDistribution || {
    IMAGE: 0,
    VIDEO: 0,
    DOCUMENT: 0,
    AUDIO: 0,
    MODEL_3D: 0,
    DESIGN: 0,
    OTHER: 0,
  };

  const assetCountsByType = {
    images: typeDistribution.IMAGE || 0,
    videos: typeDistribution.VIDEO || 0,
    documents: typeDistribution.DOCUMENT || 0,
    audio: typeDistribution.AUDIO || 0,
    models3d: typeDistribution.MODEL_3D || 0,
    other: typeDistribution.OTHER || 0,
  };

  // Format storage display
  const formatStorage = (gb: number) => {
    if (gb < 0.01) return `${(gb * 1024).toFixed(1)} MB`;
    return `${gb.toFixed(2)} GB`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1
          className="text-4xl md:text-6xl font-normal mb-4 capitalize"
          style={{
            background: 'linear-gradient(90deg, #b8a4ff 0%, #7afdd6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: '"Poppins", sans-serif',
            lineHeight: '1.1'
          }}
        >
          Storage Management
        </h1>
        <p className="text-[#888888] text-lg">
          Monitor storage usage and asset distribution
        </p>
      </motion.div>

      {/* Storage Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Used Storage"
          value={formatStorage(usedStorageGB)}
          icon={<Database size={24} />}
          gradient="#7afdd6, #b8a4ff"
        />
        <StatCard
          title="Total Assets"
          value={totalAssets}
          icon={<Folder size={24} />}
          gradient="#b8a4ff, #7afdd6"
        />
      </div>

      {/* Storage by Type */}
      <div
        className="rounded-[25px] p-6"
        style={{
          background: 'rgba(255, 255, 255, 0.01)',
          backdropFilter: 'blur(50.5px)',
          WebkitBackdropFilter: 'blur(50.5px)',
          border: '2px solid rgba(122, 253, 214, 0.2)'
        }}
      >
        <h2 className="text-xl font-semibold text-white mb-6" style={{ fontFamily: '"Poppins", sans-serif' }}>
          Storage by Asset Type
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TypeCard
            name="Images"
            count={assetCountsByType.images}
            storage={formatStorage(storageByTypeGB.IMAGE)}
            icon={<Image size={20} className="text-blue-400" />}
            color="blue"
          />
          <TypeCard
            name="Videos"
            count={assetCountsByType.videos}
            storage={formatStorage(storageByTypeGB.VIDEO)}
            icon={<Video size={20} className="text-purple-400" />}
            color="purple"
          />
          <TypeCard
            name="Documents"
            count={assetCountsByType.documents}
            storage={formatStorage(storageByTypeGB.DOCUMENT)}
            icon={<FileText size={20} className="text-green-400" />}
            color="green"
          />
          <TypeCard
            name="Audio"
            count={assetCountsByType.audio}
            storage={formatStorage(storageByTypeGB.AUDIO)}
            icon={<Music size={20} className="text-yellow-400" />}
            color="yellow"
          />
          <TypeCard
            name="3D Models"
            count={assetCountsByType.models3d}
            storage={formatStorage(storageByTypeGB.MODEL_3D)}
            icon={<Box size={20} className="text-pink-400" />}
            color="pink"
          />
          <TypeCard
            name="Other"
            count={assetCountsByType.other}
            storage={formatStorage(storageByTypeGB.OTHER)}
            icon={<Folder size={20} className="text-gray-400" />}
            color="gray"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, gradient }: { title: string; value: string | number; icon: React.ReactNode; gradient: string }) {
  return (
    <div
      className="rounded-[25px] p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
        backdropFilter: 'blur(50.5px)',
        WebkitBackdropFilter: 'blur(50.5px)',
        border: '2px solid rgba(122, 253, 214, 0.2)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)'
      }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-2xl" />

      <div className="flex items-center justify-between relative z-10">
        <div className="p-4 rounded-[18px]" style={{
          background: `linear-gradient(135deg, ${gradient.split(',')[0]} 0%, ${gradient.split(',')[1]} 100%)`,
          boxShadow: `0 8px 16px ${gradient.split(',')[0]}40`
        }}>
          <div className="text-[#1a1a19]">{icon}</div>
        </div>

        <div className="text-right">
          <p className="text-xs font-medium text-[#888888] uppercase tracking-wide mb-1">
            {title}
          </p>
          <p className="text-4xl font-bold text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
      </div>
    </div>
  );
}

function TypeCard({ name, count, storage, icon, color }: { name: string; count: number; storage: string; icon: React.ReactNode; color: string }) {
  return (
    <div
      className="p-4 rounded-xl border transition-colors hover:bg-white/5"
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderColor: 'rgba(122, 253, 214, 0.1)'
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <p className="text-sm font-medium text-white">{name}</p>
            <p className="text-xs text-[#888888]">{count} files</p>
          </div>
        </div>
        <Database size={16} className="text-[#7afdd6]" />
      </div>
      <div className="mt-2 pt-2 border-t border-[#7afdd6]/10">
        <p className="text-xs text-[#888888]">Storage: <span className="text-white font-medium">{storage}</span></p>
      </div>
    </div>
  );
}
