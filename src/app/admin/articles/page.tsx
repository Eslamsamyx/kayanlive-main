'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { ArticleStatus, ArticleType, UserRole } from '@prisma/client';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Search,
  Eye,
  Edit3,
  Calendar,
  Globe,
  FileText,
  Clock,
  Plus,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Loader2,
  Star,
  Pin,
  Archive,
  RefreshCw,
  Languages,
  User,
  BarChart3
} from 'lucide-react';
import Dropdown, { DropdownOption } from '@/components/ui/Dropdown';
import { useSession } from 'next-auth/react';

type ExtendedArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  locale: string;
  status: ArticleStatus;
  type: ArticleType;
  publishedAt?: Date | null;
  scheduledAt?: Date | null;
  isFeatured: boolean;
  isPinned: boolean;
  readingTime?: number | null;
  viewCount: number;
  shareCount: number;
  allowComments: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  author: {
    id: string;
    name?: string | null;
    email: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  translations: Array<{
    id: string;
    locale: string;
    title: string;
    slug: string;
  }>;
  _count?: {
    comments: number;
    revisions: number;
  };
};

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

type ViewMode = 'articles' | 'analytics';

type BulkAction = 'changeStatus' | 'changeType' | 'toggleFeatured' | 'delete';

interface ArticleAnalytics {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  pendingReview: number;
  totalViews: number;
  totalShares: number;
  avgReadingTime: number;
  byStatus: Record<ArticleStatus, number>;
  byType: Record<ArticleType, number>;
  byLocale: Record<string, number>;
}

const LOCALES = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'ar', label: 'العربية', flag: '🇸🇦' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'ru', label: 'Русский', flag: '🇷🇺' },
];

const STATUS_COLORS = {
  DRAFT: 'bg-gray-500/20 text-gray-400 border-gray-500/20',
  PENDING_REVIEW: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
  APPROVED: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
  PUBLISHED: 'bg-green-500/20 text-green-400 border-green-500/20',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-500/20',
  ARCHIVED: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
};

const TYPE_COLORS = {
  BLOG_POST: 'bg-blue-500/20 text-blue-400',
  NEWS: 'bg-green-500/20 text-green-400',
  CASE_STUDY: 'bg-purple-500/20 text-purple-400',
  SERVICE_PAGE: 'bg-orange-500/20 text-orange-400',
  LANDING_PAGE: 'bg-pink-500/20 text-pink-400',
  ANNOUNCEMENT: 'bg-red-500/20 text-red-400',
};

