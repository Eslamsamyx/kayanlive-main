import AboutHero from '@/components/AboutHero';
import AboutOrigin from '@/components/AboutOrigin';
import AboutValues from '@/components/AboutValuesSimple';
import HowWeWork from '@/components/HowWeWork';

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
      <div className="mx-4 mb-8">
        <AboutHero />
      </div>

      {/* Origin Section - Figma Design */}
      <div className="-mx-4 mb-8">
        <AboutOrigin />
      </div>

      {/* Values Section - Figma Design */}
      <div className="-mx-4">
        <AboutValues />
      </div>

      {/* How We Work Section */}
      <div className="-mx-4">
        <HowWeWork />
      </div>
    </div>
  );
}