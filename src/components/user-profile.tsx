"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogOut, User, BarChart2 } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export function UserProfile() {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleNavigation = async (path: string) => {
    setIsDropdownOpen(false);
    
    // If trying to access protected route but not authenticated
    if ((path === "/dashboard" || path.startsWith("/trips")) && status !== "authenticated") {
      // Use signIn instead of router.push to handle auth flow properly
      await signIn("google", { callbackUrl: path });
      return;
    }
    
    // Otherwise use direct navigation
    router.push(path);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Check if user is admin (has the specific email)
  const isAdmin = session?.user?.email === "richadyaminali@gmail.com";

  if (status === "loading") {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Button asChild variant="outline" size="sm">
        <Link href="/login">Sign In</Link>
      </Button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-1 focus:outline-none"
      >
        <div className="h-8 w-8 rounded-full overflow-hidden border border-gray-200">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || "User"}
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-blue-100 flex items-center justify-center">
              <User size={16} className="text-blue-600" />
            </div>
          )}
        </div>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-slate-700">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-700">
            <p className="text-sm font-medium">{session?.user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session?.user?.email}</p>
          </div>
          <button
            onClick={() => handleNavigation("/dashboard")}
            className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            Dashboard
          </button>
          {isAdmin && (
            <button
              onClick={() => handleNavigation("/admin")}
              className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center"
            >
              <BarChart2 size={16} className="mr-2" />
              Admin Dashboard
            </button>
          )}
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center"
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
} 