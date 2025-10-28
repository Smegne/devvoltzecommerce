import bcrypt from 'bcryptjs';
import jwt, { Secret } from 'jsonwebtoken';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  email_verified: boolean;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Compare password
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(user: User): string {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Extract user from request (for API routes)
export async function getAuthUser(token: string): Promise<User | null> {
  try {
    const decoded = verifyToken(token) as any;
    const pool = await import('./db').then(mod => mod.default);
    
    const [users] = await pool.execute(
      'SELECT id, name, email, role, email_verified, created_at FROM users WHERE id = ?',
      [decoded.userId]
    );
    
    const user = (users as any[])[0];
    return user || null;
  } catch (error) {
    return null;
  }
}