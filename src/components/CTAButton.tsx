'use client';

import { useLocale } from 'next-intl';

interface CTAButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
  variant?: 'default' | 'white';
  type?: 'button' | 'submit' | 'reset';
}

export default function CTAButton({
  children,
  href,
  onClick,
  className = '',
  disabled = false,
  ariaLabel,
  variant = 'default',
  type = 'button'
}: CTAButtonProps) {
  const locale = useLocale();

  // Variant styles function with RTL gradient support
  const getVariantStyles = (variant: 'default' | 'white', locale: string) => {
    const gradientDirection = locale === 'ar' ? 'l' : 'r';

    const variantStyles = {
      default: {
        gradient: `bg-gradient-to-${gradientDirection} from-[#74CFAA] to-[#A095E1]`,
        textColor: 'text-[#4a4a49]',
        hoverTextColor: 'group-hover:text-[#f3f3f3]',
        circleColor: 'bg-[#A095E1]',
        hoverCircleColor: 'group-hover:bg-[#74CFAA]',
        arrowColor: 'fill-[#4a4a49]',
        hoverArrowColor: 'group-hover:fill-[#f3f3f3]'
      },
      white: {
        gradient: 'bg-white',
        textColor: 'text-[#2c2c2b]',
        hoverTextColor: 'group-hover:text-[#2c2c2b]',
        circleColor: 'bg-white',
        hoverCircleColor: 'group-hover:bg-white',
        arrowColor: 'fill-[#2c2c2b]',
        hoverArrowColor: 'group-hover:fill-[#2c2c2b]'
      }
    };

    return variantStyles[variant];
  };

  const styles = getVariantStyles(variant, locale);

  const content = (
    <div className={`group relative overflow-visible ${className}`}>
      <style>{`
        .cta-button:focus-visible {
          outline: 2px solid #7afdd6;
          outline-offset: 3px;
        }
      `}</style>

      <button
        className={`cta-button inline-flex items-center
                   ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'}
                   focus:outline-none
                   touch-manipulation
                   transition-all duration-450 ease-[cubic-bezier(0.43,0.13,0.23,0.96)]
                   ${locale === 'ar' ? 'group-hover:flex-row' : 'group-hover:flex-row-reverse'}
                   ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={ariaLabel}
        type={type}
        onClick={onClick}
        disabled={disabled}
      >
        {/* Main button pill */}
        <div className={`
          rounded-full flex items-center justify-center
          px-6 py-4 sm:px-8 sm:py-5 md:px-10 md:py-6 lg:px-12 lg:py-6 xl:px-12 xl:py-6
          min-h-[52px] sm:min-h-[60px] md:min-h-[64px] lg:min-h-[64px] xl:min-h-[64px]
          ${styles.gradient}
          transition-all duration-450 ease-[cubic-bezier(0.43,0.13,0.23,0.96)]
        `}>
          <span className={`
            ${styles.textColor} font-semibold select-none
            text-base sm:text-lg md:text-xl lg:text-2xl xl:text-2xl
            leading-normal tracking-tight
            whitespace-nowrap
            transition-color duration-450 ease-[cubic-bezier(0.43,0.13,0.23,0.96)]
            ${styles.hoverTextColor}
          `}>
            {children}
          </span>
        </div>

        {/* Arrow circle - redesigned for perfect proportion */}
        <div className={`
          rounded-full flex items-center justify-center flex-shrink-0
          h-[60px] sm:h-[70px] md:h-[76px] lg:h-[76px] xl:h-[76px]
          w-[60px] sm:w-[70px] md:w-[76px] lg:w-[76px] xl:w-[76px]
          ${styles.circleColor}
          ${styles.hoverCircleColor}
          transition-colors duration-450 ease-[cubic-bezier(0.43,0.13,0.23,0.96)]
        `}>
          <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-8 lg:h-8 xl:w-8 xl:h-8 flex items-center justify-center flex-shrink-0">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 17 16"
              fill="none"
              className="block transition-all duration-450 ease-[cubic-bezier(0.43,0.13,0.23,0.96)]"
              style={{
                transform: locale === 'ar' ? 'scaleX(-1)' : 'none',
                transformOrigin: 'center'
              }}
            >
              <path
                d="M16.0208 8.70711C16.4113 8.31658 16.4113 7.68342 16.0208 7.29289L9.65685 0.928932C9.26633 0.538408 8.63316 0.538408 8.24264 0.928932C7.85212 1.31946 7.85212 1.95262 8.24264 2.34315L13.8995 8L8.24264 13.6569C7.85212 14.0474 7.85212 14.6805 8.24264 15.0711C8.63316 15.4616 9.26633 15.4616 9.65685 15.0711L16.0208 8.70711ZM0 8V9H15.3137V8V7H0V8Z"
                className={`${styles.arrowColor} ${styles.hoverArrowColor} transition-all duration-450 ease-[cubic-bezier(0.43,0.13,0.23,0.96)]`}
              />
            </svg>
          </div>
        </div>
      </button>
    </div>
  );

  if (href && !disabled) {
    return (
      <a href={href} className="inline-block">
        {content}
      </a>
    );
  }

  return content;
}