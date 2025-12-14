// InvoiceDetails.tsx

import React from 'react';
import { ArrowLeft, Printer, FileText, Search, ArrowUpDown } from 'lucide-react';

// استيراد مكونات shadcn/ui (افتراضية)
// في بيئة حقيقية، سيتم استيرادها من '@/components/ui'
const Button = (props: unknown) => <button {...props} className={`p-2 rounded ${props.className}`}>{props.children}</button>;
const Card = (props: unknown) => <div {...props} className={`bg-white shadow-lg rounded-lg p-6 ${props.className}`}>{props.children}</div>;
const CardHeader = (props: unknown) => <div {...props} className={`border-b pb-4 mb-4 ${props.className}`}>{props.children}</div>;
const CardTitle = (props: unknown) => <h2 {...props} className={`text-xl font-bold ${props.className}`}>{props.children}</h2>;
const CardContent = (props: unknown) => <div {...props} className={`${props.className}`}>{props.children}</div>;
const Table = (props: unknown) => <table {...props} className={`w-full text-right ${props.className}`}>{props.children}</table>;
const TableHeader = (props: unknown) => <thead {...props} className={`bg-gray-50 ${props.className}`}>{props.children}</thead>;
const TableBody = (props: unknown) => <tbody {...props} className={`divide-y divide-gray-200 ${props.className}`}>{props.children}</tbody>;
const TableRow = (props: unknown) => <tr {...props} className={`hover:bg-gray-100 ${props.className}`}>{props.children}</tr>;
const TableHead = (props: unknown) => <th {...props} className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${props.className}`}>{props.children}</th>;
const TableCell = (props: unknown) => <td {...props} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${props.className}`}>{props.children}</td>;
const Input = (props: unknown) => <input {...props} className={`p-2 border border-gray-300 rounded-md w-full ${props.className}`} />;
const Badge = (props: unknown) => <span {...props} className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${props.className}`}>{props.children}</span>;
const Separator = (props: unknown) => <div {...props} className={`h-px bg-gray-200 w-full ${props.className}`} />;
const Label = (props: unknown) => <label {...props} className={`text-sm font-medium text-gray-700 ${props.className}`}>{props.children}</label>;
const Dialog = (props: unknown) => <div {...props} className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${props.className}`}>{props.children}</div>;
const DialogContent = (props: unknown) => <div {...props} className={`bg-white p-6 rounded-lg max-w-lg w-full ${props.className}`}>{props.children}</div>;
const DialogHeader = (props: unknown) => <div {...props} className={`border-b pb-4 mb-4 ${props.className}`}>{props.children}</div>;
const DialogTitle = (props: unknown) => <h3 {...props} className={`text-lg font-bold ${props.className}`}>{props.children}</h3>;
const DialogDescription = (props: unknown) => <p {...props} className={`text-sm text-gray-500 ${props.className}`}>{props.children}</p>;
const DialogFooter = (props: unknown) => <div {...props} className={`pt-4 mt-4 border-t flex justify-end space-x-2 ${props.className}`}>{props.children}</div>;
const Form = (props: unknown) => <form {...props}>{props.children}</form>;
const FormField = (props: unknown) => <div {...props} className={`mb-4 ${props.className}`}>{props.children}</div>;
const FormItem = (props: unknown) => <div {...props} className={`space-y-2 ${props.className}`}>{props.children}</div>;
const FormLabel = Label;
const FormControl = (props: unknown) => <div {...props}>{props.children}</div>;
const FormMessage = (props: unknown) => <p {...props} className={`text-xs text-red-500 ${props.className}`}>{props.children}</p>;
const Select = (props: unknown) => <select {...props} className={`p-2 border border-gray-300 rounded-md w-full ${props.className}`}>{props.children}</select>;
const SelectContent = (props: unknown) => <div {...props} className={`bg-white border rounded-md shadow-lg ${props.className}`}>{props.children}</div>;
const SelectItem = (props: unknown) => <option {...props} className={`p-2 hover:bg-gray-100 ${props.className}`}>{props.children}</option>;
const Textarea = (props: unknown) => <textarea {...props} className={`p-2 border border-gray-300 rounded-md w-full ${props.className}`}>{props.children}</textarea>;
const DropdownMenu = (props: unknown) => <div {...props} className={`relative ${props.className}`}>{props.children}</div>;
const DropdownMenuTrigger = (props: unknown) => <div {...props}>{props.children}</div>;
const DropdownMenuContent = (props: unknown) => <div {...props} className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 ${props.className}`}>{props.children}</div>;
const DropdownMenuItem = (props: unknown) => <div {...props} className={`p-2 hover:bg-gray-100 cursor-pointer ${props.className}`}>{props.children}</div>;
const TooltipProvider = (props: unknown) => <div {...props}>{props.children}</div>;
const Tooltip = (props: unknown) => <div {...props} className={`relative inline-block ${props.className}`}>{props.children}</div>;
const TooltipTrigger = (props: unknown) => <div {...props}>{props.children}</div>;
const TooltipContent = (props: unknown) => <span {...props} className={`absolute z-10 px-3 py-1 text-sm font-medium text-white bg-gray-700 rounded-md -top-8 left-1/2 transform -translate-x-1/2 ${props.className}`}>{props.children}</span>;


// 1. واجهات TypeScript
// -----------------------------------------------------------------------------

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId: string; // الرقم الضريبي
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'draft';

interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: InvoiceStatus;
  client: Client;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number; // نسبة الضريبة (مثلاً 0.15 لـ 15%)
  taxAmount: number;
  discount: number;
  totalAmount: number;
  notes: string;
}

// 2. بيانات تجريبية (Mock Data)
// -----------------------------------------------------------------------------

const mockClient: Client = {
  id: 'C-00123',
  name: 'شركة الأفق للتجارة العامة',
  email: 'info@alofoq.com',
  phone: '+966 50 123 4567',
  address: 'الرياض، المملكة العربية السعودية، شارع الملك فهد، مبنى رقم 5',
  taxId: '300123456700003',
};

const mockItems: InvoiceItem[] = [
  {
    id: 'ITM-001',
    description: 'خدمات تطوير واجهة مستخدم (React & TypeScript)',
    quantity: 10,
    unitPrice: 500,
    total: 5000,
  },
  {
    id: 'ITM-002',
    description: 'تصميم قاعدة بيانات (PostgreSQL)',
    quantity: 1,
    unitPrice: 3000,
    total: 3000,
  },
  {
    id: 'ITM-003',
    description: 'استضافة سحابية لمدة 12 شهر (AWS)',
    quantity: 1,
    unitPrice: 1200,
    total: 1200,
  },
];

const calculateInvoiceTotals = (items: InvoiceItem[], taxRate: number, discount: number): Omit<Invoice, 'id' | 'invoiceNumber' | 'issueDate' | 'dueDate' | 'status' | 'client' | 'notes'> => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxableBase = subtotal - discount;
  const taxAmount = taxableBase * taxRate;
  const totalAmount = taxableBase + taxAmount;

  return {
    subtotal,
    taxRate,
    taxAmount,
    discount,
    totalAmount,
  };
};

const totals = calculateInvoiceTotals(mockItems, 0.15, 500); // 15% VAT, 500 SAR discount

const mockInvoice: Invoice = {
  id: 'INV-2024-0010',
  invoiceNumber: 'INV-2024-0010',
  issueDate: '2024-12-10',
  dueDate: '2025-01-09',
  status: 'pending',
  client: mockClient,
  items: mockItems,
  notes: 'يرجى إتمام الدفع خلال 30 يومًا من تاريخ إصدار الفاتورة.',
  ...totals,
};

// دالة مساعدة لتنسيق العملة
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
  }).format(amount);
};

// دالة مساعدة لتنسيق التاريخ
const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
};

// دالة مساعدة لعرض حالة الفاتورة
const getStatusBadge = (status: InvoiceStatus) => {
  let colorClass = '';
  let text = '';

  switch (status) {
    case 'paid':
      colorClass = 'bg-green-100 text-green-800';
      text = 'مدفوعة';
      break;
    case 'pending':
      colorClass = 'bg-yellow-100 text-yellow-800';
      text = 'قيد الانتظار';
      break;
    case 'overdue':
      colorClass = 'bg-red-100 text-red-800';
      text = 'متأخرة';
      break;
    case 'draft':
      colorClass = 'bg-gray-100 text-gray-800';
      text = 'مسودة';
      break;
    default:
      colorClass = 'bg-gray-100 text-gray-800';
      text = 'غير معروف';
  }

  return <Badge className={colorClass}>{text}</Badge>;
};

// 3. مكون InvoiceDetails (سيتم إكماله في المراحل التالية)
// -----------------------------------------------------------------------------

const InvoiceDetails: React.FC = () => {
  const invoice = mockInvoice;

  // وظيفة الطباعة (تنفيذ مبسط)
  const handlePrint = () => {
    window.print();
  };

  // وظيفة تصدير PDF (تنفيذ مبسط - في بيئة حقيقية سيتطلب مكتبة مثل html2pdf أو API)
  const handleExportPdf = () => {
    alert('وظيفة تصدير PDF قيد التنفيذ. في بيئة حقيقية، سيتم إنشاء ملف PDF.');
    // يمكن استخدام مكتبة مثل html2pdf.js أو react-to-print مع خيار PDF
  };

  // حالة وهمية للبحث والفرز
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortConfig, setSortConfig] = React.useState<{ key: keyof InvoiceItem; direction: 'ascending' | 'descending' } | null>(null);

  const sortedItems = React.useMemo(() => {
    let sortableItems = [...invoice.items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems.filter(item =>
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [invoice.items, sortConfig, searchTerm]);

  const requestSort = (key: keyof InvoiceItem) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof InvoiceItem) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig.direction === 'ascending' ? (
      <span className="ml-2">▲</span>
    ) : (
      <span className="ml-2">▼</span>
    );
  };

  // مكون لعرض حقل واحد
  const DetailField: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex flex-col space-y-1">
      <Label className="text-gray-500">{label}</Label>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  );

  // مكون لتعديل حقل (تنفيذ وهمي لمتطلبات "نماذج إدخال كاملة مع validation")
  const EditableField: React.FC<{ label: string; value: string; onSave: (newValue: string) => void }> = ({ label, value, onSave }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [currentValue, setCurrentValue] = React.useState(value);

    const handleSave = () => {
      // هنا يمكن إضافة منطق التحقق (validation)
      if (currentValue.trim() !== '') {
        onSave(currentValue);
        setIsEditing(false);
      } else {
        alert('القيمة لا يمكن أن تكون فارغة.');
      }
    };

    return (
      <div className="flex flex-col space-y-1">
        <Label className="text-gray-500">{label}</Label>
        {isEditing ? (
          <div className="flex space-x-2 rtl:space-x-reverse">
            <Input
              value={currentValue}
              onChange={(e: unknown) => setCurrentValue(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleSave} className="bg-blue-500 text-white hover:bg-blue-600">
              حفظ
            </Button>
            <Button onClick={() => setIsEditing(false)} className="bg-gray-300 text-gray-800 hover:bg-gray-400">
              إلغاء
            </Button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <p className="font-medium text-gray-900">{value}</p>
            <Button onClick={() => setIsEditing(true)} className="text-blue-500 hover:text-blue-700 p-1">
              تعديل
            </Button>
          </div>
        )}
      </div>
    );
  };

  // دالة وهمية لحفظ التعديلات
  const handleUpdateInvoice = (field: keyof Invoice, newValue: string) => {
    console.log(`تحديث حقل ${field} إلى: ${newValue}`);
    // في بيئة حقيقية، سيتم إرسال طلب API لتحديث الفاتورة
  };

  // مكون لإضافة بند جديد (تنفيذ وهمي)
  const AddItemDialog: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [newItem, setNewItem] = React.useState({ description: '', quantity: 1, unitPrice: 0 });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (newItem.description && newItem.quantity > 0 && newItem.unitPrice >= 0) {
        console.log('إضافة بند جديد:', newItem);
        alert('تمت إضافة البند بنجاح (وهمي).');
        setIsOpen(false);
        setNewItem({ description: '', quantity: 1, unitPrice: 0 });
      } else {
        alert('يرجى ملء جميع الحقول بشكل صحيح.');
      }
    };

    return (
      <>
        <Button onClick={() => setIsOpen(true)} className="bg-green-500 text-white hover:bg-green-600">
          إضافة بند
        </Button>
        {isOpen && (
          <Dialog>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة بند فاتورة جديد</DialogTitle>
                <DialogDescription>أدخل تفاصيل البند الذي تريد إضافته إلى الفاتورة.</DialogDescription>
              </DialogHeader>
              <Form onSubmit={handleSubmit}>
                <FormField>
                  <FormItem>
                    <FormLabel>الوصف</FormLabel>
                    <FormControl>
                      <Textarea
                        value={newItem.description}
                        onChange={(e: unknown) => setNewItem({ ...newItem, description: e.target.value })}
                        required
                      />
                    </FormControl>
                    <FormMessage>مطلوب</FormMessage>
                  </FormItem>
                </FormField>
                <FormField>
                  <FormItem>
                    <FormLabel>الكمية</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={newItem.quantity}
                        onChange={(e: unknown) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                        min="1"
                        required
                      />
                    </FormControl>
                    <FormMessage>مطلوب</FormMessage>
                  </FormItem>
                </FormField>
                <FormField>
                  <FormItem>
                    <FormLabel>سعر الوحدة (ريال)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={newItem.unitPrice}
                        onChange={(e: unknown) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.01"
                        required
                      />
                    </FormControl>
                    <FormMessage>مطلوب</FormMessage>
                  </FormItem>
                </FormField>
                <DialogFooter>
                  <Button type="button" onClick={() => setIsOpen(false)} className="bg-gray-300 text-gray-800 hover:bg-gray-400">
                    إلغاء
                  </Button>
                  <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600">
                    إضافة
                  </Button>
                </DialogFooter>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  };

  // مكون لحذف الفاتورة (تنفيذ وهمي)
  const DeleteInvoiceButton: React.FC = () => {
    const handleDelete = () => {
      if (window.confirm(`هل أنت متأكد من حذف الفاتورة رقم ${invoice.invoiceNumber}؟`)) {
        console.log('تم حذف الفاتورة (وهمي).');
        alert('تم حذف الفاتورة بنجاح (وهمي).');
        // في بيئة حقيقية، سيتم إعادة التوجيه بعد الحذف
      }
    };

    return (
      <Button onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">
        حذف الفاتورة
      </Button>
    );
  };

  // 4. هيكل المكون الرئيسي
  // -----------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8" dir="rtl">
      {/* DashboardLayout محاكاة لـ */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* شريط الإجراءات والعودة */}
        <div className="flex justify-between items-center print:hidden">
          <Button variant="ghost" onClick={() => console.log('العودة')} className="text-gray-600 hover:text-gray-900 flex items-center space-x-2 rtl:space-x-reverse">
            <ArrowLeft className="h-5 w-5" />
            <span>العودة إلى الفواتير</span>
          </Button>
          <div className="flex space-x-2 rtl:space-x-reverse">
            <Button onClick={handlePrint} className="bg-gray-200 text-gray-800 hover:bg-gray-300 flex items-center">
              <Printer className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
              طباعة
            </Button>
            <Button onClick={handleExportPdf} className="bg-blue-500 text-white hover:bg-blue-600 flex items-center">
              <FileText className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
              تصدير PDF
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-gray-500 text-white hover:bg-gray-600">
                  إجراءات أخرى
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => console.log('تعديل الفاتورة')}>تعديل الفاتورة</DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log('إرسال عبر البريد')}>إرسال عبر البريد</DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log('تسجيل دفعة')}>تسجيل دفعة</DropdownMenuItem>
                <Separator />
                <DropdownMenuItem className="text-red-600" onClick={() => console.log('حذف الفاتورة')}>حذف الفاتورة</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* بطاقة تفاصيل الفاتورة الرئيسية */}
        <Card id="invoice-content">
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-extrabold text-blue-600">فاتورة ضريبية</CardTitle>
              <p className="text-sm text-gray-500 mt-1">رقم الفاتورة: <span className="font-mono text-lg text-gray-800">{invoice.invoiceNumber}</span></p>
            </div>
            <div className="text-left">
              {getStatusBadge(invoice.status)}
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* معلومات الفاتورة والعميل */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* تفاصيل الفاتورة */}
              <div className="space-y-4 border-l border-gray-200 pr-4 rtl:border-l-0 rtl:border-r rtl:pl-4 rtl:pr-0">
                <h3 className="text-lg font-semibold text-gray-700">تفاصيل الفاتورة</h3>
                <DetailField label="تاريخ الإصدار" value={formatDate(invoice.issueDate)} />
                <DetailField label="تاريخ الاستحقاق" value={formatDate(invoice.dueDate)} />
                <EditableField
                  label="حالة الفاتورة"
                  value={getStatusBadge(invoice.status).props.children}
                  onSave={(newValue) => handleUpdateInvoice('status', newValue)}
                />
              </div>

              {/* معلومات العميل */}
              <div className="space-y-4 border-l border-gray-200 pr-4 rtl:border-l-0 rtl:border-r rtl:pl-4 rtl:pr-0">
                <h3 className="text-lg font-semibold text-gray-700">العميل</h3>
                <DetailField label="اسم العميل" value={invoice.client.name} />
                <DetailField label="البريد الإلكتروني" value={invoice.client.email} />
                <DetailField label="الرقم الضريبي" value={invoice.client.taxId} />
              </div>

              {/* عنوان العميل */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">عنوان الشحن/الفوترة</h3>
                <DetailField label="العنوان" value={invoice.client.address} />
                <DetailField label="الهاتف" value={invoice.client.phone} />
              </div>
            </div>

            <Separator />

            {/* جدول بنود الفاتورة */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">بنود الفاتورة</h3>
                <div className="flex space-x-4 rtl:space-x-reverse print:hidden">
                  <div className="relative">
                    <Input
                      placeholder="ابحث في البنود..."
                      value={searchTerm}
                      onChange={(e: unknown) => setSearchTerm(e.target.value)}
                      className="pr-10 rtl:pl-10 rtl:pr-3"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 rtl:left-3 rtl:right-auto" />
                  </div>
                  <AddItemDialog />
                </div>
              </div>

              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%] text-right">
                        <Button variant="ghost" onClick={() => requestSort('description')} className="flex items-center justify-end w-full text-right">
                          الوصف
                          {getSortIcon('description')}
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button variant="ghost" onClick={() => requestSort('quantity')} className="flex items-center justify-end w-full text-right">
                          الكمية
                          {getSortIcon('quantity')}
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button variant="ghost" onClick={() => requestSort('unitPrice')} className="flex items-center justify-end w-full text-right">
                          سعر الوحدة
                          {getSortIcon('unitPrice')}
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button variant="ghost" onClick={() => requestSort('total')} className="flex items-center justify-end w-full text-right">
                          الإجمالي
                          {getSortIcon('total')}
                        </Button>
                      </TableHead>
                      <TableHead className="text-right print:hidden">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(item.total)}</TableCell>
                        <TableCell className="print:hidden">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                ...
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => console.log('تعديل البند', item.id)}>تعديل</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => console.log('حذف البند', item.id)}>حذف</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {sortedItems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500">
                          لا توجد بنود مطابقة لنتائج البحث.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <Separator />

            {/* ملخص المبالغ والملاحظات */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* الملاحظات */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">ملاحظات</h3>
                <EditableField
                  label="ملاحظات الفاتورة"
                  value={invoice.notes}
                  onSave={(newValue) => handleUpdateInvoice('notes', newValue)}
                />
              </div>

              {/* ملخص المبالغ */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">ملخص الفاتورة</h3>
                <div className="flex justify-between">
                  <span className="text-gray-600">المجموع الفرعي:</span>
                  <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الخصم:</span>
                  <span className="font-medium text-red-600">({formatCurrency(invoice.discount)})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ضريبة القيمة المضافة ({invoice.taxRate * 100}%):</span>
                  <span className="font-medium">{formatCurrency(invoice.taxAmount)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-xl font-extrabold text-blue-600">
                  <span>المبلغ الإجمالي المستحق:</span>
                  <span>{formatCurrency(invoice.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* قسم الإجراءات الإضافية (حذف) */}
            <div className="pt-4 border-t print:hidden">
              <DeleteInvoiceButton />
            </div>
          </CardContent>
        </Card>

        {/* ملاحظة خاصة بالطباعة */}
        <div className="hidden print:block text-center text-sm text-gray-500 mt-8">
          تم إنشاء هذه الفاتورة في {formatDate(new Date().toISOString().split('T')[0])}.
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
