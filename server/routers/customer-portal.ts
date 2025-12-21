import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  customerPortalUsers, 
  customerPortalSessions, 
  customerNotifications,
  customerFeedback,
  customers,
  invoices,
  payments,
  subscriptions,
  meters,
  tickets
} from "../../drizzle/schema-pg";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import crypto from "crypto";

// دالة تشفير كلمة المرور
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// دالة توليد token
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export const customerPortalRouter = router({
  // ============================================
  // المصادقة
  // ============================================

  // تسجيل مستخدم جديد
  register: publicProcedure
    .input(z.object({
      customerId: z.number(),
      username: z.string().min(4),
      password: z.string().min(6),
      email: z.string().email(),
      phone: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // التحقق من وجود العميل
      const customer = await db.select().from(customers).where(eq(customers.id, input.customerId));
      if (!customer[0]) {
        throw new Error("العميل غير موجود");
      }
      
      // التحقق من عدم وجود حساب سابق
      const existing = await db.select().from(customerPortalUsers).where(eq(customerPortalUsers.customerId, input.customerId));
      if (existing[0]) {
        throw new Error("يوجد حساب مسجل لهذا العميل بالفعل");
      }
      
      const verificationToken = generateToken();
      
      const result = await db.insert(customerPortalUsers).values({
        customerId: input.customerId,
        username: input.username,
        passwordHash: hashPassword(input.password),
        email: input.email,
        phone: input.phone,
        verificationToken,
        isActive: true,
        isVerified: false,
      });
      
      // إرسال إشعار ترحيبي
      await db.insert(customerNotifications).values({
        customerId: input.customerId,
        notificationType: "system",
        title: "مرحباً بك في بوابة العملاء",
        message: "تم إنشاء حسابك بنجاح. يرجى تأكيد بريدك الإلكتروني لتفعيل جميع الميزات.",
      });
      
      return { id: result[0].insertId, verificationToken, success: true };
    }),

  // تسجيل الدخول
  login: publicProcedure
    .input(z.object({
      username: z.string(),
      password: z.string(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const user = await db.select().from(customerPortalUsers).where(eq(customerPortalUsers.username, input.username));
      if (!user[0]) {
        throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة");
      }
      
      if (user[0].passwordHash !== hashPassword(input.password)) {
        throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة");
      }
      
      if (!user[0].isActive) {
        throw new Error("الحساب معطل");
      }
      
      // إنشاء جلسة جديدة
      const sessionToken = generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 أيام
      
      await db.insert(customerPortalSessions).values({
        portalUserId: user[0].id,
        sessionToken,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        expiresAt,
      });
      
      // تحديث آخر تسجيل دخول
      await db.update(customerPortalUsers).set({ lastLogin: new Date() }).where(eq(customerPortalUsers.id, user[0].id));
      
      return {
        sessionToken,
        userId: user[0].id,
        customerId: user[0].customerId,
        username: user[0].username,
        email: user[0].email,
        isVerified: user[0].isVerified,
        expiresAt,
      };
    }),

  // تسجيل الخروج
  logout: publicProcedure
    .input(z.object({ sessionToken: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(customerPortalSessions).where(eq(customerPortalSessions.sessionToken, input.sessionToken));
      return { success: true };
    }),

  // التحقق من الجلسة
  validateSession: publicProcedure
    .input(z.object({ sessionToken: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const session = await db.select().from(customerPortalSessions).where(eq(customerPortalSessions.sessionToken, input.sessionToken));
      if (!session[0]) {
        return { valid: false };
      }
      
      if (new Date(session[0].expiresAt) < new Date()) {
        await db.delete(customerPortalSessions).where(eq(customerPortalSessions.id, session[0].id));
        return { valid: false, reason: "expired" };
      }
      
      const user = await db.select().from(customerPortalUsers).where(eq(customerPortalUsers.id, session[0].portalUserId));
      if (!user[0] || !user[0].isActive) {
        return { valid: false, reason: "inactive" };
      }
      
      return {
        valid: true,
        userId: user[0].id,
        customerId: user[0].customerId,
        username: user[0].username,
      };
    }),

  // تغيير كلمة المرور
  changePassword: publicProcedure
    .input(z.object({
      userId: z.number(),
      currentPassword: z.string(),
      newPassword: z.string().min(6),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const user = await db.select().from(customerPortalUsers).where(eq(customerPortalUsers.id, input.userId));
      if (!user[0]) {
        throw new Error("المستخدم غير موجود");
      }
      
      if (user[0].passwordHash !== hashPassword(input.currentPassword)) {
        throw new Error("كلمة المرور الحالية غير صحيحة");
      }
      
      await db.update(customerPortalUsers).set({
        passwordHash: hashPassword(input.newPassword),
      }).where(eq(customerPortalUsers.id, input.userId));
      
      return { success: true };
    }),

  // طلب إعادة تعيين كلمة المرور
  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const user = await db.select().from(customerPortalUsers).where(eq(customerPortalUsers.email, input.email));
      if (!user[0]) {
        // لا نكشف عن وجود الحساب
        return { success: true, message: "إذا كان البريد الإلكتروني مسجلاً، سيتم إرسال رابط إعادة التعيين" };
      }
      
      const resetToken = generateToken();
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // ساعة واحدة
      
      await db.update(customerPortalUsers).set({
        resetToken,
        resetTokenExpiry,
      }).where(eq(customerPortalUsers.id, user[0].id));
      
      // TODO: إرسال البريد الإلكتروني
      
      return { success: true, message: "إذا كان البريد الإلكتروني مسجلاً، سيتم إرسال رابط إعادة التعيين" };
    }),

  // ============================================
  // لوحة تحكم العميل
  // ============================================

  // الحصول على ملخص حساب العميل
  getDashboard: publicProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // معلومات العميل
      const customer = await db.select().from(customers).where(eq(customers.id, input.customerId));
      
      // الاشتراكات النشطة
      const activeSubscriptions = await db.select({ count: sql<number>`count(*)` }).from(subscriptions)
        .where(and(eq(subscriptions.customerId, input.customerId), eq(subscriptions.status, "active")));
      
      // الفواتير غير المدفوعة
      const unpaidInvoices = await db.select({
        count: sql<number>`count(*)`,
        total: sql<number>`sum(total_amount - paid_amount)`,
      }).from(invoices)
        .where(and(
          eq(invoices.customerId, input.customerId),
          sql`status IN ('issued', 'overdue')`
        ));
      
      // آخر المدفوعات
      const recentPayments = await db.select().from(payments)
        .where(eq(payments.customerId, input.customerId))
        .orderBy(desc(payments.paymentDate))
        .limit(5);
      
      // التذاكر المفتوحة
      const openTickets = await db.select({ count: sql<number>`count(*)` }).from(tickets)
        .where(and(
          eq(tickets.customerId, input.customerId),
          sql`status IN ('open', 'in_progress', 'pending_customer')`
        ));
      
      // الإشعارات غير المقروءة
      const unreadNotifications = await db.select({ count: sql<number>`count(*)` }).from(customerNotifications)
        .where(and(
          eq(customerNotifications.customerId, input.customerId),
          eq(customerNotifications.isRead, false)
        ));
      
      return {
        customer: customer[0],
        activeSubscriptions: activeSubscriptions[0]?.count || 0,
        unpaidInvoicesCount: unpaidInvoices[0]?.count || 0,
        unpaidInvoicesTotal: unpaidInvoices[0]?.total || 0,
        recentPayments,
        openTickets: openTickets[0]?.count || 0,
        unreadNotifications: unreadNotifications[0]?.count || 0,
      };
    }),

  // الحصول على فواتير العميل
  getInvoices: publicProcedure
    .input(z.object({
      customerId: z.number(),
      status: z.string().optional(),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const conditions = [eq(invoices.customerId, input.customerId)];
      if (input.status) {
        conditions.push(eq(invoices.status, input.status as any));
      }
      return db.select().from(invoices).where(and(...conditions)).orderBy(desc(invoices.invoiceDate)).limit(input.limit);
    }),

  // الحصول على اشتراكات العميل
  getSubscriptions: publicProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return db.select().from(subscriptions).where(eq(subscriptions.customerId, input.customerId));
    }),

  // الحصول على عدادات العميل
  getMeters: publicProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return db.select().from(meters).where(eq(meters.customerId, input.customerId));
    }),

  // ============================================
  // الإشعارات
  // ============================================

  // الحصول على إشعارات العميل
  getNotifications: publicProcedure
    .input(z.object({
      customerId: z.number(),
      unreadOnly: z.boolean().default(false),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const conditions = [eq(customerNotifications.customerId, input.customerId)];
      if (input.unreadOnly) {
        conditions.push(eq(customerNotifications.isRead, false));
      }
      return db.select().from(customerNotifications).where(and(...conditions)).orderBy(desc(customerNotifications.createdAt)).limit(input.limit);
    }),

  // تحديد إشعار كمقروء
  markNotificationRead: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(customerNotifications).set({
        isRead: true,
        readAt: new Date(),
      }).where(eq(customerNotifications.id, input.id));
      return { success: true };
    }),

  // تحديد جميع الإشعارات كمقروءة
  markAllNotificationsRead: publicProcedure
    .input(z.object({ customerId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(customerNotifications).set({
        isRead: true,
        readAt: new Date(),
      }).where(and(
        eq(customerNotifications.customerId, input.customerId),
        eq(customerNotifications.isRead, false)
      ));
      return { success: true };
    }),

  // ============================================
  // الملاحظات والشكاوى
  // ============================================

  // إرسال ملاحظة
  submitFeedback: publicProcedure
    .input(z.object({
      customerId: z.number(),
      feedbackType: z.enum(["suggestion", "complaint", "compliment", "inquiry"]),
      subject: z.string().min(1),
      message: z.string().min(1),
      rating: z.number().min(1).max(5).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(customerFeedback).values({
        customerId: input.customerId,
        feedbackType: input.feedbackType,
        subject: input.subject,
        message: input.message,
        rating: input.rating,
        status: "pending",
      });
      
      return { id: result[0].insertId, success: true };
    }),

  // الحصول على ملاحظات العميل
  getFeedback: publicProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return db.select().from(customerFeedback)
        .where(eq(customerFeedback.customerId, input.customerId))
        .orderBy(desc(customerFeedback.createdAt));
    }),

  // ============================================
  // التذاكر
  // ============================================

  // إنشاء تذكرة من البوابة
  createTicket: publicProcedure
    .input(z.object({
      customerId: z.number(),
      subscriptionId: z.number().optional(),
      meterId: z.number().optional(),
      category: z.enum(["billing", "technical", "service", "complaint", "inquiry", "other"]),
      subject: z.string().min(1),
      description: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      const result = await db.insert(tickets).values({
        ticketNumber,
        customerId: input.customerId,
        subscriptionId: input.subscriptionId,
        meterId: input.meterId,
        category: input.category,
        priority: "medium",
        subject: input.subject,
        description: input.description,
        source: "web",
        status: "open",
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      
      // إرسال إشعار
      await db.insert(customerNotifications).values({
        customerId: input.customerId,
        notificationType: "service",
        title: "تم إنشاء تذكرة جديدة",
        message: `تم إنشاء تذكرة رقم ${ticketNumber} بنجاح. سيتم الرد عليك في أقرب وقت.`,
        actionUrl: `/tickets/${result[0].insertId}`,
      });
      
      return { id: result[0].insertId, ticketNumber, success: true };
    }),

  // الحصول على تذاكر العميل
  getTickets: publicProcedure
    .input(z.object({
      customerId: z.number(),
      status: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const conditions = [eq(tickets.customerId, input.customerId)];
      if (input.status) {
        conditions.push(eq(tickets.status, input.status as any));
      }
      return db.select().from(tickets).where(and(...conditions)).orderBy(desc(tickets.createdAt));
    }),

  // ============================================
  // إحصائيات البوابة
  // ============================================

  getPortalStats: publicProcedure.query(async () => {
    const db = await getDb();
      if (!db) throw new Error("Database not available");
    
    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(customerPortalUsers);
    const activeUsers = await db.select({ count: sql<number>`count(*)` }).from(customerPortalUsers).where(eq(customerPortalUsers.isActive, true));
    const verifiedUsers = await db.select({ count: sql<number>`count(*)` }).from(customerPortalUsers).where(eq(customerPortalUsers.isVerified, true));
    const activeSessions = await db.select({ count: sql<number>`count(*)` }).from(customerPortalSessions).where(gte(customerPortalSessions.expiresAt, new Date()));
    const totalFeedback = await db.select({ count: sql<number>`count(*)` }).from(customerFeedback);
    const pendingFeedback = await db.select({ count: sql<number>`count(*)` }).from(customerFeedback).where(eq(customerFeedback.status, "pending"));
    
    return {
      totalUsers: totalUsers[0]?.count || 0,
      activeUsers: activeUsers[0]?.count || 0,
      verifiedUsers: verifiedUsers[0]?.count || 0,
      activeSessions: activeSessions[0]?.count || 0,
      totalFeedback: totalFeedback[0]?.count || 0,
      pendingFeedback: pendingFeedback[0]?.count || 0,
    };
  }),
});
