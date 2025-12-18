import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { eq, desc } from 'drizzle-orm';
import {
  fieldInspections,
  inspectionItems,
  approvalSignatures,
} from '../../drizzle/schema';

export const inspectionsRouter = router({
  // --- الفحوصات الميدانية ---
  getInspections: publicProcedure
    .input(z.object({
      status: z.string().optional(),
      inspectionType: z.string().optional(),
      inspectorId: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      let result = await db.select().from(fieldInspections).orderBy(desc(fieldInspections.inspectionDate));
      if (input?.status) {
        result = result.filter(i => i.status === input.status);
      }
      if (input?.inspectionType) {
        result = result.filter(i => i.inspectionType === input.inspectionType);
      }
      if (input?.inspectorId) {
        result = result.filter(i => i.inspectorId === input.inspectorId);
      }
      return result;
    }),

  getInspectionById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const inspection = await db.select().from(fieldInspections).where(eq(fieldInspections.id, input.id));
      const items = await db.select().from(inspectionItems).where(eq(inspectionItems.inspectionId, input.id));
      const signatures = await db.select().from(approvalSignatures)
        .where(eq(approvalSignatures.entityType, 'inspection'))
        .orderBy(desc(approvalSignatures.signedAt));
      const relatedSignatures = signatures.filter(s => s.entityId === input.id);
      return { inspection: inspection[0], items, signatures: relatedSignatures };
    }),

  createInspection: publicProcedure
    .input(z.object({
      inspectionNumber: z.string(),
      inspectionType: z.string(),
      relatedTaskId: z.number().optional(),
      relatedWorkOrderId: z.number().optional(),
      inspectorId: z.number(),
      inspectionDate: z.string(),
      location: z.string().optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(fieldInspections).values({
        inspectionNumber: input.inspectionNumber,
        inspectionType: input.inspectionType,
        relatedTaskId: input.relatedTaskId,
        relatedWorkOrderId: input.relatedWorkOrderId,
        inspectorId: input.inspectorId,
        inspectionDate: new Date(input.inspectionDate),
        location: input.location,
        latitude: input.latitude,
        longitude: input.longitude,
      });
      return { success: true, id: result[0].insertId };
    }),

  addInspectionItem: publicProcedure
    .input(z.object({
      inspectionId: z.number(),
      checklistItemId: z.number().optional(),
      itemName: z.string(),
      expectedValue: z.string().optional(),
      actualValue: z.string().optional(),
      isPassed: z.boolean().optional(),
      score: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(inspectionItems).values({
        inspectionId: input.inspectionId,
        checklistItemId: input.checklistItemId,
        itemName: input.itemName,
        expectedValue: input.expectedValue,
        actualValue: input.actualValue,
        isPassed: input.isPassed,
        score: input.score,
        notes: input.notes,
      });
      return { success: true, id: result[0].insertId };
    }),

  completeInspection: publicProcedure
    .input(z.object({
      id: z.number(),
      result: z.string(),
      score: z.string().optional(),
      findings: z.string().optional(),
      recommendations: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.update(fieldInspections)
        .set({
          status: 'completed',
          result: input.result,
          score: input.score,
          findings: input.findings,
          recommendations: input.recommendations,
        })
        .where(eq(fieldInspections.id, input.id));
      return { success: true };
    }),

  // --- الموافقات والتوقيعات ---
  getSignatures: publicProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.select().from(approvalSignatures)
        .where(eq(approvalSignatures.entityType, input.entityType))
        .orderBy(desc(approvalSignatures.signedAt));
      return result.filter(s => s.entityId === input.entityId);
    }),

  addSignature: publicProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.number(),
      signerId: z.number(),
      signerRole: z.string(),
      signatureType: z.string(),
      signatureData: z.string().optional(),
      ipAddress: z.string().optional(),
      deviceInfo: z.string().optional(),
      comments: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(approvalSignatures).values({
        entityType: input.entityType,
        entityId: input.entityId,
        signerId: input.signerId,
        signerRole: input.signerRole,
        signatureType: input.signatureType,
        signatureData: input.signatureData,
        signedAt: new Date(),
        ipAddress: input.ipAddress,
        deviceInfo: input.deviceInfo,
        comments: input.comments,
      });
      return { success: true, id: result[0].insertId };
    }),

  // --- إحصائيات ---
  getInspectionsStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const inspections = await db.select().from(fieldInspections);
    const signatures = await db.select().from(approvalSignatures);
    
    return {
      totalInspections: inspections.length,
      pendingInspections: inspections.filter(i => i.status === 'pending').length,
      completedInspections: inspections.filter(i => i.status === 'completed').length,
      passedInspections: inspections.filter(i => i.result === 'passed').length,
      failedInspections: inspections.filter(i => i.result === 'failed').length,
      totalSignatures: signatures.length,
      approvalSignatures: signatures.filter(s => s.signatureType === 'approval').length,
      rejectionSignatures: signatures.filter(s => s.signatureType === 'rejection').length,
    };
  }),
});
