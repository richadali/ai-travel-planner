import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "@/lib/config";

interface ModelResult {
  status: "success" | "error";
  response?: string;
  error?: string;
}

interface ModelResults {
  [modelName: string]: ModelResult;
}

export async function GET(request: NextRequest) {
  try {
    console.log("Testing Gemini API connection");
    
    // Initialize the Gemini AI client with the API key from config
    const genAI = new GoogleGenerativeAI(config.apiKeys.gemini);
    
    // Try different model names from the current available models
    const modelNames = [
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-1.0-pro",
      "gemini-pro",
      "gemini-2.0-flash",
      "gemini-ultra",
    ];
    
    const results: ModelResults = {};
    
    // Try each model with a simple prompt
    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const result = await model.generateContent({
          contents: [{
            role: "user",
            parts: [{ text: "Say hello world in 5 words." }]
          }]
        });
        
        results[modelName] = {
          status: "success",
          response: result.response.text()
        };
        console.log(`Model ${modelName} succeeded`);
      } catch (error: any) {
        console.error(`Error with model ${modelName}:`, error.message);
        results[modelName] = {
          status: "error",
          error: error.message
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      apiKey: config.apiKeys.gemini ? "Present (length: " + config.apiKeys.gemini.length + ")" : "Missing",
      results
    });
  } catch (error: any) {
    console.error("Test endpoint error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Unknown error"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Try to parse the request body
    const body = await request.json();

    return NextResponse.json({
      success: true,
      message: "POST request received successfully",
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: "Error parsing request body: " + error.message,
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }
} 