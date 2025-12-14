import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// *****************************************************************************
// 1. Mock Components (DashboardLayout, assumed available in the project)
// *****************************************************************************

// Mocking DashboardLayout as it's a project-specific component
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {children}
    </div>
  );
};

// *****************************************************************************
// 2. Data Structures and API Simulation
// *****************************************************************************

interface CustomerAging {
  id: string;
  customerName: string;
  current: number; // 0 days past due
  '1-30': number; // 1-30 days past due
  '31-60': number; // 31-60 days past due
  '61-90': number; // 61-90 days past due
  '90+': number; // 90+ days past due
  total: number;
}

interface AgingReport {
  reportDate: string;
  totalReceivable: number;
  customers: CustomerAging[];
}

// Mock Data
const mockData: AgingReport = {
  reportDate: new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  totalReceivable: 1250000,
  customers: [
    {
      id: 'C001',
      customerName: 'شركة النور للطاقة',
      current: 150000,
      '1-30': 50000,
      '31-60': 0,
      '61-90': 10000,
      '90+': 5000,
      total: 215000,
    },
    {
      id: 'C002',
      customerName: 'مؤسسة الأمل للمقاولات',
      current: 80000,
      '1-30': 120000,
      '31-60': 40000,
      '61-90': 0,
      '90+': 20000,
      total: 260000,
    },
    {
      id: 'C003',
      customerName: 'مصنع الرياض للكيماويات',
      current: 300000,
      '1-30': 0,
      '31-60': 0,
      '61-90': 0,
      '90+': 0,
      total: 300000,
    },
    {
      id: 'C004',
      customerName: 'شركة التقنية المتقدمة',
      current: 0,
      '1-30': 0,
      '31-60': 150000,
      '61-90': 80000,
      '90+': 200000,
      total: 430000,
    },
  ],
};

// API Simulation function
const fetchAgingReport = async (filters: {
  customerName: string;
  reportDate: string;
}): Promise<AgingReport> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.1) {
        // Simulate API error 10% of the time
        reject(new Error('فشل في جلب البيانات من الخادم. يرجى المحاولة مرة أخرى.'));
      } else {
        // Simulate filtering logic (very basic)
        const filteredCustomers = mockData.customers.filter((c) =>
          c.customerName.includes(filters.customerName)
        );

        const totalReceivable = filteredCustomers.reduce((sum, c) => sum + c.total, 0);

        resolve({
          ...mockData,
          totalReceivable,
          customers: filteredCustomers,
        });
      }
    }, 1500); // Simulate network delay
  });
};

// *****************************************************************************
// 3. Form Schema and Component
// *****************************************************************************

const filterSchema = z.object({
  customerName: z.string().optional(),
  reportDate: z.string().optional(), // In a real app, this would be a date picker
});

type FilterValues = z.infer<typeof filterSchema>;

