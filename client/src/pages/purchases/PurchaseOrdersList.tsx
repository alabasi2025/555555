import React, { useState, useMemo } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, SortingState, ColumnFiltersState } from '@tanstack/react-table';
import { ArrowUpDown, PlusCircle, MoreHorizontal, Search, Trash2, Edit, Eye } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// -----------------------------------------------------------------------------
// 1. الأنواع (Types)
// -----------------------------------------------------------------------------

type PurchaseOrderStatus = "Pending" | "Approved" | "Rejected" | "Completed" | "Cancelled";

interface PurchaseOrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PurchaseOrder {
  id: string;
  supplierName: string;
  orderDate: Date;
  deliveryDate: Date;
  status: PurchaseOrderStatus;
  totalAmount: number;
  items: PurchaseOrderItem[];
  notes: string;
}

// -----------------------------------------------------------------------------
// 2. البيانات التجريبية (Mock Data)
// -----------------------------------------------------------------------------

const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: "PO-2024-001",
    supplierName: "شركة الأفق للتجارة",
    orderDate: new Date("2024-10-01"),
    deliveryDate: new Date("2024-10-15"),
    status: "Completed",
    totalAmount: 15500.50,
    items: [
      { id: "item-1", productName: "كمبيوتر محمول (موديل X)", quantity: 10, unitPrice: 4500.00, total: 45000.00 },
      { id: "item-2", productName: "شاشة عرض 27 بوصة", quantity: 20, unitPrice: 1500.00, total: 30000.00 },
    ],
    notes: "تم استلام البضاعة بالكامل ومطابقتها للفاتورة.",
  },
  {
    id: "PO-2024-002",
    supplierName: "مؤسسة النور للمقاولات",
    orderDate: new Date("2024-10-05"),
    deliveryDate: new Date("2024-11-01"),
    status: "Pending",
    totalAmount: 8200.00,
    items: [
      { id: "item-3", productName: "أسمنت بورتلاند (50 كجم)", quantity: 500, unitPrice: 16.40, total: 8200.00 },
    ],
    notes: "بانتظار موافقة المدير المالي.",
  },
  {
    id: "PO-2024-003",
    supplierName: "الشركة الدولية للأثاث",
    orderDate: new Date("2024-10-10"),
    deliveryDate: new Date("2024-10-25"),
    status: "Approved",
    totalAmount: 22500.75,
    items: [
      { id: "item-4", productName: "مكتب إداري فاخر", quantity: 5, unitPrice: 3500.00, total: 17500.00 },
      { id: "item-5", productName: "كرسي دوار مريح", quantity: 10, unitPrice: 500.00, total: 5000.00 },
    ],
    notes: "تمت الموافقة، بانتظار شحن الطلب.",
  },
  {
    id: "PO-2024-004",
    supplierName: "مخازن التقنية الحديثة",
    orderDate: new Date("2024-10-15"),
    deliveryDate: new Date("2024-10-20"),
    status: "Rejected",
    totalAmount: 550.00,
    items: [
      { id: "item-6", productName: "كابل شبكة Cat6 (300 متر)", quantity: 1, unitPrice: 550.00, total: 550.00 },
    ],
    notes: "تم رفض الطلب بسبب عدم توفر الميزانية.",
  },
  {
    id: "PO-2024-005",
    supplierName: "شركة الأفق للتجارة",
    orderDate: new Date("2024-11-01"),
    deliveryDate: new Date("2024-11-15"),
    status: "Cancelled",
    totalAmount: 9800.00,
    items: [
      { id: "item-7", productName: "طابعة ليزر ملونة", quantity: 2, unitPrice: 4900.00, total: 9800.00 },
    ],
    notes: "تم إلغاء الطلب بناءً على طلب قسم المشتريات.",
  },
];

// -----------------------------------------------------------------------------
// 3. تعريف الأعمدة (Column Definitions)
// -----------------------------------------------------------------------------

