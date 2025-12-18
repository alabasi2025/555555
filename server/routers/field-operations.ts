import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  fieldTeams, 
  fieldTeamMembers, 
  fieldSchedules, 
  fieldTasks,
  meterReadings,
  workOrders
} from "../../drizzle/schema";
import { eq, and, desc, sql, like, or, gte, lte, between } from "drizzle-orm";

export const fieldOperationsRouter = router({
  // ============================================
  // الفرق الميدانية
  // ============================================

  // الحصول على جميع الفرق
  getTeams: publicProcedure
    .input(z.object({
      teamType: z.enum(["installation", "maintenance", "meter_reading", "collection", "inspection"]).optional(),
      isActive: z.boolean().optional(),
      region: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let query = db.select().from(fieldTeams);
      
      const conditions = [];
      if (input?.teamType) {
        conditions.push(eq(fieldTeams.teamType, input.teamType));
      }
      if (input?.isActive !== undefined) {
        conditions.push(eq(fieldTeams.isActive, input.isActive));
      }
      if (input?.region) {
        conditions.push(eq(fieldTeams.region, input.region));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return query.orderBy(fieldTeams.teamName);
    }),

  // الحصول على فريق بالمعرف
  getTeamById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const team = await db.select().from(fieldTeams).where(eq(fieldTeams.id, input.id));
      if (!team[0]) return null;
      
      const members = await db.select().from(fieldTeamMembers)
        .where(and(eq(fieldTeamMembers.teamId, input.id), eq(fieldTeamMembers.isActive, true)));
      
      return { ...team[0], members };
    }),

  // إنشاء فريق جديد
  createTeam: publicProcedure
    .input(z.object({
      teamCode: z.string().min(1),
      teamName: z.string().min(1),
      teamLeaderId: z.number().optional(),
      teamType: z.enum(["installation", "maintenance", "meter_reading", "collection", "inspection"]),
      region: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(fieldTeams).values({
        teamCode: input.teamCode,
        teamName: input.teamName,
        teamLeaderId: input.teamLeaderId,
        teamType: input.teamType,
        region: input.region,
        isActive: true,
      });
      
      return { id: result[0].insertId, success: true };
    }),

  // إضافة عضو للفريق
  addTeamMember: publicProcedure
    .input(z.object({
      teamId: z.number(),
      employeeId: z.number(),
      role: z.enum(["leader", "technician", "assistant"]).default("technician"),
      joinDate: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(fieldTeamMembers).values({
        teamId: input.teamId,
        employeeId: input.employeeId,
        role: input.role,
        joinDate: new Date(input.joinDate),
        isActive: true,
      });
      
      return { id: result[0].insertId, success: true };
    }),

  // إزالة عضو من الفريق
  removeTeamMember: publicProcedure
    .input(z.object({
      id: z.number(),
      leaveDate: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(fieldTeamMembers).set({
        isActive: false,
        leaveDate: new Date(input.leaveDate),
      }).where(eq(fieldTeamMembers.id, input.id));
      
      return { success: true };
    }),

  // ============================================
  // الجداول الميدانية
  // ============================================

  // الحصول على جميع الجداول
  getSchedules: publicProcedure
    .input(z.object({
      teamId: z.number().optional(),
      status: z.enum(["draft", "published", "in_progress", "completed", "cancelled"]).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let query = db.select().from(fieldSchedules);
      
      const conditions = [];
      if (input?.teamId) {
        conditions.push(eq(fieldSchedules.teamId, input.teamId));
      }
      if (input?.status) {
        conditions.push(eq(fieldSchedules.status, input.status));
      }
      if (input?.startDate && input?.endDate) {
        conditions.push(between(fieldSchedules.scheduleDate, new Date(input.startDate), new Date(input.endDate)));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return query.orderBy(desc(fieldSchedules.scheduleDate));
    }),

  // إنشاء جدول جديد
  createSchedule: publicProcedure
    .input(z.object({
      teamId: z.number(),
      scheduleDate: z.string(),
      scheduleType: z.enum(["daily", "weekly", "monthly"]).default("daily"),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const scheduleNumber = `SCH-${Date.now()}`;
      
      const result = await db.insert(fieldSchedules).values({
        scheduleNumber,
        teamId: input.teamId,
        scheduleDate: new Date(input.scheduleDate),
        scheduleType: input.scheduleType,
        status: "draft",
        notes: input.notes,
      });
      
      return { id: result[0].insertId, scheduleNumber, success: true };
    }),

  // نشر الجدول
  publishSchedule: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(fieldSchedules).set({ status: "published" }).where(eq(fieldSchedules.id, input.id));
      return { success: true };
    }),

  // ============================================
  // المهام الميدانية
  // ============================================

  // الحصول على جميع المهام
  getTasks: publicProcedure
    .input(z.object({
      scheduleId: z.number().optional(),
      teamId: z.number().optional(),
      assignedTo: z.number().optional(),
      taskType: z.enum(["installation", "maintenance", "meter_reading", "collection", "inspection", "disconnection", "reconnection"]).optional(),
      status: z.enum(["pending", "assigned", "in_progress", "completed", "failed", "cancelled"]).optional(),
      scheduledDate: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let query = db.select().from(fieldTasks);
      
      const conditions = [];
      if (input?.scheduleId) {
        conditions.push(eq(fieldTasks.scheduleId, input.scheduleId));
      }
      if (input?.teamId) {
        conditions.push(eq(fieldTasks.teamId, input.teamId));
      }
      if (input?.assignedTo) {
        conditions.push(eq(fieldTasks.assignedTo, input.assignedTo));
      }
      if (input?.taskType) {
        conditions.push(eq(fieldTasks.taskType, input.taskType));
      }
      if (input?.status) {
        conditions.push(eq(fieldTasks.status, input.status));
      }
      if (input?.scheduledDate) {
        conditions.push(eq(fieldTasks.scheduledDate, new Date(input.scheduledDate)));
      }
      if (input?.priority) {
        conditions.push(eq(fieldTasks.priority, input.priority));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return query.orderBy(desc(fieldTasks.priority), fieldTasks.scheduledDate);
    }),

  // الحصول على مهمة بالمعرف
  getTaskById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return db.select().from(fieldTasks).where(eq(fieldTasks.id, input.id));
    }),

  // إنشاء مهمة جديدة
  createTask: publicProcedure
    .input(z.object({
      scheduleId: z.number().optional(),
      workOrderId: z.number().optional(),
      teamId: z.number().optional(),
      assignedTo: z.number().optional(),
      taskType: z.enum(["installation", "maintenance", "meter_reading", "collection", "inspection", "disconnection", "reconnection"]),
      priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
      customerId: z.number().optional(),
      subscriptionId: z.number().optional(),
      meterId: z.number().optional(),
      address: z.string().optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
      scheduledDate: z.string(),
      scheduledTime: z.string().optional(),
      estimatedDuration: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const taskNumber = `TSK-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      const result = await db.insert(fieldTasks).values({
        taskNumber,
        scheduleId: input.scheduleId,
        workOrderId: input.workOrderId,
        teamId: input.teamId,
        assignedTo: input.assignedTo,
        taskType: input.taskType,
        priority: input.priority,
        customerId: input.customerId,
        subscriptionId: input.subscriptionId,
        meterId: input.meterId,
        address: input.address,
        latitude: input.latitude,
        longitude: input.longitude,
        scheduledDate: new Date(input.scheduledDate),
        scheduledTime: input.scheduledTime,
        estimatedDuration: input.estimatedDuration,
        status: input.assignedTo ? "assigned" : "pending",
      });
      
      // تحديث عداد المهام في الجدول
      if (input.scheduleId) {
        await db.update(fieldSchedules).set({
          totalTasks: sql`total_tasks + 1`,
        }).where(eq(fieldSchedules.id, input.scheduleId));
      }
      
      return { id: result[0].insertId, taskNumber, success: true };
    }),

  // تعيين مهمة
  assignTask: publicProcedure
    .input(z.object({
      id: z.number(),
      assignedTo: z.number(),
      teamId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(fieldTasks).set({
        assignedTo: input.assignedTo,
        teamId: input.teamId,
        status: "assigned",
      }).where(eq(fieldTasks.id, input.id));
      
      return { success: true };
    }),

  // بدء المهمة
  startTask: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(fieldTasks).set({
        status: "in_progress",
        actualStartTime: new Date(),
      }).where(eq(fieldTasks.id, input.id));
      
      return { success: true };
    }),

  // إكمال المهمة
  completeTask: publicProcedure
    .input(z.object({
      id: z.number(),
      completionNotes: z.string().optional(),
      customerSignature: z.string().optional(),
      photos: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const task = await db.select().from(fieldTasks).where(eq(fieldTasks.id, input.id));
      
      await db.update(fieldTasks).set({
        status: "completed",
        actualEndTime: new Date(),
        completionNotes: input.completionNotes,
        customerSignature: input.customerSignature,
        photos: input.photos ? JSON.stringify(input.photos) : null,
      }).where(eq(fieldTasks.id, input.id));
      
      // تحديث عداد المهام المكتملة في الجدول
      if (task[0]?.scheduleId) {
        await db.update(fieldSchedules).set({
          completedTasks: sql`completed_tasks + 1`,
        }).where(eq(fieldSchedules.id, task[0].scheduleId));
      }
      
      // تحديث أمر العمل إذا وجد
      if (task[0]?.workOrderId) {
        await db.update(workOrders).set({
          status: "completed",
        }).where(eq(workOrders.id, task[0].workOrderId));
      }
      
      return { success: true };
    }),

  // فشل المهمة
  failTask: publicProcedure
    .input(z.object({
      id: z.number(),
      reason: z.string(),
      photos: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(fieldTasks).set({
        status: "failed",
        actualEndTime: new Date(),
        completionNotes: `سبب الفشل: ${input.reason}`,
        photos: input.photos ? JSON.stringify(input.photos) : null,
      }).where(eq(fieldTasks.id, input.id));
      
      return { success: true };
    }),

  // ============================================
  // قراءات العدادات
  // ============================================

  // الحصول على قراءات العدادات
  getMeterReadings: publicProcedure
    .input(z.object({
      meterId: z.number().optional(),
      subscriptionId: z.number().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let query = db.select().from(meterReadings);
      
      const conditions = [];
      if (input?.meterId) {
        conditions.push(eq(meterReadings.meterId, input.meterId));
      }
      if (input?.subscriptionId) {
        conditions.push(eq(meterReadings.subscriptionId, input.subscriptionId));
      }
      if (input?.startDate && input?.endDate) {
        conditions.push(between(meterReadings.readingDate, new Date(input.startDate), new Date(input.endDate)));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return query.orderBy(desc(meterReadings.readingDate));
    }),

  // تسجيل قراءة عداد
  recordMeterReading: publicProcedure
    .input(z.object({
      meterId: z.number(),
      subscriptionId: z.number().optional(),
      readingDate: z.string(),
      readingTime: z.string().optional(),
      currentReading: z.string(),
      readingType: z.enum(["scheduled", "manual", "estimated", "final"]).default("scheduled"),
      readBy: z.number().optional(),
      fieldTaskId: z.number().optional(),
      photo: z.string().optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // الحصول على القراءة السابقة
      const previousReadings = await db.select().from(meterReadings)
        .where(eq(meterReadings.meterId, input.meterId))
        .orderBy(desc(meterReadings.readingDate))
        .limit(1);
      
      const previousReading = previousReadings[0]?.currentReading || "0";
      const consumption = parseFloat(input.currentReading) - parseFloat(previousReading);
      
      const result = await db.insert(meterReadings).values({
        meterId: input.meterId,
        subscriptionId: input.subscriptionId,
        readingDate: new Date(input.readingDate),
        readingTime: input.readingTime,
        previousReading,
        currentReading: input.currentReading,
        consumption: consumption.toFixed(3),
        readingType: input.readingType,
        readBy: input.readBy,
        fieldTaskId: input.fieldTaskId,
        photo: input.photo,
        latitude: input.latitude,
        longitude: input.longitude,
        notes: input.notes,
      });
      
      return { id: result[0].insertId, consumption, success: true };
    }),

  // التحقق من قراءة عداد
  verifyMeterReading: publicProcedure
    .input(z.object({
      id: z.number(),
      verifiedBy: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(meterReadings).set({
        isVerified: true,
        verifiedBy: input.verifiedBy,
      }).where(eq(meterReadings.id, input.id));
      
      return { success: true };
    }),

  // ============================================
  // إحصائيات العمليات الميدانية
  // ============================================

  getStats: publicProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const totalTeams = await db.select({ count: sql<number>`count(*)` }).from(fieldTeams).where(eq(fieldTeams.isActive, true));
      const totalTasks = await db.select({ count: sql<number>`count(*)` }).from(fieldTasks);
      const pendingTasks = await db.select({ count: sql<number>`count(*)` }).from(fieldTasks).where(eq(fieldTasks.status, "pending"));
      const inProgressTasks = await db.select({ count: sql<number>`count(*)` }).from(fieldTasks).where(eq(fieldTasks.status, "in_progress"));
      const completedTasks = await db.select({ count: sql<number>`count(*)` }).from(fieldTasks).where(eq(fieldTasks.status, "completed"));
      const failedTasks = await db.select({ count: sql<number>`count(*)` }).from(fieldTasks).where(eq(fieldTasks.status, "failed"));
      
      const totalReadings = await db.select({ count: sql<number>`count(*)` }).from(meterReadings);
      const verifiedReadings = await db.select({ count: sql<number>`count(*)` }).from(meterReadings).where(eq(meterReadings.isVerified, true));
      
      return {
        totalTeams: totalTeams[0]?.count || 0,
        totalTasks: totalTasks[0]?.count || 0,
        pendingTasks: pendingTasks[0]?.count || 0,
        inProgressTasks: inProgressTasks[0]?.count || 0,
        completedTasks: completedTasks[0]?.count || 0,
        failedTasks: failedTasks[0]?.count || 0,
        completionRate: totalTasks[0]?.count ? ((completedTasks[0]?.count || 0) / totalTasks[0].count * 100).toFixed(1) : 0,
        totalReadings: totalReadings[0]?.count || 0,
        verifiedReadings: verifiedReadings[0]?.count || 0,
      };
    }),

  // إحصائيات حسب الفريق
  getTeamStats: publicProcedure
    .input(z.object({ teamId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const totalTasks = await db.select({ count: sql<number>`count(*)` }).from(fieldTasks).where(eq(fieldTasks.teamId, input.teamId));
      const completedTasks = await db.select({ count: sql<number>`count(*)` }).from(fieldTasks)
        .where(and(eq(fieldTasks.teamId, input.teamId), eq(fieldTasks.status, "completed")));
      const avgDuration = await db.select({ avg: sql<number>`avg(TIMESTAMPDIFF(MINUTE, actual_start_time, actual_end_time))` }).from(fieldTasks)
        .where(and(eq(fieldTasks.teamId, input.teamId), eq(fieldTasks.status, "completed")));
      
      return {
        totalTasks: totalTasks[0]?.count || 0,
        completedTasks: completedTasks[0]?.count || 0,
        completionRate: totalTasks[0]?.count ? ((completedTasks[0]?.count || 0) / totalTasks[0].count * 100).toFixed(1) : 0,
        avgDuration: avgDuration[0]?.avg || 0,
      };
    }),
});
