import { prisma } from "@/lib/prisma";
import { TripDataType } from "@/types";

/**
 * Creates a new trip in the database
 * @param tripData The trip data to save
 * @param userId Optional user ID to associate with the trip
 * @returns The created trip record
 */
export async function createTrip(tripData: TripDataType, userId?: string) {
  try {
    return await prisma.trip.create({
      data: {
        destination: tripData.destination,
        duration: tripData.duration,
        peopleCount: tripData.peopleCount,
        budget: tripData.budget,
        currency: tripData.currency || "INR",
        itinerary: tripData.itinerary || {},
        userId: userId || null,
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to save trip");
  }
}

/**
 * Updates an existing trip in the database
 * @param tripId The ID of the trip to update
 * @param updateData The data to update
 * @returns The updated trip record
 */
export async function updateTrip(tripId: string, updateData: Record<string, any>) {
  try {
    return await prisma.trip.update({
      where: {
        id: tripId,
      },
      data: updateData,
    });
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to update trip");
  }
}

/**
 * Retrieves all trips for a specific user
 * @param userId The ID of the user
 * @param limit The maximum number of trips to return
 * @param offset The number of trips to skip
 * @returns An array of trip records
 */
export async function getUserTrips(userId: string, limit = 10, offset = 0) {
  try {
    return await prisma.trip.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to retrieve trips");
  }
}

/**
 * Retrieves a specific trip by ID
 * @param tripId The ID of the trip to retrieve
 * @returns The trip record or null if not found
 */
export async function getTripById(tripId: string) {
  try {
    return await prisma.trip.findUnique({
      where: {
        id: tripId,
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to retrieve trip");
  }
}

/**
 * Retrieves a specific trip by share ID
 * @param shareId The share ID of the trip to retrieve
 * @returns The trip record or null if not found
 */
export async function getTripByShareId(shareId: string) {
  try {
    return await prisma.trip.findFirst({
      where: {
        shareId,
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to retrieve shared trip");
  }
}

/**
 * Deletes a specific trip by ID
 * @param tripId The ID of the trip to delete
 * @returns The deleted trip record
 */
export async function deleteTrip(tripId: string) {
  try {
    return await prisma.trip.delete({
      where: {
        id: tripId,
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to delete trip");
  }
} 