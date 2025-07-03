import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that should not be tracked
const EXCLUDED_PATHS = [
  '/api/',
  '/_next/',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/admin', // Exclude admin routes from tracking
  '/manifest',
  '/icon-',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('[Middleware] Processing request for path:', pathname);

  // Skip tracking for excluded paths
  if (EXCLUDED_PATHS.some(path => pathname.startsWith(path))) {
    console.log('[Middleware] Skipping tracking for excluded path:', pathname);
    return NextResponse.next();
  }

  // Skip tracking for development environment
  if (process.env.NODE_ENV === 'development' && 
      (pathname.includes('__nextjs') || pathname.includes('_next/static'))) {
    return NextResponse.next();
  }

  // Track page view asynchronously - don't await to avoid delaying response
  try {
    console.log('[Middleware] Tracking page view for:', pathname);
    
    // Get referrer if available
    const referrer = request.headers.get('referer') || null;
    
    // Extract IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Send analytics data to API endpoint
    fetch(`${request.nextUrl.origin}/api/admin/analytics/page-view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: pathname,
        referrer,
        ipAddress,
        userAgent,
      }),
    }).catch(error => {
      // Log error but don't affect the user experience
      console.error('[Middleware] Page view tracking failed for:', pathname, error);
    });
  } catch (error) {
    // Ensure any analytics errors don't affect the user experience
    console.error('[Middleware] Error in analytics middleware:', error);
  }

  // Continue with the request
  return NextResponse.next();
}

// Configure middleware to run only on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - API routes that start with /api/ (already excluded above but being explicit)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/|_next/static|_next/image|favicon.ico).*)',
  ],
}; 