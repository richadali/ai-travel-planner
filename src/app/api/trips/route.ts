import { NextRequest, NextResponse } from "next/server";
import { getUserTrips, createTrip } from "@/lib/database";
import { z } from "zod";
import { getServerSession } from "@/lib/auth";

// Add cache configuration
export const revalidate = 60; // Revalidate every 60 seconds

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from session
    const session = await getServerSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { 
        status: 401 
      });
    }
    
    // Get query parameters for pagination
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    
    // Get trips for the user
    const trips = await getUserTrips(userId, limit, offset);
    
    // Return response with cache headers
    return NextResponse.json(trips, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate'
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

// Schema for trip creation
const TripSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  duration: z.number().min(1, "Duration must be at least 1 day"),
  peopleCount: z.number().min(1, "People count must be at least 1"),
  budget: z.number().min(1, "Budget must be greater than 0"),
  currency: z.string().default("INR"),
  itinerary: z.any(),
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from session
    const session = await getServerSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { 
        status: 401 
      });
    }
    
    // Parse and validate the request body
    const body = await request.json();
    const validatedData = TripSchema.parse(body);
    
    // Create the trip with the authenticated user ID
    const trip = await createTrip(validatedData, userId);
    
    return NextResponse.json({
      success: true,
      trip
    }, { 
      status: 201 
    });
  } catch (error: any) {
    console.error("Error creating trip:", error);
    
    // Handle validation errors
    if (error.name === "ZodError") {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid trip data", 
        details: error.errors 
      }, { 
        status: 400 
      });
    }
    
    // Handle other errors
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to create trip" 
    }, { 
      status: 500 
    });
  }
} 