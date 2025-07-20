import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import config from '@/lib/config';

// Simple OG image URL construction
const baseUrl = config.app.baseUrl.replace(/\/$/, '');
const ogImageUrl = `${baseUrl}/api/og-simple?destination=${encodeURIComponent('Paris')}`;

export const metadata: Metadata = {
  title: 'Test OG Image | AI Travel Planner',
  description: 'Testing OG image generation',
  openGraph: {
    title: 'Test OG Image | AI Travel Planner',
    description: 'Testing OG image generation',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'Test OG Image',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Test OG Image | AI Travel Planner',
    description: 'Testing OG image generation',
    images: [ogImageUrl],
  },
};

export default function TestOGPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Test OG Image</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">OG Image URL:</h2>
        <code className="block bg-slate-100 dark:bg-slate-800 p-4 rounded overflow-x-auto">
          {ogImageUrl}
        </code>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Preview:</h2>
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <img 
            src={ogImageUrl} 
            alt="OG Image Preview" 
            className="w-full h-auto"
          />
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Direct Image Links:</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <Link 
              href="/api/og-simple?destination=Paris" 
              target="_blank"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Simple OG Image
            </Link>
          </li>
          <li>
            <Link 
              href="/api/og?title=Test+Title&destination=Paris" 
              target="_blank"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Original OG Image
            </Link>
          </li>
          <li>
            <Link 
              href="/og.png" 
              target="_blank"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Default static OG image
            </Link>
          </li>
        </ul>
      </div>
      
      <div>
        <Link 
          href="/" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
} 