// @ts-nocheck
import React, { useState, useMemo, useCallback } from 'react';
import { trpc } from '@/lib/trpc';

// =================================================================
// TypeScript Interfaces (Merged from purchase_order_data.ts)
// =================================================================

interface Supplier {
  id: string;
  name: string; // اسم المورد
  contactPerson: string; // مسؤول الاتصال
  phone: string; // رقم الهاتف
  address: string; // العنوان
}

interface Product {
  id: string;
  name: string; // اسم الصنف
  unit: string; // وحدة القياس (مثل: كجم، متر، قطعة)
  unitPrice: number; // سعر الوحدة
}

interface PurchaseOrderItem {
  productId: string;
  productName: string; // اسم الصنف (للعرض)
  unit: string; // وحدة القياس (للعرض)
  quantity: number; // الكمية المطلوبة
  unitPrice: number; // سعر الوحدة الفعلي في الطلب
  total: number; // الإجمالي = الكمية * سعر الوحدة
}

interface PurchaseOrderForm {
  supplierId: string;
  supplierName: string; // اسم المورد (للعرض)
  items: PurchaseOrderItem[];
  subTotal: number; // المجموع الفرعي
  vatRate: number; // نسبة الضريبة (مثلاً 0.15)
  vatAmount: number; // مبلغ الضريبة
  totalAmount: number; // الإجمالي الكلي
  notes: string; // ملاحظات
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected'; // حالة الطلب
  createdAt: string; // تاريخ الإنشاء
}

// =================================================================
// Constants and Mock Data (Arabic) (Merged from purchase_order_data.ts)
// =================================================================

const VAT_RATE = 0.15; // 15% ضريبة القيمة المضافة

const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 'S001',
    name: 'شركة الأمل للمقاولات',
    contactPerson: 'أحمد محمود',
    phone: '0501234567',
    address: 'الرياض، حي النرجس، شارع الأمير محمد بن سلمان',
  },
  {
    id: 'S002',
    name: 'مؤسسة البناء الحديث للتوريدات',
    contactPerson: 'خالد الفهد',
    phone: '0559876543',
    address: 'جدة، المنطقة الصناعية، شارع رقم 5',
  },
  {
    id: 'S003',
    name: 'مصنع الزجاج الوطني',
    contactPerson: 'سارة العلي',
    phone: '0561122334',
    address: 'الدمام، طريق الملك فهد',
  },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'P101',
    name: 'أسمنت بورتلاند عادي',
    unit: 'كيس (50 كجم)',
    unitPrice: 14.50,
  },
  {
    id: 'P102',
    name: 'حديد تسليح 12 مم',
    unit: 'طن',
    unitPrice: 2800.00,
  },
  {
    id: 'P103',
    name: 'أنابيب بلاستيكية (PVC) 4 بوصة',
    unit: 'متر',
    unitPrice: 12.75,
  },
  {
    id: 'P104',
    name: 'بلاط سيراميك أرضيات 60x60',
    unit: 'متر مربع',
    unitPrice: 45.00,
  },
  {
    id: 'P105',
    name: 'دهان أساس مائي داخلي',
    unit: 'جالون (18 لتر)',
    unitPrice: 185.50,
  },
];

// =================================================================
// Utility Functions (Merged from purchase_order_data.ts)
// =================================================================

/**
 * Calculates the subtotal, VAT amount, and total amount for a purchase order.
 * @param items - The list of purchase order items.
 * @returns An object containing the calculated totals.
 */
