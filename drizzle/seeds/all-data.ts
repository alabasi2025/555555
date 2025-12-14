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

export async function seedAllData() {
  const db = await getDb();
  if (!db) {
    console.error("❌ قاعدة البيانات غير متاحة");
    return;
  }

  console.log("🌱 بدء إضافة البيانات التجريبية...\n");

  try {
    // 1. شجرة الحسابات (25 حساب)
    console.log("📊 إضافة شجرة الحسابات...");
    const accountsData = [
      // الأصول
      { accountCode: "1000", accountName: "الأصول", accountType: "asset" as const, isHeader: true, level: 1, isActive: true, createdBy: 1, updatedBy: 1 },
      { accountCode: "1100", accountName: "الأصول المتداولة", accountType: "asset" as const, parentAccountId: 1, isHeader: true, level: 2, isActive: true, createdBy: 1, updatedBy: 1 },
      { accountCode: "1110", accountName: "النقدية", accountType: "asset" as const, parentAccountId: 2, level: 3, isActive: true, createdBy: 1, updatedBy: 1 },
      { accountCode: "1120", accountName: "البنك - الحساب الجاري", accountType: "asset" as const, parentAccountId: 2, level: 3, isActive: true, createdBy: 1, updatedBy: 1 },
      { accountCode: "1130", accountName: "العملاء", accountType: "asset" as const, parentAccountId: 2, level: 3, isActive: true, createdBy: 1, updatedBy: 1 },
      { accountCode: "1140", accountName: "المخزون", accountType: "asset" as const, parentAccountId: 2, level: 3, isActive: true, createdBy: 1, updatedBy: 1 },
      { accountCode: "1200", accountName: "الأصول الثابتة", accountType: "asset" as const, parentAccountId: 1, isHeader: true, level: 2, isActive: true, createdBy: 1, updatedBy: 1 },
      { accountCode: "1210", accountName: "المعدات الكهربائية", accountType: "asset" as const, parentAccountId: 7, level: 3, isActive: true, createdBy: 1, updatedBy: 1 },
      { accountCode: "1220", accountName: "المباني", accountType: "asset" as const, parentAccountId: 7, level: 3, isActive: true, createdBy: 1, updatedBy: 1 },
      
      // الخصوم
      { accountCode: "2000", accountName: "الخصوم", accountType: "liability" as const, isHeader: true, level: 1, isActive: true, createdBy: 1, updatedBy: 1 },
      { accountCode: "2100", accountName: "الخصوم المتداولة", accountType: "liability" as const, parentAccountId: 10, isHeader: true, level: 2, isActive: true, createdBy: 1, updatedBy: 1 },
      { accountCode: "2110", accountName: "الموردون", accountType: "liability" as const, parentAccountId: 11, level: 3, isActive: true, createdBy: 1, updatedBy: 1 },
      { accountCode: "2120", accountName: "المصروفات المستحقة", accountType: "liability" as const, parentAccountId: 11, level: 3, isActive: true, createdBy: 1, updatedBy: 1 },
      { accountCode: "2200", accountName: "القروض طويلة الأجل", accountType: "liability" as const, parentAccountId: 10, level: 2, isActive: true, createdBy: 1, updatedBy: 1 },
      
      // حقوق الملكية
      { accountCode: "3000", accountName: "حقوق الملكية", accountType: "equity" as const, isHeader: true, level: 1, isActive: true, createdBy: 1, updatedBy: 1 },
      { accountCode: "3100", accountName: "رأس المال", accountType: "equity" as const, parentAccountId: 15, level: 2, isActive: true, createdBy: 1, updatedBy: 1 },
      { accountCode: "3200", accountName: "الأرباح المحتجزة", accountType: "equity" as const, parentAccountId: 15, level: 2, isActive: true, createdBy: 1, updatedBy: 1 },
      
      // الإيرادات
      { accountCode: "4000", accountName: "الإيرادات", accountType: "revenue" as const, isHeader: true, level: 1, isActive: true, createdBy: 1, updatedBy: 1 },
      { accountCode: "4100", accountName: "إيرادات مبيعات الكهرباء", accountType: "revenue" as const, parentAccountId: 18, level: 2, isActive: true, createdBy: 1, updatedBy: 1 },
      { accountCode: "4200", accountName: "إيرادات الخدمات", accountType: "revenue" as const, parentAccountId: 18, level: 2, isActive: true, createdBy: 1, updatedBy: 1 },
      
      // المصروفات
      { accountCode: "5000", accountName: "المصروفات", accountType: "expense" as const, isHeader: true, level: 1, isActive: true, createdBy: 1, updatedBy: 1 },
      { accountCode: "5100", accountName: "الرواتب والأجور", accountType: "expense" as const, parentAccountId: 21, level: 2, isActive: true, createdBy: 1, updatedBy: 1 },
      { accountCode: "5200", accountName: "الصيانة والإصلاحات", accountType: "expense" as const, parentAccountId: 21, level: 2, isActive: true, createdBy: 1, updatedBy: 1 },
      { accountCode: "5300", accountName: "الكهرباء والمياه", accountType: "expense" as const, parentAccountId: 21, level: 2, isActive: true, createdBy: 1, updatedBy: 1 },
      { accountCode: "5400", accountName: "الإيجار", accountType: "expense" as const, parentAccountId: 21, level: 2, isActive: true, createdBy: 1, updatedBy: 1 },
    ];
    
    await db.insert(chartOfAccounts).values(accountsData);
    console.log(`✅ تم إضافة ${accountsData.length} حساب\n`);

    // 2. الأرصدة الافتتاحية (10 أرصدة)
    console.log("💰 إضافة الأرصدة الافتتاحية...");
    const balancesData = [
      { accountId: 3, balanceDate: "2024-01-01", openingBalance: 500000, debitAmount: 0, creditAmount: 0, closingBalance: 500000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 },
      { accountId: 4, balanceDate: "2024-01-01", openingBalance: 1500000, debitAmount: 0, creditAmount: 0, closingBalance: 1500000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 },
      { accountId: 5, balanceDate: "2024-01-01", openingBalance: 300000, debitAmount: 0, creditAmount: 0, closingBalance: 300000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 },
      { accountId: 6, balanceDate: "2024-01-01", openingBalance: 400000, debitAmount: 0, creditAmount: 0, closingBalance: 400000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 },
      { accountId: 8, balanceDate: "2024-01-01", openingBalance: 3000000, debitAmount: 0, creditAmount: 0, closingBalance: 3000000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 },
      { accountId: 9, balanceDate: "2024-01-01", openingBalance: 2000000, debitAmount: 0, creditAmount: 0, closingBalance: 2000000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 },
      { accountId: 12, balanceDate: "2024-01-01", openingBalance: -200000, debitAmount: 0, creditAmount: 0, closingBalance: -200000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 },
      { accountId: 14, balanceDate: "2024-01-01", openingBalance: -2000000, debitAmount: 0, creditAmount: 0, closingBalance: -2000000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 },
      { accountId: 16, balanceDate: "2024-01-01", openingBalance: -5000000, debitAmount: 0, creditAmount: 0, closingBalance: -5000000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 },
      { accountId: 17, balanceDate: "2024-01-01", openingBalance: -500000, debitAmount: 0, creditAmount: 0, closingBalance: -500000, fiscalYear: 2024, createdBy: 1, updatedBy: 1 },
    ];
    
    await db.insert(accountBalances).values(balancesData);
    console.log(`✅ تم إضافة ${balancesData.length} رصيد افتتاحي\n`);

    // 3. العملاء (20 عميل)
    console.log("👥 إضافة العملاء...");
    const customersData = [
      { customerName: "شركة النور للكهرباء", customerType: "commercial" as const, address: "شارع الملك فهد، الرياض", phone: "0112345678", email: "info@alnoor.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { customerName: "مصنع الأمل للصناعات", customerType: "industrial" as const, address: "المنطقة الصناعية، جدة", phone: "0126789012", email: "amal@factory.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { customerName: "أحمد محمد العلي", customerType: "residential" as const, address: "حي النخيل، الدمام", phone: "0138901234", email: "ahmad@email.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { customerName: "مجمع الفيصلية التجاري", customerType: "commercial" as const, address: "طريق الملك عبدالله، الرياض", phone: "0114567890", email: "faisaliah@mall.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { customerName: "فاطمة سعيد الغامدي", customerType: "residential" as const, address: "حي الروضة، جدة", phone: "0125678901", email: "fatima@email.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { customerName: "شركة البناء الحديث", customerType: "commercial" as const, address: "شارع التحلية، الخبر", phone: "0139012345", email: "modern@build.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { customerName: "مستشفى الملك فيصل", customerType: "commercial" as const, address: "طريق الملك فيصل، الرياض", phone: "0116789012", email: "kfh@hospital.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { customerName: "خالد عبدالله السعيد", customerType: "residential" as const, address: "حي السلام، مكة", phone: "0127890123", email: "khaled@email.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { customerName: "جامعة الملك سعود", customerType: "commercial" as const, address: "طريق الدائري، الرياض", phone: "0118901234", email: "ksu@university.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { customerName: "نورة فهد المطيري", customerType: "residential" as const, address: "حي الياسمين، الرياض", phone: "0119012345", email: "noura@email.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { customerName: "مصنع الإسمنت السعودي", customerType: "industrial" as const, address: "المنطقة الصناعية، ينبع", phone: "0146789012", email: "cement@factory.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { customerName: "محمد سالم القحطاني", customerType: "residential" as const, address: "حي العزيزية، الخبر", phone: "0137890123", email: "mohammed@email.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { customerName: "فندق الريتز كارلتون", customerType: "commercial" as const, address: "طريق الملك عبدالعزيز، الرياض", phone: "0113456789", email: "ritz@hotel.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { customerName: "سارة علي الشهري", customerType: "residential" as const, address: "حي الفيصلية، جدة", phone: "0124567890", email: "sara@email.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { customerName: "شركة الاتصالات السعودية", customerType: "commercial" as const, address: "طريق الملك فهد، الرياض", phone: "0115678901", email: "stc@telecom.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { customerName: "عبدالرحمن ناصر الدوسري", customerType: "residential" as const, address: "حي الملقا، الرياض", phone: "0116789012", email: "abdulrahman@email.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { customerName: "مصنع البلاستيك الوطني", customerType: "industrial" as const, address: "المنطقة الصناعية، الدمام", phone: "0138901234", email: "plastic@factory.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { customerName: "منى حسن العتيبي", customerType: "residential" as const, address: "حي الربوة، الرياض", phone: "0117890123", email: "mona@email.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { customerName: "مركز الملك عبدالله المالي", customerType: "commercial" as const, address: "طريق الملك فهد، الرياض", phone: "0118901234", email: "kafd@finance.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { customerName: "يوسف إبراهيم الغامدي", customerType: "residential" as const, address: "حي الورود، جدة", phone: "0129012345", email: "youssef@email.sa", isActive: true, createdBy: 1, updatedBy: 1 },
    ];
    
    await db.insert(customers).values(customersData);
    console.log(`✅ تم إضافة ${customersData.length} عميل\n`);

    // 4. الموردين (10 موردين)
    console.log("🏭 إضافة الموردين...");
    const suppliersData = [
      { supplierName: "شركة الكهرباء المتقدمة", address: "طريق الملك عبدالعزيز، جدة", phone: "0126789012", email: "sales@advanced.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { supplierName: "مؤسسة المعدات الصناعية", address: "شارع الأمير سلطان، الرياض", phone: "0114567890", email: "info@equipment.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { supplierName: "شركة قطع الغيار الدولية", address: "طريق الملك فهد، الدمام", phone: "0138901234", email: "parts@international.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { supplierName: "مصنع الكابلات السعودية", address: "المنطقة الصناعية، جدة", phone: "0125678901", email: "cables@factory.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { supplierName: "شركة الأنظمة الكهربائية", address: "شارع التحلية، الخبر", phone: "0139012345", email: "systems@electric.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { supplierName: "مؤسسة الصيانة المتكاملة", address: "طريق الملك عبدالله، الرياض", phone: "0116789012", email: "maintenance@complete.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { supplierName: "شركة المحولات الكهربائية", address: "المنطقة الصناعية، الدمام", phone: "0137890123", email: "transformers@electric.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { supplierName: "مصنع العوازل الكهربائية", address: "طريق الملك فهد، جدة", phone: "0124567890", email: "insulators@factory.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { supplierName: "شركة الأدوات الكهربائية", address: "شارع الملك فيصل، الرياض", phone: "0115678901", email: "tools@electric.sa", isActive: true, createdBy: 1, updatedBy: 1 },
      { supplierName: "مؤسسة الخدمات الفنية", address: "طريق الدائري، الخبر", phone: "0138901234", email: "technical@services.sa", isActive: true, createdBy: 1, updatedBy: 1 },
    ];
    
    await db.insert(suppliers).values(suppliersData);
    console.log(`✅ تم إضافة ${suppliersData.length} مورد\n`);

    // 5. الأصناف (30 صنف)
    console.log("📦 إضافة الأصناف...");
    const itemsData = [
      { itemName: "محول كهربائي 100 كيلو فولت", itemCode: "TRANS-100KV", unit: "قطعة", unitPrice: 50000, quantityOnHand: 5, reorderLevel: 2, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "كابل كهربائي 50 ملم", itemCode: "CABLE-50MM", unit: "متر", unitPrice: 25, quantityOnHand: 5000, reorderLevel: 1000, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "قاطع كهربائي 200 أمبير", itemCode: "BREAKER-200A", unit: "قطعة", unitPrice: 1500, quantityOnHand: 50, reorderLevel: 10, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "عداد كهربائي رقمي", itemCode: "METER-DIGITAL", unit: "قطعة", unitPrice: 500, quantityOnHand: 200, reorderLevel: 50, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "لوحة توزيع كهربائية", itemCode: "PANEL-DIST", unit: "قطعة", unitPrice: 3000, quantityOnHand: 20, reorderLevel: 5, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "مفتاح كهربائي عادي", itemCode: "SWITCH-STD", unit: "قطعة", unitPrice: 15, quantityOnHand: 1000, reorderLevel: 200, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "مأخذ كهربائي ثلاثي", itemCode: "OUTLET-3PIN", unit: "قطعة", unitPrice: 20, quantityOnHand: 800, reorderLevel: 150, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "سلك نحاسي 2.5 ملم", itemCode: "WIRE-2.5MM", unit: "متر", unitPrice: 5, quantityOnHand: 10000, reorderLevel: 2000, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "مصباح LED 20 واط", itemCode: "LED-20W", unit: "قطعة", unitPrice: 30, quantityOnHand: 500, reorderLevel: 100, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "أنبوب حماية كهربائي", itemCode: "CONDUIT-20MM", unit: "متر", unitPrice: 8, quantityOnHand: 3000, reorderLevel: 500, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "مروحة سقف 56 بوصة", itemCode: "FAN-56INCH", unit: "قطعة", unitPrice: 250, quantityOnHand: 100, reorderLevel: 20, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "جهاز حماية من التسرب", itemCode: "RCD-30MA", unit: "قطعة", unitPrice: 200, quantityOnHand: 80, reorderLevel: 15, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "محرك كهربائي 5 حصان", itemCode: "MOTOR-5HP", unit: "قطعة", unitPrice: 2500, quantityOnHand: 15, reorderLevel: 3, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "مكثف كهربائي 50 ميكروفاراد", itemCode: "CAP-50UF", unit: "قطعة", unitPrice: 50, quantityOnHand: 200, reorderLevel: 40, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "مفتاح تحكم آلي", itemCode: "AUTO-SWITCH", unit: "قطعة", unitPrice: 800, quantityOnHand: 30, reorderLevel: 5, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "جهاز قياس الجهد الرقمي", itemCode: "VOLTMETER-DIG", unit: "قطعة", unitPrice: 150, quantityOnHand: 50, reorderLevel: 10, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "صندوق توصيل كهربائي", itemCode: "JUNCTION-BOX", unit: "قطعة", unitPrice: 25, quantityOnHand: 500, reorderLevel: 100, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "شريط عازل كهربائي", itemCode: "TAPE-INSUL", unit: "لفة", unitPrice: 10, quantityOnHand: 300, reorderLevel: 50, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "كونتاكتور 40 أمبير", itemCode: "CONTACTOR-40A", unit: "قطعة", unitPrice: 350, quantityOnHand: 40, reorderLevel: 8, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "ريليه حراري", itemCode: "RELAY-THERMAL", unit: "قطعة", unitPrice: 120, quantityOnHand: 60, reorderLevel: 12, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "مصهر كهربائي 32 أمبير", itemCode: "FUSE-32A", unit: "قطعة", unitPrice: 5, quantityOnHand: 1000, reorderLevel: 200, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "مفتاح ضغط للمضخات", itemCode: "PRESSURE-SW", unit: "قطعة", unitPrice: 180, quantityOnHand: 25, reorderLevel: 5, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "حساس حركة كهربائي", itemCode: "MOTION-SENSOR", unit: "قطعة", unitPrice: 100, quantityOnHand: 70, reorderLevel: 15, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "كشاف LED خارجي 100 واط", itemCode: "FLOOD-100W", unit: "قطعة", unitPrice: 200, quantityOnHand: 50, reorderLevel: 10, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "سخان مياه كهربائي 50 لتر", itemCode: "HEATER-50L", unit: "قطعة", unitPrice: 400, quantityOnHand: 30, reorderLevel: 5, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "مضخة مياه 1 حصان", itemCode: "PUMP-1HP", unit: "قطعة", unitPrice: 800, quantityOnHand: 20, reorderLevel: 4, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "جرس كهربائي", itemCode: "BELL-ELECTRIC", unit: "قطعة", unitPrice: 40, quantityOnHand: 150, reorderLevel: 30, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "كاميرا مراقبة IP", itemCode: "CAM-IP", unit: "قطعة", unitPrice: 600, quantityOnHand: 40, reorderLevel: 8, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "بطارية احتياطية 12 فولت", itemCode: "BATTERY-12V", unit: "قطعة", unitPrice: 300, quantityOnHand: 50, reorderLevel: 10, isActive: true, createdBy: 1, updatedBy: 1 },
      { itemName: "شاحن بطارية ذكي", itemCode: "CHARGER-SMART", unit: "قطعة", unitPrice: 250, quantityOnHand: 35, reorderLevel: 7, isActive: true, createdBy: 1, updatedBy: 1 },
    ];
    
    await db.insert(items).values(itemsData);
    console.log(`✅ تم إضافة ${itemsData.length} صنف\n`);

    // 6. الفواتير (50 فاتورة)
    console.log("🧾 إضافة الفواتير...");
    const invoicesData = [];
    const startDate = new Date('2024-06-01');
    
    for (let i = 1; i <= 50; i++) {
      const customerId = ((i - 1) % 20) + 1;
      const invoiceDate = new Date(startDate);
      invoiceDate.setDate(startDate.getDate() + (i * 3));
      
      const totalAmount = Math.floor(Math.random() * 20000) + 5000;
      const statuses = ['paid', 'partial', 'unpaid'] as const;
      const status = statuses[i % 3];
      
      let paidAmount = 0;
      if (status === 'paid') paidAmount = totalAmount;
      else if (status === 'partial') paidAmount = Math.floor(totalAmount * 0.5);
      
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(invoiceDate.getDate() + 30);
      
      invoicesData.push({
        invoiceNumber: `INV-2024-${String(i).padStart(3, '0')}`,
        invoiceDate: invoiceDate.toISOString().split('T')[0],
        customerId,
        totalAmount,
        paidAmount,
        status,
        dueDate: dueDate.toISOString().split('T')[0],
        createdBy: 1,
        updatedBy: 1,
      });
    }
    
    await db.insert(invoices).values(invoicesData);
    console.log(`✅ تم إضافة ${invoicesData.length} فاتورة\n`);

    // 7. المدفوعات (35 دفعة)
    console.log("💳 إضافة المدفوعات...");
    const paymentsData = [];
    const paymentMethods = ['cash', 'check', 'bank_transfer'] as const;
    
    for (let i = 1; i <= 35; i++) {
      const invoiceId = i;
      const paymentDate = new Date(invoicesData[i - 1].invoiceDate);
      paymentDate.setDate(paymentDate.getDate() + Math.floor(Math.random() * 10) + 1);
      
      paymentsData.push({
        paymentNumber: `PAY-2024-${String(i).padStart(3, '0')}`,
        paymentDate: paymentDate.toISOString().split('T')[0],
        invoiceId,
        amount: invoicesData[i - 1].paidAmount,
        paymentMethod: paymentMethods[i % 3],
        paymentType: 'receipt' as const,
        notes: i % 3 === 0 ? 'دفعة كاملة' : i % 3 === 1 ? 'دفعة جزئية' : 'دفعة نقدية',
        createdBy: 1,
        updatedBy: 1,
      });
    }
    
    await db.insert(payments).values(paymentsData);
    console.log(`✅ تم إضافة ${paymentsData.length} دفعة\n`);

    // 8. حركات المخزون (50 حركة)
    console.log("📊 إضافة حركات المخزون...");
    const movementsData = [];
    const movementTypes = ['in', 'out', 'adjustment'] as const;
    const baseDate = new Date('2024-06-01');
    
    for (let i = 1; i <= 50; i++) {
      const itemId = ((i - 1) % 30) + 1;
      const movementType = movementTypes[i % 3];
      const movementDate = new Date(baseDate);
      movementDate.setDate(baseDate.getDate() + (i * 2));
      
      let quantity = 0;
      if (movementType === 'in') quantity = Math.floor(Math.random() * 50) + 10;
      else if (movementType === 'out') quantity = Math.floor(Math.random() * 20) + 5;
      else quantity = Math.floor(Math.random() * 10) - 5;
      
      movementsData.push({
        itemId,
        movementType,
        quantity,
        movementDate: movementDate.toISOString().split('T')[0],
        referenceNumber: movementType === 'in' ? `PO-2024-${String(i).padStart(3, '0')}` : `SO-2024-${String(i).padStart(3, '0')}`,
        notes: movementType === 'in' ? 'استلام من المورد' : movementType === 'out' ? 'صرف للعميل' : 'تسوية جرد',
        createdBy: 1,
        updatedBy: 1,
      });
    }
    
    await db.insert(inventoryMovements).values(movementsData);
    console.log(`✅ تم إضافة ${movementsData.length} حركة مخزون\n`);

    // الخلاصة
    const totalRecords = accountsData.length + balancesData.length + customersData.length + 
                        suppliersData.length + itemsData.length + invoicesData.length + 
                        paymentsData.length + movementsData.length;
    
    console.log("═══════════════════════════════════════");
    console.log("✅ اكتملت عملية إضافة البيانات التجريبية بنجاح!");
    console.log("═══════════════════════════════════════");
    console.log(`📊 إجمالي السجلات المضافة: ${totalRecords}`);
    console.log(`   - شجرة الحسابات: ${accountsData.length}`);
    console.log(`   - الأرصدة الافتتاحية: ${balancesData.length}`);
    console.log(`   - العملاء: ${customersData.length}`);
    console.log(`   - الموردين: ${suppliersData.length}`);
    console.log(`   - الأصناف: ${itemsData.length}`);
    console.log(`   - الفواتير: ${invoicesData.length}`);
    console.log(`   - المدفوعات: ${paymentsData.length}`);
    console.log(`   - حركات المخزون: ${movementsData.length}`);
    console.log("═══════════════════════════════════════\n");
    
    return totalRecords;
    
  } catch (error) {
    console.error("❌ خطأ في إضافة البيانات التجريبية:", error);
    throw error;
  }
}

// تنفيذ مباشر
seedAllData()
  .then((count) => {
    console.log(`\n✅ تمت إضافة ${count} سجل بنجاح`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ فشلت عملية seed:", error);
    process.exit(1);
  });
