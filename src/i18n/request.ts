import {getRequestConfig} from 'next-intl/server';

export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  const validLocale: Locale = locales.includes(locale as Locale) ? (locale as Locale) : 'en';

  try {
    const messages = (await import(`../locales/${validLocale}.json`)).default;
    return {
      locale: validLocale,
      messages
    };
  } catch (error) {
    console.error(`Failed to load messages for locale ${validLocale}:`, error);
    return {
      locale: validLocale,
      messages: {}
    };
  }
});