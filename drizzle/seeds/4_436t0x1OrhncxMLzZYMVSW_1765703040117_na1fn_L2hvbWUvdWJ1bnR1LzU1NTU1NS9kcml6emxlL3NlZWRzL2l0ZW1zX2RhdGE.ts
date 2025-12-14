import { getDb } from "../../server/db";
import {
  chartOfAccounts,
  accountBalances,
  customers,
  suppliers,
  items,
  invoices,
  payments,
  inventoryMovements,
} from "../schema";
import { faker } from "@faker-js/faker/locale/ar";

// تعيين اللغة العربية لـ faker
faker.setLocale("ar");

// دالة مساعدة لتوليد تاريخ عشوائي في الأشهر الستة الماضية
const randomDate = () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return faker.date.between({ from: sixMonthsAgo, to: new Date() }).toISOString().split("T")[0];
};

// ********************************************************************
// 1. بيانات chartOfAccounts (شجرة الحسابات) - 28 سجل
// ********************************************************************

const accounts_seed = [
  // المستوى الأول (رؤوس الحسابات)
  { id: 1, accountCode: "1000", accountName: "الأصول", accountType: "asset", isHeader: true, level: 1, parentAccountId: null, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 2, accountCode: "2000", accountName: "الخصوم وحقوق الملكية", accountType: "liability", isHeader: true, level: 1, parentAccountId: null, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 3, accountCode: "3000", accountName: "الإيرادات", accountType: "revenue", isHeader: true, level: 1, parentAccountId: null, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 4, accountCode: "4000", accountName: "المصروفات", accountType: "expense", isHeader: true, level: 1, parentAccountId: null, isActive: true, createdBy: 1, updatedBy: 1 },

  // المستوى الثاني والثالث (الأصول)
  { id: 5, accountCode: "1100", accountName: "الأصول المتداولة", accountType: "asset", isHeader: true, level: 2, parentAccountId: 1, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 6, accountCode: "1110", accountName: "النقدية وما في حكمها", accountType: "asset", isHeader: true, level: 3, parentAccountId: 5, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 7, accountCode: "1111", accountName: "الصندوق", accountType: "asset", isHeader: false, level: 4, parentAccountId: 6, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 8, accountCode: "1112", accountName: "البنك - الراجحي", accountType: "asset", isHeader: false, level: 4, parentAccountId: 6, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 9, accountCode: "1120", accountName: "العملاء", accountType: "asset", isHeader: false, level: 3, parentAccountId: 5, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 10, accountCode: "1130", accountName: "المخزون", accountType: "asset", isHeader: false, level: 3, parentAccountId: 5, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 11, accountCode: "1200", accountName: "الأصول الثابتة", accountType: "asset", isHeader: true, level: 2, parentAccountId: 1, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 12, accountCode: "1210", accountName: "معدات محطات", accountType: "asset", isHeader: false, level: 3, parentAccountId: 11, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 13, accountCode: "1220", accountName: "مباني ومنشآت", accountType: "asset", isHeader: false, level: 3, parentAccountId: 11, isActive: true, createdBy: 1, updatedBy: 1 },

  // المستوى الثاني والثالث (الخصوم وحقوق الملكية)
  { id: 14, accountCode: "2100", accountName: "الخصوم المتداولة", accountType: "liability", isHeader: true, level: 2, parentAccountId: 2, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 15, accountCode: "2110", accountName: "الموردون", accountType: "liability", isHeader: false, level: 3, parentAccountId: 14, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 16, accountCode: "2120", accountName: "مصروفات مستحقة", accountType: "liability", isHeader: false, level: 3, parentAccountId: 14, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 17, accountCode: "2200", accountName: "الخصوم طويلة الأجل", accountType: "liability", isHeader: true, level: 2, parentAccountId: 2, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 18, accountCode: "2210", accountName: "قروض بنكية", accountType: "liability", isHeader: false, level: 3, parentAccountId: 17, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 19, accountCode: "2300", accountName: "حقوق الملكية", accountType: "equity", isHeader: true, level: 2, parentAccountId: 2, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 20, accountCode: "2310", accountName: "رأس المال", accountType: "equity", isHeader: false, level: 3, parentAccountId: 19, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 21, accountCode: "2320", accountName: "الأرباح المحتجزة", accountType: "equity", isHeader: false, level: 3, parentAccountId: 19, isActive: true, createdBy: 1, updatedBy: 1 },

  // المستوى الثاني والثالث (الإيرادات)
  { id: 22, accountCode: "3100", accountName: "إيرادات التشغيل", accountType: "revenue", isHeader: true, level: 2, parentAccountId: 3, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 23, accountCode: "3110", accountName: "مبيعات الكهرباء (سكني)", accountType: "revenue", isHeader: false, level: 3, parentAccountId: 22, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 24, accountCode: "3120", accountName: "مبيعات الكهرباء (تجاري)", accountType: "revenue", isHeader: false, level: 3, parentAccountId: 22, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 25, accountCode: "3200", accountName: "إيرادات أخرى", accountType: "revenue", isHeader: false, level: 2, parentAccountId: 3, isActive: true, createdBy: 1, updatedBy: 1 },

  // المستوى الثاني والثالث (المصروفات)
  { id: 26, accountCode: "4100", accountName: "مصروفات التشغيل", accountType: "expense", isHeader: true, level: 2, parentAccountId: 4, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 27, accountCode: "4110", accountName: "مصروف الرواتب", accountType: "expense", isHeader: false, level: 3, parentAccountId: 26, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 28, accountCode: "4120", accountName: "مصروف الصيانة", accountType: "expense", isHeader: false, level: 3, parentAccountId: 26, isActive: true, createdBy: 1, updatedBy: 1 },
];
const accounts_count = accounts_seed.length;

