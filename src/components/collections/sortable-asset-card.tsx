'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Download, X } from 'lucide-react';
import { format } from 'date-fns';
import { AssetType } from '@prisma/client';
import FavoriteButton from '@/components/assets/favorite-button';
import ShareButton from '@/components/assets/share-button';
import {
  Image as ImageIcon,
  Video,
  FileText,
  File,
  Music,
} from 'lucide-react';

interface SortableAssetCardProps {
  asset: any;
  onDownload: (assetId: string) => void;
  onRemove: (assetId: string) => void;
  isRemoving: boolean;
  isDownloading: boolean;
}

export default function SortableAssetCard({
  asset,
  onDownload,
  onRemove,
  isRemoving,
  isDownloading,
}: SortableAssetCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: asset.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getAssetTypeIcon = (type: AssetType, size = 24) => {
    switch (type) {
      case 'IMAGE':
        return <ImageIcon size={size} className="text-[#7afdd6]" />;
      case 'VIDEO':
        return <Video size={size} className="text-[#b8a4ff]" />;
      case 'DOCUMENT':
        return <FileText size={size} className="text-[#7afdd6]" />;
      case 'AUDIO':
        return <Music size={size} className="text-[#b8a4ff]" />;
      case 'MODEL_3D':
      case 'DESIGN':
        return <File size={size} className="text-[#7afdd6]" />;
      default:
        return <File size={size} className="text-[#888888]" />;
    }
  };

  const formatFileSize = (bytes: bigint | number): string => {
    const numBytes = typeof bytes === 'bigint' ? Number(bytes) : bytes;
    if (numBytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: 'rgba(255, 255, 255, 0.01)',
        backdropFilter: 'blur(50.5px)',
        WebkitBackdropFilter: 'blur(50.5px)',
        border: '2px solid rgba(122, 253, 214, 0.2)',
      }}
      className="rounded-[25px] overflow-hidden hover:scale-[1.02] transition-all group relative"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <div className="bg-[#2c2c2b]/80 backdrop-blur-sm rounded-lg px-2 py-1 shadow-lg border border-[#7afdd6]/20">
          <GripVertical size={18} className="text-[#7afdd6]" />
        </div>
      </div>

      {/* Asset Preview */}
      <div className="h-48 bg-gradient-to-br from-[#1a1a19] to-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
        {/* Favorite Button Overlay */}
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <FavoriteButton
            assetId={asset.id}
            initialIsFavorite={asset.isFavorite ?? false}
            size={24}
            className="bg-[#2c2c2b]/80 backdrop-blur-sm rounded-full p-1.5 shadow-lg hover:bg-[#3a3a3a]"
          />
        </div>

        {/* Share Button - Below Favorite */}
        <div className="absolute top-12 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <ShareButton
            assetId={asset.id}
            size={24}
            className="bg-[#2c2c2b]/80 backdrop-blur-sm rounded-full p-1.5 shadow-lg hover:bg-[#3a3a3a]"
          />
        </div>

        {/* Remove from Collection Button */}
        <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onRemove(asset.id)}
            disabled={isRemoving}
            className="bg-red-500/80 backdrop-blur-sm rounded-full p-1.5 shadow-lg hover:bg-red-600 text-white disabled:opacity-50 transition-all"
            title="Remove from collection"
          >
            <X size={18} />
          </button>
        </div>

        {asset.thumbnailUrl ? (
          <img
            src={asset.thumbnailUrl}
            alt={asset.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          getAssetTypeIcon(asset.type, 48)
        )}
      </div>

      {/* Asset Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white truncate mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
          {asset.name}
        </h3>
        <div className="flex items-center gap-2 text-sm text-[#888888] mb-3">
          <span className="px-2 py-1 bg-[#2c2c2b]/60 rounded-lg text-xs border border-[#7afdd6]/20 text-[#7afdd6]">
            {asset.type}
          </span>
          <span>{formatFileSize(asset.fileSize)}</span>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => onDownload(asset.id)}
            disabled={isDownloading}
            className="text-sm text-[#7afdd6] hover:text-[#b8a4ff] font-medium flex items-center gap-1 disabled:opacity-50 transition-colors"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            <Download size={14} />
            {isDownloading ? 'Downloading...' : 'Download'}
          </button>
          <span className="text-xs text-[#888888]">
            {format(new Date(asset.createdAt), 'MMM dd, yyyy')}
          </span>
        </div>
      </div>
    </div>
  );
}
