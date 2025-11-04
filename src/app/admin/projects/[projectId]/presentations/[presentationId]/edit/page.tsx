'use client';

import { useState, useEffect } from 'react';
import { api } from '@/trpc/react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Save,
  Eye,
  Trash2,
  GripVertical,
  Type,
  Image as ImageIcon,
  Video,
  BarChart3,
  Heading1,
  List,
  Loader2,
  X,
  ChevronUp,
  ChevronDown,
  Quote,
  Columns,
  FileText,
} from 'lucide-react';
import { SlideType } from '@prisma/client';

const slideTypeConfig = {
  [SlideType.TITLE]: { icon: Heading1, label: 'Title Slide', color: 'text-purple-400' },
  [SlideType.CONTENT]: { icon: Type, label: 'Content', color: 'text-blue-400' },
  [SlideType.IMAGE]: { icon: ImageIcon, label: 'Image', color: 'text-green-400' },
  [SlideType.VIDEO]: { icon: Video, label: 'Video', color: 'text-red-400' },
  [SlideType.CHART]: { icon: BarChart3, label: 'Chart', color: 'text-yellow-400' },
  [SlideType.BULLET_POINTS]: { icon: List, label: 'Bullet Points', color: 'text-cyan-400' },
  [SlideType.QUOTE]: { icon: Quote, label: 'Quote', color: 'text-pink-400' },
  [SlideType.TWO_COLUMN]: { icon: Columns, label: 'Two Column', color: 'text-indigo-400' },
  [SlideType.FULL_IMAGE]: { icon: ImageIcon, label: 'Full Image', color: 'text-emerald-400' },
  [SlideType.BLANK]: { icon: FileText, label: 'Blank', color: 'text-gray-400' },
};

