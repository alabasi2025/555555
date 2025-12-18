import { mysqlTable, int, varchar, text, decimal, datetime, boolean, json } from 'drizzle-orm/mysql-core';

// ==========================================
// المرحلة 4: العمليات الميدانية والأصول والصيانة
// ==========================================

// --- نظام العمليات الميدانية المتقدم ---

// خطط العمليات الميدانية
export const fieldOperationPlans = mysqlTable('field_operation_plans', {
  id: int('id').primaryKey().autoincrement(),
  planName: varchar('plan_name', { length: 255 }).notNull(),
  planType: varchar('plan_type', { length: 50 }).notNull(), // daily, weekly, monthly
  description: text('description'),
  startDate: datetime('start_date').notNull(),
  endDate: datetime('end_date').notNull(),
  status: varchar('status', { length: 50 }).default('draft'), // draft, active, completed, cancelled
  priority: varchar('priority', { length: 20 }).default('medium'),
  assignedTeamId: int('assigned_team_id'),
  targetArea: varchar('target_area', { length: 255 }),
  estimatedCost: decimal('estimated_cost', { precision: 15, scale: 2 }),
  actualCost: decimal('actual_cost', { precision: 15, scale: 2 }),
  completionRate: decimal('completion_rate', { precision: 5, scale: 2 }).default('0'),
  createdBy: int('created_by'),
  createdAt: datetime('created_at').default(new Date()),
  updatedAt: datetime('updated_at').default(new Date()),
});

// جداول العمليات الميدانية
export const fieldOperationSchedules = mysqlTable('field_operation_schedules', {
  id: int('id').primaryKey().autoincrement(),
  planId: int('plan_id').notNull(),
  taskName: varchar('task_name', { length: 255 }).notNull(),
  taskType: varchar('task_type', { length: 50 }).notNull(),
  scheduledDate: datetime('scheduled_date').notNull(),
  scheduledTime: varchar('scheduled_time', { length: 10 }),
  duration: int('duration'), // بالدقائق
  assignedWorkerId: int('assigned_worker_id'),
  location: varchar('location', { length: 255 }),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  status: varchar('status', { length: 50 }).default('scheduled'),
  notes: text('notes'),
  createdAt: datetime('created_at').default(new Date()),
});

// تتبع الموقع الفعلي للعاملين
export const workerLocationTracking = mysqlTable('worker_location_tracking', {
  id: int('id').primaryKey().autoincrement(),
  workerId: int('worker_id').notNull(),
  latitude: decimal('latitude', { precision: 10, scale: 8 }).notNull(),
  longitude: decimal('longitude', { precision: 11, scale: 8 }).notNull(),
  accuracy: decimal('accuracy', { precision: 10, scale: 2 }),
  speed: decimal('speed', { precision: 10, scale: 2 }),
  heading: decimal('heading', { precision: 5, scale: 2 }),
  altitude: decimal('altitude', { precision: 10, scale: 2 }),
  batteryLevel: int('battery_level'),
  isOnline: boolean('is_online').default(true),
  lastSeen: datetime('last_seen').default(new Date()),
  createdAt: datetime('created_at').default(new Date()),
});

// تقييم أداء العاملين
export const workerPerformanceEvaluations = mysqlTable('worker_performance_evaluations', {
  id: int('id').primaryKey().autoincrement(),
  workerId: int('worker_id').notNull(),
  evaluationPeriod: varchar('evaluation_period', { length: 50 }).notNull(),
  evaluationDate: datetime('evaluation_date').notNull(),
  evaluatorId: int('evaluator_id'),
  tasksCompleted: int('tasks_completed').default(0),
  tasksOnTime: int('tasks_on_time').default(0),
  qualityScore: decimal('quality_score', { precision: 5, scale: 2 }),
  attendanceScore: decimal('attendance_score', { precision: 5, scale: 2 }),
  customerSatisfactionScore: decimal('customer_satisfaction_score', { precision: 5, scale: 2 }),
  overallScore: decimal('overall_score', { precision: 5, scale: 2 }),
  strengths: text('strengths'),
  areasForImprovement: text('areas_for_improvement'),
  comments: text('comments'),
  status: varchar('status', { length: 50 }).default('draft'),
  createdAt: datetime('created_at').default(new Date()),
});

