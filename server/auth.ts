import bcrypt from 'bcrypt';
import session from 'express-session';
// Removed PostgreSQL session store - using memory store for now
import type { Express, Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import type { User } from '@shared/schema';

// Extend Express session interface
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    user?: User;
    isAuthenticated?: boolean;
  }
}

export function setupSession(app: Express) {
  const sessionTtl = 24 * 60 * 60 * 1000; // 24 hours
  
  // For development, use memory store
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  }));
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  const user = await storage.getUserByUsername(username);
  if (!user || !user.isActive) {
    return null;
  }

  const isValidPassword = await verifyPassword(password, user.password);
  if (!isValidPassword) {
    return null;
  }

  // Update last login
  await storage.updateUserLastLogin(user.id);
  
  return user;
}

// Middleware to check if user is authenticated
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session?.isAuthenticated && req.session?.user) {
    return next();
  }
  
  return res.status(401).json({ 
    message: 'Authentication required',
    authenticated: false 
  });
}

// Middleware to get current user (optional authentication)
export function getCurrentUser(req: Request, res: Response, next: NextFunction) {
  if (req.session?.isAuthenticated && req.session?.user) {
    // User is authenticated, continue
    return next();
  }
  
  // No authentication required for this route, but user info won't be available
  return next();
}