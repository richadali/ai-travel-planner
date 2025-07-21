import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Check if the user is an admin
    const admin = await isAdmin();
    
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get query parameters for pagination
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortDirection = searchParams.get("sortDirection") === "asc" ? "asc" : "desc";
    
    // Calculate pagination
    const skip = (page - 1) * pageSize;
    
    // Build search filter
    const filter = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};
    
    // Get users with pagination and detailed counts
    const users = await prisma.user.findMany({
      where: filter,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            trips: true,
            sessions: true,
            accounts: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortDirection,
      },
      skip,
      take: pageSize,
    });
    
    // For each user, fetch additional trip statistics
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const generatedTrips = await prisma.itineraryGeneration.count({
        where: { userId: user.id }
      });
      
      const sharedTrips = await prisma.tripShare.count({
        where: { userId: user.id }
      });
      
      const downloadedTrips = await prisma.tripDownload.count({
        where: { userId: user.id }
      });
      
      return {
        ...user,
        stats: {
          generatedTrips,
          savedTrips: user._count.trips,
          sharedTrips,
          downloadedTrips
        }
      };
    }));
    
    // Get total count
    const totalUsers = await prisma.user.count({
      where: filter,
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / pageSize);
    
    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        pageSize,
        totalUsers,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
} 