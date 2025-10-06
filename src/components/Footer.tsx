'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';

// Assets - Using optimized WebP version
const imgKayanLogo = "/optimized/footer/823c27de600ccd2f92af3e073c8e10df3a192e5c.webp";

// Social media brand colors and X icon
const socialIconBrandColors = {
  linkedin: '#0A66C2',
  x: '#000000',
  instagram: '#E4405F',
  facebook: '#1877F2'
};

interface FooterProps {
  className?: string;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface SocialLink {
  name: string;
  href: string;
  icon: string;
  ariaLabel: string;
}

interface FooterSection {
  title: string;
  links: Array<{
    name: string;
    href: string;
    external?: boolean;
  }>;
  isContact?: boolean;
}

export default React.memo(function Footer({ className = '' }: FooterProps) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const isRTL = locale === 'ar';

  // Get the current path without the locale prefix
  const currentPath = useMemo(() => {
    // Remove the locale prefix from the pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    return pathWithoutLocale;
  }, [pathname, locale]);

  const fontStyle = useMemo(() => ({
    fontFamily: '"Poppins", sans-serif'
  }), []);

  // Supported languages from Navbar component
  const languages: Language[] = useMemo(() => [
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' }
  ], []);

  // Social media links with flat design and brand colors
  const socialLinks: SocialLink[] = useMemo(() => [
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/company/kayanlive',
      icon: 'linkedin',
      ariaLabel: t('footer.social.linkedinAria')
    },
    {
      name: 'X',
      href: 'https://x.com/kayanlive',
      icon: 'x',
      ariaLabel: t('footer.social.twitterAria')
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com/kayanlive',
      icon: 'instagram',
      ariaLabel: t('footer.social.instagramAria')
    },
    {
      name: 'Facebook',
      href: 'https://facebook.com/kayanlive',
      icon: 'facebook',
      ariaLabel: t('footer.social.facebookAria')
    }
  ], [t]);

  // Footer sections with navigation matching Navbar
  const footerSections: FooterSection[] = useMemo(() => [
    {
      title: t('footer.sections.services.title'),
      links: [
        { name: t('footer.sections.services.liveEvents'), href: `/${locale}/services#live-events` },
        { name: t('footer.sections.services.conferences'), href: `/${locale}/services#conferences` },
        { name: t('footer.sections.services.exhibitions'), href: `/${locale}/services#exhibitions` },
        { name: t('footer.sections.services.immersiveAV'), href: `/${locale}/services#immersive-av` },
        { name: t('footer.sections.services.eventRescue'), href: `/${locale}/services#event-rescue` }
      ]
    },
    {
      title: t('footer.sections.quickLinks.title'),
      links: [
        { name: t('navigation.aboutUs'), href: `/${locale}/about` },
        { name: t('navigation.ourWork'), href: `/${locale}/work` },
        { name: t('navigation.clientsPartners'), href: `/${locale}/clients-partners` },
        { name: t('navigation.contact'), href: `/${locale}/contact` }
      ]
    }
  ], [t, locale]);

  // All sections including contact, with RTL reversal
  const allFooterSections = useMemo(() => {
    const sections = [
      ...footerSections.map(section => ({ ...section, isContact: false })),
      { title: t('footer.sections.contact.title'), isContact: true, links: [] }
    ];
    return isRTL ? [...sections].reverse() : sections;
  }, [footerSections, isRTL, t]);

