export type CookieCategory = 'necessary' | 'functional' | 'analytics' | 'marketing';

export interface CookieConsent {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface CookieConsentState extends CookieConsent {
  hasResponded: boolean;
  timestamp: number;
  version: string;
}

export const COOKIE_CONSENT_VERSION = '1.0';
export const COOKIE_CONSENT_KEY = 'kayan_cookie_consent';
export const COOKIE_CONSENT_EXPIRES = 365; // days
