'use client';

import { useTranslations } from 'next-intl';

// Assets - Optimized WebP images
const imgRectangle4242 = "/optimized/services/80ad948f4065ef9e73a5bf9a2fb549550f90c7f5-2d3d-content.webp"; // 2D/3D Content
const imgRectangle4243 = "/optimized/services/09c57547d4c21d396c949e30053ab34cc6499b76-video-editing.webp"; // Video Editing
const imgRectangle4244 = "/optimized/services/f21289af237ba8b0accd342cf7b894720b6b1299-conferences.webp"; // Conferences
const imgRectangle4245 = "/optimized/services/b661c5a1a48d7742ea9ef3459455d77e8b377da5-hologram.webp"; // Hologram
const imgRectangle4246 = "/optimized/services/567351465bb7326906b2647a7079cc20507cfee2-interactive.webp"; // Interactive
const imgRectangle4247 = "/optimized/services/caa3a76751ed7b0ce8d0261c64ca0ade41740ad0-corporate-events.webp"; // Corporate Events
const imgRectangle4248 = "/optimized/services/4a4404b9deab0d8db2e3447a890ea7d15adafbe6-immersive-av.webp"; // Immersive AV
const imgRectangle4249 = "/optimized/services/058946f6837a925f5d96ea636d1c3c3c4ca3abdb-tech-driven.webp"; // Tech Driven
const imgRectangle4250 = "/optimized/services/90a62ba64674d19ad8ac0b613d6a845796a974ce-live-events.webp"; // Live Events

