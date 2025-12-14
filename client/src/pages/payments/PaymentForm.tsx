import React, { useState, useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// استيراد مكونات shadcn/ui (افتراضية)
// يجب استبدال هذه الاستيرادات بالاستيرادات الفعلية لمكونات shadcn/ui
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Separator } from './ui/separator';
import { Search, CalendarIcon, ArrowUpDown, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';

// =================================================================
// 1. أنواع TypeScript (TypeScript Interfaces)
// =================================================================

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string; // ISO date string
  status: 'pending' | 'paid' | 'partial';
}

interface PaymentMethod {
  id: string;
  nameAr: string;
  nameEn: string;
}

interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  paymentDate: string; // ISO date string
  amount: number;
  paymentMethod: string; // Arabic name of the method
  status: 'completed' | 'failed' | 'refunded';
}

// =================================================================
// 2. البيانات التجريبية (Mock Data) باللغة العربية
// =================================================================

const mockPaymentMethods: PaymentMethod[] = [
  { id: 'pm1', nameAr: 'تحويل بنكي', nameEn: 'Bank Transfer' },
  { id: 'pm2', nameAr: 'نقداً', nameEn: 'Cash' },
  { id: 'pm3', nameAr: 'بطاقة ائتمانية', nameEn: 'Credit Card' },
  { id: 'pm4', nameAr: 'شيك', nameEn: 'Cheque' },
];

const mockInvoices: Invoice[] = [
  {
    id: 'inv1001',
    invoiceNumber: 'INV-2024-1001',
    customerName: 'شركة الأفق الجديد للتجارة',
    totalAmount: 5500.00,
    paidAmount: 3000.00,
    remainingAmount: 2500.00,
    dueDate: '2024-12-31',
    status: 'partial',
  },
  {
    id: 'inv1002',
    invoiceNumber: 'INV-2024-1002',
    customerName: 'مؤسسة النور للخدمات',
    totalAmount: 1200.50,
    paidAmount: 0.00,
    remainingAmount: 1200.50,
    dueDate: '2024-11-15',
    status: 'pending',
  },
  {
    id: 'inv1003',
    invoiceNumber: 'INV-2024-1003',
    customerName: 'مصنع الريادة للصناعات',
    totalAmount: 8900.00,
    paidAmount: 8900.00,
    remainingAmount: 0.00,
    dueDate: '2024-10-01',
    status: 'paid',
  },
  {
    id: 'inv1004',
    invoiceNumber: 'INV-2024-1004',
    customerName: 'متجر الابتكار الإلكتروني',
    totalAmount: 350.00,
    paidAmount: 0.00,
    remainingAmount: 350.00,
    dueDate: '2025-01-20',
    status: 'pending',
  },
];

const mockPayments: Payment[] = [
  {
    id: 'pay001',
    invoiceId: 'inv1001',
    invoiceNumber: 'INV-2024-1001',
    paymentDate: '2024-10-15',
    amount: 3000.00,
    paymentMethod: 'تحويل بنكي',
    status: 'completed',
  },
  {
    id: 'pay002',
    invoiceId: 'inv1003',
    invoiceNumber: 'INV-2024-1003',
    paymentDate: '2024-09-28',
    amount: 8900.00,
    paymentMethod: 'نقداً',
    status: 'completed',
  },
  {
    id: 'pay003',
    invoiceId: 'inv1002',
    invoiceNumber: 'INV-2024-1002',
    paymentDate: '2024-11-01',
    amount: 500.00,
    paymentMethod: 'بطاقة ائتمانية',
    status: 'completed',
  },
];

// =================================================================
// 3. مخطط التحقق (Validation Schema)
// =================================================================

const PaymentFormSchema = z.object({
  invoiceId: z.string({
    required_error: 'الرجاء اختيار فاتورة.',
  }).min(1, { message: 'الرجاء اختيار فاتورة.' }),
  paymentDate: z.date({
    required_error: 'تاريخ الدفع مطلوب.',
  }),
  amount: z.number({
    required_error: 'مبلغ الدفع مطلوب.',
  }).min(0.01, { message: 'يجب أن يكون مبلغ الدفع أكبر من صفر.' }),
  paymentMethodId: z.string({
    required_error: 'الرجاء اختيار طريقة الدفع.',
  }).min(1, { message: 'الرجاء اختيار طريقة الدفع.' }),
  notes: z.string().max(500, { message: 'يجب ألا تتجاوز الملاحظات 500 حرف.' }).optional(),
});

type PaymentFormValues = z.infer<typeof PaymentFormSchema>;

// =================================================================
// 4. المكون الرئيسي (PaymentForm Component) - سيتم استكماله في المراحل التالية
// =================================================================

// مكون وهمي لـ DashboardLayout
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8" dir="rtl">
    <header className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">إدارة الدفعات</h1>
      <p className="text-gray-600 dark:text-gray-400">تسجيل دفعة جديدة وعرض سجل الدفعات.</p>
    </header>
    <main>{children}</main>
  </div>
);

