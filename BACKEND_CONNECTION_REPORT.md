# تقرير فحص اتصال الصفحات بالـ Backend

## تاريخ الفحص: 21 ديسمبر 2025

---

## ملخص الفحص

| العنصر | العدد | النسبة |
|--------|-------|--------|
| إجمالي الصفحات | 104 | 100% |
| الصفحات المتصلة بالـ Backend | 30 | 29% |
| الصفحات غير المتصلة | 74 | 71% |
| الـ Routers المتاحة | 57 | - |

---

## الصفحات المتصلة بالـ Backend (30 صفحة) ✅

هذه الصفحات تستخدم `trpc` للاتصال بالـ Backend:

| # | الصفحة | المسار |
|---|--------|--------|
| 1 | AdvancedBillingDashboard | /advanced-billing |
| 2 | AdvancedCollectionDashboard | /advanced-collection |
| 3 | AdvancedInventoryDashboard | /advanced-inventory |
| 4 | AdvancedReportsDashboard | /advanced-reports |
| 5 | AssetsManagementDashboard | /assets-management |
| 6 | CustomerPortalDashboard | /customer-portal |
| 7 | DebtManagementDashboard | /debt-management |
| 8 | DataMigrationPage | /data-migration |
| 9 | DeploymentPage | /deployment |
| 10 | DiscountsList | /discounts |
| 11 | DocumentationDashboard | /documentation |
| 12 | FieldOperationsAdvancedDashboard | /field-operations-advanced |
| 13 | FieldOperationsList | /field-operations |
| 14 | InspectionsDashboard | /inspections |
| 15 | InventoryCountsList | /inventory-counts |
| 16 | MaintenanceAdvancedDashboard | /maintenance-advanced |
| 17 | MaintenanceWindowsPage | /maintenance-windows |
| 18 | SystemUpdatesPage | /system-updates |
| 19 | MaterialsEquipmentDashboard | /materials-equipment |
| 20 | SystemHealthPage | /system-health |
| 21 | RecurringInvoicesList | /recurring-invoices |
| 22 | RolesList | /roles |
| 23 | SecurityDashboard | /security |
| 24 | SettingsDashboard | /settings |
| 25 | KnowledgeBasePage | /knowledge-base |
| 26 | SupportTicketsPage | /support-tickets |
| 27 | TestingDashboard | /testing |
| 28 | TicketsList | /tickets |
| 29 | WarehousesList | /warehouses |
| 30 | ComponentShowcase | /components |

---

## الصفحات غير المتصلة بالـ Backend (74 صفحة) ⚠️

### صفحات أساسية (لا تحتاج Backend)
- Dashboard.tsx
- DashboardNew.tsx
- Home.tsx
- NotFound.tsx
- SimpleLogin.tsx

### صفحات المحاسبة (5 صفحات)
- DailyJournalsPage.tsx
- GeneralLedger.tsx
- JournalEntriesList.tsx
- NewAccountForm.tsx
- accounting/NewAccountForm.tsx

### صفحات الحسابات (5 صفحات)
- AccountDetails.tsx
- AccountTreePage.tsx
- AccountsList.tsx
- EditAccount.tsx
- NewAccountForm.tsx

### صفحات الأصول (1 صفحة)
- AssetsList.tsx

### صفحات الفوترة (2 صفحة)
- BillingReports.tsx
- NewPaymentForm.tsx

### صفحات العملاء (4 صفحات)
- AddNewCustomer.tsx
- CustomerDetails.tsx
- CustomersList.tsx
- EditCustomer.tsx

### صفحات التقارير المالية (2 صفحة)
- CashFlowStatementReport.tsx

### صفحات الموارد البشرية (3 صفحات)
- AttendanceManagement.tsx
- EmployeesList.tsx
- PayrollManagement.tsx

### صفحات المخزون (9 صفحات)
- AddInventoryMovement.tsx
- AddItem.tsx
- AddItemForm.tsx
- CategoriesList.tsx
- CurrentInventoryReport.tsx
- InventoryMovements.tsx
- ItemDetailsPage.tsx
- StockMovement.tsx
- StockMovementsList.tsx

### صفحات الفواتير (3 صفحات)
- InvoiceDetails.tsx
- InvoicesList.tsx
- NewInvoiceForm.tsx

### صفحات القيود المحاسبية (4 صفحات)
- AddJournalEntry.tsx
- BankReconciliation.tsx
- GeneralLedger.tsx
- PostJournalEntries.tsx

### صفحات الصيانة (1 صفحة)
- MaintenanceSchedule.tsx

### صفحات العدادات (1 صفحة)
- MetersList.tsx

### صفحات المراقبة (1 صفحة)
- MonitoringDashboard.tsx

### صفحات المدفوعات (3 صفحات)
- PaymentForm.tsx
- PaymentsList.tsx
- PaymentsLog.tsx

### صفحات الصلاحيات (1 صفحة)
- PermissionsManagement.tsx

### صفحات الملف الشخصي (1 صفحة)
- ProfilePage.tsx

### صفحات المشتريات (5 صفحات)
- CreatePurchaseRequest.tsx
- MaterialReceiptForm.tsx
- PurchaseOrder.tsx
- PurchaseOrdersList.tsx
- PurchaseRequestsList.tsx

