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
import { sql } from "drizzle-orm";

// ====================================================================================================
// 1. البيانات الثابتة والمساعدة
// ====================================================================================================

const USER_ID = 1;
const TOTAL_RECORDS = 230; // 25 + 15 + 20 + 10 + 30 + 50 + 35 + 45

function generateDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ====================================================================================================
// 2. بيانات شجرة الحسابات (chartOfAccounts) - 25 سجل
// ====================================================================================================

const accountsData = [
  // المستوى الأول: الحسابات الرئيسية (5)
  { id: 1, accountCode: "1000", accountName: "الأصول", accountType: "asset", parentAccountId: null, isHeader: true, level: 1, isActive: true, createdBy: USER_ID, updatedBy: USER_ID },
  { id: 2, accountCode: "2000", accountName: "الخصوم", accountType: "liability", parentAccountId: null, isHeader: true, level: 1, isActive: true, createdBy: USER_ID, updatedBy: USER_ID },
  { id: 3, accountCode: "3000", accountName: "حقوق الملكية", accountType: "equity", parentAccountId: null, isHeader: true, level: 1, isActive: true, createdBy: USER_ID, updatedBy: USER_ID },
  { id: 4, accountCode: "4000", accountName: "الإيرادات", accountType: "revenue", parentAccountId: null, isHeader: true, level: 1, isActive: true, createdBy: USER_ID, updatedBy: USER_ID },
  { id: 5, accountCode: "5000", accountName: "المصروفات", accountType: "expense", parentAccountId: null, isHeader: true, level: 1, isActive: true, createdBy: USER_ID, updatedBy: USER_ID },

  // المستوى الثاني: الأصول (2)
  { id: 6, accountCode: "1100", accountName: "الأصول المتداولة", accountType: "asset", parentAccountId: 1, isHeader: true, level: 2, isActive: true, createdBy: USER_ID, updatedBy: USER_ID },
  { id: 7, accountCode: "1200", accountName: "الأصول الثابتة", accountType: "asset", parentAccountId: 1, isHeader: true, level: 2, isActive: true, createdBy: USER_ID, updatedBy: USER_ID },

  // المستوى الثالث: الأصول المتداولة (5)
  { id: 8, accountCode: "1110", accountName: "النقدية", accountType: "asset", parentAccountId: 6, isHeader: false, level: 3, isActive: true, createdBy: USER_ID, updatedBy: USER_ID },
  { id: 9, accountCode: "1120", accountName: "البنوك", accountType: "asset", parentAccountId: 6, isHeader: false, level: 3, isActive: true, createdBy: USER_ID, updatedBy: USER_ID },
  { id: 10, accountCode: "1130", accountName: "العملاء", accountType: "asset", parentAccountId: 6, isHeader: false, level: 3, isActive: true, createdBy: USER_ID, updatedBy: USER_ID },
  { id: 11, accountCode: "1140", accountName: "المخزون", accountType: "asset", parentAccountId: 6, isHeader: false, level: 3, isActive: true, createdBy: USER_ID, updatedBy: USER_ID },
  { id: 12, accountCode: "1150", accountName: "مصروفات مدفوعة مقدماً", accountType: "asset", parentAccountId: 6, isHeader: false, level: 3, isActive: true, createdBy: USER_ID, updatedBy: USER_ID },

  // المستوى الثالث: الأصول الثابتة (2)
  { id: 13, accountCode: "1210", accountName: "مباني ومعدات", accountType: "asset", parentAccountId: 7, isHeader: false, level: 3, isActive: true, createdBy: USER_ID, updatedBy: USER_ID },
  { id: 14, accountCode: "1220", accountName: "وسائل نقل", accountType: "asset", parentAccountId: 7, isHeader: false, level: 3, isActive: true, createdBy: USER_ID, updatedBy: USER_ID },

  // المستوى الثاني: الخصوم (3)
  { id: 15, accountCode: "2100", accountName: "الموردون", accountType: "liability", parentAccountId: 2, isHeader: false, level: 2, isActive: true, createdBy: USER_ID, updatedBy: USER_ID },
  { id: 16, accountCode: "2200", accountName: "قروض قصيرة الأجل", accountType: "liability", parentAccountId: 2, isHeader: false, level: 2, isActive: true, createdBy: USER_ID, updatedBy: USER_ID },
  { id: 17, accountCode: "2300", accountName: "مصروفات مستحقة", accountType: "liability", parentAccountId: 2, isHeader: false, level: 2, isActive: true, createdBy: USER_ID, updatedBy: USER_ID },

  // المستوى الثاني: حقوق الملكية (2)
  { id: 18, accountCode: "3100", accountName: "رأس المال", accountType: "equity", parentAccountId: 3, isHeader: false, level: 2, isActive: true, createdBy: USER_ID, updatedBy: USER_ID },
  { id: 19, accountCode: "3200", accountName: "الأرباح المحتجزة", accountType: "equity", parentAccountId: 3, isHeader: false, level: 2, isActive: true, createdBy: USER_ID, updatedBy: USER_ID },

  // المستوى الثاني: الإيرادات (2)
  { id: 20, accountCode: "4100", accountName: "مبيعات الكهرباء", accountType: "revenue", parentAccountId: 4, isHeader: false, level: 2, isActive: true, createdBy: USER_ID, updatedBy: USER_ID },
  { id: 21, accountCode: "4200", accountName: "إيرادات خدمات أخرى", accountType: "revenue", parentAccountId: 4, isHeader: false, level: 2, isActive: true, createdBy: USER_ID, updatedBy: USER_ID },

  // المستوى الثاني: المصروفات (4)
  { id: 22, accountCode: "5100", accountName: "مصروفات الرواتب", accountType: "expense", parentAccountId: 5, isHeader: false, level: 2, isActive: true, createdBy: USER_ID, updatedBy: USER_ID },
  { id: 23, accountCode: "5200", accountName: "مصروفات الصيانة", accountType: "expense", parentAccountId: 5, isHeader: false, level: 2, isActive: true, createdBy: USER_ID, updatedBy: USER_ID },
  { id: 24, accountCode: "5300", accountName: "مصروفات الكهرباء والمياه", accountType: "expense", parentAccountId: 5, isHeader: false, level: 2, isActive: true, createdBy: USER_ID, updatedBy: USER_ID },
  { id: 25, accountCode: "5400", accountName: "مصروفات الإيجار", accountType: "expense", parentAccountId: 5, isHeader: false, level: 2, isActive: true, createdBy: USER_ID, updatedBy: USER_ID },
]; // الإجمالي: 25 سجل

