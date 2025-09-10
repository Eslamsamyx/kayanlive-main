'use client';

import ClientsPartnersTemplate, { CardConfig, BackgroundElement } from './ClientsPartnersTemplate';

const imgRectangle4 = "/assets/174d9ed83a90c0514d54b7cbb68f8656ca74592c.png";
const imgRectangle5 = "/assets/0bb8e976afa37efb2547ff983a789a24c46bc909.png";
const imgRectangle6 = "/assets/0599bc8efb3df6cbf4d2b5cc07e1932dc0d2a400.png";
const imgRectangle7 = "/assets/d079f823333ca8bce293bcab9a39cb1aea4b5439.png";
const imgPattern0212 = "/assets/ef25fd14e49122ddd6cbc03c8a92caff93500eb7.png";
const imgPattern0453 = "/assets/6cdd4333a240b46dead9df86c5a83772e81b76fc.png";

const cards: CardConfig[] = [
  {
    id: 'government-partners',
    image: imgRectangle4,
    layout: 'center',
    title: 'Government & Semi-Government Bodies',
    gradientOverlay: 'linear-gradient(to right, rgba(147, 112, 219, 0.6) 0%, rgba(122, 253, 214, 0.5) 100%)',
    gradientHoverOverlay: 'linear-gradient(to right, rgba(147, 112, 219, 0.6) 0%, rgba(122, 253, 214, 0.5) 100%)',
    hasBlurEffect: true,
    aspectRatio: 'clamp(320px, 50vw, 465px)'
  },
  {
    id: 'tourism',
    image: imgRectangle5,
    layout: 'center',
    title: 'Tourism And Destination Initiatives',
    gradientOverlay: 'linear-gradient(to right, rgba(147, 112, 219, 0.5) 0%, rgba(122, 253, 214, 0.4) 100%)',
    gradientHoverOverlay: 'linear-gradient(to right, rgba(147, 112, 219, 0.5) 0%, rgba(122, 253, 214, 0.4) 100%)',
    hasBlurEffect: true,
    aspectRatio: 'clamp(320px, 50vw, 465px)'
  },
  {
    id: 'marketing',
    image: imgRectangle6,
    layout: 'center',
    title: 'Marketing & Experience Agencies',
    gradientOverlay: 'linear-gradient(to right, rgba(147, 112, 219, 0.55) 0%, rgba(122, 253, 214, 0.45) 100%)',
    gradientHoverOverlay: 'linear-gradient(to right, rgba(147, 112, 219, 0.55) 0%, rgba(122, 253, 214, 0.45) 100%)',
    hasBlurEffect: true,
    aspectRatio: 'clamp(320px, 50vw, 465px)'
  },
  {
    id: 'enterprise',
    image: imgRectangle7,
    layout: 'center',
    title: 'Enterprise Brands',
    gradientOverlay: 'linear-gradient(to right, rgba(147, 112, 219, 0.45) 0%, rgba(122, 253, 214, 0.5) 100%)',
    gradientHoverOverlay: 'linear-gradient(to right, rgba(147, 112, 219, 0.45) 0%, rgba(122, 253, 214, 0.5) 100%)',
    hasBlurEffect: true,
    aspectRatio: '465px'
  }
];

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
  return (
    <ClientsPartnersTemplate
      badgeText="WHO WE SUPPORT"
      title="Our Partners"
      cards={cards}
      interactionType="gradient"
      backgroundElements={backgroundElements}
    />
  );
}