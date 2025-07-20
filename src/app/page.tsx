import { Metadata } from "next";
import config from "@/lib/config";
import HomePageClient from "./page-client";

// Get base URL from config
const baseUrl = config.app.baseUrl.replace(/\/$/, ''); // Remove trailing slash if present

export const metadata: Metadata = {
  title: "AI Travel Planner | Personalized Trip Itineraries",
  description: "Plan your perfect trip with AI assistance. Get personalized travel itineraries based on your destination, budget, and preferences.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    title: "AI Travel Planner | Personalized Trip Itineraries",
    description: "Plan your perfect trip with AI assistance. Get personalized travel itineraries based on your destination, budget, and preferences.",
    siteName: "AI Travel Planner",
    images: [
      {
        url: `${baseUrl}/api/og/home`,
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
    images: [`${baseUrl}/api/og/home`],
  },
  alternates: {
    canonical: baseUrl,
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