// ====================================================================================================
// 3. بيانات الأرصدة الافتتاحية (accountBalances) - 15 سجل (للحسابات غير الرئيسية)
// ====================================================================================================

// الأرصدة الافتتاحية يجب أن تكون متوازنة: الأصول (1110-1220) = الخصوم (2100-2300) + حقوق الملكية (3100-3200)
// الأصول: 1110 (8) - 1220 (14)
// الخصوم: 2100 (15) - 2300 (17)
// حقوق الملكية: 3100 (18) - 3200 (19)

const accountBalancesData = [
  // الأصول (Assets) - 7 أرصدة
  { accountId: 8, openingBalance: 50000, debitAmount: 0, creditAmount: 0, closingBalance: 50000, fiscalYear: 2024, createdBy: USER_ID, updatedBy: USER_ID }, // النقدية
  { accountId: 9, openingBalance: 150000, debitAmount: 0, creditAmount: 0, closingBalance: 150000, fiscalYear: 2024, createdBy: USER_ID, updatedBy: USER_ID }, // البنوك
  { accountId: 10, openingBalance: 75000, debitAmount: 0, creditAmount: 0, closingBalance: 75000, fiscalYear: 2024, createdBy: USER_ID, updatedBy: USER_ID }, // العملاء
  { accountId: 11, openingBalance: 120000, debitAmount: 0, creditAmount: 0, closingBalance: 120000, fiscalYear: 2024, createdBy: USER_ID, updatedBy: USER_ID }, // المخزون
  { accountId: 12, openingBalance: 10000, debitAmount: 0, creditAmount: 0, closingBalance: 10000, fiscalYear: 2024, createdBy: USER_ID, updatedBy: USER_ID }, // مصروفات مدفوعة مقدماً
  { accountId: 13, openingBalance: 300000, debitAmount: 0, creditAmount: 0, closingBalance: 300000, fiscalYear: 2024, createdBy: USER_ID, updatedBy: USER_ID }, // مباني ومعدات
  { accountId: 14, openingBalance: 50000, debitAmount: 0, creditAmount: 0, closingBalance: 50000, fiscalYear: 2024, createdBy: USER_ID, updatedBy: USER_ID }, // وسائل نقل
  // مجموع الأصول: 755,000

  // الخصوم (Liabilities) - 3 أرصدة
  { accountId: 15, openingBalance: 100000, debitAmount: 0, creditAmount: 0, closingBalance: 100000, fiscalYear: 2024, createdBy: USER_ID, updatedBy: USER_ID }, // الموردون
  { accountId: 16, openingBalance: 50000, debitAmount: 0, creditAmount: 0, closingBalance: 50000, fiscalYear: 2024, createdBy: USER_ID, updatedBy: USER_ID }, // قروض قصيرة الأجل
  { accountId: 17, openingBalance: 5000, debitAmount: 0, creditAmount: 0, closingBalance: 5000, fiscalYear: 2024, createdBy: USER_ID, updatedBy: USER_ID }, // مصروفات مستحقة
  // مجموع الخصوم: 155,000

  // حقوق الملكية (Equity) - 2 أرصدة
  { accountId: 18, openingBalance: 500000, debitAmount: 0, creditAmount: 0, closingBalance: 500000, fiscalYear: 2024, createdBy: USER_ID, updatedBy: USER_ID }, // رأس المال
  { accountId: 19, openingBalance: 100000, debitAmount: 0, creditAmount: 0, closingBalance: 100000, fiscalYear: 2024, createdBy: USER_ID, updatedBy: USER_ID }, // الأرباح المحتجزة
  // مجموع حقوق الملكية: 600,000

  // الإيرادات والمصروفات (للتوازن المبدئي فقط) - 3 أرصدة
  { accountId: 20, openingBalance: 0, debitAmount: 0, creditAmount: 0, closingBalance: 0, fiscalYear: 2024, createdBy: USER_ID, updatedBy: USER_ID }, // مبيعات الكهرباء
  { accountId: 22, openingBalance: 0, debitAmount: 0, creditAmount: 0, closingBalance: 0, fiscalYear: 2024, createdBy: USER_ID, updatedBy: USER_ID }, // مصروفات الرواتب
  { accountId: 23, openingBalance: 0, debitAmount: 0, creditAmount: 0, closingBalance: 0, fiscalYear: 2024, createdBy: USER_ID, updatedBy: USER_ID }, // مصروفات الصيانة
]; // الإجمالي: 15 سجل. التوازن: 755,000 (أصول) = 155,000 (خصوم) + 600,000 (حقوق ملكية).

