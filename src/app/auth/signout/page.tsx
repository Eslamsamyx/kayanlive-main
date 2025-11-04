'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

const imgMaskGroup = "/assets/638442c54db92ce49b3ad8194a062a52ba973004.png";
const imgEllipse1 = "/assets/575a92ae113574b10651d37ad7654adf9fb7bd85.svg";
const imgEllipse2 = "/assets/dcc83c6de9d9f4b919b448af6ce767c528855540.svg";

export default function SignOutPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Preload background image
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = imgMaskGroup;
    link.type = 'image/png';
    document.head.appendChild(link);

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => {
      clearTimeout(timer);
      document.head.removeChild(link);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({ redirect: false });
      // Wait a bit for the animation
      setTimeout(() => {
        router.push('/en/login');
      }, 500);
    } catch (error) {
      console.error('Sign out error:', error);
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div
        className="relative bg-[#2c2c2b] w-full max-w-[1600px] min-h-[800px] overflow-hidden flex items-center justify-center rounded-[25px] md:rounded-[43px] lg:rounded-[61px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Full Background Pattern */}
        <div
          className="absolute inset-0 bg-repeat opacity-100 rounded-[25px] md:rounded-[43px] lg:rounded-[61px]"
          style={{
            backgroundImage: `url('${imgMaskGroup}')`,
            backgroundSize: '600px 600px',
            imageRendering: 'crisp-edges' as any
          }}
        />

        {/* Mask overlay */}
        <div
          className={`absolute inset-0 bg-[#2c2c2b] transition-opacity duration-300 rounded-[25px] md:rounded-[43px] lg:rounded-[61px] ${
            isHovered ? 'opacity-100' : 'opacity-100'
          }`}
          style={{
            maskImage: isHovered
              ? `radial-gradient(circle 300px at ${mousePosition.x}px ${mousePosition.y}px, transparent 0%, transparent 30%, rgba(0,0,0,0.3) 60%, black 80%)`
              : 'none',
            WebkitMaskImage: isHovered
              ? `radial-gradient(circle 300px at ${mousePosition.x}px ${mousePosition.y}px, transparent 0%, transparent 30%, rgba(0,0,0,0.3) 60%, black 80%)`
              : 'none',
          }}
        />

        {/* Desktop Background Decorative Elements */}
        <div
          className="absolute hidden lg:block"
          style={{
            width: '668px',
            height: '689px',
            right: '-100px',
            top: '179px'
          }}
        >
          <Image src={imgEllipse2} alt="" fill className="opacity-60" />
        </div>

        <div
          className="absolute hidden lg:block"
          style={{
            width: '346px',
            height: '357px',
            right: '100px',
            top: '345px'
          }}
        >
          <Image src={imgEllipse1} alt="" fill className="opacity-50" />
        </div>

        {/* Diamond decoration */}
        <div
          className="absolute hidden lg:block"
          style={{
            width: '40px',
            height: '40px',
            left: '150px',
            top: '50%',
            transform: 'translateY(-50%) rotate(45deg)',
            background: 'rgba(122, 253, 214, 0.3)'
          }}
        />

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md mx-4"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-center mb-8"
          >
            <div className="flex justify-center items-center mb-4">
              <h1
                className="text-6xl md:text-8xl font-normal capitalize"
                style={{
                  fontFamily: '"Poppins", sans-serif',
                  background: 'linear-gradient(90deg, #b8a4ff 0%, #7afdd6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'inline-block'
                }}
              >
                Kayanlive
              </h1>
            </div>
            <p className="text-white/80 text-lg">
              Sign Out
            </p>
          </motion.div>

          {/* Glass Container */}
          <div
            className="relative overflow-hidden rounded-[25px] p-8 md:p-10"
            style={{
              background: 'rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)'
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Message */}
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#7afdd6]/20 to-[#b8a4ff]/20 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-[#7afdd6]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-white">
                  Sign Out Confirmation
                </h2>
                <p className="text-white/70">
                  Are you sure you want to sign out of your account?
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {/* Cancel Button */}
                <motion.button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  whileHover={!isLoading ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                  className="flex-1 relative overflow-hidden rounded-xl py-3 px-6 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">Cancel</span>
                </motion.button>

                {/* Sign Out Button */}
                <motion.button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isLoading}
                  whileHover={!isLoading ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                  className="flex-1 relative overflow-hidden rounded-xl py-3 px-6 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group"
                  style={{
                    background: isLoading
                      ? 'linear-gradient(90deg, #9288d4 0%, #65e6c0 100%)'
                      : 'linear-gradient(90deg, #b8a4ff 0%, #7afdd6 100%)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Signing out...</span>
                      </div>
                    ) : (
                      'Sign Out'
                    )}
                  </span>
                </motion.button>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-6 text-center"
            >
              <p className="text-white/50 text-xs">
                You can always sign back in anytime
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
