import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Search, AlertTriangle, FileText } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { DashboardLayout } from '@/layouts/DashboardLayout'; // افتراض وجود هذا المكون

// 1. تعريف هيكل البيانات
interface APAgingReportData {
  vendorId: string;
  vendorName: string;
  current: number; // مستحق حالياً
  days1_30: number; // 1-30 يوماً
  days31_60: number; // 31-60 يوماً
  days61_90: number; // 61-90 يوماً
  days90Plus: number; // أكثر من 90 يوماً
  total: number; // الإجمالي
}

// 2. تعريف مخطط التحقق (Validation Schema)
const formSchema = z.object({
  asOfDate: z.string().min(1, { message: 'تاريخ التقرير مطلوب.' }),
  vendorId: z.string().optional(),
  includeZeroBalance: z.boolean().default(false).optional(),
});

type APAgingFormValues = z.infer<typeof formSchema>;

// 3. تعريف أعمدة الجدول
const columns: ColumnDef<APAgingReportData>[] = [
  {
    accessorKey: 'vendorName',
    header: 'اسم المورد',
  },
  {
    accessorKey: 'current',
    header: 'مستحق حالياً',
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {row.original.current.toLocaleString('ar-EG', {
          style: 'currency',
          currency: 'SAR',
        })}
      </div>
    ),
  },
  {
    accessorKey: 'days1_30',
    header: '1-30 يوماً',
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.days1_30.toLocaleString('ar-EG', {
          style: 'currency',
          currency: 'SAR',
        })}
      </div>
    ),
  },
  {
    accessorKey: 'days31_60',
    header: '31-60 يوماً',
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.days31_60.toLocaleString('ar-EG', {
          style: 'currency',
          currency: 'SAR',
        })}
      </div>
    ),
  },
  {
    accessorKey: 'days61_90',
    header: '61-90 يوماً',
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.days61_90.toLocaleString('ar-EG', {
          style: 'currency',
          currency: 'SAR',
        })}
      </div>
    ),
  },
  {
    accessorKey: 'days90Plus',
    header: 'أكثر من 90 يوماً',
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.days90Plus.toLocaleString('ar-EG', {
          style: 'currency',
          currency: 'SAR',
        })}
      </div>
    ),
  },
  {
    accessorKey: 'total',
    header: 'الإجمالي',
    cell: ({ row }) => (
      <div className="text-right font-bold">
        {row.original.total.toLocaleString('ar-EG', {
          style: 'currency',
          currency: 'SAR',
        })}
      </div>
    ),
  },
];

// 4. بيانات وهمية (للتجربة)
const mockReportData: APAgingReportData[] = [
  {
    vendorId: 'V001',
    vendorName: 'شركة النور للمقاولات',
    current: 15000,
    days1_30: 5000,
    days31_60: 0,
    days61_90: 2000,
    days90Plus: 1000,
    total: 23000,
  },
  {
    vendorId: 'V002',
    vendorName: 'مؤسسة الأمان للتوريدات',
    current: 0,
    days1_30: 12000,
    days31_60: 8000,
    days61_90: 0,
    days90Plus: 0,
    total: 20000,
  },
  {
    vendorId: 'V003',
    vendorName: 'شركة الطاقة المتقدمة',
    current: 30000,
    days1_30: 0,
    days31_60: 0,
    days61_90: 0,
    days90Plus: 15000,
    total: 45000,
  },
];

// 5. المكون الرئيسي
export const AccountsPayableAgingReport: React.FC = () => {
  const [reportData, setReportData] = useState<APAgingReportData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<APAgingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      asOfDate: new Date().toISOString().split('T')[0], // تاريخ اليوم
      vendorId: '',
      includeZeroBalance: false,
    },
  });

  const onSubmit = async (values: APAgingFormValues) => {
    setIsLoading(true);
    setError(null);
    setReportData([]);

    console.log('Generating report with:', values);

    // محاكاة استدعاء API: POST /api/reports/ap-aging
    try {
      await new Promise((resolve, reject) =>
        setTimeout(() => {
          // محاكاة خطأ بنسبة 10%
          if (Math.random() < 0.1) {
            reject(new Error('فشل في الاتصال بالخادم أو خطأ في البيانات.'));
          } else {
            resolve(null);
          }
        }, 1500)
      );

      // محاكاة جلب البيانات
      setReportData(mockReportData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'حدث خطأ غير متوقع أثناء إنشاء التقرير.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // حساب الإجماليات
  const totals = useMemo(() => {
    return reportData.reduce(
      (acc, row) => {
        acc.current += row.current;
        acc.days1_30 += row.days1_30;
        acc.days31_60 += row.days31_60;
        acc.days61_90 += row.days61_90;
        acc.days90Plus += row.days90Plus;
        acc.total += row.total;
        return acc;
      },
      {
        current: 0,
        days1_30: 0,
        days31_60: 0,
        days61_90: 0,
        days90Plus: 0,
        total: 0,
      }
    );
  }, [reportData]);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          تقرير الذمم الدائنة (Accounts Payable Aging)
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          يعرض هذا التقرير تفاصيل المبالغ المستحقة للموردين موزعة حسب فترات الاستحقاق.
        </p>

        {/* نموذج التصفية */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              معايير التقرير
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* تاريخ التقرير */}
                  <FormField
                    control={form.control}
                    name="asOfDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاريخ التقرير</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* اختيار المورد (مثال مبسط) */}
                  <FormField
                    control={form.control}
                    name="vendorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المورد</FormLabel>
                        <FormControl>
                          {/* يمكن استبدال هذا بـ Select أو ComboBox من shadcn/ui لجلب الموردين */}
                          <Input
                            placeholder="كود أو اسم المورد (اختياري)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* تضمين الأرصدة الصفرية */}
                  <FormField
                    control={form.control}
                    name="includeZeroBalance"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm mt-8">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>تضمين الأرصدة الصفرية</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  إنشاء التقرير
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* عرض حالة التحميل والخطأ */}
        {isLoading && (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mr-2 text-lg">جاري تحميل التقرير...</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>خطأ في إنشاء التقرير</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* عرض نتائج التقرير */}
        {!isLoading && reportData.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>نتائج التقرير</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={reportData} />
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="text-lg font-semibold">
                الإجمالي الكلي:
              </div>
              <div className="text-xl font-bold text-primary">
                {totals.total.toLocaleString('ar-EG', {
                  style: 'currency',
                  currency: 'SAR',
                })}
              </div>
            </CardFooter>
          </Card>
        )}

        {!isLoading && !error && reportData.length === 0 && form.formState.isSubmitted && (
             <Alert>
                <FileText className="h-4 w-4" />
                <AlertTitle>لا توجد بيانات</AlertTitle>
                <AlertDescription>
                    لم يتم العثور على ذمم دائنة مطابقة لمعايير التصفية المحددة.
                </AlertDescription>
            </Alert>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AccountsPayableAgingReport;
