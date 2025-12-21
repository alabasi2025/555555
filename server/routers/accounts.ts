import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { chartOfAccounts, accountBalances } from "../../drizzle/schema-pg";
import { eq, like, and, isNull } from "drizzle-orm";

// Zod schemas for validation
const createAccountSchema = z.object({
  accountCode: z.string().min(1).max(20),
  accountName: z.string().min(1).max(200),
  accountNameEn: z.string().optional(),
  accountType: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
  parentAccountId: z.number().optional(),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
  isHeader: z.boolean().default(false),
  level: z.number().int().min(1).max(10),
});

const updateAccountSchema = createAccountSchema.partial().extend({
  id: z.number().int().positive(),
});

export const accountsRouter = router({
  // Get all accounts
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        type: z.enum(["asset", "liability", "equity", "revenue", "expense"]).optional(),
        isActive: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db.select().from(chartOfAccounts);
      
      const conditions = [];
      if (input?.search) {
        conditions.push(
          like(chartOfAccounts.accountName, `%${input.search}%`)
        );
      }
      if (input?.type) {
        conditions.push(eq(chartOfAccounts.accountType, input.type));
      }
      if (input?.isActive !== undefined) {
        conditions.push(eq(chartOfAccounts.isActive, input.isActive));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      const result = await query;
      return result;
    }),

  // Get account tree
  tree: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allAccounts = await db.select().from(chartOfAccounts).where(eq(chartOfAccounts.isActive, true));
    
    // Build tree structure
    const buildTree = (parentId: number | null = null): any[] => {
      return allAccounts
        .filter(acc => acc.parentAccountId === parentId)
        .map(acc => ({
          ...acc,
          children: buildTree(acc.id),
        }));
    };

    return buildTree(null);
  }),

  // Get account by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db
        .select()
        .from(chartOfAccounts)
        .where(eq(chartOfAccounts.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new Error("Account not found");
      }

      return result[0];
    }),

  // Get account balance
  getBalance: protectedProcedure
    .input(z.object({ accountId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db
        .select()
        .from(accountBalances)
        .where(eq(accountBalances.accountId, input.accountId))
        .limit(1);

      if (result.length === 0) {
        return {
          accountId: input.accountId,
          openingBalance: 0,
          debitAmount: 0,
          creditAmount: 0,
          closingBalance: 0,
        };
      }

      return result[0];
    }),

  // Create new account
  create: protectedProcedure
    .input(createAccountSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(chartOfAccounts).values({
        ...input,
        // createdBy and updatedBy will be set by defaults
      });

      return {
        success: true,
        id: Number(result[0].insertId),
      };
    }),

  // Update account
  update: protectedProcedure
    .input(updateAccountSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...data } = input;

      await db
        .update(chartOfAccounts)
        .set({
          ...data,
          updatedBy: ctx.user.id,
        })
        .where(eq(chartOfAccounts.id, id));

      return { success: true };
    }),

  // Delete account (soft delete)
  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(chartOfAccounts)
        .set({
          isActive: false,
          updatedBy: ctx.user.id,
        })
        .where(eq(chartOfAccounts.id, input.id));

      return { success: true };
    }),
});
