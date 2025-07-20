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