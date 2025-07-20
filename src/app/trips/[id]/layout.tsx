import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    
    // Fetch trip data from database
    const trip = await prisma.trip.findUnique({
      where: { id },
      select: {
        destination: true,
        duration: true,
        peopleCount: true,
        budget: true,
        currency: true,
      },
    });

    if (!trip) {
      return {
        title: "Trip Not Found | AI Travel Planner",
        description: "The requested travel itinerary could not be found.",
      };
    }

    const title = `${trip.destination} Travel Itinerary | AI Travel Planner`;
    const description = `${trip.duration}-day travel plan for ${trip.destination} with a budget of ${trip.currency}${trip.budget} for ${trip.peopleCount} people. Created with AI Travel Planner.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        url: `https://aitravelplanner.richadali.dev/trips/${id}`,
        images: [
          {
            url: `https://aitravelplanner.richadali.dev/api/og?title=${encodeURIComponent(trip.destination)}&destination=${encodeURIComponent(`${trip.duration}-day Itinerary`)}&v=${new Date().getTime()}`,
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
        images: [`https://aitravelplanner.richadali.dev/api/og?title=${encodeURIComponent(trip.destination)}&destination=${encodeURIComponent(`${trip.duration}-day Itinerary`)}&v=${new Date().getTime()}`],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Travel Itinerary | AI Travel Planner",
      description: "View your AI-generated travel itinerary.",
  openGraph: {
        images: [{ url: "https://aitravelplanner.richadali.dev/og.jpg" }],
      },
      twitter: {
        images: ["https://aitravelplanner.richadali.dev/og.jpg"],
  },
};
  }
}

export default function TripLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 