import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { paymentGateways, customerWallets, walletTransactions, autoCollectionRules, autoCollectionLogs } from "../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export const advancedCollectionRouter = router({
  // ==========================================
  // بوابات الدفع
  // ==========================================
  
  getPaymentGateways: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select().from(paymentGateways).orderBy(desc(paymentGateways.createdAt));
  }),

  getPaymentGatewayById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.select().from(paymentGateways).where(eq(paymentGateways.id, input.id));
      return result[0] || null;
    }),

  createPaymentGateway: publicProcedure
    .input(z.object({
      gatewayName: z.string(),
      gatewayType: z.enum(["bank_transfer", "credit_card", "mobile_wallet", "cash", "check", "online"]),
      providerName: z.string().optional(),
      apiKey: z.string().optional(),
      apiSecret: z.string().optional(),
      merchantId: z.string().optional(),
      webhookUrl: z.string().optional(),
      configuration: z.any().optional(),
      supportedCurrencies: z.array(z.string()).optional(),
      transactionFeePercent: z.number().optional(),
      transactionFeeFixed: z.number().optional(),
      minAmount: z.number().optional(),
      maxAmount: z.number().optional(),
      isDefault: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      if (input.isDefault) {
        await db.update(paymentGateways).set({ isDefault: false });
      }
      
      const result = await db.insert(paymentGateways).values({
        gatewayName: input.gatewayName,
        gatewayType: input.gatewayType,
        providerName: input.providerName,
        apiKey: input.apiKey,
        apiSecret: input.apiSecret,
        merchantId: input.merchantId,
        webhookUrl: input.webhookUrl,
        configuration: input.configuration,
        supportedCurrencies: input.supportedCurrencies,
        transactionFeePercent: input.transactionFeePercent?.toString(),
        transactionFeeFixed: input.transactionFeeFixed?.toString(),
        minAmount: input.minAmount?.toString(),
        maxAmount: input.maxAmount?.toString(),
        isDefault: input.isDefault,
      });
      return { success: true, id: result[0].insertId };
    }),

  updatePaymentGateway: publicProcedure
    .input(z.object({
      id: z.number(),
      gatewayName: z.string().optional(),
      gatewayType: z.enum(["bank_transfer", "credit_card", "mobile_wallet", "cash", "check", "online"]).optional(),
      providerName: z.string().optional(),
      apiKey: z.string().optional(),
      apiSecret: z.string().optional(),
      merchantId: z.string().optional(),
      webhookUrl: z.string().optional(),
      configuration: z.any().optional(),
      supportedCurrencies: z.array(z.string()).optional(),
      transactionFeePercent: z.number().optional(),
      transactionFeeFixed: z.number().optional(),
      minAmount: z.number().optional(),
      maxAmount: z.number().optional(),
      isActive: z.boolean().optional(),
      isDefault: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, transactionFeePercent, transactionFeeFixed, minAmount, maxAmount, ...rest } = input;
      
      if (rest.isDefault) {
        await db.update(paymentGateways).set({ isDefault: false });
      }
      
      await db.update(paymentGateways).set({
        ...rest,
        transactionFeePercent: transactionFeePercent?.toString(),
        transactionFeeFixed: transactionFeeFixed?.toString(),
        minAmount: minAmount?.toString(),
        maxAmount: maxAmount?.toString(),
      }).where(eq(paymentGateways.id, id));
      return { success: true };
    }),

  deletePaymentGateway: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(paymentGateways).where(eq(paymentGateways.id, input.id));
      return { success: true };
    }),

  // ==========================================
  // المحافظ الرقمية
  // ==========================================

  getCustomerWallets: publicProcedure
    .input(z.object({
      customerId: z.number().optional(),
      status: z.enum(["active", "suspended", "closed"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let query = db.select().from(customerWallets);
      const conditions = [];
      
      if (input.customerId) {
        conditions.push(eq(customerWallets.customerId, input.customerId));
      }
      if (input.status) {
        conditions.push(eq(customerWallets.status, input.status));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return await query.orderBy(desc(customerWallets.createdAt));
    }),

  getWalletById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.select().from(customerWallets).where(eq(customerWallets.id, input.id));
      return result[0] || null;
    }),

  createCustomerWallet: publicProcedure
    .input(z.object({
      customerId: z.number(),
      currency: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const walletNumber = `W-${input.customerId}-${Date.now()}`;
      
      const result = await db.insert(customerWallets).values({
        customerId: input.customerId,
        walletNumber,
        currency: input.currency || "YER",
        balance: "0",
      });
      return { success: true, id: result[0].insertId, walletNumber };
    }),

  depositToWallet: publicProcedure
    .input(z.object({
      walletId: z.number(),
      amount: z.number(),
      description: z.string().optional(),
      createdBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // جلب المحفظة
      const wallet = await db.select().from(customerWallets).where(eq(customerWallets.id, input.walletId));
      if (!wallet[0]) throw new Error("Wallet not found");
      
      const currentBalance = parseFloat(wallet[0].balance || "0");
      const newBalance = currentBalance + input.amount;
      
      // تحديث الرصيد
      await db.update(customerWallets).set({
        balance: newBalance.toString(),
        lastTransactionAt: new Date(),
      }).where(eq(customerWallets.id, input.walletId));
      
      // إنشاء سجل المعاملة
      await db.insert(walletTransactions).values({
        walletId: input.walletId,
        transactionType: "deposit",
        amount: input.amount.toString(),
        balanceBefore: currentBalance.toString(),
        balanceAfter: newBalance.toString(),
        description: input.description,
        status: "completed",
        processedAt: new Date(),
        createdBy: input.createdBy,
      });
      
      return { success: true, newBalance };
    }),

  withdrawFromWallet: publicProcedure
    .input(z.object({
      walletId: z.number(),
      amount: z.number(),
      description: z.string().optional(),
      createdBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const wallet = await db.select().from(customerWallets).where(eq(customerWallets.id, input.walletId));
      if (!wallet[0]) throw new Error("Wallet not found");
      
      const currentBalance = parseFloat(wallet[0].balance || "0");
      if (currentBalance < input.amount) throw new Error("Insufficient balance");
      
      const newBalance = currentBalance - input.amount;
      
      await db.update(customerWallets).set({
        balance: newBalance.toString(),
        lastTransactionAt: new Date(),
      }).where(eq(customerWallets.id, input.walletId));
      
      await db.insert(walletTransactions).values({
        walletId: input.walletId,
        transactionType: "withdrawal",
        amount: input.amount.toString(),
        balanceBefore: currentBalance.toString(),
        balanceAfter: newBalance.toString(),
        description: input.description,
        status: "completed",
        processedAt: new Date(),
        createdBy: input.createdBy,
      });
      
      return { success: true, newBalance };
    }),

  payFromWallet: publicProcedure
    .input(z.object({
      walletId: z.number(),
      amount: z.number(),
      referenceType: z.string(),
      referenceId: z.number(),
      description: z.string().optional(),
      createdBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const wallet = await db.select().from(customerWallets).where(eq(customerWallets.id, input.walletId));
      if (!wallet[0]) throw new Error("Wallet not found");
      
      const currentBalance = parseFloat(wallet[0].balance || "0");
      if (currentBalance < input.amount) throw new Error("Insufficient balance");
      
      const newBalance = currentBalance - input.amount;
      
      await db.update(customerWallets).set({
        balance: newBalance.toString(),
        lastTransactionAt: new Date(),
      }).where(eq(customerWallets.id, input.walletId));
      
      await db.insert(walletTransactions).values({
        walletId: input.walletId,
        transactionType: "payment",
        amount: input.amount.toString(),
        balanceBefore: currentBalance.toString(),
        balanceAfter: newBalance.toString(),
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        description: input.description,
        status: "completed",
        processedAt: new Date(),
        createdBy: input.createdBy,
      });
      
      return { success: true, newBalance };
    }),

  getWalletTransactions: publicProcedure
    .input(z.object({
      walletId: z.number(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db.select().from(walletTransactions)
        .where(eq(walletTransactions.walletId, input.walletId))
        .orderBy(desc(walletTransactions.createdAt))
        .limit(input.limit);
    }),

  // ==========================================
  // قواعد التحصيل الآلي
  // ==========================================

  getAutoCollectionRules: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select().from(autoCollectionRules).orderBy(desc(autoCollectionRules.priority));
  }),

  createAutoCollectionRule: publicProcedure
    .input(z.object({
      ruleName: z.string(),
      description: z.string().optional(),
      triggerType: z.enum(["due_date", "overdue_days", "amount_threshold", "schedule"]),
      triggerValue: z.string().optional(),
      actionType: z.enum(["send_reminder", "charge_wallet", "apply_penalty", "suspend_service", "escalate"]),
      actionConfig: z.any().optional(),
      customerSegment: z.string().optional(),
      priority: z.number().optional(),
      createdBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(autoCollectionRules).values({
        ruleName: input.ruleName,
        description: input.description,
        triggerType: input.triggerType,
        triggerValue: input.triggerValue,
        actionType: input.actionType,
        actionConfig: input.actionConfig,
        customerSegment: input.customerSegment,
        priority: input.priority,
        createdBy: input.createdBy,
      });
      return { success: true, id: result[0].insertId };
    }),

  updateAutoCollectionRule: publicProcedure
    .input(z.object({
      id: z.number(),
      ruleName: z.string().optional(),
      description: z.string().optional(),
      triggerType: z.enum(["due_date", "overdue_days", "amount_threshold", "schedule"]).optional(),
      triggerValue: z.string().optional(),
      actionType: z.enum(["send_reminder", "charge_wallet", "apply_penalty", "suspend_service", "escalate"]).optional(),
      actionConfig: z.any().optional(),
      customerSegment: z.string().optional(),
      priority: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...updateData } = input;
      await db.update(autoCollectionRules).set(updateData).where(eq(autoCollectionRules.id, id));
      return { success: true };
    }),

  deleteAutoCollectionRule: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(autoCollectionRules).where(eq(autoCollectionRules.id, input.id));
      return { success: true };
    }),

  getAutoCollectionLogs: publicProcedure
    .input(z.object({
      ruleId: z.number().optional(),
      customerId: z.number().optional(),
      limit: z.number().default(100),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let query = db.select().from(autoCollectionLogs);
      const conditions = [];
      
      if (input.ruleId) {
        conditions.push(eq(autoCollectionLogs.ruleId, input.ruleId));
      }
      if (input.customerId) {
        conditions.push(eq(autoCollectionLogs.customerId, input.customerId));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return await query.orderBy(desc(autoCollectionLogs.executedAt)).limit(input.limit);
    }),

  // ==========================================
  // إحصائيات التحصيل
  // ==========================================

  getCollectionStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const gateways = await db.select({ count: sql<number>`count(*)` }).from(paymentGateways);
    const activeGateways = await db.select({ count: sql<number>`count(*)` }).from(paymentGateways).where(eq(paymentGateways.isActive, true));
    const wallets = await db.select({ count: sql<number>`count(*)` }).from(customerWallets);
    const activeWallets = await db.select({ count: sql<number>`count(*)` }).from(customerWallets).where(eq(customerWallets.status, "active"));
    const rules = await db.select({ count: sql<number>`count(*)` }).from(autoCollectionRules);
    const activeRules = await db.select({ count: sql<number>`count(*)` }).from(autoCollectionRules).where(eq(autoCollectionRules.isActive, true));
    
    return {
      totalGateways: gateways[0]?.count || 0,
      activeGateways: activeGateways[0]?.count || 0,
      totalWallets: wallets[0]?.count || 0,
      activeWallets: activeWallets[0]?.count || 0,
      totalRules: rules[0]?.count || 0,
      activeRules: activeRules[0]?.count || 0,
    };
  }),
});
