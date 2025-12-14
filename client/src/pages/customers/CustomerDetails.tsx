import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// افتراض أن هذه المكونات موجودة في المشروع
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

// =================================================================
// 1. تعريف هياكل البيانات (Typescript Interfaces)
// =================================================================

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  accountStatus: 'active' | 'inactive' | 'suspended';
  totalInvoices: number;
  totalPaid: number;
  lastActive: string;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
}

// =================================================================
// 2. تعريف مخطط التحقق (Validation Schema)
// =================================================================

const formSchema = z.object({
  name: z.string().min(2, { message: 'الاسم يجب أن يحتوي على حرفين على الأقل.' }),
  email: z.string().email({ message: 'صيغة البريد الإلكتروني غير صحيحة.' }),
  phone: z.string().regex(/^(\+?\d{1,3})?[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/, {
    message: 'صيغة رقم الهاتف غير صحيحة.',
  }),
  address: z.string().min(5, { message: 'العنوان يجب أن يحتوي على 5 أحرف على الأقل.' }),
});

type CustomerFormValues = z.infer<typeof formSchema>;

// =================================================================
// 3. بيانات وهمية (Mock Data)
// =================================================================

const mockCustomer: Customer = {
  id: 'CUST001',
  name: 'أحمد محمد العباسي',
  email: 'ahmed.alabasi@example.com',
  phone: '+966 50 123 4567',
  address: 'شارع الملك فهد، الرياض، المملكة العربية السعودية',
  accountStatus: 'active',
  totalInvoices: 15,
  totalPaid: 12500.5,
  lastActive: '2025-12-14',
};

const mockInvoices: Invoice[] = [
  { id: 'INV0015', date: '2025-12-01', amount: 850.0, status: 'paid' },
  { id: 'INV0014', date: '2025-11-01', amount: 920.5, status: 'overdue' },
  { id: 'INV0013', date: '2025-10-01', amount: 780.0, status: 'pending' },
  { id: 'INV0012', date: '2025-09-01', amount: 1100.0, status: 'paid' },
];

const mockPayments: Payment[] = [
  { id: 'PAY0025', date: '2025-12-10', amount: 850.0, method: 'تحويل بنكي' },
  { id: 'PAY0024', date: '2025-10-25', amount: 780.0, method: 'بطاقة ائتمانية' },
  { id: 'PAY0023', date: '2025-09-05', amount: 1100.0, method: 'نقداً' },
];

// =================================================================
// 4. المكونات المساعدة (Helper Components)
// =================================================================

const StatusBadge: React.FC<{ status: Customer['accountStatus'] | Invoice['status'] }> = ({ status }) => {
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
  let text = '';

  switch (status) {
    case 'active':
    case 'paid':
      variant = 'default';
      text = status === 'active' ? 'نشط' : 'مدفوعة';
      break;
    case 'pending':
      variant = 'secondary';
      text = 'قيد الانتظار';
      break;
    case 'overdue':
    case 'suspended':
      variant = 'destructive';
      text = status === 'overdue' ? 'متأخرة' : 'موقوف';
      break;
    case 'inactive':
      variant = 'outline';
      text = 'غير نشط';
      break;
  }

  return <Badge variant={variant} className="min-w-[80px] justify-center">{text}</Badge>;
};

const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
    <Loader2 className="w-8 h-8 animate-spin mb-4" />
    <p>جاري تحميل البيانات...</p>
  </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <Alert variant="destructive" className="rtl text-right">
    <XCircle className="h-4 w-4 ml-2" />
    <AlertTitle>خطأ في التحميل</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

// =================================================================
// 5. المكون الرئيسي (CustomerDetails)
// =================================================================

export const CustomerDetails: React.FC = () => {
  const { customerId } = useRoute<{ customerId: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // تهيئة النموذج باستخدام البيانات الوهمية
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
    mode: 'onChange',
  });

  // محاكاة جلب البيانات
  useEffect(() => {
    // في بيئة حقيقية، سيتم استخدام customerId لجلب البيانات من API
    // console.log(`Fetching data for customer: ${customerId}`);

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // محاكاة تأخير الشبكة
        await new Promise(resolve => setTimeout(resolve, 1000));

        // محاكاة نجاح التحميل
        setCustomer(mockCustomer);
        setInvoices(mockInvoices);
        setPayments(mockPayments);

        // تعيين القيم الافتراضية للنموذج بعد تحميل البيانات
        form.reset({
          name: mockCustomer.name,
          email: mockCustomer.email,
          phone: mockCustomer.phone,
          address: mockCustomer.address,
        });

      } catch (err) {
        // محاكاة خطأ في التحميل
        setError('فشل في جلب بيانات العميل. يرجى المحاولة مرة أخرى.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [customerId, form]);

  // معالجة إرسال النموذج (تحديث بيانات العميل)
  const onSubmit = async (values: CustomerFormValues) => {
    setIsSubmitting(true);
    setSubmitSuccess(null);
    setError(null);
    try {
      // محاكاة طلب API لتحديث البيانات (PUT /api/customers/{customerId})
      await new Promise(resolve => setTimeout(resolve, 1500));

      // محاكاة تحديث حالة العميل محلياً
      setCustomer(prev => prev ? { ...prev, ...values } : null);

      setSubmitSuccess('تم تحديث بيانات العميل بنجاح!');
    } catch (err) {
      setError('فشل في تحديث بيانات العميل. يرجى التحقق من المدخلات والمحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <DashboardLayout title="تفاصيل العميل"><LoadingState /></DashboardLayout>;
  }

  if (error && !customer) {
    return <DashboardLayout title="تفاصيل العميل"><ErrorState message={error} /></DashboardLayout>;
  }

  if (!customer) {
    return <DashboardLayout title="تفاصيل العميل"><ErrorState message="لم يتم العثور على العميل المطلوب." /></DashboardLayout>;
  }

  // =================================================================
  // 6. عرض الواجهة
  // =================================================================

  return (
    <DashboardLayout title={`تفاصيل العميل: ${customer.name}`}>
      <div className="rtl text-right space-y-6">
        {/* قسم الملخص والبطاقات الإحصائية */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">حالة الحساب</CardTitle>
              {customer.accountStatus === 'active' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <StatusBadge status={customer.accountStatus} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">آخر نشاط: {customer.lastActive}</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الفواتير</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customer.totalInvoices}</div>
              <p className="text-xs text-muted-foreground mt-1">عدد الفواتير الصادرة</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المبلغ الإجمالي المدفوع</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customer.totalPaid.toFixed(2)} ر.س</div>
              <p className="text-xs text-muted-foreground mt-1">إجمالي المدفوعات حتى الآن</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">رقم العميل</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customer.id}</div>
              <p className="text-xs text-muted-foreground mt-1">معرف العميل في النظام</p>
            </CardContent>
          </Card>
        </div>

        {/* قسم علامات التبويب (Tabs) */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">معلومات العميل</TabsTrigger>
            <TabsTrigger value="invoices">الفواتير ({invoices.length})</TabsTrigger>
            <TabsTrigger value="payments">المدفوعات ({payments.length})</TabsTrigger>
          </TabsList>

          {/* تبويب معلومات العميل */}
          <TabsContent value="details" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>تعديل معلومات العميل</CardTitle>
                <CardDescription>قم بتحديث بيانات الاتصال والعنوان للعميل.</CardDescription>
              </CardHeader>
              <CardContent>
                {submitSuccess && (
                  <Alert className="mb-4 rtl text-right">
                    <CheckCircle className="h-4 w-4 ml-2 text-green-600" />
                    <AlertTitle>نجاح</AlertTitle>
                    <AlertDescription>{submitSuccess}</AlertDescription>
                  </Alert>
                )}
                {error && !submitSuccess && (
                  <ErrorState message={error} />
                )}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="text-right">
                            <FormLabel>الاسم الكامل</FormLabel>
                            <FormControl>
                              <Input placeholder="أحمد محمد العباسي" {...field} dir="rtl" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="text-right">
                            <FormLabel>البريد الإلكتروني</FormLabel>
                            <FormControl>
                              <Input placeholder="example@domain.com" {...field} dir="ltr" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem className="text-right">
                            <FormLabel>رقم الهاتف</FormLabel>
                            <FormControl>
                              <Input placeholder="+966 50 123 4567" {...field} dir="ltr" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem className="text-right">
                            <FormLabel>العنوان</FormLabel>
                            <FormControl>
                              <Input placeholder="شارع الملك فهد، الرياض" {...field} dir="rtl" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSubmitting || !form.formState.isDirty || !form.formState.isValid}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            جاري الحفظ...
                          </>
                        ) : (
                          'حفظ التغييرات'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب الفواتير */}
          <TabsContent value="invoices">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>سجل الفواتير</CardTitle>
                <CardDescription>قائمة بجميع الفواتير الصادرة للعميل.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table className="rtl text-right">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">رقم الفاتورة</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead className="text-left">المبلغ (ر.س)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.length > 0 ? (
                      invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.id}</TableCell>
                          <TableCell>{invoice.date}</TableCell>
                          <TableCell>
                            <StatusBadge status={invoice.status} />
                          </TableCell>
                          <TableCell className="text-left font-bold">{invoice.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                          لا توجد فواتير مسجلة لهذا العميل.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب المدفوعات */}
          <TabsContent value="payments">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>سجل المدفوعات</CardTitle>
                <CardDescription>قائمة بجميع المدفوعات التي قام بها العميل.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table className="rtl text-right">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">رقم الدفعة</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>المبلغ (ر.س)</TableHead>
                      <TableHead className="text-left">طريقة الدفع</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length > 0 ? (
                      payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.id}</TableCell>
                          <TableCell>{payment.date}</TableCell>
                          <TableCell>{payment.amount.toFixed(2)}</TableCell>
                          <TableCell className="text-left">{payment.method}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                          لا توجد مدفوعات مسجلة لهذا العميل.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDetails;
