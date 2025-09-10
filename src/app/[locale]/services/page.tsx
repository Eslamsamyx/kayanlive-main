import ServicesHero from '@/components/ServicesHero';
import ServicesGrid from '@/components/ServicesGrid';
import ExperienceCenters from '@/components/ExperienceCenters';
import CallToActionBanner from '@/components/CallToActionBanner';

export default async function ServicesPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // locale is required for Next.js App Router but not used directly in this component

  return (
    <div>
      {/* Services Hero Section - Using same design as About page */}
      <div className="mb-8">
        <ServicesHero />
      </div>

      {/* Services Grid - Figma Design */}
      <div className="mb-16">
        <ServicesGrid />
      </div>

      {/* Experience Centers and Permanent Installations */}
      <div className="mb-16">
        <ExperienceCenters />
      </div>


      {/* Not Sure Where To Start Section - Optimized spacing */}
      <div className="-mx-4">
        <div className="bg-white w-full py-12 md:py-16">
          <div className="max-w-[1600px] mx-auto px-4 md:px-20">
            {/* Custom styled title that should remain */}
            <div className="text-center mb-6">
              <h1 
                className="font-bold text-[90px] leading-[85px] capitalize tracking-[-2.7px]"
                style={{
                  fontFamily: "'FONTSPRING DEMO - Visby CF Demi Bold', sans-serif"
                }}
              >
                <span 
                  style={{
                    background: 'linear-gradient(to right, #a095e1, #74cfaa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Not Sure Where{' '}
                </span>
                <span className="text-[#2c2c2b]">
                  To Start?
                </span>
              </h1>
            </div>
          </div>
        </div>
        
        {/* Use CallToActionBanner for the actual CTA */}
        <CallToActionBanner
          title=""
          subtitle="Every project begins with a single conversation."
          buttonText="Speak With Our Strategy Team"
          topPadding="pt-0"
          bottomPadding="pb-12 md:pb-16"
        />
      </div>
    </div>
  );
}