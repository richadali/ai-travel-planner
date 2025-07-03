import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { getTripById, updateTrip } from "@/lib/database";

// Schema for share request
const ShareRequestSchema = z.object({
  tripId: z.string().min(1, "Trip ID is required"),
  ownerName: z.string().optional(),
  expiryDays: z.number().min(1).max(30).default(7),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const { tripId, ownerName, expiryDays } = ShareRequestSchema.parse(body);
    
    // Fetch the trip
    const trip = await getTripById(tripId);
    
    if (!trip) {
      return NextResponse.json({ 
        success: false, 
        error: "Trip not found" 
      }, { 
        status: 404 
      });
    }
    
    // Generate a unique share ID
    const shareId = nanoid(10);
    
    // Calculate expiry date (default: 7 days)
    const shareExpiry = new Date();
    shareExpiry.setDate(shareExpiry.getDate() + expiryDays);
    
    // Update the trip with share information
    const updatedTrip = await updateTrip(tripId, {
      shareId,
      shareExpiry: shareExpiry.toISOString(),
      ownerName: ownerName || undefined,
    });
    
    // Construct share URL
    const shareUrl = `${request.nextUrl.origin}/trips/share/${shareId}`;
    
    return NextResponse.json({ 
      success: true, 
      shareUrl,
      shareId,
      shareExpiry: shareExpiry.toISOString(),
    }, { 
      status: 200 
    });
  } catch (error: any) {
    console.error("Error sharing trip:", error);
    
    // Handle validation errors
    if (error.name === "ZodError") {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid request data", 
        details: error.errors 
      }, { 
        status: 400 
      });
    }
    
    // Handle other errors
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to share trip" 
    }, { 
      status: 500 
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the share ID from the query parameters
    const url = new URL(request.url);
    const shareId = url.searchParams.get("shareId");
    
    if (!shareId) {
      return NextResponse.json({ 
        success: false, 
        error: "Share ID is required" 
      }, { 
        status: 400 
      });
    }
    
    // Fetch the trip by share ID
    const trip = await getTripByShareId(shareId);
    
    if (!trip) {
      return NextResponse.json({ 
        success: false, 
        error: "Shared trip not found or link expired" 
      }, { 
        status: 404 
      });
    }
    
    // Check if the share link has expired
    const shareExpiry = new Date(trip.shareExpiry as string);
    if (shareExpiry < new Date()) {
      return NextResponse.json({ 
        success: false, 
        error: "Share link has expired" 
      }, { 
        status: 410 // Gone
      });
    }
    
    // Return the trip data
    return NextResponse.json({ 
      success: true, 
      trip: {
        id: trip.id,
        destination: trip.destination,
        duration: trip.duration,
        peopleCount: trip.peopleCount,
        budget: trip.budget,
        currency: trip.currency,
        itinerary: trip.itinerary,
        createdAt: trip.createdAt,
        ownerName: trip.ownerName,
      }
    });
  } catch (error: any) {
    console.error("Error fetching shared trip:", error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to fetch shared trip" 
    }, { 
      status: 500 
    });
  }
}

// Helper function to get a trip by share ID (this would be implemented in database.ts)
async function getTripByShareId(shareId: string) {
  try {
    // This is a placeholder implementation
    // In a real application, this would query the database by shareId
    return { shareExpiry: new Date().toISOString() }; // Just a placeholder
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to retrieve shared trip");
  }
} 