const statusMap: Record<PurchaseOrderStatus, { label: string; color: string }> = {
  Pending: { label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-800" },
  Approved: { label: "موافق عليه", color: "bg-green-100 text-green-800" },
  Rejected: { label: "مرفوض", color: "bg-red-100 text-red-800" },
  Completed: { label: "مكتمل", color: "bg-blue-100 text-blue-800" },
  Cancelled: { label: "ملغي", color: "bg-gray-100 text-gray-800" },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium' }).format(date);
};

const columns: ColumnDef<PurchaseOrder>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <button
        className="flex items-center space-x-1"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        رقم الطلب
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "supplierName",
    header: "المورد",
    cell: ({ row }) => <div className="text-right">{row.getValue("supplierName")}</div>,
  },
  {
    accessorKey: "orderDate",
    header: ({ column }) => (
      <button
        className="flex items-center space-x-1"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        تاريخ الطلب
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </button>
    ),
    cell: ({ row }) => <div>{formatDate(row.getValue("orderDate"))}</div>,
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <button
        className="flex items-center justify-end space-x-1 w-full"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        المبلغ الإجمالي
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </button>
    ),
    cell: ({ row }) => <div className="text-left font-bold">{formatCurrency(row.getValue("totalAmount"))}</div>,
  },
  {
    accessorKey: "status",
    header: "الحالة",
    cell: ({ row }) => {
      const status: PurchaseOrderStatus = row.getValue("status");
      const { label, color } = statusMap[status];
      return (
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
          {label}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    header: "الإجراءات",
    cell: ({ row }) => {
      const order = row.original;

      return (
        <div className="flex justify-end space-x-2 rtl:space-x-reverse">
          <Button variant="ghost" size="icon" onClick={() => handleView(order)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleEdit(order)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(order.id)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      );
    },
  },
];

// -----------------------------------------------------------------------------
// 4. تعريف نموذج الإدخال (Form Schema)
// -----------------------------------------------------------------------------

const itemSchema = z.object({
  productName: z.string().min(2, { message: "اسم المنتج مطلوب." }),
  quantity: z.number().min(1, { message: "الكمية يجب أن تكون 1 على الأقل." }),
  unitPrice: z.number().min(0.01, { message: "سعر الوحدة مطلوب." }),
});

const formSchema = z.object({
  supplierName: z.string().min(3, { message: "اسم المورد مطلوب ولا يقل عن 3 أحرف." }),
  orderDate: z.date({ required_error: "تاريخ الطلب مطلوب." }),
  deliveryDate: z.date({ required_error: "تاريخ التسليم المتوقع مطلوب." }),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, { message: "يجب إضافة منتج واحد على الأقل." }),
});

type FormValues = z.infer<typeof formSchema>;

// -----------------------------------------------------------------------------
// 5. المكونات (Components) - يجب استبدالها بمكونات shadcn/ui الحقيقية
// -----------------------------------------------------------------------------

// *****************************************************************************
// ملاحظة: لغرض هذا الاختبار، سيتم تضمين تعريفات مبسطة للمكونات
// الأساسية لـ shadcn/ui (مثل Button, Input, Card, الخ) لضمان أن الكود
// يعمل بشكل مستقل. في بيئة React حقيقية، سيتم استيراد هذه المكونات.
// *****************************************************************************

const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string, size?: string, children: React.ReactNode }) => (
  <button
    {...props}
    className={`px-4 py-2 rounded-md font-medium transition-colors ${
      props.variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' :
      props.variant === 'ghost' ? 'text-gray-600 hover:bg-gray-100' :
      'bg-gray-200 text-gray-800 hover:bg-gray-300'
    } ${props.size === 'icon' ? 'p-2' : ''} ${props.className || ''}`}
  >
    {props.children}
  </button>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string, error?: string }) => (
  <div className="space-y-1">
    {props.label && <label className="block text-sm font-medium text-gray-700">{props.label}</label>}
    <input
      {...props}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${props.className || ''}`}
    />
    {props.error && <p className="text-sm text-red-600">{props.error}</p>}
  </div>
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string, error?: string, options: { value: string, label: string }[] }) => (
  <div className="space-y-1">
    {props.label && <label className="block text-sm font-medium text-gray-700">{props.label}</label>}
    <select
      {...props}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${props.className || ''}`}
    >
      {props.options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
    {props.error && <p className="text-sm text-red-600">{props.error}</p>}
  </div>
);

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white shadow-lg rounded-lg p-6 ${className || ''}`}>
    {children}
  </div>
);

const Dialog = ({ open, onOpenChange, title, children }: { open: boolean, onOpenChange: (open: boolean) => void, title: string, children: React.ReactNode }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>X</Button>
        </div>
        {children}
      </Card>
    </div>
  );
};

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${className || ''}`}>
    {children}
  </span>
);

const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8" dir="rtl">
    <header className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900">نظام إدارة المشتريات</h1>
    </header>
    <main>
      {children}
    </main>
  </div>
);

// -----------------------------------------------------------------------------
// 6. مكون نموذج طلب الشراء (PurchaseOrderForm)
// -----------------------------------------------------------------------------

