/**
 * نظام المصادقة المحلي - Local Authentication System (PostgreSQL)
 * يوفر مصادقة آمنة باستخدام JWT و bcrypt
 */

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import type { Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { localUsers } from "../../drizzle/schema-pg";

// ==================== التكوين ====================
const JWT_SECRET = process.env.JWT_SECRET || "local-dev-secret-key-12345";
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";
const SALT_ROUNDS = 12;

// ==================== الأنواع ====================
export interface LocalUser {
  id: number;
  username: string;
  email: string | null;
  name: string | null;
  role: "user" | "admin" | "developer";
  isActive: boolean;
  lastLogin: Date | null;
}

export interface TokenPayload {
  userId: number;
  username: string;
  role: string;
  type: "access" | "refresh";
}

export interface AuthResult {
  success: boolean;
  user?: LocalUser;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

// ==================== اتصال قاعدة البيانات ====================
let _pool: Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 10,
      });
      _db = drizzle(_pool);
    } catch (error) {
      console.warn("[LocalAuth] Failed to connect to database:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== دوال التشفير ====================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ==================== دوال JWT ====================

function getSecretKey() {
  return new TextEncoder().encode(JWT_SECRET);
}

export async function createAccessToken(payload: Omit<TokenPayload, "type">): Promise<string> {
  const secretKey = getSecretKey();
  return new SignJWT({ ...payload, type: "access" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(secretKey);
}

export async function createRefreshToken(payload: Omit<TokenPayload, "type">): Promise<string> {
  const secretKey = getSecretKey();
  return new SignJWT({ ...payload, type: "refresh" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function createSessionToken(user: LocalUser): Promise<string> {
  const secretKey = getSecretKey();
  const expiresInMs = ONE_YEAR_MS;
  const expirationSeconds = Math.floor((Date.now() + expiresInMs) / 1000);
  
  return new SignJWT({
    openId: `local-${user.id}`,
    appId: "local-auth",
    name: user.name || user.username,
    userId: user.id,
    username: user.username,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<{
  openId: string;
  appId: string;
  name: string;
  userId: number;
  username: string;
  role: string;
} | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });
    
    const { openId, appId, name, userId, username, role } = payload as Record<string, unknown>;
    
    if (!openId || !appId || !name) {
      return null;
    }
    
    return {
      openId: openId as string,
      appId: appId as string,
      name: name as string,
      userId: (userId as number) || 0,
      username: (username as string) || "",
      role: (role as string) || "user",
    };
  } catch (error) {
    return null;
  }
}

// ==================== دوال قاعدة البيانات ====================

export async function findUserByUsername(username: string): Promise<any | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db
      .select()
      .from(localUsers)
      .where(eq(localUsers.username, username))
      .limit(1);
    
    return result.length > 0 && result[0].isActive ? result[0] : null;
  } catch (error) {
    console.error("[LocalAuth] Error finding user:", error);
    return null;
  }
}

export async function findUserByEmail(email: string): Promise<any | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db
      .select()
      .from(localUsers)
      .where(eq(localUsers.email, email))
      .limit(1);
    
    return result.length > 0 && result[0].isActive ? result[0] : null;
  } catch (error) {
    console.error("[LocalAuth] Error finding user by email:", error);
    return null;
  }
}

export async function findUserById(id: number): Promise<any | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db
      .select()
      .from(localUsers)
      .where(eq(localUsers.id, id))
      .limit(1);
    
    return result.length > 0 && result[0].isActive ? result[0] : null;
  } catch (error) {
    console.error("[LocalAuth] Error finding user by id:", error);
    return null;
  }
}

export async function createUser(data: {
  username: string;
  email?: string;
  password: string;
  name?: string;
  role?: "user" | "admin" | "developer";
}): Promise<{ success: boolean; userId?: number; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };
  
  try {
    const existingUser = await findUserByUsername(data.username);
    if (existingUser) {
      return { success: false, error: "اسم المستخدم موجود بالفعل" };
    }
    
    if (data.email) {
      const existingEmail = await findUserByEmail(data.email);
      if (existingEmail) {
        return { success: false, error: "البريد الإلكتروني مستخدم بالفعل" };
      }
    }
    
    const passwordHash = await hashPassword(data.password);
    
    const result = await db.insert(localUsers).values({
      username: data.username,
      email: data.email || null,
      passwordHash: passwordHash,
      name: data.name || null,
      role: data.role || "user",
      isActive: true,
    }).returning({ id: localUsers.id });
    
    return { success: true, userId: result[0].id };
  } catch (error) {
    console.error("[LocalAuth] Error creating user:", error);
    return { success: false, error: "فشل في إنشاء المستخدم" };
  }
}

export async function updateLastLogin(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db
      .update(localUsers)
      .set({ lastLogin: new Date(), updatedAt: new Date() })
      .where(eq(localUsers.id, userId));
  } catch (error) {
    console.error("[LocalAuth] Error updating last login:", error);
  }
}

export async function updatePassword(userId: number, newPassword: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  try {
    const passwordHash = await hashPassword(newPassword);
    await db
      .update(localUsers)
      .set({ passwordHash: passwordHash, updatedAt: new Date() })
      .where(eq(localUsers.id, userId));
    return true;
  } catch (error) {
    console.error("[LocalAuth] Error updating password:", error);
    return false;
  }
}

// ==================== دوال المصادقة الرئيسية ====================

export async function login(username: string, password: string): Promise<AuthResult> {
  try {
    const user = await findUserByUsername(username);
    if (!user) {
      return { success: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
    }
    
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
    }
    
    await updateLastLogin(user.id);
    
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };
    
    const accessToken = await createAccessToken(tokenPayload);
    const refreshToken = await createRefreshToken(tokenPayload);
    
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
      },
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error("[LocalAuth] Login error:", error);
    return { success: false, error: "حدث خطأ أثناء تسجيل الدخول" };
  }
}

export async function authenticateRequest(req: Request): Promise<LocalUser | null> {
  try {
    const cookieHeader = req.headers.cookie;
    let token: string | undefined;
    
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      token = cookies[COOKIE_NAME];
    }
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return null;
    }
    
    const payload = await verifySessionToken(token);
    if (!payload) {
      return null;
    }
    
    const user = await findUserById(payload.userId);
    if (!user) {
      return null;
    }
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
    };
  } catch (error) {
    console.error("[LocalAuth] Authentication error:", error);
    return null;
  }
}

export async function setLoginCookie(res: Response, req: Request, user: LocalUser, rememberMe: boolean = false): Promise<void> {
  const sessionToken = await createSessionToken(user);
  const cookieOptions = getSessionCookieOptions(req);
  
  if (rememberMe) {
    cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  }
  
  res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
}

export async function ensureDefaultAdmin(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    const existingAdmin = await findUserByUsername("admin");
    if (!existingAdmin) {
      await createUser({
        username: "admin",
        email: "admin@powerstation.local",
        password: "admin123",
        name: "مدير النظام",
        role: "admin",
      });
      console.log("[LocalAuth] Default admin user created");
    }
  } catch (error) {
    console.error("[LocalAuth] Error ensuring default admin:", error);
  }
}

const localAuth = {
  login,
  createUser,
  findUserByUsername,
  findUserByEmail,
  findUserById,
  updateLastLogin,
  updatePassword,
  authenticateRequest,
  setLoginCookie,
  ensureDefaultAdmin,
  hashPassword,
  verifyPassword,
  createAccessToken,
  createRefreshToken,
  verifyToken,
  createSessionToken,
  verifySessionToken,
};

export default localAuth;
