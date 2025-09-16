import WorkHero from '@/components/WorkHero';
import WorkPreview from '@/components/WorkPreview';
import WorkStatement from '@/components/WorkStatement';
import WorkOutcomes from '@/components/WorkOutcomes';
import WorkCallToAction from '@/components/WorkCallToAction';

export default async function WorkPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  void locale; // Required for Next.js App Router but not used directly  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // locale is required for Next.js App Router but not used directly in this component

  return (
    <div>
      {/* Hero Section - Figma Design */}
      <div className="mx-4 md:mx-8 lg:mx-0 mb-6 md:mb-12 lg:mb-16">
        <WorkHero />
      </div>
      
      {/* Work Preview Section - Coming Soon */}
      <div className="mx-4 md:mx-8 lg:mx-0">
        <WorkPreview />
      </div>
      
      {/* Work Statement Section - Break out to full width */}
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
        <WorkStatement />
      </div>
      
      {/* Work Outcomes Section - Break out to full width */}
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
        <WorkOutcomes />
      </div>
      
      {/* Work Call to Action Section - Break out to full width */}
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
        <WorkCallToAction />
      </div>
    </div>
  );
}