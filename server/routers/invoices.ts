// @ts-nocheck
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { invoices, invoiceItems } from "../../drizzle/schema-pg";
import { eq, like, and, gte, lte } from "drizzle-orm";

const invoiceItemSchema = z.object({
  itemDescription: z.string().min(1).max(500),
  quantity: z.string(),
  unitPrice: z.string(),
  taxRate: z.string().default("0.00"),
  discountRate: z.string().default("0.00"),
  totalAmount: z.string(),
});

const createInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1).max(50),
  invoiceDate: z.string(),
  dueDate: z.string(),
  customerId: z.number().int().positive(),
  invoiceType: z.enum(["sales", "service", "subscription"]).default("sales"),
  status: z.enum(["draft", "pending", "paid", "partially_paid", "overdue", "cancelled"]).default("draft"),
  subtotal: z.string().default("0.00"),
  taxAmount: z.string().default("0.00"),
  discountAmount: z.string().default("0.00"),
  totalAmount: z.string(),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).optional(),
});

const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  id: z.number().int().positive(),
});

export const invoicesRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        customerId: z.number().int().positive().optional(),
        status: z.enum(["draft", "pending", "paid", "partially_paid", "overdue", "cancelled"]).optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db.select().from(invoices);
      
      const conditions = [];
      if (input?.search) {
        conditions.push(like(invoices.invoiceNumber, `%${input.search}%`));
      }
      if (input?.customerId) {
        conditions.push(eq(invoices.customerId, input.customerId));
      }
      if (input?.status) {
        conditions.push(eq(invoices.status, input.status));
      }
      if (input?.dateFrom) {
        conditions.push(gte(invoices.invoiceDate, input.dateFrom));
      }
      if (input?.dateTo) {
        conditions.push(lte(invoices.invoiceDate, input.dateTo));
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

      const invoice = await db
        .select()
        .from(invoices)
        .where(eq(invoices.id, input.id))
        .limit(1);

      if (invoice.length === 0) {
        throw new Error("Invoice not found");
      }

      const items = await db
        .select()
        .from(invoiceItems)
        .where(eq(invoiceItems.invoiceId, input.id));

      return {
        ...invoice[0],
        items,
      };
    }),

  create: protectedProcedure
    .input(createInvoiceSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { items, ...invoiceData } = input;

      const result = await db.insert(invoices).values({
        ...invoiceData,
        createdBy: ctx.user.id,
      });

      const invoiceId = Number(result[0].insertId);

      if (items && items.length > 0) {
        await db.insert(invoiceItems).values(
          items.map(item => ({
            ...item,
            invoiceId,
          }))
        );
      }

      return {
        success: true,
        id: invoiceId,
      };
    }),

  update: protectedProcedure
    .input(updateInvoiceSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, items, ...data } = input;

      await db
        .update(invoices)
        .set(data)
        .where(eq(invoices.id, id));

      return { success: true };
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number().int().positive(),
      status: z.enum(["draft", "pending", "paid", "partially_paid", "overdue", "cancelled"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(invoices)
        .set({ status: input.status })
        .where(eq(invoices.id, input.id));

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(invoices)
        .set({ status: "cancelled" })
        .where(eq(invoices.id, input.id));

      return { success: true };
    }),
});
