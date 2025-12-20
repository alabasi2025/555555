import { z } from 'zod';
import { router, publicProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { 
  systemHealthChecks,
  healthCheckResults,
  performanceMetrics,
  systemAlerts,
  alertRules,
  performanceReports,
  improvementSuggestions,
  userSatisfactionSurveys
} from '../../drizzle/schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';

export const systemHealthRouter = router({
  // فحص صحة النظام
  getHealthChecks: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    return await db.select().from(systemHealthChecks).orderBy(systemHealthChecks.serviceName);
  }),

  createHealthCheck: publicProcedure
    .input(z.object({
      serviceName: z.string(),
      checkType: z.string(),
      endpoint: z.string().optional(),
      expectedStatus: z.string().optional(),
      timeout: z.number().optional(),
      interval: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(systemHealthChecks).values(input);
      return { id: result[0].insertId };
    }),

  updateHealthCheck: publicProcedure
    .input(z.object({
      id: z.number(),
      endpoint: z.string().optional(),
      expectedStatus: z.string().optional(),
      timeout: z.number().optional(),
      interval: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { id, ...data } = input;
      await db.update(systemHealthChecks).set(data).where(eq(systemHealthChecks.id, id));
      return { success: true };
    }),

  recordHealthCheckResult: publicProcedure
    .input(z.object({
      checkId: z.number(),
      status: z.string(),
      responseTime: z.number().optional(),
      statusCode: z.number().optional(),
      errorMessage: z.string().optional(),
      details: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // Record result
      const result = await db.insert(healthCheckResults).values(input);
      
      // Update last check info
      await db.update(systemHealthChecks).set({
        lastCheckAt: new Date(),
        lastStatus: input.status,
        lastResponseTime: input.responseTime,
      }).where(eq(systemHealthChecks.id, input.checkId));
      
      return { id: result[0].insertId };
    }),

  getHealthCheckResults: publicProcedure
    .input(z.object({ 
      checkId: z.number(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      return await db.select().from(healthCheckResults)
        .where(eq(healthCheckResults.checkId, input.checkId))
        .orderBy(desc(healthCheckResults.checkedAt))
        .limit(input.limit || 100);
    }),

  // مقاييس الأداء
  recordMetric: publicProcedure
    .input(z.object({
      metricName: z.string(),
      metricType: z.string(),
      value: z.string(),
      unit: z.string().optional(),
      tags: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(performanceMetrics).values(input);
      return { id: result[0].insertId };
    }),

  getMetrics: publicProcedure
    .input(z.object({
      metricName: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      limit: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      return await db.select().from(performanceMetrics)
        .orderBy(desc(performanceMetrics.recordedAt))
        .limit(input?.limit || 1000);
    }),

  // التنبيهات المتقدمة
  getSystemAlerts: publicProcedure
    .input(z.object({
      status: z.string().optional(),
      severity: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      return await db.select().from(systemAlerts).orderBy(desc(systemAlerts.createdAt));
    }),

  createSystemAlert: publicProcedure
    .input(z.object({
      alertType: z.enum(['performance', 'security', 'error', 'warning', 'info']),
      source: z.string(),
      title: z.string(),
      message: z.string().optional(),
      severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const alertCode = `ALT-${Date.now()}`;
      const result = await db.insert(systemAlerts).values({
        alertCode,
        alertType: input.alertType,
        source: input.source || 'system',
        title: input.title,
        message: input.message,
        severity: input.severity || 'medium',
      });
      return { id: result[0].insertId };
    }),

  acknowledgeSystemAlert: publicProcedure
    .input(z.object({
      id: z.number(),
      acknowledgedBy: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.update(systemAlerts).set({
        status: 'acknowledged',
        acknowledgedBy: input.acknowledgedBy,
        acknowledgedAt: new Date(),
      }).where(eq(systemAlerts.id, input.id));
      return { success: true };
    }),

  resolveSystemAlert: publicProcedure
    .input(z.object({
      id: z.number(),
      resolvedBy: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.update(systemAlerts).set({
        status: 'resolved',
        resolvedBy: input.resolvedBy,
        resolvedAt: new Date(),
      }).where(eq(systemAlerts.id, input.id));
      return { success: true };
    }),

  // قواعد التنبيه
  getAlertRules: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    return await db.select().from(alertRules).orderBy(alertRules.name);
  }),

  createAlertRule: publicProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      metricName: z.string().optional(),
      condition: z.string(),
      threshold: z.string(),
      duration: z.number().optional(),
      severity: z.string().optional(),
      notificationChannels: z.any().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(alertRules).values(input);
      return { id: result[0].insertId };
    }),

  updateAlertRule: publicProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      condition: z.string().optional(),
      threshold: z.string().optional(),
      duration: z.number().optional(),
      severity: z.string().optional(),
      notificationChannels: z.any().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { id, ...data } = input;
      await db.update(alertRules).set(data).where(eq(alertRules.id, id));
      return { success: true };
    }),

  // تقارير الأداء
  getPerformanceReports: publicProcedure
    .input(z.object({ reportType: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      return await db.select().from(performanceReports).orderBy(desc(performanceReports.generatedAt));
    }),

  createPerformanceReport: publicProcedure
    .input(z.object({
      reportType: z.string(),
      periodStart: z.string(),
      periodEnd: z.string(),
      metrics: z.any().optional(),
      summary: z.string().optional(),
      recommendations: z.string().optional(),
      generatedBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(performanceReports).values({
        ...input,
        periodStart: new Date(input.periodStart),
        periodEnd: new Date(input.periodEnd),
      });
      return { id: result[0].insertId };
    }),

  // اقتراحات التحسين
  getImprovementSuggestions: publicProcedure
    .input(z.object({
      status: z.string().optional(),
      category: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      return await db.select().from(improvementSuggestions).orderBy(desc(improvementSuggestions.createdAt));
    }),

  createImprovementSuggestion: publicProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      priority: z.string().optional(),
      submittedBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(improvementSuggestions).values(input);
      return { id: result[0].insertId };
    }),

  reviewSuggestion: publicProcedure
    .input(z.object({
      id: z.number(),
      status: z.string(),
      reviewedBy: z.number(),
      feedback: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.update(improvementSuggestions).set({
        status: input.status,
        reviewedBy: input.reviewedBy,
        reviewedAt: new Date(),
        feedback: input.feedback,
      }).where(eq(improvementSuggestions.id, input.id));
      return { success: true };
    }),

  voteSuggestion: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const suggestion = await db.select().from(improvementSuggestions)
        .where(eq(improvementSuggestions.id, input.id));
      if (suggestion[0]) {
        await db.update(improvementSuggestions).set({
          votes: (suggestion[0].votes || 0) + 1,
        }).where(eq(improvementSuggestions.id, input.id));
      }
      return { success: true };
    }),

  // استطلاعات رضا المستخدمين
  submitSurvey: publicProcedure
    .input(z.object({
      userId: z.number().optional(),
      overallRating: z.number().optional(),
      easeOfUse: z.number().optional(),
      performance: z.number().optional(),
      features: z.number().optional(),
      support: z.number().optional(),
      comments: z.string().optional(),
      wouldRecommend: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(userSatisfactionSurveys).values(input);
      return { id: result[0].insertId };
    }),

  getSurveyResults: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const surveys = await db.select().from(userSatisfactionSurveys);
    
    const totalSurveys = surveys.length;
    if (totalSurveys === 0) {
      return {
        totalSurveys: 0,
        averageOverallRating: 0,
        averageEaseOfUse: 0,
        averagePerformance: 0,
        averageFeatures: 0,
        averageSupport: 0,
        recommendationRate: 0,
      };
    }
    
    const avgOverall = surveys.reduce((sum, s) => sum + (s.overallRating || 0), 0) / totalSurveys;
    const avgEase = surveys.reduce((sum, s) => sum + (s.easeOfUse || 0), 0) / totalSurveys;
    const avgPerf = surveys.reduce((sum, s) => sum + (s.performance || 0), 0) / totalSurveys;
    const avgFeat = surveys.reduce((sum, s) => sum + (s.features || 0), 0) / totalSurveys;
    const avgSupp = surveys.reduce((sum, s) => sum + (s.support || 0), 0) / totalSurveys;
    const recRate = surveys.filter(s => s.wouldRecommend).length / totalSurveys * 100;
    
    return {
      totalSurveys,
      averageOverallRating: avgOverall.toFixed(1),
      averageEaseOfUse: avgEase.toFixed(1),
      averagePerformance: avgPerf.toFixed(1),
      averageFeatures: avgFeat.toFixed(1),
      averageSupport: avgSupp.toFixed(1),
      recommendationRate: recRate.toFixed(1),
    };
  }),

  // إحصائيات صحة النظام
  getSystemHealthStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const healthChecks = await db.select().from(systemHealthChecks);
    const activeAlerts = await db.select({ count: sql<number>`count(*)` }).from(systemAlerts)
      .where(eq(systemAlerts.status, 'active'));
    const criticalAlerts = await db.select({ count: sql<number>`count(*)` }).from(systemAlerts)
      .where(and(eq(systemAlerts.status, 'active'), eq(systemAlerts.severity, 'critical')));
    const totalSuggestions = await db.select({ count: sql<number>`count(*)` }).from(improvementSuggestions);
    const pendingSuggestions = await db.select({ count: sql<number>`count(*)` }).from(improvementSuggestions)
      .where(eq(improvementSuggestions.status, 'submitted'));
    
    const healthyServices = healthChecks.filter(h => h.lastStatus === 'healthy').length;
    const degradedServices = healthChecks.filter(h => h.lastStatus === 'degraded').length;
    const unhealthyServices = healthChecks.filter(h => h.lastStatus === 'unhealthy').length;
    
    return {
      totalHealthChecks: healthChecks.length,
      healthyServices,
      degradedServices,
      unhealthyServices,
      activeAlerts: activeAlerts[0]?.count || 0,
      criticalAlerts: criticalAlerts[0]?.count || 0,
      totalSuggestions: totalSuggestions[0]?.count || 0,
      pendingSuggestions: pendingSuggestions[0]?.count || 0,
    };
  }),
});
