// @ts-nocheck
import React, { useState, useTransition, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CalendarIcon, Loader2, FileText } from 'lucide-react';

// افتراض المكونات من shadcn/ui و مكون DashboardLayout
// يجب أن تكون هذه المكونات متاحة في المشروع
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
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils'; // افتراض وجود دالة مساعدة لدمج الفئات
import DashboardLayout from '@/components/DashboardLayout'; // افتراض وجود مكون التخطيط

// -----------------------------------------------------------------------------
// 1. تعريف المخططات والأنواع (Schema and Types)
// -----------------------------------------------------------------------------

// مخطط التحقق لنموذج توليد التقرير
const FormSchema = z.object({
  startDate: z.date({
    required_error: 'تاريخ البدء مطلوب.',
  }),
  endDate: z.date({
    required_error: 'تاريخ الانتهاء مطلوب.',
  }),
});

type ReportFormValues = z.infer<typeof FormSchema>;

// أنواع بيانات التدفق النقدي
interface CashFlowItem {
  id: number;
  description: string;
  amount: number;
  isSubtotal?: boolean;
}

interface CashFlowSection {
  title: string;
  items: CashFlowItem[];
  totalLabel: string;
  totalAmount: number;
}

interface CashFlowReport {
  reportDate: string;
  sections: CashFlowSection[];
  netCashFlow: number;
}

// -----------------------------------------------------------------------------
// 2. بيانات وهمية (Mock Data)
// -----------------------------------------------------------------------------

const mockReportData: CashFlowReport = {
  reportDate: format(new Date(), 'dd MMMM yyyy', { locale: ar }),
  sections: [
    {
      title: 'التدفقات النقدية من الأنشطة التشغيلية',
      totalLabel: 'صافي النقد من الأنشطة التشغيلية',
      items: [
        { id: 1, description: 'صافي الدخل', amount: 500000 },
        { id: 2, description: 'الاستهلاك والإطفاء', amount: 50000 },
        { id: 3, description: 'الزيادة في حسابات القبض', amount: -20000 },
        { id: 4, description: 'النقص في المخزون', amount: 15000 },
        { id: 5, description: 'الزيادة في حسابات الدفع', amount: 30000 },
      ],
      totalAmount: 575000,
    },
    {
      title: 'التدفقات النقدية من الأنشطة الاستثمارية',
      totalLabel: 'صافي النقد المستخدم في الأنشطة الاستثمارية',
      items: [
        { id: 6, description: 'شراء الأصول الثابتة', amount: -150000 },
        { id: 7, description: 'بيع الاستثمارات', amount: 40000 },
      ],
      totalAmount: -110000,
    },
    {
      title: 'التدفقات النقدية من الأنشطة التمويلية',
      totalLabel: 'صافي النقد من الأنشطة التمويلية',
      items: [
        { id: 8, description: 'إصدار أسهم جديدة', amount: 100000 },
        { id: 9, description: 'دفع توزيعات الأرباح', amount: -25000 },
        { id: 10, description: 'سداد القروض', amount: -50000 },
      ],
      totalAmount: 25000,
    },
  ],
  netCashFlow: 490000, // 575000 - 110000 + 25000
};

// -----------------------------------------------------------------------------
// 3. مكون فرعي لعرض جدول التدفق النقدي (CashFlowTable)
// -----------------------------------------------------------------------------

interface CashFlowTableProps {
  report: CashFlowReport;
}

