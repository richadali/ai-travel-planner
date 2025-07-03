/**
 * Application configuration
 * This file centralizes all configuration values for the application
 * All sensitive values are stored in environment variables
 */

export const config = {
  // API Keys
  apiKeys: {
    gemini: process.env.GEMINI_API_KEY || "",
  },
  
  // Database
  database: {
    url: process.env.DATABASE_URL || "",
  },
  
  // Authentication
  auth: {
    secret: process.env.NEXTAUTH_SECRET || "",
    url: process.env.NEXTAUTH_URL || "",
  },
  
  // Application settings
  app: {
    name: process.env.APP_NAME || "AI Travel Planner",
    defaultCurrency: process.env.DEFAULT_CURRENCY || "INR",
    shareExpiry: parseInt(process.env.SHARE_EXPIRY_DAYS || "7", 10),
  },
  
  // Feature flags
  features: {
    sharing: true,
    userPreferences: true,
    darkMode: true,
  },
};

export default config; 