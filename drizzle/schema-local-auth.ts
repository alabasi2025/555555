/**
 * Schema للمصادقة المحلية - Local Authentication Schema
 * جداول إدارة المستخدمين والجلسات والصلاحيات
 */

import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, datetime } from "drizzle-orm/mysql-core";

// ==================== جدول المستخدمين المحليين ====================
export const localUsers = mysqlTable("local_users", {
  id: int("id").autoincrement().primaryKey(),
  
  // بيانات تسجيل الدخول
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 320 }).unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  
  // بيانات المستخدم
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  avatar: text("avatar"),
  
  // الدور والصلاحيات
  role: mysqlEnum("role", ["user", "admin", "developer"]).default("user").notNull(),
  
  // حالة الحساب
  isActive: boolean("is_active").default(true).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  
  // أمان الحساب
  failedLoginAttempts: int("failed_login_attempts").default(0).notNull(),
  lockedUntil: datetime("locked_until"),
  passwordChangedAt: datetime("password_changed_at"),
  mustChangePassword: boolean("must_change_password").default(false).notNull(),
  
  // التتبع
  lastLogin: datetime("last_login"),
  lastLoginIp: varchar("last_login_ip", { length: 45 }),
  lastLoginUserAgent: text("last_login_user_agent"),
  
  // الطوابع الزمنية
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ==================== جدول الجلسات ====================
export const userSessions = mysqlTable("user_sessions", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("user_id").notNull(),
  
  // بيانات الجلسة
  sessionToken: varchar("session_token", { length: 500 }).notNull().unique(),
  refreshToken: varchar("refresh_token", { length: 500 }),
  
  // معلومات الجهاز
  deviceId: varchar("device_id", { length: 100 }),
  deviceName: varchar("device_name", { length: 255 }),
  deviceType: mysqlEnum("device_type", ["desktop", "mobile", "tablet", "unknown"]).default("unknown"),
  browser: varchar("browser", { length: 100 }),
  os: varchar("os", { length: 100 }),
  
  // معلومات الاتصال
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  
  // حالة الجلسة
  isActive: boolean("is_active").default(true).notNull(),
  
  // الصلاحية
  expiresAt: datetime("expires_at").notNull(),
  lastActivityAt: datetime("last_activity_at"),
  
  // الطوابع الزمنية
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== جدول سجل تسجيل الدخول ====================
export const loginLogs = mysqlTable("login_logs", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("user_id"),
  username: varchar("username", { length: 50 }).notNull(),
  
  // نتيجة المحاولة
  success: boolean("success").notNull(),
  failureReason: varchar("failure_reason", { length: 255 }),
  
  // معلومات الاتصال
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  
  // الموقع الجغرافي (اختياري)
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  
  // الطابع الزمني
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== جدول رموز إعادة تعيين كلمة المرور ====================
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("user_id").notNull(),
  
  // الرمز
  token: varchar("token", { length: 100 }).notNull().unique(),
  
  // الصلاحية
  expiresAt: datetime("expires_at").notNull(),
  usedAt: datetime("used_at"),
  
  // الطوابع الزمنية
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== جدول رموز التحقق من البريد ====================
export const emailVerificationTokens = mysqlTable("email_verification_tokens", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("user_id").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  
  // الرمز
  token: varchar("token", { length: 100 }).notNull().unique(),
  
  // الصلاحية
  expiresAt: datetime("expires_at").notNull(),
  verifiedAt: datetime("verified_at"),
  
  // الطوابع الزمنية
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== جدول الأجهزة الموثوقة ====================
export const trustedDevices = mysqlTable("trusted_devices", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("user_id").notNull(),
  
  // معرف الجهاز
  deviceId: varchar("device_id", { length: 100 }).notNull(),
  deviceFingerprint: varchar("device_fingerprint", { length: 255 }),
  
  // معلومات الجهاز
  deviceName: varchar("device_name", { length: 255 }),
  deviceType: mysqlEnum("device_type", ["desktop", "mobile", "tablet", "unknown"]).default("unknown"),
  browser: varchar("browser", { length: 100 }),
  os: varchar("os", { length: 100 }),
  
  // حالة الثقة
  isTrusted: boolean("is_trusted").default(true).notNull(),
  trustExpiresAt: datetime("trust_expires_at"),
  
  // آخر استخدام
  lastUsedAt: datetime("last_used_at"),
  lastIpAddress: varchar("last_ip_address", { length: 45 }),
  
  // الطوابع الزمنية
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ==================== الأنواع ====================
export type LocalUser = typeof localUsers.$inferSelect;
export type InsertLocalUser = typeof localUsers.$inferInsert;

export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = typeof userSessions.$inferInsert;

export type LoginLog = typeof loginLogs.$inferSelect;
export type InsertLoginLog = typeof loginLogs.$inferInsert;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type InsertEmailVerificationToken = typeof emailVerificationTokens.$inferInsert;

export type TrustedDevice = typeof trustedDevices.$inferSelect;
export type InsertTrustedDevice = typeof trustedDevices.$inferInsert;
