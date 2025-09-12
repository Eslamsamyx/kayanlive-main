import {getRequestConfig} from 'next-intl/server';

export const locales = ['en', 'ar', 'fr', 'ru', 'zh'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({locale}) => {
  console.log(`🔍 getRequestConfig: incoming locale = "${locale}" (type: ${typeof locale})`);
  
  // Validate that the incoming `locale` parameter is valid  
  const validLocale: Locale = locales.includes(locale as Locale) ? (locale as Locale) : 'en';
  
  console.log(`🔍 getRequestConfig: mapped to validLocale = "${validLocale}"`);

  const messages = (await import(`../locales/${validLocale}.json`)).default;
  
  console.log(`🔍 getRequestConfig: loading messages for "${validLocale}", keys: ${Object.keys(messages).slice(0,3).join(', ')}...`);
  
  return {
    locale: validLocale,
    messages
  };
});