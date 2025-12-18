import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  systemSettings, 
  settingsHistory, 
  backups, 
  restoreOperations,
  systemLogs,
  performanceMetrics,
  systemAlerts,
  notificationTemplates,
  notificationLogs
} from "../../drizzle/schema";
import { eq, desc, and, count, gte, lte } from "drizzle-orm";

export const settingsRouter = router({
  // ==================== System Settings ====================
  
  getSettings: publicProcedure
    .input(z.object({ category: z.string().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let result = await db.select().from(systemSettings).orderBy(systemSettings.category);
      
      if (input.category) {
        result = result.filter(s => s.category === input.category);
      }
      
      return result;
    }),

  getSettingByKey: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.settingKey, input.key));
      return setting;
    }),

  createSetting: publicProcedure
    .input(z.object({
      settingKey: z.string(),
      settingValue: z.string().optional(),
      settingType: z.enum(["string", "number", "boolean", "json", "date"]).optional(),
      category: z.string().optional(),
      description: z.string().optional(),
      isPublic: z.boolean().optional(),
      isEditable: z.boolean().optional(),
      defaultValue: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [result] = await db.insert(systemSettings).values({
        settingKey: input.settingKey,
        settingValue: input.settingValue,
        settingType: input.settingType,
        category: input.category,
        description: input.description,
        isPublic: input.isPublic,
        isEditable: input.isEditable,
        defaultValue: input.defaultValue,
      });
      return { id: result.insertId };
    }),

  updateSetting: publicProcedure
    .input(z.object({
      id: z.number(),
      settingValue: z.string(),
      updatedBy: z.number().optional(),
      changeReason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Get old value
      const [oldSetting] = await db.select().from(systemSettings).where(eq(systemSettings.id, input.id));
      
      // Update setting
      await db.update(systemSettings).set({
        settingValue: input.settingValue,
        updatedBy: input.updatedBy,
      }).where(eq(systemSettings.id, input.id));
      
      // Log history
      await db.insert(settingsHistory).values({
        settingId: input.id,
        oldValue: oldSetting?.settingValue,
        newValue: input.settingValue,
        changedBy: input.updatedBy,
        changeReason: input.changeReason,
      });
      
      return { success: true };
    }),

  getSettingsHistory: publicProcedure
    .input(z.object({ settingId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      return await db.select().from(settingsHistory).where(eq(settingsHistory.settingId, input.settingId)).orderBy(desc(settingsHistory.createdAt));
    }),

  // ==================== Backups ====================

  getBackups: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    return await db.select().from(backups).orderBy(desc(backups.createdAt));
  }),

  createBackup: publicProcedure
    .input(z.object({
      backupType: z.enum(["full", "incremental", "differential"]),
      retentionDays: z.number().optional(),
      triggeredBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const backupCode = `BKP-${Date.now()}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (input.retentionDays || 30));
      
      const [result] = await db.insert(backups).values({
        backupCode,
        backupType: input.backupType,
        status: "pending",
        retentionDays: input.retentionDays || 30,
        expiresAt,
        triggeredBy: input.triggeredBy,
        startedAt: new Date(),
      });
      return { id: result.insertId, backupCode };
    }),

  updateBackup: publicProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "in_progress", "completed", "failed"]).optional(),
      fileSize: z.number().optional(),
      filePath: z.string().optional(),
      checksum: z.string().optional(),
      errorMessage: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.status === "completed" || data.status === "failed") {
        updateData.completedAt = new Date();
      }
      await db.update(backups).set(updateData).where(eq(backups.id, id));
      return { success: true };
    }),

  deleteBackup: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.delete(backups).where(eq(backups.id, input.id));
      return { success: true };
    }),

  // ==================== Restore Operations ====================

  getRestoreOperations: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    return await db.select().from(restoreOperations).orderBy(desc(restoreOperations.createdAt));
  }),

  createRestoreOperation: publicProcedure
    .input(z.object({
      backupId: z.number(),
      restoreType: z.enum(["full", "partial", "point_in_time"]),
      targetDatabase: z.string().optional(),
      triggeredBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [result] = await db.insert(restoreOperations).values({
        backupId: input.backupId,
        restoreType: input.restoreType,
        targetDatabase: input.targetDatabase,
        status: "pending",
        triggeredBy: input.triggeredBy,
        startedAt: new Date(),
      });
      return { id: result.insertId };
    }),

  // ==================== System Logs ====================

  getSystemLogs: publicProcedure
    .input(z.object({
      logLevel: z.enum(["debug", "info", "warning", "error", "critical"]).optional(),
      source: z.string().optional(),
      limit: z.number().default(100),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let result = await db.select().from(systemLogs).orderBy(desc(systemLogs.createdAt)).limit(input.limit);
      
      if (input.logLevel) {
        result = result.filter(log => log.logLevel === input.logLevel);
      }
      if (input.source) {
        result = result.filter(log => log.source === input.source);
      }
      
      return result;
    }),

  createSystemLog: publicProcedure
    .input(z.object({
      logLevel: z.enum(["debug", "info", "warning", "error", "critical"]),
      source: z.string().optional(),
      message: z.string(),
      context: z.any().optional(),
      stackTrace: z.string().optional(),
      userId: z.number().optional(),
      requestId: z.string().optional(),
      ipAddress: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [result] = await db.insert(systemLogs).values({
        logLevel: input.logLevel,
        source: input.source,
        message: input.message,
        context: input.context,
        stackTrace: input.stackTrace,
        userId: input.userId,
        requestId: input.requestId,
        ipAddress: input.ipAddress,
      });
      return { id: result.insertId };
    }),

  // ==================== Performance Metrics ====================

  getPerformanceMetrics: publicProcedure
    .input(z.object({
      metricName: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      limit: z.number().default(100),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let result = await db.select().from(performanceMetrics).orderBy(desc(performanceMetrics.recordedAt)).limit(input.limit);
      
      if (input.metricName) {
        result = result.filter(m => m.metricName === input.metricName);
      }
      
      return result;
    }),

  createPerformanceMetric: publicProcedure
    .input(z.object({
      metricName: z.string(),
      metricValue: z.number(),
      metricUnit: z.string().optional(),
      source: z.string().optional(),
      tags: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [result] = await db.insert(performanceMetrics).values({
        metricName: input.metricName,
        metricValue: input.metricValue.toString(),
        metricUnit: input.metricUnit,
        source: input.source,
        tags: input.tags,
      });
      return { id: result.insertId };
    }),

  // ==================== System Alerts ====================

  getSystemAlerts: publicProcedure
    .input(z.object({
      status: z.enum(["active", "acknowledged", "resolved"]).optional(),
      severity: z.enum(["critical", "high", "medium", "low"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let result = await db.select().from(systemAlerts).orderBy(desc(systemAlerts.createdAt));
      
      if (input.status) {
        result = result.filter(a => a.status === input.status);
      }
      if (input.severity) {
        result = result.filter(a => a.severity === input.severity);
      }
      
      return result;
    }),

  createSystemAlert: publicProcedure
    .input(z.object({
      alertType: z.enum(["performance", "security", "error", "warning", "info"]),
      severity: z.enum(["critical", "high", "medium", "low"]),
      title: z.string(),
      message: z.string().optional(),
      source: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const alertCode = `ALT-${Date.now()}`;
      const [result] = await db.insert(systemAlerts).values({
        alertCode,
        alertType: input.alertType,
        severity: input.severity,
        title: input.title,
        message: input.message,
        source: input.source,
        status: "active",
      });
      return { id: result.insertId, alertCode };
    }),

  acknowledgeAlert: publicProcedure
    .input(z.object({
      id: z.number(),
      acknowledgedBy: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(systemAlerts).set({
        status: "acknowledged",
        acknowledgedBy: input.acknowledgedBy,
        acknowledgedAt: new Date(),
      }).where(eq(systemAlerts.id, input.id));
      return { success: true };
    }),

  resolveAlert: publicProcedure
    .input(z.object({
      id: z.number(),
      resolvedBy: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(systemAlerts).set({
        status: "resolved",
        resolvedBy: input.resolvedBy,
        resolvedAt: new Date(),
      }).where(eq(systemAlerts.id, input.id));
      return { success: true };
    }),

  // ==================== Notification Templates ====================

  getNotificationTemplates: publicProcedure
    .input(z.object({ channel: z.enum(["email", "sms", "push", "in_app"]).optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let result = await db.select().from(notificationTemplates).orderBy(notificationTemplates.templateName);
      
      if (input.channel) {
        result = result.filter(t => t.channel === input.channel);
      }
      
      return result;
    }),

  createNotificationTemplate: publicProcedure
    .input(z.object({
      templateName: z.string(),
      channel: z.enum(["email", "sms", "push", "in_app"]),
      subject: z.string().optional(),
      body: z.string(),
      variables: z.any().optional(),
      language: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const templateCode = `NT-${Date.now()}`;
      const [result] = await db.insert(notificationTemplates).values({
        templateCode,
        templateName: input.templateName,
        channel: input.channel,
        subject: input.subject,
        body: input.body,
        variables: input.variables,
        language: input.language || "ar",
      });
      return { id: result.insertId, templateCode };
    }),

  updateNotificationTemplate: publicProcedure
    .input(z.object({
      id: z.number(),
      templateName: z.string().optional(),
      subject: z.string().optional(),
      body: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      await db.update(notificationTemplates).set(data).where(eq(notificationTemplates.id, id));
      return { success: true };
    }),

  // ==================== Notification Logs ====================

  getNotificationLogs: publicProcedure
    .input(z.object({
      channel: z.enum(["email", "sms", "push", "in_app"]).optional(),
      status: z.enum(["pending", "sent", "delivered", "failed", "bounced"]).optional(),
      limit: z.number().default(100),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let result = await db.select().from(notificationLogs).orderBy(desc(notificationLogs.createdAt)).limit(input.limit);
      
      if (input.channel) {
        result = result.filter(n => n.channel === input.channel);
      }
      if (input.status) {
        result = result.filter(n => n.status === input.status);
      }
      
      return result;
    }),

  createNotificationLog: publicProcedure
    .input(z.object({
      templateId: z.number().optional(),
      recipientId: z.number().optional(),
      recipientEmail: z.string().optional(),
      recipientPhone: z.string().optional(),
      channel: z.enum(["email", "sms", "push", "in_app"]),
      subject: z.string().optional(),
      body: z.string(),
      metadata: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [result] = await db.insert(notificationLogs).values({
        templateId: input.templateId,
        recipientId: input.recipientId,
        recipientEmail: input.recipientEmail,
        recipientPhone: input.recipientPhone,
        channel: input.channel,
        subject: input.subject,
        body: input.body,
        status: "pending",
        metadata: input.metadata,
      });
      return { id: result.insertId };
    }),

  // ==================== Settings Dashboard ====================

  getSettingsDashboard: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const [settingsCount] = await db.select({ count: count() }).from(systemSettings);
    const [backupsCount] = await db.select({ count: count() }).from(backups);
    const [completedBackups] = await db.select({ count: count() }).from(backups).where(eq(backups.status, "completed"));
    const [alertsCount] = await db.select({ count: count() }).from(systemAlerts).where(eq(systemAlerts.status, "active"));
    const [templatesCount] = await db.select({ count: count() }).from(notificationTemplates);
    
    const recentBackups = await db.select().from(backups).orderBy(desc(backups.createdAt)).limit(5);
    const recentAlerts = await db.select().from(systemAlerts).where(eq(systemAlerts.status, "active")).orderBy(desc(systemAlerts.createdAt)).limit(5);
    
    return {
      totalSettings: settingsCount?.count || 0,
      totalBackups: backupsCount?.count || 0,
      completedBackups: completedBackups?.count || 0,
      activeAlerts: alertsCount?.count || 0,
      totalTemplates: templatesCount?.count || 0,
      recentBackups,
      recentAlerts,
    };
  }),
});
