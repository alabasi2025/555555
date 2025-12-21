/**
 * نظام المصادقة المحلي - Local Authentication System
 * يوفر مصادقة آمنة باستخدام JWT و bcrypt
 */

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import type { Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";

// ==================== التكوين ====================
const JWT_SECRET = process.env.JWT_SECRET || "local-dev-secret-key-12345";
const ACCESS_TOKEN_EXPIRY = "15m"; // 15 دقيقة
const REFRESH_TOKEN_EXPIRY = "7d"; // 7 أيام
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

// ==================== دوال التشفير ====================

/**
 * تشفير كلمة المرور باستخدام bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * التحقق من كلمة المرور
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ==================== دوال JWT ====================

function getSecretKey() {
  return new TextEncoder().encode(JWT_SECRET);
}

/**
 * إنشاء Access Token
 */
export async function createAccessToken(payload: Omit<TokenPayload, "type">): Promise<string> {
  const secretKey = getSecretKey();
  return new SignJWT({ ...payload, type: "access" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(secretKey);
}

/**
 * إنشاء Refresh Token
 */
export async function createRefreshToken(payload: Omit<TokenPayload, "type">): Promise<string> {
  const secretKey = getSecretKey();
  return new SignJWT({ ...payload, type: "refresh" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(secretKey);
}

/**
 * التحقق من صحة Token
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as TokenPayload;
  } catch (error) {
    console.warn("[LocalAuth] Token verification failed:", error);
    return null;
  }
}

/**
 * إنشاء Session Token للتوافق مع النظام الحالي
 */
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

/**
 * التحقق من Session Token
 */
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
    console.warn("[LocalAuth] Session verification failed:", error);
    return null;
  }
}

// ==================== دوال قاعدة البيانات ====================

let _db: ReturnType<typeof drizzle> | null = null;

async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[LocalAuth] Failed to connect to database:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * البحث عن مستخدم بواسطة اسم المستخدم
 */
export async function findUserByUsername(username: string): Promise<any | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.execute(
      sql`SELECT * FROM local_users WHERE username = ${username} AND is_active = 1 LIMIT 1`
    );
    const rows = result[0] as any[];
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("[LocalAuth] Error finding user:", error);
    return null;
  }
}

/**
 * البحث عن مستخدم بواسطة البريد الإلكتروني
 */
export async function findUserByEmail(email: string): Promise<any | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.execute(
      sql`SELECT * FROM local_users WHERE email = ${email} AND is_active = 1 LIMIT 1`
    );
    const rows = result[0] as any[];
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("[LocalAuth] Error finding user by email:", error);
    return null;
  }
}

/**
 * البحث عن مستخدم بواسطة المعرف
 */
export async function findUserById(id: number): Promise<any | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.execute(
      sql`SELECT * FROM local_users WHERE id = ${id} AND is_active = 1 LIMIT 1`
    );
    const rows = result[0] as any[];
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("[LocalAuth] Error finding user by id:", error);
    return null;
  }
}

/**
 * إنشاء مستخدم جديد
 */
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
    // التحقق من عدم وجود المستخدم
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
    
    // تشفير كلمة المرور
    const passwordHash = await hashPassword(data.password);
    
    // إدراج المستخدم
    const emailValue = data.email || null;
    const nameValue = data.name || null;
    const roleValue = data.role || "user";
    const result = await db.execute(
      sql`INSERT INTO local_users (username, email, password_hash, name, role, is_active, created_at, updated_at)
       VALUES (${data.username}, ${emailValue}, ${passwordHash}, ${nameValue}, ${roleValue}, 1, NOW(), NOW())`
    );
    
    const insertResult = result[0] as any;
    return { success: true, userId: insertResult.insertId };
  } catch (error) {
    console.error("[LocalAuth] Error creating user:", error);
    return { success: false, error: "فشل في إنشاء المستخدم" };
  }
}

/**
 * تحديث آخر تسجيل دخول
 */
export async function updateLastLogin(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.execute(
      sql`UPDATE local_users SET last_login = NOW(), updated_at = NOW() WHERE id = ${userId}`
    );
  } catch (error) {
    console.error("[LocalAuth] Error updating last login:", error);
  }
}

/**
 * تحديث كلمة المرور
 */
