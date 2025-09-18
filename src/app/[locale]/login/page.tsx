'use client';

import { useState, useRef, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface LoginForm {
  email: string;
  password: string;
}

const imgMaskGroup = "/assets/638442c54db92ce49b3ad8194a062a52ba973004.png";
const imgEllipse1 = "/assets/575a92ae113574b10651d37ad7654adf9fb7bd85.svg";
const imgEllipse2 = "/assets/dcc83c6de9d9f4b919b448af6ce767c528855540.svg";

export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        const session = await getSession();
        if (session?.user) {
          router.push('/admin/dashboard');
        }
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#2c2c2b] relative w-full overflow-hidden flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Full Background Pattern - Always present but masked */}
      <div
        className="absolute inset-0 bg-repeat opacity-100"
        style={{
          backgroundImage: `url('${imgMaskGroup}')`,
          backgroundSize: '400px 400px'
        }}
      />

      {/* Mask overlay that hides the pattern except around cursor */}
      <div
        className={`absolute inset-0 bg-[#2c2c2b] transition-opacity duration-300 ${
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

      {/* Desktop Background Decorative Elements - Hidden on mobile */}
      {/* Large teal ellipse blur - right side */}
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

      {/* Smaller purple ellipse - right side */}
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

      {/* Diamond decoration - left side */}
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
        {/* Header with Large Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <h1
            className="text-6xl md:text-8xl font-normal mb-4 capitalize"
            style={{
              background: 'linear-gradient(90deg, #b8a4ff 0%, #7afdd6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            Admin
          </h1>
          <p className="text-white/80 text-lg">
            Portal Access
          </p>
          <p className="text-white/60 text-sm mt-1">
            Sign in to your account
          </p>
        </motion.div>

        {/* Glass Container with Glassmorphism */}
        <div
          className="relative overflow-hidden rounded-[25px] p-8 md:p-10"
          style={{
            background: 'rgba(255, 255, 255, 0.01)',
            backdropFilter: 'blur(50.5px)',
            WebkitBackdropFilter: 'blur(50.5px)',
            border: '2px solid rgba(122, 253, 214, 0.3)'
          }}
        >
          {/* Login Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[#7afdd6] text-sm font-medium">
                Email Address
              </label>
              <div className="relative">
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Please enter a valid email',
                    },
                  })}
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:border-transparent transition-all duration-300"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#7afdd6]/20 to-[#b8a4ff]/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-[#7afdd6] text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type="password"
                  id="password"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:border-transparent transition-all duration-300"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#7afdd6]/20 to-[#b8a4ff]/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              className="w-full relative overflow-hidden rounded-xl py-3 px-6 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group"
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
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </span>
            </motion.button>
          </motion.form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-white/60 text-sm">
              Secure admin access only
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}