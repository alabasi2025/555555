// @ts-nocheck
import { trpc } from '@/lib/trpc';
import React, { useState, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Search, PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// استيراد مكونات shadcn/ui (يجب أن تكون متاحة في بيئة المشروع)
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// -----------------------------------------------------------------------------
// 1. تعريف هيكل البيانات (Interface)
// -----------------------------------------------------------------------------

export type PaymentStatus = "pending" | "processing" | "success" | "failed";
export type PaymentMethod = "Bank Transfer" | "Credit Card" | "Cash";

export interface Payment {
  id: string;
  amount: number;
  status: PaymentStatus;
  clientName: string;
  paymentDate: Date;
  method: PaymentMethod;
  description?: string;
}

// -----------------------------------------------------------------------------
// 2. البيانات التجريبية (Mock Data)
// -----------------------------------------------------------------------------

const mockPayments: Payment[] = [
  {
    id: "pay_001",
    amount: 4500.50,
    status: "success",
    clientName: "شركة الأفق للتجارة",
    paymentDate: new Date(2024, 10, 15),
    method: "Bank Transfer",
    description: "دفعة مقابل خدمات استشارية لشهر أكتوبر.",
  },
  {
    id: "pay_002",
    amount: 1200.00,
    status: "processing",
    clientName: "مؤسسة النور للخدمات",
    paymentDate: new Date(2024, 10, 18),
    method: "Credit Card",
    description: "دفعة مقدمة لتطوير موقع إلكتروني.",
  },
  {
    id: "pay_003",
    amount: 750.25,
    status: "failed",
    clientName: "أحمد المحمد",
    paymentDate: new Date(2024, 10, 20),
    method: "Cash",
    description: "سداد فاتورة رقم 1023.",
  },
  {
    id: "pay_004",
    amount: 9800.00,
    status: "success",
    clientName: "مجموعة الرواد القابضة",
    paymentDate: new Date(2024, 11, 1),
    method: "Bank Transfer",
    description: "الدفعة النهائية لمشروع البنية التحتية.",
  },
  {
    id: "pay_005",
    amount: 300.00,
    status: "pending",
    clientName: "فاطمة الزهراء",
    paymentDate: new Date(2024, 11, 5),
    method: "Credit Card",
    description: "اشتراك شهري في الخدمة.",
  },
];

// -----------------------------------------------------------------------------
// 3. مكونات مساعدة (Helper Components)
// -----------------------------------------------------------------------------

// دالة لعرض حالة الدفع بشكل ملون
const StatusBadge: React.FC<{ status: PaymentStatus }> = ({ status }) => {
  const statusMap: Record<PaymentStatus, { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    success: { text: 'ناجح', variant: 'default' },
    processing: { text: 'قيد المعالجة', variant: 'secondary' },
    pending: { text: 'معلق', variant: 'outline' },
    failed: { text: 'فشل', variant: 'destructive' },
  };

  const { text, variant } = statusMap[status] || { text: 'غير معروف', variant: 'outline' };

  return <Badge variant={variant} className="w-24 justify-center">{text}</Badge>;
};

// -----------------------------------------------------------------------------
// 4. تعريف أعمدة الجدول (Column Definitions)
// -----------------------------------------------------------------------------

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="text-right justify-end w-full"
      >
        رقم الدفعة
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-right font-medium">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'clientName',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="text-right justify-end w-full"
      >
        اسم العميل
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-right">{row.getValue('clientName')}</div>,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="text-right justify-end w-full"
      >
        المبلغ (ريال)
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR',
      }).format(amount);

      return <div className="text-right font-bold">{formatted}</div>;
    },
  },
  {
    accessorKey: 'paymentDate',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="text-right justify-end w-full"
      >
        تاريخ الدفع
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date: Date = row.getValue('paymentDate');
      return <div className="text-right">{format(date, 'dd MMMM yyyy', { locale: ar })}</div>;
    },
  },
  {
    accessorKey: 'method',
    header: 'طريقة الدفع',
    cell: ({ row }) => <div className="text-right">{row.getValue('method')}</div>,
  },
  {
    accessorKey: 'status',
    header: 'الحالة',
    cell: ({ row }) => <div className="text-right"><StatusBadge status={row.getValue('status')} /></div>,
  },
  {
    id: 'actions',
    enableHiding: false,
    header: 'الإجراءات',
    cell: ({ row }) => {
      const payment = row.original;

      const handleDelete = () => {
        if (window.confirm(`هل أنت متأكد من حذف الدفعة رقم ${payment.id}؟`)) {
          // TODO: تنفيذ منطق الحذف
          console.log('حذف الدفعة:', payment.id);
        }
      };

      return (
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">فتح القائمة</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => console.log('عرض تفاصيل:', payment.id)}>
              <Eye className="ml-2 h-4 w-4" /> عرض التفاصيل
            </DropdownMenuItem>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e: any) => e.preventDefault()}>
                <Edit className="ml-2 h-4 w-4" /> تعديل
              </DropdownMenuItem>
            </DialogTrigger>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash2 className="ml-2 h-4 w-4" /> حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// -----------------------------------------------------------------------------
// 5. نموذج الإدخال والتحقق (Form Schema and Component)
// -----------------------------------------------------------------------------

const paymentFormSchema = z.object({
  clientName: z.string().min(2, {
    message: "يجب أن يحتوي اسم العميل على حرفين على الأقل.",
  }),
  amount: z.number().min(0.01, {
    message: "يجب أن يكون المبلغ أكبر من صفر.",
  }),
  paymentDate: z.date({
    required_error: "تاريخ الدفع مطلوب.",
  }),
  method: z.enum(["Bank Transfer", "Credit Card", "Cash"], {
    required_error: "طريقة الدفع مطلوبة.",
  }),
  status: z.enum(["pending", "processing", "success", "failed"], {
    required_error: "حالة الدفع مطلوبة.",
  }),
  description: z.string().max(500, {
    message: "يجب ألا يتجاوز الوصف 500 حرف.",
  }).optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  initialData?: Payment;
  onSave: (data: PaymentFormValues) => void;
  onClose: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ initialData, onSave, onClose }) => {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: initialData ? {
      ...initialData,
      amount: initialData.amount, // التأكد من أن القيمة رقم
    } : {
      clientName: '',
      amount: 0,
      paymentDate: new Date(),
      method: 'Bank Transfer',
      status: 'pending',
      description: '',
    },
  });

  const onSubmit = (data: PaymentFormValues) => {
    onSave(data);
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
        <FormField
          control={form.control}
          name="clientName"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>اسم العميل</FormLabel>
              <FormControl>
                <Input placeholder="أدخل اسم العميل" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>المبلغ (ريال)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="أدخل المبلغ"
                  {...field}
                  onChange={(e: any) => field.onChange(parseFloat((e.target as HTMLInputElement).value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentDate"
          render={({ field }: { field: any }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-right">تاريخ الدفع</FormLabel>
              <Popover dir="rtl">
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={`w-full justify-start text-right font-normal ${!field.value && 'text-muted-foreground'}`}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                      {field.value ? format(field.value, 'PPP', { locale: ar }) : <span>اختر تاريخاً</span>}
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

        <FormField
          control={form.control}
          name="method"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>طريقة الدفع</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} dir="rtl">
                <FormControl>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر طريقة الدفع" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Bank Transfer">تحويل بنكي</SelectItem>
                  <SelectItem value="Credit Card">بطاقة ائتمانية</SelectItem>
                  <SelectItem value="Cash">نقداً</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>حالة الدفع</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} dir="rtl">
                <FormControl>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر حالة الدفع" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="success">ناجح</SelectItem>
                  <SelectItem value="processing">قيد المعالجة</SelectItem>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="failed">فشل</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>الوصف (اختياري)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="أضف وصفاً مختصراً للدفعة"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="pt-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {initialData ? 'حفظ التعديلات' : 'إضافة الدفعة'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// -----------------------------------------------------------------------------
// 6. المكون الرئيسي (PaymentsList)
// -----------------------------------------------------------------------------

export const PaymentsList: React.FC = () => {
  const [data, setData] = useState<Payment[]>(mockPayments);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | undefined>(undefined);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  // منطق CRUD
  const handleSavePayment = (values: PaymentFormValues) => {
    if (editingPayment) {
      // منطق التعديل
      setData(prev => prev.map(p => p.id === editingPayment.id ? { ...p, ...values } : p));
      setEditingPayment(undefined);
    } else {
      // منطق الإضافة
      const newPayment: Payment = {
        ...values,
        id: `pay_${(data.length + 1).toString().padStart(3, '0')}`,
        paymentDate: values.paymentDate, // تأكد من أن التاريخ هو كائن Date
      };
      setData(prev => [newPayment, ...prev]);
    }
    setIsDialogOpen(false);
  };

  const handleOpenDialog = (payment?: Payment) => {
    setEditingPayment(payment);
    setIsDialogOpen(true);
  };

  // محاكاة لـ DashboardLayout
  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen" dir="rtl">
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-lg p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">سجل المدفوعات</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog(undefined)} className="bg-blue-600 hover:bg-blue-700">
                <PlusCircle className="ml-2 h-4 w-4" /> إضافة دفعة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
              <DialogHeader className="text-right">
                <DialogTitle>{editingPayment ? 'تعديل الدفعة' : 'إضافة دفعة جديدة'}</DialogTitle>
                <DialogDescription>
                  املأ الحقول المطلوبة لإضافة أو تعديل معلومات الدفعة.
                </DialogDescription>
              </DialogHeader>
              <PaymentForm
                initialData={editingPayment}
                onSave={handleSavePayment}
                onClose={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* شريط التحكم والبحث */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center py-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="ابحث عن عميل، مبلغ، أو رقم دفعة..."
              value={globalFilter ?? ''}
              onChange={(event: any) => setGlobalFilter((event.target as HTMLInputElement).value)}
              className="pr-10 text-right"
            />
          </div>
          {/* يمكن إضافة فلاتر أخرى هنا */}
        </div>

        {/* الجدول */}
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
                  <Dialog key={row.id} onOpenChange={(open) => {
                    if (open && row.original.id === editingPayment?.id) {
                      // إذا تم فتح الحوار من زر التعديل في القائمة المنسدلة
                      setIsDialogOpen(true);
                    }
                  }}>
                    <TableRow
                      data-state={row.getIsSelected() && 'selected'}
                      className="text-right"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  </Dialog>
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

        {/* التحكم بالصفحات */}
        <div className="flex items-center justify-end space-x-2 py-4" dir="ltr">
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
          <span className="flex items-center gap-1 text-sm text-gray-600" dir="rtl">
            الصفحة
            <strong>
              {table.getState().pagination.pageIndex + 1} من {table.getPageCount()}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};

// تصدير المكون الرئيسي لتمكين استخدامه
export default PaymentsList;
