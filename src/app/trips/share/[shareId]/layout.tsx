import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

interface Props {
  params: { shareId: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    // Fetch shared trip data from database
    const trip = await prisma.trip.findUnique({
      where: { shareId: params.shareId },
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
      },
    });

    if (!trip) {
      return {
        title: "Shared Trip Not Found | AI Travel Planner",
        description: "The requested shared travel itinerary could not be found.",
        openGraph: {
          images: [{ url: "https://aitravelplanner.richadali.dev/og.png" }],
        },
        twitter: {
          images: ["https://aitravelplanner.richadali.dev/og.png"],
        },
      };
    }

    const ownerName = trip.user?.name || "a traveler";
    const title = `${trip.destination} Travel Itinerary | Shared by ${ownerName} | AI Travel Planner`;
    const description = `${trip.duration}-day travel plan for ${trip.destination} with a budget of ${trip.currency}${trip.budget} for ${trip.peopleCount} people. Created with AI Travel Planner and shared by ${ownerName}.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        url: `https://aitravelplanner.richadali.dev/trips/share/${params.shareId}`,
        images: [
          {
            url: `https://aitravelplanner.richadali.dev/api/og?title=${encodeURIComponent(trip.destination)}&destination=${encodeURIComponent(`${trip.duration}-day Itinerary`)}`,
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
        images: [`https://aitravelplanner.richadali.dev/api/og?title=${encodeURIComponent(trip.destination)}&destination=${encodeURIComponent(`${trip.duration}-day Itinerary`)}`],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Shared Travel Itinerary | AI Travel Planner",
      description: "View a shared AI-generated travel itinerary.",
      openGraph: {
        images: [{ url: "https://aitravelplanner.richadali.dev/og.png" }],
      },
      twitter: {
        images: ["https://aitravelplanner.richadali.dev/og.png"],
      },
    };
  }
}

export default function SharedTripLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 