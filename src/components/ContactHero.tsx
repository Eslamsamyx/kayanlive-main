import HeroTemplate from './HeroTemplate';

export default function ContactHero() {
  return (
    <HeroTemplate
      ariaLabel="Contact KayanLive hero section"
      mobileTitle="Contact Us"
      mobileSubtitleGradient={["Precision Built.", "Pressure Tested."]}
      mobileSubtitleWhite="Experience Driven."
      mobileBodyParagraphs={[
        "KayanLive delivers structured, high-impact events in the UAE and Saudi Arabia, and across the broader GCC, designed with creative ambition and executed with operational certainty.",
        "",
        "We operate as a full-service KSA event company, also operating in the UAE with deep regional reach. Every service listed here represents a seamless fusion of speed, scale, and strategy."
      ]}
      desktopTitle="Contact Us"
      desktopScreenReaderTitle="Contact KayanLive"
      desktopSubtitleGradient="Looking for the best event"
      desktopSubtitleWhite="management company?"
      desktopBodyParagraphs={[
        "Some reach out with a detailed brief and a six-month runway. Others call when the venue is locked and nothing else is. Either way, we are ready.",
        "",
        "As a leading event agency, KayanLive responds with structure, speed, and clear next steps—no matter where the starting line is."
      ]}
    />
  );
}