const AgingReportFilters: React.FC<{
  onFilter: (filters: FilterValues) => void;
  isLoading: boolean;
}> = ({ onFilter, isLoading }) => {
  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      customerName: '',
      reportDate: new Date().toISOString().split('T')[0], // Default to today
    },
  });

  const onSubmit = (values: FilterValues) => {
    onFilter(values);
  };

  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-right">مرشحات التقرير</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem className="text-right">
                    <FormLabel>اسم العميل</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ابحث باسم العميل..."
                        {...field}
                        disabled={isLoading}
                        dir="rtl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reportDate"
                render={({ field }) => (
                  <FormItem className="text-right">
                    <FormLabel>تاريخ التقرير</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        disabled={isLoading}
                        dir="rtl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-end justify-end md:justify-start">
                <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                  {isLoading ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="ml-2 h-4 w-4" />
                  )}
                  تطبيق المرشحات
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

// *****************************************************************************
// 4. Main Component: AccountsReceivableAging
// *****************************************************************************

const AccountsReceivableAging: React.FC = () => {
  const [reportData, setReportData] = useState<AgingReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>({
    customerName: '',
    reportDate: new Date().toISOString().split('T')[0],
  });
  const { toast } = useToast();

  const loadReport = async (currentFilters: FilterValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAgingReport(currentFilters);
      setReportData(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'حدث خطأ غير معروف أثناء جلب التقرير.';
      setError(errorMessage);
      toast({
        title: 'خطأ في جلب البيانات',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport(filters);
  }, [filters]);

  const handleFilter = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    loadReport(filters);
  };

  // Calculate grand totals for the footer
  const grandTotals = useMemo(() => {
    if (!reportData)
      return {
        current: 0,
        '1-30': 0,
        '31-60': 0,
        '61-90': 0,
        '90+': 0,
        total: 0,
      };

    return reportData.customers.reduce(
      (acc, customer) => {
        acc.current += customer.current;
        acc['1-30'] += customer['1-30'];
        acc['31-60'] += customer['31-60'];
        acc['61-90'] += customer['61-90'];
        acc['90+'] += customer['90+'];
        acc.total += customer.total;
        return acc;
      },
      {
        current: 0,
        '1-30': 0,
        '31-60': 0,
        '61-90': 0,
        '90+': 0,
        total: 0,
      }
    );
  }, [reportData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'SAR', // Assuming Saudi Riyal or a generic currency
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800">
          تقرير الذمم المدينة (Accounts Receivable Aging)
        </h1>
        <Button onClick={handleRefresh} disabled={isLoading} variant="outline">
          {isLoading ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="ml-2 h-4 w-4" />
          )}
          تحديث
        </Button>
      </div>

      <AgingReportFilters onFilter={handleFilter} isLoading={isLoading} />

      <Card className="shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium text-right">
            ملخص التقرير
          </CardTitle>
          {reportData && (
            <div className="text-sm text-gray-500 text-left">
              <p>تاريخ التقرير: {reportData.reportDate}</p>
              <p className="font-semibold text-lg text-primary">
                إجمالي الذمم: {formatCurrency(grandTotals.total)}
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <span className="mr-3 text-lg text-gray-600">جاري تحميل التقرير...</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col justify-center items-center h-64 text-center text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
              <AlertTriangle className="h-10 w-10 mb-3" />
              <p className="text-xl font-semibold">خطأ في النظام</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {reportData && !isLoading && !error && (
            <div className="overflow-x-auto">
              <Table dir="rtl" className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-gray-100 hover:bg-gray-100">
                    <TableHead className="w-[250px] text-right font-bold text-gray-700">
                      اسم العميل
                    </TableHead>
                    <TableHead className="text-right font-bold text-gray-700">
                      الحالي (غير مستحق)
                    </TableHead>
                    <TableHead className="text-right font-bold text-gray-700">
                      1 - 30 يوم
                    </TableHead>
                    <TableHead className="text-right font-bold text-gray-700">
                      31 - 60 يوم
                    </TableHead>
                    <TableHead className="text-right font-bold text-gray-700">
                      61 - 90 يوم
                    </TableHead>
                    <TableHead className="text-right font-bold text-gray-700">
                      أكثر من 90 يوم
                    </TableHead>
                    <TableHead className="text-right font-bold text-gray-700 w-[150px] text-primary">
                      الإجمالي
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.customers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-blue-50/50">
                      <TableCell className="font-medium text-right">
                        {customer.customerName}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(customer.current)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(customer['1-30'])}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(customer['31-60'])}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(customer['61-90'])}
                      </TableCell>
                      <TableCell className="text-right text-red-600 font-semibold">
                        {formatCurrency(customer['90+'])}
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {formatCurrency(customer.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Grand Total Row */}
                  <TableRow className="bg-blue-50 font-extrabold border-t-2 border-blue-200 hover:bg-blue-100">
                    <TableCell className="text-right text-lg">
                      الإجمالي الكلي
                    </TableCell>
                    <TableCell className="text-right text-lg">
                      {formatCurrency(grandTotals.current)}
                    </TableCell>
                    <TableCell className="text-right text-lg">
                      {formatCurrency(grandTotals['1-30'])}
                    </TableCell>
                    <TableCell className="text-right text-lg">
                      {formatCurrency(grandTotals['31-60'])}
                    </TableCell>
                    <TableCell className="text-right text-lg">
                      {formatCurrency(grandTotals['61-90'])}
                    </TableCell>
                    <TableCell className="text-right text-lg text-red-700">
                      {formatCurrency(grandTotals['90+'])}
                    </TableCell>
                    <TableCell className="text-right text-lg text-primary">
                      {formatCurrency(grandTotals.total)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}

          {reportData && reportData.customers.length === 0 && !isLoading && !error && (
            <div className="flex justify-center items-center h-64 text-center text-gray-500">
              <p className="text-xl">لا توجد ذمم مدينة مطابقة للمعايير المحددة.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AccountsReceivableAging;