// ====================================================================================================
// 4. بيانات العملاء (customers) - 20 سجل
// ====================================================================================================

const customerNames = [
  "شركة النور للكهرباء", "مؤسسة الأمان السكني", "مصنع الحديد والصلب", "مجمع الرواد التجاري", "فيلا المهندس خالد",
  "مزرعة الوديان", "مدرسة الأجيال الأهلية", "مستشفى الشفاء", "مركز تسوق العاصمة", "ورشة الصيانة السريعة",
  "منزل السيد فهد", "شقة الأستاذة سارة", "شركة التقنية المتقدمة", "فندق الواحة الخضراء", "مخبز وحلويات الريف",
  "مكتب المحاماة الدولي", "صالة الألعاب الرياضية", "مؤسسة البناء الحديث", "محل بيع الزهور", "قصر الأفراح الملكي"
];
const customerTypes = ["commercial", "residential", "industrial"];

const customersData = customerNames.map((name, index) => ({
  id: index + 1,
  customerName: name,
  customerType: customerTypes[index % customerTypes.length],
  address: `شارع ${name.split(' ')[1]}، المدينة ${getRandomInt(1, 5)}`,
  phone: `0${getRandomInt(50, 59)}${getRandomInt(1000000, 9999999)}`,
  email: `${name.split(' ')[0].toLowerCase()}@example.com`,
  isActive: true,
  createdBy: USER_ID,
  updatedBy: USER_ID,
})); // الإجمالي: 20 سجل

// ====================================================================================================
// 5. بيانات الموردين (suppliers) - 10 سجلات
// ====================================================================================================

