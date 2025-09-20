'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { api } from '@/trpc/react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, notFound } from 'next/navigation';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Eye,
  Tag,
  ChevronRight,
  Star,
  Pin,
  User,
  ArrowRight,
  FolderOpen
} from 'lucide-react';
import { format } from 'date-fns';
import Head from 'next/head';
import { ArticleType } from '@prisma/client';

const LOCALES = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'ar', label: 'العربية', flag: '🇸🇦' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'ru', label: 'Русский', flag: '🇷🇺' },
];

const TYPE_COLORS = {
  BLOG_POST: 'bg-blue-500/20 text-blue-400',
  NEWS: 'bg-green-500/20 text-green-400',
  CASE_STUDY: 'bg-purple-500/20 text-purple-400',
  SERVICE_PAGE: 'bg-orange-500/20 text-orange-400',
  LANDING_PAGE: 'bg-pink-500/20 text-pink-400',
  ANNOUNCEMENT: 'bg-red-500/20 text-red-400',
};

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    locale: string;
    isFeatured: boolean;
    isPinned: boolean;
    readingTime?: number | null;
    viewCount: number;
    publishedAt?: Date | null;
    featuredImage?: string | null;
    featuredImageAlt?: string | null;
    type: ArticleType;
    author: {
      name?: string | null;
      email: string;
    };
    tags: Array<{
      tag: {
        id: string;
        name: string;
        slug: string;
      };
    }>;
  };
  locale: string;
  t: ReturnType<typeof useTranslations>;
}

