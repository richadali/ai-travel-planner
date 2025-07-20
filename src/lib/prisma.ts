import { PrismaClient } from "../generated/prisma";
import { config } from "@/lib/config";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create Prisma client with connection retry logic
function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: config.database.url,
      },
    },
  });

  // Add middleware to handle connection issues
  client.$use(async (params, next) => {
    try {
      return await next(params);
    } catch (error) {
      // Log database errors in production
      if (process.env.NODE_ENV === "production") {
        console.error("Database operation failed:", {
          model: params.model,
          action: params.action,
          error: error instanceof Error ? error.message : String(error),
        });
      }
      throw error;
    }
  });

  return client;
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

// Connect to the database and handle any initial connection issues
if (!globalForPrisma.prisma) {
  prisma.$connect()
    .then(() => {
      console.log("Successfully connected to database");
    })
    .catch((error) => {
      console.error("Failed to connect to database:", error);
    });
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma; 