import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  chartOfAccounts, 
  accountBalances, 
  invoices, 
  payments, 
  customers, 
  suppliers,
  generalLedger,
  journalEntries
} from "../../drizzle/schema";
import { eq, and, gte, lte, sql, sum, desc } from "drizzle-orm";

// Zod schemas for validation
const dateRangeSchema = z.object({
  startDate: z.string(), // ISO date string
  endDate: z.string(),   // ISO date string
});

export const reportsRouter = router({
  // تقرير الميزانية العمومية
  balanceSheet: protectedProcedure
    .input(z.object({
      asOfDate: z.string(), // ISO date string
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("قاعدة البيانات غير متاحة");

      // جلب جميع الحسابات مع أرصدتها
      const accounts = await db
        .select({
          id: chartOfAccounts.id,
          accountCode: chartOfAccounts.accountCode,
          accountName: chartOfAccounts.accountName,
          accountType: chartOfAccounts.accountType,
          balance: accountBalances.closingBalance,
        })
        .from(chartOfAccounts)
        .leftJoin(accountBalances, eq(chartOfAccounts.id, accountBalances.accountId))
        .where(eq(chartOfAccounts.isActive, true));

      // تصنيف الحسابات حسب النوع
      const assets = accounts.filter(acc => acc.accountType === "asset");
      const liabilities = accounts.filter(acc => acc.accountType === "liability");
      const equity = accounts.filter(acc => acc.accountType === "equity");

      // حساب المجاميع
      const totalAssets = assets.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
      const totalLiabilities = liabilities.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
      const totalEquity = equity.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);

      return {
        asOfDate: input.asOfDate,
        assets: {
          accounts: assets,
          total: totalAssets,
        },
        liabilities: {
          accounts: liabilities,
          total: totalLiabilities,
        },
        equity: {
          accounts: equity,
          total: totalEquity,
        },
        totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
        isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
      };
    }),

  // تقرير قائمة الدخل
  incomeStatement: protectedProcedure
    .input(dateRangeSchema)
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("قاعدة البيانات غير متاحة");

      // جلب حسابات الإيرادات والمصروفات
      const accounts = await db
        .select({
          id: chartOfAccounts.id,
          accountCode: chartOfAccounts.accountCode,
          accountName: chartOfAccounts.accountName,
          accountType: chartOfAccounts.accountType,
          balance: accountBalances.closingBalance,
        })
        .from(chartOfAccounts)
        .leftJoin(accountBalances, eq(chartOfAccounts.id, accountBalances.accountId))
        .where(eq(chartOfAccounts.isActive, true));

      const revenues = accounts.filter(acc => acc.accountType === "revenue");
      const expenses = accounts.filter(acc => acc.accountType === "expense");

      const totalRevenues = revenues.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
      const totalExpenses = expenses.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
      const netIncome = totalRevenues - totalExpenses;

      return {
        period: {
          startDate: input.startDate,
          endDate: input.endDate,
        },
        revenues: {
          accounts: revenues,
          total: totalRevenues,
        },
        expenses: {
          accounts: expenses,
          total: totalExpenses,
        },
        netIncome,
        netIncomePercentage: totalRevenues > 0 ? (netIncome / totalRevenues) * 100 : 0,
      };
    }),

  // تقرير التدفقات النقدية
  cashFlow: protectedProcedure
    .input(dateRangeSchema)
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("قاعدة البيانات غير متاحة");

      // جلب جميع المدفوعات في الفترة المحددة
      const allPayments = await db
        .select()
        .from(payments)
        .where(
          and(
            gte(payments.paymentDate, input.startDate),
            lte(payments.paymentDate, input.endDate)
          )
        );

      // تصنيف التدفقات
      const cashInflows = allPayments
        .filter(p => p.paymentType === "receipt")
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const cashOutflows = allPayments
        .filter(p => p.paymentType === "payment")
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const netCashFlow = cashInflows - cashOutflows;

      return {
        period: {
          startDate: input.startDate,
          endDate: input.endDate,
        },
        operatingActivities: {
          cashInflows,
          cashOutflows,
          netCashFlow,
        },
        summary: {
          totalInflows: cashInflows,
          totalOutflows: cashOutflows,
          netChange: netCashFlow,
        },
      };
    }),

  // تقرير الذمم المدينة (العملاء)
  accountsReceivable: protectedProcedure
    .input(
      z.object({
        asOfDate: z.string().optional(),
        customerId: z.number().int().positive().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("قاعدة البيانات غير متاحة");

      // جلب الفواتير غير المدفوعة بالكامل
      let query = db
        .select({
          invoiceId: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          invoiceDate: invoices.invoiceDate,
          customerId: invoices.customerId,
          customerName: customers.customerName,
          totalAmount: invoices.totalAmount,
          paidAmount: invoices.paidAmount,
          remainingAmount: sql<number>`${invoices.totalAmount} - ${invoices.paidAmount}`,
          dueDate: invoices.dueDate,
        })
        .from(invoices)
        .leftJoin(customers, eq(invoices.customerId, customers.id))
        .where(sql`${invoices.totalAmount} > ${invoices.paidAmount}`);

      if (input?.customerId) {
        query = query.where(eq(invoices.customerId, input.customerId)) as any;
      }

      const result = await query;

      const totalReceivable = result.reduce((sum, inv) => sum + Number(inv.remainingAmount), 0);

      return {
        asOfDate: input?.asOfDate || new Date().toISOString().split('T')[0],
        invoices: result,
        summary: {
          totalInvoices: result.length,
          totalReceivable,
        },
      };
    }),

  // تقرير الذمم الدائنة (الموردين)
  accountsPayable: protectedProcedure
    .input(
      z.object({
        asOfDate: z.string().optional(),
        supplierId: z.number().int().positive().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("قاعدة البيانات غير متاحة");

      // في هذا النظام، الذمم الدائنة تأتي من طلبات الشراء المعتمدة
      // يمكن تطوير هذا التقرير لاحقاً بناءً على متطلبات النظام

      return {
        asOfDate: input?.asOfDate || new Date().toISOString().split('T')[0],
        summary: {
          totalPayable: 0,
          message: "سيتم تطوير هذا التقرير لاحقاً بناءً على فواتير الموردين",
        },
      };
    }),

  // تقرير دفتر الأستاذ العام
  generalLedgerReport: protectedProcedure
    .input(
      z.object({
        accountId: z.number().int().positive().optional(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("قاعدة البيانات غير متاحة");

      let query = db
        .select()
        .from(generalLedger)
        .where(
          and(
            gte(generalLedger.transactionDate, input.startDate),
            lte(generalLedger.transactionDate, input.endDate)
          )
        )
        .orderBy(desc(generalLedger.transactionDate));

      if (input.accountId) {
        query = query.where(eq(generalLedger.accountId, input.accountId)) as any;
      }

      const result = await query;

      return {
        period: {
          startDate: input.startDate,
          endDate: input.endDate,
        },
        entries: result,
        summary: {
          totalEntries: result.length,
        },
      };
    }),

  // تقرير ملخص المبيعات
  salesSummary: protectedProcedure
    .input(dateRangeSchema)
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("قاعدة البيانات غير متاحة");

      const salesInvoices = await db
        .select()
        .from(invoices)
        .where(
          and(
            gte(invoices.invoiceDate, input.startDate),
            lte(invoices.invoiceDate, input.endDate)
          )
        );

      const totalSales = salesInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
      const totalPaid = salesInvoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
      const totalOutstanding = totalSales - totalPaid;

      return {
        period: {
          startDate: input.startDate,
          endDate: input.endDate,
        },
        summary: {
          totalInvoices: salesInvoices.length,
          totalSales,
          totalPaid,
          totalOutstanding,
          collectionRate: totalSales > 0 ? (totalPaid / totalSales) * 100 : 0,
        },
        invoices: salesInvoices,
      };
    }),
});
