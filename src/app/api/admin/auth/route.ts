import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const result = LoginSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid credentials",
        details: result.error.format()
      }, { status: 400 });
    }
    
    const { email, password } = result.data;
    
    // Authenticate user
    const isAuthenticated = await AuthService.login(email, password);
    
    if (!isAuthenticated) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid email or password" 
      }, { status: 401 });
    }
    
    // Create session token
    const sessionToken = AuthService.createSession();
    
    // Return success with session token
    // In a real app, you would set an HTTP-only cookie here
    return NextResponse.json({ 
      success: true,
      sessionToken
    });
    
  } catch (error: any) {
    console.error("Authentication error:", error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Authentication failed" 
    }, { status: 500 });
  }
} 