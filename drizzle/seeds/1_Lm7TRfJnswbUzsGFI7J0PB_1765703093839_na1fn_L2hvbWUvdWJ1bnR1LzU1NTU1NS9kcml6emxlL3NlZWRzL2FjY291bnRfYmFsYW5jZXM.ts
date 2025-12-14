import { getDb } from "../../server/db";
import { chartOfAccounts, accountBalances, customers, suppliers, items, invoices, payments, inventoryMovements } from "../schema";

// =================================================================
// 1. chartOfAccounts (شجرة الحسابات) - 28 سجل
// =================================================================
const chartOfAccountsData = [
  // المستوى الأول (رؤوس الحسابات)
  { id: 1, accountCode: "1000", accountName: "الأصول", accountType: "asset", isHeader: true, level: 1, parentAccountId: null, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 2, accountCode: "2000", accountName: "الخصوم", accountType: "liability", isHeader: true, level: 1, parentAccountId: null, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 3, accountCode: "3000", accountName: "حقوق الملكية", accountType: "equity", isHeader: true, level: 1, parentAccountId: null, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 4, accountCode: "4000", accountName: "الإيرادات", accountType: "revenue", isHeader: true, level: 1, parentAccountId: null, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 5, accountCode: "5000", accountName: "المصروفات", accountType: "expense", isHeader: true, level: 1, parentAccountId: null, isActive: true, createdBy: 1, updatedBy: 1 },

  // المستوى الثاني والثالث (تفاصيل الأصول)
  { id: 6, accountCode: "1100", accountName: "الأصول المتداولة", accountType: "asset", isHeader: true, level: 2, parentAccountId: 1, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 7, accountCode: "1110", accountName: "النقدية بالصندوق", accountType: "asset", isHeader: false, level: 3, parentAccountId: 6, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 8, accountCode: "1120", accountName: "البنوك", accountType: "asset", isHeader: false, level: 3, parentAccountId: 6, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 9, accountCode: "1130", accountName: "العملاء", accountType: "asset", isHeader: false, level: 3, parentAccountId: 6, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 10, accountCode: "1140", accountName: "المخزون", accountType: "asset", isHeader: false, level: 3, parentAccountId: 6, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 11, accountCode: "1200", accountName: "الأصول الثابتة", accountType: "asset", isHeader: true, level: 2, parentAccountId: 1, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 12, accountCode: "1210", accountName: "معدات المحطات", accountType: "asset", isHeader: false, level: 3, parentAccountId: 11, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 13, accountCode: "1220", accountName: "مباني ومنشآت", accountType: "asset", isHeader: false, level: 3, parentAccountId: 11, isActive: true, createdBy: 1, updatedBy: 1 },

  // المستوى الثاني والثالث (تفاصيل الخصوم)
  { id: 14, accountCode: "2100", accountName: "الخصوم المتداولة", accountType: "liability", isHeader: true, level: 2, parentAccountId: 2, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 15, accountCode: "2110", accountName: "الموردون", accountType: "liability", isHeader: false, level: 3, parentAccountId: 14, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 16, accountCode: "2120", accountName: "مصروفات مستحقة", accountType: "liability", isHeader: false, level: 3, parentAccountId: 14, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 17, accountCode: "2200", accountName: "قروض طويلة الأجل", accountType: "liability", isHeader: false, level: 2, parentAccountId: 2, isActive: true, createdBy: 1, updatedBy: 1 },

  // المستوى الثاني والثالث (تفاصيل حقوق الملكية)
  { id: 18, accountCode: "3100", accountName: "رأس المال", accountType: "equity", isHeader: false, level: 2, parentAccountId: 3, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 19, accountCode: "3200", accountName: "الأرباح المحتجزة", accountType: "equity", isHeader: false, level: 2, parentAccountId: 3, isActive: true, createdBy: 1, updatedBy: 1 },

  // المستوى الثاني والثالث (تفاصيل الإيرادات)
  { id: 20, accountCode: "4100", accountName: "إيرادات التشغيل", accountType: "revenue", isHeader: true, level: 2, parentAccountId: 4, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 21, accountCode: "4110", accountName: "مبيعات الكهرباء (سكني)", accountType: "revenue", isHeader: false, level: 3, parentAccountId: 20, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 22, accountCode: "4120", accountName: "مبيعات الكهرباء (تجاري)", accountType: "revenue", isHeader: false, level: 3, parentAccountId: 20, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 23, accountCode: "4200", accountName: "إيرادات خدمات الصيانة", accountType: "revenue", isHeader: false, level: 2, parentAccountId: 4, isActive: true, createdBy: 1, updatedBy: 1 },

  // المستوى الثاني والثالث (تفاصيل المصروفات)
  { id: 24, accountCode: "5100", accountName: "مصروفات التشغيل", accountType: "expense", isHeader: true, level: 2, parentAccountId: 5, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 25, accountCode: "5110", accountName: "مصروفات الرواتب", accountType: "expense", isHeader: false, level: 3, parentAccountId: 24, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 26, accountCode: "5120", accountName: "مصروفات الصيانة", accountType: "expense", isHeader: false, level: 3, parentAccountId: 24, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 27, accountCode: "5130", accountName: "مصروفات الإيجار", accountType: "expense", isHeader: false, level: 3, parentAccountId: 24, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 28, accountCode: "5140", accountName: "مصروفات الوقود", accountType: "expense", isHeader: false, level: 3, parentAccountId: 24, isActive: true, createdBy: 1, updatedBy: 1 },
];

