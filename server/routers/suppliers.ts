import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { suppliers } from "../../drizzle/schema-pg";
import { eq, like, and } from "drizzle-orm";

const createSupplierSchema = z.object({
  supplierCode: z.string().min(1).max(50),
  supplierName: z.string().min(1).max(255),
  supplierType: z.enum(["local", "international"]).default("local"),
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

const updateSupplierSchema = createSupplierSchema.partial().extend({
  id: z.number().int().positive(),
});

export const suppliersRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        type: z.enum(["local", "international"]).optional(),
        isActive: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db.select().from(suppliers);
      
      const conditions = [];
      if (input?.search) {
        conditions.push(like(suppliers.supplierName, `%${input.search}%`));
      }
      if (input?.type) {
        conditions.push(eq(suppliers.supplierType, input.type));
      }
      if (input?.isActive !== undefined) {
        conditions.push(eq(suppliers.isActive, input.isActive));
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
        .from(suppliers)
        .where(eq(suppliers.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new Error("Supplier not found");
      }

      return result[0];
    }),

  create: protectedProcedure
    .input(createSupplierSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(suppliers).values(input);

      return {
        success: true,
        id: Number(result[0].insertId),
      };
    }),

  update: protectedProcedure
    .input(updateSupplierSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...data } = input;

      await db
        .update(suppliers)
        .set(data)
        .where(eq(suppliers.id, id));

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(suppliers)
        .set({ isActive: false })
        .where(eq(suppliers.id, input.id));

      return { success: true };
    }),
});