interface PurchaseOrderFormProps {
  initialData?: PurchaseOrder;
  onSave: (data: FormValues) => void;
  onClose: () => void;
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({ initialData, onSave, onClose }) => {
  const { register, handleSubmit, formState: { errors }, control, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      orderDate: initialData.orderDate,
      deliveryDate: initialData.deliveryDate,
    } : {
      supplierName: '',
      orderDate: new Date(),
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      notes: '',
      items: [{ productName: '', quantity: 1, unitPrice: 0.01 }],
    },
  });

  const onSubmit = (data: FormValues) => {
    onSave(data);
  };

  // Simplified item management for this example
  const items = watch('items');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="اسم المورد"
          {...register("supplierName")}
          error={errors.supplierName?.message}
          dir="rtl"
        />
        {/* Date Pickers would be used here (e.g., shadcn/ui Calendar/DatePicker) */}
        <Input
          label="تاريخ الطلب (YYYY-MM-DD)"
          type="date"
          {...register("orderDate", { valueAsDate: true })}
          error={errors.orderDate?.message}
        />
        <Input
          label="تاريخ التسليم المتوقع (YYYY-MM-DD)"
          type="date"
          {...register("deliveryDate", { valueAsDate: true })}
          error={errors.deliveryDate?.message}
        />
      </div>

      <h4 className="text-md font-semibold border-b pb-2">تفاصيل المنتجات</h4>
      <div className="space-y-4">
        {items.map((item, index) => (
          <Card key={index} className="p-4 border border-gray-200">
            <div className="grid grid-cols-4 gap-4 items-end">
              <Input
                label="اسم المنتج"
                {...register(`items.${index}.productName`)}
                error={errors.items?.[index]?.productName?.message}
                className="col-span-4 sm:col-span-2"
                dir="rtl"
              />
              <Input
                label="الكمية"
                type="number"
                {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                error={errors.items?.[index]?.quantity?.message}
                className="col-span-2 sm:col-span-1"
              />
              <Input
                label="سعر الوحدة"
                type="number"
                step="0.01"
                {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                error={errors.items?.[index]?.unitPrice?.message}
                className="col-span-2 sm:col-span-1"
              />
              {/* In a real implementation, use useFieldArray for dynamic item management */}
            </div>
          </Card>
        ))}
        {errors.items && <p className="text-sm text-red-600 mt-2">{errors.items.message}</p>}
        <Button type="button" variant="ghost" className="w-full border border-dashed">
          <PlusCircle className="h-4 w-4 ml-2" /> إضافة منتج آخر
        </Button>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">ملاحظات</label>
        <textarea
          {...register("notes")}
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          dir="rtl"
        />
      </div>

      <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4 border-t">
        <Button type="button" onClick={onClose} variant="ghost">
          إلغاء
        </Button>
        <Button type="submit" variant="primary">
          {initialData ? "حفظ التعديلات" : "إنشاء طلب الشراء"}
        </Button>
      </div>
    </form>
  );
};

// -----------------------------------------------------------------------------
// 7. المكون الرئيسي (PurchaseOrdersList)
// -----------------------------------------------------------------------------

