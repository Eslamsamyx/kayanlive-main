'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import '../styles/navbar-animations.css';

const imgKayanLogoOpenFile31 = "/assets/823c27de600ccd2f92af3e073c8e10df3a192e5c.png";
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
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();
  
  // Refs for click outside detection and scroll detection
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuScrollRef = useRef<HTMLDivElement>(null);

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

  const navItems: NavItem[] = useMemo(() => [
    { name: t('navigation.home'), href: `/${locale}`, path: `/${locale}` },
    { name: t('navigation.aboutUs'), href: `/${locale}/about`, path: `/${locale}/about` },
    { name: t('navigation.services'), href: `/${locale}/services`, path: `/${locale}/services` },
    { name: t('navigation.ourWork'), href: `/${locale}/work`, path: `/${locale}/work` },
    { name: t('navigation.clientsPartners'), href: `/${locale}/clients-partners`, path: `/${locale}/clients-partners` },
  ], [locale, t]);

  const isActive = useCallback((path: string) => {
    if (path === `/${locale}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname === path || pathname === `${path}/`;
  }, [pathname, locale]);

  // Handle language change
  const handleLanguageChange = useCallback((langCode: string) => {
    if (langCode === locale) return;
    const newPathname = pathname.replace(`/${locale}`, `/${langCode}`);
    router.push(newPathname);
    setIsLanguageDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname, locale, router]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isLanguageDropdownOpen || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isLanguageDropdownOpen, isMobileMenuOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsLanguageDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      
      // Check initially and on resize
      setTimeout(checkScrollable, 100); // Small delay for DOM to settle
      window.addEventListener('resize', checkScrollable);
      
      return () => {
        window.removeEventListener('resize', checkScrollable);
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
      className="bg-[#2c2c2b] rounded-[61px] mx-4 px-6 md:px-8 lg:px-12 py-4 md:py-6 relative"
      role="navigation"
      aria-label="Main navigation"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Main navbar grid layout */}
      <div className="grid grid-cols-[1fr_auto] lg:grid-cols-[auto_1fr_auto] gap-4 lg:gap-8 items-center min-h-[44px]">
        
        {/* Logo */}
        <Link 
          href={`/${locale}`}
          className="relative flex items-center justify-start focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50 rounded-lg p-1 transition-all duration-200"
          aria-label="Go to homepage"
        >
          <div className="relative w-24 md:w-32 h-8 md:h-10">
            <Image
              src={imgKayanLogoOpenFile31}
              alt="Kayan Live Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation - Hidden on mobile/tablet */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="flex items-center gap-8 xl:gap-12">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm xl:text-base
                  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] 
                  focus:ring-opacity-50 min-h-[44px] group hover:bg-white/5
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
                <span className="whitespace-nowrap leading-tight">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          
          {/* Language Dropdown - Desktop/Tablet */}
          <div className="hidden md:flex relative" ref={languageDropdownRef}>
            <button 
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              className="
                flex items-center gap-3 px-4 py-2 rounded-full border-2 border-[#7afdd6] 
                text-[#7afdd6] hover:bg-[#7afdd6] hover:text-[#2c2c2b] 
                focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50 
                transition-all duration-200 text-sm xl:text-base font-medium min-h-[44px]
              "
              aria-expanded={isLanguageDropdownOpen}
              aria-haspopup="menu"
              aria-label={`Current language: ${currentLanguage.nativeName}`}
            >
              <span className="text-lg" role="img" aria-label={currentLanguage.name}>
                {currentLanguage.flag}
              </span>
              <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
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
              <div className={`
                absolute top-full mt-2 w-56 bg-[#1a1a19] border border-[#333] rounded-xl 
                shadow-xl overflow-hidden backdrop-blur-sm z-50 animate-slideIn
                ${locale === 'ar' ? 'left-0' : 'right-0'}
              `}>
                <div role="menu" aria-labelledby="language-dropdown-button">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      className={`
                        w-full px-4 py-3 text-left hover:bg-[#333] transition-all duration-200 
                        flex items-center gap-3 min-h-[44px]
                        ${language.code === locale 
                          ? 'bg-[#333] text-[#7afdd6]' 
                          : 'text-[#b2b2b2] hover:text-white'
                        }
                      `}
                      role="menuitem"
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

          {/* Contact CTA Button - Desktop/Tablet */}
          <Link
            href={`/${locale}/contact`}
            className="
              hidden md:flex items-center gap-3 px-6 py-3 rounded-full 
              bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] 
              hover:from-[#6ee8c5] hover:to-[#a694ff] focus:outline-none 
              focus:ring-2 focus:ring-white focus:ring-opacity-50 
              transition-all duration-200 text-sm xl:text-base font-semibold min-h-[44px]
            "
          >
            {t('navigation.contact')}
            <span 
              className="w-4 h-4 relative flex-shrink-0" 
              style={{ transform: locale === 'ar' ? 'scaleX(-1)' : 'none' }}
            >
              <Image
                src={imgArrow1}
                alt=""
                fill
                className="object-contain"
              />
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="
              md:hidden flex flex-col gap-1.5 p-2 focus:outline-none 
              focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50 
              rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px] 
              items-center justify-center hover:bg-white/10
            "
            aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          
          {/* Menu Panel */}
          <div 
            ref={mobileMenuRef}
            id="mobile-menu"
            className={`
              absolute top-full left-0 right-0 mt-4 bg-[#2c2c2b] rounded-3xl 
              md:hidden z-50 animate-slideIn shadow-2xl max-h-[calc(100vh-140px)]
              overflow-hidden flex flex-col mobile-menu-container
              ${mobileMenuHasScroll ? 'has-scroll' : ''}
            `}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <div 
              ref={mobileMenuScrollRef}
              className="flex flex-col space-y-2 p-6 overflow-y-auto mobile-menu-scroll"
              style={{ maxHeight: 'calc(100vh - 180px)' }}
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
                    min-h-[56px] hover:bg-white/5
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
                  <div className="grid grid-cols-2 gap-3">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className={`
                          flex items-center gap-3 p-4 rounded-lg transition-all duration-200 
                          focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50 
                          min-h-[56px]
                          ${language.code === locale 
                            ? 'bg-[#7afdd6]/10 text-[#7afdd6] border-2 border-[#7afdd6]/30' 
                            : 'bg-white/5 text-white hover:bg-white/10 border-2 border-transparent'
                          }
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