// المكون الرئيسي
const PaymentForm: React.FC = () => {
  // حالة لإدارة الدفعات
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  // تهيئة النموذج
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(PaymentFormSchema),
    defaultValues: {
      invoiceId: '',
      paymentDate: new Date(),
      amount: 0,
      paymentMethodId: '',
      notes: '',
    },
  });

  // دالة لمعالجة إرسال النموذج
  const onSubmit = (values: PaymentFormValues) => {
    console.log('Form submitted:', values);

    const selectedInvoice = mockInvoices.find(inv => inv.id === values.invoiceId);
    const selectedMethod = mockPaymentMethods.find(pm => pm.id === values.paymentMethodId);

    if (!selectedInvoice || !selectedMethod) {
      // يجب أن لا يحدث هذا بسبب التحقق (validation)
      return;
    }

    const newPayment: Payment = {
      id: isEditing && editingPayment ? editingPayment.id : `pay${Date.now()}`,
      invoiceId: values.invoiceId,
      invoiceNumber: selectedInvoice.invoiceNumber,
      paymentDate: format(values.paymentDate, 'yyyy-MM-dd'),
      amount: values.amount,
      paymentMethod: selectedMethod.nameAr,
      status: 'completed', // افتراضياً
    };

    if (isEditing && editingPayment) {
      // تعديل
      setPayments(payments.map(p => (p.id === newPayment.id ? newPayment : p)));
      setIsEditing(false);
      setEditingPayment(null);
    } else {
      // إضافة
      setPayments([...payments, newPayment]);
    }

    // إعادة تعيين النموذج
    form.reset({
      invoiceId: '',
      paymentDate: new Date(),
      amount: 0,
      paymentMethodId: '',
      notes: '',
    });
  };

  // دالة لبدء التعديل
  const handleEdit = (payment: Payment) => {
    const invoice = mockInvoices.find(inv => inv.invoiceNumber === payment.invoiceNumber);
    const method = mockPaymentMethods.find(pm => pm.nameAr === payment.paymentMethod);

    if (invoice && method) {
      setIsEditing(true);
      setEditingPayment(payment);
      form.reset({
        invoiceId: invoice.id,
        paymentDate: new Date(payment.paymentDate),
        amount: payment.amount,
        paymentMethodId: method.id,
        notes: '', // لا يوجد ملاحظات في بيانات الدفع التجريبية، لذا نتركها فارغة
      });
    }
  };

  // دالة للحذف
  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الدفعة؟')) {
      setPayments(payments.filter(p => p.id !== id));
    }
  };

  // دالة لعرض التفاصيل (وهمية)
  const handleView = (payment: Payment) => {
    alert(`تفاصيل الدفعة:\nرقم الفاتورة: ${payment.invoiceNumber}\nالمبلغ: ${payment.amount} ريال\nطريقة الدفع: ${payment.paymentMethod}\nالتاريخ: ${format(new Date(payment.paymentDate), 'dd MMMM yyyy', { locale: ar })}`);
  };

  // =================================================================
  // 5. مكون نموذج تسجيل الدفعات (Payment Form)
  // =================================================================

  const PaymentRegistrationForm: React.FC = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">{isEditing ? 'تعديل دفعة' : 'تسجيل دفعة جديدة'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* حقل اختيار الفاتورة */}
              <FormField
                control={form.control}
                name="invoiceId"
                render={({ field }) => (
                  <FormItem dir="rtl">
                    <FormLabel>الفاتورة</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger dir="rtl">
                          <SelectValue placeholder="اختر فاتورة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent dir="rtl">
                        {mockInvoices
                          .filter(inv => inv.status !== 'paid') // عرض الفواتير غير المدفوعة بالكامل فقط
                          .map((invoice) => (
                            <SelectItem key={invoice.id} value={invoice.id} dir="rtl">
                              {invoice.invoiceNumber} - {invoice.customerName} (المتبقي: {invoice.remainingAmount.toFixed(2)} ريال)
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-right">
                      اختر الفاتورة التي سيتم تسجيل الدفعة لها.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* حقل تاريخ الدفع */}
              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col" dir="rtl">
                    <FormLabel className="text-right">تاريخ الدفع</FormLabel>
                    <Popover dir="rtl">
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={`w-full justify-end text-right font-normal ${!field.value && 'text-muted-foreground'}`}
                            dir="rtl"
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: ar })
                            ) : (
                              <span>اختر تاريخ</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end" dir="rtl">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          locale={ar}
                          dir="rtl"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription className="text-right">
                      تاريخ إتمام عملية الدفع.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* حقل مبلغ الدفع */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem dir="rtl">
                    <FormLabel>مبلغ الدفع (ريال)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e: React.FormEvent) => field.onChange(parseFloat(e.target.value) || 0)}
                        dir="rtl"
                        className="text-right"
                      />
                    </FormControl>
                    <FormDescription className="text-right">
                      المبلغ المدفوع لهذه الفاتورة.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* حقل طريقة الدفع */}
              <FormField
                control={form.control}
                name="paymentMethodId"
                render={({ field }) => (
                  <FormItem dir="rtl">
                    <FormLabel>طريقة الدفع</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger dir="rtl">
                          <SelectValue placeholder="اختر طريقة الدفع" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent dir="rtl">
                        {mockPaymentMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id} dir="rtl">
                            {method.nameAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-right">
                      الطريقة التي تم بها الدفع (مثل تحويل بنكي، نقداً).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* حقل الملاحظات */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem dir="rtl">
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أضف أي ملاحظات إضافية هنا..."
                      className="resize-none text-right"
                      {...field}
                      dir="rtl"
                    />
                  </FormControl>
                  <FormDescription className="text-right">
                    ملاحظات إضافية حول عملية الدفع.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 space-x-reverse">
              <Button type="submit" className="w-full md:w-auto">
                {isEditing ? 'حفظ التعديلات' : 'تسجيل الدفعة'}
              </Button>
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingPayment(null);
                    form.reset();
                  }}
                >
                  إلغاء التعديل
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  // =================================================================
  // 6. مكون جدول الدفعات (Payments Table)
  // =================================================================

  const PaymentsTable: React.FC = () => {
    const [filter, setFilter] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Payment; direction: 'ascending' | 'descending' } | null>(null);

    const sortedAndFilteredPayments = useMemo(() => {
      let sortableItems = [...payments];

      // 1. التصفية (Filtering)
      if (filter) {
        sortableItems = sortableItems.filter(p =>
          p.invoiceNumber.toLowerCase().includes(filter.toLowerCase()) ||
          p.paymentMethod.toLowerCase().includes(filter.toLowerCase()) ||
          p.amount.toString().includes(filter)
        );
      }

      // 2. الفرز (Sorting)
      if (sortConfig !== null) {
        sortableItems.sort((a, b) => {
          const aValue = a[sortConfig.key];
          const bValue = b[sortConfig.key];

          if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        });
      }
      return sortableItems;
    }, [payments, filter, sortConfig]);

    const requestSort = (key: keyof Payment) => {
      let direction: 'ascending' | 'descending' = 'ascending';
      if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
      }
      setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof Payment) => {
      if (!sortConfig || sortConfig.key !== key) {
        return <ArrowUpDown className="ml-2 h-4 w-4" />;
      }
      return sortConfig.direction === 'ascending' ? <span className="ml-2">▲</span> : <span className="ml-2">▼</span>;
    };

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">سجل الدفعات</CardTitle>
        </CardHeader>
        <CardContent>
          {/* شريط البحث */}
          <div className="flex items-center py-4 justify-end" dir="rtl">
            <div className="relative w-full max-w-sm">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ابحث برقم الفاتورة أو طريقة الدفع..."
                value={filter}
                onChange={(e: React.FormEvent) => setFilter(e.target.value)}
                className="pr-10 text-right"
                dir="rtl"
              />
            </div>
          </div>

          {/* الجدول */}
          <div className="rounded-md border overflow-x-auto" dir="rtl">
            <Table>
              <TableHeader>
                <TableRow className="text-right">
                  <TableHead className="w-[100px] text-right">
                    <Button variant="ghost" onClick={() => requestSort('invoiceNumber')}>
                      رقم الفاتورة
                      {getSortIcon('invoiceNumber')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" onClick={() => requestSort('paymentDate')}>
                      تاريخ الدفع
                      {getSortIcon('paymentDate')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" onClick={() => requestSort('amount')}>
                      المبلغ (ريال)
                      {getSortIcon('amount')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" onClick={() => requestSort('paymentMethod')}>
                      طريقة الدفع
                      {getSortIcon('paymentMethod')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndFilteredPayments.length ? (
                  sortedAndFilteredPayments.map((payment) => (
                    <TableRow key={payment.id} className="text-right">
                      <TableCell className="font-medium">{payment.invoiceNumber}</TableCell>
                      <TableCell>{format(new Date(payment.paymentDate), 'dd/MM/yyyy', { locale: ar })}</TableCell>
                      <TableCell className="text-right">{payment.amount.toFixed(2)}</TableCell>
                      <TableCell>{payment.paymentMethod}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          payment.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {payment.status === 'completed' ? 'مكتملة' : payment.status === 'failed' ? 'فاشلة' : 'مستردة'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu dir="rtl">
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">فتح القائمة</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" dir="rtl">
                            <DropdownMenuLabel className="text-right">الإجراءات</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleView(payment)} className="text-right">
                              <Eye className="ml-2 h-4 w-4" /> عرض التفاصيل
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(payment)} className="text-right">
                              <Edit className="ml-2 h-4 w-4" /> تعديل
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(payment.id)} className="text-right text-red-600">
                              <Trash2 className="ml-2 h-4 w-4" /> حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      لا توجد دفعات مسجلة تطابق معايير البحث.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  // =================================================================
  // 7. هيكل الواجهة النهائي (Final Layout)
  // =================================================================

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PaymentRegistrationForm />
        <PaymentsTable />
      </div>
    </DashboardLayout>
  );
};

export default PaymentForm;

// ملاحظة: هذا الكود يفترض وجود مكونات shadcn/ui في مسار './ui/'
// ويفترض وجود تهيئة لـ Tailwind CSS 4 ودعم RTL.
// تم استخدام مكتبة date-fns للتعامل مع التواريخ والتعريب.
