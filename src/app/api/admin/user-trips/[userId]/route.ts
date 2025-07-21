import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Check if the user is an admin
    const admin = await isAdmin();
    
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { userId } = await params;
    
    // First, check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Get all itinerary generations for this user
    const generatedTrips = await prisma.itineraryGeneration.findMany({
      where: { 
        userId: userId,
        successful: true
      },
      select: {
        id: true,
        destination: true,
        duration: true,
        peopleCount: true,
        budget: true,
        currency: true,
        createdAt: true,
        successful: true,
        responseTime: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    // Also get counts
    const totalGenerations = await prisma.itineraryGeneration.count({
      where: {
        userId: userId
      }
    });
    
    const successfulGenerations = await prisma.itineraryGeneration.count({
      where: {
        userId: userId,
        successful: true
      }
    });
    
    return NextResponse.json({
      user,
      trips: generatedTrips,
      stats: {
        totalGenerations,
        successfulGenerations,
        successRate: totalGenerations > 0 ? (successfulGenerations / totalGenerations) * 100 : 0
      }
    });
  } catch (error: any) {
    console.error("Error fetching user trips:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch user trips" },
      { status: 500 }
    );
  }
} 