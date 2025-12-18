import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { eq, desc } from 'drizzle-orm';
import {
  assetDepreciationRecords,
  assetInventoryCounts,
  assetInventoryCountItems,
} from '../../drizzle/schema';

export const assetsManagementRouter = router({
  // --- سجلات الاستهلاك ---
  getDepreciationRecords: publicProcedure
    .input(z.object({
      assetId: z.number().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      let result = await db.select().from(assetDepreciationRecords).orderBy(desc(assetDepreciationRecords.periodEnd));
      if (input?.assetId) {
        result = result.filter(r => r.assetId === input.assetId);
      }
      if (input?.status) {
        result = result.filter(r => r.status === input.status);
      }
      return result;
    }),

  createDepreciationRecord: publicProcedure
    .input(z.object({
      assetId: z.number(),
      depreciationMethod: z.string(),
      periodStart: z.string(),
      periodEnd: z.string(),
      openingValue: z.string(),
      depreciationAmount: z.string(),
      accumulatedDepreciation: z.string(),
      closingValue: z.string(),
      journalEntryId: z.number().optional(),
      createdBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(assetDepreciationRecords).values({
        assetId: input.assetId,
        depreciationMethod: input.depreciationMethod,
        periodStart: new Date(input.periodStart),
        periodEnd: new Date(input.periodEnd),
        openingValue: input.openingValue,
        depreciationAmount: input.depreciationAmount,
        accumulatedDepreciation: input.accumulatedDepreciation,
        closingValue: input.closingValue,
        journalEntryId: input.journalEntryId,
        createdBy: input.createdBy,
      });
      return { success: true, id: result[0].insertId };
    }),

  calculateDepreciation: publicProcedure
    .input(z.object({
      assetId: z.number(),
      method: z.string(),
      originalValue: z.string(),
      salvageValue: z.string(),
      usefulLifeYears: z.number(),
      periodStart: z.string(),
      periodEnd: z.string(),
    }))
    .mutation(async ({ input }) => {
      const originalValue = parseFloat(input.originalValue);
      const salvageValue = parseFloat(input.salvageValue);
      const usefulLifeYears = input.usefulLifeYears;
      
      let depreciationAmount = 0;
      
      if (input.method === 'straight_line') {
        // القسط الثابت
        depreciationAmount = (originalValue - salvageValue) / usefulLifeYears;
      } else if (input.method === 'declining_balance') {
        // القسط المتناقص
        const rate = 2 / usefulLifeYears;
        depreciationAmount = originalValue * rate;
      }
      
      return {
        depreciationAmount: depreciationAmount.toFixed(2),
        annualRate: ((depreciationAmount / originalValue) * 100).toFixed(2),
      };
    }),

  // --- جرد الأصول ---
  getAssetInventoryCounts: publicProcedure
    .input(z.object({
      status: z.string().optional(),
      locationId: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      let result = await db.select().from(assetInventoryCounts).orderBy(desc(assetInventoryCounts.countDate));
      if (input?.status) {
        result = result.filter(c => c.status === input.status);
      }
      if (input?.locationId) {
        result = result.filter(c => c.locationId === input.locationId);
      }
      return result;
    }),

  getAssetInventoryCountById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const count = await db.select().from(assetInventoryCounts).where(eq(assetInventoryCounts.id, input.id));
      const items = await db.select().from(assetInventoryCountItems).where(eq(assetInventoryCountItems.countId, input.id));
      return { count: count[0], items };
    }),

  createAssetInventoryCount: publicProcedure
    .input(z.object({
      countNumber: z.string(),
      countDate: z.string(),
      locationId: z.number().optional(),
      categoryId: z.number().optional(),
      notes: z.string().optional(),
      conductedBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(assetInventoryCounts).values({
        countNumber: input.countNumber,
        countDate: new Date(input.countDate),
        locationId: input.locationId,
        categoryId: input.categoryId,
        notes: input.notes,
        conductedBy: input.conductedBy,
      });
      return { success: true, id: result[0].insertId };
    }),

  addAssetCountItem: publicProcedure
    .input(z.object({
      countId: z.number(),
      assetId: z.number(),
      expectedLocation: z.string().optional(),
      actualLocation: z.string().optional(),
      expectedCondition: z.string().optional(),
      actualCondition: z.string().optional(),
      isFound: z.boolean().optional(),
      hasDiscrepancy: z.boolean().optional(),
      discrepancyType: z.string().optional(),
      notes: z.string().optional(),
      countedBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(assetInventoryCountItems).values({
        countId: input.countId,
        assetId: input.assetId,
        expectedLocation: input.expectedLocation,
        actualLocation: input.actualLocation,
        expectedCondition: input.expectedCondition,
        actualCondition: input.actualCondition,
        isFound: input.isFound ?? true,
        hasDiscrepancy: input.hasDiscrepancy ?? false,
        discrepancyType: input.discrepancyType,
        notes: input.notes,
        countedBy: input.countedBy,
        countedAt: new Date(),
      });
      
      // تحديث إحصائيات الجرد
      const countItems = await db.select().from(assetInventoryCountItems).where(eq(assetInventoryCountItems.countId, input.countId));
      const totalAssets = countItems.length;
      const countedAssets = countItems.filter(i => i.countedAt).length;
      const matchedAssets = countItems.filter(i => !i.hasDiscrepancy).length;
      const discrepancies = countItems.filter(i => i.hasDiscrepancy).length;
      
      await db.update(assetInventoryCounts)
        .set({ totalAssets, countedAssets, matchedAssets, discrepancies })
        .where(eq(assetInventoryCounts.id, input.countId));
      
      return { success: true, id: result[0].insertId };
    }),

  completeAssetInventoryCount: publicProcedure
    .input(z.object({
      id: z.number(),
      approvedBy: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.update(assetInventoryCounts)
        .set({
          status: 'completed',
          approvedBy: input.approvedBy,
          notes: input.notes,
        })
        .where(eq(assetInventoryCounts.id, input.id));
      return { success: true };
    }),

  // --- إحصائيات ---
  getAssetsManagementStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const depreciationRecords = await db.select().from(assetDepreciationRecords);
    const inventoryCounts = await db.select().from(assetInventoryCounts);
    const countItems = await db.select().from(assetInventoryCountItems);
    
    const totalDepreciation = depreciationRecords.reduce((sum, r) => sum + parseFloat(r.depreciationAmount || '0'), 0);
    
    return {
      totalDepreciationRecords: depreciationRecords.length,
      totalDepreciationAmount: totalDepreciation.toFixed(2),
      totalInventoryCounts: inventoryCounts.length,
      inProgressCounts: inventoryCounts.filter(c => c.status === 'in_progress').length,
      completedCounts: inventoryCounts.filter(c => c.status === 'completed').length,
      totalCountItems: countItems.length,
      discrepanciesFound: countItems.filter(i => i.hasDiscrepancy).length,
      missingAssets: countItems.filter(i => !i.isFound).length,
    };
  }),
});