// ********************************************************************
// 2. بيانات customers (العملاء) - 20 سجل
// ********************************************************************

const customerTypes = ["residential", "commercial", "industrial"];
const customers_data = Array.from({ length: 20 }, (_, i) => {
  const type = customerTypes[i % customerTypes.length];
  const name = type === "residential" ? faker.person.fullName() : `شركة ${faker.company.name()} ${i + 1}`;
  return {
    id: i + 1,
    customerName: name,
    customerType: type,
    address: faker.location.streetAddress(true),
    phone: faker.phone.number("05########"),
    email: faker.internet.email({ firstName: name.split(" ")[0] }),
    isActive: true,
    createdBy: 1,
    updatedBy: 1,
  };
});
const customers_count = customers_data.length;

// ********************************************************************
// 3. بيانات suppliers (الموردين) - 10 سجلات
// ********************************************************************

const supplierTypes = ["equipment", "spare_parts", "services"];
const suppliers_data = Array.from({ length: 10 }, (_, i) => {
  const type = supplierTypes[i % supplierTypes.length];
  return {
    id: i + 1,
    supplierName: `مورد ${faker.company.name()} ${i + 1}`,
    supplierType: type,
    address: faker.location.streetAddress(true),
    phone: faker.phone.number("011########"),
    email: faker.internet.email({ firstName: `supplier${i + 1}` }),
    isActive: true,
    createdBy: 1,
    updatedBy: 1,
  };
});
const suppliers_count = suppliers_data.length;

// ********************************************************************
// 4. بيانات items (الأصناف) - 30 سجل
// ********************************************************************

const itemTypes = ["electrical_equipment", "spare_parts", "consumables", "tools"];
const units = ["قطعة", "متر", "كيلو", "لتر", "علبة"];
const items_data = Array.from({ length: 30 }, (_, i) => {
  const type = itemTypes[i % itemTypes.length];
  const unit = units[i % units.length];
  const price = faker.number.int({ min: 100, max: 100000 });
  const quantity = faker.number.int({ min: 0, max: 50 });
  return {
    id: i + 1,
    itemName: `صنف ${faker.commerce.productName()} ${i + 1}`,
    itemCode: `ITEM-${faker.string.alphanumeric(5).toUpperCase()}`,
    unit: unit,
    unitPrice: price,
    quantityOnHand: quantity,
    reorderLevel: 5,
    isActive: true,
    createdBy: 1,
    updatedBy: 1,
  };
});
const items_count = items_data.length;

