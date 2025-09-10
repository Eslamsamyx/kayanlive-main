import ContactHero from '@/components/ContactHero';
import ContactForm from '@/components/ContactForm';

export default async function ContactPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // locale is required for Next.js App Router but not used directly in this component

  return (
    <div>
      {/* Contact Hero Section - Figma Design */}
      <div className="mx-3 mb-4 sm:mx-4 sm:mb-6 md:mx-6 md:mb-8 lg:mb-10">
        <ContactHero />
      </div>
      
      {/* Contact Form Section - Figma Design */}
      <div className="-mx-4">
        <ContactForm />
      </div>
    </div>
  );
}