// =================================================================
// 2. customers_data (العملاء) - 20 سجل
// =================================================================
const customersData = [
  { id: 1, customerName: "منزل أحمد العلي", customerType: "residential", address: "حي النخيل، الرياض", phone: "0501234567", email: "ahmad.ali@example.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 2, customerName: "فيلا سارة القحطاني", customerType: "residential", address: "طريق الملك فهد، جدة", phone: "0559876543", email: "sara.q@example.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 3, customerName: "مجمع الهدى السكني", customerType: "residential", address: "شارع الأمير سلطان، الدمام", phone: "0561122334", email: "alhuda@example.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 4, customerName: "مخبز وحلويات الشروق", customerType: "commercial", address: "حي السلام، مكة", phone: "0534455667", email: "alshorouq@example.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 5, customerName: "مطعم ومقهى الواحة", customerType: "commercial", address: "كورنيش الخبر", phone: "0597788990", email: "alwaha@example.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 6, customerName: "شركة التقنية المتقدمة", customerType: "commercial", address: "المنطقة الصناعية الأولى، الرياض", phone: "0112345678", email: "info@advtech.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 7, customerName: "مصنع الأمل للحديد", customerType: "industrial", address: "المدينة الصناعية الثانية، جدة", phone: "0126789012", email: "factory@alamal.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 8, customerName: "مؤسسة البناء الحديث", customerType: "commercial", address: "حي المروج، تبوك", phone: "0505554433", email: "albnah@example.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 9, customerName: "مزرعة خالد الزراعية", customerType: "residential", address: "طريق القصيم الزراعي", phone: "0551010101", email: "khalid.farm@example.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 10, customerName: "شركة النور للطاقة", customerType: "industrial", address: "وادي فاطمة، مكة", phone: "0125556677", email: "alnoor@energy.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 11, customerName: "منزل فاطمة الزهراني", customerType: "residential", address: "حي الشاطئ، جدة", phone: "0501112233", email: "fatima.z@example.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 12, customerName: "مكتبة المعرفة", customerType: "commercial", address: "شارع الجامعة، الرياض", phone: "0114445566", email: "almarefa@example.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 13, customerName: "مصنع البلاستيك الحديث", customerType: "industrial", address: "المنطقة الصناعية، الدمام", phone: "0138889900", email: "plastic@modern.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 14, customerName: "منزل محمد الدوسري", customerType: "residential", address: "حي الروضة، الخبر", phone: "0552221100", email: "mohamed.d@example.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 15, customerName: "مركز اللياقة البدنية", customerType: "commercial", address: "شارع التحلية، الرياض", phone: "0509988776", email: "fitness@center.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 16, customerName: "شركة التعدين الوطنية", customerType: "industrial", address: "منطقة التعدين، نجران", phone: "0175554433", email: "mining@national.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 17, customerName: "منزل نورة العتيبي", customerType: "residential", address: "حي العقيق، الرياض", phone: "0567766554", email: "noura.o@example.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 18, customerName: "صيدلية الدواء", customerType: "commercial", address: "شارع الأندلس، جدة", phone: "0123332211", email: "aldawa@example.com", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 19, customerName: "مصنع الزجاج السعودي", customerType: "industrial", address: "المدينة الصناعية، ينبع", phone: "0143334455", email: "glass@saudi.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 20, customerName: "منزل علي القرني", customerType: "residential", address: "حي الشفاء، الرياض", phone: "0504443322", email: "ali.q@example.com", isActive: true, createdBy: 1, updatedBy: 1 },
];

