import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  discountRules, 
  discountRuleItems, 
  promotions, 
  couponCodes, 
  couponUsage 
} from "../../drizzle/schema";
import { eq, and, desc, sql, like, or, gte, lte } from "drizzle-orm";

export const discountsRouter = router({
  // ============================================
  // قواعد الخصم
  // ============================================
  
  // الحصول على جميع قواعد الخصم
  getRules: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      discountType: z.enum(["percentage", "fixed_amount", "buy_x_get_y", "tiered"]).optional(),
      isActive: z.boolean().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let query = db.select().from(discountRules);
      
      const conditions = [];
      if (input?.search) {
        conditions.push(
          or(
            like(discountRules.ruleName, `%${input.search}%`),
            like(discountRules.ruleCode, `%${input.search}%`)
          )
        );
      }
      if (input?.discountType) {
        conditions.push(eq(discountRules.discountType, input.discountType));
      }
      if (input?.isActive !== undefined) {
        conditions.push(eq(discountRules.isActive, input.isActive));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return query.orderBy(desc(discountRules.priority), desc(discountRules.createdAt));
    }),

  // الحصول على قاعدة خصم بالمعرف
  getRuleById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const rule = await db.select().from(discountRules).where(eq(discountRules.id, input.id));
      if (!rule[0]) return null;
      
      const items = await db.select().from(discountRuleItems).where(eq(discountRuleItems.discountRuleId, input.id));
      
      return { ...rule[0], items };
    }),

  // إنشاء قاعدة خصم جديدة
  createRule: publicProcedure
    .input(z.object({
      ruleName: z.string().min(1),
      ruleCode: z.string().min(1),
      discountType: z.enum(["percentage", "fixed_amount", "buy_x_get_y", "tiered"]),
      discountValue: z.string(),
      minPurchaseAmount: z.string().optional(),
      maxDiscountAmount: z.string().optional(),
      startDate: z.string(),
      endDate: z.string().optional(),
      usageLimit: z.number().optional(),
      perCustomerLimit: z.number().optional(),
      applicableTo: z.enum(["all", "specific_items", "specific_categories", "specific_customers"]).default("all"),
      priority: z.number().default(0),
      description: z.string().optional(),
      items: z.array(z.object({
        itemId: z.number().optional(),
        categoryId: z.number().optional(),
        customerId: z.number().optional(),
      })).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(discountRules).values({
        ruleName: input.ruleName,
        ruleCode: input.ruleCode,
        discountType: input.discountType,
        discountValue: input.discountValue,
        minPurchaseAmount: input.minPurchaseAmount,
        maxDiscountAmount: input.maxDiscountAmount,
        startDate: new Date(input.startDate),
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        usageLimit: input.usageLimit,
        perCustomerLimit: input.perCustomerLimit,
        applicableTo: input.applicableTo,
        priority: input.priority,
        description: input.description,
        isActive: true,
      });
      
      const ruleId = result[0].insertId;
      
      if (input.items && input.items.length > 0) {
        for (const item of input.items) {
          await db.insert(discountRuleItems).values({
            discountRuleId: ruleId,
            itemId: item.itemId,
            categoryId: item.categoryId,
            customerId: item.customerId,
          });
        }
      }
      
      return { id: ruleId, success: true };
    }),

  // تحديث قاعدة خصم
  updateRule: publicProcedure
    .input(z.object({
      id: z.number(),
      ruleName: z.string().optional(),
      discountType: z.enum(["percentage", "fixed_amount", "buy_x_get_y", "tiered"]).optional(),
      discountValue: z.string().optional(),
      minPurchaseAmount: z.string().optional(),
      maxDiscountAmount: z.string().optional(),
      endDate: z.string().optional(),
      usageLimit: z.number().optional(),
      perCustomerLimit: z.number().optional(),
      applicableTo: z.enum(["all", "specific_items", "specific_categories", "specific_customers"]).optional(),
      priority: z.number().optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, endDate, ...data } = input;
      await db.update(discountRules).set({
        ...data,
        endDate: endDate ? new Date(endDate) : undefined,
      }).where(eq(discountRules.id, id));
      return { success: true };
    }),

  // حذف قاعدة خصم
  deleteRule: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(discountRuleItems).where(eq(discountRuleItems.discountRuleId, input.id));
      await db.delete(discountRules).where(eq(discountRules.id, input.id));
      return { success: true };
    }),

  // ============================================
  // العروض الترويجية
  // ============================================

  // الحصول على جميع العروض
  getPromotions: publicProcedure
    .input(z.object({
      promotionType: z.enum(["seasonal", "clearance", "loyalty", "bundle", "flash_sale"]).optional(),
      isActive: z.boolean().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let query = db.select().from(promotions);
      
      const conditions = [];
      if (input?.promotionType) {
        conditions.push(eq(promotions.promotionType, input.promotionType));
      }
      if (input?.isActive !== undefined) {
        conditions.push(eq(promotions.isActive, input.isActive));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return query.orderBy(desc(promotions.startDate));
    }),

  // الحصول على العروض النشطة حالياً
  getActivePromotions: publicProcedure.query(async () => {
    const db = await getDb();
      if (!db) throw new Error("Database not available");
    const now = new Date();
    
    return db.select().from(promotions)
      .where(and(
        eq(promotions.isActive, true),
        lte(promotions.startDate, now),
        gte(promotions.endDate, now)
      ))
      .orderBy(desc(promotions.startDate));
  }),

  // إنشاء عرض ترويجي
  createPromotion: publicProcedure
    .input(z.object({
      promotionName: z.string().min(1),
      promotionCode: z.string().min(1),
      promotionType: z.enum(["seasonal", "clearance", "loyalty", "bundle", "flash_sale"]),
      startDate: z.string(),
      endDate: z.string(),
      discountRuleId: z.number().optional(),
      bannerImage: z.string().optional(),
      description: z.string().optional(),
      termsConditions: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(promotions).values({
        promotionName: input.promotionName,
        promotionCode: input.promotionCode,
        promotionType: input.promotionType,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        discountRuleId: input.discountRuleId,
        bannerImage: input.bannerImage,
        description: input.description,
        termsConditions: input.termsConditions,
        isActive: true,
      });
      
      return { id: result[0].insertId, success: true };
    }),

  // تحديث عرض ترويجي
  updatePromotion: publicProcedure
    .input(z.object({
      id: z.number(),
      promotionName: z.string().optional(),
      promotionType: z.enum(["seasonal", "clearance", "loyalty", "bundle", "flash_sale"]).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      discountRuleId: z.number().optional(),
      bannerImage: z.string().optional(),
      description: z.string().optional(),
      termsConditions: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, startDate, endDate, ...data } = input;
      await db.update(promotions).set({
        ...data,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      }).where(eq(promotions.id, id));
      return { success: true };
    }),

  // حذف عرض ترويجي
  deletePromotion: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(promotions).where(eq(promotions.id, input.id));
      return { success: true };
    }),

  // ============================================
  // أكواد الكوبونات
  // ============================================

  // الحصول على جميع الكوبونات
  getCoupons: publicProcedure
    .input(z.object({
      discountRuleId: z.number().optional(),
      isActive: z.boolean().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let query = db.select().from(couponCodes);
      
      const conditions = [];
      if (input?.discountRuleId) {
        conditions.push(eq(couponCodes.discountRuleId, input.discountRuleId));
      }
      if (input?.isActive !== undefined) {
        conditions.push(eq(couponCodes.isActive, input.isActive));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return query.orderBy(desc(couponCodes.createdAt));
    }),

  // التحقق من صلاحية كوبون
  validateCoupon: publicProcedure
    .input(z.object({
      couponCode: z.string(),
      customerId: z.number(),
      purchaseAmount: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // البحث عن الكوبون
      const coupon = await db.select().from(couponCodes).where(eq(couponCodes.couponCode, input.couponCode));
      if (!coupon[0]) {
        return { valid: false, error: "كود الكوبون غير صحيح" };
      }
      
      const c = coupon[0];
      
      // التحقق من أن الكوبون نشط
      if (!c.isActive) {
        return { valid: false, error: "الكوبون غير نشط" };
      }
      
      // التحقق من تاريخ الانتهاء
      if (c.expiryDate && new Date(c.expiryDate) < new Date()) {
        return { valid: false, error: "الكوبون منتهي الصلاحية" };
      }
      
      // التحقق من عدد الاستخدامات
      if (c.usageLimit && c.usageCount >= c.usageLimit) {
        return { valid: false, error: "تم استنفاد عدد استخدامات الكوبون" };
      }
      
      // الحصول على قاعدة الخصم
      const rule = await db.select().from(discountRules).where(eq(discountRules.id, c.discountRuleId));
      if (!rule[0]) {
        return { valid: false, error: "قاعدة الخصم غير موجودة" };
      }
      
      const r = rule[0];
      
      // التحقق من الحد الأدنى للشراء
      if (r.minPurchaseAmount && parseFloat(input.purchaseAmount) < parseFloat(r.minPurchaseAmount)) {
        return { valid: false, error: `الحد الأدنى للشراء هو ${r.minPurchaseAmount}` };
      }
      
      // التحقق من استخدام العميل
      if (r.perCustomerLimit) {
        const customerUsage = await db.select({ count: sql<number>`count(*)` }).from(couponUsage)
          .where(and(
            eq(couponUsage.couponId, c.id),
            eq(couponUsage.customerId, input.customerId)
          ));
        
        if (customerUsage[0]?.count >= r.perCustomerLimit) {
          return { valid: false, error: "لقد استخدمت هذا الكوبون الحد الأقصى من المرات" };
        }
      }
      
      // حساب مبلغ الخصم
      let discountAmount = 0;
      if (r.discountType === "percentage") {
        discountAmount = parseFloat(input.purchaseAmount) * (parseFloat(r.discountValue) / 100);
      } else if (r.discountType === "fixed_amount") {
        discountAmount = parseFloat(r.discountValue);
      }
      
      // تطبيق الحد الأقصى للخصم
      if (r.maxDiscountAmount && discountAmount > parseFloat(r.maxDiscountAmount)) {
        discountAmount = parseFloat(r.maxDiscountAmount);
      }
      
      return {
        valid: true,
        couponId: c.id,
        discountRuleId: r.id,
        discountType: r.discountType,
        discountValue: r.discountValue,
        discountAmount: discountAmount.toFixed(2),
      };
    }),

  // تطبيق كوبون
  applyCoupon: publicProcedure
    .input(z.object({
      couponId: z.number(),
      customerId: z.number(),
      invoiceId: z.number(),
      discountAmount: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // تسجيل الاستخدام
      await db.insert(couponUsage).values({
        couponId: input.couponId,
        customerId: input.customerId,
        invoiceId: input.invoiceId,
        discountAmount: input.discountAmount,
      });
      
      // تحديث عداد الاستخدام
      await db.update(couponCodes).set({
        usageCount: sql`usage_count + 1`,
      }).where(eq(couponCodes.id, input.couponId));
      
      return { success: true };
    }),

  // إنشاء كوبون
  createCoupon: publicProcedure
    .input(z.object({
      couponCode: z.string().min(1),
      discountRuleId: z.number(),
      usageLimit: z.number().default(1),
      expiryDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(couponCodes).values({
        couponCode: input.couponCode,
        discountRuleId: input.discountRuleId,
        usageLimit: input.usageLimit,
        expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
        isActive: true,
      });
      
      return { id: result[0].insertId, success: true };
    }),

  // توليد كوبونات متعددة
  generateCoupons: publicProcedure
    .input(z.object({
      discountRuleId: z.number(),
      count: z.number().min(1).max(1000),
      prefix: z.string().default("COUPON"),
      usageLimit: z.number().default(1),
      expiryDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const generated = [];
      
      for (let i = 0; i < input.count; i++) {
        const code = `${input.prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        const result = await db.insert(couponCodes).values({
          couponCode: code,
          discountRuleId: input.discountRuleId,
          usageLimit: input.usageLimit,
          expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
          isActive: true,
        });
        
        generated.push({ id: result[0].insertId, code });
      }
      
      return { generated, count: generated.length };
    }),

  // إحصائيات الخصومات
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
      if (!db) throw new Error("Database not available");
    
    const totalRules = await db.select({ count: sql<number>`count(*)` }).from(discountRules);
    const activeRules = await db.select({ count: sql<number>`count(*)` }).from(discountRules).where(eq(discountRules.isActive, true));
    const totalPromotions = await db.select({ count: sql<number>`count(*)` }).from(promotions);
    const activePromotions = await db.select({ count: sql<number>`count(*)` }).from(promotions).where(eq(promotions.isActive, true));
    const totalCoupons = await db.select({ count: sql<number>`count(*)` }).from(couponCodes);
    const usedCoupons = await db.select({ count: sql<number>`count(*)` }).from(couponUsage);
    const totalDiscount = await db.select({ sum: sql<number>`sum(discount_amount)` }).from(couponUsage);
    
    return {
      totalRules: totalRules[0]?.count || 0,
      activeRules: activeRules[0]?.count || 0,
      totalPromotions: totalPromotions[0]?.count || 0,
      activePromotions: activePromotions[0]?.count || 0,
      totalCoupons: totalCoupons[0]?.count || 0,
      usedCoupons: usedCoupons[0]?.count || 0,
      totalDiscount: totalDiscount[0]?.sum || 0,
    };
  }),
});
