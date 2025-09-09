'use client';

import { useState } from 'react';
import Image from 'next/image';

const imgConcertBg1 = "/assets/cf27cb2a37e9e3bfd30c1ada4fe4988496b10bbb.png";
const imgEllipse3624 = "/assets/fcf30dee2c13353872f07b1e13a3de14f4d2f85e.svg";
const imgFrame1618874015 = "/assets/4a3ffff37e95986459c2da2bd6d49aaab2861815.svg";

export default function ContactForm() {
  const [isUrgent, setIsUrgent] = useState<'yes' | 'no' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    fullName: '',
    organization: '',
    email: '',
    phone: '',
    eventType: '',
    budget: '',
    goals: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Form submitted:', { ...formData, isUrgent });
      alert('Form submitted successfully!');
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
    } catch (error) {
      alert('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen lg:h-[1049px] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url('${imgConcertBg1}')` }}
      />

      {/* Decorative Ellipse - Hidden on mobile */}
      <div 
        className="absolute hidden lg:block"
        style={{
          height: '286px',
          width: '601px',
          left: '473px',
          top: '63px'
        }}
      >
        <div className="absolute inset-0" style={{ transform: 'scale(2.99, 1.89) translate(-16.7%, -52.4%)' }}>
          <Image 
            src={imgEllipse3624} 
            alt="" 
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Main Form Container */}
      <div className="relative lg:absolute bg-black/30 backdrop-blur-md rounded-[24px] lg:rounded-[66px] mx-4 lg:mx-0 my-8 lg:my-0 p-6 sm:p-8 lg:p-[87px_68px] lg:left-1/2 lg:top-1/2 lg:transform lg:-translate-x-1/2 lg:-translate-y-1/2 max-w-6xl lg:w-[1107px] lg:h-[900px] border border-white/10">
        <form onSubmit={handleSubmit} className="h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-x-[59px] lg:gap-y-[59px] h-full">
            
            {/* Full Name */}
            <div className="flex flex-col gap-3 w-full">
              <label htmlFor="fullName" className="text-white text-lg sm:text-[22px] font-bold capitalize leading-tight" style={{ fontFamily: "'Aeonik', sans-serif" }}>
                Full Name *
              </label>
              <div className="relative">
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`w-full h-[67px] rounded-[10px] px-4 text-black bg-[rgba(255,255,255,0.7)] placeholder-gray-600 border-2 transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white ${errors.fullName ? 'border-red-400' : 'border-transparent'}`}
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
              <label htmlFor="organization" className="text-white text-lg sm:text-[22px] font-bold capitalize leading-tight" style={{ fontFamily: "'Aeonik', sans-serif" }}>
                Organization or Affiliation
              </label>
              <input
                id="organization"
                type="text"
                value={formData.organization}
                onChange={(e) => handleInputChange('organization', e.target.value)}
                className="w-full h-[67px] rounded-[10px] px-4 text-black bg-[rgba(255,255,255,0.7)] placeholder-gray-600 border-2 border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white"
                placeholder="Enter your organization"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-3 w-full">
              <label htmlFor="email" className="text-white text-lg sm:text-[22px] font-bold capitalize leading-tight" style={{ fontFamily: "'Aeonik', sans-serif" }}>
                Email Address *
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full h-[67px] rounded-[10px] px-4 text-black bg-[rgba(255,255,255,0.7)] placeholder-gray-600 border-2 transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white ${errors.email ? 'border-red-400' : 'border-transparent'}`}
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
              <label htmlFor="phone" className="text-white text-lg sm:text-[22px] font-bold capitalize leading-tight" style={{ fontFamily: "'Aeonik', sans-serif" }}>
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full h-[67px] rounded-[10px] px-4 text-black bg-[rgba(255,255,255,0.7)] placeholder-gray-600 border-2 border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Event Type */}
            <div className="flex flex-col gap-3 w-full">
              <label htmlFor="eventType" className="text-white text-lg sm:text-[22px] font-bold capitalize leading-tight" style={{ fontFamily: "'Aeonik', sans-serif" }}>
                Type of Event or Activation
              </label>
              <input
                id="eventType"
                type="text"
                value={formData.eventType}
                onChange={(e) => handleInputChange('eventType', e.target.value)}
                className="w-full h-[67px] rounded-[10px] px-4 text-black bg-[rgba(255,255,255,0.7)] placeholder-gray-600 border-2 border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white"
                placeholder="e.g., Corporate event, Product launch"
              />
            </div>

            {/* Budget */}
            <div className="flex flex-col gap-3 w-full">
              <label htmlFor="budget" className="text-white text-lg sm:text-[22px] font-bold capitalize leading-tight" style={{ fontFamily: "'Aeonik', sans-serif" }}>
                Budget Range (If Applicable)
              </label>
              <input
                id="budget"
                type="text"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                className="w-full h-[67px] rounded-[10px] px-4 text-black bg-[rgba(255,255,255,0.7)] placeholder-gray-600 border-2 border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white"
                placeholder="e.g., $500K - $10M"
              />
            </div>

            {/* Goals */}
            <div className="flex flex-col gap-3 w-full">
              <label htmlFor="goals" className="text-white text-lg sm:text-[22px] font-bold capitalize leading-tight" style={{ fontFamily: "'Aeonik', sans-serif" }}>
                Any Specific Goals or Challenges
              </label>
              <textarea
                id="goals"
                value={formData.goals}
                onChange={(e) => handleInputChange('goals', e.target.value)}
                rows={3}
                className="w-full min-h-[67px] max-h-[150px] rounded-[10px] px-4 py-3 text-black bg-[rgba(255,255,255,0.7)] placeholder-gray-600 border-2 border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white resize-none overflow-y-auto"
                placeholder="Describe your goals or challenges"
              />
            </div>

            {/* Urgent Request */}
            <div className="flex flex-col gap-3 w-full">
              <fieldset>
                <legend className="text-white text-lg sm:text-[22px] font-bold capitalize leading-tight mb-3" style={{ fontFamily: "'Aeonik', sans-serif" }}>
                  Is this an Urgent Request?
                </legend>
                <div className="flex gap-6 items-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="isUrgent"
                      value="yes"
                      checked={isUrgent === 'yes'}
                      onChange={(e) => setIsUrgent(e.target.value as 'yes')}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-[1px] transition-all ${isUrgent === 'yes' ? 'bg-white' : 'bg-[rgba(255,255,255,0.7)]'}`} />
                    <span className="text-white text-lg sm:text-[22px] font-bold capitalize" style={{ fontFamily: "'Aeonik', sans-serif" }}>
                      Yes
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="isUrgent"
                      value="no"
                      checked={isUrgent === 'no'}
                      onChange={(e) => setIsUrgent(e.target.value as 'no')}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-[1px] transition-all ${isUrgent === 'no' ? 'bg-white' : 'bg-[rgba(255,255,255,0.7)]'}`} />
                    <span className="text-white text-lg sm:text-[22px] font-bold capitalize" style={{ fontFamily: "'Aeonik', sans-serif" }}>
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
                className="submit-cta-button flex items-center gap-2 group relative"
              >
                {/* Main button pill with gradient */}
                <div 
                  className="rounded-full flex items-center justify-center pointer-events-none"
                  style={{ 
                    background: 'linear-gradient(90deg, #7afdd6 0%, #a095e1 60%, #b8a4ff 90%)',
                    height: '65px',
                    paddingLeft: '36px',
                    paddingRight: '36px'
                  }}
                >
                  <span className="text-[#2c2c2b] text-[20px] font-normal">
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </span>
                </div>
                
                {/* Arrow circle - animated on hover */}
                <div 
                  className="arrow-circle rounded-full bg-[#b8a4ff] flex items-center justify-center pointer-events-none"
                  style={{ 
                    width: '65px',
                    height: '65px',
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
    </div>
  );
}