// =================================================================
// 3. suppliers_data (الموردين) - 10 سجلات
// =================================================================
const suppliersData = [
  { id: 1, supplierName: "شركة الكهرباء المتقدمة", supplierType: "موردي معدات", address: "طريق الملك عبدالعزيز، جدة", phone: "0126789012", email: "sales@advanced.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 2, supplierName: "مؤسسة قطع الغيار السريعة", supplierType: "قطع غيار", address: "المنطقة الصناعية، الرياض", phone: "0115554433", email: "parts@fast.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 3, supplierName: "خدمات الصيانة الشاملة", supplierType: "خدمات", address: "حي العليا، الرياض", phone: "0501119988", email: "support@comprehensive.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 4, supplierName: "الشركة الدولية للمحولات", supplierType: "موردي معدات", address: "الدمام الصناعية", phone: "0137776655", email: "trans@international.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 5, supplierName: "مورد الكابلات الذهبية", supplierType: "قطع غيار", address: "المدينة المنورة", phone: "0553332211", email: "cables@golden.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 6, supplierName: "شركة الحلول الهندسية", supplierType: "خدمات", address: "حي الروابي، جدة", phone: "0124443322", email: "eng@solutions.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 7, supplierName: "الشركة الوطنية للوقود", supplierType: "قطع غيار", address: "الجبيل الصناعية", phone: "0139998877", email: "fuel@national.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 8, supplierName: "مؤسسة أدوات السلامة", supplierType: "خدمات", address: "حي الملقا، الرياض", phone: "0502221100", email: "safety@tools.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 9, supplierName: "مورد الأجهزة الدقيقة", supplierType: "موردي معدات", address: "القصيم", phone: "0556667788", email: "devices@precise.sa", isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 10, supplierName: "شركة خدمات النقل", supplierType: "خدمات", address: "الرياض", phone: "0111010101", email: "transport@services.sa", isActive: true, createdBy: 1, updatedBy: 1 },
];

