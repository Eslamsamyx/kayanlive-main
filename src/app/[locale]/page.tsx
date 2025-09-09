import Hero from '@/components/Hero';
import LogoCarousel from '@/components/LogoCarousel';
import HighImpactExperience from '@/components/HighImpactExperience';
import AboutServices from '@/components/AboutServices';
import WhyKayanLive from '@/components/WhyKayanLive';
import Industries from '@/components/Industries';
import WhereWeWork from '@/components/WhereWeWork';
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
      
      {/* Where We Work section */}
      <WhereWeWork />
      
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