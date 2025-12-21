import { pgTable, serial, text, timestamp, varchar, decimal, boolean, date, integer, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * PostgreSQL Schema for Power Station System
 * تم ترحيله من MySQL إلى PostgreSQL
 */

// ==================== Enums ====================
export const roleEnum = pgEnum("role", ["user", "admin", "developer"]);
export const invoiceTypeEnum = pgEnum("invoice_type", ["sales", "service", "subscription"]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["draft", "pending", "paid", "partially_paid", "overdue", "cancelled"]);
export const paymentMethodEnum = pgEnum("payment_method", ["cash", "bank_transfer", "check", "credit_card", "online"]);
export const itemTypeEnum = pgEnum("item_type", ["material", "spare_part", "tool", "consumable"]);
export const movementTypeEnum = pgEnum("movement_type", ["in", "out", "adjustment", "transfer"]);
export const purchaseStatusEnum = pgEnum("purchase_status", ["draft", "pending", "approved", "rejected", "completed"]);
export const journalStatusEnum = pgEnum("journal_status", ["draft", "posted", "cancelled"]);
export const workOrderStatusEnum = pgEnum("work_order_status", ["pending", "in_progress", "completed", "cancelled"]);
export const workOrderPriorityEnum = pgEnum("work_order_priority", ["low", "medium", "high", "urgent"]);
export const assetStatusEnum = pgEnum("asset_status", ["active", "inactive", "maintenance", "disposed"]);
export const maintenanceTypeEnum = pgEnum("maintenance_type", ["preventive", "corrective", "predictive"]);
export const maintenanceStatusEnum = pgEnum("maintenance_status", ["scheduled", "in_progress", "completed", "cancelled"]);
export const accountTypeEnum = pgEnum("account_type", ["asset", "liability", "equity", "revenue", "expense"]);
export const accountCategoryEnum = pgEnum("account_category", ["current", "non_current", "operating", "non_operating"]);

// ==================== Core Tables ====================

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ==================== Local Users (JWT Auth) ====================

export const localUsers = pgTable("local_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 100 }),
  role: roleEnum("role").default("user").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== Chart of Accounts ====================

export const chartOfAccounts = pgTable("chart_of_accounts", {
  id: serial("id").primaryKey(),
  accountCode: varchar("account_code", { length: 20 }).notNull().unique(),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  accountNameEn: varchar("account_name_en", { length: 255 }),
  accountType: accountTypeEnum("account_type").notNull(),
  parentId: integer("parent_id"),
  level: integer("level").default(1).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accountTypes = pgTable("account_types", {
  id: serial("id").primaryKey(),
  typeName: varchar("type_name", { length: 50 }).notNull().unique(),
  typeNameEn: varchar("type_name_en", { length: 50 }),
  description: text("description"),
});

export const accountCategories = pgTable("account_categories", {
  id: serial("id").primaryKey(),
  categoryName: varchar("category_name", { length: 100 }).notNull(),
  categoryNameEn: varchar("category_name_en", { length: 100 }),
  accountTypeId: integer("account_type_id").notNull(),
});

export const accountBalances = pgTable("account_balances", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull(),
  periodYear: integer("period_year").notNull(),
  periodMonth: integer("period_month").notNull(),
  openingBalance: decimal("opening_balance", { precision: 15, scale: 2 }).default("0.00").notNull(),
  debitTotal: decimal("debit_total", { precision: 15, scale: 2 }).default("0.00").notNull(),
  creditTotal: decimal("credit_total", { precision: 15, scale: 2 }).default("0.00").notNull(),
  closingBalance: decimal("closing_balance", { precision: 15, scale: 2 }).default("0.00").notNull(),
});

// ==================== Customers & Suppliers ====================

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  customerCode: varchar("customer_code", { length: 20 }).notNull().unique(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerNameEn: varchar("customer_name_en", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  taxNumber: varchar("tax_number", { length: 50 }),
  currentBalance: decimal("current_balance", { precision: 15, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  supplierCode: varchar("supplier_code", { length: 20 }).notNull().unique(),
  supplierName: varchar("supplier_name", { length: 255 }).notNull(),
  supplierNameEn: varchar("supplier_name_en", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  taxNumber: varchar("tax_number", { length: 50 }),
  currentBalance: decimal("current_balance", { precision: 15, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== Invoices & Payments ====================

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  invoiceDate: date("invoice_date").notNull(),
  dueDate: date("due_date").notNull(),
  customerId: integer("customer_id").notNull(),
  invoiceType: invoiceTypeEnum("invoice_type").default("sales").notNull(),
  status: invoiceStatusEnum("status").default("draft").notNull(),
  subtotal: decimal("subtotal", { precision: 15, scale: 2 }).default("0.00").notNull(),
  taxAmount: decimal("tax_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  discountAmount: decimal("discount_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  paidAmount: decimal("paid_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  remainingAmount: decimal("remaining_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  itemDescription: varchar("item_description", { length: 500 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1.00").notNull(),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).default("0.00").notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0.00").notNull(),
  discountRate: decimal("discount_rate", { precision: 5, scale: 2 }).default("0.00").notNull(),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  paymentNumber: varchar("payment_number", { length: 50 }).notNull().unique(),
  paymentDate: date("payment_date").notNull(),
  invoiceId: integer("invoice_id").notNull(),
  customerId: integer("customer_id").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").default("cash").notNull(),
  referenceNumber: varchar("reference_number", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by"),
});

// ==================== Inventory ====================

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  itemCode: varchar("item_code", { length: 50 }).notNull().unique(),
  itemName: varchar("item_name", { length: 255 }).notNull(),
  itemNameEn: varchar("item_name_en", { length: 255 }),
  itemType: itemTypeEnum("item_type").default("material").notNull(),
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const inventoryMovements = pgTable("inventory_movements", {
  id: serial("id").primaryKey(),
  movementNumber: varchar("movement_number", { length: 50 }).notNull().unique(),
  movementDate: date("movement_date").notNull(),
  movementType: movementTypeEnum("movement_type").notNull(),
  itemId: integer("item_id").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitCost: decimal("unit_cost", { precision: 15, scale: 2 }).default("0.00").notNull(),
  totalCost: decimal("total_cost", { precision: 15, scale: 2 }).default("0.00").notNull(),
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: integer("reference_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by"),
});

// ==================== Purchases ====================

export const purchaseRequests = pgTable("purchase_requests", {
  id: serial("id").primaryKey(),
  requestNumber: varchar("request_number", { length: 50 }).notNull().unique(),
  requestDate: date("request_date").notNull(),
  supplierId: integer("supplier_id"),
  status: purchaseStatusEnum("status").default("draft").notNull(),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by"),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
});

export const purchaseRequestItems = pgTable("purchase_request_items", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull(),
  itemId: integer("item_id").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).default("0.00").notNull(),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
});

// ==================== Journal Entries ====================

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  entryNumber: varchar("entry_number", { length: 50 }).notNull().unique(),
  entryDate: date("entry_date").notNull(),
  description: text("description"),
  status: journalStatusEnum("status").default("draft").notNull(),
  totalDebit: decimal("total_debit", { precision: 15, scale: 2 }).default("0.00").notNull(),
  totalCredit: decimal("total_credit", { precision: 15, scale: 2 }).default("0.00").notNull(),
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: integer("reference_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by"),
  postedAt: timestamp("posted_at"),
  postedBy: integer("posted_by"),
});

export const journalEntryLines = pgTable("journal_entry_lines", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").notNull(),
  accountId: integer("account_id").notNull(),
  debitAmount: decimal("debit_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  creditAmount: decimal("credit_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  description: text("description"),
});

export const generalLedger = pgTable("general_ledger", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull(),
  entryId: integer("entry_id").notNull(),
  entryDate: date("entry_date").notNull(),
  debitAmount: decimal("debit_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  creditAmount: decimal("credit_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0.00").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== Roles & Permissions ====================

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  roleName: varchar("role_name", { length: 50 }).notNull().unique(),
  roleNameEn: varchar("role_name_en", { length: 50 }),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  permissionName: varchar("permission_name", { length: 100 }).notNull().unique(),
  permissionNameEn: varchar("permission_name_en", { length: 100 }),
  module: varchar("module", { length: 50 }),
  description: text("description"),
});

export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").notNull(),
  permissionId: integer("permission_id").notNull(),
});

// ==================== Subscriptions & Meters ====================

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  subscriptionNumber: varchar("subscription_number", { length: 50 }).notNull().unique(),
  customerId: integer("customer_id").notNull(),
  meterId: integer("meter_id"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  monthlyFee: decimal("monthly_fee", { precision: 15, scale: 2 }).default("0.00").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const meters = pgTable("meters", {
  id: serial("id").primaryKey(),
  meterNumber: varchar("meter_number", { length: 50 }).notNull().unique(),
  meterType: varchar("meter_type", { length: 50 }),
  location: text("location"),
  installationDate: date("installation_date"),
  lastReadingDate: date("last_reading_date"),
  lastReadingValue: decimal("last_reading_value", { precision: 15, scale: 2 }).default("0.00"),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== Work Orders ====================

export const workOrders = pgTable("work_orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  orderDate: date("order_date").notNull(),
  customerId: integer("customer_id"),
  assetId: integer("asset_id"),
  description: text("description"),
  status: workOrderStatusEnum("status").default("pending").notNull(),
  priority: workOrderPriorityEnum("priority").default("medium").notNull(),
  assignedTo: integer("assigned_to"),
  scheduledDate: date("scheduled_date"),
  completedDate: date("completed_date"),
  estimatedCost: decimal("estimated_cost", { precision: 15, scale: 2 }).default("0.00"),
  actualCost: decimal("actual_cost", { precision: 15, scale: 2 }).default("0.00"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== Assets ====================

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  assetCode: varchar("asset_code", { length: 50 }).notNull().unique(),
  assetName: varchar("asset_name", { length: 255 }).notNull(),
  assetNameEn: varchar("asset_name_en", { length: 255 }),
  category: varchar("category", { length: 100 }),
  location: text("location"),
  purchaseDate: date("purchase_date"),
  purchaseCost: decimal("purchase_cost", { precision: 15, scale: 2 }).default("0.00"),
  currentValue: decimal("current_value", { precision: 15, scale: 2 }).default("0.00"),
  status: assetStatusEnum("status").default("active").notNull(),
  warrantyExpiry: date("warranty_expiry"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== Maintenance ====================

export const maintenanceSchedules = pgTable("maintenance_schedules", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").notNull(),
  maintenanceType: maintenanceTypeEnum("maintenance_type").default("preventive").notNull(),
  description: text("description"),
  scheduledDate: date("scheduled_date").notNull(),
  completedDate: date("completed_date"),
  status: maintenanceStatusEnum("status").default("scheduled").notNull(),
  assignedTo: integer("assigned_to"),
  estimatedCost: decimal("estimated_cost", { precision: 15, scale: 2 }).default("0.00"),
  actualCost: decimal("actual_cost", { precision: 15, scale: 2 }).default("0.00"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== Audit & Sessions ====================

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  action: varchar("action", { length: 50 }).notNull(),
  tableName: varchar("table_name", { length: 100 }),
  recordId: integer("record_id"),
  oldValues: text("old_values"),
  newValues: text("new_values"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  token: varchar("token", { length: 500 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== HR Tables ====================

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  employeeCode: varchar("employee_code", { length: 20 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  department: varchar("department", { length: 100 }),
  position: varchar("position", { length: 100 }),
  hireDate: date("hire_date"),
  salary: decimal("salary", { precision: 15, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true).notNull(),
  userId: integer("user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  date: date("date").notNull(),
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  status: varchar("status", { length: 20 }).default("present"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== Notifications ====================

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  type: varchar("type", { length: 50 }).default("info"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== Warehouses ====================

export const warehouses = pgTable("warehouses", {
  id: serial("id").primaryKey(),
  warehouseCode: varchar("warehouse_code", { length: 20 }).notNull().unique(),
  warehouseName: varchar("warehouse_name", { length: 255 }).notNull(),
  location: text("location"),
  managerId: integer("manager_id"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== Tickets ====================

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  ticketNumber: varchar("ticket_number", { length: 50 }).notNull().unique(),
  customerId: integer("customer_id"),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("open"),
  priority: varchar("priority", { length: 20 }).default("medium"),
  assignedTo: integer("assigned_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at"),
});


// ==================== Additional Tables (Missing from original migration) ====================

// Invoice Templates
export const invoiceTemplates = pgTable("invoice_templates", {
  id: serial("id").primaryKey(),
  templateName: varchar("template_name", { length: 100 }).notNull(),
  templateContent: text("template_content"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Credit Notes
export const creditNotes = pgTable("credit_notes", {
  id: serial("id").primaryKey(),
  creditNoteNumber: varchar("credit_note_number", { length: 50 }).notNull().unique(),
  invoiceId: integer("invoice_id"),
  customerId: integer("customer_id").notNull(),
  creditDate: date("credit_date").notNull(),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  reason: text("reason"),
  status: varchar("status", { length: 20 }).default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by"),
});

export const creditNoteItems = pgTable("credit_note_items", {
  id: serial("id").primaryKey(),
  creditNoteId: integer("credit_note_id").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1.00").notNull(),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).default("0.00").notNull(),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
});

// Payment Gateways & Wallets
export const paymentGateways = pgTable("payment_gateways", {
  id: serial("id").primaryKey(),
  gatewayName: varchar("gateway_name", { length: 100 }).notNull(),
  gatewayType: varchar("gateway_type", { length: 50 }),
  apiKey: varchar("api_key", { length: 255 }),
  secretKey: varchar("secret_key", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customerWallets = pgTable("customer_wallets", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0.00").notNull(),
  currency: varchar("currency", { length: 3 }).default("SAR"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull(),
  transactionType: varchar("transaction_type", { length: 20 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  balanceBefore: decimal("balance_before", { precision: 15, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 15, scale: 2 }).notNull(),
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: integer("reference_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Auto Collection
export const autoCollectionRules = pgTable("auto_collection_rules", {
  id: serial("id").primaryKey(),
  ruleName: varchar("rule_name", { length: 100 }).notNull(),
  daysOverdue: integer("days_overdue").default(0),
  actionType: varchar("action_type", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const autoCollectionLogs = pgTable("auto_collection_logs", {
  id: serial("id").primaryKey(),
  ruleId: integer("rule_id").notNull(),
  invoiceId: integer("invoice_id").notNull(),
  actionTaken: varchar("action_taken", { length: 100 }),
  result: text("result"),
  executedAt: timestamp("executed_at").defaultNow().notNull(),
});

// Inventory Advanced
export const inventoryAlerts = pgTable("inventory_alerts", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  alertType: varchar("alert_type", { length: 50 }).notNull(),
  threshold: decimal("threshold", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  lastTriggered: timestamp("last_triggered"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inventoryForecasts = pgTable("inventory_forecasts", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  forecastDate: date("forecast_date").notNull(),
  forecastQuantity: decimal("forecast_quantity", { precision: 10, scale: 2 }).notNull(),
  actualQuantity: decimal("actual_quantity", { precision: 10, scale: 2 }),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inventoryLots = pgTable("inventory_lots", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  lotNumber: varchar("lot_number", { length: 50 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  expiryDate: date("expiry_date"),
  manufacturingDate: date("manufacturing_date"),
  costPerUnit: decimal("cost_per_unit", { precision: 15, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Material Receipts
export const materialReceipts = pgTable("material_receipts", {
  id: serial("id").primaryKey(),
  receiptNumber: varchar("receipt_number", { length: 50 }).notNull().unique(),
  receiptDate: date("receipt_date").notNull(),
  supplierId: integer("supplier_id"),
  purchaseRequestId: integer("purchase_request_id"),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default("0.00"),
  status: varchar("status", { length: 20 }).default("draft"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by"),
});

export const materialReceiptItems = pgTable("material_receipt_items", {
  id: serial("id").primaryKey(),
  receiptId: integer("receipt_id").notNull(),
  itemId: integer("item_id").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitCost: decimal("unit_cost", { precision: 15, scale: 2 }).default("0.00"),
  totalCost: decimal("total_cost", { precision: 15, scale: 2 }).default("0.00"),
});

// Reports & KPIs
export const customReportDefinitions = pgTable("custom_report_definitions", {
  id: serial("id").primaryKey(),
  reportName: varchar("report_name", { length: 100 }).notNull(),
  reportType: varchar("report_type", { length: 50 }),
  queryDefinition: text("query_definition"),
  parameters: text("parameters"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by"),
});

export const reportExecutionLogs = pgTable("report_execution_logs", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").notNull(),
  executedBy: integer("executed_by"),
  executedAt: timestamp("executed_at").defaultNow().notNull(),
  parameters: text("parameters"),
  executionTime: integer("execution_time"),
  status: varchar("status", { length: 20 }),
  errorMessage: text("error_message"),
});

export const financialForecasts = pgTable("financial_forecasts", {
  id: serial("id").primaryKey(),
  forecastType: varchar("forecast_type", { length: 50 }).notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  forecastAmount: decimal("forecast_amount", { precision: 15, scale: 2 }).notNull(),
  actualAmount: decimal("actual_amount", { precision: 15, scale: 2 }),
  variance: decimal("variance", { precision: 15, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const kpiDefinitions = pgTable("kpi_definitions", {
  id: serial("id").primaryKey(),
  kpiName: varchar("kpi_name", { length: 100 }).notNull(),
  kpiCode: varchar("kpi_code", { length: 50 }).notNull().unique(),
  description: text("description"),
  formula: text("formula"),
  unit: varchar("unit", { length: 20 }),
  targetValue: decimal("target_value", { precision: 15, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const kpiValues = pgTable("kpi_values", {
  id: serial("id").primaryKey(),
  kpiId: integer("kpi_id").notNull(),
  periodDate: date("period_date").notNull(),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  targetValue: decimal("target_value", { precision: 15, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Debt Management
export const debtRecords = pgTable("debt_records", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  invoiceId: integer("invoice_id"),
  originalAmount: decimal("original_amount", { precision: 15, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 15, scale: 2 }).notNull(),
  dueDate: date("due_date").notNull(),
  status: varchar("status", { length: 20 }).default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const paymentPlans = pgTable("payment_plans", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  debtRecordId: integer("debt_record_id"),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  numberOfInstallments: integer("number_of_installments").notNull(),
  startDate: date("start_date").notNull(),
  status: varchar("status", { length: 20 }).default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const paymentPlanInstallments = pgTable("payment_plan_installments", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").notNull(),
  installmentNumber: integer("installment_number").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  dueDate: date("due_date").notNull(),
  paidDate: date("paid_date"),
  status: varchar("status", { length: 20 }).default("pending"),
});

export const penaltiesAndInterests = pgTable("penalties_and_interests", {
  id: serial("id").primaryKey(),
  debtRecordId: integer("debt_record_id").notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  appliedDate: date("applied_date").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Documentation
export const systemDocuments = pgTable("system_documents", {
  id: serial("id").primaryKey(),
  documentTitle: varchar("document_title", { length: 255 }).notNull(),
  documentType: varchar("document_type", { length: 50 }),
  content: text("content"),
  version: varchar("version", { length: 20 }),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: integer("created_by"),
});

export const apiDocumentation = pgTable("api_documentation", {
  id: serial("id").primaryKey(),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  description: text("description"),
  requestBody: text("request_body"),
  responseBody: text("response_body"),
  examples: text("examples"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Testing
export const testSuites = pgTable("test_suites", {
  id: serial("id").primaryKey(),
  suiteName: varchar("suite_name", { length: 100 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const testCases = pgTable("test_cases", {
  id: serial("id").primaryKey(),
  suiteId: integer("suite_id").notNull(),
  caseName: varchar("case_name", { length: 255 }).notNull(),
  description: text("description"),
  expectedResult: text("expected_result"),
  priority: varchar("priority", { length: 20 }).default("medium"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const testRuns = pgTable("test_runs", {
  id: serial("id").primaryKey(),
  suiteId: integer("suite_id").notNull(),
  runDate: timestamp("run_date").defaultNow().notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  totalCases: integer("total_cases").default(0),
  passedCases: integer("passed_cases").default(0),
  failedCases: integer("failed_cases").default(0),
  executedBy: integer("executed_by"),
});

export const testResults = pgTable("test_results", {
  id: serial("id").primaryKey(),
  runId: integer("run_id").notNull(),
  caseId: integer("case_id").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  actualResult: text("actual_result"),
  errorMessage: text("error_message"),
  executionTime: integer("execution_time"),
  executedAt: timestamp("executed_at").defaultNow().notNull(),
});

export const testCoverage = pgTable("test_coverage", {
  id: serial("id").primaryKey(),
  module: varchar("module", { length: 100 }).notNull(),
  totalLines: integer("total_lines").default(0),
  coveredLines: integer("covered_lines").default(0),
  coveragePercent: decimal("coverage_percent", { precision: 5, scale: 2 }),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Discounts
export const discountRules = pgTable("discount_rules", {
  id: serial("id").primaryKey(),
  ruleName: varchar("rule_name", { length: 100 }).notNull(),
  discountType: varchar("discount_type", { length: 20 }).notNull(),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minAmount: decimal("min_amount", { precision: 15, scale: 2 }),
  maxAmount: decimal("max_amount", { precision: 15, scale: 2 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customerDiscounts = pgTable("customer_discounts", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  discountRuleId: integer("discount_rule_id").notNull(),
  customValue: decimal("custom_value", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const appliedDiscounts = pgTable("applied_discounts", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  discountRuleId: integer("discount_rule_id"),
  discountAmount: decimal("discount_amount", { precision: 15, scale: 2 }).notNull(),
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
});

// Field Operations
export const fieldTeams = pgTable("field_teams", {
  id: serial("id").primaryKey(),
  teamName: varchar("team_name", { length: 100 }).notNull(),
  leaderId: integer("leader_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fieldTasks = pgTable("field_tasks", {
  id: serial("id").primaryKey(),
  taskNumber: varchar("task_number", { length: 50 }).notNull().unique(),
  teamId: integer("team_id"),
  customerId: integer("customer_id"),
  taskType: varchar("task_type", { length: 50 }),
  description: text("description"),
  scheduledDate: date("scheduled_date"),
  completedDate: date("completed_date"),
  status: varchar("status", { length: 20 }).default("pending"),
  priority: varchar("priority", { length: 20 }).default("medium"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fieldTaskLogs = pgTable("field_task_logs", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  notes: text("notes"),
  performedBy: integer("performed_by"),
  performedAt: timestamp("performed_at").defaultNow().notNull(),
});

export const meterReadings = pgTable("meter_readings", {
  id: serial("id").primaryKey(),
  meterId: integer("meter_id").notNull(),
  readingDate: date("reading_date").notNull(),
  readingValue: decimal("reading_value", { precision: 15, scale: 2 }).notNull(),
  previousValue: decimal("previous_value", { precision: 15, scale: 2 }),
  consumption: decimal("consumption", { precision: 15, scale: 2 }),
  readBy: integer("read_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Inventory Counts
export const inventoryCounts = pgTable("inventory_counts", {
  id: serial("id").primaryKey(),
  countNumber: varchar("count_number", { length: 50 }).notNull().unique(),
  countDate: date("count_date").notNull(),
  warehouseId: integer("warehouse_id"),
  status: varchar("status", { length: 20 }).default("draft"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by"),
  completedAt: timestamp("completed_at"),
});

export const inventoryCountItems = pgTable("inventory_count_items", {
  id: serial("id").primaryKey(),
  countId: integer("count_id").notNull(),
  itemId: integer("item_id").notNull(),
  systemQuantity: decimal("system_quantity", { precision: 10, scale: 2 }).notNull(),
  countedQuantity: decimal("counted_quantity", { precision: 10, scale: 2 }),
  variance: decimal("variance", { precision: 10, scale: 2 }),
  notes: text("notes"),
});

// Customer Portal
export const customerPortalAccess = pgTable("customer_portal_access", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customerSupportTickets = pgTable("customer_support_tickets", {
  id: serial("id").primaryKey(),
  ticketNumber: varchar("ticket_number", { length: 50 }).notNull().unique(),
  customerId: integer("customer_id").notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("open"),
  priority: varchar("priority", { length: 20 }).default("medium"),
  assignedTo: integer("assigned_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at"),
});

export const ticketComments = pgTable("ticket_comments", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull(),
  commentText: text("comment_text").notNull(),
  isInternal: boolean("is_internal").default(false),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


// ==================== Warehouse Extended Tables ====================

export const warehouseLocations = pgTable("warehouse_locations", {
  id: serial("id").primaryKey(),
  warehouseId: integer("warehouse_id").notNull(),
  locationCode: varchar("location_code", { length: 50 }).notNull(),
  locationName: varchar("location_name", { length: 100 }),
  locationType: varchar("location_type", { length: 50 }),
  capacity: decimal("capacity", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const warehouseStock = pgTable("warehouse_stock", {
  id: serial("id").primaryKey(),
  warehouseId: integer("warehouse_id").notNull(),
  itemId: integer("item_id").notNull(),
  locationId: integer("location_id"),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("0.00").notNull(),
  reservedQuantity: decimal("reserved_quantity", { precision: 10, scale: 2 }).default("0.00"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const stockTransfers = pgTable("stock_transfers", {
  id: serial("id").primaryKey(),
  transferNumber: varchar("transfer_number", { length: 50 }).notNull().unique(),
  fromWarehouseId: integer("from_warehouse_id").notNull(),
  toWarehouseId: integer("to_warehouse_id").notNull(),
  transferDate: date("transfer_date").notNull(),
  status: varchar("status", { length: 20 }).default("draft"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by"),
  completedAt: timestamp("completed_at"),
});

export const stockTransferItems = pgTable("stock_transfer_items", {
  id: serial("id").primaryKey(),
  transferId: integer("transfer_id").notNull(),
  itemId: integer("item_id").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
});


// ==================== Recurring Invoices ====================

export const recurringInvoices = pgTable("recurring_invoices", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  templateName: varchar("template_name", { length: 100 }),
  frequency: varchar("frequency", { length: 20 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  nextInvoiceDate: date("next_invoice_date"),
  subtotal: decimal("subtotal", { precision: 15, scale: 2 }).default("0.00").notNull(),
  taxAmount: decimal("tax_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  status: varchar("status", { length: 20 }).default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const recurringInvoiceItems = pgTable("recurring_invoice_items", {
  id: serial("id").primaryKey(),
  recurringInvoiceId: integer("recurring_invoice_id").notNull(),
  itemDescription: varchar("item_description", { length: 500 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1.00").notNull(),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).default("0.00").notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0.00").notNull(),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
});

export const recurringInvoiceHistory = pgTable("recurring_invoice_history", {
  id: serial("id").primaryKey(),
  recurringInvoiceId: integer("recurring_invoice_id").notNull(),
  generatedInvoiceId: integer("generated_invoice_id").notNull(),
  generatedDate: date("generated_date").notNull(),
  status: varchar("status", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


// ==================== Discounts Extended ====================

export const discountRuleItems = pgTable("discount_rule_items", {
  id: serial("id").primaryKey(),
  ruleId: integer("rule_id").notNull(),
  itemId: integer("item_id"),
  categoryId: integer("category_id"),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  promotionName: varchar("promotion_name", { length: 100 }).notNull(),
  description: text("description"),
  discountType: varchar("discount_type", { length: 20 }).notNull(),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  minPurchase: decimal("min_purchase", { precision: 15, scale: 2 }),
  maxDiscount: decimal("max_discount", { precision: 15, scale: 2 }),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const couponCodes = pgTable("coupon_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  promotionId: integer("promotion_id"),
  discountType: varchar("discount_type", { length: 20 }).notNull(),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const couponUsage = pgTable("coupon_usage", {
  id: serial("id").primaryKey(),
  couponId: integer("coupon_id").notNull(),
  customerId: integer("customer_id").notNull(),
  invoiceId: integer("invoice_id"),
  discountAmount: decimal("discount_amount", { precision: 15, scale: 2 }).notNull(),
  usedAt: timestamp("used_at").defaultNow().notNull(),
});


// ==================== Inventory Adjustments ====================

export const inventoryAdjustments = pgTable("inventory_adjustments", {
  id: serial("id").primaryKey(),
  adjustmentNumber: varchar("adjustment_number", { length: 50 }).notNull().unique(),
  adjustmentDate: date("adjustment_date").notNull(),
  warehouseId: integer("warehouse_id"),
  adjustmentType: varchar("adjustment_type", { length: 50 }),
  reason: text("reason"),
  status: varchar("status", { length: 20 }).default("draft"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by"),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
});

export const inventoryAdjustmentItems = pgTable("inventory_adjustment_items", {
  id: serial("id").primaryKey(),
  adjustmentId: integer("adjustment_id").notNull(),
  itemId: integer("item_id").notNull(),
  systemQuantity: decimal("system_quantity", { precision: 10, scale: 2 }).notNull(),
  adjustedQuantity: decimal("adjusted_quantity", { precision: 10, scale: 2 }).notNull(),
  variance: decimal("variance", { precision: 10, scale: 2 }),
  unitCost: decimal("unit_cost", { precision: 15, scale: 2 }),
  notes: text("notes"),
});


// ==================== Tickets Extended ====================

export const ticketHistory = pgTable("ticket_history", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  changedBy: integer("changed_by"),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
});

export const ticketCategories = pgTable("ticket_categories", {
  id: serial("id").primaryKey(),
  categoryName: varchar("category_name", { length: 100 }).notNull(),
  categoryNameEn: varchar("category_name_en", { length: 100 }),
  description: text("description"),
  parentId: integer("parent_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


// ==================== Customer Portal Extended ====================

export const customerPortalUsers = pgTable("customer_portal_users", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  verificationToken: varchar("verification_token", { length: 255 }),
  resetToken: varchar("reset_token", { length: 255 }),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customerPortalSessions = pgTable("customer_portal_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customerNotifications = pgTable("customer_notifications", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  notificationType: varchar("notification_type", { length: 50 }),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customerFeedback = pgTable("customer_feedback", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  feedbackType: varchar("feedback_type", { length: 50 }),
  subject: varchar("subject", { length: 255 }),
  message: text("message"),
  rating: integer("rating"),
  status: varchar("status", { length: 20 }).default("pending"),
  response: text("response"),
  respondedBy: integer("responded_by"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


// ==================== Field Operations Extended ====================

export const fieldTeamMembers = pgTable("field_team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull(),
  employeeId: integer("employee_id").notNull(),
  role: varchar("role", { length: 50 }),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  leftAt: timestamp("left_at"),
  isActive: boolean("is_active").default(true),
});

export const fieldSchedules = pgTable("field_schedules", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull(),
  scheduleDate: date("schedule_date").notNull(),
  startTime: varchar("start_time", { length: 10 }),
  endTime: varchar("end_time", { length: 10 }),
  area: varchar("area", { length: 100 }),
  notes: text("notes"),
  status: varchar("status", { length: 20 }).default("scheduled"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


// ==================== Security & Privacy ====================

export const privacyConsents = pgTable("privacy_consents", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  consentType: varchar("consent_type", { length: 50 }).notNull(),
  isConsented: boolean("is_consented").default(false),
  consentedAt: timestamp("consented_at"),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const privacyRequests = pgTable("privacy_requests", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  requestType: varchar("request_type", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
});

export const securityPolicies = pgTable("security_policies", {
  id: serial("id").primaryKey(),
  policyName: varchar("policy_name", { length: 100 }).notNull(),
  policyType: varchar("policy_type", { length: 50 }),
  description: text("description"),
  rules: text("rules"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const securityAssessments = pgTable("security_assessments", {
  id: serial("id").primaryKey(),
  assessmentName: varchar("assessment_name", { length: 100 }).notNull(),
  assessmentDate: date("assessment_date").notNull(),
  assessor: varchar("assessor", { length: 100 }),
  status: varchar("status", { length: 20 }).default("pending"),
  findings: text("findings"),
  recommendations: text("recommendations"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const securityFindings = pgTable("security_findings", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id").notNull(),
  findingType: varchar("finding_type", { length: 50 }),
  severity: varchar("severity", { length: 20 }),
  description: text("description"),
  remediation: text("remediation"),
  status: varchar("status", { length: 20 }).default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== System Management ====================

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  settingKey: varchar("setting_key", { length: 100 }).notNull().unique(),
  settingValue: text("setting_value"),
  settingType: varchar("setting_type", { length: 50 }),
  description: text("description"),
  isEditable: boolean("is_editable").default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: integer("updated_by"),
});

export const settingsHistory = pgTable("settings_history", {
  id: serial("id").primaryKey(),
  settingId: integer("setting_id").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  changedBy: integer("changed_by"),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
});

export const systemLogs = pgTable("system_logs", {
  id: serial("id").primaryKey(),
  logLevel: varchar("log_level", { length: 20 }).notNull(),
  source: varchar("source", { length: 100 }),
  message: text("message"),
  details: text("details"),
  userId: integer("user_id"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const systemAlerts = pgTable("system_alerts", {
  id: serial("id").primaryKey(),
  alertType: varchar("alert_type", { length: 50 }).notNull(),
  severity: varchar("severity", { length: 20 }),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  isAcknowledged: boolean("is_acknowledged").default(false),
  acknowledgedBy: integer("acknowledged_by"),
  acknowledgedAt: timestamp("acknowledged_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const systemUpdates = pgTable("system_updates", {
  id: serial("id").primaryKey(),
  version: varchar("version", { length: 50 }).notNull(),
  releaseDate: date("release_date"),
  description: text("description"),
  changeLog: text("change_log"),
  status: varchar("status", { length: 20 }).default("pending"),
  installedAt: timestamp("installed_at"),
  installedBy: integer("installed_by"),
});

export const systemHealthChecks = pgTable("system_health_checks", {
  id: serial("id").primaryKey(),
  checkName: varchar("check_name", { length: 100 }).notNull(),
  checkType: varchar("check_type", { length: 50 }),
  status: varchar("status", { length: 20 }),
  responseTime: integer("response_time"),
  details: text("details"),
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
});

export const healthCheckResults = pgTable("health_check_results", {
  id: serial("id").primaryKey(),
  checkId: integer("check_id").notNull(),
  status: varchar("status", { length: 20 }),
  value: decimal("value", { precision: 15, scale: 2 }),
  threshold: decimal("threshold", { precision: 15, scale: 2 }),
  message: text("message"),
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
});

// ==================== Notifications ====================

export const notificationTemplates = pgTable("notification_templates", {
  id: serial("id").primaryKey(),
  templateName: varchar("template_name", { length: 100 }).notNull(),
  templateType: varchar("template_type", { length: 50 }),
  subject: varchar("subject", { length: 255 }),
  bodyTemplate: text("body_template"),
  variables: text("variables"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationLogs = pgTable("notification_logs", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id"),
  recipientType: varchar("recipient_type", { length: 50 }),
  recipientId: integer("recipient_id"),
  channel: varchar("channel", { length: 20 }),
  subject: varchar("subject", { length: 255 }),
  body: text("body"),
  status: varchar("status", { length: 20 }).default("pending"),
  sentAt: timestamp("sent_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const alertRules = pgTable("alert_rules", {
  id: serial("id").primaryKey(),
  ruleName: varchar("rule_name", { length: 100 }).notNull(),
  ruleType: varchar("rule_type", { length: 50 }),
  conditions: text("conditions"),
  actions: text("actions"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== HR & Payroll ====================

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  departmentName: varchar("department_name", { length: 100 }).notNull(),
  departmentCode: varchar("department_code", { length: 20 }),
  parentId: integer("parent_id"),
  managerId: integer("manager_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  positionName: varchar("position_name", { length: 100 }).notNull(),
  positionCode: varchar("position_code", { length: 20 }),
  departmentId: integer("department_id"),
  minSalary: decimal("min_salary", { precision: 15, scale: 2 }),
  maxSalary: decimal("max_salary", { precision: 15, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leaveTypes = pgTable("leave_types", {
  id: serial("id").primaryKey(),
  typeName: varchar("type_name", { length: 100 }).notNull(),
  typeCode: varchar("type_code", { length: 20 }),
  defaultDays: integer("default_days"),
  isPaid: boolean("is_paid").default(true),
  isActive: boolean("is_active").default(true),
});

export const leaves = pgTable("leaves", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  leaveTypeId: integer("leave_type_id").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  totalDays: decimal("total_days", { precision: 5, scale: 2 }),
  reason: text("reason"),
  status: varchar("status", { length: 20 }).default("pending"),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leaveBalances = pgTable("leave_balances", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  leaveTypeId: integer("leave_type_id").notNull(),
  year: integer("year").notNull(),
  totalDays: decimal("total_days", { precision: 5, scale: 2 }).default("0"),
  usedDays: decimal("used_days", { precision: 5, scale: 2 }).default("0"),
  remainingDays: decimal("remaining_days", { precision: 5, scale: 2 }).default("0"),
});

export const holidays = pgTable("holidays", {
  id: serial("id").primaryKey(),
  holidayName: varchar("holiday_name", { length: 100 }).notNull(),
  holidayDate: date("holiday_date").notNull(),
  isRecurring: boolean("is_recurring").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workShifts = pgTable("work_shifts", {
  id: serial("id").primaryKey(),
  shiftName: varchar("shift_name", { length: 100 }).notNull(),
  startTime: varchar("start_time", { length: 10 }),
  endTime: varchar("end_time", { length: 10 }),
  breakDuration: integer("break_duration"),
  isActive: boolean("is_active").default(true),
});

export const employeeSchedules = pgTable("employee_schedules", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  shiftId: integer("shift_id").notNull(),
  scheduleDate: date("schedule_date").notNull(),
  status: varchar("status", { length: 20 }).default("scheduled"),
});

export const payrollPeriods = pgTable("payroll_periods", {
  id: serial("id").primaryKey(),
  periodName: varchar("period_name", { length: 100 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: varchar("status", { length: 20 }).default("open"),
  processedAt: timestamp("processed_at"),
  processedBy: integer("processed_by"),
});

export const payroll = pgTable("payroll", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  periodId: integer("period_id").notNull(),
  baseSalary: decimal("base_salary", { precision: 15, scale: 2 }).default("0"),
  allowances: decimal("allowances", { precision: 15, scale: 2 }).default("0"),
  deductions: decimal("deductions", { precision: 15, scale: 2 }).default("0"),
  netSalary: decimal("net_salary", { precision: 15, scale: 2 }).default("0"),
  status: varchar("status", { length: 20 }).default("pending"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const employeeBonuses = pgTable("employee_bonuses", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  bonusType: varchar("bonus_type", { length: 50 }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  reason: text("reason"),
  effectiveDate: date("effective_date"),
  status: varchar("status", { length: 20 }).default("pending"),
  approvedBy: integer("approved_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const employeeLoans = pgTable("employee_loans", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  loanAmount: decimal("loan_amount", { precision: 15, scale: 2 }).notNull(),
  remainingAmount: decimal("remaining_amount", { precision: 15, scale: 2 }).notNull(),
  monthlyDeduction: decimal("monthly_deduction", { precision: 15, scale: 2 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  status: varchar("status", { length: 20 }).default("active"),
  reason: text("reason"),
  approvedBy: integer("approved_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== Performance & Training ====================

export const performanceReviews = pgTable("performance_reviews", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  reviewerId: integer("reviewer_id").notNull(),
  reviewPeriod: varchar("review_period", { length: 50 }),
  overallRating: decimal("overall_rating", { precision: 3, scale: 2 }),
  strengths: text("strengths"),
  improvements: text("improvements"),
  goals: text("goals"),
  status: varchar("status", { length: 20 }).default("draft"),
  reviewDate: date("review_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const performanceMetrics = pgTable("performance_metrics", {
  id: serial("id").primaryKey(),
  metricName: varchar("metric_name", { length: 100 }).notNull(),
  metricCode: varchar("metric_code", { length: 50 }),
  description: text("description"),
  targetValue: decimal("target_value", { precision: 15, scale: 2 }),
  unit: varchar("unit", { length: 20 }),
  isActive: boolean("is_active").default(true),
});

export const performanceReports = pgTable("performance_reports", {
  id: serial("id").primaryKey(),
  reportName: varchar("report_name", { length: 100 }).notNull(),
  reportType: varchar("report_type", { length: 50 }),
  periodStart: date("period_start"),
  periodEnd: date("period_end"),
  data: text("data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by"),
});

export const trainingCourses = pgTable("training_courses", {
  id: serial("id").primaryKey(),
  courseName: varchar("course_name", { length: 255 }).notNull(),
  courseCode: varchar("course_code", { length: 50 }),
  description: text("description"),
  duration: integer("duration"),
  instructor: varchar("instructor", { length: 100 }),
  maxParticipants: integer("max_participants"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trainingEnrollments = pgTable("training_enrollments", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  employeeId: integer("employee_id").notNull(),
  enrollmentDate: date("enrollment_date"),
  completionDate: date("completion_date"),
  status: varchar("status", { length: 20 }).default("enrolled"),
  score: decimal("score", { precision: 5, scale: 2 }),
  certificate: varchar("certificate", { length: 255 }),
});

// ==================== Assets Advanced ====================

export const assetDepreciationRecords = pgTable("asset_depreciation_records", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").notNull(),
  depreciationDate: date("depreciation_date").notNull(),
  depreciationAmount: decimal("depreciation_amount", { precision: 15, scale: 2 }).notNull(),
  accumulatedDepreciation: decimal("accumulated_depreciation", { precision: 15, scale: 2 }),
  bookValue: decimal("book_value", { precision: 15, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assetInventoryCounts = pgTable("asset_inventory_counts", {
  id: serial("id").primaryKey(),
  countNumber: varchar("count_number", { length: 50 }).notNull().unique(),
  countDate: date("count_date").notNull(),
  status: varchar("status", { length: 20 }).default("draft"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by"),
  completedAt: timestamp("completed_at"),
});

export const assetInventoryCountItems = pgTable("asset_inventory_count_items", {
  id: serial("id").primaryKey(),
  countId: integer("count_id").notNull(),
  assetId: integer("asset_id").notNull(),
  expectedLocation: varchar("expected_location", { length: 100 }),
  actualLocation: varchar("actual_location", { length: 100 }),
  condition: varchar("condition", { length: 50 }),
  notes: text("notes"),
});

// ==================== Maintenance Advanced ====================

export const preventiveMaintenanceSchedules = pgTable("preventive_maintenance_schedules", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").notNull(),
  scheduleName: varchar("schedule_name", { length: 100 }).notNull(),
  frequency: varchar("frequency", { length: 50 }),
  lastMaintenanceDate: date("last_maintenance_date"),
  nextMaintenanceDate: date("next_maintenance_date"),
  instructions: text("instructions"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const preventiveMaintenanceRecords = pgTable("preventive_maintenance_records", {
  id: serial("id").primaryKey(),
  scheduleId: integer("schedule_id").notNull(),
  maintenanceDate: date("maintenance_date").notNull(),
  performedBy: integer("performed_by"),
  findings: text("findings"),
  actionsPerformed: text("actions_performed"),
  nextScheduledDate: date("next_scheduled_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const maintenancePartsUsed = pgTable("maintenance_parts_used", {
  id: serial("id").primaryKey(),
  maintenanceId: integer("maintenance_id").notNull(),
  itemId: integer("item_id").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitCost: decimal("unit_cost", { precision: 15, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 15, scale: 2 }),
});

export const maintenanceWindows = pgTable("maintenance_windows", {
  id: serial("id").primaryKey(),
  windowName: varchar("window_name", { length: 100 }).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  description: text("description"),
  affectedSystems: text("affected_systems"),
  status: varchar("status", { length: 20 }).default("scheduled"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emergencyMaintenanceRequests = pgTable("emergency_maintenance_requests", {
  id: serial("id").primaryKey(),
  requestNumber: varchar("request_number", { length: 50 }).notNull().unique(),
  assetId: integer("asset_id"),
  description: text("description"),
  priority: varchar("priority", { length: 20 }).default("high"),
  status: varchar("status", { length: 20 }).default("pending"),
  requestedBy: integer("requested_by"),
  assignedTo: integer("assigned_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

// ==================== Equipment & Tracking ====================

export const equipmentTracking = pgTable("equipment_tracking", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").notNull(),
  trackingDate: timestamp("tracking_date").defaultNow().notNull(),
  location: varchar("location", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  status: varchar("status", { length: 50 }),
  notes: text("notes"),
});

export const equipmentMaintenance = pgTable("equipment_maintenance", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").notNull(),
  maintenanceType: varchar("maintenance_type", { length: 50 }),
  scheduledDate: date("scheduled_date"),
  completedDate: date("completed_date"),
  cost: decimal("cost", { precision: 15, scale: 2 }),
  notes: text("notes"),
  performedBy: integer("performed_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== Field Operations Extended ====================

export const fieldInspections = pgTable("field_inspections", {
  id: serial("id").primaryKey(),
  inspectionNumber: varchar("inspection_number", { length: 50 }).notNull().unique(),
  inspectionType: varchar("inspection_type", { length: 50 }),
  customerId: integer("customer_id"),
  meterId: integer("meter_id"),
  inspectorId: integer("inspector_id"),
  scheduledDate: date("scheduled_date"),
  completedDate: date("completed_date"),
  status: varchar("status", { length: 20 }).default("scheduled"),
  findings: text("findings"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inspectionItems = pgTable("inspection_items", {
  id: serial("id").primaryKey(),
  inspectionId: integer("inspection_id").notNull(),
  itemName: varchar("item_name", { length: 100 }).notNull(),
  expectedValue: varchar("expected_value", { length: 100 }),
  actualValue: varchar("actual_value", { length: 100 }),
  status: varchar("status", { length: 20 }),
  notes: text("notes"),
});

export const fieldOperationPlans = pgTable("field_operation_plans", {
  id: serial("id").primaryKey(),
  planName: varchar("plan_name", { length: 100 }).notNull(),
  planDate: date("plan_date").notNull(),
  area: varchar("area", { length: 100 }),
  teamId: integer("team_id"),
  objectives: text("objectives"),
  status: varchar("status", { length: 20 }).default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fieldOperationSchedules = pgTable("field_operation_schedules", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").notNull(),
  taskType: varchar("task_type", { length: 50 }),
  startTime: varchar("start_time", { length: 10 }),
  endTime: varchar("end_time", { length: 10 }),
  location: varchar("location", { length: 255 }),
  assignedTo: integer("assigned_to"),
  status: varchar("status", { length: 20 }).default("pending"),
});

// ==================== Material Distribution ====================

export const materialDistributions = pgTable("material_distributions", {
  id: serial("id").primaryKey(),
  distributionNumber: varchar("distribution_number", { length: 50 }).notNull().unique(),
  distributionDate: date("distribution_date").notNull(),
  fromWarehouseId: integer("from_warehouse_id").notNull(),
  toTeamId: integer("to_team_id"),
  toEmployeeId: integer("to_employee_id"),
  status: varchar("status", { length: 20 }).default("draft"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by"),
});

export const materialDistributionItems = pgTable("material_distribution_items", {
  id: serial("id").primaryKey(),
  distributionId: integer("distribution_id").notNull(),
  itemId: integer("item_id").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
});

// ==================== Worker Management ====================

export const workerPerformanceEvaluations = pgTable("worker_performance_evaluations", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  evaluationPeriod: varchar("evaluation_period", { length: 50 }),
  evaluatorId: integer("evaluator_id"),
  productivityScore: decimal("productivity_score", { precision: 5, scale: 2 }),
  qualityScore: decimal("quality_score", { precision: 5, scale: 2 }),
  attendanceScore: decimal("attendance_score", { precision: 5, scale: 2 }),
  overallScore: decimal("overall_score", { precision: 5, scale: 2 }),
  comments: text("comments"),
  evaluationDate: date("evaluation_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workerIncentives = pgTable("worker_incentives", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  incentiveType: varchar("incentive_type", { length: 50 }),
  amount: decimal("amount", { precision: 15, scale: 2 }),
  reason: text("reason"),
  effectiveDate: date("effective_date"),
  status: varchar("status", { length: 20 }).default("pending"),
  approvedBy: integer("approved_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workerLocationTracking = pgTable("worker_location_tracking", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  trackingTime: timestamp("tracking_time").defaultNow().notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  accuracy: decimal("accuracy", { precision: 10, scale: 2 }),
  taskId: integer("task_id"),
});

// ==================== Data Migration & Validation ====================

export const dataMigrationTasks = pgTable("data_migration_tasks", {
  id: serial("id").primaryKey(),
  taskName: varchar("task_name", { length: 100 }).notNull(),
  sourceSystem: varchar("source_system", { length: 100 }),
  targetTable: varchar("target_table", { length: 100 }),
  status: varchar("status", { length: 20 }).default("pending"),
  totalRecords: integer("total_records"),
  processedRecords: integer("processed_records"),
  failedRecords: integer("failed_records"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dataMigrationLogs = pgTable("data_migration_logs", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull(),
  logLevel: varchar("log_level", { length: 20 }),
  message: text("message"),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dataValidationRules = pgTable("data_validation_rules", {
  id: serial("id").primaryKey(),
  ruleName: varchar("rule_name", { length: 100 }).notNull(),
  tableName: varchar("table_name", { length: 100 }),
  columnName: varchar("column_name", { length: 100 }),
  ruleType: varchar("rule_type", { length: 50 }),
  ruleExpression: text("rule_expression"),
  errorMessage: varchar("error_message", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dataValidationResults = pgTable("data_validation_results", {
  id: serial("id").primaryKey(),
  ruleId: integer("rule_id").notNull(),
  recordId: integer("record_id"),
  validationDate: timestamp("validation_date").defaultNow().notNull(),
  isValid: boolean("is_valid"),
  errorDetails: text("error_details"),
});

// ==================== Deployment & Backup ====================

export const deployments = pgTable("deployments", {
  id: serial("id").primaryKey(),
  deploymentName: varchar("deployment_name", { length: 100 }).notNull(),
  version: varchar("version", { length: 50 }),
  environmentId: integer("environment_id"),
  status: varchar("status", { length: 20 }).default("pending"),
  deployedBy: integer("deployed_by"),
  deployedAt: timestamp("deployed_at"),
  rollbackAt: timestamp("rollback_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const deploymentEnvironments = pgTable("deployment_environments", {
  id: serial("id").primaryKey(),
  environmentName: varchar("environment_name", { length: 100 }).notNull(),
  environmentType: varchar("environment_type", { length: 50 }),
  serverUrl: varchar("server_url", { length: 255 }),
  databaseHost: varchar("database_host", { length: 255 }),
  databaseName: varchar("database_name", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const deploymentLogs = pgTable("deployment_logs", {
  id: serial("id").primaryKey(),
  deploymentId: integer("deployment_id").notNull(),
  logLevel: varchar("log_level", { length: 20 }),
  message: text("message"),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const backups = pgTable("backups", {
  id: serial("id").primaryKey(),
  backupName: varchar("backup_name", { length: 100 }).notNull(),
  backupType: varchar("backup_type", { length: 50 }),
  filePath: varchar("file_path", { length: 500 }),
  fileSize: integer("file_size"),
  status: varchar("status", { length: 20 }).default("pending"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const restoreOperations = pgTable("restore_operations", {
  id: serial("id").primaryKey(),
  backupId: integer("backup_id").notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  restoredBy: integer("restored_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== Support & Knowledge Base ====================

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  ticketNumber: varchar("ticket_number", { length: 50 }).notNull().unique(),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description"),
  customerId: integer("customer_id"),
  userId: integer("user_id"),
  categoryId: integer("category_id"),
  priority: varchar("priority", { length: 20 }).default("medium"),
  status: varchar("status", { length: 20 }).default("open"),
  assignedTo: integer("assigned_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at"),
});

export const supportTicketComments = pgTable("support_ticket_comments", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull(),
  commentText: text("comment_text").notNull(),
  isInternal: boolean("is_internal").default(false),
  attachments: text("attachments"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const knowledgeBase = pgTable("knowledge_base", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  categoryId: integer("category_id"),
  tags: text("tags"),
  viewCount: integer("view_count").default(0),
  isPublished: boolean("is_published").default(false),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer"),
  categoryId: integer("category_id"),
  sortOrder: integer("sort_order").default(0),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== Surveys & Feedback ====================

export const userSatisfactionSurveys = pgTable("user_satisfaction_surveys", {
  id: serial("id").primaryKey(),
  surveyName: varchar("survey_name", { length: 100 }).notNull(),
  description: text("description"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const improvementSuggestions = pgTable("improvement_suggestions", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }),
  submittedBy: integer("submitted_by"),
  status: varchar("status", { length: 20 }).default("pending"),
  priority: varchar("priority", { length: 20 }),
  implementedAt: timestamp("implemented_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== Launch & Approval ====================

export const launchChecklists = pgTable("launch_checklists", {
  id: serial("id").primaryKey(),
  checklistName: varchar("checklist_name", { length: 100 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }),
  isRequired: boolean("is_required").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const launchChecklistStatus = pgTable("launch_checklist_status", {
  id: serial("id").primaryKey(),
  checklistId: integer("checklist_id").notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  completedBy: integer("completed_by"),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
});

export const approvalSignatures = pgTable("approval_signatures", {
  id: serial("id").primaryKey(),
  documentType: varchar("document_type", { length: 50 }).notNull(),
  documentId: integer("document_id").notNull(),
  signerId: integer("signer_id").notNull(),
  signatureData: text("signature_data"),
  signedAt: timestamp("signed_at").defaultNow().notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
});
