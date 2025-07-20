import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateTravelPlan } from "@/lib/gemini";
import { getCurrentUserId } from "@/lib/auth";
import { AnalyticsService } from "@/lib/analytics";

const TripRequestSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  duration: z.number().min(1, "Duration must be at least 1 day").max(30, "Duration cannot exceed 30 days"),
  peopleCount: z.number().min(1, "Number of people must be at least 1").max(20, "Number of people cannot exceed 20"),
  budget: z.number().min(100, "Budget must be at least 100"),
  currency: z.string().default("INR"),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let successful = true;
  let errorMessage = null;
  
  try {
    // Parse and validate the request body
    const body = await request.json();
    const validatedData = TripRequestSchema.parse(body);
    
    // Generate the travel plan using Gemini AI
    const itinerary = await generateTravelPlan(validatedData);
    
    // Get the current user ID if authenticated
    const userId = await getCurrentUserId();
    
    // Create a response object with the generated itinerary
    const responseData = {
      destination: validatedData.destination,
      duration: validatedData.duration,
      peopleCount: validatedData.peopleCount,
      budget: validatedData.budget,
      currency: validatedData.currency,
      itinerary,
    };
    
    // Track the itinerary generation directly via the AnalyticsService
    const responseTime = Date.now() - startTime;
    
    // Track analytics directly using the service instead of making an API call
    try {
      await AnalyticsService.trackItineraryGeneration({
        userId,
        destination: validatedData.destination,
        duration: validatedData.duration,
        peopleCount: validatedData.peopleCount,
        budget: validatedData.budget,
        currency: validatedData.currency,
        successful: true,
        responseTime,
        request
      });
    } catch (analyticsError) {
      console.error("Failed to track itinerary generation:", analyticsError);
      // Don't fail the main request if analytics fails
    }
    
    // Return the generated itinerary
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Error generating travel plan:", error);
    successful = false;
    errorMessage = error.message || "Unknown error";
    
    const responseTime = Date.now() - startTime;
    
    // Handle specific error types
    if (error.name === "InvalidDestinationError") {
      // Track the failed itinerary generation directly
      try {
        await AnalyticsService.trackItineraryGeneration({
          userId: await getCurrentUserId(),
          destination: "invalid-destination",
          duration: 0,
          peopleCount: 0,
          budget: 0,
          successful: false,
          errorMessage: error.message,
          responseTime,
          request
        });
      } catch (analyticsError) {
        console.error("Failed to track failed itinerary generation:", analyticsError);
      }
      
      return NextResponse.json(
        { error: error.message || "Invalid destination provided" },
        { status: 400 }
      );
    }
    
    if (error.name === "ZodError") {
      // Track validation error directly
      try {
        await AnalyticsService.trackItineraryGeneration({
          userId: await getCurrentUserId(),
          destination: "validation-error",
          duration: 0,
          peopleCount: 0,
          budget: 0,
          successful: false,
          errorMessage: "Validation error: " + JSON.stringify(error.errors),
          responseTime,
          request
        });
      } catch (analyticsError) {
        console.error("Failed to track validation error:", analyticsError);
      }
      
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    
    // Track generic error directly
    try {
      await AnalyticsService.trackItineraryGeneration({
        userId: await getCurrentUserId(),
        destination: "error",
        duration: 0,
        peopleCount: 0,
        budget: 0,
        successful: false,
        errorMessage: error.message || "Unknown server error",
        responseTime,
        request
      });
    } catch (analyticsError) {
      console.error("Failed to track error:", analyticsError);
    }
    
    // Handle general errors
    return NextResponse.json(
      { error: "Failed to generate travel plan. Please try again later." },
      { status: 500 }
    );
  }
} 