const calculateOrderTotals = (items: PurchaseOrderItem[]) => {
  const subTotal = items.reduce((sum, item) => sum + item.total, 0);
  const vatAmount = subTotal * VAT_RATE;
  const totalAmount = subTotal + vatAmount;

  return {
    subTotal: parseFloat(subTotal.toFixed(2)),
    vatAmount: parseFloat(vatAmount.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
  };
};

/**
 * Generates the initial state for a new purchase order form.
 * @returns The initial PurchaseOrderForm object.
 */
const getInitialPurchaseOrderState = (): PurchaseOrderForm => {
  const initialItems: PurchaseOrderItem[] = [
    {
      productId: 'P101',
      productName: 'أسمنت بورتلاند عادي',
      unit: 'كيس (50 كجم)',
      quantity: 100,
      unitPrice: 14.50,
      total: 1450.00,
    },
    {
      productId: 'P104',
      productName: 'بلاط سيراميك أرضيات 60x60',
      unit: 'متر مربع',
      quantity: 50,
      unitPrice: 45.00,
      total: 2250.00,
    },
  ];

  const totals = calculateOrderTotals(initialItems);

  return {
    supplierId: MOCK_SUPPLIERS[0].id,
    supplierName: MOCK_SUPPLIERS[0].name,
    items: initialItems,
    vatRate: VAT_RATE,
    notes: 'يرجى التأكد من جودة المواد وتاريخ التسليم في الموعد المحدد.',
    status: 'Draft',
    createdAt: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    ...totals,
  };
};

// =================================================================
// Mock Components (Simulating shadcn/ui and DashboardLayout)
// Note: In a real project, these would be imported from the component library.
// =================================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'destructive' | 'ghost' | 'link' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'default', className = '', ...props }) => {
  const baseStyle = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const variantStyles = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-blue-600 underline-offset-4 hover:underline',
  };
  const sizeStyles = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 rounded-md',
    lg: 'h-11 px-8 rounded-md',
    icon: 'h-10 w-10',
  };

  return (
    <button
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles.default} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`rounded-xl border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);

const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    {...props}
  />
);

const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = (props) => (
  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" {...props} />
);

const Select: React.FC<{ children: React.ReactNode; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; className?: string }> = ({ children, className = '', ...props }) => (
  <select
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </select>
);

const Table: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className="relative w-full overflow-auto">
    <table className={`w-full caption-bottom text-sm ${className}`}>{children}</table>
  </div>
);

const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="[&_tr]:border-b">{children}</thead>
);

const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
);

const TableRow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <tr className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}>{children}</tr>
);

const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <th className={`h-12 px-4 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}>
    {children}
  </th>
);

const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</td>
);

const DashboardLayout: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => (
  <div className="min-h-screen bg-gray-50 p-4 sm:p-8" dir="rtl">
    <header className="mb-6">
      <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      <p className="text-gray-500">إدارة طلبات الشراء بكفاءة وفعالية.</p>
    </header>
    <main>{children}</main>
  </div>
);

// =================================================================
// Step 1: Select Supplier
// =================================================================

interface Step1Props {
  formData: PurchaseOrderForm;
  setFormData: React.Dispatch<React.SetStateAction<PurchaseOrderForm>>;
  onNext: () => void;
}

