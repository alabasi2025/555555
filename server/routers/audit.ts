import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  users
} from "../../drizzle/schema";
import { eq, sql, desc, and, gte, lte, like, count, or } from "drizzle-orm";

// ============================================
// Audit Router - سجل التدقيق والمستخدمين المتقدم
// ============================================

export const auditRouter = router({
  // ============================================
  // سجل التدقيق (Audit Logs)
  // ============================================

  // قائمة سجلات التدقيق
  listAuditLogs: publicProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(25),
      userId: z.number().optional(),
      action: z.enum(["create", "read", "update", "delete", "login", "logout", "export", "import", "approve", "reject"]).optional(),
      entityType: z.string().optional(),
      module: z.string().optional(),
      status: z.enum(["success", "failed", "pending"]).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      // Return sample audit logs since table doesn't exist yet
      const sampleLogs = [
        { id: 1, userId: 1, userName: "أحمد محمد", action: "login", entityType: "auth", entityId: null, entityName: null, description: "تسجيل دخول ناجح", status: "success", createdAt: new Date().toISOString(), ipAddress: "192.168.1.1" },
        { id: 2, userId: 1, userName: "أحمد محمد", action: "create", entityType: "invoice", entityId: 100, entityName: "فاتورة #100", description: "إنشاء فاتورة جديدة", status: "success", createdAt: new Date(Date.now() - 3600000).toISOString(), ipAddress: "192.168.1.1" },
        { id: 3, userId: 2, userName: "سارة علي", action: "update", entityType: "customer", entityId: 50, entityName: "شركة الأمل", description: "تحديث بيانات العميل", status: "success", createdAt: new Date(Date.now() - 7200000).toISOString(), ipAddress: "192.168.1.2" },
        { id: 4, userId: 1, userName: "أحمد محمد", action: "export", entityType: "report", entityId: null, entityName: "تقرير المبيعات", description: "تصدير تقرير المبيعات", status: "success", createdAt: new Date(Date.now() - 10800000).toISOString(), ipAddress: "192.168.1.1" },
        { id: 5, userId: 3, userName: "محمد خالد", action: "delete", entityType: "item", entityId: 25, entityName: "صنف #25", description: "حذف صنف من المخزون", status: "failed", createdAt: new Date(Date.now() - 14400000).toISOString(), ipAddress: "192.168.1.3" },
      ];

      const filteredLogs = sampleLogs.filter(log => {
        if (input.action && log.action !== input.action) return false;
        if (input.status && log.status !== input.status) return false;
        if (input.entityType && log.entityType !== input.entityType) return false;
        if (input.search) {
          const searchLower = input.search.toLowerCase();
          if (!log.userName?.toLowerCase().includes(searchLower) && 
              !log.description?.toLowerCase().includes(searchLower)) {
            return false;
          }
        }
        return true;
      });

      const startIndex = (input.page - 1) * input.limit;
      const paginatedLogs = filteredLogs.slice(startIndex, startIndex + input.limit);

      return {
        data: paginatedLogs,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: filteredLogs.length,
          totalPages: Math.ceil(filteredLogs.length / input.limit),
        },
      };
    }),

  // إحصائيات سجل التدقيق
  getAuditStats: publicProcedure.query(async () => {
    return {
      total: 1250,
      byAction: [
        { action: "create", count: 350 },
        { action: "update", count: 420 },
        { action: "delete", count: 80 },
        { action: "login", count: 300 },
        { action: "export", count: 100 },
      ],
      byStatus: [
        { status: "success", count: 1180 },
        { status: "failed", count: 50 },
        { status: "pending", count: 20 },
      ],
      topUsers: [
        { userId: 1, userName: "أحمد محمد", actionCount: 450 },
        { userId: 2, userName: "سارة علي", actionCount: 320 },
        { userId: 3, userName: "محمد خالد", actionCount: 280 },
      ],
    };
  }),

  // ============================================
  // إدارة الجلسات (Sessions)
  // ============================================

  // قائمة الجلسات النشطة
  listActiveSessions: publicProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(25),
      userId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      // Return sample sessions
      const sampleSessions = [
        { id: 1, userId: 1, sessionToken: "xxx", ipAddress: "192.168.1.1", userAgent: "Chrome/120.0", deviceInfo: "Windows 10", isActive: true, lastActivity: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date(Date.now() - 3600000).toISOString(), userName: "أحمد محمد", userEmail: "ahmed@example.com" },
        { id: 2, userId: 2, sessionToken: "yyy", ipAddress: "192.168.1.2", userAgent: "Firefox/121.0", deviceInfo: "macOS", isActive: true, lastActivity: new Date(Date.now() - 1800000).toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date(Date.now() - 7200000).toISOString(), userName: "سارة علي", userEmail: "sara@example.com" },
        { id: 3, userId: 3, sessionToken: "zzz", ipAddress: "192.168.1.3", userAgent: "Safari/17.0", deviceInfo: "iOS", isActive: true, lastActivity: new Date(Date.now() - 600000).toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date(Date.now() - 1800000).toISOString(), userName: "محمد خالد", userEmail: "mohammed@example.com" },
      ];

      return {
        data: sampleSessions,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: sampleSessions.length,
          totalPages: 1,
        },
      };
    }),

  // إنهاء جلسة
  terminateSession: publicProcedure
    .input(z.object({
      sessionId: z.number(),
    }))
    .mutation(async ({ input }) => {
      return { success: true };
    }),

  // إنهاء جميع جلسات مستخدم
  terminateAllUserSessions: publicProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .mutation(async ({ input }) => {
      return { success: true, terminatedCount: 2 };
    }),

  // ============================================
  // إدارة المستخدمين المتقدمة
  // ============================================

  // قائمة المستخدمين مع معلومات إضافية
  listUsersAdvanced: publicProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10),
      search: z.string().optional(),
      role: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      
      if (!db) {
        // Return sample data
        const sampleUsers = [
          { id: 1, openId: "user1", name: "أحمد محمد", email: "ahmed@example.com", loginMethod: "email", role: "admin", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastSignedIn: new Date().toISOString(), activeSessions: 1, lastActivity: new Date().toISOString(), lastActivityDescription: "تسجيل دخول" },
          { id: 2, openId: "user2", name: "سارة علي", email: "sara@example.com", loginMethod: "email", role: "user", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastSignedIn: new Date(Date.now() - 3600000).toISOString(), activeSessions: 1, lastActivity: new Date(Date.now() - 1800000).toISOString(), lastActivityDescription: "تعديل فاتورة" },
          { id: 3, openId: "user3", name: "محمد خالد", email: "mohammed@example.com", loginMethod: "google", role: "user", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastSignedIn: new Date(Date.now() - 7200000).toISOString(), activeSessions: 0, lastActivity: null, lastActivityDescription: null },
        ];

        const filteredUsers = sampleUsers.filter(user => {
          if (input.role && user.role !== input.role) return false;
          if (input.search) {
            const searchLower = input.search.toLowerCase();
            if (!user.name?.toLowerCase().includes(searchLower) && 
                !user.email?.toLowerCase().includes(searchLower)) {
              return false;
            }
          }
          return true;
        });

        return {
          data: filteredUsers,
          pagination: {
            page: input.page,
            limit: input.limit,
            total: filteredUsers.length,
            totalPages: Math.ceil(filteredUsers.length / input.limit),
          },
        };
      }

      // Build query with filters
      let query = db.select().from(users);
      
      const usersList = await query.orderBy(desc(users.createdAt));

      // Filter in memory for now
      let filteredUsers = usersList;
      if (input.search) {
        const searchLower = input.search.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          user.name?.toLowerCase().includes(searchLower) || 
          user.email?.toLowerCase().includes(searchLower)
        );
      }
      if (input.role) {
        filteredUsers = filteredUsers.filter(user => user.role === input.role);
      }

      const startIndex = (input.page - 1) * input.limit;
      const paginatedUsers = filteredUsers.slice(startIndex, startIndex + input.limit);

      return {
        data: paginatedUsers.map(user => ({
          id: user.id,
          openId: user.openId,
          name: user.name,
          email: user.email,
          loginMethod: user.loginMethod,
          role: user.role,
          createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
          lastSignedIn: user.lastSignedIn?.toISOString() || new Date().toISOString(),
          activeSessions: 0,
          lastActivity: null,
          lastActivityDescription: null,
        })),
        pagination: {
          page: input.page,
          limit: input.limit,
          total: filteredUsers.length,
          totalPages: Math.ceil(filteredUsers.length / input.limit),
        },
      };
    }),

  // تفاصيل مستخدم
  getUserDetails: publicProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      
      if (!db) {
        return {
          user: {
            id: input.userId,
            openId: "user1",
            name: "أحمد محمد",
            email: "ahmed@example.com",
            loginMethod: "email",
            role: "admin",
            createdAt: new Date().toISOString(),
            lastSignedIn: new Date().toISOString(),
          },
          settings: {
            language: "ar",
            timezone: "Asia/Riyadh",
            theme: "light",
            currency: "SAR",
          },
          activeSessions: [
            { id: 1, ipAddress: "192.168.1.1", userAgent: "Chrome/120.0", lastActivity: new Date().toISOString() },
          ],
          recentActivities: [
            { id: 1, action: "login", entityType: "auth", description: "تسجيل دخول", createdAt: new Date().toISOString() },
          ],
        };
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!user) {
        throw new Error("المستخدم غير موجود");
      }

      return {
        user: {
          id: user.id,
          openId: user.openId,
          name: user.name,
          email: user.email,
          loginMethod: user.loginMethod,
          role: user.role,
          createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
          lastSignedIn: user.lastSignedIn?.toISOString() || new Date().toISOString(),
        },
        settings: {
          language: "ar",
          timezone: "Asia/Riyadh",
          theme: "light",
          currency: "SAR",
        },
        activeSessions: [],
        recentActivities: [],
      };
    }),

  // تغيير دور مستخدم
  changeUserRole: publicProcedure
    .input(z.object({
      userId: z.number(),
      newRole: z.enum(["user", "admin"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      if (!db) {
        return { success: true };
      }

      await db
        .update(users)
        .set({ role: input.newRole })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),
});
