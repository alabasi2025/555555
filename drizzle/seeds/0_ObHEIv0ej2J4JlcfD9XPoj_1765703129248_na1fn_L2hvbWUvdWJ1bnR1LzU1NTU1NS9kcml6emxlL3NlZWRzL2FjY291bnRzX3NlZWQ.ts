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

// --- بيانات chartOfAccounts (28 سجل) ---
const accountsData = [
  // الأصول (Assets) - 1000
  { id: 1, accountCode: "1000", accountName: "الأصول", accountType: "asset", isHeader: true, level: 1, parentAccountId: null, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 2, accountCode: "1100", accountName: "الأصول المتداولة", accountType: "asset", isHeader: true, level: 2, parentAccountId: 1, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 3, accountCode: "1110", accountName: "النقدية بالصندوق", accountType: "asset", isHeader: false, level: 3, parentAccountId: 2, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 4, accountCode: "1120", accountName: "البنوك", accountType: "asset", isHeader: false, level: 3, parentAccountId: 2, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 5, accountCode: "1130", accountName: "العملاء", accountType: "asset", isHeader: false, level: 3, parentAccountId: 2, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 6, accountCode: "1140", accountName: "المخزون", accountType: "asset", isHeader: false, level: 3, parentAccountId: 2, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 7, accountCode: "1200", accountName: "الأصول الثابتة", accountType: "asset", isHeader: true, level: 2, parentAccountId: 1, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 8, accountCode: "1210", accountName: "معدات محطات", accountType: "asset", isHeader: false, level: 3, parentAccountId: 7, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 9, accountCode: "1220", accountName: "مباني إدارية", accountType: "asset", isHeader: false, level: 3, parentAccountId: 7, isActive: true, createdBy: 1, updatedBy: 1 },

  // الخصوم (Liabilities) - 2000
  { id: 10, accountCode: "2000", accountName: "الخصوم", accountType: "liability", isHeader: true, level: 1, parentAccountId: null, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 11, accountCode: "2100", accountName: "الخصوم المتداولة", accountType: "liability", isHeader: true, level: 2, parentAccountId: 10, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 12, accountCode: "2110", accountName: "الموردون", accountType: "liability", isHeader: false, level: 3, parentAccountId: 11, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 13, accountCode: "2120", accountName: "مصروفات مستحقة", accountType: "liability", isHeader: false, level: 3, parentAccountId: 11, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 14, accountCode: "2200", accountName: "قروض طويلة الأجل", accountType: "liability", isHeader: false, level: 2, parentAccountId: 10, isActive: true, createdBy: 1, updatedBy: 1 },

  // حقوق الملكية (Equity) - 3000
  { id: 15, accountCode: "3000", accountName: "حقوق الملكية", accountType: "equity", isHeader: true, level: 1, parentAccountId: null, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 16, accountCode: "3100", accountName: "رأس المال", accountType: "equity", isHeader: false, level: 2, parentAccountId: 15, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 17, accountCode: "3200", accountName: "الأرباح المحتجزة", accountType: "equity", isHeader: false, level: 2, parentAccountId: 15, isActive: true, createdBy: 1, updatedBy: 1 },

  // الإيرادات (Revenue) - 4000
  { id: 18, accountCode: "4000", accountName: "الإيرادات", accountType: "revenue", isHeader: true, level: 1, parentAccountId: null, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 19, accountCode: "4100", accountName: "إيرادات مبيعات الكهرباء", accountType: "revenue", isHeader: false, level: 2, parentAccountId: 18, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 20, accountCode: "4200", accountName: "إيرادات خدمات التركيب", accountType: "revenue", isHeader: false, level: 2, parentAccountId: 18, isActive: true, createdBy: 1, updatedBy: 1 },

  // المصروفات (Expenses) - 5000
  { id: 21, accountCode: "5000", accountName: "المصروفات", accountType: "expense", isHeader: true, level: 1, parentAccountId: null, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 22, accountCode: "5100", accountName: "مصروفات التشغيل", accountType: "expense", isHeader: true, level: 2, parentAccountId: 21, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 23, accountCode: "5110", accountName: "رواتب وأجور", accountType: "expense", isHeader: false, level: 3, parentAccountId: 22, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 24, accountCode: "5120", accountName: "صيانة وإصلاح", accountType: "expense", isHeader: false, level: 3, parentAccountId: 22, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 25, accountCode: "5130", accountName: "مصروفات كهرباء وماء", accountType: "expense", isHeader: false, level: 3, parentAccountId: 22, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 26, accountCode: "5200", accountName: "مصروفات إدارية", accountType: "expense", isHeader: true, level: 2, parentAccountId: 21, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 27, accountCode: "5210", accountName: "إيجار مكاتب", accountType: "expense", isHeader: false, level: 3, parentAccountId: 26, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 28, accountCode: "5220", accountName: "مصروفات تسويق", accountType: "expense", isHeader: false, level: 3, parentAccountId: 26, isActive: true, createdBy: 1, updatedBy: 1 },
];

