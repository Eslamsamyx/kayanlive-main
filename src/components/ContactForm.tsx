'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const imgConcertBg1 = "/assets/cf27cb2a37e9e3bfd30c1ada4fe4988496b10bbb.png";
const imgEllipse3624 = "/assets/fcf30dee2c13353872f07b1e13a3de14f4d2f85e.svg";

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export default function ContactForm() {
  const [isUrgent, setIsUrgent] = useState<'yes' | 'no' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
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
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const containerTop = container.offsetTop;
      const containerHeight = container.offsetHeight;
      const currentScroll = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Use viewport center as reference point
      const viewportCenter = currentScroll + windowHeight / 2;
      
      // Calculate progress through ContactForm section (0% at start, 100% at end)
      let progress = (viewportCenter - containerTop) / containerHeight;
      progress = Math.max(0, Math.min(1, progress));
      
      setScrollProgress(progress);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addToast('Please correct the errors in the form.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Form submitted:', { ...formData, isUrgent });
      addToast('Form submitted successfully! We\'ll get back to you soon.', 'success');
      
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
    } catch {
      addToast('Error submitting form. Please try again.', 'error');
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
              <label htmlFor="fullName" className="text-white text-base sm:text-lg md:text-xl lg:text-[22px] font-bold capitalize leading-tight" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Full Name *
              </label>
              <div className="relative">
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`w-full h-[52px] md:h-[60px] lg:h-[67px] rounded-[10px] px-4 text-black bg-[rgba(255,255,255,0.7)] placeholder-gray-600 border-2 transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white ${errors.fullName ? 'border-red-400' : 'border-transparent'}`}
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                  placeholder="Enter your full name"
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                />
                {errors.fullName && (
                  <p id="fullName-error" className="text-red-400 text-sm mt-1" role="alert">
                    {errors.fullName}
                  </p>
                )}
              </div>
            </div>

            {/* Organization */}
            <div className="flex flex-col gap-3 w-full">
              <label htmlFor="organization" className="text-white text-base sm:text-lg md:text-xl lg:text-[22px] font-bold capitalize leading-tight" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Organization or Affiliation
              </label>
              <input
                id="organization"
                type="text"
                value={formData.organization}
                onChange={(e) => handleInputChange('organization', e.target.value)}
                className="w-full h-[52px] md:h-[60px] lg:h-[67px] rounded-[10px] px-4 text-black bg-[rgba(255,255,255,0.7)] placeholder-gray-600 border-2 border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white"
                style={{ fontFamily: '"Poppins", sans-serif' }}
                placeholder="Enter your organization"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-3 w-full">
              <label htmlFor="email" className="text-white text-base sm:text-lg md:text-xl lg:text-[22px] font-bold capitalize leading-tight" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Email Address *
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full h-[52px] md:h-[60px] lg:h-[67px] rounded-[10px] px-4 text-black bg-[rgba(255,255,255,0.7)] placeholder-gray-600 border-2 transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white ${errors.email ? 'border-red-400' : 'border-transparent'}`}
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                  placeholder="Enter your email address"
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-red-400 text-sm mt-1" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-3 w-full">
              <label htmlFor="phone" className="text-white text-base sm:text-lg md:text-xl lg:text-[22px] font-bold capitalize leading-tight" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full h-[52px] md:h-[60px] lg:h-[67px] rounded-[10px] px-4 text-black bg-[rgba(255,255,255,0.7)] placeholder-gray-600 border-2 border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white"
                style={{ fontFamily: '"Poppins", sans-serif' }}
                placeholder="Enter your phone number"
              />
            </div>

            {/* Event Type */}
            <div className="flex flex-col gap-3 w-full">
              <label htmlFor="eventType" className="text-white text-base sm:text-lg md:text-xl lg:text-[22px] font-bold capitalize leading-tight" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Type of Event or Activation
              </label>
              <input
                id="eventType"
                type="text"
                value={formData.eventType}
                onChange={(e) => handleInputChange('eventType', e.target.value)}
                className="w-full h-[52px] md:h-[60px] lg:h-[67px] rounded-[10px] px-4 text-black bg-[rgba(255,255,255,0.7)] placeholder-gray-600 border-2 border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white"
                style={{ fontFamily: '"Poppins", sans-serif' }}
                placeholder="e.g., Corporate event, Product launch"
              />
            </div>

            {/* Budget */}
            <div className="flex flex-col gap-3 w-full">
              <label htmlFor="budget" className="text-white text-base sm:text-lg md:text-xl lg:text-[22px] font-bold capitalize leading-tight" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Budget Range (If Applicable)
              </label>
              <input
                id="budget"
                type="text"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                className="w-full h-[52px] md:h-[60px] lg:h-[67px] rounded-[10px] px-4 text-black bg-[rgba(255,255,255,0.7)] placeholder-gray-600 border-2 border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white"
                style={{ fontFamily: '"Poppins", sans-serif' }}
                placeholder="e.g., $500K - $10M"
              />
            </div>

            {/* Goals */}
            <div className="flex flex-col gap-3 w-full">
              <label htmlFor="goals" className="text-white text-base sm:text-lg md:text-xl lg:text-[22px] font-bold capitalize leading-tight" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Any Specific Goals or Challenges
              </label>
              <textarea
                id="goals"
                value={formData.goals}
                onChange={(e) => handleInputChange('goals', e.target.value)}
                rows={3}
                className="w-full min-h-[52px] md:min-h-[60px] lg:min-h-[67px] max-h-[150px] rounded-[10px] px-4 py-3 text-black bg-[rgba(255,255,255,0.7)] placeholder-gray-600 border-2 border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white resize-none overflow-y-auto"
                style={{ fontFamily: '"Poppins", sans-serif' }}
                placeholder="Describe your goals or challenges"
              />
            </div>

            {/* Urgent Request */}
            <div className="flex flex-col gap-3 w-full">
              <fieldset>
                <legend className="text-white text-base sm:text-lg md:text-xl lg:text-[22px] font-bold capitalize leading-tight mb-3" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Is this an Urgent Request?
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
                    >
                      Yes
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
                    >
                      No
                    </span>
                  </label>
                </div>
              </fieldset>
            </div>

            {/* Submit Button */}
            <div className="lg:col-span-2 flex justify-center lg:justify-start pt-8 pb-4 px-4 lg:px-0">
              <style>{`
                @keyframes slideLeftRight {
                  0%, 100% { transform: translateX(0); }
                  25% { transform: translateX(-5px); }
                  75% { transform: translateX(5px); }
                }
                .submit-cta-button:hover .arrow-circle {
                  animation: slideLeftRight 1s ease-in-out infinite;
                }
              `}</style>
              
              <button 
                type="submit"
                disabled={isSubmitting}
                className="submit-cta-button flex items-center gap-2 group relative disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-full"
                aria-describedby={isSubmitting ? "submit-status" : undefined}
              >
                {/* Loading indicator */}
                {isSubmitting && (
                  <div className="sr-only" id="submit-status" aria-live="polite" aria-atomic="true">
                    Submitting form, please wait...
                  </div>
                )}
                
                {/* Main button pill with gradient */}
                <div 
                  className={`rounded-full flex items-center justify-center pointer-events-none transition-all duration-200 ${
                    isSubmitting ? 'opacity-90' : 'group-hover:shadow-lg'
                  }`}
                  style={{ 
                    background: isSubmitting 
                      ? 'linear-gradient(90deg, #7afdd6 0%, #a095e1 60%, #b8a4ff 90%)' 
                      : 'linear-gradient(90deg, #7afdd6 0%, #a095e1 60%, #b8a4ff 90%)',
                    height: 'clamp(48px, 5vw, 65px)',
                    paddingLeft: 'clamp(24px, 3vw, 36px)',
                    paddingRight: 'clamp(24px, 3vw, 36px)'
                  }}
                >
                  <span className="text-[#2c2c2b] text-[20px] font-normal flex items-center gap-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    {isSubmitting && (
                      <div className="w-4 h-4 border-2 border-[#2c2c2b] border-t-transparent rounded-full animate-spin" role="presentation" aria-hidden="true" />
                    )}
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </span>
                </div>
                
                {/* Arrow circle - animated on hover */}
                <div 
                  className="arrow-circle rounded-full bg-[#b8a4ff] flex items-center justify-center pointer-events-none"
                  style={{ 
                    width: 'clamp(48px, 5vw, 65px)',
                    height: 'clamp(48px, 5vw, 65px)',
                    flexShrink: 0
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
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
            <div className="flex items-center justify-between">
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
                className="ml-2 text-white/80 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded-md p-1"
                aria-label="Close notification"
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