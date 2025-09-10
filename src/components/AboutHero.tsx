import HeroTemplate from './HeroTemplate';

export default function AboutHero() {
  return (
    <HeroTemplate
      ariaLabel="About KayanLive hero section"
      mobileTitle="About Us"
      mobileSubtitleGradient={["Strategy Built for Urgency."]}
      mobileSubtitleWhite="Vision Built for Impact."
      mobileBodyParagraphs={[
        "KayanLive transforms pressure into performance. As a purpose-led top event agency based in the GCC with active operations across the UAE and Saudi Arabia, we create experiences that are fast to deploy, precise in execution, and bold in outcome. When timing is tight and expectations are high, our structure remains firm—and your vision moves forward with clarity.",
        "",
        "Events delivered through KayanLive reach farther, feel sharper, and last longer. Each project is built to lead, not follow.",
        "We understand how high-stakes delivery shapes national initiatives."
      ]}
      desktopTitle="About Us"
      desktopScreenReaderTitle="About KayanLive"
      desktopSubtitleGradient="Strategy Built for Urgency."
      desktopSubtitleWhite="Vision Built for Impact."
      desktopBodyParagraphs={[
        "KayanLive transforms pressure into performance. As a purpose-led top event agency based in the GCC with active operations across the UAE and Saudi Arabia, we create experiences that are fast to deploy, precise in execution, and bold in outcome. When timing is tight and expectations are high, our structure remains firm—and your vision moves forward with clarity.",
        "",
        "Events delivered through KayanLive reach farther, feel sharper, and last longer. Each project is built to lead, not follow.",
        "We understand how high-stakes delivery shapes national initiatives."
      ]}
    />
  );
}