// الحوافز والمكافآت
export const workerIncentives = mysqlTable('worker_incentives', {
  id: int('id').primaryKey().autoincrement(),
  workerId: int('worker_id').notNull(),
  incentiveType: varchar('incentive_type', { length: 50 }).notNull(), // bonus, commission, award
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  reason: varchar('reason', { length: 255 }).notNull(),
  relatedTaskId: int('related_task_id'),
  evaluationId: int('evaluation_id'),
  status: varchar('status', { length: 50 }).default('pending'), // pending, approved, paid, rejected
  approvedBy: int('approved_by'),
  approvedAt: datetime('approved_at'),
  paidAt: datetime('paid_at'),
  createdAt: datetime('created_at').default(new Date()),
});

// --- نظام إدارة المواد والمعدات ---

// توزيع المواد
export const materialDistributions = mysqlTable('material_distributions', {
  id: int('id').primaryKey().autoincrement(),
  distributionNumber: varchar('distribution_number', { length: 50 }).notNull(),
  fromWarehouseId: int('from_warehouse_id').notNull(),
  toWorkerId: int('to_worker_id'),
  toTeamId: int('to_team_id'),
  distributionDate: datetime('distribution_date').notNull(),
  status: varchar('status', { length: 50 }).default('pending'),
  totalItems: int('total_items').default(0),
  totalValue: decimal('total_value', { precision: 15, scale: 2 }),
  notes: text('notes'),
  approvedBy: int('approved_by'),
  createdBy: int('created_by'),
  createdAt: datetime('created_at').default(new Date()),
});

// بنود توزيع المواد
export const materialDistributionItems = mysqlTable('material_distribution_items', {
  id: int('id').primaryKey().autoincrement(),
  distributionId: int('distribution_id').notNull(),
  itemId: int('item_id').notNull(),
  quantity: decimal('quantity', { precision: 15, scale: 3 }).notNull(),
  unitCost: decimal('unit_cost', { precision: 15, scale: 2 }),
  totalCost: decimal('total_cost', { precision: 15, scale: 2 }),
  returnedQuantity: decimal('returned_quantity', { precision: 15, scale: 3 }).default('0'),
  usedQuantity: decimal('used_quantity', { precision: 15, scale: 3 }).default('0'),
  status: varchar('status', { length: 50 }).default('distributed'),
  createdAt: datetime('created_at').default(new Date()),
});

// تتبع المعدات
export const equipmentTracking = mysqlTable('equipment_tracking', {
  id: int('id').primaryKey().autoincrement(),
  equipmentId: int('equipment_id').notNull(),
  assignedToWorkerId: int('assigned_to_worker_id'),
  assignedToTeamId: int('assigned_to_team_id'),
  assignmentDate: datetime('assignment_date').notNull(),
  returnDate: datetime('return_date'),
  currentLocation: varchar('current_location', { length: 255 }),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  condition: varchar('condition', { length: 50 }).default('good'),
  status: varchar('status', { length: 50 }).default('assigned'),
  notes: text('notes'),
  createdAt: datetime('created_at').default(new Date()),
});

// صيانة المعدات
export const equipmentMaintenance = mysqlTable('equipment_maintenance', {
  id: int('id').primaryKey().autoincrement(),
  equipmentId: int('equipment_id').notNull(),
  maintenanceType: varchar('maintenance_type', { length: 50 }).notNull(), // preventive, corrective, emergency
  scheduledDate: datetime('scheduled_date'),
  completedDate: datetime('completed_date'),
  description: text('description'),
  cost: decimal('cost', { precision: 15, scale: 2 }),
  performedBy: varchar('performed_by', { length: 255 }),
  status: varchar('status', { length: 50 }).default('scheduled'),
  nextMaintenanceDate: datetime('next_maintenance_date'),
  notes: text('notes'),
  createdBy: int('created_by'),
  createdAt: datetime('created_at').default(new Date()),
});

// --- نظام الفحص والقبول ---

// طلبات الفحص الميداني
export const fieldInspections = mysqlTable('field_inspections', {
  id: int('id').primaryKey().autoincrement(),
  inspectionNumber: varchar('inspection_number', { length: 50 }).notNull(),
  inspectionType: varchar('inspection_type', { length: 50 }).notNull(),
  relatedTaskId: int('related_task_id'),
  relatedWorkOrderId: int('related_work_order_id'),
  inspectorId: int('inspector_id').notNull(),
  inspectionDate: datetime('inspection_date').notNull(),
  location: varchar('location', { length: 255 }),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  status: varchar('status', { length: 50 }).default('pending'),
  result: varchar('result', { length: 50 }), // passed, failed, conditional
  score: decimal('score', { precision: 5, scale: 2 }),
  findings: text('findings'),
  recommendations: text('recommendations'),
  photos: json('photos'),
  createdAt: datetime('created_at').default(new Date()),
});

