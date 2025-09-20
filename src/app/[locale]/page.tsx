import { lazy, Suspense } from 'react';
import Hero from '@/components/Hero';

// Lazy load non-critical components for better TBT
const LogoCarousel = lazy(() => import('@/components/LogoCarousel'));
const HighImpactExperience = lazy(() => import('@/components/HighImpactExperience'));
const AboutServices = lazy(() => import('@/components/AboutServices'));
const WhyKayanLive = lazy(() => import('@/components/WhyKayanLive'));
const Industries = lazy(() => import('@/components/Industries'));
const WhereWeWork = lazy(() => import('@/components/WhereWeWork'));
const Achievements = lazy(() => import('@/components/Achievements'));
const CallToActionHero = lazy(() => import('@/components/CallToActionHero'));

// Loading placeholder with minimal height to prevent CLS
const LoadingPlaceholder = ({ height = 'h-96' }: { height?: string }) => (
  <div className={`${height} w-full`} />
);

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  void locale; // Required for Next.js App Router but not used directly

  return (
    <div>
      {/* Hero component within constrained width - Critical, no lazy loading */}
      <div>
        <Hero />
      </div>

      {/* High Impact Experience section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <HighImpactExperience />
      </Suspense>

      {/* Logo carousel - full viewport width */}
      <div className="-mx-4">
        <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
          <LogoCarousel />
        </Suspense>
      </div>

      {/* About & Services section */}
      <div className="-mx-4">
        <Suspense fallback={<LoadingPlaceholder />}>
          <AboutServices />
        </Suspense>
      </div>

      {/* Why KayanLive section */}
      <div className="-mx-4">
        <Suspense fallback={<LoadingPlaceholder />}>
          <WhyKayanLive />
        </Suspense>
      </div>

      {/* Industries section */}
      <div className="-mx-4">
        <Suspense fallback={<LoadingPlaceholder />}>
          <Industries />
        </Suspense>
      </div>

      {/* Where We Work section */}
      <div className="-mx-4">
        <Suspense fallback={<LoadingPlaceholder />}>
          <WhereWeWork />
        </Suspense>
      </div>

      {/* Achievements section */}
      <div className="-mx-4 mb-12 md:mb-20 lg:mb-32">
        <Suspense fallback={<LoadingPlaceholder />}>
          <Achievements />
        </Suspense>
      </div>

      {/* Call to Action Hero Section */}
      <div className="mb-6 md:mb-12 lg:mb-16">
        <Suspense fallback={<LoadingPlaceholder height="h-64" />}>
          <CallToActionHero />
        </Suspense>
      </div>

      {/* More content will be added here from Figma designs */}
    </div>
  );
}