import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import { cookies } from "next/headers";
import { JWT } from "next-auth/jwt";

// Extend the JWT type to include custom properties
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    provider?: string;
  }
}

// Extend the Session User type to include id
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // If the URL is already absolute, just return it
      if (url.startsWith("http")) {
        return url;
      }
      
      // If it's a relative URL, append it to the base URL
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      
      // Default to the base URL
      return baseUrl;
    },
    async session({ session, token, user }) {
      // Add user ID to session
      if (session.user) {
        if (token?.sub) {
          session.user.id = token.sub;
        } else if (token?.id) {
          session.user.id = token.id as string;
        } else if (user?.id) {
          session.user.id = user.id as string;
        }
      }
      
      return session;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        token.id = user.id;
        token.provider = account.provider;
      }
      
      return token;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: false,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// Helper function to get the current session on the server
export async function getServerSession() {
  return await auth();
}

// Helper function to check if a user is authenticated on the server
export async function isAuthenticated() {
  const session = await getServerSession();
  return !!session?.user;
}

// Helper function to get the current user ID on the server
export async function getCurrentUserId() {
  const session = await getServerSession();
  return session?.user?.id;
}

// Client-side authentication helpers
export const AuthService = {
  // For admin authentication (keeping this for backward compatibility)
  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      return response.ok;
    } catch (error) {
      console.error("Authentication error:", error);
      return false;
    }
  },

  // Set session cookie for admin (keeping this for backward compatibility)
  setSessionCookie(sessionToken: string): void {
    document.cookie = `admin_session=${sessionToken}; path=/; max-age=${24 * 60 * 60}; SameSite=Strict`;
  },

  // Clear session cookie for admin (keeping this for backward compatibility)
  clearSessionCookie(): void {
    document.cookie = `admin_session=; path=/; max-age=0; SameSite=Strict`;
  },
};

// Server-side function for admin authentication (keeping this for backward compatibility)
export async function getSessionToken(req: Request): Promise<string | null> {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(";").map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith("admin_session="));
  
  if (!sessionCookie) return null;
  return sessionCookie.split("=")[1];
}

// Server-side function to check admin authentication (keeping this for backward compatibility)
export async function isAdminAuthenticated(req: Request): Promise<boolean> {
  const sessionToken = await getSessionToken(req);
  if (!sessionToken) return false;
  
  // In a real app, validate against a database of sessions
  return sessionToken.startsWith("admin_");
} 