export async function updatePassword(userId: number, newPassword: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  try {
    const passwordHash = await hashPassword(newPassword);
    await db.execute(
      sql`UPDATE local_users SET password_hash = ${passwordHash}, updated_at = NOW() WHERE id = ${userId}`
    );
    return true;
  } catch (error) {
    console.error("[LocalAuth] Error updating password:", error);
    return false;
  }
}

// ==================== دوال المصادقة الرئيسية ====================

/**
 * تسجيل الدخول
 */
export async function login(username: string, password: string): Promise<AuthResult> {
  try {
    // البحث عن المستخدم
    const user = await findUserByUsername(username);
    if (!user) {
      return { success: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
    }
    
    // التحقق من كلمة المرور
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return { success: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
    }
    
    // تحديث آخر تسجيل دخول
    await updateLastLogin(user.id);
    
    // إنشاء التوكنات
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };
    
    const accessToken = await createAccessToken(tokenPayload);
    const refreshToken = await createRefreshToken(tokenPayload);
    const sessionToken = await createSessionToken({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.is_active,
      lastLogin: user.last_login,
    });
    
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.is_active,
        lastLogin: user.last_login,
      },
      accessToken: sessionToken, // نستخدم session token للتوافق
      refreshToken,
    };
  } catch (error) {
    console.error("[LocalAuth] Login error:", error);
    return { success: false, error: "حدث خطأ أثناء تسجيل الدخول" };
  }
}

/**
 * تجديد التوكن
 */
export async function refreshAccessToken(refreshToken: string): Promise<AuthResult> {
  try {
    const payload = await verifyToken(refreshToken);
    if (!payload || payload.type !== "refresh") {
      return { success: false, error: "Refresh token غير صالح" };
    }
    
    // البحث عن المستخدم
    const user = await findUserById(payload.userId);
    if (!user) {
      return { success: false, error: "المستخدم غير موجود" };
    }
    
    // إنشاء توكن جديد
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };
    
    const accessToken = await createAccessToken(tokenPayload);
    const sessionToken = await createSessionToken({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.is_active,
      lastLogin: user.last_login,
    });
    
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.is_active,
        lastLogin: user.last_login,
      },
      accessToken: sessionToken,
    };
  } catch (error) {
    console.error("[LocalAuth] Refresh token error:", error);
    return { success: false, error: "فشل في تجديد التوكن" };
  }
}

/**
 * التحقق من المستخدم الحالي من الـ Request
 */
export async function authenticateRequest(req: Request): Promise<LocalUser | null> {
  try {
    // استخراج التوكن من الكوكيز أو الهيدر
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
    
    // محاولة الحصول على التوكن من الهيدر
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return null;
    }
    
    // التحقق من التوكن
    const payload = await verifySessionToken(token);
    if (!payload) {
      return null;
    }
    
    // البحث عن المستخدم
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
      isActive: user.is_active,
      lastLogin: user.last_login,
    };
  } catch (error) {
    console.error("[LocalAuth] Authentication error:", error);
    return null;
  }
}

/**
 * إنشاء المستخدم الافتراضي (admin)
 */
export async function ensureDefaultAdmin(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    // التحقق من وجود مستخدم admin
    const adminUser = await findUserByUsername("admin");
    if (!adminUser) {
      console.log("[LocalAuth] Creating default admin user...");
      const result = await createUser({
        username: "admin",
        email: "admin@powerstation.local",
        password: "admin123", // يجب تغييرها في الإنتاج
        name: "مدير النظام",
        role: "admin",
      });
      
      if (result.success) {
        console.log("[LocalAuth] Default admin user created successfully");
      } else {
        console.error("[LocalAuth] Failed to create default admin:", result.error);
      }
    }
  } catch (error) {
    console.error("[LocalAuth] Error ensuring default admin:", error);
  }
}

export default {
  hashPassword,
  verifyPassword,
  createAccessToken,
  createRefreshToken,
  verifyToken,
  createSessionToken,
  verifySessionToken,
  findUserByUsername,
  findUserByEmail,
  findUserById,
  createUser,
  updateLastLogin,
  updatePassword,
  login,
  refreshAccessToken,
  authenticateRequest,
  ensureDefaultAdmin,
};