function ArticleCard({ article, locale, t }: ArticleCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative overflow-hidden rounded-[25px] transition-all duration-500 hover:scale-[1.02]"
      style={{
        background: 'rgba(255, 255, 255, 0.01)',
        backdropFilter: 'blur(50.5px)',
        WebkitBackdropFilter: 'blur(50.5px)',
        border: '1px solid rgba(122, 253, 214, 0.2)'
      }}
    >
      {/* Featured Image */}
      {article.featuredImage && (
        <div className="relative h-48 overflow-hidden rounded-t-[25px]">
          <Image
            src={article.featuredImage}
            alt={article.featuredImageAlt || article.title}
            width={400}
            height={192}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Article Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {article.isPinned && (
              <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-[#7afdd6] text-[#2c2c2b] rounded-full">
                <Pin size={12} />
                Pinned
              </span>
            )}
            {article.isFeatured && (
              <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-[#b8a4ff] text-[#2c2c2b] rounded-full">
                <Star size={12} />
                Featured
              </span>
            )}
          </div>

          {/* Article Type */}
          <div className="absolute top-4 right-4">
            <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${TYPE_COLORS[article.type]}`}>
              {t(`types.${article.type.toLowerCase().replace('_', '')}`)}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Reading Time & Views */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {article.readingTime && (
              <span className="flex items-center gap-1 text-xs text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                <Clock size={12} />
                {article.readingTime} {t('listing.readingTime')}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 text-xs text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
            <Eye size={12} />
            {article.viewCount.toLocaleString()}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-[#7afdd6] transition-colors"
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          {article.title}
        </h2>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-[#888888] text-sm mb-4 line-clamp-3" style={{ fontFamily: '"Poppins", sans-serif' }}>
            {article.excerpt}
          </p>
        )}

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.slice(0, 3).map(({ tag }) => (
              <Link
                key={tag.id}
                href={`/${locale}/articles/tag/${tag.slug}`}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-[#888888] hover:text-[#7afdd6] transition-colors"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                <Tag size={10} />
                {tag.name}
              </Link>
            ))}
            {article.tags.length > 3 && (
              <span className="text-xs text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                +{article.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User size={14} className="text-[#888888]" />
            <span className="text-sm text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
              {t('listing.by')} {article.author.name || 'Anonymous'}
            </span>
          </div>
          {article.publishedAt && (
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-[#888888]" />
              <span className="text-sm text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                {format(new Date(article.publishedAt), 'MMM dd, yyyy')}
              </span>
            </div>
          )}
        </div>

        {/* Read More Link */}
        <Link
          href={`/${locale}/articles/${article.slug}`}
          className="absolute inset-0 z-10"
          aria-label={`Read article: ${article.title}`}
        />
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 border border-[#7afdd6]/0 group-hover:border-[#7afdd6]/50 transition-all duration-300 rounded-[25px] pointer-events-none" />
    </motion.article>
  );
}

export default function CategoryPage() {
  const params = useParams();
  const locale = (params?.locale as 'en' | 'ar' | 'fr' | 'zh' | 'ru') || 'en';
  const categorySlug = params?.slug as string;
  const t = useTranslations('articles');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'mostViewed'>('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch all categories to find the current one by slug
  const { data: allCategories } = api.article.getCategories.useQuery();
  const category = allCategories?.find(cat => cat.slug === categorySlug);

  // Fetch articles in this category
  const { data: articlesData, isLoading } = api.article.getAll.useQuery({
    locale,
    categoryId: category?.id,
    status: 'PUBLISHED',
    search: searchTerm || undefined,
    type: selectedType ? (selectedType as ArticleType) : undefined,
    sortBy: sortBy === 'latest' ? 'publishedAt' : sortBy === 'oldest' ? 'publishedAt' : 'viewCount',
    sortOrder: sortBy === 'oldest' ? 'asc' : 'desc',
    page: currentPage,
    limit: 12,
  }, {
    enabled: !!category?.id,
  });

  if (!category) {
    notFound();
  }

  const articles = articlesData?.articles || [];
  const totalPages = articlesData?.pages || 1;
  const hasNextPage = currentPage < totalPages;

  const loadMore = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSortBy('latest');
    setCurrentPage(1);
  };

  // Get current locale info
  const currentLocale = LOCALES.find(l => l.value === locale) || LOCALES[0];

  return (
    <>
      <Head>
        <title>{`${category.name} Articles`} | KayanLive</title>
        <meta name="description" content={`Explore articles in ${category.name} category from KayanLive`} />
        <meta property="og:title" content={`${category.name} Articles`} />
        <meta property="og:description" content={`Explore articles in ${category.name} category from KayanLive`} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`https://kayanlive.com/${locale}/articles/category/${categorySlug}`} />
      </Head>

      <div className="min-h-screen bg-[#2c2c2b] relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <div className="absolute top-4 right-4 w-3 h-3 bg-[#7afdd6] rounded-full"></div>
          <div className="absolute top-8 right-12 w-2 h-2 bg-[#b8a4ff] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <nav className="flex items-center gap-2 text-sm text-[#888888] mb-6" style={{ fontFamily: '"Poppins", sans-serif' }}>
              <Link href={`/${locale}`} className="hover:text-[#7afdd6] transition-colors">
                Home
              </Link>
              <ChevronRight size={16} />
              <Link href={`/${locale}/articles`} className="hover:text-[#7afdd6] transition-colors">
                Articles
              </Link>
              <ChevronRight size={16} />
              <span className="text-[#7afdd6]">{category.name}</span>
            </nav>
          </motion.div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 rounded-[15px]" style={{ background: 'linear-gradient(90deg, #7afdd6 0%, #b8a4ff 100%)' }}>
                <FolderOpen size={32} className="text-[#2c2c2b]" />
              </div>
            </div>

            <h1
              className="text-4xl md:text-6xl font-normal mb-6"
              style={{
                background: 'linear-gradient(90deg, #b8a4ff 0%, #7afdd6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: '"Poppins", sans-serif',
                lineHeight: '1.1'
              }}
            >
              {category.name}
            </h1>


            <div className="flex items-center justify-center gap-6 text-sm text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentLocale.flag}</span>
                <span className="text-[#7afdd6] font-medium">{currentLocale.label}</span>
              </div>
              <div className="h-4 w-px bg-[#888888]"></div>
              <span>
                {articlesData?.total || 0} {t('categories.articlesInCategory')}
              </span>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#888888]" />
                <input
                  type="text"
                  placeholder={t('listing.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-[15px] text-white placeholder-[#888888] border-0 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/20"
                  style={{
                    background: 'rgba(255, 255, 255, 0.01)',
                    backdropFilter: 'blur(50.5px)',
                    WebkitBackdropFilter: 'blur(50.5px)',
                    border: '1px solid rgba(122, 253, 214, 0.2)',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-3 rounded-[15px] font-medium transition-all duration-300 border"
                style={{
                  background: showFilters ? 'rgba(122, 253, 214, 0.1)' : 'rgba(255, 255, 255, 0.01)',
                  backdropFilter: 'blur(50.5px)',
                  WebkitBackdropFilter: 'blur(50.5px)',
                  borderColor: showFilters ? 'rgba(122, 253, 214, 0.5)' : 'rgba(122, 253, 214, 0.2)',
                  color: showFilters ? '#7afdd6' : '#888888',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                <Filter size={20} />
                Filters
              </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-[20px] mb-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.01)',
                  backdropFilter: 'blur(50.5px)',
                  WebkitBackdropFilter: 'blur(50.5px)',
                  border: '1px solid rgba(122, 253, 214, 0.2)'
                }}
              >
                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-[#7afdd6] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    {t('filters.allTypes')}
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full p-3 rounded-[10px] bg-white/10 text-white border border-[#7afdd6]/20 focus:border-[#7afdd6] focus:outline-none"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    <option value="">{t('filters.allTypes')}</option>
                    <option value="BLOG_POST" className="bg-[#2c2c2b]">{t('types.blogPost')}</option>
                    <option value="NEWS" className="bg-[#2c2c2b]">{t('types.news')}</option>
                    <option value="CASE_STUDY" className="bg-[#2c2c2b]">{t('types.caseStudy')}</option>
                    <option value="ANNOUNCEMENT" className="bg-[#2c2c2b]">{t('types.announcement')}</option>
                  </select>
                </div>

                {/* Sort Filter */}
                <div>
                  <label className="block text-sm font-medium text-[#7afdd6] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    {t('filters.sortBy')}
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'latest' | 'oldest' | 'mostViewed')}
                    className="w-full p-3 rounded-[10px] bg-white/10 text-white border border-[#7afdd6]/20 focus:border-[#7afdd6] focus:outline-none"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    <option value="latest" className="bg-[#2c2c2b]">{t('filters.latest')}</option>
                    <option value="oldest" className="bg-[#2c2c2b]">{t('filters.oldest')}</option>
                    <option value="mostViewed" className="bg-[#2c2c2b]">{t('filters.mostViewed')}</option>
                  </select>
                </div>

                {/* Reset Filters */}
                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="w-full px-4 py-3 bg-[#7afdd6] text-[#2c2c2b] rounded-[10px] font-medium hover:opacity-80 transition-opacity"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    Reset Filters
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Articles Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-96 rounded-[25px] animate-pulse"
                    style={{
                      background: 'rgba(255, 255, 255, 0.01)',
                      backdropFilter: 'blur(50.5px)',
                      border: '1px solid rgba(122, 253, 214, 0.2)'
                    }}
                  />
                ))}
              </div>
            ) : articles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} locale={locale} t={t} />
                  ))}
                </div>

                {/* Load More */}
                {hasNextPage && (
                  <div className="text-center mt-12">
                    <button
                      onClick={loadMore}
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-[15px] font-medium transition-all duration-300"
                      style={{
                        background: 'linear-gradient(90deg, #7afdd6 0%, #b8a4ff 100%)',
                        color: '#2c2c2b',
                        fontFamily: '"Poppins", sans-serif'
                      }}
                    >
                      {t('listing.loadMore')}
                      <ArrowRight size={20} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="mb-6">
                  <FolderOpen size={64} className="mx-auto text-[#888888] opacity-50" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  {t('listing.noResults')}
                </h3>
                <p className="text-[#888888] mb-8" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  No articles found in this category with the current filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-3 bg-[#7afdd6] text-[#2c2c2b] rounded-[15px] font-medium hover:opacity-80 transition-opacity"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </>
  );
}