'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CookieConsent,
  CookieConsentState,
  COOKIE_CONSENT_KEY,
  COOKIE_CONSENT_VERSION,
  COOKIE_CONSENT_EXPIRES,
} from '@/types/cookies';
import {
  getConsentState,
  setCookie,
  deleteNonConsentedCookies,
  initializeAnalytics,
  initializeMarketing,
} from '@/lib/cookies';

export function useCookieConsent() {
  const [consentState, setConsentState] = useState<CookieConsentState | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load consent state on mount
  useEffect(() => {
    const loadConsent = () => {
      const stored = getConsentState();

      if (stored) {
        // Check if version matches - if not, show banner again
        if (stored.version === COOKIE_CONSENT_VERSION) {
          setConsentState(stored);
          setShowBanner(false);

          // Initialize services based on consent
          if (stored.analytics) initializeAnalytics();
          if (stored.marketing) initializeMarketing();
        } else {
          // Version changed - request new consent
          setShowBanner(true);
        }
      } else {
        // No consent stored - show banner
        setShowBanner(true);
      }

      setIsLoading(false);
    };

    // Small delay to prevent flash
    const timer = setTimeout(loadConsent, 100);
    return () => clearTimeout(timer);
  }, []);

  // Save consent to localStorage and cookie
  const saveConsent = useCallback((consent: CookieConsent, hasResponded: boolean = true) => {
    const newState: CookieConsentState = {
      ...consent,
      hasResponded,
      timestamp: Date.now(),
      version: COOKIE_CONSENT_VERSION,
    };

    // Save to localStorage
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newState));

    // Save consent cookie (necessary category, always allowed)
    setCookie(COOKIE_CONSENT_KEY, 'true', 'necessary', COOKIE_CONSENT_EXPIRES);

    // Clean up non-consented cookies
    deleteNonConsentedCookies(newState);

    // Initialize services based on new consent
    if (consent.analytics) initializeAnalytics();
    if (consent.marketing) initializeMarketing();

    // Update state
    setConsentState(newState);
    setShowBanner(false);
    setShowPreferences(false);
  }, []);

  // Accept all cookies
  const acceptAll = useCallback(() => {
    saveConsent({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
  }, [saveConsent]);

  // Reject all non-essential cookies
  const rejectAll = useCallback(() => {
    saveConsent({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
  }, [saveConsent]);

  // Save custom preferences
  const savePreferences = useCallback((preferences: CookieConsent) => {
    saveConsent(preferences);
  }, [saveConsent]);

  // Open preferences modal
  const openPreferences = useCallback(() => {
    setShowPreferences(true);
    setShowBanner(false);
  }, []);

  // Close preferences modal
  const closePreferences = useCallback(() => {
    setShowPreferences(false);
    // If user hasn't responded yet, show banner again
    if (!consentState?.hasResponded) {
      setShowBanner(true);
    }
  }, [consentState]);

  return {
    consentState,
    showBanner,
    showPreferences,
    isLoading,
    acceptAll,
    rejectAll,
    savePreferences,
    openPreferences,
    closePreferences,
  };
}
