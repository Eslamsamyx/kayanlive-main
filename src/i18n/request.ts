import {getRequestConfig} from 'next-intl/server';

export const locales = ['en', 'ar', 'fr', 'ru', 'zh'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({locale}) => {
  // Early return for static files and invalid requests
  if (!locale || typeof locale !== 'string') {
    const fallbackMessages = (await import(`../locales/en.json`)).default;
    return {
      locale: 'en',
      messages: fallbackMessages
    };
  }

  // Skip processing for static files that somehow get through
  if (locale.includes('.') || locale === 'favicon' || locale === 'static') {
    const fallbackMessages = (await import(`../locales/en.json`)).default;
    return {
      locale: 'en',
      messages: fallbackMessages
    };
  }

  console.log(`🔍 getRequestConfig: incoming locale = "${locale}" (type: ${typeof locale})`);

  // Enhanced validation for incoming locale parameter
  let validLocale: Locale = 'en'; // Default fallback

  // Check if it's a valid locale
  if (locales.includes(locale as Locale)) {
    validLocale = locale as Locale;
  } else {
    // Log invalid locale attempts for debugging
    console.warn(`🚨 Invalid locale received: "${locale}" - falling back to "en"`);
  }

  console.log(`🔍 getRequestConfig: mapped to validLocale = "${validLocale}"`);

  try {
    const messages = (await import(`../locales/${validLocale}.json`)).default;

    console.log(`🔍 getRequestConfig: loading messages for "${validLocale}", keys: ${Object.keys(messages).slice(0,3).join(', ')}...`);

    return {
      locale: validLocale,
      messages
    };
  } catch (error) {
    console.error(`🚨 Failed to load messages for locale "${validLocale}":`, error);

    // Fallback to English if the requested locale file doesn't exist
    const fallbackMessages = (await import(`../locales/en.json`)).default;

    return {
      locale: 'en',
      messages: fallbackMessages
    };
  }
});