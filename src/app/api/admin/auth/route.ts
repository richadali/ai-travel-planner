import { NextRequest, NextResponse } from "next/server";
import { getServerSession, isAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: "Not authenticated" 
      }, { status: 401 });
    }
    
    // Check if user is admin
    const adminStatus = await isAdmin();
    
    if (!adminStatus) {
      return NextResponse.json({ 
        success: false, 
        error: "Not authorized" 
      }, { status: 403 });
    }
    
    return NextResponse.json({ 
      success: true,
      user: {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }
    });
    
  } catch (error: any) {
    console.error("Admin authentication error:", error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Authentication failed" 
    }, { status: 500 });
  }
} 