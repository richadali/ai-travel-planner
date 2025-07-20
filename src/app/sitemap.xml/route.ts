import { prisma } from '@/lib/prisma';

export async function GET(): Promise<Response> {
  const baseUrl = 'https://aitravelplanner.richadali.dev';

  // Get all public shared trips
  const sharedTrips = await prisma.trip.findMany({
    select: {
      shareId: true,
      updatedAt: true,
    },
    where: {
      shareId: {
        not: null, // Only include trips with shareId
      },
      shareExpiry: {
        gt: new Date(), // Only include non-expired shares
      },
    },
    take: 100, // Limit to 100 entries to avoid huge sitemaps
  });

  // Start building the XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1</priority>
  </url>`;

  // Add shared trip URLs
  for (const trip of sharedTrips) {
    xml += `
  <url>
    <loc>${baseUrl}/trips/share/${trip.shareId}</loc>
    <lastmod>${trip.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }

  // Close the XML
  xml += `
</urlset>`;

  // Return the XML response
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'no-cache', // Disable caching to ensure fresh content
    },
  });
} 