import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { debtRecords, paymentPlans, paymentPlanInstallments, penaltiesAndInterests } from "../../drizzle/schema";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";

export const debtManagementRouter = router({
  // ==========================================
  // سجلات الديون
  // ==========================================
  
  getDebtRecords: publicProcedure
    .input(z.object({
      customerId: z.number().optional(),
      status: z.enum(["active", "partially_paid", "paid", "written_off", "in_collection", "disputed"]).optional(),
      collectionStage: z.enum(["normal", "reminder", "warning", "final_notice", "legal", "written_off"]).optional(),
      limit: z.number().default(100),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let query = db.select().from(debtRecords);
      const conditions = [];
      
      if (input.customerId) {
        conditions.push(eq(debtRecords.customerId, input.customerId));
      }
      if (input.status) {
        conditions.push(eq(debtRecords.status, input.status));
      }
      if (input.collectionStage) {
        conditions.push(eq(debtRecords.collectionStage, input.collectionStage));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return await query.orderBy(desc(debtRecords.createdAt)).limit(input.limit);
    }),

  getDebtRecordById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.select().from(debtRecords).where(eq(debtRecords.id, input.id));
      return result[0] || null;
    }),

  createDebtRecord: publicProcedure
    .input(z.object({
      customerId: z.number(),
      debtType: z.enum(["invoice", "service", "penalty", "other"]),
      referenceType: z.string().optional(),
      referenceId: z.number().optional(),
      originalAmount: z.number(),
      dueDate: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(debtRecords).values({
        customerId: input.customerId,
        debtType: input.debtType,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        originalAmount: input.originalAmount.toString(),
        remainingAmount: input.originalAmount.toString(),
        dueDate: new Date(input.dueDate),
        notes: input.notes,
      });
      return { success: true, id: result[0].insertId };
    }),

  recordDebtPayment: publicProcedure
    .input(z.object({
      debtId: z.number(),
      amount: z.number(),
      paymentDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const debt = await db.select().from(debtRecords).where(eq(debtRecords.id, input.debtId));
      if (!debt[0]) throw new Error("Debt record not found");
      
      const currentPaid = parseFloat(debt[0].paidAmount || "0");
      const currentRemaining = parseFloat(debt[0].remainingAmount || "0");
      
      const newPaid = currentPaid + input.amount;
      const newRemaining = Math.max(0, currentRemaining - input.amount);
      
      let newStatus = debt[0].status;
      if (newRemaining === 0) {
        newStatus = "paid";
      } else if (newPaid > 0) {
        newStatus = "partially_paid";
      }
      
      await db.update(debtRecords).set({
        paidAmount: newPaid.toString(),
        remainingAmount: newRemaining.toString(),
        status: newStatus,
        lastPaymentDate: new Date(input.paymentDate || new Date()),
      }).where(eq(debtRecords.id, input.debtId));
      
      return { success: true, newRemaining, status: newStatus };
    }),

  updateDebtCollectionStage: publicProcedure
    .input(z.object({
      debtId: z.number(),
      collectionStage: z.enum(["normal", "reminder", "warning", "final_notice", "legal", "written_off"]),
      assignedCollectorId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(debtRecords).set({
        collectionStage: input.collectionStage,
        assignedCollectorId: input.assignedCollectorId,
        notes: input.notes,
        lastReminderDate: new Date(),
        reminderCount: sql`reminder_count + 1`,
      }).where(eq(debtRecords.id, input.debtId));
      
      return { success: true };
    }),

  writeOffDebt: publicProcedure
    .input(z.object({
      debtId: z.number(),
      reason: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(debtRecords).set({
        status: "written_off",
        collectionStage: "written_off",
        notes: input.reason,
      }).where(eq(debtRecords.id, input.debtId));
      
      return { success: true };
    }),

  // ==========================================
  // خطط السداد
  // ==========================================

  getPaymentPlans: publicProcedure
    .input(z.object({
      customerId: z.number().optional(),
      status: z.enum(["draft", "active", "completed", "defaulted", "cancelled"]).optional(),
      limit: z.number().default(100),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let query = db.select().from(paymentPlans);
      const conditions = [];
      
      if (input.customerId) {
        conditions.push(eq(paymentPlans.customerId, input.customerId));
      }
      if (input.status) {
        conditions.push(eq(paymentPlans.status, input.status));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return await query.orderBy(desc(paymentPlans.createdAt)).limit(input.limit);
    }),

  getPaymentPlanById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const plan = await db.select().from(paymentPlans).where(eq(paymentPlans.id, input.id));
      if (!plan[0]) return null;
      
      const installments = await db.select().from(paymentPlanInstallments)
        .where(eq(paymentPlanInstallments.planId, input.id))
        .orderBy(paymentPlanInstallments.installmentNumber);
      
      return { ...plan[0], installments };
    }),

  createPaymentPlan: publicProcedure
    .input(z.object({
      customerId: z.number(),
      planName: z.string(),
      totalAmount: z.number(),
      numberOfInstallments: z.number(),
      frequency: z.enum(["weekly", "biweekly", "monthly", "quarterly"]).optional(),
      startDate: z.string(),
      interestRate: z.number().optional(),
      lateFeePercent: z.number().optional(),
      notes: z.string().optional(),
      createdBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // حساب مبلغ القسط
      const interestAmount = input.totalAmount * (input.interestRate || 0) / 100;
      const totalWithInterest = input.totalAmount + interestAmount;
      const installmentAmount = totalWithInterest / input.numberOfInstallments;
      
      // حساب تاريخ الانتهاء
      const startDate = new Date(input.startDate);
      const endDate = new Date(startDate);
      const frequencyMonths = {
        weekly: 0.25,
        biweekly: 0.5,
        monthly: 1,
        quarterly: 3,
      };
      endDate.setMonth(endDate.getMonth() + (input.numberOfInstallments * frequencyMonths[input.frequency || "monthly"]));
      
      // إنشاء الخطة
      const result = await db.insert(paymentPlans).values({
        customerId: input.customerId,
        planName: input.planName,
        totalAmount: totalWithInterest.toString(),
        remainingAmount: totalWithInterest.toString(),
        numberOfInstallments: input.numberOfInstallments,
        installmentAmount: installmentAmount.toString(),
        frequency: input.frequency,
        startDate: startDate,
        endDate: endDate,
        nextPaymentDate: startDate,
        interestRate: (input.interestRate || 0).toString(),
        lateFeePercent: (input.lateFeePercent || 0).toString(),
        notes: input.notes,
        createdBy: input.createdBy,
      });
      
      const planId = result[0].insertId;
      
      // إنشاء الأقساط
      let currentDate = new Date(startDate);
      const principalPerInstallment = input.totalAmount / input.numberOfInstallments;
      const interestPerInstallment = interestAmount / input.numberOfInstallments;
      
      for (let i = 1; i <= input.numberOfInstallments; i++) {
        await db.insert(paymentPlanInstallments).values({
          planId,
          installmentNumber: i,
          dueDate: new Date(currentDate),
          amount: installmentAmount.toString(),
          principalAmount: principalPerInstallment.toString(),
          interestAmount: interestPerInstallment.toString(),
        });
        
        // تحديث التاريخ للقسط التالي
        if (input.frequency === "weekly") {
          currentDate.setDate(currentDate.getDate() + 7);
        } else if (input.frequency === "biweekly") {
          currentDate.setDate(currentDate.getDate() + 14);
        } else if (input.frequency === "quarterly") {
          currentDate.setMonth(currentDate.getMonth() + 3);
        } else {
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      }
      
      return { success: true, id: planId };
    }),

  activatePaymentPlan: publicProcedure
    .input(z.object({
      planId: z.number(),
      approvedBy: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(paymentPlans).set({
        status: "active",
        approvedBy: input.approvedBy,
        approvedAt: new Date(),
      }).where(eq(paymentPlans.id, input.planId));
      
      return { success: true };
    }),

  recordInstallmentPayment: publicProcedure
    .input(z.object({
      installmentId: z.number(),
      amount: z.number(),
      paymentId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const installment = await db.select().from(paymentPlanInstallments)
        .where(eq(paymentPlanInstallments.id, input.installmentId));
      if (!installment[0]) throw new Error("Installment not found");
      
      const currentPaid = parseFloat(installment[0].paidAmount || "0");
      const dueAmount = parseFloat(installment[0].amount || "0");
      const newPaid = currentPaid + input.amount;
      
      let newStatus = installment[0].status;
      if (newPaid >= dueAmount) {
        newStatus = "paid";
      } else if (newPaid > 0) {
        newStatus = "partial";
      }
      
      await db.update(paymentPlanInstallments).set({
        paidAmount: newPaid.toString(),
        paidDate: new Date(),
        status: newStatus,
        paymentId: input.paymentId,
      }).where(eq(paymentPlanInstallments.id, input.installmentId));
      
      // تحديث الخطة
      const plan = await db.select().from(paymentPlans).where(eq(paymentPlans.id, installment[0].planId));
      if (plan[0]) {
        const planPaid = parseFloat(plan[0].paidAmount || "0") + input.amount;
        const planRemaining = parseFloat(plan[0].remainingAmount || "0") - input.amount;
        
        let planStatus = plan[0].status;
        if (planRemaining <= 0) {
          planStatus = "completed";
        }
        
        await db.update(paymentPlans).set({
          paidAmount: planPaid.toString(),
          remainingAmount: Math.max(0, planRemaining).toString(),
          status: planStatus,
        }).where(eq(paymentPlans.id, installment[0].planId));
      }
      
      return { success: true };
    }),

  // ==========================================
  // العقوبات والفوائد
  // ==========================================

  getPenaltiesAndInterests: publicProcedure
    .input(z.object({
      customerId: z.number().optional(),
      status: z.enum(["pending", "applied", "waived", "paid"]).optional(),
      limit: z.number().default(100),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let query = db.select().from(penaltiesAndInterests);
      const conditions = [];
      
      if (input.customerId) {
        conditions.push(eq(penaltiesAndInterests.customerId, input.customerId));
      }
      if (input.status) {
        conditions.push(eq(penaltiesAndInterests.status, input.status));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return await query.orderBy(desc(penaltiesAndInterests.createdAt)).limit(input.limit);
    }),

  applyPenalty: publicProcedure
    .input(z.object({
      customerId: z.number(),
      debtRecordId: z.number().optional(),
      invoiceId: z.number().optional(),
      penaltyType: z.enum(["late_fee", "interest", "reconnection_fee", "legal_fee", "other"]),
      calculationType: z.enum(["fixed", "percentage", "daily_rate"]),
      rate: z.number().optional(),
      baseAmount: z.number(),
      daysOverdue: z.number().optional(),
      notes: z.string().optional(),
      createdBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // حساب مبلغ العقوبة
      let calculatedAmount = 0;
      if (input.calculationType === "fixed") {
        calculatedAmount = input.rate || 0;
      } else if (input.calculationType === "percentage") {
        calculatedAmount = input.baseAmount * (input.rate || 0) / 100;
      } else if (input.calculationType === "daily_rate") {
        calculatedAmount = input.baseAmount * (input.rate || 0) / 100 * (input.daysOverdue || 0);
      }
      
      const result = await db.insert(penaltiesAndInterests).values({
        customerId: input.customerId,
        debtRecordId: input.debtRecordId,
        invoiceId: input.invoiceId,
        penaltyType: input.penaltyType,
        calculationType: input.calculationType,
        rate: input.rate?.toString(),
        baseAmount: input.baseAmount.toString(),
        calculatedAmount: calculatedAmount.toString(),
        daysOverdue: input.daysOverdue,
        appliedDate: new Date(),
        status: "applied",
        notes: input.notes,
        createdBy: input.createdBy,
      });
      
      return { success: true, id: result[0].insertId, calculatedAmount };
    }),

  waivePenalty: publicProcedure
    .input(z.object({
      penaltyId: z.number(),
      waivedBy: z.number(),
      waiverReason: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(penaltiesAndInterests).set({
        status: "waived",
        waivedBy: input.waivedBy,
        waivedAt: new Date(),
        waiverReason: input.waiverReason,
      }).where(eq(penaltiesAndInterests.id, input.penaltyId));
      
      return { success: true };
    }),

  // ==========================================
  // إحصائيات الديون
  // ==========================================

  getDebtStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const totalDebts = await db.select({ count: sql<number>`count(*)` }).from(debtRecords);
    const activeDebts = await db.select({ count: sql<number>`count(*)` }).from(debtRecords).where(eq(debtRecords.status, "active"));
    const totalPlans = await db.select({ count: sql<number>`count(*)` }).from(paymentPlans);
    const activePlans = await db.select({ count: sql<number>`count(*)` }).from(paymentPlans).where(eq(paymentPlans.status, "active"));
    const totalPenalties = await db.select({ count: sql<number>`count(*)` }).from(penaltiesAndInterests);
    const pendingPenalties = await db.select({ count: sql<number>`count(*)` }).from(penaltiesAndInterests).where(eq(penaltiesAndInterests.status, "pending"));
    
    return {
      totalDebts: totalDebts[0]?.count || 0,
      activeDebts: activeDebts[0]?.count || 0,
      totalPlans: totalPlans[0]?.count || 0,
      activePlans: activePlans[0]?.count || 0,
      totalPenalties: totalPenalties[0]?.count || 0,
      pendingPenalties: pendingPenalties[0]?.count || 0,
    };
  }),
});
