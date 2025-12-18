import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import {
  fieldOperationPlans,
  fieldOperationSchedules,
  workerLocationTracking,
  workerPerformanceEvaluations,
  workerIncentives,
} from '../../drizzle/schema';

export const fieldOperationsAdvancedRouter = router({
  // --- خطط العمليات الميدانية ---
  getOperationPlans: publicProcedure
    .input(z.object({
      status: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.select().from(fieldOperationPlans).orderBy(desc(fieldOperationPlans.createdAt));
      if (input?.status) {
        return result.filter(p => p.status === input.status);
      }
      return result;
    }),

  getOperationPlanById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.select().from(fieldOperationPlans).where(eq(fieldOperationPlans.id, input.id));
      return result[0] || null;
    }),

  createOperationPlan: publicProcedure
    .input(z.object({
      planName: z.string(),
      planType: z.string(),
      description: z.string().optional(),
      startDate: z.string(),
      endDate: z.string(),
      priority: z.string().optional(),
      assignedTeamId: z.number().optional(),
      targetArea: z.string().optional(),
      estimatedCost: z.string().optional(),
      createdBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(fieldOperationPlans).values({
        planName: input.planName,
        planType: input.planType,
        description: input.description,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        priority: input.priority || 'medium',
        assignedTeamId: input.assignedTeamId,
        targetArea: input.targetArea,
        estimatedCost: input.estimatedCost,
        createdBy: input.createdBy,
      });
      return { success: true, id: result[0].insertId };
    }),

  updateOperationPlanStatus: publicProcedure
    .input(z.object({
      id: z.number(),
      status: z.string(),
      completionRate: z.string().optional(),
      actualCost: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.update(fieldOperationPlans)
        .set({
          status: input.status,
          completionRate: input.completionRate,
          actualCost: input.actualCost,
          updatedAt: new Date(),
        })
        .where(eq(fieldOperationPlans.id, input.id));
      return { success: true };
    }),

  // --- جداول العمليات ---
  getOperationSchedules: publicProcedure
    .input(z.object({
      planId: z.number().optional(),
      status: z.string().optional(),
      date: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      let result = await db.select().from(fieldOperationSchedules).orderBy(desc(fieldOperationSchedules.scheduledDate));
      if (input?.planId) {
        result = result.filter(s => s.planId === input.planId);
      }
      if (input?.status) {
        result = result.filter(s => s.status === input.status);
      }
      return result;
    }),

  createOperationSchedule: publicProcedure
    .input(z.object({
      planId: z.number(),
      taskName: z.string(),
      taskType: z.string(),
      scheduledDate: z.string(),
      scheduledTime: z.string().optional(),
      duration: z.number().optional(),
      assignedWorkerId: z.number().optional(),
      location: z.string().optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(fieldOperationSchedules).values({
        planId: input.planId,
        taskName: input.taskName,
        taskType: input.taskType,
        scheduledDate: new Date(input.scheduledDate),
        scheduledTime: input.scheduledTime,
        duration: input.duration,
        assignedWorkerId: input.assignedWorkerId,
        location: input.location,
        latitude: input.latitude,
        longitude: input.longitude,
        notes: input.notes,
      });
      return { success: true, id: result[0].insertId };
    }),

  // --- تتبع الموقع ---
  getWorkerLocations: publicProcedure
    .input(z.object({
      workerId: z.number().optional(),
      isOnline: z.boolean().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      let result = await db.select().from(workerLocationTracking).orderBy(desc(workerLocationTracking.lastSeen));
      if (input?.workerId) {
        result = result.filter(l => l.workerId === input.workerId);
      }
      if (input?.isOnline !== undefined) {
        result = result.filter(l => l.isOnline === input.isOnline);
      }
      return result;
    }),

  updateWorkerLocation: publicProcedure
    .input(z.object({
      workerId: z.number(),
      latitude: z.string(),
      longitude: z.string(),
      accuracy: z.string().optional(),
      speed: z.string().optional(),
      heading: z.string().optional(),
      altitude: z.string().optional(),
      batteryLevel: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(workerLocationTracking).values({
        workerId: input.workerId,
        latitude: input.latitude,
        longitude: input.longitude,
        accuracy: input.accuracy,
        speed: input.speed,
        heading: input.heading,
        altitude: input.altitude,
        batteryLevel: input.batteryLevel,
        isOnline: true,
        lastSeen: new Date(),
      });
      return { success: true, id: result[0].insertId };
    }),

  // --- تقييم الأداء ---
  getPerformanceEvaluations: publicProcedure
    .input(z.object({
      workerId: z.number().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      let result = await db.select().from(workerPerformanceEvaluations).orderBy(desc(workerPerformanceEvaluations.evaluationDate));
      if (input?.workerId) {
        result = result.filter(e => e.workerId === input.workerId);
      }
      if (input?.status) {
        result = result.filter(e => e.status === input.status);
      }
      return result;
    }),

  createPerformanceEvaluation: publicProcedure
    .input(z.object({
      workerId: z.number(),
      evaluationPeriod: z.string(),
      evaluationDate: z.string(),
      evaluatorId: z.number().optional(),
      tasksCompleted: z.number().optional(),
      tasksOnTime: z.number().optional(),
      qualityScore: z.string().optional(),
      attendanceScore: z.string().optional(),
      customerSatisfactionScore: z.string().optional(),
      overallScore: z.string().optional(),
      strengths: z.string().optional(),
      areasForImprovement: z.string().optional(),
      comments: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(workerPerformanceEvaluations).values({
        workerId: input.workerId,
        evaluationPeriod: input.evaluationPeriod,
        evaluationDate: new Date(input.evaluationDate),
        evaluatorId: input.evaluatorId,
        tasksCompleted: input.tasksCompleted,
        tasksOnTime: input.tasksOnTime,
        qualityScore: input.qualityScore,
        attendanceScore: input.attendanceScore,
        customerSatisfactionScore: input.customerSatisfactionScore,
        overallScore: input.overallScore,
        strengths: input.strengths,
        areasForImprovement: input.areasForImprovement,
        comments: input.comments,
      });
      return { success: true, id: result[0].insertId };
    }),

  // --- الحوافز والمكافآت ---
  getWorkerIncentives: publicProcedure
    .input(z.object({
      workerId: z.number().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      let result = await db.select().from(workerIncentives).orderBy(desc(workerIncentives.createdAt));
      if (input?.workerId) {
        result = result.filter(i => i.workerId === input.workerId);
      }
      if (input?.status) {
        result = result.filter(i => i.status === input.status);
      }
      return result;
    }),

  createWorkerIncentive: publicProcedure
    .input(z.object({
      workerId: z.number(),
      incentiveType: z.string(),
      amount: z.string(),
      reason: z.string(),
      relatedTaskId: z.number().optional(),
      evaluationId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(workerIncentives).values({
        workerId: input.workerId,
        incentiveType: input.incentiveType,
        amount: input.amount,
        reason: input.reason,
        relatedTaskId: input.relatedTaskId,
        evaluationId: input.evaluationId,
      });
      return { success: true, id: result[0].insertId };
    }),

  approveIncentive: publicProcedure
    .input(z.object({
      id: z.number(),
      approvedBy: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.update(workerIncentives)
        .set({
          status: 'approved',
          approvedBy: input.approvedBy,
          approvedAt: new Date(),
        })
        .where(eq(workerIncentives.id, input.id));
      return { success: true };
    }),

  // --- إحصائيات ---
  getFieldOperationsStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const plans = await db.select().from(fieldOperationPlans);
    const schedules = await db.select().from(fieldOperationSchedules);
    const locations = await db.select().from(workerLocationTracking);
    const evaluations = await db.select().from(workerPerformanceEvaluations);
    const incentives = await db.select().from(workerIncentives);
    
    return {
      totalPlans: plans.length,
      activePlans: plans.filter(p => p.status === 'active').length,
      completedPlans: plans.filter(p => p.status === 'completed').length,
      totalSchedules: schedules.length,
      pendingSchedules: schedules.filter(s => s.status === 'scheduled').length,
      onlineWorkers: locations.filter(l => l.isOnline).length,
      totalEvaluations: evaluations.length,
      totalIncentives: incentives.length,
      pendingIncentives: incentives.filter(i => i.status === 'pending').length,
    };
  }),
});
