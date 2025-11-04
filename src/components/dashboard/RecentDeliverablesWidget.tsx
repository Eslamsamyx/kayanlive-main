'use client';

import { api } from '@/trpc/react';
import Link from 'next/link';
import { Package, Download, Eye, FileText, Image, Video, File, ArrowRight } from 'lucide-react';

export function RecentDeliverablesWidget() {
  const { data: assetsData, isLoading } = api.asset.getAll.useQuery({
    limit: 6,
  });

  const assets = assetsData?.assets || [];

  const getAssetIcon = (type: string, mimeType: string) => {
    switch (type) {
      case 'IMAGE':
        return <Image className="w-4 h-4" />;
      case 'VIDEO':
        return <Video className="w-4 h-4" />;
      case 'DOCUMENT':
        return <FileText className="w-4 h-4" />;
      case 'AUDIO':
        return <File className="w-4 h-4" />;
      case 'MODEL':
        return <Package className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const getAssetTypeColor = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return 'text-purple-400';
      case 'VIDEO':
        return 'text-blue-400';
      case 'DOCUMENT':
        return 'text-yellow-400';
      case 'AUDIO':
        return 'text-green-400';
      case 'MODEL':
        return 'text-[#7afdd6]';
      default:
        return 'text-gray-400';
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
    const assetDate = new Date(date);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - assetDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return assetDate.toLocaleDateString();
  };

  return (
    <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-[#7afdd6]" />
          Recent Deliverables
        </h2>
        <Link
          href="/en/dashboard/assets"
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
      ) : assets.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-[#666] mx-auto mb-3" />
          <p className="text-[#b2b2b2]">No deliverables yet</p>
          <p className="text-xs text-[#666] mt-2">Project files will appear here when ready</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="p-4 rounded-lg border border-[#333] hover:border-[#7afdd6] bg-[#1a1a19] transition-all hover:shadow-lg group"
            >
              <div className="flex items-start gap-3">
                {/* Asset Icon */}
                <div className={`p-2 rounded-lg bg-[#333] group-hover:bg-[#7afdd6]/20 transition-colors ${getAssetTypeColor(asset.type)}`}>
                  {getAssetIcon(asset.type, asset.mimeType)}
                </div>

                {/* Asset Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm mb-1 truncate group-hover:text-[#7afdd6] transition-colors">
                    {asset.name}
                  </h3>

                  {asset.description && (
                    <p className="text-xs text-[#666] mb-2 line-clamp-1">
                      {asset.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-[#666] mb-3">
                    <span className={`font-semibold ${getAssetTypeColor(asset.type)}`}>
                      {asset.type}
                    </span>
                    <span>•</span>
                    <span>{formatFileSize(asset.fileSize)}</span>
                    <span>•</span>
                    <span>{formatDate(asset.createdAt)}</span>
                  </div>

                  {/* Tags */}
                  {asset.tags && asset.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {asset.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-[#333] text-[#b2b2b2] rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {asset.tags.length > 2 && (
                        <span className="px-2 py-0.5 bg-[#333] text-[#666] rounded text-xs">
                          +{asset.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#7afdd6]/10 border border-[#7afdd6]/30 text-[#7afdd6] rounded-lg hover:bg-[#7afdd6]/20 transition-all text-xs font-semibold"
                      onClick={(e) => {
                        e.preventDefault();
                        // Preview logic
                        window.open(`/preview/${asset.id}`, '_blank');
                      }}
                    >
                      <Eye className="w-3 h-3" />
                      Preview
                    </button>

                    <button
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-900/20 border border-blue-700/30 text-blue-400 rounded-lg hover:bg-blue-900/30 transition-all text-xs font-semibold"
                      onClick={(e) => {
                        e.preventDefault();
                        // Download logic
                        window.open(`/api/files/download/${asset.id}`, '_blank');
                      }}
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {assets.length > 0 && (
        <div className="mt-6 pt-6 border-t border-[#333] grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{assets.length}</p>
            <p className="text-xs text-[#666]">Recent Files</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {formatFileSize(assets.reduce((sum, a) => sum + Number(a.fileSize), 0))}
            </p>
            <p className="text-xs text-[#666]">Total Size</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {new Set(assets.map(a => a.type)).size}
            </p>
            <p className="text-xs text-[#666]">File Types</p>
          </div>
        </div>
      )}
    </div>
  );
}
