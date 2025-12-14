import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, FileDown } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils'; // افتراض وجود دالة مساعدة لدمج الفئات

// =============================================================================
// 1. تعريف الأنواع وهيكل البيانات
// =============================================================================

// أنواع الحسابات المتاحة للتصفية
const accountTypes = [
  { value: 'Asset', label: 'أصول' },
  { value: 'Liability', label: 'خصوم' },
  { value: 'Equity', label: 'حقوق ملكية' },
  { value: 'Revenue', label: 'إيرادات' },
  { value: 'Expense', label: 'مصروفات' },
] as const;

type AccountType = (typeof accountTypes)[number]['value'];

// هيكل بيانات رصيد الحساب
interface AccountBalance {
  id: string;
  accountNumber: string;
  accountName: string; // اسم الحساب
  accountType: AccountType; // نوع الحساب
  initialBalance: number; // الرصيد الافتتاحي
  debitTotal: number; // إجمالي المدين
  creditTotal: number; // إجمالي الدائن
  currentBalance: number; // الرصيد الحالي
}

// =============================================================================
// 2. تعريف مخطط التحقق (Validation Schema)
// =============================================================================

const formSchema = z.object({
  accountType: z.union([z.literal(''), z.enum(accountTypes.map(t => t.value) as [AccountType, ...AccountType[]])]).optional(),
  startDate: z.date({
    required_error: 'تاريخ البداية مطلوب.',
  }),
  endDate: z.date({
    required_error: 'تاريخ النهاية مطلوب.',
  }),
}).refine(data => data.startDate <= data.endDate, {
  message: 'تاريخ البداية يجب أن يكون قبل أو يساوي تاريخ النهاية.',
  path: ['endDate'],
});

type ReportFormValues = z.infer<typeof formSchema>;

// =============================================================================
// 3. مكونات وهمية (Placeholders)
// =============================================================================

// مكون تخطيط لوحة القيادة (DashboardLayout) - افتراض أنه يحيط بالمحتوى
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto">
    {children}
  </div>
);

// دالة وهمية لجلب البيانات
const fetchAccountBalances = async (filters: ReportFormValues): Promise<AccountBalance[]> => {
  // محاكاة تأخير الشبكة
  await new Promise(resolve => setTimeout(resolve, 1500));

  // محاكاة بيانات التقرير
  const mockData: AccountBalance[] = [
    { id: '1', accountNumber: '1001', accountName: 'الصندوق', accountType: 'Asset', initialBalance: 50000, debitTotal: 15000, creditTotal: 5000, currentBalance: 60000 },
    { id: '2', accountNumber: '2001', accountName: 'الموردون', accountType: 'Liability', initialBalance: 20000, debitTotal: 3000, creditTotal: 10000, currentBalance: 27000 },
    { id: '3', accountNumber: '3001', accountName: 'رأس المال', accountType: 'Equity', initialBalance: 100000, debitTotal: 0, creditTotal: 10000, currentBalance: 110000 },
    { id: '4', accountNumber: '4001', accountName: 'إيرادات المبيعات', accountType: 'Revenue', initialBalance: 0, debitTotal: 0, creditTotal: 45000, currentBalance: 45000 },
    { id: '5', accountNumber: '5001', accountName: 'مصروفات التشغيل', accountType: 'Expense', initialBalance: 0, debitTotal: 12000, creditTotal: 0, currentBalance: 12000 },
  ];

  // تطبيق التصفية (بشكل مبسط)
  return mockData.filter(account => {
    if (filters.accountType && account.accountType !== filters.accountType) {
      return false;
    }
    // تصفية التاريخ يتم محاكاتها فقط، في الواقع يجب أن تتم على مستوى الخادم
    return true;
  });
};

// =============================================================================
// 4. المكون الرئيسي (AccountBalancesReport)
// =============================================================================

