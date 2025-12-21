import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  tickets, 
  ticketComments, 
  ticketHistory,
  ticketCategories 
} from "../../drizzle/schema-pg";
import { eq, and, desc, sql, like, or, isNull } from "drizzle-orm";

export const ticketsRouter = router({
  // ============================================
  // التذاكر
  // ============================================

  // الحصول على جميع التذاكر
  getAll: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      status: z.enum(["open", "in_progress", "pending_customer", "resolved", "closed", "cancelled"]).optional(),
      category: z.enum(["billing", "technical", "service", "complaint", "inquiry", "other"]).optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      customerId: z.number().optional(),
      assignedTo: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let query = db.select().from(tickets);
      
      const conditions = [];
      if (input?.search) {
        conditions.push(
          or(
            like(tickets.ticketNumber, `%${input.search}%`),
            like(tickets.subject, `%${input.search}%`)
          )
        );
      }
      if (input?.status) {
        conditions.push(eq(tickets.status, input.status));
      }
      if (input?.category) {
        conditions.push(eq(tickets.category, input.category));
      }
      if (input?.priority) {
        conditions.push(eq(tickets.priority, input.priority));
      }
      if (input?.customerId) {
        conditions.push(eq(tickets.customerId, input.customerId));
      }
      if (input?.assignedTo) {
        conditions.push(eq(tickets.assignedTo, input.assignedTo));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return query.orderBy(desc(tickets.createdAt));
    }),

  // الحصول على تذكرة بالمعرف
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const ticket = await db.select().from(tickets).where(eq(tickets.id, input.id));
      if (!ticket[0]) return null;
      
      const comments = await db.select().from(ticketComments)
        .where(eq(ticketComments.ticketId, input.id))
        .orderBy(desc(ticketComments.createdAt));
      
      const history = await db.select().from(ticketHistory)
        .where(eq(ticketHistory.ticketId, input.id))
        .orderBy(desc(ticketHistory.changedAt));
      
      return { ...ticket[0], comments, history };
    }),

  // إنشاء تذكرة جديدة
  create: publicProcedure
    .input(z.object({
      customerId: z.number().optional(),
      subscriptionId: z.number().optional(),
      meterId: z.number().optional(),
      category: z.enum(["billing", "technical", "service", "complaint", "inquiry", "other"]),
      priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
      subject: z.string().min(1),
      description: z.string().min(1),
      source: z.enum(["web", "mobile", "phone", "email", "walk_in"]).default("web"),
      assignedTo: z.number().optional(),
      assignedTeam: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // توليد رقم التذكرة
      const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      // حساب تاريخ الاستحقاق بناءً على الأولوية
      const slaHours = {
        urgent: 4,
        high: 8,
        medium: 24,
        low: 48,
      };
      const dueDate = new Date(Date.now() + slaHours[input.priority] * 60 * 60 * 1000);
      
      const result = await db.insert(tickets).values({
        ticketNumber,
        customerId: input.customerId,
        subscriptionId: input.subscriptionId,
        meterId: input.meterId,
        category: input.category,
        priority: input.priority,
        subject: input.subject,
        description: input.description,
        source: input.source,
        assignedTo: input.assignedTo,
        assignedTeam: input.assignedTeam,
        status: "open",
        dueDate,
      });
      
      const ticketId = result[0].insertId;
      
      // تسجيل في السجل
      await db.insert(ticketHistory).values({
        ticketId,
        action: "إنشاء التذكرة",
        newValue: `تم إنشاء التذكرة بالأولوية: ${input.priority}`,
      });
      
      return { id: ticketId, ticketNumber, success: true };
    }),

  // تحديث تذكرة
  update: publicProcedure
    .input(z.object({
      id: z.number(),
      category: z.enum(["billing", "technical", "service", "complaint", "inquiry", "other"]).optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      subject: z.string().optional(),
      assignedTo: z.number().optional(),
      assignedTeam: z.string().optional(),
      changedBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, changedBy, ...data } = input;
      
      // الحصول على البيانات القديمة
      const oldTicket = await db.select().from(tickets).where(eq(tickets.id, id));
      
      await db.update(tickets).set(data).where(eq(tickets.id, id));
      
      // تسجيل التغييرات
      if (input.priority && oldTicket[0]?.priority !== input.priority) {
        await db.insert(ticketHistory).values({
          ticketId: id,
          action: "تغيير الأولوية",
          oldValue: oldTicket[0]?.priority,
          newValue: input.priority,
          changedBy,
        });
      }
      if (input.assignedTo && oldTicket[0]?.assignedTo !== input.assignedTo) {
        await db.insert(ticketHistory).values({
          ticketId: id,
          action: "تعيين مسؤول",
          oldValue: oldTicket[0]?.assignedTo?.toString(),
          newValue: input.assignedTo.toString(),
          changedBy,
        });
      }
      
      return { success: true };
    }),

  // تغيير حالة التذكرة
  updateStatus: publicProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["open", "in_progress", "pending_customer", "resolved", "closed", "cancelled"]),
      changedBy: z.number().optional(),
      comment: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const oldTicket = await db.select().from(tickets).where(eq(tickets.id, input.id));
      
      const updateData: any = { status: input.status };
      if (input.status === "resolved") {
        updateData.resolvedAt = new Date();
      } else if (input.status === "closed") {
        updateData.closedAt = new Date();
      }
      
      await db.update(tickets).set(updateData).where(eq(tickets.id, input.id));
      
      // تسجيل في السجل
      await db.insert(ticketHistory).values({
        ticketId: input.id,
        action: "تغيير الحالة",
        oldValue: oldTicket[0]?.status,
        newValue: input.status,
        changedBy: input.changedBy,
      });
      
      // إضافة تعليق إذا وجد
      if (input.comment) {
        await db.insert(ticketComments).values({
          ticketId: input.id,
          commentType: "internal",
          comment: input.comment,
          createdBy: input.changedBy,
        });
      }
      
      return { success: true };
    }),

  // إضافة تعليق
  addComment: publicProcedure
    .input(z.object({
      ticketId: z.number(),
      commentType: z.enum(["public", "internal"]).default("public"),
      comment: z.string().min(1),
      attachments: z.array(z.string()).optional(),
      createdBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(ticketComments).values({
        ticketId: input.ticketId,
        commentType: input.commentType,
        comment: input.comment,
        attachments: input.attachments ? JSON.stringify(input.attachments) : null,
        createdBy: input.createdBy,
      });
      
      // تسجيل في السجل
      await db.insert(ticketHistory).values({
        ticketId: input.ticketId,
        action: input.commentType === "public" ? "إضافة رد" : "إضافة ملاحظة داخلية",
        changedBy: input.createdBy,
      });
      
      return { id: result[0].insertId, success: true };
    }),

  // تقييم التذكرة
  rate: publicProcedure
    .input(z.object({
      id: z.number(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(tickets).set({
        satisfactionRating: input.rating,
        satisfactionComment: input.comment,
      }).where(eq(tickets.id, input.id));
      
      return { success: true };
    }),

  // تعيين التذكرة
  assign: publicProcedure
    .input(z.object({
      id: z.number(),
      assignedTo: z.number(),
      assignedTeam: z.string().optional(),
      changedBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(tickets).set({
        assignedTo: input.assignedTo,
        assignedTeam: input.assignedTeam,
        status: "in_progress",
      }).where(eq(tickets.id, input.id));
      
      await db.insert(ticketHistory).values({
        ticketId: input.id,
        action: "تعيين التذكرة",
        newValue: `تم تعيين التذكرة للموظف رقم ${input.assignedTo}`,
        changedBy: input.changedBy,
      });
      
      return { success: true };
    }),

  // ============================================
  // تصنيفات التذاكر
  // ============================================

  // الحصول على جميع التصنيفات
  getCategories: publicProcedure.query(async () => {
    const db = await getDb();
      if (!db) throw new Error("Database not available");
    return db.select().from(ticketCategories).where(eq(ticketCategories.isActive, true));
  }),

  // إنشاء تصنيف
  createCategory: publicProcedure
    .input(z.object({
      categoryName: z.string().min(1),
      categoryCode: z.string().min(1),
      parentCategoryId: z.number().optional(),
      slaHours: z.number().default(24),
      defaultAssignee: z.number().optional(),
      defaultTeam: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(ticketCategories).values({
        categoryName: input.categoryName,
        categoryCode: input.categoryCode,
        parentCategoryId: input.parentCategoryId,
        slaHours: input.slaHours,
        defaultAssignee: input.defaultAssignee,
        defaultTeam: input.defaultTeam,
        isActive: true,
      });
      
      return { id: result[0].insertId, success: true };
    }),

  // ============================================
  // إحصائيات التذاكر
  // ============================================

  getStats: publicProcedure.query(async () => {
    const db = await getDb();
      if (!db) throw new Error("Database not available");
    
    const total = await db.select({ count: sql<number>`count(*)` }).from(tickets);
    const open = await db.select({ count: sql<number>`count(*)` }).from(tickets).where(eq(tickets.status, "open"));
    const inProgress = await db.select({ count: sql<number>`count(*)` }).from(tickets).where(eq(tickets.status, "in_progress"));
    const resolved = await db.select({ count: sql<number>`count(*)` }).from(tickets).where(eq(tickets.status, "resolved"));
    const closed = await db.select({ count: sql<number>`count(*)` }).from(tickets).where(eq(tickets.status, "closed"));
    
    const urgent = await db.select({ count: sql<number>`count(*)` }).from(tickets)
      .where(and(
        eq(tickets.priority, "urgent"),
        or(eq(tickets.status, "open"), eq(tickets.status, "in_progress"))
      ));
    
    const avgRating = await db.select({ avg: sql<number>`avg(satisfaction_rating)` }).from(tickets)
      .where(sql`satisfaction_rating IS NOT NULL`);
    
    // التذاكر المتأخرة
    const overdue = await db.select({ count: sql<number>`count(*)` }).from(tickets)
      .where(and(
        sql`due_date < NOW()`,
        or(eq(tickets.status, "open"), eq(tickets.status, "in_progress"))
      ));
    
    return {
      total: total[0]?.count || 0,
      open: open[0]?.count || 0,
      inProgress: inProgress[0]?.count || 0,
      resolved: resolved[0]?.count || 0,
      closed: closed[0]?.count || 0,
      urgent: urgent[0]?.count || 0,
      overdue: overdue[0]?.count || 0,
      avgRating: avgRating[0]?.avg || 0,
    };
  }),

  // إحصائيات حسب التصنيف
  getStatsByCategory: publicProcedure.query(async () => {
    const db = await getDb();
      if (!db) throw new Error("Database not available");
    
    const stats = await db.select({
      category: tickets.category,
      count: sql<number>`count(*)`,
    }).from(tickets).groupBy(tickets.category);
    
    return stats;
  }),

  // التذاكر غير المعينة
  getUnassigned: publicProcedure.query(async () => {
    const db = await getDb();
      if (!db) throw new Error("Database not available");
    
    return db.select().from(tickets)
      .where(and(
        isNull(tickets.assignedTo),
        or(eq(tickets.status, "open"), eq(tickets.status, "in_progress"))
      ))
      .orderBy(desc(tickets.priority), desc(tickets.createdAt));
  }),

  // حذف تذكرة
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(ticketComments).where(eq(ticketComments.ticketId, input.id));
      await db.delete(ticketHistory).where(eq(ticketHistory.ticketId, input.id));
      await db.delete(tickets).where(eq(tickets.id, input.id));
      return { success: true };
    }),
});
