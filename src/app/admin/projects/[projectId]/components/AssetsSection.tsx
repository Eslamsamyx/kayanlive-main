'use client';

import { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/trpc/react';
import {
  Package,
  Download,
  Eye,
  Trash2,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  File,
  Upload,
  Search,
  X,
  Loader2,
  CheckCircle,
  Box,
  Archive,
  Palette,
  Clock,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
} from 'lucide-react';
import { format } from 'date-fns';

// Lazy load 3D preview component
const ThreeDPreview = lazy(() =>
  import('@/components/previews/ThreeDPreview').then((mod) => ({ default: mod.ThreeDPreview }))
);

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return ImageIcon;
  if (mimeType.startsWith('video/')) return Video;
  if (mimeType.startsWith('audio/')) return Music;
  if (mimeType.includes('pdf')) return FileText;
  return File;
};

const getFileColor = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return 'text-blue-400';
  if (mimeType.startsWith('video/')) return 'text-purple-400';
  if (mimeType.startsWith('audio/')) return 'text-green-400';
  if (mimeType.includes('pdf')) return 'text-red-400';
  return 'text-gray-400';
};

export function AssetsSection({ projectId }: { projectId: string }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [downloadRequestModal, setDownloadRequestModal] = useState<{
    isOpen: boolean;
    assetId: string;
    filename: string;
  }>({ isOpen: false, assetId: '', filename: '' });
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    asset: any | null;
  }>({ isOpen: false, asset: null });
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const utils = api.useUtils();

  const { data: assetsData, isLoading } = api.asset.getByProject.useQuery({ projectId });
  const { data: project } = api.project.getById.useQuery({ id: projectId });
  const assets = assetsData?.assets || [];

  // Fetch user's download requests to check approval status
  const { data: userDownloadRequests } = api.downloadRequest.listMy.useQuery();

  const createDownloadRequestMutation = api.downloadRequest.create.useMutation({
    onSuccess: () => {
      setDownloadRequestModal({ isOpen: false, assetId: '', filename: '' });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      utils.downloadRequest.listMy.invalidate();
    },
  });

  // Check download request status for an asset
  const getDownloadRequestStatus = (assetId: string) => {
    if (!userDownloadRequests) return null;
    const request = userDownloadRequests.find((req: any) => req.asset.id === assetId);
    return request ? request.status : null;
  };

  // Get asset type from filename
  const getAssetType = (asset: any) => {
    const filename = asset.filename || asset.fileName || '';
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const mimeType = asset.mimeType || '';

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'tif'].includes(ext) || mimeType.startsWith('image/')) return 'image';
    if (['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', 'flv', 'wmv', 'mpg', 'mpeg'].includes(ext) || mimeType.startsWith('video/')) return 'video';
    if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'].includes(ext) || mimeType.startsWith('audio/')) return 'audio';
    if (ext === 'pdf' || mimeType.includes('pdf')) return 'pdf';
    if (['glb', 'gltf', 'obj', 'fbx', 'stl', '3ds', 'dae', 'blend', 'usdz'].includes(ext)) return '3d';
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt', 'ods', 'odp'].includes(ext)) return 'document';
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) return 'archive';
    if (['psd', 'ai', 'sketch', 'fig', 'xd', 'indd'].includes(ext)) return 'design';
    return 'other';
  };

  // Filter and sort assets
  const filteredAssets = assets
    .filter((asset: any) => {
      // Search filter
      const matchesSearch = asset.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           asset.category?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      // Type filter
      if (typeFilter !== 'all') {
        const assetType = getAssetType(asset);
        if (assetType !== typeFilter) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        const downloadStatus = getDownloadRequestStatus(asset.id);
        if (statusFilter === 'approved' && downloadStatus !== 'APPROVED') return false;
        if (statusFilter === 'pending' && downloadStatus !== 'PENDING') return false;
        if (statusFilter === 'rejected' && downloadStatus !== 'REJECTED') return false;
        if (statusFilter === 'no-request' && downloadStatus !== null) return false;
      }

      return true;
    })
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        case 'oldest':
          return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        case 'name-asc':
          return (a.filename || '').localeCompare(b.filename || '');
        case 'name-desc':
          return (b.filename || '').localeCompare(a.filename || '');
        case 'largest':
          return (b.fileSize || 0) - (a.fileSize || 0);
        case 'smallest':
          return (a.fileSize || 0) - (b.fileSize || 0);
        default:
          return 0;
      }
    });

  const handleDownloadRequest = (assetId: string, filename: string) => {
    setDownloadRequestModal({ isOpen: true, assetId, filename });
  };

  // Handle actual download for approved requests
  const handleDirectDownload = async (asset: any) => {
    try {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = asset.url;
      link.download = asset.filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Project Assets
          </h2>
          <p className="text-[#888888] text-sm">
            {filteredAssets.length} {filteredAssets.length === 1 ? 'asset' : 'assets'}
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          <Upload size={16} />
          Upload Asset
        </button>
      </motion.div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888]" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search assets..."
            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          />
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="mb-6 space-y-4">
        {/* Type Filters */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Filter size={16} className="text-[#7afdd6]" />
            <span className="text-sm font-medium text-white">Filter by Type</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All', icon: Package },
              { value: 'image', label: 'Images', icon: ImageIcon },
              { value: 'video', label: 'Videos', icon: Video },
              { value: 'audio', label: 'Audio', icon: Music },
              { value: 'pdf', label: 'PDFs', icon: FileText },
              { value: '3d', label: '3D Models', icon: Box },
              { value: 'document', label: 'Documents', icon: FileText },
              { value: 'archive', label: 'Archives', icon: Archive },
              { value: 'design', label: 'Design', icon: Palette },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTypeFilter(value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  typeFilter === value
                    ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b]'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Status and Sort Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-[#7afdd6]" />
            <span className="text-sm font-medium text-white mr-2">Status:</span>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'approved', label: 'Approved', color: 'green' },
                { value: 'pending', label: 'Pending', color: 'yellow' },
                { value: 'rejected', label: 'Rejected', color: 'red' },
                { value: 'no-request', label: 'No Request', color: 'gray' },
              ].map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === value
                      ? color === 'green' ? 'bg-green-500/30 text-green-400 border border-green-500/50'
                      : color === 'yellow' ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-500/50'
                      : color === 'red' ? 'bg-red-500/30 text-red-400 border border-red-500/50'
                      : color === 'gray' ? 'bg-gray-500/30 text-gray-400 border border-gray-500/50'
                      : 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b]'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown size={16} className="text-[#7afdd6]" />
            <span className="text-sm font-medium text-white mr-2">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              <option value="newest" className="bg-[#2c2c2b]">Newest First</option>
              <option value="oldest" className="bg-[#2c2c2b]">Oldest First</option>
              <option value="name-asc" className="bg-[#2c2c2b]">Name (A-Z)</option>
              <option value="name-desc" className="bg-[#2c2c2b]">Name (Z-A)</option>
              <option value="largest" className="bg-[#2c2c2b]">Largest First</option>
              <option value="smallest" className="bg-[#2c2c2b]">Smallest First</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(typeFilter !== 'all' || statusFilter !== 'all' || sortBy !== 'newest') && (
          <div className="flex items-center gap-2 text-xs text-[#888888]">
            <span>Active filters:</span>
            {typeFilter !== 'all' && (
              <span className="px-2 py-1 bg-[#7afdd6]/20 text-[#7afdd6] rounded">
                Type: {typeFilter}
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="px-2 py-1 bg-[#7afdd6]/20 text-[#7afdd6] rounded">
                Status: {statusFilter}
              </span>
            )}
            {sortBy !== 'newest' && (
              <span className="px-2 py-1 bg-[#7afdd6]/20 text-[#7afdd6] rounded">
                Sort: {sortBy}
              </span>
            )}
            <button
              onClick={() => {
                setTypeFilter('all');
                setStatusFilter('all');
                setSortBy('newest');
              }}
              className="px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.length === 0 ? (
          <div className="col-span-full rounded-[25px] p-12 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(122, 253, 214, 0.2)',
            }}
          >
            <Package className="mx-auto mb-4 text-[#7afdd6]" size={48} />
            <p className="text-[#888888]">
              {searchTerm ? 'No assets found' : 'No assets yet'}
            </p>
          </div>
        ) : (
          filteredAssets.map((asset: any, index: number) => {
            const FileIcon = getFileIcon(asset.mimeType);
            const fileColor = getFileColor(asset.mimeType);

            return (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-[25px] p-6 hover:shadow-xl transition-all duration-300 group"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(122, 253, 214, 0.2)',
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                {/* Preview or Icon */}
                {asset.mimeType.startsWith('image/') ? (
                  <div className="w-full h-40 mb-4 rounded-xl overflow-hidden bg-white/5">
                    <img
                      src={asset.url}
                      alt={asset.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 mb-4 rounded-xl bg-white/5 flex items-center justify-center">
                    <FileIcon size={48} className={fileColor} />
                  </div>
                )}

                {/* File Info */}
                <div className="mb-4">
                  <h3 className="text-white font-semibold mb-1 truncate" title={asset.filename}>
                    {asset.filename}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-[#888888]">
                    <span>{formatFileSize(asset.fileSize)}</span>
                    {asset.category && (
                      <span className="px-2 py-0.5 bg-white/10 rounded-full">{asset.category}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewModal({ isOpen: true, asset })}
                    className="flex-1 px-3 py-2 bg-white/10 text-white text-sm rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={14} />
                    View
                  </button>

                  {(() => {
                    const downloadStatus = getDownloadRequestStatus(asset.id);

                    if (downloadStatus === 'APPROVED') {
                      return (
                        <button
                          onClick={() => handleDirectDownload(asset)}
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500/20 to-green-400/20 text-green-400 text-sm rounded-xl hover:from-green-500/30 hover:to-green-400/30 transition-all flex items-center justify-center gap-2 border border-green-500/30"
                        >
                          <Download size={14} />
                          Download
                        </button>
                      );
                    } else if (downloadStatus === 'PENDING') {
                      return (
                        <button
                          disabled
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-yellow-500/20 to-yellow-400/20 text-yellow-400 text-sm rounded-xl flex items-center justify-center gap-2 border border-yellow-500/30 cursor-not-allowed opacity-70"
                        >
                          <Clock size={14} />
                          Pending
                        </button>
                      );
                    } else if (downloadStatus === 'REJECTED') {
                      return (
                        <button
                          onClick={() => handleDownloadRequest(asset.id, asset.filename)}
                          disabled={createDownloadRequestMutation.isPending}
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-red-500/20 to-red-400/20 text-red-400 text-sm rounded-xl hover:from-red-500/30 hover:to-red-400/30 transition-all flex items-center justify-center gap-2 border border-red-500/30"
                        >
                          <Download size={14} />
                          Request Again
                        </button>
                      );
                    } else {
                      return (
                        <button
                          onClick={() => handleDownloadRequest(asset.id, asset.filename)}
                          disabled={createDownloadRequestMutation.isPending}
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-[#7afdd6]/20 to-[#b8a4ff]/20 text-[#7afdd6] text-sm rounded-xl hover:from-[#7afdd6]/30 hover:to-[#b8a4ff]/30 transition-all flex items-center justify-center gap-2"
                        >
                          <Download size={14} />
                          Request
                        </button>
                      );
                    }
                  })()}
                </div>

                {/* Metadata */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#888888]">
                      Uploaded {format(new Date(asset.uploadedAt), 'MMM dd, yyyy')}
                    </p>
                    {(() => {
                      const downloadStatus = getDownloadRequestStatus(asset.id);
                      if (downloadStatus === 'APPROVED') {
                        return (
                          <span className="text-xs text-green-400 flex items-center gap-1">
                            <CheckCircle size={10} />
                            Approved
                          </span>
                        );
                      } else if (downloadStatus === 'PENDING') {
                        return (
                          <span className="text-xs text-yellow-400 flex items-center gap-1">
                            <Clock size={10} />
                            Pending
                          </span>
                        );
                      } else if (downloadStatus === 'REJECTED') {
                        return (
                          <span className="text-xs text-red-400 flex items-center gap-1">
                            <X size={10} />
                            Rejected
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Asset Preview Modal */}
      <AssetPreviewModal
        isOpen={previewModal.isOpen}
        asset={previewModal.asset}
        onClose={() => setPreviewModal({ isOpen: false, asset: null })}
        onDownloadRequest={(asset) => {
          setPreviewModal({ isOpen: false, asset: null });
          handleDownloadRequest(asset.id, asset.filename);
        }}
      />

      {/* Download Request Modal */}
      <DownloadRequestModal
        isOpen={downloadRequestModal.isOpen}
        filename={downloadRequestModal.filename}
        onClose={() => setDownloadRequestModal({ isOpen: false, assetId: '', filename: '' })}
        onSubmit={(reason) => {
          createDownloadRequestMutation.mutate({
            assetId: downloadRequestModal.assetId,
            reason,
          });
        }}
        isLoading={createDownloadRequestMutation.isPending}
      />

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-8 left-1/2 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3"
            style={{
              background: 'rgba(34, 197, 94, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '2px solid rgba(34, 197, 94, 0.3)',
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            <CheckCircle size={24} className="text-white" />
            <span className="text-white font-semibold">Download request submitted successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Asset Modal */}
      {project && (
        <UploadAssetModal
          isOpen={showUploadModal}
          projectId={projectId}
          companyId={project.companyId}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            utils.asset.getByProject.invalidate({ projectId });
            setShowUploadModal(false);
          }}
        />
      )}
    </div>
  );
}

// Download Request Modal Component
function DownloadRequestModal({
  isOpen,
  filename,
  onClose,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  filename: string;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onSubmit(reason.trim());
      setReason('');
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-[25px] p-8 max-w-lg w-full"
            style={{
              background: 'rgba(44, 44, 43, 0.95)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)',
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Request Download</h2>
                <p className="text-[#888888] text-sm">
                  Please provide a reason for downloading this asset
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-[#888888] hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* File Info */}
            <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Download size={20} className="text-[#7afdd6]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#888888] mb-1">File:</p>
                  <p className="text-white font-medium truncate" title={filename}>
                    {filename}
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[#888888] mb-2">
                  Reason for Download <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] transition-all"
                  placeholder="e.g., Needed for client presentation, Marketing campaign materials, etc."
                  autoFocus
                  disabled={isLoading}
                />
                <p className="text-xs text-[#888888] mt-2">
                  This helps track asset usage and ensures proper approval
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !reason.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Submit Request
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Asset Preview Modal Component
function AssetPreviewModal({
  isOpen,
  asset,
  onClose,
  onDownloadRequest,
}: {
  isOpen: boolean;
  asset: any;
  onClose: () => void;
  onDownloadRequest: (asset: any) => void;
}) {
  if (!asset) return null;

  // Debug: Log asset to see what properties we have
  console.log('Asset for preview:', asset);

  // Try to get mimeType from different possible properties
  const mimeType = asset.mimeType || asset.type || '';
  const filename = asset.filename || asset.fileName || '';

  // Fallback: detect from filename extension if mimeType is missing
  const getTypeFromFilename = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';

    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'tif'].includes(ext)) return 'image';
    // Videos
    if (['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', 'flv', 'wmv', 'mpg', 'mpeg'].includes(ext)) return 'video';
    // PDFs
    if (ext === 'pdf') return 'pdf';
    // Audio
    if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'].includes(ext)) return 'audio';
    // 3D Models
    if (['glb', 'gltf', 'obj', 'fbx', 'stl', '3ds', 'dae', 'blend', 'usdz'].includes(ext)) return '3d';
    // Documents
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt', 'ods', 'odp'].includes(ext)) return 'document';
    // Archives
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) return 'archive';
    // Design Files
    if (['psd', 'ai', 'sketch', 'fig', 'xd', 'indd'].includes(ext)) return 'design';

    return 'other';
  };

  const detectedType = mimeType && mimeType !== 'application/octet-stream'
    ? (mimeType.startsWith('image/') ? 'image'
       : mimeType.startsWith('video/') ? 'video'
       : mimeType.includes('pdf') ? 'pdf'
       : mimeType.startsWith('audio/') ? 'audio'
       : mimeType.includes('model') || mimeType.includes('gltf') ? '3d'
       : getTypeFromFilename(filename))
    : getTypeFromFilename(filename);

  const isImage = detectedType === 'image';
  const isVideo = detectedType === 'video';
  const isPDF = detectedType === 'pdf';
  const isAudio = detectedType === 'audio';
  const is3D = detectedType === '3d';
  const isDocument = detectedType === 'document';
  const isArchive = detectedType === 'archive';
  const isDesign = detectedType === 'design';

  console.log('Asset type detection:', {
    mimeType,
    filename,
    detectedType,
    isImage,
    isVideo,
    isPDF,
    isAudio,
    is3D,
    isDocument,
    isArchive,
    isDesign
  });

  // Extra logging for 3D files
  if (is3D) {
    console.log('3D Model Detected!', {
      url: asset.url,
      filename,
      extension: filename.split('.').pop(),
    });
  }

  // Prevent right-click context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-[25px] p-6 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            style={{
              background: 'rgba(44, 44, 43, 0.98)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)',
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4 flex-shrink-0">
              <div className="flex-1 min-w-0 pr-4">
                <h2 className="text-xl font-bold text-white truncate mb-1" title={filename}>
                  {filename}
                </h2>
                <div className="flex items-center gap-3 text-sm text-[#888888]">
                  <span>{(Number(asset.fileSize) / 1024 / 1024).toFixed(2)} MB</span>
                  <span>•</span>
                  <span>{mimeType || 'Unknown type'}</span>
                  <span>•</span>
                  <span className="text-[#7afdd6]">{detectedType}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[#888888] hover:text-white transition-colors flex-shrink-0"
              >
                <X size={24} />
              </button>
            </div>

            {/* Preview Area */}
            <div
              className={`flex-1 rounded-xl bg-black/20 ${is3D ? 'overflow-hidden' : 'overflow-auto flex items-center justify-center'}`}
              onContextMenu={handleContextMenu}
              style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                minHeight: '500px',
              }}
            >
              {isImage && (
                <div className="max-w-full max-h-full">
                  <img
                    src={asset.url}
                    alt={filename}
                    className="max-w-full max-h-full object-contain"
                    onContextMenu={handleContextMenu}
                    draggable={false}
                    onError={(e) => {
                      console.error('Image failed to load:', asset.url);
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="text-center p-8">
                          <p class="text-red-400 mb-2">Failed to load image</p>
                          <p class="text-xs text-gray-400">URL: ${asset.url}</p>
                        </div>`;
                      }
                    }}
                    style={{
                      pointerEvents: 'none',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                    }}
                  />
                </div>
              )}

              {isVideo && (
                <video
                  src={asset.url}
                  controls
                  controlsList="nodownload nofullscreen"
                  disablePictureInPicture
                  onContextMenu={handleContextMenu}
                  onError={(e) => {
                    console.error('Video failed to load:', asset.url);
                  }}
                  className="max-w-full max-h-full"
                  style={{
                    maxHeight: 'calc(90vh - 200px)',
                  }}
                >
                  Your browser does not support video playback.
                </video>
              )}

              {isPDF && (
                <iframe
                  src={`${asset.url}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-full min-h-[600px]"
                  onContextMenu={handleContextMenu}
                  title={asset.filename}
                  style={{
                    border: 'none',
                  }}
                />
              )}

              {isAudio && (
                <div className="w-full max-w-2xl px-8">
                  <div className="flex flex-col items-center gap-6">
                    <Music size={80} className="text-[#7afdd6]" />
                    <audio
                      src={asset.url}
                      controls
                      controlsList="nodownload"
                      onContextMenu={handleContextMenu}
                      className="w-full"
                      style={{
                        filter: 'invert(1) hue-rotate(180deg)',
                      }}
                    >
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                </div>
              )}

              {is3D && (
                <div className="w-full h-full relative" style={{ minHeight: '600px' }}>
                  <Suspense
                    fallback={
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#1a1a19] to-[#0a0a0a]">
                        <div className="text-center">
                          <Loader2 size={48} className="mx-auto mb-4 text-[#7afdd6] animate-spin" />
                          <p className="text-white mb-2">Loading 3D Viewer...</p>
                          <p className="text-[#888888] text-sm">Preparing interactive preview</p>
                        </div>
                      </div>
                    }
                  >
                    <ThreeDPreview
                      fileUrl={asset.url}
                      fileName={filename}
                      onDownload={() => onDownloadRequest(asset)}
                    />
                  </Suspense>
                </div>
              )}

              {isDocument && (
                <div className="text-center p-8">
                  <FileText size={80} className="mx-auto mb-4 text-blue-400" />
                  <p className="text-white mb-2 font-semibold">Document File</p>
                  <p className="text-[#888888] text-sm mb-4">
                    {filename.split('.').pop()?.toUpperCase()} format
                  </p>
                  <p className="text-[#888888] text-sm">
                    Document preview not available. Request download to access this file.
                  </p>
                </div>
              )}

              {isArchive && (
                <div className="text-center p-8">
                  <Archive size={80} className="mx-auto mb-4 text-orange-400" />
                  <p className="text-white mb-2 font-semibold">Archive File</p>
                  <p className="text-[#888888] text-sm mb-4">
                    {filename.split('.').pop()?.toUpperCase()} compressed archive
                  </p>
                  <p className="text-[#888888] text-sm">
                    Archive preview not available. Request download to extract contents.
                  </p>
                </div>
              )}

              {isDesign && (
                <div className="text-center p-8">
                  <Palette size={80} className="mx-auto mb-4 text-pink-400" />
                  <p className="text-white mb-2 font-semibold">Design File</p>
                  <p className="text-[#888888] text-sm mb-4">
                    {filename.split('.').pop()?.toUpperCase()} design file
                  </p>
                  <p className="text-[#888888] text-sm">
                    Design file preview requires specialized software. Request download to access.
                  </p>
                </div>
              )}

              {!isImage && !isVideo && !isPDF && !isAudio && !is3D && !isDocument && !isArchive && !isDesign && (
                <div className="text-center p-8">
                  <File size={80} className="mx-auto mb-4 text-[#7afdd6]" />
                  <p className="text-white mb-2">Preview not available for this file type</p>
                  <p className="text-[#888888] text-sm mb-2">
                    {filename.split('.').pop()?.toUpperCase()} • {mimeType || 'Unknown type'}
                  </p>
                  <p className="text-[#888888] text-sm">
                    Request download to access this file
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4 flex-shrink-0">
              <button
                onClick={() => onDownloadRequest(asset)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Request Download
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
              >
                Close
              </button>
            </div>

            {/* Watermark/Protection Notice */}
            <div className="mt-3 text-center">
              <p className="text-xs text-[#888888]">
                🔒 This preview is protected. Use "Request Download" to access the file.
              </p>
            </div>

            {/* Debug Info (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-xs" open>
                <summary className="cursor-pointer text-[#888888] hover:text-white">
                  Debug Info
                </summary>
                <div className="mt-2 p-3 bg-black/30 rounded-lg font-mono text-left space-y-1">
                  <div><span className="text-[#7afdd6]">URL:</span> {asset.url || 'NOT SET'}</div>
                  <div><span className="text-[#7afdd6]">MIME:</span> {mimeType || 'NOT SET'}</div>
                  <div><span className="text-[#7afdd6]">Filename:</span> {filename || 'NOT SET'}</div>
                  <div><span className="text-[#7afdd6]">Type:</span> {detectedType}</div>
                  <div><span className="text-[#7afdd6]">FileKey:</span> {asset.fileKey || 'NOT SET'}</div>
                  <div><span className="text-[#7afdd6]">FilePath:</span> {asset.filePath || 'NOT SET'}</div>
                  <div className="mt-2 pt-2 border-t border-[#333]">
                    <div><span className="text-yellow-400">is3D:</span> {is3D ? '✅ TRUE' : '❌ FALSE'}</div>
                    <div><span className="text-yellow-400">isImage:</span> {isImage ? '✅ TRUE' : '❌ FALSE'}</div>
                    <div><span className="text-yellow-400">isVideo:</span> {isVideo ? '✅ TRUE' : '❌ FALSE'}</div>
                    <div><span className="text-yellow-400">Extension:</span> {filename.split('.').pop()}</div>
                  </div>
                </div>
              </details>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Upload Asset Modal Component
function UploadAssetModal({
  isOpen,
  projectId,
  companyId,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  projectId: string;
  companyId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, number>>(new Map());
  const [assetName, setAssetName] = useState('');
  const [assetDescription, setAssetDescription] = useState('');
  const [assetCategory, setAssetCategory] = useState('');

  const uploadAssetMutation = api.asset.uploadToS3.useMutation();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getAssetTypeFromMimeType = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'IMAGE';
    if (mimeType.startsWith('video/')) return 'VIDEO';
    if (mimeType.startsWith('audio/')) return 'AUDIO';
    if (mimeType.includes('pdf')) return 'DOCUMENT';
    if (mimeType.includes('model') || mimeType.includes('gltf')) return 'THREE_D';
    if (mimeType.startsWith('application/')) return 'DOCUMENT';
    return 'OTHER';
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      for (const file of selectedFiles) {
        const fileId = `${file.name}-${Date.now()}`;
        setUploadingFiles((prev) => new Map(prev).set(fileId, 0));

        // Convert file to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            resolve(base64Data || '');
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        setUploadingFiles((prev) => new Map(prev).set(fileId, 50));

        // Upload file and create asset using the uploadToS3 endpoint
        await uploadAssetMutation.mutateAsync({
          fileBuffer: base64,
          filename: file.name,
          mimeType: file.type,
          name: assetName || file.name,
          description: assetDescription || undefined,
          category: assetCategory || undefined,
          companyId: companyId,
          projectId: projectId,
        });

        setUploadingFiles((prev) => new Map(prev).set(fileId, 100));
      }

      // Reset and close
      setTimeout(() => {
        setSelectedFiles([]);
        setUploadingFiles(new Map());
        setAssetName('');
        setAssetDescription('');
        setAssetCategory('');
        onSuccess();
      }, 500);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload assets. Please try again.');
    }
  };

  const handleClose = () => {
    if (uploadingFiles.size === 0) {
      setSelectedFiles([]);
      setAssetName('');
      setAssetDescription('');
      setAssetCategory('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-[25px] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              background: 'rgba(44, 44, 43, 0.95)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)',
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Upload Assets</h2>
                <p className="text-[#888888] text-sm">
                  Add new assets to this project
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={uploadingFiles.size > 0}
                className="p-2 text-[#888888] hover:text-white transition-colors disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>

            {/* Asset Info */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-[#888888] mb-2">
                  Asset Name (optional)
                </label>
                <input
                  type="text"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  placeholder="Enter asset name or leave blank to use filename"
                />
              </div>

              <div>
                <label className="block text-sm text-[#888888] mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={assetDescription}
                  onChange={(e) => setAssetDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  placeholder="Describe this asset..."
                />
              </div>

              <div>
                <label className="block text-sm text-[#888888] mb-2">
                  Category (optional)
                </label>
                <input
                  type="text"
                  value={assetCategory}
                  onChange={(e) => setAssetCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  placeholder="e.g., Marketing, Design, Documentation"
                />
              </div>
            </div>

            {/* File Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative rounded-xl border-2 border-dashed p-12 text-center transition-all cursor-pointer mb-6 ${
                isDragging
                  ? 'border-[#7afdd6] bg-[#7afdd6]/10'
                  : 'border-white/20 hover:border-[#7afdd6] hover:bg-white/5'
              }`}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload
                className={`mx-auto h-12 w-12 mb-4 transition-colors ${
                  isDragging ? 'text-[#7afdd6]' : 'text-[#888888]'
                }`}
              />
              <p className="text-lg font-medium text-white mb-2">
                {isDragging ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-[#888888]">
                or click to browse • Supports images, videos, documents, 3D models
              </p>
            </div>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2 mb-6">
                <h3 className="text-sm font-semibold text-white mb-3">
                  Selected Files ({selectedFiles.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedFiles.map((file, index) => {
                    const fileId = `${file.name}-${Date.now()}`;
                    const progress = uploadingFiles.get(fileId) || 0;
                    const isUploading = uploadingFiles.has(fileId);

                    return (
                      <div
                        key={index}
                        className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <File size={20} className="text-[#7afdd6] flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{file.name}</p>
                            <p className="text-xs text-[#888888]">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            {isUploading && (
                              <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  transition={{ duration: 0.3 }}
                                  className="h-full bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff]"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        {!isUploading && (
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                        {isUploading && progress === 100 && (
                          <CheckCircle size={20} className="text-[#7afdd6]" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploadingFiles.size > 0 || uploadAssetMutation.isPending}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploadingFiles.size > 0 || uploadAssetMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
                  </>
                )}
              </button>
              <button
                onClick={handleClose}
                disabled={uploadingFiles.size > 0}
                className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
