import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DashboardLayout } from '@/layouts/DashboardLayout'; // افتراض وجود هذا المكون

// 1. تعريف هيكل البيانات
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'نشط' | 'معلق' | 'مغلق';
  total_orders: number;
  last_activity: string;
}

// بيانات وهمية للعملاء
const mockCustomers: Customer[] = [
  {
    id: 'CUST001',
    name: 'أحمد محمد',
    email: 'ahmed.m@example.com',
    phone: '0501234567',
    status: 'نشط',
    total_orders: 15,
    last_activity: '2025-12-10',
  },
  {
    id: 'CUST002',
    name: 'فاطمة علي',
    email: 'fatima.a@example.com',
    phone: '0559876543',
    status: 'معلق',
    total_orders: 5,
    last_activity: '2025-12-05',
  },
  {
    id: 'CUST003',
    name: 'خالد إبراهيم',
    email: 'khalid.i@example.com',
    phone: '0561122334',
    status: 'نشط',
    total_orders: 30,
    last_activity: '2025-12-14',
  },
  {
    id: 'CUST004',
    name: 'سارة يوسف',
    email: 'sara.y@example.com',
    phone: '0534455667',
    status: 'مغلق',
    total_orders: 2,
    last_activity: '2025-11-20',
  },
  // المزيد من البيانات...
];

// 2. دالة لجلب البيانات (محاكاة)
const fetchCustomers = (): Promise<Customer[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // محاكاة لخطأ محتمل
      // if (Math.random() < 0.1) {
      //   reject(new Error('فشل في جلب بيانات العملاء.'));
      // } else {
      resolve(mockCustomers);
      // }
    }, 1000);
  });
};

// 3. تعريف الأعمدة
const columns = [
  {
    id: 'select',
    header: ({ table }: any) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='تحديد الكل'
      />
    ),
    cell: ({ row }: any) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='تحديد الصف'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: 'معرف العميل',
  },
  {
    accessorKey: 'name',
    header: 'الاسم',
  },
  {
    accessorKey: 'email',
    header: 'البريد الإلكتروني',
  },
  {
    accessorKey: 'phone',
    header: 'رقم الهاتف',
  },
  {
    accessorKey: 'total_orders',
    header: 'إجمالي الطلبات',
    cell: ({ row }: any) => (
      <div className='text-right'>{row.original.total_orders}</div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'الحالة',
    cell: ({ row }: any) => {
      const status = row.original.status;
      let variant: 'default' | 'secondary' | 'destructive' | 'outline' =
        'secondary';
      if (status === 'نشط') variant = 'default';
      if (status === 'معلق') variant = 'outline';
      if (status === 'مغلق') variant = 'destructive';
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'last_activity',
    header: 'آخر نشاط',
  },
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <DropdownMenu dir='rtl'>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>فتح القائمة</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Button variant='ghost' className='w-full justify-start'>
            عرض التفاصيل
          </Button>
          <Button variant='ghost' className='w-full justify-start'>
            تعديل
          </Button>
          <Button variant='ghost' className='w-full justify-start text-red-600'>
            حذف
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

// 4. المكون الرئيسي
export const CustomersList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('الكل');

  // جلب البيانات
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchCustomers()
      .then((data) => {
        setCustomers(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // منطق البحث والفلترة
  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    // 1. الفلترة حسب الحالة
    if (filterStatus !== 'الكل') {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }

    // 2. البحث حسب الاسم أو البريد الإلكتروني أو المعرف
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(lowerCaseSearch) ||
          c.email.toLowerCase().includes(lowerCaseSearch) ||
          c.id.toLowerCase().includes(lowerCaseSearch)
      );
    }

    return filtered;
  }, [customers, searchTerm, filterStatus]);

  // محاكاة لـ useReactTable
  const tableData = filteredCustomers;

  const statusOptions = ['الكل', 'نشط', 'معلق', 'مغلق'];

  return (
    <DashboardLayout>
      <div className='p-4 sm:p-6 lg:p-8' dir='rtl'>
        <Card className='w-full'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <div className='space-y-1'>
              <CardTitle className='text-2xl font-bold'>قائمة العملاء</CardTitle>
              <CardDescription>
                إدارة وعرض جميع العملاء المسجلين في النظام.
              </CardDescription>
            </div>
            <Button className='gap-2'>
              <Plus className='h-4 w-4' />
              إضافة عميل جديد
            </Button>
          </CardHeader>
          <CardContent>
            {/* شريط البحث والفلترة */}
            <div className='flex flex-col md:flex-row gap-4 mb-6'>
              <div className='relative flex-1'>
                <Search className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='ابحث بالاسم أو البريد الإلكتروني أو المعرف...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full pr-10 text-right'
                />
              </div>
              <DropdownMenu dir='rtl'>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' className='gap-2'>
                    <Filter className='h-4 w-4' />
                    الحالة: {filterStatus}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='start'>
                  <DropdownMenuLabel>تصفية حسب الحالة</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {statusOptions.map((status) => (
                    <Button
                      key={status}
                      variant='ghost'
                      className='w-full justify-start'
                      onClick={() => setFilterStatus(status)}
                    >
                      {status}
                    </Button>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* حالة التحميل */}
            {loading && (
              <div className='flex items-center justify-center h-64'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
                <span className='mr-2'>جاري تحميل بيانات العملاء...</span>
              </div>
            )}

            {/* حالة الخطأ */}
            {error && (
              <div className='flex flex-col items-center justify-center h-64 text-red-600'>
                <AlertTriangle className='h-8 w-8 mb-2' />
                <p className='font-bold'>حدث خطأ:</p>
                <p>{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className='mt-4'
                >
                  إعادة المحاولة
                </Button>
              </div>
            )}

            {/* عرض الجدول */}
            {!loading && !error && (
              <div className='rounded-md border overflow-x-auto'>
                <Table dir='rtl'>
                  <TableHeader>
                    <TableRow>
                      {columns.map((column) => (
                        <TableHead key={column.header} className='text-right'>
                          {column.header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.length ? (
                      tableData.map((customer) => (
                        <TableRow key={customer.id}>
                          {/* محاكاة لـ cell rendering */}
                          <TableCell>
                            <Checkbox />
                          </TableCell>
                          <TableCell className='font-medium'>
                            {customer.id}
                          </TableCell>
                          <TableCell>{customer.name}</TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>{customer.phone}</TableCell>
                          <TableCell className='text-right'>
                            {customer.total_orders}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                customer.status === 'نشط'
                                  ? 'default'
                                  : customer.status === 'معلق'
                                  ? 'outline'
                                  : 'destructive'
                              }
                            >
                              {customer.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{customer.last_activity}</TableCell>
                          <TableCell>
                            {/* محاكاة لـ actions cell */}
                            <DropdownMenu dir='rtl'>
                              <DropdownMenuTrigger asChild>
                                <Button variant='ghost' className='h-8 w-8 p-0'>
                                  <span className='sr-only'>فتح القائمة</span>
                                  <MoreHorizontal className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <Button
                                  variant='ghost'
                                  className='w-full justify-start'
                                >
                                  عرض التفاصيل
                                </Button>
                                <Button
                                  variant='ghost'
                                  className='w-full justify-start'
                                >
                                  تعديل
                                </Button>
                                <Button
                                  variant='ghost'
                                  className='w-full justify-start text-red-600'
                                >
                                  حذف
                                </Button>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className='h-24 text-center'>
                          لا توجد نتائج مطابقة.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CustomersList;
