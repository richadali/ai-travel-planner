import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import config from "@/lib/config";

interface Props {
  params: Promise<{ shareId: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { shareId } = await params;
    
    // Fetch shared trip data from database
    const trip = await prisma.trip.findUnique({
      where: { shareId },
      select: {
        destination: true,
        duration: true,
        peopleCount: true,
        budget: true,
        currency: true,
        user: {
          select: {
            name: true,
          },
        },
        ownerName: true,
      },
    });

    if (!trip) {
      return {
        title: "Shared Trip Not Found | AI Travel Planner",
        description: "The requested shared travel itinerary could not be found.",
        openGraph: {
          images: [{ url: `${config.app.baseUrl}/og.jpg` }],
        },
        twitter: {
          images: [`${config.app.baseUrl}/og.jpg`],
        },
      };
    }

    // Use ownerName from the trip if available, otherwise use the user's name, or default to "a traveler"
    const ownerName = trip.ownerName || (trip.user?.name || "a traveler");
    const title = `${trip.destination} Travel Itinerary | Shared by ${ownerName} | AI Travel Planner`;
    const description = `${trip.duration}-day travel plan for ${trip.destination} with a budget of ${trip.currency}${trip.budget} for ${trip.peopleCount} people. Created with AI Travel Planner and shared by ${ownerName}.`;

    // Construct the OG image URL with proper parameters
    const baseUrl = config.app.baseUrl.replace(/\/$/, ''); // Remove trailing slash if present
    // Add a version parameter to force cache invalidation
    const version = new Date().getTime();
    const ogImageUrl = `${baseUrl}/api/og/shared-trip?destination=${encodeURIComponent(trip.destination)}&duration=${encodeURIComponent(`${trip.duration}-day`)}&owner=${encodeURIComponent(ownerName)}&v=${version}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        url: `${baseUrl}/trips/share/${shareId}`,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${trip.destination} Travel Itinerary`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImageUrl],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Shared Travel Itinerary | AI Travel Planner",
      description: "View a shared AI-generated travel itinerary.",
      openGraph: {
        images: [{ url: `${config.app.baseUrl}/og.jpg` }],
      },
      twitter: {
        images: [`${config.app.baseUrl}/og.jpg`],
      },
    };
  }
}

export default function SharedTripLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 