import { z } from 'zod';
import { router, publicProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { 
  deploymentEnvironments, 
  deployments, 
  deploymentLogs,
  launchChecklists,
  launchChecklistStatus
} from '../../drizzle/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

export const deploymentRouter = router({
  // بيئات النشر
  getEnvironments: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    return await db.select().from(deploymentEnvironments).orderBy(desc(deploymentEnvironments.createdAt));
  }),

  createEnvironment: publicProcedure
    .input(z.object({
      name: z.string(),
      type: z.string(),
      url: z.string().optional(),
      serverIp: z.string().optional(),
      databaseHost: z.string().optional(),
      databaseName: z.string().optional(),
      configuration: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(deploymentEnvironments).values(input);
      return { id: result[0].insertId };
    }),

  updateEnvironment: publicProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      type: z.string().optional(),
      url: z.string().optional(),
      serverIp: z.string().optional(),
      status: z.string().optional(),
      configuration: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { id, ...data } = input;
      await db.update(deploymentEnvironments).set(data).where(eq(deploymentEnvironments.id, id));
      return { success: true };
    }),

  // عمليات النشر
  getDeployments: publicProcedure
    .input(z.object({ environmentId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const query = db.select().from(deployments).orderBy(desc(deployments.createdAt));
      return await query;
    }),

  createDeployment: publicProcedure
    .input(z.object({
      environmentId: z.number(),
      version: z.string(),
      commitHash: z.string().optional(),
      branch: z.string().optional(),
      deployedBy: z.number(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(deployments).values({
        ...input,
        status: 'pending',
        startedAt: new Date(),
      });
      return { id: result[0].insertId };
    }),

  updateDeploymentStatus: publicProcedure
    .input(z.object({
      id: z.number(),
      status: z.string(),
      logs: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.status === 'success' || data.status === 'failed') {
        updateData.completedAt = new Date();
      }
      await db.update(deployments).set(updateData).where(eq(deployments.id, id));
      return { success: true };
    }),

  rollbackDeployment: publicProcedure
    .input(z.object({
      id: z.number(),
      rollbackVersion: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.update(deployments).set({
        status: 'rolled_back',
        rollbackVersion: input.rollbackVersion,
        completedAt: new Date(),
      }).where(eq(deployments.id, input.id));
      return { success: true };
    }),

  // سجلات النشر
  getDeploymentLogs: publicProcedure
    .input(z.object({ deploymentId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      return await db.select().from(deploymentLogs)
        .where(eq(deploymentLogs.deploymentId, input.deploymentId))
        .orderBy(deploymentLogs.createdAt);
    }),

  addDeploymentLog: publicProcedure
    .input(z.object({
      deploymentId: z.number(),
      step: z.string(),
      status: z.string(),
      message: z.string().optional(),
      duration: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(deploymentLogs).values(input);
      return { id: result[0].insertId };
    }),

  // قوائم فحص الإطلاق
  getLaunchChecklists: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    return await db.select().from(launchChecklists).orderBy(launchChecklists.order);
  }),

  createLaunchChecklist: publicProcedure
    .input(z.object({
      name: z.string(),
      category: z.string().optional(),
      description: z.string().optional(),
      isRequired: z.boolean().optional(),
      order: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(launchChecklists).values(input);
      return { id: result[0].insertId };
    }),

  getChecklistStatus: publicProcedure
    .input(z.object({ deploymentId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      return await db.select().from(launchChecklistStatus)
        .where(eq(launchChecklistStatus.deploymentId, input.deploymentId));
    }),

  updateChecklistStatus: publicProcedure
    .input(z.object({
      checklistId: z.number(),
      deploymentId: z.number(),
      status: z.string(),
      completedBy: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const existing = await db.select().from(launchChecklistStatus)
        .where(and(
          eq(launchChecklistStatus.checklistId, input.checklistId),
          eq(launchChecklistStatus.deploymentId, input.deploymentId)
        ));
      
      if (existing.length > 0) {
        await db.update(launchChecklistStatus).set({
          status: input.status,
          completedBy: input.completedBy,
          completedAt: input.status === 'completed' ? new Date() : null,
          notes: input.notes,
        }).where(eq(launchChecklistStatus.id, existing[0].id));
      } else {
        await db.insert(launchChecklistStatus).values({
          checklistId: input.checklistId,
          deploymentId: input.deploymentId,
          status: input.status,
          completedBy: input.completedBy,
          completedAt: input.status === 'completed' ? new Date() : undefined,
          notes: input.notes,
        });
      }
      return { success: true };
    }),

  // إحصائيات النشر
  getDeploymentStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const environments = await db.select({ count: sql<number>`count(*)` }).from(deploymentEnvironments);
    const totalDeployments = await db.select({ count: sql<number>`count(*)` }).from(deployments);
    const successfulDeployments = await db.select({ count: sql<number>`count(*)` }).from(deployments)
      .where(eq(deployments.status, 'success'));
    const failedDeployments = await db.select({ count: sql<number>`count(*)` }).from(deployments)
      .where(eq(deployments.status, 'failed'));
    
    return {
      totalEnvironments: environments[0]?.count || 0,
      totalDeployments: totalDeployments[0]?.count || 0,
      successfulDeployments: successfulDeployments[0]?.count || 0,
      failedDeployments: failedDeployments[0]?.count || 0,
      successRate: totalDeployments[0]?.count > 0 
        ? ((successfulDeployments[0]?.count || 0) / totalDeployments[0]?.count * 100).toFixed(1) 
        : '0',
    };
  }),
});
