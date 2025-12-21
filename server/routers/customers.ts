import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { customers } from "../../drizzle/schema-pg";
import { eq, like, and } from "drizzle-orm";

const createCustomerSchema = z.object({
  customerCode: z.string().min(1).max(50),
  customerName: z.string().min(1).max(255),
  customerType: z.enum(["individual", "company", "government"]).default("individual"),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  taxNumber: z.string().optional(),
  creditLimit: z.string().optional(),
  notes: z.string().optional(),
});

const updateCustomerSchema = createCustomerSchema.partial().extend({
  id: z.number().int().positive(),
});

export const customersRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        type: z.enum(["individual", "company", "government"]).optional(),
        isActive: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db.select().from(customers);
      
      const conditions = [];
      if (input?.search) {
        conditions.push(like(customers.customerName, `%${input.search}%`));
      }
      if (input?.type) {
        conditions.push(eq(customers.customerType, input.type));
      }
      if (input?.isActive !== undefined) {
        conditions.push(eq(customers.isActive, input.isActive));
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
        .from(customers)
        .where(eq(customers.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new Error("Customer not found");
      }

      return result[0];
    }),

  create: protectedProcedure
    .input(createCustomerSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(customers).values(input);

      return {
        success: true,
        id: Number(result[0].insertId),
      };
    }),

  update: protectedProcedure
    .input(updateCustomerSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...data } = input;

      await db
        .update(customers)
        .set(data)
        .where(eq(customers.id, id));

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(customers)
        .set({ isActive: false })
        .where(eq(customers.id, input.id));

      return { success: true };
    }),
});
