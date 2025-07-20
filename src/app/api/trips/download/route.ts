import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AnalyticsService } from "@/lib/analytics";
import { getCurrentUserId } from "@/lib/auth";

// Schema for download tracking request
const DownloadTrackingSchema = z.object({
  tripId: z.string().min(1, "Trip ID is required"),
  downloadType: z.string().default("pdf"),
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log("[API] Download tracking request received");
    
    // Parse and validate the request body
    const body = await request.json();
    console.log("[API] Download tracking body:", {
      tripId: body.tripId,
      downloadType: body.downloadType,
      hasUserId: body.userId ? true : false
    });
    
    const { tripId, downloadType, userId } = DownloadTrackingSchema.parse(body);
    
    // Get current user ID if not provided
    const currentUserId = userId || await getCurrentUserId();
    
    console.log("[API] Tracking download with user ID:", currentUserId || "anonymous");
    
    // Track the download
    const trackingResult = await AnalyticsService.trackTripDownload({
      tripId,
      downloadType,
      userId: currentUserId,
      request,
    });
    
    if (trackingResult) {
      console.log("[API] Download tracking successful");
      return NextResponse.json({ 
        success: true, 
        message: "Download tracked successfully" 
      });
    } else {
      console.log("[API] Download tracking failed in service");
      return NextResponse.json({ 
        success: false, 
        error: "Failed to track download in service" 
      }, { 
        status: 500 
      });
    }
  } catch (error: any) {
    console.error("[API] Error tracking download:", error);
    
    // Handle validation errors
    if (error.name === "ZodError") {
      console.error("[API] Validation error:", error.errors);
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