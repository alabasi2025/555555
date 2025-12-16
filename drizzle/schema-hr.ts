/**
 * نظام الموارد البشرية - جداول قاعدة البيانات
 * HR System - Database Schema
 */

import { mysqlTable, varchar, int, decimal, text, timestamp, boolean, date, time, mysqlEnum } from 'drizzle-orm/mysql-core';

// ==========================================
// جدول الموظفين (Employees)
// ==========================================
export const employees = mysqlTable('employees', {
  id: int('id').primaryKey().autoincrement(),
  employeeNumber: varchar('employee_number', { length: 20 }).unique().notNull(),
  
  // البيانات الشخصية
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  fullNameAr: varchar('full_name_ar', { length: 255 }),
  nationalId: varchar('national_id', { length: 20 }).unique(),
  dateOfBirth: date('date_of_birth'),
  gender: mysqlEnum('gender', ['male', 'female']),
  maritalStatus: mysqlEnum('marital_status', ['single', 'married', 'divorced', 'widowed']),
  nationality: varchar('nationality', { length: 100 }),
  
  // بيانات الاتصال
  email: varchar('email', { length: 255 }).unique(),
  phone: varchar('phone', { length: 20 }),
  mobilePhone: varchar('mobile_phone', { length: 20 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  emergencyContactName: varchar('emergency_contact_name', { length: 255 }),
  emergencyContactPhone: varchar('emergency_contact_phone', { length: 20 }),
  
  // بيانات التوظيف
  departmentId: int('department_id'),
  positionId: int('position_id'),
  managerId: int('manager_id'),
  employmentType: mysqlEnum('employment_type', ['full_time', 'part_time', 'contract', 'temporary', 'intern']).default('full_time'),
  hireDate: date('hire_date').notNull(),
  probationEndDate: date('probation_end_date'),
  contractEndDate: date('contract_end_date'),
  terminationDate: date('termination_date'),
  terminationReason: text('termination_reason'),
  
  // بيانات الراتب
  baseSalary: decimal('base_salary', { precision: 12, scale: 2 }).default('0'),
  housingAllowance: decimal('housing_allowance', { precision: 10, scale: 2 }).default('0'),
  transportAllowance: decimal('transport_allowance', { precision: 10, scale: 2 }).default('0'),
  otherAllowances: decimal('other_allowances', { precision: 10, scale: 2 }).default('0'),
  bankName: varchar('bank_name', { length: 100 }),
  bankAccountNumber: varchar('bank_account_number', { length: 50 }),
  iban: varchar('iban', { length: 50 }),
  
  // بيانات التأمينات والضرائب
  socialInsuranceNumber: varchar('social_insurance_number', { length: 20 }),
  taxNumber: varchar('tax_number', { length: 20 }),
  
  // الحالة
  status: mysqlEnum('status', ['active', 'on_leave', 'suspended', 'terminated', 'resigned']).default('active'),
  
  // الصورة والملفات
  photoUrl: varchar('photo_url', { length: 500 }),
  
  // بيانات النظام
  userId: int('user_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  createdBy: int('created_by'),
  updatedBy: int('updated_by'),
});

// ==========================================
// جدول الأقسام (Departments)
// ==========================================
export const departments = mysqlTable('departments', {
  id: int('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 20 }).unique().notNull(),
  nameAr: varchar('name_ar', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  description: text('description'),
  parentDepartmentId: int('parent_department_id'),
  managerId: int('manager_id'),
  costCenterId: int('cost_center_id'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ==========================================
// جدول المناصب الوظيفية (Positions)
// ==========================================
export const positions = mysqlTable('positions', {
  id: int('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 20 }).unique().notNull(),
  titleAr: varchar('title_ar', { length: 255 }).notNull(),
  titleEn: varchar('title_en', { length: 255 }),
  description: text('description'),
  departmentId: int('department_id'),
  level: int('level').default(1),
  minSalary: decimal('min_salary', { precision: 12, scale: 2 }),
  maxSalary: decimal('max_salary', { precision: 12, scale: 2 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ==========================================
// جدول سجل الحضور والانصراف (Attendance)
// ==========================================
export const attendance = mysqlTable('attendance', {
  id: int('id').primaryKey().autoincrement(),
  employeeId: int('employee_id').notNull(),
  date: date('date').notNull(),
  
  // أوقات الحضور والانصراف
  checkInTime: time('check_in_time'),
  checkOutTime: time('check_out_time'),
  checkInLocation: varchar('check_in_location', { length: 255 }),
  checkOutLocation: varchar('check_out_location', { length: 255 }),
  
  // ساعات العمل
  scheduledHours: decimal('scheduled_hours', { precision: 5, scale: 2 }).default('8'),
  workedHours: decimal('worked_hours', { precision: 5, scale: 2 }).default('0'),
  overtimeHours: decimal('overtime_hours', { precision: 5, scale: 2 }).default('0'),
  lateMinutes: int('late_minutes').default(0),
  earlyLeaveMinutes: int('early_leave_minutes').default(0),
  
  // الحالة
  status: mysqlEnum('status', ['present', 'absent', 'late', 'half_day', 'on_leave', 'holiday', 'weekend']).default('present'),
  
  // ملاحظات
  notes: text('notes'),
  approvedBy: int('approved_by'),
  approvedAt: timestamp('approved_at'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ==========================================
// جدول أوردية العمل (Work Shifts)
// ==========================================
export const workShifts = mysqlTable('work_shifts', {
  id: int('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 20 }).unique().notNull(),
  nameAr: varchar('name_ar', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  breakDuration: int('break_duration').default(60), // بالدقائق
  workingHours: decimal('working_hours', { precision: 4, scale: 2 }).default('8'),
  isFlexible: boolean('is_flexible').default(false),
  flexibleStartTime: time('flexible_start_time'),
  flexibleEndTime: time('flexible_end_time'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ==========================================
// جدول جدول عمل الموظفين (Employee Schedules)
// ==========================================
export const employeeSchedules = mysqlTable('employee_schedules', {
  id: int('id').primaryKey().autoincrement(),
  employeeId: int('employee_id').notNull(),
  shiftId: int('shift_id').notNull(),
  dayOfWeek: mysqlEnum('day_of_week', ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']).notNull(),
  isWorkingDay: boolean('is_working_day').default(true),
  effectiveFrom: date('effective_from').notNull(),
  effectiveTo: date('effective_to'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ==========================================
// جدول الإجازات (Leaves)
// ==========================================
export const leaves = mysqlTable('leaves', {
  id: int('id').primaryKey().autoincrement(),
  employeeId: int('employee_id').notNull(),
  leaveTypeId: int('leave_type_id').notNull(),
  
  // تواريخ الإجازة
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  totalDays: decimal('total_days', { precision: 5, scale: 2 }).notNull(),
  
  // تفاصيل الإجازة
  reason: text('reason'),
  attachmentUrl: varchar('attachment_url', { length: 500 }),
  
  // حالة الموافقة
  status: mysqlEnum('status', ['pending', 'approved', 'rejected', 'cancelled']).default('pending'),
  approvedBy: int('approved_by'),
  approvedAt: timestamp('approved_at'),
  rejectionReason: text('rejection_reason'),
  
  // بيانات النظام
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  createdBy: int('created_by'),
});

// ==========================================
// جدول أنواع الإجازات (Leave Types)
// ==========================================
export const leaveTypes = mysqlTable('leave_types', {
  id: int('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 20 }).unique().notNull(),
  nameAr: varchar('name_ar', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  description: text('description'),
  annualBalance: decimal('annual_balance', { precision: 5, scale: 2 }).default('0'),
  isPaid: boolean('is_paid').default(true),
  requiresApproval: boolean('requires_approval').default(true),
  requiresAttachment: boolean('requires_attachment').default(false),
  maxConsecutiveDays: int('max_consecutive_days'),
  minAdvanceNotice: int('min_advance_notice').default(1), // بالأيام
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ==========================================
// جدول رصيد الإجازات (Leave Balances)
// ==========================================
export const leaveBalances = mysqlTable('leave_balances', {
  id: int('id').primaryKey().autoincrement(),
  employeeId: int('employee_id').notNull(),
  leaveTypeId: int('leave_type_id').notNull(),
  year: int('year').notNull(),
  openingBalance: decimal('opening_balance', { precision: 5, scale: 2 }).default('0'),
  accrued: decimal('accrued', { precision: 5, scale: 2 }).default('0'),
  used: decimal('used', { precision: 5, scale: 2 }).default('0'),
  adjusted: decimal('adjusted', { precision: 5, scale: 2 }).default('0'),
  carriedForward: decimal('carried_forward', { precision: 5, scale: 2 }).default('0'),
  remainingBalance: decimal('remaining_balance', { precision: 5, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ==========================================
// جدول الرواتب (Payroll)
// ==========================================
export const payroll = mysqlTable('payroll', {
  id: int('id').primaryKey().autoincrement(),
  payrollPeriodId: int('payroll_period_id').notNull(),
  employeeId: int('employee_id').notNull(),
  
  // الراتب الأساسي والبدلات
  baseSalary: decimal('base_salary', { precision: 12, scale: 2 }).default('0'),
  housingAllowance: decimal('housing_allowance', { precision: 10, scale: 2 }).default('0'),
  transportAllowance: decimal('transport_allowance', { precision: 10, scale: 2 }).default('0'),
  otherAllowances: decimal('other_allowances', { precision: 10, scale: 2 }).default('0'),
  
  // الإضافات
  overtimePay: decimal('overtime_pay', { precision: 10, scale: 2 }).default('0'),
  bonuses: decimal('bonuses', { precision: 10, scale: 2 }).default('0'),
  commissions: decimal('commissions', { precision: 10, scale: 2 }).default('0'),
  otherEarnings: decimal('other_earnings', { precision: 10, scale: 2 }).default('0'),
  
  // الخصومات
  socialInsurance: decimal('social_insurance', { precision: 10, scale: 2 }).default('0'),
  taxDeduction: decimal('tax_deduction', { precision: 10, scale: 2 }).default('0'),
  loanDeduction: decimal('loan_deduction', { precision: 10, scale: 2 }).default('0'),
  absenceDeduction: decimal('absence_deduction', { precision: 10, scale: 2 }).default('0'),
  lateDeduction: decimal('late_deduction', { precision: 10, scale: 2 }).default('0'),
  otherDeductions: decimal('other_deductions', { precision: 10, scale: 2 }).default('0'),
  
  // الإجماليات
  grossSalary: decimal('gross_salary', { precision: 12, scale: 2 }).default('0'),
  totalDeductions: decimal('total_deductions', { precision: 12, scale: 2 }).default('0'),
  netSalary: decimal('net_salary', { precision: 12, scale: 2 }).default('0'),
  
  // بيانات الدفع
  paymentMethod: mysqlEnum('payment_method', ['bank_transfer', 'cash', 'check']).default('bank_transfer'),
  paymentStatus: mysqlEnum('payment_status', ['pending', 'processed', 'paid', 'cancelled']).default('pending'),
  paymentDate: date('payment_date'),
  paymentReference: varchar('payment_reference', { length: 100 }),
  
  // ملاحظات
  notes: text('notes'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  createdBy: int('created_by'),
  approvedBy: int('approved_by'),
  approvedAt: timestamp('approved_at'),
});

// ==========================================
// جدول فترات الرواتب (Payroll Periods)
// ==========================================
export const payrollPeriods = mysqlTable('payroll_periods', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull(),
  year: int('year').notNull(),
  month: int('month').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  paymentDate: date('payment_date'),
  status: mysqlEnum('status', ['draft', 'processing', 'approved', 'paid', 'closed']).default('draft'),
  totalEmployees: int('total_employees').default(0),
  totalGrossSalary: decimal('total_gross_salary', { precision: 14, scale: 2 }).default('0'),
  totalDeductions: decimal('total_deductions', { precision: 14, scale: 2 }).default('0'),
  totalNetSalary: decimal('total_net_salary', { precision: 14, scale: 2 }).default('0'),
  processedBy: int('processed_by'),
  processedAt: timestamp('processed_at'),
  approvedBy: int('approved_by'),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ==========================================
// جدول السلف والقروض (Loans)
// ==========================================
export const employeeLoans = mysqlTable('employee_loans', {
  id: int('id').primaryKey().autoincrement(),
  employeeId: int('employee_id').notNull(),
  loanType: mysqlEnum('loan_type', ['advance', 'loan']).default('advance'),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  remainingAmount: decimal('remaining_amount', { precision: 12, scale: 2 }).notNull(),
  monthlyDeduction: decimal('monthly_deduction', { precision: 10, scale: 2 }).notNull(),
  numberOfInstallments: int('number_of_installments').notNull(),
  paidInstallments: int('paid_installments').default(0),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  reason: text('reason'),
  status: mysqlEnum('status', ['pending', 'approved', 'active', 'completed', 'cancelled']).default('pending'),
  approvedBy: int('approved_by'),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ==========================================
// جدول المكافآت والحوافز (Bonuses)
// ==========================================
export const employeeBonuses = mysqlTable('employee_bonuses', {
  id: int('id').primaryKey().autoincrement(),
  employeeId: int('employee_id').notNull(),
  bonusType: mysqlEnum('bonus_type', ['performance', 'annual', 'project', 'overtime', 'special', 'other']).default('performance'),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  reason: text('reason'),
  effectiveDate: date('effective_date').notNull(),
  payrollPeriodId: int('payroll_period_id'),
  status: mysqlEnum('status', ['pending', 'approved', 'paid', 'cancelled']).default('pending'),
  approvedBy: int('approved_by'),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ==========================================
// جدول تقييم الأداء (Performance Reviews)
// ==========================================
export const performanceReviews = mysqlTable('performance_reviews', {
  id: int('id').primaryKey().autoincrement(),
  employeeId: int('employee_id').notNull(),
  reviewerId: int('reviewer_id').notNull(),
  reviewPeriod: varchar('review_period', { length: 50 }).notNull(), // مثال: "2024-Q1"
  reviewDate: date('review_date').notNull(),
  
  // التقييمات (من 1 إلى 5)
  performanceScore: decimal('performance_score', { precision: 3, scale: 2 }),
  attendanceScore: decimal('attendance_score', { precision: 3, scale: 2 }),
  teamworkScore: decimal('teamwork_score', { precision: 3, scale: 2 }),
  communicationScore: decimal('communication_score', { precision: 3, scale: 2 }),
  technicalScore: decimal('technical_score', { precision: 3, scale: 2 }),
  overallScore: decimal('overall_score', { precision: 3, scale: 2 }),
  
  // التعليقات
  strengths: text('strengths'),
  areasForImprovement: text('areas_for_improvement'),
  goals: text('goals'),
  employeeComments: text('employee_comments'),
  reviewerComments: text('reviewer_comments'),
  
  // الحالة
  status: mysqlEnum('status', ['draft', 'submitted', 'acknowledged', 'completed']).default('draft'),
  acknowledgedAt: timestamp('acknowledged_at'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ==========================================
// جدول التدريب (Training)
// ==========================================
export const trainingCourses = mysqlTable('training_courses', {
  id: int('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 20 }).unique().notNull(),
  titleAr: varchar('title_ar', { length: 255 }).notNull(),
  titleEn: varchar('title_en', { length: 255 }),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  provider: varchar('provider', { length: 255 }),
  duration: int('duration'), // بالساعات
  cost: decimal('cost', { precision: 10, scale: 2 }),
  isInternal: boolean('is_internal').default(true),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ==========================================
// جدول تسجيل التدريب (Training Enrollments)
// ==========================================
export const trainingEnrollments = mysqlTable('training_enrollments', {
  id: int('id').primaryKey().autoincrement(),
  employeeId: int('employee_id').notNull(),
  courseId: int('course_id').notNull(),
  enrollmentDate: date('enrollment_date').notNull(),
  startDate: date('start_date'),
  endDate: date('end_date'),
  status: mysqlEnum('status', ['enrolled', 'in_progress', 'completed', 'cancelled', 'failed']).default('enrolled'),
  score: decimal('score', { precision: 5, scale: 2 }),
  certificateUrl: varchar('certificate_url', { length: 500 }),
  feedback: text('feedback'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ==========================================
// جدول الحوادث والسلامة (Safety Incidents)
// ==========================================
export const safetyIncidents = mysqlTable('safety_incidents', {
  id: int('id').primaryKey().autoincrement(),
  incidentNumber: varchar('incident_number', { length: 20 }).unique().notNull(),
  employeeId: int('employee_id'),
  incidentDate: timestamp('incident_date').notNull(),
  location: varchar('location', { length: 255 }),
  incidentType: mysqlEnum('incident_type', ['injury', 'near_miss', 'property_damage', 'environmental', 'other']).default('other'),
  severity: mysqlEnum('severity', ['minor', 'moderate', 'major', 'critical']).default('minor'),
  description: text('description').notNull(),
  immediateAction: text('immediate_action'),
  rootCause: text('root_cause'),
  correctiveAction: text('corrective_action'),
  preventiveAction: text('preventive_action'),
  status: mysqlEnum('status', ['reported', 'investigating', 'resolved', 'closed']).default('reported'),
  reportedBy: int('reported_by').notNull(),
  investigatedBy: int('investigated_by'),
  closedBy: int('closed_by'),
  closedAt: timestamp('closed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ==========================================
// جدول العطلات الرسمية (Holidays)
// ==========================================
export const holidays = mysqlTable('holidays', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  date: date('date').notNull(),
  year: int('year').notNull(),
  isRecurring: boolean('is_recurring').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
