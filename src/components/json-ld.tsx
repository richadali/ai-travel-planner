'use client';

import Script from 'next/script';

interface JsonLdProps {
  data: Record<string, any> | Record<string, any>[];
}

/**
 * Component for adding structured data (JSON-LD) to pages
 * 
 * @example
 * <JsonLd 
 *   data={{
 *     "@context": "https://schema.org",
 *     "@type": "WebSite",
 *     "name": "AI Travel Planner",
 *     "url": "https://aitravelplanner.richadali.dev"
 *   }} 
 * />
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <Script 
      id="json-ld"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
} 