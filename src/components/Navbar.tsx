'use client';

import { useReducer, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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

interface NavbarState {
  isMobileMenuOpen: boolean;
  isLanguageDropdownOpen: boolean;
  isMobileLanguageDropdownOpen: boolean;
  focusedIndex: number;
  focusTrapActive: boolean;
}

type NavbarAction =
  | { type: 'TOGGLE_MOBILE_MENU' }
  | { type: 'CLOSE_MOBILE_MENU' }
  | { type: 'TOGGLE_LANGUAGE_DROPDOWN' }
  | { type: 'CLOSE_LANGUAGE_DROPDOWN' }
  | { type: 'TOGGLE_MOBILE_LANGUAGE_DROPDOWN' }
  | { type: 'CLOSE_MOBILE_LANGUAGE_DROPDOWN' }
  | { type: 'CLOSE_ALL' }
  | { type: 'SET_FOCUSED_INDEX'; payload: number }
  | { type: 'ACTIVATE_FOCUS_TRAP' }
  | { type: 'DEACTIVATE_FOCUS_TRAP' };

const initialState: NavbarState = {
  isMobileMenuOpen: false,
  isLanguageDropdownOpen: false,
  isMobileLanguageDropdownOpen: false,
  focusedIndex: -1,
  focusTrapActive: false,
};

function navbarReducer(state: NavbarState, action: NavbarAction): NavbarState {
  switch (action.type) {
    case 'TOGGLE_MOBILE_MENU':
      return {
        ...state,
        isMobileMenuOpen: !state.isMobileMenuOpen,
        isLanguageDropdownOpen: false,
        isMobileLanguageDropdownOpen: false,
        focusTrapActive: !state.isMobileMenuOpen,
      };
    case 'CLOSE_MOBILE_MENU':
      return {
        ...state,
        isMobileMenuOpen: false,
        focusTrapActive: false,
      };
    case 'TOGGLE_LANGUAGE_DROPDOWN':
      return {
        ...state,
        isLanguageDropdownOpen: !state.isLanguageDropdownOpen,
        isMobileLanguageDropdownOpen: false,
      };
    case 'CLOSE_LANGUAGE_DROPDOWN':
      return {
        ...state,
        isLanguageDropdownOpen: false,
      };
    case 'TOGGLE_MOBILE_LANGUAGE_DROPDOWN':
      return {
        ...state,
        isMobileLanguageDropdownOpen: !state.isMobileLanguageDropdownOpen,
      };
    case 'CLOSE_MOBILE_LANGUAGE_DROPDOWN':
      return {
        ...state,
        isMobileLanguageDropdownOpen: false,
      };
    case 'CLOSE_ALL':
      return {
        ...state,
        isMobileMenuOpen: false,
        isLanguageDropdownOpen: false,
        isMobileLanguageDropdownOpen: false,
        focusTrapActive: false,
      };
    case 'SET_FOCUSED_INDEX':
      return {
        ...state,
        focusedIndex: action.payload,
      };
    case 'ACTIVATE_FOCUS_TRAP':
      return {
        ...state,
        focusTrapActive: true,
      };
    case 'DEACTIVATE_FOCUS_TRAP':
      return {
        ...state,
        focusTrapActive: false,
      };
    default:
      return state;
  }
}

export default function Navbar({ locale }: NavbarProps) {
  const [state, dispatch] = useReducer(navbarReducer, initialState);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const firstFocusableRef = useRef<HTMLAnchorElement>(null);
  const lastFocusableRef = useRef<HTMLAnchorElement>(null);
  const reducedMotionRef = useRef<boolean>(false);

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

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mediaQuery.matches;
    
    const handleChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Click outside handler with throttling
  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as Node;
    
    if (dropdownRef.current && !dropdownRef.current.contains(target)) {
      dispatch({ type: 'CLOSE_LANGUAGE_DROPDOWN' });
    }
    if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(target)) {
      dispatch({ type: 'CLOSE_MOBILE_LANGUAGE_DROPDOWN' });
    }
    if (mobileMenuRef.current && !mobileMenuRef.current.contains(target) && state.isMobileMenuOpen) {
      dispatch({ type: 'CLOSE_MOBILE_MENU' });
    }
  }, [state.isMobileMenuOpen]);

  useEffect(() => {
    if (state.isMobileMenuOpen || state.isLanguageDropdownOpen || state.isMobileLanguageDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [state.isMobileMenuOpen, state.isLanguageDropdownOpen, state.isMobileLanguageDropdownOpen, handleClickOutside]);

  // Language change handler
  const handleLanguageChange = useCallback((langCode: string) => {
    if (langCode === locale) return;
    
    const newPathname = pathname.replace(`/${locale}`, `/${langCode}`);
    router.push(newPathname);
    dispatch({ type: 'CLOSE_ALL' });
  }, [pathname, locale, router]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        dispatch({ type: 'CLOSE_ALL' });
        break;
      case 'Tab':
        if (state.focusTrapActive && mobileMenuRef.current) {
          const focusableElements = mobileMenuRef.current.querySelectorAll(
            'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
          
          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
        break;
      case 'ArrowDown':
      case 'ArrowUp':
        if (state.isLanguageDropdownOpen || state.isMobileLanguageDropdownOpen) {
          event.preventDefault();
          const direction = event.key === 'ArrowDown' ? 1 : -1;
          const newIndex = Math.max(0, Math.min(languages.length - 1, state.focusedIndex + direction));
          dispatch({ type: 'SET_FOCUSED_INDEX', payload: newIndex });
        }
        break;
      case 'Enter':
      case ' ':
        if (state.focusedIndex >= 0 && (state.isLanguageDropdownOpen || state.isMobileLanguageDropdownOpen)) {
          event.preventDefault();
          handleLanguageChange(languages[state.focusedIndex].code);
        }
        break;
    }
  }, [state, languages, handleLanguageChange]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Body scroll lock for mobile menu
  useEffect(() => {
    if (state.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [state.isMobileMenuOpen]);

  const navItems: NavItem[] = useMemo(() => [
    { name: 'home', href: `/${locale}`, path: `/${locale}` },
    { name: 'about us', href: `/${locale}/about`, path: `/${locale}/about` },
    { name: 'services', href: `/${locale}/services`, path: `/${locale}/services` },
    { name: 'our work', href: `/${locale}/work`, path: `/${locale}/work` },
    { name: 'clients & partners', href: `/${locale}/clients-partners`, path: `/${locale}/clients-partners` },
  ], [locale]);

  const isActive = useCallback((path: string) => {
    if (path === `/${locale}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname === path || pathname === `${path}/`;
  }, [pathname, locale]);

  return (
    <nav 
      ref={navRef}
      className="bg-[#2c2c2b] rounded-[61px] mx-4 px-6 md:px-12 h-20 md:h-24 flex items-center justify-between relative"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo and Desktop Navigation - Combined */}
      <div className="flex items-center gap-12">
        <Link 
          ref={firstFocusableRef}
          href={`/${locale}`} 
          className="relative w-24 md:w-32 h-10 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50 rounded-lg transition-all duration-200 flex-shrink-0"
          aria-label="Go to homepage"
        >
          <Image
            src={imgKayanLogoOpenFile31}
            alt="Kayan Live Logo"
            fill
            className="object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation - Next to logo */}
        <div className="hidden lg:flex items-center gap-8 xl:gap-12">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50 ${
              isActive(item.path) 
                ? 'text-white font-bold' 
                : 'text-[#b2b2b2] hover:text-white'
            }`}
            aria-current={isActive(item.path) ? 'page' : undefined}
          >
            {isActive(item.path) && (
              <span className="w-1.5 h-1.5 bg-white rounded-full" aria-hidden="true" />
            )}
            <span className="capitalize text-base xl:text-lg whitespace-nowrap">{item.name}</span>
          </Link>
        ))}
        </div>
      </div>

      {/* Tablet Navigation - Language, Contact, and Burger Menu */}
      <div className="hidden md:flex lg:hidden items-center gap-4">
        {/* Language Dropdown - Tablet (exact same styling as desktop) */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => dispatch({ type: 'TOGGLE_LANGUAGE_DROPDOWN' })}
            className="relative group px-6 py-3 rounded-full border-2 border-[#7afdd6] text-[#7afdd6] hover:bg-[#7afdd6] hover:text-[#2c2c2b] focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50 focus:ring-offset-2 focus:ring-offset-[#2c2c2b] transition-all duration-300 capitalize text-base xl:text-lg font-medium flex items-center gap-3"
            aria-expanded={state.isLanguageDropdownOpen}
            aria-haspopup="menu"
            aria-label={`Current language: ${currentLanguage.nativeName}. Click to change language.`}
          >
            <span className="text-xl" role="img" aria-label={currentLanguage.name}>
              {currentLanguage.flag}
            </span>
            <span>{currentLanguage.nativeName}</span>
            <svg 
              className={`w-4 h-4 transition-transform duration-300 ${state.isLanguageDropdownOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Dropdown Menu - Tablet (exact same styling as desktop) */}
          <div className={`absolute top-full ${locale === 'ar' ? 'left-0' : 'right-0'} mt-2 w-56 z-50 transition-all duration-300 ease-out ${
            state.isLanguageDropdownOpen 
              ? 'opacity-100 visible translate-y-0' 
              : 'opacity-0 invisible -translate-y-2'
          }`}>
            <div 
              className="bg-[#1a1a19] border border-[#333] rounded-xl shadow-xl overflow-hidden backdrop-blur-sm"
              role="menu"
              aria-labelledby="language-dropdown-button"
            >
              {languages.map((language, index) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full px-4 py-3 text-left hover:bg-[#333] transition-all duration-200 flex items-center gap-3 ${
                    language.code === locale ? 'bg-[#333] text-[#7afdd6]' : 'text-[#b2b2b2] hover:text-white'
                  } ${state.focusedIndex === index ? 'bg-[#333]' : ''}`}
                  role="menuitem"
                  tabIndex={-1}
                >
                  <span className="text-lg" role="img" aria-label={language.name}>
                    {language.flag}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-xs opacity-70">{language.name}</div>
                  </div>
                  {language.code === locale && (
                    <svg className="w-4 h-4 text-[#7afdd6]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Contact Button - Tablet (exact same styling as desktop) */}
        <Link
          href={`/${locale}/contact`}
          className="flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] hover:from-[#6ee8c5] hover:to-[#a694ff] focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:ring-offset-2 focus:ring-offset-[#2c2c2b] transition-all duration-300 capitalize text-base xl:text-lg font-medium min-h-[44px]"
        >
          contact
          <span className="w-4 h-4 relative">
            <Image
              src={imgArrow1}
              alt="Arrow"
              fill
              className="object-contain"
            />
          </span>
        </Link>

        {/* Burger Menu Button - Rightmost on tablet */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_MOBILE_MENU' })}
          className="flex flex-col gap-1.5 p-2 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px] items-center justify-center"
          aria-label={state.isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
          aria-expanded={state.isMobileMenuOpen}
          aria-controls="mobile-menu"
        >
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${state.isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} aria-hidden="true" />
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${state.isMobileMenuOpen ? 'opacity-0' : ''}`} aria-hidden="true" />
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${state.isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} aria-hidden="true" />
        </button>
      </div>

      {/* Desktop CTA Buttons - Only show on desktop */}
      <div className="hidden lg:flex items-center gap-4">
        {/* Language Dropdown - Desktop */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => dispatch({ type: 'TOGGLE_LANGUAGE_DROPDOWN' })}
            className="relative group px-6 py-3 rounded-full border-2 border-[#7afdd6] text-[#7afdd6] hover:bg-[#7afdd6] hover:text-[#2c2c2b] focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50 focus:ring-offset-2 focus:ring-offset-[#2c2c2b] transition-all duration-300 capitalize text-base xl:text-lg font-medium flex items-center gap-3"
            aria-expanded={state.isLanguageDropdownOpen}
            aria-haspopup="menu"
            aria-label={`Current language: ${currentLanguage.nativeName}. Click to change language.`}
          >
            <span className="text-xl" role="img" aria-label={currentLanguage.name}>
              {currentLanguage.flag}
            </span>
            <span>{currentLanguage.nativeName}</span>
            <svg 
              className={`w-4 h-4 transition-transform duration-300 ${state.isLanguageDropdownOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Dropdown Menu */}
          <div className={`absolute top-full ${locale === 'ar' ? 'left-0' : 'right-0'} mt-2 w-56 z-50 transition-all duration-300 ease-out ${
            state.isLanguageDropdownOpen 
              ? 'opacity-100 visible translate-y-0' 
              : 'opacity-0 invisible -translate-y-2'
          }`}>
            <div 
              className="bg-[#1a1a19] backdrop-blur-xl border border-[#3a3a39] rounded-2xl shadow-2xl overflow-hidden"
              role="menu"
              aria-label="Language selection menu"
            >
              {languages.map((language, index) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  disabled={language.code === locale}
                  className={`w-full px-4 py-3 text-left hover:bg-[#2a2a29] focus:outline-none focus:bg-[#2a2a29] focus:text-[#7afdd6] transition-all duration-200 flex items-center gap-3 group min-h-[44px] ${
                    language.code === locale 
                      ? 'bg-[#7afdd6]/10 text-[#7afdd6] cursor-default' 
                      : 'text-white hover:text-[#7afdd6]'
                  } ${index === 0 ? 'rounded-t-2xl' : ''} ${index === languages.length - 1 ? 'rounded-b-2xl' : ''} ${state.focusedIndex === index ? 'bg-[#2a2a29] text-[#7afdd6]' : ''}`}
                  role="menuitem"
                  aria-current={language.code === locale ? 'true' : undefined}
                >
                  <span 
                    className="text-xl group-hover:scale-110 transition-transform duration-200 text-lg" 
                    role="img" 
                    aria-label={`${language.name} flag`}
                  >
                    {language.flag}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{language.nativeName}</div>
                    <div className="text-xs opacity-60">{language.name}</div>
                  </div>
                  {language.code === locale && (
                    <div className="w-2 h-2 bg-[#7afdd6] rounded-full animate-pulse" aria-label="Currently selected" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        <Link 
          ref={lastFocusableRef}
          href={`/${locale}/contact`}
          className="flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] hover:from-[#6ee8c5] hover:to-[#a694ff] focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:ring-offset-2 focus:ring-offset-[#2c2c2b] transition-all duration-300 capitalize text-base xl:text-lg font-medium min-h-[44px]"
        >
          contact
          <span className="w-4 h-4 relative">
            <Image
              src={imgArrow1}
              alt="Arrow"
              fill
              className="object-contain"
            />
          </span>
        </Link>
      </div>

      {/* Mobile Menu Button - Show only on mobile */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_MOBILE_MENU' })}
        className="md:hidden flex flex-col gap-1.5 p-2 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px] items-center justify-center"
        aria-label={state.isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
        aria-expanded={state.isMobileMenuOpen}
        aria-controls="mobile-menu"
      >
        <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${state.isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} aria-hidden="true" />
        <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${state.isMobileMenuOpen ? 'opacity-0' : ''}`} aria-hidden="true" />
        <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${state.isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} aria-hidden="true" />
      </button>

      {/* Mobile Menu */}
      {state.isMobileMenuOpen && (
        <>
          {/* Mobile/Tablet Menu Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            aria-hidden="true"
            onClick={() => dispatch({ type: 'CLOSE_MOBILE_MENU' })}
          />
          <div 
            ref={mobileMenuRef}
            id="mobile-menu"
            className={`absolute top-full left-0 right-0 mt-4 bg-[#2c2c2b] rounded-3xl p-6 lg:hidden z-50 transform transition-all duration-300 ease-out ${
              !reducedMotionRef.current ? 'animate-slideIn' : ''
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => dispatch({ type: 'CLOSE_MOBILE_MENU' })}
                  className={`flex items-center gap-2 py-3 px-2 rounded-lg min-h-[44px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50 ${
                    isActive(item.path) 
                      ? 'text-white font-bold' 
                      : 'text-[#b2b2b2] hover:text-white focus:text-white'
                  }`}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                >
                  {isActive(item.path) && (
                    <span className="w-1.5 h-1.5 bg-white rounded-full" aria-hidden="true" />
                  )}
                  <span className="capitalize text-lg">{item.name}</span>
                </Link>
              ))}
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-700">
                {/* Language Dropdown - Mobile */}
                <div className="relative" ref={mobileDropdownRef}>
                  <button 
                    onClick={() => dispatch({ type: 'TOGGLE_MOBILE_LANGUAGE_DROPDOWN' })}
                    className="w-full px-6 py-3 rounded-full border-2 border-[#7afdd6] text-[#7afdd6] hover:bg-[#7afdd6] hover:text-[#2c2c2b] focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50 focus:ring-offset-2 focus:ring-offset-[#2c2c2b] transition-all duration-300 capitalize text-lg font-medium flex items-center justify-center gap-3 min-h-[44px]"
                    aria-expanded={state.isMobileLanguageDropdownOpen}
                    aria-haspopup="menu"
                    aria-label={`Current language: ${currentLanguage.nativeName}. Click to change language.`}
                  >
                    <span className="text-xl" role="img" aria-label={currentLanguage.name}>
                      {currentLanguage.flag}
                    </span>
                    <span>{currentLanguage.nativeName}</span>
                    <svg 
                      className={`w-5 h-5 transition-transform duration-300 ${state.isMobileLanguageDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Mobile Dropdown Menu */}
                  <div className={`mt-2 transition-all duration-300 ease-out overflow-hidden ${
                    state.isMobileLanguageDropdownOpen 
                      ? 'opacity-100 visible translate-y-0 max-h-96' 
                      : 'opacity-0 invisible -translate-y-2 max-h-0'
                  }`}>
                    <div 
                      className="bg-[#1a1a19] backdrop-blur-xl border border-[#3a3a39] rounded-2xl shadow-2xl overflow-hidden"
                      role="menu"
                      aria-label="Mobile language selection menu"
                    >
                      {languages.map((language, index) => (
                        <button
                          key={language.code}
                          onClick={() => handleLanguageChange(language.code)}
                          disabled={language.code === locale}
                          className={`w-full px-4 py-3 text-left hover:bg-[#2a2a29] focus:outline-none focus:bg-[#2a2a29] focus:text-[#7afdd6] transition-all duration-200 flex items-center gap-3 group min-h-[44px] ${
                            language.code === locale 
                              ? 'bg-[#7afdd6]/10 text-[#7afdd6] cursor-default' 
                              : 'text-white hover:text-[#7afdd6]'
                          } ${index === 0 ? 'rounded-t-2xl' : ''} ${index === languages.length - 1 ? 'rounded-b-2xl' : ''}`}
                          role="menuitem"
                          aria-current={language.code === locale ? 'true' : undefined}
                        >
                          <span 
                            className="text-xl group-hover:scale-110 transition-transform duration-200" 
                            role="img" 
                            aria-label={`${language.name} flag`}
                          >
                            {language.flag}
                          </span>
                          <div className="flex-1">
                            <div className="font-medium text-base">{language.nativeName}</div>
                            <div className="text-sm opacity-60">{language.name}</div>
                          </div>
                          {language.code === locale && (
                            <div className="w-2 h-2 bg-[#7afdd6] rounded-full animate-pulse" aria-label="Currently selected" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <Link 
                  href={`/${locale}/contact`}
                  onClick={() => dispatch({ type: 'CLOSE_MOBILE_MENU' })}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] hover:from-[#6ee8c5] hover:to-[#a694ff] focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:ring-offset-2 focus:ring-offset-[#2c2c2b] transition-all duration-300 capitalize text-lg font-medium min-h-[44px]"
                >
                  contact
                  <span className="w-4 h-4 relative">
                    <Image
                      src={imgArrow1}
                      alt="Arrow"
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