"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider 
      // Force refresh the session every 5 minutes
      refetchInterval={5 * 60}
      // Re-fetch session when window focuses
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
} 