// =================================================================
// 4. items_data (الأصناف) - 30 سجل
// =================================================================
const itemsData = [
  { id: 1, itemName: "محول كهربائي 100 كيلو فولت", itemCode: "TRANS-100KV", unit: "قطعة", unitPrice: 50000, quantityOnHand: 5, reorderLevel: 2, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 2, itemName: "قاطع دائرة رئيسي 500 أمبير", itemCode: "CB-500A", unit: "قطعة", unitPrice: 15000, quantityOnHand: 10, reorderLevel: 5, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 3, itemName: "كابل نحاسي 300 مم مربع", itemCode: "CABLE-300", unit: "متر", unitPrice: 350, quantityOnHand: 500, reorderLevel: 100, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 4, itemName: "مفتاح فصل ثلاثي الأطوار", itemCode: "SWITCH-3P", unit: "قطعة", unitPrice: 8000, quantityOnHand: 8, reorderLevel: 3, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 5, itemName: "مكثف تحسين معامل القدرة", itemCode: "CAP-PFC", unit: "قطعة", unitPrice: 12000, quantityOnHand: 6, reorderLevel: 2, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 6, itemName: "زيت محولات عالي الجودة (200 لتر)", itemCode: "OIL-TRANS", unit: "برميل", unitPrice: 4500, quantityOnHand: 20, reorderLevel: 5, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 7, itemName: "صمام أمان ضغط عالي", itemCode: "VALVE-HP", unit: "قطعة", unitPrice: 1500, quantityOnHand: 15, reorderLevel: 5, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 8, itemName: "مقياس حرارة رقمي للمحولات", itemCode: "TEMP-DIGI", unit: "قطعة", unitPrice: 900, quantityOnHand: 25, reorderLevel: 10, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 9, itemName: "مروحة تبريد صناعية", itemCode: "FAN-IND", unit: "قطعة", unitPrice: 3000, quantityOnHand: 12, reorderLevel: 4, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 10, itemName: "بطارية احتياطية 12 فولت 100 أمبير", itemCode: "BATT-100A", unit: "قطعة", unitPrice: 1800, quantityOnHand: 30, reorderLevel: 10, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 11, itemName: "مصباح إنارة LED صناعي", itemCode: "LED-IND", unit: "قطعة", unitPrice: 250, quantityOnHand: 100, reorderLevel: 50, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 12, itemName: "قفازات عازلة للكهرباء", itemCode: "GLOVES-INS", unit: "زوج", unitPrice: 150, quantityOnHand: 50, reorderLevel: 20, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 13, itemName: "جهاز فحص العزل (ميجر)", itemCode: "MEGGER", unit: "قطعة", unitPrice: 7000, quantityOnHand: 3, reorderLevel: 1, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 14, itemName: "مفتاح ربط هيدروليكي", itemCode: "WRENCH-HYD", unit: "قطعة", unitPrice: 9500, quantityOnHand: 4, reorderLevel: 1, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 15, itemName: "مادة تنظيف للمعدات الكهربائية", itemCode: "CLEAN-ELEC", unit: "لتر", unitPrice: 80, quantityOnHand: 200, reorderLevel: 50, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 16, itemName: "فيوز حماية 100 أمبير", itemCode: "FUSE-100A", unit: "قطعة", unitPrice: 50, quantityOnHand: 300, reorderLevel: 100, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 17, itemName: "لوحة تحكم PLC", itemCode: "PLC-CTRL", unit: "قطعة", unitPrice: 25000, quantityOnHand: 2, reorderLevel: 1, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 18, itemName: "مستشعر حرارة PT100", itemCode: "SENSOR-PT100", unit: "قطعة", unitPrice: 300, quantityOnHand: 40, reorderLevel: 15, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 19, itemName: "مضخة تبريد صغيرة", itemCode: "PUMP-COOL", unit: "قطعة", unitPrice: 1800, quantityOnHand: 7, reorderLevel: 3, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 20, itemName: "جهاز قياس متعدد (مالتيميتر)", itemCode: "MULTIMETER", unit: "قطعة", unitPrice: 600, quantityOnHand: 15, reorderLevel: 5, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 21, itemName: "أنابيب عزل حراري", itemCode: "TUBE-INSUL", unit: "متر", unitPrice: 40, quantityOnHand: 300, reorderLevel: 100, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 22, itemName: "مفتاح ضغط زيت", itemCode: "PRESS-SW", unit: "قطعة", unitPrice: 750, quantityOnHand: 10, reorderLevel: 4, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 23, itemName: "شاحن بطاريات صناعي", itemCode: "CHARGER-IND", unit: "قطعة", unitPrice: 4000, quantityOnHand: 5, reorderLevel: 2, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 24, itemName: "مجموعة أدوات صيانة", itemCode: "TOOL-KIT", unit: "مجموعة", unitPrice: 1200, quantityOnHand: 8, reorderLevel: 3, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 25, itemName: "جهاز حماية من الصواعق", itemCode: "LIGHT-PROT", unit: "قطعة", unitPrice: 6000, quantityOnHand: 6, reorderLevel: 2, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 26, itemName: "كابل ألياف بصرية (100 متر)", itemCode: "FIBER-100M", unit: "لفة", unitPrice: 1500, quantityOnHand: 10, reorderLevel: 5, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 27, itemName: "مادة لاصقة عازلة", itemCode: "ADHESIVE-INS", unit: "عبوة", unitPrice: 90, quantityOnHand: 150, reorderLevel: 50, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 28, itemName: "مفتاح تحويل آلي (ATS)", itemCode: "ATS-SW", unit: "قطعة", unitPrice: 18000, quantityOnHand: 3, reorderLevel: 1, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 29, itemName: "مقاومة تحميل صناعية", itemCode: "LOAD-RES", unit: "قطعة", unitPrice: 3500, quantityOnHand: 9, reorderLevel: 3, isActive: true, createdBy: 1, updatedBy: 1 },
  { id: 30, itemName: "جهاز تحليل جودة الطاقة", itemCode: "POWER-ANAL", unit: "قطعة", unitPrice: 30000, quantityOnHand: 1, reorderLevel: 1, isActive: true, createdBy: 1, updatedBy: 1 },
];

