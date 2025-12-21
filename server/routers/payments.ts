// @ts-nocheck
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { payments, invoices } from "../../drizzle/schema-pg";
import { eq, like, and, gte, lte } from "drizzle-orm";

const createPaymentSchema = z.object({
  paymentNumber: z.string().min(1).max(50),
  paymentDate: z.string(),
  invoiceId: z.number().int().positive(),
  customerId: z.number().int().positive(),
  amount: z.string(),
  paymentMethod: z.enum(["cash", "bank_transfer", "check", "credit_card", "online"]).default("cash"),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

const updatePaymentSchema = createPaymentSchema.partial().extend({
  id: z.number().int().positive(),
});

export const paymentsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        customerId: z.number().int().positive().optional(),
        invoiceId: z.number().int().positive().optional(),
        paymentMethod: z.enum(["cash", "bank_transfer", "check", "credit_card", "online"]).optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db.select().from(payments);
      
      const conditions = [];
      if (input?.search) {
        conditions.push(like(payments.paymentNumber, `%${input.search}%`));
      }
      if (input?.customerId) {
        conditions.push(eq(payments.customerId, input.customerId));
      }
      if (input?.invoiceId) {
        conditions.push(eq(payments.invoiceId, input.invoiceId));
      }
      if (input?.paymentMethod) {
        conditions.push(eq(payments.paymentMethod, input.paymentMethod));
      }
      if (input?.dateFrom) {
        conditions.push(gte(payments.paymentDate, input.dateFrom));
      }
      if (input?.dateTo) {
        conditions.push(lte(payments.paymentDate, input.dateTo));
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
        .from(payments)
        .where(eq(payments.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new Error("Payment not found");
      }

      return result[0];
    }),

  create: protectedProcedure
    .input(createPaymentSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(payments).values({
        ...input,
        createdBy: ctx.user.id,
      });

      // Update invoice paid amount
      const payment = await db
        .select()
        .from(payments)
        .where(eq(payments.invoiceId, input.invoiceId));

      const totalPaid = payment.reduce((sum, p) => sum + parseFloat(p.amount), 0);

      await db
        .update(invoices)
        .set({
          paidAmount: totalPaid.toString(),
          remainingAmount: (parseFloat(invoices.totalAmount) - totalPaid).toString(),
          status: totalPaid >= parseFloat(invoices.totalAmount) ? "paid" : "partially_paid",
        })
        .where(eq(invoices.id, input.invoiceId));

      return {
        success: true,
        id: Number(result[0].insertId),
      };
    }),

  update: protectedProcedure
    .input(updatePaymentSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...data } = input;

      await db
        .update(payments)
        .set(data)
        .where(eq(payments.id, id));

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get payment details before deleting
      const payment = await db
        .select()
        .from(payments)
        .where(eq(payments.id, input.id))
        .limit(1);

      if (payment.length === 0) {
        throw new Error("Payment not found");
      }

      // Delete payment
      await db.delete(payments).where(eq(payments.id, input.id));

      // Recalculate invoice paid amount
      const remainingPayments = await db
        .select()
        .from(payments)
        .where(eq(payments.invoiceId, payment[0].invoiceId));

      const totalPaid = remainingPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

      await db
        .update(invoices)
        .set({
          paidAmount: totalPaid.toString(),
          remainingAmount: (parseFloat(invoices.totalAmount) - totalPaid).toString(),
          status: totalPaid === 0 ? "pending" : totalPaid >= parseFloat(invoices.totalAmount) ? "paid" : "partially_paid",
        })
        .where(eq(invoices.id, payment[0].invoiceId));

      return { success: true };
    }),
});
