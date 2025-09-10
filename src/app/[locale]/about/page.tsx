import AboutHero from '@/components/AboutHero';
import AboutOrigin from '@/components/AboutOrigin';
import AboutValues from '@/components/AboutValues';
import CallToActionBanner from '@/components/CallToActionBanner';

export default async function AboutUsPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // locale is required for Next.js App Router but not used directly in this component

  return (
    <div>
      {/* Hero Section - Figma Design */}
      <div className="mx-4">
        <AboutHero />
      </div>

      {/* Origin Section - Figma Design */}
      <div className="-mx-4">
        <AboutOrigin />
      </div>

      {/* Values Section - Figma Design */}
      <div className="-mx-4">
        <AboutValues />
      </div>

      {/* How We Work Section */}
      <div className="-mx-4">
        <CallToActionBanner
          title=""
          subtitle="Ready to transform your next event into an unforgettable experience?"
          buttonText="Start Your Project"
          topPadding="pt-0"
          bottomPadding="pb-24"
        />
      </div>
    </div>
  );
}