'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '@/trpc/react';
import { Upload, File, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface FileUploadZoneProps {
  projectId: string;
  onUploadComplete?: () => void;
}

interface UploadProgress {
  file: File;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export function FileUploadZone({ projectId, onUploadComplete }: FileUploadZoneProps) {
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map());
  const [folder, setFolder] = useState('general');

  const uploadMutation = api.clientUpload.upload.useMutation();

  const processFile = async (file: File) => {
    const fileId = `${file.name}-${Date.now()}`;

    // Add to upload queue
    setUploads((prev) =>
      new Map(prev).set(fileId, {
        file,
        status: 'uploading',
        progress: 0,
      })
    );

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1]; // Remove data:image/png;base64, prefix
          resolve(base64Data || '');
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Simulate progress
      setUploads((prev) => {
        const newMap = new Map(prev);
        const upload = newMap.get(fileId);
        if (upload) {
          upload.progress = 50;
          newMap.set(fileId, upload);
        }
        return newMap;
      });

      // Upload to server
      await uploadMutation.mutateAsync({
        projectId,
        fileName: file.name,
        fileData: base64,
        mimeType: file.type,
        folder,
      });

      // Mark as success
      setUploads((prev) => {
        const newMap = new Map(prev);
        const upload = newMap.get(fileId);
        if (upload) {
          upload.status = 'success';
          upload.progress = 100;
          newMap.set(fileId, upload);
        }
        return newMap;
      });

      toast.success(`${file.name} uploaded successfully`);

      // Remove from list after 2 seconds
      setTimeout(() => {
        setUploads((prev) => {
          const newMap = new Map(prev);
          newMap.delete(fileId);
          return newMap;
        });
      }, 2000);

      onUploadComplete?.();
    } catch (error) {
      // Mark as error
      setUploads((prev) => {
        const newMap = new Map(prev);
        const upload = newMap.get(fileId);
        if (upload) {
          upload.status = 'error';
          upload.error = error instanceof Error ? error.message : 'Upload failed';
          newMap.set(fileId, upload);
        }
        return newMap;
      });

      toast.error(`Failed to upload ${file.name}`);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(processFile);
  }, [projectId, folder]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
  });

  const removeUpload = (fileId: string) => {
    setUploads((prev) => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
  };

  return (
    <div className="space-y-4">
      {/* Folder Selection */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Upload to Folder
        </label>
        <select
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          className="w-full rounded-lg border border-[#333] bg-[#1a1a19] px-4 py-2 text-sm text-white focus:border-[#7afdd6] focus:outline-none focus:ring-1 focus:ring-[#7afdd6]"
        >
          <option value="general">General</option>
          <option value="assets">Assets</option>
          <option value="documents">Documents</option>
          <option value="feedback">Feedback</option>
          <option value="references">References</option>
        </select>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`relative rounded-xl border-2 border-dashed p-12 text-center transition-colors cursor-pointer ${
          isDragActive
            ? 'border-[#7afdd6] bg-[#7afdd6]/5'
            : 'border-[#333] hover:border-[#7afdd6] hover:bg-[#7afdd6]/5'
        }`}
      >
        <input {...getInputProps()} />
        <Upload
          className={`mx-auto h-12 w-12 mb-4 transition-colors ${
            isDragActive ? 'text-[#7afdd6]' : 'text-[#666]'
          }`}
        />
        <p className="text-lg font-medium text-white mb-2">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-sm text-[#666]">
          or click to browse • Max 50MB per file
        </p>
      </div>

      {/* Upload Progress List */}
      <AnimatePresence>
        {uploads.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {Array.from(uploads.entries()).map(([fileId, upload]) => (
              <motion.div
                key={fileId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="rounded-lg border border-[#333] bg-[#2c2c2b] p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a1a19]">
                    {upload.status === 'success' ? (
                      <CheckCircle2 className="h-5 w-5 text-[#7afdd6]" />
                    ) : upload.status === 'error' ? (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    ) : (
                      <File className="h-5 w-5 text-[#7afdd6]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-white truncate">
                        {upload.file.name}
                      </p>
                      <button
                        onClick={() => removeUpload(fileId)}
                        className="rounded p-1 hover:bg-[#1a1a19] transition-colors"
                      >
                        <X className="h-4 w-4 text-[#666]" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-[#666]">
                        {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      {upload.status === 'uploading' && (
                        <span className="text-xs text-[#7afdd6]">
                          Uploading...
                        </span>
                      )}
                      {upload.status === 'success' && (
                        <span className="text-xs text-[#7afdd6]">
                          Complete
                        </span>
                      )}
                      {upload.status === 'error' && (
                        <span className="text-xs text-red-400">
                          {upload.error || 'Failed'}
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {upload.status === 'uploading' && (
                      <div className="h-1.5 bg-[#1a1a19] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${upload.progress}%` }}
                          transition={{ duration: 0.3 }}
                          className="h-full bg-[#7afdd6]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
