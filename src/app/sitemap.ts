import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // Base URLs
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  // Shared trip URLs
  const sharedTripUrls: MetadataRoute.Sitemap = sharedTrips.map((trip) => ({
    url: `${baseUrl}/trips/share/${trip.shareId}`,
    lastModified: trip.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticUrls, ...sharedTripUrls];
} 