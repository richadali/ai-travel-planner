"use client";

import React, { useState } from "react";
import { TravelPlannerForm } from "@/components/travel-planner-form";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { JsonLd } from "@/components/json-ld";
import { TripFormValues } from "@/lib/validations";
import { ItineraryType } from "@/types";
import { ItineraryDisplay } from "@/components/itinerary-display";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ErrorModal } from "@/components/ui/error-modal";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryType | null>(null);
  const [tripMetadata, setTripMetadata] = useState<{
    destination: string;
    duration: number;
    peopleCount: number;
    budget: number;
    currency?: string;
  } | undefined>(undefined);

  const handleSubmit = async (data: TripFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      setItinerary(null);

      const response = await fetch("/api/travel-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate travel plan");
      }

      setItinerary(result.itinerary);
      
      setTripMetadata({
        destination: data.destination,
        duration: data.duration,
        peopleCount: data.peopleCount,
        budget: data.budget,
        currency: data.currency || 'INR'
      });
      
      // Scroll to the itinerary after it's loaded
      setTimeout(() => {
        const itinerarySection = document.getElementById('itinerary-section');
        if (itinerarySection) {
          itinerarySection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err: any) {
      console.error("Error generating travel plan:", err);
      setError(err.message || "An error occurred while generating your travel plan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-4xl font-bold text-center">
          AI Travel Planner
        </h1>
        <p className="text-center max-w-2xl text-lg">
          Create your perfect travel itinerary with AI. Just enter your destination, duration, number of people, and budget to get started.
        </p>
        <TravelPlannerForm 
          onSubmit={handleSubmit} 
          isLoading={isLoading}
        />
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      )}

      {/* Error Modal */}
      <ErrorModal message={error} onDismiss={() => setError(null)} />

      {itinerary && !isLoading && (
        <section 
          id="itinerary-section"
          className="py-12 container mx-auto px-4 md:px-6 max-w-7xl"
        >
          <ItineraryDisplay 
            itinerary={itinerary} 
            tripMetadata={tripMetadata}
          />
        </section>
      )}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "AI Travel Planner",
          "description": "Plan your dream vacation with our AI-powered travel planner. Get personalized itineraries based on your destination, budget, and preferences.",
          "url": "https://aitravelplanner.richadali.dev",
          "applicationCategory": "TravelApplication",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "screenshot": "https://aitravelplanner.richadali.dev/og.png",
          "featureList": "AI-generated travel itineraries, Budget planning, Activity suggestions, Accommodation recommendations"
        }}
      />

      <Footer />
    </main>
  );
}
