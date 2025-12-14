import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Search, FileDown, AlertTriangle } from 'lucide-react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';

// Placeholder for a layout component (assuming it exists in the project)
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="p-6 bg-gray-50 min-h-screen">
    <header className="mb-6">
      <h1 className="text-3xl font-bold text-right">نظام إدارة محطات الكهرباء</h1>
    </header>
    <main>{children}</main>
  </div>
);

// 1. تعريف هيكل البيانات
interface InventoryItem {
  id: string;
  item_name: string; // اسم الصنف
  location: string; // الموقع (المحطة)
  quantity: number; // الكمية الحالية
  unit: string; // الوحدة
  last_updated: string; // آخر تحديث (YYYY-MM-DD)
  status: 'In Stock' | 'Low Stock' | 'Out of Stock'; // الحالة
}

// 2. بيانات وهمية (Simulated Data)
const mockInventoryData: InventoryItem[] = [
  {
    id: 'INV001',
    item_name: 'محول جهد عالي 500 ك.ف',
    location: 'محطة الرياض 1',
    quantity: 5,
    unit: 'وحدة',
    last_updated: '2025-12-10',
    status: 'In Stock',
  },
  {
    id: 'INV002',
    item_name: 'قاطع دائرة 132 ك.ف',
    location: 'محطة جدة 2',
    quantity: 1,
    unit: 'وحدة',
    last_updated: '2025-12-12',
    status: 'Low Stock',
  },
  {
    id: 'INV003',
    item_name: 'زيت عزل كهربائي',
    location: 'مستودع الدمام الرئيسي',
    quantity: 1500,
    unit: 'لتر',
    last_updated: '2025-12-05',
    status: 'In Stock',
  },
  {
    id: 'INV004',
    item_name: 'مكثف تعويض القدرة',
    location: 'محطة أبها 3',
    quantity: 0,
    unit: 'وحدة',
    last_updated: '2025-12-14',
    status: 'Out of Stock',
  },
  {
    id: 'INV005',
    item_name: 'كابل نحاسي 300 مم2',
    location: 'محطة الرياض 1',
    quantity: 450,
    unit: 'متر',
    last_updated: '2025-12-11',
    status: 'In Stock',
  },
];

// 3. تعريف الأعمدة (Columns Definition)
const columns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: 'id',
    header: 'رقم الصنف',
    cell: ({ row }) => <div className="text-right">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'item_name',
    header: 'اسم الصنف',
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {row.getValue('item_name')}
      </div>
    ),
  },
  {
    accessorKey: 'location',
    header: 'الموقع',
    cell: ({ row }) => <div className="text-right">{row.getValue('location')}</div>,
  },
  {
    accessorKey: 'quantity',
    header: 'الكمية',
    cell: ({ row }) => (
      <div className="text-right font-mono">{row.getValue('quantity')}</div>
    ),
  },
  {
    accessorKey: 'unit',
    header: 'الوحدة',
    cell: ({ row }) => <div className="text-right">{row.getValue('unit')}</div>,
  },
  {
    accessorKey: 'last_updated',
    header: 'آخر تحديث',
    cell: ({ row }) => <div className="text-right">{row.getValue('last_updated')}</div>,
  },
  {
    accessorKey: 'status',
    header: 'الحالة',
    cell: ({ row }) => {
      const status = row.getValue('status') as InventoryItem['status'];
      const statusMap = {
        'In Stock': { text: 'متوفر', variant: 'default' },
        'Low Stock': { text: 'مخزون منخفض', variant: 'destructive' },
        'Out of Stock': { text: 'نفد المخزون', variant: 'outline' },
      };
      const { text, variant } = statusMap[status] || {
        text: 'غير معروف',
        variant: 'secondary',
      };

      return (
        <Badge
          variant={variant as 'default' | 'destructive' | 'outline'}
          className="w-28 justify-center"
        >
          {text}
        </Badge>
      );
    },
  },
];

