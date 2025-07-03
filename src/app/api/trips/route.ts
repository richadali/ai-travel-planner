import { NextRequest, NextResponse } from "next/server";
import { getUserTrips } from "@/lib/database";

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
    
    return NextResponse.json({ 
      success: true, 
      trips 
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