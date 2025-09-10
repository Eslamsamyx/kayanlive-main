import HeroTemplate from './HeroTemplate';

export default function ServicesHero() {
  return (
    <HeroTemplate
      ariaLabel="Our Services hero section"
      mobileTitle="Our Services"
      mobileSubtitleGradient={["Precision Built.", "Pressure Tested."]}
      mobileSubtitleWhite="Experience Driven."
      mobileBodyParagraphs={[
        "KayanLive delivers structured, high-impact events in the UAE and Saudi Arabia, and across the broader GCC, designed with creative ambition and executed with operational certainty.",
        "",
        "We operate as a full-service KSA event company, also operating in the UAE with deep regional reach. Every service listed here represents a seamless fusion of speed, scale, and strategy."
      ]}
      desktopTitle="Our Services"
      desktopScreenReaderTitle="KayanLive Services"
      desktopSubtitleGradient="Precision Built. Pressure Tested."
      desktopSubtitleWhite="Experience Driven."
      desktopBodyParagraphs={[
        "KayanLive delivers structured, high-impact events in the UAE and Saudi Arabia, and across the broader GCC, designed with creative ambition and executed with operational certainty.",
        "",
        "We operate as a full-service KSA event company, also operating in the UAE with deep regional reach. Every service listed here represents a seamless fusion of speed, scale, and strategy."
      ]}
    />
  );
}