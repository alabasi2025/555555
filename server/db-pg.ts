import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users, localUsers, InsertUser } from "../drizzle/schema-pg";
import { ENV } from './_core/env';

let _pool: Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

/**
 * الحصول على Pool الاتصال بـ PostgreSQL
 */
export function getPool(): Pool | null {
  if (!_pool && process.env.DATABASE_URL) {
    try {
      _pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
      
      _pool.on('error', (err) => {
        console.error('[Database] Unexpected error on idle client', err);
      });
    } catch (error) {
      console.warn("[Database] Failed to create pool:", error);
      _pool = null;
    }
  }
  return _pool;
}

/**
 * الحصول على Drizzle instance
 */
export async function getDb() {
  if (!_db) {
    const pool = getPool();
    if (pool) {
      _db = drizzle(pool);
    }
  }
  return _db;
}

/**
 * إغلاق الاتصال بقاعدة البيانات
 */
export async function closeDb() {
  if (_pool) {
    await _pool.end();
    _pool = null;
    _db = null;
  }
}

/**
 * إدراج أو تحديث مستخدم
 */
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.openId, user.openId))
      .limit(1);
    
    if (existingUser.length > 0) {
      // تحديث المستخدم الموجود
      await db
        .update(users)
        .set({
          name: user.name ?? existingUser[0].name,
          email: user.email ?? existingUser[0].email,
          loginMethod: user.loginMethod ?? existingUser[0].loginMethod,
          role: user.role ?? existingUser[0].role,
          lastSignedIn: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.openId, user.openId));
    } else {
      // إدراج مستخدم جديد
      const role = user.openId === ENV.ownerOpenId ? 'admin' : (user.role || 'user');
      await db.insert(users).values({
        openId: user.openId,
        name: user.name,
        email: user.email,
        loginMethod: user.loginMethod,
        role: role as "user" | "admin" | "developer",
        lastSignedIn: new Date(),
      });
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

/**
 * الحصول على مستخدم بواسطة OpenId
 */
export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }
  
  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

/**
 * الحصول على مستخدم محلي بواسطة اسم المستخدم
 */
export async function getLocalUserByUsername(username: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get local user: database not available");
    return undefined;
  }
  
  const result = await db
    .select()
    .from(localUsers)
    .where(eq(localUsers.username, username))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

/**
 * الحصول على مستخدم محلي بواسطة المعرف
 */
export async function getLocalUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get local user: database not available");
    return undefined;
  }
  
  const result = await db
    .select()
    .from(localUsers)
    .where(eq(localUsers.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}
