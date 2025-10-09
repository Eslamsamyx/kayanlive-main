import { CookieCategory, CookieConsentState, COOKIE_CONSENT_KEY } from '@/types/cookies';

/**
 * GDPR/PDPL Compliant Cookie Management
 * All cookie operations check consent before execution
 */

// Get consent state from localStorage
export function getConsentState(): CookieConsentState | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as CookieConsentState;
  } catch {
    return null;
  }
}

// Check if user has consented to a specific cookie category
export function hasConsent(category: CookieCategory): boolean {
  const consent = getConsentState();

  // Necessary cookies are always allowed
  if (category === 'necessary') return true;

  // If no consent recorded, deny non-essential cookies
  if (!consent) return false;

  return consent[category] === true;
}

// Set a cookie only if consent is granted for its category
export function setCookie(
  name: string,
  value: string,
  category: CookieCategory,
  days: number = 365
): boolean {
  if (typeof window === 'undefined') return false;

  // Check consent before setting cookie
  if (!hasConsent(category)) {
    console.warn(`Cookie "${name}" not set: no consent for "${category}" cookies`);
    return false;
  }

  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    return true;
  } catch {
    return false;
  }
}

// Get a cookie value
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length);
      }
    }
    return null;
  } catch {
    return null;
  }
}

// Delete a cookie
export function deleteCookie(name: string): void {
  if (typeof window === 'undefined') return;

  try {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  } catch {
    // Silent fail
  }
}

// Delete all non-necessary cookies when consent is revoked
export function deleteNonConsentedCookies(consent: CookieConsentState): void {
  if (typeof window === 'undefined') return;

  try {
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      const name = cookie.split('=')[0]?.trim();
      if (!name) continue;

      // Don't delete necessary cookies or consent cookie
      if (name === COOKIE_CONSENT_KEY || isNecessaryCookie(name)) {
        continue;
      }

      // Delete analytics cookies if consent revoked
      if (!consent.analytics && isAnalyticsCookie(name)) {
        deleteCookie(name);
      }

      // Delete marketing cookies if consent revoked
      if (!consent.marketing && isMarketingCookie(name)) {
        deleteCookie(name);
      }

      // Delete functional cookies if consent revoked
      if (!consent.functional && isFunctionalCookie(name)) {
        deleteCookie(name);
      }
    }
  } catch {
    // Silent fail
  }
}

// Helper functions to categorize cookies
function isNecessaryCookie(name: string): boolean {
  const necessaryCookies = [
    'next-auth',
    'session',
    '__Secure',
    '__Host',
    'csrf',
    COOKIE_CONSENT_KEY
  ];
  return necessaryCookies.some(pattern => name.includes(pattern));
}

function isAnalyticsCookie(name: string): boolean {
  const analyticsCookies = ['_ga', '_gid', '_gat', 'gtm', '_hjid', '_hjSessionUser'];
  return analyticsCookies.some(pattern => name.includes(pattern));
}

function isMarketingCookie(name: string): boolean {
  const marketingCookies = ['_fbp', '_gcl', 'fr', 'tr', 'ads', 'marketing'];
  return marketingCookies.some(pattern => name.includes(pattern));
}

function isFunctionalCookie(name: string): boolean {
  const functionalCookies = ['theme', 'language', 'preferences', 'settings'];
  return functionalCookies.some(pattern => name.includes(pattern));
}

// Initialize Google Analytics only if consent granted
export function initializeAnalytics(): void {
  if (!hasConsent('analytics')) return;

  // Analytics initialization logic goes here
  // This is called after user grants analytics consent
  console.log('Analytics initialized with user consent');
}

// Initialize marketing tools only if consent granted
export function initializeMarketing(): void {
  if (!hasConsent('marketing')) return;

  // Marketing tools initialization logic goes here
  console.log('Marketing tools initialized with user consent');
}