// =================================================================
// 5. invoices_data (الفواتير) - 50 سجل
// =================================================================
const invoicesData = [];
const statuses = ["paid", "paid", "paid", "paid", "paid", "paid", "paid", "partial", "partial", "unpaid"]; // 70% paid, 20% partial, 10% unpaid
const startDate = new Date("2024-07-01");
const endDate = new Date("2024-12-14");

for (let i = 1; i <= 50; i++) {
  const customerId = Math.floor(Math.random() * 20) + 1;
  const totalAmount = Math.floor(Math.random() * 45000) + 5000; // 5000 to 50000
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  let paidAmount = 0;
  if (status === "paid") {
    paidAmount = totalAmount;
  } else if (status === "partial") {
    paidAmount = Math.floor(totalAmount * (Math.random() * 0.8 + 0.1)); // 10% to 90%
  } else { // unpaid
    paidAmount = 0;
  }

  const dateOffset = Math.floor(Math.random() * (endDate.getTime() - startDate.getTime()));
  const invoiceDate = new Date(startDate.getTime() + dateOffset).toISOString().split('T')[0];
  
  const dueDate = new Date(new Date(invoiceDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Due in 30 days

  invoicesData.push({
    id: i,
    invoiceNumber: `INV-2024-${String(i).padStart(3, '0')}`,
    invoiceDate: invoiceDate,
    customerId: customerId,
    totalAmount: totalAmount,
    paidAmount: paidAmount,
    status: status,
    dueDate: dueDate,
    createdBy: 1,
    updatedBy: 1,
  });
}

// =================================================================
// 6. payments_data (المدفوعات) - 40 سجل
// =================================================================
const paymentsData = [];
const paymentMethods = ["cash", "check", "bank_transfer"];
const paymentTypes = ["receipt", "receipt", "receipt", "receipt", "payment"]; // 80% receipt, 20% payment

for (let i = 1; i <= 40; i++) {
  const invoiceId = Math.floor(Math.random() * 50) + 1;
  const amount = Math.floor(Math.random() * 19000) + 1000; // 1000 to 20000
  const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
  const paymentType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)];
  
  const dateOffset = Math.floor(Math.random() * (endDate.getTime() - startDate.getTime()));
  const paymentDate = new Date(startDate.getTime() + dateOffset).toISOString().split('T')[0];

  paymentsData.push({
    id: i,
    paymentNumber: `PAY-2024-${String(i).padStart(3, '0')}`,
    paymentDate: paymentDate,
    invoiceId: invoiceId,
    amount: amount,
    paymentMethod: paymentMethod,
    paymentType: paymentType,
    notes: paymentType === "receipt" ? "دفعة من العميل" : "دفعة للمورد",
    createdBy: 1,
    updatedBy: 1,
  });
}

// =================================================================
// 7. inventory_movements (حركات المخزون) - 50 سجل
// =================================================================
const inventoryMovementsData = [];
const movementTypes = ["in", "in", "in", "in", "out", "out", "out", "out", "adjustment", "adjustment"]; // 50% in, 40% out, 10% adjustment

for (let i = 1; i <= 50; i++) {
  const itemId = Math.floor(Math.random() * 30) + 1;
  const movementType = movementTypes[Math.floor(Math.random() * movementTypes.length)];
  const quantity = Math.floor(Math.random() * 50) + 1; // 1 to 50
  
  const dateOffset = Math.floor(Math.random() * (endDate.getTime() - startDate.getTime()));
  const movementDate = new Date(startDate.getTime() + dateOffset).toISOString().split('T')[0];
  
  let referenceNumber = "";
  let notes = "";
  if (movementType === "in") {
    referenceNumber = `PO-2024-${String(i).padStart(3, '0')}`;
    notes = "استلام من المورد";
  } else if (movementType === "out") {
    referenceNumber = `SO-2024-${String(i).padStart(3, '0')}`;
    notes = "صرف لعملية صيانة";
  } else {
    referenceNumber = `ADJ-2024-${String(i).padStart(3, '0')}`;
    notes = "تسوية جرد مخزون";
  }

  inventoryMovementsData.push({
    id: i,
    itemId: itemId,
    movementType: movementType,
    quantity: quantity,
    movementDate: movementDate,
    referenceNumber: referenceNumber,
    notes: notes,
    createdBy: 1,
    updatedBy: 1,
  });
}

