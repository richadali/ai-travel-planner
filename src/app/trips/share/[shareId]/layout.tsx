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
    const baseUrl = config.app.baseUrl.replace(/\/$/, ''); // Remove trailing slash if present
    
    // Fetch shared trip data from database
    const trip = await prisma.trip.findUnique({
      where: { shareId },
      select: {
        destination: true,
        duration: true,
        peopleCount: true,
        budget: true,
        currency: true,
        ownerName: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!trip) {
      return {
        title: "Shared Trip Not Found | AI Travel Planner",
        description: "The requested shared travel itinerary could not be found.",
        openGraph: {
          images: [{ url: `${baseUrl}/og.png` }],
        },
        twitter: {
          images: [`${baseUrl}/og.png`],
        },
      };
    }

    const ownerName = trip.ownerName || trip.user?.name || "a traveler";
    const title = `${trip.destination} Travel Itinerary | Shared by ${ownerName} | AI Travel Planner`;
    const description = `${trip.duration}-day travel plan for ${trip.destination} with a budget of ${trip.currency}${trip.budget} for ${trip.peopleCount} people. Created with AI Travel Planner and shared by ${ownerName}.`;

    // Use the OG image generator
    const ogImageUrl = `${baseUrl}/api/og?destination=${encodeURIComponent(trip.destination)}&duration=${trip.duration}&sharedBy=${encodeURIComponent(ownerName)}`;

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
    const baseUrl = config.app.baseUrl.replace(/\/$/, '');
    return {
      title: "Shared Travel Itinerary | AI Travel Planner",
      description: "View a shared AI-generated travel itinerary.",
      openGraph: {
        images: [{ url: `${baseUrl}/og.png` }],
      },
      twitter: {
        images: [`${baseUrl}/og.png`],
      },
    };
  }
}

export default function SharedTripLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 