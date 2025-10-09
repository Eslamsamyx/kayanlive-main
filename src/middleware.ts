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
        pathname.includes('/api/trpc/lead.create')) {
      return intlMiddleware(req);
    }

    // Require authentication for dashboard and admin routes
    if (!token) {
      const url = new URL('/en/login', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    const userRole = token.role as string;

    // Allow all authenticated users to access their dashboard routes
    if (pathname.match(/\/[a-z]{2}\/dashboard/) && !pathname.includes('/admin')) {
      return intlMiddleware(req);
    }

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

    // CLIENT role - redirect to client dashboard
    if (userRole === 'CLIENT') {
      // Clients should not access admin routes
      return NextResponse.redirect(new URL('/en/dashboard', req.url));
    }

    // Default: redirect to dashboard if role is not recognized
    return NextResponse.redirect(new URL('/en/dashboard', req.url));
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        // Allow access to public routes (not admin or dashboard)
        if (!pathname.includes('/admin') && !pathname.match(/\/[a-z]{2}\/dashboard/)) {
          return true;
        }
        // Require token for admin and dashboard routes
        return !!token;
      },
    },
  }
);

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Force redirect from root to /en
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/en', request.url));
  }

  // Apply auth middleware for admin routes and protected dashboard routes
  if (pathname.includes('/admin') || pathname.match(/\/[a-z]{2}\/dashboard/)) {
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
    // - Static files (images, etc.)
    // - favicon.ico and robots.txt specifically
    '/((?!api|_next|_vercel|favicon\\.ico|robots\\.txt|.*\\..*|static).*)',
    // Admin routes
    '/admin/:path*'
  ]
};