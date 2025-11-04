'use client';

import React, { useEffect, useRef, useState } from 'react';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';
import { Download, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoPreviewProps {
  fileUrl: string;
  fileName: string;
  onDownload?: () => void;
}

export function VideoPreview({ fileUrl, fileName, onDownload }: VideoPreviewProps) {
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Validate fileUrl
  if (!fileUrl || fileUrl === '') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-[#0a0a0a] via-[#1a1a19] to-[#0a0a0a] text-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 bg-[#2c2c2b]/80 backdrop-blur-xl rounded-2xl border border-[#333]"
        >
          <div className="text-red-400 text-xl mb-3">Failed to load video</div>
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

  const videoSrc = {
    type: 'video' as const,
    sources: [
      {
        src: fileUrl,
        type: fileUrl.endsWith('.mp4')
          ? 'video/mp4'
          : fileUrl.endsWith('.webm')
          ? 'video/webm'
          : fileUrl.endsWith('.mov')
          ? 'video/quicktime'
          : 'video/mp4',
      },
    ],
  };

  const plyrOptions = {
    controls: [
      'play-large',
      'play',
      'progress',
      'current-time',
      'duration',
      'mute',
      'volume',
      'settings',
      'pip',
      'airplay',
      'fullscreen',
    ],
    settings: ['quality', 'speed', 'loop'],
    speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
    keyboard: { focused: true, global: true },
    tooltips: { controls: true, seek: true },
    quality: {
      default: 720,
      options: [1080, 720, 480, 360],
    },
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
    return () => {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setShowInfo(!showInfo);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showInfo]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-[#0a0a0a] via-[#1a1a19] to-[#0a0a0a] text-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 bg-[#2c2c2b]/80 backdrop-blur-xl rounded-2xl border border-[#333]"
        >
          <div className="text-red-400 text-xl mb-3">Failed to load video</div>
          <div className="text-[#b2b2b2] text-sm mb-6 max-w-md">{error}</div>
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7afdd6] to-[#6ce7c3] text-[#1a1a19] font-semibold hover:shadow-lg hover:shadow-[#7afdd6]/30 transition-all"
            >
              <Download className="w-5 h-5" />
              Download Video
            </button>
          )}
        </motion.div>
      </div>
    );
  }

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

      {/* Top Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-4 right-4 z-20 flex items-center gap-2"
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-20 right-4 z-20 bg-[#2c2c2b]/95 backdrop-blur-xl rounded-xl p-4 border border-[#333]/50 shadow-2xl min-w-[200px]"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#7afdd6] font-semibold text-sm">Video Info</h3>
              <button
                onClick={() => setShowInfo(false)}
                className="p-1 rounded-lg hover:bg-[#1a1a19] text-[#b2b2b2] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="pt-2 border-t border-[#333]">
                <div className="text-[#b2b2b2] text-xs truncate" title={fileName}>
                  {fileName}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Player */}
      <div className="flex items-center justify-center h-full p-8">
        <div className="w-full max-w-6xl">
          <Plyr
            source={videoSrc}
            options={plyrOptions}
            onError={() => {
              setError(
                'The video could not be loaded. It may be in an unsupported format or the file may be corrupted.'
              );
            }}
          />
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
          >
            <div className="text-xs text-[#b2b2b2] bg-[#1a1a19]/60 backdrop-blur-sm rounded-full px-4 py-2 border border-[#333]/30">
              <kbd className="px-1.5 py-0.5 bg-[#2c2c2b] rounded text-[#7afdd6] font-mono">Space</kbd> Play/Pause •
              <kbd className="px-1.5 py-0.5 bg-[#2c2c2b] rounded text-[#7afdd6] font-mono mx-1">←/→</kbd> Seek •
              <kbd className="px-1.5 py-0.5 bg-[#2c2c2b] rounded text-[#7afdd6] font-mono mx-1">M</kbd> Mute •
              <kbd className="px-1.5 py-0.5 bg-[#2c2c2b] rounded text-[#7afdd6] font-mono mx-1">F</kbd> Fullscreen
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .plyr {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(122, 253, 214, 0.1);
        }

        .plyr--video {
          background: #000;
        }

        .plyr--full-ui input[type='range'] {
          color: #7afdd6;
        }

        .plyr__control--overlaid {
          background: rgba(122, 253, 214, 0.9);
          color: #1a1a19;
        }

        .plyr__control--overlaid:hover {
          background: #7afdd6;
        }

        .plyr__control:hover,
        .plyr__control[aria-expanded='true'] {
          background: rgba(122, 253, 214, 0.2);
        }

        .plyr__menu__container .plyr__control[role='menuitemradio'][aria-checked='true']::before {
          background: #7afdd6;
        }

        .plyr--video .plyr__control.plyr__tab-focus,
        .plyr--video .plyr__control:hover,
        .plyr--video .plyr__control[aria-expanded='true'] {
          background: rgba(122, 253, 214, 0.2);
        }

        .plyr__progress input[type='range'],
        .plyr__progress__buffer {
          color: #7afdd6;
        }

        .plyr--loading .plyr__progress__buffer {
          background-color: rgba(122, 253, 214, 0.25);
        }
      `}</style>
    </div>
  );
}
