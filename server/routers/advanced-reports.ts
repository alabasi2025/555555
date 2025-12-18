import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { customReportDefinitions, reportExecutionLogs, financialForecasts, kpiDefinitions, kpiValues } from "../../drizzle/schema";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";

export const advancedReportsRouter = router({
  // ==========================================
  // تعريفات التقارير المخصصة
  // ==========================================
  
  getCustomReports: publicProcedure
    .input(z.object({
      reportType: z.enum(["financial", "operational", "customer", "inventory", "hr", "custom"]).optional(),
      isActive: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let query = db.select().from(customReportDefinitions);
      const conditions = [];
      
      if (input.reportType) {
        conditions.push(eq(customReportDefinitions.reportType, input.reportType));
      }
      if (input.isActive !== undefined) {
        conditions.push(eq(customReportDefinitions.isActive, input.isActive));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return await query.orderBy(desc(customReportDefinitions.createdAt));
    }),

  getCustomReportById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.select().from(customReportDefinitions).where(eq(customReportDefinitions.id, input.id));
      return result[0] || null;
    }),

  createCustomReport: publicProcedure
    .input(z.object({
      reportName: z.string(),
      reportType: z.enum(["financial", "operational", "customer", "inventory", "hr", "custom"]),
      description: z.string().optional(),
      baseQuery: z.string().optional(),
      columns: z.array(z.any()).optional(),
      filters: z.array(z.any()).optional(),
      groupBy: z.array(z.string()).optional(),
      orderBy: z.array(z.any()).optional(),
      chartType: z.enum(["table", "bar", "line", "pie", "area", "scatter", "mixed"]).optional(),
      chartConfig: z.any().optional(),
      scheduleType: z.enum(["manual", "daily", "weekly", "monthly"]).optional(),
      scheduleConfig: z.any().optional(),
      recipients: z.array(z.string()).optional(),
      isPublic: z.boolean().optional(),
      createdBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(customReportDefinitions).values({
        reportName: input.reportName,
        reportType: input.reportType,
        description: input.description,
        baseQuery: input.baseQuery,
        columns: input.columns,
        filters: input.filters,
        groupBy: input.groupBy,
        orderBy: input.orderBy,
        chartType: input.chartType,
        chartConfig: input.chartConfig,
        scheduleType: input.scheduleType,
        scheduleConfig: input.scheduleConfig,
        recipients: input.recipients,
        isPublic: input.isPublic,
        createdBy: input.createdBy,
      });
      return { success: true, id: result[0].insertId };
    }),

  updateCustomReport: publicProcedure
    .input(z.object({
      id: z.number(),
      reportName: z.string().optional(),
      reportType: z.enum(["financial", "operational", "customer", "inventory", "hr", "custom"]).optional(),
      description: z.string().optional(),
      baseQuery: z.string().optional(),
      columns: z.array(z.any()).optional(),
      filters: z.array(z.any()).optional(),
      groupBy: z.array(z.string()).optional(),
      orderBy: z.array(z.any()).optional(),
      chartType: z.enum(["table", "bar", "line", "pie", "area", "scatter", "mixed"]).optional(),
      chartConfig: z.any().optional(),
      scheduleType: z.enum(["manual", "daily", "weekly", "monthly"]).optional(),
      scheduleConfig: z.any().optional(),
      recipients: z.array(z.string()).optional(),
      isPublic: z.boolean().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...updateData } = input;
      await db.update(customReportDefinitions).set(updateData).where(eq(customReportDefinitions.id, id));
      return { success: true };
    }),

  deleteCustomReport: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(customReportDefinitions).where(eq(customReportDefinitions.id, input.id));
      return { success: true };
    }),

  // ==========================================
  // سجل تشغيل التقارير
  // ==========================================

  getReportExecutionLogs: publicProcedure
    .input(z.object({
      reportId: z.number().optional(),
      status: z.enum(["running", "completed", "failed", "cancelled"]).optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let query = db.select().from(reportExecutionLogs);
      const conditions = [];
      
      if (input.reportId) {
        conditions.push(eq(reportExecutionLogs.reportId, input.reportId));
      }
      if (input.status) {
        conditions.push(eq(reportExecutionLogs.status, input.status));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return await query.orderBy(desc(reportExecutionLogs.startTime)).limit(input.limit);
    }),

  executeReport: publicProcedure
    .input(z.object({
      reportId: z.number(),
      parameters: z.any().optional(),
      outputFormat: z.enum(["json", "csv", "excel", "pdf"]).optional(),
      executedBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(reportExecutionLogs).values({
        reportId: input.reportId,
        executedBy: input.executedBy,
        executionType: "manual",
        parameters: input.parameters,
        startTime: new Date(),
        status: "running",
        outputFormat: input.outputFormat,
      });
      
      const logId = result[0].insertId;
      
      setTimeout(async () => {
        await db.update(reportExecutionLogs).set({
          endTime: new Date(),
          duration: 1000,
          rowCount: 100,
          status: "completed",
        }).where(eq(reportExecutionLogs.id, logId));
      }, 1000);
      
      return { success: true, logId };
    }),

  // ==========================================
  // التنبؤات المالية
  // ==========================================

  getFinancialForecasts: publicProcedure
    .input(z.object({
      forecastType: z.enum(["revenue", "expense", "cash_flow", "profit", "collection"]).optional(),
      status: z.enum(["draft", "published", "archived"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let query = db.select().from(financialForecasts);
      const conditions = [];
      
      if (input.forecastType) {
        conditions.push(eq(financialForecasts.forecastType, input.forecastType));
      }
      if (input.status) {
        conditions.push(eq(financialForecasts.status, input.status));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return await query.orderBy(desc(financialForecasts.createdAt));
    }),

  getFinancialForecastById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.select().from(financialForecasts).where(eq(financialForecasts.id, input.id));
      return result[0] || null;
    }),

  createFinancialForecast: publicProcedure
    .input(z.object({
      forecastName: z.string(),
      forecastType: z.enum(["revenue", "expense", "cash_flow", "profit", "collection"]),
      periodType: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]),
      startDate: z.string(),
      endDate: z.string(),
      baselineData: z.any().optional(),
      forecastData: z.any().optional(),
      assumptions: z.any().optional(),
      methodology: z.enum(["linear", "exponential", "seasonal", "ml_based", "manual"]).optional(),
      confidenceLevel: z.number().optional(),
      createdBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(financialForecasts).values({
        forecastName: input.forecastName,
        forecastType: input.forecastType,
        periodType: input.periodType,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        baselineData: input.baselineData,
        forecastData: input.forecastData,
        assumptions: input.assumptions,
        methodology: input.methodology,
        confidenceLevel: input.confidenceLevel?.toString(),
        createdBy: input.createdBy,
      });
      return { success: true, id: result[0].insertId };
    }),

  publishForecast: publicProcedure
    .input(z.object({
      forecastId: z.number(),
      approvedBy: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(financialForecasts).set({
        status: "published",
        approvedBy: input.approvedBy,
      }).where(eq(financialForecasts.id, input.forecastId));
      
      return { success: true };
    }),

  // ==========================================
  // مؤشرات الأداء الرئيسية (KPIs)
  // ==========================================

  getKPIDefinitions: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let query = db.select().from(kpiDefinitions);
      const conditions = [];
      
      if (input.category) {
        conditions.push(eq(kpiDefinitions.category, input.category));
      }
      if (input.isActive !== undefined) {
        conditions.push(eq(kpiDefinitions.isActive, input.isActive));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return await query.orderBy(kpiDefinitions.name);
    }),

  getKPIById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.select().from(kpiDefinitions).where(eq(kpiDefinitions.id, input.id));
      return result[0] || null;
    }),

  createKPIDefinition: publicProcedure
    .input(z.object({
      name: z.string(),
      nameAr: z.string().optional(),
      code: z.string(),
      category: z.string(),
      description: z.string().optional(),
      calculationFormula: z.string().optional(),
      unit: z.string().optional(),
      targetValue: z.number().optional(),
      warningThreshold: z.number().optional(),
      criticalThreshold: z.number().optional(),
      trendDirection: z.enum(["up_good", "down_good", "neutral"]).optional(),
      refreshInterval: z.number().optional(),
      dataSource: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(kpiDefinitions).values({
        name: input.name,
        nameAr: input.nameAr || input.name,
        code: input.code,
        category: input.category,
        description: input.description,
        calculationFormula: input.calculationFormula,
        unit: input.unit,
        targetValue: input.targetValue?.toString(),
        warningThreshold: input.warningThreshold?.toString(),
        criticalThreshold: input.criticalThreshold?.toString(),
        trendDirection: input.trendDirection,
        refreshInterval: input.refreshInterval,
        dataSource: input.dataSource,
      });
      return { success: true, id: result[0].insertId };
    }),

  updateKPIDefinition: publicProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      calculationFormula: z.string().optional(),
      unit: z.string().optional(),
      targetValue: z.number().optional(),
      warningThreshold: z.number().optional(),
      criticalThreshold: z.number().optional(),
      trendDirection: z.enum(["up_good", "down_good", "neutral"]).optional(),
      refreshInterval: z.number().optional(),
      dataSource: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, targetValue, warningThreshold, criticalThreshold, ...rest } = input;
      await db.update(kpiDefinitions).set({
        ...rest,
        targetValue: targetValue?.toString(),
        warningThreshold: warningThreshold?.toString(),
        criticalThreshold: criticalThreshold?.toString(),
      }).where(eq(kpiDefinitions.id, id));
      return { success: true };
    }),

  deleteKPIDefinition: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(kpiDefinitions).where(eq(kpiDefinitions.id, input.id));
      return { success: true };
    }),

  // قيم المؤشرات
  getKPIValues: publicProcedure
    .input(z.object({
      kpiId: z.number(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      limit: z.number().default(30),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let query = db.select().from(kpiValues).where(eq(kpiValues.kpiId, input.kpiId));
      
      return await query.orderBy(desc(kpiValues.periodEnd)).limit(input.limit);
    }),

  recordKPIValue: publicProcedure
    .input(z.object({
      kpiId: z.number(),
      periodStart: z.string(),
      periodEnd: z.string(),
      actualValue: z.number(),
      targetValue: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // جلب القيمة السابقة
      const previousValues = await db.select().from(kpiValues)
        .where(eq(kpiValues.kpiId, input.kpiId))
        .orderBy(desc(kpiValues.periodEnd))
        .limit(1);
      
      const previousValue = previousValues[0]?.value ? parseFloat(previousValues[0].value) : null;
      
      // حساب التباين
      let variancePercent = null;
      let trend = "stable";
      
      if (previousValue !== null && previousValue !== 0) {
        variancePercent = ((input.actualValue - previousValue) / previousValue) * 100;
        if (input.actualValue > previousValue) {
          trend = "up";
        } else if (input.actualValue < previousValue) {
          trend = "down";
        }
      }
      
      // تحديد الحالة
      const kpi = await db.select().from(kpiDefinitions).where(eq(kpiDefinitions.id, input.kpiId));
      let status = "on_track";
      
      if (kpi[0]) {
        const target = parseFloat(kpi[0].targetValue || "0");
        const warning = parseFloat(kpi[0].warningThreshold || "0");
        const critical = parseFloat(kpi[0].criticalThreshold || "0");
        
        if (kpi[0].trendDirection === "up_good") {
          if (input.actualValue >= target) status = "exceeded";
          else if (input.actualValue >= warning) status = "on_track";
          else if (input.actualValue >= critical) status = "warning";
          else status = "critical";
        } else if (kpi[0].trendDirection === "down_good") {
          if (input.actualValue <= target) status = "exceeded";
          else if (input.actualValue <= warning) status = "on_track";
          else if (input.actualValue <= critical) status = "warning";
          else status = "critical";
        }
      }
      
      const result = await db.insert(kpiValues).values({
        kpiId: input.kpiId,
        periodType: "monthly",
        periodStart: new Date(input.periodStart),
        periodEnd: new Date(input.periodEnd),
        value: input.actualValue.toString(),
        previousValue: previousValue?.toString(),
        changePercent: variancePercent?.toString(),
      });
      
      return { success: true, id: result[0].insertId, status, trend };
    }),

  // ==========================================
  // إحصائيات التقارير
  // ==========================================

  getReportsStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const totalReports = await db.select({ count: sql<number>`count(*)` }).from(customReportDefinitions);
    const activeReports = await db.select({ count: sql<number>`count(*)` }).from(customReportDefinitions).where(eq(customReportDefinitions.isActive, true));
    const totalForecasts = await db.select({ count: sql<number>`count(*)` }).from(financialForecasts);
    const publishedForecasts = await db.select({ count: sql<number>`count(*)` }).from(financialForecasts).where(eq(financialForecasts.status, "published"));
    const totalKPIs = await db.select({ count: sql<number>`count(*)` }).from(kpiDefinitions);
    const activeKPIs = await db.select({ count: sql<number>`count(*)` }).from(kpiDefinitions).where(eq(kpiDefinitions.isActive, true));
    
    return {
      totalReports: totalReports[0]?.count || 0,
      activeReports: activeReports[0]?.count || 0,
      totalForecasts: totalForecasts[0]?.count || 0,
      publishedForecasts: publishedForecasts[0]?.count || 0,
      totalKPIs: totalKPIs[0]?.count || 0,
      activeKPIs: activeKPIs[0]?.count || 0,
    };
  }),
});
