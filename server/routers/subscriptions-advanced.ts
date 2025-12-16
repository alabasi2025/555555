import { z } from 'zod';
import { router, publicProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { eq, and, gte, lte, like, desc, asc, sql, count } from 'drizzle-orm';

// ============================================
// أنواع البيانات
// ============================================
const SubscriptionStatus = z.enum(['active', 'suspended', 'cancelled', 'pending', 'expired']);
const BillingCycle = z.enum(['monthly', 'quarterly', 'yearly']);
const MeterType = z.enum(['residential', 'commercial', 'industrial', 'agricultural']);

// ============================================
// Router الاشتراكات المتقدم
// ============================================
export const subscriptionsAdvancedRouter = router({
  // الحصول على جميع الاشتراكات مع الفلترة والترقيم
  getAll: publicProcedure
    .input(z.object({
      page: z.number().default(1),
      pageSize: z.number().default(10),
      status: SubscriptionStatus.optional(),
      meterType: MeterType.optional(),
      search: z.string().optional(),
      sortBy: z.string().default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }).optional())
    .query(async ({ input }) => {
      // بيانات تجريبية
      const subscriptions = [
        {
          id: 'sub-001',
          subscriptionNumber: 'SUB-2024-001',
          customerId: 'cust-001',
          customerName: 'شركة الأمل للتجارة',
          meterNumber: 'MTR-001',
          meterType: 'commercial',
          address: 'الرياض - حي العليا - شارع التحلية',
          status: 'active',
          billingCycle: 'monthly',
          baseRate: 0.18,
          currentReading: 45230,
          previousReading: 44500,
          consumption: 730,
          lastBillAmount: 131.40,
          lastBillDate: '2024-12-01',
          nextBillDate: '2025-01-01',
          depositAmount: 500,
          createdAt: '2024-01-15',
        },
        {
          id: 'sub-002',
          subscriptionNumber: 'SUB-2024-002',
          customerId: 'cust-002',
          customerName: 'مؤسسة النور',
          meterNumber: 'MTR-002',
          meterType: 'industrial',
          address: 'جدة - المنطقة الصناعية',
          status: 'active',
          billingCycle: 'monthly',
          baseRate: 0.15,
          currentReading: 125000,
          previousReading: 118000,
          consumption: 7000,
          lastBillAmount: 1050.00,
          lastBillDate: '2024-12-01',
          nextBillDate: '2025-01-01',
          depositAmount: 2000,
          createdAt: '2024-02-20',
        },
        {
          id: 'sub-003',
          subscriptionNumber: 'SUB-2024-003',
          customerId: 'cust-003',
          customerName: 'أحمد محمد العلي',
          meterNumber: 'MTR-003',
          meterType: 'residential',
          address: 'الدمام - حي الفيصلية',
          status: 'suspended',
          billingCycle: 'monthly',
          baseRate: 0.20,
          currentReading: 8500,
          previousReading: 8200,
          consumption: 300,
          lastBillAmount: 60.00,
          lastBillDate: '2024-11-01',
          nextBillDate: '2024-12-01',
          depositAmount: 200,
          createdAt: '2024-03-10',
        },
      ];

      const { page = 1, pageSize = 10, status, meterType, search } = input || {};
      
      let filtered = subscriptions;
      
      if (status) {
        filtered = filtered.filter(s => s.status === status);
      }
      if (meterType) {
        filtered = filtered.filter(s => s.meterType === meterType);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(s => 
          s.subscriptionNumber.toLowerCase().includes(searchLower) ||
          s.customerName.toLowerCase().includes(searchLower) ||
          s.meterNumber.toLowerCase().includes(searchLower)
        );
      }

      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const data = filtered.slice(start, start + pageSize);

      return {
        data,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    }),

  // الحصول على اشتراك واحد بالتفصيل
  getById: publicProcedure
    .input(z.string())
    .query(async ({ input: id }) => {
      return {
        id,
        subscriptionNumber: 'SUB-2024-001',
        customerId: 'cust-001',
        customerName: 'شركة الأمل للتجارة',
        customerPhone: '0501234567',
        customerEmail: 'info@alamal.com',
        meterNumber: 'MTR-001',
        meterType: 'commercial',
        meterModel: 'Smart Meter X100',
        address: 'الرياض - حي العليا - شارع التحلية',
        status: 'active',
        billingCycle: 'monthly',
        baseRate: 0.18,
        currentReading: 45230,
        previousReading: 44500,
        consumption: 730,
        lastBillAmount: 131.40,
        lastBillDate: '2024-12-01',
        nextBillDate: '2025-01-01',
        depositAmount: 500,
        contractStartDate: '2024-01-15',
        contractEndDate: '2025-01-14',
        createdAt: '2024-01-15',
        billingHistory: [
          { month: 'ديسمبر 2024', consumption: 730, amount: 131.40, status: 'paid' },
          { month: 'نوفمبر 2024', consumption: 680, amount: 122.40, status: 'paid' },
          { month: 'أكتوبر 2024', consumption: 720, amount: 129.60, status: 'paid' },
        ],
      };
    }),

  // إنشاء اشتراك جديد
  create: publicProcedure
    .input(z.object({
      customerId: z.string(),
      meterNumber: z.string(),
      meterType: MeterType,
      address: z.string(),
      billingCycle: BillingCycle,
      baseRate: z.number(),
      depositAmount: z.number().optional(),
      contractStartDate: z.string(),
      contractEndDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = `sub-${Date.now()}`;
      const subscriptionNumber = `SUB-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      
      return {
        success: true,
        subscription: {
          id,
          subscriptionNumber,
          ...input,
          status: 'pending',
          currentReading: 0,
          previousReading: 0,
          consumption: 0,
          createdAt: new Date().toISOString(),
        },
      };
    }),

  // تحديث اشتراك
  update: publicProcedure
    .input(z.object({
      id: z.string(),
      status: SubscriptionStatus.optional(),
      billingCycle: BillingCycle.optional(),
      baseRate: z.number().optional(),
      address: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: 'تم تحديث الاشتراك بنجاح',
      };
    }),

  // تعليق اشتراك
  suspend: publicProcedure
    .input(z.object({
      id: z.string(),
      reason: z.string(),
    }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: 'تم تعليق الاشتراك بنجاح',
      };
    }),

  // إعادة تفعيل اشتراك
  reactivate: publicProcedure
    .input(z.string())
    .mutation(async ({ input: id }) => {
      return {
        success: true,
        message: 'تم إعادة تفعيل الاشتراك بنجاح',
      };
    }),

  // إلغاء اشتراك
  cancel: publicProcedure
    .input(z.object({
      id: z.string(),
      reason: z.string(),
    }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: 'تم إلغاء الاشتراك بنجاح',
      };
    }),

  // الحصول على إحصائيات الاشتراكات
  getStats: publicProcedure.query(async () => {
    return {
      total: 1850,
      active: 1650,
      suspended: 120,
      cancelled: 50,
      pending: 30,
      byType: {
        residential: 1200,
        commercial: 450,
        industrial: 150,
        agricultural: 50,
      },
      monthlyRevenue: 485000,
      avgConsumption: 850,
    };
  }),

  // تسجيل قراءة عداد
  recordReading: publicProcedure
    .input(z.object({
      subscriptionId: z.string(),
      reading: z.number(),
      readingDate: z.string(),
      readBy: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: 'تم تسجيل القراءة بنجاح',
        consumption: 730, // الاستهلاك المحسوب
      };
    }),

  // إنشاء فاتورة للاشتراك
  generateBill: publicProcedure
    .input(z.object({
      subscriptionId: z.string(),
      billingPeriodStart: z.string(),
      billingPeriodEnd: z.string(),
    }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        bill: {
          id: `bill-${Date.now()}`,
          billNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          subscriptionId: input.subscriptionId,
          consumption: 730,
          amount: 131.40,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending',
        },
      };
    }),
});

export type SubscriptionsAdvancedRouter = typeof subscriptionsAdvancedRouter;
