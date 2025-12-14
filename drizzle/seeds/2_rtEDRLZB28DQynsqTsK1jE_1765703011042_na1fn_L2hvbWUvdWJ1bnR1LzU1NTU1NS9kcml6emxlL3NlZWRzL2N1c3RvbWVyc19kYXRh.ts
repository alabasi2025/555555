import { getDb } from "../../server/db";
import { 
  chartOfAccounts, 
  accountBalances, 
  customers, 
  suppliers, 
  items, 
  invoices, 
  payments, 
  inventoryMovements 
} from "../schema";
import { sql } from "drizzle-orm";

// --- بيانات مساعدة ---

// 1. بيانات العملاء (20 عميل)
const customersData = [
  { customerName: "شركة النور للكهرباء", customerType: "commercial", address: "شارع الملك فهد، الرياض", phone: "0112345678", email: "info@alnoor.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { customerName: "مؤسسة الأمان الصناعية", customerType: "industrial", address: "المنطقة الصناعية، جدة", phone: "0126789012", email: "safety@alamans.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { customerName: "فيلا محمد العتيبي", customerType: "residential", address: "حي النخيل، الدمام", phone: "0501234567", email: "mohamed.a@mail.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { customerName: "مجمع الرياض التجاري", customerType: "commercial", address: "طريق مكة، الرياض", phone: "0119876543", email: "riyadh.mall@mall.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { customerName: "مصنع الشرق للزجاج", customerType: "industrial", address: "الجبيل الصناعية", phone: "0135554433", email: "eastglass@factory.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { customerName: "شقة سارة الخالد", customerType: "residential", address: "حي الروضة، الخبر", phone: "0556789012", email: "sara.k@mail.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { customerName: "شركة التقنية المتقدمة", customerType: "commercial", address: "وادي الظهران للتقنية", phone: "0132221100", email: "advtech@tech.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { customerName: "مستشفى السلام الأهلي", customerType: "commercial", address: "شارع التخصصي، الرياض", phone: "0117778899", email: "alsalam@hospital.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { customerName: "مزرعة فهد القحطاني", customerType: "residential", address: "القصيم، بريدة", phone: "0534567890", email: "fahad.q@mail.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { customerName: "شركة بتروكيماويات الخليج", customerType: "industrial", address: "ينبع الصناعية", phone: "0141234567", email: "gulfpetro@chem.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { customerName: "مطعم المذاق الأصيل", customerType: "commercial", address: "حي الشاطئ، جدة", phone: "0123332211", email: "almathaq@rest.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { customerName: "فيلا نورة السعد", customerType: "residential", address: "حي الياسمين، الرياض", phone: "0509998877", email: "noura.s@mail.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { customerName: "مدرسة الأجيال الحديثة", customerType: "commercial", address: "حي الورود، مكة", phone: "0124445566", email: "alajyal@school.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { customerName: "مصنع الأنابيب المعدنية", customerType: "industrial", address: "المنطقة الصناعية الثانية، الرياض", phone: "0116667788", email: "metalpipe@factory.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { customerName: "شقة خالد الدوسري", customerType: "residential", address: "حي العزيزية، المدينة المنورة", phone: "0551112233", email: "khalid.d@mail.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { customerName: "فندق القصر الذهبي", customerType: "commercial", address: "كورنيش جدة", phone: "0128889900", email: "goldenpalace@hotel.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { customerName: "شركة خدمات حقول النفط", customerType: "industrial", address: "الظهران", phone: "0131110099", email: "oilfield@services.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { customerName: "فيلا فاطمة الزهراني", customerType: "residential", address: "حي الحمراء، الرياض", phone: "0503334455", email: "fatima.z@mail.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { customerName: "مركز صيانة السيارات", customerType: "commercial", address: "طريق خريص، الرياض", phone: "0115556677", email: "carcare@center.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { customerName: "مصنع البلاستيك الحديث", customerType: "industrial", address: "القصيم، عنيزة", phone: "0537778899", email: "modernplastic@factory.sa", isActive: true, createdBy: 1, updatedBy: 1 },
];

// 2. بيانات الموردين (10 موردين)
const suppliersData = [
  { supplierName: "شركة الكهرباء المتقدمة", supplierType: "equipment", address: "طريق الملك عبدالعزيز، جدة", phone: "0126789012", email: "sales@advanced.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { supplierName: "مؤسسة قطع الغيار العالمية", supplierType: "parts", address: "المنطقة الصناعية، الرياض", phone: "0112233445", email: "parts@global.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { supplierName: "خدمات الصيانة المتكاملة", supplierType: "services", address: "حي المروج، الدمام", phone: "0135566778", email: "maintenance@integrated.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { supplierName: "شركة الكابلات السعودية", supplierType: "equipment", address: "المدينة الصناعية، الخبر", phone: "0131122334", email: "cables@saudi.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { supplierName: "مورد مواد البناء", supplierType: "parts", address: "شارع الأمير سلطان، مكة", phone: "0124455667", email: "building@supplier.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { supplierName: "شركة حلول الطاقة", supplierType: "services", address: "حي العليا، الرياض", phone: "0118899001", email: "energy@solutions.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { supplierName: "معدات السلامة", supplierType: "equipment", address: "طريق الملك عبدالله، جدة", phone: "0127788990", email: "safety@equip.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { supplierName: "مؤسسة النقل واللوجستيات", supplierType: "services", address: "المنطقة اللوجستية، الدمام", phone: "0139900112", email: "logistics@trans.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { supplierName: "شركة أدوات القياس", supplierType: "parts", address: "حي السليمانية، الرياض", phone: "0113344556", email: "measuring@tools.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { supplierName: "مورد مواد التشغيل", supplierType: "parts", address: "المدينة المنورة", phone: "0554433221", email: "operation@supplies.sa", isActive: true, createdBy: 1, updatedBy: 1 },
];

// 3. بيانات الأصناف (30 صنف)
const itemsData = [
  // معدات كهربائية (Equipment)
  { itemName: "محول كهربائي 100 كيلو فولت", itemCode: "TRANS-100KV", unit: "قطعة", unitPrice: 50000, quantityOnHand: 5, reorderLevel: 2, isActive: true, createdBy: 1, updatedBy: 1 },
  { itemName: "قاطع دائرة رئيسي 500 أمبير", itemCode: "CB-500A", unit: "قطعة", unitPrice: 15000, quantityOnHand: 10, reorderLevel: 5, isActive: true, createdBy: 1, updatedBy: 1 },
  { itemName: "كابل نحاسي 185 مم2", itemCode: "CABLE-185", unit: "متر", unitPrice: 350, quantityOnHand: 500, reorderLevel: 100, isActive: true, createdBy: 1, updatedBy: 1 },
  { itemName: "عداد كهرباء ذكي", itemCode: "METER-SMART", unit: "قطعة", unitPrice: 800, quantityOnHand: 200, reorderLevel: 50, isActive: true, createdBy: 1, updatedBy: 1 },
  { itemName: "مفتاح فصل 33 كيلو فولت", itemCode: "DS-33KV", unit: "قطعة", unitPrice: 25000, quantityOnHand: 3, reorderLevel: 1, isActive: true, createdBy: 1, updatedBy: 1 },
  // قطع غيار (Parts)
  { itemName: "زيت محولات عازل", itemCode: "OIL-INSUL", unit: "لتر", unitPrice: 50, quantityOnHand: 1000, reorderLevel: 200, isActive: true, createdBy: 1, updatedBy: 1 },
  { itemName: "صمام أمان للمحول", itemCode: "VALVE-SAFE", unit: "قطعة", unitPrice: 1200, quantityOnHand: 20, reorderLevel: 5, isActive: true, createdBy: 1, updatedBy: 1 },
  { itemName: "فيوز حماية 10 أمبير", itemCode: "FUSE-10A", unit: "قطعة", unitPrice: 5, quantityOnHand: 5000, reorderLevel: 1000, isActive: true, createdBy: 1, updatedBy: 1 },
  { itemName: "مكثف تحسين القدرة", itemCode: "CAP-PFC", unit: "قطعة", unitPrice: 3000, quantityOnHand: 15, reorderLevel: 3, isActive: true, createdBy: 1, updatedBy: 1 },
  { itemName: "مروحة تبريد للمحطة", itemCode: "FAN-COOL", unit: "قطعة", unitPrice: 8000, quantityOnHand: 8, reorderLevel: 2, isActive: true, createdBy: 1, updatedBy: 1 },
  // مواد استهلاكية (Consumables)
  { itemName: "قفازات عازلة للكهرباء", itemCode: "GLOVE-INSUL", unit: "زوج", unitPrice: 150, quantityOnHand: 100, reorderLevel: 20, isActive: true, createdBy: 1, updatedBy: 1 },
  { itemName: "شريط عزل كهربائي", itemCode: "TAPE-ELEC", unit: "لفة", unitPrice: 10, quantityOnHand: 500, reorderLevel: 100, isActive: true, createdBy: 1, updatedBy: 1 },
  { itemName: "منظف للمعدات", itemCode: "CLEANER-EQ", unit: "علبة", unitPrice: 45, quantityOnHand: 80, reorderLevel: 15, isActive: true, createdBy: 1, updatedBy: 1 },
  { itemName: "بطارية احتياطية", itemCode: "BATT-BACKUP", unit: "قطعة", unitPrice: 600, quantityOnHand: 30, reorderLevel: 10, isActive: true, createdBy: 1, updatedBy: 1 },
  { itemName: "ورق تسجيل بيانات", itemCode: "PAPER-REC", unit: "حزمة", unitPrice: 20, quantityOnHand: 200, reorderLevel: 50, isActive: true, createdBy: 1, updatedBy: 1 },
  // أدوات (Tools)
  { itemName: "جهاز قياس متعدد", itemCode: "TOOL-MULTI", unit: "قطعة", unitPrice: 1500, quantityOnHand: 10, reorderLevel: 3, isActive: true, createdBy: 1, updatedBy: 1 },
  { itemName: "مفتاح عزم", itemCode: "TOOL-TORQUE", unit: "قطعة", unitPrice: 3500, quantityOnHand: 5, reorderLevel: 1, isActive: true, createdBy: 1, updatedBy: 1 },
  { itemName: "عدة لحام كابلات", itemCode: "TOOL-WELD", unit: "عدة", unitPrice: 12000, quantityOnHand: 2, reorderLevel: 1, isActive: true, createdBy: 1, updatedBy: 1 },
  { itemName: "منشار كهربائي", itemCode: "TOOL-SAW", unit: "قطعة", unitPrice: 900, quantityOnHand: 7, reorderLevel: 2, isActive: true, createdBy: 1, updatedBy: 1 },
  { itemName: "سلم عازل 5 متر", itemCode: "TOOL-LADDER", unit: "قطعة", unitPrice: 4000, quantityOnHand: 4, reorderLevel: 1, isActive: true, createdBy: 1, updatedBy: 1 },
  // 10 أصناف إضافية للتنوع
  { itemName: "مقاوم حراري", itemCode: "RES-THERM", unit: "قطعة", unitPrice: 50, quantityOnHand: 1000, reorderLevel: 200, isActive: true, createdBy: 1, updatedBy: 1 },
  { itemName: "مؤشر جهد", itemCode: "IND-VOLT", unit: "قطعة", unitPrice: 250, quantityOnHand: 50, reorderLevel: 10, isActive: true, createdBy: 1, updatedBy: 1 },
  { itemName: "صندوق توصيل", itemCode: "BOX-CONN", unit: "قطعة", unitPrice: 180, quantityOnHand: 150, reorderLevel: 30, isActive: true, createdBy: 1, updatedBy: 1 },
  { itemName: "حساس حرارة", itemCode: "SENSOR-TEMP", unit: "قطعة", unitPrice: 75, quantityOnHand: 200, reorderLevel: 40, isActive: true, createdBy: 1, updatedBy: 1 },
  { itemName: "مضخة زيت", itemCode: "PUMP-OIL", unit: "قطعة", unitPrice: 6000, quantityOnHand: 6, reorderLevel: 2, isActive: true, createdBy: 1, updatedBy: 1 },
  { itemName: "مفتاح تحكم", itemCode: "SWITCH-CTRL", unit: "قطعة", unitPrice: 120, quantityOnHand: 300, reorderLevel: 60, isActive: true, createdBy: 1, updatedBy: 1 },
  { itemName: "لوحة تحكم فرعية", itemCode: "PANEL-SUB", unit: "قطعة", unitPrice: 9000, quantityOnHand: 4, reorderLevel: 1, isActive: true, createdBy: 1, updatedBy: 1 },
  { itemName: "أداة فحص الكابلات", itemCode: "TOOL-TEST", unit: "قطعة", unitPrice: 7000, quantityOnHand: 3, reorderLevel: 1, isActive: true, createdBy: 1, updatedBy: 1 },
  { itemName: "مادة مانعة للتسرب", itemCode: "SEAL-MAT", unit: "علبة", unitPrice: 90, quantityOnHand: 120, reorderLevel: 25, isActive: true, createdBy: 1, updatedBy: 1 },
  { itemName: "مصباح إشارة", itemCode: "LAMP-IND", unit: "قطعة", unitPrice: 30, quantityOnHand: 400, reorderLevel: 80, isActive: true, createdBy: 1, updatedBy: 1 },
];

// 4. بيانات شجرة الحسابات (30 حساب)
const accountsData = [
  // المستوى 1 (رؤوس الحسابات)
  { id: 1, accountCode: "1000", accountName: "الأصول", accountType: "asset", isHeader: true, level: 1, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: null },
  { id: 2, accountCode: "2000", accountName: "الخصوم", accountType: "liability", isHeader: true, level: 1, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: null },
  { id: 3, accountCode: "3000", accountName: "حقوق الملكية", accountType: "equity", isHeader: true, level: 1, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: null },
  { id: 4, accountCode: "4000", accountName: "الإيرادات", accountType: "revenue", isHeader: true, level: 1, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: null },
  { id: 5, accountCode: "5000", accountName: "المصروفات", accountType: "expense", isHeader: true, level: 1, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: null },
  
  // المستوى 2 (تحت الأصول)
  { id: 6, accountCode: "1100", accountName: "الأصول المتداولة", accountType: "asset", isHeader: true, level: 2, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: 1 },
  { id: 7, accountCode: "1200", accountName: "الأصول الثابتة", accountType: "asset", isHeader: true, level: 2, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: 1 },
  
  // المستوى 3 (تحت الأصول المتداولة)
  { id: 8, accountCode: "1110", accountName: "النقدية بالصندوق", accountType: "asset", isHeader: false, level: 3, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: 6 },
  { id: 9, accountCode: "1120", accountName: "البنك الأهلي", accountType: "asset", isHeader: false, level: 3, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: 6 },
  { id: 10, accountCode: "1130", accountName: "العملاء", accountType: "asset", isHeader: true, level: 3, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: 6 },
  { id: 11, accountCode: "1140", accountName: "المخزون", accountType: "asset", isHeader: true, level: 3, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: 6 },
  
  // المستوى 4 (حسابات فرعية)
  { id: 12, accountCode: "1131", accountName: "عملاء سكني", accountType: "asset", isHeader: false, level: 4, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: 10 },
  { id: 13, accountCode: "1132", accountName: "عملاء تجاري", accountType: "asset", isHeader: false, level: 4, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: 10 },
  { id: 14, accountCode: "1141", accountName: "مخزون معدات", accountType: "asset", isHeader: false, level: 4, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: 11 },
  
  // المستوى 3 (تحت الأصول الثابتة)
  { id: 15, accountCode: "1210", accountName: "مباني ومحطات", accountType: "asset", isHeader: false, level: 3, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: 7 },
  { id: 16, accountCode: "1220", accountName: "آلات ومعدات", accountType: "asset", isHeader: false, level: 3, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: 7 },
  
  // المستوى 2 (تحت الخصوم)
  { id: 17, accountCode: "2100", accountName: "الخصوم المتداولة", accountType: "liability", isHeader: true, level: 2, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: 2 },
  { id: 18, accountCode: "2200", accountName: "قروض طويلة الأجل", accountType: "liability", isHeader: false, level: 2, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: 2 },
  
  // المستوى 3 (تحت الخصوم المتداولة)
  { id: 19, accountCode: "2110", accountName: "الموردون", accountType: "liability", isHeader: false, level: 3, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: 17 },
  { id: 20, accountCode: "2120", accountName: "مصروفات مستحقة", accountType: "liability", isHeader: false, level: 3, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: 17 },
  
  // المستوى 2 (تحت حقوق الملكية)
  { id: 21, accountCode: "3100", accountName: "رأس المال", accountType: "equity", isHeader: false, level: 2, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: 3 },
  { id: 22, accountCode: "3200", accountName: "الأرباح المحتجزة", accountType: "equity", isHeader: false, level: 2, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: 3 },
  
  // المستوى 2 (تحت الإيرادات)
  { id: 23, accountCode: "4100", accountName: "إيرادات مبيعات الكهرباء", accountType: "revenue", isHeader: false, level: 2, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: 4 },
  { id: 24, accountCode: "4200", accountName: "إيرادات خدمات", accountType: "revenue", isHeader: false, level: 2, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: 4 },
  
  // المستوى 2 (تحت المصروفات)
  { id: 25, accountCode: "5100", accountName: "مصروفات الرواتب", accountType: "expense", isHeader: false, level: 2, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: 5 },
  { id: 26, accountCode: "5200", accountName: "مصروفات الصيانة", accountType: "expense", isHeader: false, level: 2, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: 5 },
  { id: 27, accountCode: "5300", accountName: "مصروفات الإيجار", accountType: "expense", isHeader: false, level: 2, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: 5 },
  { id: 28, accountCode: "5400", accountName: "مصروفات الكهرباء والماء", accountType: "expense", isHeader: false, level: 2, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: 5 },
  { id: 29, accountCode: "5500", accountName: "مصروفات تسويق", accountType: "expense", isHeader: false, level: 2, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: 5 },
  { id: 30, accountCode: "5600", accountName: "مصروفات أخرى", accountType: "expense", isHeader: false, level: 2, isActive: true, createdBy: 1, updatedBy: 1, parentAccountId: 5 },
];

// 5. بيانات الأرصدة الافتتاحية (20 رصيد)
// الأصول = 1,000,000
// الخصوم + حقوق الملكية = 1,000,000
const accountBalancesData = [
  // الأصول (11 حساب)
  { accountId: 8, openingBalance: 50000, debitAmount: 0, creditAmount: 0, closingBalance: 50000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // نقدية
  { accountId: 9, openingBalance: 300000, debitAmount: 0, creditAmount: 0, closingBalance: 300000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // بنك
  { accountId: 12, openingBalance: 100000, debitAmount: 0, creditAmount: 0, closingBalance: 100000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // عملاء سكني
  { accountId: 13, openingBalance: 150000, debitAmount: 0, creditAmount: 0, closingBalance: 150000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // عملاء تجاري
  { accountId: 14, openingBalance: 200000, debitAmount: 0, creditAmount: 0, closingBalance: 200000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // مخزون معدات
  { accountId: 15, openingBalance: 1000000, debitAmount: 0, creditAmount: 0, closingBalance: 1000000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // مباني
  { accountId: 16, openingBalance: 500000, debitAmount: 0, creditAmount: 0, closingBalance: 500000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // آلات ومعدات
  // الخصوم وحقوق الملكية (9 حسابات)
  { accountId: 19, openingBalance: -200000, debitAmount: 0, creditAmount: 0, closingBalance: -200000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // موردون
  { accountId: 20, openingBalance: -50000, debitAmount: 0, creditAmount: 0, closingBalance: -50000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // مصروفات مستحقة
  { accountId: 18, openingBalance: -300000, debitAmount: 0, creditAmount: 0, closingBalance: -300000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // قروض طويلة
  { accountId: 21, openingBalance: -1500000, debitAmount: 0, creditAmount: 0, closingBalance: -1500000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // رأس المال
  { accountId: 22, openingBalance: -250000, debitAmount: 0, creditAmount: 0, closingBalance: -250000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // أرباح محتجزة
  // إيرادات ومصروفات (للتوازن)
  { accountId: 23, openingBalance: 0, debitAmount: 0, creditAmount: 0, closingBalance: 0, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // إيرادات مبيعات
  { accountId: 24, openingBalance: 0, debitAmount: 0, creditAmount: 0, closingBalance: 0, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // إيرادات خدمات
  { accountId: 25, openingBalance: 0, debitAmount: 0, creditAmount: 0, closingBalance: 0, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // رواتب
  { accountId: 26, openingBalance: 0, debitAmount: 0, creditAmount: 0, closingBalance: 0, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // صيانة
  { accountId: 27, openingBalance: 0, debitAmount: 0, creditAmount: 0, closingBalance: 0, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // إيجار
  { accountId: 28, openingBalance: 0, debitAmount: 0, creditAmount: 0, closingBalance: 0, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // كهرباء وماء
  { accountId: 29, openingBalance: 0, debitAmount: 0, creditAmount: 0, closingBalance: 0, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // تسويق
  { accountId: 30, openingBalance: 0, debitAmount: 0, creditAmount: 0, closingBalance: 0, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // أخرى
];

// 6. بيانات الفواتير (50 فاتورة)
const invoicesData = [];
const invoiceStatuses = ["paid", "partial", "unpaid"];
const baseDate = new Date("2024-07-01"); // آخر 6 أشهر من يوليو 2024

for (let i = 1; i <= 50; i++) {
  const customerId = (i % 20) + 1; // 1 to 20
  const totalAmount = Math.floor(Math.random() * (25000 - 500 + 1)) + 500; // 500 to 25000
  const status = invoiceStatuses[Math.floor(Math.random() * invoiceStatuses.length)];
  let paidAmount = 0;

  if (status === "paid") {
    paidAmount = totalAmount;
  } else if (status === "partial") {
    paidAmount = Math.floor(Math.random() * (totalAmount - 100)) + 100;
  } else {
    paidAmount = 0;
  }

  // تواريخ متنوعة (آخر 6 أشهر)
  const daysAgo = Math.floor(Math.random() * 180); // 0 to 179 days ago
  const invoiceDate = new Date(baseDate);
  invoiceDate.setDate(baseDate.getDate() - daysAgo);
  
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(invoiceDate.getDate() + 30); // Due in 30 days

  invoicesData.push({
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

// 7. بيانات المدفوعات (40 دفعة)
const paymentsData = [];
const paymentMethods = ["cash", "check", "bank_transfer"];
const paymentTypes = ["receipt", "payment"];

// نربط المدفوعات بالفواتير التي لها رصيد مدفوع (paidAmount > 0)
const payableInvoices = invoicesData.filter(inv => inv.paidAmount > 0);

for (let i = 1; i <= 40; i++) {
  const invoiceIndex = Math.floor(Math.random() * payableInvoices.length);
  const invoice = payableInvoices[invoiceIndex];
  
  // نستخدم رقم الفاتورة كـ invoiceId مؤقت، وسنقوم بتحديثه لاحقاً
  const invoiceId = i % 50 + 1; 
  const amount = invoice.paidAmount > 0 ? Math.floor(Math.random() * invoice.paidAmount) + 1 : Math.floor(Math.random() * 10000) + 100;
  
  const daysAgo = Math.floor(Math.random() * 180);
  const paymentDate = new Date(baseDate);
  paymentDate.setDate(baseDate.getDate() - daysAgo);

  paymentsData.push({
    paymentNumber: `PAY-2024-${String(i).padStart(3, '0')}`,
    paymentDate: paymentDate.toISOString().split('T')[0],
    invoiceId: invoiceId, // سيتم تحديثه بعد إدخال الفواتير
    amount: amount,
    paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    paymentType: paymentTypes[Math.floor(Math.random() * paymentMethods.length)],
    notes: "دفعة على الحساب",
    createdBy: 1,
    updatedBy: 1,
  });
}

// 8. بيانات حركات المخزون (50 حركة)
const inventoryMovementsData = [];
const movementTypes = ["in", "out", "adjustment"];

for (let i = 1; i <= 50; i++) {
  const itemId = (i % 30) + 1; // 1 to 30
  const movementType = movementTypes[Math.floor(Math.random() * movementTypes.length)];
  let quantity = Math.floor(Math.random() * 50) + 1; // 1 to 50

  if (movementType === "out") {
    quantity = -quantity; // كمية سالبة للإخراج
  } else if (movementType === "adjustment") {
    quantity = Math.random() > 0.5 ? quantity : -quantity; // تسوية موجبة أو سالبة
  }

  const daysAgo = Math.floor(Math.random() * 180);
  const movementDate = new Date(baseDate);
  movementDate.setDate(baseDate.getDate() - daysAgo);

  inventoryMovementsData.push({
    itemId: itemId,
    movementType: movementType,
    quantity: quantity,
    movementDate: movementDate.toISOString().split('T')[0],
    referenceNumber: movementType === "in" ? `PO-2024-${String(i).padStart(3, '0')}` : `WO-2024-${String(i).padStart(3, '0')}`,
    notes: movementType === "in" ? "استلام من المورد" : movementType === "out" ? "صرف لطلب عمل" : "تسوية جرد",
    createdBy: 1,
    updatedBy: 1,
  });
}

// --- الدالة الرئيسية ---

export async function seedcustomers_data() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return 0;
  }

  console.log("بدء إضافة بيانات customers_data...");
  let totalRecords = 0;

  try {
    // 1. chartOfAccounts (30 سجل)
    console.log("-> إضافة بيانات chartOfAccounts...");
    await db.insert(chartOfAccounts).values(accountsData);
    totalRecords += accountsData.length;
    console.log(`✅ تم إضافة ${accountsData.length} سجل بنجاح لـ chartOfAccounts`);

    // 2. accountBalances (20 سجل)
    console.log("-> إضافة بيانات accountBalances...");
    // نستخدم حسابات المستوى 3 و 4 فقط للأرصدة الافتتاحية
    const balancesToInsert = accountBalancesData.filter(b => b.accountId >= 8);
    await db.insert(accountBalances).values(balancesToInsert);
    totalRecords += balancesToInsert.length;
    console.log(`✅ تم إضافة ${balancesToInsert.length} سجل بنجاح لـ accountBalances`);

    // 3. customers (20 سجل)
    console.log("-> إضافة بيانات customers...");
    await db.insert(customers).values(customersData);
    totalRecords += customersData.length;
    console.log(`✅ تم إضافة ${customersData.length} سجل بنجاح لـ customers`);

    // 4. suppliers (10 سجل)
    console.log("-> إضافة بيانات suppliers...");
    await db.insert(suppliers).values(suppliersData);
    totalRecords += suppliersData.length;
    console.log(`✅ تم إضافة ${suppliersData.length} سجل بنجاح لـ suppliers`);

    // 5. items (30 سجل)
    console.log("-> إضافة بيانات items...");
    await db.insert(items).values(itemsData);
    totalRecords += itemsData.length;
    console.log(`✅ تم إضافة ${itemsData.length} سجل بنجاح لـ items`);

    // 6. invoices (50 سجل)
    console.log("-> إضافة بيانات invoices...");
    await db.insert(invoices).values(invoicesData);
    totalRecords += invoicesData.length;
    console.log(`✅ تم إضافة ${invoicesData.length} سجل بنجاح لـ invoices`);

    // 7. payments (40 سجل)
    console.log("-> إضافة بيانات payments...");
    // بما أننا لا نعرف الـ IDs التي تم توليدها للفواتير، سنفترض أن الـ IDs تبدأ من 1 وتتزايد
    // هذا افتراض شائع في الـ seed scripts، ولكن في بيئة حقيقية يجب استخدام الـ IDs الفعلية
    // بما أننا في مهمة إنشاء seed script، سنعتمد على الترقيم المتسلسل (1-50) للفواتير
    await db.insert(payments).values(paymentsData);
    totalRecords += paymentsData.length;
    console.log(`✅ تم إضافة ${paymentsData.length} سجل بنجاح لـ payments`);

    // 8. inventoryMovements (50 سجل)
    console.log("-> إضافة بيانات inventoryMovements...");
    await db.insert(inventoryMovements).values(inventoryMovementsData);
    totalRecords += inventoryMovementsData.length;
    console.log(`✅ تم إضافة ${inventoryMovementsData.length} سجل بنجاح لـ inventoryMovements`);
    
    console.log(`✅ تم الانتهاء من إضافة جميع البيانات. الإجمالي: ${totalRecords} سجل.`);
    return totalRecords;
  } catch (error) {
    console.error("❌ خطأ عام في إضافة بيانات customers_data:", error);
    throw error;
  }
}

// تصدير الدالة لتكون متاحة للاستخدام
export default seedcustomers_data;
