'use client';

import { useState, useRef, DragEvent } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2, File as FileIcon } from 'lucide-react';
import { api } from '@/trpc/react';

interface UploadFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  assetId?: string;
}

interface AssetUploaderProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  projectId?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = {
  'image/jpeg': 'IMAGE',
  'image/png': 'IMAGE',
  'image/gif': 'IMAGE',
  'image/webp': 'IMAGE',
  'video/mp4': 'VIDEO',
  'video/quicktime': 'VIDEO',
  'audio/mpeg': 'AUDIO',
  'audio/wav': 'AUDIO',
  'application/pdf': 'DOCUMENT',
  'application/msword': 'DOCUMENT',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCUMENT',
};

export default function AssetUploader({
  open,
  onClose,
  onSuccess,
  projectId,
}: AssetUploaderProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = api.asset.uploadToS3.useMutation();

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is 50MB.`;
    }
    if (!ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES]) {
      return `File type not supported. Allowed: images, videos, audio, PDFs, documents.`;
    }
    return null;
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data:image/png;base64, prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data || '');
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: UploadFile[] = Array.from(fileList).map(file => {
      const error = validateFile(file);
      return {
        file,
        id: Math.random().toString(36).substring(7),
        status: error ? 'error' : 'pending',
        progress: 0,
        error,
      } as UploadFile;
    });

    setFiles(prev => [...prev, ...newFiles]);

    // Start uploading valid files
    newFiles.forEach(uploadFile => {
      if (!uploadFile.error) {
        void handleUpload(uploadFile);
      }
    });
  };

  const handleUpload = async (uploadFile: UploadFile) => {
    setFiles(prev => prev.map(f =>
      f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 10 } : f
    ));

    try {
      // Convert to base64
      const base64 = await fileToBase64(uploadFile.file);

      setFiles(prev => prev.map(f =>
        f.id === uploadFile.id ? { ...f, progress: 30 } : f
      ));

      // Upload to S3
      const result = await uploadMutation.mutateAsync({
        fileBuffer: base64,
        filename: uploadFile.file.name,
        mimeType: uploadFile.file.type,
        name: uploadFile.file.name,
        visibility: 'INTERNAL',
        projectId,
      });

      setFiles(prev => prev.map(f =>
        f.id === uploadFile.id
          ? { ...f, status: 'success', progress: 100, assetId: result.asset.id }
          : f
      ));
    } catch (error) {
      setFiles(prev => prev.map(f =>
        f.id === uploadFile.id
          ? {
              ...f,
              status: 'error',
              progress: 0,
              error: error instanceof Error ? error.message : 'Upload failed',
            }
          : f
      ));
    }
  };

  const handleRetry = (uploadFile: UploadFile) => {
    void handleUpload(uploadFile);
  };

  const handleRemove = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleClose = () => {
    const uploading = files.some(f => f.status === 'uploading');
    if (uploading) {
      if (!confirm('Upload in progress. Are you sure you want to close?')) {
        return;
      }
    }

    const anySuccess = files.some(f => f.status === 'success');
    if (anySuccess && onSuccess) {
      onSuccess();
    }

    setFiles([]);
    onClose();
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = () => {
    fileInputRef.current?.click();
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending':
        return <FileIcon className="h-5 w-5 text-gray-400" />;
      case 'uploading':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const allComplete = files.length > 0 && files.every(f => f.status === 'success' || f.status === 'error');
  const successCount = files.filter(f => f.status === 'success').length;
  const errorCount = files.filter(f => f.status === 'error').length;

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Upload Assets</h3>
            {files.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {successCount} uploaded, {errorCount} failed, {files.filter(f => f.status === 'uploading').length} uploading
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
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
            onClick={handleFileInput}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Support for images, videos, audio, PDFs, and documents
            </p>
            <p className="text-xs text-gray-500">
              Maximum file size: 50MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            {/* Add More Files Button */}
            <button
              onClick={handleFileInput}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors font-medium"
            >
              + Add More Files
            </button>

            {/* File Items */}
            {files.map((uploadFile) => (
              <div
                key={uploadFile.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(uploadFile.status)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                    {/* Progress Bar */}
                    {uploadFile.status === 'uploading' && (
                      <div className="mt-3">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${uploadFile.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Uploading... {uploadFile.progress}%
                        </p>
                      </div>
                    )}

                    {/* Success Message */}
                    {uploadFile.status === 'success' && (
                      <p className="text-sm text-green-600 mt-2 font-medium">
                        ✓ Uploaded successfully!
                      </p>
                    )}

                    {/* Error Message */}
                    {uploadFile.status === 'error' && (
                      <div className="mt-2">
                        <p className="text-sm text-red-600">{uploadFile.error}</p>
                        {!uploadFile.error?.includes('not supported') && !uploadFile.error?.includes('too large') && (
                          <button
                            onClick={() => handleRetry(uploadFile)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1"
                          >
                            Retry
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  {uploadFile.status !== 'uploading' && (
                    <button
                      onClick={() => handleRemove(uploadFile.id)}
                      className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        {allComplete && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                onSuccess?.();
                setFiles([]);
                onClose();
              }}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Done
            </button>
            <button
              onClick={() => setFiles([])}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
