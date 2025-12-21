import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { invoiceTemplates, creditNotes, creditNoteItems } from "../../drizzle/schema-pg";
import { eq, desc, and, sql } from "drizzle-orm";

export const advancedBillingRouter = router({
  // ==========================================
  // قوالب الفواتير
  // ==========================================
  
  getInvoiceTemplates: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select().from(invoiceTemplates).orderBy(desc(invoiceTemplates.createdAt));
  }),

  getInvoiceTemplateById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.select().from(invoiceTemplates).where(eq(invoiceTemplates.id, input.id));
      return result[0] || null;
    }),

  createInvoiceTemplate: publicProcedure
    .input(z.object({
      templateName: z.string(),
      templateType: z.enum(["standard", "recurring", "credit_note", "debit_note", "proforma"]).optional(),
      description: z.string().optional(),
      headerHtml: z.string().optional(),
      bodyHtml: z.string().optional(),
      footerHtml: z.string().optional(),
      cssStyles: z.string().optional(),
      logoUrl: z.string().optional(),
      companyInfo: z.any().optional(),
      termsAndConditions: z.string().optional(),
      notes: z.string().optional(),
      isDefault: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // إذا كان القالب افتراضي، إلغاء الافتراضي من القوالب الأخرى
      if (input.isDefault) {
        await db.update(invoiceTemplates).set({ isDefault: false });
      }
      
      const result = await db.insert(invoiceTemplates).values({
        templateName: input.templateName,
        templateType: input.templateType,
        description: input.description,
        headerHtml: input.headerHtml,
        bodyHtml: input.bodyHtml,
        footerHtml: input.footerHtml,
        cssStyles: input.cssStyles,
        logoUrl: input.logoUrl,
        companyInfo: input.companyInfo,
        termsAndConditions: input.termsAndConditions,
        notes: input.notes,
        isDefault: input.isDefault,
      });
      return { success: true, id: result[0].insertId };
    }),

  updateInvoiceTemplate: publicProcedure
    .input(z.object({
      id: z.number(),
      templateName: z.string().optional(),
      templateType: z.enum(["standard", "recurring", "credit_note", "debit_note", "proforma"]).optional(),
      description: z.string().optional(),
      headerHtml: z.string().optional(),
      bodyHtml: z.string().optional(),
      footerHtml: z.string().optional(),
      cssStyles: z.string().optional(),
      logoUrl: z.string().optional(),
      companyInfo: z.any().optional(),
      termsAndConditions: z.string().optional(),
      notes: z.string().optional(),
      isDefault: z.boolean().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...updateData } = input;
      
      if (updateData.isDefault) {
        await db.update(invoiceTemplates).set({ isDefault: false });
      }
      
      await db.update(invoiceTemplates).set(updateData).where(eq(invoiceTemplates.id, id));
      return { success: true };
    }),

  deleteInvoiceTemplate: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(invoiceTemplates).where(eq(invoiceTemplates.id, input.id));
      return { success: true };
    }),

  // ==========================================
  // الفواتير المرتجعة (Credit Notes)
  // ==========================================

  getCreditNotes: publicProcedure
    .input(z.object({
      customerId: z.number().optional(),
      status: z.enum(["draft", "issued", "applied", "cancelled"]).optional(),
      limit: z.number().default(100),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let query = db.select().from(creditNotes);
      const conditions = [];
      
      if (input.customerId) {
        conditions.push(eq(creditNotes.customerId, input.customerId));
      }
      if (input.status) {
        conditions.push(eq(creditNotes.status, input.status));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return await query.orderBy(desc(creditNotes.createdAt)).limit(input.limit);
    }),

  getCreditNoteById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const note = await db.select().from(creditNotes).where(eq(creditNotes.id, input.id));
      if (!note[0]) return null;
      
      const items = await db.select().from(creditNoteItems).where(eq(creditNoteItems.creditNoteId, input.id));
      
      return { ...note[0], items };
    }),

  createCreditNote: publicProcedure
    .input(z.object({
      customerId: z.number(),
      originalInvoiceId: z.number().optional(),
      issueDate: z.string(),
      reason: z.enum(["return", "discount", "error", "cancellation", "other"]),
      reasonDescription: z.string().optional(),
      notes: z.string().optional(),
      items: z.array(z.object({
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.number(),
        taxRate: z.number().optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // حساب المجاميع
      let subtotal = 0;
      let taxAmount = 0;
      
      const itemsWithTotals = input.items.map(item => {
        const itemTotal = item.quantity * item.unitPrice;
        const itemTax = itemTotal * (item.taxRate || 0) / 100;
        subtotal += itemTotal;
        taxAmount += itemTax;
        return {
          ...item,
          taxAmount: itemTax,
          totalAmount: itemTotal + itemTax,
        };
      });
      
      const totalAmount = subtotal + taxAmount;
      
      // إنشاء رقم الإشعار
      const creditNoteNumber = `CN-${Date.now()}`;
      
      // إنشاء الإشعار
      const result = await db.insert(creditNotes).values({
        creditNoteNumber,
        customerId: input.customerId,
        originalInvoiceId: input.originalInvoiceId,
        issueDate: new Date(input.issueDate),
        reason: input.reason,
        reasonDescription: input.reasonDescription,
        subtotal: subtotal.toString(),
        taxAmount: taxAmount.toString(),
        totalAmount: totalAmount.toString(),
        notes: input.notes,
      });
      
      const creditNoteId = result[0].insertId;
      
      // إنشاء البنود
      for (const item of itemsWithTotals) {
        await db.insert(creditNoteItems).values({
          creditNoteId,
          description: item.description,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
          taxRate: (item.taxRate || 0).toString(),
          taxAmount: item.taxAmount.toString(),
          totalAmount: item.totalAmount.toString(),
        });
      }
      
      return { success: true, id: creditNoteId, creditNoteNumber };
    }),

  issueCreditNote: publicProcedure
    .input(z.object({ id: z.number(), approvedBy: z.number().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(creditNotes).set({
        status: "issued",
        approvedBy: input.approvedBy,
        approvedAt: new Date(),
      }).where(eq(creditNotes.id, input.id));
      
      return { success: true };
    }),

  applyCreditNote: publicProcedure
    .input(z.object({
      id: z.number(),
      applyToInvoiceId: z.number(),
      amount: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(creditNotes).set({
        status: "applied",
        appliedToInvoiceId: input.applyToInvoiceId,
        appliedAmount: input.amount.toString(),
        appliedAt: new Date(),
      }).where(eq(creditNotes.id, input.id));
      
      return { success: true };
    }),

  cancelCreditNote: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(creditNotes).set({ status: "cancelled" }).where(eq(creditNotes.id, input.id));
      return { success: true };
    }),

  // ==========================================
  // إحصائيات الفوترة المتقدمة
  // ==========================================

  getBillingStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const templates = await db.select({ count: sql<number>`count(*)` }).from(invoiceTemplates);
    const creditNotesCount = await db.select({ count: sql<number>`count(*)` }).from(creditNotes);
    const issuedCreditNotes = await db.select({ count: sql<number>`count(*)` }).from(creditNotes).where(eq(creditNotes.status, "issued"));
    
    return {
      totalTemplates: templates[0]?.count || 0,
      totalCreditNotes: creditNotesCount[0]?.count || 0,
      issuedCreditNotes: issuedCreditNotes[0]?.count || 0,
    };
  }),
});
