import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AI Travel Planner',
    short_name: 'Travel Planner',
    description: 'Plan your perfect trip with AI assistance. Get personalized travel itineraries based on your destination, budget, and preferences.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    related_applications: [
      {
        platform: 'web',
        url: 'https://aitravelplanner.richadali.dev',
      },
    ],
    categories: ['travel', 'planning', 'ai', 'itinerary'],
    screenshots: [
      {
        src: '/screenshots/desktop.jpg',
        sizes: '1280x720',
        type: 'image/jpeg',
      },
      {
        src: '/screenshots/mobile.jpg',
        sizes: '750x1334',
        type: 'image/jpeg',
      },
    ],
  };
} 