const PurchaseOrdersList: React.FC = () => {
  const [data, setData] = useState<PurchaseOrder[]>(mockPurchaseOrders);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | undefined>(undefined);
  const [viewingOrder, setViewingOrder] = useState<PurchaseOrder | undefined>(undefined);

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
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Handlers for CRUD operations
  const handleAdd = () => {
    setEditingOrder(undefined);
    setViewingOrder(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (order: PurchaseOrder) => {
    setEditingOrder(order);
    setViewingOrder(undefined);
    setIsFormOpen(true);
  };

  const handleView = (order: PurchaseOrder) => {
    setViewingOrder(order);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(`هل أنت متأكد من حذف طلب الشراء رقم ${id}؟`)) {
      setData(prev => prev.filter(order => order.id !== id));
    }
  };

  const handleSave = (formData: FormValues) => {
    const newOrder: PurchaseOrder = {
      ...formData,
      id: editingOrder ? editingOrder.id : `PO-2024-${String(data.length + 1).padStart(3, '0')}`,
      status: editingOrder ? editingOrder.status : "Pending",
      totalAmount: formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
      items: formData.items.map(item => ({
        ...item,
        id: item.productName, // Simplified ID for mock data
        total: item.quantity * item.unitPrice,
      })),
    };

    if (editingOrder) {
      setData(prev => prev.map(order => order.id === newOrder.id ? newOrder : order));
    } else {
      setData(prev => [newOrder, ...prev]);
    }

    setIsFormOpen(false);
    setEditingOrder(undefined);
  };

  const statusOptions = useMemo(() => {
    return Object.keys(statusMap).map(key => ({
      value: key,
      label: statusMap[key as PurchaseOrderStatus].label,
    }));
  }, []);

  // Filter component
  const StatusFilter = () => {
    const statusFilter = table.getColumn("status")?.getFilterValue() as string[] || [];

    const toggleStatus = (status: string) => {
      const newFilter = statusFilter.includes(status)
        ? statusFilter.filter(s => s !== status)
        : [...statusFilter, status];
      table.getColumn("status")?.setFilterValue(newFilter.length > 0 ? newFilter : undefined);
    };

    return (
      <div className="flex flex-wrap gap-2">
        {statusOptions.map(option => (
          <Button
            key={option.value}
            variant={statusFilter.includes(option.value) ? "primary" : "ghost"}
            onClick={() => toggleStatus(option.value)}
            className={`text-sm ${statusFilter.includes(option.value) ? 'bg-blue-500 text-white' : 'border border-gray-300'}`}
          >
            {option.label}
          </Button>
        ))}
      </div>
    );
  };

  // View Dialog Component
  const ViewOrderDialog: React.FC<{ order: PurchaseOrder, onClose: () => void }> = ({ order, onClose }) => (
    <Dialog open={!!order} onOpenChange={onClose} title={`عرض طلب الشراء: ${order.id}`}>
      <div className="space-y-4 text-right" dir="rtl">
        <p><strong>المورد:</strong> {order.supplierName}</p>
        <p><strong>تاريخ الطلب:</strong> {formatDate(order.orderDate)}</p>
        <p><strong>تاريخ التسليم المتوقع:</strong> {formatDate(order.deliveryDate)}</p>
        <p><strong>الحالة:</strong> <Badge className={statusMap[order.status].color}>{statusMap[order.status].label}</Badge></p>
        <p><strong>المبلغ الإجمالي:</strong> <span className="font-bold text-lg">{formatCurrency(order.totalAmount)}</span></p>

        <h5 className="font-semibold mt-4 border-t pt-4">المنتجات المطلوبة</h5>
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المنتج</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الكمية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">سعر الوحدة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.productName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4"><strong>ملاحظات:</strong> {order.notes || 'لا توجد ملاحظات.'}</p>
      </div>
      <div className="flex justify-end mt-6">
        <Button onClick={onClose} variant="primary">إغلاق</Button>
      </div>
    </Dialog>
  );

  return (
    <DashboardLayout>
      <Card className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">قائمة طلبات الشراء</h2>
          <Button onClick={handleAdd} variant="primary" className="flex items-center">
            <PlusCircle className="h-4 w-4 ml-2" />
            إنشاء طلب شراء جديد
          </Button>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="بحث حسب رقم الطلب أو اسم المورد..."
              value={globalFilter ?? ''}
              onChange={(e: React.FormEvent) => setGlobalFilter(e.target.value)}
              className="max-w-sm"
              dir="rtl"
            />
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">تصفية حسب الحالة:</h4>
            <StatusFilter />
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-md border overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-right" dir="rtl">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-24 text-center text-gray-500">
                    لا توجد نتائج مطابقة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 rtl:space-x-reverse py-4">
          <div className="flex-1 text-sm text-gray-700">
            عرض {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} -
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getRowCount()
            )} من {table.getRowCount()} طلب
          </div>
          <div className="space-x-2 rtl:space-x-reverse">
            <Button
              variant="ghost"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              السابق
            </Button>
            <Button
              variant="ghost"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              التالي
            </Button>
          </div>
        </div>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editingOrder ? `تعديل طلب الشراء: ${editingOrder.id}` : "إنشاء طلب شراء جديد"}
      >
        <PurchaseOrderForm
          initialData={editingOrder}
          onSave={handleSave}
          onClose={() => {
            setIsFormOpen(false);
            setEditingOrder(undefined);
          }}
        />
      </Dialog>

      {/* View Dialog */}
      {viewingOrder && (
        <ViewOrderDialog
          order={viewingOrder}
          onClose={() => setViewingOrder(undefined)}
        />
      )}
    </DashboardLayout>
  );
};

export default PurchaseOrdersList;

// -----------------------------------------------------------------------------
// 8. ملاحظات حول المكونات الوهمية (Mock Components)
// -----------------------------------------------------------------------------
// تم استخدام تعريفات مبسطة للمكونات (Button, Input, Card, Dialog, Badge)
// لمحاكاة سلوك مكونات shadcn/ui. في بيئة تطوير حقيقية، يجب استيراد
// المكونات الفعلية من مكتبة shadcn/ui.
// -----------------------------------------------------------------------------
