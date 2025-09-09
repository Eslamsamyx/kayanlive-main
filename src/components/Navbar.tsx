'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const imgKayanLogoOpenFile31 = "/assets/823c27de600ccd2f92af3e073c8e10df3a192e5c.png";
const imgEllipse10 = "/assets/1918a35cdd924803848278275d7d9e759f06510e.svg";
const imgArrow1 = "/assets/35f8e962d2ce4403cee4cf1b70df11920a8fa4b6.svg";

interface NavbarProps {
  locale: string;
}

export default function Navbar({ locale }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isMobileLanguageDropdownOpen, setIsMobileLanguageDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' }
  ];

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node)) {
        setIsMobileLanguageDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    const newPathname = pathname.replace(`/${locale}`, `/${langCode}`);
    router.push(newPathname);
    setIsLanguageDropdownOpen(false);
    setIsMobileLanguageDropdownOpen(false);
  };

  const navItems = [
    { name: 'home', href: `/${locale}`, path: `/${locale}` },
    { name: 'about us', href: `/${locale}/about`, path: `/${locale}/about` },
    { name: 'services', href: `/${locale}/services`, path: `/${locale}/services` },
    { name: 'our work', href: `/${locale}/work`, path: `/${locale}/work` },
    { name: 'clients & partners', href: `/${locale}/clients-partners`, path: `/${locale}/clients-partners` },
  ];

  const isActive = (path: string) => {
    if (path === `/${locale}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname === path || pathname === `${path}/`;
  };

  return (
    <nav className="bg-[#2c2c2b] rounded-[61px] mx-4 px-6 md:px-12 h-20 md:h-24 flex items-center justify-between relative">
      {/* Logo */}
      <div className="flex items-center">
        <Link href={`/${locale}`} className="relative w-24 md:w-32 h-10">
          <Image
            src={imgKayanLogoOpenFile31}
            alt="Kayan Live Logo"
            fill
            className="object-contain"
            priority
          />
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-8 xl:gap-12 absolute left-1/2 transform -translate-x-1/2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-2 transition-colors duration-200 ${
              isActive(item.path) 
                ? 'text-white font-bold' 
                : 'text-[#b2b2b2] hover:text-white'
            }`}
          >
            {isActive(item.path) && (
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
            )}
            <span className="capitalize text-base xl:text-lg">{item.name}</span>
          </Link>
        ))}
      </div>

      {/* Desktop CTA Buttons */}
      <div className="hidden lg:flex items-center gap-4">
        {/* Language Dropdown - Desktop */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
            className="relative group px-6 py-3 rounded-full border-2 border-[#7afdd6] text-[#7afdd6] hover:bg-[#7afdd6] hover:text-[#2c2c2b] transition-all duration-300 capitalize text-base xl:text-lg font-medium flex items-center gap-3"
          >
            <span className="text-xl" role="img" aria-label={currentLanguage.name}>
              {currentLanguage.flag}
            </span>
            <span>{currentLanguage.nativeName}</span>
            <svg 
              className={`w-4 h-4 transition-transform duration-300 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Dropdown Menu */}
          <div className={`absolute top-full right-0 mt-2 w-56 transition-all duration-300 ease-out ${
            isLanguageDropdownOpen 
              ? 'opacity-100 visible translate-y-0' 
              : 'opacity-0 invisible -translate-y-2'
          }`}>
            <div className="bg-[#1a1a19] backdrop-blur-xl border border-[#3a3a39] rounded-2xl shadow-2xl overflow-hidden">
              {languages.map((language, index) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  disabled={language.code === locale}
                  className={`w-full px-4 py-3 text-left hover:bg-[#2a2a29] transition-all duration-200 flex items-center gap-3 group ${
                    language.code === locale 
                      ? 'bg-[#7afdd6]/10 text-[#7afdd6] cursor-default' 
                      : 'text-white hover:text-[#7afdd6]'
                  } ${index === 0 ? 'rounded-t-2xl' : ''} ${index === languages.length - 1 ? 'rounded-b-2xl' : ''}`}
                >
                  <span className="text-xl group-hover:scale-110 transition-transform duration-200" role="img" aria-label={language.name}>
                    {language.flag}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{language.nativeName}</div>
                    <div className="text-xs opacity-60">{language.name}</div>
                  </div>
                  {language.code === locale && (
                    <div className="w-2 h-2 bg-[#7afdd6] rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        <Link 
          href={`/${locale}/contact`}
          className="flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] hover:from-[#6ee8c5] hover:to-[#a694ff] transition-all duration-300 capitalize text-base xl:text-lg font-medium"
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

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden flex flex-col gap-1.5 p-2"
        aria-label="Toggle mobile menu"
      >
        <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
        <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 mt-4 bg-[#2c2c2b] rounded-3xl p-6 lg:hidden z-50">
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2 py-2 transition-colors duration-200 ${
                  isActive(item.path) 
                    ? 'text-white font-bold' 
                    : 'text-[#b2b2b2] hover:text-white'
                }`}
              >
                {isActive(item.path) && (
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
                <span className="capitalize text-lg">{item.name}</span>
              </Link>
            ))}
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-700">
              {/* Language Dropdown - Mobile */}
              <div className="relative" ref={mobileDropdownRef}>
                <button 
                  onClick={() => setIsMobileLanguageDropdownOpen(!isMobileLanguageDropdownOpen)}
                  className="w-full px-6 py-3 rounded-full border-2 border-[#7afdd6] text-[#7afdd6] hover:bg-[#7afdd6] hover:text-[#2c2c2b] transition-all duration-300 capitalize text-lg font-medium flex items-center justify-center gap-3"
                >
                  <span className="text-xl" role="img" aria-label={currentLanguage.name}>
                    {currentLanguage.flag}
                  </span>
                  <span>{currentLanguage.nativeName}</span>
                  <svg 
                    className={`w-5 h-5 transition-transform duration-300 ${isMobileLanguageDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Mobile Dropdown Menu */}
                <div className={`mt-2 transition-all duration-300 ease-out ${
                  isMobileLanguageDropdownOpen 
                    ? 'opacity-100 visible translate-y-0 max-h-96' 
                    : 'opacity-0 invisible -translate-y-2 max-h-0'
                }`}>
                  <div className="bg-[#1a1a19] backdrop-blur-xl border border-[#3a3a39] rounded-2xl shadow-2xl overflow-hidden">
                    {languages.map((language, index) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        disabled={language.code === locale}
                        className={`w-full px-4 py-3 text-left hover:bg-[#2a2a29] transition-all duration-200 flex items-center gap-3 group ${
                          language.code === locale 
                            ? 'bg-[#7afdd6]/10 text-[#7afdd6] cursor-default' 
                            : 'text-white hover:text-[#7afdd6]'
                        } ${index === 0 ? 'rounded-t-2xl' : ''} ${index === languages.length - 1 ? 'rounded-b-2xl' : ''}`}
                      >
                        <span className="text-xl group-hover:scale-110 transition-transform duration-200" role="img" aria-label={language.name}>
                          {language.flag}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium text-base">{language.nativeName}</div>
                          <div className="text-sm opacity-60">{language.name}</div>
                        </div>
                        {language.code === locale && (
                          <div className="w-2 h-2 bg-[#7afdd6] rounded-full animate-pulse" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <Link 
                href={`/${locale}/contact`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] hover:from-[#6ee8c5] hover:to-[#a694ff] transition-all duration-300 capitalize text-lg font-medium"
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
      )}
    </nav>
  );
}