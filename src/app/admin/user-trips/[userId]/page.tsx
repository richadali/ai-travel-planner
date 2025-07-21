"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, User, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface Trip {
  id: string;
  destination: string;
  duration: number;
  peopleCount: number;
  budget: number;
  currency: string;
  createdAt: string;
  successful: boolean;
  responseTime: number | null;
}

interface Stats {
  totalGenerations: number;
  successfulGenerations: number;
  successRate: number;
}

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export default function UserTripsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function fetchUserTrips() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/admin/user-trips/${userId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch user trips");
        }
        
        const data = await response.json();
        setTrips(data.trips);
        setUser(data.user);
        setStats(data.stats);
      } catch (err: any) {
        console.error("Error fetching user trips:", err);
        setError(err.message || "Failed to fetch user trips");
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserTrips();
  }, [userId]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col space-y-8">
          {/* Header with back button */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => router.back()}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold mb-1 text-slate-900 dark:text-white">Generated Itineraries</h1>
                {user && (
                  <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {user.name || user.email || "User"} 
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* User Trip Table */}
          <Card className="border-0 overflow-hidden bg-white dark:bg-slate-900 shadow-md">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 p-5">
              <div className="flex items-center justify-between">
                                 <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Generated Itineraries
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  {loading ? "Loading..." : (
                    stats ? `${stats.successfulGenerations} successful of ${stats.totalGenerations} total (${stats.successRate.toFixed(1)}%)` : `${trips.length} found`
                  )}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>People</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Time (ms)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      // Loading skeletons
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-[60px]" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-[40px]" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-[60px]" /></TableCell>
                        </TableRow>
                      ))
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-red-500">
                          Error: {error}
                        </TableCell>
                      </TableRow>
                    ) : trips.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10">
                          <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                            <MapPin className="h-12 w-12 mb-2" />
                            <h3 className="font-medium text-lg mb-1">No itineraries found</h3>
                            <p className="text-sm">This user hasn't generated any itineraries yet</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      // Actual trip data
                      trips.map((trip, index) => (
                        <TableRow key={trip.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">
                            {trip.destination}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {trip.duration} {trip.duration === 1 ? "day" : "days"}
                            </Badge>
                          </TableCell>
                          <TableCell>{trip.peopleCount}</TableCell>
                          <TableCell>
                            {trip.currency} {trip.budget.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                            {format(new Date(trip.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            {trip.responseTime !== null ? (
                              <Badge variant={trip.responseTime > 5000 ? "secondary" : "success"}>
                                {trip.responseTime}
                              </Badge>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-600">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
} 