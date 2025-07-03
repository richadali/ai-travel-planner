import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trip Details | AI Travel Planner",
  description: "View your personalized travel itinerary with activities, accommodations, and budget breakdown",
  openGraph: {
    title: "Trip Details | AI Travel Planner",
    description: "View your personalized travel itinerary with activities, accommodations, and budget breakdown",
    type: "website",
    locale: "en_US",
  },
};

export default function TripDetailLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
} 