// =================================================================
// 8. account_balances (الأرصدة الافتتاحية) - 10 سجلات (لضمان التوازن)
// =================================================================
const accountBalancesData = [
  // الأصول (Debit Balances) - مجموع 2,700,000
  { accountId: 7, openingBalance: 50000, debitAmount: 0, creditAmount: 0, closingBalance: 50000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // النقدية بالصندوق
  { accountId: 8, openingBalance: 350000, debitAmount: 0, creditAmount: 0, closingBalance: 350000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // البنوك
  { accountId: 9, openingBalance: 120000, debitAmount: 0, creditAmount: 0, closingBalance: 120000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // العملاء
  { accountId: 10, openingBalance: 80000, debitAmount: 0, creditAmount: 0, closingBalance: 80000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // المخزون
  { accountId: 12, openingBalance: 600000, debitAmount: 0, creditAmount: 0, closingBalance: 600000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // معدات المحطات
  { accountId: 13, openingBalance: 1500000, debitAmount: 0, creditAmount: 0, closingBalance: 1500000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // مباني ومنشآت

  // الخصوم وحقوق الملكية (Credit Balances) - مجموع -2,700,000
  { accountId: 15, openingBalance: -150000, debitAmount: 0, creditAmount: 0, closingBalance: -150000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // الموردون
  { accountId: 17, openingBalance: -500000, debitAmount: 0, creditAmount: 0, closingBalance: -500000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // قروض طويلة الأجل
  { accountId: 18, openingBalance: -1800000, debitAmount: 0, creditAmount: 0, closingBalance: -1800000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // رأس المال
  { accountId: 19, openingBalance: -250000, debitAmount: 0, creditAmount: 0, closingBalance: -250000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 }, // الأرباح المحتجزة
];


// =================================================================
// الدالة الرئيسية للتنفيذ
// =================================================================
export async function seedaccount_balances() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return 0;
  }

  console.log("بدء إضافة بيانات تجريبية لثمانية جداول...");
  let totalRecords = 0;

  try {
    // 1. chartOfAccounts
    await db.insert(chartOfAccounts).values(chartOfAccountsData);
    console.log(`✅ تم إضافة ${chartOfAccountsData.length} سجل في جدول chartOfAccounts`);
    totalRecords += chartOfAccountsData.length;

    // 2. customers
    await db.insert(customers).values(customersData);
    console.log(`✅ تم إضافة ${customersData.length} سجل في جدول customers`);
    totalRecords += customersData.length;

    // 3. suppliers
    await db.insert(suppliers).values(suppliersData);
    console.log(`✅ تم إضافة ${suppliersData.length} سجل في جدول suppliers`);
    totalRecords += suppliersData.length;

    // 4. items
    await db.insert(items).values(itemsData);
    console.log(`✅ تم إضافة ${itemsData.length} سجل في جدول items`);
    totalRecords += itemsData.length;

    // 5. invoices
    await db.insert(invoices).values(invoicesData);
    console.log(`✅ تم إضافة ${invoicesData.length} سجل في جدول invoices`);
    totalRecords += invoicesData.length;

    // 6. payments
    await db.insert(payments).values(paymentsData);
    console.log(`✅ تم إضافة ${paymentsData.length} سجل في جدول payments`);
    totalRecords += paymentsData.length;

    // 7. inventoryMovements
    await db.insert(inventoryMovements).values(inventoryMovementsData);
    console.log(`✅ تم إضافة ${inventoryMovementsData.length} سجل في جدول inventoryMovements`);
    totalRecords += inventoryMovementsData.length;

    // 8. accountBalances (يجب أن تكون آخر شيء لضمان وجود الحسابات)
    await db.insert(accountBalances).values(accountBalancesData);
    console.log(`✅ تم إضافة ${accountBalancesData.length} سجل في جدول accountBalances`);
    totalRecords += accountBalancesData.length;
    
    console.log(`\n✅ تم إضافة ${totalRecords} سجل بنجاح في جميع الجداول.`);
    return totalRecords;
  } catch (error) {
    console.error("❌ خطأ في إضافة بيانات account_balances:", error);
    throw error;
  }
}