const CashFlowTable: React.FC<CashFlowTableProps> = ({ report }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card className="mt-6 shadow-lg">
      <CardHeader className="border-b">
        <CardTitle className="text-xl text-right flex justify-between items-center">
          <span>تقرير التدفقات النقدية الموحد</span>
          <span className="text-sm font-normal text-gray-500">
            التاريخ: {report.reportDate}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table dir="rtl">
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-[70%] text-right font-bold text-gray-700">
                الوصف
              </TableHead>
              <TableHead className="w-[30%] text-left font-bold text-gray-700">
                المبلغ (ريال سعودي)
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.sections.map((section, sectionIndex) => (
              <React.Fragment key={sectionIndex}>
                {/* عنوان القسم */}
                <TableRow className="bg-gray-100 hover:bg-gray-100">
                  <TableCell
                    colSpan={2}
                    className="text-right font-extrabold text-lg text-primary"
                  >
                    {section.title}
                  </TableCell>
                </TableRow>

                {/* بنود القسم */}
                {section.items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell className="text-right pr-8">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-left font-mono">
                      {formatCurrency(item.amount)}
                    </TableCell>
                  </TableRow>
                ))}

                {/* إجمالي القسم */}
                <TableRow className="bg-gray-200 font-bold hover:bg-gray-200">
                  <TableCell className="text-right text-base">
                    {section.totalLabel}
                  </TableCell>
                  <TableCell className="text-left text-base font-mono">
                    {formatCurrency(section.totalAmount)}
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}

            {/* صافي التدفق النقدي */}
            <TableRow className="bg-green-100 font-extrabold text-lg border-t-4 border-green-500 hover:bg-green-100">
              <TableCell className="text-right">
                صافي الزيادة (النقصان) في النقد وما يعادله
              </TableCell>
              <TableCell className="text-left font-mono">
                {formatCurrency(report.netCashFlow)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// -----------------------------------------------------------------------------
// 4. المكون الرئيسي (CashFlowStatementReport)
// -----------------------------------------------------------------------------

const CashFlowStatementReport: React.FC = () => {
  const { data: dashboardData } = trpc.dashboard.getStats.useQuery();
  const [reportData, setReportData] = useState<CashFlowReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      startDate: new Date(new Date().getFullYear(), 0, 1), // بداية العام الحالي
      endDate: new Date(), // اليوم
    },
  });

  // محاكاة استدعاء API
  const simulateApiCall = useCallback(
    (data: ReportFormValues): Promise<CashFlowReport> => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // محاكاة حالة خطأ بنسبة 10%
          if (Math.random() < 0.1) {
            reject(new Error('فشل في جلب بيانات التدفقات النقدية. يرجى المحاولة مرة أخرى.'));
          } else {
            // محاكاة نجاح وجلب البيانات الوهمية
            console.log('Fetching report for:', data);
            resolve(mockReportData);
          }
        }, 1500); // 1.5 ثانية محاكاة للتحميل
      });
    },
    []
  );

  const onSubmit = (data: ReportFormValues) => {
    setError(null);
    setReportData(null);

    startTransition(async () => {
      try {
        const result = await simulateApiCall(data);
        setReportData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف أثناء توليد التقرير.');
      }
    });
  };

  return (
    <DashboardLayout title="تقرير التدفقات النقدية" dir="rtl">
      <div className="space-y-6" dir="rtl">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              توليد التقرير
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* حقل تاريخ البدء */}
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }: { field: any }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-right">تاريخ البدء</FormLabel>
                        <Popover dir="rtl">
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full justify-end text-right font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                                disabled={isPending}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP', { locale: ar })
                                ) : (
                                  <span>اختر تاريخ البدء</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              locale={ar}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage className="text-right" />
                      </FormItem>
                    )}
                  />

                  {/* حقل تاريخ الانتهاء */}
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }: { field: any }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-right">تاريخ الانتهاء</FormLabel>
                        <Popover dir="rtl">
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full justify-end text-right font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                                disabled={isPending}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP', { locale: ar })
                                ) : (
                                  <span>اختر تاريخ الانتهاء</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              locale={ar}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage className="text-right" />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري توليد التقرير...
                    </>
                  ) : (
                    'توليد التقرير'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* عرض حالة التحميل والخطأ والتقرير */}
        {isPending && (
          <div className="flex justify-center items-center p-10 bg-white rounded-lg shadow-md">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mr-3 text-lg text-primary">جاري تحميل بيانات التدفقات النقدية...</p>
          </div>
        )}

        {error && (
          <div
            className="p-4 bg-red-100 border border-red-400 text-red-700 rounded relative"
            role="alert"
          >
            <strong className="font-bold">خطأ! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {reportData && !isPending && <CashFlowTable report={reportData} />}

        {!reportData && !isPending && !error && (
          <div className="p-10 text-center text-gray-500 bg-white rounded-lg shadow-md">
            <FileText className="w-12 h-12 mx-auto mb-3" />
            <p className="text-lg">يرجى تحديد فترة زمنية والضغط على "توليد التقرير" لعرض تقرير التدفقات النقدية.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CashFlowStatementReport;
