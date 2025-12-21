import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { meters } from "../../drizzle/schema-pg";
import { eq } from "drizzle-orm";

export const metersRouter = router({
  // Get all meters
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const allMeters = await db.select().from(meters);
    return allMeters;
  }),

  // Get meter by ID
  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [meter] = await db.select().from(meters).where(eq(meters.id, input.id));
      return meter;
    }),

  // Create new meter
  create: publicProcedure
    .input(
      z.object({
        meterNumber: z.string(),
        customerId: z.number().int().positive(),
        meterType: z.enum(["electric", "water", "gas"]),
        location: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        status: z.enum(["active", "inactive", "faulty", "replaced"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(meters).values({
        meterNumber: input.meterNumber,
        customerId: input.customerId,
        meterType: input.meterType,
        location: input.location,
        latitude: input.latitude,
        longitude: input.longitude,
        status: input.status || "active",
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  // Update meter
  update: publicProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        meterNumber: z.string().optional(),
        customerId: z.number().int().positive().optional(),
        meterType: z.enum(["electric", "water", "gas"]).optional(),
        location: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        status: z.enum(["active", "inactive", "faulty", "replaced"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db
        .update(meters)
        .set(data)
        .where(eq(meters.id, id));
      return { success: true };
    }),

  // Delete meter
  delete: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(meters).where(eq(meters.id, input.id));
      return { success: true };
    }),
});