// بنود الفحص
export const inspectionItems = mysqlTable('inspection_items', {
  id: int('id').primaryKey().autoincrement(),
  inspectionId: int('inspection_id').notNull(),
  checklistItemId: int('checklist_item_id'),
  itemName: varchar('item_name', { length: 255 }).notNull(),
  expectedValue: varchar('expected_value', { length: 255 }),
  actualValue: varchar('actual_value', { length: 255 }),
  isPassed: boolean('is_passed'),
  score: decimal('score', { precision: 5, scale: 2 }),
  notes: text('notes'),
  photos: json('photos'),
  createdAt: datetime('created_at').default(new Date()),
});

// الموافقات والتوقيعات
export const approvalSignatures = mysqlTable('approval_signatures', {
  id: int('id').primaryKey().autoincrement(),
  entityType: varchar('entity_type', { length: 50 }).notNull(), // inspection, work_order, etc.
  entityId: int('entity_id').notNull(),
  signerId: int('signer_id').notNull(),
  signerRole: varchar('signer_role', { length: 50 }).notNull(),
  signatureType: varchar('signature_type', { length: 50 }).notNull(), // approval, rejection, review
  signatureData: text('signature_data'), // base64 encoded signature image
  signedAt: datetime('signed_at').notNull(),
  ipAddress: varchar('ip_address', { length: 50 }),
  deviceInfo: varchar('device_info', { length: 255 }),
  comments: text('comments'),
  createdAt: datetime('created_at').default(new Date()),
});

// --- نظام الأصول المتقدم ---

// سجل استهلاك الأصول
export const assetDepreciationRecords = mysqlTable('asset_depreciation_records', {
  id: int('id').primaryKey().autoincrement(),
  assetId: int('asset_id').notNull(),
  depreciationMethod: varchar('depreciation_method', { length: 50 }).notNull(), // straight_line, declining_balance, etc.
  periodStart: datetime('period_start').notNull(),
  periodEnd: datetime('period_end').notNull(),
  openingValue: decimal('opening_value', { precision: 15, scale: 2 }).notNull(),
  depreciationAmount: decimal('depreciation_amount', { precision: 15, scale: 2 }).notNull(),
  accumulatedDepreciation: decimal('accumulated_depreciation', { precision: 15, scale: 2 }).notNull(),
  closingValue: decimal('closing_value', { precision: 15, scale: 2 }).notNull(),
  journalEntryId: int('journal_entry_id'),
  status: varchar('status', { length: 50 }).default('calculated'),
  createdBy: int('created_by'),
  createdAt: datetime('created_at').default(new Date()),
});

// جرد الأصول
export const assetInventoryCounts = mysqlTable('asset_inventory_counts', {
  id: int('id').primaryKey().autoincrement(),
  countNumber: varchar('count_number', { length: 50 }).notNull(),
  countDate: datetime('count_date').notNull(),
  locationId: int('location_id'),
  categoryId: int('category_id'),
  status: varchar('status', { length: 50 }).default('in_progress'),
  totalAssets: int('total_assets').default(0),
  countedAssets: int('counted_assets').default(0),
  matchedAssets: int('matched_assets').default(0),
  discrepancies: int('discrepancies').default(0),
  notes: text('notes'),
  conductedBy: int('conducted_by'),
  approvedBy: int('approved_by'),
  createdAt: datetime('created_at').default(new Date()),
});

// بنود جرد الأصول
export const assetInventoryCountItems = mysqlTable('asset_inventory_count_items', {
  id: int('id').primaryKey().autoincrement(),
  countId: int('count_id').notNull(),
  assetId: int('asset_id').notNull(),
  expectedLocation: varchar('expected_location', { length: 255 }),
  actualLocation: varchar('actual_location', { length: 255 }),
  expectedCondition: varchar('expected_condition', { length: 50 }),
  actualCondition: varchar('actual_condition', { length: 50 }),
  isFound: boolean('is_found').default(true),
  hasDiscrepancy: boolean('has_discrepancy').default(false),
  discrepancyType: varchar('discrepancy_type', { length: 50 }),
  notes: text('notes'),
  countedBy: int('counted_by'),
  countedAt: datetime('counted_at'),
  createdAt: datetime('created_at').default(new Date()),
});

