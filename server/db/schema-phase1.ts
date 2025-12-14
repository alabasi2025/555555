import { mysqlTable, varchar, int, decimal, text, timestamp, boolean, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// جدول المستخدمين
export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  roleId: int("role_id").notNull(),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  createdBy: int("created_by"),
  updatedBy: int("updated_by"),
});

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

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
  permissions: many(permissions),
}));

export const permissionsRelations = relations(permissions, ({ one }) => ({
  role: one(roles, {
    fields: [permissions.roleId],
    references: [roles.id],
  }),
}));

export const workOrdersRelations = relations(workOrders, ({ one }) => ({
  assignedUser: one(users, {
    fields: [workOrders.assignedTo],
    references: [users.id],
  }),
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
  assignedUser: one(users, {
    fields: [maintenanceSchedules.assignedTo],
    references: [users.id],
  }),
}));
