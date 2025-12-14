// @ts-nocheck
import { z } from "zod";

// رسائل الخطأ المخصصة بالعربية
const errorMessages = {
  required: "هذا الحقل مطلوب",
  invalidEmail: "البريد الإلكتروني غير صحيح",
  invalidPhone: "رقم الهاتف غير صحيح",
  minLength: (min: number) => `يجب أن يكون الحد الأدنى ${min} أحرف`,
  maxLength: (max: number) => `يجب أن لا يتجاوز ${max} حرف`,
  positive: "يجب أن تكون القيمة موجبة",
  min: (min: number) => `يجب أن تكون القيمة أكبر من أو تساوي ${min}`,
  max: (max: number) => `يجب أن تكون القيمة أقل من أو تساوي ${max}`,
  invalidDate: "التاريخ غير صحيح",
  invalidNumber: "الرقم غير صحيح",
};

// Schema للحسابات
export const accountSchema = z.object({
  accountCode: z.string().min(1, "رمز الحساب مطلوب").max(50),
  accountName: z.string().min(1, "اسم الحساب مطلوب").max(255),
  accountNameEn: z.string().max(255).optional(),
  accountType: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
  parentAccountId: z.number().int().positive().optional().nullable(),
  level: z.number().int().min(1).max(10).default(1),
  isActive: z.boolean().default(true),
  notes: z.string().max(1000).optional(),
});

export type AccountFormData = z.infer<typeof accountSchema>;

// Schema للعملاء
export const customerSchema = z.object({
  customerCode: z.string().min(1, "رمز العميل مطلوب").max(50),
  customerName: z.string().min(1, "اسم العميل مطلوب").max(255),
  customerType: z.enum(["individual", "company", "government"]),
  contactPerson: z.string().max(255).optional(),
  phone: z.string().regex(/^[0-9+\-\s()]*$/, "رقم الهاتف يجب أن يحتوي على أرقام فقط").max(20).optional(),
  mobile: z.string().regex(/^[0-9+\-\s()]*$/, "رقم الجوال يجب أن يحتوي على أرقام فقط").max(20).optional(),
  email: z.string().email(errorMessages.invalidEmail).max(320).optional().or(z.literal("")),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  taxNumber: z.string().max(50).optional(),
  creditLimit: z.string().regex(/^\d+(\.\d{1,2})?$/, "الحد الائتماني يجب أن يكون رقماً صحيحاً").optional().default("0.00"),
  paymentTerms: z.string().max(100).optional(),
  isActive: z.boolean().default(true),
  notes: z.string().max(1000).optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

// Schema للموردين
export const supplierSchema = z.object({
  supplierCode: z.string().min(1, "رمز المورد مطلوب").max(50),
  supplierName: z.string().min(1, "اسم المورد مطلوب").max(255),
  supplierType: z.enum(["local", "international"]),
  contactPerson: z.string().max(255).optional(),
  phone: z.string().regex(/^[0-9+\-\s()]*$/, "رقم الهاتف يجب أن يحتوي على أرقام فقط").max(20).optional(),
  mobile: z.string().regex(/^[0-9+\-\s()]*$/, "رقم الجوال يجب أن يحتوي على أرقام فقط").max(20).optional(),
  email: z.string().email(errorMessages.invalidEmail).max(320).optional().or(z.literal("")),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  taxNumber: z.string().max(50).optional(),
  paymentTerms: z.string().max(100).optional(),
  isActive: z.boolean().default(true),
  notes: z.string().max(1000).optional(),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;

// Schema للفواتير
export const invoiceItemSchema = z.object({
  itemDescription: z.string().min(1, "وصف الصنف مطلوب").max(500),
  quantity: z.string().regex(/^\d+(\.\d{1,2})?$/, "الكمية يجب أن تكون رقماً صحيحاً").refine((val) => parseFloat(val) > 0, "الكمية يجب أن تكون أكبر من صفر"),
  unitPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "سعر الوحدة يجب أن يكون رقماً صحيحاً").refine((val) => parseFloat(val) >= 0, "سعر الوحدة يجب أن يكون صفراً أو أكبر"),
  taxRate: z.string().regex(/^\d+(\.\d{1,2})?$/, "نسبة الضريبة يجب أن تكون رقماً صحيحاً").default("0.00"),
  discountRate: z.string().regex(/^\d+(\.\d{1,2})?$/, "نسبة الخصم يجب أن تكون رقماً صحيحاً").default("0.00"),
  totalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "المبلغ الإجمالي يجب أن يكون رقماً صحيحاً"),
});

export const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "رقم الفاتورة مطلوب").max(50),
  invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, errorMessages.invalidDate),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, errorMessages.invalidDate),
  customerId: z.number().int().positive(),
  invoiceType: z.enum(["sales", "service", "subscription"]),
  status: z.enum(["draft", "pending", "paid", "partially_paid", "overdue", "cancelled"]).default("draft"),
  subtotal: z.string().regex(/^\d+(\.\d{1,2})?$/, errorMessages.invalidNumber).default("0.00"),
  taxAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, errorMessages.invalidNumber).default("0.00"),
  discountAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, errorMessages.invalidNumber).default("0.00"),
  totalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, errorMessages.invalidNumber),
  notes: z.string().max(1000).optional(),
  items: z.array(invoiceItemSchema).min(1, "يجب إضافة صنف واحد على الأقل"),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;

