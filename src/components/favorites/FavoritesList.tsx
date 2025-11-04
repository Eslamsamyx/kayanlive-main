'use client';

import { api } from '@/trpc/react';
import { FavoriteButton } from './FavoriteButton';
import { Download, Eye, FileIcon } from 'lucide-react';
import { useState } from 'react';
import { FilePreviewModal } from '../uploads/FilePreviewModal';
import { formatDistanceToNow } from 'date-fns';

export function FavoritesList() {
  const [previewFile, setPreviewFile] = useState<{
    fileKey: string;
    fileName: string;
    mimeType: string;
    fileSize: bigint | number;
  } | null>(null);

  // Fetch favorites
  const { data, isLoading, fetchNextPage, hasNextPage } = api.favorite.list.useInfiniteQuery(
    { limit: 20 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const favorites = data?.pages.flatMap((page) => page.favorites) ?? [];

  const handleDownload = (fileKey: string, fileName: string) => {
    window.open(`/api/upload/download/${fileKey}`, '_blank');
  };

  const handlePreview = (asset: any) => {
    if (!asset.fileKey) {
      return;
    }

    setPreviewFile({
      fileKey: asset.fileKey,
      fileName: asset.fileName || asset.name,
      mimeType: asset.mimeType || '',
      fileSize: asset.fileSize,
    });
  };

  const formatFileSize = (bytes: bigint | number): string => {
    const b = typeof bytes === 'bigint' ? Number(bytes) : bytes;
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(2)} KB`;
    if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(2)} MB`;
    return `${(b / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#333] border-t-[#7afdd6]" />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileIcon className="w-12 h-12 text-[#b2b2b2] mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No favorites yet</h3>
        <p className="text-[#b2b2b2] text-sm">
          Assets you favorite will appear here
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {favorites.map((favorite) => (
          <div
            key={favorite.asset.id}
            className="bg-[#2c2c2b] rounded-lg p-4 hover:bg-[#333] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* File Icon/Type */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-[#1a1a19] flex items-center justify-center">
                    <FileIcon className="w-6 h-6 text-[#7afdd6]" />
                  </div>
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">
                    {favorite.asset.name || favorite.asset.fileName}
                  </h4>
                  <div className="flex items-center gap-3 text-sm text-[#b2b2b2] mt-1">
                    <span>{formatFileSize(favorite.asset.fileSize)}</span>
                    <span>•</span>
                    <span>{favorite.asset.mimeType}</span>
                    {favorite.asset.uploader && (
                      <>
                        <span>•</span>
                        <span>by {favorite.asset.uploader.name || favorite.asset.uploader.email}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>
                      Added {formatDistanceToNow(new Date(favorite.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <FavoriteButton
                  assetId={favorite.asset.id}
                  initialIsFavorited={true}
                  size="sm"
                />

                {favorite.asset.fileKey && (
                  <>
                    <button
                      onClick={() => handlePreview(favorite.asset)}
                      className="p-2 rounded-lg bg-[#1a1a19] text-[#b2b2b2] hover:text-[#7afdd6] hover:bg-[#2c2c2b] transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDownload(favorite.asset.fileKey!, favorite.asset.fileName || favorite.asset.name)}
                      className="p-2 rounded-lg bg-[#1a1a19] text-[#b2b2b2] hover:text-[#7afdd6] hover:bg-[#2c2c2b] transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Load More */}
        {hasNextPage && (
          <div className="flex justify-center py-4">
            <button
              onClick={() => void fetchNextPage()}
              className="px-4 py-2 rounded-lg bg-[#7afdd6] hover:bg-[#6ce7c3] text-[#1a1a19] font-medium transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <FilePreviewModal
        isOpen={previewFile !== null}
        onClose={() => setPreviewFile(null)}
        file={previewFile}
      />
    </>
  );
}
