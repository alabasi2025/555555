import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  recurringInvoices, 
  recurringInvoiceItems, 
  recurringInvoiceHistory,
  invoices,
  invoiceItems 
} from "../../drizzle/schema";
import { eq, and, desc, sql, lte, gte } from "drizzle-orm";

export const recurringInvoicesRouter = router({
  // الحصول على جميع الفواتير الدورية
  getAll: publicProcedure
    .input(z.object({
      status: z.enum(["active", "paused", "completed", "cancelled"]).optional(),
      customerId: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let query = db.select().from(recurringInvoices);
      
      const conditions = [];
      if (input?.status) {
        conditions.push(eq(recurringInvoices.status, input.status));
      }
      if (input?.customerId) {
        conditions.push(eq(recurringInvoices.customerId, input.customerId));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return query.orderBy(desc(recurringInvoices.createdAt));
    }),

  // الحصول على فاتورة دورية بالمعرف
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const invoice = await db.select().from(recurringInvoices).where(eq(recurringInvoices.id, input.id));
      if (!invoice[0]) return null;
      
      const items = await db.select().from(recurringInvoiceItems).where(eq(recurringInvoiceItems.recurringInvoiceId, input.id));
      const history = await db.select().from(recurringInvoiceHistory).where(eq(recurringInvoiceHistory.recurringInvoiceId, input.id)).orderBy(desc(recurringInvoiceHistory.generatedDate));
      
      return { ...invoice[0], items, history };
    }),

  // إنشاء فاتورة دورية جديدة
  create: publicProcedure
    .input(z.object({
      templateName: z.string().min(1),
      customerId: z.number(),
      frequency: z.enum(["daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"]),
      startDate: z.string(),
      endDate: z.string().optional(),
      dayOfMonth: z.number().optional(),
      dayOfWeek: z.number().optional(),
      autoSend: z.boolean().default(false),
      notes: z.string().optional(),
      items: z.array(z.object({
        description: z.string(),
        quantity: z.string().default("1"),
        unitPrice: z.string(),
        taxRate: z.string().optional(),
        discountRate: z.string().optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // حساب المجاميع
      let subtotal = 0;
      let taxAmount = 0;
      let discountAmount = 0;
      
      const itemsWithTotals = input.items.map(item => {
        const qty = parseFloat(item.quantity);
        const price = parseFloat(item.unitPrice);
        const lineTotal = qty * price;
        const tax = lineTotal * (parseFloat(item.taxRate || "0") / 100);
        const discount = lineTotal * (parseFloat(item.discountRate || "0") / 100);
        
        subtotal += lineTotal;
        taxAmount += tax;
        discountAmount += discount;
        
        return {
          ...item,
          lineTotal: lineTotal.toFixed(2),
        };
      });
      
      const totalAmount = subtotal + taxAmount - discountAmount;
      
      const result = await db.insert(recurringInvoices).values({
        templateName: input.templateName,
        customerId: input.customerId,
        frequency: input.frequency,
        startDate: new Date(input.startDate),
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        nextInvoiceDate: new Date(input.startDate),
        dayOfMonth: input.dayOfMonth,
        dayOfWeek: input.dayOfWeek,
        subtotal: subtotal.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        autoSend: input.autoSend,
        notes: input.notes,
        status: "active",
      });
      
      const recurringInvoiceId = result[0].insertId;
      
      for (const item of itemsWithTotals) {
        await db.insert(recurringInvoiceItems).values({
          recurringInvoiceId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          discountRate: item.discountRate,
          lineTotal: item.lineTotal,
        });
      }
      
      return { id: recurringInvoiceId, success: true };
    }),

  // تحديث فاتورة دورية
  update: publicProcedure
    .input(z.object({
      id: z.number(),
      templateName: z.string().optional(),
      frequency: z.enum(["daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"]).optional(),
      endDate: z.string().optional(),
      dayOfMonth: z.number().optional(),
      dayOfWeek: z.number().optional(),
      autoSend: z.boolean().optional(),
      status: z.enum(["active", "paused", "completed", "cancelled"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, endDate, ...data } = input;
      await db.update(recurringInvoices).set({
        ...data,
        endDate: endDate ? new Date(endDate) : undefined,
      }).where(eq(recurringInvoices.id, id));
      return { success: true };
    }),

  // إيقاف/تفعيل فاتورة دورية
  toggleStatus: publicProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["active", "paused"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(recurringInvoices).set({ status: input.status }).where(eq(recurringInvoices.id, input.id));
      return { success: true };
    }),

  // توليد الفواتير المستحقة
  generateDueInvoices: publicProcedure.mutation(async () => {
    const db = await getDb();
      if (!db) throw new Error("Database not available");
    const today = new Date();
    
    // الحصول على الفواتير الدورية المستحقة
    const dueInvoices = await db.select().from(recurringInvoices)
      .where(and(
        eq(recurringInvoices.status, "active"),
        lte(recurringInvoices.nextInvoiceDate, today)
      ));
    
    const generated = [];
    
    for (const recurring of dueInvoices) {
      try {
        // الحصول على بنود الفاتورة الدورية
        const items = await db.select().from(recurringInvoiceItems)
          .where(eq(recurringInvoiceItems.recurringInvoiceId, recurring.id));
        
        // إنشاء رقم فاتورة جديد
        const invoiceNumber = `INV-${Date.now()}-${recurring.id}`;
        
        // إنشاء الفاتورة
        const invoiceResult = await db.insert(invoices).values({
          invoiceNumber,
          customerId: recurring.customerId,
          invoiceDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 يوم
          subtotal: recurring.subtotal || "0",
          taxAmount: recurring.taxAmount || "0",
          discountAmount: recurring.discountAmount || "0",
          totalAmount: recurring.totalAmount || "0",
          paidAmount: "0",
          remainingAmount: recurring.totalAmount || "0",
          status: "pending",
          notes: `تم إنشاؤها تلقائياً من الفاتورة الدورية: ${recurring.templateName}`,
        });
        
        const invoiceId = invoiceResult[0].insertId;
        
        // إضافة بنود الفاتورة
        for (const item of items) {
          await db.insert(invoiceItems).values({
            invoiceId,
            itemDescription: item.description,
            quantity: item.quantity || "1",
            unitPrice: item.unitPrice || "0",
            totalAmount: item.lineTotal || "0",
          });
        }
        
        // تسجيل في السجل
        await db.insert(recurringInvoiceHistory).values({
          recurringInvoiceId: recurring.id,
          invoiceId,
          status: "success",
        });
        
        // حساب تاريخ الفاتورة التالية
        const nextDate = calculateNextDate(recurring.nextInvoiceDate, recurring.frequency, recurring.dayOfMonth, recurring.dayOfWeek);
        
        // تحديث الفاتورة الدورية
        await db.update(recurringInvoices).set({
          lastInvoiceDate: new Date(),
          nextInvoiceDate: nextDate,
          invoicesGenerated: (recurring.invoicesGenerated || 0) + 1,
        }).where(eq(recurringInvoices.id, recurring.id));
        
        generated.push({ recurringId: recurring.id, invoiceId, success: true });
      } catch (error: any) {
        // تسجيل الخطأ
        await db.insert(recurringInvoiceHistory).values({
          recurringInvoiceId: recurring.id,
          invoiceId: 0,
          status: "failed",
          errorMessage: error.message,
        });
        
        generated.push({ recurringId: recurring.id, success: false, error: error.message });
      }
    }
    
    return { generated, count: generated.filter(g => g.success).length };
  }),

  // الحصول على الفواتير المستحقة للتوليد
  getDueForGeneration: publicProcedure.query(async () => {
    const db = await getDb();
      if (!db) throw new Error("Database not available");
    const today = new Date();
    
    return db.select().from(recurringInvoices)
      .where(and(
        eq(recurringInvoices.status, "active"),
        lte(recurringInvoices.nextInvoiceDate, today)
      ));
  }),

  // إحصائيات الفواتير الدورية
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
      if (!db) throw new Error("Database not available");
    const total = await db.select({ count: sql<number>`count(*)` }).from(recurringInvoices);
    const active = await db.select({ count: sql<number>`count(*)` }).from(recurringInvoices).where(eq(recurringInvoices.status, "active"));
    const totalGenerated = await db.select({ sum: sql<number>`sum(invoices_generated)` }).from(recurringInvoices);
    
    return {
      total: total[0]?.count || 0,
      active: active[0]?.count || 0,
      totalGenerated: totalGenerated[0]?.sum || 0,
    };
  }),

  // حذف فاتورة دورية
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(recurringInvoiceItems).where(eq(recurringInvoiceItems.recurringInvoiceId, input.id));
      await db.delete(recurringInvoiceHistory).where(eq(recurringInvoiceHistory.recurringInvoiceId, input.id));
      await db.delete(recurringInvoices).where(eq(recurringInvoices.id, input.id));
      return { success: true };
    }),
});

// دالة حساب تاريخ الفاتورة التالية
function calculateNextDate(currentDate: Date, frequency: string, dayOfMonth?: number | null, dayOfWeek?: number | null): Date {
  const next = new Date(currentDate);
  
  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "biweekly":
      next.setDate(next.getDate() + 14);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      if (dayOfMonth) {
        next.setDate(Math.min(dayOfMonth, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
      }
      break;
    case "quarterly":
      next.setMonth(next.getMonth() + 3);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  
  return next;
}
