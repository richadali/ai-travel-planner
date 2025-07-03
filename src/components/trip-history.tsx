import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Trip {
  id: string;
  destination: string;
  duration: number;
  peopleCount: number;
  budget: number;
  currency: string;
  createdAt: string;
}

interface TripHistoryProps {
  trips: Trip[];
  isLoading?: boolean;
  className?: string;
}

export const TripHistory: React.FC<TripHistoryProps> = ({
  trips,
  isLoading = false,
  className,
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>Your Trip History</CardTitle>
          <CardDescription>Loading your previous trips...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`loading-${index}`}
                className="h-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trips.length) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>Your Trip History</CardTitle>
          <CardDescription>You haven't created any trips yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Create your first trip to see it here.
            </p>
            <Link href="/">
              <Button>Create a Trip</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Your Trip History</CardTitle>
        <CardDescription>View and manage your previous trips</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trips.map((trip) => (
            <Link
              key={trip.id}
              href={`/trips/${trip.id}`}
              className="block"
            >
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{trip.destination}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {trip.duration} days • {trip.peopleCount} people • Created on {formatDate(trip.createdAt)}
                    </p>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(trip.budget, trip.currency)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}; 