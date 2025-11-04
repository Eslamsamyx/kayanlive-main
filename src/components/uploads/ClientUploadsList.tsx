'use client';

import { api } from '@/trpc/react';
import { motion } from 'framer-motion';
import {
  File,
  Download,
  Trash2,
  MessageSquare,
  Calendar,
  User,
  Folder,
  Grid,
  List,
  Search,
  Eye,
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';
import { FilePreviewModal } from './FilePreviewModal';

interface ClientUploadsListProps {
  projectId: string;
  onFileClick?: (fileId: string) => void;
}

type ViewMode = 'grid' | 'list';

export function ClientUploadsList({ projectId, onFileClick }: ClientUploadsListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewFile, setPreviewFile] = useState<{
    fileKey: string;
    fileName: string;
    mimeType: string;
    fileSize: bigint | number;
  } | null>(null);

  const utils = api.useUtils();

  const { data: folders } = api.clientUpload.getFolders.useQuery({ projectId });

  const { data: uploadsData, isLoading } = api.clientUpload.list.useQuery({
    projectId,
    folder: selectedFolder === 'all' ? undefined : selectedFolder,
  });

  const deleteMutation = api.clientUpload.delete.useMutation({
    onSuccess: () => {
      toast.success('File deleted successfully');
      utils.clientUpload.list.invalidate();
      utils.clientUpload.getFolders.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete file');
    },
  });

  const handleDelete = async (id: string, fileName: string) => {
    if (confirm(`Are you sure you want to delete "${fileName}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const handlePreview = (upload: any) => {
    setPreviewFile({
      fileKey: upload.fileKey,
      fileName: upload.fileName,
      mimeType: upload.mimeType,
      fileSize: upload.fileSize,
    });
  };

  const filteredUploads = uploadsData?.uploads.filter((upload) =>
    upload.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-[#333] bg-[#2c2c2b] p-6">
            <div className="h-4 w-2/3 bg-[#1a1a19] rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!uploadsData || uploadsData.uploads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-[#333] bg-[#2c2c2b]">
        <File className="h-16 w-16 text-[#666] mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Files Yet</h3>
        <p className="text-[#b2b2b2] max-w-md">
          Upload files to share with your team. They&apos;ll be notified when you add new files.
        </p>
      </div>
    );
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    return '📎';
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#333] bg-[#1a1a19] pl-10 pr-4 py-2 text-sm text-white placeholder:text-[#666] focus:border-[#7afdd6] focus:outline-none focus:ring-1 focus:ring-[#7afdd6]"
          />
        </div>

        {/* Folder Filter */}
        <select
          value={selectedFolder}
          onChange={(e) => setSelectedFolder(e.target.value)}
          className="rounded-lg border border-[#333] bg-[#1a1a19] px-4 py-2 text-sm text-white focus:border-[#7afdd6] focus:outline-none focus:ring-1 focus:ring-[#7afdd6]"
        >
          <option value="all">All Folders</option>
          {folders?.map((folder) => (
            <option key={folder} value={folder}>
              {folder.charAt(0).toUpperCase() + folder.slice(1)}
            </option>
          ))}
        </select>

        {/* View Mode Toggle */}
        <div className="flex rounded-lg border border-[#333] bg-[#1a1a19] p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`rounded px-3 py-1 transition-colors ${
              viewMode === 'list'
                ? 'bg-[#7afdd6] text-[#2c2c2b]'
                : 'text-[#666] hover:text-white'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded px-3 py-1 transition-colors ${
              viewMode === 'grid'
                ? 'bg-[#7afdd6] text-[#2c2c2b]'
                : 'text-[#666] hover:text-white'
            }`}
          >
            <Grid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Files List */}
      {viewMode === 'list' ? (
        <div className="space-y-2">
          {filteredUploads?.map((upload) => (
            <motion.div
              key={upload.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-[#333] bg-[#2c2c2b] p-4 hover:border-[#7afdd6] transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* File Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1a1a19] text-2xl">
                  {getFileIcon(upload.mimeType)}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => handlePreview(upload)}
                    className="text-sm font-medium text-white hover:text-[#7afdd6] transition-colors truncate block w-full text-left"
                  >
                    {upload.fileName}
                  </button>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[#666]">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {upload.uploader.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(upload.createdAt), 'MMM d, yyyy')}
                    </span>
                    {upload.folder && (
                      <span className="flex items-center gap-1">
                        <Folder className="h-3 w-3" />
                        {upload.folder}
                      </span>
                    )}
                    <span>{(Number(upload.fileSize) / 1024 / 1024).toFixed(2)} MB</span>
                    {upload.commentCount > 0 && (
                      <span className="flex items-center gap-1 text-[#7afdd6]">
                        <MessageSquare className="h-3 w-3" />
                        {upload.commentCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePreview(upload)}
                    className="rounded-lg p-2 hover:bg-[#1a1a19] transition-colors"
                    title="Preview"
                  >
                    <Eye className="h-4 w-4 text-[#b2b2b2] hover:text-[#7afdd6]" />
                  </button>
                  <button
                    onClick={() => window.open(`/api/upload/download/${upload.fileKey}`, '_blank')}
                    className="rounded-lg p-2 hover:bg-[#1a1a19] transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4 text-[#b2b2b2] hover:text-[#7afdd6]" />
                  </button>
                  <button
                    onClick={() => handleDelete(upload.id, upload.fileName)}
                    disabled={deleteMutation.isPending}
                    className="rounded-lg p-2 hover:bg-[#1a1a19] transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-[#b2b2b2] hover:text-red-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredUploads?.map((upload) => (
            <motion.div
              key={upload.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-[#333] bg-[#2c2c2b] p-4 hover:border-[#7afdd6] transition-colors"
            >
              <button
                onClick={() => handlePreview(upload)}
                className="w-full mb-3"
              >
                <div className="flex h-32 items-center justify-center rounded-lg bg-[#1a1a19] text-5xl">
                  {getFileIcon(upload.mimeType)}
                </div>
              </button>

              <button
                onClick={() => handlePreview(upload)}
                className="text-sm font-medium text-white truncate mb-2 hover:text-[#7afdd6] transition-colors block w-full text-left"
              >
                {upload.fileName}
              </button>

              <div className="flex items-center justify-between text-xs text-[#666] mb-3">
                <span>{(Number(upload.fileSize) / 1024 / 1024).toFixed(2)} MB</span>
                {upload.commentCount > 0 && (
                  <span className="flex items-center gap-1 text-[#7afdd6]">
                    <MessageSquare className="h-3 w-3" />
                    {upload.commentCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePreview(upload)}
                  className="flex-1 rounded-lg border border-[#333] p-2 hover:border-[#7afdd6] transition-colors"
                  title="Preview"
                >
                  <Eye className="h-4 w-4 text-[#b2b2b2] hover:text-[#7afdd6] mx-auto" />
                </button>
                <button
                  onClick={() => window.open(`/api/upload/download/${upload.fileKey}`, '_blank')}
                  className="flex-1 rounded-lg border border-[#333] p-2 hover:border-[#7afdd6] transition-colors"
                  title="Download"
                >
                  <Download className="h-4 w-4 text-[#b2b2b2] hover:text-[#7afdd6] mx-auto" />
                </button>
                <button
                  onClick={() => handleDelete(upload.id, upload.fileName)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 rounded-lg border border-[#333] p-2 hover:border-red-400 transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-[#b2b2b2] hover:text-red-400 mx-auto" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={previewFile !== null}
        onClose={() => setPreviewFile(null)}
        file={previewFile}
      />
    </div>
  );
}
