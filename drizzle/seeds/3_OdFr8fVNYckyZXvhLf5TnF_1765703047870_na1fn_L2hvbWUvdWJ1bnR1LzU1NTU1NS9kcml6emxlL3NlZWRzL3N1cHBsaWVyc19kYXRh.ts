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
} from "../schema"; // افتراض أن جميع الجداول مصدرة من هذا الملف

// دالة مساعدة لتوليد تواريخ عشوائية في آخر 6 أشهر
function getRandomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
const today = new Date();

// 1. بيانات chartOfAccounts (28 سجل)
const chartOfAccountsData = [
  // المستوى الأول: الرؤوس (Headers)
  { id: 1, accountCode: "1000", accountName: "الأصول", accountType: "asset", isHeader: true, level: 1, parentAccountId: null, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 2, accountCode: "2000", accountName: "الخصوم", accountType: "liability", isHeader: true, level: 1, parentAccountId: null, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 3, accountCode: "3000", accountName: "حقوق الملكية", accountType: "equity", isHeader: true, level: 1, parentAccountId: null, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 4, accountCode: "4000", accountName: "الإيرادات", accountType: "revenue", isHeader: true, level: 1, parentAccountId: null, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 5, accountCode: "5000", accountName: "المصروفات", accountType: "expense", isHeader: true, level: 1, parentAccountId: null, isActive: true, createdBy: 1, updatedBy: 1 },

  // المستوى الثاني: الأصول (Asset)
  { id: 6, accountCode: "1100", accountName: "الأصول المتداولة", accountType: "asset", isHeader: true, level: 2, parentAccountId: 1, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 7, accountCode: "1200", accountName: "الأصول الثابتة", accountType: "asset", isHeader: true, level: 2, parentAccountId: 1, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 8, accountCode: "1110", accountName: "النقدية بالصندوق", accountType: "asset", isHeader: false, level: 3, parentAccountId: 6, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 9, accountCode: "1120", accountName: "البنك", accountType: "asset", isHeader: false, level: 3, parentAccountId: 6, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 10, accountCode: "1130", accountName: "العملاء", accountType: "asset", isHeader: false, level: 3, parentAccountId: 6, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 11, accountCode: "1140", accountName: "المخزون", accountType: "asset", isHeader: false, level: 3, parentAccountId: 6, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 12, accountCode: "1210", accountName: "مباني ومعدات", accountType: "asset", isHeader: false, level: 3, parentAccountId: 7, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 13, accountCode: "1220", accountName: "مجمع إهلاك الأصول", accountType: "asset", isHeader: false, level: 3, parentAccountId: 7, isActive: true, createdBy: 1, updatedBy: 1 },

  // المستوى الثاني: الخصوم (Liability)
  { id: 14, accountCode: "2100", accountName: "الخصوم المتداولة", accountType: "liability", isHeader: true, level: 2, parentAccountId: 2, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 15, accountCode: "2200", accountName: "الخصوم طويلة الأجل", accountType: "liability", isHeader: true, level: 2, parentAccountId: 2, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 16, accountCode: "2110", accountName: "الموردون", accountType: "liability", isHeader: false, level: 3, parentAccountId: 14, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 17, accountCode: "2120", accountName: "مصروفات مستحقة", accountType: "liability", isHeader: false, level: 3, parentAccountId: 14, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 18, accountCode: "2210", accountName: "قروض بنكية", accountType: "liability", isHeader: false, level: 3, parentAccountId: 15, isActive: true, createdBy: 1, updatedBy: 1 },

  // المستوى الثاني: حقوق الملكية (Equity)
  { id: 19, accountCode: "3100", accountName: "رأس المال", accountType: "equity", isHeader: false, level: 2, parentAccountId: 3, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 20, accountCode: "3200", accountName: "الأرباح المحتجزة", accountType: "equity", isHeader: false, level: 2, parentAccountId: 3, isActive: true, createdBy: 1, updatedBy: 1 },

  // المستوى الثاني: الإيرادات (Revenue)
  { id: 21, accountCode: "4100", accountName: "إيرادات مبيعات الكهرباء", accountType: "revenue", isHeader: false, level: 2, parentAccountId: 4, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 22, accountCode: "4200", accountName: "إيرادات خدمات أخرى", accountType: "revenue", isHeader: false, level: 2, parentAccountId: 4, isActive: true, createdBy: 1, updatedBy: 1 },

  // المستوى الثاني: المصروفات (Expense)
  { id: 23, accountCode: "5100", accountName: "مصروفات التشغيل", accountType: "expense", isHeader: true, level: 2, parentAccountId: 5, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 24, accountCode: "5200", accountName: "مصروفات إدارية", accountType: "expense", isHeader: true, level: 2, parentAccountId: 5, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 25, accountCode: "5110", accountName: "مصروف الرواتب", accountType: "expense", isHeader: false, level: 3, parentAccountId: 23, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 26, accountCode: "5120", accountName: "مصروف الصيانة", accountType: "expense", isHeader: false, level: 3, parentAccountId: 23, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 27, accountCode: "5210", accountName: "مصروف الإيجار", accountType: "expense", isHeader: false, level: 3, parentAccountId: 24, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 28, accountCode: "5220", accountName: "مصروف الكهرباء والمياه", accountType: "expense", isHeader: false, level: 3, parentAccountId: 24, isActive: true, createdBy: 1, updatedBy: 1 },
];

