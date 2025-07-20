import { Metadata } from "next";
import config from "@/lib/config";

// Get base URL from config
const baseUrl = config.app.baseUrl || "https://aitravelplanner.richadali.dev";

export const metadata: Metadata = {
  title: "AI Travel Planner | Personalized Trip Itineraries",
  description: "Plan your perfect trip with AI assistance. Get personalized travel itineraries based on your destination, budget, and preferences.",
  metadataBase: new URL(baseUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    title: "AI Travel Planner | Personalized Trip Itineraries",
    description: "Plan your perfect trip with AI assistance. Get personalized travel itineraries based on your destination, budget, and preferences.",
    siteName: "AI Travel Planner",
    images: [
      {
        url: `${baseUrl}/og.png`,
        width: 1200,
        height: 630,
        alt: "AI Travel Planner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Travel Planner | Personalized Trip Itineraries",
    description: "Plan your perfect trip with AI assistance. Get personalized travel itineraries based on your destination, budget, and preferences.",
    images: [
      {
        url: `${baseUrl}/og.png`,
        width: 1200,
        height: 630,
        alt: "AI Travel Planner",
      }
    ],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  alternates: {
    canonical: baseUrl,
  },
}; 