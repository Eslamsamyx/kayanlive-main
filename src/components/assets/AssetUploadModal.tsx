'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  X,
  File,
  Image as ImageIcon,
  Video,
  FileText,
  Music,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Box,
} from 'lucide-react';
import { api } from '@/trpc/react';
import { AssetType } from '@prisma/client';
import { toast } from 'sonner';

interface UploadFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  uploadedData?: {
    fileName: string;
    filePath: string;
    fileKey: string;
    fileSize: number;
    mimeType: string;
    assetType: string;
  };
}

interface AssetUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultCompanyId?: string;
  defaultProjectId?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  VIDEO: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
  MODEL_3D: ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'],
};

export function AssetUploadModal({
  isOpen,
  onClose,
  onSuccess,
  defaultCompanyId,
  defaultProjectId,
}: AssetUploadModalProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [companyId, setCompanyId] = useState(defaultCompanyId || '');
  const [projectId, setProjectId] = useState(defaultProjectId || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug: Log when modal state changes
  console.log('🎭 AssetUploadModal render:', { isOpen, filesCount: files.length });

  const { data: companiesData } = api.company.getAll.useQuery({ page: 1, limit: 100 });
  const { data: projectsData } = api.project.getAll.useQuery({ page: 1, limit: 100 });

  const createAssetMutation = api.asset.create.useMutation({
    onError: (error) => {
      toast.error(`Failed to create asset: ${error.message}`);
    },
  });

  const getFileIcon = (mimeType: string, fileName?: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon size={24} className="text-blue-400" />;
    if (mimeType.startsWith('video/')) return <Video size={24} className="text-purple-400" />;
    if (mimeType.startsWith('audio/')) return <Music size={24} className="text-yellow-400" />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText size={24} className="text-green-400" />;
    if (mimeType.startsWith('model/') || (fileName && (fileName.endsWith('.glb') || fileName.endsWith('.gltf') || fileName.endsWith('.obj') || fileName.endsWith('.fbx')))) {
      return <Box size={24} className="text-pink-400" />;
    }
    return <File size={24} className="text-gray-400" />;
  };

  const validateFile = (file: File): string | null => {
    console.log('🔍 Validating file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      maxSize: MAX_FILE_SIZE,
    });

    if (file.size > MAX_FILE_SIZE) {
      const errorMsg = `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds 50MB limit`;
      console.error('❌ File too large:', errorMsg);
      return errorMsg;
    }

    // Check file extension for 3D models as fallback
    const fileName = file.name.toLowerCase();
    const is3DModel = fileName.endsWith('.glb') || fileName.endsWith('.gltf') || fileName.endsWith('.obj') || fileName.endsWith('.fbx');

    console.log('🎨 File type check:', {
      fileName,
      is3DModel,
      mimeType: file.type,
    });

    const allAllowedTypes = Object.values(ALLOWED_TYPES).flat();
    const isAllowed = allAllowedTypes.includes(file.type) ||
                      file.type.startsWith('image/') ||
                      file.type.startsWith('video/') ||
                      file.type.startsWith('audio/') ||
                      file.type.startsWith('model/') ||
                      (is3DModel && file.type === 'application/octet-stream') ||
                      (is3DModel && !file.type); // Some browsers don't set MIME type for .glb

    if (!isAllowed) {
      const errorMsg = `File type "${file.type || 'unknown'}" is not supported for ${file.name}`;
      console.error('❌ File type not allowed:', errorMsg);
      return errorMsg;
    }

    console.log('✅ File validation passed');
    return null;
  };

  const uploadFileToServer = async (uploadFile: UploadFile): Promise<void> => {
    const formData = new FormData();
    formData.append('file', uploadFile.file);

    try {
      // Update status to uploading
      setFiles(prev =>
        prev.map(f =>
          f.id === uploadFile.id
            ? { ...f, status: 'uploading' as const, progress: 0 }
            : f
        )
      );

      // Upload file
      const response = await fetch('/api/upload/asset', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const uploadData = await response.json();

      // Update with uploaded data
      setFiles(prev =>
        prev.map(f =>
          f.id === uploadFile.id
            ? { ...f, progress: 100, uploadedData: uploadData }
            : f
        )
      );

      // Create asset in database
      await createAssetMutation.mutateAsync({
        name: uploadFile.file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        type: uploadData.assetType as AssetType,
        fileName: uploadData.fileName,
        filePath: uploadData.filePath,
        fileSize: uploadData.fileSize,
        mimeType: uploadData.mimeType,
        companyId: companyId || undefined,
        projectId: projectId || undefined,
      });

      // Mark as success
      setFiles(prev =>
        prev.map(f =>
          f.id === uploadFile.id
            ? { ...f, status: 'success' as const }
            : f
        )
      );

      toast.success(`${uploadFile.file.name} uploaded successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setFiles(prev =>
        prev.map(f =>
          f.id === uploadFile.id
            ? { ...f, status: 'error' as const, error: errorMessage }
            : f
        )
      );
      toast.error(`Failed to upload ${uploadFile.file.name}: ${errorMessage}`);
    }
  };

  const handleFiles = useCallback((fileList: FileList | File[]) => {
    console.log('📁 handleFiles called with:', fileList.length, 'files');
    const newFiles: UploadFile[] = [];

    Array.from(fileList).forEach((file, index) => {
      console.log(`📄 Processing file ${index + 1}/${fileList.length}:`, file.name);
      const error = validateFile(file);
      if (error) {
        console.error(`❌ Validation failed for ${file.name}:`, error);
        toast.error(`${file.name}: ${error}`);
        return;
      }

      const uploadFile = {
        file,
        id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
        status: 'pending' as const,
        progress: 0,
      };
      newFiles.push(uploadFile);
      console.log('✅ File added to queue:', uploadFile.id, file.name);
    });

    console.log(`📊 Total files to add: ${newFiles.length}`);
    setFiles(prev => {
      const updated = [...prev, ...newFiles];
      console.log('📋 Updated files state:', updated.length, 'total files');
      return updated;
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🎯 File input changed');
    if (e.target.files && e.target.files.length > 0) {
      console.log('📂 Selected files:', e.target.files.length);
      handleFiles(e.target.files);
    } else {
      console.log('⚠️ No files selected');
    }
  }, [handleFiles]);

  const handleUploadAll = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');

    for (const file of pendingFiles) {
      await uploadFileToServer(file);
    }

    // Check if all files are done
    const allSuccess = files.every(f => f.status === 'success' || f.status === 'error');
    if (allSuccess && onSuccess) {
      onSuccess();
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleClose = () => {
    const hasUploading = files.some(f => f.status === 'uploading');
    if (hasUploading) {
      if (!confirm('Upload in progress. Are you sure you want to close?')) {
        return;
      }
    }
    setFiles([]);
    setCompanyId('');
    setProjectId('');
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  const pendingCount = files.filter(f => f.status === 'pending').length;
  const uploadingCount = files.filter(f => f.status === 'uploading').length;
  const successCount = files.filter(f => f.status === 'success').length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#2c2c2b] rounded-[25px] p-6 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          border: '2px solid rgba(122, 253, 214, 0.3)',
          fontFamily: '"Poppins", sans-serif',
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Upload Assets</h3>
            <p className="text-gray-400 text-sm mt-1">
              {files.length === 0 ? 'Select or drag files to upload' : `${files.length} file(s) selected`}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Drag & Drop Zone */}
        {files.length === 0 && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-[20px] p-12 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#7afdd6] bg-[#7afdd6]/10'
                : 'border-[#7afdd6]/30 hover:border-[#7afdd6]/50 hover:bg-white/5'
            }`}
          >
            <Upload size={48} className="mx-auto text-[#7afdd6] mb-4" />
            <p className="text-white font-medium mb-2">
              Drop files here or click to browse
            </p>
            <p className="text-gray-400 text-sm">
              Supports images, videos, documents, audio, and 3D models (max 50MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.glb,.gltf"
            />
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="flex-1 overflow-y-auto mb-4 space-y-2">
            <AnimatePresence>
              {files.map((uploadFile) => (
                <motion.div
                  key={uploadFile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white/5 rounded-[15px] p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getFileIcon(uploadFile.file.type, uploadFile.file.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {uploadFile.file.name}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {formatFileSize(uploadFile.file.size)}
                      </p>

                      {/* Progress Bar */}
                      {uploadFile.status === 'uploading' && (
                        <div className="mt-2">
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadFile.progress}%` }}
                              className="h-full bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff]"
                            />
                          </div>
                        </div>
                      )}

                      {/* Error Message */}
                      {uploadFile.error && (
                        <p className="text-red-400 text-xs mt-1">
                          {uploadFile.error}
                        </p>
                      )}
                    </div>

                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {uploadFile.status === 'pending' && (
                        <button
                          onClick={() => removeFile(uploadFile.id)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      {uploadFile.status === 'uploading' && (
                        <Loader2 size={20} className="text-[#7afdd6] animate-spin" />
                      )}
                      {uploadFile.status === 'success' && (
                        <CheckCircle size={20} className="text-green-400" />
                      )}
                      {uploadFile.status === 'error' && (
                        <AlertCircle size={20} className="text-red-400" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add More Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 border-2 border-dashed border-[#7afdd6]/30 rounded-[15px] text-[#7afdd6] hover:border-[#7afdd6]/50 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
            >
              <Upload size={18} />
              Add More Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.glb,.gltf"
            />
          </div>
        )}

        {/* Link Options */}
        {files.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[#7afdd6] mb-2">
                Link to Company (Optional)
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-4 py-2 rounded-[15px] bg-white/5 border border-[#7afdd6]/20 text-white focus:outline-none focus:border-[#7afdd6]/50"
              >
                <option value="">No Company</option>
                {companiesData?.companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#7afdd6] mb-2">
                Link to Project (Optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-4 py-2 rounded-[15px] bg-white/5 border border-[#7afdd6]/20 text-white focus:outline-none focus:border-[#7afdd6]/50"
              >
                <option value="">No Project</option>
                {projectsData?.projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Footer */}
        {files.length > 0 && (
          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <div className="text-sm text-gray-400">
              {successCount > 0 && <span className="text-green-400">{successCount} uploaded</span>}
              {uploadingCount > 0 && <span className="text-[#7afdd6] ml-3">{uploadingCount} uploading</span>}
              {pendingCount > 0 && <span className="text-gray-400 ml-3">{pendingCount} pending</span>}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-6 py-2 rounded-[15px] bg-white/5 text-white hover:bg-white/10 transition-all"
              >
                {successCount === files.length ? 'Close' : 'Cancel'}
              </button>

              {pendingCount > 0 && (
                <button
                  onClick={handleUploadAll}
                  disabled={uploadingCount > 0}
                  className="px-6 py-2 rounded-[15px] bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploadingCount > 0 ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Upload {pendingCount} {pendingCount === 1 ? 'File' : 'Files'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
