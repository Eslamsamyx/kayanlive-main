import ContactHero from '@/components/ContactHero';
import ContactForm from '@/components/ContactForm';

export default async function ContactPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;

  return (
    <div>
      {/* Contact Hero Section - Figma Design */}
      <div className="mx-3 mb-4 sm:mx-4 sm:mb-6 lg:mb-8">
        <ContactHero />
      </div>
      
      {/* Contact Form Section - Figma Design */}
      <div className="-mx-4">
        <ContactForm />
      </div>
    </div>
  );
}