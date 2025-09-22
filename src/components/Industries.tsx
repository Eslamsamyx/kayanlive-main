'use client';

import { useTranslations } from 'next-intl';
import { parseMarkdown } from '@/utils/markdownUtils';
import ClientsPartnersTemplate, { CardConfig, BackgroundElement } from './ClientsPartnersTemplate';

const imgPattern = "/optimized/industries-assets/ef25fd14e49122ddd6cbc03c8a92caff93500eb7.webp";
const imgGovernment = "/optimized/industries-assets/cb192ab808312901ac705768d1f69f35ae3c9f61.webp";
const imgMultinational = "/optimized/industries-assets/79b8becbbe666db19c2c2dfdebe436eebf271e2e.webp";
const imgRealEstate = "/optimized/industries-assets/97b98a652c6210a2b4e884e84040708ab75a45fc.webp";
const imgEventPlanners = "/optimized/industries-assets/123269087423c903b101b9352bd92acdab49d86a.webp";
const imgPattern0453 = "/optimized/industries-assets/6cdd4333a240b46dead9df86c5a83772e81b76fc.webp";


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
    src: imgPattern
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
    src: imgPattern
  },
  // Diamond decorations - Left side
  {
    type: 'diamond',
    position: { width: '35px', height: '35px', left: '40px', top: '55%' },
    style: { background: 'rgba(122, 253, 214, 0.6)', filter: 'blur(1px)' },
    desktopOnly: true
  },
  {
    type: 'diamond',
    position: { width: '28px', height: '28px', left: '25px', bottom: '350px' },
    style: { background: 'rgba(184, 164, 255, 0.5)', filter: 'blur(1px)' },
    desktopOnly: true
  },
  {
    type: 'diamond',
    position: { width: '40px', height: '40px', left: '80px', bottom: '250px' },
    style: { background: 'rgba(122, 253, 214, 0.4)', filter: 'blur(1px)' },
    desktopOnly: true
  },
  // Diamond decorations - Bottom
  {
    type: 'diamond',
    position: { width: '32px', height: '32px', left: '200px', bottom: '80px' },
    style: { background: 'rgba(184, 164, 255, 0.45)', filter: 'blur(1px)' },
    desktopOnly: true
  },
  {
    type: 'diamond',
    position: { width: '38px', height: '38px', left: '350px', bottom: '60px' },
    style: { background: 'rgba(122, 253, 214, 0.5)', filter: 'blur(1px)' },
    desktopOnly: true
  },
  {
    type: 'diamond',
    position: { width: '30px', height: '30px', left: '500px', bottom: '90px' },
    style: { background: 'rgba(184, 164, 255, 0.4)', filter: 'blur(1px)' },
    desktopOnly: true
  },
  // Diamond decorations - Right side
  {
    type: 'diamond',
    position: { width: '34px', height: '34px', right: '80px', top: '45%' },
    style: { background: 'rgba(122, 253, 214, 0.45)', filter: 'blur(1px)' },
    desktopOnly: true
  },
  {
    type: 'diamond',
    position: { width: '36px', height: '36px', right: '120px', bottom: '180px' },
    style: { background: 'rgba(184, 164, 255, 0.5)', filter: 'blur(1px)' },
    desktopOnly: true
  }
];

export default function Industries() {
  const t = useTranslations();
  
  const cards: CardConfig[] = [
    {
      id: 'government',
      image: imgGovernment,
      layout: 'center',
      title: t('industries.government'),
      description: parseMarkdown(t('industries.governmentDesc')),
      gradientOverlay: 'linear-gradient(to right, rgba(147, 112, 219, 0.6) 0%, rgba(122, 253, 214, 0.5) 100%)',
      gradientHoverOverlay: 'linear-gradient(to right, rgba(147, 112, 219, 0.6) 0%, rgba(122, 253, 214, 0.5) 100%)',
      hasBlurEffect: true,
      aspectRatio: 'clamp(320px, 50vw, 465px)'
    },
    {
      id: 'multinational',
      image: imgMultinational,
      layout: 'center',
      title: t('industries.enterprise'),
      description: parseMarkdown(t('industries.enterpriseDesc')),
      gradientOverlay: 'linear-gradient(to right, rgba(147, 112, 219, 0.5) 0%, rgba(122, 253, 214, 0.4) 100%)',
      gradientHoverOverlay: 'linear-gradient(to right, rgba(147, 112, 219, 0.5) 0%, rgba(122, 253, 214, 0.4) 100%)',
      hasBlurEffect: true,
      aspectRatio: 'clamp(320px, 50vw, 465px)'
    },
    {
      id: 'real-estate',
      image: imgRealEstate,
      layout: 'center',
      title: t('industries.realEstate'),
      description: parseMarkdown(t('industries.realEstateDesc')),
      gradientOverlay: 'linear-gradient(to right, rgba(147, 112, 219, 0.55) 0%, rgba(122, 253, 214, 0.45) 100%)',
      gradientHoverOverlay: 'linear-gradient(to right, rgba(147, 112, 219, 0.55) 0%, rgba(122, 253, 214, 0.45) 100%)',
      hasBlurEffect: true,
      aspectRatio: 'clamp(320px, 50vw, 465px)'
    },
    {
      id: 'event-planners',
      image: imgEventPlanners,
      layout: 'center',
      title: t('industries.agencies'),
      description: parseMarkdown(t('industries.agenciesDesc')),
      gradientOverlay: 'linear-gradient(to right, rgba(147, 112, 219, 0.45) 0%, rgba(122, 253, 214, 0.5) 100%)',
      gradientHoverOverlay: 'linear-gradient(to right, rgba(147, 112, 219, 0.45) 0%, rgba(122, 253, 214, 0.5) 100%)',
      hasBlurEffect: true,
      aspectRatio: '465px'
    }
  ];
  
  return (
    <ClientsPartnersTemplate
      badgeText={t('industries.badge')}
      badgeWidth="266px"
      title={t('industries.title')}
      cards={cards}
      interactionType="gradient"
      backgroundElements={backgroundElements}
      containerClass="py-12 md:py-16 lg:py-20"
      customTitleStyle={{
        desktop: {
          fontSize: '200px',
          lineHeight: '200px',
          letterSpacing: '-2px'
        },
        mobile: {
          fontSize: '50px',
          lineHeight: '137px',
          letterSpacing: '-0.5px'
        },
        fontWeight: 'normal',
        textTransform: 'capitalize',
        gradient: 'linear-gradient(90deg, #b8a4ff 0%, #7afdd6 100%)'
      }}
    />
  );
}