'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type WaveSurfer from 'wavesurfer.js';
import { Download, Play, Pause, SkipBack, SkipForward, Volume2, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WavesurferPlayer = dynamic(
  () => import('@wavesurfer/react').then((mod) => mod.default),
  { ssr: false }
);

interface AudioPreviewProps {
  fileUrl: string;
  fileName: string;
  onDownload?: () => void;
}

export function AudioPreview({ fileUrl, fileName, onDownload }: AudioPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
          <div className="text-red-400 text-xl mb-3">Failed to load audio</div>
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

  const onReady = (ws: WaveSurfer) => {
    setWavesurfer(ws);
    setIsPlaying(false);
    setIsLoading(false);
    setTotalDuration(ws.getDuration());
  };

  const onPlayPause = () => {
    if (wavesurfer) {
      wavesurfer.playPause();
      setIsPlaying(wavesurfer.isPlaying());
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (wavesurfer) {
      wavesurfer.setVolume(newVolume);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (wavesurfer) {
      wavesurfer.setPlaybackRate(rate);
    }
  };

  const skipBackward = () => {
    if (wavesurfer) {
      wavesurfer.skip(-10);
    }
  };

  const skipForward = () => {
    if (wavesurfer) {
      wavesurfer.skip(10);
    }
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
      if (e.key === ' ') {
        e.preventDefault();
        onPlayPause();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        skipBackward();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        skipForward();
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setShowInfo(!showInfo);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showInfo, wavesurfer]);

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
              <h3 className="text-[#7afdd6] font-semibold text-sm">Audio Info</h3>
              <button
                onClick={() => setShowInfo(false)}
                className="p-1 rounded-lg hover:bg-[#1a1a19] text-[#b2b2b2] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#b2b2b2]">Duration:</span>
                <span className="text-white font-medium">{formatTime(totalDuration)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#b2b2b2]">Speed:</span>
                <span className="text-white font-medium">{playbackRate}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#b2b2b2]">Volume:</span>
                <span className="text-white font-medium">{Math.round(volume * 100)}%</span>
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

      {/* Audio Player Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          {/* Waveform Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative mb-8 rounded-2xl overflow-hidden bg-[#2c2c2b]/80 backdrop-blur-xl p-8 border border-[#333]/50 shadow-2xl"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(122, 253, 214, 0.1)',
            }}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a19]/50 z-10 backdrop-blur-sm rounded-2xl">
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

            <WavesurferPlayer
              url={fileUrl}
              height={140}
              waveColor="#333"
              progressColor="#7afdd6"
              cursorColor="#7afdd6"
              barWidth={3}
              barGap={2}
              barRadius={3}
              onReady={onReady}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeupdate={(wavesurfer) => setCurrentTime(wavesurfer.getCurrentTime())}
            />

            {/* Time Display */}
            <div className="flex justify-between mt-4 text-sm">
              <span className="font-mono text-[#7afdd6] font-medium">{formatTime(currentTime)}</span>
              <span className="font-mono text-[#b2b2b2]">{formatTime(totalDuration)}</span>
            </div>
          </motion.div>

          {/* Main Controls */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6"
              >
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={skipBackward}
                    className="p-3 rounded-xl bg-[#2c2c2b]/80 backdrop-blur-xl hover:bg-[#7afdd6]/20 hover:text-[#7afdd6] text-white transition-all border border-[#333]/50 shadow-lg"
                    title="Skip backward 10s (←)"
                  >
                    <SkipBack className="w-6 h-6" />
                  </button>

                  <button
                    onClick={onPlayPause}
                    className="p-6 rounded-full bg-gradient-to-r from-[#7afdd6] to-[#6ce7c3] hover:shadow-lg hover:shadow-[#7afdd6]/30 text-[#1a1a19] transition-all border border-[#7afdd6]/20"
                    title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8" fill="currentColor" />
                    ) : (
                      <Play className="w-8 h-8 ml-1" fill="currentColor" />
                    )}
                  </button>

                  <button
                    onClick={skipForward}
                    className="p-3 rounded-xl bg-[#2c2c2b]/80 backdrop-blur-xl hover:bg-[#7afdd6]/20 hover:text-[#7afdd6] text-white transition-all border border-[#333]/50 shadow-lg"
                    title="Skip forward 10s (→)"
                  >
                    <SkipForward className="w-6 h-6" />
                  </button>
                </div>

                {/* Volume and Speed Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Volume Control */}
                  <div className="bg-[#2c2c2b]/80 backdrop-blur-xl rounded-xl p-4 border border-[#333]/50 shadow-lg">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-[#7afdd6]" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-[#1a1a19] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#7afdd6] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-[#7afdd6]/50"
                      />
                      <span className="text-sm text-white w-12 text-right font-mono font-medium">
                        {Math.round(volume * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Playback Speed */}
                  <div className="bg-[#2c2c2b]/80 backdrop-blur-xl rounded-xl p-4 border border-[#333]/50 shadow-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[#7afdd6] font-medium">Speed</span>
                      <select
                        value={playbackRate}
                        onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
                        className="flex-1 px-3 py-2 bg-[#1a1a19] text-white rounded-lg text-sm border border-[#333] focus:border-[#7afdd6] focus:outline-none cursor-pointer transition-colors"
                      >
                        <option value="0.5">0.5x</option>
                        <option value="0.75">0.75x</option>
                        <option value="1">1x Normal</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="1.75">1.75x</option>
                        <option value="2">2x</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
              <kbd className="px-1.5 py-0.5 bg-[#2c2c2b] rounded text-[#7afdd6] font-mono mx-1">←/→</kbd> Skip •
              <kbd className="px-1.5 py-0.5 bg-[#2c2c2b] rounded text-[#7afdd6] font-mono mx-1">I</kbd> Info
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
