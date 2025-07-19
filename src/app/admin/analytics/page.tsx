"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2Icon, RefreshCwIcon, Users, MapPin, TrendingUp, Activity, Share2, Download, RotateCcw } from "lucide-react";

interface AnalyticsData {
  totalVisits: number;
  uniqueVisitors: number;
  totalItineraries: number;
  successfulItineraries: number;
  failedItineraries: number;
  totalShares: number;
  totalDownloads: number;
  averageResponseTime: number;
  topDestinations: { destination: string; count: number }[];
  dailyData: {
    date: string;
    visits: number;
    itineraries: number;
    shares: number;
    downloads: number;
  }[];
  registeredUsers?: number; // Added for registered users
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range
      const endDate = new Date();
      let startDate: Date;
      
      switch (dateRange) {
        case '7d':
          startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
        default:
          startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const response = await fetch(
        `/api/admin/analytics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'An error occurred while fetching analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const handleResetAnalytics = async () => {
    if (!confirm("Are you sure you want to reset all analytics data? This action cannot be undone.")) {
      return;
    }
    
    try {
      setIsResetting(true);
      setResetSuccess(null);
      
      const response = await fetch('/api/admin/analytics/reset', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to reset analytics data');
      }
      
      const data = await response.json();
      setResetSuccess(data.message);
      
      // Refetch analytics data
      fetchAnalytics();
    } catch (err: any) {
      console.error('Error resetting analytics:', err);
      setError(err.message || 'Failed to reset analytics data');
    } finally {
      setIsResetting(false);
      
      // Clear success message after 3 seconds
      if (resetSuccess) {
        setTimeout(() => {
          setResetSuccess(null);
        }, 3000);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <Button onClick={fetchAnalytics} className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">No analytics data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
              <h1 className="text-4xl font-bold mb-1 text-slate-900 dark:text-white">Analytics Dashboard</h1>
              <p className="text-slate-500 dark:text-slate-400">
                Track site visits and itinerary generations
              </p>
            </div>
            {/* <div className="flex space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchAnalytics}
                disabled={loading}
                className="bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm px-4 h-9"
              >
                <RefreshCwIcon className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                Refresh
              </Button>
              {process.env.NODE_ENV === 'development' && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleResetAnalytics}
                  disabled={isResetting}
                  className="hover:bg-red-700 transition-colors shadow-sm px-4 h-9"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Analytics
                </Button>
              )}
            </div> */}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              {resetSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2 text-sm text-green-800 dark:text-green-200 shadow-sm animate-pulse">
                  {resetSuccess}
                </div>
              )}
            </div>
            <Tabs 
              defaultValue="30d" 
              value={dateRange} 
              onValueChange={(v) => setDateRange(v as any)}
              className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-1 border border-slate-200 dark:border-slate-800"
            >
              <TabsList className="grid grid-cols-3 h-9">
                <TabsTrigger value="7d" className="text-xs">Last 7 days</TabsTrigger>
                <TabsTrigger value="30d" className="text-xs">Last 30 days</TabsTrigger>
                <TabsTrigger value="90d" className="text-xs">Last 90 days</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="w-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Loading...
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 shadow-md hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 p-4">
                    <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Total Visits
                    </CardTitle>
                    <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2 text-blue-600 dark:text-blue-400">
                      <Activity className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-3xl font-bold text-slate-800 dark:text-slate-200">{data.totalVisits.toLocaleString()}</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total page views across all pages</p>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-green-500/10 to-green-600/5 shadow-md hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 p-4">
                    <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
                      Itineraries Generated
                    </CardTitle>
                    <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2 text-green-600 dark:text-green-400">
                      <MapPin className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-3xl font-bold text-slate-800 dark:text-slate-200">{data.totalItineraries.toLocaleString()}</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Successfully generated travel plans</p>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 shadow-md hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 p-4">
                    <CardTitle className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      Registered Users
                    </CardTitle>
                    <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-2 text-indigo-600 dark:text-indigo-400">
                      <Users className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-3xl font-bold text-slate-800 dark:text-slate-200">{data.registeredUsers?.toLocaleString() || "0"}</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Users with Google accounts</p>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-amber-500/10 to-amber-600/5 shadow-md hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 p-4">
                    <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">
                      Shares & Downloads
                    </CardTitle>
                    <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-2 text-amber-600 dark:text-amber-400">
                      <Share2 className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-3xl font-bold text-slate-800 dark:text-slate-200">{(data.totalShares + data.totalDownloads).toLocaleString()}</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="inline-flex items-center mr-2">
                        <Share2 className="h-3 w-3 mr-1 text-purple-500" /> {data.totalShares.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center">
                        <Download className="h-3 w-3 mr-1 text-amber-500" /> {data.totalDownloads.toLocaleString()}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visits Chart */}
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-md">
                  <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">Site Visits</CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400">Total visits vs itineraries generated</CardDescription>
                      </div>
                      <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2 text-blue-600 dark:text-blue-400">
                        <Activity className="h-4 w-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={data.dailyData}
                        margin={{
                            top: 20,
                          right: 30,
                          left: 20,
                            bottom: 20,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" opacity={0.3} />
                          <XAxis 
                            dataKey="date" 
                            stroke="#888" 
                            fontSize={12}
                            tickMargin={10}
                            axisLine={{ stroke: '#888', strokeWidth: 1 }}
                            tickLine={{ stroke: '#888', strokeWidth: 1 }}
                          />
                          <YAxis 
                            stroke="#888" 
                            fontSize={12}
                            tickMargin={10}
                            axisLine={{ stroke: '#888', strokeWidth: 1 }}
                            tickLine={{ stroke: '#888', strokeWidth: 1 }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                            }} 
                          />
                          <Legend 
                            verticalAlign="top" 
                            height={36} 
                            iconType="circle"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="visits" 
                            name="Visits"
                            stroke="#6366f1" 
                            strokeWidth={2}
                            dot={{ r: 3, strokeWidth: 1 }}
                            activeDot={{ r: 6, strokeWidth: 1 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="itineraries" 
                            name="Itineraries"
                            stroke="#10b981" 
                            strokeWidth={2}
                            dot={{ r: 3, strokeWidth: 1 }}
                            activeDot={{ r: 6, strokeWidth: 1 }}
                          />
                      </LineChart>
                    </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Destinations */}
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-md">
                  <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">Top Destinations</CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400">Most popular travel destinations</CardDescription>
                      </div>
                      <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2 text-green-600 dark:text-green-400">
                        <MapPin className="h-4 w-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between h-80">
                      <div className="w-full lg:w-1/2 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                              data={data.topDestinations.slice(0, 5)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="destination"
                              label={({ destination, percent }) => `${(percent * 100).toFixed(0)}%`}
                            >
                              {data.topDestinations.slice(0, 5).map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={COLORS[index % COLORS.length]} 
                                  stroke="rgba(255,255,255,0.3)"
                                  strokeWidth={1}
                                />
                          ))}
                        </Pie>
                            <Tooltip 
                              formatter={(value, name, props) => [`${value} trips`, props.payload.destination]}
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                              }}
                            />
                      </PieChart>
                    </ResponsiveContainer>
                      </div>
                      <div className="w-full lg:w-1/2 h-full overflow-y-auto pl-0 lg:pl-4 mt-4 lg:mt-0">
                        <h4 className="font-medium text-sm mb-3 text-slate-600 dark:text-slate-300">Top 15 Destinations</h4>
                        <div className="space-y-2">
                          {data.topDestinations.slice(0, 15).map((destination, index) => (
                            <div 
                              key={index} 
                              className="flex items-center justify-between p-2 rounded-md bg-white dark:bg-slate-800 shadow-sm"
                            >
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2" 
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                ></div>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                  {destination.destination}
                                </span>
                              </div>
                              <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full text-slate-700 dark:text-slate-300">
                                {destination.count} trips
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-1 border border-slate-200 dark:border-slate-800">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="destinations">Destinations</TabsTrigger>
                  <TabsTrigger value="engagement">Engagement</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-md">
                      <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">Daily Activity</CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400">
                          Visits and itinerary generations over time
                        </CardDescription>
                          </div>
                          <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2 text-blue-600 dark:text-blue-400">
                            <TrendingUp className="h-4 w-4" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={data.dailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" opacity={0.3} />
                            <XAxis 
                              dataKey="date" 
                              stroke="#888" 
                              fontSize={12}
                              tickMargin={10}
                            />
                            <YAxis 
                              stroke="#888" 
                              fontSize={12}
                              tickMargin={10}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                              }} 
                            />
                            <Legend 
                              verticalAlign="top" 
                              height={36} 
                              iconType="circle"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="visits" 
                              name="Visits" 
                              stroke="#6366f1" 
                              strokeWidth={2}
                              dot={{ r: 3, strokeWidth: 1 }}
                              activeDot={{ r: 6, strokeWidth: 1 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="itineraries" 
                              name="Itineraries" 
                              stroke="#10b981" 
                              strokeWidth={2}
                              dot={{ r: 3, strokeWidth: 1 }}
                              activeDot={{ r: 6, strokeWidth: 1 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-md">
                      <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">Success Rate</CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400">
                          Successful vs failed itinerary generations
                        </CardDescription>
                          </div>
                          <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2 text-green-600 dark:text-green-400">
                            <Activity className="h-4 w-4" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Successful', value: data.successfulItineraries },
                                { name: 'Failed', value: data.failedItineraries }
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                                stroke="rgba(255,255,255,0.3)"
                                strokeWidth={1}
                              >
                                <Cell fill="#10b981" />
                                <Cell fill="#ef4444" />
                            </Pie>
                              <Tooltip 
                                formatter={(value) => [`${value} itineraries`]}
                                contentStyle={{ 
                                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                  border: '1px solid #ccc',
                                  borderRadius: '4px',
                                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                }}
                              />
                          </PieChart>
                        </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-md">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 pt-6">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">Performance Metrics</CardTitle>
                        <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-2 text-indigo-600 dark:text-indigo-400">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Response Time</h3>
                            <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-1.5 text-blue-600 dark:text-blue-400">
                              <Activity className="h-3.5 w-3.5" />
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {data.averageResponseTime ? `${data.averageResponseTime.toFixed(0)}ms` : 'N/A'}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Average API response time</p>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Success Rate</h3>
                            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-1.5 text-green-600 dark:text-green-400">
                              <Activity className="h-3.5 w-3.5" />
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {data.totalItineraries > 0 ? `${((data.successfulItineraries / data.totalItineraries) * 100).toFixed(1)}%` : '0%'}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Itinerary generation success rate</p>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Conversion Rate</h3>
                            <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-1.5 text-purple-600 dark:text-purple-400">
                              <Activity className="h-3.5 w-3.5" />
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {data.totalVisits > 0 ? `${((data.totalItineraries / data.totalVisits) * 100).toFixed(1)}%` : '0%'}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Visits that generate itineraries</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="destinations" className="space-y-4">
                  <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-md">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">Top Destinations</CardTitle>
                          <CardDescription className="text-slate-500 dark:text-slate-400">
                        Most requested travel destinations
                      </CardDescription>
                        </div>
                        <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2 text-green-600 dark:text-green-400">
                          <MapPin className="h-4 w-4" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart 
                          data={data.topDestinations}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 60,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" opacity={0.3} />
                          <XAxis 
                            dataKey="destination" 
                            stroke="#888" 
                            fontSize={12}
                            tickMargin={10}
                            angle={-45}
                            textAnchor="end"
                          />
                          <YAxis 
                            stroke="#888" 
                            fontSize={12}
                            tickMargin={10}
                          />
                          <Tooltip 
                            formatter={(value) => [`${value} trips`]}
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Bar 
                            dataKey="count" 
                            name="Trips"
                            radius={[4, 4, 0, 0]}
                          >
                            {data.topDestinations.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="engagement" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-md">
                      <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">Daily Shares & Downloads</CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400">
                          User engagement with generated itineraries
                        </CardDescription>
                          </div>
                          <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-2 text-amber-600 dark:text-amber-400">
                            <Share2 className="h-4 w-4" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart 
                            data={data.dailyData}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 20,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" opacity={0.3} />
                            <XAxis 
                              dataKey="date" 
                              stroke="#888" 
                              fontSize={12}
                              tickMargin={10}
                            />
                            <YAxis 
                              stroke="#888" 
                              fontSize={12}
                              tickMargin={10}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                              }}
                            />
                            <Legend 
                              verticalAlign="top" 
                              height={36} 
                              iconType="circle"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="shares" 
                              name="Shares" 
                              stroke="#9333ea" 
                              strokeWidth={2}
                              dot={{ r: 3, strokeWidth: 1 }}
                              activeDot={{ r: 6, strokeWidth: 1 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="downloads" 
                              name="Downloads" 
                              stroke="#f59e0b" 
                              strokeWidth={2}
                              dot={{ r: 3, strokeWidth: 1 }}
                              activeDot={{ r: 6, strokeWidth: 1 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-md">
                      <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">Engagement Metrics</CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400">
                              Shares and downloads per itinerary
                        </CardDescription>
                          </div>
                          <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2 text-purple-600 dark:text-purple-400">
                            <TrendingUp className="h-4 w-4" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 gap-6">
                          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Share Rate</h3>
                              <div className="text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full text-xs font-medium">
                              {data.totalItineraries > 0 ? `${((data.totalShares / data.totalItineraries) * 100).toFixed(1)}%` : '0%'}
                              </div>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                              <div 
                                className="bg-purple-600 h-2.5 rounded-full" 
                                style={{ 
                                  width: data.totalItineraries > 0 
                                    ? `${Math.min(100, (data.totalShares / data.totalItineraries) * 100)}%` 
                                    : '0%' 
                                }}
                              ></div>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                              {data.totalShares} shares from {data.totalItineraries} itineraries
                            </p>
                          </div>
                          
                          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Download Rate</h3>
                              <div className="text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full text-xs font-medium">
                              {data.totalItineraries > 0 ? `${((data.totalDownloads / data.totalItineraries) * 100).toFixed(1)}%` : '0%'}
                              </div>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                              <div 
                                className="bg-amber-600 h-2.5 rounded-full" 
                                style={{ 
                                  width: data.totalItineraries > 0 
                                    ? `${Math.min(100, (data.totalDownloads / data.totalItineraries) * 100)}%` 
                                    : '0%' 
                                }}
                              ></div>
                          </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                              {data.totalDownloads} downloads from {data.totalItineraries} itineraries
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
} 