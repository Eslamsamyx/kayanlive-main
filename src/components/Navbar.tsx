'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import '../styles/navbar-animations.css';
import Button from './Button';

const imgKayanLogoOpenFile31 = "/optimized/footer/823c27de600ccd2f92af3e073c8e10df3a192e5c.webp";
const imgArrow1 = "/assets/35f8e962d2ce4403cee4cf1b70df11920a8fa4b6.svg";

interface NavbarProps {
  locale: string;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface NavItem {
  name: string;
  href: string;
  path: string;
}

export default function Navbar({ locale }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [mobileMenuHasScroll, setMobileMenuHasScroll] = useState(false);
  const [isLanguageChanging, setIsLanguageChanging] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();
  
  // Refs for click outside detection and scroll detection
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuScrollRef = useRef<HTMLDivElement>(null);
  const justOpenedDropdownRef = useRef(false);

  const languages: Language[] = useMemo(() => [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' }
  ], []);

  const currentLanguage = useMemo(() => 
    languages.find(lang => lang.code === locale) || languages[0],
    [languages, locale]
  );

  const navItems: NavItem[] = useMemo(() => {
    const items = [
      { name: t('navigation.home'), href: `/${locale}`, path: `/${locale}` },
      { name: t('navigation.aboutUs'), href: `/${locale}/about`, path: `/${locale}/about` },
      { name: t('navigation.services'), href: `/${locale}/services`, path: `/${locale}/services` },
      { name: t('navigation.ourWork'), href: `/${locale}/work`, path: `/${locale}/work` },
      { name: t('navigation.clientsPartners'), href: `/${locale}/clients-partners`, path: `/${locale}/clients-partners` },
    ];
    // Reverse order for RTL languages
    return locale === 'ar' ? [...items].reverse() : items;
  }, [locale, t]);

  const isActive = useCallback((path: string) => {
    if (path === `/${locale}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname === path || pathname === `${path}/`;
  }, [pathname, locale]);

  // Handle language change with loading state
  const handleLanguageChange = useCallback(async (langCode: string) => {
    if (langCode === locale || isLanguageChanging) return;

    try {
      setIsLanguageChanging(true);
      const newPathname = pathname.replace(`/${locale}`, `/${langCode}`);
      await router.push(newPathname);
      setIsLanguageDropdownOpen(false);
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Failed to change language:', error);
      // Keep menus open so user can try again
    } finally {
      // Add small delay to show loading state
      setTimeout(() => setIsLanguageChanging(false), 300);
    }
  }, [pathname, locale, router, isLanguageChanging]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Skip if we just opened the dropdown
      if (justOpenedDropdownRef.current) {
        justOpenedDropdownRef.current = false;
        return;
      }

      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isLanguageDropdownOpen || isMobileMenuOpen) {
      // Delay adding the event listener to prevent immediate closure
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 50);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isLanguageDropdownOpen, isMobileMenuOpen]);

  // Enhanced keyboard navigation with focus management
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isLanguageDropdownOpen) {
          setIsLanguageDropdownOpen(false);
          // Return focus to language button
          const languageButton = document.getElementById('language-dropdown-button');
          languageButton?.focus();
        }
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
          // Return focus to burger menu button
          const burgerButton = document.querySelector('[aria-controls="mobile-menu"]') as HTMLElement;
          burgerButton?.focus();
        }
      }

      // Handle Arrow keys for language dropdown
      if (isLanguageDropdownOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault();
        const menuItems = document.querySelectorAll('[role="menuitem"]');
        const currentFocus = document.activeElement;
        const currentIndex = Array.from(menuItems).indexOf(currentFocus as Element);

        let nextIndex;
        if (event.key === 'ArrowDown') {
          nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
        } else {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
        }

        (menuItems[nextIndex] as HTMLElement)?.focus();
      }

      // Handle Enter/Space for dropdown toggle
      if ((event.key === 'Enter' || event.key === ' ') && event.target instanceof HTMLElement) {
        if (event.target.getAttribute('aria-haspopup') === 'menu') {
          event.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLanguageDropdownOpen, isMobileMenuOpen]);

  // Body scroll lock for mobile menu and scroll detection
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';

      // Check if mobile menu content is scrollable
      const checkScrollable = () => {
        if (mobileMenuScrollRef.current) {
          const { scrollHeight, clientHeight } = mobileMenuScrollRef.current;
          setMobileMenuHasScroll(scrollHeight > clientHeight);
        }
      };

      // Debounced resize handler
      let resizeTimeout: NodeJS.Timeout;
      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(checkScrollable, 150);
      };

      // Check initially and on resize
      setTimeout(checkScrollable, 100); // Small delay for DOM to settle
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(resizeTimeout);
      };
    } else {
      document.body.style.overflow = '';
      setMobileMenuHasScroll(false);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <nav
      className="bg-[#2c2c2b] rounded-[61px] mx-1 sm:mx-4 px-2 sm:px-6 md:px-8 lg:px-12 py-3 md:py-6 relative"
      role="navigation"
      aria-label="Main navigation"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Main navbar grid layout - Fixed logo width, right-aligned actions */}
      <div className="grid grid-cols-[auto_1fr_auto] gap-1 sm:gap-2 md:gap-3 lg:gap-4 items-center min-h-[44px] w-full min-w-0">
        
        {/* Logo - Fixed width, left-aligned */}
        <Link
          href={`/${locale}`}
          className="relative flex items-center justify-start focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50 rounded-lg p-1 transition-all duration-200 flex-shrink-0 hover-lift gpu-accelerated"
          aria-label="Go to homepage"
        >
          <div className="relative w-20 sm:w-24 md:w-32 lg:w-36 h-8 sm:h-9 md:h-10 lg:h-12 flex-shrink-0">
            {imageLoadError ? (
              <div className="w-full h-full flex items-center justify-center bg-[#7afdd6]/10 rounded-lg">
                <span className="text-[#7afdd6] font-bold text-sm sm:text-base md:text-lg lg:text-xl">KAYAN</span>
              </div>
            ) : (
              <Image
                src={imgKayanLogoOpenFile31}
                alt="Kayan Live Logo"
                fill
                className="object-contain"
                priority
                onError={() => setImageLoadError(true)}
                onLoad={() => setImageLoadError(false)}
              />
            )}
          </div>
        </Link>

        {/* Center Navigation - Hidden on mobile/tablet, expands on lg+ */}
        <div className="lg:flex items-center justify-center flex-1 min-w-0 overflow-hidden hidden">
          <div className={`flex items-center gap-1 lg:gap-2 xl:gap-4 max-w-full ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  relative flex items-center gap-1 px-1 lg:px-2 xl:px-3 py-2 rounded-lg text-xs lg:text-sm xl:text-base
                  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]
                  focus:ring-opacity-50 min-h-[44px] group hover:bg-white/5 flex-shrink-1 min-w-0
                  nav-item-hover gpu-accelerated touch-feedback
                  ${isActive(item.path) ? 'text-white font-semibold' : 'text-[#b2b2b2] hover:text-white'}
                `}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                {isActive(item.path) && (
                  <span
                    className="w-1.5 h-1.5 bg-[#7afdd6] rounded-full flex-shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span className="truncate leading-tight">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right side actions - Always right-aligned */}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0 justify-self-end">
          
          {/* Language Dropdown - Tablet and up only */}
          <div className="hidden md:flex relative" ref={languageDropdownRef} style={{ zIndex: 1000 }}>
            <button
              id="language-dropdown-button"
              onClick={() => {
                setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
                justOpenedDropdownRef.current = !isLanguageDropdownOpen;
              }}
              className="
                flex items-center gap-1 md:gap-2 lg:gap-3 px-2 md:px-3 lg:px-4 py-2 rounded-full border-2 border-[#7afdd6]
                text-[#7afdd6] hover:bg-[#7afdd6] hover:text-[#2c2c2b]
                focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-75
                transition-all duration-200 text-xs md:text-sm lg:text-base font-medium min-h-[44px] flex-shrink-0
                hover:shadow-lg hover:shadow-[#7afdd6]/20 hover-lift press-feedback gpu-accelerated touch-feedback
              "
              aria-expanded={isLanguageDropdownOpen}
              aria-haspopup="menu"
              aria-controls="language-dropdown-menu"
              aria-label={currentLanguage.nativeName}
              disabled={isLanguageChanging}
            >
              <span className="text-lg" role="img" aria-label={currentLanguage.name}>
                {currentLanguage.flag}
              </span>
              <span className="hidden xl:inline">
                {isLanguageChanging ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </span>
                ) : (
                  currentLanguage.nativeName
                )}
              </span>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Language Dropdown Menu */}
            {isLanguageDropdownOpen && (
              <div
                id="language-dropdown-menu"
                className={`
                  absolute top-full mt-2 w-56 bg-[#1a1a19] border border-[#333] rounded-xl
                  shadow-2xl overflow-hidden backdrop-blur-sm animate-fadeIn gpu-accelerated
                  ${locale === 'ar' ? 'left-0 md:left-auto md:right-0' : 'right-0'}
                  max-h-[calc(100vh-6rem)] overflow-y-auto
                `}
                style={{
                  zIndex: 999999,
                  position: 'absolute'
                }}
                role="menu"
                aria-labelledby="language-dropdown-button"
                aria-orientation="vertical"
              >
                <div className="p-2">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      disabled={isLanguageChanging}
                      className={`
                        w-full px-4 py-3 text-left hover:bg-[#333] transition-all duration-200
                        flex items-center gap-3 min-h-[44px] ripple-effect touch-feedback
                        ${language.code === locale
                          ? 'bg-[#333] text-[#7afdd6]'
                          : 'text-[#b2b2b2] hover:text-white'
                        }
                        ${isLanguageChanging ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      role="menuitem"
                      tabIndex={-1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleLanguageChange(language.code);
                        }
                      }}
                    >
                      <span className="text-lg" role="img" aria-label={language.name}>
                        {language.flag}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{language.nativeName}</div>
                        <div className="text-xs opacity-70">{language.name}</div>
                      </div>
                      {language.code === locale && (
                        <div className="w-2 h-2 bg-[#7afdd6] rounded-full" aria-label="Current language" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact CTA Button - Shows when space available */}
          <div className="hidden lg:flex">
            <Button
              href={`/${locale}/contact`}
              variant="default"
              size="md"
              arrowIcon={true}
            >
              {t('navigation.contact')}
            </Button>
          </div>

          {/* Mobile/Tablet Menu Button - Show until lg breakpoint */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="
              lg:hidden flex flex-col gap-1.5 p-2 focus:outline-none
              focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50
              rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px]
              items-center justify-center hover:bg-white/10 press-feedback touch-feedback gpu-accelerated
            "
            aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            id="mobile-menu-button"
          >
            <span className={`block w-6 h-0.5 bg-white transition-all duration-200 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white transition-all duration-200 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white transition-all duration-200 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          
          {/* Menu Panel */}
          <div
            ref={mobileMenuRef}
            id="mobile-menu"
            className={`
              absolute top-full left-0 right-0 mt-4 bg-[#2c2c2b] rounded-3xl
              lg:hidden z-50 animate-scaleIn shadow-2xl max-h-[calc(100vh-8rem)]
              overflow-hidden flex flex-col mobile-menu-container gpu-accelerated
              ${mobileMenuHasScroll ? 'has-scroll' : ''}
            `}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <div 
              ref={mobileMenuScrollRef}
              className="flex flex-col space-y-2 p-6 overflow-y-auto mobile-menu-scroll"
              style={{ maxHeight: 'calc(100vh - 10rem)' }}
            >
              {/* Navigation Links */}
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 py-4 px-4 rounded-lg transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50
                    min-h-[56px] hover:bg-white/5 touch-friendly ripple-effect
                    ${isActive(item.path)
                      ? 'text-white font-semibold bg-white/5'
                      : 'text-[#b2b2b2] hover:text-white'
                    }
                  `}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                >
                  {isActive(item.path) && (
                    <span className="w-2 h-2 bg-[#7afdd6] rounded-full flex-shrink-0" aria-hidden="true" />
                  )}
                  <span className="text-lg leading-tight">{item.name}</span>
                </Link>
              ))}

              {/* Mobile Actions */}
              <div className="pt-6 mt-6 border-t border-gray-700/50 space-y-4">
                {/* Language Selector - Mobile */}
                <div className="space-y-3">
                  <p className="text-[#b2b2b2] text-sm font-medium px-4">{t('common.language')}</p>
                  <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        disabled={isLanguageChanging}
                        className={`
                          flex items-center gap-3 p-4 rounded-lg transition-all duration-200
                          focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50
                          min-h-[56px] touch-friendly ripple-effect
                          ${language.code === locale
                            ? 'bg-[#7afdd6]/10 text-[#7afdd6] border-2 border-[#7afdd6]/30'
                            : 'bg-white/5 text-white hover:bg-white/10 border-2 border-transparent'
                          }
                          ${isLanguageChanging ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        <span className="text-xl" role="img" aria-label={language.name}>
                          {language.flag}
                        </span>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-sm">{language.nativeName}</div>
                          <div className="text-xs opacity-70">{language.name}</div>
                        </div>
                        {language.code === locale && (
                          <div className="w-2 h-2 bg-[#7afdd6] rounded-full" aria-label="Current" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contact CTA - Mobile */}
                <Link
                  href={`/${locale}/contact`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="
                    w-full flex items-center justify-center gap-3 px-6 py-4 rounded-full
                    bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b]
                    hover:from-[#6ee8c5] hover:to-[#a694ff] focus:outline-none
                    focus:ring-2 focus:ring-white focus:ring-opacity-50
                    transition-all duration-200 text-lg font-semibold min-h-[56px]
                    hover-lift press-feedback touch-friendly gpu-accelerated
                  "
                >
                  {t('navigation.contact')}
                  <span
                    className="w-5 h-5 relative flex-shrink-0"
                    style={{ transform: locale === 'ar' ? 'scaleX(-1)' : 'none' }}
                  >
                    <Image
                      src={imgArrow1}
                      alt=""
                      fill
                      className="object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}