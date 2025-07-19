import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

// Extend the JWT type to include custom properties
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    provider?: string;
    email?: string;
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
        // Ensure email is properly typed
        if (user.email) {
          token.email = user.email;
        }
      }
      
      return token;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
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
  },
  // Add trusted hosts configuration
  trustHost: true,
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

// Helper function to check if the current user is an admin
export async function isAdmin() {
  const session = await getServerSession();
  return session?.user?.email === "richadyaminali@gmail.com";
} 