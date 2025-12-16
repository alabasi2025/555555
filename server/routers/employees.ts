/**
 * نظام إدارة الموظفين - Router
 * Employee Management System - Router
 */

import { z } from 'zod';
import { router, publicProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { 
  employees, 
  departments, 
  positions, 
  leaveTypes, 
  leaveBalances,
  leaves,
  performanceReviews,
  trainingCourses,
  trainingEnrollments
} from '../../drizzle/schema';
import { eq, desc, asc, like, and, or, sql, count } from 'drizzle-orm';

export const employeesRouter = router({
  // ==========================================
  // إدارة الموظفين
  // ==========================================
  
  // الحصول على قائمة الموظفين
  list: publicProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
      departmentId: z.number().optional(),
      status: z.enum(['active', 'on_leave', 'suspended', 'terminated', 'resigned']).optional(),
      employmentType: z.enum(['full_time', 'part_time', 'contract', 'temporary', 'intern']).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const { page = 1, limit = 20, search, departmentId, status, employmentType } = input || {};
      const offset = (page - 1) * limit;
      
      let conditions = [];
      
      if (search) {
        conditions.push(
          or(
            like(employees.firstName, `%${search}%`),
            like(employees.lastName, `%${search}%`),
            like(employees.employeeNumber, `%${search}%`),
            like(employees.email, `%${search}%`)
          )
        );
      }
      
      if (departmentId) {
        conditions.push(eq(employees.departmentId, departmentId));
      }
      
      if (status) {
        conditions.push(eq(employees.status, status));
      }
      
      if (employmentType) {
        conditions.push(eq(employees.employmentType, employmentType));
      }
      
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      const [data, totalResult] = await Promise.all([
        db.select().from(employees)
          .where(whereClause)
          .orderBy(desc(employees.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ count: count() }).from(employees).where(whereClause)
      ]);
      
      return {
        data,
        total: totalResult[0]?.count || 0,
        page,
        limit,
        totalPages: Math.ceil((totalResult[0]?.count || 0) / limit)
      };
    }),

  // الحصول على موظف بالمعرف
  getById: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(employees).where(eq(employees.id, input));
      return result[0] || null;
    }),

  // إنشاء موظف جديد
  create: publicProcedure
    .input(z.object({
      employeeNumber: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      fullNameAr: z.string().optional(),
      nationalId: z.string().optional(),
      dateOfBirth: z.string().optional(),
      gender: z.enum(['male', 'female']).optional(),
      maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
      nationality: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      mobilePhone: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      emergencyContactName: z.string().optional(),
      emergencyContactPhone: z.string().optional(),
      departmentId: z.number().optional(),
      positionId: z.number().optional(),
      managerId: z.number().optional(),
      employmentType: z.enum(['full_time', 'part_time', 'contract', 'temporary', 'intern']).optional(),
      hireDate: z.string(),
      probationEndDate: z.string().optional(),
      contractEndDate: z.string().optional(),
      baseSalary: z.string().optional(),
      housingAllowance: z.string().optional(),
      transportAllowance: z.string().optional(),
      otherAllowances: z.string().optional(),
      bankName: z.string().optional(),
      bankAccountNumber: z.string().optional(),
      iban: z.string().optional(),
      socialInsuranceNumber: z.string().optional(),
      taxNumber: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(employees).values({
        ...input,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
        hireDate: new Date(input.hireDate),
        probationEndDate: input.probationEndDate ? new Date(input.probationEndDate) : null,
        contractEndDate: input.contractEndDate ? new Date(input.contractEndDate) : null,
      } as any);
      return { success: true, id: result[0].insertId };
    }),

  // تحديث موظف
  update: publicProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        fullNameAr: z.string().optional(),
        nationalId: z.string().optional(),
        dateOfBirth: z.string().optional(),
        gender: z.enum(['male', 'female']).optional(),
        maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
        nationality: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        mobilePhone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        emergencyContactName: z.string().optional(),
        emergencyContactPhone: z.string().optional(),
        departmentId: z.number().optional(),
        positionId: z.number().optional(),
        managerId: z.number().optional(),
        employmentType: z.enum(['full_time', 'part_time', 'contract', 'temporary', 'intern']).optional(),
        probationEndDate: z.string().optional(),
        contractEndDate: z.string().optional(),
        baseSalary: z.string().optional(),
        housingAllowance: z.string().optional(),
        transportAllowance: z.string().optional(),
        otherAllowances: z.string().optional(),
        bankName: z.string().optional(),
        bankAccountNumber: z.string().optional(),
        iban: z.string().optional(),
        socialInsuranceNumber: z.string().optional(),
        taxNumber: z.string().optional(),
        status: z.enum(['active', 'on_leave', 'suspended', 'terminated', 'resigned']).optional(),
      })
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const updateData: any = { ...input.data };
      
      if (input.data.dateOfBirth) {
        updateData.dateOfBirth = new Date(input.data.dateOfBirth);
      }
      if (input.data.probationEndDate) {
        updateData.probationEndDate = new Date(input.data.probationEndDate);
      }
      if (input.data.contractEndDate) {
        updateData.contractEndDate = new Date(input.data.contractEndDate);
      }
      
      await db.update(employees).set(updateData).where(eq(employees.id, input.id));
      return { success: true };
    }),

  // إنهاء خدمة موظف
  terminate: publicProcedure
    .input(z.object({
      id: z.number(),
      terminationDate: z.string(),
      terminationReason: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(employees).set({
        status: 'terminated',
        terminationDate: new Date(input.terminationDate),
        terminationReason: input.terminationReason,
      }).where(eq(employees.id, input.id));
      return { success: true };
    }),

  // ==========================================
  // إدارة الأقسام
  // ==========================================
  
  // الحصول على قائمة الأقسام
  getDepartments: publicProcedure.query(async () => {
    const db = getDb();
    return await db.select().from(departments).where(eq(departments.isActive, true)).orderBy(asc(departments.nameAr));
  }),

  // إنشاء قسم جديد
  createDepartment: publicProcedure
    .input(z.object({
      code: z.string(),
      nameAr: z.string(),
      nameEn: z.string().optional(),
      description: z.string().optional(),
      parentDepartmentId: z.number().optional(),
      managerId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(departments).values(input as any);
      return { success: true, id: result[0].insertId };
    }),

  // ==========================================
  // إدارة المناصب
  // ==========================================
  
  // الحصول على قائمة المناصب
  getPositions: publicProcedure.query(async () => {
    const db = getDb();
    return await db.select().from(positions).where(eq(positions.isActive, true)).orderBy(asc(positions.titleAr));
  }),

  // إنشاء منصب جديد
  createPosition: publicProcedure
    .input(z.object({
      code: z.string(),
      titleAr: z.string(),
      titleEn: z.string().optional(),
      description: z.string().optional(),
      departmentId: z.number().optional(),
      level: z.number().optional(),
      minSalary: z.string().optional(),
      maxSalary: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(positions).values(input as any);
      return { success: true, id: result[0].insertId };
    }),

  // ==========================================
  // إدارة الإجازات
  // ==========================================
  
  // الحصول على أنواع الإجازات
  getLeaveTypes: publicProcedure.query(async () => {
    const db = getDb();
    return await db.select().from(leaveTypes).where(eq(leaveTypes.isActive, true));
  }),

  // الحصول على رصيد إجازات موظف
  getLeaveBalance: publicProcedure
    .input(z.object({
      employeeId: z.number(),
      year: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      const year = input.year || new Date().getFullYear();
      return await db.select().from(leaveBalances)
        .where(and(
          eq(leaveBalances.employeeId, input.employeeId),
          eq(leaveBalances.year, year)
        ));
    }),

  // طلب إجازة
  requestLeave: publicProcedure
    .input(z.object({
      employeeId: z.number(),
      leaveTypeId: z.number(),
      startDate: z.string(),
      endDate: z.string(),
      totalDays: z.string(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(leaves).values({
        ...input,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        status: 'pending',
      } as any);
      return { success: true, id: result[0].insertId };
    }),

  // الموافقة على إجازة
  approveLeave: publicProcedure
    .input(z.object({
      id: z.number(),
      approvedBy: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(leaves).set({
        status: 'approved',
        approvedBy: input.approvedBy,
        approvedAt: new Date(),
      }).where(eq(leaves.id, input.id));
      return { success: true };
    }),

  // رفض إجازة
  rejectLeave: publicProcedure
    .input(z.object({
      id: z.number(),
      approvedBy: z.number(),
      rejectionReason: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(leaves).set({
        status: 'rejected',
        approvedBy: input.approvedBy,
        approvedAt: new Date(),
        rejectionReason: input.rejectionReason,
      }).where(eq(leaves.id, input.id));
      return { success: true };
    }),

  // الحصول على إجازات موظف
  getEmployeeLeaves: publicProcedure
    .input(z.object({
      employeeId: z.number(),
      status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      let conditions = [eq(leaves.employeeId, input.employeeId)];
      if (input.status) {
        conditions.push(eq(leaves.status, input.status));
      }
      return await db.select().from(leaves)
        .where(and(...conditions))
        .orderBy(desc(leaves.createdAt));
    }),

  // ==========================================
  // تقييم الأداء
  // ==========================================
  
  // الحصول على تقييمات موظف
  getPerformanceReviews: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const db = getDb();
      return await db.select().from(performanceReviews)
        .where(eq(performanceReviews.employeeId, input))
        .orderBy(desc(performanceReviews.reviewDate));
    }),

  // إنشاء تقييم أداء
  createPerformanceReview: publicProcedure
    .input(z.object({
      employeeId: z.number(),
      reviewerId: z.number(),
      reviewPeriod: z.string(),
      reviewDate: z.string(),
      performanceScore: z.string().optional(),
      attendanceScore: z.string().optional(),
      teamworkScore: z.string().optional(),
      communicationScore: z.string().optional(),
      technicalScore: z.string().optional(),
      overallScore: z.string().optional(),
      strengths: z.string().optional(),
      areasForImprovement: z.string().optional(),
      goals: z.string().optional(),
      reviewerComments: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(performanceReviews).values({
        ...input,
        reviewDate: new Date(input.reviewDate),
        status: 'draft',
      } as any);
      return { success: true, id: result[0].insertId };
    }),

  // ==========================================
  // التدريب
  // ==========================================
  
  // الحصول على الدورات التدريبية
  getTrainingCourses: publicProcedure.query(async () => {
    const db = getDb();
    return await db.select().from(trainingCourses).where(eq(trainingCourses.isActive, true));
  }),

  // تسجيل موظف في دورة
  enrollInCourse: publicProcedure
    .input(z.object({
      employeeId: z.number(),
      courseId: z.number(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(trainingEnrollments).values({
        employeeId: input.employeeId,
        courseId: input.courseId,
        enrollmentDate: new Date(),
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        status: 'enrolled',
      } as any);
      return { success: true, id: result[0].insertId };
    }),

  // الحصول على تدريبات موظف
  getEmployeeTraining: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const db = getDb();
      return await db.select().from(trainingEnrollments)
        .where(eq(trainingEnrollments.employeeId, input))
        .orderBy(desc(trainingEnrollments.enrollmentDate));
    }),

  // ==========================================
  // الإحصائيات
  // ==========================================
  
  // إحصائيات الموظفين
  getStats: publicProcedure.query(async () => {
    const db = getDb();
    
    const [
      totalEmployees,
      activeEmployees,
      onLeaveEmployees,
      newHiresThisMonth,
      departmentStats
    ] = await Promise.all([
      db.select({ count: count() }).from(employees),
      db.select({ count: count() }).from(employees).where(eq(employees.status, 'active')),
      db.select({ count: count() }).from(employees).where(eq(employees.status, 'on_leave')),
      db.select({ count: count() }).from(employees).where(
        and(
          sql`MONTH(${employees.hireDate}) = MONTH(CURRENT_DATE())`,
          sql`YEAR(${employees.hireDate}) = YEAR(CURRENT_DATE())`
        )
      ),
      db.select({
        departmentId: employees.departmentId,
        count: count()
      }).from(employees)
        .where(eq(employees.status, 'active'))
        .groupBy(employees.departmentId)
    ]);
    
    return {
      totalEmployees: totalEmployees[0]?.count || 0,
      activeEmployees: activeEmployees[0]?.count || 0,
      onLeaveEmployees: onLeaveEmployees[0]?.count || 0,
      newHiresThisMonth: newHiresThisMonth[0]?.count || 0,
      departmentStats,
    };
  }),
});
