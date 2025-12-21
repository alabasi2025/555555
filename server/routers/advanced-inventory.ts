import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { inventoryAlerts, inventoryForecasts, inventoryLots, items, suppliers, inventoryMovements } from "../../drizzle/schema-pg";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";

export const advancedInventoryRouter = router({
  // ==========================================
  // تتبع الأصناف (Lots)
  // ==========================================
  
  getInventoryLots: publicProcedure
    .input(z.object({
      itemId: z.number().optional(),
      warehouseId: z.number().optional(),
      status: z.enum(["available", "reserved", "quarantine", "expired", "damaged"]).optional(),
      limit: z.number().default(100),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let query = db.select().from(inventoryLots);
      const conditions = [];
      
      if (input.itemId) {
        conditions.push(eq(inventoryLots.itemId, input.itemId));
      }
      if (input.warehouseId) {
        conditions.push(eq(inventoryLots.warehouseId, input.warehouseId));
      }
      if (input.status) {
        conditions.push(eq(inventoryLots.status, input.status));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return await query.orderBy(desc(inventoryLots.createdAt)).limit(input.limit);
    }),

  getInventoryLotById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.select().from(inventoryLots).where(eq(inventoryLots.id, input.id));
      return result[0] || null;
    }),

  createInventoryLot: publicProcedure
    .input(z.object({
      itemId: z.number(),
      warehouseId: z.number(),
      lotNumber: z.string(),
      batchNumber: z.string().optional(),
      serialNumber: z.string().optional(),
      quantity: z.number(),
      manufacturingDate: z.string().optional(),
      expiryDate: z.string().optional(),
      supplierId: z.number().optional(),
      unitCost: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(inventoryLots).values({
        itemId: input.itemId,
        warehouseId: input.warehouseId,
        lotNumber: input.lotNumber,
        batchNumber: input.batchNumber,
        serialNumber: input.serialNumber,
        quantity: input.quantity.toString(),
        availableQuantity: input.quantity.toString(),
        manufacturingDate: input.manufacturingDate ? new Date(input.manufacturingDate) : undefined,
        expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
        supplierId: input.supplierId,
        unitCost: input.unitCost?.toString(),
        notes: input.notes,
      });
      return { success: true, id: result[0].insertId };
    }),

  updateInventoryLotStatus: publicProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["available", "reserved", "quarantine", "expired", "damaged"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(inventoryLots).set({
        status: input.status,
        notes: input.notes,
      }).where(eq(inventoryLots.id, input.id));
      return { success: true };
    }),

  // ==========================================
  // تنبيهات المخزون
  // ==========================================

  getInventoryAlerts: publicProcedure
    .input(z.object({
      alertType: z.enum(["low_stock", "overstock", "expiring", "expired", "reorder_point", "stockout"]).optional(),
      isResolved: z.boolean().optional(),
      severity: z.enum(["info", "warning", "critical"]).optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let query = db.select().from(inventoryAlerts);
      const conditions = [];
      
      if (input.alertType) {
        conditions.push(eq(inventoryAlerts.alertType, input.alertType));
      }
      if (input.isResolved !== undefined) {
        conditions.push(eq(inventoryAlerts.isResolved, input.isResolved));
      }
      if (input.severity) {
        conditions.push(eq(inventoryAlerts.severity, input.severity));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return await query.orderBy(desc(inventoryAlerts.createdAt)).limit(input.limit);
    }),

  createInventoryAlert: publicProcedure
    .input(z.object({
      itemId: z.number(),
      warehouseId: z.number().optional(),
      alertType: z.enum(["low_stock", "overstock", "expiring", "expired", "reorder_point", "stockout"]),
      severity: z.enum(["info", "warning", "critical"]).optional(),
      message: z.string(),
      currentValue: z.number().optional(),
      thresholdValue: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(inventoryAlerts).values({
        itemId: input.itemId,
        warehouseId: input.warehouseId,
        alertType: input.alertType,
        severity: input.severity,
        message: input.message,
        currentValue: input.currentValue?.toString(),
        thresholdValue: input.thresholdValue?.toString(),
      });
      return { success: true, id: result[0].insertId };
    }),

  acknowledgeAlert: publicProcedure
    .input(z.object({
      alertId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(inventoryAlerts).set({
        isRead: true,
      }).where(eq(inventoryAlerts.id, input.alertId));
      return { success: true };
    }),

  resolveAlert: publicProcedure
    .input(z.object({
      alertId: z.number(),
      resolvedBy: z.number(),
      resolution: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(inventoryAlerts).set({
        isResolved: true,
        resolvedBy: input.resolvedBy,
        resolvedAt: new Date(),
        resolutionNotes: input.resolution,
      }).where(eq(inventoryAlerts.id, input.alertId));
      return { success: true };
    }),

  // ==========================================
  // تنبؤات المخزون
  // ==========================================

  getInventoryForecasts: publicProcedure
    .input(z.object({
      itemId: z.number().optional(),
      warehouseId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let query = db.select().from(inventoryForecasts);
      const conditions = [];
      
      if (input.itemId) {
        conditions.push(eq(inventoryForecasts.itemId, input.itemId));
      }
      if (input.warehouseId) {
        conditions.push(eq(inventoryForecasts.warehouseId, input.warehouseId));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return await query.orderBy(desc(inventoryForecasts.forecastDate));
    }),

  createInventoryForecast: publicProcedure
    .input(z.object({
      itemId: z.number(),
      warehouseId: z.number().optional(),
      forecastType: z.enum(["demand", "supply", "stock_level"]),
      forecastDate: z.string(),
      forecastQuantity: z.number(),
      confidenceLevel: z.number().optional(),
      methodology: z.string().optional(),
      factors: z.any().optional(),
      }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(inventoryForecasts).values({
        itemId: input.itemId,
        warehouseId: input.warehouseId,
        forecastType: input.forecastType,
        forecastDate: new Date(input.forecastDate),
        forecastQuantity: input.forecastQuantity.toString(),
        confidenceLevel: input.confidenceLevel?.toString(),
        methodology: input.methodology,
        factors: input.factors,
      });
      return { success: true, id: result[0].insertId };
    }),

  // ==========================================
  // حركات المخزون
  // ==========================================

  getInventoryMovements: publicProcedure
    .input(z.object({
      itemId: z.number().optional(),
      movementType: z.enum(["in", "out", "transfer", "adjustment"]).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      limit: z.number().default(100),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let query = db.select().from(inventoryMovements);
      const conditions = [];
      
      if (input.itemId) {
        conditions.push(eq(inventoryMovements.itemId, input.itemId));
      }
      if (input.movementType) {
        conditions.push(eq(inventoryMovements.movementType, input.movementType));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return await query.orderBy(desc(inventoryMovements.movementDate)).limit(input.limit);
    }),

  createInventoryMovement: publicProcedure
    .input(z.object({
      itemId: z.number(),
      movementType: z.enum(["in", "out", "transfer", "adjustment"]),
      quantity: z.number(),
      unitCost: z.number().optional(),
      referenceType: z.string().optional(),
      referenceId: z.number().optional(),
      notes: z.string().optional(),
      createdBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const movementNumber = `MOV-${Date.now()}`;
      const totalCost = (input.quantity * (input.unitCost || 0)).toString();
      
      const result = await db.insert(inventoryMovements).values({
        movementNumber,
        itemId: input.itemId,
        movementType: input.movementType,
        quantity: input.quantity.toString(),
        unitCost: (input.unitCost || 0).toString(),
        totalCost,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        notes: input.notes,
        createdBy: input.createdBy,
        movementDate: new Date(),
      });
      return { success: true, id: result[0].insertId };
    }),

  // ==========================================
  // تحليلات المخزون
  // ==========================================

  getInventoryAnalytics: publicProcedure
    .input(z.object({
      warehouseId: z.number().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // إجمالي الأصناف
      const totalItems = await db.select({ count: sql<number>`count(*)` }).from(items);
      
      // إجمالي الموردين
      const totalSuppliers = await db.select({ count: sql<number>`count(*)` }).from(suppliers);
      
      // التنبيهات النشطة
      const activeAlerts = await db.select({ count: sql<number>`count(*)` }).from(inventoryAlerts).where(eq(inventoryAlerts.isResolved, false));
      
      // التنبيهات الحرجة
      const criticalAlerts = await db.select({ count: sql<number>`count(*)` }).from(inventoryAlerts).where(and(eq(inventoryAlerts.isResolved, false), eq(inventoryAlerts.severity, "critical")));
      
      // الدفعات النشطة
      const activeLots = await db.select({ count: sql<number>`count(*)` }).from(inventoryLots).where(eq(inventoryLots.status, "available"));
      
      // الدفعات المنتهية الصلاحية
      const expiredLots = await db.select({ count: sql<number>`count(*)` }).from(inventoryLots).where(eq(inventoryLots.status, "expired"));
      
      return {
        totalItems: totalItems[0]?.count || 0,
        totalSuppliers: totalSuppliers[0]?.count || 0,
        activeAlerts: activeAlerts[0]?.count || 0,
        criticalAlerts: criticalAlerts[0]?.count || 0,
        activeLots: activeLots[0]?.count || 0,
        expiredLots: expiredLots[0]?.count || 0,
      };
    }),

  // ==========================================
  // تقارير المخزون
  // ==========================================

  getStockReport: publicProcedure
    .input(z.object({
      warehouseId: z.number().optional(),
      categoryId: z.number().optional(),
      lowStockOnly: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const itemsList = await db.select().from(items);
      
      return {
        items: itemsList,
        summary: {
          totalItems: itemsList.length,
          totalValue: itemsList.reduce((sum, item) => sum + parseFloat(item.unitCost || "0") * parseFloat(item.currentQuantity || "0"), 0),
        },
      };
    }),

  getExpiringItemsReport: publicProcedure
    .input(z.object({
      daysAhead: z.number().default(30),
      warehouseId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + input.daysAhead);
      
      let query = db.select().from(inventoryLots)
        .where(and(
          eq(inventoryLots.status, "available"),
          lte(inventoryLots.expiryDate, futureDate)
        ));
      
      return await query.orderBy(inventoryLots.expiryDate);
    }),

  getSlowMovingItemsReport: publicProcedure
    .input(z.object({
      daysSinceLastMovement: z.number().default(90),
      warehouseId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // الأصناف التي لم تتحرك منذ فترة
      const itemsList = await db.select().from(items);
      
      return {
        items: itemsList,
        criteria: {
          daysSinceLastMovement: input.daysSinceLastMovement,
        },
      };
    }),
});
