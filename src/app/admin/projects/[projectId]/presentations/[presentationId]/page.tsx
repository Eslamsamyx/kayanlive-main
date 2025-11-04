'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/trpc/react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Edit3,
  FileText,
  Loader2,
  Image as ImageIcon,
  Video,
  BarChart3,
} from 'lucide-react';
import { SlideType } from '@prisma/client';

export default function PresentationViewPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const presentationId = params.presentationId as string;

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const { data: presentation, isLoading } = api.presentation.get.useQuery({
    id: presentationId,
  });

  const slides = presentation?.slides || [];
  const currentSlide = slides[currentSlideIndex];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setShowNotes(!showNotes);
      } else if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlideIndex, slides.length, isFullscreen, showNotes]);

  const goToNext = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  }, [currentSlideIndex, slides.length]);

  const goToPrevious = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  }, [currentSlideIndex]);

  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-[#7afdd6] animate-spin" />
      </div>
    );
  }

  if (!presentation || slides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <FileText size={48} className="text-[#888888] mb-4" />
        <p className="text-white text-lg mb-2">No slides in this presentation</p>
        <button
          onClick={() => router.push(`/admin/projects/${projectId}/presentations/${presentationId}/edit`)}
          className="px-4 py-2 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold"
        >
          Add Slides
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a19] flex flex-col">
      {/* Header (hidden in fullscreen) */}
      {!isFullscreen && (
        <div className="p-6 border-b border-white/10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/admin/projects/${projectId}`)}
                className="flex items-center gap-2 text-[#888888] hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">{presentation.title}</h1>
                <p className="text-sm text-[#888888]">
                  Slide {currentSlideIndex + 1} of {slides.length}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  showNotes
                    ? 'bg-[#7afdd6]/20 text-[#7afdd6] border border-[#7afdd6]/50'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <FileText size={16} className="inline mr-2" />
                Notes
              </button>
              <button
                onClick={toggleFullscreen}
                className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
              >
                <Maximize size={16} className="inline mr-2" />
                Fullscreen
              </button>
              <button
                onClick={() => router.push(`/admin/projects/${projectId}/presentations/${presentationId}/edit`)}
                className="px-4 py-2 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <Edit3 size={16} className="inline mr-2" />
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Slide Display */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-6xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlideIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="rounded-[25px] overflow-hidden shadow-2xl"
                style={{
                  aspectRatio: '16/9',
                  backgroundColor: currentSlide?.backgroundColor || '#1a1a19',
                  border: '2px solid rgba(122, 253, 214, 0.2)',
                }}
              >
                <SlideContent slide={currentSlide} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="p-6 border-t border-white/10">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Previous Button */}
            <button
              onClick={goToPrevious}
              disabled={currentSlideIndex === 0}
              className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            {/* Slide Thumbnails */}
            <div className="flex gap-2 overflow-x-auto max-w-2xl">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  className={`flex-shrink-0 w-20 h-12 rounded-lg transition-all ${
                    index === currentSlideIndex
                      ? 'ring-2 ring-[#7afdd6] scale-110'
                      : 'opacity-50 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: slide.backgroundColor || '#1a1a19',
                    border: '1px solid rgba(122, 253, 214, 0.3)',
                  }}
                >
                  <span className="text-xs text-white">{index + 1}</span>
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={goToNext}
              disabled={currentSlideIndex === slides.length - 1}
              className="px-6 py-3 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Speaker Notes */}
        {showNotes && currentSlide?.notes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10 bg-white/5 p-6"
          >
            <div className="max-w-6xl mx-auto">
              <h3 className="text-sm font-semibold text-[#7afdd6] mb-2">Speaker Notes</h3>
              <p className="text-white whitespace-pre-wrap">{currentSlide.notes}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Keyboard Shortcuts Help (Fullscreen) */}
      {isFullscreen && (
        <div className="fixed bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-xl p-3 text-xs text-[#888888] border border-white/10">
          <p><kbd>←</kbd>/<kbd>→</kbd> Navigate • <kbd>F</kbd> Fullscreen • <kbd>N</kbd> Notes • <kbd>ESC</kbd> Exit</p>
        </div>
      )}
    </div>
  );
}

// Slide Content Renderer
function SlideContent({ slide }: { slide: any }) {
  if (!slide) return null;

  const textColor = slide.textColor || '#ffffff';

  switch (slide.type) {
    case SlideType.TITLE:
      return (
        <div className="h-full flex items-center justify-center p-12">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-4" style={{ color: textColor }}>
              {slide.title}
            </h1>
            {slide.content && (
              <p className="text-2xl opacity-80" style={{ color: textColor }}>
                {slide.content}
              </p>
            )}
          </div>
        </div>
      );

    case SlideType.CONTENT:
      return (
        <div className="h-full flex flex-col justify-center p-12">
          {slide.title && (
            <h2 className="text-4xl font-bold mb-6" style={{ color: textColor }}>
              {slide.title}
            </h2>
          )}
          <div className="text-xl leading-relaxed whitespace-pre-wrap" style={{ color: textColor }}>
            {slide.content}
          </div>
        </div>
      );

    case SlideType.BULLET_POINTS:
      return (
        <div className="h-full flex flex-col justify-center p-12">
          {slide.title && (
            <h2 className="text-4xl font-bold mb-8" style={{ color: textColor }}>
              {slide.title}
            </h2>
          )}
          <ul className="space-y-4 text-xl">
            {slide.content?.split('\n').filter((line: string) => line.trim()).map((bullet: string, i: number) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4"
                style={{ color: textColor }}
              >
                <span className="text-[#7afdd6] text-2xl">•</span>
                <span>{bullet}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      );

    case SlideType.IMAGE:
      return (
        <div className="h-full flex flex-col justify-center items-center p-12">
          {slide.title && (
            <h2 className="text-4xl font-bold mb-8" style={{ color: textColor }}>
              {slide.title}
            </h2>
          )}
          <div className="flex flex-col items-center gap-6">
            <div className="p-8 rounded-3xl bg-white/5 border-2 border-dashed border-green-400/30">
              <ImageIcon size={120} className="text-green-400 opacity-40" />
            </div>
            <div className="text-center max-w-2xl">
              <p className="text-xl opacity-70 mb-2" style={{ color: textColor }}>
                Image Placeholder
              </p>
              <p className="text-sm opacity-50" style={{ color: textColor }}>
                Designer will add image here
              </p>
              {slide.content && (
                <p className="text-lg mt-6 opacity-90" style={{ color: textColor }}>
                  {slide.content}
                </p>
              )}
            </div>
          </div>
        </div>
      );

    case SlideType.VIDEO:
      return (
        <div className="h-full flex flex-col justify-center items-center p-12">
          {slide.title && (
            <h2 className="text-4xl font-bold mb-8" style={{ color: textColor }}>
              {slide.title}
            </h2>
          )}
          <div className="flex flex-col items-center gap-6">
            <div className="p-8 rounded-3xl bg-white/5 border-2 border-dashed border-red-400/30">
              <Video size={120} className="text-red-400 opacity-40" />
            </div>
            <div className="text-center max-w-2xl">
              <p className="text-xl opacity-70 mb-2" style={{ color: textColor }}>
                Video Placeholder
              </p>
              <p className="text-sm opacity-50" style={{ color: textColor }}>
                Designer will add video here
              </p>
              {slide.content && (
                <p className="text-lg mt-6 opacity-90" style={{ color: textColor }}>
                  {slide.content}
                </p>
              )}
            </div>
          </div>
        </div>
      );

    case SlideType.CHART:
      return (
        <div className="h-full flex flex-col justify-center items-center p-12">
          {slide.title && (
            <h2 className="text-4xl font-bold mb-8" style={{ color: textColor }}>
              {slide.title}
            </h2>
          )}
          <div className="flex flex-col items-center gap-6">
            <div className="p-8 rounded-3xl bg-white/5 border-2 border-dashed border-yellow-400/30">
              <BarChart3 size={120} className="text-yellow-400 opacity-40" />
            </div>
            <div className="text-center max-w-2xl">
              <p className="text-xl opacity-70 mb-2" style={{ color: textColor }}>
                Chart Placeholder
              </p>
              <p className="text-sm opacity-50" style={{ color: textColor }}>
                Designer will add chart here
              </p>
              {slide.content && (
                <p className="text-lg mt-6 opacity-90" style={{ color: textColor }}>
                  {slide.content}
                </p>
              )}
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="h-full flex items-center justify-center p-12">
          <p style={{ color: textColor }}>Unknown slide type</p>
        </div>
      );
  }
}
