"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function AuthTestPage() {
  const { data: session, status } = useSession();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Authentication Test Page</h1>
          
          <div className="p-6 border rounded-lg bg-slate-50 dark:bg-slate-800 mb-6">
            <h2 className="text-xl font-semibold mb-4">Session Status: {status}</h2>
            
            {status === "loading" && (
              <div className="flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
              </div>
            )}
            
            {status === "authenticated" && (
              <div>
                <p className="mb-2">✅ You are authenticated!</p>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-md mb-4">
                  <h3 className="font-medium mb-2">Session Data:</h3>
                  <pre className="text-xs overflow-auto p-2 bg-slate-100 dark:bg-slate-800 rounded">
                    {JSON.stringify(session, null, 2)}
                  </pre>
                </div>
                <Button asChild variant="default">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            )}
            
            {status === "unauthenticated" && (
              <div>
                <p className="mb-4">❌ You are not authenticated.</p>
                <Button asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>This page is for testing authentication status. It shows whether you are currently logged in or not.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 