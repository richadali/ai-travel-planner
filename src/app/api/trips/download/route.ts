import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AnalyticsService } from "@/lib/analytics";

// Schema for download tracking request
const DownloadTrackingSchema = z.object({
  tripId: z.string().min(1, "Trip ID is required"),
  downloadType: z.string().default("pdf"),
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const { tripId, downloadType, userId } = DownloadTrackingSchema.parse(body);
    
    // Track the download
    await AnalyticsService.trackTripDownload({
      tripId,
      downloadType,
      userId,
      request,
    });
    
    return NextResponse.json({ 
      success: true, 
      message: "Download tracked successfully" 
    });
  } catch (error: any) {
    console.error("Error tracking download:", error);
    
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
      error: error.message || "Failed to track download" 
    }, { 
      status: 500 
    });
  }
} 