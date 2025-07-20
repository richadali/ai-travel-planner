import { prisma } from './prisma';
import { NextRequest } from 'next/server';

/**
 * Analytics service for tracking user interactions
 */
export class AnalyticsService {
  /**
   * Track an itinerary generation
   */
  static async trackItineraryGeneration({
    userId,
    destination,
    duration,
    peopleCount,
    budget,
    currency = 'INR',
    successful = true,
    errorMessage = null,
    responseTime = null,
    request = null,
  }: {
    userId?: string;
    destination: string;
    duration: number;
    peopleCount: number;
    budget: number;
    currency?: string;
    successful?: boolean;
    errorMessage?: string | null;
    responseTime?: number | null;
    request?: NextRequest | Request | null;
  }) {
    try {
      // Extract IP and user agent if request is provided
      let ipAddress = null;
      let userAgent = null;

      if (request) {
        // Handle different request types
        if ('headers' in request) {
          const headers = request.headers;
          ipAddress = headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                      headers.get('x-real-ip') || 
                      'unknown';
          userAgent = headers.get('user-agent') || 'unknown';
        }
      }

      console.log('Tracking itinerary generation:', {
        destination,
        duration,
        peopleCount,
        budget,
        successful
      });

      // Create the analytics record
      await prisma.itineraryGeneration.create({
        data: {
          userId,
          destination,
          duration,
          peopleCount,
          budget,
          currency,
          successful,
          errorMessage,
          responseTime,
          ipAddress,
          userAgent,
        },
      });

      console.log('Successfully tracked itinerary generation');

      // Update daily summary asynchronously
      this.updateDailySummary().catch(summaryError => {
        console.error('Failed to update daily summary:', summaryError);
      });

      return true;
    } catch (error) {
      console.error('Failed to track itinerary generation:', error);
      
      // Enhanced error logging for production debugging
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
          data: {
            destination,
            duration,
            peopleCount,
            budget,
            currency,
            successful,
          }
        });
      }
      
      // Don't throw - analytics should never break the main application flow
      return false;
    }
  }

  /**
   * Track a page view
   */
  static async trackPageView({
    userId,
    path,
    referrer = null,
    request = null,
    duration = null,
    ipAddress = null,
    userAgent = null,
  }: {
    userId?: string;
    path: string;
    referrer?: string | null;
    request?: NextRequest | Request | null;
    duration?: number | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    try {
      // Extract IP and user agent if request is provided and not explicitly provided
      if (request && (!ipAddress || !userAgent)) {
        // Handle different request types
        if ('headers' in request) {
          const headers = request.headers;
          ipAddress = ipAddress || headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                      headers.get('x-real-ip') || 
                      'unknown';
          userAgent = userAgent || headers.get('user-agent') || 'unknown';
        }
      }

      // Create the page view record
      await prisma.pageView.create({
        data: {
          userId,
          path,
          referrer,
          ipAddress,
          userAgent,
          duration,
        },
      });

      // Update daily summary asynchronously
      this.updateDailySummary().catch(console.error);

      return true;
    } catch (error) {
      console.error('Failed to track page view:', error);
      // Don't throw - analytics should never break the main application flow
      return false;
    }
  }

  /**
   * Track a trip share
   */
  static async trackTripShare({
    tripId,
    shareId,
    userId,
    request = null,
    ipAddress = null,
    userAgent = null,
  }: {
    tripId: string;
    shareId: string;
    userId?: string;
    request?: NextRequest | Request | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    try {
      // Extract IP and user agent if request is provided and not explicitly provided
      if (request && (!ipAddress || !userAgent)) {
        if ('headers' in request) {
          const headers = request.headers;
          ipAddress = ipAddress || headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                      headers.get('x-real-ip') || 
                      'unknown';
          userAgent = userAgent || headers.get('user-agent') || 'unknown';
        }
      }

      // Create the trip share record
      await prisma.tripShare.create({
        data: {
          tripId,
          shareId,
          userId,
          ipAddress,
          userAgent,
        },
      });

      // Update daily summary asynchronously
      this.updateDailySummary().catch(console.error);

      return true;
    } catch (error) {
      console.error('Failed to track trip share:', error);
      return false;
    }
  }

  /**
   * Track a trip download
   */
  static async trackTripDownload({
    tripId,
    downloadType = 'pdf',
    userId,
    request = null,
    ipAddress = null,
    userAgent = null,
  }: {
    tripId: string;
    downloadType?: string;
    userId?: string;
    request?: NextRequest | Request | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    try {
      // Extract IP and user agent if request is provided and not explicitly provided
      if (request && (!ipAddress || !userAgent)) {
        if ('headers' in request) {
          const headers = request.headers;
          ipAddress = ipAddress || headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                      headers.get('x-real-ip') || 
                      'unknown';
          userAgent = userAgent || headers.get('user-agent') || 'unknown';
        }
      }

      // Create the trip download record
      await prisma.tripDownload.create({
        data: {
          tripId,
          downloadType,
          userId,
          ipAddress,
          userAgent,
        },
      });

      // Update daily summary asynchronously
      this.updateDailySummary().catch(console.error);

      return true;
    } catch (error) {
      console.error('Failed to track trip download:', error);
      return false;
    }
  }

  /**
   * Update daily analytics summary
   */
  private static async updateDailySummary() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get today's data
      const todayVisits = await prisma.pageView.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      });

      const uniqueVisitors = await prisma.pageView.groupBy({
        by: ['ipAddress'],
        where: {
          createdAt: {
            gte: today,
          },
          ipAddress: {
            not: null,
          },
        },
        _count: true,
      });

      const itineraryStats = await prisma.itineraryGeneration.groupBy({
        by: ['successful'],
        where: {
          createdAt: {
            gte: today,
          },
        },
        _count: true,
      });

      const totalItineraries = await prisma.itineraryGeneration.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      });

      const successfulItineraries = itineraryStats.find(stat => stat.successful)?._count || 0;
      const failedItineraries = itineraryStats.find(stat => !stat.successful)?._count || 0;

      // Get today's shares and downloads
      const totalShares = await prisma.tripShare.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      });

      const totalDownloads = await prisma.tripDownload.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      });

      // Calculate average response time
      const responseTimeData = await prisma.itineraryGeneration.aggregate({
        where: {
          createdAt: {
            gte: today,
          },
          responseTime: {
            not: null,
          },
        },
        _avg: {
          responseTime: true,
        },
      });

      // Get top destinations
      const destinations = await prisma.itineraryGeneration.groupBy({
        by: ['destination'],
        where: {
          createdAt: {
            gte: today,
          },
        },
        _count: true,
        orderBy: {
          _count: {
            destination: 'desc',
          },
        },
        take: 10,
      });

      const topDestinations = destinations.map(d => ({
        destination: d.destination,
        count: d._count,
      }));

      // Upsert the daily summary
      await prisma.analyticsSummary.upsert({
        where: {
          date: today,
        },
        create: {
          date: today,
          totalVisits: todayVisits,
          uniqueVisitors: uniqueVisitors.length,
          totalItineraries,
          successfulItineraries,
          failedItineraries,
          totalShares,
          totalDownloads,
          averageResponseTime: responseTimeData._avg.responseTime || 0,
          topDestinations: topDestinations as any,
        },
        update: {
          totalVisits: todayVisits,
          uniqueVisitors: uniqueVisitors.length,
          totalItineraries,
          successfulItineraries,
          failedItineraries,
          totalShares,
          totalDownloads,
          averageResponseTime: responseTimeData._avg.responseTime || 0,
          topDestinations: topDestinations as any,
        },
      });

      return true;
    } catch (error) {
      console.error('Failed to update analytics summary:', error);
      return false;
    }
  }

  /**
   * Get analytics summary for a specific date range
   */
  static async getAnalyticsSummary(
    startDate: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default to last 30 days
    endDate: Date = new Date()
  ) {
    try {
      const summaries = await prisma.analyticsSummary.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          date: 'asc',
        },
      });

      return summaries;
    } catch (error) {
      console.error('Failed to get analytics summary:', error);
      throw new Error('Failed to retrieve analytics data');
    }
  }

  /**
   * Track a Google Analytics event from the client side
   * This function is meant to be used in client components
   */
  static trackGoogleAnalyticsEvent(
    eventName: string,
    eventParams?: Record<string, any>
  ) {
    // Check if window and gtag are available (client-side only)
    if (typeof window !== 'undefined' && 'gtag' in window) {
      try {
        // Cast window.gtag to any to avoid TypeScript errors
        const gtag = (window as any).gtag;
        
        // Send the event to Google Analytics
        gtag('event', eventName, eventParams);
        return true;
      } catch (error) {
        console.error('Failed to track Google Analytics event:', error);
        return false;
      }
    }
    return false;
  }

  /**
   * Track a page view with Google Analytics
   * This should be called on route changes
   */
  static trackGoogleAnalyticsPageView(url: string) {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      try {
        const gtag = (window as any).gtag;
        gtag('config', 'G-H1NFKBMBC0', {
          page_path: url,
        });
        return true;
      } catch (error) {
        console.error('Failed to track Google Analytics page view:', error);
        return false;
      }
    }
    return false;
  }
} 