import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/lib/analytics";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract data from the request body
    const { 
      path, 
      referrer = null, 
      userId = null
    } = body;
    
    // Validate required fields
    if (!path) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }
    
    // Track the page view
    await AnalyticsService.trackPageView({
      path,
      referrer,
      userId,
      request
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking page view:", error);
    return NextResponse.json({ error: "Failed to track page view" }, { status: 500 });
  }
} 