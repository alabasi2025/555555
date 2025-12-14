import React, { useState, useEffect, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, Search, PlusCircle, Loader2, FileText, MoreHorizontal } from 'lucide-react';

// استيراد مكونات shadcn/ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DashboardLayout } from '@/layouts/DashboardLayout'; // افتراض وجود هذا المكون

// 1. تعريف هيكل البيانات (TypeScript Interface)
interface PurchaseRequest {
  id: string;
  requestNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft' | 'in_review';
  requester: string;
  creationDate: string; // YYYY-MM-DD
  totalAmount: number;
  priority: 'low' | 'medium' | 'high';
}

// 2. بيانات وهمية (Mock Data)
const mockData: PurchaseRequest[] = [
  {
    id: 'PR001',
    requestNumber: 'REQ-2025-001',
    status: 'approved',
    requester: 'أحمد السالم',
    creationDate: '2025-11-01',
    totalAmount: 15000.5,
    priority: 'high',
  },
  {
    id: 'PR002',
    requestNumber: 'REQ-2025-002',
    status: 'pending',
    requester: 'فاطمة الزهراء',
    creationDate: '2025-11-05',
    totalAmount: 5200.0,
    priority: 'medium',
  },
  {
    id: 'PR003',
    requestNumber: 'REQ-2025-003',
    status: 'rejected',
    requester: 'خالد المحمد',
    creationDate: '2025-11-10',
    totalAmount: 250.75,
    priority: 'low',
  },
  {
    id: 'PR004',
    requestNumber: 'REQ-2025-004',
    status: 'in_review',
    requester: 'نورة العلي',
    creationDate: '2025-11-15',
    totalAmount: 350000.0,
    priority: 'high',
  },
  {
    id: 'PR005',
    requestNumber: 'REQ-2025-005',
    status: 'draft',
    requester: 'علياء منصور',
    creationDate: '2025-11-20',
    totalAmount: 800.0,
    priority: 'medium',
  },
];

// 3. دالة مساعدة لتنسيق العملة والحالة
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
  }).format(amount);
};

const getStatusBadge = (status: PurchaseRequest['status']) => {
  const statusMap = {
    pending: { text: 'قيد الانتظار', variant: 'default' },
    approved: { text: 'تمت الموافقة', variant: 'success' },
    rejected: { text: 'مرفوض', variant: 'destructive' },
    draft: { text: 'مسودة', variant: 'secondary' },
    in_review: { text: 'قيد المراجعة', variant: 'warning' },
  };
  const { text, variant } = statusMap[status] || statusMap.pending;
  return <Badge variant={variant as any}>{text}</Badge>;
};

const getPriorityBadge = (priority: PurchaseRequest['priority']) => {
  const priorityMap = {
    low: { text: 'منخفضة', className: 'bg-green-100 text-green-800 hover:bg-green-100/80' },
    medium: { text: 'متوسطة', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80' },
    high: { text: 'عالية', className: 'bg-red-100 text-red-800 hover:bg-red-100/80' },
  };
  const { text, className } = priorityMap[priority] || priorityMap.medium;
  return <Badge className={className}>{text}</Badge>;
};

// 4. تعريف أعمدة جدول البيانات (Columns Definition)
const columns: ColumnDef<PurchaseRequest>[] = [
  {
    accessorKey: 'requestNumber',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="text-right w-full justify-end"
        >
          رقم الطلب
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-right font-medium">{row.getValue('requestNumber')}</div>,
  },
  {
    accessorKey: 'requester',
    header: 'طالب الشراء',
    cell: ({ row }) => <div className="text-right">{row.getValue('requester')}</div>,
  },
  {
    accessorKey: 'creationDate',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="text-right w-full justify-end"
        >
          تاريخ الإنشاء
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-right">{row.getValue('creationDate')}</div>,
  },
  {
    accessorKey: 'totalAmount',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="text-right w-full justify-end"
        >
          المبلغ الإجمالي
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-right font-bold">{formatCurrency(row.getValue('totalAmount'))}</div>
    ),
  },
  {
    accessorKey: 'priority',
    header: 'الأولوية',
    cell: ({ row }) => <div className="text-right">{getPriorityBadge(row.getValue('priority'))}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'status',
    header: 'الحالة',
    cell: ({ row }) => <div className="text-right">{getStatusBadge(row.getValue('status'))}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    header: 'الإجراءات',
    cell: ({ row }) => {
      const request = row.original;

      return (
        <div className="text-left">
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">فتح القائمة</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(request.id)}>
                نسخ رقم الطلب
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FileText className="ml-2 h-4 w-4" />
                عرض التفاصيل
              </DropdownMenuItem>
              {request.status === 'pending' && (
                <DropdownMenuItem className="text-green-600">الموافقة</DropdownMenuItem>
              )}
              {request.status === 'pending' && (
                <DropdownMenuItem className="text-red-600">الرفض</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

// 5. المكون الرئيسي (PurchaseRequestsList)
const PurchaseRequestsList: React.FC = () => {
  const [data, setData] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // 6. محاكاة جلب البيانات (Loading State & Error Handling)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // محاكاة تأخير الشبكة
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // محاكاة خطأ بنسبة 10%
        if (Math.random() < 0.1) {
          throw new Error('فشل في جلب بيانات طلبات الشراء من الخادم.');
        }

        setData(mockData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 7. إعداد جدول البيانات (useReactTable)
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 5, // تعيين حجم الصفحة الافتراضي
      },
    },
  });

  // 8. عرض حالات التحميل والخطأ
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-gray-600">جاري تحميل طلبات الشراء...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">خطأ في النظام</CardTitle>
            <CardDescription className="text-red-600">
              حدث خطأ أثناء محاولة جلب البيانات.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-800 font-mono">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4" variant="destructive">
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  // 9. عرض الواجهة الرئيسية
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">قائمة طلبات الشراء</h1>
          <Button>
            <PlusCircle className="ml-2 h-4 w-4" />
            طلب شراء جديد
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold">ملخص الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 space-x-reverse">
              <div className="flex-1 p-4 border rounded-lg text-center">
                <p className="text-sm text-gray-500">إجمالي الطلبات</p>
                <p className="text-2xl font-bold mt-1">{data.length}</p>
              </div>
              <div className="flex-1 p-4 border rounded-lg text-center">
                <p className="text-sm text-gray-500">قيد الانتظار</p>
                <p className="text-2xl font-bold mt-1 text-yellow-600">
                  {data.filter((r) => r.status === 'pending').length}
                </p>
              </div>
              <div className="flex-1 p-4 border rounded-lg text-center">
                <p className="text-sm text-gray-500">تمت الموافقة</p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  {data.filter((r) => r.status === 'approved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>سجل طلبات الشراء</CardTitle>
            <CardDescription>
              عرض وإدارة جميع طلبات الشراء في النظام.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center py-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="البحث برقم الطلب أو طالب الشراء..."
                  value={globalFilter ?? ''}
                  onChange={(event) => setGlobalFilter(event.target.value)}
                  className="w-full pr-10"
                />
              </div>
            </div>
            <div className="rounded-md border overflow-x-auto">
              <Table dir="rtl">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id} className="text-right">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
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
                          <TableCell key={cell.id} className="text-right">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        لا توجد نتائج.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 space-x-reverse py-4">
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

export default PurchaseRequestsList;
