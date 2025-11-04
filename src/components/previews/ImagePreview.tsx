'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Maximize2,
  Minimize2,
  Info,
  X,
  Move,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';

interface ImagePreviewProps {
  fileUrl: string;
  fileName: string;
  onDownload?: () => void;
}

function ImageControls({
  onDownload,
  showInfo,
  setShowInfo,
  rotation,
  handleRotate,
  imageDimensions,
  fileName,
}: {
  onDownload?: () => void;
  showInfo: boolean;
  setShowInfo: (show: boolean) => void;
  rotation: number;
  handleRotate: () => void;
  imageDimensions: { width: number; height: number } | null;
  fileName: string;
}) {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  return (
    <>
      {/* Top Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
        {/* Zoom Controls */}
        <div className="flex items-center gap-2 bg-[#2c2c2b]/90 backdrop-blur-xl rounded-xl p-2 border border-[#333]/50 shadow-2xl">
          <button
            onClick={() => zoomOut()}
            className="p-2.5 rounded-lg bg-[#1a1a19]/80 hover:bg-[#7afdd6]/20 hover:text-[#7afdd6] text-white transition-all"
            aria-label="Zoom out"
            title="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>

          <div className="px-3 py-1 text-white text-sm font-medium">
            Zoom
          </div>

          <button
            onClick={() => zoomIn()}
            className="p-2.5 rounded-lg bg-[#1a1a19]/80 hover:bg-[#7afdd6]/20 hover:text-[#7afdd6] text-white transition-all"
            aria-label="Zoom in"
            title="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2.5 rounded-xl ${
              showInfo ? 'bg-[#7afdd6] text-[#1a1a19]' : 'bg-[#2c2c2b]/90 text-white hover:bg-[#7afdd6]/20 hover:text-[#7afdd6]'
            } backdrop-blur-xl border border-[#333]/50 shadow-2xl transition-all`}
            aria-label="Toggle info"
            title="Toggle info (I)"
          >
            <Info className="w-5 h-5" />
          </button>

          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7afdd6] to-[#6ce7c3] text-[#1a1a19] font-semibold hover:shadow-lg hover:shadow-[#7afdd6]/30 transition-all border border-[#7afdd6]/20"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-3 bg-[#2c2c2b]/90 backdrop-blur-xl rounded-xl p-2 border border-[#333]/50 shadow-2xl">
          <button
            onClick={handleRotate}
            className="p-2.5 rounded-lg bg-[#1a1a19]/80 hover:bg-[#7afdd6]/20 hover:text-[#7afdd6] text-white transition-all"
            aria-label="Rotate"
            title="Rotate (R)"
          >
            <RotateCw className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-[#333]" />

          <button
            onClick={() => resetTransform()}
            className="px-4 py-2.5 rounded-lg bg-[#1a1a19]/80 hover:bg-[#7afdd6]/20 hover:text-[#7afdd6] text-white text-sm font-medium transition-all"
            title="Reset view (0)"
          >
            Reset
          </button>

          <div className="w-px h-6 bg-[#333]" />

          <div className="flex items-center gap-2 px-3 py-2 bg-[#1a1a19]/80 rounded-lg">
            <Move className="w-4 h-4 text-[#7afdd6]" />
            <span className="text-white text-xs font-medium">Drag to Pan</span>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && imageDimensions && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-20 right-4 z-20 bg-[#2c2c2b]/95 backdrop-blur-xl rounded-xl p-4 border border-[#333]/50 shadow-2xl min-w-[200px]"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#7afdd6] font-semibold text-sm">Image Info</h3>
              <button
                onClick={() => setShowInfo(false)}
                className="p-1 rounded-lg hover:bg-[#1a1a19] text-[#b2b2b2] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#b2b2b2]">Dimensions:</span>
                <span className="text-white font-medium">
                  {imageDimensions.width} × {imageDimensions.height}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#b2b2b2]">Rotation:</span>
                <span className="text-white font-medium">{rotation}°</span>
              </div>
              <div className="pt-2 border-t border-[#333]">
                <div className="text-[#b2b2b2] text-xs truncate" title={fileName}>
                  {fileName}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Hint */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
        <div className="text-xs text-[#b2b2b2] bg-[#1a1a19]/60 backdrop-blur-sm rounded-full px-4 py-2 border border-[#333]/30">
          <kbd className="px-1.5 py-0.5 bg-[#2c2c2b] rounded text-[#7afdd6] font-mono">Scroll</kbd> Zoom •
          <kbd className="px-1.5 py-0.5 bg-[#2c2c2b] rounded text-[#7afdd6] font-mono mx-1">Drag</kbd> Pan •
          <kbd className="px-1.5 py-0.5 bg-[#2c2c2b] rounded text-[#7afdd6] font-mono mx-1">Double Click</kbd> Fit •
          <kbd className="px-1.5 py-0.5 bg-[#2c2c2b] rounded text-[#7afdd6] font-mono mx-1">R</kbd> Rotate
        </div>
      </div>
    </>
  );
}

export function ImagePreview({ fileUrl, fileName, onDownload }: ImagePreviewProps) {
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  // Validate fileUrl
  if (!fileUrl || fileUrl === '') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-[#0a0a0a] via-[#1a1a19] to-[#0a0a0a] text-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 bg-[#2c2c2b]/80 backdrop-blur-xl rounded-2xl border border-[#333]"
        >
          <div className="text-red-400 text-xl mb-3">Failed to load image</div>
          <div className="text-[#b2b2b2] text-sm mb-6 max-w-md">
            No file URL available. The file path may be missing.
          </div>
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7afdd6] to-[#6ce7c3] text-[#1a1a19] font-semibold hover:shadow-lg hover:shadow-[#7afdd6]/30 transition-all"
            >
              <Download className="w-5 h-5" />
              Try Download
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    const img = e.target as HTMLImageElement;
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  };

  // Auto-hide controls
  const resetHideTimer = () => {
    setShowControls(true);
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    hideControlsTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleMouseMove = () => {
    resetHideTimer();
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRotate();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleFullscreen();
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setShowInfo(!showInfo);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showInfo]);

  return (
    <div
      ref={containerRef}
      className="relative h-full bg-gradient-to-br from-[#0a0a0a] via-[#1a1a19] to-[#0a0a0a] overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setShowControls(true)}
    >
      {/* Top gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10" />

      {error ? (
        <div className="relative h-full flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-8 bg-[#2c2c2b]/80 backdrop-blur-xl rounded-2xl border border-[#333]"
          >
            <div className="text-red-400 text-xl mb-3">Failed to load image</div>
            <div className="text-[#b2b2b2] text-sm mb-6 max-w-md">{error}</div>
            {onDownload && (
              <button
                onClick={onDownload}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7afdd6] to-[#6ce7c3] text-[#1a1a19] font-semibold hover:shadow-lg hover:shadow-[#7afdd6]/30 transition-all"
              >
                <Download className="w-5 h-5 inline mr-2" />
                Download File
              </button>
            )}
          </motion.div>
        </div>
      ) : (
        <TransformWrapper
          initialScale={1}
          minScale={0.25}
          maxScale={5}
          centerOnInit
          wheel={{ step: 0.1 }}
          doubleClick={{ mode: 'reset' }}
          panning={{ disabled: false }}
          smooth
          limitToBounds={false}
        >
          {() => (
            <>
              <AnimatePresence>
                {showControls && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ImageControls
                      onDownload={onDownload}
                      showInfo={showInfo}
                      setShowInfo={setShowInfo}
                      rotation={rotation}
                      handleRotate={handleRotate}
                      imageDimensions={imageDimensions}
                      fileName={fileName}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <TransformComponent
                wrapperClass="!w-full !h-full"
                contentClass="!w-full !h-full flex items-center justify-center"
              >
                <div className="relative">
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#333] border-t-[#7afdd6]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="animate-pulse text-[#7afdd6] text-xs font-medium">
                            Loading
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <motion.img
                    src={fileUrl}
                    alt={fileName}
                    onLoad={handleImageLoad}
                    onError={() => {
                      setIsLoading(false);
                      setError('The image could not be loaded. It may be corrupted or in an unsupported format.');
                    }}
                    animate={{ rotate: rotation }}
                    transition={{ duration: 0.3 }}
                    className={`max-w-full max-h-[calc(100vh-8rem)] object-contain rounded-xl shadow-2xl ${
                      isLoading ? 'opacity-0' : 'opacity-100'
                    } transition-opacity duration-500`}
                    style={{
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(122, 253, 214, 0.1)',
                    }}
                  />
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      )}
    </div>
  );
}
