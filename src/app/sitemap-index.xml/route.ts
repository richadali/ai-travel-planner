import { MetadataRoute } from 'next';

export function GET(): Response {
  // Define the base URL
  const baseUrl = 'https://aitravelplanner.richadali.dev';
  
  // Create the sitemap index XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;

  // Return the XML response
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'no-cache', // Disable caching to ensure fresh content
    },
  });
} 