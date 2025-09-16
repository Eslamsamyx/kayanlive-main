'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { useLocale } from 'next-intl';

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'inactive';
  disabled?: boolean;
  className?: string;
  arrowIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  children,
  href,
  onClick,
  variant = 'default',
  disabled = false,
  className = '',
  arrowIcon = true,
  size = 'md'
}: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const locale = useLocale();
  const isRTL = locale === 'ar';

  // Size variants matching original button
  const sizeClasses = {
    sm: 'px-2 lg:px-3 xl:px-4 py-2 text-xs lg:text-sm xl:text-base',
    md: 'px-2 lg:px-3 xl:px-4 py-2 lg:py-3 text-xs lg:text-sm xl:text-base',
    lg: 'px-4 lg:px-6 xl:px-8 py-3 lg:py-4 text-sm lg:text-base xl:text-lg'
  };

  // Variant styles matching original design
  const variantStyles = {
    default: 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b]',
    inactive: 'bg-gray-400 text-gray-600 cursor-not-allowed'
  };

  const baseClasses = `
    relative flex items-center gap-3 rounded-full font-semibold min-h-[44px] flex-shrink-0
    focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50
    transition-all duration-300 ease-in-out
    ${sizeClasses[size]}
    ${variantStyles[variant]}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `;

  // Clean arrow component - proper size and styling
  const ArrowIcon = ({ isHoverArrow = false }) => (
    <div
      className="w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center flex-shrink-0"
      style={{
        transform: isRTL ? 'scaleX(-1)' : 'none',
        color: isHovered ? '#ffffff' : 'currentColor'
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 17 16"
        fill="none"
        className="block"
      >
        <path
          d="M16.0208 8.70711C16.4113 8.31658 16.4113 7.68342 16.0208 7.29289L9.65685 0.928932C9.26633 0.538408 8.63316 0.538408 8.24264 0.928932C7.85212 1.31946 7.85212 1.95262 8.24264 2.34315L13.8995 8L8.24264 13.6569C7.85212 14.0474 7.85212 14.6805 8.24264 15.0711C8.63316 15.4616 9.26633 15.4616 9.65685 15.0711L16.0208 8.70711ZM0 8V9H15.3137V8V7H0V8Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );

  const content = (
    <motion.div
      className={baseClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{
        scale: disabled || variant === 'inactive' ? 1 : 1.02,
        background: variant === 'default' ? 'linear-gradient(90deg, #6ee8c5, #a694ff)' : undefined
      }}
      whileTap={{
        scale: disabled || variant === 'inactive' ? 1 : 0.98
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Container for arrow animations - maintains space */}
      <div className="relative flex items-center gap-3">
        {/* New arrow - positioned based on direction */}
        <motion.div
          className={`absolute z-20 ${isRTL ? 'right-0' : 'left-0'}`}
          initial={{ opacity: 0 }}
          animate={{
            opacity: isHovered && arrowIcon ? 1 : 0
          }}
          transition={{
            opacity: {
              delay: isHovered ? 0.2 : 0,
              duration: 0.25,
              ease: 'easeIn'
            }
          }}
        >
          {arrowIcon && <ArrowIcon isHoverArrow={true} />}
        </motion.div>

        {/* Text - moves to fill arrow's space (opposite direction) */}
        <motion.span
          className="whitespace-nowrap z-10 relative"
          animate={{
            x: isHovered && arrowIcon ? (isRTL ? -28 : 28) : 0,
            color: variant === 'default' && isHovered ? '#ffffff' : undefined
          }}
          transition={{
            x: {
              duration: 0.45,
              ease: [0.43, 0.13, 0.23, 0.96], // Same easing as arrow
            },
            color: {
              duration: 0.3,
              ease: 'easeInOut'
            }
          }}
        >
          {children}
        </motion.span>

        {/* Original arrow - moves within its container */}
        <motion.div
          className="relative w-5 h-5 lg:w-6 lg:h-6" // Fixed dimensions
          animate={{
            x: isHovered ? (isRTL ? 80 : -80) : 0,
          }}
          transition={{
            x: {
              duration: 0.45,
              ease: [0.43, 0.13, 0.23, 0.96],
            }
          }}
        >
          <motion.div
            animate={{
              opacity: isHovered ? 0 : 1,
              scale: isHovered ? 0.7 : 1,
            }}
            transition={{
              opacity: {
                duration: 0.35,
                ease: 'easeOut',
                delay: isHovered ? 0.1 : 0
              },
              scale: {
                duration: 0.45,
                ease: 'easeOut'
              }
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {arrowIcon && <ArrowIcon />}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );

  if (href && !disabled && variant !== 'inactive') {
    return (
      <Link href={href} className="inline-block">
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || variant === 'inactive'}
      className="inline-block"
      type="button"
    >
      {content}
    </button>
  );
}