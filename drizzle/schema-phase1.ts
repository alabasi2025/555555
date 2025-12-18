import { mysqlTable, int, varchar, text, timestamp, boolean, decimal, date, mysqlEnum, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ============================================
// المرحلة 1: الأنظمة المتقدمة
// ============================================

// ============================================
// النظام 1: المستودعات المتعددة (Multi-Warehouse)
// ============================================

export const warehouses = mysqlTable("warehouses", {
  id: int("id").autoincrement().primaryKey(),
  warehouseCode: varchar("warehouse_code", { length: 50 }).notNull().unique(),
  warehouseName: varchar("warehouse_name", { length: 255 }).notNull(),
  warehouseType: mysqlEnum("warehouse_type", ["main", "branch", "transit", "virtual"]).default("main").notNull(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  region: varchar("region", { length: 100 }),
  managerId: int("manager_id"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  capacity: decimal("capacity", { precision: 15, scale: 2 }),
  currentOccupancy: decimal("current_occupancy", { precision: 15, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const warehouseLocations = mysqlTable("warehouse_locations", {
  id: int("id").autoincrement().primaryKey(),
  warehouseId: int("warehouse_id").notNull(),
  locationCode: varchar("location_code", { length: 50 }).notNull(),
  locationName: varchar("location_name", { length: 255 }).notNull(),
  locationType: mysqlEnum("location_type", ["shelf", "bin", "zone", "area"]).default("shelf").notNull(),
  parentLocationId: int("parent_location_id"),
  capacity: decimal("capacity", { precision: 15, scale: 2 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const warehouseStock = mysqlTable("warehouse_stock", {
  id: int("id").autoincrement().primaryKey(),
  warehouseId: int("warehouse_id").notNull(),
  locationId: int("location_id"),
  itemId: int("item_id").notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 3 }).default("0.000").notNull(),
  reservedQuantity: decimal("reserved_quantity", { precision: 15, scale: 3 }).default("0.000").notNull(),
  availableQuantity: decimal("available_quantity", { precision: 15, scale: 3 }).default("0.000").notNull(),
  lastCountDate: timestamp("last_count_date"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const stockTransfers = mysqlTable("stock_transfers", {
  id: int("id").autoincrement().primaryKey(),
  transferNumber: varchar("transfer_number", { length: 50 }).notNull().unique(),
  fromWarehouseId: int("from_warehouse_id").notNull(),
  toWarehouseId: int("to_warehouse_id").notNull(),
  transferDate: date("transfer_date").notNull(),
  status: mysqlEnum("status", ["draft", "pending", "in_transit", "received", "cancelled"]).default("draft").notNull(),
  notes: text("notes"),
  createdBy: int("created_by"),
  approvedBy: int("approved_by"),
  receivedBy: int("received_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const stockTransferItems = mysqlTable("stock_transfer_items", {
  id: int("id").autoincrement().primaryKey(),
  transferId: int("transfer_id").notNull(),
  itemId: int("item_id").notNull(),
  requestedQuantity: decimal("requested_quantity", { precision: 15, scale: 3 }).notNull(),
  sentQuantity: decimal("sent_quantity", { precision: 15, scale: 3 }),
  receivedQuantity: decimal("received_quantity", { precision: 15, scale: 3 }),
  notes: text("notes"),
});

// ============================================
// النظام 2: الفواتير الدورية (Recurring Invoices)
// ============================================

export const recurringInvoices = mysqlTable("recurring_invoices", {
  id: int("id").autoincrement().primaryKey(),
  templateName: varchar("template_name", { length: 255 }).notNull(),
  customerId: int("customer_id").notNull(),
  frequency: mysqlEnum("frequency", ["daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"]).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  nextInvoiceDate: date("next_invoice_date").notNull(),
  lastInvoiceDate: date("last_invoice_date"),
  dayOfMonth: int("day_of_month"),
  dayOfWeek: int("day_of_week"),
  subtotal: decimal("subtotal", { precision: 15, scale: 2 }).default("0.00").notNull(),
  taxAmount: decimal("tax_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  discountAmount: decimal("discount_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  status: mysqlEnum("status", ["active", "paused", "completed", "cancelled"]).default("active").notNull(),
  autoSend: boolean("auto_send").default(false).notNull(),
  invoicesGenerated: int("invoices_generated").default(0).notNull(),
  notes: text("notes"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const recurringInvoiceItems = mysqlTable("recurring_invoice_items", {
  id: int("id").autoincrement().primaryKey(),
  recurringInvoiceId: int("recurring_invoice_id").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 3 }).default("1.000").notNull(),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0.00"),
  discountRate: decimal("discount_rate", { precision: 5, scale: 2 }).default("0.00"),
  lineTotal: decimal("line_total", { precision: 15, scale: 2 }).notNull(),
});

export const recurringInvoiceHistory = mysqlTable("recurring_invoice_history", {
  id: int("id").autoincrement().primaryKey(),
  recurringInvoiceId: int("recurring_invoice_id").notNull(),
  invoiceId: int("invoice_id").notNull(),
  generatedDate: timestamp("generated_date").defaultNow().notNull(),
  status: mysqlEnum("status", ["success", "failed"]).notNull(),
  errorMessage: text("error_message"),
});

// ============================================
// النظام 3: الخصومات والعروض (Discounts & Promotions)
// ============================================

export const discountRules = mysqlTable("discount_rules", {
  id: int("id").autoincrement().primaryKey(),
  ruleName: varchar("rule_name", { length: 255 }).notNull(),
  ruleCode: varchar("rule_code", { length: 50 }).notNull().unique(),
  discountType: mysqlEnum("discount_type", ["percentage", "fixed_amount", "buy_x_get_y", "tiered"]).notNull(),
  discountValue: decimal("discount_value", { precision: 15, scale: 2 }).notNull(),
  minPurchaseAmount: decimal("min_purchase_amount", { precision: 15, scale: 2 }),
  maxDiscountAmount: decimal("max_discount_amount", { precision: 15, scale: 2 }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  usageLimit: int("usage_limit"),
  usageCount: int("usage_count").default(0).notNull(),
  perCustomerLimit: int("per_customer_limit"),
  applicableTo: mysqlEnum("applicable_to", ["all", "specific_items", "specific_categories", "specific_customers"]).default("all").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  priority: int("priority").default(0).notNull(),
  description: text("description"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const discountRuleItems = mysqlTable("discount_rule_items", {
  id: int("id").autoincrement().primaryKey(),
  discountRuleId: int("discount_rule_id").notNull(),
  itemId: int("item_id"),
  categoryId: int("category_id"),
  customerId: int("customer_id"),
});

export const promotions = mysqlTable("promotions", {
  id: int("id").autoincrement().primaryKey(),
  promotionName: varchar("promotion_name", { length: 255 }).notNull(),
  promotionCode: varchar("promotion_code", { length: 50 }).notNull().unique(),
  promotionType: mysqlEnum("promotion_type", ["seasonal", "clearance", "loyalty", "bundle", "flash_sale"]).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  discountRuleId: int("discount_rule_id"),
  bannerImage: varchar("banner_image", { length: 500 }),
  description: text("description"),
  termsConditions: text("terms_conditions"),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const couponCodes = mysqlTable("coupon_codes", {
  id: int("id").autoincrement().primaryKey(),
  couponCode: varchar("coupon_code", { length: 50 }).notNull().unique(),
  discountRuleId: int("discount_rule_id").notNull(),
  usageLimit: int("usage_limit").default(1).notNull(),
  usageCount: int("usage_count").default(0).notNull(),
  expiryDate: date("expiry_date"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const couponUsage = mysqlTable("coupon_usage", {
  id: int("id").autoincrement().primaryKey(),
  couponId: int("coupon_id").notNull(),
  customerId: int("customer_id").notNull(),
  invoiceId: int("invoice_id").notNull(),
  discountAmount: decimal("discount_amount", { precision: 15, scale: 2 }).notNull(),
  usedAt: timestamp("used_at").defaultNow().notNull(),
});

// ============================================
// النظام 4: الجرد (Inventory Count)
// ============================================

export const inventoryCounts = mysqlTable("inventory_counts", {
  id: int("id").autoincrement().primaryKey(),
  countNumber: varchar("count_number", { length: 50 }).notNull().unique(),
  countType: mysqlEnum("count_type", ["full", "partial", "cycle", "spot"]).notNull(),
  warehouseId: int("warehouse_id").notNull(),
  countDate: date("count_date").notNull(),
  status: mysqlEnum("status", ["draft", "in_progress", "pending_approval", "approved", "cancelled"]).default("draft").notNull(),
  notes: text("notes"),
  createdBy: int("created_by"),
  approvedBy: int("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const inventoryCountItems = mysqlTable("inventory_count_items", {
  id: int("id").autoincrement().primaryKey(),
  countId: int("count_id").notNull(),
  itemId: int("item_id").notNull(),
  locationId: int("location_id"),
  systemQuantity: decimal("system_quantity", { precision: 15, scale: 3 }).notNull(),
  countedQuantity: decimal("counted_quantity", { precision: 15, scale: 3 }),
  variance: decimal("variance", { precision: 15, scale: 3 }),
  varianceValue: decimal("variance_value", { precision: 15, scale: 2 }),
  countedBy: int("counted_by"),
  countedAt: timestamp("counted_at"),
  notes: text("notes"),
});

export const inventoryAdjustments = mysqlTable("inventory_adjustments", {
  id: int("id").autoincrement().primaryKey(),
  adjustmentNumber: varchar("adjustment_number", { length: 50 }).notNull().unique(),
  countId: int("count_id"),
  warehouseId: int("warehouse_id").notNull(),
  adjustmentDate: date("adjustment_date").notNull(),
  adjustmentType: mysqlEnum("adjustment_type", ["count_variance", "damage", "expiry", "theft", "other"]).notNull(),
  status: mysqlEnum("status", ["draft", "pending_approval", "approved", "rejected"]).default("draft").notNull(),
  totalValue: decimal("total_value", { precision: 15, scale: 2 }).default("0.00").notNull(),
  notes: text("notes"),
  createdBy: int("created_by"),
  approvedBy: int("approved_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const inventoryAdjustmentItems = mysqlTable("inventory_adjustment_items", {
  id: int("id").autoincrement().primaryKey(),
  adjustmentId: int("adjustment_id").notNull(),
  itemId: int("item_id").notNull(),
  locationId: int("location_id"),
  adjustmentQuantity: decimal("adjustment_quantity", { precision: 15, scale: 3 }).notNull(),
  unitCost: decimal("unit_cost", { precision: 15, scale: 2 }).notNull(),
  totalValue: decimal("total_value", { precision: 15, scale: 2 }).notNull(),
  reason: text("reason"),
});

// ============================================
// النظام 5: نظام التذاكر (Ticket System)
// ============================================

export const tickets = mysqlTable("tickets", {
  id: int("id").autoincrement().primaryKey(),
  ticketNumber: varchar("ticket_number", { length: 50 }).notNull().unique(),
  customerId: int("customer_id"),
  subscriptionId: int("subscription_id"),
  meterId: int("meter_id"),
  category: mysqlEnum("category", ["billing", "technical", "service", "complaint", "inquiry", "other"]).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  description: text("description").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "pending_customer", "resolved", "closed", "cancelled"]).default("open").notNull(),
  assignedTo: int("assigned_to"),
  assignedTeam: varchar("assigned_team", { length: 100 }),
  source: mysqlEnum("source", ["web", "mobile", "phone", "email", "walk_in"]).default("web").notNull(),
  dueDate: timestamp("due_date"),
  resolvedAt: timestamp("resolved_at"),
  closedAt: timestamp("closed_at"),
  satisfactionRating: int("satisfaction_rating"),
  satisfactionComment: text("satisfaction_comment"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const ticketComments = mysqlTable("ticket_comments", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticket_id").notNull(),
  commentType: mysqlEnum("comment_type", ["public", "internal"]).default("public").notNull(),
  comment: text("comment").notNull(),
  attachments: json("attachments"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ticketHistory = mysqlTable("ticket_history", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticket_id").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  changedBy: int("changed_by"),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
});

export const ticketCategories = mysqlTable("ticket_categories", {
  id: int("id").autoincrement().primaryKey(),
  categoryName: varchar("category_name", { length: 255 }).notNull(),
  categoryCode: varchar("category_code", { length: 50 }).notNull().unique(),
  parentCategoryId: int("parent_category_id"),
  slaHours: int("sla_hours").default(24).notNull(),
  defaultAssignee: int("default_assignee"),
  defaultTeam: varchar("default_team", { length: 100 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// النظام 6: بوابة العملاء (Customer Portal)
// ============================================

export const customerPortalUsers = mysqlTable("customer_portal_users", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customer_id").notNull(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  isActive: boolean("is_active").default(true).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationToken: varchar("verification_token", { length: 255 }),
  resetToken: varchar("reset_token", { length: 255 }),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const customerPortalSessions = mysqlTable("customer_portal_sessions", {
  id: int("id").autoincrement().primaryKey(),
  portalUserId: int("portal_user_id").notNull(),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customerNotifications = mysqlTable("customer_notifications", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customer_id").notNull(),
  notificationType: mysqlEnum("notification_type", ["invoice", "payment", "service", "promotion", "system"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  actionUrl: varchar("action_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customerFeedback = mysqlTable("customer_feedback", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customer_id").notNull(),
  feedbackType: mysqlEnum("feedback_type", ["suggestion", "complaint", "compliment", "inquiry"]).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  rating: int("rating"),
  status: mysqlEnum("status", ["pending", "reviewed", "responded", "closed"]).default("pending").notNull(),
  response: text("response"),
  respondedBy: int("responded_by"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// النظام 7: العمليات الميدانية المتقدمة
// ============================================

export const fieldTeams = mysqlTable("field_teams", {
  id: int("id").autoincrement().primaryKey(),
  teamCode: varchar("team_code", { length: 50 }).notNull().unique(),
  teamName: varchar("team_name", { length: 255 }).notNull(),
  teamLeaderId: int("team_leader_id"),
  teamType: mysqlEnum("team_type", ["installation", "maintenance", "meter_reading", "collection", "inspection"]).notNull(),
  region: varchar("region", { length: 100 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const fieldTeamMembers = mysqlTable("field_team_members", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("team_id").notNull(),
  employeeId: int("employee_id").notNull(),
  role: mysqlEnum("role", ["leader", "technician", "assistant"]).default("technician").notNull(),
  joinDate: date("join_date").notNull(),
  leaveDate: date("leave_date"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const fieldSchedules = mysqlTable("field_schedules", {
  id: int("id").autoincrement().primaryKey(),
  scheduleNumber: varchar("schedule_number", { length: 50 }).notNull().unique(),
  teamId: int("team_id").notNull(),
  scheduleDate: date("schedule_date").notNull(),
  scheduleType: mysqlEnum("schedule_type", ["daily", "weekly", "monthly"]).default("daily").notNull(),
  status: mysqlEnum("status", ["draft", "published", "in_progress", "completed", "cancelled"]).default("draft").notNull(),
  totalTasks: int("total_tasks").default(0).notNull(),
  completedTasks: int("completed_tasks").default(0).notNull(),
  notes: text("notes"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const fieldTasks = mysqlTable("field_tasks", {
  id: int("id").autoincrement().primaryKey(),
  taskNumber: varchar("task_number", { length: 50 }).notNull().unique(),
  scheduleId: int("schedule_id"),
  workOrderId: int("work_order_id"),
  teamId: int("team_id"),
  assignedTo: int("assigned_to"),
  taskType: mysqlEnum("task_type", ["installation", "maintenance", "meter_reading", "collection", "inspection", "disconnection", "reconnection"]).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  customerId: int("customer_id"),
  subscriptionId: int("subscription_id"),
  meterId: int("meter_id"),
  address: text("address"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  scheduledDate: date("scheduled_date").notNull(),
  scheduledTime: varchar("scheduled_time", { length: 10 }),
  estimatedDuration: int("estimated_duration"),
  actualStartTime: timestamp("actual_start_time"),
  actualEndTime: timestamp("actual_end_time"),
  status: mysqlEnum("status", ["pending", "assigned", "in_progress", "completed", "failed", "cancelled"]).default("pending").notNull(),
  completionNotes: text("completion_notes"),
  customerSignature: text("customer_signature"),
  photos: json("photos"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const meterReadings = mysqlTable("meter_readings", {
  id: int("id").autoincrement().primaryKey(),
  meterId: int("meter_id").notNull(),
  subscriptionId: int("subscription_id"),
  readingDate: date("reading_date").notNull(),
  readingTime: varchar("reading_time", { length: 10 }),
  previousReading: decimal("previous_reading", { precision: 15, scale: 3 }).notNull(),
  currentReading: decimal("current_reading", { precision: 15, scale: 3 }).notNull(),
  consumption: decimal("consumption", { precision: 15, scale: 3 }).notNull(),
  readingType: mysqlEnum("reading_type", ["scheduled", "manual", "estimated", "final"]).default("scheduled").notNull(),
  readBy: int("read_by"),
  fieldTaskId: int("field_task_id"),
  photo: varchar("photo", { length: 500 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  isVerified: boolean("is_verified").default(false).notNull(),
  verifiedBy: int("verified_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// Relations للجداول الجديدة
// ============================================

export const warehousesRelations = relations(warehouses, ({ many }) => ({
  locations: many(warehouseLocations),
  stock: many(warehouseStock),
}));

export const stockTransfersRelations = relations(stockTransfers, ({ many }) => ({
  items: many(stockTransferItems),
}));

export const recurringInvoicesRelations = relations(recurringInvoices, ({ many }) => ({
  items: many(recurringInvoiceItems),
  history: many(recurringInvoiceHistory),
}));

export const discountRulesRelations = relations(discountRules, ({ many }) => ({
  items: many(discountRuleItems),
  coupons: many(couponCodes),
}));

export const inventoryCountsRelations = relations(inventoryCounts, ({ many }) => ({
  items: many(inventoryCountItems),
}));

export const ticketsRelations = relations(tickets, ({ many }) => ({
  comments: many(ticketComments),
  history: many(ticketHistory),
}));

export const fieldTeamsRelations = relations(fieldTeams, ({ many }) => ({
  members: many(fieldTeamMembers),
  schedules: many(fieldSchedules),
}));

export const fieldSchedulesRelations = relations(fieldSchedules, ({ many }) => ({
  tasks: many(fieldTasks),
}));

// ============================================
// Types Export
// ============================================

export type Warehouse = typeof warehouses.$inferSelect;
export type InsertWarehouse = typeof warehouses.$inferInsert;
export type WarehouseLocation = typeof warehouseLocations.$inferSelect;
export type InsertWarehouseLocation = typeof warehouseLocations.$inferInsert;
export type WarehouseStock = typeof warehouseStock.$inferSelect;
export type InsertWarehouseStock = typeof warehouseStock.$inferInsert;
export type StockTransfer = typeof stockTransfers.$inferSelect;
export type InsertStockTransfer = typeof stockTransfers.$inferInsert;

export type RecurringInvoice = typeof recurringInvoices.$inferSelect;
export type InsertRecurringInvoice = typeof recurringInvoices.$inferInsert;

export type DiscountRule = typeof discountRules.$inferSelect;
export type InsertDiscountRule = typeof discountRules.$inferInsert;
export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = typeof promotions.$inferInsert;
export type CouponCode = typeof couponCodes.$inferSelect;
export type InsertCouponCode = typeof couponCodes.$inferInsert;

export type InventoryCount = typeof inventoryCounts.$inferSelect;
export type InsertInventoryCount = typeof inventoryCounts.$inferInsert;
export type InventoryAdjustment = typeof inventoryAdjustments.$inferSelect;
export type InsertInventoryAdjustment = typeof inventoryAdjustments.$inferInsert;

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;
export type TicketComment = typeof ticketComments.$inferSelect;
export type InsertTicketComment = typeof ticketComments.$inferInsert;

export type CustomerPortalUser = typeof customerPortalUsers.$inferSelect;
export type InsertCustomerPortalUser = typeof customerPortalUsers.$inferInsert;
export type CustomerNotification = typeof customerNotifications.$inferSelect;
export type InsertCustomerNotification = typeof customerNotifications.$inferInsert;
export type CustomerFeedback = typeof customerFeedback.$inferSelect;
export type InsertCustomerFeedback = typeof customerFeedback.$inferInsert;

export type FieldTeam = typeof fieldTeams.$inferSelect;
export type InsertFieldTeam = typeof fieldTeams.$inferInsert;
export type FieldSchedule = typeof fieldSchedules.$inferSelect;
export type InsertFieldSchedule = typeof fieldSchedules.$inferInsert;
export type FieldTask = typeof fieldTasks.$inferSelect;
export type InsertFieldTask = typeof fieldTasks.$inferInsert;
export type MeterReading = typeof meterReadings.$inferSelect;
export type InsertMeterReading = typeof meterReadings.$inferInsert;
