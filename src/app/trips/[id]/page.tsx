"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ItineraryType } from "@/types";
import Script from "next/script";
import { Check, X, Share2, Copy } from "lucide-react";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

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

// Content component that uses useSearchParams
function TripDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tripId = params.id as string;
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [structuredData, setStructuredData] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  // Check for action parameters
  useEffect(() => {
    const action = searchParams.get('action');
    const shareUrlParam = searchParams.get('shareUrl');
    
    if (action === 'saved') {
      setSuccessMessage('Trip saved successfully!');
    } else if (action === 'shared') {
      setSuccessMessage('Trip shared successfully!');
      if (shareUrlParam) {
        setShareUrl(decodeURIComponent(shareUrlParam));
      }
    }
  }, [searchParams]);

  // Auto-hide success message after 10 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Copy share URL to clipboard
  const copyShareUrl = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setSuccessMessage('Share link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

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
          try {
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
    <main className="flex-1 container mx-auto py-8 px-4 md:px-6 max-w-7xl">
      {/* Add structured data for SEO */}
      {structuredData && (
        <Script id="structured-data" type="application/ld+json">
          {structuredData}
        </Script>
      )}
      
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200 flex items-center justify-between">
          <div className="flex items-center">
            <Check className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button 
            onClick={() => setSuccessMessage(null)}
            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {/* Share URL Display */}
      {shareUrl && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center">
              <Share2 className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-blue-800 dark:text-blue-200 font-medium">Share Link:</span>
            </div>
            <div className="flex items-center flex-1 min-w-0">
              <input 
                type="text" 
                value={shareUrl} 
                readOnly 
                className="bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded px-3 py-1 text-sm flex-1 min-w-0 truncate" 
              />
              <button 
                onClick={copyShareUrl}
                className="ml-2 p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-800/50 dark:hover:bg-blue-700/50 text-blue-700 dark:text-blue-300 rounded"
                aria-label="Copy share URL"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
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
              tripId={tripId}
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
  );
}

// Main component with Suspense boundary
export default function TripDetail() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Suspense fallback={
        <main className="flex-1 container mx-auto py-8 px-4 md:px-6 max-w-7xl">
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </main>
      }>
        <TripDetailContent />
      </Suspense>
      <Footer />
    </div>
  );
} 