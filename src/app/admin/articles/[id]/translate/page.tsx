'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/trpc/react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertTriangle,
  Globe,
  Languages,
  FileText,
  Eye,
  Send,
  X
} from 'lucide-react';
import { ArticleStatus } from '@prisma/client';
import Dropdown, { DropdownOption } from '@/components/ui/Dropdown';
import RichTextEditor from '@/components/editor/RichTextEditor';

const LOCALES = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'ar', label: 'العربية', flag: '🇸🇦' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'ru', label: 'Русский', flag: '🇷🇺' },
];

const STATUS_OPTIONS: DropdownOption[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
];

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export default function TranslateArticlePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = params.id as string;
  const translationId = searchParams.get('translationId');
  const isEditing = !!translationId;

  // Form state
  const [locale, setLocale] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<ArticleStatus>('DRAFT');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isPreview, setIsPreview] = useState(false);

  // Fetch original article
  const { data: article, isLoading: articleLoading } = api.article.getById.useQuery(
    { id: articleId },
    { enabled: !!articleId }
  );

  // Fetch existing translation if editing
  const { data: existingTranslation, isLoading: translationLoading } = api.article.getById.useQuery(
    { id: translationId! },
    { enabled: isEditing && !!translationId }
  );

  // Create translation mutation
  const createTranslationMutation = api.article.createTranslation.useMutation({
    onSuccess: () => {
      setIsSaving(false);
      addToast('Translation created successfully!', 'success');
      setTimeout(() => router.push('/admin/articles'), 1500);
    },
    onError: (error) => {
      setIsSaving(false);
      addToast(error.message || 'Failed to create translation', 'error');
    },
  });

  // Update translation mutation
  const updateTranslationMutation = api.article.updateTranslation.useMutation({
    onSuccess: () => {
      setIsSaving(false);
      addToast('Translation updated successfully!', 'success');
      setTimeout(() => router.push('/admin/articles'), 1500);
    },
    onError: (error) => {
      setIsSaving(false);
      addToast(error.message || 'Failed to update translation', 'error');
    },
  });

  // Load existing translation data
  useEffect(() => {
    if (existingTranslation) {
      setLocale(existingTranslation.locale);
      setTitle(existingTranslation.title);
      setSlug(existingTranslation.slug);
      setExcerpt(existingTranslation.excerpt || '');
      setContent(existingTranslation.content);
      setStatus(existingTranslation.status);
      setMetaTitle(existingTranslation.metaTitle || '');
      setMetaDescription(existingTranslation.metaDescription || '');
    }
  }, [existingTranslation]);

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !isEditing) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setSlug(generatedSlug);
    }
  }, [title, isEditing]);

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 5000);
  };

  const handleSave = (publishNow = false) => {
    // Validation
    if (!locale) {
      addToast('Please select a language', 'error');
      return;
    }
    if (!title.trim()) {
      addToast('Title is required', 'error');
      return;
    }
    if (!content.trim()) {
      addToast('Content is required', 'error');
      return;
    }

    setIsSaving(true);

    const translationData = {
      articleId,
      locale: locale as 'en' | 'ar' | 'fr' | 'zh' | 'ru',
      title,
      slug,
      excerpt: excerpt || undefined,
      content,
      status: publishNow ? ('PUBLISHED' as ArticleStatus) : status,
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
    };

    if (isEditing && translationId) {
      updateTranslationMutation.mutate({
        id: translationId,
        ...translationData,
        changeLog: 'Translation updated via admin panel',
      });
    } else {
      createTranslationMutation.mutate(translationData);
    }
  };

  if (articleLoading || (isEditing && translationLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#7afdd6] mx-auto mb-4" />
          <p className="text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Article Not Found</h2>
        <p className="text-[#888888] mb-6">The requested article could not be found.</p>
        <button
          onClick={() => router.push('/admin/articles')}
          className="px-6 py-3 bg-[#7afdd6] text-[#2c2c2b] rounded-[15px] font-medium hover:opacity-80 transition-opacity"
        >
          Back to Articles
        </button>
      </div>
    );
  }

  // Get available locales (exclude original article locale and existing translations)
  const existingLocales = [article.locale, ...(article.translations?.map((t) => t.locale) || [])];
  const availableLocales = LOCALES.filter((l) => !existingLocales.includes(l.value) || (isEditing && l.value === locale));

  const getLocaleOptions = (): DropdownOption[] =>
    availableLocales.map((locale) => ({
      value: locale.value,
      label: `${locale.flag} ${locale.label}`,
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <button
          onClick={() => router.push('/admin/articles')}
          className="flex items-center gap-2 text-[#888888] hover:text-[#7afdd6] transition-colors mb-6"
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          <ArrowLeft size={20} />
          Back to Articles
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-4xl md:text-6xl font-normal mb-2 capitalize"
              style={{
                background: 'linear-gradient(90deg, #b8a4ff 0%, #7afdd6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: '"Poppins", sans-serif',
                lineHeight: '1.1',
              }}
            >
              {isEditing ? 'Edit Translation' : 'Create Translation'}
            </h1>
            <p className="text-[#888888] text-lg">
              {isEditing ? 'Update translation content' : `Translate "${article.title}"`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#888888] hover:text-[#7afdd6] transition-colors"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              <Eye size={16} />
              {isPreview ? 'Edit' : 'Preview'}
            </button>

            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-[10px] font-medium transition-all duration-300 bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Draft
            </button>

            <button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 rounded-[15px] font-medium transition-all duration-300 disabled:opacity-50"
              style={{
                background: 'linear-gradient(90deg, #7afdd6 0%, #b8a4ff 100%)',
                color: '#2c2c2b',
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Publish
            </button>
          </div>
        </div>
      </motion.div>

      {/* Original Article Reference */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="rounded-[25px] p-6"
        style={{
          background: 'rgba(122, 253, 214, 0.05)',
          backdropFilter: 'blur(50.5px)',
          WebkitBackdropFilter: 'blur(50.5px)',
          border: '2px solid rgba(122, 253, 214, 0.2)',
        }}
      >
        <div className="flex items-start gap-4">
          <FileText className="text-[#7afdd6] flex-shrink-0 mt-1" size={24} />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#7afdd6] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Original Article
            </h3>
            <p className="text-white font-medium mb-1" style={{ fontFamily: '"Poppins", sans-serif' }}>
              {article.title}
            </p>
            <p className="text-[#888888] text-sm">
              Language: {LOCALES.find((l) => l.value === article.locale)?.flag}{' '}
              {LOCALES.find((l) => l.value === article.locale)?.label}
            </p>
            {article.excerpt && (
              <p className="text-[#888888] text-sm mt-2 line-clamp-2">{article.excerpt}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Translation Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="rounded-[25px] p-6"
        style={{
          background: 'rgba(255, 255, 255, 0.01)',
          backdropFilter: 'blur(50.5px)',
          WebkitBackdropFilter: 'blur(50.5px)',
          border: '2px solid rgba(122, 253, 214, 0.3)',
        }}
      >
        {isPreview ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe size={24} className="text-[#7afdd6]" />
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Preview
              </h2>
            </div>

            <div className="border-b border-[#7afdd6]/20 pb-4">
              <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
                {title || 'Untitled'}
              </h1>
              {excerpt && (
                <p className="text-lg text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  {excerpt}
                </p>
              )}
            </div>

            <div
              className="prose prose-invert prose-lg max-w-none"
              style={{ fontFamily: '"Poppins", sans-serif' }}
              dangerouslySetInnerHTML={{ __html: content || '<p>No content yet...</p>' }}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Language Selection */}
            <div>
              <label className="block text-sm font-medium text-[#7afdd6] mb-2 flex items-center gap-2">
                <Languages size={16} />
                Target Language <span className="text-red-400">*</span>
              </label>
              <Dropdown
                options={getLocaleOptions()}
                value={locale}
                onValueChange={setLocale}
                placeholder="Select language"
                disabled={isEditing}
              />
              {availableLocales.length === 0 && !isEditing && (
                <p className="text-yellow-400 text-sm mt-2">
                  ⚠️ All languages have been translated. No available languages for new translation.
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[#7afdd6] mb-2">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-[15px] text-white placeholder-[#888888] border-0 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/20"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  fontFamily: '"Poppins", sans-serif',
                }}
                placeholder="Enter translated title..."
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-[#7afdd6] mb-2">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-3 rounded-[15px] text-white placeholder-[#888888] border-0 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/20"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  fontFamily: '"Poppins", sans-serif',
                }}
                placeholder="article-slug"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-[#7afdd6] mb-2">Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-[15px] text-white placeholder-[#888888] border-0 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/20 resize-none"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  fontFamily: '"Poppins", sans-serif',
                }}
                placeholder="Brief description..."
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-[#7afdd6] mb-2">
                Content <span className="text-red-400">*</span>
              </label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Write translated content here..."
              />
            </div>

            {/* SEO Fields */}
            <div className="border-t border-[#7afdd6]/20 pt-6">
              <h3 className="text-lg font-semibold text-[#7afdd6] mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
                SEO (Optional)
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">Meta Title</label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-[15px] text-white placeholder-[#888888] border-0 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/20"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      fontFamily: '"Poppins", sans-serif',
                    }}
                    placeholder="SEO title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">Meta Description</label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-[15px] text-white placeholder-[#888888] border-0 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/20 resize-none"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      fontFamily: '"Poppins", sans-serif',
                    }}
                    placeholder="SEO description..."
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[#7afdd6] mb-2">Status</label>
              <Dropdown
                options={STATUS_OPTIONS}
                value={status}
                onValueChange={(value) => setStatus(value as ArticleStatus)}
                placeholder="Select status"
              />
            </div>

            {/* Word Count */}
            <div className="flex items-center justify-between text-sm text-[#888888] pt-4 border-t border-white/10">
              <span>Word count: {content.replace(/<[^>]*>/g, '').split(/\s+/).filter((w) => w.length > 0).length}</span>
              <span>Reading time: {Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).filter((w) => w.length > 0).length / 200)} min</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`px-4 py-3 rounded-[15px] text-white font-medium max-w-sm flex items-center gap-3 ${
              toast.type === 'success'
                ? 'bg-green-600'
                : toast.type === 'error'
                ? 'bg-red-600'
                : toast.type === 'warning'
                ? 'bg-yellow-600'
                : 'bg-blue-600'
            }`}
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}>
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
