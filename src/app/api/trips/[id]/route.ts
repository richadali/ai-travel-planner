import { NextRequest, NextResponse } from "next/server";
import { getTripById, deleteTrip } from "@/lib/database";
import { auth } from "@/lib/auth";

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { 
        status: 401 
      });
    }
    
    const tripId = params.id;
    
    if (!tripId) {
      return NextResponse.json({ 
        success: false, 
        error: "Trip ID is required" 
      }, { 
        status: 400 
      });
    }
    
    // Get trip first to verify ownership
    const trip = await getTripById(tripId);
    
    if (!trip) {
      return NextResponse.json({ 
        success: false, 
        error: "Trip not found" 
      }, { 
        status: 404 
      });
    }
    
    // Verify the user owns this trip
    if (trip.userId !== session.user.id) {
      return NextResponse.json({ 
        success: false, 
        error: "You don't have permission to delete this trip" 
      }, { 
        status: 403 
      });
    }
    
    // Delete the trip
    await deleteTrip(tripId);
    
    return NextResponse.json({ 
      success: true, 
      message: "Trip deleted successfully" 
    });
  } catch (error: any) {
    console.error("Error deleting trip:", error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to delete trip" 
    }, { 
      status: 500 
    });
  }
} 