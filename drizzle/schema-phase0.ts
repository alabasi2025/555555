import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, date } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

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