// ********************************************************************
// 5. بيانات accountBalances (الأرصدة الافتتاحية) - 18 سجل
// ********************************************************************

const assetAccounts = [7, 8, 9, 10, 12, 13];
const liabilityAccounts = [15, 16, 18];
const equityAccounts = [20, 21];

let totalAssets = 0;
let totalLiabilities = 0;

const accountBalances_data = [];
const fiscalYear = 2024;

assetAccounts.forEach((accountId) => {
  const balance = faker.number.int({ min: 50000, max: 500000 });
  totalAssets += balance;
  accountBalances_data.push({
    accountId: accountId,
    openingBalance: balance,
    debitAmount: balance,
    creditAmount: 0,
    closingBalance: balance,
    fiscalYear: fiscalYear,
    createdBy: 1,
    updatedBy: 1,
  });
});

liabilityAccounts.forEach((accountId) => {
  const balance = faker.number.int({ min: 20000, max: 200000 });
  totalLiabilities += balance;
  accountBalances_data.push({
    accountId: accountId,
    openingBalance: balance,
    debitAmount: 0,
    creditAmount: balance,
    closingBalance: balance,
    fiscalYear: fiscalYear,
    createdBy: 1,
    updatedBy: 1,
  });
});

const requiredEquity = totalAssets - totalLiabilities;
const capital = Math.floor(requiredEquity * 0.7);
const retainedEarnings = requiredEquity - capital;

accountBalances_data.push({
  accountId: 20, // رأس المال
  openingBalance: capital,
  debitAmount: 0,
  creditAmount: capital,
  closingBalance: capital,
  fiscalYear: fiscalYear,
  createdBy: 1,
  updatedBy: 1,
});
accountBalances_data.push({
  accountId: 21, // الأرباح المحتجزة
  openingBalance: retainedEarnings,
  debitAmount: 0,
  creditAmount: retainedEarnings,
  closingBalance: retainedEarnings,
  fiscalYear: fiscalYear,
  createdBy: 1,
  updatedBy: 1,
});

[23, 24, 27, 28].forEach((accountId) => {
  accountBalances_data.push({
    accountId: accountId,
    openingBalance: 0,
    debitAmount: 0,
    creditAmount: 0,
    closingBalance: 0,
    fiscalYear: fiscalYear,
    createdBy: 1,
    updatedBy: 1,
  });
});

const accountBalances_count = accountBalances_data.length;

// ********************************************************************
// 6. بيانات invoices (الفواتير) - 50 سجل
// ********************************************************************

const invoiceStatuses = ["paid", "partial", "unpaid"];
const invoices_data = Array.from({ length: 50 }, (_, i) => {
  const status = invoiceStatuses[i % invoiceStatuses.length];
  const totalAmount = faker.number.int({ min: 1000, max: 50000 });
  let paidAmount = 0;

  if (status === "paid") {
    paidAmount = totalAmount;
  } else if (status === "partial") {
    paidAmount = faker.number.int({ min: 100, max: totalAmount - 100 });
  }

  const invoiceDate = randomDate();
  const dueDate = faker.date.future({ years: 0.1, refDate: invoiceDate }).toISOString().split("T")[0];

  return {
    id: i + 1,
    invoiceNumber: `INV-${fiscalYear}-${String(i + 1).padStart(3, "0")}`,
    invoiceDate: invoiceDate,
    customerId: faker.number.int({ min: 1, max: customers_count }),
    totalAmount: totalAmount,
    paidAmount: paidAmount,
    status: status,
    dueDate: dueDate,
    createdBy: 1,
    updatedBy: 1,
  };
});
const invoices_count = invoices_data.length;

// ********************************************************************
// 7. بيانات payments (المدفوعات) - 38 سجل
// ********************************************************************

const paymentMethods = ["cash", "check", "bank_transfer"];
const payments_data = [];
let paymentId = 1;

