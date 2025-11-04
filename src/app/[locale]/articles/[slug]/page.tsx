'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { api } from '@/trpc/react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, notFound } from 'next/navigation';
import {
  Calendar,
  Clock,
  Eye,
  Tag,
  User,
  ArrowLeft,
  Share2,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  ChevronRight,
  Star,
  Pin,
} from 'lucide-react';
import { format } from 'date-fns';
import Head from 'next/head';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { TranslationBanner } from '@/components/translations/TranslationBanner';

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

export default function ArticlePage() {
  const params = useParams();
  const locale = (params?.locale as 'en' | 'ar' | 'fr' | 'zh' | 'ru') || 'en';
  const slug = params?.slug as string;
  const t = useTranslations('articles');

  const [shareDropdownOpen, setShareDropdownOpen] = useState(false);
  const [copyLinkSuccess, setCopyLinkSuccess] = useState(false);

  // Fetch the article
  const { data: article, isLoading, error } = api.article.getBySlug.useQuery({
    slug,
    locale,
  });

  // Fetch hreflang links for SEO
  const { data: hreflangData } = api.article.getHreflangLinks.useQuery(
    { articleId: article?.id || '' },
    {
      enabled: !!article?.id,
      refetchOnWindowFocus: false,
    }
  );

  // Fetch related articles
  const { data: relatedArticlesData } = api.article.getAll.useQuery({
    locale,
    categoryId: article?.category?.id,
    status: 'PUBLISHED',
    limit: 6, // Get more to allow for filtering
  }, {
    enabled: !!article?.category?.id && !!article?.id,
  });

  // Filter out current article and limit to 3
  const relatedArticles = relatedArticlesData?.articles
    .filter(relatedArticle => relatedArticle.id !== article?.id)
    .slice(0, 3);

  // Article navigation - can be implemented later

  // View tracking is handled by getBySlug endpoint automatically

  // Handle copy link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyLinkSuccess(true);
      setTimeout(() => setCopyLinkSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Handle social share
  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(article?.title || '');

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    setShareDropdownOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#2c2c2b] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#7afdd6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Loading article...
          </p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    notFound();
  }

  // Get current locale info
  const currentLocale = LOCALES.find(l => l.value === locale) || LOCALES[0];
  const articleUrl = `https://kayanlive.com/${locale}/articles/${slug}`;

  return (
    <>
      <Head>
        <title>{article.metaTitle || article.title} | KayanLive</title>
        <meta name="description" content={article.metaDescription || article.excerpt || ''} />
        <meta name="keywords" content={article.metaKeywords || ''} />

        {/* Open Graph */}
        <meta property="og:title" content={article.ogTitle || article.title} />
        <meta property="og:description" content={article.ogDescription || article.excerpt || ''} />
        <meta property="og:image" content={article.ogImage || article.featuredImage || ''} />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={article.publishedAt ? new Date(article.publishedAt).toISOString() : ''} />
        <meta property="article:modified_time" content={new Date(article.updatedAt).toISOString()} />
        <meta property="article:author" content={article.author.name || 'KayanLive'} />
        <meta property="article:section" content={article.category?.name || ''} />
        {article.tags.map(({ tag }) => (
          <meta key={tag.id} property="article:tag" content={tag.name} />
        ))}

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.twitterTitle || article.title} />
        <meta name="twitter:description" content={article.twitterDescription || article.excerpt || ''} />
        <meta name="twitter:image" content={article.twitterImage || article.featuredImage || ''} />

        {/* Canonical URL */}
        <link rel="canonical" href={article.canonicalUrl || articleUrl} />

        {/* Hreflang Links for SEO */}
        {hreflangData?.links.map((link) => (
          <link
            key={link.locale}
            rel="alternate"
            hrefLang={link.locale}
            href={`https://kayanlive.com${link.href}`}
          />
        ))}
        {hreflangData?.xDefault && (
          <link
            rel="alternate"
            hrefLang="x-default"
            href={`https://kayanlive.com${hreflangData.xDefault}`}
          />
        )}

        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: article.title,
              description: article.excerpt,
              image: article.featuredImage,
              datePublished: article.publishedAt,
              dateModified: article.updatedAt,
              author: {
                '@type': 'Person',
                name: article.author.name || 'KayanLive',
              },
              publisher: {
                '@type': 'Organization',
                name: 'KayanLive',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://kayanlive.com/logo.png',
                },
              },
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': articleUrl,
              },
            }),
          }}
        />
      </Head>

      <div className="min-h-screen bg-[#2c2c2b] relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <div className="absolute top-4 right-4 w-3 h-3 bg-[#7afdd6] rounded-full"></div>
          <div className="absolute top-8 right-12 w-2 h-2 bg-[#b8a4ff] rounded-full"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
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
              {article.category && (
                <>
                  <ChevronRight size={16} />
                  <Link
                    href={`/${locale}/articles/category/${article.category.slug}`}
                    className="hover:text-[#7afdd6] transition-colors"
                  >
                    {article.category.name}
                  </Link>
                </>
              )}
              <ChevronRight size={16} />
              <span className="text-[#7afdd6] truncate">{article.title}</span>
            </nav>

            <Link
              href={`/${locale}/articles`}
              className="inline-flex items-center gap-2 text-[#888888] hover:text-[#7afdd6] transition-colors"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              <ArrowLeft size={20} />
              {t('single.backToArticles')}
            </Link>
          </motion.div>

          {/* Article Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            {/* Article Badges */}
            <div className="flex items-center gap-3 mb-6">
              <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${TYPE_COLORS[article.type]}`}>
                {t(`types.${article.type.toLowerCase().replace('_', '')}`)}
              </span>
              {article.isPinned && (
                <span className="flex items-center gap-1 px-3 py-1 text-sm font-medium bg-[#7afdd6] text-[#2c2c2b] rounded-full">
                  <Pin size={14} />
                  Pinned
                </span>
              )}
              {article.isFeatured && (
                <span className="flex items-center gap-1 px-3 py-1 text-sm font-medium bg-[#b8a4ff] text-[#2c2c2b] rounded-full">
                  <Star size={14} />
                  Featured
                </span>
              )}
            </div>

            {/* Title */}
            <h1
              className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-xl text-[#888888] mb-8 leading-relaxed" style={{ fontFamily: '"Poppins", sans-serif' }}>
                {article.excerpt}
              </p>
            )}

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <User size={16} className="text-[#888888]" />
                <span className="text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  {t('listing.by')} <span className="text-white font-medium">{article.author.name || 'Anonymous'}</span>
                </span>
              </div>

              {article.publishedAt && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-[#888888]" />
                  <span className="text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    {t('listing.publishedOn')} <span className="text-white">{format(new Date(article.publishedAt), 'MMMM dd, yyyy')}</span>
                  </span>
                </div>
              )}

              {article.readingTime && (
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[#888888]" />
                  <span className="text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    {article.readingTime} {t('listing.readingTime')}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Eye size={16} className="text-[#888888]" />
                <span className="text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  {article.viewCount.toLocaleString()} views
                </span>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShareDropdownOpen(!shareDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#7afdd6] text-[#2c2c2b] rounded-[10px] font-medium hover:opacity-80 transition-opacity"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  <Share2 size={16} />
                  {t('single.shareArticle')}
                </button>

                {shareDropdownOpen && (
                  <div
                    className="absolute top-full left-0 mt-2 w-48 py-2 rounded-[15px] z-50"
                    style={{
                      background: 'rgba(44, 44, 43, 0.95)',
                      backdropFilter: 'blur(50.5px)',
                      border: '1px solid rgba(122, 253, 214, 0.3)'
                    }}
                  >
                    <button
                      onClick={() => handleShare('facebook')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-white hover:bg-white/10 transition-colors"
                      style={{ fontFamily: '"Poppins", sans-serif' }}
                    >
                      <Facebook size={16} />
                      Facebook
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-white hover:bg-white/10 transition-colors"
                      style={{ fontFamily: '"Poppins", sans-serif' }}
                    >
                      <Twitter size={16} />
                      Twitter
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-white hover:bg-white/10 transition-colors"
                      style={{ fontFamily: '"Poppins", sans-serif' }}
                    >
                      <Linkedin size={16} />
                      LinkedIn
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-3 px-4 py-2 text-white hover:bg-white/10 transition-colors"
                      style={{ fontFamily: '"Poppins", sans-serif' }}
                    >
                      <Copy size={16} />
                      {copyLinkSuccess ? t('single.linkCopied') : t('single.copyLink')}
                    </button>
                  </div>
                )}
              </div>

              {/* Language Switcher */}
              <LanguageSwitcher
                currentLocale={locale}
                currentSlug={slug}
                articleId={article.id}
                translations={article.translations}
                mainArticleLocale={article.locale}
              />
            </div>
          </motion.header>

          {/* Translation Banner - show when viewing fallback content */}
          {article._meta?.isFallback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <TranslationBanner
                requestedLocale={article._meta.requestedLocale}
                actualLocale={article._meta.actualLocale}
                isFallback={article._meta.isFallback}
                articleId={article.id}
              />
            </motion.div>
          )}

          {/* Featured Image */}
          {article.featuredImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-12"
            >
              <div className="relative overflow-hidden rounded-[25px]">
                <Image
                  src={article.featuredImage}
                  alt={article.featuredImageAlt || article.title}
                  width={800}
                  height={400}
                  className="w-full h-auto"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
            </motion.div>
          )}

          {/* Article Content */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="prose prose-invert prose-xl max-w-none mb-12"
          >
            <div
              className="text-white leading-relaxed"
              style={{ fontFamily: '"Poppins", sans-serif' }}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </motion.article>

          {/* Tags */}
          {article.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-12"
            >
              <h3 className="text-lg font-medium text-[#7afdd6] mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
                {t('listing.tagged')}
              </h3>
              <div className="flex flex-wrap gap-3">
                {article.tags.map(({ tag }) => (
                  <Link
                    key={tag.id}
                    href={`/${locale}/articles/tag/${tag.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white hover:bg-[#7afdd6]/20 hover:text-[#7afdd6] transition-all duration-300 rounded-[10px]"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    <Tag size={14} />
                    {tag.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Additional Content Section */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {relatedArticles && relatedArticles.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h3 className="text-2xl font-bold text-[#7afdd6] mb-8" style={{ fontFamily: '"Poppins", sans-serif' }}>
                {t('listing.relatedArticles')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <Link
                    key={relatedArticle.id}
                    href={`/${locale}/articles/${relatedArticle.slug}`}
                    className="group block p-6 rounded-[20px] transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background: 'rgba(255, 255, 255, 0.01)',
                      backdropFilter: 'blur(50.5px)',
                      border: '1px solid rgba(122, 253, 214, 0.2)'
                    }}
                  >
                    {relatedArticle.featuredImage && (
                      <div className="relative h-32 mb-4 overflow-hidden rounded-[15px]">
                        <Image
                          src={relatedArticle.featuredImage}
                          alt={relatedArticle.title}
                          width={200}
                          height={128}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    )}
                    <h4 className="text-white font-medium mb-2 line-clamp-2 group-hover:text-[#7afdd6] transition-colors"
                      style={{ fontFamily: '"Poppins", sans-serif' }}
                    >
                      {relatedArticle.title}
                    </h4>
                    {relatedArticle.excerpt && (
                      <p className="text-[#888888] text-sm line-clamp-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                        {relatedArticle.excerpt}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </motion.section>
          )}
        </div>

        {/* Custom CSS */}
        {article.customCss && (
          <style dangerouslySetInnerHTML={{ __html: article.customCss }} />
        )}

        {/* Custom JavaScript */}
        {article.customJs && (
          <script dangerouslySetInnerHTML={{ __html: article.customJs }} />
        )}
      </div>
    </>
  );
}