"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn("border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-6", className)}>
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <p className="text-sm text-center text-muted-foreground">
          &copy; 2025 <a href="https://richadali.dev" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Richad Yamin Ali</a>. All rights reserved.
        </p>
      </div>
    </footer>
  );
} 