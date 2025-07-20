"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { LoadingSpinner } from "@/components/loading-spinner";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function TempSharedTripPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const encodedData = searchParams.get("data");
        
        if (!encodedData) {
          // If no data provided, redirect to home
          router.push("/");
          return;
        }
        
        try {
          // Decode the base64 data and save to localStorage for after login
          const jsonString = atob(decodeURIComponent(encodedData));
          const data = JSON.parse(jsonString);
          
          if (!data.itinerary || !data.destination) {
            throw new Error("Invalid trip data");
          }
          
          // Save to localStorage for retrieval after login
          localStorage.setItem('savedItinerary', jsonString);
          localStorage.setItem('savedTripMetadata', JSON.stringify({
            destination: data.destination,
            duration: data.duration,
            peopleCount: data.peopleCount,
            budget: data.budget,
            currency: data.currency || "INR"
          }));
          localStorage.setItem('pendingAction', 'share');
          
          // Redirect to login
          signIn(undefined, { callbackUrl: "/dashboard" });
        } catch (error) {
          console.error("Error processing share data:", error);
          router.push("/?error=invalid-share-data");
        }
      } catch (error) {
        console.error("Error in redirect:", error);
        router.push("/");
      }
    };
    
    handleRedirect();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
      <p className="ml-4 text-lg">Redirecting to login...</p>
    </div>
  );
} 