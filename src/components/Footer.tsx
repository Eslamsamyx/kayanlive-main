'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import Button from './Button';

// Assets - Using established pattern from existing components
const imgPattern = "/assets/7854b2fa3456db2dfe1f88a71484d2ef952fd4d6.png";
const imgKayanLogo = "/assets/823c27de600ccd2f92af3e073c8e10df3a192e5c.png";

// Social media icons - Following WorkOutcomes component pattern
const imgTwitter = "/assets/def48b10f3af85b72c9c1340300144e654a156e1.svg";
const imgFacebook = "/assets/69e31bfddbf7233cc0877c3ef5b4edc8be21a2aa.svg";
const imgLinkedin = "/assets/29c078eff0cb9c150c3699b142068664db1faceb.svg";
const imgInstagram = "/assets/83fa7d33c676fd60c6236412ca0aa58eee80b908.svg";

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
}

export default React.memo(function Footer({ className = '' }: FooterProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';


  const fontStyle = useMemo(() => ({
    fontFamily: '"Poppins", sans-serif'
  }), []);

  // Supported languages from Navbar component
  const languages: Language[] = useMemo(() => [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' }
  ], []);

  // Social media links - Following established pattern
  const socialLinks: SocialLink[] = useMemo(() => [
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/company/kayanlive',
      icon: imgLinkedin,
      ariaLabel: t('footer.social.linkedinAria')
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/kayanlive',
      icon: imgTwitter,
      ariaLabel: t('footer.social.twitterAria')
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com/kayanlive',
      icon: imgInstagram,
      ariaLabel: t('footer.social.instagramAria')
    },
    {
      name: 'Facebook',
      href: 'https://facebook.com/kayanlive',
      icon: imgFacebook,
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
    },
    {
      title: t('footer.sections.legal.title'),
      links: [
        { name: t('footer.sections.legal.privacy'), href: `/${locale}/privacy-policy` },
        { name: t('footer.sections.legal.terms'), href: `/${locale}/terms-of-service` },
        { name: t('footer.sections.legal.cookies'), href: `/${locale}/cookie-policy` },
        { name: t('footer.sections.legal.accessibility'), href: `/${locale}/accessibility-statement` }
      ]
    }
  ], [t, locale]);

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
      {/* Decorative Elements */}
      {/* Top decorative diamonds */}
      <div className="absolute top-8 left-8 hidden lg:block" aria-hidden="true">
        <div className="flex gap-6">
          {[...Array(2)].map((_, i) => (
            <motion.div
              key={i}
              className="flex items-center justify-center"
              style={{ width: '60px', height: '60px' }}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <div style={{ transform: 'rotate(45deg)' }}>
                <div
                  className="backdrop-blur-sm"
                  style={{
                    width: '42px',
                    height: '42px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(7.5px)'
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Background pattern - Bottom right */}
      <div
        className="absolute bottom-0 right-0 overflow-hidden opacity-10"
        style={{
          width: 'clamp(400px, 50vw, 800px)',
          height: 'clamp(400px, 50vw, 800px)',
          transform: 'translate(25%, 25%)'
        }}
        aria-hidden="true"
      >
        <div
          className="w-full h-full bg-center bg-cover"
          style={{
            backgroundImage: `url('${imgPattern}')`,
            transform: 'rotate(45deg)',
            filter: 'brightness(0) invert(1)'
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-8 lg:px-20 py-12 md:py-16 lg:py-20">

        {/* Top Section - Logo and Main CTA */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 lg:gap-12 mb-12 lg:mb-16">

          {/* Brand Section */}
          <div className="flex flex-col items-center lg:items-start max-w-lg">
            {/* Logo */}
            <motion.div
              className="relative mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
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
            </motion.div>

            {/* Brand Description */}
            <motion.div
              className="text-center lg:text-left mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <p
                className="text-[#b2b2b2] text-sm md:text-base leading-relaxed max-w-md"
                style={fontStyle}
              >
                {t('footer.brand.description')}
              </p>
            </motion.div>

            {/* Social Media Links */}
            <motion.div
              className="flex gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-[#7afdd6]/30 hover:border-[#7afdd6] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50"
                  aria-label={social.ariaLabel}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative w-5 h-5 md:w-6 md:h-6">
                    <Image
                      src={social.icon}
                      alt=""
                      fill
                      className="object-contain transition-all duration-300 group-hover:brightness-0 group-hover:invert group-hover:sepia group-hover:saturate-[10000%] group-hover:hue-rotate-[120deg]"
                    />
                  </div>

                  {/* Hover effect background */}
                  <div
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #7afdd6 0%, #b8a4ff 100%)'
                    }}
                  />
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* CTA Section */}
          <motion.div
            className="flex flex-col items-center lg:items-end text-center lg:text-right"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2
              className="text-white text-2xl md:text-3xl lg:text-4xl font-bold mb-4 max-w-md"
              style={fontStyle}
            >
              {t('footer.cta.title')}
            </h2>
            <p
              className="text-[#b2b2b2] text-base md:text-lg mb-6 max-w-md"
              style={fontStyle}
            >
              {t('footer.cta.subtitle')}
            </p>
            <Button
              href={`/${locale}/contact`}
              variant="default"
              size="lg"
              arrowIcon={true}
            >
              {t('footer.cta.button')}
            </Button>
          </motion.div>
        </div>

        {/* Navigation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12 lg:mb-16">

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3
              className="text-white text-lg font-semibold mb-4"
              style={fontStyle}
            >
              {t('footer.sections.contact.title')}
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-[#b2b2b2] text-sm font-medium mb-1">
                  {t('footer.sections.contact.address.label')}
                </p>
                <p className="text-[#888888] text-sm leading-relaxed">
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
                >
                  {t('footer.sections.contact.phone.value')}
                </a>
              </div>
            </div>
          </motion.div>

          {/* Dynamic Navigation Sections */}
          {footerSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + sectionIndex * 0.1 }}
            >
              <h3
                className="text-white text-lg font-semibold mb-4"
                style={fontStyle}
              >
                {section.title}
              </h3>
              <nav aria-label={section.title}>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#888888] text-sm hover:text-[#7afdd6] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50 rounded inline-block"
                        >
                          {link.name}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-[#888888] text-sm hover:text-[#7afdd6] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50 rounded inline-block"
                        >
                          {link.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.div>
          ))}
        </div>

        {/* Language Selector */}
        <motion.div
          className="mb-8 lg:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3
            className="text-white text-lg font-semibold mb-4 text-center lg:text-left"
            style={fontStyle}
          >
            {t('footer.language.title')}
          </h3>
          <div className="flex flex-wrap justify-center lg:justify-start gap-3">
            {languages.map((language) => (
              <Link
                key={language.code}
                href={`/${language.code}${locale === 'en' ? '' : '/' + locale}`}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50
                  ${language.code === locale
                    ? 'bg-[#7afdd6]/10 border-[#7afdd6] text-[#7afdd6]'
                    : 'border-[#444444] text-[#888888] hover:border-[#7afdd6]/50 hover:text-[#7afdd6]'
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
        </motion.div>

        {/* Bottom Section - Copyright and Legal */}
        <motion.div
          className="border-t border-[#444444] pt-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <div className="text-center lg:text-left">
            <p
              className="text-[#888888] text-sm"
              style={fontStyle}
            >
              <span className="text-white font-semibold">{currentYear}</span>
              {' '}
              {t('footer.copyright.text')}
              {' '}
              <span className="text-white font-semibold">KayanLive.com</span>
            </p>
          </div>

          <div className="flex flex-wrap justify-center lg:justify-end gap-4 text-sm">
            <Link
              href={`/${locale}/privacy-policy`}
              className="text-[#888888] hover:text-[#7afdd6] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50 rounded"
            >
              {t('footer.sections.legal.privacy')}
            </Link>
            <span className="text-[#444444]">•</span>
            <Link
              href={`/${locale}/terms-of-service`}
              className="text-[#888888] hover:text-[#7afdd6] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50 rounded"
            >
              {t('footer.sections.legal.terms')}
            </Link>
            <span className="text-[#444444]">•</span>
            <Link
              href={`/${locale}/accessibility-statement`}
              className="text-[#888888] hover:text-[#7afdd6] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50 rounded"
            >
              {t('footer.sections.legal.accessibility')}
            </Link>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </footer>
  );
});