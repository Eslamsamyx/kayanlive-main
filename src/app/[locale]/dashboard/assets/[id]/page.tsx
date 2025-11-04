'use client';

import { useSession } from 'next-auth/react';
import { redirect, useParams } from 'next/navigation';
import { api } from '@/trpc/react';
import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft,
  Download,
  Share2,
  Heart,
  Eye,
  Calendar,
  User,
  Building2,
  FolderKanban,
  Package,
  Image as ImageIcon,
  Video,
  FileText,
  File,
  Trash2,
  Edit,
  Archive,
  MoreVertical,
} from 'lucide-react';
import { format } from 'date-fns';
import { CommentThread } from '@/components/comments/CommentThread';
import { CommentableType } from '@prisma/client';

export default function AssetDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const assetId = params?.id as string;
  const locale = params?.locale as string || 'en';
  const [showActions, setShowActions] = useState(false);

  // Fetch asset details
  const { data: asset, isLoading, error } = api.asset.getById.useQuery(
    { id: assetId },
    { enabled: !!assetId }
  );

  // Track view
  const trackViewMutation = api.asset.trackView.useMutation();

  // Favorite mutations
  const addToFavoritesMutation = api.asset.addToFavorites.useMutation();
  const removeFromFavoritesMutation = api.asset.removeFromFavorites.useMutation();

  // Check if favorited
  const { data: favoritesData } = api.asset.getFavorites.useQuery(
    { page: 1, limit: 1000 },
    { enabled: !!session?.user?.id }
  );
  const isFavorite = favoritesData?.assets.some(a => a.id === assetId);

  // Track view on mount
  useState(() => {
    if (assetId && !isLoading && asset) {
      trackViewMutation.mutate({ assetId });
    }
  });

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a19] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7afdd6] mx-auto mb-4"></div>
          <p className="text-[#b2b2b2]">Loading asset...</p>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-[#1a1a19] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-700 rounded-xl p-6">
            <h3 className="text-red-400 font-semibold mb-2">Error Loading Asset</h3>
            <p className="text-[#b2b2b2]">{error?.message || 'Asset not found'}</p>
            <Link
              href={`/${locale}/dashboard/assets`}
              className="mt-4 inline-block px-4 py-2 bg-[#7afdd6] text-[#2c2c2b] rounded-lg hover:bg-[#6ee8c5] transition-all font-semibold"
            >
              Back to Assets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return <ImageIcon className="w-6 h-6" />;
      case 'VIDEO':
        return <Video className="w-6 h-6" />;
      case 'DOCUMENT':
        return <FileText className="w-6 h-6" />;
      case 'MODEL':
        return <Package className="w-6 h-6" />;
      default:
        return <File className="w-6 h-6" />;
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
      case 'MODEL':
        return 'text-[#7afdd6] bg-[#7afdd6]/20 border-[#7afdd6]';
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

  const handleFavoriteToggle = () => {
    if (isFavorite) {
      removeFromFavoritesMutation.mutate({ assetId });
    } else {
      addToFavoritesMutation.mutate({ assetId });
    }
  };

  const handleDownload = () => {
    window.open(`/api/files/download/${assetId}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#1a1a19] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href={`/${locale}/dashboard/assets`}
          className="inline-flex items-center gap-2 text-[#7afdd6] hover:text-[#6ee8c5] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Assets
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Asset Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Asset Header */}
            <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-4 rounded-xl border ${getAssetTypeColor(asset.type)}`}>
                    {getAssetIcon(asset.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-white mb-2">{asset.name}</h1>
                    {asset.description && (
                      <p className="text-[#b2b2b2] text-sm">{asset.description}</p>
                    )}
                  </div>
                </div>

                {/* Actions Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowActions(!showActions)}
                    className="p-2 text-[#b2b2b2] hover:text-white hover:bg-[#333] rounded-lg transition-all"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {showActions && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#2c2c2b] border border-[#333] rounded-lg shadow-lg z-10">
                      <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333] flex items-center gap-2 rounded-t-lg">
                        <Edit className="w-4 h-4" />
                        Edit Details
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333] flex items-center gap-2">
                        <Archive className="w-4 h-4" />
                        Archive
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[#333] flex items-center gap-2 rounded-b-lg">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#7afdd6] text-[#2c2c2b] rounded-lg hover:bg-[#6ee8c5] transition-all font-semibold"
                >
                  <Download className="w-5 h-5" />
                  Download
                </button>
                <button
                  onClick={handleFavoriteToggle}
                  className={`p-3 rounded-lg border transition-all ${
                    isFavorite
                      ? 'border-[#7afdd6] bg-[#7afdd6]/10 text-[#7afdd6]'
                      : 'border-[#333] text-[#b2b2b2] hover:border-[#7afdd6] hover:text-[#7afdd6]'
                  }`}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  className="p-3 border border-[#333] text-[#b2b2b2] rounded-lg hover:border-[#7afdd6] hover:text-[#7afdd6] transition-all"
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Asset Preview */}
            <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6">
              <h3 className="text-lg font-bold text-white mb-4">Preview</h3>
              <div className="aspect-video bg-[#1a1a19] rounded-lg flex items-center justify-center overflow-hidden">
                {asset.type === 'IMAGE' && asset.thumbnailKey ? (
                  <img
                    src={`/api/files/preview/${assetId}`}
                    alt={asset.name}
                    className="w-full h-full object-contain"
                  />
                ) : asset.type === 'VIDEO' && asset.previewKey ? (
                  <video
                    src={`/api/files/preview/${assetId}`}
                    controls
                    className="w-full h-full"
                  />
                ) : (
                  <div className="text-center">
                    <div className={`inline-flex p-8 rounded-full ${getAssetTypeColor(asset.type)}`}>
                      {getAssetIcon(asset.type)}
                    </div>
                    <p className="text-[#666] mt-4">No preview available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6">
              <CommentThread
                commentableType={CommentableType.ASSET}
                commentableId={assetId}
                title="Asset Feedback"
              />
            </div>
          </div>

          {/* Sidebar - Asset Details */}
          <div className="space-y-6">
            {/* File Information */}
            <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6">
              <h3 className="text-lg font-bold text-white mb-4">File Information</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-[#333]">
                  <span className="text-[#666] text-sm">Type</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${getAssetTypeColor(asset.type)}`}>
                    {asset.type}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#333]">
                  <span className="text-[#666] text-sm">Size</span>
                  <span className="text-white text-sm font-medium">{formatFileSize(asset.fileSize)}</span>
                </div>
                {asset.fileName && (
                  <div className="flex items-center justify-between py-2 border-b border-[#333]">
                    <span className="text-[#666] text-sm">File Name</span>
                    <span className="text-white text-sm font-medium truncate ml-2" title={asset.fileName}>
                      {asset.fileName}
                    </span>
                  </div>
                )}
                {asset.mimeType && (
                  <div className="flex items-center justify-between py-2 border-b border-[#333]">
                    <span className="text-[#666] text-sm">Format</span>
                    <span className="text-white text-sm font-medium">{asset.mimeType.split('/')[1]?.toUpperCase()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-b border-[#333]">
                  <span className="text-[#666] text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Uploaded
                  </span>
                  <span className="text-white text-sm font-medium">
                    {format(new Date(asset.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[#666] text-sm flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Views
                  </span>
                  <span className="text-white text-sm font-medium">{asset.viewCount || 0}</span>
                </div>
              </div>
            </div>

            {/* Uploader */}
            {asset.uploader && (
              <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6">
                <h3 className="text-lg font-bold text-white mb-4">Uploaded By</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#7afdd6]/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#7afdd6]" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{asset.uploader.name || asset.uploader.email}</p>
                    <p className="text-[#666] text-xs">{asset.uploader.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Related Projects */}
            {asset.projects && asset.projects.length > 0 && (
              <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-[#7afdd6]" />
                  Related Projects
                </h3>
                <div className="space-y-3">
                  {asset.projects.map((pa) => (
                    <Link
                      key={pa.id}
                      href={`/${locale}/dashboard/projects/${pa.project.id}`}
                      className="block p-3 rounded-lg border border-[#333] hover:border-[#7afdd6] transition-all group"
                    >
                      <p className="text-white font-medium group-hover:text-[#7afdd6] transition-colors">
                        {pa.project.name}
                      </p>
                      {pa.project.company && (
                        <p className="text-[#666] text-xs mt-1 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {pa.project.company.name}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {asset.tags && asset.tags.length > 0 && (
              <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6">
                <h3 className="text-lg font-bold text-white mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {asset.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-[#7afdd6]/10 border border-[#7afdd6]/30 text-[#7afdd6] rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
