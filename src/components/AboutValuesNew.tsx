'use client';

import { useState, useEffect, useRef } from 'react';

const imgRectangle4235 = "/assets/79b8becbbe666db19c2c2dfdebe436eebf271e2e.png";
const imgRectangle4236 = "/assets/fe74de8467bf5ef42975b489173519217b1b04d0.png";
const imgRectangle4237 = "/assets/4bf06f33663f81bd327984084be746509f0caffd.png";
const imgRectangle4238 = "/assets/3bfce9db290033eb81342a31f55d19a490e552d3.png";
const imgRectangle4239 = "/assets/c7e54c0605f6e122070c3da28c63679ca3742a85.png";

const valuesData = [
  {
    id: 'purpose-driven',
    title: 'Purpose Driven Creativity',
    description: 'Every concept earns its place by serving a goal',
    image: imgRectangle4235,
    gridClass: 'col-span-4', // c1 equivalent
    marginTop: '0px'
  },
  {
    id: 'precision',
    title: 'Precision Without Hesitation',
    description: 'Plans are built to perform under pressure',
    image: imgRectangle4236,
    gridClass: 'col-start-5 col-span-4', // c2 equivalent
    marginTop: '160px'
  },
  {
    id: 'innovation',
    title: 'Next Level Innovation',
    description: 'Technology meets experience in service of story',
    image: imgRectangle4237,
    gridClass: 'col-start-9 col-span-4', // c3 equivalent
    marginTop: '320px'
  },
  {
    id: 'collaboration',
    title: 'Trusted Collaboration',
    description: 'We act as a true extension of your team',
    image: imgRectangle4238,
    gridClass: 'col-start-3 col-span-4', // c4 equivalent
    marginTop: '480px'
  },
  {
    id: 'speed',
    title: 'Speed Without Sacrifice',
    description: 'Efficiency powered by structure',
    image: imgRectangle4239,
    gridClass: 'col-start-9 col-span-4', // c5 equivalent
    marginTop: '640px'
  },
  {
    id: 'cultural',
    title: 'Cultural Intelligence',
    description: 'Execution aligned with local context and audience',
    image: imgRectangle4239,
    gridClass: 'col-start-1 col-span-4', // c6 equivalent
    marginTop: '800px'
  },
  {
    id: 'strategic',
    title: 'Strategic Scale',
    description: 'Whether a focused launch or multi-hall expo, we deliver with the reach of a leading exhibition company',
    image: imgRectangle4239,
    gridClass: 'col-start-5 col-span-4', // c7 equivalent
    marginTop: '960px'
  }
];

interface ValueCardProps {
  value: typeof valuesData[0];
  className?: string;
}

function ValueCard({ value, className = "" }: ValueCardProps) {
  return (
    <article 
      className={`${value.gridClass} ${className}`}
      style={{ marginTop: value.marginTop }}
    >
      <div 
        className="w-full aspect-[4/3] rounded-[22px] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${value.image}')` }}
        role="img"
        aria-label={value.title}
      />
      <div className="pt-3 px-1">
        <h3 
          className="text-white font-bold text-base mb-1.5 capitalize"
          style={{
            fontFamily: '"Poppins", sans-serif'
          }}
        >
          {value.title}
        </h3>
        <p 
          className="text-[#aab0bb] text-xs leading-relaxed m-0 capitalize"
          style={{
            fontFamily: '"Poppins", sans-serif'
          }}
        >
          {value.description}
        </p>
      </div>
    </article>
  );
}