const supplierNames = [
  "شركة الكهرباء المتقدمة", "مؤسسة قطع الغيار الأصلية", "خدمات الصيانة المتكاملة", "الشركة الدولية للمعدات", "مورد الكابلات الذهبية",
  "شركة الحلول الهندسية", "مؤسسة النقل واللوجستيات", "مورد الأدوات الصناعية", "خدمات الاستشارات الفنية", "شركة الوقود والطاقة"
];
const supplierTypes = ["equipment", "spare_parts", "services"];

const suppliersData = supplierNames.map((name, index) => ({
  id: index + 1,
  supplierName: name,
  supplierType: supplierTypes[index % supplierTypes.length],
  address: `طريق ${name.split(' ')[1]}، المنطقة الصناعية`,
  phone: `0${getRandomInt(1, 2)}${getRandomInt(100000000, 999999999)}`,
  email: `${name.split(' ')[0].toLowerCase()}@supplier.com`,
  isActive: true,
  createdBy: USER_ID,
  updatedBy: USER_ID,
})); // الإجمالي: 10 سجلات

// ====================================================================================================
// 6. بيانات الأصناف (items) - 30 سجل
// ====================================================================================================

const itemNames = [
  "محول كهربائي 100 كيلو فولت", "قاطع دائرة رئيسي 500 أمبير", "كابل نحاسي 10 مم", "عداد كهرباء ذكي", "مصباح LED صناعي",
  "مروحة تبريد للمحولات", "زيت عزل كهربائي", "مفتاح فصل ثلاثي الأطوار", "جهاز حماية من الصواعق", "بطارية تخزين طاقة",
  "صندوق توزيع كهرباء", "فيوزات متنوعة", "أدوات قياس الجهد", "قفازات عازلة", "خوذة أمان",
  "مادة لاصقة عازلة", "مفكات كهربائية", "مضخة مياه صغيرة", "مولد كهربائي احتياطي", "لوحة تحكم رقمية",
  "مكثف كهربائي", "مقاومة حرارية", "شاحن بطاريات صناعي", "منظم جهد أوتوماتيكي", "جهاز فحص الكابلات",
  "أنابيب بلاستيكية للحماية", "شريط عزل كهربائي", "مفتاح ضغط", "مقياس حرارة رقمي", "معدات لحام"
];
const itemUnits = ["قطعة", "متر", "وحدة", "لتر", "صندوق"];
const itemTypes = ["electrical_equipment", "spare_parts", "consumables", "tools"];

const itemsData = itemNames.map((name, index) => ({
  id: index + 1,
  itemName: name,
  itemCode: `ITEM-${1000 + index}`,
  unit: itemUnits[index % itemUnits.length],
  unitPrice: getRandomInt(10, 50000),
  quantityOnHand: getRandomInt(0, 50),
  reorderLevel: getRandomInt(1, 5),
  isActive: true,
  createdBy: USER_ID,
  updatedBy: USER_ID,
})); // الإجمالي: 30 سجل

// ====================================================================================================
// 7. بيانات الفواتير (invoices) - 50 سجل
// ====================================================================================================

const invoicesData = [];
for (let i = 0; i < 50; i++) {
  const totalAmount = getRandomInt(1000, 50000);
  const statusOptions = ["paid", "partial", "unpaid"];
  const status = statusOptions[getRandomInt(0, 2)];
  let paidAmount = 0;

  if (status === "paid") {
    paidAmount = totalAmount;
  } else if (status === "partial") {
    paidAmount = getRandomInt(100, totalAmount - 1);
  } else {
    paidAmount = 0;
  }

  const daysAgo = getRandomInt(1, 180);
  const invoiceDate = generateDate(daysAgo);
  const dueDate = generateDate(daysAgo - 30); // تاريخ استحقاق لاحق

  invoicesData.push({
    id: i + 1,
    invoiceNumber: `INV-2024-${String(i + 1).padStart(3, '0')}`,
    invoiceDate: invoiceDate,
    customerId: getRandomInt(1, 20), // ربط بالعملاء
    totalAmount: totalAmount,
    paidAmount: paidAmount,
    status: status,
    dueDate: dueDate,
    createdBy: USER_ID,
    updatedBy: USER_ID,
  });
} // الإجمالي: 50 سجل

// ====================================================================================================
// 8. بيانات المدفوعات (payments) - 35 سجل
// ====================================================================================================

const paymentsData = [];
const paymentMethods = ["cash", "check", "bank_transfer"];
const paymentTypes = ["receipt", "payment"];

