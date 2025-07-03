import { cookies } from 'next/headers';
import { prisma } from './prisma';
import * as bcrypt from 'bcryptjs';

// Session token would be stored securely in a database in a real application
const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export class AuthService {
  /**
   * Authenticate admin user
   */
  static async login(email: string, password: string): Promise<boolean> {
    try {
      // Find admin by email
      const admin = await prisma.admin.findUnique({
        where: { email },
      });

      // If admin not found, authentication fails
      if (!admin) {
        return false;
      }

      // Compare password with stored hash
      const passwordMatch = await bcrypt.compare(password, admin.passwordHash);

      if (passwordMatch) {
        // Update last login time
        await prisma.admin.update({
          where: { id: admin.id },
          data: { lastLoginAt: new Date() },
        });
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }

  /**
   * Create a session for authenticated admin
   */
  static createSession(): string {
    // In a real app, use a proper session management system
    // This is a simplified version for demonstration
    const sessionToken = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    return sessionToken;
  }

  /**
   * Verify if the session is valid
   */
  static async verifySession(sessionToken: string): Promise<boolean> {
    // In a real app, validate against a database of sessions
    // For this demo, we'll just check if it starts with 'admin_'
    return Boolean(sessionToken && sessionToken.startsWith('admin_'));
  }

  /**
   * Set session cookie
   */
  static setSessionCookie(sessionToken: string): void {
    // This would be handled by a server action in a real application
    document.cookie = `${SESSION_COOKIE_NAME}=${sessionToken}; path=/; max-age=${SESSION_EXPIRY / 1000}; SameSite=Strict`;
  }

  /**
   * Clear session cookie for logout
   */
  static clearSessionCookie(): void {
    document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Strict`;
  }
}

// Server-side functions for Next.js API routes and middleware
export async function getSessionToken(req: Request): Promise<string | null> {
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith(`${SESSION_COOKIE_NAME}=`));
  
  if (!sessionCookie) return null;
  return sessionCookie.split('=')[1];
}

export async function isAuthenticated(req: Request): Promise<boolean> {
  const sessionToken = await getSessionToken(req);
  if (!sessionToken) return false;
  
  return AuthService.verifySession(sessionToken);
} 