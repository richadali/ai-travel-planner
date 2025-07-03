"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthService } from "@/lib/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Skip auth check for login page
        if (pathname === "/admin") {
          setIsLoading(false);
          return;
        }
        
        // Check for session cookie
        const cookies = document.cookie.split(';').map(c => c.trim());
        const sessionCookie = cookies.find(c => c.startsWith('admin_session='));
        
        if (!sessionCookie) {
          // No session found, redirect to login
          router.push("/admin");
          return;
        }
        
        // In a real app, you would verify the session with the server
        setIsLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/admin");
      }
    };
    
    checkAuth();
  }, [pathname, router]);
  
  // Handle logout
  const handleLogout = () => {
    AuthService.clearSessionCookie();
    router.push("/admin");
  };
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Don't show admin navigation on the login page
  if (pathname === "/admin") {
    return <>{children}</>;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Admin Navigation */}
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
          >
            Logout
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 