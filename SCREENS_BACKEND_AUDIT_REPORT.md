# تقرير فحص الشاشات والاتصال بالـ Backend

## ملخص تنفيذي

| العنصر | العدد | النسبة |
|--------|-------|--------|
| إجمالي الصفحات | **104** | 100% |
| الصفحات التي تستورد trpc | **101** | 97% |
| الصفحات المتصلة فعلياً (تستخدم useQuery/useMutation) | **35** | 34% |
| الصفحات التي تستورد trpc لكن لا تستخدمه | **66** | 63% |
| الصفحات بدون استيراد trpc | **3** | 3% |
| الـ Routers المتاحة في Backend | **57** | - |

---

## 1. الصفحات المتصلة فعلياً بالـ Backend (35 صفحة) ✅

هذه الصفحات تستخدم `useQuery` أو `useMutation` للاتصال بالـ Backend:

### لوحات التحكم والإحصائيات
| الصفحة | الوصف |
|--------|-------|
| Dashboard.tsx | لوحة التحكم الرئيسية |
| AdvancedBillingDashboard.tsx | لوحة الفوترة المتقدمة |
| AdvancedCollectionDashboard.tsx | لوحة التحصيل المتقدمة |
| DebtManagementDashboard.tsx | لوحة إدارة الديون |
| AdvancedReportsDashboard.tsx | لوحة التقارير المتقدمة |
| AdvancedInventoryDashboard.tsx | لوحة المخزون المتقدمة |
| FieldOperationsAdvancedDashboard.tsx | لوحة العمليات الميدانية المتقدمة |
| AssetsManagementDashboard.tsx | لوحة إدارة الأصول |
| MaintenanceAdvancedDashboard.tsx | لوحة الصيانة المتقدمة |
| CustomerPortalDashboard.tsx | بوابة العملاء |
| SecurityDashboard.tsx | لوحة الأمان |
| SettingsDashboard.tsx | لوحة الإعدادات |
| TestingDashboard.tsx | لوحة الاختبارات |
| DocumentationDashboard.tsx | لوحة التوثيق |

### القوائم الرئيسية
| الصفحة | الوصف |
|--------|-------|
| CustomersList.tsx | قائمة العملاء |
| InvoicesList.tsx | قائمة الفواتير |
| RolesList.tsx | قائمة الأدوار |
| WarehousesList.tsx | قائمة المستودعات |
| RecurringInvoicesList.tsx | قائمة الفواتير المتكررة |
| DiscountsList.tsx | قائمة الخصومات |
| InventoryCountsList.tsx | قائمة جرد المخزون |
| TicketsList.tsx | قائمة التذاكر |
| FieldOperationsList.tsx | قائمة العمليات الميدانية |

### صفحات النظام
| الصفحة | الوصف |
|--------|-------|
| AccountTreePage.tsx | شجرة الحسابات |
| MaintenanceWindowsPage.tsx | نوافذ الصيانة |
| SystemUpdatesPage.tsx | تحديثات النظام |
| SystemHealthPage.tsx | صحة النظام |
| DeploymentPage.tsx | إدارة النشر |
| DataMigrationPage.tsx | هجرة البيانات |
| SupportTicketsPage.tsx | تذاكر الدعم |
| KnowledgeBasePage.tsx | قاعدة المعرفة |
| MaterialsEquipmentDashboard.tsx | المواد والمعدات |
| InspectionsDashboard.tsx | الفحوصات |
| MaintenanceSchedule.tsx | جدول الصيانة |
| ComponentShowcase.tsx | عرض المكونات |

---

## 2. الصفحات التي تحتاج ربط فعلي (66 صفحة) ⚠️

هذه الصفحات تستورد trpc لكن لا تستخدمه فعلياً (تعتمد على بيانات وهمية):

### أولوية عالية - صفحات القوائم الرئيسية
| الصفحة | الـ Router المتاح |
|--------|------------------|
| EmployeesList.tsx | ✅ employees |
| AssetsList.tsx | ✅ assets |
| AccountsList.tsx | ✅ accounts |
| AttendanceManagement.tsx | ✅ attendance |
| PayrollManagement.tsx | ✅ payroll |
| JournalEntriesList.tsx | ✅ journalEntries |

### أولوية متوسطة - صفحات المخزون
| الصفحة | الـ Router المتاح |
|--------|------------------|
| AddItem.tsx | ✅ inventory |
| AddItemForm.tsx | ✅ inventory |
| AddInventoryMovement.tsx | ✅ inventory |
| CategoriesList.tsx | ✅ inventory |
| CurrentInventoryReport.tsx | ✅ inventory |
| InventoryMovements.tsx | ✅ inventory |
| ItemDetailsPage.tsx | ✅ inventory |
| StockMovement.tsx | ✅ inventory |
| StockMovementsList.tsx | ✅ inventory |