const Step1SelectSupplier: React.FC<Step1Props> = ({ formData, setFormData, onNext }) => {
  const [error, setError] = useState('');

  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const supplierId = (e.target as HTMLInputElement).value;
    const selectedSupplier = MOCK_SUPPLIERS.find(s => s.id === supplierId);

    if (selectedSupplier) {
      setFormData(prev => ({
        ...prev,
        supplierId: selectedSupplier.id,
        supplierName: selectedSupplier.name,
      }));
      setError('');
    } else {
      setFormData(prev => ({
        ...prev,
        supplierId: '',
        supplierName: '',
      }));
    }
  };

  const handleNext = () => {
    if (!formData.supplierId) {
      setError('الرجاء اختيار مورد للمتابعة.');
      return;
    }
    onNext();
  };

  const selectedSupplier = MOCK_SUPPLIERS.find(s => s.id === formData.supplierId);

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>الخطوة 1: اختيار المورد</CardTitle>
        <CardDescription>حدد المورد الذي سيتم إصدار طلب الشراء له.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="supplier-select">اسم المورد</Label>
          <Select
            id="supplier-select"
            value={formData.supplierId}
            onChange={handleSupplierChange}
            className="text-right"
          >
            <option value="" disabled>اختر مورد...</option>
            {MOCK_SUPPLIERS.map(supplier => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </Select>
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>

        {selectedSupplier && (
          <div className="border p-4 rounded-lg bg-gray-50 space-y-2 text-right">
            <h4 className="font-semibold text-lg">تفاصيل المورد المختار</h4>
            <p><strong>مسؤول الاتصال:</strong> {selectedSupplier.contactPerson}</p>
            <p><strong>رقم الهاتف:</strong> {selectedSupplier.phone}</p>
            <p><strong>العنوان:</strong> {selectedSupplier.address}</p>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleNext}>
            التالي: إضافة الأصناف
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// =================================================================
// Step 2: Add Items and Review
// =================================================================

interface Step2Props {
  formData: PurchaseOrderForm;
  setFormData: React.Dispatch<React.SetStateAction<PurchaseOrderForm>>;
  onPrev: () => void;
  onSubmit: () => void;
}

const Step2AddItems: React.FC<Step2Props> = ({ formData, setFormData, onPrev, onSubmit }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<{ productId: string; quantity: number; unitPrice: number }>({
    productId: '',
    quantity: 1,
    unitPrice: 0,
  });
  const [itemError, setItemError] = useState('');

  const availableProducts = MOCK_PRODUCTS.filter(
    p => !formData.items.some(item => item.productId === p.id)
  );

  const handleNewItemChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: name === 'productId' ? value : parseFloat(value) || 0,
    }));
    setItemError('');
  };

  const handleAddItem = () => {
    if (!newItem.productId || newItem.quantity <= 0 || newItem.unitPrice <= 0) {
      setItemError('الرجاء إدخال صنف صالح وكمية وسعر وحدة أكبر من صفر.');
      return;
    }

    const product = MOCK_PRODUCTS.find(p => p.id === newItem.productId);
    if (!product) return;

    const newOrderItem: PurchaseOrderItem = {
      productId: product.id,
      productName: product.name,
      unit: product.unit,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
      total: newItem.quantity * newItem.unitPrice,
    };

    const updatedItems = [...formData.items, newOrderItem];
    const totals = calculateOrderTotals(updatedItems);

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      ...totals,
    }));

    setNewItem({ productId: '', quantity: 1, unitPrice: 0 });
    setIsAdding(false);
    setItemError('');
  };

  const handleRemoveItem = (productId: string) => {
    const updatedItems = formData.items.filter(item => item.productId !== productId);
    const totals = calculateOrderTotals(updatedItems);

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      ...totals,
    }));
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      notes: (e.target as HTMLInputElement).value,
    }));
  };

  const handleSubmit = () => {
    if (formData.items.length === 0) {
      alert('لا يمكن إرسال طلب شراء بدون أصناف.');
      return;
    }
    // Simulate API call
    console.log('Submitting Purchase Order:', formData);
    alert(`تم إرسال طلب الشراء بنجاح للمورد: ${formData.supplierName}`);
    onSubmit();
  };

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} ر.س`;

  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle>الخطوة 2: إضافة الأصناف والمراجعة</CardTitle>
        <CardDescription>أضف الأصناف المطلوبة وراجع إجمالي الطلب.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Items Table */}
        <div className="space-y-4">
          <h4 className="font-semibold text-xl text-right">قائمة الأصناف المطلوبة</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">الصنف</TableHead>
                <TableHead className="w-[15%]">الوحدة</TableHead>
                <TableHead className="w-[15%] text-center">الكمية</TableHead>
                <TableHead className="w-[15%] text-center">سعر الوحدة</TableHead>
                <TableHead className="w-[15%] text-center">الإجمالي</TableHead>
                <TableHead className="w-[5%]">إجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                    لا توجد أصناف في طلب الشراء.
                  </TableCell>
                </TableRow>
              ) : (
                formData.items.map(item => (
                  <TableRow key={item.productId}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-center">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="text-center font-semibold">{formatCurrency(item.total)}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveItem(item.productId)}
                      >
                        حذف
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add Item Form */}
        <Card className="p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h5 className="font-semibold text-lg">إضافة صنف جديد</h5>
            <Button variant="secondary" onClick={() => setIsAdding(!isAdding)}>
              {isAdding ? 'إلغاء الإضافة' : 'إضافة صنف'}
            </Button>
          </div>

          {isAdding && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="product-select">الصنف</Label>
                <Select
                  id="product-select"
                  name="productId"
                  value={newItem.productId}
                  onChange={handleNewItemChange}
                  className="text-right"
                >
                  <option value="" disabled>اختر صنف...</option>
                  {availableProducts.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.unit})
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">الكمية</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={handleNewItemChange}
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitPrice">سعر الوحدة</Label>
                <Input
                  id="unitPrice"
                  name="unitPrice"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={newItem.unitPrice}
                  onChange={handleNewItemChange}
                  className="text-right"
                />
              </div>
              <Button onClick={handleAddItem} disabled={!newItem.productId || newItem.quantity <= 0 || newItem.unitPrice <= 0}>
                إضافة
              </Button>
            </div>
          )}
          {itemError && <p className="text-sm text-red-600 mt-2">{itemError}</p>}
        </Card>

        {/* Totals and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="notes">ملاحظات إضافية</Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={handleNotesChange}
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-right"
            />
          </div>
          <div className="md:col-span-1 space-y-2 border p-4 rounded-lg bg-blue-50">
            <h4 className="font-semibold text-lg text-blue-800 text-right">ملخص الطلب</h4>
            <div className="flex justify-between text-right">
              <span>المجموع الفرعي:</span>
              <span className="font-medium">{formatCurrency(formData.subTotal)}</span>
            </div>
            <div className="flex justify-between text-right">
              <span>ضريبة القيمة المضافة ({VAT_RATE * 100}%):</span>
              <span className="font-medium">{formatCurrency(formData.vatAmount)}</span>
            </div>
            <div className="flex justify-between text-right border-t pt-2 mt-2 border-blue-200">
              <span className="text-xl font-bold text-blue-800">الإجمالي الكلي:</span>
              <span className="text-xl font-bold text-blue-800">{formatCurrency(formData.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onPrev}>
            السابق: اختيار المورد
          </Button>
          <Button onClick={handleSubmit} disabled={formData.items.length === 0}>
            إرسال طلب الشراء
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// =================================================================
// Main Component: PurchaseOrder
// =================================================================

export const PurchaseOrder: React.FC = () => {
  const [formData, setFormData] = useState<PurchaseOrderForm>(getInitialPurchaseOrderState());
  const [step, setStep] = useState(1); // 1: Select Supplier, 2: Add Items

  const handleNext = useCallback(() => {
    setStep(prev => Math.min(prev + 1, 2));
  }, []);

  const handlePrev = useCallback(() => {
    setStep(prev => Math.max(prev - 1, 1));
  }, []);

  const handleSubmit = useCallback(() => {
    // After submission, reset the form or navigate to a success page
    setFormData(getInitialPurchaseOrderState());
    setStep(1);
  }, []);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1SelectSupplier
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <Step2AddItems
            formData={formData}
            setFormData={setFormData}
            onPrev={handlePrev}
            onSubmit={handleSubmit}
          />
        );
      default:
        return <div>خطأ في الخطوة</div>;
    }
  };

  return (
    <DashboardLayout title="إنشاء طلب شراء جديد">
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
          <span className={`font-medium ${step === 1 ? 'text-blue-600' : 'text-gray-600'}`}>اختيار المورد</span>
          <div className="w-16 h-0.5 bg-gray-300"></div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
          <span className={`font-medium ${step === 2 ? 'text-blue-600' : 'text-gray-600'}`}>إضافة الأصناف والمراجعة</span>
        </div>
      </div>
      {renderStep()}
    </DashboardLayout>
  );
};

export default PurchaseOrder;
