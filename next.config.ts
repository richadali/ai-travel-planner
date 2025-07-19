import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'lh3.googleusercontent.com',  // Google user profile images
      'lh4.googleusercontent.com',  // Alternative Google domain
      'lh5.googleusercontent.com',  // Alternative Google domain
      'lh6.googleusercontent.com',  // Alternative Google domain
    ],
  },
  // Disable ESLint during builds
  eslint: {
    // Only run ESLint on specific directories during builds
    dirs: ['app', 'components', 'pages'],
    // Don't fail the build if there are ESLint errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
