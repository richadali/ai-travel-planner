"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Plane } from "lucide-react";
import { UserProfile } from "@/components/user-profile";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Check if logo exists
  useEffect(() => {
    const img = new globalThis.Image();
    img.src = "/logo.png";
    img.onload = () => setLogoLoaded(true);
    img.onerror = () => setLogoLoaded(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className={cn("sticky top-0 z-40 w-full p-2", className)}>
      <div
        className={cn(
          "container mx-auto flex h-14 max-w-7xl items-center justify-between rounded-lg border  px-2 backdrop-blur-sm transition-all duration-300 md:px-3",
          scrolled ? "border-border/50 shadow-lg dark:shadow-lg dark:shadow-slate-500/10" : "border-transparent shadow-none"
        )}
      >
        <Link href="/" className="flex items-center">
          <div className="flex flex-row items-center space-x-2">
            {logoLoaded ? (
              <div className="relative h-10 w-10 overflow-hidden rounded-md">
                <Image 
                  src="/logo.png" 
                  alt="AI Travel Planner Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
            ) : (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5 rounded-md">
              <Plane className="h-7 w-7 text-white" />
            </div>
            )}
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 -mt-1">
                AI Travel Planner
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 ">
                Developed by Richad Ali
              </span>
            </div>
          </div>
        </Link>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <UserProfile />
        </div>
      </div>
    </header>
  );
} 