export default function ServicesGrid() {
  const t = useTranslations('services.grid');

  return (
    <section className="relative w-full" aria-labelledby="services-grid-title">
      <h2 id="services-grid-title" className="sr-only">{t('screenReaderTitle')}</h2>
      {/* Services Grid Container */}
      <div 
        className="box-border grid gap-4 md:gap-7 py-6 md:py-9"
        style={{
          gridTemplateColumns: 'repeat(2, minmax(0px, 1fr))',
          gridTemplateRows: 'repeat(6, minmax(0px, 1fr))'
        }}
        role="grid"
        aria-label="Services overview grid"
      >
        {/* Row 1: 2D, 3D Content Development - Full Width */}
        <div 
          className="col-span-2 bg-cover bg-center bg-no-repeat overflow-hidden relative rounded-[30px] md:rounded-[61px]"
          style={{ 
            backgroundImage: `url('${imgRectangle4242}')`,
            height: 'clamp(300px, 45vw, 600px)'
          }}
          role="article"
          aria-labelledby="service-2d-3d-title"
          aria-describedby="service-2d-3d-description"
        >
          {/* Dark Blur Overlay - Bottom positioned for text contrast */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3">
            <div 
              className="bg-[#1a1a1a] blur-[60px] filter w-full h-full opacity-80"
            />
          </div>
          
          {/* Content */}
          <div className="absolute bottom-6 md:bottom-12 right-4 md:right-12 text-right p-4 md:p-0" style={{ maxWidth: 'clamp(300px, 87vw, 1315px)' }}>
            <h3 
              id="service-2d-3d-title"
              className="text-white font-bold mb-4 md:mb-7 capitalize"
              style={{
                fontSize: 'clamp(24px, 3.5vw, 50px)',
                lineHeight: 'clamp(26px, 3.6vw, 52px)',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {t('services.2d3dContent.title')}
            </h3>
            <p
              id="service-2d-3d-description"
              className="text-[#cfcfcf] font-medium"
              style={{
                fontSize: 'clamp(14px, 1.5vw, 22px)',
                lineHeight: 'clamp(18px, 1.9vw, 28px)',
                maxWidth: 'clamp(280px, 86vw, 1298px)',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {t('services.2d3dContent.description')}
            </p>
          </div>
        </div>

        {/* Row 2 Left: Video Editing - Half Width */}
        <div 
          className="bg-cover bg-center bg-no-repeat overflow-hidden relative rounded-[30px] md:rounded-[61px]"
          style={{ 
            backgroundImage: `url('${imgRectangle4243}')`,
            height: 'clamp(300px, 45vw, 600px)'
          }}
          role="article"
          aria-labelledby="service-video-editing-title"
          aria-describedby="service-video-editing-description"
        >
          {/* Dark Blur Overlay - Bottom positioned for text contrast */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3">
            <div 
              className="bg-[#1a1a1a] blur-[60px] filter w-full h-full opacity-80"
            />
          </div>
          
          {/* Content */}
          <div className="absolute bottom-6 md:bottom-12 right-4 md:right-[53px] text-right p-4 md:p-0">
            <h3 
              id="service-video-editing-title"
              className="text-white font-bold capitalize"
              style={{
                fontSize: 'clamp(24px, 3.3vw, 50px)',
                lineHeight: 'clamp(26px, 3.4vw, 52px)',
                maxWidth: 'clamp(280px, 39.4vw, 596px)',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {t('services.videoEditing.title')}
            </h3>
            <div id="service-video-editing-description" className="sr-only">
              {t('services.videoEditing.description')}
            </div>
          </div>
        </div>

        {/* Row 2 Right: Conferences and Forums - Half Width */}
        <div 
          className="bg-cover bg-center bg-no-repeat overflow-hidden relative rounded-[30px] md:rounded-[61px]"
          style={{ 
            backgroundImage: `url('${imgRectangle4244}')`,
            height: 'clamp(300px, 45vw, 600px)'
          }}
          role="article"
          aria-labelledby="service-conferences-title"
          aria-describedby="service-conferences-description"
        >
          {/* Dark Blur Overlay - Bottom positioned for text contrast */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3">
            <div 
              className="bg-[#1a1a1a] blur-[60px] filter w-full h-full opacity-80"
            />
          </div>
          
          {/* Content */}
          <div className="absolute bottom-6 md:bottom-12 right-4 md:right-[50px] text-right p-4 md:p-0">
            <h3 
              id="service-conferences-title"
              className="text-white font-bold capitalize"
              style={{
                fontSize: 'clamp(24px, 3.3vw, 50px)',
                lineHeight: 'clamp(26px, 3.4vw, 52px)',
                maxWidth: 'clamp(190px, 24.9vw, 377px)',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {t('services.conferences.title')}
            </h3>
            <div id="service-conferences-description" className="sr-only">
              {t('services.conferences.description')}
            </div>
          </div>
        </div>

        {/* Row 3: Hologram Activations - Full Width */}
        <div 
          className="col-span-2 bg-cover bg-center bg-no-repeat overflow-hidden relative rounded-[30px] md:rounded-[61px]"
          style={{ 
            backgroundImage: `url('${imgRectangle4245}')`,
            height: 'clamp(300px, 45vw, 600px)'
          }}
          role="article"
          aria-labelledby="service-hologram-title"
          aria-describedby="service-hologram-description"
        >
          {/* Dark Blur Overlay - Bottom positioned for text contrast */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3">
            <div 
              className="bg-[#1a1a1a] blur-[60px] filter w-full h-full opacity-80"
            />
          </div>
          
          {/* Content */}
          <div className="absolute bottom-6 md:bottom-12 right-4 md:right-12 text-right p-4 md:p-0">
            <h3 
              id="service-hologram-title"
              className="text-white font-bold capitalize"
              style={{
                fontSize: 'clamp(28px, 3.5vw, 50px)',
                lineHeight: 'clamp(30px, 3.6vw, 52px)',
                maxWidth: 'clamp(530px, 70.2vw, 1061px)',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {t('services.hologramActivations.title')}
            </h3>
            <div id="service-hologram-description" className="sr-only">
              {t('services.hologramActivations.description')}
            </div>
          </div>
        </div>

        {/* Row 4 Left: Interactive Activations - Half Width */}
        <div 
          className="bg-cover bg-center bg-no-repeat overflow-hidden relative rounded-[30px] md:rounded-[61px]"
          style={{ 
            backgroundImage: `url('${imgRectangle4246}')`,
            height: 'clamp(300px, 45vw, 600px)'
          }}
          role="article"
          aria-labelledby="service-interactive-title"
          aria-describedby="service-interactive-description"
        >
          {/* Dark Blur Overlay - Bottom positioned for text contrast */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3">
            <div 
              className="bg-[#1a1a1a] blur-[60px] filter w-full h-full opacity-80"
            />
          </div>
          
          {/* Content */}
          <div className="absolute bottom-6 md:bottom-12 right-1/2 translate-x-1/2 text-center p-4 md:p-0">
            <h3 
              id="service-interactive-title"
              className="text-white font-bold capitalize"
              style={{
                fontSize: 'clamp(24px, 3.3vw, 50px)',
                lineHeight: 'clamp(26px, 3.4vw, 52px)',
                maxWidth: 'clamp(290px, 38.8vw, 586px)',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {t('services.interactiveActivations.title')}
            </h3>
            <div id="service-interactive-description" className="sr-only">
              {t('services.interactiveActivations.description')}
            </div>
          </div>
        </div>

        {/* Row 4 Right: Live Events Entertainment Shows - Half Width */}
        <div 
          className="bg-cover bg-center bg-no-repeat overflow-hidden relative rounded-[30px] md:rounded-[61px]"
          style={{ 
            backgroundImage: `url('${imgRectangle4250}')`,
            height: 'clamp(300px, 45vw, 600px)'
          }}
          role="article"
          aria-labelledby="service-live-events-title"
          aria-describedby="service-live-events-description"
        >
          {/* Dark Blur Overlay - Bottom positioned for text contrast */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3">
            <div 
              className="bg-[#1a1a1a] blur-[60px] filter w-full h-full opacity-80"
            />
          </div>
          
          {/* Content */}
          <div className="absolute bottom-6 md:bottom-12 right-4 md:right-[53px] text-right p-4 md:p-0">
            <h3 
              id="service-live-events-title"
              className="text-white font-bold capitalize"
              style={{
                fontSize: 'clamp(24px, 3.3vw, 50px)',
                lineHeight: 'clamp(26px, 3.4vw, 52px)',
                maxWidth: 'clamp(290px, 39.4vw, 596px)',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {t('services.liveEvents.title')}
            </h3>
            <div id="service-live-events-description" className="sr-only">
              {t('services.liveEvents.description')}
            </div>
          </div>
        </div>

        {/* Row 5: Corporate Events - Full Width */}
        <div 
          className="col-span-2 bg-cover bg-center bg-no-repeat overflow-hidden relative rounded-[30px] md:rounded-[61px]"
          style={{ 
            backgroundImage: `url('${imgRectangle4247}')`,
            height: 'clamp(300px, 45vw, 600px)'
          }}
          role="article"
          aria-labelledby="service-corporate-title"
          aria-describedby="service-corporate-description"
        >
          {/* Dark Blur Overlay - Bottom positioned for text contrast */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3">
            <div 
              className="bg-[#1a1a1a] blur-[60px] filter w-full h-full opacity-80"
            />
          </div>
          
          {/* Content */}
          <div className="absolute bottom-6 md:bottom-12 right-4 md:right-12 text-right p-4 md:p-0">
            <h3 
              id="service-corporate-title"
              className="text-white font-bold capitalize"
              style={{
                fontSize: 'clamp(28px, 3.5vw, 50px)',
                lineHeight: 'clamp(30px, 3.6vw, 52px)',
                maxWidth: 'clamp(530px, 70.2vw, 1061px)',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {t('services.corporateEvents.title')}
            </h3>
            <div id="service-corporate-description" className="sr-only">
              {t('services.corporateEvents.description')}
            </div>
          </div>
        </div>

        {/* Row 6 Left: Immersive AV Production - Half Width */}
        <div 
          className="bg-cover bg-center bg-no-repeat overflow-hidden relative rounded-[30px] md:rounded-[61px]"
          style={{ 
            backgroundImage: `url('${imgRectangle4248}')`,
            height: 'clamp(300px, 45vw, 600px)'
          }}
          role="article"
          aria-labelledby="service-av-production-title"
          aria-describedby="service-av-production-description"
        >
          {/* Dark Blur Overlay - Bottom positioned for text contrast */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3">
            <div 
              className="bg-[#1a1a1a] blur-[60px] filter w-full h-full opacity-80"
            />
          </div>
          
          {/* Content */}
          <div className="absolute bottom-6 md:bottom-12 right-4 md:right-[53px] text-right p-4 md:p-0">
            <h3 
              id="service-av-production-title"
              className="text-white font-bold capitalize"
              style={{
                fontSize: 'clamp(24px, 3.3vw, 50px)',
                lineHeight: 'clamp(26px, 3.4vw, 52px)',
                maxWidth: 'clamp(282px, 37.3vw, 564px)',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {t('services.immersiveAV.title')}
            </h3>
            <div id="service-av-production-description" className="sr-only">
              {t('services.immersiveAV.description')}
            </div>
          </div>
        </div>

        {/* Row 6 Right: Tech Driven Activations - Half Width */}
        <div 
          className="bg-cover bg-center bg-no-repeat overflow-hidden relative rounded-[30px] md:rounded-[61px]"
          style={{ 
            backgroundImage: `url('${imgRectangle4249}')`,
            height: 'clamp(300px, 45vw, 600px)'
          }}
          role="article"
          aria-labelledby="service-tech-driven-title"
          aria-describedby="service-tech-driven-description"
        >
          {/* Dark Blur Overlay - Bottom positioned for text contrast */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3">
            <div 
              className="bg-[#1a1a1a] blur-[60px] filter w-full h-full opacity-80"
            />
          </div>
          
          {/* Content */}
          <div className="absolute bottom-6 md:bottom-12 right-4 md:right-[53px] text-right p-4 md:p-0">
            <h3 
              id="service-tech-driven-title"
              className="text-white font-bold capitalize"
              style={{
                fontSize: 'clamp(24px, 3.3vw, 50px)',
                lineHeight: 'clamp(26px, 3.4vw, 52px)',
                maxWidth: 'clamp(242px, 32vw, 484px)',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {t('services.techDriven.title')}
            </h3>
            <div id="service-tech-driven-description" className="sr-only">
              {t('services.techDriven.description')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}