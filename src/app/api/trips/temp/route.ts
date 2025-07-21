import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";

// Schema for temporary trip request
const TempTripSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  duration: z.number().min(1, "Duration must be at least 1 day").max(30, "Duration cannot exceed 30 days"),
  peopleCount: z.number().min(1, "Number of people must be at least 1").max(20, "Number of people cannot exceed 20"),
  budget: z.number().min(100, "Budget must be at least 100"),
  currency: z.string().default("INR"),
  isAnonymous: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    console.log("[API] Temporary trip creation request received");
    
    // Parse and validate the request body
    const body = await request.json();
    console.log("[API] Temporary trip request body:", {
      destination: body.destination,
      duration: body.duration,
      peopleCount: body.peopleCount,
      budget: body.budget,
      currency: body.currency || 'INR',
      isAnonymous: body.isAnonymous || true,
    });
    
    const validatedData = TempTripSchema.parse(body);
    
    // Create a minimal trip record for tracking purposes
    const tempTrip = await prisma.trip.create({
      data: {
        destination: validatedData.destination,
        duration: validatedData.duration,
        peopleCount: validatedData.peopleCount,
        budget: validatedData.budget,
        currency: validatedData.currency,
        // Use a placeholder for itinerary to save space
        itinerary: { type: "anonymous_download", timestamp: new Date().toISOString() },
      },
    });
    
    console.log(`[API] Created temporary trip with ID: ${tempTrip.id}`);
    
    return NextResponse.json({
      success: true,
      tripId: tempTrip.id,
    });
  } catch (error: any) {
    console.error("[API] Error creating temporary trip:", error);
    
    // Handle validation errors
    if (error.name === "ZodError") {
      return NextResponse.json({
        success: false,
        error: "Invalid request data",
        details: error.errors,
      }, {
        status: 400,
      });
    }
    
    // Handle other errors
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to create temporary trip",
    }, {
      status: 500,
    });
  }
} 