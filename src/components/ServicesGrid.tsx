'use client';

import { useTranslations } from 'next-intl';

// Assets from Figma
const imgRectangle4242 = "/assets/e05fec393f295d237ade9dff2ad26793496382ba.png"; // 2D/3D Content
const imgRectangle4243 = "/assets/8980a40c08a52f165b1c17b24158f20160d003cc.png"; // Video Editing
const imgRectangle4244 = "/assets/273cea28658e9744d1cd2fbc64a5ba1ac7deeff8.png"; // Conferences
const imgRectangle4245 = "/assets/44d602b7f7ce040ad9592bf1e21de743a7ce86d1.png"; // Hologram
const imgRectangle4246 = "/assets/a255a0faf04e8dcc9b85bbbb16bca93169de897f.png"; // Interactive
const imgRectangle4247 = "/assets/123269087423c903b101b9352bd92acdab49d86a.png"; // Corporate Events
const imgRectangle4248 = "/assets/d4096bba6c0158e37ce51f8a24f9565b007aaa92.png"; // Immersive AV
const imgRectangle4249 = "/assets/409f7073bcfac7c1d7eea78ab2e23cc10f6a16fb.png"; // Tech Driven
const imgRectangle4250 = "/assets/cf27cb2a37e9e3bfd30c1ada4fe4988496b10bbb.png"; // Live Events

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