### أولوية متوسطة - صفحات المشتريات
| الصفحة | الـ Router المتاح |
|--------|------------------|
| CreatePurchaseRequest.tsx | ✅ purchases |
| MaterialReceiptForm.tsx | ✅ purchases |
| PurchaseOrder.tsx | ✅ purchases |
| PurchaseOrdersList.tsx | ✅ purchases |
| PurchaseRequestsList.tsx | ✅ purchases |

### أولوية متوسطة - صفحات التقارير
| الصفحة | الـ Router المتاح |
|--------|------------------|
| AccountBalancesReport.tsx | ✅ reports |
| AccountsPayableAgingReport.tsx | ✅ reports |
| AccountsReceivableAging.tsx | ✅ reports |
| BalanceSheet.tsx | ✅ reports |
| BalanceSheetReport.tsx | ✅ reports |
| CashFlow.tsx | ✅ reports |
| IncomeStatementReport.tsx | ✅ reports |

### أولوية متوسطة - صفحات العملاء والموردين
| الصفحة | الـ Router المتاح |
|--------|------------------|
| AddNewCustomer.tsx | ✅ customers |
| CustomerDetails.tsx | ✅ customers |
| EditCustomer.tsx | ✅ customers |
| AddSupplier.tsx | ✅ suppliers |
| EditSupplier.tsx | ✅ suppliers |
| SupplierDetails.tsx | ✅ suppliers |

### أولوية منخفضة - صفحات أخرى
| الصفحة | الـ Router المتاح |
|--------|------------------|
| MetersList.tsx | ✅ meters |
| PaymentsList.tsx | ✅ payments |
| SubscriptionsList.tsx | ✅ subscriptions |
| WorkOrdersList.tsx | ✅ workOrders |
| SuppliersList.tsx | ✅ suppliers |
| UsersList.tsx | ✅ users |
| UsersManagement.tsx | ✅ users |
| PermissionsManagement.tsx | ✅ permissions |
| RolesManagement.tsx | ✅ roles |

---

## 3. الصفحات التي لا تحتاج Backend (3 صفحات) ℹ️

| الصفحة | السبب |
|--------|-------|
| NotFound.tsx | صفحة خطأ 404 ثابتة |
| Home.tsx | صفحة ترحيب ثابتة |
| SimpleLogin.tsx | صفحة تسجيل دخول بسيطة |

---

## 4. الـ Routers المتاحة في Backend (57 router)

```
accounts, advanced-billing, advanced-collection, advanced-inventory,
advanced-reports, assets, assets-advanced, assets-management, attendance,
audit, customer-portal, customers, dashboard, data-migration, debt-management,
deployment, discounts, documentation, employees, field-operations,
field-operations-advanced, inspections, inventory, inventory-counts, invoices,
journalEntries, maintenance, maintenance-advanced, materials-equipment,
meters, meters-advanced, monitoring, monitoring-advanced, payments, payroll,
permissions, purchases, recurring-invoices, reports, roles, security, settings,
subscriptions, subscriptions-advanced, suppliers, support, system-health,
system-maintenance, testing, tickets, users, warehouses, work-orders-advanced,
workOrders
```

---

## 5. التوصيات

### المطلوب لإكمال الربط الفعلي:

1. **أولوية عالية (6 صفحات):**
   - EmployeesList, AssetsList, AccountsList
   - AttendanceManagement, PayrollManagement, JournalEntriesList

2. **أولوية متوسطة (25 صفحة):**
   - صفحات المخزون (9)
   - صفحات المشتريات (5)
   - صفحات التقارير (7)
   - صفحات العملاء والموردين (6)

3. **أولوية منخفضة (35 صفحة):**
   - صفحات التفاصيل والنماذج

### الوقت المقدر للإكمال:
- أولوية عالية: 1-2 ساعة
- أولوية متوسطة: 3-4 ساعات
- أولوية منخفضة: 4-6 ساعات
- **الإجمالي: 8-12 ساعة**

---

## 6. الخلاصة

| الحالة | العدد | النسبة |
|--------|-------|--------|
| ✅ متصل فعلياً | 35 | 34% |
| ⚠️ يحتاج ربط | 66 | 63% |
| ℹ️ لا يحتاج | 3 | 3% |

**ملاحظة:** جميع الـ Routers المطلوبة موجودة في الـ Backend، المطلوب فقط تحديث الصفحات لاستخدامها.

---

*تاريخ التقرير: $(date)*
