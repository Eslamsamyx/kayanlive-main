'use client';

import InfoSectionTemplate from './InfoSectionTemplate';

export default function WhereWeWorkRefactored() {
  const checklistItems = [
    {
      text: "Riyadh, Jeddah, Dammam, and key Saudi cities",
      highlights: [
        { text: "Riyadh, Jeddah, Dammam", className: "font-bold text-[#231f20]" },
        { text: "Saudi", className: "font-bold text-[#7afdd6]" }
      ]
    },
    {
      text: "Dubai, Abu Dhabi, Sharjah, and the wider UAE", 
      highlights: [
        { text: "Dubai, Abu Dhabi, Sharjah,", className: "font-bold text-[#231f20]" },
        { text: "UAE", className: "font-bold text-[#231f20]" }
      ]
    },
    {
      text: "And through partner networks in Qatar, Oman, Bahrain, and Kuwait",
      highlights: [
        { text: "Qatar, Oman, Bahrain, and Kuwait", className: "font-bold text-[#231f20]" }
      ]
    }
  ];

  return (
    <InfoSectionTemplate
      badgeText="Where We Work"
      leftDescription="Headquartered in Saudi Arabia and Dubai, KayanLive delivers high-impact events, from public activations and corporate launches to government-led showcases."
      rightDescription="We operate across the GCC:"
      checklistItems={checklistItems}
      ctaTitle="Planning an event outside the uae or saudi arabia?"
      ctaButtonText="Let's Build Together"
      backgroundImage="/optimized/gallery-thumbnail/a4bd38b73259c4fd4f099d834871f17ed5486466-gallery-thumbnail-desktop.webp"
      gradientFrom="#74CFAA"
      gradientVia="#A095E1"
      gradientTo="#A095E1"
    />
  );
}