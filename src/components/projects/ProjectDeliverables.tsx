'use client';

import { api } from '@/trpc/react';
import { Package, Download, Eye, Image, Video, FileText, File, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface ProjectDeliverablesProps {
  projectId: string;
}

export function ProjectDeliverables({ projectId }: ProjectDeliverablesProps) {
  const { data: assetsData, isLoading } = api.asset.getAll.useQuery({
    projectId,
    limit: 50,
  });

  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  const assets = assetsData?.assets || [];

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return <Image className="w-5 h-5" />;
      case 'VIDEO':
        return <Video className="w-5 h-5" />;
      case 'DOCUMENT':
        return <FileText className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const getAssetTypeColor = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return 'text-purple-400 bg-purple-900/20 border-purple-700';
      case 'VIDEO':
        return 'text-blue-400 bg-blue-900/20 border-blue-700';
      case 'DOCUMENT':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-700';
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-700';
    }
  };

  const formatFileSize = (bytes: number | bigint) => {
    const numBytes = typeof bytes === 'bigint' ? Number(bytes) : bytes;
    if (numBytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    return Math.round((numBytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7afdd6] mx-auto"></div>
        <p className="text-[#b2b2b2] mt-4">Loading deliverables...</p>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="bg-[#2c2c2b] rounded-xl p-12 border border-[#333] text-center">
        <Package className="w-16 h-16 text-[#666] mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Deliverables Yet</h3>
        <p className="text-[#b2b2b2] mb-6">
          Files and assets will appear here as they are delivered
        </p>
        <Link
          href="/en/dashboard/assets"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#7afdd6] text-[#2c2c2b] rounded-lg hover:bg-[#6ee8c5] transition-all font-semibold"
        >
          Browse All Assets
        </Link>
      </div>
    );
  }

  // Group assets by type
  const groupedAssets = assets.reduce((acc, asset) => {
    if (!acc[asset.type]) {
      acc[asset.type] = [];
    }
    acc[asset.type].push(asset);
    return acc;
  }, {} as Record<string, typeof assets>);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#2c2c2b] rounded-xl p-6 border border-[#333]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#7afdd6]/20 rounded-lg">
              <Package className="w-5 h-5 text-[#7afdd6]" />
            </div>
            <span className="text-sm text-[#b2b2b2]">Total Files</span>
          </div>
          <p className="text-3xl font-bold text-white">{assets.length}</p>
        </div>

        <div className="bg-[#2c2c2b] rounded-xl p-6 border border-[#333]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-900/20 rounded-lg">
              <Image className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm text-[#b2b2b2]">Images</span>
          </div>
          <p className="text-3xl font-bold text-white">{groupedAssets['IMAGE']?.length || 0}</p>
        </div>

        <div className="bg-[#2c2c2b] rounded-xl p-6 border border-[#333]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-900/20 rounded-lg">
              <Video className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm text-[#b2b2b2]">Videos</span>
          </div>
          <p className="text-3xl font-bold text-white">{groupedAssets['VIDEO']?.length || 0}</p>
        </div>

        <div className="bg-[#2c2c2b] rounded-xl p-6 border border-[#333]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-900/20 rounded-lg">
              <FileText className="w-5 h-5 text-yellow-400" />
            </div>
            <span className="text-sm text-[#b2b2b2]">Documents</span>
          </div>
          <p className="text-3xl font-bold text-white">{groupedAssets['DOCUMENT']?.length || 0}</p>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="bg-[#2c2c2b] rounded-xl border border-[#333] hover:border-[#7afdd6] transition-all overflow-hidden group"
          >
            {/* Asset Preview/Icon */}
            <div className="aspect-video bg-[#1a1a19] flex items-center justify-center relative overflow-hidden">
              {asset.type === 'IMAGE' && asset.thumbnailKey ? (
                <img
                  src={`/api/files/preview/${asset.id}`}
                  alt={asset.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`p-8 rounded-full ${getAssetTypeColor(asset.type)}`}>
                  {getAssetIcon(asset.type)}
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => window.open(`/preview/${asset.id}`, '_blank')}
                  className="p-2 bg-[#7afdd6] text-[#2c2c2b] rounded-lg hover:bg-[#6ee8c5] transition-all"
                  title="Preview"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => window.open(`/api/files/download/${asset.id}`, '_blank')}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Asset Info */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-white font-semibold text-sm truncate flex-1">
                  {asset.name}
                </h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold uppercase border ${getAssetTypeColor(
                    asset.type
                  )}`}
                >
                  {asset.type}
                </span>
              </div>

              {asset.description && (
                <p className="text-xs text-[#666] mb-3 line-clamp-2">{asset.description}</p>
              )}

              <div className="flex items-center justify-between text-xs text-[#666] mb-3">
                <span>{formatFileSize(asset.fileSize)}</span>
                <span>•</span>
                <span>{formatDate(asset.createdAt)}</span>
              </div>

              {/* Tags */}
              {asset.tags && asset.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {asset.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-[#333] text-[#b2b2b2] rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {asset.tags.length > 3 && (
                    <span className="px-2 py-0.5 bg-[#333] text-[#666] rounded text-xs">
                      +{asset.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(`/preview/${asset.id}`, '_blank')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#7afdd6]/10 border border-[#7afdd6]/30 text-[#7afdd6] rounded-lg hover:bg-[#7afdd6]/20 transition-all text-xs font-semibold"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>

                <button
                  onClick={() => window.open(`/api/files/download/${asset.id}`, '_blank')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-900/20 border border-blue-700/30 text-blue-400 rounded-lg hover:bg-blue-900/30 transition-all text-xs font-semibold"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>

                <Link
                  href={`/en/dashboard/assets/${asset.id}`}
                  className="p-2 bg-[#333] text-[#b2b2b2] rounded-lg hover:bg-[#444] transition-all"
                  title="Comments"
                >
                  <MessageSquare className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