export default function PresentationEditPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const presentationId = params.presentationId as string;

  const [selectedSlide, setSelectedSlide] = useState<string | null>(null);
  const [isAddSlideOpen, setIsAddSlideOpen] = useState(false);

  const utils = api.useUtils();

  const { data: presentation, isLoading } = api.presentation.get.useQuery({
    id: presentationId,
  });

  const createSlideMutation = api.presentation.createSlide.useMutation({
    onSuccess: () => {
      utils.presentation.get.invalidate({ id: presentationId });
      setIsAddSlideOpen(false);
    },
  });

  const updateSlideMutation = api.presentation.updateSlide.useMutation({
    onSuccess: () => {
      utils.presentation.get.invalidate({ id: presentationId });
    },
  });

  const deleteSlideMutation = api.presentation.deleteSlide.useMutation({
    onSuccess: () => {
      utils.presentation.get.invalidate({ id: presentationId });
      setSelectedSlide(null);
    },
  });

  const reorderSlidesMutation = api.presentation.reorderSlides.useMutation({
    onSuccess: () => {
      utils.presentation.get.invalidate({ id: presentationId });
    },
  });

  const slides = presentation?.slides || [];
  const currentSlide = slides.find((s) => s.id === selectedSlide);

  const handleMoveSlide = (slideId: string, direction: 'up' | 'down') => {
    const slideIndex = slides.findIndex((s) => s.id === slideId);
    if (slideIndex === -1) return;

    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? slideIndex - 1 : slideIndex + 1;

    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    [newSlides[slideIndex], newSlides[targetIndex]] = [newSlides[targetIndex]!, newSlides[slideIndex]!];

    const updates = newSlides.map((slide, index) => ({
      id: slide.id,
      order: index,
    }));

    reorderSlidesMutation.mutate({ slides: updates });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-[#7afdd6] animate-spin" />
      </div>
    );
  }

  if (!presentation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-white text-lg mb-4">Presentation not found</p>
        <button
          onClick={() => router.push(`/admin/projects/${projectId}`)}
          className="px-4 py-2 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold"
        >
          Back to Project
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a19] p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push(`/admin/projects/${projectId}`)}
            className="flex items-center gap-2 text-[#888888] hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Project
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/admin/projects/${projectId}/presentations/${presentationId}`)}
              className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              <Eye size={16} />
              Preview
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
          {presentation.title}
        </h1>
        {presentation.description && (
          <p className="text-[#888888]">{presentation.description}</p>
        )}
      </div>

      {/* Main Editor */}
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        {/* Slide List */}
        <div className="col-span-3">
          <div className="rounded-[25px] p-4" style={{
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(122, 253, 214, 0.2)',
          }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Slides ({slides.length})</h2>
              <button
                onClick={() => setIsAddSlideOpen(true)}
                className="p-2 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-lg hover:shadow-lg transition-all"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {slides.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#888888] text-sm">No slides yet</p>
                  <button
                    onClick={() => setIsAddSlideOpen(true)}
                    className="mt-2 text-[#7afdd6] text-sm hover:underline"
                  >
                    Add your first slide
                  </button>
                </div>
              ) : (
                slides.map((slide, index) => {
                  const config = slideTypeConfig[slide.type as SlideType] || slideTypeConfig[SlideType.BLANK];
                  const Icon = config.icon;
                  return (
                    <div
                      key={slide.id}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        selectedSlide === slide.id
                          ? 'bg-gradient-to-r from-[#7afdd6]/20 to-[#b8a4ff]/20 border border-[#7afdd6]/50'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => setSelectedSlide(slide.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <GripVertical size={14} className="text-[#888888]" />
                          <span className="text-xs text-[#888888]">#{index + 1}</span>
                          <Icon size={14} className={config.color} />
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveSlide(slide.id, 'up');
                            }}
                            disabled={index === 0}
                            className="p-1 text-[#888888] hover:text-white disabled:opacity-30"
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveSlide(slide.id, 'down');
                            }}
                            disabled={index === slides.length - 1}
                            className="p-1 text-[#888888] hover:text-white disabled:opacity-30"
                          >
                            <ChevronDown size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="text-white text-sm truncate">
                        {slide.title || config.label}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Slide Editor */}
        <div className="col-span-9">
          {currentSlide ? (
            <SlideEditor
              slide={currentSlide}
              onUpdate={(data) => updateSlideMutation.mutate({ id: currentSlide.id, ...data })}
              onDelete={() => {
                if (window.confirm('Delete this slide?')) {
                  deleteSlideMutation.mutate({ id: currentSlide.id });
                }
              }}
              isLoading={updateSlideMutation.isPending || deleteSlideMutation.isPending}
            />
          ) : (
            <div className="rounded-[25px] p-12 text-center h-full flex items-center justify-center" style={{
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(122, 253, 214, 0.2)',
            }}>
              <div>
                <Type size={48} className="mx-auto mb-4 text-[#888888]" />
                <p className="text-[#888888] text-lg">Select a slide to edit</p>
                <p className="text-[#666666] text-sm mt-2">or create a new one to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Slide Modal */}
      <AddSlideModal
        isOpen={isAddSlideOpen}
        onClose={() => setIsAddSlideOpen(false)}
        onSubmit={(type) => {
          createSlideMutation.mutate({
            presentationId,
            type,
            title: '',
            content: '',
          });
        }}
        isLoading={createSlideMutation.isPending}
      />
    </div>
  );
}

// Slide Editor Component
function SlideEditor({
  slide,
  onUpdate,
  onDelete,
  isLoading,
}: {
  slide: any;
  onUpdate: (data: any) => void;
  onDelete: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    title: slide.title || '',
    content: slide.content || '',
    backgroundColor: slide.backgroundColor || '#1a1a19',
    textColor: slide.textColor || '#ffffff',
    notes: slide.notes || '',
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Update form data when slide changes
  useEffect(() => {
    setFormData({
      title: slide.title || '',
      content: slide.content || '',
      backgroundColor: slide.backgroundColor || '#1a1a19',
      textColor: slide.textColor || '#ffffff',
      notes: slide.notes || '',
    });
    setHasChanges(false);
  }, [slide.id]);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate(formData);
    setHasChanges(false);
  };

  const config = slideTypeConfig[slide.type as SlideType] || slideTypeConfig[SlideType.BLANK];
  const Icon = config.icon;

  return (
    <div className="rounded-[25px] p-6" style={{
      background: 'rgba(255, 255, 255, 0.02)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(122, 253, 214, 0.2)',
    }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Icon size={24} className={config.color} />
          <div>
            <h3 className="text-white font-semibold">{config.label}</h3>
            <p className="text-[#888888] text-sm">Edit slide content</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!hasChanges || isLoading}
            className="px-4 py-2 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save
          </button>
          <button
            onClick={onDelete}
            disabled={isLoading}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors disabled:opacity-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-[#888888] mb-2">Slide Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
            placeholder="Enter slide title..."
          />
        </div>

        {(slide.type === SlideType.CONTENT || slide.type === SlideType.BULLET_POINTS || slide.type === SlideType.TITLE) && (
          <div>
            <label className="block text-sm text-[#888888] mb-2">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              rows={8}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
              placeholder={slide.type === SlideType.BULLET_POINTS ? 'Enter bullet points (one per line)...' : 'Enter slide content...'}
            />
          </div>
        )}

        {slide.type === SlideType.IMAGE && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#888888] mb-2">Image Placeholder</label>
              <div className="rounded-xl bg-white/5 border border-white/20 p-8 text-center">
                <ImageIcon size={48} className="mx-auto mb-3 text-green-400" />
                <p className="text-[#888888] text-sm">Image will be added by designers</p>
                <p className="text-[#666666] text-xs mt-1">This is a planning placeholder</p>
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#888888] mb-2">Description/Caption (Optional)</label>
              <textarea
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                placeholder="Add description or caption for this image..."
              />
            </div>
          </div>
        )}

        {slide.type === SlideType.VIDEO && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#888888] mb-2">Video Placeholder</label>
              <div className="rounded-xl bg-white/5 border border-white/20 p-8 text-center">
                <Video size={48} className="mx-auto mb-3 text-red-400" />
                <p className="text-[#888888] text-sm">Video will be added by designers</p>
                <p className="text-[#666666] text-xs mt-1">This is a planning placeholder</p>
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#888888] mb-2">Description (Optional)</label>
              <textarea
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                placeholder="Add description for this video..."
              />
            </div>
          </div>
        )}

        {slide.type === SlideType.CHART && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#888888] mb-2">Chart Placeholder</label>
              <div className="rounded-xl bg-white/5 border border-white/20 p-8 text-center">
                <BarChart3 size={48} className="mx-auto mb-3 text-yellow-400" />
                <p className="text-[#888888] text-sm">Chart will be added by designers</p>
                <p className="text-[#666666] text-xs mt-1">This is a planning placeholder</p>
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#888888] mb-2">Chart Description (Optional)</label>
              <textarea
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                placeholder="Describe what this chart should show..."
              />
            </div>
          </div>
        )}

        {/* Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#888888] mb-2">Background Color</label>
            <input
              type="color"
              value={formData.backgroundColor}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              className="w-full h-12 rounded-xl cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm text-[#888888] mb-2">Text Color</label>
            <input
              type="color"
              value={formData.textColor}
              onChange={(e) => handleChange('textColor', e.target.value)}
              className="w-full h-12 rounded-xl cursor-pointer"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm text-[#888888] mb-2">Speaker Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
            placeholder="Notes for the presenter..."
          />
        </div>
      </div>

      {/* Preview */}
      <div className="mt-6">
        <h4 className="text-sm text-[#888888] mb-2">Preview</h4>
        <div
          className="rounded-xl p-8 aspect-video flex items-center justify-center"
          style={{
            backgroundColor: formData.backgroundColor,
            color: formData.textColor,
          }}
        >
          <div className="text-center w-full">
            {formData.title && <h2 className="text-3xl font-bold mb-4">{formData.title}</h2>}
            {formData.content && slide.type !== SlideType.BULLET_POINTS && (
              <div className="text-lg whitespace-pre-wrap">{formData.content}</div>
            )}
            {formData.content && slide.type === SlideType.BULLET_POINTS && (
              <ul className="text-left max-w-2xl mx-auto space-y-2">
                {formData.content.split('\n').filter((line: string) => line.trim()).map((bullet: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-[#7afdd6] text-2xl">•</span>
                    <span className="text-lg">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
            {slide.type === SlideType.IMAGE && (
              <div className="flex flex-col items-center gap-3">
                <ImageIcon size={64} className="text-green-400 opacity-50" />
                <p className="text-sm opacity-70">Image Placeholder</p>
                {formData.content && (
                  <p className="text-sm mt-4 max-w-xl text-center">{formData.content}</p>
                )}
              </div>
            )}
            {slide.type === SlideType.VIDEO && (
              <div className="flex flex-col items-center gap-3">
                <Video size={64} className="text-red-400 opacity-50" />
                <p className="text-sm opacity-70">Video Placeholder</p>
                {formData.content && (
                  <p className="text-sm mt-4 max-w-xl text-center">{formData.content}</p>
                )}
              </div>
            )}
            {slide.type === SlideType.CHART && (
              <div className="flex flex-col items-center gap-3">
                <BarChart3 size={64} className="text-yellow-400 opacity-50" />
                <p className="text-sm opacity-70">Chart Placeholder</p>
                {formData.content && (
                  <p className="text-sm mt-4 max-w-xl text-center">{formData.content}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Add Slide Modal
function AddSlideModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: SlideType) => void;
  isLoading: boolean;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-[25px] p-8 max-w-2xl w-full"
            style={{
              background: 'rgba(44, 44, 43, 0.95)',
              backdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Choose Slide Type</h2>
              <button onClick={onClose} className="p-2 text-[#888888] hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {Object.entries(slideTypeConfig).map(([type, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={type}
                    onClick={() => onSubmit(type as SlideType)}
                    disabled={isLoading}
                    className="p-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#7afdd6]/50 transition-all text-center disabled:opacity-50"
                  >
                    <Icon size={32} className={`mx-auto mb-3 ${config.color}`} />
                    <p className="text-white text-sm font-medium">{config.label}</p>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
