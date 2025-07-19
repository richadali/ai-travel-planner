"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect, Suspense } from "react";
import { Plane } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

// Separate component that uses useSearchParams
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get session status
  const { data: session, status } = useSession();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace(callbackUrl);
    }
    
    // Check for error in URL
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(`Authentication error: ${errorParam}`);
    }
  }, [status, session, callbackUrl, router, searchParams]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use direct signin without redirect option to let NextAuth handle it
      await signIn("google", { 
        callbackUrl,
      });
      
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login. Please try again.");
      setIsLoading(false);
    }
  };
  
  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  // Only show login page if not authenticated
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="mb-8 flex flex-col items-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full mb-4">
            <Plane className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-center">Sign in to AI Travel Planner</h1>
          <p className="text-muted-foreground text-center mt-2">
            Sign in to save your travel itineraries and access them from anywhere
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 text-sm border border-red-200 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 h-12"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Main component with Suspense boundary
export default function LoginPage() {
  return (
    <>
      <Header />
      <Suspense fallback={
        <div className="flex min-h-[80vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
        </div>
      }>
        <LoginContent />
      </Suspense>
      <Footer />
    </>
  );
} 