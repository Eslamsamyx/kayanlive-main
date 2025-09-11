import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'ar', 'fr', 'ru', 'zh'],
  
  // Used when no locale matches
  defaultLocale: 'en',
  
  // Always use a locale prefix in the URL
  localePrefix: 'always'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(en|ar|fr|ru|zh)/:path*']
};