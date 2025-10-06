'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import CTAButton from './CTAButton';
import { api } from '@/trpc/react';
// import Image from 'next/image';

const imgConcertBg1 = "/optimized/service-card/cf27cb2a37e9e3bfd30c1ada4fe4988496b10bbb-service-card-desktop.webp";
// const imgEllipse3624 = "/assets/fcf30dee2c13353872f07b1e13a3de14f4d2f85e.svg";

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export default function ContactForm() {
  const t = useTranslations('contact.form');
  const locale = useLocale();
  const [isUrgent, setIsUrgent] = useState<'yes' | 'no' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  // const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // tRPC mutation for creating leads
  const createLeadMutation = api.lead.create.useMutation();
  const [formData, setFormData] = useState({
    fullName: '',
    organization: '',
    email: '',
    phone: '',
    eventType: '',
    budget: '',
    goals: ''
  });

  // Track scroll progress for decorative element animation
  // Scroll progress effect (currently disabled)
  useEffect(() => {
    // This effect is temporarily disabled but kept for future use
    // const handleScroll = () => {
    //   if (!containerRef.current) return;
    //
    //   const container = containerRef.current;
    //   const containerTop = container.offsetTop;
    //   const containerHeight = container.offsetHeight;
    //   const currentScroll = window.scrollY;
    //   const windowHeight = window.innerHeight;
    //
    //   // Use viewport center as reference point
    //   const viewportCenter = currentScroll + windowHeight / 2;
    //
    //   // Calculate progress through ContactForm section (0% at start, 100% at end)
    //   let progress = (viewportCenter - containerTop) / containerHeight;
    //   progress = Math.max(0, Math.min(1, progress));
    //
    //   setScrollProgress(progress);
    // };
    //
    // handleScroll();
    // window.addEventListener('scroll', handleScroll, { passive: true });
    // return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = t('validation.fullNameRequired');
    if (!formData.email.trim()) newErrors.email = t('validation.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t('validation.emailInvalid');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast(t('validation.formErrors'), 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare lead data
      const leadData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || undefined,
        organization: formData.organization || undefined,
        eventType: formData.eventType || undefined,
        budget: formData.budget || undefined,
        goals: formData.goals || undefined,
        isUrgent: isUrgent === 'yes',
        source: 'contact_form',
        // Capture browser info for tracking
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        referrer: typeof window !== 'undefined' ? document.referrer : undefined,
      };

      await createLeadMutation.mutateAsync(leadData);
      addToast(t('toasts.success'), 'success');

      // Reset form
      setFormData({
        fullName: '',
        organization: '',
        email: '',
        phone: '',
        eventType: '',
        budget: '',
        goals: ''
      });
      setIsUrgent(null);
      setErrors({});
    } catch (error) {
      console.error('Failed to submit lead:', error);
      addToast(t('toasts.error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full min-h-screen lg:h-[1049px] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url('${imgConcertBg1}')` }}
      />


      {/* Main Form Container */}
      <div className="relative lg:absolute bg-black/30 backdrop-blur-md rounded-[24px] lg:rounded-[66px] mx-4 md:mx-8 lg:mx-0 my-6 md:my-10 lg:my-0 p-6 sm:p-8 md:p-12 lg:p-[87px_68px] lg:left-1/2 lg:top-1/2 lg:transform lg:-translate-x-1/2 lg:-translate-y-1/2 max-w-6xl lg:w-[1107px] lg:h-[900px] border border-white/10">
        <form onSubmit={handleSubmit} className="h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-8 md:gap-y-8 lg:gap-x-[59px] lg:gap-y-[59px] h-full">
            
            {/* Full Name */}
            <div className="flex flex-col gap-3 w-full">
              <label htmlFor="fullName" className="text-white text-base sm:text-lg md:text-xl lg:text-[22px] font-bold capitalize leading-tight" style={{ fontFamily: '"Poppins", sans-serif' }} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                {t('labels.fullName')} *
              </label>
              <div className="relative">
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`w-full h-[52px] md:h-[60px] lg:h-[67px] rounded-[10px] px-4 text-black bg-[rgba(255,255,255,0.7)] placeholder-gray-600 border-2 transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white ${errors.fullName ? 'border-red-400' : 'border-transparent'}`}
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                  placeholder={t('placeholders.fullName')}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                />
                {errors.fullName && (
                  <p id="fullName-error" className="text-red-400 text-sm mt-1" role="alert" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                    {errors.fullName}
                  </p>
                )}
              </div>
            </div>

            {/* Organization */}
            <div className="flex flex-col gap-3 w-full">
              <label htmlFor="organization" className="text-white text-base sm:text-lg md:text-xl lg:text-[22px] font-bold capitalize leading-tight" style={{ fontFamily: '"Poppins", sans-serif' }} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                {t('labels.organization')}
              </label>
              <input
                id="organization"
                type="text"
                value={formData.organization}
                onChange={(e) => handleInputChange('organization', e.target.value)}
                className="w-full h-[52px] md:h-[60px] lg:h-[67px] rounded-[10px] px-4 text-black bg-[rgba(255,255,255,0.7)] placeholder-gray-600 border-2 border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white"
                style={{ fontFamily: '"Poppins", sans-serif' }}
                placeholder={t('placeholders.organization')}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-3 w-full">
              <label htmlFor="email" className="text-white text-base sm:text-lg md:text-xl lg:text-[22px] font-bold capitalize leading-tight" style={{ fontFamily: '"Poppins", sans-serif' }} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                {t('labels.email')} *
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full h-[52px] md:h-[60px] lg:h-[67px] rounded-[10px] px-4 text-black bg-[rgba(255,255,255,0.7)] placeholder-gray-600 border-2 transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white ${errors.email ? 'border-red-400' : 'border-transparent'}`}
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                  placeholder={t('placeholders.email')}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-red-400 text-sm mt-1" role="alert" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-3 w-full">
              <label htmlFor="phone" className="text-white text-base sm:text-lg md:text-xl lg:text-[22px] font-bold capitalize leading-tight" style={{ fontFamily: '"Poppins", sans-serif' }} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                {t('labels.phone')}
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full h-[52px] md:h-[60px] lg:h-[67px] rounded-[10px] px-4 text-black bg-[rgba(255,255,255,0.7)] placeholder-gray-600 border-2 border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white"
                style={{ fontFamily: '"Poppins", sans-serif' }}
                placeholder={t('placeholders.phone')}
              />
            </div>

            {/* Event Type */}
            <div className="flex flex-col gap-3 w-full">
              <label htmlFor="eventType" className="text-white text-base sm:text-lg md:text-xl lg:text-[22px] font-bold capitalize leading-tight" style={{ fontFamily: '"Poppins", sans-serif' }} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                {t('labels.eventType')}
              </label>
              <input
                id="eventType"
                type="text"
                value={formData.eventType}
                onChange={(e) => handleInputChange('eventType', e.target.value)}
                className="w-full h-[52px] md:h-[60px] lg:h-[67px] rounded-[10px] px-4 text-black bg-[rgba(255,255,255,0.7)] placeholder-gray-600 border-2 border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white"
                style={{ fontFamily: '"Poppins", sans-serif' }}
                placeholder={t('placeholders.eventType')}
              />
            </div>

            {/* Budget */}
            <div className="flex flex-col gap-3 w-full">
              <label htmlFor="budget" className="text-white text-base sm:text-lg md:text-xl lg:text-[22px] font-bold capitalize leading-tight" style={{ fontFamily: '"Poppins", sans-serif' }} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                {t('labels.budget')}
              </label>
              <input
                id="budget"
                type="text"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                className="w-full h-[52px] md:h-[60px] lg:h-[67px] rounded-[10px] px-4 text-black bg-[rgba(255,255,255,0.7)] placeholder-gray-600 border-2 border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white"
                style={{ fontFamily: '"Poppins", sans-serif' }}
                placeholder={t('placeholders.budget')}
              />
            </div>

            {/* Goals */}
            <div className="flex flex-col gap-3 w-full">
              <label htmlFor="goals" className="text-white text-base sm:text-lg md:text-xl lg:text-[22px] font-bold capitalize leading-tight" style={{ fontFamily: '"Poppins", sans-serif' }} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                {t('labels.goals')}
              </label>
              <textarea
                id="goals"
                value={formData.goals}
                onChange={(e) => handleInputChange('goals', e.target.value)}
                rows={3}
                className="w-full min-h-[52px] md:min-h-[60px] lg:min-h-[67px] max-h-[150px] rounded-[10px] px-4 py-3 text-black bg-[rgba(255,255,255,0.7)] placeholder-gray-600 border-2 border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white resize-none overflow-y-auto"
                style={{ fontFamily: '"Poppins", sans-serif' }}
                placeholder={t('placeholders.goals')}
              />
            </div>

            {/* Urgent Request */}
            <div className="flex flex-col gap-3 w-full">
              <fieldset>
                <legend className="text-white text-base sm:text-lg md:text-xl lg:text-[22px] font-bold capitalize leading-tight mb-3" style={{ fontFamily: '"Poppins", sans-serif' }} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                  {t('labels.isUrgent')}
                </legend>
                <div className="flex gap-6 items-center" role="radiogroup" aria-labelledby="urgent-request-legend">
                  <label className="flex items-center gap-3 cursor-pointer group focus-within:outline-none focus-within:ring-2 focus-within:ring-white focus-within:ring-offset-2 focus-within:ring-offset-[#2c2c2b] rounded-md">
                    <input
                      type="radio"
                      name="isUrgent"
                      value="yes"
                      checked={isUrgent === 'yes'}
                      onChange={(e) => setIsUrgent(e.target.value as 'yes')}
                      className="sr-only"
                      aria-describedby="urgent-yes-description"
                    />
                    <div 
                      className={`w-5 h-5 rounded-sm border-2 border-white transition-all flex items-center justify-center ${
                        isUrgent === 'yes' 
                          ? 'bg-white border-white' 
                          : 'bg-transparent border-white/70 hover:border-white'
                      }`}
                      aria-hidden="true"
                      role="presentation"
                    >
                      {isUrgent === 'yes' && (
                        <div className="w-2 h-2 bg-[#2c2c2b] rounded-sm" />
                      )}
                    </div>
                    <span
                      className="text-white text-base sm:text-lg md:text-xl lg:text-[22px] font-bold capitalize group-hover:text-white/90 transition-colors"
                      style={{ fontFamily: '"Poppins", sans-serif' }}
                      id="urgent-yes-description"
                      dir={locale === 'ar' ? 'rtl' : 'ltr'}
                    >
                      {t('radioOptions.yes')}
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group focus-within:outline-none focus-within:ring-2 focus-within:ring-white focus-within:ring-offset-2 focus-within:ring-offset-[#2c2c2b] rounded-md">
                    <input
                      type="radio"
                      name="isUrgent"
                      value="no"
                      checked={isUrgent === 'no'}
                      onChange={(e) => setIsUrgent(e.target.value as 'no')}
                      className="sr-only"
                      aria-describedby="urgent-no-description"
                    />
                    <div 
                      className={`w-5 h-5 rounded-sm border-2 border-white transition-all flex items-center justify-center ${
                        isUrgent === 'no' 
                          ? 'bg-white border-white' 
                          : 'bg-transparent border-white/70 hover:border-white'
                      }`}
                      aria-hidden="true"
                      role="presentation"
                    >
                      {isUrgent === 'no' && (
                        <div className="w-2 h-2 bg-[#2c2c2b] rounded-sm" />
                      )}
                    </div>
                    <span
                      className="text-white text-base sm:text-lg md:text-xl lg:text-[22px] font-bold capitalize group-hover:text-white/90 transition-colors"
                      style={{ fontFamily: '"Poppins", sans-serif' }}
                      id="urgent-no-description"
                      dir={locale === 'ar' ? 'rtl' : 'ltr'}
                    >
                      {t('radioOptions.no')}
                    </span>
                  </label>
                </div>
              </fieldset>
            </div>

            {/* Submit Button */}
            <div className="lg:col-span-2 flex justify-center pt-8 pb-4 px-4 lg:px-0">
              {/* Loading indicator for screen readers */}
              {isSubmitting && (
                <div className="sr-only" id="submit-status" aria-live="polite" aria-atomic="true" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                  {t('submit.loadingStatus')}
                </div>
              )}

              <CTAButton
                type="submit"
                disabled={isSubmitting}
                ariaLabel={isSubmitting ? t('submit.loadingStatus') : t('submit.button')}
              >
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-[#2c2c2b] border-t-transparent rounded-full animate-spin me-2" role="presentation" aria-hidden="true" />
                )}
                {isSubmitting ? t('submit.submitting') : t('submit.button')}
              </CTAButton>
            </div>
          </div>
        </form>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 end-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-md p-4 rounded-lg shadow-lg transition-all duration-300 transform ${
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : toast.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-blue-500 text-white'
            } animate-in slide-in-from-right`}
            role="alert"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="flex items-center justify-between" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0">
                  {toast.type === 'success' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {toast.type === 'error' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  {toast.type === 'info' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  {toast.message}
                </span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ms-2 text-white/80 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded-md p-1"
                aria-label={t('toasts.closeNotification')}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}