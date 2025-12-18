import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { purchaseRequests, purchaseRequestItems, materialReceipts, materialReceiptItems, suppliers, items } from "../../drizzle/schema";
import { eq, like, and, desc } from "drizzle-orm";

// Zod schemas for validation
const createPurchaseRequestSchema = z.object({
  requestNumber: z.string().min(1).max(50),
  requestDate: z.string(), // ISO date string
  supplierId: z.number().int().positive(),
  notes: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected", "completed"]).default("pending"),
  items: z.array(z.object({
    itemId: z.number().int().positive(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    notes: z.string().optional(),
  })),
});

const updatePurchaseRequestSchema = z.object({
  id: z.number().int().positive(),
  requestNumber: z.string().min(1).max(50).optional(),
  requestDate: z.string().optional(),
  supplierId: z.number().int().positive().optional(),
  notes: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected", "completed"]).optional(),
});

const createMaterialReceiptSchema = z.object({
  receiptNumber: z.string().min(1).max(50),
  receiptDate: z.string(), // ISO date string
  purchaseRequestId: z.number().int().positive(),
  supplierId: z.number().int().positive(),
  notes: z.string().optional(),
  items: z.array(z.object({
    itemId: z.number().int().positive(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    notes: z.string().optional(),
  })),
});

export const purchasesRouter = router({
  // قائمة طلبات الشراء
  listPurchaseRequests: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.enum(["pending", "approved", "rejected", "completed"]).optional(),
        supplierId: z.number().int().positive().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("قاعدة البيانات غير متاحة");

      let query = db.select().from(purchaseRequests).orderBy(desc(purchaseRequests.createdAt));
      
      const conditions = [];
      if (input?.search) {
        conditions.push(
          like(purchaseRequests.requestNumber, `%${input.search}%`)
        );
      }
      if (input?.status) {
        conditions.push(eq(purchaseRequests.status, input.status));
      }
      // supplierId غير موجود في جدول purchaseRequests

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      const result = await query;
      return result;
    }),

  // جلب طلب شراء بالمعرف
  getPurchaseRequestById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("قاعدة البيانات غير متاحة");

      const result = await db
        .select()
        .from(purchaseRequests)
        .where(eq(purchaseRequests.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new Error("طلب الشراء غير موجود");
      }

      // جلب بنود الطلب
      const requestItems = await db
        .select()
        .from(purchaseRequestItems)
        .where(eq(purchaseRequestItems.requestId, input.id));

      return {
        ...result[0],
        items: requestItems,
      };
    }),

  // إنشاء طلب شراء جديد
  createPurchaseRequest: protectedProcedure
    .input(createPurchaseRequestSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("قاعدة البيانات غير متاحة");

      const { items: requestItems, ...requestData } = input;

      // إنشاء طلب الشراء
      const result = await db.insert(purchaseRequests).values({
        requestNumber: requestData.requestNumber,
        requestDate: new Date(requestData.requestDate),
        status: requestData.status || "pending",
        requestedBy: ctx.user?.id || 1,
        notes: requestData.notes,
      });

      const purchaseRequestId = Number(result[0].insertId);

      // إضافة بنود الطلب
      if (requestItems && requestItems.length > 0) {
        await db.insert(purchaseRequestItems).values(
          requestItems.map(item => ({
            requestId: purchaseRequestId,
            itemId: item.itemId,
            quantity: String(item.quantity),
            estimatedCost: String(item.unitPrice * item.quantity),
            notes: item.notes,
          }))
        );
      }

      return {
        success: true,
        id: purchaseRequestId,
      };
    }),

  // تحديث طلب شراء
  updatePurchaseRequest: protectedProcedure
    .input(updatePurchaseRequestSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("قاعدة البيانات غير متاحة");

      const { id, ...data } = input;

      await db
        .update(purchaseRequests)
        .set({
          requestNumber: data.requestNumber,
          requestDate: data.requestDate ? new Date(data.requestDate) : undefined,
          status: data.status,
          notes: data.notes,
        })
        .where(eq(purchaseRequests.id, id));

      return { success: true };
    }),

  // اعتماد طلب شراء
  approvePurchaseRequest: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("قاعدة البيانات غير متاحة");

      await db
        .update(purchaseRequests)
        .set({
          status: "approved",
          approvedBy: ctx.user?.id || 1,
          approvalDate: new Date(),
        })
        .where(eq(purchaseRequests.id, input.id));

      return { success: true };
    }),

  // حذف طلب شراء
  deletePurchaseRequest: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("قاعدة البيانات غير متاحة");

      // حذف البنود أولاً
      await db
        .delete(purchaseRequestItems)
        .where(eq(purchaseRequestItems.requestId, input.id));

      // ثم حذف الطلب
      await db
        .delete(purchaseRequests)
        .where(eq(purchaseRequests.id, input.id));

      return { success: true };
    }),

  // قائمة استلامات المواد
  listMaterialReceipts: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        supplierId: z.number().int().positive().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("قاعدة البيانات غير متاحة");

      let query = db.select().from(materialReceipts).orderBy(desc(materialReceipts.createdAt));
      
      const conditions = [];
      if (input?.search) {
        conditions.push(
          like(materialReceipts.receiptNumber, `%${input.search}%`)
        );
      }
      if (input?.supplierId) {
        conditions.push(eq(materialReceipts.supplierId, input.supplierId));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      const result = await query;
      return result;
    }),

  // جلب استلام مواد بالمعرف
  getMaterialReceiptById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("قاعدة البيانات غير متاحة");

      const result = await db
        .select()
        .from(materialReceipts)
        .where(eq(materialReceipts.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new Error("استلام المواد غير موجود");
      }

      // جلب بنود الاستلام
      const receiptItems = await db
        .select()
        .from(materialReceiptItems)
        .where(eq(materialReceiptItems.receiptId, input.id));

      return {
        ...result[0],
        items: receiptItems,
      };
    }),

  // إنشاء استلام مواد جديد
  createMaterialReceipt: protectedProcedure
    .input(createMaterialReceiptSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("قاعدة البيانات غير متاحة");

      const { items: receiptItems, ...receiptData } = input;

      // إنشاء استلام المواد
      const result = await db.insert(materialReceipts).values({
        receiptNumber: receiptData.receiptNumber,
        receiptDate: new Date(receiptData.receiptDate),
        supplierId: receiptData.supplierId,
        notes: receiptData.notes,
        receivedBy: ctx.user?.id || 1,
      });

      const materialReceiptId = Number(result[0].insertId);

      // إضافة بنود الاستلام
      if (receiptItems && receiptItems.length > 0) {
        await db.insert(materialReceiptItems).values(
          receiptItems.map(item => ({
            receiptId: materialReceiptId,
            itemId: item.itemId,
            quantity: String(item.quantity),
            unitCost: String(item.unitPrice),
            totalCost: String(item.quantity * item.unitPrice),
          }))
        );
      }

      return {
        success: true,
        id: materialReceiptId,
      };
    }),
});
