import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { accountsRouter } from "./routers/accounts";
import { customersRouter } from "./routers/customers";
import { suppliersRouter } from "./routers/suppliers";
import { invoicesRouter } from "./routers/invoices";
import { paymentsRouter } from "./routers/payments";
import { inventoryRouter } from "./routers/inventory";
import { purchasesRouter } from "./routers/purchases";
import { reportsRouter } from "./routers/reports";
import { journalEntriesRouter } from "./routers/journalEntries";
// Phase 1 routers
import { rolesRouter } from "./routers/roles";
import { usersRouter } from "./routers/users";
import { subscriptionsRouter } from "./routers/subscriptions";
import { metersRouter } from "./routers/meters";
import { workOrdersRouter } from "./routers/workOrders";
import { assetsRouter } from "./routers/assets";
import { maintenanceRouter } from "./routers/maintenance";
import { monitoringRouter } from "./routers/monitoring";
// Phase 1 Extended routers
import { dashboardRouter } from "./routers/dashboard";
import { permissionsRouter } from "./routers/permissions";
import { auditRouter } from "./routers/audit";
// Phase 1 Advanced routers
import { subscriptionsAdvancedRouter } from "./routers/subscriptions-advanced";
import { metersAdvancedRouter } from "./routers/meters-advanced";
import { workOrdersAdvancedRouter } from "./routers/work-orders-advanced";
import { assetsAdvancedRouter } from "./routers/assets-advanced";
import { monitoringAdvancedRouter } from "./routers/monitoring-advanced";
// Phase 1 HR routers
import { employeesRouter } from "./routers/employees";
import { attendanceRouter } from "./routers/attendance";
import { payrollRouter } from "./routers/payroll";
// Phase 1 Complete - Advanced Systems
import { warehousesRouter } from "./routers/warehouses";
import { recurringInvoicesRouter } from "./routers/recurring-invoices";
import { discountsRouter } from "./routers/discounts";
import { inventoryCountsRouter } from "./routers/inventory-counts";
import { ticketsRouter } from "./routers/tickets";
import { customerPortalRouter } from "./routers/customer-portal";
import { fieldOperationsRouter } from "./routers/field-operations";
// Phase 2 routers - Testing, Security, Documentation, Settings
import { testingRouter } from "./routers/testing";
import { securityRouter } from "./routers/security";
import { documentationRouter } from "./routers/documentation";
import { settingsRouter } from "./routers/settings";
// Phase 3 routers - Advanced Systems
import { advancedBillingRouter } from "./routers/advanced-billing";
import { advancedCollectionRouter } from "./routers/advanced-collection";
import { debtManagementRouter } from "./routers/debt-management";
import { advancedReportsRouter } from "./routers/advanced-reports";
import { advancedInventoryRouter } from "./routers/advanced-inventory";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Feature routers
  accounts: accountsRouter,
  customers: customersRouter,
  suppliers: suppliersRouter,
  invoices: invoicesRouter,
  payments: paymentsRouter,
  inventory: inventoryRouter,
  purchases: purchasesRouter,
  reports: reportsRouter,
  journalEntries: journalEntriesRouter,
  
  // Phase 1 routers
  roles: rolesRouter,
  users: usersRouter,
  subscriptions: subscriptionsRouter,
  meters: metersRouter,
  workOrders: workOrdersRouter,
  assets: assetsRouter,
  maintenance: maintenanceRouter,
  monitoring: monitoringRouter,
  
  // Phase 1 Extended routers - Dashboard, Permissions, Audit
  dashboard: dashboardRouter,
  permissions: permissionsRouter,
  audit: auditRouter,
  
  // Phase 1 Advanced routers - Full featured APIs
  subscriptionsAdvanced: subscriptionsAdvancedRouter,
  metersAdvanced: metersAdvancedRouter,
  workOrdersAdvanced: workOrdersAdvancedRouter,
  assetsAdvanced: assetsAdvancedRouter,
  monitoringAdvanced: monitoringAdvancedRouter,
  
  // Phase 1 HR routers - Human Resources
  employees: employeesRouter,
  attendance: attendanceRouter,
  payroll: payrollRouter,
  
  // Phase 1 Complete - Advanced Systems
  warehouses: warehousesRouter,
  recurringInvoices: recurringInvoicesRouter,
  discounts: discountsRouter,
  inventoryCounts: inventoryCountsRouter,
  tickets: ticketsRouter,
  customerPortal: customerPortalRouter,
  fieldOperations: fieldOperationsRouter,
  
  // Phase 2 routers - Testing, Security, Documentation, Settings
  testing: testingRouter,
  security: securityRouter,
  documentation: documentationRouter,
  settings: settingsRouter,
  
  // Phase 3 routers - Advanced Systems
  advancedBilling: advancedBillingRouter,
  advancedCollection: advancedCollectionRouter,
  debtManagement: debtManagementRouter,
  advancedReports: advancedReportsRouter,
  advancedInventory: advancedInventoryRouter,
});

export type AppRouter = typeof appRouter;
