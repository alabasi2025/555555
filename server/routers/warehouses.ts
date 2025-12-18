import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  warehouses, 
  warehouseLocations, 
  warehouseStock, 
  stockTransfers, 
  stockTransferItems 
} from "../../drizzle/schema";
import { eq, and, desc, sql, like, or } from "drizzle-orm";

export const warehousesRouter = router({
  // الحصول على جميع المستودعات
  getAll: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      type: z.enum(["main", "branch", "transit", "virtual"]).optional(),
      isActive: z.boolean().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let query = db.select().from(warehouses);
      
      const conditions = [];
      if (input?.search) {
        conditions.push(
          or(
            like(warehouses.warehouseCode, `%${input.search}%`),
            like(warehouses.warehouseName, `%${input.search}%`)
          )
        );
      }
      if (input?.type) {
        conditions.push(eq(warehouses.warehouseType, input.type));
      }
      if (input?.isActive !== undefined) {
        conditions.push(eq(warehouses.isActive, input.isActive));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return query.orderBy(desc(warehouses.createdAt));
    }),

  // الحصول على مستودع بالمعرف
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.select().from(warehouses).where(eq(warehouses.id, input.id));
      return result[0] || null;
    }),

  // إنشاء مستودع جديد
  create: publicProcedure
    .input(z.object({
      warehouseCode: z.string().min(1),
      warehouseName: z.string().min(1),
      warehouseType: z.enum(["main", "branch", "transit", "virtual"]).default("main"),
      address: z.string().optional(),
      city: z.string().optional(),
      region: z.string().optional(),
      managerId: z.number().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      capacity: z.string().optional(),
      isActive: z.boolean().default(true),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(warehouses).values({
        warehouseCode: input.warehouseCode,
        warehouseName: input.warehouseName,
        warehouseType: input.warehouseType,
        address: input.address,
        city: input.city,
        region: input.region,
        managerId: input.managerId,
        phone: input.phone,
        email: input.email,
        capacity: input.capacity,
        isActive: input.isActive,
        notes: input.notes,
      });
      return { id: result[0].insertId, success: true };
    }),

  // تحديث مستودع
  update: publicProcedure
    .input(z.object({
      id: z.number(),
      warehouseCode: z.string().min(1).optional(),
      warehouseName: z.string().min(1).optional(),
      warehouseType: z.enum(["main", "branch", "transit", "virtual"]).optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      region: z.string().optional(),
      managerId: z.number().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      capacity: z.string().optional(),
      isActive: z.boolean().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db.update(warehouses).set(data).where(eq(warehouses.id, id));
      return { success: true };
    }),

  // حذف مستودع
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(warehouses).where(eq(warehouses.id, input.id));
      return { success: true };
    }),

  // الحصول على مواقع المستودع
  getLocations: publicProcedure
    .input(z.object({ warehouseId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return db.select().from(warehouseLocations).where(eq(warehouseLocations.warehouseId, input.warehouseId));
    }),

  // إنشاء موقع في المستودع
  createLocation: publicProcedure
    .input(z.object({
      warehouseId: z.number(),
      locationCode: z.string().min(1),
      locationName: z.string().min(1),
      locationType: z.enum(["shelf", "bin", "zone", "area"]).default("shelf"),
      parentLocationId: z.number().optional(),
      capacity: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(warehouseLocations).values({
        warehouseId: input.warehouseId,
        locationCode: input.locationCode,
        locationName: input.locationName,
        locationType: input.locationType,
        parentLocationId: input.parentLocationId,
        capacity: input.capacity,
      });
      return { id: result[0].insertId, success: true };
    }),

  // الحصول على مخزون المستودع
  getStock: publicProcedure
    .input(z.object({ 
      warehouseId: z.number(),
      itemId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const conditions = [eq(warehouseStock.warehouseId, input.warehouseId)];
      if (input.itemId) {
        conditions.push(eq(warehouseStock.itemId, input.itemId));
      }
      return db.select().from(warehouseStock).where(and(...conditions));
    }),

  // تحديث مخزون المستودع
  updateStock: publicProcedure
    .input(z.object({
      warehouseId: z.number(),
      itemId: z.number(),
      locationId: z.number().optional(),
      quantity: z.string(),
      reservedQuantity: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const existing = await db.select().from(warehouseStock)
        .where(and(
          eq(warehouseStock.warehouseId, input.warehouseId),
          eq(warehouseStock.itemId, input.itemId)
        ));
      
      const availableQty = (parseFloat(input.quantity) - parseFloat(input.reservedQuantity || "0")).toString();
      
      if (existing.length > 0) {
        await db.update(warehouseStock).set({
          quantity: input.quantity,
          reservedQuantity: input.reservedQuantity || "0",
          availableQuantity: availableQty,
          locationId: input.locationId,
        }).where(eq(warehouseStock.id, existing[0].id));
      } else {
        await db.insert(warehouseStock).values({
          warehouseId: input.warehouseId,
          itemId: input.itemId,
          locationId: input.locationId,
          quantity: input.quantity,
          reservedQuantity: input.reservedQuantity || "0",
          availableQuantity: availableQty,
        });
      }
      return { success: true };
    }),

  // الحصول على جميع التحويلات
  getTransfers: publicProcedure
    .input(z.object({
      status: z.enum(["draft", "pending", "in_transit", "received", "cancelled"]).optional(),
      fromWarehouseId: z.number().optional(),
      toWarehouseId: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let query = db.select().from(stockTransfers);
      
      const conditions = [];
      if (input?.status) {
        conditions.push(eq(stockTransfers.status, input.status));
      }
      if (input?.fromWarehouseId) {
        conditions.push(eq(stockTransfers.fromWarehouseId, input.fromWarehouseId));
      }
      if (input?.toWarehouseId) {
        conditions.push(eq(stockTransfers.toWarehouseId, input.toWarehouseId));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return query.orderBy(desc(stockTransfers.createdAt));
    }),

  // إنشاء تحويل مخزون
  createTransfer: publicProcedure
    .input(z.object({
      transferNumber: z.string().min(1),
      fromWarehouseId: z.number(),
      toWarehouseId: z.number(),
      transferDate: z.string(),
      notes: z.string().optional(),
      items: z.array(z.object({
        itemId: z.number(),
        requestedQuantity: z.string(),
        notes: z.string().optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(stockTransfers).values({
        transferNumber: input.transferNumber,
        fromWarehouseId: input.fromWarehouseId,
        toWarehouseId: input.toWarehouseId,
        transferDate: new Date(input.transferDate),
        status: "draft",
        notes: input.notes,
      });
      
      const transferId = result[0].insertId;
      
      for (const item of input.items) {
        await db.insert(stockTransferItems).values({
          transferId,
          itemId: item.itemId,
          requestedQuantity: item.requestedQuantity,
          notes: item.notes,
        });
      }
      
      return { id: transferId, success: true };
    }),

  // تحديث حالة التحويل
  updateTransferStatus: publicProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["draft", "pending", "in_transit", "received", "cancelled"]),
      approvedBy: z.number().optional(),
      receivedBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(stockTransfers).set({
        status: input.status,
        approvedBy: input.approvedBy,
        receivedBy: input.receivedBy,
      }).where(eq(stockTransfers.id, input.id));
      return { success: true };
    }),

  // إحصائيات المستودعات
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
      if (!db) throw new Error("Database not available");
    const totalWarehouses = await db.select({ count: sql<number>`count(*)` }).from(warehouses);
    const activeWarehouses = await db.select({ count: sql<number>`count(*)` }).from(warehouses).where(eq(warehouses.isActive, true));
    const pendingTransfers = await db.select({ count: sql<number>`count(*)` }).from(stockTransfers).where(eq(stockTransfers.status, "pending"));
    
    return {
      totalWarehouses: totalWarehouses[0]?.count || 0,
      activeWarehouses: activeWarehouses[0]?.count || 0,
      pendingTransfers: pendingTransfers[0]?.count || 0,
    };
  }),
});
