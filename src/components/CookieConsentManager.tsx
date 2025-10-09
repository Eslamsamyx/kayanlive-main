'use client';

import CookieConsent from './CookieConsent';
import CookiePreferences from './CookiePreferences';

/**
 * CookieConsentManager - GDPR/PDPL Compliant Cookie Management System
 *
 * This component manages the cookie consent flow across the entire application:
 * - Shows banner on first visit or when consent version changes
 * - Provides granular control over cookie categories
 * - Persists user preferences in localStorage
 * - Blocks non-consented cookies automatically
 *
 * Compliant with:
 * - GDPR (General Data Protection Regulation) - EU
 * - PDPL (Personal Data Protection Law) - Saudi Arabia
 */
export default function CookieConsentManager() {
  return (
    <>
      <CookieConsent />
      <CookiePreferences />
    </>
  );
}
