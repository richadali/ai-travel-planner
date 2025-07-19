"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Wallet, Trash2, AlertTriangle } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { ShareableTrip } from "@/types";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useRouter, useSearchParams } from "next/navigation";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

// Dashboard content component that uses useSearchParams
function DashboardContent() {
  const { data: session, status } = useSession();
  const [trips, setTrips] = useState<ShareableTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle authentication
  useEffect(() => {
    // If not authenticated and not loading, redirect to login
    if (status === "unauthenticated") {
      signIn(undefined, { callbackUrl: window.location.pathname });
    }
  }, [status, session]);

  // Fetch trips when authenticated
  useEffect(() => {
    const fetchTrips = async () => {
      if (status === "authenticated" && session?.user) {
      try {
          setLoading(true);
          const response = await fetch("/api/trips");

        if (!response.ok) {
            if (response.status === 401) {
              return;
            }
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          setTrips(Array.isArray(data) ? data : []);
          setError(null);
        } catch (error) {
          console.error("Error fetching trips:", error);
          setError("Failed to load your trips. Please try again later.");
      } finally {
          setLoading(false);
        }
      }
    };

    if (status === "authenticated") {
    fetchTrips();
    }
  }, [status, session]);

  // Handle delete trip
  const handleDeleteClick = (e: React.MouseEvent, tripId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingTripId(tripId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTripId) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/trips/${deletingTripId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Remove the deleted trip from the state
      setTrips(trips.filter(trip => trip.id !== deletingTripId));
      setShowDeleteConfirm(false);
      setDeletingTripId(null);
    } catch (error) {
      console.error("Error deleting trip:", error);
      setError("Failed to delete trip. Please try again later.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingTripId(null);
  };

  // Show loading state while checking session
  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="flex-grow container mx-auto px-4 py-8 max-w-7xl flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Travel Dashboard</h1>
            <p className="text-muted-foreground">
          View and manage your saved travel itineraries
            </p>
          </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      {!error && trips.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">No saved trips yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first travel plan and save it to see it here
          </p>
          <Button asChild>
            <Link href="/">Create New Trip</Link>
          </Button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Your Saved Trips</h2>
            <Button asChild variant="outline">
              <Link href="/">Create New Trip</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div key={trip.id} className="relative group">
                <Link href={`/trips/${trip.id}`}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-2">{trip.destination}</h3>
                      
                      <div className="flex flex-col space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{trip.duration} days</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          <span>{trip.peopleCount} {trip.peopleCount === 1 ? 'person' : 'people'}</span>
                        </div>
                        <div className="flex items-center">
                          <Wallet className="h-4 w-4 mr-2" />
                          <span>{trip.currency} {trip.budget.toLocaleString()}</span>
                        </div>
        </div>

                      <div className="text-xs text-muted-foreground">
                        Created on {new Date(trip.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <button 
                  onClick={(e) => handleDeleteClick(e, trip.id)}
                  className="absolute top-3 right-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-full hover:bg-red-200 dark:hover:bg-red-800/50"
                  aria-label="Delete trip"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          </div>
        )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] w-screen h-screen">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-6 w-6" />
              <h2 className="text-xl font-semibold">Delete Trip</h2>
            </div>
            
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Are you sure you want to delete this trip? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Trip'
                )}
              </Button>
            </div>
          </div>
        </div>
        )}
    </main>
  );
}

// Main component with Suspense boundary
export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Suspense fallback={
        <div className="flex-grow container mx-auto px-4 py-8 max-w-7xl flex items-center justify-center">
          <LoadingSpinner />
        </div>
      }>
        <DashboardContent />
      </Suspense>
      <Footer />
    </div>
  );
} 