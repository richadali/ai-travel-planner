import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Calendar, Users, IndianRupee } from "lucide-react";

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
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                  <div>
                    <h3 className="font-medium text-lg mb-1">{trip.destination}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {trip.duration} days
                      </span>
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {trip.peopleCount} people
                      </span>
                      <span>
                        Created on {formatDate(trip.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="font-medium flex items-center bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-3 py-1.5 rounded-md self-start md:self-auto">
                    <IndianRupee className="w-4 h-4 mr-1" />
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