  // Current year for copyright
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`relative w-full bg-[#2c2c2b] overflow-hidden ${className}`}
      style={{
        borderTopLeftRadius: 'clamp(25px, 4vw, 61px)',
        borderTopRightRadius: 'clamp(25px, 4vw, 61px)',
        marginTop: 'clamp(2rem, 4vw, 4rem)'
      }}
      role="contentinfo"
      aria-label={t('footer.ariaLabel')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Main Content Container - Single animation container like admin dashboard */}
      <motion.div
        className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-8 lg:px-20 py-12 md:py-16 lg:py-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >

        {/* Main Footer Content - Logo/Social Left (LTR) / Right (RTL), Menus Right (LTR) / Left (RTL) */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 mb-12 lg:mb-16">

          {/* Brand Section - First in DOM, dir attribute handles visual position */}
          <div className={`flex flex-col items-center lg:flex-shrink-0 lg:w-80 ${isRTL ? 'lg:items-end' : 'lg:items-start'}`}>
            {/* Logo */}
            <div className="relative mb-6">
              <Link
                href={`/${locale}`}
                className="block focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50 rounded-lg"
                aria-label={t('footer.brand.logoAria')}
              >
                <div className="relative w-48 md:w-56 lg:w-64 h-16 md:h-18 lg:h-20">
                  <Image
                    src={imgKayanLogo}
                    alt="KayanLive Logo"
                    fill
                    className="object-contain"
                    priority
                    onError={() => console.warn('Failed to load footer logo')}
                  />
                </div>
              </Link>
            </div>

            {/* Brand Description */}
            <div className={`text-center mb-6 ${isRTL ? 'lg:text-right' : 'lg:text-left'}`}>
              <p
                className="text-[#b2b2b2] text-sm md:text-base leading-relaxed"
                style={fontStyle}
              >
                {t('footer.brand.description')}
              </p>
            </div>

            {/* Social Media Links */}
            <div className={`flex gap-4 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {socialLinks.map((social) => {
                const brandColor = socialIconBrandColors[social.icon as keyof typeof socialIconBrandColors];
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50"
                    style={{
                      backgroundColor: brandColor,
                      opacity: 0.9
                    }}
                    aria-label={social.ariaLabel}
                  >
                    {social.icon === 'linkedin' && (
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    )}
                    {social.icon === 'x' && (
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
                      </svg>
                    )}
                    {social.icon === 'instagram' && (
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    )}
                    {social.icon === 'facebook' && (
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    )}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Navigation Sections - Second in DOM, dir attribute handles visual position */}
          <div className="flex-1 flex flex-col md:flex-row flex-wrap gap-8 lg:gap-12">

            {/* All sections with automatic RTL reversal */}
              {allFooterSections.map((section) => (
                <div
                  key={section.title}
                  className="md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-2rem)]"
                >
                  <h3
                    className={`text-white text-lg font-semibold mb-4 ${isRTL ? 'text-right' : 'text-left'}`}
                    style={fontStyle}
                  >
                    {section.title}
                  </h3>

                  {section.isContact ? (
                    /* Contact Information Content */
                    <div className={`space-y-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div>
                        <p className="text-[#b2b2b2] text-sm font-medium mb-1">
                          {t('footer.sections.contact.address.label')}
                        </p>
                        <p className="text-[#B8B8B8] text-sm leading-relaxed">
                          {t('footer.sections.contact.address.value')}
                        </p>
                      </div>

                      <div>
                        <p className="text-[#b2b2b2] text-sm font-medium mb-1">
                          {t('footer.sections.contact.email.label')}
                        </p>
                        <a
                          href={`mailto:${t('footer.sections.contact.email.value')}`}
                          className="text-[#7afdd6] text-sm hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50 rounded"
                        >
                          {t('footer.sections.contact.email.value')}
                        </a>
                      </div>

                      <div>
                        <p className="text-[#b2b2b2] text-sm font-medium mb-1">
                          {t('footer.sections.contact.phone.label')}
                        </p>
                        <a
                          href={`tel:${t('footer.sections.contact.phone.value')}`}
                          className="text-[#7afdd6] text-sm hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50 rounded"
                          dir="ltr"
                        >
                          {t('footer.sections.contact.phone.value')}
                        </a>
                      </div>
                    </div>
                  ) : (
                    /* Navigation Links Content */
                    <nav aria-label={section.title}>
                      <ul className={`space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {section.links.map((link) => (
                          <li key={link.name}>
                            {link.external ? (
                              <a
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#B8B8B8] text-sm hover:text-[#7afdd6] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50 rounded inline-block"
                              >
                                {link.name}
                              </a>
                            ) : (
                              <Link
                                href={link.href}
                                className="text-[#B8B8B8] text-sm hover:text-[#7afdd6] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50 rounded inline-block"
                              >
                                {link.name}
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    </nav>
                  )}
                </div>
              ))}

          </div>
        </div>

        {/* Language Selector */}
        <div className="mb-8 lg:mb-12">
          <h3
            className={`text-white text-lg font-semibold mb-4 text-center ${isRTL ? 'lg:text-right' : 'lg:text-left'}`}
            style={fontStyle}
          >
            {t('footer.language.title')}
          </h3>
          <div className={`flex flex-wrap justify-center gap-3 ${isRTL ? 'lg:justify-end flex-row-reverse' : 'lg:justify-start'}`}>
            {languages.map((language) => (
              <Link
                key={language.code}
                href={`/${language.code}${currentPath === '/' ? '' : currentPath}`}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50
                  ${language.code === locale
                    ? 'bg-[#7afdd6]/10 border-[#7afdd6] text-[#7afdd6]'
                    : 'border-[#444444] text-[#B8B8B8] hover:border-[#7afdd6]/50 hover:text-[#7afdd6]'
                  }
                `}
                aria-current={language.code === locale ? 'page' : undefined}
              >
                <span className="text-sm" role="img" aria-label={language.name}>
                  {language.flag}
                </span>
                <span className="text-sm font-medium">
                  {language.nativeName}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Section - Copyright */}
        <div className="border-t border-[#444444] pt-8">
          <div className="text-center">
            <p
              className="text-[#B8B8B8] text-sm"
              style={fontStyle}
            >
              <span className="text-white font-semibold">{currentYear}</span>
              {' '}
              {t('footer.copyright.text')}
              {' '}
              <span className="text-white font-semibold">KayanLive.com</span>
            </p>
          </div>
        </div>
      </motion.div>
    </footer>
  );
});