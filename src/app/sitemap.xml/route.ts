import { prisma } from "@/lib/prisma";

export async function GET(): Promise<Response> {
  try {
    // Define the base URL
    const baseUrl = 'https://aitravelplanner.richadali.dev';
    
    // Get all public trips that are shared
    const sharedTrips = await prisma.trip.findMany({
      where: {
        shareId: {
          not: null
        },
      },
      select: {
        id: true,
        updatedAt: true,
        shareId: true,
      },
    });
    
    // Create the sitemap XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/login</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/dashboard</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  ${sharedTrips.map(trip => `
  <url>
    <loc>${baseUrl}/trips/share/${trip.shareId}</loc>
    <lastmod>${trip.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  `).join('')}
  <url>
    <loc>${baseUrl}/destinations/paris</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/destinations/new-york</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/destinations/tokyo</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/destinations/london</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/destinations/dubai</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`;

    // Return the XML response
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
} 