// --- نظام الصيانة الوقائية ---

// جداول الصيانة الوقائية
export const preventiveMaintenanceSchedules = mysqlTable('preventive_maintenance_schedules', {
  id: int('id').primaryKey().autoincrement(),
  scheduleName: varchar('schedule_name', { length: 255 }).notNull(),
  assetId: int('asset_id'),
  equipmentId: int('equipment_id'),
  maintenanceType: varchar('maintenance_type', { length: 50 }).notNull(),
  frequency: varchar('frequency', { length: 50 }).notNull(), // daily, weekly, monthly, quarterly, yearly
  intervalDays: int('interval_days'),
  lastMaintenanceDate: datetime('last_maintenance_date'),
  nextMaintenanceDate: datetime('next_maintenance_date'),
  estimatedDuration: int('estimated_duration'), // بالدقائق
  estimatedCost: decimal('estimated_cost', { precision: 15, scale: 2 }),
  assignedTechnicianId: int('assigned_technician_id'),
  checklistId: int('checklist_id'),
  isActive: boolean('is_active').default(true),
  priority: varchar('priority', { length: 20 }).default('medium'),
  notes: text('notes'),
  createdBy: int('created_by'),
  createdAt: datetime('created_at').default(new Date()),
});

// سجلات الصيانة الوقائية
export const preventiveMaintenanceRecords = mysqlTable('preventive_maintenance_records', {
  id: int('id').primaryKey().autoincrement(),
  scheduleId: int('schedule_id').notNull(),
  maintenanceNumber: varchar('maintenance_number', { length: 50 }).notNull(),
  scheduledDate: datetime('scheduled_date').notNull(),
  startedAt: datetime('started_at'),
  completedAt: datetime('completed_at'),
  technicianId: int('technician_id'),
  status: varchar('status', { length: 50 }).default('scheduled'),
  actualDuration: int('actual_duration'),
  laborCost: decimal('labor_cost', { precision: 15, scale: 2 }),
  partsCost: decimal('parts_cost', { precision: 15, scale: 2 }),
  totalCost: decimal('total_cost', { precision: 15, scale: 2 }),
  findings: text('findings'),
  actionsPerformed: text('actions_performed'),
  partsUsed: json('parts_used'),
  nextMaintenanceDate: datetime('next_maintenance_date'),
  notes: text('notes'),
  createdAt: datetime('created_at').default(new Date()),
});

// --- نظام الصيانة الطارئة ---

// طلبات الصيانة الطارئة
export const emergencyMaintenanceRequests = mysqlTable('emergency_maintenance_requests', {
  id: int('id').primaryKey().autoincrement(),
  requestNumber: varchar('request_number', { length: 50 }).notNull(),
  assetId: int('asset_id'),
  equipmentId: int('equipment_id'),
  requesterId: int('requester_id').notNull(),
  problemDescription: text('problem_description').notNull(),
  urgencyLevel: varchar('urgency_level', { length: 20 }).notNull(), // low, medium, high, critical
  location: varchar('location', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 20 }),
  photos: json('photos'),
  status: varchar('status', { length: 50 }).default('submitted'),
  assignedTechnicianId: int('assigned_technician_id'),
  assignedAt: datetime('assigned_at'),
  estimatedArrival: datetime('estimated_arrival'),
  arrivedAt: datetime('arrived_at'),
  completedAt: datetime('completed_at'),
  resolution: text('resolution'),
  laborCost: decimal('labor_cost', { precision: 15, scale: 2 }),
  partsCost: decimal('parts_cost', { precision: 15, scale: 2 }),
  totalCost: decimal('total_cost', { precision: 15, scale: 2 }),
  customerSatisfaction: int('customer_satisfaction'),
  createdAt: datetime('created_at').default(new Date()),
});

