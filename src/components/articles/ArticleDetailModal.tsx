'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  X,
  Eye,
  Calendar,
  User,
  Tag,
  Globe,
  Clock,
  MessageCircle,
  TrendingUp,
  Share2,
  Edit3,
  CheckCircle,
  FileText,
  Languages,
  BarChart3,
  History,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import type { ArticleStatus, ArticleType } from '@prisma/client';

interface ArticleDetailModalProps {
  article: {
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
  isOpen: boolean;
  onClose: () => void;
}

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

const LOCALES = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'ar', label: 'العربية', flag: '🇸🇦' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'ru', label: 'Русский', flag: '🇷🇺' },
];

export function ArticleDetailModal({ article, isOpen, onClose }: ArticleDetailModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const localeInfo = LOCALES.find(l => l.value === article.locale);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
            style={{ backdropFilter: 'blur(4px)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[600px] lg:w-[700px] z-50 overflow-y-auto"
            style={{
              background: 'rgba(44, 44, 43, 0.98)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              borderLeft: '2px solid rgba(122, 253, 214, 0.3)',
            }}
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full border ${STATUS_COLORS[article.status]}`}>
                      {article.status.replace('_', ' ')}
                    </span>
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${TYPE_COLORS[article.type]}`}>
                      {article.type.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-[#888888] text-sm leading-relaxed" style={{ fontFamily: '"Poppins", sans-serif' }}>
                      {article.excerpt}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-[#888888] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Meta Information Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Author */}
                <div
                  className="p-4 rounded-[15px]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(122, 253, 214, 0.2)',
                  }}
                >
                  <div className="flex items-center gap-2 text-[#7afdd6] mb-2">
                    <User size={16} />
                    <span className="text-xs font-medium">Author</span>
                  </div>
                  <p className="text-white text-sm font-medium">{article.author.name || 'Unknown'}</p>
                  <p className="text-[#888888] text-xs">{article.author.email}</p>
                </div>

                {/* Language */}
                <div
                  className="p-4 rounded-[15px]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(122, 253, 214, 0.2)',
                  }}
                >
                  <div className="flex items-center gap-2 text-[#7afdd6] mb-2">
                    <Globe size={16} />
                    <span className="text-xs font-medium">Language</span>
                  </div>
                  <p className="text-white text-sm font-medium">
                    {localeInfo?.flag} {localeInfo?.label || article.locale}
                  </p>
                </div>

                {/* Views */}
                <div
                  className="p-4 rounded-[15px]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(122, 253, 214, 0.2)',
                  }}
                >
                  <div className="flex items-center gap-2 text-[#7afdd6] mb-2">
                    <Eye size={16} />
                    <span className="text-xs font-medium">Views</span>
                  </div>
                  <p className="text-white text-xl font-bold">{article.viewCount.toLocaleString()}</p>
                </div>

                {/* Shares */}
                <div
                  className="p-4 rounded-[15px]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(122, 253, 214, 0.2)',
                  }}
                >
                  <div className="flex items-center gap-2 text-[#7afdd6] mb-2">
                    <Share2 size={16} />
                    <span className="text-xs font-medium">Shares</span>
                  </div>
                  <p className="text-white text-xl font-bold">{article.shareCount.toLocaleString()}</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-3">
                {article.readingTime && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock size={16} className="text-[#7afdd6]" />
                    <span className="text-[#888888]">Reading Time:</span>
                    <span className="text-white font-medium">{article.readingTime} min</span>
                  </div>
                )}

                {article._count && article._count.comments > 0 && (
                  <div className="flex items-center gap-3 text-sm">
                    <MessageCircle size={16} className="text-[#7afdd6]" />
                    <span className="text-[#888888]">Comments:</span>
                    <span className="text-white font-medium">{article._count.comments}</span>
                  </div>
                )}

                {article._count && article._count.revisions > 0 && (
                  <div className="flex items-center gap-3 text-sm">
                    <History size={16} className="text-[#7afdd6]" />
                    <span className="text-[#888888]">Revisions:</span>
                    <span className="text-white font-medium">{article._count.revisions}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="text-[#7afdd6]" />
                  <span className="text-[#888888]">Created:</span>
                  <span className="text-white font-medium">
                    {format(new Date(article.createdAt), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Edit3 size={16} className="text-[#7afdd6]" />
                  <span className="text-[#888888]">Last Updated:</span>
                  <span className="text-white font-medium">
                    {format(new Date(article.updatedAt), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>

                {article.publishedAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle size={16} className="text-[#7afdd6]" />
                    <span className="text-[#888888]">Published:</span>
                    <span className="text-white font-medium">
                      {format(new Date(article.publishedAt), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                )}
              </div>

              {/* Category */}
              {article.category && (
                <div>
                  <h3 className="text-sm font-medium text-[#7afdd6] mb-2 flex items-center gap-2">
                    <FileText size={16} />
                    Category
                  </h3>
                  <span className="inline-block px-3 py-1 bg-[#7afdd6]/10 text-[#7afdd6] rounded-full text-sm">
                    {article.category.name}
                  </span>
                </div>
              )}

              {/* Tags */}
              {article.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-[#7afdd6] mb-2 flex items-center gap-2">
                    <Tag size={16} />
                    Tags ({article.tags.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map(({ tag }) => (
                      <span
                        key={tag.id}
                        className="px-3 py-1 bg-white/5 text-white rounded-full text-xs border border-white/10"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Translations */}
              <div>
                <h3 className="text-sm font-medium text-[#7afdd6] mb-3 flex items-center gap-2">
                  <Languages size={16} />
                  Translations ({article.translations.length})
                </h3>

                {article.translations.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {article.translations.map((translation) => {
                      const locale = LOCALES.find(l => l.value === translation.locale);
                      return (
                        <div
                          key={translation.id}
                          className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-[#7afdd6]/30 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <span className="text-xl">{locale?.flag}</span>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-white">{translation.title}</p>
                                <p className="text-xs text-[#888888]">{locale?.label || translation.locale}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  router.push(`/admin/articles/${article.id}/translate?translationId=${translation.id}`);
                                }}
                                className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                                style={{
                                  background: 'rgba(34, 197, 94, 0.15)',
                                  border: '1px solid rgba(34, 197, 94, 0.3)',
                                }}
                                title="Edit translation"
                              >
                                <Edit3 size={14} className="text-green-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add Translation Button */}
                <button
                  onClick={() => {
                    router.push(`/admin/articles/${article.id}/translate`);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: 'rgba(122, 253, 214, 0.1)',
                    border: '1.5px dashed rgba(122, 253, 214, 0.4)',
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  <Plus size={18} className="text-[#7afdd6]" />
                  <span className="text-[#7afdd6] font-medium text-sm">Add New Translation</span>
                </button>
              </div>

              {/* Content Preview */}
              <div>
                <h3 className="text-sm font-medium text-[#7afdd6] mb-3 flex items-center gap-2">
                  <FileText size={16} />
                  Content Preview
                </h3>
                <div
                  className="p-4 rounded-[15px] max-h-64 overflow-y-auto"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(122, 253, 214, 0.2)',
                  }}
                >
                  <div
                    className="text-sm text-[#888888] leading-relaxed prose prose-sm prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: article.content.substring(0, 500) + '...' }}
                  />
                </div>
              </div>

              {/* Flags */}
              <div className="flex flex-wrap gap-3">
                {article.isFeatured && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                    ⭐ Featured
                  </span>
                )}
                {article.isPinned && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                    📌 Pinned
                  </span>
                )}
                {article.allowComments && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                    💬 Comments Enabled
                  </span>
                )}
              </div>

              {/* Slug */}
              <div>
                <h3 className="text-sm font-medium text-[#7afdd6] mb-2">Slug</h3>
                <code className="block px-3 py-2 bg-black/30 text-white rounded-lg text-xs font-mono">
                  /{article.locale}/{article.slug}
                </code>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
