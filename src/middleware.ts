import createMiddleware from 'next-intl/middleware';
import { withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'ar', 'fr', 'ru', 'zh'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Always use a locale prefix in the URL
  localePrefix: 'always'
});

const authMiddleware = withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Allow public routes
    if (pathname.startsWith('/api/auth') ||
        pathname.includes('/api/trpc/lead.create') ||
        !pathname.includes('/admin')) {
      return intlMiddleware(req);
    }

    // Require authentication for admin routes
    if (!token) {
      const url = new URL('/en/login', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    const userRole = token.role as string;

    // Admin can access everything
    if (userRole === 'ADMIN') {
      return NextResponse.next();
    }

    // Moderator restrictions
    if (userRole === 'MODERATOR') {
      // Moderators can access leads and articles, but not user management
      if (pathname.includes('/admin/users') && !pathname.includes('/profile')) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
      return NextResponse.next();
    }

    // Content Creator restrictions
    if (userRole === 'CONTENT_CREATOR') {
      // Content creators can only access articles and their profile
      if (pathname.includes('/admin/leads') ||
          (pathname.includes('/admin/users') && !pathname.includes('/profile'))) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
      return NextResponse.next();
    }

    // Default: redirect to dashboard if role is not recognized
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        if (!req.nextUrl.pathname.includes('/admin')) {
          return true;
        }
        // Require token for admin routes
        return !!token;
      },
    },
  }
);

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Apply auth middleware for admin routes
  if (pathname.includes('/admin')) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (authMiddleware as any)(request);
  }

  // Apply intl middleware for all other routes
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api (API routes)
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - / (root redirect)
    // - Static files (images, etc.)
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Always run for API routes except auth
    '/api/((?!auth).)*',
    // Admin routes
    '/admin/:path*'
  ]
};