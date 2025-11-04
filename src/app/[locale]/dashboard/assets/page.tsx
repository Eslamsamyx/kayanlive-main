'use client';

import { useState, useMemo } from 'react';
import { api } from '@/trpc/react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import {
  Package,
  Search,
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  File,
  Music,
  Download,
  Link as LinkIcon,
  X,
  Loader2,
  Heart,
  Eye,
} from 'lucide-react';
import { AssetType } from '@prisma/client';
import { format } from 'date-fns';
import AssetUploader from '@/components/assets/asset-uploader';
import FavoriteButton from '@/components/assets/favorite-button';
import AddToCollectionButton from '@/components/collections/add-to-collection-button';
import ShareButton from '@/components/assets/share-button';
import { FilePreviewModal } from '@/components/uploads/FilePreviewModal';

export default function AssetsPage() {
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<AssetType | undefined>();
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<any>(null);

  // Debounce search to reduce API calls
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Phase 2 API: advancedSearch
  const { data: assetsData, isLoading, error, refetch } = api.asset.advancedSearch.useQuery({
    query: debouncedSearch || undefined,
    type: typeFilter,
    projectId: selectedProjectId,
    favoritesOnly: showFavoritesOnly ? true : undefined,
    page: currentPage,
    limit: 20,
    sortBy: 'createdAt',
  });

  const { data: projectsData } = api.project.getMyProjects.useQuery();

  // Download mutation
  const downloadMutation = api.asset.getDownloadUrl.useMutation();

  const handleDownload = async (assetId: string, variant?: string) => {
    try {
      const result = await downloadMutation.mutateAsync({
        assetId,
      });
      // Open download URL in new tab
      window.open(result.url, '_blank');
    } catch (error) {
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Calculate stats from search results
  const stats = useMemo(() => {
    if (!assetsData) return { total: 0, IMAGE: 0, VIDEO: 0, DOCUMENT: 0, AUDIO: 0, MODEL_3D: 0, DESIGN: 0, OTHER: 0 };

    const typeDistribution = assetsData.assets.reduce((acc, asset) => {
      acc[asset.type] = (acc[asset.type] || 0) + 1;
      return acc;
    }, {} as Record<AssetType, number>);

    return {
      total: assetsData.pagination.total,
      ...typeDistribution,
    };
  }, [assetsData]);

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    redirect('/login');
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-[#7afdd6] mx-auto mb-4" />
            <p className="text-[#b2b2b2]">Loading your assets...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
          <h3 className="text-red-400 font-semibold mb-2">Error Loading Assets</h3>
          <p className="text-red-400">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const assets = assetsData?.assets || [];
  const projects = projectsData || [];
  const pagination = assetsData?.pagination;

  const getAssetTypeIcon = (type: AssetType, size = 24) => {
    switch (type) {
      case 'IMAGE':
        return <ImageIcon size={size} className="text-purple-400" />;
      case 'VIDEO':
        return <Video size={size} className="text-blue-400" />;
      case 'DOCUMENT':
        return <FileText size={size} className="text-yellow-400" />;
      case 'AUDIO':
        return <Music size={size} className="text-yellow-400" />;
      case 'MODEL_3D':
      case 'DESIGN':
        return <File size={size} className="text-[#7afdd6]" />;
      default:
        return <File size={size} className="text-[#666]" />;
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

  const selectedAsset = assets.find(a => a.id === selectedAssetId);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Digital Assets</h1>
          <p className="text-[#b2b2b2] mt-2">
            Manage your files, images, videos, and documents
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-3 bg-[#7afdd6] text-[#2c2c2b] rounded-lg hover:bg-[#6ee8c5] transition-colors font-medium flex items-center gap-2"
        >
          <Upload size={20} />
          Upload Assets
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-[#2c2c2b] rounded-lg shadow-sm p-6 border border-[#333]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[#b2b2b2] mb-1">Total Assets</div>
              <div className="text-3xl font-bold text-white">{stats.total}</div>
            </div>
            <div className="p-3 bg-[#1a1a19] rounded-lg">
              <Package className="h-6 w-6 text-[#7afdd6]" />
            </div>
          </div>
        </div>

        <div className="bg-[#2c2c2b] rounded-lg shadow-sm p-6 border border-[#333]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[#b2b2b2] mb-1">Images</div>
              <div className="text-3xl font-bold text-purple-400">{stats.IMAGE || 0}</div>
            </div>
            <div className="p-3 bg-purple-900/20 rounded-lg">
              <ImageIcon className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#2c2c2b] rounded-lg shadow-sm p-6 border border-[#333]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[#b2b2b2] mb-1">Videos</div>
              <div className="text-3xl font-bold text-blue-400">{stats.VIDEO || 0}</div>
            </div>
            <div className="p-3 bg-blue-900/20 rounded-lg">
              <Video className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#2c2c2b] rounded-lg shadow-sm p-6 border border-[#333]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[#b2b2b2] mb-1">Documents</div>
              <div className="text-3xl font-bold text-yellow-400">{stats.DOCUMENT || 0}</div>
            </div>
            <div className="p-3 bg-yellow-900/20 rounded-lg">
              <FileText className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#2c2c2b] rounded-lg shadow-sm p-6 border border-[#333]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[#b2b2b2] mb-1">Other</div>
              <div className="text-3xl font-bold text-yellow-400">
                {(stats.AUDIO || 0) + (stats.MODEL_3D || 0) + (stats.DESIGN || 0) + (stats.OTHER || 0)}
              </div>
            </div>
            <div className="p-3 bg-yellow-900/20 rounded-lg">
              <Music className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666]" size={20} />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#2c2c2b] border border-[#333] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:border-transparent placeholder:text-[#666]"
          />
        </div>

        <div className="flex gap-4 items-center w-full md:w-auto">
          {/* Favorites Filter Button */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
              showFavoritesOnly
                ? 'bg-red-900/20 border-red-700 text-red-400 hover:bg-red-900/30'
                : 'bg-[#2c2c2b] border-[#333] text-[#b2b2b2] hover:bg-[#333]'
            }`}
            title={showFavoritesOnly ? 'Show all assets' : 'Show favorites only'}
          >
            <Heart
              size={18}
              className={showFavoritesOnly ? 'fill-red-500 text-red-500' : 'text-[#666]'}
            />
            <span className="hidden sm:inline">
              {showFavoritesOnly ? 'Favorites' : 'All'}
            </span>
          </button>

          <select
            value={selectedProjectId || 'ALL'}
            onChange={(e) => setSelectedProjectId(e.target.value === 'ALL' ? undefined : e.target.value)}
            className="px-4 py-2 bg-[#2c2c2b] border border-[#333] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
          >
            <option value="ALL">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <select
            value={typeFilter || 'ALL'}
            onChange={(e) => setTypeFilter(e.target.value === 'ALL' ? undefined : e.target.value as AssetType)}
            className="px-4 py-2 bg-[#2c2c2b] border border-[#333] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
          >
            <option value="ALL">All Types</option>
            <option value="IMAGE">Images</option>
            <option value="VIDEO">Videos</option>
            <option value="DOCUMENT">Documents</option>
            <option value="AUDIO">Audio</option>
            <option value="MODEL_3D">3D Models</option>
            <option value="DESIGN">Design Files</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Assets Grid */}
      {assets.length === 0 ? (
        <div className="bg-[#2c2c2b] rounded-lg shadow-sm border border-[#333] p-12 text-center">
          <Package className="mx-auto h-16 w-16 text-[#666] mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No assets found
          </h3>
          <p className="text-[#b2b2b2] mb-6">
            {searchTerm || typeFilter || selectedProjectId
              ? 'Try adjusting your filters'
              : 'Upload your first asset to get started'}
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#7afdd6] text-[#2c2c2b] rounded-lg hover:bg-[#6ee8c5] transition-colors font-medium"
          >
            <Upload size={20} />
            Upload Assets
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {assets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => setSelectedAssetId(asset.id)}
                onDoubleClick={() => {
                  setPreviewAsset(asset);
                  setShowPreviewModal(true);
                }}
                className="bg-[#2c2c2b] rounded-lg shadow-sm border border-[#333] overflow-hidden hover:border-[#7afdd6] transition-all cursor-pointer group"
              >
                {/* Asset Preview */}
                <div className="h-48 bg-[#1a1a19] flex items-center justify-center relative overflow-hidden">
                  {/* Add to Collection Button - Top Left */}
                  <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <AddToCollectionButton
                      assetId={asset.id}
                      size={24}
                      className="bg-[#2c2c2b]/80 backdrop-blur-sm rounded-full p-1.5 shadow-lg hover:bg-[#2c2c2b]"
                    />
                  </div>

                  {/* Favorite Button Overlay - Top Right */}
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FavoriteButton
                      assetId={asset.id}
                      initialIsFavorite={asset.isFavorite ?? false}
                      size={24}
                      className="bg-[#2c2c2b]/80 backdrop-blur-sm rounded-full p-1.5 shadow-lg hover:bg-[#2c2c2b]"
                    />
                  </div>

                  {/* Share Button - Below Favorite */}
                  <div className="absolute top-12 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ShareButton
                      assetId={asset.id}
                      size={24}
                      className="bg-[#2c2c2b]/80 backdrop-blur-sm rounded-full p-1.5 shadow-lg hover:bg-[#2c2c2b]"
                    />
                  </div>

                  {asset.thumbnailPath ? (
                    <img
                      src={asset.thumbnailPath}
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    getAssetTypeIcon(asset.type, 48)
                  )}
                </div>

                {/* Asset Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-white truncate mb-2">{asset.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-[#b2b2b2] mb-3">
                    <span className="px-2 py-1 bg-[#333] rounded text-xs">{asset.type}</span>
                    <span>{formatFileSize(asset.fileSize)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#666]">
                    <span>{format(new Date(asset.createdAt), 'MMM dd, yyyy')}</span>
                    <span>{asset.viewCount || 0} views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-[#2c2c2b] border border-[#333] text-white rounded-lg hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-[#b2b2b2]">
                Page {currentPage} of {pagination.pages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                disabled={currentPage === pagination.pages}
                className="px-4 py-2 bg-[#2c2c2b] border border-[#333] text-white rounded-lg hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Upload Modal - Real S3 Upload */}
      <AssetUploader
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => {
          refetch();
          setShowUploadModal(false);
        }}
        projectId={selectedProjectId}
      />

      {/* Asset Details Modal - Basic for now */}
      {selectedAssetId && selectedAsset && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#2c2c2b] rounded-lg p-8 max-w-3xl w-full my-8 border border-[#333]">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                {getAssetTypeIcon(selectedAsset.type, 32)}
                <h3 className="text-2xl font-bold text-white">{selectedAsset.name}</h3>
              </div>
              <button onClick={() => setSelectedAssetId(null)}>
                <X size={24} className="text-[#666] hover:text-[#b2b2b2]" />
              </button>
            </div>

            {/* Asset Preview */}
            <div className="mb-6 space-y-4">
              {selectedAsset.type === 'IMAGE' && selectedAsset.thumbnailPath && (
                <div className="rounded-lg overflow-hidden bg-[#1a1a19]">
                  <img
                    src={selectedAsset.thumbnailPath}
                    alt={selectedAsset.name}
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>
              )}

              {selectedAsset.type === 'MODEL_3D' && (
                <div className="rounded-lg overflow-hidden bg-gradient-to-br from-[#1a1a19] to-[#2c2c2b] border border-[#333] p-8 flex items-center justify-center aspect-square">
                  <div className="text-center">
                    <Package className="w-24 h-24 text-[#7afdd6] mx-auto mb-4" strokeWidth={1.5} />
                    <div className="text-[#7afdd6] text-sm font-medium">3D Model</div>
                    <div className="text-[#666] text-xs mt-1">{selectedAsset.fileName}</div>
                  </div>
                </div>
              )}

              {selectedAsset.type === 'VIDEO' && (
                <div className="rounded-lg overflow-hidden bg-gradient-to-br from-[#1a1a19] to-[#2c2c2b] border border-[#333] p-8 flex items-center justify-center aspect-video">
                  <div className="text-center">
                    <Video className="w-24 h-24 text-blue-400 mx-auto mb-4" strokeWidth={1.5} />
                    <div className="text-blue-400 text-sm font-medium">Video File</div>
                    <div className="text-[#666] text-xs mt-1">{selectedAsset.fileName}</div>
                  </div>
                </div>
              )}

              {selectedAsset.type === 'DOCUMENT' && (
                <div className="rounded-lg overflow-hidden bg-gradient-to-br from-[#1a1a19] to-[#2c2c2b] border border-[#333] p-8 flex items-center justify-center aspect-square">
                  <div className="text-center">
                    <FileText className="w-24 h-24 text-yellow-400 mx-auto mb-4" strokeWidth={1.5} />
                    <div className="text-yellow-400 text-sm font-medium">Document</div>
                    <div className="text-[#666] text-xs mt-1">{selectedAsset.fileName}</div>
                  </div>
                </div>
              )}

              {selectedAsset.type === 'AUDIO' && (
                <div className="rounded-lg overflow-hidden bg-gradient-to-br from-[#1a1a19] to-[#2c2c2b] border border-[#333] p-8 flex items-center justify-center aspect-square">
                  <div className="text-center">
                    <Music className="w-24 h-24 text-yellow-400 mx-auto mb-4" strokeWidth={1.5} />
                    <div className="text-yellow-400 text-sm font-medium">Audio File</div>
                    <div className="text-[#666] text-xs mt-1">{selectedAsset.fileName}</div>
                  </div>
                </div>
              )}

              {(selectedAsset.type === 'OTHER' || selectedAsset.type === 'DESIGN') && (
                <div className="rounded-lg overflow-hidden bg-gradient-to-br from-[#1a1a19] to-[#2c2c2b] border border-[#333] p-8 flex items-center justify-center aspect-square">
                  <div className="text-center">
                    <File className="w-24 h-24 text-[#7afdd6] mx-auto mb-4" strokeWidth={1.5} />
                    <div className="text-[#7afdd6] text-sm font-medium">{selectedAsset.type}</div>
                    <div className="text-[#666] text-xs mt-1">{selectedAsset.fileName}</div>
                  </div>
                </div>
              )}

              {/* Preview Button for All Asset Types */}
              <button
                onClick={() => {
                  console.log('👁️ Preview button clicked for asset:', selectedAsset.type);
                  setPreviewAsset(selectedAsset);
                  setShowPreviewModal(true);
                }}
                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#7afdd6] to-[#6ee8c5] text-[#2c2c2b] font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Eye size={20} />
                {selectedAsset.type === 'MODEL_3D' ? 'Open 3D Viewer' : 'Open Viewer'}
              </button>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-[#666] mb-1">Type</p>
                <p className="font-medium text-white">{selectedAsset.type}</p>
              </div>
              <div>
                <p className="text-sm text-[#666] mb-1">Size</p>
                <p className="font-medium text-white">{formatFileSize(selectedAsset.fileSize)}</p>
              </div>
              <div>
                <p className="text-sm text-[#666] mb-1">Uploaded</p>
                <p className="font-medium text-white">
                  {format(new Date(selectedAsset.createdAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#666] mb-1">Views</p>
                <p className="font-medium text-white">{selectedAsset.viewCount || 0}</p>
              </div>
              {selectedAsset.width && selectedAsset.height && (
                <>
                  <div>
                    <p className="text-sm text-[#666] mb-1">Dimensions</p>
                    <p className="font-medium text-white">{selectedAsset.width} × {selectedAsset.height}</p>
                  </div>
                </>
              )}
            </div>

            {selectedAsset.description && (
              <div className="mb-6">
                <p className="text-sm text-[#666] mb-1">Description</p>
                <p className="text-white">{selectedAsset.description}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                className="flex-1 px-4 py-3 bg-[#7afdd6] text-[#2c2c2b] rounded-lg hover:bg-[#6ee8c5] transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                onClick={() => handleDownload(selectedAsset.id)}
                disabled={downloadMutation.isPending}
              >
                {downloadMutation.isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Download
                  </>
                )}
              </button>
              <button className="px-4 py-3 border border-[#333] text-[#b2b2b2] rounded-lg hover:bg-[#333] transition-colors font-medium flex items-center gap-2">
                <LinkIcon size={18} />
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setPreviewAsset(null);
        }}
        file={previewAsset ? {
          fileKey: previewAsset.fileKey,
          filePath: previewAsset.filePath,
          fileName: previewAsset.fileName, // Use fileName (with extension) not name
          mimeType: previewAsset.mimeType,
          fileSize: previewAsset.fileSize,
        } : null}
      />
    </div>
  );
}
