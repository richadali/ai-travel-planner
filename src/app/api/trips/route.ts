import { NextRequest, NextResponse } from "next/server";
import { getUserTrips } from "@/lib/database";

// Add cache configuration
export const revalidate = 60; // Revalidate every 60 seconds

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: "User ID is required" 
      }, { 
        status: 400 
      });
    }
    
    // Get trips for the user
    const trips = await getUserTrips(userId, limit, offset);
    
    // Return response with cache headers
    return NextResponse.json({ 
      success: true, 
      trips 
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (error: any) {
    console.error("Error fetching trips:", error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to fetch trips" 
    }, { 
      status: 500 
    });
  }
} 