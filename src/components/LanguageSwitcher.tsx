'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOCALES = [
  { value: 'en', label: 'English', flag: '🇺🇸', nativeName: 'English' },
  { value: 'ar', label: 'العربية', flag: '🇸🇦', nativeName: 'العربية' },
  { value: 'fr', label: 'Français', flag: '🇫🇷', nativeName: 'Français' },
  { value: 'zh', label: '中文', flag: '🇨🇳', nativeName: '中文' },
  { value: 'ru', label: 'Русский', flag: '🇷🇺', nativeName: 'Русский' },
];

interface Translation {
  id: string;
  locale: string;
  slug: string;
  status: string;
  title: string;
}

interface LanguageSwitcherProps {
  currentLocale: string;
  currentSlug: string;
  articleId?: string;
  translations?: Translation[];
  mainArticleLocale?: string;
}

export function LanguageSwitcher({
  currentLocale,
  currentSlug,
  articleId,
  translations = [],
  mainArticleLocale = 'en',
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Get available locales with their availability status
  const getLocaleStatus = (localeValue: string) => {
    // Check if it's the main article locale
    if (localeValue === mainArticleLocale) {
      return { available: true, slug: currentSlug, status: 'PUBLISHED', isMain: true };
    }

    // Check if there's a published translation
    const translation = translations.find(t => t.locale === localeValue);
    if (translation) {
      return {
        available: translation.status === 'PUBLISHED',
        slug: translation.slug,
        status: translation.status,
        isMain: false,
      };
    }

    return { available: false, slug: null, status: null, isMain: false };
  };

  const handleLocaleChange = (localeValue: string) => {
    const status = getLocaleStatus(localeValue);

    if (status.available && status.slug) {
      router.push(`/${localeValue}/articles/${status.slug}`);
      setIsOpen(false);
    }
  };

  const currentLocaleData = LOCALES.find(l => l.value === currentLocale) || LOCALES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Current Language Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-[10px] transition-all duration-300 hover:scale-105"
        style={{
          background: 'rgba(122, 253, 214, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(122, 253, 214, 0.3)',
        }}
      >
        <Globe size={16} className="text-[#7afdd6]" />
        <span className="text-lg">{currentLocaleData.flag}</span>
        <span className="text-white font-medium text-sm" style={{ fontFamily: '"Poppins", sans-serif' }}>
          {currentLocaleData.nativeName}
        </span>
        <ChevronDown
          size={16}
          className={`text-[#7afdd6] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-64 py-2 rounded-[15px] shadow-xl z-50 overflow-hidden"
            style={{
              background: 'rgba(44, 44, 43, 0.98)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)',
            }}
          >
            {/* Header */}
            <div className="px-4 py-2 mb-2 border-b border-[#7afdd6]/20">
              <p className="text-xs text-[#888888] uppercase tracking-wide" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Available Languages
              </p>
            </div>

            {/* Language List */}
            <div className="max-h-80 overflow-y-auto">
              {LOCALES.map((locale) => {
                const status = getLocaleStatus(locale.value);
                const isCurrent = locale.value === currentLocale;

                return (
                  <button
                    key={locale.value}
                    onClick={() => handleLocaleChange(locale.value)}
                    disabled={!status.available}
                    className={`w-full flex items-center justify-between px-4 py-3 transition-all duration-200
                      ${status.available
                        ? 'hover:bg-[#7afdd6]/10 cursor-pointer'
                        : 'opacity-40 cursor-not-allowed'
                      }
                      ${isCurrent ? 'bg-[#7afdd6]/20' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{locale.flag}</span>
                      <div className="text-left">
                        <p
                          className={`text-sm font-medium ${isCurrent ? 'text-[#7afdd6]' : 'text-white'}`}
                          style={{ fontFamily: '"Poppins", sans-serif' }}
                        >
                          {locale.nativeName}
                        </p>
                        <p className="text-xs text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                          {locale.label}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCurrent && (
                        <Check size={16} className="text-[#7afdd6]" />
                      )}
                      {!status.available && (
                        <span
                          className="text-xs px-2 py-1 rounded-full bg-[#888888]/20 text-[#888888]"
                          style={{ fontFamily: '"Poppins", sans-serif' }}
                        >
                          {status.status === 'DRAFT' ? 'Draft' : 'Not Available'}
                        </span>
                      )}
                      {status.isMain && status.available && (
                        <span
                          className="text-xs px-2 py-1 rounded-full bg-[#7afdd6]/20 text-[#7afdd6]"
                          style={{ fontFamily: '"Poppins", sans-serif' }}
                        >
                          Original
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer Note */}
            <div className="px-4 py-2 mt-2 border-t border-[#7afdd6]/20">
              <p className="text-xs text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                {translations.filter(t => t.status === 'PUBLISHED').length} of {LOCALES.length - 1} translations available
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
