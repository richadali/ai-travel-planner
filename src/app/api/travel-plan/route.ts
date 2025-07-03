import { NextRequest, NextResponse } from "next/server";
import { TripRequestSchema } from "@/lib/validations";
import { generateTravelPlan, InvalidDestinationError } from "@/lib/gemini";
// import { createTrip } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const validatedData = TripRequestSchema.parse(body);
    
    console.log("Generating travel plan for:", validatedData);
    
    // Generate travel plan using Gemini AI
    const itinerary = await generateTravelPlan(validatedData);
    
    // Temporarily bypass database operations
    /*
    // Save the trip data to the database
    const tripData = {
      ...validatedData,
      itinerary,
    };
    
    const savedTrip = await createTrip(tripData);
    */
    
    return NextResponse.json({ 
      success: true, 
      trip: {
        id: "temp-id-" + Date.now(),
        destination: validatedData.destination,
        duration: validatedData.duration,
        peopleCount: validatedData.peopleCount,
        budget: validatedData.budget,
        currency: validatedData.currency || "INR",
        itinerary: itinerary,
        createdAt: new Date().toISOString(),
      }
    }, { 
      status: 201 
    });
  } catch (error: any) {
    console.error("Travel plan generation error:", error);
    
    // Handle invalid destination errors (user error - 400)
    if (error instanceof InvalidDestinationError) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        errorType: "INVALID_DESTINATION"
      }, { 
        status: 400 
      });
    }
    
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
    
    // Handle other errors (server error - 500)
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to generate travel plan" 
    }, { 
      status: 500 
    });
  }
} 