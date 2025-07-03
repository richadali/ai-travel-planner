import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Only allow in development mode or with proper authentication
    if (process.env.NODE_ENV !== 'development') {
      const authenticated = await isAuthenticated(request);
      if (!authenticated) {
        return NextResponse.json({ 
          success: false, 
          error: "Unauthorized" 
        }, { 
          status: 401 
        });
      }
    }
    
    // Delete all analytics data
    await Promise.all([
      prisma.pageView.deleteMany(),
      prisma.itineraryGeneration.deleteMany(),
      prisma.analyticsSummary.deleteMany()
    ]);
    
    return NextResponse.json({ 
      success: true, 
      message: "Analytics data has been reset successfully" 
    });
  } catch (error: any) {
    console.error("Error resetting analytics:", error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to reset analytics data" 
    }, { 
      status: 500 
    });
  }
} 