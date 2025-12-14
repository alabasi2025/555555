import React, { useState, useMemo } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Search, AlertTriangle } from 'lucide-react';

// افتراض أن هذا المكون موجود في المشروع
// import DashboardLayout from '@/components/layout/DashboardLayout';

// =================================================================
// 1. تعريف أنواع البيانات (Types)
// =================================================================

interface FinancialRow {
  id: string;
  name: string;
  currentYearAmount: number;
  previousYearAmount: number;
  isTotal?: boolean;
  isHeader?: boolean;
}

interface BalanceSheetData {
  assets: FinancialRow[];
  liabilities: FinancialRow[];
  equity: FinancialRow[];
}

// =================================================================
// 2. تعريف مخطط التحقق (Validation Schema)
// =================================================================

const formSchema = z.object({
  year: z.string().min(4, { message: 'يجب إدخال سنة صحيحة.' }).max(4),
  period: z.enum(['Q1', 'Q2', 'Q3', 'Q4', 'Annual'], {
    required_error: 'يجب اختيار الفترة.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

// =================================================================
// 3. بيانات وهمية (Mock Data)
// =================================================================

const mockBalanceSheetData: BalanceSheetData = {
  assets: [
    { id: '1', name: 'النقد وما يعادله', currentYearAmount: 150000, previousYearAmount: 120000 },
    { id: '2', name: 'الذمم المدينة', currentYearAmount: 85000, previousYearAmount: 90000 },
    { id: '3', name: 'المخزون', currentYearAmount: 120000, previousYearAmount: 110000 },
    { id: '4', name: 'إجمالي الأصول المتداولة', currentYearAmount: 355000, previousYearAmount: 320000, isTotal: true },
    { id: '5', name: 'المعدات والآلات', currentYearAmount: 500000, previousYearAmount: 520000 },
    { id: '6', name: 'الأصول غير المتداولة الأخرى', currentYearAmount: 150000, previousYearAmount: 130000 },
    { id: '7', name: 'إجمالي الأصول غير المتداولة', currentYearAmount: 650000, previousYearAmount: 650000, isTotal: true },
    { id: '8', name: 'إجمالي الأصول', currentYearAmount: 1005000, previousYearAmount: 970000, isTotal: true, isHeader: true },
  ],
  liabilities: [
    { id: '9', name: 'الذمم الدائنة', currentYearAmount: 90000, previousYearAmount: 80000 },
    { id: '10', name: 'قروض قصيرة الأجل', currentYearAmount: 50000, previousYearAmount: 60000 },
    { id: '11', name: 'إجمالي الالتزامات المتداولة', currentYearAmount: 140000, previousYearAmount: 140000, isTotal: true },
    { id: '12', name: 'قروض طويلة الأجل', currentYearAmount: 300000, previousYearAmount: 350000 },
    { id: '13', name: 'إجمالي الالتزامات غير المتداولة', currentYearAmount: 300000, previousYearAmount: 350000, isTotal: true },
    { id: '14', name: 'إجمالي الالتزامات', currentYearAmount: 440000, previousYearAmount: 490000, isTotal: true, isHeader: true },
  ],
  equity: [
    { id: '15', name: 'رأس المال المصدر', currentYearAmount: 400000, previousYearAmount: 400000 },
    { id: '16', name: 'الأرباح المحتجزة', currentYearAmount: 165000, previousYearAmount: 80000 },
    { id: '17', name: 'إجمالي حقوق الملكية', currentYearAmount: 565000, previousYearAmount: 480000, isTotal: true, isHeader: true },
    { id: '18', name: 'إجمالي الالتزامات وحقوق الملكية', currentYearAmount: 1005000, previousYearAmount: 970000, isTotal: true, isHeader: true },
  ],
};

// =================================================================
// 4. المكونات المساعدة (Helper Components)
// =================================================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
  }).format(amount);
};

const TableRowComponent: React.FC<{ row: FinancialRow }> = ({ row }) => {
  const baseClasses = 'text-right';
  const totalClasses = row.isTotal ? 'font-semibold border-t-2 border-gray-300 dark:border-gray-700' : '';
  const headerClasses = row.isHeader ? 'font-extrabold bg-gray-100 dark:bg-gray-800 text-lg' : '';

  return (
    <TableRow className={`${totalClasses} ${headerClasses}`}>
      <TableCell className={`text-right ${headerClasses}`}>{row.name}</TableCell>
      <TableCell className={`${baseClasses} ${totalClasses} ${headerClasses}`}>
        {formatCurrency(row.currentYearAmount)}
      </TableCell>
      <TableCell className={`${baseClasses} ${totalClasses} ${headerClasses}`}>
        {formatCurrency(row.previousYearAmount)}
      </TableCell>
    </TableRow>
  );
};

// =================================================================
// 5. المكون الرئيسي (BalanceSheetReport)
// =================================================================

const BalanceSheetReport: React.FC = () => {
  const [reportData, setReportData] = useState<BalanceSheetData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      year: new Date().getFullYear().toString(),
      period: 'Annual',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);
    setReportData(null);

    // محاكاة استدعاء API
    try {
      // API Endpoint: GET /api/financials/balance-sheet?year={values.year}&period={values.period}
      await new Promise((resolve) => setTimeout(resolve, 1500)); // محاكاة تأخير الشبكة

      if (values.year === '2024' && values.period === 'Q4') {
        // محاكاة بيانات ناجحة
        setReportData(mockBalanceSheetData);
      } else if (values.year === '2023') {
        // محاكاة خطأ في البيانات
        throw new Error('لا تتوفر بيانات لهذا العام.');
      } else {
        // محاكاة بيانات ناجحة أخرى
        setReportData(mockBalanceSheetData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء جلب التقرير.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTableSection = (title: string, data: FinancialRow[]) => (
    <div className="mb-6">
      <h3 className="text-xl font-bold mb-3 border-b pb-1 text-primary">{title}</h3>
      <Table dir="rtl">
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-800">
            <TableHead className="w-[50%] text-right text-lg font-bold">البند</TableHead>
            <TableHead className="w-[25%] text-right text-lg font-bold">السنة الحالية</TableHead>
            <TableHead className="w-[25%] text-right text-lg font-bold">السنة السابقة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRowComponent key={row.id} row={row} />
          ))}
        </TableBody>
      </Table>
    </div>
  );

  // استخدام DashboardLayout افتراضيًا
  const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="p-8 max-w-7xl mx-auto" dir="rtl">
      {children}
    </div>
  );

  return (
    <DashboardLayout>
      <Card className="w-full shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="text-3xl font-extrabold text-right">تقرير الميزانية العمومية</CardTitle>
          <CardDescription className="text-right text-lg">
            عرض تفصيلي للأصول والالتزامات وحقوق الملكية للشركة في تاريخ محدد.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {/* نموذج التصفية */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>السنة المالية</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: 2024" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="period"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>الفترة</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger dir="rtl">
                            <SelectValue placeholder="اختر الفترة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent dir="rtl">
                          <SelectItem value="Annual">سنوي</SelectItem>
                          <SelectItem value="Q1">الربع الأول (Q1)</SelectItem>
                          <SelectItem value="Q2">الربع الثاني (Q2)</SelectItem>
                          <SelectItem value="Q3">الربع الثالث (Q3)</SelectItem>
                          <SelectItem value="Q4">الربع الرابع (Q4)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="md:col-span-2">
                  {isLoading ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="ml-2 h-4 w-4" />
                  )}
                  عرض التقرير
                </Button>
              </div>
            </form>
          </Form>

          {/* معالجة الأخطاء */}
          {error && (
            <Alert variant="destructive" className="mb-6 text-right" dir="rtl">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>خطأ في جلب البيانات</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* حالة التحميل */}
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="mr-3 text-lg">جاري تحميل تقرير الميزانية العمومية...</p>
            </div>
          )}

          {/* عرض التقرير */}
          {reportData && !isLoading && (
            <div className="mt-8 p-4 border rounded-lg bg-white dark:bg-gray-900">
              <h2 className="text-2xl font-extrabold mb-6 text-center">
                الميزانية العمومية كما في {form.getValues('year')} - {form.getValues('period')}
              </h2>

              {renderTableSection('الأصول (Assets)', reportData.assets)}
              {renderTableSection('الالتزامات (Liabilities)', reportData.liabilities)}
              {renderTableSection('حقوق الملكية (Equity)', reportData.equity)}
            </div>
          )}

          {!reportData && !isLoading && !error && (
            <div className="text-center p-10 border-2 border-dashed rounded-lg text-gray-500 dark:text-gray-400">
              <Search className="mx-auto h-12 w-12 mb-3" />
              <p className="text-lg">يرجى اختيار السنة والفترة والضغط على "عرض التقرير" لعرض البيانات.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default BalanceSheetReport;
