'use client';

import React, { Suspense, lazy } from 'react';
import { X, Download, FileQuestion } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load preview components
const ImagePreview = lazy(() =>
  import('../previews/ImagePreview').then((mod) => ({ default: mod.ImagePreview }))
);
const VideoPreview = lazy(() =>
  import('../previews/VideoPreview').then((mod) => ({ default: mod.VideoPreview }))
);
const PDFPreview = lazy(() =>
  import('../previews/PDFPreview').then((mod) => ({ default: mod.PDFPreview }))
);
const ThreeDPreview = lazy(() =>
  import('../previews/ThreeDPreview').then((mod) => ({ default: mod.ThreeDPreview }))
);
const AudioPreview = lazy(() =>
  import('../previews/AudioPreview').then((mod) => ({ default: mod.AudioPreview }))
);

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    fileKey?: string | null;
    filePath?: string | null;
    fileName: string;
    mimeType: string;
    fileSize: bigint | number;
  } | null;
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full bg-[#1a1a19]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#333] border-t-[#7afdd6] mb-4 mx-auto" />
        <div className="text-white text-lg">Loading preview...</div>
      </div>
    </div>
  );
}

function UnsupportedPreview({
  fileName,
  mimeType,
  onDownload,
}: {
  fileName: string;
  mimeType: string;
  onDownload: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#1a1a19] text-center p-8">
      <FileQuestion className="w-24 h-24 text-[#b2b2b2] mb-4" />
      <div className="text-white text-xl font-semibold mb-2">Preview Not Available</div>
      <div className="text-[#b2b2b2] text-sm mb-2">
        Preview is not supported for this file type.
      </div>
      <div className="text-[#b2b2b2] text-xs mb-6 font-mono bg-[#2c2c2b] px-3 py-1 rounded">
        {mimeType}
      </div>
      <button
        onClick={onDownload}
        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#7afdd6] hover:bg-[#6ce7c3] text-[#1a1a19] font-medium transition-colors"
      >
        <Download className="w-5 h-5" />
        Download File
      </button>
    </div>
  );
}

export function FilePreviewModal({ isOpen, onClose, file }: FilePreviewModalProps) {
  if (!file) return null;

  console.log('🎬 FilePreviewModal opened with file:', {
    fileName: file.fileName,
    fileKey: file.fileKey,
    filePath: file.filePath,
    mimeType: file.mimeType,
  });

  // Determine the correct URL for the file
  let fileUrl: string;
  let downloadUrl: string;

  if (file.fileKey) {
    // Use API route with fileKey
    fileUrl = `/api/upload/download/${file.fileKey}?preview=true`;
    downloadUrl = `/api/upload/download/${file.fileKey}`;
    console.log('🔑 Using fileKey for API route:', file.fileKey);
  } else if (file.filePath) {
    // Use direct file path (for assets uploaded to public directory)
    fileUrl = file.filePath;
    downloadUrl = file.filePath;
    console.log('📁 Using direct filePath:', file.filePath);
  } else {
    console.error('❌ No fileKey or filePath available!');
    fileUrl = '';
    downloadUrl = '';
  }

  const handleDownload = () => {
    window.open(downloadUrl, '_blank');
  };

  // Determine preview component based on MIME type
  const renderPreview = () => {
    const mimeType = file.mimeType.toLowerCase();

    console.log('🎨 FilePreviewModal - Determining preview type:', {
      fileName: file.fileName,
      mimeType: file.mimeType,
      fileSize: file.fileSize,
    });

    // Image preview
    if (mimeType.startsWith('image/')) {
      console.log('🖼️ Rendering image preview');
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <ImagePreview
            fileUrl={fileUrl}
            fileName={file.fileName}
            onDownload={handleDownload}
          />
        </Suspense>
      );
    }

    // Video preview
    if (mimeType.startsWith('video/')) {
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <VideoPreview
            fileUrl={fileUrl}
            fileName={file.fileName}
            onDownload={handleDownload}
          />
        </Suspense>
      );
    }

    // Audio preview
    if (mimeType.startsWith('audio/')) {
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <AudioPreview
            fileUrl={fileUrl}
            fileName={file.fileName}
            onDownload={handleDownload}
          />
        </Suspense>
      );
    }

    // PDF preview
    if (mimeType === 'application/pdf') {
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <PDFPreview
            fileUrl={fileUrl}
            fileName={file.fileName}
            onDownload={handleDownload}
          />
        </Suspense>
      );
    }

    // 3D model preview
    const fileName = file.fileName.toLowerCase();
    const is3DModel =
      mimeType === 'model/gltf+json' ||
      mimeType === 'model/gltf-binary' ||
      mimeType === 'model/gltf' ||
      mimeType.startsWith('model/') ||
      fileName.endsWith('.glb') ||
      fileName.endsWith('.gltf') ||
      fileName.endsWith('.obj') ||
      fileName.endsWith('.fbx') ||
      (mimeType === 'application/octet-stream' && (fileName.endsWith('.glb') || fileName.endsWith('.gltf') || fileName.endsWith('.obj') || fileName.endsWith('.fbx')));

    if (is3DModel) {
      console.log('🎲 Rendering 3D model preview');
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <ThreeDPreview
            fileUrl={fileUrl}
            fileName={file.fileName}
            onDownload={handleDownload}
          />
        </Suspense>
      );
    }

    // Unsupported type
    console.log('❌ File type not supported for preview');
    return (
      <UnsupportedPreview
        fileName={file.fileName}
        mimeType={file.mimeType}
        onDownload={handleDownload}
      />
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            {/* Overlay */}
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              />
            </Dialog.Overlay>

            {/* Content */}
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 md:inset-4 lg:inset-8 xl:inset-12 z-50 flex flex-col bg-[#2c2c2b] rounded-none md:rounded-xl shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="relative z-20 flex items-center justify-between px-6 py-4 bg-[#1a1a19] border-b border-[#333]">
                  <div className="flex-1 min-w-0 mr-4">
                    <Dialog.Title className="text-white text-lg font-semibold truncate">
                      {file.fileName}
                    </Dialog.Title>
                    <div className="text-[#b2b2b2] text-sm mt-1">
                      {file.mimeType} • {formatFileSize(file.fileSize)}
                    </div>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#2c2c2b] hover:bg-[#333] text-white transition-colors"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </Dialog.Close>
                </div>

                {/* Preview Content */}
                <div className="flex-1 overflow-hidden">{renderPreview()}</div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function formatFileSize(bytes: bigint | number): string {
  const b = typeof bytes === 'bigint' ? Number(bytes) : bytes;
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(2)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(2)} MB`;
  return `${(b / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
