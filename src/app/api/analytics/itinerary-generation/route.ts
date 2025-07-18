import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/lib/analytics";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract data from the request body
    const { 
      destination,
      duration,
      peopleCount,
      budget,
      currency = 'INR',
      successful = true,
      errorMessage = null,
      responseTime = null,
      userId = null,
      ipAddress = null,
      userAgent = null
    } = body;
    
    // Validate required fields
    if (!destination || !duration || !peopleCount || !budget) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Track the itinerary generation
    await AnalyticsService.trackItineraryGeneration({
      destination,
      duration,
      peopleCount,
      budget,
      currency,
      successful,
      errorMessage,
      responseTime,
      userId,
      ipAddress,
      userAgent
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking itinerary generation:", error);
    return NextResponse.json({ error: "Failed to track itinerary generation" }, { status: 500 });
  }
} 