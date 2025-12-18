import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  invoices, 
  payments, 
  customers, 
  suppliers, 
  items, 
  workOrders,
  meters,
  assets,
  maintenanceSchedules,
  journalEntries,
} from "../../drizzle/schema";
import { eq, sql, desc, and, gte, lte, count, sum, avg, lt } from "drizzle-orm";

// ============================================
// Dashboard Router - لوحة التحكم والإحصائيات
// ============================================

export const dashboardRouter = router({
  // ============================================
  // الإحصائيات الرئيسية (Main Stats)
  // ============================================
  
  getMainStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        invoices: { total: 0, totalAmount: 0, paidAmount: 0, remainingAmount: 0, changePercent: "0" },
        payments: { total: 0, totalAmount: 0 },
        customers: { total: 0, active: 0 },
        suppliers: { total: 0, active: 0 },
        inventory: { totalItems: 0, totalValue: 0, lowStockItems: 0 },
        meters: { total: 0, active: 0, faulty: 0 },
        workOrders: { total: 0, pending: 0, inProgress: 0, completed: 0 },
        assets: { total: 0, totalValue: 0 },
      };
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // إحصائيات الفواتير
    const [invoiceStats] = await db
      .select({
        totalCount: count(),
        totalAmount: sum(invoices.totalAmount),
        paidAmount: sum(invoices.paidAmount),
        remainingAmount: sum(invoices.remainingAmount),
      })
      .from(invoices);

    // فواتير الشهر الحالي
    const [currentMonthInvoices] = await db
      .select({
        totalAmount: sum(invoices.totalAmount),
      })
      .from(invoices)
      .where(gte(invoices.invoiceDate, startOfMonth));

    // فواتير الشهر السابق
    const [lastMonthInvoices] = await db
      .select({
        totalAmount: sum(invoices.totalAmount),
      })
      .from(invoices)
      .where(and(
        gte(invoices.invoiceDate, startOfLastMonth),
        lte(invoices.invoiceDate, endOfLastMonth)
      ));

    // حساب نسبة التغيير
    const currentAmount = Number(currentMonthInvoices?.totalAmount || 0);
    const lastAmount = Number(lastMonthInvoices?.totalAmount || 0);
    const changePercent = lastAmount > 0 
      ? (((currentAmount - lastAmount) / lastAmount) * 100).toFixed(1)
      : "0";

    // إحصائيات المدفوعات
    const [paymentStats] = await db
      .select({
        totalCount: count(),
        totalAmount: sum(payments.amount),
      })
      .from(payments);

    // إحصائيات العملاء
    const [customerStats] = await db
      .select({
        totalCount: count(),
      })
      .from(customers);

    const [activeCustomers] = await db
      .select({
        count: count(),
      })
      .from(customers)
      .where(eq(customers.isActive, true));

    // إحصائيات الموردين
    const [supplierStats] = await db
      .select({
        totalCount: count(),
      })
      .from(suppliers);

    const [activeSuppliers] = await db
      .select({
        count: count(),
      })
      .from(suppliers)
      .where(eq(suppliers.isActive, true));

    // إحصائيات المخزون
    const [inventoryStats] = await db
      .select({
        totalItems: count(),
        totalValue: sum(sql`${items.currentQuantity} * ${items.unitCost}`),
      })
      .from(items);

    const [lowStockItems] = await db
      .select({
        count: count(),
      })
      .from(items)
      .where(lt(items.currentQuantity, items.minQuantity));

    // إحصائيات العدادات
    const [meterStats] = await db
      .select({
        totalCount: count(),
      })
      .from(meters);

    const [activeMeters] = await db
      .select({
        count: count(),
      })
      .from(meters)
      .where(eq(meters.status, "active"));

    const [faultyMeters] = await db
      .select({
        count: count(),
      })
      .from(meters)
      .where(eq(meters.status, "faulty"));

    // إحصائيات أوامر العمل
    const [workOrderStats] = await db
      .select({
        totalCount: count(),
      })
      .from(workOrders);

    const [pendingWorkOrders] = await db
      .select({
        count: count(),
      })
      .from(workOrders)
      .where(eq(workOrders.status, "pending"));

    const [inProgressWorkOrders] = await db
      .select({
        count: count(),
      })
      .from(workOrders)
      .where(eq(workOrders.status, "in_progress"));

    const [completedWorkOrders] = await db
      .select({
        count: count(),
      })
      .from(workOrders)
      .where(eq(workOrders.status, "completed"));

    // إحصائيات الأصول
    const [assetStats] = await db
      .select({
        totalCount: count(),
        totalValue: sum(assets.purchasePrice),
      })
      .from(assets);

    return {
      invoices: {
        total: invoiceStats?.totalCount || 0,
        totalAmount: Number(invoiceStats?.totalAmount || 0),
        paidAmount: Number(invoiceStats?.paidAmount || 0),
        remainingAmount: Number(invoiceStats?.remainingAmount || 0),
        changePercent,
      },
      payments: {
        total: paymentStats?.totalCount || 0,
        totalAmount: Number(paymentStats?.totalAmount || 0),
      },
      customers: {
        total: customerStats?.totalCount || 0,
        active: activeCustomers?.count || 0,
      },
      suppliers: {
        total: supplierStats?.totalCount || 0,
        active: activeSuppliers?.count || 0,
      },
      inventory: {
        totalItems: inventoryStats?.totalItems || 0,
        totalValue: Number(inventoryStats?.totalValue || 0),
        lowStockItems: lowStockItems?.count || 0,
      },
      meters: {
        total: meterStats?.totalCount || 0,
        active: activeMeters?.count || 0,
        faulty: faultyMeters?.count || 0,
      },
      workOrders: {
        total: workOrderStats?.totalCount || 0,
        pending: pendingWorkOrders?.count || 0,
        inProgress: inProgressWorkOrders?.count || 0,
        completed: completedWorkOrders?.count || 0,
      },
      assets: {
        total: assetStats?.totalCount || 0,
        totalValue: Number(assetStats?.totalValue || 0),
      },
    };
  }),

  // ============================================
  // ملخص اليوم (Quick Summary)
  // ============================================
  
  getQuickSummary: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        todayInvoices: { count: 0, total: 0 },
        todayPayments: { count: 0, total: 0 },
        todayWorkOrders: 0,
        todayCustomers: 0,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // فواتير اليوم
    const [todayInvoices] = await db
      .select({
        count: count(),
        total: sum(invoices.totalAmount),
      })
      .from(invoices)
      .where(gte(invoices.invoiceDate, today));

    // مدفوعات اليوم
    const [todayPayments] = await db
      .select({
        count: count(),
        total: sum(payments.amount),
      })
      .from(payments)
      .where(gte(payments.paymentDate, today));

    // أوامر عمل اليوم
    const [todayWorkOrders] = await db
      .select({
        count: count(),
      })
      .from(workOrders)
      .where(gte(workOrders.createdAt, today));

    // عملاء جدد اليوم
    const [todayCustomers] = await db
      .select({
        count: count(),
      })
      .from(customers)
      .where(gte(customers.createdAt, today));

    return {
      todayInvoices: {
        count: todayInvoices?.count || 0,
        total: Number(todayInvoices?.total || 0),
      },
      todayPayments: {
        count: todayPayments?.count || 0,
        total: Number(todayPayments?.total || 0),
      },
      todayWorkOrders: todayWorkOrders?.count || 0,
      todayCustomers: todayCustomers?.count || 0,
    };
  }),

  // ============================================
  // الأنشطة الأخيرة (Recent Activities)
  // ============================================
  
  getRecentActivities: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const limit = input?.limit || 10;

      // جلب آخر القيود المحاسبية كأنشطة
      const activities = await db
        .select({
          id: journalEntries.id,
          activityType: sql<string>`'create'`,
          entityType: sql<string>`'journal_entry'`,
          entityName: journalEntries.description,
          description: journalEntries.description,
          createdAt: journalEntries.entryDate,
        })
        .from(journalEntries)
        .orderBy(desc(journalEntries.entryDate))
        .limit(limit);

      return activities.map(a => ({
        ...a,
        createdAt: a.createdAt?.toISOString() || new Date().toISOString(),
      }));
    }),

  // ============================================
  // الفواتير المتأخرة (Overdue Invoices)
  // ============================================
  
  getOverdueInvoices: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(5),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const limit = input?.limit || 5;
      const today = new Date();

      const overdueInvoices = await db
        .select({
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          totalAmount: invoices.totalAmount,
          remainingAmount: invoices.remainingAmount,
          dueDate: invoices.dueDate,
          customerId: invoices.customerId,
        })
        .from(invoices)
        .where(and(
          lt(invoices.dueDate, today),
          sql`${invoices.remainingAmount} > 0`
        ))
        .orderBy(invoices.dueDate)
        .limit(limit);

      // جلب أسماء العملاء
      const result = await Promise.all(
        overdueInvoices.map(async (invoice) => {
          const [customer] = await db!
            .select({ name: customers.customerName })
            .from(customers)
            .where(eq(customers.id, invoice.customerId))
            .limit(1);

          const daysOverdue = Math.floor(
            (today.getTime() - new Date(invoice.dueDate!).getTime()) / (1000 * 60 * 60 * 24)
          );

          return {
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            customerName: customer?.name || "غير معروف",
            totalAmount: Number(invoice.totalAmount),
            remainingAmount: Number(invoice.remainingAmount),
            daysOverdue,
          };
        })
      );

      return result;
    }),

  // ============================================
  // الصيانة القادمة (Upcoming Maintenance)
  // ============================================
  
  getUpcomingMaintenance: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(5),
      days: z.number().min(1).max(365).default(30),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const limit = input?.limit || 5;
      const days = input?.days || 30;
      const today = new Date();
      const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

      const upcoming = await db
        .select({
          id: maintenanceSchedules.id,
          assetId: maintenanceSchedules.assetId,
          maintenanceType: maintenanceSchedules.maintenanceType,
          nextMaintenanceDate: maintenanceSchedules.nextMaintenanceDate,
          estimatedCost: maintenanceSchedules.estimatedCost,
        })
        .from(maintenanceSchedules)
        .where(and(
          gte(maintenanceSchedules.nextMaintenanceDate, today),
          lte(maintenanceSchedules.nextMaintenanceDate, futureDate),
          eq(maintenanceSchedules.status, "scheduled")
        ))
        .orderBy(maintenanceSchedules.nextMaintenanceDate)
        .limit(limit);

      // جلب أسماء الأصول
      const result = await Promise.all(
        upcoming.map(async (schedule) => {
          const [asset] = await db!
            .select({ name: assets.assetName })
            .from(assets)
            .where(eq(assets.id, schedule.assetId))
            .limit(1);

          return {
            id: schedule.id,
            assetName: asset?.name || "غير معروف",
            maintenanceType: schedule.maintenanceType,
            nextMaintenanceDate: schedule.nextMaintenanceDate?.toISOString() || "",
            estimatedCost: Number(schedule.estimatedCost || 0),
          };
        })
      );

      return result;
    }),

  // ============================================
  // أصناف المخزون المنخفضة (Low Stock Items)
  // ============================================
  
  getLowStockItems: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(5),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const limit = input?.limit || 5;

      const lowStock = await db
        .select({
          id: items.id,
          itemName: items.itemName,
          currentQuantity: items.currentQuantity,
          minQuantity: items.minQuantity,
        })
        .from(items)
        .where(lt(items.currentQuantity, items.minQuantity))
        .orderBy(sql`${items.currentQuantity} - ${items.minQuantity}`)
        .limit(limit);

      return lowStock.map(item => ({
        id: item.id,
        itemName: item.itemName,
        currentQuantity: Number(item.currentQuantity || 0),
        minQuantity: Number(item.minQuantity || 0),
        deficit: Number(item.minQuantity || 0) - Number(item.currentQuantity || 0),
      }));
    }),

  // ============================================
  // مخطط حالة الفواتير (Invoice Status Chart)
  // ============================================
  
  getInvoiceStatusChart: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const statusData = await db
      .select({
        status: invoices.status,
        count: count(),
        total: sum(invoices.totalAmount),
      })
      .from(invoices)
      .groupBy(invoices.status);

    return statusData.map(item => ({
      status: item.status,
      count: item.count,
      total: Number(item.total || 0),
    }));
  }),
});
