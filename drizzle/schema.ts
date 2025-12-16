import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, date } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================
// المهمة 0.1: شجرة الحسابات (Chart of Accounts)
// ============================================

export const chartOfAccounts = mysqlTable("chart_of_accounts", {
  id: int("id").autoincrement().primaryKey(),
  accountCode: varchar("account_code", { length: 50 }).notNull().unique(),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  accountNameEn: varchar("account_name_en", { length: 255 }),
  accountType: mysqlEnum("account_type", ["asset", "liability", "equity", "revenue", "expense"]).notNull(),
  parentAccountId: int("parent_account_id"),
  isActive: boolean("is_active").default(true).notNull(),
  isHeader: boolean("is_header").default(false).notNull(),
  level: int("level").default(1).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: int("created_by"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updated_by"),
});

export const accountTypes = mysqlTable("account_types", {
  id: int("id").autoincrement().primaryKey(),
  typeCode: varchar("type_code", { length: 50 }).notNull().unique(),
  typeName: varchar("type_name", { length: 100 }).notNull(),
  description: text("description"),
});

export const accountCategories = mysqlTable("account_categories", {
  id: int("id").autoincrement().primaryKey(),
  categoryCode: varchar("category_code", { length: 50 }).notNull().unique(),
  categoryName: varchar("category_name", { length: 100 }).notNull(),
  accountType: mysqlEnum("account_type", ["asset", "liability", "equity", "revenue", "expense"]).notNull(),
  description: text("description"),
});

export const accountBalances = mysqlTable("account_balances", {
  id: int("id").autoincrement().primaryKey(),
  accountId: int("account_id").notNull(),
  balanceDate: date("balance_date").notNull(),
  openingBalance: decimal("opening_balance", { precision: 15, scale: 2 }).default("0.00").notNull(),
  debitAmount: decimal("debit_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  creditAmount: decimal("credit_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  closingBalance: decimal("closing_balance", { precision: 15, scale: 2 }).default("0.00").notNull(),
  currency: varchar("currency", { length: 3 }).default("SAR").notNull(),
});

// ============================================
// المهمة 0.2: إدارة العملاء والموردين
// ============================================

export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  customerCode: varchar("customer_code", { length: 50 }).notNull().unique(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerType: mysqlEnum("customer_type", ["individual", "company", "government"]).default("individual").notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  mobile: varchar("mobile", { length: 20 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  region: varchar("region", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  taxNumber: varchar("tax_number", { length: 50 }),
  creditLimit: decimal("credit_limit", { precision: 15, scale: 2 }).default("0.00"),
  currentBalance: decimal("current_balance", { precision: 15, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const suppliers = mysqlTable("suppliers", {
  id: int("id").autoincrement().primaryKey(),
  supplierCode: varchar("supplier_code", { length: 50 }).notNull().unique(),
  supplierName: varchar("supplier_name", { length: 255 }).notNull(),
  supplierType: mysqlEnum("supplier_type", ["local", "international"]).default("local").notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  mobile: varchar("mobile", { length: 20 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  region: varchar("region", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  taxNumber: varchar("tax_number", { length: 50 }),
  currentBalance: decimal("current_balance", { precision: 15, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// المهمة 0.3: الفوترة والتحصيل
// ============================================

export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  invoiceDate: date("invoice_date").notNull(),
  dueDate: date("due_date").notNull(),
  customerId: int("customer_id").notNull(),
  invoiceType: mysqlEnum("invoice_type", ["sales", "service", "subscription"]).default("sales").notNull(),
  status: mysqlEnum("status", ["draft", "pending", "paid", "partially_paid", "overdue", "cancelled"]).default("draft").notNull(),
  subtotal: decimal("subtotal", { precision: 15, scale: 2 }).default("0.00").notNull(),
  taxAmount: decimal("tax_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  discountAmount: decimal("discount_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  paidAmount: decimal("paid_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  remainingAmount: decimal("remaining_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: int("created_by"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const invoiceItems = mysqlTable("invoice_items", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoice_id").notNull(),
  itemDescription: varchar("item_description", { length: 500 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1.00").notNull(),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).default("0.00").notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0.00").notNull(),
  discountRate: decimal("discount_rate", { precision: 5, scale: 2 }).default("0.00").notNull(),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
});

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  paymentNumber: varchar("payment_number", { length: 50 }).notNull().unique(),
  paymentDate: date("payment_date").notNull(),
  invoiceId: int("invoice_id").notNull(),
  customerId: int("customer_id").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  paymentMethod: mysqlEnum("payment_method", ["cash", "bank_transfer", "check", "credit_card", "online"]).default("cash").notNull(),
  referenceNumber: varchar("reference_number", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: int("created_by"),
});

// ============================================
// المهمة 0.4: المخزون والمشتريات
// ============================================

export const items = mysqlTable("items", {
  id: int("id").autoincrement().primaryKey(),
  itemCode: varchar("item_code", { length: 50 }).notNull().unique(),
  itemName: varchar("item_name", { length: 255 }).notNull(),
  itemNameEn: varchar("item_name_en", { length: 255 }),
  itemType: mysqlEnum("item_type", ["material", "spare_part", "tool", "consumable"]).default("material").notNull(),
  category: varchar("category", { length: 100 }),
  unit: varchar("unit", { length: 50 }).default("piece").notNull(),
  currentQuantity: decimal("current_quantity", { precision: 10, scale: 2 }).default("0.00").notNull(),
  minQuantity: decimal("min_quantity", { precision: 10, scale: 2 }).default("0.00").notNull(),
  maxQuantity: decimal("max_quantity", { precision: 10, scale: 2 }).default("0.00").notNull(),
  unitCost: decimal("unit_cost", { precision: 15, scale: 2 }).default("0.00").notNull(),
  sellingPrice: decimal("selling_price", { precision: 15, scale: 2 }).default("0.00").notNull(),
  location: varchar("location", { length: 100 }),
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const inventoryMovements = mysqlTable("inventory_movements", {
  id: int("id").autoincrement().primaryKey(),
  movementNumber: varchar("movement_number", { length: 50 }).notNull().unique(),
  movementDate: date("movement_date").notNull(),
  movementType: mysqlEnum("movement_type", ["in", "out", "adjustment", "transfer"]).notNull(),
  itemId: int("item_id").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitCost: decimal("unit_cost", { precision: 15, scale: 2 }).default("0.00").notNull(),
  totalCost: decimal("total_cost", { precision: 15, scale: 2 }).default("0.00").notNull(),
  fromLocation: varchar("from_location", { length: 100 }),
  toLocation: varchar("to_location", { length: 100 }),
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: int("reference_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: int("created_by"),
});

export const purchaseRequests = mysqlTable("purchase_requests", {
  id: int("id").autoincrement().primaryKey(),
  requestNumber: varchar("request_number", { length: 50 }).notNull().unique(),
  requestDate: date("request_date").notNull(),
  requiredDate: date("required_date"),
  status: mysqlEnum("status", ["draft", "pending", "approved", "rejected", "completed"]).default("draft").notNull(),
  requestedBy: int("requested_by").notNull(),
  approvedBy: int("approved_by"),
  approvalDate: date("approval_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const purchaseRequestItems = mysqlTable("purchase_request_items", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("request_id").notNull(),
  itemId: int("item_id").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  estimatedCost: decimal("estimated_cost", { precision: 15, scale: 2 }).default("0.00"),
  notes: text("notes"),
});

export const materialReceipts = mysqlTable("material_receipts", {
  id: int("id").autoincrement().primaryKey(),
  receiptNumber: varchar("receipt_number", { length: 50 }).notNull().unique(),
  receiptDate: date("receipt_date").notNull(),
  supplierId: int("supplier_id").notNull(),
  purchaseOrderNumber: varchar("purchase_order_number", { length: 50 }),
  status: mysqlEnum("status", ["pending", "completed", "cancelled"]).default("pending").notNull(),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  notes: text("notes"),
  receivedBy: int("received_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const materialReceiptItems = mysqlTable("material_receipt_items", {
  id: int("id").autoincrement().primaryKey(),
  receiptId: int("receipt_id").notNull(),
  itemId: int("item_id").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitCost: decimal("unit_cost", { precision: 15, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 15, scale: 2 }).notNull(),
});

// ============================================
// المهمة 0.6: محرك التسوية (القيود المحاسبية)
// ============================================

export const journalEntries = mysqlTable("journal_entries", {
  id: int("id").autoincrement().primaryKey(),
  entryNumber: varchar("entry_number", { length: 50 }).notNull().unique(),
  entryDate: date("entry_date").notNull(),
  entryType: mysqlEnum("entry_type", ["manual", "automatic", "adjustment", "closing"]).default("manual").notNull(),
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: int("reference_id"),
  description: text("description"),
  totalDebit: decimal("total_debit", { precision: 15, scale: 2 }).default("0.00").notNull(),
  totalCredit: decimal("total_credit", { precision: 15, scale: 2 }).default("0.00").notNull(),
  status: mysqlEnum("status", ["draft", "posted", "reversed"]).default("draft").notNull(),
  postedDate: date("posted_date"),
  postedBy: int("posted_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: int("created_by"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const journalEntryLines = mysqlTable("journal_entry_lines", {
  id: int("id").autoincrement().primaryKey(),
  entryId: int("entry_id").notNull(),
  lineNumber: int("line_number").notNull(),
  accountId: int("account_id").notNull(),
  description: text("description"),
  debitAmount: decimal("debit_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  creditAmount: decimal("credit_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  costCenter: varchar("cost_center", { length: 50 }),
});

export const bankReconciliations = mysqlTable("bank_reconciliations", {
  id: int("id").autoincrement().primaryKey(),
  reconciliationNumber: varchar("reconciliation_number", { length: 50 }).notNull().unique(),
  reconciliationDate: date("reconciliation_date").notNull(),
  bankAccountId: int("bank_account_id").notNull(),
  statementDate: date("statement_date").notNull(),
  statementBalance: decimal("statement_balance", { precision: 15, scale: 2 }).notNull(),
  bookBalance: decimal("book_balance", { precision: 15, scale: 2 }).notNull(),
  adjustedBalance: decimal("adjusted_balance", { precision: 15, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["in_progress", "completed", "approved"]).default("in_progress").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: int("created_by"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const generalLedger = mysqlTable("general_ledger", {
  id: int("id").autoincrement().primaryKey(),
  transactionDate: date("transaction_date").notNull(),
  accountId: int("account_id").notNull(),
  entryId: int("entry_id").notNull(),
  description: text("description"),
  debitAmount: decimal("debit_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  creditAmount: decimal("credit_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const chartOfAccountsRelations = relations(chartOfAccounts, ({ one, many }) => ({
  parent: one(chartOfAccounts, {
    fields: [chartOfAccounts.parentAccountId],
    references: [chartOfAccounts.id],
  }),
  children: many(chartOfAccounts),
  balances: many(accountBalances),
  journalLines: many(journalEntryLines),
  ledgerEntries: many(generalLedger),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  invoices: many(invoices),
  payments: many(payments),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  materialReceipts: many(materialReceipts),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  items: many(invoiceItems),
  payments: many(payments),
}));

export const itemsRelations = relations(items, ({ many }) => ({
  movements: many(inventoryMovements),
  purchaseRequestItems: many(purchaseRequestItems),
  receiptItems: many(materialReceiptItems),
}));

export const journalEntriesRelations = relations(journalEntries, ({ many }) => ({
  lines: many(journalEntryLines),
}));

// ============================================
// المرحلة 1: الأنظمة الأساسية
// ============================================

// جدول الأدوار
export const roles = mysqlTable("roles", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  createdBy: int("created_by"),
  updatedBy: int("updated_by"),
});

// جدول الصلاحيات
export const permissions = mysqlTable("permissions", {
  id: int("id").primaryKey().autoincrement(),
  roleId: int("role_id").notNull(),
  resource: varchar("resource", { length: 100 }).notNull(),
  action: mysqlEnum("action", ["create", "read", "update", "delete", "all"]).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: int("created_by"),
});

// جدول الاشتراكات
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").primaryKey().autoincrement(),
  customerId: int("customer_id").notNull(),
  planName: varchar("plan_name", { length: 100 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  billingCycle: mysqlEnum("billing_cycle", ["monthly", "quarterly", "yearly"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["active", "suspended", "cancelled", "expired"]).default("active"),
  autoRenew: boolean("auto_renew").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  createdBy: int("created_by"),
  updatedBy: int("updated_by"),
});

// جدول العدادات
export const meters = mysqlTable("meters", {
  id: int("id").primaryKey().autoincrement(),
  meterNumber: varchar("meter_number", { length: 50 }).notNull().unique(),
  customerId: int("customer_id").notNull(),
  meterType: mysqlEnum("meter_type", ["electric", "water", "gas"]).notNull(),
  location: text("location"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  installationDate: timestamp("installation_date"),
  lastReadingDate: timestamp("last_reading_date"),
  lastReading: decimal("last_reading", { precision: 10, scale: 2 }),
  status: mysqlEnum("status", ["active", "inactive", "faulty", "replaced"]).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  createdBy: int("created_by"),
  updatedBy: int("updated_by"),
});

// جدول أوامر العمل
export const workOrders = mysqlTable("work_orders", {
  id: int("id").primaryKey().autoincrement(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  customerId: int("customer_id"),
  meterId: int("meter_id"),
  orderType: mysqlEnum("order_type", ["installation", "maintenance", "repair", "reading", "disconnection"]).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  assignedTo: int("assigned_to"),
  description: text("description"),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  status: mysqlEnum("status", ["pending", "assigned", "in_progress", "completed", "cancelled"]).default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  createdBy: int("created_by"),
  updatedBy: int("updated_by"),
});

// جدول الأصول
export const assets = mysqlTable("assets", {
  id: int("id").primaryKey().autoincrement(),
  assetCode: varchar("asset_code", { length: 50 }).notNull().unique(),
  assetName: varchar("asset_name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  purchaseDate: timestamp("purchase_date"),
  purchasePrice: decimal("purchase_price", { precision: 12, scale: 2 }),
  currentValue: decimal("current_value", { precision: 12, scale: 2 }),
  location: varchar("location", { length: 255 }),
  status: mysqlEnum("status", ["active", "under_maintenance", "retired", "disposed"]).default("active"),
  warrantyExpiry: timestamp("warranty_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  createdBy: int("created_by"),
  updatedBy: int("updated_by"),
});

// جدول جداول الصيانة
export const maintenanceSchedules = mysqlTable("maintenance_schedules", {
  id: int("id").primaryKey().autoincrement(),
  assetId: int("asset_id").notNull(),
  maintenanceType: mysqlEnum("maintenance_type", ["preventive", "corrective", "predictive"]).notNull(),
  frequency: mysqlEnum("frequency", ["daily", "weekly", "monthly", "quarterly", "yearly"]).notNull(),
  lastMaintenanceDate: timestamp("last_maintenance_date"),
  nextMaintenanceDate: timestamp("next_maintenance_date").notNull(),
  assignedTo: int("assigned_to"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "overdue", "cancelled"]).default("scheduled"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  createdBy: int("created_by"),
  updatedBy: int("updated_by"),
});

// Relations للمرحلة 1
export const rolesRelations = relations(roles, ({ many }) => ({
  permissions: many(permissions),
}));

export const permissionsRelations = relations(permissions, ({ one }) => ({
  role: one(roles, {
    fields: [permissions.roleId],
    references: [roles.id],
  }),
}));

export const workOrdersRelations = relations(workOrders, ({ one }) => ({
  meter: one(meters, {
    fields: [workOrders.meterId],
    references: [meters.id],
  }),
}));

export const assetsRelations = relations(assets, ({ many }) => ({
  maintenanceSchedules: many(maintenanceSchedules),
}));

export const maintenanceSchedulesRelations = relations(maintenanceSchedules, ({ one }) => ({
  asset: one(assets, {
    fields: [maintenanceSchedules.assetId],
    references: [assets.id],
  }),
}));


// ============================================
// المرحلة 1 - النظام 1: إدارة المنصة المتقدمة
// ============================================

// جدول سجل التدقيق (Audit Log)
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id"),
  userName: varchar("user_name", { length: 255 }),
  action: mysqlEnum("action", ["create", "read", "update", "delete", "login", "logout", "export", "import", "approve", "reject"]).notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: int("entity_id"),
  entityName: varchar("entity_name", { length: 255 }),
  oldValues: text("old_values"),
  newValues: text("new_values"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  sessionId: varchar("session_id", { length: 255 }),
  module: varchar("module", { length: 100 }),
  description: text("description"),
  status: mysqlEnum("status", ["success", "failed", "pending"]).default("success"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// جدول الجلسات (Sessions)
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  deviceInfo: text("device_info"),
  isActive: boolean("is_active").default(true),
  lastActivity: timestamp("last_activity").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// جدول إعدادات المستخدم (User Settings)
export const userSettings = mysqlTable("user_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  language: varchar("language", { length: 10 }).default("ar"),
  timezone: varchar("timezone", { length: 50 }).default("Asia/Riyadh"),
  dateFormat: varchar("date_format", { length: 20 }).default("DD/MM/YYYY"),
  numberFormat: varchar("number_format", { length: 20 }).default("1,234.56"),
  currency: varchar("currency", { length: 3 }).default("SAR"),
  theme: mysqlEnum("theme", ["light", "dark", "system"]).default("light"),
  notifications: text("notifications"),
  dashboardLayout: text("dashboard_layout"),
  defaultPage: varchar("default_page", { length: 100 }).default("/dashboard"),
  itemsPerPage: int("items_per_page").default(25),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// جدول الإشعارات (Notifications)
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["info", "warning", "error", "success", "reminder"]).default("info"),
  category: varchar("category", { length: 50 }),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  actionUrl: varchar("action_url", { length: 500 }),
  actionLabel: varchar("action_label", { length: 100 }),
  metadata: text("metadata"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// جدول مجموعات الصلاحيات (Permission Groups)
export const permissionGroups = mysqlTable("permission_groups", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  description: text("description"),
  module: varchar("module", { length: 100 }).notNull(),
  sortOrder: int("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// جدول الصلاحيات المفصلة (Detailed Permissions)
export const detailedPermissions = mysqlTable("detailed_permissions", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("group_id").notNull(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  description: text("description"),
  resource: varchar("resource", { length: 100 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// جدول صلاحيات الأدوار (Role Permissions)
export const rolePermissions = mysqlTable("role_permissions", {
  id: int("id").autoincrement().primaryKey(),
  roleId: int("role_id").notNull(),
  permissionId: int("permission_id").notNull(),
  grantedBy: int("granted_by"),
  grantedAt: timestamp("granted_at").defaultNow().notNull(),
});

// جدول إعدادات لوحة التحكم (Dashboard Widgets)
export const dashboardWidgets = mysqlTable("dashboard_widgets", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  description: text("description"),
  widgetType: mysqlEnum("widget_type", ["stat", "chart", "table", "list", "calendar", "map"]).notNull(),
  dataSource: varchar("data_source", { length: 100 }).notNull(),
  defaultConfig: text("default_config"),
  minWidth: int("min_width").default(1),
  minHeight: int("min_height").default(1),
  maxWidth: int("max_width").default(4),
  maxHeight: int("max_height").default(4),
  requiredPermission: varchar("required_permission", { length: 100 }),
  isActive: boolean("is_active").default(true),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// جدول تخصيص لوحة التحكم للمستخدم (User Dashboard)
export const userDashboards = mysqlTable("user_dashboards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  widgetId: int("widget_id").notNull(),
  positionX: int("position_x").default(0),
  positionY: int("position_y").default(0),
  width: int("width").default(2),
  height: int("height").default(2),
  config: text("config"),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// جدول KPIs (مؤشرات الأداء الرئيسية)
export const kpiDefinitions = mysqlTable("kpi_definitions", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  calculationFormula: text("calculation_formula"),
  dataSource: varchar("data_source", { length: 100 }),
  unit: varchar("unit", { length: 20 }),
  targetValue: decimal("target_value", { precision: 15, scale: 2 }),
  warningThreshold: decimal("warning_threshold", { precision: 15, scale: 2 }),
  criticalThreshold: decimal("critical_threshold", { precision: 15, scale: 2 }),
  trendDirection: mysqlEnum("trend_direction", ["up_good", "down_good", "neutral"]).default("up_good"),
  refreshInterval: int("refresh_interval").default(3600),
  isActive: boolean("is_active").default(true),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// جدول قيم KPIs (سجل القيم)
export const kpiValues = mysqlTable("kpi_values", {
  id: int("id").autoincrement().primaryKey(),
  kpiId: int("kpi_id").notNull(),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  previousValue: decimal("previous_value", { precision: 15, scale: 2 }),
  changePercent: decimal("change_percent", { precision: 10, scale: 2 }),
  periodType: mysqlEnum("period_type", ["daily", "weekly", "monthly", "quarterly", "yearly"]).notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  metadata: text("metadata"),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
});

// جدول الأنشطة الأخيرة (Recent Activities)
export const recentActivities = mysqlTable("recent_activities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id"),
  activityType: varchar("activity_type", { length: 50 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: int("entity_id"),
  entityName: varchar("entity_name", { length: 255 }),
  description: text("description"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// Relations للجداول الجديدة
// ============================================

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const permissionGroupsRelations = relations(permissionGroups, ({ many }) => ({
  permissions: many(detailedPermissions),
}));

export const detailedPermissionsRelations = relations(detailedPermissions, ({ one, many }) => ({
  group: one(permissionGroups, {
    fields: [detailedPermissions.groupId],
    references: [permissionGroups.id],
  }),
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(detailedPermissions, {
    fields: [rolePermissions.permissionId],
    references: [detailedPermissions.id],
  }),
}));

export const dashboardWidgetsRelations = relations(dashboardWidgets, ({ many }) => ({
  userDashboards: many(userDashboards),
}));

export const userDashboardsRelations = relations(userDashboards, ({ one }) => ({
  user: one(users, {
    fields: [userDashboards.userId],
    references: [users.id],
  }),
  widget: one(dashboardWidgets, {
    fields: [userDashboards.widgetId],
    references: [dashboardWidgets.id],
  }),
}));

export const kpiDefinitionsRelations = relations(kpiDefinitions, ({ many }) => ({
  values: many(kpiValues),
}));

export const kpiValuesRelations = relations(kpiValues, ({ one }) => ({
  kpi: one(kpiDefinitions, {
    fields: [kpiValues.kpiId],
    references: [kpiDefinitions.id],
  }),
}));

export const recentActivitiesRelations = relations(recentActivities, ({ one }) => ({
  user: one(users, {
    fields: [recentActivities.userId],
    references: [users.id],
  }),
}));

// ============================================
// Types Export للجداول الجديدة
// ============================================

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

export type UserSetting = typeof userSettings.$inferSelect;
export type InsertUserSetting = typeof userSettings.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export type PermissionGroup = typeof permissionGroups.$inferSelect;
export type InsertPermissionGroup = typeof permissionGroups.$inferInsert;

export type DetailedPermission = typeof detailedPermissions.$inferSelect;
export type InsertDetailedPermission = typeof detailedPermissions.$inferInsert;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = typeof rolePermissions.$inferInsert;

export type DashboardWidget = typeof dashboardWidgets.$inferSelect;
export type InsertDashboardWidget = typeof dashboardWidgets.$inferInsert;

export type UserDashboard = typeof userDashboards.$inferSelect;
export type InsertUserDashboard = typeof userDashboards.$inferInsert;

export type KpiDefinition = typeof kpiDefinitions.$inferSelect;
export type InsertKpiDefinition = typeof kpiDefinitions.$inferInsert;

export type KpiValue = typeof kpiValues.$inferSelect;
export type InsertKpiValue = typeof kpiValues.$inferInsert;

export type RecentActivity = typeof recentActivities.$inferSelect;
export type InsertRecentActivity = typeof recentActivities.$inferInsert;