### صفحات التقارير (7 صفحات)
- AccountBalancesReport.tsx
- AccountsPayableAgingReport.tsx
- AccountsReceivableAging.tsx
- BalanceSheet.tsx
- BalanceSheetReport.tsx
- CashFlow.tsx
- IncomeStatementReport.tsx

### صفحات الأدوار (1 صفحة)
- RolesManagement.tsx

### صفحات الإعدادات (1 صفحة)
- SecuritySettingsPage.tsx

### صفحات الاشتراكات (1 صفحة)
- SubscriptionsList.tsx

### صفحات الموردين (4 صفحات)
- AddSupplier.tsx
- EditSupplier.tsx
- SupplierDetails.tsx
- SuppliersList.tsx

### صفحات المستخدمين (2 صفحة)
- UsersList.tsx
- UsersManagement.tsx

### صفحات أوامر العمل (1 صفحة)
- WorkOrdersList.tsx

---

## الـ Routers المتاحة في الـ Backend (57 router)

| # | Router | الوصف |
|---|--------|-------|
| 1 | accounts.ts | الحسابات |
| 2 | advanced-billing.ts | الفوترة المتقدمة |
| 3 | advanced-collection.ts | التحصيل المتقدم |
| 4 | advanced-inventory.ts | المخزون المتقدم |
| 5 | advanced-reports.ts | التقارير المتقدمة |
| 6 | assets-advanced.ts | الأصول المتقدمة |
| 7 | assets-management.ts | إدارة الأصول |
| 8 | assets.ts | الأصول |
| 9 | attendance.ts | الحضور |
| 10 | audit.ts | التدقيق |
| 11 | customer-portal.ts | بوابة العملاء |
| 12 | customers.ts | العملاء |
| 13 | dashboard.ts | لوحة التحكم |
| 14 | data-migration.ts | هجرة البيانات |
| 15 | debt-management.ts | إدارة الديون |
| 16 | deployment.ts | النشر |
| 17 | discounts.ts | الخصومات |
| 18 | documentation.ts | التوثيق |
| 19 | employees.ts | الموظفين |
| 20 | field-operations-advanced.ts | العمليات الميدانية المتقدمة |
| 21 | field-operations.ts | العمليات الميدانية |
| 22 | inspections.ts | الفحوصات |
| 23 | inventory-counts.ts | جرد المخزون |
| 24 | inventory.ts | المخزون |
| 25 | invoices.ts | الفواتير |
| 26 | journalEntries.ts | القيود المحاسبية |
| 27 | maintenance-advanced.ts | الصيانة المتقدمة |
| 28 | maintenance.ts | الصيانة |
| 29 | materials-equipment.ts | المواد والمعدات |
| 30 | meters-advanced.ts | العدادات المتقدمة |
| 31 | meters.ts | العدادات |
| 32 | monitoring-advanced.ts | المراقبة المتقدمة |
| 33 | monitoring.ts | المراقبة |
| 34 | payments.ts | المدفوعات |
| 35 | payroll.ts | الرواتب |
| 36 | permissions.ts | الصلاحيات |
| 37 | purchases.ts | المشتريات |
| 38 | recurring-invoices.ts | الفواتير المتكررة |
| 39 | reports.ts | التقارير |
| 40 | roles.ts | الأدوار |
| 41 | security.ts | الأمان |
| 42 | settings.ts | الإعدادات |
| 43 | subscriptions-advanced.ts | الاشتراكات المتقدمة |
| 44 | subscriptions.ts | الاشتراكات |
| 45 | suppliers.ts | الموردين |
| 46 | support.ts | الدعم |
| 47 | system-health.ts | صحة النظام |
| 48 | system-maintenance.ts | صيانة النظام |
| 49 | testing.ts | الاختبارات |
| 50 | tickets.ts | التذاكر |
| 51 | users.ts | المستخدمين |
| 52 | warehouses.ts | المستودعات |
| 53 | work-orders-advanced.ts | أوامر العمل المتقدمة |
| 54 | workOrders.ts | أوامر العمل |

---

## التوصيات

### أولوية عالية (صفحات أساسية تحتاج ربط)
1. **CustomersList.tsx** - ربط مع customers router
2. **InvoicesList.tsx** - ربط مع invoices router
3. **MetersList.tsx** - ربط مع meters router
4. **PaymentsList.tsx** - ربط مع payments router
5. **SubscriptionsList.tsx** - ربط مع subscriptions router

### أولوية متوسطة
6. **EmployeesList.tsx** - ربط مع employees router
7. **AssetsList.tsx** - ربط مع assets router
8. **WorkOrdersList.tsx** - ربط مع workOrders router
9. **SuppliersList.tsx** - ربط مع suppliers router
10. **UsersList.tsx** - ربط مع users router

### أولوية منخفضة (صفحات تفصيلية)
- صفحات التفاصيل والتعديل
- صفحات التقارير
- صفحات الإضافة

---

## الخلاصة

المشروع يحتوي على **57 router** في الـ Backend جاهزة للاستخدام، لكن فقط **30 صفحة** من أصل **104** متصلة بالـ Backend حالياً.

**نسبة الاتصال: 29%**

يُنصح بربط الصفحات الأساسية (القوائم الرئيسية) بالـ Backend لتحقيق وظائف كاملة للنظام.
