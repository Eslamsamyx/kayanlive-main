import Hero from '@/components/Hero';
import LogoCarousel from '@/components/LogoCarousel';
import HighImpactExperience from '@/components/HighImpactExperience';
import AboutServices from '@/components/AboutServices';
import WhyKayanLive from '@/components/WhyKayanLive';
import Industries from '@/components/Industries';
import WhereWeWork from '@/components/WhereWeWork';
import CallToActionBanner from '@/components/CallToActionBanner';
import Achievements from '@/components/Achievements';
import ConcertCrowd from '@/components/ConcertCrowd';
import CallToActionHero from '@/components/CallToActionHero';

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // locale is required for Next.js App Router but not used directly in this component

  return (
    <div>
      {/* Hero component within constrained width */}
      <div>
        <Hero />
      </div>
      
      {/* Logo carousel - full viewport width */}
      <div className="-mx-4">
        <LogoCarousel />
      </div>
      
      {/* High Impact Experience section */}
      <HighImpactExperience />
      
      {/* About & Services section */}
      <div className="-mx-4">
        <AboutServices />
      </div>
      
      {/* Why KayanLive section */}
      <div className="-mx-4">
        <WhyKayanLive />
      </div>
      
      {/* Industries section */}
      <div className="-mx-4">
        <Industries />
      </div>
      
      {/* Where We Work section - Information only */}
      <div className="bg-white w-full py-24">
        <div className="max-w-[1600px] mx-auto px-20">
          {/* Top Section - Where We Work */}
          <div className="flex justify-between gap-7 items-end mb-24">
            {/* Left Column */}
            <div className="flex flex-col gap-[30px] flex-1 max-w-[543px]">
              {/* Badge */}
              <div 
                className="inline-flex items-center justify-center rounded-[900px] border border-[#7afdd6] bg-[rgba(122,253,214,0.26)]"
                style={{ width: '225px', height: '62px' }}
              >
                <span className="text-[#42967d] text-[20px] uppercase">Where We Work</span>
              </div>
              
              {/* Description */}
              <p className="text-[#808184] text-[24px] leading-[32px] capitalize">
                Headquartered in Saudi Arabia and Dubai, KayanLive delivers high-impact events, from public activations
                and corporate launches to government-led showcases.
              </p>
            </div>

            {/* Right Column - Locations */}
            <div className="flex flex-col gap-6 flex-1 max-w-[697px]">
              <p className="text-[#808184] text-[24px] leading-[32px] capitalize">
                We operate across the GCC:
              </p>
              
              {/* Location Items */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-[9px]">
                  <img src="/assets/d57e8b023cc2954fe2c89c41bd7f2153074ba9c1.svg" alt="" className="w-[30px] h-[30px]" />
                  <p className="text-[24px] leading-[32px] capitalize">
                    <span className="font-bold text-[#231f20]">Riyadh, Jeddah, Dammam</span>
                    <span className="text-[#231f20]">, and key </span>
                    <span className="font-bold text-[#7afdd6]">Saudi</span>
                    <span className="text-[#231f20]"> cities</span>
                  </p>
                </div>
                
                <div className="flex items-center gap-[9px]">
                  <img src="/assets/d57e8b023cc2954fe2c89c41bd7f2153074ba9c1.svg" alt="" className="w-[30px] h-[30px]" />
                  <p className="text-[24px] leading-[32px] capitalize">
                    <span className="font-bold text-[#231f20]">Dubai, Abu Dhabi, Sharjah, </span>
                    <span className="text-[#231f20]">and the wider</span>
                    <span className="font-bold text-[#231f20]"> UAE</span>
                  </p>
                </div>
                
                <div className="flex items-start gap-[9px]">
                  <img src="/assets/d57e8b023cc2954fe2c89c41bd7f2153074ba9c1.svg" alt="" className="w-[30px] h-[30px] mt-[2px]" />
                  <p className="text-[24px] leading-[32px] capitalize">
                    <span className="text-[#231f20]">And through partner networks in</span>
                    <span className="font-bold text-[#231f20]"> Qatar, Oman, Bahrain, and Kuwait</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Where We Work CTA Section */}
      <CallToActionBanner
        title=""
        subtitle="Planning an event outside the uae or saudi arabia?"
        buttonText="Let's Build Together"
        topPadding="pt-0"
        bottomPadding="pb-24"
      />
      
      {/* Achievements section */}
      <div className="-mx-4">
        <Achievements />
      </div>
      
      {/* Concert Crowd section */}
      <div className="-mx-4">
        <ConcertCrowd />
      </div>
      
      {/* Call to Action Hero Section */}
      <div className="mb-8">
        <CallToActionHero />
      </div>
      
      {/* More content will be added here from Figma designs */}
    </div>
  );
}