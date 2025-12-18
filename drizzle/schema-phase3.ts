import { mysqlTable, int, varchar, text, decimal, datetime, boolean, json, mysqlEnum, timestamp, date } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ==========================================
// المرحلة 3: الأنظمة المتقدمة
// ==========================================

// ------------------------------------------
// 1. نظام الفوترة المتقدم
// ------------------------------------------

// قوالب الفواتير
export const invoiceTemplates = mysqlTable("invoice_templates", {
  id: int("id").primaryKey().autoincrement(),
  templateName: varchar("template_name", { length: 255 }).notNull(),
  templateType: mysqlEnum("template_type", ["standard", "recurring", "credit_note", "debit_note", "proforma"]).default("standard"),
  description: text("description"),
  headerHtml: text("header_html"),
  bodyHtml: text("body_html"),
  footerHtml: text("footer_html"),
  cssStyles: text("css_styles"),
  logoUrl: varchar("logo_url", { length: 500 }),
  companyInfo: json("company_info"),
  termsAndConditions: text("terms_and_conditions"),
  notes: text("notes"),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// الفواتير المرتجعة (Credit Notes)
export const creditNotes = mysqlTable("credit_notes", {
  id: int("id").primaryKey().autoincrement(),
  creditNoteNumber: varchar("credit_note_number", { length: 50 }).notNull().unique(),
  originalInvoiceId: int("original_invoice_id"),
  customerId: int("customer_id").notNull(),
  issueDate: date("issue_date").notNull(),
  reason: mysqlEnum("reason", ["return", "discount", "error", "cancellation", "other"]).notNull(),
  reasonDescription: text("reason_description"),
  subtotal: decimal("subtotal", { precision: 15, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 15, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["draft", "issued", "applied", "cancelled"]).default("draft"),
  appliedToInvoiceId: int("applied_to_invoice_id"),
  appliedAmount: decimal("applied_amount", { precision: 15, scale: 2 }).default("0"),
  appliedAt: datetime("applied_at"),
  notes: text("notes"),
  createdBy: int("created_by"),
  approvedBy: int("approved_by"),
  approvedAt: datetime("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// بنود الفواتير المرتجعة
export const creditNoteItems = mysqlTable("credit_note_items", {
  id: int("id").primaryKey().autoincrement(),
  creditNoteId: int("credit_note_id").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 15, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  originalInvoiceItemId: int("original_invoice_item_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ------------------------------------------
// 2. نظام التحصيل المتقدم
// ------------------------------------------

// بوابات الدفع
export const paymentGateways = mysqlTable("payment_gateways", {
  id: int("id").primaryKey().autoincrement(),
  gatewayName: varchar("gateway_name", { length: 100 }).notNull(),
  gatewayType: mysqlEnum("gateway_type", ["bank_transfer", "credit_card", "mobile_wallet", "cash", "check", "online"]).notNull(),
  providerName: varchar("provider_name", { length: 100 }),
  apiKey: varchar("api_key", { length: 500 }),
  apiSecret: varchar("api_secret", { length: 500 }),
  merchantId: varchar("merchant_id", { length: 100 }),
  webhookUrl: varchar("webhook_url", { length: 500 }),
  configuration: json("configuration"),
  supportedCurrencies: json("supported_currencies"),
  transactionFeePercent: decimal("transaction_fee_percent", { precision: 5, scale: 2 }).default("0"),
  transactionFeeFixed: decimal("transaction_fee_fixed", { precision: 10, scale: 2 }).default("0"),
  minAmount: decimal("min_amount", { precision: 15, scale: 2 }),
  maxAmount: decimal("max_amount", { precision: 15, scale: 2 }),
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// المحافظ الرقمية للعملاء
export const customerWallets = mysqlTable("customer_wallets", {
  id: int("id").primaryKey().autoincrement(),
  customerId: int("customer_id").notNull(),
  walletNumber: varchar("wallet_number", { length: 50 }).notNull().unique(),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 3 }).default("YER"),
  status: mysqlEnum("status", ["active", "suspended", "closed"]).default("active"),
  lastTransactionAt: datetime("last_transaction_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// معاملات المحفظة
export const walletTransactions = mysqlTable("wallet_transactions", {
  id: int("id").primaryKey().autoincrement(),
  walletId: int("wallet_id").notNull(),
  transactionType: mysqlEnum("transaction_type", ["deposit", "withdrawal", "payment", "refund", "transfer", "adjustment"]).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  balanceBefore: decimal("balance_before", { precision: 15, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 15, scale: 2 }).notNull(),
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: int("reference_id"),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "completed", "failed", "cancelled"]).default("pending"),
  processedAt: datetime("processed_at"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// التحصيل الآلي
export const autoCollectionRules = mysqlTable("auto_collection_rules", {
  id: int("id").primaryKey().autoincrement(),
  ruleName: varchar("rule_name", { length: 255 }).notNull(),
  description: text("description"),
  triggerType: mysqlEnum("trigger_type", ["due_date", "overdue_days", "amount_threshold", "schedule"]).notNull(),
  triggerValue: varchar("trigger_value", { length: 100 }),
  actionType: mysqlEnum("action_type", ["send_reminder", "charge_wallet", "apply_penalty", "suspend_service", "escalate"]).notNull(),
  actionConfig: json("action_config"),
  customerSegment: varchar("customer_segment", { length: 100 }),
  priority: int("priority").default(0),
  isActive: boolean("is_active").default(true),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// سجل التحصيل الآلي
export const autoCollectionLogs = mysqlTable("auto_collection_logs", {
  id: int("id").primaryKey().autoincrement(),
  ruleId: int("rule_id").notNull(),
  customerId: int("customer_id").notNull(),
  invoiceId: int("invoice_id"),
  actionTaken: varchar("action_taken", { length: 100 }).notNull(),
  actionResult: mysqlEnum("action_result", ["success", "failed", "pending", "skipped"]).notNull(),
  resultDetails: text("result_details"),
  amountCollected: decimal("amount_collected", { precision: 15, scale: 2 }),
  executedAt: timestamp("executed_at").defaultNow(),
});

// ------------------------------------------
// 3. نظام إدارة الديون
// ------------------------------------------

// سجل الديون
export const debtRecords = mysqlTable("debt_records", {
  id: int("id").primaryKey().autoincrement(),
  customerId: int("customer_id").notNull(),
  debtType: mysqlEnum("debt_type", ["invoice", "service", "penalty", "other"]).notNull(),
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: int("reference_id"),
  originalAmount: decimal("original_amount", { precision: 15, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 15, scale: 2 }).default("0"),
  remainingAmount: decimal("remaining_amount", { precision: 15, scale: 2 }).notNull(),
  penaltyAmount: decimal("penalty_amount", { precision: 15, scale: 2 }).default("0"),
  interestAmount: decimal("interest_amount", { precision: 15, scale: 2 }).default("0"),
  dueDate: date("due_date").notNull(),
  status: mysqlEnum("status", ["active", "partially_paid", "paid", "written_off", "in_collection", "disputed"]).default("active"),
  agingDays: int("aging_days").default(0),
  lastPaymentDate: date("last_payment_date"),
  lastReminderDate: date("last_reminder_date"),
  reminderCount: int("reminder_count").default(0),
  collectionStage: mysqlEnum("collection_stage", ["normal", "reminder", "warning", "final_notice", "legal", "written_off"]).default("normal"),
  assignedCollectorId: int("assigned_collector_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// خطط السداد
export const paymentPlans = mysqlTable("payment_plans", {
  id: int("id").primaryKey().autoincrement(),
  customerId: int("customer_id").notNull(),
  planName: varchar("plan_name", { length: 255 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 15, scale: 2 }).default("0"),
  remainingAmount: decimal("remaining_amount", { precision: 15, scale: 2 }).notNull(),
  numberOfInstallments: int("number_of_installments").notNull(),
  installmentAmount: decimal("installment_amount", { precision: 15, scale: 2 }).notNull(),
  frequency: mysqlEnum("frequency", ["weekly", "biweekly", "monthly", "quarterly"]).default("monthly"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  nextPaymentDate: date("next_payment_date"),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).default("0"),
  lateFeePercent: decimal("late_fee_percent", { precision: 5, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["draft", "active", "completed", "defaulted", "cancelled"]).default("draft"),
  approvedBy: int("approved_by"),
  approvedAt: datetime("approved_at"),
  notes: text("notes"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// أقساط خطط السداد
export const paymentPlanInstallments = mysqlTable("payment_plan_installments", {
  id: int("id").primaryKey().autoincrement(),
  planId: int("plan_id").notNull(),
  installmentNumber: int("installment_number").notNull(),
  dueDate: date("due_date").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  principalAmount: decimal("principal_amount", { precision: 15, scale: 2 }).notNull(),
  interestAmount: decimal("interest_amount", { precision: 15, scale: 2 }).default("0"),
  lateFee: decimal("late_fee", { precision: 15, scale: 2 }).default("0"),
  paidAmount: decimal("paid_amount", { precision: 15, scale: 2 }).default("0"),
  paidDate: date("paid_date"),
  status: mysqlEnum("status", ["pending", "paid", "partial", "overdue", "waived"]).default("pending"),
  paymentId: int("payment_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// العقوبات والفوائد
export const penaltiesAndInterests = mysqlTable("penalties_and_interests", {
  id: int("id").primaryKey().autoincrement(),
  customerId: int("customer_id").notNull(),
  debtRecordId: int("debt_record_id"),
  invoiceId: int("invoice_id"),
  penaltyType: mysqlEnum("penalty_type", ["late_fee", "interest", "reconnection_fee", "legal_fee", "other"]).notNull(),
  calculationType: mysqlEnum("calculation_type", ["fixed", "percentage", "daily_rate"]).notNull(),
  rate: decimal("rate", { precision: 10, scale: 4 }),
  baseAmount: decimal("base_amount", { precision: 15, scale: 2 }).notNull(),
  calculatedAmount: decimal("calculated_amount", { precision: 15, scale: 2 }).notNull(),
  daysOverdue: int("days_overdue"),
  appliedDate: date("applied_date").notNull(),
  status: mysqlEnum("status", ["pending", "applied", "waived", "paid"]).default("pending"),
  waivedBy: int("waived_by"),
  waivedAt: datetime("waived_at"),
  waiverReason: text("waiver_reason"),
  notes: text("notes"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ------------------------------------------
// 4. نظام التقارير المالية المتقدمة
// ------------------------------------------

// تعريفات التقارير المخصصة
export const customReportDefinitions = mysqlTable("custom_report_definitions", {
  id: int("id").primaryKey().autoincrement(),
  reportName: varchar("report_name", { length: 255 }).notNull(),
  reportType: mysqlEnum("report_type", ["financial", "operational", "customer", "inventory", "hr", "custom"]).notNull(),
  description: text("description"),
  baseQuery: text("base_query"),
  columns: json("columns"),
  filters: json("filters"),
  groupBy: json("group_by"),
  orderBy: json("order_by"),
  chartType: mysqlEnum("chart_type", ["table", "bar", "line", "pie", "area", "scatter", "mixed"]),
  chartConfig: json("chart_config"),
  scheduleType: mysqlEnum("schedule_type", ["manual", "daily", "weekly", "monthly"]),
  scheduleConfig: json("schedule_config"),
  recipients: json("recipients"),
  isPublic: boolean("is_public").default(false),
  isActive: boolean("is_active").default(true),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// سجل تشغيل التقارير
export const reportExecutionLogs = mysqlTable("report_execution_logs", {
  id: int("id").primaryKey().autoincrement(),
  reportId: int("report_id").notNull(),
  executedBy: int("executed_by"),
  executionType: mysqlEnum("execution_type", ["manual", "scheduled", "api"]).notNull(),
  parameters: json("parameters"),
  startTime: datetime("start_time").notNull(),
  endTime: datetime("end_time"),
  duration: int("duration"),
  rowCount: int("row_count"),
  status: mysqlEnum("status", ["running", "completed", "failed", "cancelled"]).default("running"),
  errorMessage: text("error_message"),
  outputFormat: mysqlEnum("output_format", ["json", "csv", "excel", "pdf"]),
  outputPath: varchar("output_path", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// التنبؤات المالية
export const financialForecasts = mysqlTable("financial_forecasts", {
  id: int("id").primaryKey().autoincrement(),
  forecastName: varchar("forecast_name", { length: 255 }).notNull(),
  forecastType: mysqlEnum("forecast_type", ["revenue", "expense", "cash_flow", "profit", "collection"]).notNull(),
  periodType: mysqlEnum("period_type", ["daily", "weekly", "monthly", "quarterly", "yearly"]).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  baselineData: json("baseline_data"),
  forecastData: json("forecast_data"),
  assumptions: json("assumptions"),
  methodology: mysqlEnum("methodology", ["linear", "exponential", "seasonal", "ml_based", "manual"]).default("linear"),
  confidenceLevel: decimal("confidence_level", { precision: 5, scale: 2 }),
  actualData: json("actual_data"),
  varianceAnalysis: json("variance_analysis"),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft"),
  createdBy: int("created_by"),
  approvedBy: int("approved_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// مؤشرات الأداء الرئيسية
export const kpiDefinitions = mysqlTable("kpi_definitions", {
  id: int("id").primaryKey().autoincrement(),
  kpiName: varchar("kpi_name", { length: 255 }).notNull(),
  kpiCode: varchar("kpi_code", { length: 50 }).notNull().unique(),
  category: mysqlEnum("category", ["financial", "operational", "customer", "employee", "quality"]).notNull(),
  description: text("description"),
  formula: text("formula"),
  unit: varchar("unit", { length: 50 }),
  targetValue: decimal("target_value", { precision: 15, scale: 4 }),
  warningThreshold: decimal("warning_threshold", { precision: 15, scale: 4 }),
  criticalThreshold: decimal("critical_threshold", { precision: 15, scale: 4 }),
  direction: mysqlEnum("direction", ["higher_better", "lower_better", "target"]).default("higher_better"),
  frequency: mysqlEnum("frequency", ["realtime", "daily", "weekly", "monthly"]).default("monthly"),
  dataSource: varchar("data_source", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// قيم مؤشرات الأداء
export const kpiValues = mysqlTable("kpi_values", {
  id: int("id").primaryKey().autoincrement(),
  kpiId: int("kpi_id").notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  actualValue: decimal("actual_value", { precision: 15, scale: 4 }),
  targetValue: decimal("target_value", { precision: 15, scale: 4 }),
  previousValue: decimal("previous_value", { precision: 15, scale: 4 }),
  variance: decimal("variance", { precision: 15, scale: 4 }),
  variancePercent: decimal("variance_percent", { precision: 10, scale: 2 }),
  trend: mysqlEnum("trend", ["up", "down", "stable"]),
  status: mysqlEnum("status", ["on_track", "warning", "critical", "exceeded"]),
  notes: text("notes"),
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

// ------------------------------------------
// 5. نظام العمليات الميدانية المتقدم
// ------------------------------------------

// الخطط الميدانية
export const fieldPlans = mysqlTable("field_plans", {
  id: int("id").primaryKey().autoincrement(),
  planName: varchar("plan_name", { length: 255 }).notNull(),
  planType: mysqlEnum("plan_type", ["reading", "collection", "maintenance", "installation", "inspection", "disconnection", "reconnection"]).notNull(),
  description: text("description"),
  areaId: int("area_id"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  targetCount: int("target_count"),
  completedCount: int("completed_count").default(0),
  status: mysqlEnum("status", ["draft", "scheduled", "in_progress", "completed", "cancelled"]).default("draft"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  assignedTeamId: int("assigned_team_id"),
  supervisorId: int("supervisor_id"),
  estimatedHours: decimal("estimated_hours", { precision: 10, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// مهام الخطة الميدانية
export const fieldPlanTasks = mysqlTable("field_plan_tasks", {
  id: int("id").primaryKey().autoincrement(),
  planId: int("plan_id").notNull(),
  taskType: varchar("task_type", { length: 100 }).notNull(),
  customerId: int("customer_id"),
  meterId: int("meter_id"),
  subscriptionId: int("subscription_id"),
  address: text("address"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  scheduledDate: date("scheduled_date"),
  scheduledTime: varchar("scheduled_time", { length: 20 }),
  assignedWorkerId: int("assigned_worker_id"),
  priority: int("priority").default(0),
  status: mysqlEnum("status", ["pending", "assigned", "in_progress", "completed", "failed", "skipped"]).default("pending"),
  startTime: datetime("start_time"),
  endTime: datetime("end_time"),
  result: json("result"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// تتبع الموقع الفعلي
export const locationTracking = mysqlTable("location_tracking", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  teamId: int("team_id"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  accuracy: decimal("accuracy", { precision: 10, scale: 2 }),
  altitude: decimal("altitude", { precision: 10, scale: 2 }),
  speed: decimal("speed", { precision: 10, scale: 2 }),
  heading: decimal("heading", { precision: 5, scale: 2 }),
  batteryLevel: int("battery_level"),
  isOnline: boolean("is_online").default(true),
  activityType: mysqlEnum("activity_type", ["stationary", "walking", "driving", "unknown"]),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

// تقييم أداء العاملين الميدانيين
export const fieldWorkerPerformance = mysqlTable("field_worker_performance", {
  id: int("id").primaryKey().autoincrement(),
  workerId: int("worker_id").notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  totalTasks: int("total_tasks").default(0),
  completedTasks: int("completed_tasks").default(0),
  failedTasks: int("failed_tasks").default(0),
  avgCompletionTime: decimal("avg_completion_time", { precision: 10, scale: 2 }),
  totalWorkingHours: decimal("total_working_hours", { precision: 10, scale: 2 }),
  totalDistance: decimal("total_distance", { precision: 10, scale: 2 }),
  customerRating: decimal("customer_rating", { precision: 3, scale: 2 }),
  qualityScore: decimal("quality_score", { precision: 5, scale: 2 }),
  punctualityScore: decimal("punctuality_score", { precision: 5, scale: 2 }),
  overallScore: decimal("overall_score", { precision: 5, scale: 2 }),
  bonusAmount: decimal("bonus_amount", { precision: 15, scale: 2 }),
  penaltyAmount: decimal("penalty_amount", { precision: 15, scale: 2 }),
  notes: text("notes"),
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

// ------------------------------------------
// 6. نظام المخزون المتقدم
// ------------------------------------------

// تتبع المخزون (Lot/Serial Tracking)
export const inventoryLots = mysqlTable("inventory_lots", {
  id: int("id").primaryKey().autoincrement(),
  itemId: int("item_id").notNull(),
  warehouseId: int("warehouse_id").notNull(),
  lotNumber: varchar("lot_number", { length: 100 }).notNull(),
  serialNumber: varchar("serial_number", { length: 100 }),
  batchNumber: varchar("batch_number", { length: 100 }),
  quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
  reservedQuantity: decimal("reserved_quantity", { precision: 15, scale: 4 }).default("0"),
  availableQuantity: decimal("available_quantity", { precision: 15, scale: 4 }).notNull(),
  unitCost: decimal("unit_cost", { precision: 15, scale: 4 }),
  manufacturingDate: date("manufacturing_date"),
  expiryDate: date("expiry_date"),
  receivedDate: date("received_date"),
  supplierId: int("supplier_id"),
  purchaseOrderId: int("purchase_order_id"),
  status: mysqlEnum("status", ["available", "reserved", "quarantine", "expired", "damaged"]).default("available"),
  location: varchar("location", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// حجوزات المخزون
export const inventoryReservations = mysqlTable("inventory_reservations", {
  id: int("id").primaryKey().autoincrement(),
  itemId: int("item_id").notNull(),
  warehouseId: int("warehouse_id").notNull(),
  lotId: int("lot_id"),
  reservedQuantity: decimal("reserved_quantity", { precision: 15, scale: 4 }).notNull(),
  reservationType: mysqlEnum("reservation_type", ["sales_order", "work_order", "transfer", "production", "other"]).notNull(),
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: int("reference_id"),
  reservedBy: int("reserved_by"),
  reservedAt: timestamp("reserved_at").defaultNow(),
  expiresAt: datetime("expires_at"),
  status: mysqlEnum("status", ["active", "fulfilled", "cancelled", "expired"]).default("active"),
  fulfilledAt: datetime("fulfilled_at"),
  notes: text("notes"),
});

// تنبؤات المخزون
export const inventoryForecasts = mysqlTable("inventory_forecasts", {
  id: int("id").primaryKey().autoincrement(),
  itemId: int("item_id").notNull(),
  warehouseId: int("warehouse_id"),
  forecastDate: date("forecast_date").notNull(),
  forecastType: mysqlEnum("forecast_type", ["demand", "supply", "stock_level"]).notNull(),
  forecastQuantity: decimal("forecast_quantity", { precision: 15, scale: 4 }).notNull(),
  actualQuantity: decimal("actual_quantity", { precision: 15, scale: 4 }),
  variance: decimal("variance", { precision: 15, scale: 4 }),
  confidenceLevel: decimal("confidence_level", { precision: 5, scale: 2 }),
  methodology: varchar("methodology", { length: 100 }),
  factors: json("factors"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// تنبيهات المخزون
export const inventoryAlerts = mysqlTable("inventory_alerts", {
  id: int("id").primaryKey().autoincrement(),
  itemId: int("item_id").notNull(),
  warehouseId: int("warehouse_id"),
  alertType: mysqlEnum("alert_type", ["low_stock", "overstock", "expiring", "expired", "reorder_point", "stockout"]).notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("warning"),
  currentValue: decimal("current_value", { precision: 15, scale: 4 }),
  thresholdValue: decimal("threshold_value", { precision: 15, scale: 4 }),
  message: text("message"),
  isRead: boolean("is_read").default(false),
  isResolved: boolean("is_resolved").default(false),
  resolvedBy: int("resolved_by"),
  resolvedAt: datetime("resolved_at"),
  resolutionNotes: text("resolution_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ------------------------------------------
// 7. نظام الموافقات والسير العمل
// ------------------------------------------

// تعريفات سير العمل
export const workflowDefinitions = mysqlTable("workflow_definitions", {
  id: int("id").primaryKey().autoincrement(),
  workflowName: varchar("workflow_name", { length: 255 }).notNull(),
  workflowType: mysqlEnum("workflow_type", ["approval", "review", "process", "notification"]).notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  description: text("description"),
  steps: json("steps"),
  conditions: json("conditions"),
  escalationRules: json("escalation_rules"),
  notificationConfig: json("notification_config"),
  slaHours: int("sla_hours"),
  isActive: boolean("is_active").default(true),
  version: int("version").default(1),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// طلبات الموافقة
export const approvalRequests = mysqlTable("approval_requests", {
  id: int("id").primaryKey().autoincrement(),
  workflowId: int("workflow_id").notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: int("entity_id").notNull(),
  requesterId: int("requester_id").notNull(),
  currentStep: int("current_step").default(1),
  totalSteps: int("total_steps").notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "approved", "rejected", "cancelled", "escalated"]).default("pending"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  dueDate: datetime("due_date"),
  completedAt: datetime("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// سجل الموافقات
export const approvalHistory = mysqlTable("approval_history", {
  id: int("id").primaryKey().autoincrement(),
  requestId: int("request_id").notNull(),
  stepNumber: int("step_number").notNull(),
  approverId: int("approver_id").notNull(),
  action: mysqlEnum("action", ["approve", "reject", "return", "delegate", "escalate"]).notNull(),
  comments: text("comments"),
  attachments: json("attachments"),
  actionAt: timestamp("action_at").defaultNow(),
});

// Export all tables
export const phase3Tables = {
  invoiceTemplates,
  creditNotes,
  creditNoteItems,
  paymentGateways,
  customerWallets,
  walletTransactions,
  autoCollectionRules,
  autoCollectionLogs,
  debtRecords,
  paymentPlans,
  paymentPlanInstallments,
  penaltiesAndInterests,
  customReportDefinitions,
  reportExecutionLogs,
  financialForecasts,
  kpiDefinitions,
  kpiValues,
  fieldPlans,
  fieldPlanTasks,
  locationTracking,
  fieldWorkerPerformance,
  inventoryLots,
  inventoryReservations,
  inventoryForecasts,
  inventoryAlerts,
  workflowDefinitions,
  approvalRequests,
  approvalHistory,
};
