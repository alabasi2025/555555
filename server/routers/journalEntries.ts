import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { journalEntries, journalEntryLines, chartOfAccounts, generalLedger } from "../../drizzle/schema-pg";
import { eq, like, and, desc, sum, sql } from "drizzle-orm";

// Zod schemas for validation
const createJournalEntrySchema = z.object({
  entryNumber: z.string().min(1).max(50),
  entryDate: z.string(), // ISO date string
  description: z.string().min(1),
  referenceNumber: z.string().optional(),
  status: z.enum(["draft", "posted", "reversed"]).default("draft"),
  lines: z.array(z.object({
    accountId: z.number().int().positive(),
    description: z.string().optional(),
    debitAmount: z.number().min(0).default(0),
    creditAmount: z.number().min(0).default(0),
  })).min(2, "يجب أن يحتوي القيد على بندين على الأقل"),
});

const updateJournalEntrySchema = z.object({
  id: z.number().int().positive(),
  entryNumber: z.string().min(1).max(50).optional(),
  entryDate: z.string().optional(),
  description: z.string().min(1).optional(),
  referenceNumber: z.string().optional(),
  status: z.enum(["draft", "posted", "reversed"]).optional(),
});

export const journalEntriesRouter = router({
  // قائمة القيود اليومية
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.enum(["draft", "posted", "reversed"]).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("قاعدة البيانات غير متاحة");

      let query = db.select().from(journalEntries).orderBy(desc(journalEntries.entryDate));
      
      const conditions = [];
      if (input?.search) {
        conditions.push(
          like(journalEntries.entryNumber, `%${input.search}%`)
        );
      }
      if (input?.status) {
        conditions.push(eq(journalEntries.status, input.status));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      const result = await query;
      return result;
    }),

  // جلب قيد يومي بالمعرف
  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("قاعدة البيانات غير متاحة");

      const result = await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new Error("القيد اليومي غير موجود");
      }

      // جلب بنود القيد مع معلومات الحسابات
      const entryLines = await db
        .select({
          id: journalEntryLines.id,
          accountId: journalEntryLines.accountId,
          accountCode: chartOfAccounts.accountCode,
          accountName: chartOfAccounts.accountName,
          description: journalEntryLines.description,
          debitAmount: journalEntryLines.debitAmount,
          creditAmount: journalEntryLines.creditAmount,
        })
        .from(journalEntryLines)
        .leftJoin(chartOfAccounts, eq(journalEntryLines.accountId, chartOfAccounts.id))
        .where(eq(journalEntryLines.entryId, input.id));

      // حساب المجاميع
      const totalDebit = entryLines.reduce((sum, line) => sum + Number(line.debitAmount), 0);
      const totalCredit = entryLines.reduce((sum, line) => sum + Number(line.creditAmount), 0);

      return {
        ...result[0],
        lines: entryLines,
        totalDebit,
        totalCredit,
        isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
      };
    }),

  // إنشاء قيد يومي جديد
  create: protectedProcedure
    .input(createJournalEntrySchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("قاعدة البيانات غير متاحة");

      // التحقق من توازن القيد
      const totalDebit = input.lines.reduce((sum, line) => sum + line.debitAmount, 0);
      const totalCredit = input.lines.reduce((sum, line) => sum + line.creditAmount, 0);

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error("القيد غير متوازن: مجموع المدين يجب أن يساوي مجموع الدائن");
      }

      // التحقق من أن كل بند له مدين أو دائن وليس كلاهما
      for (const line of input.lines) {
        if (line.debitAmount > 0 && line.creditAmount > 0) {
          throw new Error("لا يمكن أن يحتوي البند على مدين ودائن في نفس الوقت");
        }
        if (line.debitAmount === 0 && line.creditAmount === 0) {
          throw new Error("يجب أن يحتوي البند على مدين أو دائن");
        }
      }

      const { lines, ...entryData } = input;

      // إنشاء القيد اليومي
      const result = await db.insert(journalEntries).values({
        entryNumber: entryData.entryNumber,
        entryDate: new Date(entryData.entryDate),
        description: entryData.description,
        status: entryData.status || "draft",
        createdBy: ctx.user?.id || 1,
      });

      const journalEntryId = Number(result[0].insertId);

      // إضافة بنود القيد
      if (lines && lines.length > 0) {
        await db.insert(journalEntryLines).values(
          lines.map((line, index) => ({
            entryId: journalEntryId,
            lineNumber: index + 1,
            accountId: line.accountId,
            description: line.description,
            debitAmount: String(line.debitAmount || 0),
            creditAmount: String(line.creditAmount || 0),
          }))
        );
      }

      return {
        success: true,
        id: journalEntryId,
        message: "تم إنشاء القيد اليومي بنجاح",
      };
    }),

  // تحديث قيد يومي
  update: protectedProcedure
    .input(updateJournalEntrySchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("قاعدة البيانات غير متاحة");

      const { id, ...data } = input;

      // التحقق من حالة القيد
      const entry = await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.id, id))
        .limit(1);

      if (entry.length === 0) {
        throw new Error("القيد اليومي غير موجود");
      }

      if (entry[0].status === "posted") {
        throw new Error("لا يمكن تعديل قيد مرحّل");
      }

      await db
        .update(journalEntries)
        .set({
          entryNumber: data.entryNumber,
          entryDate: data.entryDate ? new Date(data.entryDate) : undefined,
          description: data.description,
          status: data.status,
        })
        .where(eq(journalEntries.id, id));

      return { 
        success: true,
        message: "تم تحديث القيد اليومي بنجاح",
      };
    }),

  // ترحيل قيد يومي إلى دفتر الأستاذ
  post: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("قاعدة البيانات غير متاحة");

      // جلب القيد وبنوده
      const entry = await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.id, input.id))
        .limit(1);

      if (entry.length === 0) {
        throw new Error("القيد اليومي غير موجود");
      }

      if (entry[0].status === "posted") {
        throw new Error("القيد مرحّل مسبقاً");
      }

      const lines = await db
        .select()
        .from(journalEntryLines)
        .where(eq(journalEntryLines.entryId, input.id));

      // ترحيل البنود إلى دفتر الأستاذ
      for (const line of lines) {
        await db.insert(generalLedger).values({
          accountId: line.accountId,
          transactionDate: entry[0].entryDate,
          entryId: input.id,
          description: line.description || entry[0].description,
          debitAmount: line.debitAmount,
          creditAmount: line.creditAmount,
        });
      }

      // تحديث حالة القيد
      await db
        .update(journalEntries)
        .set({
          status: "posted",
          postedDate: new Date(),
          postedBy: ctx.user?.id || 1,
        })
        .where(eq(journalEntries.id, input.id));

      return { 
        success: true,
        message: "تم ترحيل القيد إلى دفتر الأستاذ بنجاح",
      };
    }),

  // عكس قيد يومي
  reverse: protectedProcedure
    .input(z.object({ 
      id: z.number().int().positive(),
      reversalDate: z.string(),
      description: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("قاعدة البيانات غير متاحة");

      // جلب القيد الأصلي
      const originalEntry = await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.id, input.id))
        .limit(1);

      if (originalEntry.length === 0) {
        throw new Error("القيد اليومي غير موجود");
      }

      if (originalEntry[0].status !== "posted") {
        throw new Error("يمكن عكس القيود المرحّلة فقط");
      }

      // جلب بنود القيد الأصلي
      const originalLines = await db
        .select()
        .from(journalEntryLines)
        .where(eq(journalEntryLines.entryId, input.id));

      // إنشاء قيد عكسي
      const reversalResult = await db.insert(journalEntries).values({
        entryNumber: `REV-${originalEntry[0].entryNumber}`,
        entryDate: new Date(input.reversalDate),
        description: input.description,
        status: "posted",
        postedDate: new Date(),
        postedBy: ctx.user?.id || 1,
        createdBy: ctx.user?.id || 1,
      });

      const reversalEntryId = Number(reversalResult[0].insertId);

      // إضافة بنود القيد العكسي (عكس المدين والدائن)
      const reversalLines = originalLines.map((line, index) => ({
        entryId: reversalEntryId,
        lineNumber: index + 1,
        accountId: line.accountId,
        description: `عكس: ${line.description || ''}`,
        debitAmount: line.creditAmount,  // عكس
        creditAmount: line.debitAmount,  // عكس
      }));

      await db.insert(journalEntryLines).values(reversalLines);

      // ترحيل القيد العكسي إلى دفتر الأستاذ
      for (const line of reversalLines) {
        await db.insert(generalLedger).values({
          accountId: line.accountId,
          transactionDate: new Date(input.reversalDate),
          entryId: reversalEntryId,
          description: line.description,
          debitAmount: line.debitAmount,
          creditAmount: line.creditAmount,
        });
      }

      // تحديث حالة القيد الأصلي
      await db
        .update(journalEntries)
        .set({
          status: "reversed",
        })
        .where(eq(journalEntries.id, input.id));

      return { 
        success: true,
        reversalEntryId,
        message: "تم عكس القيد بنجاح",
      };
    }),

  // التحقق من توازن القيد
  validateBalance: protectedProcedure
    .input(z.object({
      lines: z.array(z.object({
        debitAmount: z.number().min(0),
        creditAmount: z.number().min(0),
      })),
    }))
    .query(async ({ input }) => {
      const totalDebit = input.lines.reduce((sum, line) => sum + line.debitAmount, 0);
      const totalCredit = input.lines.reduce((sum, line) => sum + line.creditAmount, 0);
      const difference = totalDebit - totalCredit;
      const isBalanced = Math.abs(difference) < 0.01;

      return {
        totalDebit,
        totalCredit,
        difference,
        isBalanced,
        message: isBalanced 
          ? "القيد متوازن" 
          : `القيد غير متوازن: الفرق = ${difference.toFixed(2)}`,
      };
    }),

  // حذف قيد يومي
  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("قاعدة البيانات غير متاحة");

      // التحقق من حالة القيد
      const entry = await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.id, input.id))
        .limit(1);

      if (entry.length === 0) {
        throw new Error("القيد اليومي غير موجود");
      }

      if (entry[0].status === "posted") {
        throw new Error("لا يمكن حذف قيد مرحّل. استخدم خاصية العكس بدلاً من ذلك");
      }

      // حذف البنود أولاً
      await db
        .delete(journalEntryLines)
        .where(eq(journalEntryLines.entryId, input.id));

      // ثم حذف القيد
      await db
        .delete(journalEntries)
        .where(eq(journalEntries.id, input.id));

      return { 
        success: true,
        message: "تم حذف القيد اليومي بنجاح",
      };
    }),
});
