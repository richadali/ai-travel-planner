'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { AnalyticsService } from '@/lib/analytics';

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page view when the route changes
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    // Track with Google Analytics
    AnalyticsService.trackGoogleAnalyticsPageView(url);
    
    // Track with our internal analytics
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
  }, [pathname, searchParams]);

  // This component doesn't render anything
  return null;
} 