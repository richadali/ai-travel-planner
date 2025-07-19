import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets, API routes, and login page
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') || 
    pathname.startsWith('/api/auth') || // Skip NextAuth routes completely
    pathname === '/api/auth/callback/google' ||
    pathname === '/login' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }
  
  // For other API routes, only skip the analytics tracking
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  // Track page view asynchronously - don't await to avoid delaying response
  try {
    // Skip tracking for excluded paths
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

    // Check if path should be excluded
    const shouldExclude = EXCLUDED_PATHS.some(path => pathname.startsWith(path));

  // Skip tracking for excluded paths
    if (!shouldExclude) {
    // Get referrer if available
    const referrer = request.headers.get('referer') || null;
    
    // Extract IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

      // Get user ID from session if available
      const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET
      });
      
      const userId = token?.sub || null;
      
      // Track page view by calling the API endpoint
    fetch(`${request.nextUrl.origin}/api/admin/analytics/page-view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: pathname,
        referrer,
          userId,
        ipAddress,
        userAgent,
      }),
    }).catch(error => {
        console.error('[Middleware] Failed to send page view tracking request:', error);
    });
    }
  } catch (error) {
    // Ensure any analytics errors don't affect the user experience
    console.error('[Middleware] Error in analytics middleware:', error);
  }

  // Get the session token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
    cookieName: "next-auth.session-token",
  });

  // Check for admin routes access
  if (pathname.startsWith('/admin')) {
    // If no token or email is not the admin email, redirect to home
    if (!token || token.email !== "richadyaminali@gmail.com") {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // Admin access granted, continue
    return NextResponse.next();
  }

  // Check if the path is protected
  const protectedPaths = ["/dashboard", "/trips"];
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || 
    (pathname.startsWith(path + "/") && !pathname.startsWith("/trips/share/"))
  );
  
  // Skip protection for non-protected paths
  if (!isProtectedPath) {
    return NextResponse.next();
  }

  try {
    // If there's no token and it's a protected path, redirect to login
    if (!token && isProtectedPath) {
      // Use a direct login URL with callbackUrl
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      
      return NextResponse.redirect(loginUrl);
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('[Middleware] Error checking authentication:', error);
    // In case of error, redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "AuthError");
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    // Match all paths except static files, images, and specific auth paths
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)"
  ],
}; 