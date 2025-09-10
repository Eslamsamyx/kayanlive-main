'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export interface CardConfig {
  id: string;
  image: string;
  layout: 'bottom' | 'center';
  title: string;
  description?: string;
  mobileTitle?: string;
  mobileDescription?: string;
  desktopTitle?: string;
  desktopDescription?: string;
  gradientOverlay: string;
  gradientHoverOverlay?: string;
  hasBlurEffect?: boolean;
  aspectRatio?: string;
}

export interface BackgroundElement {
  type: 'ellipse' | 'pattern' | 'diamond' | 'moving-ellipse';
  position: { x?: string; y?: string; width: string; height: string; top?: string; bottom?: string; left?: string; right?: string };
  style: React.CSSProperties;
  className?: string;
  src?: string;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

export interface ClientsPartnersTemplateProps {
  badgeText: string;
  badgeWidth?: string;
  title: string;
  cards: CardConfig[];
  interactionType: 'gradient' | 'ellipses' | 'none';
  backgroundElements: BackgroundElement[];
  containerClass?: string;
}

export default function ClientsPartnersTemplate({
  badgeText,
  badgeWidth = '266px',
  title,
  cards,
  interactionType = 'none',
  backgroundElements = [],
  containerClass = ''
}: ClientsPartnersTemplateProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect touch device and window width
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    setWindowWidth(window.innerWidth);
    
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePosition({ x, y });
      }
    };

    if (interactionType !== 'none') {
      const container = containerRef.current;
      if (container) {
        container.addEventListener('mousemove', handleMouseMove);
        return () => {
          container.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('resize', handleResize);
        };
      }
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [interactionType, isHovering, isTouchDevice]);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  // Calculate responsive values
  const getResponsiveValue = (mobileValue: string, desktopValue: string) => {
    return isMobile ? mobileValue : desktopValue;
  };

  const getClampValue = (property: string) => {
    switch (property) {
      case 'titleFontSize':
        return `clamp(70px, 10vw, 150px)`;
      case 'titleLineHeight':
        return `clamp(75px, 11vw, 160px)`;
      case 'cardHeight':
        return `clamp(320px, 50vw, 465px)`;
      case 'cardTitleSize':
        return `clamp(30px, 8vw, 50px)`;
      case 'cardTitleLineHeight':
        return `clamp(30px, 8vw, 44px)`;
      default:
        return '1rem';
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{
        backgroundColor: '#2c2c2b',
        position: 'relative',
        width: '100vw',
        paddingTop: isMobile ? '48px' : isTablet ? '64px' : '80px',
        paddingBottom: isMobile ? '48px' : isTablet ? '64px' : '80px',
        paddingLeft: isMobile ? '40px' : '64px',
        paddingRight: isMobile ? '40px' : '64px',
        overflow: 'hidden',
        ...((containerClass.includes('py-12') || containerClass.includes('py-16') || containerClass.includes('py-20')) && {
          paddingTop: isMobile ? '48px' : isTablet ? '64px' : '80px',
          paddingBottom: isMobile ? '48px' : isTablet ? '64px' : '80px'
        })
      }}
      onMouseEnter={() => !isTouchDevice && setIsHovering(true)}
      onMouseLeave={() => !isTouchDevice && setIsHovering(false)}
    >
      {/* Render Background Elements */}
      {backgroundElements.map((element, index) => {
        // Handle responsive visibility
        if (element.mobileOnly && !isMobile) return null;
        if (element.desktopOnly && isMobile) return null;
        if (element.className?.includes('md:hidden') && !isMobile) return null;
        if (element.className?.includes('hidden md:block') && isMobile) return null;

        if (element.type === 'moving-ellipse' && interactionType === 'ellipses') {
          // OurPartners style moving ellipses
          const offsetX = index === 0 ? -226 : -150;
          const offsetY = index === 0 ? -341 : -200;
          
          return (
            <div 
              key={`moving-ellipse-${index}`}
              style={{
                position: 'absolute',
                display: isMobile ? 'none' : 'block',
                left: `${mousePosition.x + offsetX}px`,
                top: `${mousePosition.y + offsetY}px`,
                width: element.position.width,
                height: element.position.height,
                transition: `all ${index === 0 ? '500ms' : '700ms'} ease-out`,
                pointerEvents: 'none'
              }}
            >
              <div style={{
                position: 'absolute',
                inset: '-58.57% -88.5%'
              }}>
                {element.src && (
                  <Image
                    src={element.src}
                    alt=""
                    fill
                    style={{
                      display: 'block',
                      maxWidth: 'none',
                      width: '100%',
                      height: '100%',
                      opacity: 0.6,
                      objectFit: 'cover'
                    }}
                  />
                )}
              </div>
            </div>
          );
        }

        if (element.type === 'pattern' && element.src) {
          return (
            <div
              key={`pattern-${index}`}
              style={{
                position: 'absolute',
                backgroundImage: `url('${element.src}')`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                width: element.position.width,
                height: element.position.height,
                top: element.position.top,
                bottom: element.position.bottom,
                left: element.position.left,
                right: element.position.right,
                ...element.style
              }}
            />
          );
        }

        if (element.type === 'ellipse') {
          return (
            <div
              key={`ellipse-${index}`}
              style={{
                position: 'absolute',
                width: element.position.width,
                height: element.position.height,
                top: element.position.top,
                bottom: element.position.bottom,
                left: element.position.left,
                right: element.position.right
              }}
            >
              <div 
                style={{
                  position: 'absolute',
                  borderRadius: '50%',
                  width: element.position.width,
                  height: element.position.height,
                  ...element.style
                }}
              />
            </div>
          );
        }

        if (element.type === 'diamond') {
          return (
            <div
              key={`diamond-${index}`}
              style={{
                position: 'absolute',
                width: element.position.width,
                height: element.position.height,
                top: element.position.top,
                bottom: element.position.bottom,
                left: element.position.left,
                right: element.position.right,
                transform: 'rotate(45deg)',
                ...element.style
              }}
            />
          );
        }

        return null;
      })}

      {/* Industries-style cursor-following gradient effect */}
      {interactionType === 'gradient' && isHovering && !isTouchDevice && (
        <div 
          style={{ 
            position: 'absolute',
            pointerEvents: 'none',
            transition: 'opacity 300ms',
            width: '800px', 
            height: '800px',
            left: `${mousePosition.x - 400}px`,
            top: `${mousePosition.y - 400}px`,
            background: 'radial-gradient(circle, rgba(184, 164, 255, 0.3) 0%, rgba(122, 253, 214, 0.25) 30%, transparent 60%)',
            filter: 'blur(100px)',
            opacity: 0.6
          }}
        />
      )}

      {/* Main Content Container */}
      <div style={{
        position: 'relative',
        zIndex: 10
      }}>
        {/* Badge */}
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '12px 24px',
            borderRadius: '9999px',
            border: '2px solid #7afdd6',
            marginBottom: isMobile ? '24px' : '32px',
            width: badgeWidth,
            height: '62px',
            justifyContent: 'center'
          }}
        >
          <span style={{
            color: '#7afdd6',
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {badgeText}
          </span>
        </div>

        {/* Main Title */}
        <h1 
          style={{
            fontWeight: 'bold',
            marginBottom: isMobile ? '32px' : '64px',
            fontSize: getClampValue('titleFontSize'),
            lineHeight: getClampValue('titleLineHeight'),
            background: 'linear-gradient(135deg, #a095e1 0%, #74cfaa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: '"Poppins", sans-serif',
            letterSpacing: '-0.7px'
          }}
        >
          {title}
        </h1>

        {/* Cards Grid */}
        <div style={{
          display: isMobile ? 'flex' : 'grid',
          flexDirection: isMobile ? 'column' : undefined,
          gridTemplateColumns: isMobile ? undefined : 'repeat(2, 1fr)',
          gap: isMobile ? '24px' : '24px',
          width: '100%',
          maxWidth: isMobile ? '384px' : 'none',
          margin: isMobile ? '0 auto' : undefined
        }}>
          {cards.map((card, index) => (
            <div 
              key={card.id}
              style={{
                position: 'relative',
                borderRadius: isMobile ? '44px' : '24px',
                overflow: 'hidden',
                width: '100%',
                cursor: 'pointer',
                aspectRatio: card.aspectRatio?.includes('clamp') ? undefined : card.aspectRatio || '321/465',
                height: card.aspectRatio?.includes('clamp') ? getClampValue('cardHeight') : undefined,
                touchAction: 'manipulation'
              }}
              onMouseEnter={() => !isTouchDevice && setHoveredCardId(card.id)}
              onMouseLeave={() => !isTouchDevice && setHoveredCardId(null)}
            >
              {/* Background Image */}
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url('${card.image}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />

              {/* Overlay Logic */}
              {card.layout === 'bottom' ? (
                <>
                  {/* Mobile: Blur overlay at bottom */}
                  {isMobile && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '151px',
                      backdropFilter: card.hasBlurEffect ? 'blur(20px)' : 'none',
                      WebkitBackdropFilter: card.hasBlurEffect ? 'blur(20px)' : 'none'
                    }} />
                  )}
                  
                  {/* Desktop: Gradient overlay */}
                  {!isMobile && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '45%',
                      background: card.gradientOverlay
                    }} />
                  )}
                </>
              ) : (
                <>
                  {/* Default: Full overlay */}
                  <div 
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: isTouchDevice ? 0 : (hoveredCardId === card.id ? 0 : 1),
                      background: card.gradientOverlay,
                      transition: 'opacity 300ms'
                    }}
                  />
                  {/* Hover/Touch: Bottom overlay for mobile optimization */}
                  {card.gradientHoverOverlay && (
                    <div 
                      style={{
                        position: 'absolute',
                        height: '244px',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: card.gradientHoverOverlay,
                        backdropFilter: card.hasBlurEffect ? 'blur(20px)' : 'none',
                        maskImage: card.hasBlurEffect ? 'linear-gradient(180deg, transparent 0%, black 40%, black 100%)' : 'none',
                        WebkitMaskImage: card.hasBlurEffect ? 'linear-gradient(180deg, transparent 0%, black 40%, black 100%)' : 'none',
                        opacity: isTouchDevice ? 1 : (hoveredCardId === card.id ? 1 : 0),
                        transition: 'opacity 300ms'
                      }}
                    />
                  )}
                </>
              )}

              {/* Text Content */}
              {card.layout === 'bottom' ? (
                <div style={{
                  position: 'absolute',
                  bottom: isMobile ? '24px' : '32px',
                  left: isMobile ? '24px' : '32px',
                  right: isMobile ? '24px' : '32px'
                }}>
                  <h3 style={{
                    color: 'white',
                    fontWeight: 'bold',
                    marginBottom: isMobile ? '8px' : '12px',
                    lineHeight: 1.1,
                    fontSize: '20px',
                    fontFamily: '"Poppins", sans-serif'
                  }}>
                    {card.title}
                  </h3>
                  {/* Mobile description */}
                  {card.mobileDescription && isMobile && (
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '12px',
                      lineHeight: '16px',
                      fontFamily: '"Poppins", sans-serif'
                    }}>
                      {card.mobileDescription}
                    </p>
                  )}
                  {/* Desktop description */}
                  {card.desktopDescription && !isMobile && (
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '14px'
                    }}>
                      {card.desktopDescription}
                    </p>
                  )}
                  {/* Regular description */}
                  {card.description && !card.mobileDescription && !card.desktopDescription && (
                    <p style={{
                      color: 'white',
                      fontSize: getResponsiveValue('14px', '16px'),
                      lineHeight: getResponsiveValue('18px', '22px')
                    }}>
                      {card.description}
                    </p>
                  )}
                </div>
              ) : (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '32px'
                }}>
                  <h3 style={{
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    lineHeight: 1.1,
                    fontSize: getClampValue('cardTitleSize'),
                    fontFamily: '"Poppins", sans-serif'
                  }}>
                    {/* Mobile title variation */}
                    {card.mobileTitle && isMobile && (
                      <span dangerouslySetInnerHTML={{ __html: card.mobileTitle }} />
                    )}
                    {/* Desktop title variation */}
                    {card.desktopTitle && !isMobile && (
                      <span dangerouslySetInnerHTML={{ __html: card.desktopTitle }} />
                    )}
                    {/* Regular title */}
                    {!card.mobileTitle && !card.desktopTitle && card.title}
                  </h3>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}