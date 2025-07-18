import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get date range from query params
    const url = new URL(request.url);
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');
    
    // Default to last 30 days if no date range provided
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam ? new Date(startDateParam) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Set time to start and end of day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Get overall statistics
    const [
      totalVisits,
      uniqueVisitors,
      totalItineraries,
      successfulItineraries,
      failedItineraries,
      totalShares,
      totalDownloads,
      averageResponseTime,
      topDestinations,
      dailyData,
      registeredUsers
    ] = await Promise.all([
      // Total visits
      prisma.pageView.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      
      // Unique visitors
      prisma.pageView.groupBy({
        by: ['ipAddress'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          ipAddress: {
            not: null,
          },
        },
        _count: true,
      }),
      
      // Total itineraries
      prisma.itineraryGeneration.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      
      // Successful itineraries
      prisma.itineraryGeneration.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          successful: true,
        },
      }),
      
      // Failed itineraries
      prisma.itineraryGeneration.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          successful: false,
        },
      }),
      
      // Total shares
      prisma.tripShare.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      
      // Total downloads
      prisma.tripDownload.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      
      // Average response time
      prisma.itineraryGeneration.aggregate({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          responseTime: {
            not: null,
          },
        },
        _avg: {
          responseTime: true,
        },
      }),
      
      // Top destinations
      prisma.itineraryGeneration.groupBy({
        by: ['destination'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: true,
        orderBy: {
          _count: {
            destination: 'desc',
          },
        },
        take: 10,
      }),
      
      // Daily data for charts
      getDailyData(startDate, endDate),
      
      // Registered users
      prisma.user.count()
    ]);

    return NextResponse.json({
      totalVisits,
      uniqueVisitors: uniqueVisitors.length,
      totalItineraries,
      successfulItineraries,
      failedItineraries,
      totalShares,
      totalDownloads,
      averageResponseTime: averageResponseTime._avg.responseTime || 0,
      topDestinations: topDestinations.map(d => ({
        destination: d.destination,
        count: d._count,
      })),
      dailyData,
      registeredUsers
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

async function getDailyData(startDate: Date, endDate: Date) {
  const dailyData = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    const [visits, itineraries, shares, downloads] = await Promise.all([
      prisma.pageView.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      }),
      
      prisma.itineraryGeneration.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      }),
      
      prisma.tripShare.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      }),
      
      prisma.tripDownload.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      }),
    ]);
    
    dailyData.push({
      date: currentDate.toISOString().split('T')[0],
      visits,
      itineraries,
      shares,
      downloads,
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dailyData;
} 