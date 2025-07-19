'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { AnalyticsService } from '@/lib/analytics';

// Component that uses useSearchParams
function AnalyticsTrackerContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
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
    
    if (shouldExclude) {
      return;
    }
    
    // Track page view when the route changes
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    // Track with Google Analytics
    AnalyticsService.trackGoogleAnalyticsPageView(url);
    
    // Track with our internal analytics
    // Add a small delay to ensure the page is loaded
    const trackPageView = setTimeout(() => {
      fetch('/api/analytics/page-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: url }),
        // Use keepalive to ensure the request completes even if the page is unloaded
        keepalive: true,
      }).catch(error => {
        // Silent fail - analytics should never break the app
        console.error('Failed to track page view:', error);
      });
    }, 500);
    
    return () => clearTimeout(trackPageView);
  }, [pathname, searchParams]);

  // This component doesn't render anything
  return null;
}

// Main component with Suspense boundary
export function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <AnalyticsTrackerContent />
    </Suspense>
  );
} 