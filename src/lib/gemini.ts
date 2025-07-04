import { GoogleGenerativeAI } from "@google/generative-ai";
import { TripDataType, ItineraryType } from "@/types";
import { config } from "@/lib/config";

// Custom error class for invalid destinations
export class InvalidDestinationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidDestinationError';
  }
}

// Initialize the Gemini AI client with the API key from config
const genAI = new GoogleGenerativeAI(config.apiKeys.gemini);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Maximum number of retry attempts
const MAX_RETRIES = 3;

// Retry delay in milliseconds
const RETRY_DELAY = 1000;

/**
 * Generates a travel plan using Google's Gemini AI
 * @param tripData The trip data containing destination, duration, people count, and budget
 * @returns A structured itinerary generated by the AI
 */
export async function generateTravelPlan(tripData: TripDataType): Promise<ItineraryType> {
  let retries = 0;
  console.log("Starting travel plan generation with Gemini AI");
  
  while (retries < MAX_RETRIES) {
    try {
      console.log(`Attempt ${retries + 1}/${MAX_RETRIES} to generate travel plan`);
      const itinerary = await attemptTravelPlanGeneration(tripData);
      console.log("Successfully generated travel plan");
      return itinerary;
    } catch (error: any) {
      retries++;
      console.warn(`Attempt ${retries}/${MAX_RETRIES} failed:`, error.message);
      console.error("Error details:", error);
      
      // Don't retry if it's an invalid destination error
      if (error instanceof InvalidDestinationError) {
        console.error("Invalid destination detected, not retrying");
        throw error;
      }
      
      if (retries >= MAX_RETRIES) {
        console.error("All retry attempts failed:", error);
        throw new Error(
          `Failed to generate travel plan after ${MAX_RETRIES} attempts. ${
            error.message || "Please try again later."
          }`
        );
      }
      
      // Wait before retrying
      console.log(`Waiting ${RETRY_DELAY * retries}ms before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retries));
    }
  }
  
  // This should never be reached due to the throw in the catch block
  throw new Error("Unexpected error in travel plan generation");
}

/**
 * Attempts to generate a travel plan with Gemini AI
 * @param tripData The trip data containing destination, duration, people count, and budget
 * @returns A structured itinerary generated by the AI
 */
async function attemptTravelPlanGeneration(tripData: TripDataType): Promise<ItineraryType> {
  console.log("Creating prompt for Gemini AI");
  const promptText = createPrompt(tripData);
  
  console.log("Sending request to Gemini AI");
  try {
    // Use the correct format for the generateContent method
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: promptText }]
      }]
    });
    
    console.log("Received response from Gemini AI");
    const response = await result.response;
    const text = response.text();
    console.log("Processing AI response text");
    
    // Extract JSON from response
    const parsedData = extractAndParseJson(text);
    console.log("Successfully parsed JSON from AI response");
    
    // Validate and enhance the response
    const validatedData = validateAndEnhanceResponse(parsedData, tripData);
    console.log("Validated and enhanced AI response");
    
    return validatedData;
  } catch (error: any) {
    console.error("Error during Gemini API call:", error);
    // Add more specific error information for debugging
    if (error.response) {
      console.error("API response error:", error.response);
    }
    throw error;
  }
}

/**
 * Creates a detailed prompt for the AI based on user input
 * @param tripData The trip data containing destination, duration, people count, and budget
 * @returns A formatted prompt string
 */
function createPrompt(tripData: TripDataType): string {
  // Format the prompt text
  const promptText = `
    You are an expert travel planner with deep knowledge of destinations worldwide.
    
    CRITICAL INSTRUCTION: If the destination "${tripData.destination}" is not a real, valid place (city, region, or country), you MUST respond with exactly this text: "INVALID_DESTINATION: The provided destination is not a valid travel location."
    
    Only proceed if "${tripData.destination}" is a legitimate travel destination.
    
    Create a detailed travel itinerary for:
    
    # TRIP DETAILS
    - Destination: ${tripData.destination}
    - Duration: ${tripData.duration} days
    - Number of people: ${tripData.peopleCount}
    - Budget: ₹${tripData.budget} ${tripData.currency || 'INR'}
    
    # INSTRUCTIONS
    - Create a day-by-day itinerary with morning, afternoon, and evening activities
    - Suggest local authentic experiences, not just tourist attractions
    - Include a mix of popular sites and hidden gems
    - Recommend accommodations suitable for ${tripData.peopleCount} people
    - Include local and practical transportation options
    - Suggest meals that showcase local cuisine, including breakfast, lunch, dinner and snacks
    - Keep all costs within the total budget of ₹${tripData.budget}
    - Include local tips like etiquette, safety, best times to visit attractions, etc.
    - Consider weather patterns and seasonal events for the destination
    
    # SPECIAL REQUIREMENTS
    - If the destination has any major festivals or events during typical visit times, mention them
    - Include family-friendly activities if the group size suggests a family
    - Suggest sustainable tourism options where possible
    - Include contingency plans for bad weather days if applicable
    
    # RESPONSE FORMAT
    Your response MUST be valid JSON with the following structure:
    {
      "days": [
        {
          "day": 1,
          "activities": [
            {
              "name": "Activity name",
              "description": "Detailed activity description including historical/cultural context",
              "time": "Morning/Afternoon/Evening",
              "cost": 0,
              "location": "Location name",
              "weatherConsideration": "Any weather considerations for this activity"
            }
          ],
          "meals": [
            {
              "type": "breakfast/lunch/dinner/snack",
              "suggestion": "Meal suggestion including cuisine type and specialties",
              "cost": 0,
              "location": "Restaurant or area name"
            }
          ]
        }
      ],
      "accommodation": [
        {
          "name": "Accommodation name",
          "description": "Detailed description including location benefits",
          "pricePerNight": 0,
          "location": "Area/neighborhood",
          "amenities": ["amenity1", "amenity2"],
          "suitableFor": "Families/Couples/Solo travelers/etc."
        }
      ],
      "transportation": [
        {
          "type": "Transportation type",
          "description": "Detailed description",
          "cost": 0,
          "recommendedFor": "Airport transfers/Getting around/Day trips/etc."
        }
      ],
      "budgetBreakdown": {
        "accommodation": 0,
        "food": 0,
        "activities": 0,
        "transportation": 0,
        "miscellaneous": 0,
        "total": 0
      },
      "tips": [
        "Practical tip about local customs",
        "Safety information",
        "Money-saving advice",
        "Best time to visit specific attractions"
      ],
      "bestTimeToVisit": "Information about seasons and weather",
      "localCuisine": [
        "Must-try local dish 1",
        "Must-try local dish 2"
      ]
    }
    
    Provide exact costs in INR where possible. Ensure the sum of all costs matches the budget breakdown.
    Make your response comprehensive but focused on quality experiences rather than cramming too many activities.
  `;
  
  return promptText;
}

/**
 * Extracts and parses JSON from the AI response
 * @param text The raw text response from the AI
 * @returns Parsed JSON object
 */
function extractAndParseJson(text: string): any {
  console.log("Starting JSON extraction from AI response");
  console.log("Response text length:", text.length);
  
  // Log a sample of the text to help debug
  if (text.length > 200) {
    console.log("First 200 chars of response:", text.substring(0, 200) + "...");
  } else {
    console.log("Full response text:", text);
  }
  
  // Check for the specific invalid destination response
  if (text.includes("INVALID_DESTINATION:")) {
    throw new InvalidDestinationError("Invalid destination: Please enter a real city or country name.");
  }
  
  // Check if the response indicates an invalid destination (fallback checks)
  if (text.toLowerCase().includes("not a valid travel destination") || 
      text.toLowerCase().includes("not a real place") ||
      text.toLowerCase().includes("invalid destination") ||
      text.toLowerCase().includes("cannot create an itinerary for") ||
      text.toLowerCase().includes("insufficient to create a meaningful itinerary") ||
      text.toLowerCase().includes("need a real destination")) {
    throw new InvalidDestinationError("Invalid destination: Please enter a real city or country name.");
  }
  
  // Try to extract JSON from markdown code blocks first
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || 
                   text.match(/{[\s\S]*}/);
  
  if (!jsonMatch) {
    console.error("Failed to find JSON in the response");
    throw new Error("Failed to parse JSON response from Gemini AI: No JSON found in response");
  }
  
  let jsonString = jsonMatch[0].replace(/```(?:json)?|```/g, '').trim();
  
  // Log the extracted JSON string
  console.log("Extracted JSON string length:", jsonString.length);
  if (jsonString.length > 200) {
    console.log("First 200 chars of JSON:", jsonString.substring(0, 200) + "...");
  } else {
    console.log("Full JSON string:", jsonString);
  }
  
  // Clean up any trailing or leading comments that might have been included
  jsonString = jsonString.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
  
  try {
    const parsedData = JSON.parse(jsonString);
    console.log("Successfully parsed JSON data");
    return parsedData;
  } catch (error) {
    console.error("JSON parsing error:", error);
    console.error("Failed JSON string:", jsonString);
    throw new Error("Failed to parse JSON response: Invalid JSON format");
  }
}

/**
 * Validates and enhances the AI response
 * @param data The parsed JSON data
 * @param tripData The original trip data
 * @returns Validated and enhanced itinerary data
 */
function validateAndEnhanceResponse(data: any, tripData: TripDataType): ItineraryType {
  // Basic validation to ensure the response has the required fields
  validateItineraryResponse(data);
  
  // Ensure all days from 1 to duration are included
  ensureAllDaysPresent(data, tripData.duration);
  
  // Make sure budget totals match
  validateAndAdjustBudget(data, tripData.budget);
  
  // Add any missing optional fields with defaults
  return addDefaultsToMissingFields(data);
}

/**
 * Validates the structure of the itinerary response
 * @param data The itinerary data to validate
 */
function validateItineraryResponse(data: any): asserts data is ItineraryType {
  // Basic validation to ensure the response has the required fields
  if (!data.days || !Array.isArray(data.days)) {
    throw new Error("Invalid response: missing days array");
  }
  
  if (!data.accommodation || !Array.isArray(data.accommodation)) {
    throw new Error("Invalid response: missing accommodation array");
  }
  
  if (!data.transportation || !Array.isArray(data.transportation)) {
    throw new Error("Invalid response: missing transportation array");
  }
  
  if (!data.budgetBreakdown || typeof data.budgetBreakdown !== 'object') {
    throw new Error("Invalid response: missing budget breakdown");
  }
  
  if (!data.tips || !Array.isArray(data.tips)) {
    throw new Error("Invalid response: missing tips array");
  }
}

/**
 * Ensures all days from 1 to duration are included in the itinerary
 * @param data The itinerary data
 * @param duration The trip duration
 */
function ensureAllDaysPresent(data: any, duration: number): void {
  const existingDays = new Set(data.days.map((day: any) => day.day));
  
  for (let i = 1; i <= duration; i++) {
    if (!existingDays.has(i)) {
      // Add a placeholder day if missing
      data.days.push({
        day: i,
        activities: [
          {
            name: "Free time to explore",
            description: "Time to explore the area at your own pace or rest.",
            time: "Flexible",
            cost: 0,
            location: "Various"
          }
        ],
        meals: [
          {
            type: "breakfast",
            suggestion: "Breakfast at accommodation or nearby cafe",
            cost: 500
          },
          {
            type: "lunch",
            suggestion: "Local cuisine at a restaurant of your choice",
            cost: 700
          },
          {
            type: "dinner",
            suggestion: "Dinner at a local restaurant",
            cost: 900
          }
        ]
      });
    }
  }
  
  // Sort days in ascending order
  data.days.sort((a: any, b: any) => a.day - b.day);
  
  // Remove extra days beyond the requested duration
  data.days = data.days.filter((day: any) => day.day <= duration);
}

/**
 * Validates and adjusts budget breakdown to match the total budget
 * @param data The itinerary data
 * @param totalBudget The total trip budget
 */
function validateAndAdjustBudget(data: any, totalBudget: number): void {
  const breakdown = data.budgetBreakdown;
  
  // Calculate the current total from components
  const calculatedTotal = 
    breakdown.accommodation + 
    breakdown.food + 
    breakdown.activities + 
    breakdown.transportation + 
    breakdown.miscellaneous;
  
  // If there's a significant discrepancy, adjust components proportionally
  if (Math.abs(calculatedTotal - breakdown.total) > 10) {
    breakdown.total = calculatedTotal;
  }
  
  // If the total is significantly different from user budget, adjust proportionally
  if (Math.abs(breakdown.total - totalBudget) > totalBudget * 0.05) {
    const ratio = totalBudget / breakdown.total;
    
    breakdown.accommodation = Math.round(breakdown.accommodation * ratio);
    breakdown.food = Math.round(breakdown.food * ratio);
    breakdown.activities = Math.round(breakdown.activities * ratio);
    breakdown.transportation = Math.round(breakdown.transportation * ratio);
    breakdown.miscellaneous = Math.round(breakdown.miscellaneous * ratio);
    breakdown.total = totalBudget;
  }
}

/**
 * Adds defaults to any missing optional fields
 * @param data The itinerary data
 * @returns Enhanced itinerary data with defaults for missing fields
 */
function addDefaultsToMissingFields(data: any): ItineraryType {
  // Add bestTimeToVisit if missing
  if (!data.bestTimeToVisit) {
    data.bestTimeToVisit = "Information not available. Check local weather forecasts before your trip.";
  }
  
  // Add localCuisine if missing
  if (!data.localCuisine || !Array.isArray(data.localCuisine) || data.localCuisine.length === 0) {
    data.localCuisine = ["Local cuisine - explore restaurants and food stalls for authentic experiences"];
  }
  
  // Ensure all activities have weather consideration
  data.days.forEach((day: any) => {
    day.activities.forEach((activity: any) => {
      if (!activity.weatherConsideration) {
        activity.weatherConsideration = "No specific weather considerations";
      }
    });
    
    // Ensure all meals have location
    day.meals.forEach((meal: any) => {
      if (!meal.location) {
        meal.location = "Local area";
      }
    });
  });
  
  // Ensure all accommodations have suitableFor field
  data.accommodation.forEach((accommodation: any) => {
    if (!accommodation.suitableFor) {
      accommodation.suitableFor = "All travelers";
    }
  });
  
  // Ensure all transportation options have recommendedFor field
  data.transportation.forEach((transport: any) => {
    if (!transport.recommendedFor) {
      transport.recommendedFor = "General transportation";
    }
  });
  
  return data as ItineraryType;
} 