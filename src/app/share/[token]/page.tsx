'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/trpc/react';
import {
  Download,
  Eye,
  EyeOff,
  Lock,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Video,
  FileText,
  File,
  Music,
  Calendar,
  HardDrive,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { format } from 'date-fns';
import { AssetType } from '@prisma/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';

// Dynamic import for 3D viewer to avoid SSR issues
const ThreeDPreview = dynamic(() => import('@/components/previews/ThreeDPreview').then(mod => ({ default: mod.ThreeDPreview })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px]">
      <Loader2 className="animate-spin h-16 w-16 text-[#7afdd6]" />
    </div>
  ),
});

export default function PublicSharePage() {
  const params = useParams();
  const token = params.token as string;

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Get share link info
  const {
    data: shareData,
    isLoading,
    error: validateError,
  } = api.assetShare.getByToken.useQuery(
    { token },
    {
      enabled: !!token,
      retry: false,
    }
  );

  // Verify password mutation
  const verifyPasswordMutation = api.assetShare.verifyPassword.useMutation({
    onSuccess: () => {
      setHasAccess(true);
      setIsPasswordRequired(false);
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // Download mutation
  const downloadMutation = api.assetShare.getSharedDownloadUrl.useMutation();

  useEffect(() => {
    if (shareData) {
      if (shareData.shareLink?.hasPassword) {
        setIsPasswordRequired(true);
        setHasAccess(false);
      } else {
        setHasAccess(true);
        setIsPasswordRequired(false);
      }
    }
  }, [shareData]);

  useEffect(() => {
    if (validateError) {
      const errorMessage = validateError.message;
      if (errorMessage.includes('expired')) {
        setError('This share link has expired');
      } else if (errorMessage.includes('password')) {
        setError('Incorrect password');
        setIsPasswordRequired(true);
      } else if (errorMessage.includes('not found')) {
        setError('Share link not found');
      } else {
        setError('Failed to access shared asset');
      }
    }
  }, [validateError]);

  // Fullscreen functionality
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!previewContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await previewContainerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      setError(null);
      verifyPasswordMutation.mutate({ token, password });
    }
  };

  const handleDownload = async () => {
    if (!shareData?.asset) return;

    try {
      const result = await downloadMutation.mutateAsync({
        token,
        // Pass password if share link has password protection
        password: shareData.shareLink?.hasPassword ? password : undefined,
      });
      window.open(result.url, '_blank');
    } catch (error) {
      alert('Download failed. Please try again.');
    }
  };

  const getAssetTypeIcon = (type: AssetType, size = 64) => {
    switch (type) {
      case 'IMAGE':
        return <ImageIcon size={size} className="text-[#7afdd6]" />;
      case 'VIDEO':
        return <Video size={size} className="text-[#b8a4ff]" />;
      case 'DOCUMENT':
        return <FileText size={size} className="text-[#7afdd6]" />;
      case 'AUDIO':
        return <Music size={size} className="text-[#b8a4ff]" />;
      case 'MODEL_3D':
      case 'DESIGN':
        return <File size={size} className="text-[#7afdd6]" />;
      default:
        return <File size={size} className="text-[#888888]" />;
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div
          className="rounded-[25px] p-8 text-center max-w-md w-full"
          style={{
            background: 'rgba(26, 26, 25, 0.95)',
            backdropFilter: 'blur(50.5px)',
            WebkitBackdropFilter: 'blur(50.5px)',
            border: '2px solid rgba(122, 253, 214, 0.2)',
          }}
        >
          <Loader2 className="animate-spin h-16 w-16 text-[#7afdd6] mx-auto mb-4" />
          <p className="text-white text-lg" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Loading shared asset...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isPasswordRequired) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div
          className="rounded-[25px] p-8 text-center max-w-md w-full"
          style={{
            background: 'rgba(26, 26, 25, 0.95)',
            backdropFilter: 'blur(50.5px)',
            WebkitBackdropFilter: 'blur(50.5px)',
            border: '2px solid rgba(255, 107, 107, 0.3)',
          }}
        >
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1
            className="text-2xl font-bold mb-2"
            style={{
              background: 'linear-gradient(90deg, #ff6b6b 0%, #ee5a6f 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            Access Denied
          </h1>
          <p className="text-[#888888] mb-6" style={{ fontFamily: '"Poppins", sans-serif' }}>
            {error}
          </p>
          <div className="text-sm text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
            <p>If you believe this is an error, please contact the person who shared this link.</p>
          </div>
          <div className="mt-6 pt-6 border-t border-[#7afdd6]/20">
            <p className="text-xs text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Powered by KayanLive
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Password required state
  if (isPasswordRequired && !hasAccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div
          className="rounded-[25px] p-8 max-w-md w-full"
          style={{
            background: 'rgba(26, 26, 25, 0.95)',
            backdropFilter: 'blur(50.5px)',
            WebkitBackdropFilter: 'blur(50.5px)',
            border: '2px solid rgba(122, 253, 214, 0.2)',
          }}
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] flex items-center justify-center">
              <Lock className="h-8 w-8 text-[#2c2c2b]" />
            </div>
            <h1
              className="text-2xl font-bold mb-2"
              style={{
                background: 'linear-gradient(90deg, #7afdd6 0%, #b8a4ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Password Protected
            </h1>
            <p className="text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
              This shared asset requires a password to access
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#888888] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Enter Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 pr-10 bg-[#2c2c2b]/60 border border-[#7afdd6]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7afdd6] text-white placeholder:text-[#888888]"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#7afdd6] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  <AlertCircle size={14} />
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!password.trim()}
              className="w-full py-3 px-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-all shadow-lg"
              style={{
                background: !password.trim()
                  ? 'rgba(122, 253, 214, 0.3)'
                  : 'linear-gradient(90deg, #7afdd6 0%, #b8a4ff 100%)',
                color: '#2c2c2b',
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Access Asset
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#7afdd6]/20 text-center">
            <p className="text-xs text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Powered by KayanLive
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state - show asset
  if (hasAccess && shareData?.asset) {
    const asset = shareData.asset;
    const allowDownload = shareData.shareLink?.allowDownload === true;

    // Generate fallback preview URL if not provided by API
    const previewUrl = shareData.asset.previewUrl ||
      (shareData.asset.fileKey ? `/api/files/public/${shareData.asset.fileKey}` : null);
    const thumbnailUrl = shareData.asset.thumbnailUrl ||
      (shareData.asset.thumbnailKey ? `/api/files/public/${shareData.asset.thumbnailKey}` : null);

    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        {/* Navbar */}
        <div className="pt-4">
          <Navbar locale="en" />
        </div>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full">
          <div
            className="rounded-[25px] overflow-hidden shadow-2xl"
            style={{
              background: 'rgba(26, 26, 25, 0.95)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.2)',
            }}
          >
            {/* Asset Preview */}
            <div
              ref={previewContainerRef}
              className="bg-gradient-to-br from-[#1a1a19] to-[#0a0a0a] flex items-center justify-center min-h-[400px] relative"
            >
              {previewUrl ? (
                <>
                  {asset.type === 'VIDEO' ? (
                    <video
                      src={previewUrl}
                      controls
                      className="max-w-full max-h-[600px] object-contain"
                    />
                  ) : asset.type === 'AUDIO' ? (
                    <div className="w-full max-w-xl px-8">
                      <div className="text-center mb-6">
                        {getAssetTypeIcon(asset.type, 96)}
                        <h3 className="mt-4 text-xl font-semibold text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                          {asset.name}
                        </h3>
                      </div>
                      <audio
                        src={previewUrl}
                        controls
                        className="w-full"
                        style={{ filter: 'invert(1) hue-rotate(180deg)' }}
                      />
                    </div>
                  ) : asset.type === 'IMAGE' ? (
                    <img
                      src={previewUrl}
                      alt={asset.name}
                      className="max-w-full max-h-[600px] object-contain"
                    />
                  ) : asset.type === 'DOCUMENT' ? (
                    // For all documents, try to show inline preview
                    <div className="w-full h-[600px] px-4">
                      {asset.mimeType === 'application/pdf' ? (
                        <iframe
                          src={previewUrl}
                          className="w-full h-full border-0 rounded-lg"
                          title={asset.name}
                        />
                      ) : (
                        // For non-PDF documents, show thumbnail or icon with download message
                        <div className="flex flex-col items-center justify-center h-full">
                          {thumbnailUrl ? (
                            <img
                              src={thumbnailUrl}
                              alt={asset.name}
                              className="max-w-full max-h-[400px] object-contain mb-4"
                            />
                          ) : (
                            <>
                              {getAssetTypeIcon(asset.type, 96)}
                              <p className="mt-4 text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                                Document preview available after download
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ) : asset.type === 'MODEL_3D' || asset.type === 'DESIGN' ? (
                    // For 3D models, use the 3D viewer
                    <div className="w-full h-[600px]">
                      {previewUrl ? (
                        <Suspense fallback={
                          <div className="flex items-center justify-center h-full">
                            <Loader2 className="animate-spin h-16 w-16 text-[#7afdd6]" />
                          </div>
                        }>
                          <ThreeDPreview
                            fileUrl={previewUrl}
                            fileName={asset.name}
                            onDownload={allowDownload ? handleDownload : undefined}
                          />
                        </Suspense>
                      ) : thumbnailUrl ? (
                        <div className="flex items-center justify-center h-full">
                          <img
                            src={thumbnailUrl}
                            alt={asset.name}
                            className="max-w-full max-h-[600px] object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          {getAssetTypeIcon(asset.type, 96)}
                          <p className="mt-4 text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                            3D Model preview not available
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // For other types, show thumbnail or icon
                    <div className="text-center">
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={asset.name}
                          className="max-w-full max-h-[600px] object-contain"
                        />
                      ) : (
                        <>
                          {getAssetTypeIcon(asset.type, 96)}
                          <p className="mt-4 text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                            Preview available after download
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center">
                  {getAssetTypeIcon(asset.type, 96)}
                  <p className="mt-4 text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    Preview not available
                  </p>
                  <p className="mt-2 text-xs text-[#666666]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    {asset.type === 'IMAGE' || asset.type === 'VIDEO' ?
                      'File may not have been uploaded properly' :
                      'Preview will be available after download'}
                  </p>
                </div>
              )}

              {/* Fullscreen Button - Only show for non-3D content */}
              {asset.type !== 'MODEL_3D' && asset.type !== 'DESIGN' && (
                <button
                  onClick={toggleFullscreen}
                  className="absolute top-4 right-4 p-3 rounded-full text-white hover:text-[#7afdd6] transition-all hover:scale-110 z-30"
                  style={{
                    background: 'rgba(26, 26, 25, 0.9)',
                    backdropFilter: 'blur(50.5px)',
                    WebkitBackdropFilter: 'blur(50.5px)',
                    border: '1px solid rgba(122, 253, 214, 0.3)',
                  }}
                  title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
              )}

              {/* Downloads Counter */}
              <div
                className="absolute bottom-4 right-4 px-4 py-2 rounded-full text-sm flex items-center gap-2 font-semibold"
                style={{
                  background: 'rgba(26, 26, 25, 0.9)',
                  backdropFilter: 'blur(50.5px)',
                  WebkitBackdropFilter: 'blur(50.5px)',
                  border: '1px solid rgba(122, 253, 214, 0.3)',
                  color: '#7afdd6',
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                <Download size={14} />
                {shareData.shareLink?.currentDownloads || 0} downloads
              </div>
            </div>

            {/* Asset Info */}
            <div className="p-6 border-t border-[#7afdd6]/20">
              <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
                {asset.name}
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: 'rgba(122, 253, 214, 0.05)',
                    border: '1px solid rgba(122, 253, 214, 0.1)',
                  }}
                >
                  <p className="text-sm text-[#888888] mb-1" style={{ fontFamily: '"Poppins", sans-serif' }}>Type</p>
                  <p className="font-semibold text-[#7afdd6]" style={{ fontFamily: '"Poppins", sans-serif' }}>{asset.type}</p>
                </div>
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: 'rgba(184, 164, 255, 0.05)',
                    border: '1px solid rgba(184, 164, 255, 0.1)',
                  }}
                >
                  <p className="text-sm text-[#888888] mb-1" style={{ fontFamily: '"Poppins", sans-serif' }}>Size</p>
                  <p className="font-semibold text-[#b8a4ff]" style={{ fontFamily: '"Poppins", sans-serif' }}>{formatFileSize(asset.fileSize)}</p>
                </div>
                {(asset as any).createdAt && (
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background: 'rgba(122, 253, 214, 0.05)',
                      border: '1px solid rgba(122, 253, 214, 0.1)',
                    }}
                  >
                    <p className="text-sm text-[#888888] mb-1" style={{ fontFamily: '"Poppins", sans-serif' }}>Uploaded</p>
                    <p className="font-semibold text-white flex items-center gap-1" style={{ fontFamily: '"Poppins", sans-serif' }}>
                      <Calendar size={14} className="text-[#7afdd6]" />
                      {format(new Date((asset as any).createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
                {shareData.shareLink?.expiresAt && (
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background: 'rgba(184, 164, 255, 0.05)',
                      border: '1px solid rgba(184, 164, 255, 0.1)',
                    }}
                  >
                    <p className="text-sm text-[#888888] mb-1" style={{ fontFamily: '"Poppins", sans-serif' }}>Link Expires</p>
                    <p className="font-semibold text-white flex items-center gap-1" style={{ fontFamily: '"Poppins", sans-serif' }}>
                      <Calendar size={14} className="text-[#b8a4ff]" />
                      {format(new Date(shareData.shareLink.expiresAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
              </div>

              {/* Download Button */}
              {allowDownload && (
                <button
                  onClick={handleDownload}
                  disabled={downloadMutation.isPending}
                  className="w-full py-3 px-4 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg"
                  style={{
                    background: 'linear-gradient(90deg, #7afdd6 0%, #b8a4ff 100%)',
                    color: '#2c2c2b',
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  {downloadMutation.isPending ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Preparing Download...
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      Download Asset
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    );
  }

  return null;
}
