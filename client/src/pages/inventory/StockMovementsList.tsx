// @ts-nocheck
// StockMovementsList.tsx

import React, { useState, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { ArrowUpDown, PlusCircle, Edit, Trash2, Search, Calendar, Filter } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// 1. Shadcn/ui Components (Simulated Imports)
// في بيئة عمل حقيقية، سيتم استيراد هذه المكونات من مكتبة shadcn/ui
const Button = (props: React.ComponentProps<'button'> & { variant?: 'default' | 'outline' | 'destructive', size?: 'default' | 'sm' | 'icon' }) => <button {...props} className={`p-2 rounded ${props.className}`} />;
const Input = (props: React.ComponentProps<'input'>) => <input {...props} className="border p-2 rounded w-full" />;
const Label = (props: React.ComponentProps<'label'>) => <label {...props} className="block text-sm font-medium text-gray-700 mb-1" />;
const Select = ({ children, ...props }: React.ComponentProps<'select'>) => <select {...props} className="border p-2 rounded w-full">{children}</select>;
const SelectTrigger = Select;
const SelectValue = ({ placeholder }: { placeholder: string }) => <span>{placeholder}</span>;
const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const SelectItem = ({ value, children }: { value: string, children: React.ReactNode }) => <option value={value}>{children}</option>;
const Dialog = ({ open, onOpenChange, children }: { open: boolean, onOpenChange: (open: boolean) => void, children: React.ReactNode }) => (
  open ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={() => onOpenChange(false)}>
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full mx-4" onClick={(e: any) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  ) : null
);
const DialogContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DialogHeader = ({ children }: { children: React.ReactNode }) => <div className="mb-4 border-b pb-2">{children}</div>;
const DialogTitle = (props: React.ComponentProps<'h3'>) => <h3 {...props} className="text-xl font-bold" />;
const DialogDescription = (props: React.ComponentProps<'p'>) => <p {...props} className="text-sm text-gray-500" />;
const Form = (props: React.ComponentProps<'form'>) => <form {...props} />;
const FormField = ({ name, render }: { name: string, render: (field: unknown) => React.ReactNode }) => <div className="mb-4">{render({ name })}</div>;
const FormItem = ({ children }: { children: React.ReactNode }) => <div className="space-y-2">{children}</div>;
const FormControl = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const FormMessage = ({ children }: { children: React.ReactNode }) => <p className="text-red-500 text-xs mt-1">{children}</p>;
const Card = (props: React.ComponentProps<'div'>) => <div {...props} className={`bg-white p-6 rounded-lg shadow ${props.className}`} />;
const CardHeader = (props: React.ComponentProps<'div'>) => <div {...props} className="flex justify-between items-center mb-4" />;
const CardTitle = (props: React.ComponentProps<'h2'>) => <h2 {...props} className="text-2xl font-semibold" />;
const Table = (props: React.ComponentProps<'table'>) => <table {...props} className="min-w-full divide-y divide-gray-200" />;
const TableHeader = (props: React.ComponentProps<'thead'>) => <thead {...props} className="bg-gray-50" />;
const TableBody = (props: React.ComponentProps<'tbody'>) => <tbody {...props} className="divide-y divide-gray-200" />;
const TableRow = (props: React.ComponentProps<'tr'>) => <tr {...props} className="hover:bg-gray-100 transition-colors" />;
const TableHead = (props: React.ComponentProps<'th'>) => <th {...props} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" />;
const TableCell = (props: React.ComponentProps<'td'>) => <td {...props} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right" />;
const Separator = (props: React.ComponentProps<'div'>) => <div {...props} className="my-4 h-px bg-gray-200" />;
const DatePicker = ({ value, onChange }: { value: Date | undefined, onChange: (date: Date | undefined) => void }) => (
  <div className="relative">
    <Input
      type="date"
      value={value ? value.toISOString().split('T')[0] : ''}
      onChange={(e: any) => onChange((e.target as HTMLInputElement).value ? new Date((e.target as HTMLInputElement).value) : undefined)}
      className="pr-10"
    />
    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
  </div>
);

// 2. Data Structure and Mock Data

type MovementType = 'Entry' | 'Exit' | 'Adjustment';

interface StockMovement {
  id: string;
  date: string; // YYYY-MM-DD
  type: MovementType;
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  sourceLocation: string;
  destinationLocation: string;
  reference: string;
  notes: string;
}

const mockData: StockMovement[] = [
  {
    id: 'SM001',
    date: '2024-10-20',
    type: 'Entry',
    itemId: 'P001',
    itemName: 'كمبيوتر محمول (موديل X)',
    quantity: 15,
    unit: 'وحدة',
    sourceLocation: 'المورد: شركة التقنية الحديثة',
    destinationLocation: 'المستودع الرئيسي',
    reference: 'PO-2024-554',
    notes: 'استلام شحنة جديدة حسب أمر الشراء.',
  },
  {
    id: 'SM002',
    date: '2024-10-21',
    type: 'Exit',
    itemId: 'P003',
    itemName: 'شاشة عرض 27 بوصة',
    quantity: 5,
    unit: 'وحدة',
    sourceLocation: 'المستودع الرئيسي',
    destinationLocation: 'العميل: متجر الأفق',
    reference: 'INV-2024-102',
    notes: 'صرف بضاعة مباعة للعميل.',
  },
  {
    id: 'SM003',
    date: '2024-10-21',
    type: 'Adjustment',
    itemId: 'P002',
    itemName: 'طابعة ليزر متعددة الوظائف',
    quantity: -2,
    unit: 'وحدة',
    sourceLocation: 'المستودع الرئيسي',
    destinationLocation: 'جرد',
    reference: 'ADJ-2024-01',
    notes: 'تسوية جردية لوجود نقص في المخزون.',
  },
  {
    id: 'SM004',
    date: '2024-10-22',
    type: 'Entry',
    itemId: 'P001',
    itemName: 'كمبيوتر محمول (موديل X)',
    quantity: 5,
    unit: 'وحدة',
    sourceLocation: 'المورد: شركة التقنية الحديثة',
    destinationLocation: 'مستودع الفرع',
    reference: 'PO-2024-555',
    notes: 'استلام إضافي للفرع.',
  },
  {
    id: 'SM005',
    date: '2024-10-23',
    type: 'Exit',
    itemId: 'P004',
    itemName: 'لوحة مفاتيح لاسلكية',
    quantity: 50,
    unit: 'قطعة',
    sourceLocation: 'مستودع الفرع',
    destinationLocation: 'العميل: شركة النور',
    reference: 'INV-2024-103',
    notes: 'بيع جملة.',
  },
];

const movementTypeMap: Record<MovementType, string> = {
  Entry: 'إدخال (وارد)',
  Exit: 'إخراج (صادر)',
  Adjustment: 'تسوية (جرد)',
};

// 3. Form Schema and Validation

const formSchema = z.object({
  id: z.string().optional(),
  date: z.string().min(1, { message: 'التاريخ مطلوب.' }),
  type: z.enum(['Entry', 'Exit', 'Adjustment'], {
    required_error: 'نوع الحركة مطلوب.',
  }),
  itemId: z.string().min(1, { message: 'رمز الصنف مطلوب.' }),
  itemName: z.string().min(1, { message: 'اسم الصنف مطلوب.' }),
  quantity: z.number().min(1, { message: 'الكمية يجب أن تكون أكبر من صفر.' }),
  unit: z.string().min(1, { message: 'الوحدة مطلوبة.' }),
  sourceLocation: z.string().min(1, { message: 'الموقع المصدر مطلوب.' }),
  destinationLocation: z.string().min(1, { message: 'الموقع الوجهة مطلوب.' }),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type MovementFormValues = z.infer<typeof formSchema>;

// 4. CRUD Form Component

interface MovementFormProps {
  initialData?: StockMovement;
  onSave: (data: MovementFormValues) => void;
  onClose: () => void;
}

const MovementForm: React.FC<MovementFormProps> = ({ initialData, onSave, onClose }) => {
  const form = useForm<MovementFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      date: new Date().toISOString().split('T')[0],
      type: 'Entry',
      itemId: '',
      itemName: '',
      quantity: 1,
      unit: 'وحدة',
      sourceLocation: '',
      destinationLocation: '',
      reference: '',
      notes: '',
    },
  });

  const onSubmit = (data: MovementFormValues) => {
    onSave(data);
    onClose();
  };

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          name="date"
          render={({ name }) => (
            <FormItem>
              <Label htmlFor={name}>التاريخ</Label>
              <FormControl>
                <Input id={name} type="date" {...form.register(name)} />
              </FormControl>
              <FormMessage>{form.formState.errors.date?.message}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          name="type"
          render={({ name }) => (
            <FormItem>
              <Label htmlFor={name}>نوع الحركة</Label>
              <FormControl>
                <Select id={name} {...form.register(name)}>
                  <SelectItem value="Entry">{movementTypeMap.Entry}</SelectItem>
                  <SelectItem value="Exit">{movementTypeMap.Exit}</SelectItem>
                  <SelectItem value="Adjustment">{movementTypeMap.Adjustment}</SelectItem>
                </Select>
              </FormControl>
              <FormMessage>{form.formState.errors.type?.message}</FormMessage>
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          name="itemId"
          render={({ name }) => (
            <FormItem>
              <Label htmlFor={name}>رمز الصنف</Label>
              <FormControl>
                <Input id={name} {...form.register(name)} />
              </FormControl>
              <FormMessage>{form.formState.errors.itemId?.message}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          name="itemName"
          render={({ name }) => (
            <FormItem>
              <Label htmlFor={name}>اسم الصنف</Label>
              <FormControl>
                <Input id={name} {...form.register(name)} />
              </FormControl>
              <FormMessage>{form.formState.errors.itemName?.message}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          name="unit"
          render={({ name }) => (
            <FormItem>
              <Label htmlFor={name}>الوحدة</Label>
              <FormControl>
                <Input id={name} {...form.register(name)} />
              </FormControl>
              <FormMessage>{form.formState.errors.unit?.message}</FormMessage>
            </FormItem>
          )}
        />
      </div>

      <FormField
        name="quantity"
        render={({ name }) => (
          <FormItem>
            <Label htmlFor={name}>الكمية</Label>
            <FormControl>
              <Input
                id={name}
                type="number"
                step="1"
                {...form.register(name, { valueAsNumber: true })}
              />
            </FormControl>
            <FormMessage>{form.formState.errors.quantity?.message}</FormMessage>
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          name="sourceLocation"
          render={({ name }) => (
            <FormItem>
              <Label htmlFor={name}>الموقع المصدر</Label>
              <FormControl>
                <Input id={name} {...form.register(name)} />
              </FormControl>
              <FormMessage>{form.formState.errors.sourceLocation?.message}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          name="destinationLocation"
          render={({ name }) => (
            <FormItem>
              <Label htmlFor={name}>الموقع الوجهة</Label>
              <FormControl>
                <Input id={name} {...form.register(name)} />
              </FormControl>
              <FormMessage>{form.formState.errors.destinationLocation?.message}</FormMessage>
            </FormItem>
          )}
        />
      </div>

      <FormField
        name="reference"
        render={({ name }) => (
          <FormItem>
            <Label htmlFor={name}>المرجع (رقم الفاتورة/الشراء)</Label>
            <FormControl>
              <Input id={name} {...form.register(name)} />
            </FormControl>
            <FormMessage>{form.formState.errors.reference?.message}</FormMessage>
          </FormItem>
        )}
      />

      <FormField
        name="notes"
        render={({ name }) => (
          <FormItem>
            <Label htmlFor={name}>ملاحظات</Label>
            <FormControl>
              <textarea id={name} rows={3} {...form.register(name)} className="border p-2 rounded w-full" />
            </FormControl>
            <FormMessage>{form.formState.errors.notes?.message}</FormMessage>
          </FormItem>
        )}
      />

      <div className="flex justify-end space-x-2 space-x-reverse pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          إلغاء
        </Button>
        <Button type="submit">
          {initialData ? 'حفظ التعديلات' : 'إضافة الحركة'}
        </Button>
      </div>
    </Form>
  );
};

// 5. Table Columns Definition

const columns: ColumnDef<StockMovement>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="text-right justify-end"
      >
        رقم الحركة
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-right font-medium">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="text-right justify-end"
      >
        التاريخ
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-right">{new Date(row.getValue('date')).toLocaleDateString('ar-EG')}</div>,
  },
  {
    accessorKey: 'itemName',
    header: 'اسم الصنف',
    cell: ({ row }) => <div className="text-right">{row.getValue('itemName')}</div>,
  },
  {
    accessorKey: 'type',
    header: 'نوع الحركة',
    cell: ({ row }) => {
      const type = row.getValue('type') as MovementType;
      const color = type === 'Entry' ? 'text-green-600 bg-green-50' : type === 'Exit' ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50';
      return (
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${color} justify-center w-24`}>
          {movementTypeMap[type]}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'quantity',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="text-right justify-end"
      >
        الكمية
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const quantity = row.getValue('quantity') as number;
      const type = row.original.type;
      const sign = type === 'Entry' ? '+' : type === 'Exit' ? '-' : '';
      const color = type === 'Entry' ? 'text-green-600' : type === 'Exit' ? 'text-red-600' : 'text-blue-600';
      return <div className={`text-right font-bold ${color}`}>{sign}{quantity} {row.original.unit}</div>;
    },
  },
  {
    accessorKey: 'sourceLocation',
    header: 'المصدر',
    cell: ({ row }) => <div className="text-right text-xs text-gray-500">{row.getValue('sourceLocation')}</div>,
  },
  {
    accessorKey: 'destinationLocation',
    header: 'الوجهة',
    cell: ({ row }) => <div className="text-right text-xs text-gray-500">{row.getValue('destinationLocation')}</div>,
  },
  {
    id: 'actions',
    header: 'الإجراءات',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onEdit: (movement: StockMovement) => void;
        onDelete: (id: string) => void;
      };
      const movement = row.original;

      return (
        <div className="flex justify-end space-x-2 space-x-reverse">
          <Button
            variant="outline"
            size="sm"
            onClick={() => meta.onEdit(movement)}
            title="تعديل"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => meta.onDelete(movement.id)}
            title="حذف"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

// 6. Main Component: StockMovementsList

export const StockMovementsList: React.FC = () => {
  const [data, setData] = useState<StockMovement[]>(mockData);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<StockMovement | undefined>(undefined);
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  // CRUD Operations
  const handleSave = (values: MovementFormValues) => {
    if (editingMovement) {
      // Edit
      setData(data.map(m => m.id === editingMovement.id ? { ...m, ...values, id: editingMovement.id } : m));
    } else {
      // Add
      const newId = `SM${String(data.length + 1).padStart(3, '0')}`;
      const newMovement: StockMovement = { ...values, id: newId };
      setData([newMovement, ...data]);
    }
    setEditingMovement(undefined);
  };

  const handleEdit = (movement: StockMovement) => {
    setEditingMovement(movement);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف حركة المخزون هذه؟')) {
      setData(data.filter(m => m.id !== id));
    }
  };

  const handleOpenDialog = () => {
    setEditingMovement(undefined);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMovement(undefined);
  };

  // Apply date filter manually since it's not a standard column filter
  const filteredData = useMemo(() => {
    if (!dateFilter) return data;
    const filterDateString = dateFilter.toISOString().split('T')[0];
    return data.filter(movement => movement.date === filterDateString);
  }, [data, dateFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    meta: {
      onEdit: handleEdit,
      onDelete: handleDelete,
    },
  });

  // 7. Render Component

  return (
    // Simulated DashboardLayout
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen" dir="rtl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>قائمة حركات المخزون</CardTitle>
          <Button onClick={handleOpenDialog} className="flex items-center space-x-2 space-x-reverse">
            <PlusCircle className="h-4 w-4" />
            <span>إضافة حركة جديدة</span>
          </Button>
        </CardHeader>

        <Separator />

        {/* Filtering and Search Controls */}
        <div className="flex flex-col md:flex-row gap-4 py-4">
          {/* Global Search */}
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="بحث عام (رقم الحركة، الصنف، المرجع...)"
              value={globalFilter ?? ''}
              onChange={(event: any) => setGlobalFilter((event.target as HTMLInputElement).value)}
              className="pr-10 text-right"
            />
          </div>

          {/* Type Filter */}
          <div className="w-full md:w-48">
            <Select
              value={(table.getColumn('type')?.getFilterValue() as string) ?? ''}
              onChange={(e: any) =>
                table.getColumn('type')?.setFilterValue((e.target as HTMLInputElement).value ? [(e.target as HTMLInputElement).value] : undefined)
              }
            >
              <SelectItem value="all">
                <SelectValue placeholder="فلترة حسب النوع" />
              </SelectItem>
              <SelectItem value="Entry">{movementTypeMap.Entry}</SelectItem>
              <SelectItem value="Exit">{movementTypeMap.Exit}</SelectItem>
              <SelectItem value="Adjustment">{movementTypeMap.Adjustment}</SelectItem>
            </Select>
          </div>

          {/* Date Filter */}
          <div className="w-full md:w-48">
            <DatePicker
              value={dateFilter}
              onChange={(date) => setDateFilter(date)}
            />
          </div>

          {/* Clear Filters Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setGlobalFilter('');
              table.getColumn('type')?.setFilterValue(undefined);
              setDateFilter(undefined);
            }}
            className="w-full md:w-auto"
          >
            <Filter className="h-4 w-4 ml-2" />
            مسح الفلاتر
          </Button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
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
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    لا توجد حركات مخزون مطابقة.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end space-x-2 space-x-reverse py-4">
          <div className="flex-1 text-sm text-gray-500">
            عرض {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} -{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            من {table.getFilteredRowModel().rows.length} حركة.
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
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMovement ? 'تعديل حركة المخزون' : 'إضافة حركة مخزون جديدة'}</DialogTitle>
            <DialogDescription>
              {editingMovement ? 'قم بتعديل بيانات حركة المخزون الحالية.' : 'قم بإدخال بيانات حركة المخزون الجديدة.'}
            </DialogDescription>
          </DialogHeader>
          <MovementForm
            initialData={editingMovement}
            onSave={handleSave}
            onClose={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Export the component for use in a real application
// export default StockMovementsList;
