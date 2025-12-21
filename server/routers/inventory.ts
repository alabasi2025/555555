// @ts-nocheck
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { items, inventoryMovements, purchaseRequests, purchaseRequestItems } from "../../drizzle/schema-pg";
import { eq, like, and, lte } from "drizzle-orm";

const createItemSchema = z.object({
  itemCode: z.string().min(1).max(50),
  itemName: z.string().min(1).max(255),
  itemNameEn: z.string().optional(),
  itemType: z.enum(["material", "spare_part", "tool", "consumable"]).default("material"),
  category: z.string().optional(),
  unit: z.string().default("piece"),
  currentQuantity: z.string().default("0.00"),
  minQuantity: z.string().default("0.00"),
  maxQuantity: z.string().default("0.00"),
  unitCost: z.string().default("0.00"),
  sellingPrice: z.string().default("0.00"),
  location: z.string().optional(),
  notes: z.string().optional(),
});

const updateItemSchema = createItemSchema.partial().extend({
  id: z.number().int().positive(),
});

const createMovementSchema = z.object({
  movementNumber: z.string().min(1).max(50),
  movementDate: z.string(),
  movementType: z.enum(["in", "out", "adjustment", "transfer"]),
  itemId: z.number().int().positive(),
  quantity: z.string(),
  unitCost: z.string().default("0.00"),
  totalCost: z.string().default("0.00"),
  fromLocation: z.string().optional(),
  toLocation: z.string().optional(),
  referenceType: z.string().optional(),
  referenceId: z.number().int().optional(),
  notes: z.string().optional(),
});

const createPurchaseRequestSchema = z.object({
  requestNumber: z.string().min(1).max(50),
  requestDate: z.string(),
  requiredDate: z.string().optional(),
  status: z.enum(["draft", "pending", "approved", "rejected", "completed"]).default("draft"),
  requestedBy: z.number().int().positive(),
  notes: z.string().optional(),
  items: z.array(z.object({
    itemId: z.number().int().positive(),
    quantity: z.string(),
    estimatedCost: z.string(),
    notes: z.string().optional(),
  })).optional(),
});

export const inventoryRouter = router({
  // Items
  items: router({
    list: protectedProcedure
      .input(
        z.object({
          search: z.string().optional(),
          type: z.enum(["material", "spare_part", "tool", "consumable"]).optional(),
          category: z.string().optional(),
          lowStock: z.boolean().optional(),
          isActive: z.boolean().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        let query = db.select().from(items);
        
        const conditions = [];
        if (input?.search) {
          conditions.push(like(items.itemName, `%${input.search}%`));
        }
        if (input?.type) {
          conditions.push(eq(items.itemType, input.type));
        }
        if (input?.category) {
          conditions.push(eq(items.category, input.category));
        }
        if (input?.lowStock) {
          conditions.push(lte(items.currentQuantity, items.minQuantity));
        }
        if (input?.isActive !== undefined) {
          conditions.push(eq(items.isActive, input.isActive));
        }

        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as any;
        }

        return await query;
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db
          .select()
          .from(items)
          .where(eq(items.id, input.id))
          .limit(1);

        if (result.length === 0) {
          throw new Error("Item not found");
        }

        return result[0];
      }),

    create: protectedProcedure
      .input(createItemSchema)
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(items).values(input);

        return {
          success: true,
          id: Number(result[0].insertId),
        };
      }),

    update: protectedProcedure
      .input(updateItemSchema)
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const { id, ...data } = input;

        await db
          .update(items)
          .set(data)
          .where(eq(items.id, id));

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db
          .update(items)
          .set({ isActive: false })
          .where(eq(items.id, input.id));

        return { success: true };
      }),
  }),

  // Movements
  movements: router({
    list: protectedProcedure
      .input(
        z.object({
          search: z.string().optional(),
          itemId: z.number().int().positive().optional(),
          movementType: z.enum(["in", "out", "adjustment", "transfer"]).optional(),
          dateFrom: z.string().optional(),
          dateTo: z.string().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        let query = db.select().from(inventoryMovements);
        
        const conditions = [];
        if (input?.search) {
          conditions.push(like(inventoryMovements.movementNumber, `%${input.search}%`));
        }
        if (input?.itemId) {
          conditions.push(eq(inventoryMovements.itemId, input.itemId));
        }
        if (input?.movementType) {
          conditions.push(eq(inventoryMovements.movementType, input.movementType));
        }

        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as any;
        }

        return await query;
      }),

    create: protectedProcedure
      .input(createMovementSchema)
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(inventoryMovements).values({
          ...input,
          createdBy: ctx.user.id,
        });

        // Update item quantity
        const item = await db
          .select()
          .from(items)
          .where(eq(items.id, input.itemId))
          .limit(1);

        if (item.length > 0) {
          let newQuantity = parseFloat(item[0].currentQuantity);
          const movementQty = parseFloat(input.quantity);

          if (input.movementType === "in") {
            newQuantity += movementQty;
          } else if (input.movementType === "out") {
            newQuantity -= movementQty;
          }

          await db
            .update(items)
            .set({ currentQuantity: newQuantity.toString() })
            .where(eq(items.id, input.itemId));
        }

        return {
          success: true,
          id: Number(result[0].insertId),
        };
      }),
  }),

  // Purchase Requests
  purchaseRequests: router({
    list: protectedProcedure
      .input(
        z.object({
          search: z.string().optional(),
          status: z.enum(["draft", "pending", "approved", "rejected", "completed"]).optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        let query = db.select().from(purchaseRequests);
        
        const conditions = [];
        if (input?.search) {
          conditions.push(like(purchaseRequests.requestNumber, `%${input.search}%`));
        }
        if (input?.status) {
          conditions.push(eq(purchaseRequests.status, input.status));
        }

        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as any;
        }

        return await query;
      }),

    create: protectedProcedure
      .input(createPurchaseRequestSchema)
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const { items: requestItems, ...requestData } = input;

        const result = await db.insert(purchaseRequests).values({
          ...requestData,
          requestedBy: ctx.user.id,
        });

        const requestId = Number(result[0].insertId);

        if (requestItems && requestItems.length > 0) {
          await db.insert(purchaseRequestItems).values(
            requestItems.map(item => ({
              ...item,
              requestId,
            }))
          );
        }

        return {
          success: true,
          id: requestId,
        };
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number().int().positive(),
        status: z.enum(["draft", "pending", "approved", "rejected", "completed"]),
        approvedBy: z.number().int().positive().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const updateData: any = { status: input.status };
        
        if (input.status === "approved" && input.approvedBy) {
          updateData.approvedBy = input.approvedBy;
          updateData.approvalDate = new Date().toISOString().split('T')[0];
        }

        await db
          .update(purchaseRequests)
          .set(updateData)
          .where(eq(purchaseRequests.id, input.id));

        return { success: true };
      }),
  }),
});
