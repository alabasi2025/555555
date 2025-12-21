/**
 * Seed Data Script for Power Station System
 * يضيف بيانات تجريبية لاختبار النظام
 */

import { Pool } from "pg";
import bcrypt from "bcryptjs";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://poweruser:powerpass123@localhost:5432/power_station_db";

async function seed() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  
  try {
    console.log("🌱 بدء إضافة البيانات التجريبية...\n");
    
    // ==================== 1. المستخدمين المحليين ====================
    console.log("👤 إضافة المستخدمين...");
    const adminPassword = await bcrypt.hash("admin123", 12);
    const userPassword = await bcrypt.hash("user123", 12);
    
    await pool.query(`
      INSERT INTO local_users (username, email, password_hash, name, role, is_active)
      VALUES 
        ('admin', 'admin@powerstation.local', $1, 'مدير النظام', 'admin', true),
        ('user1', 'user1@powerstation.local', $2, 'أحمد محمد', 'user', true),
        ('user2', 'user2@powerstation.local', $2, 'فاطمة علي', 'user', true),
        ('developer', 'dev@powerstation.local', $1, 'المطور', 'developer', true)
      ON CONFLICT (username) DO NOTHING
    `, [adminPassword, userPassword]);
    console.log("   ✅ تم إضافة 4 مستخدمين\n");
    
    // ==================== 2. شجرة الحسابات ====================
    console.log("📊 إضافة شجرة الحسابات...");
    await pool.query(`
      INSERT INTO chart_of_accounts (account_code, account_name, account_name_en, account_type, level, is_active)
      VALUES 
        ('1000', 'الأصول', 'Assets', 'asset', 1, true),
        ('1100', 'الأصول المتداولة', 'Current Assets', 'asset', 2, true),
        ('1110', 'النقدية', 'Cash', 'asset', 3, true),
        ('1120', 'البنك', 'Bank', 'asset', 3, true),
        ('1130', 'العملاء', 'Accounts Receivable', 'asset', 3, true),
        ('1200', 'الأصول الثابتة', 'Fixed Assets', 'asset', 2, true),
        ('1210', 'المعدات', 'Equipment', 'asset', 3, true),
        ('1220', 'المباني', 'Buildings', 'asset', 3, true),
        ('2000', 'الخصوم', 'Liabilities', 'liability', 1, true),
        ('2100', 'الخصوم المتداولة', 'Current Liabilities', 'liability', 2, true),
        ('2110', 'الموردين', 'Accounts Payable', 'liability', 3, true),
        ('3000', 'حقوق الملكية', 'Equity', 'equity', 1, true),
        ('3100', 'رأس المال', 'Capital', 'equity', 2, true),
        ('4000', 'الإيرادات', 'Revenue', 'revenue', 1, true),
        ('4100', 'إيرادات المبيعات', 'Sales Revenue', 'revenue', 2, true),
        ('4200', 'إيرادات الخدمات', 'Service Revenue', 'revenue', 2, true),
        ('5000', 'المصروفات', 'Expenses', 'expense', 1, true),
        ('5100', 'مصروفات التشغيل', 'Operating Expenses', 'expense', 2, true),
        ('5110', 'الرواتب', 'Salaries', 'expense', 3, true),
        ('5120', 'الإيجار', 'Rent', 'expense', 3, true)
      ON CONFLICT (account_code) DO NOTHING
    `);
    console.log("   ✅ تم إضافة 20 حساب\n");
    
    // ==================== 3. العملاء ====================
    console.log("👥 إضافة العملاء...");
    await pool.query(`
      INSERT INTO customers (customer_code, customer_name, customer_name_en, phone, email, address, city, country, is_active)
      VALUES 
        ('C001', 'شركة النور للتجارة', 'Al-Noor Trading Co.', '0501234567', 'info@alnoor.com', 'شارع الملك فهد', 'الرياض', 'السعودية', true),
        ('C002', 'مؤسسة الأمل', 'Al-Amal Foundation', '0507654321', 'contact@alamal.com', 'شارع العليا', 'جدة', 'السعودية', true),
        ('C003', 'شركة البناء الحديث', 'Modern Construction Co.', '0509876543', 'info@modern.com', 'شارع الأمير سلطان', 'الدمام', 'السعودية', true),
        ('C004', 'مصنع الخليج', 'Gulf Factory', '0501112233', 'sales@gulf.com', 'المنطقة الصناعية', 'الجبيل', 'السعودية', true),
        ('C005', 'شركة الطاقة المتجددة', 'Renewable Energy Co.', '0504445566', 'info@renewable.com', 'شارع التحلية', 'الرياض', 'السعودية', true)
      ON CONFLICT (customer_code) DO NOTHING
    `);
    console.log("   ✅ تم إضافة 5 عملاء\n");
    
    // ==================== 4. الموردين ====================
    console.log("🏭 إضافة الموردين...");
    await pool.query(`
      INSERT INTO suppliers (supplier_code, supplier_name, supplier_name_en, phone, email, address, city, country, is_active)
      VALUES 
        ('S001', 'شركة المعدات الكهربائية', 'Electrical Equipment Co.', '0551234567', 'sales@elec.com', 'شارع الصناعة', 'الرياض', 'السعودية', true),
        ('S002', 'مؤسسة قطع الغيار', 'Spare Parts Est.', '0557654321', 'info@parts.com', 'شارع الملك عبدالله', 'جدة', 'السعودية', true),
        ('S003', 'شركة الكابلات السعودية', 'Saudi Cables Co.', '0559876543', 'sales@cables.com', 'المنطقة الصناعية', 'الدمام', 'السعودية', true)
      ON CONFLICT (supplier_code) DO NOTHING
    `);
    console.log("   ✅ تم إضافة 3 موردين\n");
    
    // ==================== 5. المنتجات ====================
    console.log("📦 إضافة المنتجات...");
    await pool.query(`
      INSERT INTO items (item_code, item_name, item_name_en, item_type, category, unit, current_quantity, min_quantity, unit_cost, selling_price, is_active)
      VALUES 
        ('ITM001', 'كابل كهربائي 10مم', 'Electric Cable 10mm', 'material', 'كابلات', 'متر', 1000, 100, 5.00, 7.50, true),
        ('ITM002', 'محول كهربائي 100KVA', 'Transformer 100KVA', 'material', 'محولات', 'قطعة', 10, 2, 15000.00, 20000.00, true),
        ('ITM003', 'عداد كهرباء رقمي', 'Digital Electric Meter', 'material', 'عدادات', 'قطعة', 50, 10, 500.00, 750.00, true),
        ('ITM004', 'قاطع كهربائي 60A', 'Circuit Breaker 60A', 'spare_part', 'قواطع', 'قطعة', 100, 20, 150.00, 225.00, true),
        ('ITM005', 'مفتاح كهربائي', 'Electric Switch', 'spare_part', 'مفاتيح', 'قطعة', 200, 50, 25.00, 40.00, true),
        ('ITM006', 'لمبة LED 20W', 'LED Bulb 20W', 'consumable', 'إضاءة', 'قطعة', 500, 100, 10.00, 15.00, true),
        ('ITM007', 'شريط عازل', 'Insulation Tape', 'consumable', 'مستهلكات', 'لفة', 300, 50, 5.00, 8.00, true),
        ('ITM008', 'مفك كهربائي', 'Electric Screwdriver', 'tool', 'أدوات', 'قطعة', 20, 5, 200.00, 300.00, true)
      ON CONFLICT (item_code) DO NOTHING
    `);
    console.log("   ✅ تم إضافة 8 منتجات\n");
    
    // ==================== 6. الفواتير ====================
    console.log("📄 إضافة الفواتير...");
    await pool.query(`
      INSERT INTO invoices (invoice_number, invoice_date, due_date, customer_id, invoice_type, status, subtotal, tax_amount, total_amount, paid_amount, remaining_amount)
      VALUES 
        ('INV-2024-001', '2024-01-15', '2024-02-15', 1, 'sales', 'paid', 10000.00, 1500.00, 11500.00, 11500.00, 0.00),
        ('INV-2024-002', '2024-01-20', '2024-02-20', 2, 'sales', 'paid', 5000.00, 750.00, 5750.00, 5750.00, 0.00),
        ('INV-2024-003', '2024-02-01', '2024-03-01', 3, 'service', 'partially_paid', 8000.00, 1200.00, 9200.00, 5000.00, 4200.00),
        ('INV-2024-004', '2024-02-10', '2024-03-10', 1, 'sales', 'pending', 15000.00, 2250.00, 17250.00, 0.00, 17250.00),
        ('INV-2024-005', '2024-02-15', '2024-03-15', 4, 'subscription', 'pending', 3000.00, 450.00, 3450.00, 0.00, 3450.00)
      ON CONFLICT (invoice_number) DO NOTHING
    `);
    console.log("   ✅ تم إضافة 5 فواتير\n");
    
    // ==================== 7. المدفوعات ====================
    console.log("💰 إضافة المدفوعات...");
    await pool.query(`
      INSERT INTO payments (payment_number, payment_date, invoice_id, customer_id, amount, payment_method, reference_number)
      VALUES 
        ('PAY-2024-001', '2024-01-20', 1, 1, 11500.00, 'bank_transfer', 'TRF-001'),
        ('PAY-2024-002', '2024-01-25', 2, 2, 5750.00, 'cash', NULL),
        ('PAY-2024-003', '2024-02-05', 3, 3, 5000.00, 'check', 'CHK-001')
      ON CONFLICT (payment_number) DO NOTHING
    `);
    console.log("   ✅ تم إضافة 3 مدفوعات\n");
    
    // ==================== 8. العدادات ====================
    console.log("⚡ إضافة العدادات...");
    await pool.query(`
      INSERT INTO meters (meter_number, meter_type, location, installation_date, last_reading_value, status)
      VALUES 
        ('MTR-001', 'رقمي', 'المبنى الرئيسي - الدور الأرضي', '2023-01-01', 15000.00, 'active'),
        ('MTR-002', 'رقمي', 'المبنى الرئيسي - الدور الأول', '2023-01-01', 12500.00, 'active'),
        ('MTR-003', 'تقليدي', 'المستودع', '2022-06-15', 8000.00, 'active'),
        ('MTR-004', 'رقمي', 'ورشة الصيانة', '2023-03-01', 5500.00, 'active'),
        ('MTR-005', 'رقمي', 'مبنى الإدارة', '2023-06-01', 3000.00, 'active')
      ON CONFLICT (meter_number) DO NOTHING
    `);
    console.log("   ✅ تم إضافة 5 عدادات\n");
    
    // ==================== 9. الأصول ====================
    console.log("🏗️ إضافة الأصول...");
    await pool.query(`
      INSERT INTO assets (asset_code, asset_name, asset_name_en, category, location, purchase_date, purchase_cost, current_value, status)
      VALUES 
        ('AST-001', 'محول رئيسي 500KVA', 'Main Transformer 500KVA', 'محولات', 'محطة التحويل الرئيسية', '2022-01-15', 250000.00, 225000.00, 'active'),
        ('AST-002', 'مولد احتياطي 200KW', 'Backup Generator 200KW', 'مولدات', 'غرفة المولدات', '2022-06-01', 150000.00, 135000.00, 'active'),
        ('AST-003', 'لوحة توزيع رئيسية', 'Main Distribution Panel', 'لوحات', 'غرفة الكهرباء', '2023-01-01', 80000.00, 76000.00, 'active'),
        ('AST-004', 'سيارة صيانة', 'Maintenance Vehicle', 'مركبات', 'موقف السيارات', '2023-03-15', 120000.00, 108000.00, 'active'),
        ('AST-005', 'رافعة كهربائية', 'Electric Crane', 'معدات', 'ورشة الصيانة', '2021-09-01', 95000.00, 76000.00, 'active')
      ON CONFLICT (asset_code) DO NOTHING
    `);
    console.log("   ✅ تم إضافة 5 أصول\n");
    
    // ==================== 10. أوامر العمل ====================
    console.log("📋 إضافة أوامر العمل...");
    await pool.query(`
      INSERT INTO work_orders (order_number, order_date, customer_id, asset_id, description, status, priority, scheduled_date, estimated_cost)
      VALUES 
        ('WO-2024-001', '2024-02-01', 1, 1, 'صيانة دورية للمحول الرئيسي', 'completed', 'medium', '2024-02-05', 5000.00),
        ('WO-2024-002', '2024-02-10', 2, NULL, 'تركيب عداد جديد', 'in_progress', 'high', '2024-02-15', 2000.00),
        ('WO-2024-003', '2024-02-15', 3, 3, 'إصلاح لوحة التوزيع', 'pending', 'urgent', '2024-02-20', 8000.00),
        ('WO-2024-004', '2024-02-18', 4, 2, 'فحص المولد الاحتياطي', 'pending', 'low', '2024-02-25', 1500.00)
      ON CONFLICT (order_number) DO NOTHING
    `);
    console.log("   ✅ تم إضافة 4 أوامر عمل\n");
    
    // ==================== 11. الموظفين ====================
    console.log("👷 إضافة الموظفين...");
    await pool.query(`
      INSERT INTO employees (employee_code, first_name, last_name, email, phone, department, position, hire_date, salary, is_active)
      VALUES 
        ('EMP001', 'محمد', 'أحمد', 'mohammed@company.com', '0501111111', 'الصيانة', 'فني كهرباء', '2022-01-01', 8000.00, true),
        ('EMP002', 'علي', 'سعيد', 'ali@company.com', '0502222222', 'الصيانة', 'مهندس كهرباء', '2021-06-15', 15000.00, true),
        ('EMP003', 'فاطمة', 'محمد', 'fatima@company.com', '0503333333', 'المحاسبة', 'محاسب', '2022-03-01', 10000.00, true),
        ('EMP004', 'خالد', 'عبدالله', 'khalid@company.com', '0504444444', 'العمليات', 'مشرف عمليات', '2020-01-01', 12000.00, true),
        ('EMP005', 'سارة', 'أحمد', 'sara@company.com', '0505555555', 'خدمة العملاء', 'ممثل خدمة عملاء', '2023-01-01', 6000.00, true)
      ON CONFLICT (employee_code) DO NOTHING
    `);
    console.log("   ✅ تم إضافة 5 موظفين\n");
    
    // ==================== 12. الأدوار والصلاحيات ====================
    console.log("🔐 إضافة الأدوار والصلاحيات...");
    await pool.query(`
      INSERT INTO roles (role_name, role_name_en, description, is_active)
      VALUES 
        ('مدير النظام', 'System Admin', 'صلاحيات كاملة على النظام', true),
        ('محاسب', 'Accountant', 'صلاحيات المحاسبة والتقارير المالية', true),
        ('فني صيانة', 'Maintenance Tech', 'صلاحيات أوامر العمل والصيانة', true),
        ('مشرف', 'Supervisor', 'صلاحيات الإشراف والمراقبة', true),
        ('موظف', 'Employee', 'صلاحيات أساسية', true)
      ON CONFLICT (role_name) DO NOTHING
    `);
    
    await pool.query(`
      INSERT INTO permissions (permission_name, permission_name_en, module, description)
      VALUES 
        ('view_dashboard', 'View Dashboard', 'dashboard', 'عرض لوحة التحكم'),
        ('manage_users', 'Manage Users', 'users', 'إدارة المستخدمين'),
        ('view_reports', 'View Reports', 'reports', 'عرض التقارير'),
        ('manage_invoices', 'Manage Invoices', 'invoices', 'إدارة الفواتير'),
        ('manage_inventory', 'Manage Inventory', 'inventory', 'إدارة المخزون'),
        ('manage_customers', 'Manage Customers', 'customers', 'إدارة العملاء'),
        ('manage_work_orders', 'Manage Work Orders', 'work_orders', 'إدارة أوامر العمل'),
        ('manage_assets', 'Manage Assets', 'assets', 'إدارة الأصول'),
        ('manage_maintenance', 'Manage Maintenance', 'maintenance', 'إدارة الصيانة'),
        ('manage_accounting', 'Manage Accounting', 'accounting', 'إدارة المحاسبة')
      ON CONFLICT (permission_name) DO NOTHING
    `);
    console.log("   ✅ تم إضافة 5 أدوار و 10 صلاحيات\n");
    
    // ==================== 13. المستودعات ====================
    console.log("🏪 إضافة المستودعات...");
    await pool.query(`
      INSERT INTO warehouses (warehouse_code, warehouse_name, location, is_active)
      VALUES 
        ('WH001', 'المستودع الرئيسي', 'المنطقة الصناعية - الرياض', true),
        ('WH002', 'مستودع قطع الغيار', 'ورشة الصيانة', true),
        ('WH003', 'مستودع المواد الاستهلاكية', 'المبنى الإداري', true)
      ON CONFLICT (warehouse_code) DO NOTHING
    `);
    console.log("   ✅ تم إضافة 3 مستودعات\n");
    
    console.log("✨ تم إضافة جميع البيانات التجريبية بنجاح!");
    console.log("\n📊 ملخص البيانات المضافة:");
    console.log("   - 4 مستخدمين");
    console.log("   - 20 حساب محاسبي");
    console.log("   - 5 عملاء");
    console.log("   - 3 موردين");
    console.log("   - 8 منتجات");
    console.log("   - 5 فواتير");
    console.log("   - 3 مدفوعات");
    console.log("   - 5 عدادات");
    console.log("   - 5 أصول");
    console.log("   - 4 أوامر عمل");
    console.log("   - 5 موظفين");
    console.log("   - 5 أدوار + 10 صلاحيات");
    console.log("   - 3 مستودعات");
    
  } catch (error) {
    console.error("❌ خطأ أثناء إضافة البيانات:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed().catch(console.error);
