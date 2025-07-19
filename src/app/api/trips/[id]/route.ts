import { NextRequest, NextResponse } from "next/server";
import { getTripById, deleteTrip } from "@/lib/database";
import { auth } from "@/lib/auth";

// Add cache configuration
export const revalidate = 60; // Revalidate every 60 seconds

// GET handler for fetching a specific trip
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const id = context.params.id;
  
  if (!id) {
    return NextResponse.json(
      { success: false, error: "Trip ID is required" },
      { status: 400 }
    );
  }
  
  try {
    // Get trip by ID
    const trip = await getTripById(id);
    
    if (!trip) {
      return NextResponse.json(
        { success: false, error: "Trip not found" },
        { status: 404 }
      );
    }
    
    // Return response with cache headers
    return NextResponse.json(
      { success: true, trip },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
        }
      }
    );
  } catch (error: any) {
    console.error("Error fetching trip:", error);
    
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch trip" },
      { status: 500 }
    );
  }
}

// DELETE handler for removing a trip
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const id = context.params.id;
  
  if (!id) {
    return NextResponse.json(
      { success: false, error: "Trip ID is required" },
      { status: 400 }
    );
  }
  
  try {
    // Check authentication
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get trip first to verify ownership
    const trip = await getTripById(id);
    
    if (!trip) {
      return NextResponse.json(
        { success: false, error: "Trip not found" },
        { status: 404 }
      );
    }
    
    // Verify the user owns this trip
    if (trip.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "You don't have permission to delete this trip" },
        { status: 403 }
      );
    }
    
    // Delete the trip
    await deleteTrip(id);
    
    return NextResponse.json(
      { success: true, message: "Trip deleted successfully" }
    );
  } catch (error: any) {
    console.error("Error deleting trip:", error);
    
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete trip" },
      { status: 500 }
    );
  }
} 