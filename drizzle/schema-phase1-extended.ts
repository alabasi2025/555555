import { mysqlTable, varchar, int, decimal, text, timestamp, boolean, mysqlEnum, json, uniqueIndex, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ============================================
// المرحلة 1 - النظام 1: إدارة المنصة
// ============================================

// جدول سجل التدقيق (Audit Log)
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id"),
  userName: varchar("user_name", { length: 255 }),
  action: mysqlEnum("action", ["create", "read", "update", "delete", "login", "logout", "export", "import", "approve", "reject"]).notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(), // e.g., "invoice", "payment", "customer"
  entityId: int("entity_id"),
  entityName: varchar("entity_name", { length: 255 }),
  oldValues: json("old_values"), // JSON of previous values
  newValues: json("new_values"), // JSON of new values
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  sessionId: varchar("session_id", { length: 255 }),
  module: varchar("module", { length: 100 }), // e.g., "accounting", "inventory", "billing"
  description: text("description"),
  status: mysqlEnum("status", ["success", "failed", "pending"]).default("success"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("audit_user_id_idx").on(table.userId),
  entityTypeIdx: index("audit_entity_type_idx").on(table.entityType),
  actionIdx: index("audit_action_idx").on(table.action),
  createdAtIdx: index("audit_created_at_idx").on(table.createdAt),
}));

// جدول الجلسات (Sessions)
export const sessions = mysqlTable("sessions", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  deviceInfo: json("device_info"),
  isActive: boolean("is_active").default(true),
  lastActivity: timestamp("last_activity").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("session_user_id_idx").on(table.userId),
  tokenIdx: uniqueIndex("session_token_idx").on(table.sessionToken),
}));

// جدول إعدادات المستخدم (User Settings)
export const userSettings = mysqlTable("user_settings", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().unique(),
  language: varchar("language", { length: 10 }).default("ar"),
  timezone: varchar("timezone", { length: 50 }).default("Asia/Riyadh"),
  dateFormat: varchar("date_format", { length: 20 }).default("DD/MM/YYYY"),
  numberFormat: varchar("number_format", { length: 20 }).default("1,234.56"),
  currency: varchar("currency", { length: 3 }).default("SAR"),
  theme: mysqlEnum("theme", ["light", "dark", "system"]).default("light"),
  notifications: json("notifications"), // JSON for notification preferences
  dashboardLayout: json("dashboard_layout"), // JSON for dashboard widget layout
  defaultPage: varchar("default_page", { length: 100 }).default("/dashboard"),
  itemsPerPage: int("items_per_page").default(25),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// جدول الإشعارات (Notifications)
export const notifications = mysqlTable("notifications", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["info", "warning", "error", "success", "reminder"]).default("info"),
  category: varchar("category", { length: 50 }), // e.g., "invoice", "payment", "system"
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  actionUrl: varchar("action_url", { length: 500 }),
  actionLabel: varchar("action_label", { length: 100 }),
  metadata: json("metadata"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("notification_user_id_idx").on(table.userId),
  isReadIdx: index("notification_is_read_idx").on(table.isRead),
  createdAtIdx: index("notification_created_at_idx").on(table.createdAt),
}));

