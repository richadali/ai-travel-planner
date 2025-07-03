"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TripHistory } from "@/components/trip-history";
import { LoadingSpinner } from "@/components/loading-spinner";

// Mock user ID for demonstration purposes
const MOCK_USER_ID = "user-123";

interface Trip {
  id: string;
  destination: string;
  duration: number;
  peopleCount: number;
  budget: number;
  currency: string;
  createdAt: string;
}

export default function Dashboard() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // In a real app, you would get the user ID from authentication
        const response = await fetch(`/api/trips?userId=${MOCK_USER_ID}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch trips");
        }

        setTrips(result.trips);
      } catch (err: any) {
        console.error("Error fetching trips:", err);
        setError(err.message || "An error occurred while fetching your trips");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="flex flex-col space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Dashboard</h1>
            <p className="text-muted-foreground">
              View and manage your travel plans
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <TripHistory trips={trips} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
} 