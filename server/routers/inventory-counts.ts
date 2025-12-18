import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  inventoryCounts, 
  inventoryCountItems, 
  inventoryAdjustments, 
  inventoryAdjustmentItems,
  warehouseStock,
  items
} from "../../drizzle/schema";
import { eq, and, desc, sql, like, or } from "drizzle-orm";

export const inventoryCountsRouter = router({
  // ============================================
  // عمليات الجرد
  // ============================================

  // الحصول على جميع عمليات الجرد
  getAll: publicProcedure
    .input(z.object({
      status: z.enum(["draft", "in_progress", "pending_approval", "approved", "cancelled"]).optional(),
      countType: z.enum(["full", "partial", "cycle", "spot"]).optional(),
      warehouseId: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let query = db.select().from(inventoryCounts);
      
      const conditions = [];
      if (input?.status) {
        conditions.push(eq(inventoryCounts.status, input.status));
      }
      if (input?.countType) {
        conditions.push(eq(inventoryCounts.countType, input.countType));
      }
      if (input?.warehouseId) {
        conditions.push(eq(inventoryCounts.warehouseId, input.warehouseId));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return query.orderBy(desc(inventoryCounts.createdAt));
    }),

  // الحصول على عملية جرد بالمعرف
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const count = await db.select().from(inventoryCounts).where(eq(inventoryCounts.id, input.id));
      if (!count[0]) return null;
      
      const countItems = await db.select().from(inventoryCountItems).where(eq(inventoryCountItems.countId, input.id));
      
      return { ...count[0], items: countItems };
    }),

  // إنشاء عملية جرد جديدة
  create: publicProcedure
    .input(z.object({
      countNumber: z.string().min(1),
      countType: z.enum(["full", "partial", "cycle", "spot"]),
      warehouseId: z.number(),
      countDate: z.string(),
      notes: z.string().optional(),
      itemIds: z.array(z.number()).optional(), // للجرد الجزئي
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(inventoryCounts).values({
        countNumber: input.countNumber,
        countType: input.countType,
        warehouseId: input.warehouseId,
        countDate: new Date(input.countDate),
        status: "draft",
        notes: input.notes,
      });
      
      const countId = result[0].insertId;
      
      // إضافة الأصناف للجرد
      if (input.countType === "full") {
        // جرد كامل - إضافة جميع أصناف المستودع
        const stock = await db.select().from(warehouseStock).where(eq(warehouseStock.warehouseId, input.warehouseId));
        
        for (const s of stock) {
          await db.insert(inventoryCountItems).values({
            countId,
            itemId: s.itemId,
            locationId: s.locationId,
            systemQuantity: s.quantity,
          });
        }
      } else if (input.itemIds && input.itemIds.length > 0) {
        // جرد جزئي - إضافة الأصناف المحددة فقط
        for (const itemId of input.itemIds) {
          const stock = await db.select().from(warehouseStock)
            .where(and(
              eq(warehouseStock.warehouseId, input.warehouseId),
              eq(warehouseStock.itemId, itemId)
            ));
          
          await db.insert(inventoryCountItems).values({
            countId,
            itemId,
            locationId: stock[0]?.locationId,
            systemQuantity: stock[0]?.quantity || "0",
          });
        }
      }
      
      return { id: countId, success: true };
    }),

  // بدء عملية الجرد
  start: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(inventoryCounts).set({ status: "in_progress" }).where(eq(inventoryCounts.id, input.id));
      return { success: true };
    }),

  // تسجيل عد صنف
  recordCount: publicProcedure
    .input(z.object({
      countItemId: z.number(),
      countedQuantity: z.string(),
      countedBy: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // الحصول على الكمية النظامية
      const item = await db.select().from(inventoryCountItems).where(eq(inventoryCountItems.id, input.countItemId));
      if (!item[0]) throw new Error("الصنف غير موجود");
      
      const systemQty = parseFloat(item[0].systemQuantity);
      const countedQty = parseFloat(input.countedQuantity);
      const variance = countedQty - systemQty;
      
      // الحصول على تكلفة الوحدة لحساب قيمة الفرق
      const itemData = await db.select().from(items).where(eq(items.id, item[0].itemId));
      const unitCost = parseFloat(itemData[0]?.unitCost || "0");
      const varianceValue = variance * unitCost;
      
      await db.update(inventoryCountItems).set({
        countedQuantity: input.countedQuantity,
        variance: variance.toFixed(3),
        varianceValue: varianceValue.toFixed(2),
        countedBy: input.countedBy,
        countedAt: new Date(),
        notes: input.notes,
      }).where(eq(inventoryCountItems.id, input.countItemId));
      
      return { success: true, variance, varianceValue };
    }),

  // إرسال للموافقة
  submitForApproval: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // التحقق من أن جميع الأصناف تم عدها
      const uncounted = await db.select({ count: sql<number>`count(*)` }).from(inventoryCountItems)
        .where(and(
          eq(inventoryCountItems.countId, input.id),
          sql`counted_quantity IS NULL`
        ));
      
      if (uncounted[0]?.count > 0) {
        throw new Error(`يوجد ${uncounted[0].count} صنف لم يتم عدها بعد`);
      }
      
      await db.update(inventoryCounts).set({ status: "pending_approval" }).where(eq(inventoryCounts.id, input.id));
      return { success: true };
    }),

  // الموافقة على الجرد
  approve: publicProcedure
    .input(z.object({
      id: z.number(),
      approvedBy: z.number(),
      createAdjustment: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // تحديث حالة الجرد
      await db.update(inventoryCounts).set({
        status: "approved",
        approvedBy: input.approvedBy,
        approvedAt: new Date(),
      }).where(eq(inventoryCounts.id, input.id));
      
      // إنشاء تسوية المخزون إذا طُلب ذلك
      if (input.createAdjustment) {
        const count = await db.select().from(inventoryCounts).where(eq(inventoryCounts.id, input.id));
        const countItems = await db.select().from(inventoryCountItems)
          .where(and(
            eq(inventoryCountItems.countId, input.id),
            sql`variance != 0`
          ));
        
        if (countItems.length > 0) {
          const totalValue = countItems.reduce((sum, item) => sum + parseFloat(item.varianceValue || "0"), 0);
          
          const adjustmentResult = await db.insert(inventoryAdjustments).values({
            adjustmentNumber: `ADJ-${Date.now()}`,
            countId: input.id,
            warehouseId: count[0].warehouseId,
            adjustmentDate: new Date(),
            adjustmentType: "count_variance",
            status: "approved",
            totalValue: totalValue.toFixed(2),
            approvedBy: input.approvedBy,
            notes: `تسوية ناتجة عن الجرد رقم ${count[0].countNumber}`,
          });
          
          const adjustmentId = adjustmentResult[0].insertId;
          
          for (const item of countItems) {
            await db.insert(inventoryAdjustmentItems).values({
              adjustmentId,
              itemId: item.itemId,
              locationId: item.locationId,
              adjustmentQuantity: item.variance || "0",
              unitCost: (parseFloat(item.varianceValue || "0") / parseFloat(item.variance || "1")).toFixed(2),
              totalValue: item.varianceValue || "0",
              reason: "فرق جرد",
            });
            
            // تحديث المخزون الفعلي
            await db.update(warehouseStock).set({
              quantity: item.countedQuantity || "0",
              lastCountDate: new Date(),
            }).where(and(
              eq(warehouseStock.itemId, item.itemId),
              eq(warehouseStock.warehouseId, count[0].warehouseId)
            ));
          }
        }
      }
      
      return { success: true };
    }),

  // رفض الجرد
  reject: publicProcedure
    .input(z.object({
      id: z.number(),
      reason: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(inventoryCounts).set({
        status: "draft",
        notes: sql`CONCAT(IFNULL(notes, ''), '\n[مرفوض]: ', ${input.reason})`,
      }).where(eq(inventoryCounts.id, input.id));
      return { success: true };
    }),

  // إلغاء الجرد
  cancel: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(inventoryCounts).set({ status: "cancelled" }).where(eq(inventoryCounts.id, input.id));
      return { success: true };
    }),

  // ============================================
  // تسويات المخزون
  // ============================================

  // الحصول على جميع التسويات
  getAdjustments: publicProcedure
    .input(z.object({
      status: z.enum(["draft", "pending_approval", "approved", "rejected"]).optional(),
      adjustmentType: z.enum(["count_variance", "damage", "expiry", "theft", "other"]).optional(),
      warehouseId: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let query = db.select().from(inventoryAdjustments);
      
      const conditions = [];
      if (input?.status) {
        conditions.push(eq(inventoryAdjustments.status, input.status));
      }
      if (input?.adjustmentType) {
        conditions.push(eq(inventoryAdjustments.adjustmentType, input.adjustmentType));
      }
      if (input?.warehouseId) {
        conditions.push(eq(inventoryAdjustments.warehouseId, input.warehouseId));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return query.orderBy(desc(inventoryAdjustments.createdAt));
    }),

  // إنشاء تسوية يدوية
  createAdjustment: publicProcedure
    .input(z.object({
      warehouseId: z.number(),
      adjustmentDate: z.string(),
      adjustmentType: z.enum(["count_variance", "damage", "expiry", "theft", "other"]),
      notes: z.string().optional(),
      items: z.array(z.object({
        itemId: z.number(),
        locationId: z.number().optional(),
        adjustmentQuantity: z.string(),
        unitCost: z.string(),
        reason: z.string().optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const totalValue = input.items.reduce((sum, item) => {
        return sum + (parseFloat(item.adjustmentQuantity) * parseFloat(item.unitCost));
      }, 0);
      
      const result = await db.insert(inventoryAdjustments).values({
        adjustmentNumber: `ADJ-${Date.now()}`,
        warehouseId: input.warehouseId,
        adjustmentDate: new Date(input.adjustmentDate),
        adjustmentType: input.adjustmentType,
        status: "draft",
        totalValue: totalValue.toFixed(2),
        notes: input.notes,
      });
      
      const adjustmentId = result[0].insertId;
      
      for (const item of input.items) {
        const itemTotal = parseFloat(item.adjustmentQuantity) * parseFloat(item.unitCost);
        await db.insert(inventoryAdjustmentItems).values({
          adjustmentId,
          itemId: item.itemId,
          locationId: item.locationId,
          adjustmentQuantity: item.adjustmentQuantity,
          unitCost: item.unitCost,
          totalValue: itemTotal.toFixed(2),
          reason: item.reason,
        });
      }
      
      return { id: adjustmentId, success: true };
    }),

  // الموافقة على تسوية
  approveAdjustment: publicProcedure
    .input(z.object({
      id: z.number(),
      approvedBy: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const adjustment = await db.select().from(inventoryAdjustments).where(eq(inventoryAdjustments.id, input.id));
      if (!adjustment[0]) throw new Error("التسوية غير موجودة");
      
      const adjustmentItems = await db.select().from(inventoryAdjustmentItems).where(eq(inventoryAdjustmentItems.adjustmentId, input.id));
      
      // تحديث المخزون
      for (const item of adjustmentItems) {
        const stock = await db.select().from(warehouseStock)
          .where(and(
            eq(warehouseStock.warehouseId, adjustment[0].warehouseId),
            eq(warehouseStock.itemId, item.itemId)
          ));
        
        if (stock[0]) {
          const newQty = parseFloat(stock[0].quantity) + parseFloat(item.adjustmentQuantity);
          await db.update(warehouseStock).set({
            quantity: newQty.toFixed(3),
            availableQuantity: (newQty - parseFloat(stock[0].reservedQuantity)).toFixed(3),
          }).where(eq(warehouseStock.id, stock[0].id));
        }
      }
      
      await db.update(inventoryAdjustments).set({
        status: "approved",
        approvedBy: input.approvedBy,
      }).where(eq(inventoryAdjustments.id, input.id));
      
      return { success: true };
    }),

  // إحصائيات الجرد
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
      if (!db) throw new Error("Database not available");
    
    const totalCounts = await db.select({ count: sql<number>`count(*)` }).from(inventoryCounts);
    const pendingCounts = await db.select({ count: sql<number>`count(*)` }).from(inventoryCounts).where(eq(inventoryCounts.status, "pending_approval"));
    const totalAdjustments = await db.select({ count: sql<number>`count(*)` }).from(inventoryAdjustments);
    const totalAdjustmentValue = await db.select({ sum: sql<number>`sum(total_value)` }).from(inventoryAdjustments).where(eq(inventoryAdjustments.status, "approved"));
    
    return {
      totalCounts: totalCounts[0]?.count || 0,
      pendingCounts: pendingCounts[0]?.count || 0,
      totalAdjustments: totalAdjustments[0]?.count || 0,
      totalAdjustmentValue: totalAdjustmentValue[0]?.sum || 0,
    };
  }),
});
