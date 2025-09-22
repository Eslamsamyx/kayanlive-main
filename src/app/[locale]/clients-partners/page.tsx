import ClientsPartnersHero from '@/components/ClientsPartnersHero';
import ClientsPartnersContent from '@/components/ClientsPartnersContent';
import OurPartners from '@/components/OurPartners';
import CallToActionBanner from '@/components/CallToActionBanner';
import { getTranslations } from 'next-intl/server';

export default async function ClientsPartnersPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  void locale; // Required for Next.js App Router but not used directly  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = await getTranslations({ locale, namespace: 'clientsPartners' });

  return (
    <div>
      {/* Hero Section Component */}
      <ClientsPartnersHero />

      {/* Full-Width Content Section */}
      <div className="-mx-4 relative min-h-[600px] bg-white px-4 md:px-8 lg:px-20">
        <ClientsPartnersContent />
      </div>

      {/* Our Partners Section */}
      <div className="-mx-4 mb-6 md:mb-12 lg:mb-16">
        <OurPartners />
      </div>

      {/* Join Our Network Section */}
      <div className="-mx-4 mb-6 md:mb-12 lg:mb-16">
        <CallToActionBanner
          title={t('joinNetwork.title')}
          subtitle={t('joinNetwork.subtitle')}
          buttonText={t('joinNetwork.buttonText')}
        />
      </div>
    </div>
  );
}