// ننشئ مدفوعات للفواتير التي لديها رصيد مدفوع > 0
const payableInvoices = invoicesData.filter(inv => inv.paidAmount > 0);
const numPayments = 35;

for (let i = 0; i < numPayments; i++) {
  const invoice = payableInvoices[i % payableInvoices.length];
  const amount = invoice.paidAmount > 0 ? getRandomInt(100, invoice.paidAmount) : 0;
  const daysAgo = getRandomInt(1, 150);

  paymentsData.push({
    id: i + 1,
    paymentNumber: `PAY-2024-${String(i + 1).padStart(3, '0')}`,
    paymentDate: generateDate(daysAgo),
    invoiceId: invoice.id, // ربط بالفواتير
    amount: amount,
    paymentMethod: paymentMethods[getRandomInt(0, 2)],
    paymentType: "receipt", // معظمها فواتير عملاء
    notes: `دفعة رقم ${i + 1}`,
    createdBy: USER_ID,
    updatedBy: USER_ID,
  });
} // الإجمالي: 35 سجل

// ====================================================================================================
// 9. بيانات حركات المخزون (inventoryMovements) - 45 سجل
// ====================================================================================================

const inventoryMovementsData = [];
const movementTypes = ["in", "out", "adjustment"];
const numMovements = 45;

for (let i = 0; i < numMovements; i++) {
  const type = movementTypes[getRandomInt(0, 2)];
  let quantity = getRandomInt(1, 20);
  if (type === "out") {
    quantity = -quantity; // كمية سالبة للإخراج
  }

  const daysAgo = getRandomInt(1, 180);

  inventoryMovementsData.push({
    id: i + 1,
    itemId: getRandomInt(1, 30), // ربط بالأصناف
    movementType: type,
    quantity: quantity,
    movementDate: generateDate(daysAgo),
    referenceNumber: `${type.toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
    notes: `حركة مخزون من نوع ${type}`,
    createdBy: USER_ID,
    updatedBy: USER_ID,
  });
} // الإجمالي: 45 سجل

// ====================================================================================================
// 10. دالة التنفيذ الرئيسية
// ====================================================================================================

export async function seedinvoices_data() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return 0;
  }

  console.log("بدء إضافة بيانات invoices_data والبيانات المرتبطة...");

  try {
    // 1. chartOfAccounts (25 سجل)
    await db.insert(chartOfAccounts).values(accountsData);
    console.log(`✅ تم إضافة ${accountsData.length} سجل لـ chartOfAccounts`);

    // 2. accountBalances (15 سجل)
    await db.insert(accountBalances).values(accountBalancesData);
    console.log(`✅ تم إضافة ${accountBalancesData.length} سجل لـ accountBalances`);

    // 3. customers (20 سجل)
    await db.insert(customers).values(customersData);
    console.log(`✅ تم إضافة ${customersData.length} سجل لـ customers`);

    // 4. suppliers (10 سجلات)
    await db.insert(suppliers).values(suppliersData);
    console.log(`✅ تم إضافة ${suppliersData.length} سجل لـ suppliers`);

    // 5. items (30 سجل)
    await db.insert(items).values(itemsData);
    console.log(`✅ تم إضافة ${itemsData.length} سجل لـ items`);

    // 6. invoices (50 سجل)
    await db.insert(invoices).values(invoicesData);
    console.log(`✅ تم إضافة ${invoicesData.length} سجل لـ invoices`);

    // 7. payments (35 سجل)
    await db.insert(payments).values(paymentsData);
    console.log(`✅ تم إضافة ${paymentsData.length} سجل لـ payments`);

    // 8. inventoryMovements (45 سجل)
    await db.insert(inventoryMovements).values(inventoryMovementsData);
    console.log(`✅ تم إضافة ${inventoryMovementsData.length} سجل لـ inventoryMovements`);

    console.log(`\n✅ تم إضافة إجمالي ${TOTAL_RECORDS} سجل بنجاح.`);
    return TOTAL_RECORDS;
  } catch (error) {
    console.error("❌ خطأ في إضافة بيانات invoices_data:", error);
    throw error;
  }
}

// ملاحظة: تم استخدام id في البيانات لضمان ترابط Foreign Keys بشكل صحيح في Drizzle ORM
// تم حساب العدد الإجمالي للسجلات: 25 + 15 + 20 + 10 + 30 + 50 + 35 + 45 = 230 سجل.
