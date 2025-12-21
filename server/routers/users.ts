import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema-pg";
import { eq } from "drizzle-orm";

export const usersRouter = router({
  // Get all users
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const allUsers = await db.select().from(users);
    return allUsers;
  }),

  // Get user by ID
  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [user] = await db.select().from(users).where(eq(users.id, input.id));
      return user;
    }),

  // Create new user
  create: publicProcedure
    .input(
      z.object({
        openId: z.string(),
        name: z.string().optional(),
        email: z.string().optional(),
        loginMethod: z.string().optional(),
        role: z.enum(["user", "admin"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(users).values({
        openId: input.openId,
        name: input.name,
        email: input.email,
        loginMethod: input.loginMethod,
        role: input.role || "user",
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  // Update user
  update: publicProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        name: z.string().optional(),
        email: z.string().optional(),
        role: z.enum(["user", "admin"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db
        .update(users)
        .set(data)
        .where(eq(users.id, id));
      return { success: true };
    }),

  // Delete user
  delete: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(users).where(eq(users.id, input.id));
      return { success: true };
    }),
});
