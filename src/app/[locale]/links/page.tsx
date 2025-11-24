'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// KayanLive logo
const imgKayanLogo = "/optimized/footer/823c27de600ccd2f92af3e073c8e10df3a192e5c.webp";

// Background pattern for hover reveal effect
const imgMaskGroup = "/assets/638442c54db92ce49b3ad8194a062a52ba973004.png";
const imgEllipse1 = "/assets/575a92ae113574b10651d37ad7654adf9fb7bd85.svg";
const imgEllipse2 = "/assets/dcc83c6de9d9f4b919b448af6ce767c528855540.svg";

// Social media brand colors and links
const socialLinks = [
  {
    id: 'home',
    name: 'KayanLive',
    href: 'https://kayanlive.com',
    icon: 'home',
    color: '#7afdd6',
    gradient: 'linear-gradient(135deg, #a095e1, #74cfaa)',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    href: '#',
    icon: 'youtube',
    color: '#FF0000',
    gradient: 'linear-gradient(135deg, #FF0000, #CC0000)',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    href: '#',
    icon: 'facebook',
    color: '#1877F2',
    gradient: 'linear-gradient(135deg, #1877F2, #0D65D9)',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    href: '#',
    icon: 'instagram',
    color: '#E4405F',
    gradient: 'linear-gradient(135deg, #833AB4, #E4405F, #FCAF45)',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    href: '#',
    icon: 'tiktok',
    color: '#000000',
    gradient: 'linear-gradient(135deg, #00F2EA, #FF0050)',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/kayanlive',
    icon: 'linkedin',
    color: '#0A66C2',
    gradient: 'linear-gradient(135deg, #0A66C2, #004182)',
  },
];

// SVG Icons for each platform
const SocialIcon = ({ icon, className }: { icon: string; className?: string }) => {
  switch (icon) {
    case 'home':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2zm0 2.84L18 11v7h-2v-6H8v6H6v-7l6-6.16z"/>
        </svg>
      );
    case 'youtube':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case 'facebook':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      );
    case 'tiktok':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      );
    case 'linkedin':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      );
    default:
      return null;
  }
};

export default function LinksPage() {
  const t = useTranslations('links');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  // Hover reveal effect state
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Preload background image
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = imgMaskGroup;
    link.type = 'image/png';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1] as const, // easeOut cubic bezier
      },
    },
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#2c2c2b] py-8 px-4 relative overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Full Background Pattern - Always present but masked */}
      <div
        className="absolute inset-0 bg-repeat opacity-100"
        style={{
          backgroundImage: `url('${imgMaskGroup}')`,
          backgroundSize: '600px 600px',
          imageRendering: 'crisp-edges' as React.CSSProperties['imageRendering']
        }}
      />

      {/* Mask overlay that hides the pattern except around cursor */}
      <div
        className="absolute inset-0 bg-[#2c2c2b] transition-opacity duration-300"
        style={{
          maskImage: isHovered
            ? `radial-gradient(circle 300px at ${mousePosition.x}px ${mousePosition.y}px, transparent 0%, transparent 30%, rgba(0,0,0,0.3) 60%, black 80%)`
            : 'none',
          WebkitMaskImage: isHovered
            ? `radial-gradient(circle 300px at ${mousePosition.x}px ${mousePosition.y}px, transparent 0%, transparent 30%, rgba(0,0,0,0.3) 60%, black 80%)`
            : 'none',
        }}
      />

      {/* Decorative Elements */}
      {/* Large teal ellipse blur - right side */}
      <div
        className="absolute hidden lg:block pointer-events-none"
        style={{
          width: '400px',
          height: '400px',
          right: '-100px',
          top: '20%'
        }}
      >
        <Image src={imgEllipse2} alt="" fill className="opacity-40" />
      </div>

      {/* Smaller purple ellipse - left side */}
      <div
        className="absolute hidden lg:block pointer-events-none"
        style={{
          width: '250px',
          height: '250px',
          left: '-50px',
          bottom: '20%'
        }}
      >
        <Image src={imgEllipse1} alt="" fill className="opacity-30" />
      </div>

      <div className="max-w-lg mx-auto relative z-10">
        {/* Logo and Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          {/* Logo */}
          <Link href={`/${locale}`} className="inline-block mb-6">
            <div className="relative w-48 h-16 mx-auto">
              <Image
                src={imgKayanLogo}
                alt="KayanLive Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Title */}
          <h1
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{
              background: 'linear-gradient(to right, #a095e1, #74cfaa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            {t('title')}
          </h1>

          {/* Subtitle */}
          <p
            className="text-[#b2b2b2] text-sm md:text-base"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Social Links */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {socialLinks.map((link) => (
            <motion.a
              key={link.id}
              href={link.href}
              target={link.id === 'home' ? '_self' : '_blank'}
              rel={link.id !== 'home' ? 'noopener noreferrer' : undefined}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center gap-4 w-full p-4 rounded-2xl transition-all duration-300 border border-[#444444] hover:border-[#7afdd6]/50"
              style={{
                background: 'rgba(44, 44, 43, 0.8)',
                backdropFilter: 'blur(10px)',
              }}
              aria-label={t(`links.${link.id}.aria`)}
            >
              {/* Icon Container */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ background: link.gradient }}
              >
                <SocialIcon icon={link.icon} className="w-6 h-6 text-white" />
              </div>

              {/* Text Content */}
              <div className="flex-1">
                <h2
                  className="text-white font-semibold text-lg group-hover:text-[#7afdd6] transition-colors duration-300"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  {t(`links.${link.id}.name`)}
                </h2>
                <p
                  className="text-[#888888] text-sm"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  {t(`links.${link.id}.description`)}
                </p>
              </div>

              {/* Arrow Icon */}
              <div className={`text-[#666666] group-hover:text-[#7afdd6] transition-all duration-300 ${isRTL ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.a>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center mt-12 pt-8 border-t border-[#444444]"
        >
          <p
            className="text-[#666666] text-sm"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
          <p
            className="text-[#7afdd6] text-xs mt-2"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            {t('footer.tagline')}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