// Schema للمدفوعات
export const paymentSchema = z.object({
  paymentNumber: z.string().min(1, "رقم الدفعة مطلوب").max(50),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, errorMessages.invalidDate),
  invoiceId: z.number().int().positive(),
  customerId: z.number().int().positive(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, errorMessages.invalidNumber).refine((val) => parseFloat(val) > 0, "المبلغ يجب أن يكون أكبر من صفر"),
  paymentMethod: z.enum(["cash", "bank_transfer", "check", "credit_card", "online"]),
  referenceNumber: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

// Schema للأصناف
export const itemSchema = z.object({
  itemCode: z.string().min(1, "رمز الصنف مطلوب").max(50),
  itemName: z.string().min(1, "اسم الصنف مطلوب").max(255),
  itemNameEn: z.string().max(255).optional(),
  itemType: z.enum(["material", "spare_part", "tool", "consumable"]),
  category: z.string().max(100).optional(),
  unit: z.string().max(50).default("piece"),
  currentQuantity: z.string().regex(/^\d+(\.\d{1,2})?$/, errorMessages.invalidNumber).default("0.00"),
  minQuantity: z.string().regex(/^\d+(\.\d{1,2})?$/, errorMessages.invalidNumber).default("0.00"),
  maxQuantity: z.string().regex(/^\d+(\.\d{1,2})?$/, errorMessages.invalidNumber).default("0.00"),
  unitCost: z.string().regex(/^\d+(\.\d{1,2})?$/, errorMessages.invalidNumber).default("0.00"),
  sellingPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, errorMessages.invalidNumber).default("0.00"),
  location: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

export type ItemFormData = z.infer<typeof itemSchema>;

// Schema للحركات المخزنية
export const inventoryMovementSchema = z.object({
  movementNumber: z.string().min(1, "رقم الحركة مطلوب").max(50),
  movementDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, errorMessages.invalidDate),
  movementType: z.enum(["in", "out", "adjustment", "transfer"]),
  itemId: z.number().int().positive(),
  quantity: z.string().regex(/^\d+(\.\d{1,2})?$/, errorMessages.invalidNumber).refine((val) => parseFloat(val) > 0, "الكمية يجب أن تكون أكبر من صفر"),
  unitCost: z.string().regex(/^\d+(\.\d{1,2})?$/, errorMessages.invalidNumber).default("0.00"),
  totalCost: z.string().regex(/^\d+(\.\d{1,2})?$/, errorMessages.invalidNumber).default("0.00"),
  fromLocation: z.string().max(100).optional(),
  toLocation: z.string().max(100).optional(),
  referenceType: z.string().max(50).optional(),
  referenceId: z.number().int().positive().optional(),
  notes: z.string().max(1000).optional(),
});

export type InventoryMovementFormData = z.infer<typeof inventoryMovementSchema>;