invoices_data.forEach((invoice) => {
  if (invoice.paidAmount > 0) {
    payments_data.push({
      id: paymentId++,
      paymentNumber: `PAY-${fiscalYear}-${String(paymentId).padStart(3, "0")}`,
      paymentDate: randomDate(),
      invoiceId: invoice.id,
      amount: invoice.paidAmount,
      paymentMethod: paymentMethods[faker.number.int({ min: 0, max: 2 })],
      paymentType: "receipt",
      notes: invoice.status === "paid" ? "دفعة كاملة" : "دفعة جزئية",
      createdBy: 1,
      updatedBy: 1,
    });
  }
});

for (let i = 0; i < 10; i++) {
  payments_data.push({
    id: paymentId++,
    paymentNumber: `PAY-${fiscalYear}-${String(paymentId).padStart(3, "0")}`,
    paymentDate: randomDate(),
    invoiceId: null,
    amount: faker.number.int({ min: 500, max: 10000 }),
    paymentMethod: paymentMethods[faker.number.int({ min: 0, max: 2 })],
    paymentType: "payment",
    notes: `دفع لمورد ${suppliers_data[i % suppliers_count].supplierName}`,
    createdBy: 1,
    updatedBy: 1,
  });
}

const payments_count = payments_data.length;

// ********************************************************************
// 8. بيانات inventoryMovements (حركات المخزون) - 48 سجل
// ********************************************************************

const movementTypes = ["in", "out", "adjustment"];
const inventoryMovements_data = Array.from({ length: 48 }, (_, i) => {
  const type = movementTypes[i % movementTypes.length];
  let quantity = faker.number.int({ min: 1, max: 20 });
  if (type === "out") {
    quantity = -quantity;
  }

  return {
    id: i + 1,
    itemId: faker.number.int({ min: 1, max: items_count }),
    movementType: type,
    quantity: quantity,
    movementDate: randomDate(),
    referenceNumber: `${type.toUpperCase()}-${faker.string.alphanumeric(5).toUpperCase()}`,
    notes: type === "in" ? "استلام بضاعة" : type === "out" ? "صرف لعملية صيانة" : "تسوية جرد",
    createdBy: 1,
    updatedBy: 1,
  };
});
const inventoryMovements_count = inventoryMovements_data.length;

// ********************************************************************
// دالة Seed الرئيسية
// ********************************************************************

export async function seeditems_data() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return 0;
  }

  console.log("بدء إضافة بيانات items_data...");
  let totalRecords = 0;

  try {
    await db.insert(chartOfAccounts).values(accounts_seed);
    totalRecords += accounts_count;
    console.log(`✅ تم إضافة ${accounts_count} سجل لـ chartOfAccounts`);

    await db.insert(customers).values(customers_data);
    totalRecords += customers_count;
    console.log(`✅ تم إضافة ${customers_count} سجل لـ customers`);

    await db.insert(suppliers).values(suppliers_data);
    totalRecords += suppliers_count;
    console.log(`✅ تم إضافة ${suppliers_count} سجل لـ suppliers`);

    await db.insert(items).values(items_data);
    totalRecords += items_count;
    console.log(`✅ تم إضافة ${items_count} سجل لـ items`);

    await db.insert(accountBalances).values(accountBalances_data);
    totalRecords += accountBalances_count;
    console.log(`✅ تم إضافة ${accountBalances_count} سجل لـ accountBalances`);

    await db.insert(invoices).values(invoices_data);
    totalRecords += invoices_count;
    console.log(`✅ تم إضافة ${invoices_count} سجل لـ invoices`);

    await db.insert(payments).values(payments_data);
    totalRecords += payments_count;
    console.log(`✅ تم إضافة ${payments_count} سجل لـ payments`);

    await db.insert(inventoryMovements).values(inventoryMovements_data);
    totalRecords += inventoryMovements_count;
    console.log(`✅ تم إضافة ${inventoryMovements_count} سجل لـ inventoryMovements`);

    console.log(`✅ تم إضافة ${totalRecords} سجل إجمالي بنجاح`);
    return totalRecords;
  } catch (error) {
    console.error("❌ خطأ في إضافة بيانات items_data:", error);
    throw error;
  }
}