export default function ArticlesPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [localeFilter, setLocaleFilter] = useState<string>('ALL');
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'publishedAt' | 'title' | 'viewCount'>('createdAt');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('articles');
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<BulkAction>('changeStatus');
  const [bulkActionData, setBulkActionData] = useState<{ status?: ArticleStatus; type?: ArticleType; isFeatured?: boolean }>({});
  const [articleToDelete, setArticleToDelete] = useState<ExtendedArticle | null>(null);

  const { data: session } = useSession();

  // Set document title
  useEffect(() => {
    document.title = 'Articles - KayanLive Admin';
    return () => {
      document.title = 'KayanLive Admin';
    };
  }, []);
  const userRole = session?.user?.role as UserRole;

  const { data: articlesData, refetch } = api.article.getAll.useQuery({
    search: searchTerm || undefined,
    status: statusFilter === 'ALL' ? undefined : (statusFilter as ArticleStatus),
    type: typeFilter === 'ALL' ? undefined : (typeFilter as ArticleType),
    locale: localeFilter === 'ALL' ? undefined : localeFilter as 'en' | 'ar' | 'fr' | 'zh' | 'ru',
    authorId: userRole === 'CONTENT_CREATOR' ? session?.user?.id : undefined,
    page: currentPage,
    limit: 10,
    sortBy,
    sortOrder,
  });

  const { refetch: refetchArticleDetails } = api.article.getById.useQuery(
    { id: selectedArticle! },
    { enabled: !!selectedArticle }
  );

  const { data: analytics } = api.article.getDashboardAnalytics.useQuery(
    { authorId: userRole === 'CONTENT_CREATOR' ? session?.user?.id : undefined },
    { enabled: viewMode === 'analytics' }
  );

  api.useUtils();

  api.article.update.useMutation({
    onSuccess: async () => {
      refetch();
      if (selectedArticle) {
        await refetchArticleDetails();
      }
      addToast('Article updated successfully', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Failed to update article', 'error');
    },
  });

  const changeStatusMutation = api.article.changeStatus.useMutation({
    onSuccess: (updatedArticle) => {
      refetch();
      addToast(`Article status changed to ${updatedArticle.status}`, 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Failed to change status', 'error');
    },
  });

  const deleteArticleMutation = api.article.delete.useMutation({
    onSuccess: () => {
      refetch();
      setArticleToDelete(null);
      setShowDeleteModal(false);
      addToast('Article deleted successfully', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Failed to delete article', 'error');
    },
  });

  const bulkUpdateMutation = api.article.bulkUpdate.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedArticles([]);
      setShowBulkModal(false);
      addToast('Articles updated successfully', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Failed to update articles', 'error');
    },
  });

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(toast => toast.id !== id)), 5000);
  };

  const handleStatusChange = (articleId: string, newStatus: ArticleStatus) => {
    changeStatusMutation.mutate({
      id: articleId,
      status: newStatus,
      publishedAt: newStatus === 'PUBLISHED' ? new Date() : undefined,
    });
  };

  const handleBulkAction = () => {
    if (selectedArticles.length === 0) return;

    const updateData: Record<string, unknown> = {};

    switch (bulkAction) {
      case 'changeStatus':
        if (bulkActionData.status) updateData.status = bulkActionData.status;
        break;
      case 'changeType':
        if (bulkActionData.type) updateData.type = bulkActionData.type;
        break;
      case 'toggleFeatured':
        updateData.isFeatured = bulkActionData.isFeatured;
        break;
    }

    bulkUpdateMutation.mutate({
      ids: selectedArticles,
      data: updateData,
    });
  };

  const handleSelectAll = () => {
    if (selectedArticles.length === (articlesData?.articles.length || 0)) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(articlesData?.articles.map(article => article.id) || []);
    }
  };

  const getStatusOptions = (): DropdownOption[] => {
    const baseOptions = [
      { value: 'ALL', label: 'All Statuses' },
      { value: 'DRAFT', label: 'Draft' },
      { value: 'PENDING_REVIEW', label: 'Pending Review' },
      { value: 'APPROVED', label: 'Approved' },
      { value: 'PUBLISHED', label: 'Published' },
      { value: 'REJECTED', label: 'Rejected' },
      { value: 'ARCHIVED', label: 'Archived' },
    ];

    // Content creators can only see certain statuses
    if (userRole === 'CONTENT_CREATOR') {
      return baseOptions.filter(option =>
        ['ALL', 'DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED'].includes(option.value)
      );
    }

    return baseOptions;
  };

  const getStatusOptionsForArticle = (article: ExtendedArticle): DropdownOption[] => {
    const options: DropdownOption[] = [];

    if (userRole === 'ADMIN') {
      // Admins can change to any status
      options.push(
        { value: 'DRAFT', label: '📝 Set as Draft' },
        { value: 'PENDING_REVIEW', label: '⏳ Send for Review' },
        { value: 'APPROVED', label: '✅ Approve' },
        { value: 'PUBLISHED', label: '🌐 Publish Now' },
        { value: 'REJECTED', label: '❌ Reject' },
        { value: 'ARCHIVED', label: '📦 Archive' }
      );
    } else if (userRole === 'MODERATOR') {
      // Moderators can approve, reject, publish, or archive
      if (article.status === 'PENDING_REVIEW') {
        options.push(
          { value: 'APPROVED', label: '✅ Approve' },
          { value: 'REJECTED', label: '❌ Reject' },
          { value: 'PUBLISHED', label: '🌐 Publish Now' }
        );
      } else if (article.status === 'APPROVED') {
        options.push(
          { value: 'PUBLISHED', label: '🌐 Publish Now' },
          { value: 'REJECTED', label: '❌ Reject' }
        );
      } else if (article.status === 'PUBLISHED') {
        options.push(
          { value: 'ARCHIVED', label: '📦 Archive' }
        );
      } else if (article.status === 'REJECTED') {
        options.push(
          { value: 'PENDING_REVIEW', label: '⏳ Send for Review' },
          { value: 'APPROVED', label: '✅ Approve' }
        );
      }
    } else if (userRole === 'CONTENT_CREATOR' && article.author.id === session?.user?.id) {
      // Content creators can only submit drafts for review
      if (article.status === 'DRAFT') {
        options.push(
          { value: 'PENDING_REVIEW', label: '⏳ Submit for Review' }
        );
      }
    }

    // Filter out current status to avoid confusion
    return options.filter(option => option.value !== article.status);
  };

  const getSortOptions = (): DropdownOption[] => [
    { value: 'createdAt', label: 'Created Date' },
    { value: 'updatedAt', label: 'Updated Date' },
    { value: 'publishedAt', label: 'Published Date' },
    { value: 'title', label: 'Title' },
    { value: 'viewCount', label: 'View Count' },
  ];

  const getTypeOptions = (): DropdownOption[] => [
    { value: 'ALL', label: 'All Types' },
    { value: 'BLOG_POST', label: 'Blog Post' },
    { value: 'NEWS', label: 'News' },
    { value: 'CASE_STUDY', label: 'Case Study' },
    { value: 'SERVICE_PAGE', label: 'Service Page' },
    { value: 'LANDING_PAGE', label: 'Landing Page' },
    { value: 'ANNOUNCEMENT', label: 'Announcement' },
  ];

  const getLocaleOptions = (): DropdownOption[] => [
    { value: 'ALL', label: 'All Languages' },
    ...LOCALES.map(locale => ({
      value: locale.value,
      label: `${locale.flag} ${locale.label}`,
    })),
  ];

  const canEditArticle = (article: ExtendedArticle) => {
    if (userRole === 'ADMIN') return true;
    if (userRole === 'MODERATOR') return true;
    if (userRole === 'CONTENT_CREATOR' && article.author.id === session?.user?.id) {
      return ['DRAFT', 'REJECTED'].includes(article.status);
    }
    return false;
  };


  const canDeleteArticle = (article: ExtendedArticle) => {
    if (userRole === 'ADMIN') return true;
    if (userRole === 'MODERATOR') return article.status !== 'PUBLISHED';
    if (userRole === 'CONTENT_CREATOR' && article.author.id === session?.user?.id) {
      return article.status === 'DRAFT';
    }
    return false;
  };

  const articles = articlesData?.articles || [];
  const totalPages = articlesData?.pages || 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
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
            Articles
          </h1>
          <p className="text-[#888888] text-lg">
            Manage your content across all languages
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'articles' ? 'analytics' : 'articles')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#888888] hover:text-[#7afdd6] transition-colors duration-300"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            {viewMode === 'articles' ? <BarChart3 size={16} /> : <FileText size={16} />}
            {viewMode === 'articles' ? 'Analytics' : 'Articles'}
          </button>

          {userRole !== 'MODERATOR' && (
            <button
              onClick={() => router.push('/admin/articles/new')}
              className="flex items-center gap-2 px-6 py-3 rounded-[15px] font-medium transition-all duration-300"
              style={{
                background: 'linear-gradient(90deg, #7afdd6 0%, #b8a4ff 100%)',
                color: '#2c2c2b',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              <Plus size={16} strokeWidth={2} />
              New Article
            </button>
          )}
        </div>
      </motion.div>

      {viewMode === 'analytics' ? (
        <AnalyticsView analytics={analytics} />
      ) : (
        <>
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col lg:flex-row gap-4"
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#888888]"
              />
              <input
                type="text"
                placeholder="Search articles by title, content, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-[15px] text-white placeholder-[#888888] border-0 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/20"
                style={{
                  background: 'rgba(255, 255, 255, 0.01)',
                  backdropFilter: 'blur(50.5px)',
                  WebkitBackdropFilter: 'blur(50.5px)',
                  fontFamily: '"Poppins", sans-serif'
                }}
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <div className="w-48">
                <Dropdown
                  options={getStatusOptions()}
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  placeholder="Status"
                />
              </div>

              <div className="w-48">
                <Dropdown
                  options={getTypeOptions()}
                  value={typeFilter}
                  onValueChange={setTypeFilter}
                  placeholder="Type"
                />
              </div>

              <div className="w-48">
                <Dropdown
                  options={getLocaleOptions()}
                  value={localeFilter}
                  onValueChange={setLocaleFilter}
                  placeholder="Language"
                />
              </div>

              <div className="w-48">
                <Dropdown
                  options={getSortOptions()}
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as 'createdAt' | 'updatedAt' | 'publishedAt' | 'title' | 'viewCount')}
                  placeholder="Sort by"
                />
              </div>
            </div>
          </motion.div>

          {/* Bulk Actions */}
          {selectedArticles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-between p-4 rounded-[15px]"
              style={{
                background: 'rgba(122, 253, 214, 0.1)',
                border: '1px solid rgba(122, 253, 214, 0.2)'
              }}
            >
              <span className="text-[#7afdd6] font-medium" style={{ fontFamily: '"Poppins", sans-serif' }}>
                {selectedArticles.length} article{selectedArticles.length > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setShowBulkModal(true)}
                className="px-4 py-2 bg-[#7afdd6] text-[#2c2c2b] rounded-[10px] font-medium hover:opacity-80 transition-opacity"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Bulk Actions
              </button>
            </motion.div>
          )}

          {/* Articles Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-[25px] overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)'
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#7afdd6]/20">
                    <th className="text-left p-4">
                      <input
                        type="checkbox"
                        checked={selectedArticles.length === articles.length && articles.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded accent-[#7afdd6]"
                      />
                    </th>
                    <th className="text-left p-4 text-[#7afdd6] font-medium" style={{ fontFamily: '"Poppins", sans-serif' }}>
                      Article
                    </th>
                    <th className="text-left p-4 text-[#7afdd6] font-medium" style={{ fontFamily: '"Poppins", sans-serif' }}>
                      Status
                    </th>
                    <th className="text-left p-4 text-[#7afdd6] font-medium" style={{ fontFamily: '"Poppins", sans-serif' }}>
                      Type
                    </th>
                    <th className="text-left p-4 text-[#7afdd6] font-medium" style={{ fontFamily: '"Poppins", sans-serif' }}>
                      Language
                    </th>
                    <th className="text-left p-4 text-[#7afdd6] font-medium" style={{ fontFamily: '"Poppins", sans-serif' }}>
                      Author
                    </th>
                    <th className="text-left p-4 text-[#7afdd6] font-medium" style={{ fontFamily: '"Poppins", sans-serif' }}>
                      Views
                    </th>
                    <th className="text-left p-4 text-[#7afdd6] font-medium" style={{ fontFamily: '"Poppins", sans-serif' }}>
                      Updated
                    </th>
                    <th className="text-center p-4 text-[#7afdd6] font-medium" style={{ fontFamily: '"Poppins", sans-serif' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article, index) => (
                    <motion.tr
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-[#7afdd6]/10 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedArticles.includes(article.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedArticles(prev => [...prev, article.id]);
                            } else {
                              setSelectedArticles(prev => prev.filter(id => id !== article.id));
                            }
                          }}
                          className="w-4 h-4 rounded accent-[#7afdd6]"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-white text-sm truncate" style={{ fontFamily: '"Poppins", sans-serif' }}>
                                {article.title}
                              </h3>
                              {article.isFeatured && (
                                <Star size={14} className="text-yellow-400 flex-shrink-0" />
                              )}
                              {article.isPinned && (
                                <Pin size={14} className="text-blue-400 flex-shrink-0" />
                              )}
                            </div>
                            {article.excerpt && (
                              <p className="text-xs text-[#888888] truncate" style={{ fontFamily: '"Poppins", sans-serif' }}>
                                {article.excerpt}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-1">
                              {article.readingTime && (
                                <span className="text-xs text-[#888888] flex items-center gap-1">
                                  <Clock size={12} />
                                  {article.readingTime}min
                                </span>
                              )}
                              {article._count && article._count.comments > 0 && (
                                <span className="text-xs text-[#888888]">
                                  {article._count.comments} comments
                                </span>
                              )}
                              {article.translations.length > 1 && (
                                <span className="text-xs text-[#7afdd6] flex items-center gap-1">
                                  <Languages size={12} />
                                  {article.translations.length} langs
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={article.status} />
                          {(userRole === 'ADMIN' || userRole === 'MODERATOR' ||
                            (userRole === 'CONTENT_CREATOR' && article.author.id === session?.user?.id && article.status === 'DRAFT')) && (
                              <Dropdown
                              options={getStatusOptionsForArticle(article)}
                              value={article.status}
                              onValueChange={(newStatus) => handleStatusChange(article.id, newStatus as ArticleStatus)}
                              placeholder="Change Status"
                              size="sm"
                            />
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${TYPE_COLORS[article.type]}`}>
                          {article.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {LOCALES.find(l => l.value === article.locale)?.flag}
                          <span className="text-sm text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                            {LOCALES.find(l => l.value === article.locale)?.label || article.locale}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-[#888888]" />
                          <div>
                            <p className="text-sm text-white font-medium" style={{ fontFamily: '"Poppins", sans-serif' }}>
                              {article.author.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                              {article.author.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Eye size={16} className="text-[#888888]" />
                          <span className="text-sm text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                            {article.viewCount.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-[#888888]" />
                          <div>
                            <p className="text-sm text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                              {format(new Date(article.updatedAt), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-xs text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                              {format(new Date(article.updatedAt), 'HH:mm')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedArticle(article.id)}
                            className="p-2 text-[#888888] hover:text-[#7afdd6] transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>

                          {canEditArticle(article) && (
                            <button
                              onClick={() => router.push(`/admin/articles/${article.id}/edit`)}
                              className="p-2 text-[#888888] hover:text-[#7afdd6] transition-colors"
                              title="Edit Article"
                            >
                              <Edit3 size={16} />
                            </button>
                          )}

                          {canDeleteArticle(article) && (
                            <button
                              onClick={() => {
                                setArticleToDelete(article);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 text-[#888888] hover:text-red-400 transition-colors"
                              title="Delete Article"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-[#7afdd6]/20">
                <p className="text-sm text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm text-[#888888] hover:text-[#7afdd6] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm text-[#888888] hover:text-[#7afdd6] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && articleToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-[25px] max-w-md w-full mx-4"
            style={{
              background: 'rgba(44, 44, 43, 0.95)',
              backdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)'
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-600/20 rounded-[10px]">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-medium text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Delete Article
              </h3>
            </div>

            <p className="text-[#888888] mb-6" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Are you sure you want to delete &quot;{articleToDelete.title}&quot;? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  deleteArticleMutation.mutate({ id: articleToDelete.id });
                }}
                disabled={deleteArticleMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-600 text-white rounded-[10px] font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                {deleteArticleMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setArticleToDelete(null);
                }}
                className="flex-1 py-3 px-4 bg-white/10 text-white rounded-[10px] font-medium hover:bg-white/20 transition-colors"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulkModal && selectedArticles.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-[25px] max-w-md w-full mx-4"
            style={{
              background: 'rgba(44, 44, 43, 0.95)',
              backdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)'
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#7afdd6]/20 rounded-[10px]">
                <RefreshCw className="w-6 h-6 text-[#7afdd6]" />
              </div>
              <h3 className="text-xl font-medium text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Bulk Actions
              </h3>
            </div>

            <p className="text-[#888888] mb-6" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Apply bulk action to {selectedArticles.length} selected article{selectedArticles.length > 1 ? 's' : ''}
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-[#888888] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Action Type
                </label>
                <Dropdown
                  options={[
                    { value: 'changeStatus', label: 'Change Status' },
                    { value: 'changeType', label: 'Change Type' },
                    { value: 'toggleFeatured', label: 'Toggle Featured' },
                  ]}
                  value={bulkAction}
                  onValueChange={(value) => setBulkAction(value as BulkAction)}
                  placeholder="Select Action"
                />
              </div>

              {bulkAction === 'changeStatus' && (
                <div>
                  <label className="block text-sm text-[#888888] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    New Status
                  </label>
                  <Dropdown
                    options={getStatusOptions().filter(opt => opt.value !== 'ALL')}
                    value={bulkActionData.status || ''}
                    onValueChange={(value) => setBulkActionData(prev => ({ ...prev, status: value as ArticleStatus }))}
                    placeholder="Select Status"
                  />
                </div>
              )}

              {bulkAction === 'changeType' && (
                <div>
                  <label className="block text-sm text-[#888888] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    New Type
                  </label>
                  <Dropdown
                    options={getTypeOptions().filter(opt => opt.value !== 'ALL')}
                    value={bulkActionData.type || ''}
                    onValueChange={(value) => setBulkActionData(prev => ({ ...prev, type: value as ArticleType }))}
                    placeholder="Select Type"
                  />
                </div>
              )}

              {bulkAction === 'toggleFeatured' && (
                <div>
                  <label className="block text-sm text-[#888888] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    Featured Status
                  </label>
                  <Dropdown
                    options={[
                      { value: 'true', label: 'Make Featured' },
                      { value: 'false', label: 'Remove Featured' },
                    ]}
                    value={bulkActionData.isFeatured?.toString() || ''}
                    onValueChange={(value) => setBulkActionData(prev => ({ ...prev, isFeatured: value === 'true' }))}
                    placeholder="Select Featured Status"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBulkAction}
                disabled={bulkUpdateMutation.isPending || !bulkActionData.status && !bulkActionData.type && bulkActionData.isFeatured === undefined}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#7afdd6] text-[#2c2c2b] rounded-[10px] font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                {bulkUpdateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Apply
              </button>
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkActionData({});
                }}
                className="flex-1 py-3 px-4 bg-white/10 text-white rounded-[10px] font-medium hover:bg-white/20 transition-colors"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

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

function StatusBadge({ status }: { status: ArticleStatus }) {
  const getStatusIcon = () => {
    switch (status) {
      case 'DRAFT':
        return <Edit3 size={12} />;
      case 'PENDING_REVIEW':
        return <Clock size={12} />;
      case 'APPROVED':
        return <Check size={12} />;
      case 'PUBLISHED':
        return <Globe size={12} />;
      case 'REJECTED':
        return <X size={12} />;
      case 'ARCHIVED':
        return <Archive size={12} />;
      default:
        return <Edit3 size={12} />;
    }
  };

  const getStatusTooltip = () => {
    switch (status) {
      case 'DRAFT':
        return 'Article is being written';
      case 'PENDING_REVIEW':
        return 'Waiting for moderator review';
      case 'APPROVED':
        return 'Approved and ready to publish';
      case 'PUBLISHED':
        return 'Live on the website';
      case 'REJECTED':
        return 'Rejected and needs revision';
      case 'ARCHIVED':
        return 'Archived and not visible';
      default:
        return status;
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full border ${STATUS_COLORS[status]}`}
      title={getStatusTooltip()}
    >
      {getStatusIcon()}
      <span>{status.replace('_', ' ')}</span>
    </div>
  );
}


function AnalyticsView({ analytics }: { analytics: ArticleAnalytics | undefined }) {
  if (!analytics) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-64"
      >
        <Loader2 className="w-8 h-8 animate-spin text-[#7afdd6]" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Articles"
          value={analytics.totalArticles}
          icon={<FileText size={24} />}
          gradient="from-[#7afdd6] to-[#b8a4ff]"
        />
        <StatCard
          title="Published"
          value={analytics.publishedArticles}
          icon={<Check size={24} />}
          gradient="from-[#b8a4ff] to-[#7afdd6]"
        />
        <StatCard
          title="Total Views"
          value={analytics.totalViews}
          icon={<Eye size={24} />}
          gradient="from-[#7afdd6] to-[#A095E1]"
        />
        <StatCard
          title="Avg Reading Time"
          value={`${analytics.avgReadingTime}min`}
          icon={<Clock size={24} />}
          gradient="from-[#A095E1] to-[#7afdd6]"
        />
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BreakdownCard
          title="By Status"
          data={Object.entries(analytics.byStatus).map(([status, count]) => ({
            name: status.replace('_', ' '),
            value: count,
            color: STATUS_COLORS[status as ArticleStatus]?.split(' ')[0] || 'bg-gray-500/20'
          }))}
          total={analytics.totalArticles}
        />

        <BreakdownCard
          title="By Language"
          data={Object.entries(analytics.byLocale).map(([locale, count]) => ({
            name: LOCALES.find(l => l.value === locale)?.label || locale,
            value: count,
            color: 'bg-blue-500/20'
          }))}
          total={analytics.totalArticles}
        />
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon, gradient }: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div
      className="rounded-[25px] p-6"
      style={{
        background: 'rgba(255, 255, 255, 0.01)',
        backdropFilter: 'blur(50.5px)',
        WebkitBackdropFilter: 'blur(50.5px)',
        border: '1px solid rgba(122, 253, 214, 0.2)'
      }}
    >
      <div className="flex items-center justify-between">
        <div className={`bg-gradient-to-r ${gradient} text-[#2c2c2b] p-3 rounded-[15px]`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
            {title}
          </p>
          <p className="text-2xl font-bold text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function BreakdownCard({ title, data, total }: {
  title: string;
  data: Array<{ name: string; value: number; color: string }>;
  total: number;
}) {
  return (
    <div
      className="rounded-[25px] p-6"
      style={{
        background: 'rgba(255, 255, 255, 0.01)',
        backdropFilter: 'blur(50.5px)',
        WebkitBackdropFilter: 'blur(50.5px)',
        border: '2px solid rgba(122, 253, 214, 0.3)'
      }}
    >
      <h3 className="text-lg font-medium text-[#7afdd6] mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
        {title}
      </h3>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <span className="text-sm font-medium text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
              {item.name}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                {item.value}
              </span>
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${item.color} text-white`}>
                {total > 0 ? Math.round((item.value / total) * 100) : 0}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}