import { mysqlTable, int, varchar, text, timestamp, boolean, decimal, json, mysqlEnum, date, datetime } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ==================== نظام الاختبارات ====================

// جداول الاختبارات
export const testSuites = mysqlTable("test_suites", {
  id: int("id").primaryKey().autoincrement(),
  suiteName: varchar("suite_name", { length: 255 }).notNull(),
  suiteType: mysqlEnum("suite_type", ["unit", "integration", "e2e", "performance", "security"]).notNull(),
  description: text("description"),
  module: varchar("module", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const testCases = mysqlTable("test_cases", {
  id: int("id").primaryKey().autoincrement(),
  suiteId: int("suite_id").notNull(),
  testName: varchar("test_name", { length: 255 }).notNull(),
  testCode: varchar("test_code", { length: 50 }).notNull(),
  description: text("description"),
  expectedResult: text("expected_result"),
  priority: mysqlEnum("priority", ["critical", "high", "medium", "low"]).default("medium"),
  isAutomated: boolean("is_automated").default(true),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const testRuns = mysqlTable("test_runs", {
  id: int("id").primaryKey().autoincrement(),
  runNumber: varchar("run_number", { length: 50 }).notNull(),
  suiteId: int("suite_id"),
  runType: mysqlEnum("run_type", ["manual", "automated", "scheduled"]).default("automated"),
  environment: mysqlEnum("environment", ["development", "staging", "production"]).default("development"),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed", "cancelled"]).default("pending"),
  totalTests: int("total_tests").default(0),
  passedTests: int("passed_tests").default(0),
  failedTests: int("failed_tests").default(0),
  skippedTests: int("skipped_tests").default(0),
  duration: int("duration"), // بالثواني
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  triggeredBy: int("triggered_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const testResults = mysqlTable("test_results", {
  id: int("id").primaryKey().autoincrement(),
  runId: int("run_id").notNull(),
  testCaseId: int("test_case_id").notNull(),
  status: mysqlEnum("status", ["passed", "failed", "skipped", "error"]).notNull(),
  actualResult: text("actual_result"),
  errorMessage: text("error_message"),
  stackTrace: text("stack_trace"),
  duration: int("duration"), // بالمللي ثانية
  screenshots: json("screenshots"),
  executedAt: timestamp("executed_at").defaultNow(),
});

export const testCoverage = mysqlTable("test_coverage", {
  id: int("id").primaryKey().autoincrement(),
  runId: int("run_id").notNull(),
  module: varchar("module", { length: 100 }).notNull(),
  totalLines: int("total_lines").default(0),
  coveredLines: int("covered_lines").default(0),
  coveragePercent: decimal("coverage_percent", { precision: 5, scale: 2 }),
  totalFunctions: int("total_functions").default(0),
  coveredFunctions: int("covered_functions").default(0),
  totalBranches: int("total_branches").default(0),
  coveredBranches: int("covered_branches").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== نظام الأمان والتدقيق ====================

// سجلات التدقيق - تم تعريفها مسبقاً في schema.ts
// استخدم auditLogs من schema.ts

// تقييمات الأمان
export const securityAssessments = mysqlTable("security_assessments", {
  id: int("id").primaryKey().autoincrement(),
  assessmentCode: varchar("assessment_code", { length: 50 }).notNull(),
  assessmentType: mysqlEnum("assessment_type", ["vulnerability", "penetration", "compliance", "audit"]).notNull(),
  scope: text("scope"),
  status: mysqlEnum("status", ["planned", "in_progress", "completed", "cancelled"]).default("planned"),
  findings: int("findings").default(0),
  criticalFindings: int("critical_findings").default(0),
  highFindings: int("high_findings").default(0),
  mediumFindings: int("medium_findings").default(0),
  lowFindings: int("low_findings").default(0),
  assessorId: int("assessor_id"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  reportUrl: varchar("report_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// نتائج الأمان
export const securityFindings = mysqlTable("security_findings", {
  id: int("id").primaryKey().autoincrement(),
  assessmentId: int("assessment_id").notNull(),
  findingCode: varchar("finding_code", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  severity: mysqlEnum("severity", ["critical", "high", "medium", "low", "info"]).notNull(),
  category: varchar("category", { length: 100 }),
  affectedComponent: varchar("affected_component", { length: 255 }),
  recommendation: text("recommendation"),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "accepted", "false_positive"]).default("open"),
  assignedTo: int("assigned_to"),
  dueDate: date("due_date"),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: int("resolved_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// سياسات الأمان
export const securityPolicies = mysqlTable("security_policies", {
  id: int("id").primaryKey().autoincrement(),
  policyCode: varchar("policy_code", { length: 50 }).notNull(),
  policyName: varchar("policy_name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  content: text("content"),
  version: varchar("version", { length: 20 }),
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft"),
  effectiveDate: date("effective_date"),
  reviewDate: date("review_date"),
  approvedBy: int("approved_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// ==================== نظام الخصوصية وحماية البيانات ====================

// طلبات الخصوصية
export const privacyRequests = mysqlTable("privacy_requests", {
  id: int("id").primaryKey().autoincrement(),
  requestNumber: varchar("request_number", { length: 50 }).notNull(),
  requestType: mysqlEnum("request_type", ["access", "deletion", "correction", "portability", "objection"]).notNull(),
  requesterId: int("requester_id"),
  requesterEmail: varchar("requester_email", { length: 255 }),
  requesterName: varchar("requester_name", { length: 255 }),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "rejected"]).default("pending"),
  assignedTo: int("assigned_to"),
  responseNotes: text("response_notes"),
  completedAt: timestamp("completed_at"),
  dueDate: date("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// موافقات الخصوصية
export const privacyConsents = mysqlTable("privacy_consents", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id"),
  consentType: varchar("consent_type", { length: 100 }).notNull(),
  consentVersion: varchar("consent_version", { length: 20 }),
  isGranted: boolean("is_granted").default(false),
  grantedAt: timestamp("granted_at"),
  revokedAt: timestamp("revoked_at"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== نظام التوثيق ====================

// وثائق النظام
export const systemDocuments = mysqlTable("system_documents", {
  id: int("id").primaryKey().autoincrement(),
  documentCode: varchar("document_code", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["user_guide", "admin_guide", "api_docs", "technical", "training", "policy"]).notNull(),
  content: text("content"),
  version: varchar("version", { length: 20 }),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft"),
  language: varchar("language", { length: 10 }).default("ar"),
  fileUrl: varchar("file_url", { length: 500 }),
  authorId: int("author_id"),
  reviewerId: int("reviewer_id"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// توثيق API
export const apiDocumentation = mysqlTable("api_documentation", {
  id: int("id").primaryKey().autoincrement(),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  method: mysqlEnum("method", ["GET", "POST", "PUT", "PATCH", "DELETE"]).notNull(),
  description: text("description"),
  requestSchema: json("request_schema"),
  responseSchema: json("response_schema"),
  exampleRequest: json("example_request"),
  exampleResponse: json("example_response"),
  authentication: varchar("authentication", { length: 100 }),
  rateLimit: varchar("rate_limit", { length: 50 }),
  version: varchar("version", { length: 20 }),
  isDeprecated: boolean("is_deprecated").default(false),
  deprecationDate: date("deprecation_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// ==================== نظام الإعدادات ====================

// إعدادات النظام
export const systemSettings = mysqlTable("system_settings", {
  id: int("id").primaryKey().autoincrement(),
  settingKey: varchar("setting_key", { length: 100 }).notNull(),
  settingValue: text("setting_value"),
  settingType: mysqlEnum("setting_type", ["string", "number", "boolean", "json", "date"]).default("string"),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  isEditable: boolean("is_editable").default(true),
  defaultValue: text("default_value"),
  validationRules: json("validation_rules"),
  updatedBy: int("updated_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// سجل تغييرات الإعدادات
export const settingsHistory = mysqlTable("settings_history", {
  id: int("id").primaryKey().autoincrement(),
  settingId: int("setting_id").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  changedBy: int("changed_by"),
  changeReason: text("change_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== نظام النسخ الاحتياطي ====================

// النسخ الاحتياطية
export const backups = mysqlTable("backups", {
  id: int("id").primaryKey().autoincrement(),
  backupCode: varchar("backup_code", { length: 50 }).notNull(),
  backupType: mysqlEnum("backup_type", ["full", "incremental", "differential"]).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"]).default("pending"),
  fileSize: int("file_size"), // بالبايت
  filePath: varchar("file_path", { length: 500 }),
  checksum: varchar("checksum", { length: 64 }),
  encryptionKey: varchar("encryption_key", { length: 255 }),
  retentionDays: int("retention_days").default(30),
  expiresAt: timestamp("expires_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
  triggeredBy: int("triggered_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// جداول الاسترجاع
export const restoreOperations = mysqlTable("restore_operations", {
  id: int("id").primaryKey().autoincrement(),
  backupId: int("backup_id").notNull(),
  restoreType: mysqlEnum("restore_type", ["full", "partial", "point_in_time"]).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"]).default("pending"),
  targetDatabase: varchar("target_database", { length: 100 }),
  tablesRestored: json("tables_restored"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
  triggeredBy: int("triggered_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== نظام المراقبة والسجلات ====================

// سجلات النظام
export const systemLogs = mysqlTable("system_logs", {
  id: int("id").primaryKey().autoincrement(),
  logLevel: mysqlEnum("log_level", ["debug", "info", "warning", "error", "critical"]).notNull(),
  source: varchar("source", { length: 100 }),
  message: text("message"),
  context: json("context"),
  stackTrace: text("stack_trace"),
  userId: int("user_id"),
  requestId: varchar("request_id", { length: 100 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// مقاييس الأداء
export const performanceMetrics = mysqlTable("performance_metrics", {
  id: int("id").primaryKey().autoincrement(),
  metricName: varchar("metric_name", { length: 100 }).notNull(),
  metricValue: decimal("metric_value", { precision: 15, scale: 4 }),
  metricUnit: varchar("metric_unit", { length: 50 }),
  source: varchar("source", { length: 100 }),
  tags: json("tags"),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

// تنبيهات النظام
export const systemAlerts = mysqlTable("system_alerts", {
  id: int("id").primaryKey().autoincrement(),
  alertCode: varchar("alert_code", { length: 50 }).notNull(),
  alertType: mysqlEnum("alert_type", ["performance", "security", "error", "warning", "info"]).notNull(),
  severity: mysqlEnum("severity", ["critical", "high", "medium", "low"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  source: varchar("source", { length: 100 }),
  status: mysqlEnum("status", ["active", "acknowledged", "resolved"]).default("active"),
  acknowledgedBy: int("acknowledged_by"),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedBy: int("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== نظام الإشعارات المتقدم ====================

// قوالب الإشعارات
export const notificationTemplates = mysqlTable("notification_templates", {
  id: int("id").primaryKey().autoincrement(),
  templateCode: varchar("template_code", { length: 50 }).notNull(),
  templateName: varchar("template_name", { length: 255 }).notNull(),
  channel: mysqlEnum("channel", ["email", "sms", "push", "in_app"]).notNull(),
  subject: varchar("subject", { length: 255 }),
  body: text("body"),
  variables: json("variables"),
  isActive: boolean("is_active").default(true),
  language: varchar("language", { length: 10 }).default("ar"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// سجل الإشعارات
export const notificationLogs = mysqlTable("notification_logs", {
  id: int("id").primaryKey().autoincrement(),
  templateId: int("template_id"),
  recipientId: int("recipient_id"),
  recipientEmail: varchar("recipient_email", { length: 255 }),
  recipientPhone: varchar("recipient_phone", { length: 20 }),
  channel: mysqlEnum("channel", ["email", "sms", "push", "in_app"]).notNull(),
  subject: varchar("subject", { length: 255 }),
  body: text("body"),
  status: mysqlEnum("status", ["pending", "sent", "delivered", "failed", "bounced"]).default("pending"),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  errorMessage: text("error_message"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== Relations ====================

export const testSuitesRelations = relations(testSuites, ({ many }) => ({
  testCases: many(testCases),
  testRuns: many(testRuns),
}));

export const testCasesRelations = relations(testCases, ({ one, many }) => ({
  suite: one(testSuites, {
    fields: [testCases.suiteId],
    references: [testSuites.id],
  }),
  results: many(testResults),
}));

export const testRunsRelations = relations(testRuns, ({ one, many }) => ({
  suite: one(testSuites, {
    fields: [testRuns.suiteId],
    references: [testSuites.id],
  }),
  results: many(testResults),
  coverage: many(testCoverage),
}));

export const testResultsRelations = relations(testResults, ({ one }) => ({
  run: one(testRuns, {
    fields: [testResults.runId],
    references: [testRuns.id],
  }),
  testCase: one(testCases, {
    fields: [testResults.testCaseId],
    references: [testCases.id],
  }),
}));

export const securityAssessmentsRelations = relations(securityAssessments, ({ many }) => ({
  findings: many(securityFindings),
}));

export const securityFindingsRelations = relations(securityFindings, ({ one }) => ({
  assessment: one(securityAssessments, {
    fields: [securityFindings.assessmentId],
    references: [securityAssessments.id],
  }),
}));

export const backupsRelations = relations(backups, ({ many }) => ({
  restoreOperations: many(restoreOperations),
}));

export const restoreOperationsRelations = relations(restoreOperations, ({ one }) => ({
  backup: one(backups, {
    fields: [restoreOperations.backupId],
    references: [backups.id],
  }),
}));