// 2. بيانات customers (20 سجل)
const customersData = [
  { id: 1, customerName: "شركة النور للكهرباء", customerType: "commercial", address: "شارع الملك فهد، الرياض", phone: "0112345678", email: "info@alnoor.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 2, customerName: "مصنع الأمل للحديد", customerType: "industrial", address: "المنطقة الصناعية الثانية، جدة", phone: "0129876543", email: "sales@alamalsteel.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 3, customerName: "فيلا محمد العتيبي", customerType: "residential", address: "حي الياسمين، الرياض", phone: "0501234567", email: "mohamed.a@mail.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 4, customerName: "مجمع الراشد التجاري", customerType: "commercial", address: "طريق الأمير سلطان، الخبر", phone: "0135554433", email: "alrashed@complex.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 5, customerName: "مزرعة خالد القحطاني", customerType: "residential", address: "طريق القصيم الزراعي", phone: "0556789012", email: "khalid.q@farm.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 6, customerName: "شركة التقنية الحديثة", customerType: "commercial", address: "وادي الرياض للتقنية", phone: "0117778899", email: "tech@modern.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 7, customerName: "مصنع الزجاج الوطني", customerType: "industrial", address: "المدينة الصناعية، الدمام", phone: "0131234567", email: "glass@national.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 8, customerName: "شقة سارة الدوسري", customerType: "residential", address: "حي الروضة، جدة", phone: "0561122334", email: "sara.d@mail.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 9, customerName: "فندق القصر الذهبي", customerType: "commercial", address: "شارع التحلية، الرياض", phone: "0114445566", email: "goldenpalace@hotel.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 10, customerName: "مؤسسة علي الحربي للمقاولات", customerType: "commercial", address: "حي الشاطئ، الدمام", phone: "0539988776", email: "ali.h@contracting.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 11, customerName: "منزل فهد الزهراني", customerType: "residential", address: "حي العزيزية، مكة", phone: "0541002003", email: "fahad.z@mail.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 12, customerName: "شركة البناء المتقدم", customerType: "industrial", address: "المنطقة الصناعية، القصيم", phone: "063332211", email: "info@advancedbuild.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 13, customerName: "مقهى ومطعم النخيل", customerType: "commercial", address: "شارع الضباب، أبها", phone: "0178889900", email: "palmcafe@mail.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 14, customerName: "فيلا نورة العسيري", customerType: "residential", address: "حي المروج، خميس مشيط", phone: "0509998877", email: "noura.a@mail.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 15, customerName: "مصنع البتروكيماويات", customerType: "industrial", address: "الجبيل الصناعية", phone: "0136667788", email: "petrochem@jubail.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 16, customerName: "مكتبة جرير", customerType: "commercial", address: "طريق العليا، الرياض", phone: "0112223344", email: "jarir@bookstore.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 17, customerName: "منزل عبدالله السالم", customerType: "residential", address: "حي النزهة، المدينة المنورة", phone: "0591112233", email: "abdullah.s@mail.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 18, customerName: "شركة الخدمات اللوجستية", customerType: "commercial", address: "ميناء الملك عبدالله", phone: "0125556677", email: "logistics@ksa.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 19, customerName: "مصنع الأغذية الحديث", customerType: "industrial", address: "القصيم الصناعية", phone: "064445566", email: "food@modern.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 20, customerName: "فيلا هند القحطاني", customerType: "residential", address: "حي الشاطئ، جدة", phone: "0551239876", email: "hind.q@mail.com", isActive: true, createdBy: 1, updatedBy: 1 },
];

// 3. بيانات suppliers (10 سجل)
const suppliersData = [
  { id: 1, supplierName: "شركة الكهرباء المتقدمة", supplierType: "equipment", address: "طريق الملك عبدالعزيز، جدة", phone: "0126789012", email: "sales@advanced.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 2, supplierName: "مؤسسة قطع الغيار الأصلية", supplierType: "spare_parts", address: "المنطقة الصناعية، الرياض", phone: "0113456789", email: "parts@original.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 3, supplierName: "خدمات الصيانة المتكاملة", supplierType: "services", address: "حي العليا، الرياض", phone: "0502345678", email: "info@integrated.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 4, supplierName: "شركة المحولات العالمية", supplierType: "equipment", address: "الدمام الصناعية", phone: "0138765432", email: "global@transformers.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 5, supplierName: "مورد الكابلات والنحاس", supplierType: "spare_parts", address: "مكة المكرمة", phone: "0553456789", email: "cables@copper.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 6, supplierName: "شركة الحلول الهندسية", supplierType: "services", address: "الخبر الشمالية", phone: "0132109876", email: "eng@solutions.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 7, supplierName: "معدات الطاقة الشمسية", supplierType: "equipment", address: "المدينة المنورة", phone: "0541234567", email: "solar@power.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 8, supplierName: "مستودع الأدوات الصناعية", supplierType: "spare_parts", address: "القصيم", phone: "065432109", email: "tools@industrial.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 9, supplierName: "شركة الفحص والقياس", supplierType: "services", address: "أبها", phone: "0176543210", email: "test@measure.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 10, supplierName: "مورد مواد التشغيل", supplierType: "spare_parts", address: "تبوك", phone: "0598765432", email: "consumables@supply.sa", isActive: true, createdBy: 1, updatedBy: 1 },
];

// 4. بيانات items (30 سجل)
const itemsData = [
  { id: 1, itemName: "محول كهربائي 100 كيلو فولت", itemCode: "TRANS-100KV", unit: "قطعة", unitPrice: 50000, quantityOnHand: 5, reorderLevel: 2, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 2, itemName: "قاطع دائرة رئيسي 500 أمبير", itemCode: "CB-500A", unit: "قطعة", unitPrice: 15000, quantityOnHand: 10, reorderLevel: 5, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 3, itemName: "كابل نحاسي 35 مم", itemCode: "CABLE-35MM", unit: "متر", unitPrice: 150, quantityOnHand: 500, reorderLevel: 100, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 4, itemName: "مفتاح فصل ثلاثي الأطوار", itemCode: "SWITCH-3P", unit: "قطعة", unitPrice: 8000, quantityOnHand: 8, reorderLevel: 3, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 5, itemName: "مكثف تحسين معامل القدرة", itemCode: "CAP-PFC", unit: "قطعة", unitPrice: 12000, quantityOnHand: 15, reorderLevel: 5, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 6, itemName: "مقياس جهد رقمي", itemCode: "METER-VOLT", unit: "قطعة", unitPrice: 350, quantityOnHand: 25, reorderLevel: 10, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 7, itemName: "زيت محولات عازل (20 لتر)", itemCode: "OIL-TRANS", unit: "عبوة", unitPrice: 900, quantityOnHand: 50, reorderLevel: 20, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 8, itemName: "صمام أمان ضغط عالي", itemCode: "VALVE-HP", unit: "قطعة", unitPrice: 4500, quantityOnHand: 12, reorderLevel: 4, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 9, itemName: "مروحة تبريد صناعية", itemCode: "FAN-IND", unit: "قطعة", unitPrice: 2200, quantityOnHand: 18, reorderLevel: 6, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 10, itemName: "بطارية تخزين 100 أمبير", itemCode: "BATT-100AH", unit: "قطعة", unitPrice: 700, quantityOnHand: 30, reorderLevel: 10, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 11, itemName: "مقاومة حرارية", itemCode: "RES-THERM", unit: "قطعة", unitPrice: 50, quantityOnHand: 200, reorderLevel: 50, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 12, itemName: "مفتاح تحكم آلي", itemCode: "CTRL-SWITCH", unit: "قطعة", unitPrice: 1800, quantityOnHand: 7, reorderLevel: 3, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 13, itemName: "مجموعة أدوات صيانة", itemCode: "TOOL-KIT", unit: "مجموعة", unitPrice: 400, quantityOnHand: 10, reorderLevel: 5, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 14, itemName: "مادة تنظيف للمعدات", itemCode: "CLEAN-MAT", unit: "لتر", unitPrice: 80, quantityOnHand: 100, reorderLevel: 30, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 15, itemName: "جهاز حماية من الصواعق", itemCode: "LIGHT-PROT", unit: "قطعة", unitPrice: 9500, quantityOnHand: 4, reorderLevel: 1, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 16, itemName: "مصباح LED صناعي", itemCode: "LAMP-LED", unit: "قطعة", unitPrice: 120, quantityOnHand: 80, reorderLevel: 20, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 17, itemName: "صندوق توزيع كهرباء", itemCode: "BOX-DIST", unit: "قطعة", unitPrice: 3000, quantityOnHand: 10, reorderLevel: 5, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 18, itemName: "فيوز حماية 100 أمبير", itemCode: "FUSE-100A", unit: "قطعة", unitPrice: 75, quantityOnHand: 150, reorderLevel: 50, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 19, itemName: "مفتاح ضغط هيدروليكي", itemCode: "PRESS-SW", unit: "قطعة", unitPrice: 1100, quantityOnHand: 9, reorderLevel: 3, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 20, itemName: "مضخة مياه تبريد", itemCode: "PUMP-COOL", unit: "قطعة", unitPrice: 6000, quantityOnHand: 6, reorderLevel: 2, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 21, itemName: "جهاز قياس الحرارة", itemCode: "TEMP-METER", unit: "قطعة", unitPrice: 250, quantityOnHand: 20, reorderLevel: 8, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 22, itemName: "عازل بورسلين", itemCode: "INS-PORC", unit: "قطعة", unitPrice: 300, quantityOnHand: 100, reorderLevel: 40, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 23, itemName: "شاحن بطاريات صناعي", itemCode: "CHARGER-IND", unit: "قطعة", unitPrice: 4500, quantityOnHand: 5, reorderLevel: 2, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 24, itemName: "مفتاح طوارئ", itemCode: "EMERG-SW", unit: "قطعة", unitPrice: 600, quantityOnHand: 15, reorderLevel: 5, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 25, itemName: "مجموعة وصلات كابلات", itemCode: "CONN-KIT", unit: "مجموعة", unitPrice: 150, quantityOnHand: 70, reorderLevel: 20, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 26, itemName: "معدات حماية شخصية (PPE)", itemCode: "PPE-KIT", unit: "مجموعة", unitPrice: 200, quantityOnHand: 50, reorderLevel: 10, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 27, itemName: "محرك كهربائي 5 حصان", itemCode: "MOTOR-5HP", unit: "قطعة", unitPrice: 8500, quantityOnHand: 3, reorderLevel: 1, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 28, itemName: "مادة تشحيم صناعية", itemCode: "LUBE-IND", unit: "عبوة", unitPrice: 120, quantityOnHand: 90, reorderLevel: 30, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 29, itemName: "مكثف تيار متردد", itemCode: "CAP-AC", unit: "قطعة", unitPrice: 2500, quantityOnHand: 11, reorderLevel: 4, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 30, itemName: "مفتاح تحكم عن بعد", itemCode: "REMOTE-CTRL", unit: "قطعة", unitPrice: 3500, quantityOnHand: 7, reorderLevel: 3, isActive: true, createdBy: 1, updatedBy: 1 },
];

// 5. بيانات accountBalances (18 سجل) - لضمان التوازن: الأصول (1000000) = الخصوم (400000) + حقوق الملكية (600000)
const accountBalancesData = [
  // الأصول (Assets) - المجموع: 1,000,000
  { id: 1, accountId: 8, openingBalance: 50000, debitAmount: 0, creditAmount: 0, closingBalance: 50000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // النقدية بالصندوق
  { id: 2, accountId: 9, openingBalance: 200000, debitAmount: 0, creditAmount: 0, closingBalance: 200000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // البنك
  { id: 3, accountId: 10, openingBalance: 150000, debitAmount: 0, creditAmount: 0, closingBalance: 150000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // العملاء
  { id: 4, accountId: 11, openingBalance: 300000, debitAmount: 0, creditAmount: 0, closingBalance: 300000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // المخزون
  { id: 5, accountId: 12, openingBalance: 400000, debitAmount: 0, creditAmount: 0, closingBalance: 400000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // مباني ومعدات
  { id: 6, accountId: 13, openingBalance: -100000, debitAmount: 0, creditAmount: 0, closingBalance: -100000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // مجمع إهلاك (رصيد دائن)
  // 50k + 200k + 150k + 300k + 400k - 100k = 1,000,000 (إجمالي الأصول)

  // الخصوم (Liabilities) - المجموع: 400,000
  { id: 7, accountId: 16, openingBalance: -150000, debitAmount: 0, creditAmount: 0, closingBalance: -150000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // الموردون (رصيد دائن)
  { id: 8, accountId: 17, openingBalance: -50000, debitAmount: 0, creditAmount: 0, closingBalance: -50000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // مصروفات مستحقة (رصيد دائن)
  { id: 9, accountId: 18, openingBalance: -200000, debitAmount: 0, creditAmount: 0, closingBalance: -200000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // قروض بنكية (رصيد دائن)
  // 150k + 50k + 200k = 400,000 (إجمالي الخصوم)

  // حقوق الملكية (Equity) - المجموع: 600,000
  { id: 10, accountId: 19, openingBalance: -500000, debitAmount: 0, creditAmount: 0, closingBalance: -500000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // رأس المال (رصيد دائن)
  { id: 11, accountId: 20, openingBalance: -100000, debitAmount: 0, creditAmount: 0, closingBalance: -100000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // الأرباح المحتجزة (رصيد دائن)
  // 500k + 100k = 600,000 (إجمالي حقوق الملكية)
  // الأصول (1,000,000) = الخصوم (400,000) + حقوق الملكية (600,000) -> متوازن

  // أرصدة صفرية لبقية الحسابات التفصيلية
  { id: 12, accountId: 1, openingBalance: 0, debitAmount: 0, creditAmount: 0, closingBalance: 0, fiscalYear: 2024, createdBy: 1, updatedBy: 1 },
  { id: 13, accountId: 2, openingBalance: 0, debitAmount: 0, creditAmount: 0, closingBalance: 0, fiscalYear: 2024, createdBy: 1, updatedBy: 1 },
  { id: 14, accountId: 3, openingBalance: 0, debitAmount: 0, creditAmount: 0, closingBalance: 0, fiscalYear: 2024, createdBy: 1, updatedBy: 1 },
  { id: 15, accountId: 4, openingBalance: 0, debitAmount: 0, creditAmount: 0, closingBalance: 0, fiscalYear: 2024, createdBy: 1, updatedBy: 1 },
  { id: 16, accountId: 5, openingBalance: 0, debitAmount: 0, creditAmount: 0, closingBalance: 0, fiscalYear: 2024, createdBy: 1, updatedBy: 1 },
  { id: 17, accountId: 21, openingBalance: 0, debitAmount: 0, creditAmount: 0, closingBalance: 0, fiscalYear: 2024, createdBy: 1, updatedBy: 1 },
  { id: 18, accountId: 25, openingBalance: 0, debitAmount: 0, creditAmount: 0, closingBalance: 0, fiscalYear: 2024, createdBy: 1, updatedBy: 1 },
];

// 6. بيانات invoices (50 سجل)
const invoicesData = [];
const invoiceStatuses = ["paid", "partial", "unpaid"];
for (let i = 1; i <= 50; i++) {
  const totalAmount = Math.floor(Math.random() * (25000 - 5000 + 1)) + 5000;
  const status = invoiceStatuses[Math.floor(Math.random() * invoiceStatuses.length)];
  let paidAmount = 0;
  if (status === "paid") {
    paidAmount = totalAmount;
  } else if (status === "partial") {
    paidAmount = Math.floor(Math.random() * (totalAmount - 1000)) + 1000;
  }

  const invoiceDate = getRandomDate(sixMonthsAgo, today);
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + 30);

  invoicesData.push({
    id: i,
    invoiceNumber: `INV-2024-${String(i).padStart(3, '0')}`,
    invoiceDate: invoiceDate,
    customerId: Math.floor(Math.random() * 20) + 1, // من 1 إلى 20
    totalAmount: totalAmount,
    paidAmount: paidAmount,
    status: status,
    dueDate: dueDate.toISOString().split('T')[0],
    createdBy: 1,
    updatedBy: 1,
  });
}

// 7. بيانات payments (38 سجل)
const paymentsData = [];
const paymentMethods = ["cash", "check", "bank_transfer"];
const paymentTypes = ["receipt", "payment"];
const invoicesWithPartialPayment = invoicesData.filter(inv => inv.status === "partial");
const invoicesWithPaidPayment = invoicesData.filter(inv => inv.status === "paid");

// توليد دفعات (receipt) للفواتير المدفوعة جزئياً وكلياً
let paymentId = 1;
for (const inv of invoicesWithPartialPayment) {
  paymentsData.push({
    id: paymentId++,
    paymentNumber: `PAY-2024-${String(paymentId).padStart(3, '0')}`,
    paymentDate: getRandomDate(new Date(inv.invoiceDate), today),
    invoiceId: inv.id,
    amount: inv.paidAmount,
    paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    paymentType: "receipt",
    notes: "دفعة جزئية",
    createdBy: 1,
    updatedBy: 1,
  });
}

// إضافة دفعات لبعض الفواتير المدفوعة كلياً (للوصول إلى 38 دفعة)
for (let i = 0; i < 15 && i < invoicesWithPaidPayment.length; i++) {
  const inv = invoicesWithPaidPayment[i];
  paymentsData.push({
    id: paymentId++,
    paymentNumber: `PAY-2024-${String(paymentId).padStart(3, '0')}`,
    paymentDate: getRandomDate(new Date(inv.invoiceDate), today),
    invoiceId: inv.id,
    amount: inv.totalAmount,
    paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    paymentType: "receipt",
    notes: "دفعة كاملة",
    createdBy: 1,
    updatedBy: 1,
  });
}

// إضافة دفعات (payment) للموردين (لا يوجد فاتورة مرتبطة مباشرة)
for (let i = 0; i < 5; i++) {
  paymentsData.push({
    id: paymentId++,
    paymentNumber: `PAY-2024-${String(paymentId).padStart(3, '0')}`,
    paymentDate: getRandomDate(sixMonthsAgo, today),
    invoiceId: null, // لا يوجد فاتورة مرتبطة مباشرة (افتراضياً)
    amount: Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000,
    paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    paymentType: "payment",
    notes: "دفع لمورد خدمات",
    createdBy: 1,
    updatedBy: 1,
  });
}

// التأكد من أن العدد بين 35 و 40 (تم توليد 38 دفعة بالضبط)
const finalPaymentsData = paymentsData.slice(0, 38);


// 8. بيانات inventoryMovements (48 سجل)
const inventoryMovementsData = [];
const movementTypes = ["in", "out", "adjustment"];
for (let i = 1; i <= 48; i++) {
  const movementType = movementTypes[Math.floor(Math.random() * movementTypes.length)];
  let quantity = Math.floor(Math.random() * 20) + 1;
  if (movementType === "out") {
    quantity = -quantity; // كمية سالبة للإخراج
  } else if (movementType === "adjustment") {
    quantity = Math.random() > 0.5 ? quantity : -quantity; // تسوية موجبة أو سالبة
  }

  inventoryMovementsData.push({
    id: i,
    itemId: Math.floor(Math.random() * 30) + 1, // من 1 إلى 30
    movementType: movementType,
    quantity: quantity,
    movementDate: getRandomDate(sixMonthsAgo, today),
    referenceNumber: movementType === "in" ? `PO-2024-${String(i).padStart(3, '0')}` : `WO-2024-${String(i).padStart(3, '0')}`,
    notes: movementType === "in" ? "استلام من المورد" : movementType === "out" ? "صرف لعملية صيانة" : "تسوية جرد",
    createdBy: 1,
    updatedBy: 1,
  });
}

// دالة التنفيذ الرئيسية
export async function seedsuppliers_data() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return 0;
  }

  console.log("بدء إضافة بيانات تجريبية لثمانية جداول...");
  let totalRecords = 0;

  try {
    // 1. chartOfAccounts (28 سجل)
    await db.insert(chartOfAccounts).values(chartOfAccountsData);
    totalRecords += chartOfAccountsData.length;
    console.log(`✅ تم إضافة ${chartOfAccountsData.length} سجل لـ chartOfAccounts بنجاح`);

    // 2. customers (20 سجل)
    await db.insert(customers).values(customersData);
    totalRecords += customersData.length;
    console.log(`✅ تم إضافة ${customersData.length} سجل لـ customers بنجاح`);

    // 3. suppliers (10 سجل)
    await db.insert(suppliers).values(suppliersData);
    totalRecords += suppliersData.length;
    console.log(`✅ تم إضافة ${suppliersData.length} سجل لـ suppliers بنجاح`);

    // 4. items (30 سجل)
    await db.insert(items).values(itemsData);
    totalRecords += itemsData.length;
    console.log(`✅ تم إضافة ${itemsData.length} سجل لـ items بنجاح`);

    // 5. accountBalances (18 سجل)
    await db.insert(accountBalances).values(accountBalancesData);
    totalRecords += accountBalancesData.length;
    console.log(`✅ تم إضافة ${accountBalancesData.length} سجل لـ accountBalances بنجاح`);

    // 6. invoices (50 سجل)
    await db.insert(invoices).values(invoicesData);
    totalRecords += invoicesData.length;
    console.log(`✅ تم إضافة ${invoicesData.length} سجل لـ invoices بنجاح`);

    // 7. payments (38 سجل)
    await db.insert(payments).values(finalPaymentsData);
    totalRecords += finalPaymentsData.length;
    console.log(`✅ تم إضافة ${finalPaymentsData.length} سجل لـ payments بنجاح`);

    // 8. inventoryMovements (48 سجل)
    await db.insert(inventoryMovements).values(inventoryMovementsData);
    totalRecords += inventoryMovementsData.length;
    console.log(`✅ تم إضافة ${inventoryMovementsData.length} سجل لـ inventoryMovements بنجاح`);

    console.log(`✅ إجمالي السجلات المضافة: ${totalRecords}`);
    return totalRecords;
  } catch (error) {
    console.error("❌ خطأ في إضافة البيانات التجريبية:", error);
    throw error;
  }
}
