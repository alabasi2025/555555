import { z } from 'zod';
import { router, publicProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { 
  maintenanceWindows, 
  systemUpdates,
  changeLog
} from '../../drizzle/schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';

export const systemMaintenanceRouter = router({
  // نوافذ الصيانة
  getMaintenanceWindows: publicProcedure
    .input(z.object({
      status: z.string().optional(),
      type: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      return await db.select().from(maintenanceWindows).orderBy(desc(maintenanceWindows.scheduledStart));
    }),

  getMaintenanceWindowById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.select().from(maintenanceWindows)
        .where(eq(maintenanceWindows.id, input.id));
      return result[0] || null;
    }),

  getUpcomingMaintenance: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const now = new Date();
    return await db.select().from(maintenanceWindows)
      .where(and(
        eq(maintenanceWindows.status, 'scheduled'),
        gte(maintenanceWindows.scheduledStart, now)
      ))
      .orderBy(maintenanceWindows.scheduledStart);
  }),

  createMaintenanceWindow: publicProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      type: z.string(),
      scheduledStart: z.string(),
      scheduledEnd: z.string(),
      affectedServices: z.any().optional(),
      createdBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(maintenanceWindows).values({
        ...input,
        scheduledStart: new Date(input.scheduledStart),
        scheduledEnd: new Date(input.scheduledEnd),
      });
      return { id: result[0].insertId };
    }),

  updateMaintenanceWindow: publicProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      type: z.string().optional(),
      status: z.string().optional(),
      scheduledStart: z.string().optional(),
      scheduledEnd: z.string().optional(),
      affectedServices: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { id, scheduledStart, scheduledEnd, ...rest } = input;
      
      const updateData: any = { ...rest };
      if (scheduledStart) updateData.scheduledStart = new Date(scheduledStart);
      if (scheduledEnd) updateData.scheduledEnd = new Date(scheduledEnd);
      
      await db.update(maintenanceWindows).set(updateData).where(eq(maintenanceWindows.id, id));
      return { success: true };
    }),

  startMaintenance: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.update(maintenanceWindows).set({
        status: 'in_progress',
        actualStart: new Date(),
      }).where(eq(maintenanceWindows.id, input.id));
      return { success: true };
    }),

  completeMaintenance: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.update(maintenanceWindows).set({
        status: 'completed',
        actualEnd: new Date(),
      }).where(eq(maintenanceWindows.id, input.id));
      return { success: true };
    }),

  cancelMaintenance: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.update(maintenanceWindows).set({
        status: 'cancelled',
      }).where(eq(maintenanceWindows.id, input.id));
      return { success: true };
    }),

  // التحديثات والإصدارات
  getUpdates: publicProcedure
    .input(z.object({
      status: z.string().optional(),
      releaseType: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      return await db.select().from(systemUpdates).orderBy(desc(systemUpdates.createdAt));
    }),

  getUpdateById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.select().from(systemUpdates)
        .where(eq(systemUpdates.id, input.id));
      return result[0] || null;
    }),

  getLatestRelease: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const result = await db.select().from(systemUpdates)
      .where(eq(systemUpdates.status, 'released'))
      .orderBy(desc(systemUpdates.releaseDate))
      .limit(1);
    return result[0] || null;
  }),

  createUpdate: publicProcedure
    .input(z.object({
      version: z.string(),
      releaseType: z.string(),
      title: z.string(),
      description: z.string().optional(),
      changelog: z.string().optional(),
      breakingChanges: z.string().optional(),
      downloadUrl: z.string().optional(),
      createdBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(systemUpdates).values(input);
      return { id: result[0].insertId };
    }),

  updateUpdate: publicProcedure
    .input(z.object({
      id: z.number(),
      version: z.string().optional(),
      releaseType: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      changelog: z.string().optional(),
      breakingChanges: z.string().optional(),
      status: z.string().optional(),
      releaseDate: z.string().optional(),
      downloadUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { id, releaseDate, ...rest } = input;
      
      const updateData: any = { ...rest };
      if (releaseDate) updateData.releaseDate = new Date(releaseDate);
      
      await db.update(systemUpdates).set(updateData).where(eq(systemUpdates.id, id));
      return { success: true };
    }),

  releaseUpdate: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.update(systemUpdates).set({
        status: 'released',
        releaseDate: new Date(),
      }).where(eq(systemUpdates.id, input.id));
      return { success: true };
    }),

  // سجل التغييرات
  getChangeLogs: publicProcedure
    .input(z.object({ updateId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      return await db.select().from(changeLog).orderBy(desc(changeLog.createdAt));
    }),

  createChangeLog: publicProcedure
    .input(z.object({
      updateId: z.number().optional(),
      changeType: z.string(),
      module: z.string().optional(),
      description: z.string(),
      issueReference: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(changeLog).values(input);
      return { id: result[0].insertId };
    }),

  // إحصائيات الصيانة
  getSystemMaintenanceStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const totalWindows = await db.select({ count: sql<number>`count(*)` }).from(maintenanceWindows);
    const scheduledWindows = await db.select({ count: sql<number>`count(*)` }).from(maintenanceWindows)
      .where(eq(maintenanceWindows.status, 'scheduled'));
    const completedWindows = await db.select({ count: sql<number>`count(*)` }).from(maintenanceWindows)
      .where(eq(maintenanceWindows.status, 'completed'));
    
    const totalUpdates = await db.select({ count: sql<number>`count(*)` }).from(systemUpdates);
    const releasedUpdates = await db.select({ count: sql<number>`count(*)` }).from(systemUpdates)
      .where(eq(systemUpdates.status, 'released'));
    
    return {
      totalMaintenanceWindows: totalWindows[0]?.count || 0,
      scheduledWindows: scheduledWindows[0]?.count || 0,
      completedWindows: completedWindows[0]?.count || 0,
      totalUpdates: totalUpdates[0]?.count || 0,
      releasedUpdates: releasedUpdates[0]?.count || 0,
    };
  }),
});
