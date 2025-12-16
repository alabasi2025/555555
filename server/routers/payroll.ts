/**
 * نظام الرواتب والمكافآت - Router
 * Payroll Management System - Router
 */

import { z } from 'zod';
import { router, publicProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { 
  payroll, 
  payrollPeriods, 
  employees,
  employeeLoans,
  employeeBonuses,
  attendance
} from '../../drizzle/schema';
import { eq, desc, asc, and, between, sql, count, sum } from 'drizzle-orm';

export const payrollRouter = router({
  // ==========================================
  // إدارة فترات الرواتب
  // ==========================================
  
  // الحصول على فترات الرواتب
  getPeriods: publicProcedure
    .input(z.object({
      year: z.number().optional(),
      status: z.enum(['draft', 'processing', 'approved', 'paid', 'closed']).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      let conditions = [];
      
      if (input?.year) {
        conditions.push(eq(payrollPeriods.year, input.year));
      }
      if (input?.status) {
        conditions.push(eq(payrollPeriods.status, input.status));
      }
      
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      return await db.select().from(payrollPeriods)
        .where(whereClause)
        .orderBy(desc(payrollPeriods.year), desc(payrollPeriods.month));
    }),

  // إنشاء فترة رواتب جديدة
  createPeriod: publicProcedure
    .input(z.object({
      name: z.string(),
      year: z.number(),
      month: z.number(),
      startDate: z.string(),
      endDate: z.string(),
      paymentDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(payrollPeriods).values({
        ...input,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        paymentDate: input.paymentDate ? new Date(input.paymentDate) : null,
        status: 'draft',
      } as any);
      return { success: true, id: result[0].insertId };
    }),

  // الحصول على فترة رواتب بالمعرف
  getPeriodById: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(payrollPeriods).where(eq(payrollPeriods.id, input));
      return result[0] || null;
    }),

  // ==========================================
  // معالجة الرواتب
  // ==========================================
  
  // معالجة رواتب فترة
  processPayroll: publicProcedure
    .input(z.object({
      periodId: z.number(),
      processedBy: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      
      // الحصول على فترة الرواتب
      const period = await db.select().from(payrollPeriods).where(eq(payrollPeriods.id, input.periodId));
      if (!period[0]) {
        return { success: false, message: 'فترة الرواتب غير موجودة' };
      }
      
      // الحصول على جميع الموظفين النشطين
      const activeEmployees = await db.select().from(employees).where(eq(employees.status, 'active'));
      
      let totalGross = 0;
      let totalDeductions = 0;
      let totalNet = 0;
      
      for (const employee of activeEmployees) {
        // حساب الراتب الإجمالي
        const baseSalary = parseFloat(employee.baseSalary?.toString() || '0');
        const housingAllowance = parseFloat(employee.housingAllowance?.toString() || '0');
        const transportAllowance = parseFloat(employee.transportAllowance?.toString() || '0');
        const otherAllowances = parseFloat(employee.otherAllowances?.toString() || '0');
        
        // الحصول على المكافآت للفترة
        const bonuses = await db.select().from(employeeBonuses)
          .where(and(
            eq(employeeBonuses.employeeId, employee.id),
            eq(employeeBonuses.payrollPeriodId, input.periodId),
            eq(employeeBonuses.status, 'approved')
          ));
        const totalBonuses = bonuses.reduce((sum, b) => sum + parseFloat(b.amount?.toString() || '0'), 0);
        
        // الحصول على القروض النشطة
        const loans = await db.select().from(employeeLoans)
          .where(and(
            eq(employeeLoans.employeeId, employee.id),
            eq(employeeLoans.status, 'active')
          ));
        const loanDeduction = loans.reduce((sum, l) => sum + parseFloat(l.monthlyDeduction?.toString() || '0'), 0);
        
        // حساب خصم الغياب والتأخير
        const attendanceRecords = await db.select().from(attendance)
          .where(and(
            eq(attendance.employeeId, employee.id),
            between(attendance.date, new Date(period[0].startDate), new Date(period[0].endDate))
          ));
        
        const absentDays = attendanceRecords.filter(r => r.status === 'absent').length;
        const totalLateMinutes = attendanceRecords.reduce((sum, r) => sum + (r.lateMinutes || 0), 0);
        
        const dailySalary = baseSalary / 30;
        const absenceDeduction = absentDays * dailySalary;
        const lateDeduction = (totalLateMinutes / 60) * (dailySalary / 8); // خصم بالساعة
        
        // حساب التأمينات الاجتماعية (9.75% من الراتب الأساسي)
        const socialInsurance = baseSalary * 0.0975;
        
        // حساب الإجماليات
        const grossSalary = baseSalary + housingAllowance + transportAllowance + otherAllowances + totalBonuses;
        const totalDeductionsAmount = socialInsurance + loanDeduction + absenceDeduction + lateDeduction;
        const netSalary = grossSalary - totalDeductionsAmount;
        
        totalGross += grossSalary;
        totalDeductions += totalDeductionsAmount;
        totalNet += netSalary;
        
        // إنشاء سجل الراتب
        await db.insert(payroll).values({
          payrollPeriodId: input.periodId,
          employeeId: employee.id,
          baseSalary: baseSalary.toFixed(2),
          housingAllowance: housingAllowance.toFixed(2),
          transportAllowance: transportAllowance.toFixed(2),
          otherAllowances: otherAllowances.toFixed(2),
          bonuses: totalBonuses.toFixed(2),
          socialInsurance: socialInsurance.toFixed(2),
          loanDeduction: loanDeduction.toFixed(2),
          absenceDeduction: absenceDeduction.toFixed(2),
          lateDeduction: lateDeduction.toFixed(2),
          grossSalary: grossSalary.toFixed(2),
          totalDeductions: totalDeductionsAmount.toFixed(2),
          netSalary: netSalary.toFixed(2),
          paymentStatus: 'pending',
          createdBy: input.processedBy,
        } as any);
        
        // تحديث القروض (زيادة الأقساط المدفوعة)
        for (const loan of loans) {
          const newPaidInstallments = (loan.paidInstallments || 0) + 1;
          const newRemainingAmount = parseFloat(loan.remainingAmount?.toString() || '0') - parseFloat(loan.monthlyDeduction?.toString() || '0');
          
          await db.update(employeeLoans).set({
            paidInstallments: newPaidInstallments,
            remainingAmount: newRemainingAmount.toFixed(2),
            status: newPaidInstallments >= loan.numberOfInstallments ? 'completed' : 'active',
          }).where(eq(employeeLoans.id, loan.id));
        }
      }
      
      // تحديث فترة الرواتب
      await db.update(payrollPeriods).set({
        status: 'processing',
        totalEmployees: activeEmployees.length,
        totalGrossSalary: totalGross.toFixed(2),
        totalDeductions: totalDeductions.toFixed(2),
        totalNetSalary: totalNet.toFixed(2),
        processedBy: input.processedBy,
        processedAt: new Date(),
      }).where(eq(payrollPeriods.id, input.periodId));
      
      return { 
        success: true, 
        employeesProcessed: activeEmployees.length,
        totalGross,
        totalDeductions,
        totalNet
      };
    }),

  // اعتماد فترة الرواتب
  approvePeriod: publicProcedure
    .input(z.object({
      periodId: z.number(),
      approvedBy: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(payrollPeriods).set({
        status: 'approved',
        approvedBy: input.approvedBy,
        approvedAt: new Date(),
      }).where(eq(payrollPeriods.id, input.periodId));
      return { success: true };
    }),

  // صرف الرواتب
  disbursePeriod: publicProcedure
    .input(z.object({
      periodId: z.number(),
      paymentDate: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      
      // تحديث حالة جميع سجلات الرواتب
      await db.update(payroll).set({
        paymentStatus: 'paid',
        paymentDate: new Date(input.paymentDate),
      }).where(eq(payroll.payrollPeriodId, input.periodId));
      
      // تحديث فترة الرواتب
      await db.update(payrollPeriods).set({
        status: 'paid',
        paymentDate: new Date(input.paymentDate),
      }).where(eq(payrollPeriods.id, input.periodId));
      
      return { success: true };
    }),

  // ==========================================
  // استعلامات الرواتب
  // ==========================================
  
  // الحصول على رواتب فترة
  getPeriodPayroll: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const db = getDb();
      return await db.select({
        payroll: payroll,
        employee: employees,
      }).from(payroll)
        .leftJoin(employees, eq(payroll.employeeId, employees.id))
        .where(eq(payroll.payrollPeriodId, input))
        .orderBy(asc(employees.firstName));
    }),

  // الحصول على راتب موظف
  getEmployeePayroll: publicProcedure
    .input(z.object({
      employeeId: z.number(),
      year: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      
      let query = db.select({
        payroll: payroll,
        period: payrollPeriods,
      }).from(payroll)
        .leftJoin(payrollPeriods, eq(payroll.payrollPeriodId, payrollPeriods.id))
        .where(eq(payroll.employeeId, input.employeeId));
      
      if (input.year) {
        query = query.where(and(
          eq(payroll.employeeId, input.employeeId),
          eq(payrollPeriods.year, input.year)
        )) as any;
      }
      
      return await query.orderBy(desc(payrollPeriods.year), desc(payrollPeriods.month));
    }),

  // الحصول على كشف راتب
  getPayslip: publicProcedure
    .input(z.object({
      employeeId: z.number(),
      periodId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      
      const [payrollRecord, employeeRecord, periodRecord] = await Promise.all([
        db.select().from(payroll)
          .where(and(
            eq(payroll.employeeId, input.employeeId),
            eq(payroll.payrollPeriodId, input.periodId)
          )),
        db.select().from(employees).where(eq(employees.id, input.employeeId)),
        db.select().from(payrollPeriods).where(eq(payrollPeriods.id, input.periodId)),
      ]);
      
      return {
        payroll: payrollRecord[0] || null,
        employee: employeeRecord[0] || null,
        period: periodRecord[0] || null,
      };
    }),

  // ==========================================
  // إدارة السلف والقروض
  // ==========================================
  
  // الحصول على قروض موظف
  getEmployeeLoans: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const db = getDb();
      return await db.select().from(employeeLoans)
        .where(eq(employeeLoans.employeeId, input))
        .orderBy(desc(employeeLoans.createdAt));
    }),

  // طلب سلفة/قرض
  requestLoan: publicProcedure
    .input(z.object({
      employeeId: z.number(),
      loanType: z.enum(['advance', 'loan']),
      amount: z.string(),
      monthlyDeduction: z.string(),
      numberOfInstallments: z.number(),
      startDate: z.string(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(employeeLoans).values({
        ...input,
        remainingAmount: input.amount,
        startDate: new Date(input.startDate),
        status: 'pending',
      } as any);
      return { success: true, id: result[0].insertId };
    }),

  // الموافقة على سلفة/قرض
  approveLoan: publicProcedure
    .input(z.object({
      id: z.number(),
      approvedBy: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(employeeLoans).set({
        status: 'active',
        approvedBy: input.approvedBy,
        approvedAt: new Date(),
      }).where(eq(employeeLoans.id, input.id));
      return { success: true };
    }),

  // رفض سلفة/قرض
  rejectLoan: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(employeeLoans).set({
        status: 'cancelled',
      }).where(eq(employeeLoans.id, input.id));
      return { success: true };
    }),

  // ==========================================
  // إدارة المكافآت
  // ==========================================
  
  // الحصول على مكافآت موظف
  getEmployeeBonuses: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const db = getDb();
      return await db.select().from(employeeBonuses)
        .where(eq(employeeBonuses.employeeId, input))
        .orderBy(desc(employeeBonuses.effectiveDate));
    }),

  // إضافة مكافأة
  addBonus: publicProcedure
    .input(z.object({
      employeeId: z.number(),
      bonusType: z.enum(['performance', 'annual', 'project', 'overtime', 'special', 'other']),
      amount: z.string(),
      reason: z.string().optional(),
      effectiveDate: z.string(),
      payrollPeriodId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(employeeBonuses).values({
        ...input,
        effectiveDate: new Date(input.effectiveDate),
        status: 'pending',
      } as any);
      return { success: true, id: result[0].insertId };
    }),

  // الموافقة على مكافأة
  approveBonus: publicProcedure
    .input(z.object({
      id: z.number(),
      approvedBy: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(employeeBonuses).set({
        status: 'approved',
        approvedBy: input.approvedBy,
        approvedAt: new Date(),
      }).where(eq(employeeBonuses.id, input.id));
      return { success: true };
    }),

  // ==========================================
  // الإحصائيات والتقارير
  // ==========================================
  
  // إحصائيات الرواتب
  getStats: publicProcedure
    .input(z.object({
      year: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const year = input?.year || new Date().getFullYear();
      
      const periods = await db.select().from(payrollPeriods)
        .where(eq(payrollPeriods.year, year))
        .orderBy(asc(payrollPeriods.month));
      
      const totalGross = periods.reduce((sum, p) => sum + parseFloat(p.totalGrossSalary?.toString() || '0'), 0);
      const totalDeductions = periods.reduce((sum, p) => sum + parseFloat(p.totalDeductions?.toString() || '0'), 0);
      const totalNet = periods.reduce((sum, p) => sum + parseFloat(p.totalNetSalary?.toString() || '0'), 0);
      
      // إحصائيات القروض
      const activeLoans = await db.select({ count: count() }).from(employeeLoans)
        .where(eq(employeeLoans.status, 'active'));
      
      const totalLoanAmount = await db.select({
        total: sum(employeeLoans.remainingAmount)
      }).from(employeeLoans)
        .where(eq(employeeLoans.status, 'active'));
      
      // إحصائيات المكافآت
      const pendingBonuses = await db.select({ count: count() }).from(employeeBonuses)
        .where(eq(employeeBonuses.status, 'pending'));
      
      return {
        year,
        periods: periods.map(p => ({
          month: p.month,
          name: p.name,
          status: p.status,
          totalEmployees: p.totalEmployees,
          totalGross: p.totalGrossSalary,
          totalDeductions: p.totalDeductions,
          totalNet: p.totalNetSalary,
        })),
        yearlyTotals: {
          totalGross,
          totalDeductions,
          totalNet,
        },
        loans: {
          activeCount: activeLoans[0]?.count || 0,
          totalAmount: totalLoanAmount[0]?.total || 0,
        },
        bonuses: {
          pendingCount: pendingBonuses[0]?.count || 0,
        },
      };
    }),

  // تقرير الرواتب الشهري
  getMonthlyReport: publicProcedure
    .input(z.object({
      year: z.number(),
      month: z.number(),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      
      const period = await db.select().from(payrollPeriods)
        .where(and(
          eq(payrollPeriods.year, input.year),
          eq(payrollPeriods.month, input.month)
        ));
      
      if (!period[0]) {
        return null;
      }
      
      const payrollRecords = await db.select({
        payroll: payroll,
        employee: employees,
      }).from(payroll)
        .leftJoin(employees, eq(payroll.employeeId, employees.id))
        .where(eq(payroll.payrollPeriodId, period[0].id));
      
      return {
        period: period[0],
        records: payrollRecords,
        summary: {
          totalEmployees: payrollRecords.length,
          totalBaseSalary: payrollRecords.reduce((sum, r) => sum + parseFloat(r.payroll.baseSalary?.toString() || '0'), 0),
          totalAllowances: payrollRecords.reduce((sum, r) => 
            sum + parseFloat(r.payroll.housingAllowance?.toString() || '0') +
            parseFloat(r.payroll.transportAllowance?.toString() || '0') +
            parseFloat(r.payroll.otherAllowances?.toString() || '0'), 0),
          totalBonuses: payrollRecords.reduce((sum, r) => sum + parseFloat(r.payroll.bonuses?.toString() || '0'), 0),
          totalDeductions: payrollRecords.reduce((sum, r) => sum + parseFloat(r.payroll.totalDeductions?.toString() || '0'), 0),
          totalNetSalary: payrollRecords.reduce((sum, r) => sum + parseFloat(r.payroll.netSalary?.toString() || '0'), 0),
        },
      };
    }),
});
