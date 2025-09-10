'use client';

import Image from 'next/image';

// Assets from Figma
const imgRectangle4241 = "/assets/b74a7a7d29dd66a6cd62e4edfe0512fa5a3b97ad.png";
const imgRectangle4240 = "/assets/776958ae56ed264aecd4c182054c75bc576a1d2f.png";
const imgEllipse3625 = "/assets/60821832f15b930b8fe851aa226b08c11f1ef46b.svg";
const imgMdiTwitter = "/assets/def48b10f3af85b72c9c1340300144e654a156e1.svg";
const imgLogosFacebook = "/assets/69e31bfddbf7233cc0877c3ef5b4edc8be21a2aa.svg";
const imgIcomoonFreeLinkedin2 = "/assets/29c078eff0cb9c150c3699b142068664db1faceb.svg";
const imgSkillIconsInstagram = "/assets/83fa7d33c676fd60c6236412ca0aa58eee80b908.svg";

export default function WorkOutcomes() {
  return (
    <div className="h-[1214px] overflow-clip relative w-full bg-white">
      {/* Title Section */}
      <div className="absolute capitalize flex font-medium gap-[53px] items-center justify-center leading-[0] left-1/2 not-italic text-[100px] top-[69px] tracking-[-4px] translate-x-[-50%]">
        <div className="h-[161px] leading-[85px] relative shrink-0 text-[#2c2c2b] w-[551px]">
          <p className="mb-0">Measurable</p>
          <p>Outcomes.</p>
        </div>
        <div className="bg-clip-text bg-gradient-to-r from-[#a095e1] h-[161px] relative shrink-0 text-right to-[#74cfaa] w-[724px]" style={{ WebkitTextFillColor: "transparent" }}>
          <p className="leading-[85px]">Real Environments.</p>
        </div>
      </div>

      {/* Left Image */}
      <div className="absolute flex h-[939px] items-center justify-center left-0 top-[216px] w-[517px]">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <div className="h-[939px] relative w-[517px]">
            <Image alt="" className="block max-w-none size-full" src={imgRectangle4241} fill style={{objectFit: 'cover'}} />
          </div>
        </div>
      </div>

      {/* Right Image with Social Icons */}
      <div className="absolute h-[939px] left-[995px] overflow-clip top-[216px] w-[517px]">
        <div className="absolute h-[939px] left-0 top-0 w-[517px]">
          <Image alt="" className="block max-w-none size-full" src={imgRectangle4240} fill style={{objectFit: 'cover'}} />
        </div>
        <div className="absolute h-[579px] left-[325px] top-[658px] w-[300px]">
          <div className="absolute inset-[-34.54%_-66.67%]">
            <Image alt="" className="block max-w-none size-full" src={imgEllipse3625} fill style={{objectFit: 'cover'}} />
          </div>
        </div>
        <div className="absolute contents left-[376px] top-[618px]">
          <div className="absolute bg-white left-[376px] overflow-clip rounded-[900px] size-[62.264px] top-[885.74px]">
            <div className="absolute size-[29px] translate-x-[-50%] translate-y-[-50%]" style={{ top: "calc(50% - 0.368px)", left: "calc(50% + 0.368px)" }}>
              <Image alt="" className="block max-w-none size-full" src={imgMdiTwitter} fill style={{objectFit: 'cover'}} />
            </div>
          </div>
          <div className="absolute flex h-[82.195px] items-center justify-center left-[380.67px] top-[714.51px] w-[82.195px]">
            <div className="flex-none rotate-[24.014deg]">
              <div className="bg-white blur-[0.5px] filter opacity-80 overflow-clip relative rounded-[900px] size-[62.264px]">
                <div className="absolute size-5 translate-x-[-50%] translate-y-[-50%]" style={{ top: "calc(50% - 0.494px)", left: "calc(50% + 0.095px)" }}>
                  <Image alt="" className="block max-w-none size-full" src={imgLogosFacebook} fill style={{objectFit: 'cover'}} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bg-white blur-[1px] filter left-[444.49px] opacity-[0.34] overflow-clip rounded-[900px] size-[62.264px] top-[618px]">
            <div className="absolute size-5 translate-x-[-50%] translate-y-[-50%]" style={{ top: "calc(50% - 0.132px)", left: "calc(50% + 0.377px)" }}>
              <Image alt="" className="block max-w-none size-full" src={imgIcomoonFreeLinkedin2} fill style={{objectFit: 'cover'}} />
            </div>
          </div>
          <div className="absolute flex h-[78.06px] items-center justify-center left-[449.16px] top-[807.91px] w-[78.06px]">
            <div className="flex-none rotate-[342.54deg]">
              <div className="bg-white opacity-90 overflow-clip relative rounded-[900px] size-[62.264px]">
                <div className="absolute overflow-clip size-[21px] translate-x-[-50%] translate-y-[-50%]" style={{ top: "calc(50% - 0.085px)", left: "calc(50% - 0.007px)" }}>
                  <Image alt="" className="block max-w-none size-full" src={imgSkillIconsInstagram} fill style={{objectFit: 'cover'}} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Text Content */}
      <div className="absolute capitalize font-medium leading-[32px] not-italic text-[#808184] text-[24px] text-center top-[402px] translate-x-[-50%] w-[425px]" style={{ left: "calc(50% + 40px)" }}>
        <p className="mb-0">Event success is not defined by what happens on stage—it is defined by what lingers afterward. Higher engagement, stronger recall, stronger media pickup, and repeat activation are all signals we monitor and build toward. Our team integrates analytics, experience flow, and onsite behavior tracking to connect strategy with outcomes. As a results-focused exhibition company in the GCC, we prioritize impact, data, and long-term value with every project.</p>
        <p className="mb-0">&nbsp;</p>
        <p className="mb-0">This is not decoration. It is designed return on investment—real moments built for real environments.</p>
        <p className="mb-0">&nbsp;</p>
        <p>By aligning creative vision with operational logic, our work produces clarity under pressure and results that extend far beyond the event itself.</p>
      </div>
    </div>
  );
}