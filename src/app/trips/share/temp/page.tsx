"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ItineraryDisplay } from "@/components/itinerary-display";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ItineraryType } from "@/types";

export default function TempSharedTripPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tripData, setTripData] = useState<{
    destination: string;
    duration: number;
    peopleCount: number;
    budget: number;
    currency?: string;
    itinerary: ItineraryType;
  } | null>(null);

  useEffect(() => {
    const loadTripData = async () => {
      try {
        setLoading(true);
        const encodedData = searchParams.get("data");
        
        if (!encodedData) {
          throw new Error("No trip data found");
        }
        
        // Decode the base64 data
        const jsonString = atob(decodeURIComponent(encodedData));
        const data = JSON.parse(jsonString);
        
        if (!data.itinerary || !data.destination) {
          throw new Error("Invalid trip data");
        }
        
        setTripData(data);
      } catch (error) {
        console.error("Error loading shared trip:", error);
        setError("Could not load the shared trip. The link may be invalid or expired.");
      } finally {
        setLoading(false);
      }
    };
    
    loadTripData();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <LoadingSpinner />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !tripData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-16 max-w-7xl">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-red-800 dark:text-red-300 mb-4">
              Error Loading Shared Trip
            </h2>
            <p className="text-red-700 dark:text-red-200 mb-6">
              {error || "Could not load the shared trip. The link may be invalid or expired."}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Shared Travel Itinerary</h1>
          <p className="text-muted-foreground mt-2">
            Someone has shared this travel plan with you
          </p>
        </div>
        
        <ItineraryDisplay 
          itinerary={tripData.itinerary}
          tripMetadata={{
            destination: tripData.destination,
            duration: tripData.duration,
            peopleCount: tripData.peopleCount,
            budget: tripData.budget,
            currency: tripData.currency || "INR"
          }}
          isSharedView={true}
        />
      </main>
      <Footer />
    </div>
  );
} 