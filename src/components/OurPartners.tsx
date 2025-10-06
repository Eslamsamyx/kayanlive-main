'use client';

import { useTranslations, useLocale } from 'next-intl';
import ClientsPartnersTemplate, { CardConfig, BackgroundElement } from './ClientsPartnersTemplate';

// Assets - Optimized WebP images
const imgRectangle4 = "/optimized/our-partners/25a3c987de99ab2440f03dde0b9a9111c3d9dccb-partners-government.webp";
const imgRectangle5 = "/optimized/our-partners/1c402bb4f9f0d80514e68d7faa14500c7f4b4dfa-partners-tourism.webp";
const imgRectangle6 = "/optimized/our-partners/b63907c1eda86720102ba245b5a314b2de91bce0-partners-marketing.webp";
const imgRectangle7 = "/optimized/our-partners/fa1edbb6431470f957c17a24e3cdd43536deb191-partners-enterprise.webp";
const imgPattern0212 = "/optimized/our-partners/e6df81b755cd4ab7252dbbecf7a43a27372c9ca8-partners-pattern-1.webp";
const imgPattern0453 = "/optimized/our-partners/387db429def8526f504ca1667390161ed52cad5a-partners-pattern-2.webp";


const backgroundElements: BackgroundElement[] = [
  // Top Right Angular Decorative Element
  {
    type: 'pattern',
    position: { width: '400px', height: '600px', top: '-80px', right: '-120px' },
    style: { filter: 'brightness(0) invert(1)' },
    desktopOnly: true,
    src: imgPattern0453
  },
  // Background Ellipses - Teal glow
  {
    type: 'ellipse',
    position: { width: '452px', height: '683px', right: '-150px', top: '451px' },
    style: {
      background: 'radial-gradient(circle, rgba(122, 253, 214, 0.6) 0%, transparent 70%)',
      filter: 'blur(120px)'
    }
  },
  // Background Ellipses - Purple glow
  {
    type: 'ellipse',
    position: { width: '452px', height: '684px', right: '-265px', bottom: '100px' },
    style: {
      background: 'radial-gradient(circle, rgba(147, 112, 219, 0.6) 0%, transparent 70%)',
      filter: 'blur(120px)'
    }
  },
  // Bottom Left Pattern
  {
    type: 'pattern',
    position: { width: '894px', height: '884px', bottom: '-188px', left: '-420px' },
    style: { opacity: 1, mixBlendMode: 'lighten' as const },
    src: imgPattern0212
  },
  // Bottom Right Pattern (transformed)
  {
    type: 'pattern',
    position: { width: '978px', height: '967px', bottom: '-173px', right: '-273px' },
    style: { 
      transform: 'rotate(90deg) scaleY(-1)',
      opacity: 1,
      mixBlendMode: 'lighten' as const
    },
    src: imgPattern0212
  }
];

export default function OurPartners() {
  const t = useTranslations('clientsPartners.partners');
  const locale = useLocale();

  const cards: CardConfig[] = [
    {
      id: 'government-partners',
      image: imgRectangle4,
      layout: 'center',
      title: t('cards.government'),
      gradientOverlay: 'linear-gradient(to right, rgba(147, 112, 219, 0.6) 0%, rgba(122, 253, 214, 0.5) 100%)',
      gradientHoverOverlay: 'linear-gradient(to right, rgba(147, 112, 219, 0.6) 0%, rgba(122, 253, 214, 0.5) 100%)',
      hasBlurEffect: true,
      aspectRatio: 'clamp(320px, 50vw, 465px)'
    },
    {
      id: 'tourism',
      image: imgRectangle5,
      layout: 'center',
      title: t('cards.tourism'),
      gradientOverlay: 'linear-gradient(to right, rgba(147, 112, 219, 0.5) 0%, rgba(122, 253, 214, 0.4) 100%)',
      gradientHoverOverlay: 'linear-gradient(to right, rgba(147, 112, 219, 0.5) 0%, rgba(122, 253, 214, 0.4) 100%)',
      hasBlurEffect: true,
      aspectRatio: 'clamp(320px, 50vw, 465px)'
    },
    {
      id: 'marketing',
      image: imgRectangle6,
      layout: 'center',
      title: t('cards.marketing'),
      gradientOverlay: 'linear-gradient(to right, rgba(147, 112, 219, 0.55) 0%, rgba(122, 253, 214, 0.45) 100%)',
      gradientHoverOverlay: 'linear-gradient(to right, rgba(147, 112, 219, 0.55) 0%, rgba(122, 253, 214, 0.45) 100%)',
      hasBlurEffect: true,
      aspectRatio: 'clamp(320px, 50vw, 465px)'
    },
    {
      id: 'enterprise',
      image: imgRectangle7,
      layout: 'center',
      title: t('cards.enterprise'),
      gradientOverlay: 'linear-gradient(to right, rgba(147, 112, 219, 0.45) 0%, rgba(122, 253, 214, 0.5) 100%)',
      gradientHoverOverlay: 'linear-gradient(to right, rgba(147, 112, 219, 0.45) 0%, rgba(122, 253, 214, 0.5) 100%)',
      hasBlurEffect: true,
      aspectRatio: '465px'
    }
  ];

  return (
    <ClientsPartnersTemplate
      badgeText={t('badge')}
      title={t('title')}
      cards={cards}
      interactionType="gradient"
      backgroundElements={backgroundElements}
    />
  );
}