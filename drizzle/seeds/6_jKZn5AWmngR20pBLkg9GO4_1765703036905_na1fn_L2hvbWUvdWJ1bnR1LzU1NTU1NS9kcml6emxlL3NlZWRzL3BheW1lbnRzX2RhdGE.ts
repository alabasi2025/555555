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
} from "../schema"; // افتراض أسماء الجداول من schema.ts

export async function seedpayments_data() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return 0;
  }

  console.log("بدء إضافة بيانات payments_data...");
  let totalRecordsAdded = 0;
  const createdBy = 1;
  const updatedBy = 1;
  const fiscalYear = 2024;

  // *****************************************************************
  // 1. توليد البيانات الأولية (غير المعتمدة)
  // *****************************************************************

  // 1.1. chartOfAccounts (25 سجل)
  const accounts_seed = [
    // المستوى الأول (رؤوس الحسابات)
    { id: 1, parentAccountId: null, accountCode: "1000", accountName: "الأصول", accountType: "asset", isHeader: true, level: 1, isActive: true, createdBy, updatedBy },
    { id: 2, parentAccountId: null, accountCode: "2000", accountName: "الخصوم", accountType: "liability", isHeader: true, level: 1, isActive: true, createdBy, updatedBy },
    { id: 3, parentAccountId: null, accountCode: "3000", accountName: "حقوق الملكية", accountType: "equity", isHeader: true, level: 1, isActive: true, createdBy, updatedBy },
    { id: 4, parentAccountId: null, accountCode: "4000", accountName: "الإيرادات", accountType: "revenue", isHeader: true, level: 1, isActive: true, createdBy, updatedBy },
    { id: 5, parentAccountId: null, accountCode: "5000", accountName: "المصروفات", accountType: "expense", isHeader: true, level: 1, isActive: true, createdBy, updatedBy },

    // المستوى الثاني (الأصول - 1000)
    { id: 6, parentAccountId: 1, accountCode: "1100", accountName: "الأصول المتداولة", accountType: "asset", isHeader: true, level: 2, isActive: true, createdBy, updatedBy },
    { id: 7, parentAccountId: 6, accountCode: "1110", accountName: "النقدية بالصندوق", accountType: "asset", isHeader: false, level: 3, isActive: true, createdBy, updatedBy },
    { id: 8, parentAccountId: 6, accountCode: "1120", accountName: "البنك الأهلي", accountType: "asset", isHeader: false, level: 3, isActive: true, createdBy, updatedBy },
    { id: 9, parentAccountId: 6, accountCode: "1130", accountName: "العملاء (مدينون)", accountType: "asset", isHeader: false, level: 3, isActive: true, createdBy, updatedBy },
    { id: 10, parentAccountId: 6, accountCode: "1140", accountName: "المخزون السلعي", accountType: "asset", isHeader: false, level: 3, isActive: true, createdBy, updatedBy },
    { id: 11, parentAccountId: 1, accountCode: "1200", accountName: "الأصول الثابتة", accountType: "asset", isHeader: true, level: 2, isActive: true, createdBy, updatedBy },
    { id: 12, parentAccountId: 11, accountCode: "1210", accountName: "المباني والمعدات", accountType: "asset", isHeader: false, level: 3, isActive: true, createdBy, updatedBy },

    // المستوى الثاني (الخصوم - 2000)
    { id: 13, parentAccountId: 2, accountCode: "2100", accountName: "الخصوم المتداولة", accountType: "liability", isHeader: true, level: 2, isActive: true, createdBy, updatedBy },
    { id: 14, parentAccountId: 13, accountCode: "2110", accountName: "الموردون (دائنون)", accountType: "liability", isHeader: false, level: 3, isActive: true, createdBy, updatedBy },
    { id: 15, parentAccountId: 13, accountCode: "2120", accountName: "مصروفات مستحقة الدفع", accountType: "liability", isHeader: false, level: 3, isActive: true, createdBy, updatedBy },
    { id: 16, parentAccountId: 2, accountCode: "2200", accountName: "قروض طويلة الأجل", accountType: "liability", isHeader: false, level: 2, isActive: true, createdBy, updatedBy },

    // المستوى الثاني (حقوق الملكية - 3000)
    { id: 17, parentAccountId: 3, accountCode: "3100", accountName: "رأس المال", accountType: "equity", isHeader: false, level: 2, isActive: true, createdBy, updatedBy },
    { id: 18, parentAccountId: 3, accountCode: "3200", accountName: "الأرباح المحتجزة", accountType: "equity", isHeader: false, level: 2, isActive: true, createdBy, updatedBy },

    // المستوى الثاني (الإيرادات - 4000)
    { id: 19, parentAccountId: 4, accountCode: "4100", accountName: "إيرادات مبيعات الكهرباء (سكني)", accountType: "revenue", isHeader: false, level: 2, isActive: true, createdBy, updatedBy },
    { id: 20, parentAccountId: 4, accountCode: "4200", accountName: "إيرادات مبيعات الكهرباء (تجاري)", accountType: "revenue", isHeader: false, level: 2, isActive: true, createdBy, updatedBy },
    { id: 21, parentAccountId: 4, accountCode: "4300", accountName: "إيرادات خدمات أخرى", accountType: "revenue", isHeader: false, level: 2, isActive: true, createdBy, updatedBy },

    // المستوى الثاني (المصروفات - 5000)
    { id: 22, parentAccountId: 5, accountCode: "5100", accountName: "مصروفات الرواتب والأجور", accountType: "expense", isHeader: false, level: 2, isActive: true, createdBy, updatedBy },
    { id: 23, parentAccountId: 5, accountCode: "5200", accountName: "مصروفات الصيانة", accountType: "expense", isHeader: false, level: 2, isActive: true, createdBy, updatedBy },
    { id: 24, parentAccountId: 5, accountCode: "5300", accountName: "مصروفات إيجار المحطات", accountType: "expense", isHeader: false, level: 2, isActive: true, createdBy, updatedBy },
    { id: 25, parentAccountId: 5, accountCode: "5400", accountName: "مصروفات الوقود والتشغيل", accountType: "expense", isHeader: false, level: 2, isActive: true, createdBy, updatedBy },
  ];

  // 1.2. customers (20 سجل)
  const customer_names = [
    "أحمد محمد العتيبي", "فاطمة خالد الدوسري", "شركة النور للكهرباء", "مؤسسة التقنية الحديثة", "فيلا رقم 123",
    "عبدالله ناصر القحطاني", "مريم علي الزهراني", "مصنع الأمل للصناعات", "مجمع الرياض التجاري", "شقة 401",
    "سارة فهد الشمري", "خالد ابراهيم الحربي", "مخبز وحلويات السلام", "مستشفى الحياة الخاص", "منزل 55",
    "علياء سعود العسيري", "تركي سلمان المطيري", "شركة البناء المتقدم", "ورشة الصيانة السريعة", "مزرعة الوديان"
  ];
  const customer_types = ["residential", "commercial", "industrial"];
  const customers_data = customer_names.map((name, index) => ({
    id: index + 1,
    customerName: name,
    customerType: customer_types[index % customer_types.length],
    address: `شارع ${Math.floor(Math.random() * 100) + 1}، حي ${["الربيع", "الواحة", "الفيحاء"][index % 3]}، الرياض`,
    phone: `05${Math.floor(Math.random() * 90000000) + 10000000}`,
    email: `${name.split(' ')[0].toLowerCase()}${index + 1}@example.com`,
    isActive: true,
    createdBy,
    updatedBy,
  }));

  // 1.3. suppliers (10 سجلات)
  const supplier_names = [
    "شركة الطاقة المتجددة", "مؤسسة قطع الغيار الأصلية", "خدمات الصيانة الشاملة", "الشركة الهندسية للمعدات", "مورد الكابلات الدولية",
    "شركة الوقود النظيف", "مؤسسة الأدوات الصناعية", "خدمات النقل واللوجستيات", "شركة الأنظمة الكهربائية", "مؤسسة الحلول التقنية"
  ];
  const supplier_types = ["equipment", "spare_parts", "services"];
  const suppliers_data = supplier_names.map((name, index) => ({
    id: index + 1,
    supplierName: name,
    supplierType: supplier_types[index % supplier_types.length],
    address: `طريق ${["مكة", "المدينة", "الدمام"][index % 3]}، جدة`,
    phone: `012${Math.floor(Math.random() * 9000000) + 1000000}`,
    email: `${name.split(' ')[0].toLowerCase()}${index + 1}@supplier.com`,
    isActive: true,
    createdBy,
    updatedBy,
  }));

  // 1.4. items (30 سجل)
  const item_names = [
    "محول كهربائي 100 ك.ف", "قاطع دائرة 500 أمبير", "كابل نحاسي 10 مم", "مفتاح فصل ثلاثي", "عداد كهرباء ذكي",
    "مكثف تحسين القدرة", "بطارية تخزين ليثيوم", "مروحة تبريد صناعية", "مقياس جهد رقمي", "مصباح LED عالي الكفاءة",
    "فلتر زيت للمولدات", "شمعة احتراق للمحركات", "مجموعة صيانة دورية", "بكرة سلك معزول", "صمام تحكم هيدروليكي",
    "معدات حماية شخصية", "جهاز فحص العزل", "لوحة تحكم رئيسية", "مفتاح ضغط عالي", "مقاومة حرارية",
    "مادة عزل إيبوكسي", "مفتاح تشغيل طوارئ", "مستشعر حرارة", "قاعدة تثبيت معدنية", "مادة تنظيف صناعية",
    "مفتاح تبديل أوتوماتيكي", "وحدة تحكم منطقية (PLC)", "محرك تيار مستمر صغير", "جهاز قياس التردد", "مجموعة أدوات فني"
  ];
  const item_units = ["قطعة", "متر", "وحدة", "علبة", "كيلو"];
  const item_types = ["electrical_equipment", "spare_parts", "consumables", "tools"];
  const items_data = item_names.map((name, index) => ({
    id: index + 1,
    itemName: name,
    itemCode: `ITEM-${1000 + index}`,
    unit: item_units[index % item_units.length],
    unitPrice: Math.floor(Math.random() * 90000) + 1000,
    quantityOnHand: Math.floor(Math.random() * 50) + 5,
    reorderLevel: Math.floor(Math.random() * 5) + 1,
    itemType: item_types[index % item_types.length],
    isActive: true,
    createdBy,
    updatedBy,
  }));

  // *****************************************************************
  // 2. توليد البيانات المعتمدة
  // *****************************************************************

  // 2.1. accountBalances (25 سجل) - ضمان توازن الميزانية
  const accountBalances_data = [];
  // الأصول (مدين)
  const assetAccounts = [7, 8, 9, 10, 12]; // نقدية، بنك، عملاء، مخزون، مباني
  const assetBalances = [50000, 150000, 80000, 120000, 500000]; // المجموع: 900,000
  assetAccounts.forEach((accountId, index) => {
    const balance = assetBalances[index];
    accountBalances_data.push({
      accountId,
      openingBalance: balance,
      debitAmount: balance,
      creditAmount: 0,
      closingBalance: balance,
      fiscalYear,
      createdBy,
      updatedBy,
    });
  });

  // الخصوم وحقوق الملكية (دائن)
  const liabilityEquityAccounts = [14, 15, 16, 17, 18]; // موردون، مصروفات مستحقة، قروض، رأس مال، أرباح محتجزة
  const liabilityEquityBalances = [60000, 10000, 150000, 500000, 180000]; // المجموع: 900,000
  liabilityEquityAccounts.forEach((accountId, index) => {
    const balance = liabilityEquityBalances[index];
    accountBalances_data.push({
      accountId,
      openingBalance: balance,
      debitAmount: 0,
      creditAmount: balance,
      closingBalance: balance,
      fiscalYear,
      createdBy,
      updatedBy,
    });
  });

  // المصروفات والإيرادات (أرصدة صفرية مبدئياً)
  const revenueExpenseAccounts = [19, 20, 21, 22, 23, 24, 25];
  revenueExpenseAccounts.forEach((accountId) => {
    accountBalances_data.push({
      accountId,
      openingBalance: 0,
      debitAmount: 0,
      creditAmount: 0,
      closingBalance: 0,
      fiscalYear,
      createdBy,
      updatedBy,
    });
  });

  // 2.2. invoices (50 سجل)
  const invoices_data = [];
  const invoiceStatuses = ["paid", "partial", "unpaid"];
  const customerIds = Array.from({ length: 20 }, (_, i) => i + 1); // 1 to 20

  for (let i = 0; i < 50; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 180));
    const invoiceDate = date.toISOString().split('T')[0];

    const dueDate = new Date(date);
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const totalAmount = Math.floor(Math.random() * 90000) + 10000;
    const status = invoiceStatuses[i % 3];
    let paidAmount = 0;

    if (status === "paid") {
      paidAmount = totalAmount;
    } else if (status === "partial") {
      paidAmount = Math.floor(totalAmount * (Math.random() * 0.5 + 0.1));
    }

    invoices_data.push({
      id: i + 1,
      invoiceNumber: `INV-2024-${String(i + 1).padStart(3, '0')}`,
      invoiceDate,
      customerId: customerIds[i % customerIds.length],
      totalAmount,
      paidAmount,
      status,
      dueDate: dueDateStr,
      createdBy,
      updatedBy,
    });
  }

  // 2.3. payments (40 سجل)
  const payments_data = [];
  const paymentMethods = ["cash", "check", "bank_transfer"];
  let paymentId = 1;

  // إنشاء مدفوعات للفواتير المدفوعة جزئياً أو كلياً
  invoices_data.forEach((invoice) => {
    if (invoice.paidAmount > 0 && payments_data.length < 40) {
      payments_data.push({
        id: paymentId++,
        paymentNumber: `PAY-2024-${String(paymentId).padStart(3, '0')}`,
        paymentDate: invoice.invoiceDate,
        invoiceId: invoice.id,
        amount: invoice.paidAmount,
        paymentMethod: paymentMethods[paymentId % paymentMethods.length],
        paymentType: "receipt",
        notes: invoice.status === "paid" ? "دفعة كاملة" : "دفعة جزئية",
        createdBy,
        updatedBy,
      });
    }
  });

  // إضافة دفعات إضافية حتى الوصول إلى 40
  while (payments_data.length < 40) {
    const amount = Math.floor(Math.random() * 5000) + 500;
    payments_data.push({
      id: paymentId++,
      paymentNumber: `PAY-2024-${String(paymentId).padStart(3, '0')}`,
      paymentDate: new Date().toISOString().split('T')[0],
      invoiceId: null, // دفعة غير مرتبطة بفاتورة
      amount,
      paymentMethod: paymentMethods[paymentId % paymentMethods.length],
      paymentType: "receipt",
      notes: "دفعة مقدمة غير مرتبطة بفاتورة",
      createdBy,
      updatedBy,
    });
  }

  // قص العدد إلى 40 بالضبط (للتأكد)
  payments_data.splice(40);

  // 2.4. inventoryMovements (50 سجل)
  const inventoryMovements_data = [];
  const movementTypes = ["in", "out", "adjustment"];
  const itemIds = Array.from({ length: 30 }, (_, i) => i + 1); // 1 to 30

  for (let i = 0; i < 50; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 180));
    const movementDate = date.toISOString().split('T')[0];

    const movementType = movementTypes[i % movementTypes.length];
    let quantity = Math.floor(Math.random() * 20) + 1;

    if (movementType === "out") {
      quantity *= -1;
    } else if (movementType === "adjustment") {
      quantity = Math.floor(Math.random() * 10) - 5;
    }

    inventoryMovements_data.push({
      id: i + 1,
      itemId: itemIds[i % itemIds.length],
      movementType,
      quantity,
      movementDate,
      referenceNumber: movementType === "in" ? `PO-2024-${String(i + 1).padStart(3, '0')}` : `SO-2024-${String(i + 1).padStart(3, '0')}`,
      notes: movementType === "in" ? "استلام بضاعة" : movementType === "out" ? "صرف بضاعة" : "تسوية مخزنية",
      createdBy,
      updatedBy,
    });
  }

  // *****************************************************************
  // 3. إدراج البيانات في قاعدة البيانات بالترتيب الصحيح
  // *****************************************************************

  try {
    // 1. chartOfAccounts
    await db.insert(chartOfAccounts).values(accounts_seed);
    totalRecordsAdded += accounts_seed.length;
    console.log(`✅ تم إضافة ${accounts_seed.length} سجل إلى chartOfAccounts`);

    // 2. customers
    await db.insert(customers).values(customers_data);
    totalRecordsAdded += customers_data.length;
    console.log(`✅ تم إضافة ${customers_data.length} سجل إلى customers`);

    // 3. suppliers
    await db.insert(suppliers).values(suppliers_data);
    totalRecordsAdded += suppliers_data.length;
    console.log(`✅ تم إضافة ${suppliers_data.length} سجل إلى suppliers`);

    // 4. items
    await db.insert(items).values(items_data);
    totalRecordsAdded += items_data.length;
    console.log(`✅ تم إضافة ${items_data.length} سجل إلى items`);

    // 5. accountBalances (يعتمد على chartOfAccounts)
    await db.insert(accountBalances).values(accountBalances_data);
    totalRecordsAdded += accountBalances_data.length;
    console.log(`✅ تم إضافة ${accountBalances_data.length} سجل إلى accountBalances`);

    // 6. invoices (يعتمد على customers)
    await db.insert(invoices).values(invoices_data);
    totalRecordsAdded += invoices_data.length;
    console.log(`✅ تم إضافة ${invoices_data.length} سجل إلى invoices`);

    // 7. payments (يعتمد على invoices)
    await db.insert(payments).values(payments_data);
    totalRecordsAdded += payments_data.length;
    console.log(`✅ تم إضافة ${payments_data.length} سجل إلى payments`);

    // 8. inventoryMovements (يعتمد على items)
    await db.insert(inventoryMovements).values(inventoryMovements_data);
    totalRecordsAdded += inventoryMovements_data.length;
    console.log(`✅ تم إضافة ${inventoryMovements_data.length} سجل إلى inventoryMovements`);

    console.log(`✅ تم إضافة ${totalRecordsAdded} سجل بنجاح في الإجمالي`);
    return totalRecordsAdded;
  } catch (error) {
    console.error("❌ خطأ في إضافة بيانات payments_data:", error);
    throw error;
  }
}