// 4. دالة جلب البيانات (Simulated API Call)
const fetchInventoryReport = async (): Promise<InventoryItem[]> => {
  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate a random error 10% of the time
  if (Math.random() < 0.1) {
    throw new Error('فشل في جلب بيانات المخزون من الخادم.');
  }

  return mockInventoryData;
};

// 5. المكون الرئيسي
const CurrentInventoryReport: React.FC = () => {
  const [data, setData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // جلب البيانات عند تحميل المكون
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const inventory = await fetchInventoryReport();
        setData(inventory);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'حدث خطأ غير متوقع أثناء جلب البيانات.',
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // قائمة المواقع والحالات الفريدة للتصفية
  const uniqueLocations = useMemo(() => {
    const locations = new Set(mockInventoryData.map((item) => item.location));
    return Array.from(locations);
  }, []);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(mockInventoryData.map((item) => item.status));
    return Array.from(statuses);
  }, []);

  // إعداد جدول React
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
      columnFilters: [
        { id: 'location', value: locationFilter },
        { id: 'status', value: statusFilter },
      ],
    },
    onGlobalFilterChange: setGlobalFilter,
    // Custom filter function for location and status
    globalFilterFn: 'includesString',
    columnResizeMode: 'onChange',
  });

  // تطبيق فلاتر الأعمدة يدوياً (لأن useReactTable لا يدعم فلاتر الأعمدة المدمجة مع الفلتر العام بشكل مباشر)
  useEffect(() => {
    table.getColumn('location')?.setFilterValue(locationFilter);
  }, [locationFilter, table]);

  useEffect(() => {
    table.getColumn('status')?.setFilterValue(statusFilter);
  }, [statusFilter, table]);

  // دالة تصدير التقرير (وهمية)
  const handleExport = () => {
    alert('جاري تصدير التقرير إلى ملف Excel...');
    // Logic for actual data export would go here
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto" dir="rtl">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">
              تقرير المخزون الحالي
            </CardTitle>
            <Button onClick={handleExport} disabled={loading || error !== null}>
              <FileDown className="ml-2 h-4 w-4" />
              تصدير التقرير
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              يعرض هذا التقرير حالة المخزون الحالية لجميع الأصناف في محطات الكهرباء.
            </p>
          </CardContent>
        </Card>

        {/* شريط أدوات التصفية والبحث */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث حسب اسم الصنف أو رقم الصنف..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="w-full pr-10 text-right"
              disabled={loading}
            />
          </div>

          <Select
            value={locationFilter}
            onValueChange={setLocationFilter}
            disabled={loading}
          >
            <SelectTrigger className="w-[180px] text-right">
              <SelectValue placeholder="تصفية حسب الموقع" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="">جميع المواقع</SelectItem>
              {uniqueLocations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
            disabled={loading}
          >
            <SelectTrigger className="w-[180px] text-right">
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="">جميع الحالات</SelectItem>
              <SelectItem value="In Stock">متوفر</SelectItem>
              <SelectItem value="Low Stock">مخزون منخفض</SelectItem>
              <SelectItem value="Out of Stock">نفد المخزون</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* عرض حالة التحميل أو الخطأ */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="mr-2 text-lg">جاري تحميل بيانات التقرير...</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="text-right">
            <AlertTriangle className="h-4 w-4 ml-2" />
            <AlertTitle>خطأ في جلب البيانات</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Button
              onClick={() => window.location.reload()}
              className="mt-2"
              variant="secondary"
            >
              إعادة المحاولة
            </Button>
          </Alert>
        )}

        {/* جدول البيانات */}
        {!loading && !error && (
          <div className="rounded-md border bg-white">
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
                                header.getContext(),
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
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      لا توجد نتائج مطابقة لمرشحات البحث.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CurrentInventoryReport;

// ملاحظة: يتطلب هذا المكون تثبيت واستيراد مكونات shadcn/ui الأساسية مثل Button, Input, Table, Select, Badge, Card, Alert.
// كما يتطلب تثبيت مكتبة @tanstack/react-table.
