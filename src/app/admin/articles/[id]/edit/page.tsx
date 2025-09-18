'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { api } from '@/trpc/react';
import { ArticleStatus, ArticleType, PublishScheduleType, UserRole } from '@prisma/client';
import RichTextEditor from '@/components/editor/RichTextEditor';
import Dropdown, { DropdownOption } from '@/components/ui/Dropdown';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { format } from 'date-fns';
import {
  Save,
  Send,
  ArrowLeft,
  Eye,
  Calendar,
  Globe,
  Tag,
  Image as ImageIcon,
  Settings,
  AlertTriangle,
  Check,
  Clock,
  Star,
  Pin,
  Loader2
} from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ArticleFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  locale: string;
  status: ArticleStatus;
  type: ArticleType;
  publishScheduleType: PublishScheduleType;
  scheduledAt?: Date | null;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  canonicalUrl: string;
  allowComments: boolean;
  isFeatured: boolean;
  isPinned: boolean;
  featuredImage: string;
  featuredImageAlt: string;
  categoryId: string;
  tags: string[];
  customCss: string;
  customJs: string;
}

const LOCALES = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'ar', label: 'العربية', flag: '🇸🇦' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'ru', label: 'Русский', flag: '🇷🇺' },
];

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;
  const { data: session } = useSession();
  const userRole = session?.user?.role as UserRole;

  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    locale: 'en',
    status: 'DRAFT',
    type: 'BLOG_POST',
    publishScheduleType: 'MANUAL',
    scheduledAt: null,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    canonicalUrl: '',
    allowComments: true,
    isFeatured: false,
    isPinned: false,
    featuredImage: '',
    featuredImageAlt: '',
    categoryId: '',
    tags: [],
    customCss: '',
    customJs: '',
  });

  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [originalStatus, setOriginalStatus] = useState<ArticleStatus>('DRAFT');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Fetch article data
  const { data: article, isLoading: articleLoading } = api.article.getById.useQuery(
    { id: articleId },
    { enabled: !!articleId }
  );

  // Set document title
  useEffect(() => {
    if (article?.title) {
      document.title = `Edit: ${article.title} - KayanLive Admin`;
    } else {
      document.title = 'Edit Article - KayanLive Admin';
    }
    return () => {
      document.title = 'KayanLive Admin';
    };
  }, [article?.title]);

  // Fetch categories and tags for dropdown
  const { data: categories } = api.article.getCategories.useQuery();
  const { data: existingTags } = api.article.getTags.useQuery();

  const updateArticleMutation = api.article.update.useMutation({
    onSuccess: (updatedArticle) => {
      setOriginalStatus(updatedArticle.status);
      setLastSaved(new Date());
      setIsAutoSaving(false);
      if (!isAutoSaving) {
        addToast('Article updated successfully!', 'success');
      }
    },
    onError: (error) => {
      setIsAutoSaving(false);
      addToast(error.message || 'Failed to update article', 'error');
    },
  });

  const autoSaveMutation = api.article.update.useMutation({
    onSuccess: () => {
      setLastSaved(new Date());
      setIsAutoSaving(false);
    },
    onError: () => {
      setIsAutoSaving(false);
    },
  });

  const changeStatusMutation = api.article.changeStatus.useMutation({
    onSuccess: (updatedArticle) => {
      if (updatedArticle.status === 'PUBLISHED') {
        addToast('Article published successfully!', 'success');
      } else {
        addToast(`Article status changed to ${updatedArticle.status}`, 'success');
      }
      setOriginalStatus(updatedArticle.status);
      setFormData(prev => ({ ...prev, status: updatedArticle.status }));
    },
    onError: (error) => {
      addToast(error.message || 'Failed to change status', 'error');
    },
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title]);

  // Load article data when it's available
  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || '',
        content: article.content,
        locale: article.locale,
        status: article.status,
        type: article.type,
        publishScheduleType: article.publishScheduleType,
        scheduledAt: article.scheduledAt,
        metaTitle: article.metaTitle || '',
        metaDescription: article.metaDescription || '',
        metaKeywords: article.metaKeywords || '',
        ogTitle: article.ogTitle || '',
        ogDescription: article.ogDescription || '',
        ogImage: article.ogImage || '',
        twitterTitle: article.twitterTitle || '',
        twitterDescription: article.twitterDescription || '',
        twitterImage: article.twitterImage || '',
        canonicalUrl: article.canonicalUrl || '',
        allowComments: article.allowComments,
        isFeatured: article.isFeatured,
        isPinned: article.isPinned,
        featuredImage: article.featuredImage || '',
        featuredImageAlt: article.featuredImageAlt || '',
        categoryId: article.categoryId || 'none',
        tags: article.tags?.map(t => t.tag.name) || [],
        customCss: article.customCss || '',
        customJs: article.customJs || '',
      });
      setOriginalStatus(article.status);
      setIsLoading(false);
    }
  }, [article]);

  // Auto-save functionality
  useEffect(() => {
    if (!article || isLoading) return;

    const autoSave = () => {
      if (formData.title.trim() && formData.content.trim()) {
        setIsAutoSaving(true);
        autoSaveMutation.mutate({
          id: articleId,
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt,
          content: formData.content,
          type: formData.type,
          publishScheduleType: formData.publishScheduleType,
          scheduledAt: formData.publishScheduleType === 'SCHEDULED' ? formData.scheduledAt : undefined,
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
          metaKeywords: formData.metaKeywords,
          ogTitle: formData.ogTitle,
          ogDescription: formData.ogDescription,
          ogImage: formData.ogImage,
          canonicalUrl: formData.canonicalUrl,
          allowComments: formData.allowComments,
          isFeatured: formData.isFeatured,
          isPinned: formData.isPinned,
          categoryId: formData.categoryId === 'none' ? undefined : formData.categoryId || undefined,
          tagIds: [], // Tags will be implemented later
          featuredImage: formData.featuredImage,
          featuredImageAlt: formData.featuredImageAlt,
          customCss: formData.customCss,
          customJs: formData.customJs,
        });
      }
    };

    const autoSaveInterval = setInterval(autoSave, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [formData, articleId, autoSaveMutation, article, isLoading]);

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(toast => toast.id !== id)), 5000);
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      addToast('Title is required', 'error');
      return;
    }

    if (!formData.content.trim()) {
      addToast('Content is required', 'error');
      return;
    }

    updateArticleMutation.mutate({
      id: articleId,
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      content: formData.content,
      type: formData.type,
      publishScheduleType: formData.publishScheduleType,
      scheduledAt: formData.publishScheduleType === 'SCHEDULED' ? formData.scheduledAt : undefined,
      metaTitle: formData.metaTitle,
      metaDescription: formData.metaDescription,
      metaKeywords: formData.metaKeywords,
      ogTitle: formData.ogTitle,
      ogDescription: formData.ogDescription,
      ogImage: formData.ogImage,
      canonicalUrl: formData.canonicalUrl,
      allowComments: formData.allowComments,
      isFeatured: formData.isFeatured,
      isPinned: formData.isPinned,
      categoryId: formData.categoryId === 'none' ? undefined : formData.categoryId || undefined,
      tagIds: [], // Tags will be implemented later
      featuredImage: formData.featuredImage,
      featuredImageAlt: formData.featuredImageAlt,
      customCss: formData.customCss,
      customJs: formData.customJs,
    });
  };

  const handleStatusChange = (newStatus: ArticleStatus) => {
    // Check permissions for status change
    if (!canChangeStatus(newStatus)) {
      addToast('You do not have permission to change to this status', 'error');
      return;
    }

    changeStatusMutation.mutate({
      id: articleId,
      status: newStatus,
      publishedAt: newStatus === 'PUBLISHED' ? new Date() : undefined,
    });
  };

  const handleSubmitForReview = () => {
    handleStatusChange('PENDING_REVIEW');
  };

  const handlePublish = () => {
    if (userRole === 'CONTENT_CREATOR') {
      addToast('You need approval from a moderator to publish', 'warning');
      return;
    }
    handleStatusChange('PUBLISHED');
  };

  const canChangeStatus = (newStatus: ArticleStatus): boolean => {
    if (!article) return false;

    if (userRole === 'ADMIN') return true;

    if (userRole === 'MODERATOR') {
      return ['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED'].includes(newStatus);
    }

    if (userRole === 'CONTENT_CREATOR' && article.author.id === session?.user?.id) {
      return originalStatus === 'DRAFT' && newStatus === 'PENDING_REVIEW';
    }

    return false;
  };

  const canEditArticle = (): boolean => {
    if (!article) return false;

    if (userRole === 'ADMIN') return true;
    if (userRole === 'MODERATOR') return true;
    if (userRole === 'CONTENT_CREATOR' && article.author.id === session?.user?.id) {
      return ['DRAFT', 'REJECTED'].includes(originalStatus);
    }
    return false;
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getStatusOptions = (): DropdownOption[] => {
    const baseOptions = [
      { value: 'DRAFT', label: 'Draft' },
      { value: 'PENDING_REVIEW', label: 'Pending Review' },
    ];

    if (userRole === 'ADMIN' || userRole === 'MODERATOR') {
      baseOptions.push(
        { value: 'APPROVED', label: 'Approved' },
        { value: 'PUBLISHED', label: 'Published' },
        { value: 'REJECTED', label: 'Rejected' },
        { value: 'ARCHIVED', label: 'Archived' }
      );
    }

    return baseOptions;
  };

  const getTypeOptions = (): DropdownOption[] => [
    { value: 'BLOG_POST', label: 'Blog Post' },
    { value: 'NEWS', label: 'News' },
    { value: 'CASE_STUDY', label: 'Case Study' },
    { value: 'SERVICE_PAGE', label: 'Service Page' },
    { value: 'LANDING_PAGE', label: 'Landing Page' },
    { value: 'ANNOUNCEMENT', label: 'Announcement' },
  ];

  const getLocaleOptions = (): DropdownOption[] =>
    LOCALES.map(locale => ({
      value: locale.value,
      label: `${locale.flag} ${locale.label}`,
    }));

  const getCategoryOptions = (): DropdownOption[] => [
    { value: 'none', label: 'No Category' },
    ...(categories || []).map(category => ({
      value: category.id,
      label: category.name,
    })),
  ];

  if (isLoading || articleLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#7afdd6]" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Article Not Found</h1>
          <p className="text-[#888888] mb-4">The article you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/admin/articles')}
            className="px-4 py-2 bg-[#7afdd6] text-[#2c2c2b] rounded-lg hover:opacity-80 transition-opacity"
          >
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  if (!canEditArticle()) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-[#888888] mb-4">You don&apos;t have permission to edit this article.</p>
          <button
            onClick={() => router.push('/admin/articles')}
            className="px-4 py-2 bg-[#7afdd6] text-[#2c2c2b] rounded-lg hover:opacity-80 transition-opacity"
          >
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Breadcrumb
          items={[
            { label: 'Articles', href: '/admin/articles' },
            { label: article?.title || 'Edit Article', current: true }
          ]}
        />
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/articles')}
            className="p-2 text-[#888888] hover:text-[#7afdd6] transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1
              className="text-4xl md:text-6xl font-normal mb-2 capitalize"
              style={{
                background: 'linear-gradient(90deg, #b8a4ff 0%, #7afdd6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: '"Poppins", sans-serif',
                lineHeight: '1.1'
              }}
            >
              Edit Article
            </h1>
            <p className="text-[#888888] text-lg">
              Update your article content and settings
            </p>
            {/* Auto-save status */}
            <div className="flex items-center gap-2 mt-2">
              {isAutoSaving && (
                <div className="flex items-center gap-2 text-sm text-[#7afdd6]">
                  <Loader2 size={14} className="animate-spin" />
                  <span style={{ fontFamily: '"Poppins", sans-serif' }}>Saving...</span>
                </div>
              )}
              {lastSaved && !isAutoSaving && (
                <div className="text-sm text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Last saved: {format(lastSaved, 'HH:mm:ss')}
                </div>
              )}
            </div>
          </div>
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
            onClick={handleSave}
            disabled={updateArticleMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-[10px] font-medium transition-all duration-300 bg-white/10 text-white hover:bg-white/20"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            {updateArticleMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>

          {userRole === 'CONTENT_CREATOR' && originalStatus === 'DRAFT' && (
            <button
              onClick={handleSubmitForReview}
              disabled={changeStatusMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-[10px] font-medium transition-all duration-300 bg-yellow-600 text-white hover:bg-yellow-700"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              {changeStatusMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Submit for Review
            </button>
          )}

          {(userRole === 'ADMIN' || userRole === 'MODERATOR') && (
            <button
              onClick={handlePublish}
              disabled={changeStatusMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 rounded-[15px] font-medium transition-all duration-300"
              style={{
                background: 'linear-gradient(90deg, #7afdd6 0%, #b8a4ff 100%)',
                color: '#2c2c2b',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {changeStatusMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Publish
            </button>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex gap-1 p-1 rounded-[15px]"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(122, 253, 214, 0.2)'
        }}
      >
        {[
          { id: 'content', label: 'Content', icon: <Globe size={16} /> },
          { id: 'seo', label: 'SEO', icon: <Eye size={16} /> },
          { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'content' | 'seo' | 'settings')}
            className={`flex items-center gap-2 px-6 py-3 rounded-[10px] font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-[#7afdd6] text-[#2c2c2b]'
                : 'text-[#888888] hover:text-[#7afdd6] hover:bg-white/10'
            }`}
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {isPreview ? (
            <ArticlePreview
              title={formData.title}
              content={formData.content}
              excerpt={formData.excerpt}
              featuredImage={formData.featuredImage}
              featuredImageAlt={formData.featuredImageAlt}
              author={article?.author?.name || 'Unknown Author'}
              authorEmail={article?.author?.email || ''}
              publishedAt={article?.publishedAt || article?.createdAt || new Date()}
              readingTime={Math.ceil(formData.content.split(/\s+/).length / 200)}
            />
          ) : activeTab === 'content' && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Article title..."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full text-3xl font-bold bg-transparent text-white placeholder-[#888888] border-0 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/20 rounded-[10px] p-4"
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    background: 'rgba(255, 255, 255, 0.01)',
                    backdropFilter: 'blur(50.5px)',
                    border: '1px solid rgba(122, 253, 214, 0.2)'
                  }}
                />

                <input
                  type="text"
                  placeholder="article-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full p-3 rounded-[10px] text-white placeholder-[#888888] border-0 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/20"
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    background: 'rgba(255, 255, 255, 0.01)',
                    backdropFilter: 'blur(50.5px)',
                    border: '1px solid rgba(122, 253, 214, 0.2)'
                  }}
                />

                <textarea
                  placeholder="Brief excerpt or summary..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows={3}
                  className="w-full p-3 rounded-[10px] text-white placeholder-[#888888] border-0 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/20 resize-none"
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    background: 'rgba(255, 255, 255, 0.01)',
                    backdropFilter: 'blur(50.5px)',
                    border: '1px solid rgba(122, 253, 214, 0.2)'
                  }}
                />
              </div>

              {/* Rich Text Editor */}
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                placeholder="Start writing your article content..."
              />
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6">
              {/* Meta Tags */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[#7afdd6]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Meta Tags
                </h3>

                <input
                  type="text"
                  placeholder="Meta title (recommended: 50-60 characters)"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                  className="w-full p-3 rounded-[10px] text-white placeholder-[#888888] border-0 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/20"
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    background: 'rgba(255, 255, 255, 0.01)',
                    backdropFilter: 'blur(50.5px)',
                    border: '1px solid rgba(122, 253, 214, 0.2)'
                  }}
                />

                <textarea
                  placeholder="Meta description (recommended: 150-160 characters)"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  rows={3}
                  className="w-full p-3 rounded-[10px] text-white placeholder-[#888888] border-0 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/20 resize-none"
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    background: 'rgba(255, 255, 255, 0.01)',
                    backdropFilter: 'blur(50.5px)',
                    border: '1px solid rgba(122, 253, 214, 0.2)'
                  }}
                />

                <input
                  type="text"
                  placeholder="Meta keywords (comma separated)"
                  value={formData.metaKeywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaKeywords: e.target.value }))}
                  className="w-full p-3 rounded-[10px] text-white placeholder-[#888888] border-0 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/20"
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    background: 'rgba(255, 255, 255, 0.01)',
                    backdropFilter: 'blur(50.5px)',
                    border: '1px solid rgba(122, 253, 214, 0.2)'
                  }}
                />
              </div>

              {/* Open Graph */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[#7afdd6]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Open Graph (Facebook)
                </h3>

                <input
                  type="text"
                  placeholder="OG title"
                  value={formData.ogTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, ogTitle: e.target.value }))}
                  className="w-full p-3 rounded-[10px] text-white placeholder-[#888888] border-0 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/20"
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    background: 'rgba(255, 255, 255, 0.01)',
                    backdropFilter: 'blur(50.5px)',
                    border: '1px solid rgba(122, 253, 214, 0.2)'
                  }}
                />

                <textarea
                  placeholder="OG description"
                  value={formData.ogDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, ogDescription: e.target.value }))}
                  rows={2}
                  className="w-full p-3 rounded-[10px] text-white placeholder-[#888888] border-0 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/20 resize-none"
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    background: 'rgba(255, 255, 255, 0.01)',
                    backdropFilter: 'blur(50.5px)',
                    border: '1px solid rgba(122, 253, 214, 0.2)'
                  }}
                />

                <input
                  type="url"
                  placeholder="OG image URL"
                  value={formData.ogImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, ogImage: e.target.value }))}
                  className="w-full p-3 rounded-[10px] text-white placeholder-[#888888] border-0 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/20"
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    background: 'rgba(255, 255, 255, 0.01)',
                    backdropFilter: 'blur(50.5px)',
                    border: '1px solid rgba(122, 253, 214, 0.2)'
                  }}
                />
              </div>

              {/* Twitter Cards */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[#7afdd6]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Twitter Cards
                </h3>

                <input
                  type="text"
                  placeholder="Twitter title"
                  value={formData.twitterTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, twitterTitle: e.target.value }))}
                  className="w-full p-3 rounded-[10px] text-white placeholder-[#888888] border-0 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/20"
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    background: 'rgba(255, 255, 255, 0.01)',
                    backdropFilter: 'blur(50.5px)',
                    border: '1px solid rgba(122, 253, 214, 0.2)'
                  }}
                />

                <textarea
                  placeholder="Twitter description"
                  value={formData.twitterDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, twitterDescription: e.target.value }))}
                  rows={2}
                  className="w-full p-3 rounded-[10px] text-white placeholder-[#888888] border-0 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/20 resize-none"
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    background: 'rgba(255, 255, 255, 0.01)',
                    backdropFilter: 'blur(50.5px)',
                    border: '1px solid rgba(122, 253, 214, 0.2)'
                  }}
                />

                <input
                  type="url"
                  placeholder="Twitter image URL"
                  value={formData.twitterImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, twitterImage: e.target.value }))}
                  className="w-full p-3 rounded-[10px] text-white placeholder-[#888888] border-0 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/20"
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    background: 'rgba(255, 255, 255, 0.01)',
                    backdropFilter: 'blur(50.5px)',
                    border: '1px solid rgba(122, 253, 214, 0.2)'
                  }}
                />
              </div>

              {/* Canonical URL */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[#7afdd6]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Canonical URL
                </h3>

                <input
                  type="url"
                  placeholder="Canonical URL (optional)"
                  value={formData.canonicalUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, canonicalUrl: e.target.value }))}
                  className="w-full p-3 rounded-[10px] text-white placeholder-[#888888] border-0 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/20"
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    background: 'rgba(255, 255, 255, 0.01)',
                    backdropFilter: 'blur(50.5px)',
                    border: '1px solid rgba(122, 253, 214, 0.2)'
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Publishing Schedule */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[#7afdd6]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Publishing Schedule
                </h3>

                <div className="w-full">
                  <Dropdown
                    options={[
                      { value: 'MANUAL', label: 'Manual' },
                      { value: 'IMMEDIATE', label: 'Immediate' },
                      { value: 'SCHEDULED', label: 'Scheduled' },
                    ]}
                    value={formData.publishScheduleType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, publishScheduleType: value as PublishScheduleType }))}
                    placeholder="Schedule Type"
                  />
                </div>

                {formData.publishScheduleType === 'SCHEDULED' && (
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt ? new Date(formData.scheduledAt).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      scheduledAt: e.target.value ? new Date(e.target.value) : null
                    }))}
                    className="w-full p-3 rounded-[10px] text-white border-0 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/20"
                    style={{
                      fontFamily: '"Poppins", sans-serif',
                      background: 'rgba(255, 255, 255, 0.01)',
                      backdropFilter: 'blur(50.5px)',
                      border: '1px solid rgba(122, 253, 214, 0.2)'
                    }}
                  />
                )}
              </div>

              {/* Featured Image */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[#7afdd6]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Featured Image
                </h3>

                <input
                  type="url"
                  placeholder="Featured image URL"
                  value={formData.featuredImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                  className="w-full p-3 rounded-[10px] text-white placeholder-[#888888] border-0 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/20"
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    background: 'rgba(255, 255, 255, 0.01)',
                    backdropFilter: 'blur(50.5px)',
                    border: '1px solid rgba(122, 253, 214, 0.2)'
                  }}
                />

                <input
                  type="text"
                  placeholder="Featured image alt text"
                  value={formData.featuredImageAlt}
                  onChange={(e) => setFormData(prev => ({ ...prev, featuredImageAlt: e.target.value }))}
                  className="w-full p-3 rounded-[10px] text-white placeholder-[#888888] border-0 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/20"
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    background: 'rgba(255, 255, 255, 0.01)',
                    backdropFilter: 'blur(50.5px)',
                    border: '1px solid rgba(122, 253, 214, 0.2)'
                  }}
                />
              </div>

              {/* Custom CSS/JS */}
              {(userRole === 'ADMIN' || userRole === 'MODERATOR') && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-[#7afdd6]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    Custom Code
                  </h3>

                  <textarea
                    placeholder="Custom CSS"
                    value={formData.customCss}
                    onChange={(e) => setFormData(prev => ({ ...prev, customCss: e.target.value }))}
                    rows={5}
                    className="w-full p-3 rounded-[10px] text-white placeholder-[#888888] border-0 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/20 resize-none font-mono text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.01)',
                      backdropFilter: 'blur(50.5px)',
                      border: '1px solid rgba(122, 253, 214, 0.2)'
                    }}
                  />

                  <textarea
                    placeholder="Custom JavaScript"
                    value={formData.customJs}
                    onChange={(e) => setFormData(prev => ({ ...prev, customJs: e.target.value }))}
                    rows={5}
                    className="w-full p-3 rounded-[10px] text-white placeholder-[#888888] border-0 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/20 resize-none font-mono text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.01)',
                      backdropFilter: 'blur(50.5px)',
                      border: '1px solid rgba(122, 253, 214, 0.2)'
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Article Settings */}
          <div
            className="p-6 rounded-[20px]"
            style={{
              background: 'rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '1px solid rgba(122, 253, 214, 0.2)'
            }}
          >
            <h3 className="text-lg font-medium text-[#7afdd6] mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Article Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#888888] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Status
                </label>
                <Dropdown
                  options={getStatusOptions()}
                  value={formData.status}
                  onValueChange={(value) => handleStatusChange(value as ArticleStatus)}
                  placeholder="Status"
                />
              </div>

              <div>
                <label className="block text-sm text-[#888888] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Type
                </label>
                <Dropdown
                  options={getTypeOptions()}
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as ArticleType }))}
                  placeholder="Type"
                />
              </div>

              <div>
                <label className="block text-sm text-[#888888] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Language
                </label>
                <Dropdown
                  options={getLocaleOptions()}
                  value={formData.locale}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, locale: value }))}
                  placeholder="Language"
                  disabled={true} // Disable locale change for existing articles
                />
              </div>

              <div>
                <label className="block text-sm text-[#888888] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Category
                </label>
                <Dropdown
                  options={getCategoryOptions()}
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                  placeholder="Category"
                />
              </div>

              {/* Flags */}
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.allowComments}
                    onChange={(e) => setFormData(prev => ({ ...prev, allowComments: e.target.checked }))}
                    className="w-4 h-4 rounded accent-[#7afdd6]"
                  />
                  <span className="text-white text-sm" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    Allow comments
                  </span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="w-4 h-4 rounded accent-[#7afdd6]"
                  />
                  <span className="text-white text-sm flex items-center gap-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    <Star size={14} />
                    Featured article
                  </span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
                    className="w-4 h-4 rounded accent-[#7afdd6]"
                  />
                  <span className="text-white text-sm flex items-center gap-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    <Pin size={14} />
                    Pin to top
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Article Stats */}
          <div
            className="p-6 rounded-[20px]"
            style={{
              background: 'rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '1px solid rgba(122, 253, 214, 0.2)'
            }}
          >
            <h3 className="text-lg font-medium text-[#7afdd6] mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Article Stats
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Word count
                </span>
                <span className="text-sm text-white font-medium" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  {formData.content ? formData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length : 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Reading time
                </span>
                <span className="text-sm text-white font-medium" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  {Math.ceil((formData.content ? formData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length : 0) / 200)} min
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Characters
                </span>
                <span className="text-sm text-white font-medium" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  {formData.content ? formData.content.replace(/<[^>]*>/g, '').length : 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Views
                </span>
                <span className="text-sm text-white font-medium" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  {article?.viewCount?.toLocaleString() || '0'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Last updated
                </span>
                <span className="text-sm text-white font-medium" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  {article ? format(new Date(article.updatedAt), 'MMM dd, yyyy') : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div
            className="p-6 rounded-[20px]"
            style={{
              background: 'rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '1px solid rgba(122, 253, 214, 0.2)'
            }}
          >
            <h3 className="text-lg font-medium text-[#7afdd6] mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Tags
            </h3>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="flex-1 p-2 rounded-[8px] bg-white/10 text-white placeholder-[#888888] border border-[#7afdd6]/20 focus:border-[#7afdd6] focus:outline-none text-sm"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                />
                <button
                  onClick={addTag}
                  className="px-3 py-2 bg-[#7afdd6] text-[#2c2c2b] rounded-[8px] text-sm font-medium hover:opacity-80 transition-opacity"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 text-white text-sm rounded-full border border-[#7afdd6]/20"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    <Tag size={12} />
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-[#888888] hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`px-4 py-3 rounded-[15px] text-white font-medium max-w-sm ${
              toast.type === 'success' ? 'bg-green-600' :
              toast.type === 'error' ? 'bg-red-600' :
              toast.type === 'warning' ? 'bg-yellow-600' :
              'bg-blue-600'
            }`}
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            {toast.message}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

interface ArticlePreviewProps {
  title: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  featuredImageAlt: string;
  author: string;
  authorEmail: string;
  publishedAt: Date;
  readingTime: number;
}

function ArticlePreview({
  title,
  content,
  excerpt,
  featuredImage,
  featuredImageAlt,
  author,
  authorEmail,
  publishedAt,
  readingTime
}: ArticlePreviewProps) {
  return (
    <div
      className="rounded-[25px] p-8"
      style={{
        background: 'rgba(255, 255, 255, 0.01)',
        backdropFilter: 'blur(50.5px)',
        WebkitBackdropFilter: 'blur(50.5px)',
        border: '2px solid rgba(122, 253, 214, 0.3)'
      }}
    >
      {/* Article Header */}
      <div className="mb-8">
        {featuredImage && (
          <img
            src={featuredImage}
            alt={featuredImageAlt}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}

        <h1
          className="text-4xl font-bold text-white mb-4"
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          {title || 'Article Title'}
        </h1>

        {excerpt && (
          <p
            className="text-lg text-[#888888] mb-6"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            {excerpt}
          </p>
        )}

        <div className="flex items-center gap-6 text-sm text-[#888888] border-b border-[#7afdd6]/20 pb-6">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-[#7afdd6] text-[#2c2c2b] rounded-full flex items-center justify-center font-medium">
              {author.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-white font-medium" style={{ fontFamily: '"Poppins", sans-serif' }}>
                {author}
              </p>
              <p style={{ fontFamily: '"Poppins", sans-serif' }}>
                {authorEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span style={{ fontFamily: '"Poppins", sans-serif' }}>
              {format(publishedAt, 'MMM dd, yyyy')}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span style={{ fontFamily: '"Poppins", sans-serif' }}>
              {readingTime} min read
            </span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div
        className="prose prose-invert prose-lg max-w-none"
        style={{ fontFamily: '"Poppins", sans-serif' }}
        dangerouslySetInnerHTML={{
          __html: content || '<p>Start writing your article content...</p>'
        }}
      />
    </div>
  );
}