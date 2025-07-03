import { NextRequest, NextResponse } from "next/server";
import { getTripById } from "@/lib/database";

// Add cache configuration
export const revalidate = 60; // Revalidate every 60 seconds

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tripId = params.id;
    
    if (!tripId) {
      return NextResponse.json({ 
        success: false, 
        error: "Trip ID is required" 
      }, { 
        status: 400 
      });
    }
    
    // Get trip by ID
    const trip = await getTripById(tripId);
    
    if (!trip) {
      return NextResponse.json({ 
        success: false, 
        error: "Trip not found" 
      }, { 
        status: 404 
      });
    }
    
    // Return response with cache headers
    return NextResponse.json({ 
      success: true, 
      trip 
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (error: any) {
    console.error("Error fetching trip:", error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to fetch trip" 
    }, { 
      status: 500 
    });
  }
} 