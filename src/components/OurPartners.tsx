'use client';

import { useTranslations } from 'next-intl';
import ClientsPartnersTemplate, { CardConfig, BackgroundElement } from './ClientsPartnersTemplate';

const imgRectangle4 = "/optimized/about-hero/174d9ed83a90c0514d54b7cbb68f8656ca74592c-about-hero-desktop.webp";
const imgRectangle5 = "/optimized/article-featured/0bb8e976afa37efb2547ff983a789a24c46bc909-article-featured-desktop.webp";
const imgRectangle6 = "/optimized/service-detail/0599bc8efb3df6cbf4d2b5cc07e1932dc0d2a400-service-detail-desktop.webp";
const imgRectangle7 = "/optimized/gallery-thumbnail/d079f823333ca8bce293bcab9a39cb1aea4b5439-gallery-thumbnail-desktop.webp";
const imgPattern0212 = "/optimized/cta-background/ef25fd14e49122ddd6cbc03c8a92caff93500eb7-cta-background-desktop.webp";
const imgPattern0453 = "/optimized/gallery-thumbnail/6cdd4333a240b46dead9df86c5a83772e81b76fc-gallery-thumbnail-desktop.webp";


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