// جدول مجموعات الصلاحيات (Permission Groups)
export const permissionGroups = mysqlTable("permission_groups", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  description: text("description"),
  module: varchar("module", { length: 100 }).notNull(), // e.g., "accounting", "inventory"
  sortOrder: int("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// جدول الصلاحيات المفصلة (Detailed Permissions)
export const detailedPermissions = mysqlTable("detailed_permissions", {
  id: int("id").primaryKey().autoincrement(),
  groupId: int("group_id").notNull(),
  code: varchar("code", { length: 100 }).notNull().unique(), // e.g., "invoices.create", "invoices.approve"
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  description: text("description"),
  resource: varchar("resource", { length: 100 }).notNull(), // e.g., "invoices", "payments"
  action: varchar("action", { length: 50 }).notNull(), // e.g., "create", "read", "update", "delete", "approve"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  codeIdx: uniqueIndex("permission_code_idx").on(table.code),
  groupIdIdx: index("permission_group_id_idx").on(table.groupId),
}));

// جدول صلاحيات الأدوار (Role Permissions)
export const rolePermissions = mysqlTable("role_permissions", {
  id: int("id").primaryKey().autoincrement(),
  roleId: int("role_id").notNull(),
  permissionId: int("permission_id").notNull(),
  grantedBy: int("granted_by"),
  grantedAt: timestamp("granted_at").defaultNow().notNull(),
}, (table) => ({
  rolePermissionIdx: uniqueIndex("role_permission_idx").on(table.roleId, table.permissionId),
}));

// ============================================
// المرحلة 1 - لوحة التحكم والإحصائيات
// ============================================

// جدول إعدادات لوحة التحكم (Dashboard Widgets)
export const dashboardWidgets = mysqlTable("dashboard_widgets", {
  id: int("id").primaryKey().autoincrement(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  description: text("description"),
  widgetType: mysqlEnum("widget_type", ["stat", "chart", "table", "list", "calendar", "map"]).notNull(),
  dataSource: varchar("data_source", { length: 100 }).notNull(), // API endpoint or query name
  defaultConfig: json("default_config"), // Default widget configuration
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
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  widgetId: int("widget_id").notNull(),
  positionX: int("position_x").default(0),
  positionY: int("position_y").default(0),
  width: int("width").default(2),
  height: int("height").default(2),
  config: json("config"), // User-specific widget configuration
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userWidgetIdx: uniqueIndex("user_widget_idx").on(table.userId, table.widgetId),
}));

// جدول KPIs (مؤشرات الأداء الرئيسية)
export const kpiDefinitions = mysqlTable("kpi_definitions", {
  id: int("id").primaryKey().autoincrement(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // e.g., "financial", "operational", "customer"
  calculationFormula: text("calculation_formula"), // SQL or formula description
  dataSource: varchar("data_source", { length: 100 }),
  unit: varchar("unit", { length: 20 }), // e.g., "SAR", "%", "count"
  targetValue: decimal("target_value", { precision: 15, scale: 2 }),
  warningThreshold: decimal("warning_threshold", { precision: 15, scale: 2 }),
  criticalThreshold: decimal("critical_threshold", { precision: 15, scale: 2 }),
  trendDirection: mysqlEnum("trend_direction", ["up_good", "down_good", "neutral"]).default("up_good"),
  refreshInterval: int("refresh_interval").default(3600), // in seconds
  isActive: boolean("is_active").default(true),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// جدول قيم KPIs (سجل القيم)
export const kpiValues = mysqlTable("kpi_values", {
  id: int("id").primaryKey().autoincrement(),
  kpiId: int("kpi_id").notNull(),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  previousValue: decimal("previous_value", { precision: 15, scale: 2 }),
  changePercent: decimal("change_percent", { precision: 10, scale: 2 }),
  periodType: mysqlEnum("period_type", ["daily", "weekly", "monthly", "quarterly", "yearly"]).notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  metadata: json("metadata"),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
}, (table) => ({
  kpiPeriodIdx: index("kpi_period_idx").on(table.kpiId, table.periodStart),
}));

// ============================================
// جدول الأنشطة الأخيرة (Recent Activities)
// ============================================
export const recentActivities = mysqlTable("recent_activities", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id"),
  activityType: varchar("activity_type", { length: 50 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: int("entity_id"),
  entityName: varchar("entity_name", { length: 255 }),
  description: text("description"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("activity_user_id_idx").on(table.userId),
  createdAtIdx: index("activity_created_at_idx").on(table.createdAt),
}));

// ============================================
// Relations
// ============================================

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  // user relation will be added when users table is imported
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  // user relation will be added when users table is imported
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  // user relation will be added when users table is imported
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  // user relation will be added when users table is imported
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
  permission: one(detailedPermissions, {
    fields: [rolePermissions.permissionId],
    references: [detailedPermissions.id],
  }),
}));

export const dashboardWidgetsRelations = relations(dashboardWidgets, ({ many }) => ({
  userDashboards: many(userDashboards),
}));

export const userDashboardsRelations = relations(userDashboards, ({ one }) => ({
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

// ============================================
// Types Export
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
