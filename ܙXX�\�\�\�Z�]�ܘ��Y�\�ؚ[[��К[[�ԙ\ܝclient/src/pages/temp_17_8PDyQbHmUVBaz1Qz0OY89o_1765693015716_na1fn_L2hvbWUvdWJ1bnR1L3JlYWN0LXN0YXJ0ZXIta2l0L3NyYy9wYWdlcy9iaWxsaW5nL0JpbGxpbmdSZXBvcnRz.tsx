import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search, Loader2, BarChart3, DollarSign, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// افتراض وجود هذا المكون في المشروع
import DashboardLayout from '@/layouts/DashboardLayout';

// 1. تعريف مخطط التحقق (Validation Schema)
const formSchema = z.object({
  reportType: z.enum(['monthly', 'customer', 'status'], {
    required_error: 'يجب اختيار نوع التقرير.',
  }),
  startDate: z.date({
    required_error: 'يجب تحديد تاريخ البدء.',
  }),
  endDate: z.date({
    required_error: 'يجب تحديد تاريخ الانتهاء.',
  }),
  minAmount: z.string().optional(),
});

type ReportFormValues = z.infer<typeof formSchema>;

// 2. تعريف أنواع البيانات للتقرير
interface ReportSummary {
  totalRevenue: number;
  paidInvoices: number;
  pendingAmount: number;
  averageInvoice: number;
}

interface ReportDetail {
  id: string;
  date: string;
  customer: string;
  amount: number;
  status: 'مدفوعة' | 'معلقة' | 'ملغاة';
}

interface ReportData {
  summary: ReportSummary;
  details: ReportDetail[];
}

// 3. محاكاة جلب البيانات (مع حالات التحميل والخطأ)
const useBillingReports = () => {
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async (filters: ReportFormValues) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // محاكاة خطأ في حالة معينة
      if (filters.reportType === 'status' && filters.startDate.getFullYear() === 2024) {
        throw new Error('فشل في جلب تقارير الحالة لعام 2024.');
      }

      // محاكاة البيانات المرجعة
      const mockSummary: ReportSummary = {
        totalRevenue: 154320.50,
        paidInvoices: 450,
        pendingAmount: 12500.00,
        averageInvoice: 342.93,
      };

      const mockDetails: ReportDetail[] = [
        { id: 'INV001', date: '2025-11-01', customer: 'شركة الأمل', amount: 5200.00, status: 'مدفوعة' },
        { id: 'INV002', date: '2025-11-05', customer: 'مؤسسة النور', amount: 1250.50, status: 'معلقة' },
        { id: 'INV003', date: '2025-11-10', customer: 'مصنع الطاقة', amount: 15000.00, status: 'مدفوعة' },
        { id: 'INV004', date: '2025-11-15', customer: 'العميل الفردي أ', amount: 350.00, status: 'مدفوعة' },
        { id: 'INV005', date: '2025-11-20', customer: 'شركة الأمل', amount: 800.00, status: 'ملغاة' },
      ];

      setData({ summary: mockSummary, details: mockDetails });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف أثناء جلب البيانات.');
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, fetchReports };
};

// 4. مكون بطاقة الملخص الإحصائي
const SummaryCard: React.FC<{ title: string; value: string; icon: React.ReactNode; description: string }> = ({ title, value, icon, description }) => (
  <Card className="shadow-lg">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

// 5. المكون الرئيسي للواجهة
const BillingReports: React.FC = () => {
  const { data, isLoading, error, fetchReports } = useBillingReports();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportType: 'monthly',
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      endDate: new Date(),
      minAmount: '',
    },
  });

  const onSubmit = (values: ReportFormValues) => {
    console.log('Fetching reports with filters:', values);
    fetchReports(values);
  };

  const summaryData = useMemo(() => {
    if (!data) return [];
    return [
      {
        title: 'إجمالي الإيرادات',
        value: `${data.summary.totalRevenue.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}`,
        icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
        description: 'إجمالي المبالغ المدفوعة خلال الفترة',
      },
      {
        title: 'عدد الفواتير المدفوعة',
        value: data.summary.paidInvoices.toLocaleString('ar-SA'),
        icon: <Users className="h-4 w-4 text-muted-foreground" />,
        description: 'عدد الفواتير التي تم تسويتها',
      },
      {
        title: 'المبالغ المعلقة',
        value: `${data.summary.pendingAmount.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}`,
        icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
        description: 'إجمالي المبالغ غير المسددة',
      },
      {
        title: 'متوسط قيمة الفاتورة',
        value: `${data.summary.averageInvoice.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}`,
        icon: <BarChart3 className="h-4 w-4 text-muted-foreground" />,
        description: 'متوسط قيمة الفاتورة المدفوعة',
      },
    ];
  }, [data]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6" dir="rtl">
        <h1 className="text-3xl font-bold tracking-tight">تقارير الفواتير الإحصائية</h1>
        <p className="text-muted-foreground">استعرض التقارير الإحصائية والتحليلية للفواتير الصادرة والمدفوعة والمعلقة.</p>

        {/* بطاقة فلاتر البحث */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>تصفية التقارير</CardTitle>
            <CardDescription>حدد المعايير المطلوبة لإنشاء التقرير.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-0 md:grid md:grid-cols-5 md:gap-4 items-end">
                {/* نوع التقرير */}
                <FormField
                  control={form.control}
                  name="reportType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع التقرير</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger dir="rtl">
                            <SelectValue placeholder="اختر نوع التقرير" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent dir="rtl">
                          <SelectItem value="monthly">ملخص شهري</SelectItem>
                          <SelectItem value="customer">تصنيف العملاء</SelectItem>
                          <SelectItem value="status">حالة الفواتير</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* تاريخ البدء */}
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="whitespace-nowrap">تاريخ البدء</FormLabel>
                      <Popover dir="rtl">
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full justify-start text-right font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                              {field.value ? format(field.value, 'PPP', { locale: ar }) : <span>اختر تاريخ</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                            initialFocus
                            locale={ar}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* تاريخ الانتهاء */}
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="whitespace-nowrap">تاريخ الانتهاء</FormLabel>
                      <Popover dir="rtl">
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full justify-start text-right font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                              {field.value ? format(field.value, 'PPP', { locale: ar }) : <span>اختر تاريخ</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                            initialFocus
                            locale={ar}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* الحد الأدنى للمبلغ */}
                <FormField
                  control={form.control}
                  name="minAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الحد الأدنى للمبلغ</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: 1000" {...field} type="number" dir="rtl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* زر البحث */}
                <Button type="submit" disabled={isLoading} className="col-span-5 md:col-span-1 mt-2 md:mt-0">
                  {isLoading ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="ml-2 h-4 w-4" />
                  )}
                  عرض التقرير
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* حالة التحميل والخطأ */}
        {isLoading && (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mr-2 text-lg">جاري تحميل التقرير...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded relative" role="alert" dir="rtl">
            <strong className="font-bold">خطأ!</strong>
            <span className="block sm:inline mr-2">{error}</span>
          </div>
        )}

        {/* عرض التقرير (الملخص والتفاصيل) */}
        {data && !isLoading && !error && (
          <div className="space-y-6">
            {/* ملخص إحصائي */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {summaryData.map((item, index) => (
                <SummaryCard key={index} {...item} />
              ))}
            </div>

            {/* تفاصيل التقرير (جدول) */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>تفاصيل التقرير</CardTitle>
                <CardDescription>عرض تفصيلي للفواتير التي تطابق معايير البحث.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table dir="rtl">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">رقم الفاتورة</TableHead>
                        <TableHead>العميل</TableHead>
                        <TableHead>التاريخ</TableHead>
                        <TableHead className="text-right">المبلغ (ريال)</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.details.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.id}</TableCell>
                          <TableCell>{invoice.customer}</TableCell>
                          <TableCell>{invoice.date}</TableCell>
                          <TableCell className="text-right">{invoice.amount.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right">
                            <span
                              className={cn(
                                'px-2 py-1 rounded-full text-xs font-medium',
                                invoice.status === 'مدفوعة' && 'bg-green-100 text-green-800',
                                invoice.status === 'معلقة' && 'bg-yellow-100 text-yellow-800',
                                invoice.status === 'ملغاة' && 'bg-red-100 text-red-800'
                              )}
                            >
                              {invoice.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BillingReports;