export default function AboutValues() {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const routeSvgRef = useRef<SVGSVGElement>(null);
  const routeMainRef = useRef<SVGPathElement>(null);
  const routeGlowRef = useRef<SVGPathElement>(null);
  const guideDotRef = useRef<SVGCircleElement>(null);
  
  // Animation state
  const animProgressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const totalLengthRef = useRef(0);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || !routeSvgRef.current) return;

    // Math helpers
    const lerp = (a: number[], b: number[], t: number) => [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t
    ];
    const len = (v: number[]) => Math.hypot(v[0], v[1]);
    const sub = (a: number[], b: number[]) => [a[0] - b[0], a[1] - b[1]];
    const add = (a: number[], b: number[]) => [a[0] + b[0], a[1] + b[1]];
    const scale = (v: number[], s: number) => [v[0] * s, v[1] * s];
    const norm = (v: number[]) => {
      const l = len(v) || 1;
      return [v[0] / l, v[1] / l];
    };
    const perp = (v: number[]) => [-v[1], v[0]];

    function seeded(i: number) {
      return (Math.sin(i * 987.65) + 1) / 2;
    }

    function getCenters() {
      if (!containerRef.current) return [];
      const container = containerRef.current;
      const cRect = container.getBoundingClientRect();
      const medias = Array.from(container.querySelectorAll('[role="img"]')) as HTMLElement[];
      
      return medias.map(el => {
        const r = el.getBoundingClientRect();
        return [
          (r.left + r.width / 2) - cRect.left,
          (r.top + r.height / 2) - cRect.top
        ];
      });
    }

    function injectKnots(pts: number[][]) {
      const out = [pts[0]];
      for (let i = 0; i < pts.length - 1; i++) {
        const p1 = pts[i], p2 = pts[i + 1];
        const dir = sub(p2, p1);
        const n = norm(perp(dir));
        const d = len(dir);
        const swing = Math.max(60, Math.min(140, d * (0.20 + 0.16 * seeded(i))));

        const sA = lerp(p1, p2, 0.38);
        const sB = lerp(p1, p2, 0.50);
        const sC = lerp(p1, p2, 0.66);

        const k1 = add(sA, scale(n, swing));
        const k2 = sB;
        const k3 = add(sC, scale(n, -swing * 0.9));

        const tangent = norm(dir);
        const k4 = add(k3, scale(tangent, Math.min(90, d * 0.12)));

        out.push(k1, k2, k3, k4, p2);
      }
      return out;
    }

    function catmullRomToBezier(pts: number[][], alpha = 0.5) {
      if (pts.length < 2) return '';
      let d = '';
      
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = i === 0 ? pts[i] : pts[i - 1];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = i + 2 < pts.length ? pts[i + 2] : pts[i + 1];

        const t0 = 0;
        const t1 = t0 + Math.pow(len(sub(p1, p0)), alpha);
        const t2 = t1 + Math.pow(len(sub(p2, p1)), alpha);
        const t3 = t2 + Math.pow(len(sub(p3, p2)), alpha);

        const m1 = scale(
          sub(
            scale(sub(p1, p0), 1 / (t1 - t0)),
            scale(sub(p2, p1), 1 / (t2 - t1))
          ),
          -(t2 - t1)
        );
        const m2 = scale(
          sub(
            scale(sub(p2, p1), 1 / (t2 - t1)),
            scale(sub(p3, p2), 1 / (t3 - t2))
          ),
          (t2 - t1)
        );

        const c1 = add(p1, scale(m1, 1 / 3));
        const c2 = sub(p2, scale(m2, 1 / 3));

        if (i === 0) d += `M ${p1[0].toFixed(1)} ${p1[1].toFixed(1)} `;
        d += `C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} `;
      }
      return d.trim();
    }

    function updateGeometry() {
      if (!containerRef.current || !routeSvgRef.current) return;
      
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const medias = Array.from(container.querySelectorAll('[role="img"]'));
      const lastMedia = medias[medias.length - 1] as HTMLElement;
      
      if (!lastMedia) return;
      
      const lastRect = lastMedia.getBoundingClientRect();
      const height = Math.max((lastRect.bottom - rect.top) + 240, rect.height);

      routeSvgRef.current.setAttribute('width', rect.width.toString());
      routeSvgRef.current.setAttribute('height', height.toString());
      routeSvgRef.current.setAttribute('viewBox', `0 0 ${rect.width} ${height}`);

      const centers = getCenters();
      if (centers.length === 0) return;
      
      const withKnots = injectKnots(centers);
      const d = catmullRomToBezier(withKnots, 0.5);
      
      if (routeGlowRef.current) {
        routeGlowRef.current.setAttribute('d', d);
      }
      if (routeMainRef.current) {
        routeMainRef.current.setAttribute('d', d);
        
        // Set up path length for animation
        const pathLength = routeMainRef.current.getTotalLength();
        totalLengthRef.current = pathLength;
        
        // Initially hide the path
        routeMainRef.current.style.strokeDasharray = `${pathLength} ${pathLength}`;
        routeMainRef.current.style.strokeDashoffset = `${pathLength}`;
        
        if (routeGlowRef.current) {
          routeGlowRef.current.style.strokeDasharray = `${pathLength} ${pathLength}`;
          routeGlowRef.current.style.strokeDashoffset = `${pathLength + 40}`;
        }
      }
    }

    // Scroll animation functions
    function easeOutCubic(t: number) {
      return 1 - Math.pow(1 - t, 3);
    }

    function clamp(value: number, min: number, max: number) {
      return Math.max(min, Math.min(max, value));
    }

    function computeScrollProgress() {
      if (!containerRef.current || !routeSvgRef.current) return;
      
      const container = containerRef.current;
      const start = container.offsetTop + 140; // matches SVG top offset
      const svgHeight = routeSvgRef.current.getBoundingClientRect().height;
      const end = start + svgHeight;
      
      const scrollY = window.scrollY || window.pageYOffset;
      const viewportMiddle = scrollY + window.innerHeight * 0.65; // Track slightly ahead
      
      const raw = clamp((viewportMiddle - start) / (end - start), 0, 1);
      targetProgressRef.current = clamp(easeOutCubic(raw + 0.1), 0, 1); // Lead ahead by 10%
    }

    function animateScroll() {
      const SMOOTH = 0.08; // Smoothing factor
      
      // Exponential smoothing towards target
      animProgressRef.current += (targetProgressRef.current - animProgressRef.current) * SMOOTH;
      
      const pathLength = totalLengthRef.current;
      if (pathLength > 0) {
        const dashOffset = pathLength * (1 - animProgressRef.current);
        
        if (routeMainRef.current) {
          routeMainRef.current.style.strokeDashoffset = `${dashOffset}`;
        }
        if (routeGlowRef.current) {
          routeGlowRef.current.style.strokeDashoffset = `${dashOffset + 40}`;
        }
        
        // Update guide dot position
        if (guideDotRef.current && routeMainRef.current && animProgressRef.current > 0.02) {
          const point = routeMainRef.current.getPointAtLength(pathLength * animProgressRef.current);
          guideDotRef.current.setAttribute('cx', point.x.toString());
          guideDotRef.current.setAttribute('cy', point.y.toString());
          guideDotRef.current.setAttribute('opacity', '1');
        } else if (guideDotRef.current) {
          guideDotRef.current.setAttribute('opacity', '0');
        }
      }
      
      rafRef.current = requestAnimationFrame(animateScroll);
    }

    // Initial setup and start animation
    function init() {
      updateGeometry();
      computeScrollProgress();
      animateScroll();
    }
    
    setTimeout(init, 100);

    // Handle scroll
    const handleScroll = () => {
      computeScrollProgress();
    };

    // Handle resize
    const handleResize = () => {
      setTimeout(() => {
        updateGeometry();
        computeScrollProgress();
      }, 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isLoaded]);

  return (
    <section 
      className="relative bg-[#2c2c2b] overflow-hidden w-full py-10"
      aria-label="Company values and principles"
    >
      {/* Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-800" />
      )}
      
      <div 
        ref={containerRef}
        className={`relative max-w-[1120px] mx-auto px-5 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Main Title */}
        <header className="mb-8">
          <h1 
            className="font-bold leading-[0.95] tracking-tight text-4xl md:text-6xl lg:text-7xl mb-2"
            style={{
              background: 'linear-gradient(90deg, #a095e1, #74cfaa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            Values That<br />Activate Outcomes
          </h1>
        </header>

        {/* Dynamic SVG Route */}
        <div 
          className="absolute inset-0 pointer-events-none z-0"
          style={{ top: '140px', left: '-40px', right: '-40px', bottom: '-40px' }}
        >
          <svg 
            ref={routeSvgRef}
            className="w-full h-full block"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9aa3ff" />
                <stop offset="100%" stopColor="#8be6ce" />
              </linearGradient>
              <radialGradient id="guideGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#8be6ce" />
              </radialGradient>
            </defs>
            <path 
              ref={routeGlowRef}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="22.5"
              style={{ filter: 'blur(0.6px)' }}
            />
            <path 
              ref={routeMainRef}
              fill="none"
              stroke="url(#routeGrad)"
              strokeWidth="7.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ 
                opacity: 0.96, 
                filter: 'drop-shadow(0 0 5px rgba(139,230,206,0.08))' 
              }}
            />
            <circle 
              ref={guideDotRef}
              r="7" 
              cx="0" 
              cy="0" 
              fill="url(#guideGrad)" 
              opacity="0"
              style={{ filter: 'drop-shadow(0 0 8px rgba(139,230,206,0.55))' }}
            />
          </svg>
        </div>

        {/* Values Grid - Desktop */}
        <section 
          className="hidden md:grid grid-cols-12 gap-7 relative z-10"
          aria-label="Values"
        >
          {valuesData.map((value) => (
            <ValueCard key={value.id} value={value} />
          ))}
        </section>

        {/* Values Grid - Mobile */}
        <section 
          className="md:hidden grid grid-cols-1 gap-6 relative z-10"
          aria-label="Values"
        >
          {valuesData.map((value) => (
            <ValueCard 
              key={`mobile-${value.id}`} 
              value={value} 
              className="col-span-1 mt-0"
            />
          ))}
        </section>
      </div>
    </section>
  );
}