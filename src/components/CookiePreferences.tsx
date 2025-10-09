'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { X, Shield, Settings, BarChart3, Target } from 'lucide-react';
import type { CookieConsent } from '@/types/cookies';

export default function CookiePreferences() {
  const t = useTranslations('cookies');
  const { showPreferences, closePreferences, savePreferences, acceptAll, rejectAll, consentState } = useCookieConsent();
  const [isVisible, setIsVisible] = useState(false);

  const [preferences, setPreferences] = useState<CookieConsent>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    if (showPreferences) {
      // Load existing consent or default to false
      if (consentState) {
        setPreferences({
          necessary: true,
          functional: consentState.functional,
          analytics: consentState.analytics,
          marketing: consentState.marketing,
        });
      }
      // Trigger animation
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [showPreferences, consentState]);

  if (!showPreferences) return null;

  const handleToggle = (category: keyof CookieConsent) => {
    if (category === 'necessary') return; // Can't toggle necessary cookies
    setPreferences(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const handleSave = () => {
    savePreferences(preferences);
  };

  const handleAcceptAll = () => {
    acceptAll();
  };

  const handleRejectAll = () => {
    rejectAll();
  };

  const categories = [
    {
      key: 'necessary' as const,
      icon: Shield,
      color: 'from-red-400 to-red-600',
      alwaysOn: true,
    },
    {
      key: 'functional' as const,
      icon: Settings,
      color: 'from-blue-400 to-blue-600',
      alwaysOn: false,
    },
    {
      key: 'analytics' as const,
      icon: BarChart3,
      color: 'from-green-400 to-green-600',
      alwaysOn: false,
    },
    {
      key: 'marketing' as const,
      icon: Target,
      color: 'from-purple-400 to-purple-600',
      alwaysOn: false,
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closePreferences}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-labelledby="cookie-preferences-title"
        aria-describedby="cookie-preferences-description"
        aria-modal="true"
        className={`fixed inset-0 z-[10001] flex items-center justify-center p-4 transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="bg-gradient-to-br from-[#2c2c2b] via-[#1a1a1a] to-[#2c2c2b] rounded-2xl shadow-2xl border border-[#3a3a3a] max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Accent gradient line */}
          <div className="h-1 bg-gradient-to-r from-[#a095e1] via-[#7afdd6] to-[#74cfaa]" />

          {/* Header */}
          <div className="p-6 border-b border-[#3a3a3a] flex items-center justify-between">
            <h2
              id="cookie-preferences-title"
              className="text-2xl md:text-3xl font-bold text-white"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              {t('preferences.title')}
            </h2>
            <button
              onClick={closePreferences}
              className="p-2 rounded-full hover:bg-[#3a3a3a] transition-colors duration-200"
              aria-label={t('preferences.close')}
            >
              <X className="w-6 h-6 text-[#c3c3c3]" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <p
              id="cookie-preferences-description"
              className="text-[#c3c3c3] text-sm md:text-base leading-relaxed"
            >
              {t('preferences.description')}
            </p>

            {/* Cookie Categories */}
            <div className="space-y-4">
              {categories.map(({ key, icon: Icon, color, alwaysOn }) => (
                <div
                  key={key}
                  className="bg-[#1a1a1a] rounded-xl p-5 border border-[#3a3a3a] hover:border-[#4a4a4a] transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r ${color} flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <h3
                          className="text-lg font-semibold text-white"
                          style={{ fontFamily: '"Poppins", sans-serif' }}
                        >
                          {t(`categories.${key}.title`)}
                        </h3>

                        {/* Toggle Switch */}
                        {alwaysOn ? (
                          <span className="text-xs font-medium text-[#7afdd6] px-3 py-1 rounded-full bg-[#7afdd6]/10 border border-[#7afdd6]/30">
                            {t('categories.necessary.alwaysActive')}
                          </span>
                        ) : (
                          <button
                            role="switch"
                            aria-checked={preferences[key]}
                            aria-label={`Toggle ${t(`categories.${key}.title`)}`}
                            onClick={() => handleToggle(key)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-offset-2 focus:ring-offset-[#2c2c2b] ${
                              preferences[key] ? 'bg-gradient-to-r from-[#7afdd6] to-[#74cfaa]' : 'bg-[#3a3a3a]'
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${
                                preferences[key] ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      <p className="text-sm text-[#888888] leading-relaxed">
                        {t(`categories.${key}.description`)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Legal Notice */}
            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#3a3a3a]">
              <p className="text-xs text-[#888888] leading-relaxed">
                {t('legal.gdprCompliance')} {t('legal.yourRights')}
              </p>
            </div>
          </div>

          {/* Footer - Action Buttons */}
          <div className="p-6 border-t border-[#3a3a3a] space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-[#7afdd6] to-[#74cfaa] hover:from-[#6ee8c5] hover:to-[#68e09f] text-[#2c2c2b] font-semibold px-6 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-[#7afdd6]/20 hover:scale-105"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                {t('preferences.savePreferences')}
              </button>

              <button
                onClick={handleAcceptAll}
                className="flex-1 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 border border-[#5a5a5a] hover:border-[#7afdd6]"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                {t('preferences.acceptAll')}
              </button>
            </div>

            <button
              onClick={handleRejectAll}
              className="w-full bg-transparent hover:bg-[#3a3a3a] text-[#888888] hover:text-white font-semibold px-6 py-2 rounded-full transition-all duration-300 border border-[#3a3a3a] hover:border-[#5a5a5a]"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              {t('preferences.rejectAll')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
