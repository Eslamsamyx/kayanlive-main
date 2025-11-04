'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  ar: 'العربية',
  fr: 'Français',
  zh: '中文',
  ru: 'Русский',
};

interface TranslationBannerProps {
  requestedLocale: string;
  actualLocale: string;
  isFallback: boolean;
  articleId?: string;
}

export function TranslationBanner({
  requestedLocale,
  actualLocale,
  isFallback,
  articleId,
}: TranslationBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if user previously dismissed this banner
  useEffect(() => {
    if (articleId) {
      const dismissedKey = `translation-banner-dismissed-${articleId}`;
      const dismissed = localStorage.getItem(dismissedKey);
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    }
  }, [articleId]);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (articleId) {
      const dismissedKey = `translation-banner-dismissed-${articleId}`;
      localStorage.setItem(dismissedKey, 'true');
    }
  };

  // Don't show if not a fallback or if dismissed
  if (!isFallback || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div
          className="relative overflow-hidden rounded-[20px] p-4 md:p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '2px solid rgba(251, 191, 36, 0.3)',
          }}
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
            <Globe size={128} className="text-amber-400" />
          </div>

          {/* Content */}
          <div className="relative flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 mt-1">
              <div
                className="p-2 rounded-full"
                style={{
                  background: 'rgba(251, 191, 36, 0.2)',
                }}
              >
                <AlertTriangle size={20} className="text-amber-400" />
              </div>
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0">
              <h3
                className="text-amber-400 font-semibold text-sm md:text-base mb-1"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Translation Not Available
              </h3>
              <p
                className="text-white/90 text-sm md:text-base"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                This article is not available in{' '}
                <span className="font-semibold text-amber-400">
                  {LOCALE_NAMES[requestedLocale] || requestedLocale}
                </span>
                . Showing{' '}
                <span className="font-semibold text-white">
                  {LOCALE_NAMES[actualLocale] || actualLocale}
                </span>
                {' '}version instead.
              </p>
              <p
                className="text-white/60 text-xs md:text-sm mt-2"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Use the language switcher above to view available translations.
              </p>
            </div>

            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 text-amber-400/60 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-all duration-200"
              aria-label="Dismiss banner"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
