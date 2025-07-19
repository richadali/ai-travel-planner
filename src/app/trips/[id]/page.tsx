"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ItineraryType } from "@/types";
import Script from "next/script";

// Lazy load the ItineraryDisplay component
const ItineraryDisplay = React.lazy(() => import("@/components/itinerary-display").then(mod => ({ 
  default: mod.ItineraryDisplay 
})));

interface Trip {
  id: string;
  destination: string;
  duration: number;
  peopleCount: number;
  budget: number;
  currency: string;
  itinerary: ItineraryType;
  createdAt: string;
}

export default function TripDetail() {
  const params = useParams();
  const tripId = params.id as string;
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [structuredData, setStructuredData] = useState<string>('');

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/trips/${tripId}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch trip details");
        }

        setTrip(result.trip);
        
        // Create structured data for SEO
        if (result.trip) {
          const trip = result.trip;
          const jsonLd = {
            "@context": "https://schema.org",
            "@type": "TravelAction",
            "agent": {
              "@type": "Person",
              "name": "Traveler"
            },
            "location": {
              "@type": "Place",
              "name": trip.destination,
              "address": trip.destination
            },
            "startTime": trip.createdAt,
            "endTime": new Date(new Date(trip.createdAt).getTime() + (trip.duration * 24 * 60 * 60 * 1000)).toISOString(),
            "instrument": "AI Travel Planner",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `https://aitravelplanner.richadali.dev/trips/${trip.id}`,
              "inLanguage": "en-US",
              "actionPlatform": [
                "https://schema.org/DesktopWebPlatform",
                "https://schema.org/MobileWebPlatform"
              ]
            },
            "result": {
              "@type": "Trip",
              "name": `${trip.duration}-day trip to ${trip.destination}`,
              "description": `A ${trip.duration}-day travel itinerary for ${trip.destination} with a budget of ${trip.currency}${trip.budget} for ${trip.peopleCount} people.`,
              "itinerary": Object.keys(trip.itinerary).map(day => ({
                "@type": "TouristAttraction",
                "name": `Day ${day} in ${trip.destination}`,
                "description": trip.itinerary[day].activities.map((activity: any) => activity.title).join(", ")
              }))
            }
          };
          
          setStructuredData(JSON.stringify(jsonLd));
        }
      } catch (err: any) {
        console.error("Error fetching trip details:", err);
        setError(err.message || "An error occurred while fetching the trip details");
      } finally {
        setIsLoading(false);
      }
    };

    if (tripId) {
      fetchTrip();
    }
  }, [tripId]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Add structured data for SEO */}
      {structuredData && (
        <Script id="structured-data" type="application/ld+json">
          {structuredData}
        </Script>
      )}
      
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4 md:px-6 max-w-7xl">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        ) : trip ? (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{trip.destination}</h1>
                <p className="text-muted-foreground">
                  {trip.duration} days • {trip.peopleCount} people • Created on {formatDate(trip.createdAt)}
                </p>
              </div>
              <Link href="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>

            <Suspense fallback={<div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>}>
              <ItineraryDisplay 
                itinerary={trip.itinerary}
                tripMetadata={{
                  destination: trip.destination,
                  duration: trip.duration,
                  peopleCount: trip.peopleCount,
                  budget: trip.budget,
                  currency: trip.currency,
                }}
              />
            </Suspense>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl mb-4">Trip not found</p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
} 