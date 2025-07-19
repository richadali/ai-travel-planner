import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/lib/analytics";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Track the page view
    await AnalyticsService.trackPageView({
      path: body.path,
      referrer: body.referrer,
      duration: body.duration,
      request,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to track page view:", error);
    return NextResponse.json({ success: false, error: "Failed to track page view" }, { status: 500 });
  }
} 