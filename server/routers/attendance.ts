/**
 * نظام الحضور والانصراف - Router
 * Attendance Management System - Router
 */

import { z } from 'zod';
import { router, publicProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { 
  attendance, 
  workShifts, 
  employeeSchedules,
  employees,
  holidays
} from '../../drizzle/schema';
import { eq, desc, asc, and, between, sql, count, sum } from 'drizzle-orm';

export const attendanceRouter = router({
  // ==========================================
  // تسجيل الحضور والانصراف
  // ==========================================
  
  // تسجيل حضور
  checkIn: publicProcedure
    .input(z.object({
      employeeId: z.number(),
      location: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const timeStr = today.toTimeString().split(' ')[0];
      
      // التحقق من عدم وجود تسجيل سابق لهذا اليوم
      const existing = await db.select().from(attendance)
        .where(and(
          eq(attendance.employeeId, input.employeeId),
          sql`DATE(${attendance.date}) = ${dateStr}`
        ));
      
      if (existing.length > 0 && existing[0].checkInTime) {
        return { success: false, message: 'تم تسجيل الحضور مسبقاً لهذا اليوم' };
      }
      
      if (existing.length > 0) {
        // تحديث السجل الموجود
        await db.update(attendance).set({
          checkInTime: timeStr,
          checkInLocation: input.location,
          status: 'present',
        }).where(eq(attendance.id, existing[0].id));
        return { success: true, id: existing[0].id };
      } else {
        // إنشاء سجل جديد
        const result = await db.insert(attendance).values({
          employeeId: input.employeeId,
          date: today,
          checkInTime: timeStr,
          checkInLocation: input.location,
          status: 'present',
        } as any);
        return { success: true, id: result[0].insertId };
      }
    }),

  // تسجيل انصراف
  checkOut: publicProcedure
    .input(z.object({
      employeeId: z.number(),
      location: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const timeStr = today.toTimeString().split(' ')[0];
      
      // البحث عن سجل اليوم
      const existing = await db.select().from(attendance)
        .where(and(
          eq(attendance.employeeId, input.employeeId),
          sql`DATE(${attendance.date}) = ${dateStr}`
        ));
      
      if (existing.length === 0 || !existing[0].checkInTime) {
        return { success: false, message: 'لم يتم تسجيل الحضور لهذا اليوم' };
      }
      
      if (existing[0].checkOutTime) {
        return { success: false, message: 'تم تسجيل الانصراف مسبقاً' };
      }
      
      // حساب ساعات العمل
      const checkIn = existing[0].checkInTime;
      const checkInParts = checkIn.split(':').map(Number);
      const checkOutParts = timeStr.split(':').map(Number);
      
      const checkInMinutes = checkInParts[0] * 60 + checkInParts[1];
      const checkOutMinutes = checkOutParts[0] * 60 + checkOutParts[1];
      const workedMinutes = checkOutMinutes - checkInMinutes;
      const workedHours = (workedMinutes / 60).toFixed(2);
      
      // حساب الساعات الإضافية (أكثر من 8 ساعات)
      const scheduledHours = 8;
      const overtimeHours = Math.max(0, parseFloat(workedHours) - scheduledHours).toFixed(2);
      
      await db.update(attendance).set({
        checkOutTime: timeStr,
        checkOutLocation: input.location,
        workedHours: workedHours,
        overtimeHours: overtimeHours,
      }).where(eq(attendance.id, existing[0].id));
      
      return { success: true, workedHours, overtimeHours };
    }),

  // ==========================================
  // استعلامات الحضور
  // ==========================================
  
  // الحصول على سجل حضور موظف
  getEmployeeAttendance: publicProcedure
    .input(z.object({
      employeeId: z.number(),
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      return await db.select().from(attendance)
        .where(and(
          eq(attendance.employeeId, input.employeeId),
          between(attendance.date, new Date(input.startDate), new Date(input.endDate))
        ))
        .orderBy(desc(attendance.date));
    }),

  // الحصول على حضور اليوم لجميع الموظفين
  getTodayAttendance: publicProcedure.query(async () => {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];
    
    return await db.select({
      attendance: attendance,
      employee: employees,
    }).from(attendance)
      .leftJoin(employees, eq(attendance.employeeId, employees.id))
      .where(sql`DATE(${attendance.date}) = ${today}`)
      .orderBy(asc(attendance.checkInTime));
  }),

  // الحصول على ملخص الحضور الشهري
  getMonthlyReport: publicProcedure
    .input(z.object({
      employeeId: z.number().optional(),
      year: z.number(),
      month: z.number(),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      const startDate = new Date(input.year, input.month - 1, 1);
      const endDate = new Date(input.year, input.month, 0);
      
      let conditions = [
        between(attendance.date, startDate, endDate)
      ];
      
      if (input.employeeId) {
        conditions.push(eq(attendance.employeeId, input.employeeId));
      }
      
      const records = await db.select().from(attendance)
        .where(and(...conditions))
        .orderBy(asc(attendance.date));
      
      // حساب الإحصائيات
      const stats = {
        totalDays: records.length,
        presentDays: records.filter(r => r.status === 'present').length,
        absentDays: records.filter(r => r.status === 'absent').length,
        lateDays: records.filter(r => r.status === 'late').length,
        leaveDays: records.filter(r => r.status === 'on_leave').length,
        totalWorkedHours: records.reduce((sum, r) => sum + parseFloat(r.workedHours?.toString() || '0'), 0),
        totalOvertimeHours: records.reduce((sum, r) => sum + parseFloat(r.overtimeHours?.toString() || '0'), 0),
        totalLateMinutes: records.reduce((sum, r) => sum + (r.lateMinutes || 0), 0),
      };
      
      return { records, stats };
    }),

  // ==========================================
  // إدارة أوردية العمل
  // ==========================================
  
  // الحصول على أوردية العمل
  getWorkShifts: publicProcedure.query(async () => {
    const db = getDb();
    return await db.select().from(workShifts).where(eq(workShifts.isActive, true));
  }),

  // إنشاء وردية عمل
  createWorkShift: publicProcedure
    .input(z.object({
      code: z.string(),
      nameAr: z.string(),
      nameEn: z.string().optional(),
      startTime: z.string(),
      endTime: z.string(),
      breakDuration: z.number().optional(),
      workingHours: z.string().optional(),
      isFlexible: z.boolean().optional(),
      flexibleStartTime: z.string().optional(),
      flexibleEndTime: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(workShifts).values(input as any);
      return { success: true, id: result[0].insertId };
    }),

  // ==========================================
  // جدول عمل الموظفين
  // ==========================================
  
  // الحصول على جدول عمل موظف
  getEmployeeSchedule: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const db = getDb();
      return await db.select({
        schedule: employeeSchedules,
        shift: workShifts,
      }).from(employeeSchedules)
        .leftJoin(workShifts, eq(employeeSchedules.shiftId, workShifts.id))
        .where(eq(employeeSchedules.employeeId, input));
    }),

  // تعيين جدول عمل لموظف
  assignSchedule: publicProcedure
    .input(z.object({
      employeeId: z.number(),
      shiftId: z.number(),
      dayOfWeek: z.enum(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']),
      isWorkingDay: z.boolean(),
      effectiveFrom: z.string(),
      effectiveTo: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(employeeSchedules).values({
        ...input,
        effectiveFrom: new Date(input.effectiveFrom),
        effectiveTo: input.effectiveTo ? new Date(input.effectiveTo) : null,
      } as any);
      return { success: true, id: result[0].insertId };
    }),

  // ==========================================
  // العطلات الرسمية
  // ==========================================
  
  // الحصول على العطلات
  getHolidays: publicProcedure
    .input(z.object({
      year: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const year = input?.year || new Date().getFullYear();
      return await db.select().from(holidays)
        .where(and(
          eq(holidays.year, year),
          eq(holidays.isActive, true)
        ))
        .orderBy(asc(holidays.date));
    }),

  // إضافة عطلة
  createHoliday: publicProcedure
    .input(z.object({
      name: z.string(),
      date: z.string(),
      year: z.number(),
      isRecurring: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(holidays).values({
        ...input,
        date: new Date(input.date),
      } as any);
      return { success: true, id: result[0].insertId };
    }),

  // ==========================================
  // تسجيل حضور يدوي
  // ==========================================
  
  // تسجيل حضور يدوي (للمدير)
  manualEntry: publicProcedure
    .input(z.object({
      employeeId: z.number(),
      date: z.string(),
      checkInTime: z.string().optional(),
      checkOutTime: z.string().optional(),
      status: z.enum(['present', 'absent', 'late', 'half_day', 'on_leave', 'holiday', 'weekend']),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      
      // التحقق من وجود سجل
      const existing = await db.select().from(attendance)
        .where(and(
          eq(attendance.employeeId, input.employeeId),
          sql`DATE(${attendance.date}) = ${input.date}`
        ));
      
      const data: any = {
        employeeId: input.employeeId,
        date: new Date(input.date),
        checkInTime: input.checkInTime,
        checkOutTime: input.checkOutTime,
        status: input.status,
        notes: input.notes,
      };
      
      // حساب ساعات العمل إذا كان هناك وقت حضور وانصراف
      if (input.checkInTime && input.checkOutTime) {
        const checkInParts = input.checkInTime.split(':').map(Number);
        const checkOutParts = input.checkOutTime.split(':').map(Number);
        const checkInMinutes = checkInParts[0] * 60 + checkInParts[1];
        const checkOutMinutes = checkOutParts[0] * 60 + checkOutParts[1];
        const workedMinutes = checkOutMinutes - checkInMinutes;
        data.workedHours = (workedMinutes / 60).toFixed(2);
      }
      
      if (existing.length > 0) {
        await db.update(attendance).set(data).where(eq(attendance.id, existing[0].id));
        return { success: true, id: existing[0].id };
      } else {
        const result = await db.insert(attendance).values(data);
        return { success: true, id: result[0].insertId };
      }
    }),

  // ==========================================
  // الإحصائيات
  // ==========================================
  
  // إحصائيات الحضور اليومية
  getDailyStats: publicProcedure
    .input(z.string().optional())
    .query(async ({ input }) => {
      const db = getDb();
      const date = input || new Date().toISOString().split('T')[0];
      
      const [
        totalEmployees,
        presentToday,
        absentToday,
        lateToday,
        onLeaveToday
      ] = await Promise.all([
        db.select({ count: count() }).from(employees).where(eq(employees.status, 'active')),
        db.select({ count: count() }).from(attendance)
          .where(and(
            sql`DATE(${attendance.date}) = ${date}`,
            eq(attendance.status, 'present')
          )),
        db.select({ count: count() }).from(attendance)
          .where(and(
            sql`DATE(${attendance.date}) = ${date}`,
            eq(attendance.status, 'absent')
          )),
        db.select({ count: count() }).from(attendance)
          .where(and(
            sql`DATE(${attendance.date}) = ${date}`,
            eq(attendance.status, 'late')
          )),
        db.select({ count: count() }).from(attendance)
          .where(and(
            sql`DATE(${attendance.date}) = ${date}`,
            eq(attendance.status, 'on_leave')
          )),
      ]);
      
      return {
        date,
        totalEmployees: totalEmployees[0]?.count || 0,
        present: presentToday[0]?.count || 0,
        absent: absentToday[0]?.count || 0,
        late: lateToday[0]?.count || 0,
        onLeave: onLeaveToday[0]?.count || 0,
        attendanceRate: totalEmployees[0]?.count 
          ? ((presentToday[0]?.count || 0) / totalEmployees[0].count * 100).toFixed(1) 
          : '0',
      };
    }),
});
