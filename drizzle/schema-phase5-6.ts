import { mysqlTable, varchar, int, text, timestamp, decimal, boolean, json, date } from 'drizzle-orm/mysql-core';

// ============================================
// المرحلة 5: النشر والإطلاق
// ============================================

// جدول بيئات النشر
export const deploymentEnvironments = mysqlTable('deployment_environments', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // development, staging, production
  url: varchar('url', { length: 255 }),
  serverIp: varchar('server_ip', { length: 50 }),
  databaseHost: varchar('database_host', { length: 255 }),
  databaseName: varchar('database_name', { length: 100 }),
  status: varchar('status', { length: 50 }).default('inactive'),
  lastDeployedAt: timestamp('last_deployed_at'),
  lastDeployedBy: int('last_deployed_by'),
  configuration: json('configuration'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// جدول عمليات النشر
export const deployments = mysqlTable('deployments', {
  id: int('id').primaryKey().autoincrement(),
  environmentId: int('environment_id').notNull(),
  version: varchar('version', { length: 50 }).notNull(),
  commitHash: varchar('commit_hash', { length: 100 }),
  branch: varchar('branch', { length: 100 }),
  status: varchar('status', { length: 50 }).default('pending'), // pending, in_progress, success, failed, rolled_back
  deployedBy: int('deployed_by').notNull(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  rollbackVersion: varchar('rollback_version', { length: 50 }),
  notes: text('notes'),
  logs: text('logs'),
  createdAt: timestamp('created_at').defaultNow(),
});

// جدول سجلات النشر
export const deploymentLogs = mysqlTable('deployment_logs', {
  id: int('id').primaryKey().autoincrement(),
  deploymentId: int('deployment_id').notNull(),
  step: varchar('step', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  message: text('message'),
  duration: int('duration'), // بالثواني
  createdAt: timestamp('created_at').defaultNow(),
});

// جدول مهام هجرة البيانات
export const dataMigrationTasks = mysqlTable('data_migration_tasks', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  sourceSystem: varchar('source_system', { length: 100 }),
  targetTable: varchar('target_table', { length: 100 }),
  status: varchar('status', { length: 50 }).default('pending'), // pending, in_progress, completed, failed
  priority: int('priority').default(1),
  totalRecords: int('total_records'),
  processedRecords: int('processed_records').default(0),
  failedRecords: int('failed_records').default(0),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  errorLog: text('error_log'),
  mappingConfig: json('mapping_config'),
  createdBy: int('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// جدول سجلات هجرة البيانات
export const dataMigrationLogs = mysqlTable('data_migration_logs', {
  id: int('id').primaryKey().autoincrement(),
  taskId: int('task_id').notNull(),
  recordId: varchar('record_id', { length: 100 }),
  sourceData: json('source_data'),
  targetData: json('target_data'),
  status: varchar('status', { length: 50 }).notNull(), // success, failed, skipped
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow(),
});

// جدول التحقق من البيانات
export const dataValidationRules = mysqlTable('data_validation_rules', {
  id: int('id').primaryKey().autoincrement(),
  tableName: varchar('table_name', { length: 100 }).notNull(),
  fieldName: varchar('field_name', { length: 100 }).notNull(),
  ruleType: varchar('rule_type', { length: 50 }).notNull(), // required, format, range, unique, reference
  ruleConfig: json('rule_config'),
  errorMessage: varchar('error_message', { length: 255 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// جدول نتائج التحقق
export const dataValidationResults = mysqlTable('data_validation_results', {
  id: int('id').primaryKey().autoincrement(),
  migrationTaskId: int('migration_task_id').notNull(),
  ruleId: int('rule_id').notNull(),
  recordId: varchar('record_id', { length: 100 }),
  isValid: boolean('is_valid').notNull(),
  errorDetails: text('error_details'),
  createdAt: timestamp('created_at').defaultNow(),
});

// جدول قوائم فحص الإطلاق
export const launchChecklists = mysqlTable('launch_checklists', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 200 }).notNull(),
  category: varchar('category', { length: 100 }), // infrastructure, security, data, testing, documentation
  description: text('description'),
  isRequired: boolean('is_required').default(true),
  order: int('order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// جدول حالة فحص الإطلاق
export const launchChecklistStatus = mysqlTable('launch_checklist_status', {
  id: int('id').primaryKey().autoincrement(),
  checklistId: int('checklist_id').notNull(),
  deploymentId: int('deployment_id').notNull(),
  status: varchar('status', { length: 50 }).default('pending'), // pending, in_progress, completed, skipped
  completedBy: int('completed_by'),
  completedAt: timestamp('completed_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================
// المرحلة 6: الدعم والصيانة
// ============================================

// جدول تذاكر الدعم الفني
export const supportTickets = mysqlTable('support_tickets', {
  id: int('id').primaryKey().autoincrement(),
  ticketNumber: varchar('ticket_number', { length: 50 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }), // bug, feature_request, question, incident
  priority: varchar('priority', { length: 50 }).default('medium'), // low, medium, high, critical
  status: varchar('status', { length: 50 }).default('open'), // open, in_progress, waiting, resolved, closed
  reportedBy: int('reported_by'),
  assignedTo: int('assigned_to'),
  affectedModule: varchar('affected_module', { length: 100 }),
  affectedVersion: varchar('affected_version', { length: 50 }),
  resolution: text('resolution'),
  resolvedAt: timestamp('resolved_at'),
  closedAt: timestamp('closed_at'),
  slaDeadline: timestamp('sla_deadline'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// جدول تعليقات تذاكر الدعم
export const supportTicketComments = mysqlTable('support_ticket_comments', {
  id: int('id').primaryKey().autoincrement(),
  ticketId: int('ticket_id').notNull(),
  userId: int('user_id').notNull(),
  comment: text('comment').notNull(),
  isInternal: boolean('is_internal').default(false),
  attachments: json('attachments'),
  createdAt: timestamp('created_at').defaultNow(),
});

// جدول قاعدة المعرفة
export const knowledgeBase = mysqlTable('knowledge_base', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  content: text('content'),
  category: varchar('category', { length: 100 }),
  tags: json('tags'),
  status: varchar('status', { length: 50 }).default('draft'), // draft, published, archived
  viewCount: int('view_count').default(0),
  helpfulCount: int('helpful_count').default(0),
  notHelpfulCount: int('not_helpful_count').default(0),
  authorId: int('author_id'),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// جدول الأسئلة الشائعة
export const faqs = mysqlTable('faqs', {
  id: int('id').primaryKey().autoincrement(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  category: varchar('category', { length: 100 }),
  order: int('order').default(0),
  isActive: boolean('is_active').default(true),
  viewCount: int('view_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// جدول جدول الصيانة
export const maintenanceWindows = mysqlTable('maintenance_windows', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // scheduled, emergency, hotfix
  status: varchar('status', { length: 50 }).default('scheduled'), // scheduled, in_progress, completed, cancelled
  scheduledStart: timestamp('scheduled_start').notNull(),
  scheduledEnd: timestamp('scheduled_end').notNull(),
  actualStart: timestamp('actual_start'),
  actualEnd: timestamp('actual_end'),
  affectedServices: json('affected_services'),
  notificationSent: boolean('notification_sent').default(false),
  createdBy: int('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// جدول التحديثات والإصدارات
export const systemUpdates = mysqlTable('system_updates', {
  id: int('id').primaryKey().autoincrement(),
  version: varchar('version', { length: 50 }).notNull(),
  releaseType: varchar('release_type', { length: 50 }).notNull(), // major, minor, patch, hotfix
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  changelog: text('changelog'),
  breakingChanges: text('breaking_changes'),
  status: varchar('status', { length: 50 }).default('draft'), // draft, testing, released, deprecated
  releaseDate: date('release_date'),
  downloadUrl: varchar('download_url', { length: 500 }),
  createdBy: int('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// جدول سجل التغييرات
export const changeLog = mysqlTable('change_log', {
  id: int('id').primaryKey().autoincrement(),
  updateId: int('update_id'),
  changeType: varchar('change_type', { length: 50 }).notNull(), // added, changed, fixed, removed, security
  module: varchar('module', { length: 100 }),
  description: text('description').notNull(),
  issueReference: varchar('issue_reference', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// جدول مراقبة صحة النظام
export const systemHealthChecks = mysqlTable('system_health_checks', {
  id: int('id').primaryKey().autoincrement(),
  serviceName: varchar('service_name', { length: 100 }).notNull(),
  checkType: varchar('check_type', { length: 50 }).notNull(), // http, database, memory, disk, cpu
  endpoint: varchar('endpoint', { length: 255 }),
  expectedStatus: varchar('expected_status', { length: 50 }),
  timeout: int('timeout').default(30), // بالثواني
  interval: int('interval').default(60), // بالثواني
  isActive: boolean('is_active').default(true),
  lastCheckAt: timestamp('last_check_at'),
  lastStatus: varchar('last_status', { length: 50 }),
  lastResponseTime: int('last_response_time'), // بالميلي ثانية
  createdAt: timestamp('created_at').defaultNow(),
});

// جدول نتائج فحص الصحة
export const healthCheckResults = mysqlTable('health_check_results', {
  id: int('id').primaryKey().autoincrement(),
  checkId: int('check_id').notNull(),
  status: varchar('status', { length: 50 }).notNull(), // healthy, degraded, unhealthy
  responseTime: int('response_time'), // بالميلي ثانية
  statusCode: int('status_code'),
  errorMessage: text('error_message'),
  details: json('details'),
  checkedAt: timestamp('checked_at').defaultNow(),
});

// جدول قواعد التنبيه
export const alertRules = mysqlTable('alert_rules', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  metricName: varchar('metric_name', { length: 100 }),
  condition: varchar('condition', { length: 50 }).notNull(), // gt, lt, eq, gte, lte
  threshold: decimal('threshold', { precision: 15, scale: 4 }).notNull(),
  duration: int('duration').default(0), // بالثواني
  severity: varchar('severity', { length: 50 }).default('medium'),
  notificationChannels: json('notification_channels'),
  isActive: boolean('is_active').default(true),
  lastTriggeredAt: timestamp('last_triggered_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// جدول تقارير الأداء
export const performanceReports = mysqlTable('performance_reports', {
  id: int('id').primaryKey().autoincrement(),
  reportType: varchar('report_type', { length: 50 }).notNull(), // daily, weekly, monthly
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  metrics: json('metrics'),
  summary: text('summary'),
  recommendations: text('recommendations'),
  generatedAt: timestamp('generated_at').defaultNow(),
  generatedBy: int('generated_by'),
});

// جدول ملاحظات التحسين
export const improvementSuggestions = mysqlTable('improvement_suggestions', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }), // performance, usability, security, feature
  priority: varchar('priority', { length: 50 }).default('medium'),
  status: varchar('status', { length: 50 }).default('submitted'), // submitted, under_review, approved, implemented, rejected
  submittedBy: int('submitted_by'),
  reviewedBy: int('reviewed_by'),
  reviewedAt: timestamp('reviewed_at'),
  implementedAt: timestamp('implemented_at'),
  feedback: text('feedback'),
  votes: int('votes').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// جدول استطلاعات رضا المستخدمين
export const userSatisfactionSurveys = mysqlTable('user_satisfaction_surveys', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id'),
  overallRating: int('overall_rating'), // 1-5
  easeOfUse: int('ease_of_use'), // 1-5
  performance: int('performance'), // 1-5
  features: int('features'), // 1-5
  support: int('support'), // 1-5
  comments: text('comments'),
  wouldRecommend: boolean('would_recommend'),
  submittedAt: timestamp('submitted_at').defaultNow(),
});
