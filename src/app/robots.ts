import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/*', 
        '/dashboard', 
        '/admin/*', 
        '/login', 
        '/auth-test',
        '/test-session',
        '/bypass-dashboard',
        '/direct-dashboard',
      ],
    },
    sitemap: 'https://aitravelplanner.richadali.dev/sitemap.xml',
  };
} 