const AccountBalancesReport: React.FC = () => {
  const [reportData, setReportData] = useState<AccountBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // تهيئة نموذج React Hook Form
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountType: '',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // بداية الشهر الحالي
      endDate: new Date(), // اليوم الحالي
    },
  });

  // دالة معالجة إرسال النموذج
  const onSubmit = async (values: ReportFormValues) => {
    setIsLoading(true);
    setError(null);
    setReportData([]);

    try {
      const data = await fetchAccountBalances(values);
      setReportData(data);
    } catch (err) {
      setError('فشل في جلب بيانات التقرير. يرجى المحاولة مرة أخرى.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // دالة وهمية للتصدير
  const handleExport = () => {
    alert('تم محاكاة تصدير التقرير إلى ملف Excel/PDF.');
  };

  // حساب الإجماليات
  const totals = useMemo(() => {
    return reportData.reduce(
      (acc, curr) => {
        acc.initialBalance += curr.initialBalance;
        acc.debitTotal += curr.debitTotal;
        acc.creditTotal += curr.creditTotal;
        acc.currentBalance += curr.currentBalance;
        return acc;
      },
      { initialBalance: 0, debitTotal: 0, creditTotal: 0, currentBalance: 0 }
    );
  }, [reportData]);

  // دالة مساعدة لتنسيق الأرقام بالعملة
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'SAR', // استخدام الريال السعودي كمثال
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // دالة مساعدة للحصول على اسم نوع الحساب بالعربية
  const getAccountTypeName = (type: AccountType) => {
    return accountTypes.find(t => t.value === type)?.label || type;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-right">
          تقرير أرصدة الحسابات
        </h1>

        {/* بطاقة التصفية والتحكم */}
        <Card dir="rtl">
          <CardHeader>
            <CardTitle className="text-right">خيارات التقرير</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* حقل نوع الحساب */}
                  <FormField
                    control={form.control}
                    name="accountType"
                    render={({ field }) => (
                      <FormItem className="flex flex-col text-right">
                        <FormLabel>نوع الحساب</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger dir="rtl">
                              <SelectValue placeholder="اختر نوع الحساب (اختياري)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent dir="rtl">
                            <SelectItem value="">الكل</SelectItem>
                            {accountTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* حقل تاريخ البداية */}
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col text-right">
                        <FormLabel>من تاريخ</FormLabel>
                        <Popover dir="rtl">
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                                dir="rtl"
                              >
                                <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                                {field.value ? format(field.value, 'PPP', { locale: ar }) : <span>اختر تاريخ البداية</span>}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start" dir="rtl">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              locale={ar}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* حقل تاريخ النهاية */}
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col text-right">
                        <FormLabel>إلى تاريخ</FormLabel>
                        <Popover dir="rtl">
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                                dir="rtl"
                              >
                                <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                                {field.value ? format(field.value, 'PPP', { locale: ar }) : <span>اختر تاريخ النهاية</span>}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start" dir="rtl">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              locale={ar}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2 space-x-reverse pt-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    ) : null}
                    توليد التقرير
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleExport}
                    disabled={reportData.length === 0 || isLoading}
                  >
                    <FileDown className="ml-2 h-4 w-4" />
                    تصدير
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* بطاقة نتائج التقرير */}
        <Card dir="rtl">
          <CardHeader>
            <CardTitle className="text-right">نتائج التقرير</CardTitle>
          </CardHeader>
          <CardContent>
            {/* معالجة حالة التحميل */}
            {isLoading && (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mr-2 text-lg">جاري تحميل التقرير...</p>
              </div>
            )}

            {/* معالجة حالة الخطأ */}
            {error && (
              <div className="text-center p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <p className="font-bold">خطأ:</p>
                <p>{error}</p>
              </div>
            )}

            {/* عرض البيانات */}
            {!isLoading && !error && reportData.length > 0 && (
              <div className="overflow-x-auto">
                <Table className="min-w-full text-right">
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800">
                      <TableHead className="w-[100px] text-right">رقم الحساب</TableHead>
                      <TableHead className="text-right">اسم الحساب</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">الرصيد الافتتاحي</TableHead>
                      <TableHead className="text-right">إجمالي المدين</TableHead>
                      <TableHead className="text-right">إجمالي الدائن</TableHead>
                      <TableHead className="text-right font-bold">الرصيد الحالي</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.accountNumber}</TableCell>
                        <TableCell>{account.accountName}</TableCell>
                        <TableCell>{getAccountTypeName(account.accountType)}</TableCell>
                        <TableCell>{formatCurrency(account.initialBalance)}</TableCell>
                        <TableCell className="text-green-600">{formatCurrency(account.debitTotal)}</TableCell>
                        <TableCell className="text-red-600">{formatCurrency(account.creditTotal)}</TableCell>
                        <TableCell className="font-bold">{formatCurrency(account.currentBalance)}</TableCell>
                      </TableRow>
                    ))}
                    {/* صف الإجماليات */}
                    <TableRow className="bg-gray-100 dark:bg-gray-700 font-extrabold">
                      <TableCell colSpan={3} className="text-right text-lg">الإجماليات</TableCell>
                      <TableCell className="text-lg">{formatCurrency(totals.initialBalance)}</TableCell>
                      <TableCell className="text-lg text-green-700">{formatCurrency(totals.debitTotal)}</TableCell>
                      <TableCell className="text-lg text-red-700">{formatCurrency(totals.creditTotal)}</TableCell>
                      <TableCell className="text-lg">{formatCurrency(totals.currentBalance)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}

            {/* معالجة حالة عدم وجود بيانات */}
            {!isLoading && !error && reportData.length === 0 && (
              <div className="text-center p-4 text-gray-500">
                <p>لا توجد بيانات لعرضها. يرجى تحديد خيارات التقرير وتوليده.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AccountBalancesReport;

// ملاحظة: يجب التأكد من توفر المكونات التالية في مسارها الافتراضي:
// 1. @/components/ui/table
// 2. @/components/ui/button
// 3. @/components/ui/card
// 4. @/components/ui/form
// 5. @/components/ui/select
// 6. @/components/ui/calendar
// 7. @/components/ui/popover
// 8. @/lib/utils (لـ cn)
// كما تم افتراض وجود أيقونات lucide-react.