// --- بيانات accountBalances (18 سجل) ---
// الأصول = 1,500,000
// الخصوم + حقوق الملكية = 1,500,000
const balancesData = [
  // الأصول (Assets) - 1,500,000
  { accountId: 3, openingBalance: 50000, debitAmount: 0, creditAmount: 0, closingBalance: 50000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // النقدية
  { accountId: 4, openingBalance: 300000, debitAmount: 0, creditAmount: 0, closingBalance: 300000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // البنوك
  { accountId: 5, openingBalance: 250000, debitAmount: 0, creditAmount: 0, closingBalance: 250000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // العملاء
  { accountId: 6, openingBalance: 400000, debitAmount: 0, creditAmount: 0, closingBalance: 400000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // المخزون
  { accountId: 8, openingBalance: 400000, debitAmount: 0, creditAmount: 0, closingBalance: 400000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // معدات محطات
  { accountId: 9, openingBalance: 100000, debitAmount: 0, creditAmount: 0, closingBalance: 100000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // مباني إدارية
  // المجموع الأصول: 1,500,000

  // الخصوم (Liabilities) - 500,000
  { accountId: 12, openingBalance: 0, debitAmount: 0, creditAmount: 200000, closingBalance: 200000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // الموردون
  { accountId: 13, openingBalance: 0, debitAmount: 0, creditAmount: 50000, closingBalance: 50000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // مصروفات مستحقة
  { accountId: 14, openingBalance: 0, debitAmount: 0, creditAmount: 250000, closingBalance: 250000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // قروض طويلة الأجل
  // المجموع الخصوم: 500,000

  // حقوق الملكية (Equity) - 1,000,000
  { accountId: 16, openingBalance: 0, debitAmount: 0, creditAmount: 800000, closingBalance: 800000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // رأس المال
  { accountId: 17, openingBalance: 0, debitAmount: 0, creditAmount: 200000, closingBalance: 200000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // أرباح محتجزة
  // المجموع حقوق الملكية: 1,000,000

  // الإيرادات (Revenue) - لا أرصدة افتتاحية
  { accountId: 19, openingBalance: 0, debitAmount: 0, creditAmount: 0, closingBalance: 0, fiscalYear: 2024, createdBy: 1, updatedBy: 1 },
  { accountId: 20, openingBalance: 0, debitAmount: 0, creditAmount: 0, closingBalance: 0, fiscalYear: 2024, createdBy: 1, updatedBy: 1 },

  // المصروفات (Expenses) - لا أرصدة افتتاحية
  { accountId: 23, openingBalance: 0, debitAmount: 0, creditAmount: 0, closingBalance: 0, fiscalYear: 2024, createdBy: 1, updatedBy: 1 },
  { accountId: 24, openingBalance: 0, debitAmount: 0, creditAmount: 0, closingBalance: 0, fiscalYear: 2024, createdBy: 1, updatedBy: 1 },
  { accountId: 25, openingBalance: 0, debitAmount: 0, creditAmount: 0, closingBalance: 0, fiscalYear: 2024, createdBy: 1, updatedBy: 1 },
  { accountId: 27, openingBalance: 0, debitAmount: 0, creditAmount: 0, closingBalance: 0, fiscalYear: 2024, createdBy: 1, updatedBy: 1 },
  { accountId: 28, openingBalance: 0, debitAmount: 0, creditAmount: 0, closingBalance: 0, fiscalYear: 2024, createdBy: 1, updatedBy: 1 },
];

// --- بيانات customers (20 سجل) ---
const customersData = [
  { id: 1, customerName: "شركة النور للكهرباء", customerType: "commercial", address: "شارع الملك فهد، الرياض", phone: "0112345678", email: "info@alnoor.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 2, customerName: "مصنع الأمل للصناعات", customerType: "industrial", address: "المنطقة الصناعية، جدة", phone: "0126789012", email: "sales@alamal.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 3, customerName: "فيلا محمد العتيبي", customerType: "residential", address: "حي الياسمين، الدمام", phone: "0501234567", email: "mohamed.a@mail.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 4, customerName: "مجمع الريان التجاري", customerType: "commercial", address: "طريق مكة، الرياض", phone: "0119876543", email: "alrayyan@mall.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 5, customerName: "شركة الطاقة المتجددة", customerType: "industrial", address: "وادي التقنية، الخبر", phone: "0135554433", email: "info@renewable.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 6, customerName: "منزل سارة الحربي", customerType: "residential", address: "حي الروضة، المدينة المنورة", phone: "0567890123", email: "sara.h@mail.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 7, customerName: "فندق القصر الأبيض", customerType: "commercial", address: "كورنيش جدة", phone: "0123332211", email: "whitepalace@hotel.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 8, customerName: "مصنع الحديد والصلب", customerType: "industrial", address: "الجبيل الصناعية", phone: "0138887766", email: "steel@factory.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 9, customerName: "شقة خالد الدوسري", customerType: "residential", address: "حي الشاطئ، الدمام", phone: "0554433221", email: "khaled.d@mail.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 10, customerName: "مستشفى السلام", customerType: "commercial", address: "طريق الأمير سلطان، أبها", phone: "0174445566", email: "alsalam@hospital.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 11, customerName: "شركة البناء الحديث", customerType: "commercial", address: "حي النخيل، الرياض", phone: "0117778899", email: "modern@build.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 12, customerName: "مصنع الزجاج الوطني", customerType: "industrial", address: "القصيم الصناعية", phone: "063334455", email: "glass@factory.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 13, customerName: "منزل فاطمة الزهراني", customerType: "residential", address: "حي الجامعة، مكة المكرمة", phone: "0591122334", email: "fatima.z@mail.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 14, customerName: "مركز تدريب التقنيات", customerType: "commercial", address: "طريق الملك عبدالله، الرياض", phone: "0115556677", email: "tech@center.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 15, customerName: "شركة بتروكيماويات الخليج", customerType: "industrial", address: "ينبع الصناعية", phone: "044445566", email: "gulf@petro.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 16, customerName: "فيلا عبدالله السالم", customerType: "residential", address: "حي المروج، تبوك", phone: "0532211009", email: "abdullah.s@mail.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 17, customerName: "مقهى ومطعم النخبة", customerType: "commercial", address: "شارع التحلية، جدة", phone: "0121122334", email: "elite@cafe.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 18, customerName: "مصنع الأغذية الحديثة", customerType: "industrial", address: "الخرج الصناعية", phone: "0118889900", email: "food@factory.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 19, customerName: "شقة نورة العلي", customerType: "residential", address: "حي العقيق، الرياض", phone: "0509988776", email: "noura.a@mail.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 20, customerName: "مكتب المحاماة الدولي", customerType: "commercial", address: "برج الفيصلية، الرياض", phone: "0113344556", email: "law@office.sa", isActive: true, createdBy: 1, updatedBy: 1 },
];

// --- بيانات suppliers (10 سجل) ---
const suppliersData = [
  { id: 1, supplierName: "شركة الكهرباء المتقدمة", supplierType: "equipment", address: "طريق الملك عبدالعزيز، جدة", phone: "0126789012", email: "sales@advanced.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 2, supplierName: "مؤسسة قطع الغيار الأصلية", supplierType: "spare_parts", address: "المنطقة الصناعية، الرياض", phone: "0115551122", email: "parts@original.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 3, supplierName: "خدمات الصيانة الشاملة", supplierType: "services", address: "حي العليا، الدمام", phone: "0132233445", email: "maintenance@total.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 4, supplierName: "الشركة الدولية للمحولات", supplierType: "equipment", address: "المدينة الصناعية، القصيم", phone: "0677889900", email: "trans@inter.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 5, supplierName: "مخازن الأدوات الكهربائية", supplierType: "spare_parts", address: "شارع الضباب، الرياض", phone: "0114445566", email: "tools@storage.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 6, supplierName: "شركة الاستشارات الهندسية", supplierType: "services", address: "برج المملكة، الرياض", phone: "0111122334", email: "eng@consult.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 7, supplierName: "معدات الطاقة العالية", supplierType: "equipment", address: "الجبيل الصناعية", phone: "0139988776", email: "highpower@eq.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 8, supplierName: "المورد السريع لقطع الغيار", supplierType: "spare_parts", address: "طريق الحرمين، جدة", phone: "0125566778", email: "fast@parts.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 9, supplierName: "خدمات النقل واللوجستيات", supplierType: "services", address: "ميناء الملك عبدالله", phone: "0123344556", email: "logistics@trans.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 10, supplierName: "شركة الكابلات السعودية", supplierType: "equipment", address: "الدمام الصناعية", phone: "0131122334", email: "cables@saudi.sa", isActive: true, createdBy: 1, updatedBy: 1 },
];

// --- بيانات items (30 سجل) ---
const itemsData = [
  // معدات كهربائية (10)
  { id: 1, itemName: "محول كهربائي 100 كيلو فولت", itemCode: "TRANS-100KV", unit: "قطعة", unitPrice: 50000, quantityOnHand: 5, reorderLevel: 2, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 2, itemName: "قاطع دائرة رئيسي 500 أمبير", itemCode: "CB-500A", unit: "قطعة", unitPrice: 15000, quantityOnHand: 10, reorderLevel: 5, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 3, itemName: "مولد احتياطي 1 ميجا واط", itemCode: "GEN-1MW", unit: "وحدة", unitPrice: 300000, quantityOnHand: 2, reorderLevel: 1, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 4, itemName: "كابل طاقة عالي الجهد 100 متر", itemCode: "CABLE-HV-100", unit: "لفة", unitPrice: 25000, quantityOnHand: 8, reorderLevel: 3, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 5, itemName: "لوحة تحكم ذكية PLC", itemCode: "CTRL-PLC", unit: "قطعة", unitPrice: 12000, quantityOnHand: 15, reorderLevel: 5, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 6, itemName: "مكثف تحسين معامل القدرة", itemCode: "CAP-PFC", unit: "قطعة", unitPrice: 8000, quantityOnHand: 20, reorderLevel: 10, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 7, itemName: "مفتاح فصل ثلاثي الأطوار", itemCode: "SW-3PH", unit: "قطعة", unitPrice: 4500, quantityOnHand: 30, reorderLevel: 15, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 8, itemName: "جهاز حماية من الصواعق", itemCode: "LP-DEV", unit: "قطعة", unitPrice: 7000, quantityOnHand: 12, reorderLevel: 4, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 9, itemName: "عداد كهرباء ذكي", itemCode: "METER-SMART", unit: "قطعة", unitPrice: 1500, quantityOnHand: 50, reorderLevel: 20, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 10, itemName: "منظم جهد أوتوماتيكي", itemCode: "REG-AUTO", unit: "قطعة", unitPrice: 9000, quantityOnHand: 7, reorderLevel: 3, isActive: true, createdBy: 1, updatedBy: 1 },
  // قطع غيار (10)
  { id: 11, itemName: "فيوز حماية 100 أمبير", itemCode: "FUSE-100A", unit: "صندوق", unitPrice: 500, quantityOnHand: 100, reorderLevel: 50, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 12, itemName: "مروحة تبريد للمحولات", itemCode: "FAN-TRANS", unit: "قطعة", unitPrice: 1200, quantityOnHand: 40, reorderLevel: 10, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 13, itemName: "زيت محولات عازل 20 لتر", itemCode: "OIL-INS-20L", unit: "عبوة", unitPrice: 800, quantityOnHand: 60, reorderLevel: 20, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 14, itemName: "مجموعة إصلاح قاطع", itemCode: "REPAIR-CB", unit: "مجموعة", unitPrice: 3500, quantityOnHand: 15, reorderLevel: 5, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 15, itemName: "مستشعر حرارة PT100", itemCode: "SENSOR-PT100", unit: "قطعة", unitPrice: 400, quantityOnHand: 80, reorderLevel: 30, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 16, itemName: "بطارية احتياطية للوحة التحكم", itemCode: "BATT-CTRL", unit: "قطعة", unitPrice: 600, quantityOnHand: 50, reorderLevel: 20, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 17, itemName: "وصلة كابل نحاسية", itemCode: "CONN-CU", unit: "قطعة", unitPrice: 150, quantityOnHand: 200, reorderLevel: 100, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 18, itemName: "مقاومة تحميل 10 أوم", itemCode: "RES-10OHM", unit: "قطعة", unitPrice: 50, quantityOnHand: 500, reorderLevel: 200, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 19, itemName: "مؤشر ضغط الزيت", itemCode: "GAUGE-OIL", unit: "قطعة", unitPrice: 900, quantityOnHand: 25, reorderLevel: 10, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 20, itemName: "مجموعة عوازل خزفية", itemCode: "INS-CERAMIC", unit: "مجموعة", unitPrice: 2000, quantityOnHand: 18, reorderLevel: 5, isActive: true, createdBy: 1, updatedBy: 1 },
  // مواد استهلاكية وأدوات (10)
  { id: 21, itemName: "قفازات عازلة للكهرباء", itemCode: "GLOVE-INS", unit: "زوج", unitPrice: 300, quantityOnHand: 150, reorderLevel: 50, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 22, itemName: "شريط عزل كهربائي", itemCode: "TAPE-ELEC", unit: "لفة", unitPrice: 20, quantityOnHand: 500, reorderLevel: 200, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 23, itemName: "منظف للمعدات الكهربائية", itemCode: "CLEAN-ELEC", unit: "عبوة", unitPrice: 100, quantityOnHand: 80, reorderLevel: 30, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 24, itemName: "مفتاح ربط قابل للتعديل", itemCode: "WRENCH-ADJ", unit: "قطعة", unitPrice: 150, quantityOnHand: 40, reorderLevel: 10, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 25, itemName: "جهاز قياس متعدد (أفوميتر)", itemCode: "METER-MULTI", unit: "قطعة", unitPrice: 800, quantityOnHand: 10, reorderLevel: 5, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 26, itemName: "خوذة أمان مع واقي وجه", itemCode: "HELMET-SAFE", unit: "قطعة", unitPrice: 250, quantityOnHand: 60, reorderLevel: 20, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 27, itemName: "طفاية حريق CO2", itemCode: "FIRE-CO2", unit: "وحدة", unitPrice: 600, quantityOnHand: 15, reorderLevel: 5, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 28, itemName: "مجموعة أدوات لحام", itemCode: "WELD-KIT", unit: "مجموعة", unitPrice: 1200, quantityOnHand: 8, reorderLevel: 3, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 29, itemName: "كشاف يدوي عالي الإضاءة", itemCode: "LIGHT-HAND", unit: "قطعة", unitPrice: 90, quantityOnHand: 70, reorderLevel: 25, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 30, itemName: "مادة تنظيف وتزييت", itemCode: "LUBE-CLEAN", unit: "عبوة", unitPrice: 75, quantityOnHand: 90, reorderLevel: 30, isActive: true, createdBy: 1, updatedBy: 1 },
];

// --- بيانات invoices (50 سجل) ---
const invoicesData = [];
const invoiceStatuses = ["paid", "partial", "unpaid"];
const invoiceAmounts = [15000, 2500, 50000, 120000, 8000, 35000, 90000, 18000, 6000, 150000];
const today = new Date();

for (let i = 1; i <= 50; i++) {
  const customerId = (i % 20) + 1; // 1 to 20
  const status = invoiceStatuses[i % 3];
  const totalAmount = invoiceAmounts[i % 10];
  let paidAmount = 0;
  let dueDate = new Date(today);
  dueDate.setDate(today.getDate() + 30 - (i % 10)); // Due date in the future

  let invoiceDate = new Date(today);
  invoiceDate.setMonth(today.getMonth() - Math.floor(i / 10)); // Dates over last 6 months
  invoiceDate.setDate(today.getDate() - (i % 30));

  if (status === "paid") {
    paidAmount = totalAmount;
  } else if (status === "partial") {
    paidAmount = Math.floor(totalAmount * 0.5);
  } else {
    paidAmount = 0;
  }

  invoicesData.push({
    id: i,
    invoiceNumber: `INV-2024-${String(i).padStart(3, '0')}`,
    invoiceDate: invoiceDate.toISOString().split('T')[0],
    customerId: customerId,
    totalAmount: totalAmount,
    paidAmount: paidAmount,
    status: status,
    dueDate: dueDate.toISOString().split('T')[0],
    createdBy: 1,
    updatedBy: 1,
  });
}

// --- بيانات payments (40 سجل) ---
const paymentsData = [];
const paymentMethods = ["cash", "check", "bank_transfer"];
const paymentTypes = ["receipt", "payment"];

for (let i = 1; i <= 40; i++) {
  const invoiceId = (i % 50) + 1; // 1 to 50
  const invoice = invoicesData.find(inv => inv.id === invoiceId);
  const amount = invoice.paidAmount > 0 ? (invoice.paidAmount / (Math.floor(Math.random() * 2) + 1)) : 1000; // Split partial payments or a default amount
  const paymentType = i % 2 === 0 ? "receipt" : "payment"; // Alternating receipt/payment
  const paymentDate = new Date(invoice.invoiceDate);
  paymentDate.setDate(paymentDate.getDate() + (i % 15));

  paymentsData.push({
    id: i,
    paymentNumber: `PAY-2024-${String(i).padStart(3, '0')}`,
    paymentDate: paymentDate.toISOString().split('T')[0],
    invoiceId: paymentType === "receipt" ? invoiceId : null, // Only receipts linked to invoices
    amount: amount,
    paymentMethod: paymentMethods[i % 3],
    paymentType: paymentType,
    notes: paymentType === "receipt" ? "دفعة من العميل" : "دفعة للمورد",
    createdBy: 1,
    updatedBy: 1,
  });
}

// --- بيانات inventoryMovements (50 سجل) ---
const inventoryMovementsData = [];
const movementTypes = ["in", "out", "adjustment"];

for (let i = 1; i <= 50; i++) {
  const itemId = (i % 30) + 1; // 1 to 30
  const movementType = movementTypes[i % 3];
  const quantity = movementType === "out" ? Math.floor(Math.random() * 10) + 1 : Math.floor(Math.random() * 20) + 5;
  const movementDate = new Date(today);
  movementDate.setDate(today.getDate() - (i * 2)); // Spread over time

  inventoryMovementsData.push({
    itemId: itemId,
    movementType: movementType,
    quantity: quantity,
    movementDate: movementDate.toISOString().split('T')[0],
    referenceNumber: movementType === "in" ? `PO-2024-${String(i).padStart(3, '0')}` : `SO-2024-${String(i).padStart(3, '0')}`,
    notes: movementType === "in" ? "استلام من المورد" : movementType === "out" ? "صرف لعملية صيانة" : "تسوية جرد",
    createdBy: 1,
    updatedBy: 1,
  });
}

// --- حساب العدد الإجمالي للسجلات ---
const totalRecordsCount =
  accountsData.length +
  balancesData.length +
  customersData.length +
  suppliersData.length +
  itemsData.length +
  invoicesData.length +
  paymentsData.length +
  inventoryMovementsData.length;

export async function seedaccounts_seed() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return 0;
  }

  console.log("بدء إضافة بيانات accounts_seed...");

  try {
    // 1. chartOfAccounts
    await db.insert(chartOfAccounts).values(accountsData);
    console.log(`✅ تم إضافة ${accountsData.length} سجل إلى chartOfAccounts`);

    // 2. accountBalances
    await db.insert(accountBalances).values(balancesData);
    console.log(`✅ تم إضافة ${balancesData.length} سجل إلى accountBalances`);

    // 3. customers
    await db.insert(customers).values(customersData);
    console.log(`✅ تم إضافة ${customersData.length} سجل إلى customers`);

    // 4. suppliers
    await db.insert(suppliers).values(suppliersData);
    console.log(`✅ تم إضافة ${suppliersData.length} سجل إلى suppliers`);

    // 5. items
    await db.insert(items).values(itemsData);
    console.log(`✅ تم إضافة ${itemsData.length} سجل إلى items`);

    // 6. invoices
    await db.insert(invoices).values(invoicesData);
    console.log(`✅ تم إضافة ${invoicesData.length} سجل إلى invoices`);

    // 7. payments
    await db.insert(payments).values(paymentsData);
    console.log(`✅ تم إضافة ${paymentsData.length} سجل إلى payments`);

    // 8. inventoryMovements
    await db.insert(inventoryMovements).values(inventoryMovementsData);
    console.log(`✅ تم إضافة ${inventoryMovementsData.length} سجل إلى inventoryMovements`);

    console.log(`✅ اكتملت إضافة بيانات accounts_seed. الإجمالي: ${totalRecordsCount} سجل.`);
    return totalRecordsCount;
  } catch (error) {
    console.error("❌ خطأ في إضافة بيانات accounts_seed:", error);
    throw error;
  }
}

// تصدير العدد الإجمالي للسجلات لغرض التوثيق
export const TOTAL_RECORDS_COUNT = totalRecordsCount;
