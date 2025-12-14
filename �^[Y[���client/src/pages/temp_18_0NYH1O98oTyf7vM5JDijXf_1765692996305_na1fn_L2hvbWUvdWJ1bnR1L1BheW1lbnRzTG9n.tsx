import React, { useState, useEffect, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './components/ui/table'; // Assuming shadcn/ui components are available
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Skeleton } from './components/ui/skeleton';
import { ArrowUpDown, Search, RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';
import { DashboardLayout } from './layouts/DashboardLayout'; // Placeholder for the required layout

// 1. تعريف هيكل بيانات الدفع
interface Payment {
  id: string;
  invoiceId: string;
  customerName: string;
  amount: number;
  currency: 'SAR' | 'USD';
  paymentMethod: 'بطاقة ائتمانية' | 'تحويل بنكي' | 'نقدي';
  status: 'ناجح' | 'معلق' | 'فشل';
  paymentDate: Date;
}

// 2. محاكاة البيانات
const mockPayments: Payment[] = [
  {
    id: 'P001',
    invoiceId: 'INV-2025-001',
    customerName: 'شركة النور للطاقة',
    amount: 15000.5,
    currency: 'SAR',
    paymentMethod: 'تحويل بنكي',
    status: 'ناجح',
    paymentDate: new Date('2025-12-10'),
  },
  {
    id: 'P002',
    invoiceId: 'INV-2025-002',
    customerName: 'مؤسسة الأمل للكهرباء',
    amount: 4500.0,
    currency: 'USD',
    paymentMethod: 'بطاقة ائتمانية',
    status: 'معلق',
    paymentDate: new Date('2025-12-11'),
  },
  {
    id: 'P003',
    invoiceId: 'INV-2025-003',
    customerName: 'الشركة المتحدة',
    amount: 8900.75,
    currency: 'SAR',
    paymentMethod: 'نقدي',
    status: 'فشل',
    paymentDate: new Date('2025-12-12'),
  },
  {
    id: 'P004',
    invoiceId: 'INV-2025-004',
    customerName: 'شركة النور للطاقة',
    amount: 2200.0,
    currency: 'SAR',
    paymentMethod: 'تحويل بنكي',
    status: 'ناجح',
    paymentDate: new Date('2025-12-13'),
  },
  // Add more mock data for better testing
  {
    id: 'P005',
    invoiceId: 'INV-2025-005',
    customerName: 'مؤسسة الأمل للكهرباء',
    amount: 1200.0,
    currency: 'USD',
    paymentMethod: 'بطاقة ائتمانية',
    status: 'ناجح',
    paymentDate: new Date('2025-12-14'),
  },
];

// 3. محاكاة استدعاء API
const fetchPayments = (): Promise<Payment[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // محاكاة حالة خطأ بنسبة 10%
      if (Math.random() < 0.1) {
        reject(new Error('فشل في تحميل بيانات سجل المدفوعات. يرجى المحاولة مرة أخرى.'));
      } else {
        resolve(mockPayments);
      }
    }, 1500); // تأخير لمحاكاة التحميل
  });
};

// 4. تعريف أعمدة الجدول
const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="text-right"
      >
        رقم الدفع
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-right font-medium">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'invoiceId',
    header: 'رقم الفاتورة',
    cell: ({ row }) => <div className="text-right">{row.getValue('invoiceId')}</div>,
  },
  {
    accessorKey: 'customerName',
    header: 'اسم العميل',
    cell: ({ row }) => <div className="text-right">{row.getValue('customerName')}</div>,
  },
  {
    accessorKey: 'paymentMethod',
    header: 'طريقة الدفع',
    cell: ({ row }) => <div className="text-right">{row.getValue('paymentMethod')}</div>,
  },
  {
    accessorKey: 'paymentDate',
    header: 'تاريخ الدفع',
    cell: ({ row }) => {
      const date = row.getValue('paymentDate') as Date;
      return <div className="text-right">{date.toLocaleDateString('ar-EG')}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'الحالة',
    cell: ({ row }) => {
      const status = row.getValue('status') as Payment['status'];
      let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
      let colorClass = '';

      switch (status) {
        case 'ناجح':
          variant = 'default';
          colorClass = 'bg-green-100 text-green-800 hover:bg-green-200';
          break;
        case 'معلق':
          variant = 'secondary';
          colorClass = 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
          break;
        case 'فشل':
          variant = 'destructive';
          colorClass = 'bg-red-100 text-red-800 hover:bg-red-200';
          break;
      }

      return (
        <Badge className={`justify-center w-20 ${colorClass}`} variant={variant}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="text-left"
      >
        المبلغ
        <ArrowUpDown className="mr-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const currency = row.original.currency;
      const formatted = new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: currency === 'SAR' ? 'SAR' : 'USD',
      }).format(amount);

      return <div className="text-left font-bold">{formatted}</div>;
    },
  },
];

// 5. المكون الرئيسي
export const PaymentsLog = () => {
  const [data, setData] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetchPayments()
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
      sorting: [
        {
          id: 'paymentDate',
          desc: true,
        },
      ],
    },
  });

  const statusFilter = columnFilters.find((f) => f.id === 'status')?.value as string;

  // 6. مكون حالة التحميل
  const LoadingSkeleton = () => (
    <div className="space-y-4 p-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );

  // 7. عرض الواجهة
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6" dir="rtl">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">سجل المدفوعات</CardTitle>
            <Button onClick={loadData} variant="outline" size="icon" disabled={loading}>
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              عرض جميع المدفوعات المسجلة في النظام مع إمكانية البحث والترشيح.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            {/* شريط الأدوات والترشيح */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
              {/* البحث العام */}
              <div className="relative w-full md:w-1/3">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ابحث باسم العميل أو رقم الفاتورة..."
                  value={globalFilter ?? ''}
                  onChange={(event) => setGlobalFilter(event.target.value)}
                  className="w-full pr-10 text-right"
                />
              </div>

              {/* ترشيح الحالة */}
              <div className="w-full md:w-1/4">
                <Select
                  value={statusFilter || ''}
                  onValueChange={(value) => {
                    table.getColumn('status')?.setFilterValue(value === 'all' ? undefined : value);
                  }}
                >
                  <SelectTrigger className="w-full text-right">
                    <SelectValue placeholder="ترشيح حسب الحالة" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="ناجح">ناجح</SelectItem>
                    <SelectItem value="معلق">معلق</SelectItem>
                    <SelectItem value="فشل">فشل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* حالة الخطأ */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-right" role="alert">
                <p className="font-bold">خطأ في تحميل البيانات:</p>
                <p>{error}</p>
              </div>
            )}

            {/* الجدول أو حالة التحميل */}
            <div className="rounded-md border">
              {loading ? (
                <LoadingSkeleton />
              ) : (
                <Table dir="rtl">
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead key={header.id} className="text-right">
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && 'selected'}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                          {globalFilter || statusFilter ? 'لا توجد نتائج مطابقة لمعايير البحث.' : 'لا توجد مدفوعات مسجلة.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* أدوات التنقل (Pagination) */}
            <div className="flex items-center justify-end space-x-2 py-4" dir="ltr">
              <div className="flex-1 text-sm text-muted-foreground text-right" dir="rtl">
                عرض {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                {' '}إلى{' '}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}
                {' '}من{' '}
                {table.getFilteredRowModel().rows.length}
                {' '}سجل.
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                السابق
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                التالي
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

// تصدير المكون لاستخدامه في التطبيق
export default PaymentsLog;
