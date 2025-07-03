import { NextRequest, NextResponse } from "next/server";
import { TripRequestSchema } from "@/lib/validations";
import { generateTravelPlan, InvalidDestinationError } from "@/lib/gemini";
import { AnalyticsService } from "@/lib/analytics";
// import { createTrip } from "@/lib/database";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let successful = false;
  let errorMessage = null;
  
  try {
    // Parse and validate the request body
    const body = await request.json();
    const validatedData = TripRequestSchema.parse(body);
    
    console.log("Generating travel plan for:", validatedData);
    
    // Generate travel plan using Gemini AI
    const itinerary = await generateTravelPlan(validatedData);
    
    // Mark as successful for analytics
    successful = true;
    
    // Temporarily bypass database operations
    /*
    // Save the trip data to the database
    const tripData = {
      ...validatedData,
      itinerary,
    };
    
    const savedTrip = await createTrip(tripData);
    */
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Track the itinerary generation asynchronously
    AnalyticsService.trackItineraryGeneration({
      destination: validatedData.destination,
      duration: validatedData.duration,
      peopleCount: validatedData.peopleCount,
      budget: validatedData.budget,
      currency: validatedData.currency || "INR",
      successful: true,
      responseTime,
      request,
    }).catch(error => {
      console.error("Failed to track itinerary generation:", error);
    });
    
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
    
    // Set error details for analytics
    successful = false;
    errorMessage = error.message || "Unknown error";
    
    // Handle invalid destination errors (user error - 400)
    if (error instanceof InvalidDestinationError) {
      // Get the original request data if available
      let destination = "unknown";
      let duration = 0;
      let peopleCount = 0;
      let budget = 0;
      
      try {
        // Try to parse the original request to get the data
        const originalData = request.clone().json().then(data => {
          if (data && typeof data === 'object') {
            destination = data.destination || "unknown";
            duration = data.duration || 0;
            peopleCount = data.peopleCount || 0;
            budget = data.budget || 0;
          }
        }).catch(() => {
          // Ignore parsing errors
        });
      } catch (parseError) {
        console.error("Error parsing original request:", parseError);
      }
      
      // Track the failed itinerary generation
      AnalyticsService.trackItineraryGeneration({
        destination,
        duration,
        peopleCount,
        budget,
        successful: false,
        errorMessage: error.message,
        responseTime: Date.now() - startTime,
        request,
      }).catch(trackError => {
        console.error("Failed to track failed itinerary generation:", trackError);
      });
      
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
      // Track validation error with available data
      try {
        const partialData = error.data || {};
        
        AnalyticsService.trackItineraryGeneration({
          destination: partialData.destination || "validation-error",
          duration: partialData.duration || 0,
          peopleCount: partialData.peopleCount || 0,
          budget: partialData.budget || 0,
          successful: false,
          errorMessage: "Validation error: " + JSON.stringify(error.errors),
          responseTime: Date.now() - startTime,
          request,
        }).catch(trackError => {
          console.error("Failed to track validation error:", trackError);
        });
      } catch (trackError) {
        console.error("Error tracking validation failure:", trackError);
      }
      
      return NextResponse.json({ 
        success: false, 
        error: "Invalid request data", 
        details: error.errors 
      }, { 
        status: 400 
      });
    }
    
    // Track generic error
    try {
      AnalyticsService.trackItineraryGeneration({
        destination: "error",
        duration: 0,
        peopleCount: 0,
        budget: 0,
        successful: false,
        errorMessage: error.message || "Unknown server error",
        responseTime: Date.now() - startTime,
        request,
      }).catch(trackError => {
        console.error("Failed to track error:", trackError);
      });
    } catch (trackError) {
      console.error("Error tracking failure:", trackError);
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