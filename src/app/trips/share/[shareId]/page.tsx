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
import { User } from "lucide-react";

// Lazy load the ItineraryDisplay component
const ItineraryDisplay = React.lazy(() => import("@/components/itinerary-display").then(mod => ({ 
  default: mod.ItineraryDisplay 
})));

interface SharedTrip {
  id: string;
  destination: string;
  duration: number;
  peopleCount: number;
  budget: number;
  currency: string;
  itinerary: ItineraryType;
  createdAt: string;
  ownerName?: string;
}

export default function SharedTripPage() {
  const params = useParams();
  const shareId = params.shareId as string;
  const [trip, setTrip] = useState<SharedTrip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [structuredData, setStructuredData] = useState<string>('');

  useEffect(() => {
    const fetchSharedTrip = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/trips/share?shareId=${shareId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch shared trip');
        }

        if (data.success) {
          setTrip(data.trip);
          
          // Create structured data for SEO
          if (data.trip) {
            try {
              const trip = data.trip;
              const jsonLd = {
                "@context": "https://schema.org",
                "@type": "TravelAction",
                "agent": {
                  "@type": "Person",
                  "name": trip.ownerName || "Traveler"
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
                  "urlTemplate": `https://aitravelplanner.richadali.dev/trips/share/${shareId}`,
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
                  "itinerary": trip.itinerary && trip.itinerary.days ? 
                    trip.itinerary.days.map((day: any, index: number) => ({
                      "@type": "TouristAttraction",
                      "name": `Day ${index + 1} in ${trip.destination}`,
                      "description": day.activities && Array.isArray(day.activities) ? 
                        day.activities.map((activity: any) => activity.name || "Activity").join(", ") : 
                        `Activities for day ${index + 1}`
                    })) : []
                }
              };
              
              setStructuredData(JSON.stringify(jsonLd));
            } catch (error) {
              console.error("Error generating structured data:", error);
              // Don't set error state here, as we still want to show the trip
            }
          }
        } else {
          throw new Error(data.error || 'Failed to fetch shared trip');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (shareId) {
      fetchSharedTrip();
    }
  }, [shareId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
            <Link href="/">
              <Button variant="outline">Create Your Own Trip</Button>
            </Link>
          </div>
        ) : trip ? (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{trip.destination}</h1>
                <p className="text-muted-foreground">
                  {trip.duration} days • {trip.peopleCount} people
                  {trip.createdAt && ` • Created on ${formatDate(trip.createdAt)}`}
                </p>
                
                {trip.ownerName && (
                  <div className="mt-2 inline-flex items-center bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                    <User className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                    Shared by {trip.ownerName}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Link href="/">
                  <Button variant="outline">Create Your Own Trip</Button>
                </Link>
              </div>
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
                tripId={trip.id}
                isSharedView={true}
              />
            </Suspense>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-200">Trip not found or share link has expired.</p>
            </div>
            <Link href="/">
              <Button variant="outline">Create Your Own Trip</Button>
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
} 