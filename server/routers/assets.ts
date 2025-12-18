import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { assets } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const assetsRouter = router({
  // Get all assets
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const allAssets = await db.select().from(assets);
    return allAssets;
  }),

  // Get asset by ID
  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [asset] = await db.select().from(assets).where(eq(assets.id, input.id));
      return asset;
    }),

  // Create new asset
  create: publicProcedure
    .input(
      z.object({
        assetCode: z.string(),
        assetName: z.string(),
        category: z.string(),
        description: z.string().optional(),
        purchaseDate: z.date().optional(),
        purchasePrice: z.string().optional(),
        currentValue: z.string().optional(),
        location: z.string().optional(),
        status: z.enum(["active", "under_maintenance", "retired", "disposed"]).optional(),
        warrantyExpiry: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(assets).values({
        assetCode: input.assetCode,
        assetName: input.assetName,
        category: input.category,
        description: input.description,
        purchaseDate: input.purchaseDate,
        purchasePrice: input.purchasePrice,
        currentValue: input.currentValue,
        location: input.location,
        status: input.status || "active",
        warrantyExpiry: input.warrantyExpiry,
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  // Update asset
  update: publicProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        assetCode: z.string().optional(),
        assetName: z.string().optional(),
        category: z.string().optional(),
        description: z.string().optional(),
        purchaseDate: z.date().optional(),
        purchasePrice: z.string().optional(),
        currentValue: z.string().optional(),
        location: z.string().optional(),
        status: z.enum(["active", "under_maintenance", "retired", "disposed"]).optional(),
        warrantyExpiry: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db
        .update(assets)
        .set(data)
        .where(eq(assets.id, id));
      return { success: true };
    }),

  // Delete asset
  delete: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(assets).where(eq(assets.id, input.id));
      return { success: true };
    }),
});