// تعيين الفنيين
export const technicianAssignments = mysqlTable('technician_assignments', {
  id: int('id').primaryKey().autoincrement(),
  technicianId: int('technician_id').notNull(),
  assignmentType: varchar('assignment_type', { length: 50 }).notNull(), // emergency, preventive, scheduled
  relatedRequestId: int('related_request_id'),
  relatedScheduleId: int('related_schedule_id'),
  assignedAt: datetime('assigned_at').notNull(),
  acceptedAt: datetime('accepted_at'),
  startedAt: datetime('started_at'),
  completedAt: datetime('completed_at'),
  status: varchar('status', { length: 50 }).default('assigned'),
  travelTime: int('travel_time'), // بالدقائق
  workTime: int('work_time'), // بالدقائق
  notes: text('notes'),
  createdAt: datetime('created_at').default(new Date()),
});

// قطع الغيار المستخدمة
export const maintenancePartsUsed = mysqlTable('maintenance_parts_used', {
  id: int('id').primaryKey().autoincrement(),
  maintenanceRecordId: int('maintenance_record_id'),
  emergencyRequestId: int('emergency_request_id'),
  partId: int('part_id').notNull(),
  partName: varchar('part_name', { length: 255 }).notNull(),
  quantity: decimal('quantity', { precision: 15, scale: 3 }).notNull(),
  unitCost: decimal('unit_cost', { precision: 15, scale: 2 }),
  totalCost: decimal('total_cost', { precision: 15, scale: 2 }),
  warehouseId: int('warehouse_id'),
  notes: text('notes'),
  createdAt: datetime('created_at').default(new Date()),
});

// --- نظام إدارة الفنيين ---

// ملفات الفنيين
export const technicianProfiles = mysqlTable('technician_profiles', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull(),
  technicianCode: varchar('technician_code', { length: 50 }).notNull(),
  specializations: json('specializations'),
  certifications: json('certifications'),
  experienceYears: int('experience_years'),
  hourlyRate: decimal('hourly_rate', { precision: 15, scale: 2 }),
  availability: varchar('availability', { length: 50 }).default('available'),
  currentLocation: varchar('current_location', { length: 255 }),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  rating: decimal('rating', { precision: 3, scale: 2 }),
  totalJobs: int('total_jobs').default(0),
  completedJobs: int('completed_jobs').default(0),
  isActive: boolean('is_active').default(true),
  notes: text('notes'),
  createdAt: datetime('created_at').default(new Date()),
});

// تقييمات الفنيين
export const technicianRatings = mysqlTable('technician_ratings', {
  id: int('id').primaryKey().autoincrement(),
  technicianId: int('technician_id').notNull(),
  relatedRequestId: int('related_request_id'),
  relatedRecordId: int('related_record_id'),
  raterId: int('rater_id'),
  qualityRating: int('quality_rating'), // 1-5
  timelinessRating: int('timeliness_rating'), // 1-5
  professionalismRating: int('professionalism_rating'), // 1-5
  overallRating: int('overall_rating'), // 1-5
  comments: text('comments'),
  createdAt: datetime('created_at').default(new Date()),
});

// --- نظام التكامل ---

// سجل تكامل الوحدات
export const moduleIntegrationLogs = mysqlTable('module_integration_logs', {
  id: int('id').primaryKey().autoincrement(),
  sourceModule: varchar('source_module', { length: 50 }).notNull(),
  targetModule: varchar('target_module', { length: 50 }).notNull(),
  operationType: varchar('operation_type', { length: 50 }).notNull(),
  sourceEntityType: varchar('source_entity_type', { length: 50 }),
  sourceEntityId: int('source_entity_id'),
  targetEntityType: varchar('target_entity_type', { length: 50 }),
  targetEntityId: int('target_entity_id'),
  status: varchar('status', { length: 50 }).default('success'),
  errorMessage: text('error_message'),
  requestData: json('request_data'),
  responseData: json('response_data'),
  executionTime: int('execution_time'), // بالمللي ثانية
  createdAt: datetime('created_at').default(new Date()),
});

// قواعد التكامل
export const integrationRules = mysqlTable('integration_rules', {
  id: int('id').primaryKey().autoincrement(),
  ruleName: varchar('rule_name', { length: 255 }).notNull(),
  sourceModule: varchar('source_module', { length: 50 }).notNull(),
  targetModule: varchar('target_module', { length: 50 }).notNull(),
  triggerEvent: varchar('trigger_event', { length: 50 }).notNull(),
  conditions: json('conditions'),
  actions: json('actions'),
  isActive: boolean('is_active').default(true),
  priority: int('priority').default(0),
  description: text('description'),
  createdBy: int('created_by'),
  createdAt: datetime('created_at').default(new Date()),
});
