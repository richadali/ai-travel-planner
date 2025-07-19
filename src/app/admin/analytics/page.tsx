"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';

interface AnalyticsSummary {
  totalPageViews: number;
  totalItineraryGenerations: number;
  totalTrips: number;
  totalUsers: number;
  topDestinations: Array<{
    destination: string;
    count: number;
  }>;
  dailyPageViews: Array<{
    date: string;
    count: number;
  }>;
  dailyGenerations: Array<{
    date: string;
    count: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const fetchAnalytics = async () => {
    try {
        setIsLoading(true);
      setError(null);

        const response = await fetch('/api/admin/analytics', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch analytics data');
        }
        
        setAnalyticsData(data.analytics);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
        setError(err.message || 'Failed to fetch analytics data');
    } finally {
        setIsLoading(false);
    }
  };

    fetchAnalytics();
  }, []);

    return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">View usage statistics and trends</p>
      </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button 
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Refresh Data
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
      ) : analyticsData ? (
        <div className="space-y-8">
          {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                  <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
                  </CardHeader>
                  <CardContent>
                <div className="text-3xl font-bold">{analyticsData.totalPageViews.toLocaleString()}</div>
                  </CardContent>
                </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Itineraries Generated</CardTitle>
                  </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analyticsData.totalItineraryGenerations.toLocaleString()}</div>
                  </CardContent>
                </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Saved Trips</CardTitle>
                  </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analyticsData.totalTrips.toLocaleString()}</div>
                  </CardContent>
                </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analyticsData.totalUsers.toLocaleString()}</div>
                  </CardContent>
                </Card>
              </div>

          {/* Daily Page Views Chart */}
          <Card className="p-4">
            <CardHeader>
              <CardTitle>Daily Page Views</CardTitle>
              <CardDescription>Number of page views over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData.dailyPageViews}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Page Views" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
                      </div>
            </CardContent>
          </Card>
          
          {/* Daily Generations Chart */}
          <Card className="p-4">
            <CardHeader>
              <CardTitle>Daily Itinerary Generations</CardTitle>
              <CardDescription>Number of itineraries generated over the last 30 days</CardDescription>
                  </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData.dailyGenerations}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Itineraries Generated" fill="#0ea5e9" />
                  </BarChart>
                    </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

          {/* Top Destinations Chart */}
          <Card className="p-4">
            <CardHeader>
              <CardTitle>Top Destinations</CardTitle>
              <CardDescription>Most popular destinations for itinerary generation</CardDescription>
                  </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                      data={analyticsData.topDestinations}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="destination"
                    >
                      {analyticsData.topDestinations.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                    <Tooltip />
                    <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl mb-4">No analytics data available</p>
        </div>
      )}
    </div>
  );
} 