import ServicesHero from '@/components/ServicesHero';
import ServicesGrid from '@/components/ServicesGrid';
import ExperienceCenters from '@/components/ExperienceCenters';
import NotSureWhereToStart from '@/components/NotSureWhereToStart';

export default async function ServicesPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;

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


      {/* Not Sure Where To Start Section - Figma Design */}
      <div className="-mx-4">
        <NotSureWhereToStart />
      </div>
    </div>
  );
}