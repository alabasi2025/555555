import { z } from 'zod';
import { router, publicProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { 
  dataMigrationTasks, 
  dataMigrationLogs,
  dataValidationRules,
  dataValidationResults
} from '../../drizzle/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

export const dataMigrationRouter = router({
  // مهام هجرة البيانات
  getTasks: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    return await db.select().from(dataMigrationTasks).orderBy(desc(dataMigrationTasks.createdAt));
  }),

  getTaskById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.select().from(dataMigrationTasks)
        .where(eq(dataMigrationTasks.id, input.id));
      return result[0] || null;
    }),

  createTask: publicProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      sourceSystem: z.string().optional(),
      targetTable: z.string().optional(),
      priority: z.number().optional(),
      totalRecords: z.number().optional(),
      mappingConfig: z.any().optional(),
      createdBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(dataMigrationTasks).values(input);
      return { id: result[0].insertId };
    }),

  updateTask: publicProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      status: z.string().optional(),
      processedRecords: z.number().optional(),
      failedRecords: z.number().optional(),
      errorLog: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { id, ...data } = input;
      await db.update(dataMigrationTasks).set(data).where(eq(dataMigrationTasks.id, id));
      return { success: true };
    }),

  startTask: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.update(dataMigrationTasks).set({
        status: 'in_progress',
        startedAt: new Date(),
      }).where(eq(dataMigrationTasks.id, input.id));
      return { success: true };
    }),

  completeTask: publicProcedure
    .input(z.object({ 
      id: z.number(),
      status: z.string(),
      errorLog: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.update(dataMigrationTasks).set({
        status: input.status,
        completedAt: new Date(),
        errorLog: input.errorLog,
      }).where(eq(dataMigrationTasks.id, input.id));
      return { success: true };
    }),

  deleteTask: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.delete(dataMigrationTasks).where(eq(dataMigrationTasks.id, input.id));
      return { success: true };
    }),

  // سجلات الهجرة
  getTaskLogs: publicProcedure
    .input(z.object({ taskId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      return await db.select().from(dataMigrationLogs)
        .where(eq(dataMigrationLogs.taskId, input.taskId))
        .orderBy(desc(dataMigrationLogs.createdAt));
    }),

  addTaskLog: publicProcedure
    .input(z.object({
      taskId: z.number(),
      recordId: z.string().optional(),
      sourceData: z.any().optional(),
      targetData: z.any().optional(),
      status: z.string(),
      errorMessage: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(dataMigrationLogs).values(input);
      return { id: result[0].insertId };
    }),

  // قواعد التحقق
  getValidationRules: publicProcedure
    .input(z.object({ tableName: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const query = db.select().from(dataValidationRules);
      return await query;
    }),

  createValidationRule: publicProcedure
    .input(z.object({
      tableName: z.string(),
      fieldName: z.string(),
      ruleType: z.string(),
      ruleConfig: z.any().optional(),
      errorMessage: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(dataValidationRules).values(input);
      return { id: result[0].insertId };
    }),

  updateValidationRule: publicProcedure
    .input(z.object({
      id: z.number(),
      ruleConfig: z.any().optional(),
      errorMessage: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { id, ...data } = input;
      await db.update(dataValidationRules).set(data).where(eq(dataValidationRules.id, id));
      return { success: true };
    }),

  deleteValidationRule: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.delete(dataValidationRules).where(eq(dataValidationRules.id, input.id));
      return { success: true };
    }),

  // نتائج التحقق
  getValidationResults: publicProcedure
    .input(z.object({ migrationTaskId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      return await db.select().from(dataValidationResults)
        .where(eq(dataValidationResults.migrationTaskId, input.migrationTaskId));
    }),

  addValidationResult: publicProcedure
    .input(z.object({
      migrationTaskId: z.number(),
      ruleId: z.number(),
      recordId: z.string().optional(),
      isValid: z.boolean(),
      errorDetails: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(dataValidationResults).values(input);
      return { id: result[0].insertId };
    }),

  // إحصائيات الهجرة
  getMigrationStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const totalTasks = await db.select({ count: sql<number>`count(*)` }).from(dataMigrationTasks);
    const completedTasks = await db.select({ count: sql<number>`count(*)` }).from(dataMigrationTasks)
      .where(eq(dataMigrationTasks.status, 'completed'));
    const inProgressTasks = await db.select({ count: sql<number>`count(*)` }).from(dataMigrationTasks)
      .where(eq(dataMigrationTasks.status, 'in_progress'));
    const failedTasks = await db.select({ count: sql<number>`count(*)` }).from(dataMigrationTasks)
      .where(eq(dataMigrationTasks.status, 'failed'));
    
    const totalRecords = await db.select({ 
      total: sql<number>`COALESCE(SUM(total_records), 0)`,
      processed: sql<number>`COALESCE(SUM(processed_records), 0)`,
      failed: sql<number>`COALESCE(SUM(failed_records), 0)`,
    }).from(dataMigrationTasks);
    
    return {
      totalTasks: totalTasks[0]?.count || 0,
      completedTasks: completedTasks[0]?.count || 0,
      inProgressTasks: inProgressTasks[0]?.count || 0,
      failedTasks: failedTasks[0]?.count || 0,
      totalRecords: totalRecords[0]?.total || 0,
      processedRecords: totalRecords[0]?.processed || 0,
      failedRecords: totalRecords[0]?.failed || 0,
    };
  }),
});
