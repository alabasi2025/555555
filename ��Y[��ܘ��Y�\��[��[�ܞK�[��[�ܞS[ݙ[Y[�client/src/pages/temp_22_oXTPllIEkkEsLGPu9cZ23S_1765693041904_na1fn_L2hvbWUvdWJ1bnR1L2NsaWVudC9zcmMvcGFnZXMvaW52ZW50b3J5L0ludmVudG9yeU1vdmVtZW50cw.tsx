// client/src/pages/inventory/InventoryMovements.tsx

import React, { useState, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, Search, Filter, PlusCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// استيراد البيانات والأنواع الوهمية
import { InventoryMovement, MovementType, mockMovements } from "../../inventory_movements_data";

// =================================================================
// محاكاة لمكونات shadcn/ui والمكونات المشتركة
// =================================================================

// محاكاة لمكون التخطيط الرئيسي
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
    <header className="p-4 border-b bg-white dark:bg-gray-800">
      <h1 className="text-xl font-bold text-right">نظام إدارة محطات الكهرباء</h1>
    </header>
    <main className="flex-grow p-6">{children}</main>
  </div>
);

// محاكاة لمكونات shadcn/ui الأساسية
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }> = ({ children, className, ...props }) => (
  <button
    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${className || ''}`}
    {...props}
  >
    {children}
  </button>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-right"
    {...props}
  />
);

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <div className={`rounded-xl border bg-card text-card-foreground shadow ${className || ''}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col space-y-1.5 p-6">{children}</div>
);

const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-6 pt-0">{children}</div>
);

const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-2xl font-semibold leading-none tracking-tight text-right">{children}</h3>
);

const CardDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-muted-foreground text-right">{children}</p>
);

const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full overflow-auto">
    <table className="w-full caption-bottom text-sm rtl:text-right ltr:text-left">{children}</table>
  </div>
);

const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="[&_tr]:border-b">{children}</thead>
);

const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
);

const TableRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">{children}</tr>
);

const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, className, ...props }) => (
  <th
    className={`h-12 px-4 text-muted-foreground align-middle font-medium [&:has([role=checkbox])]:pr-0 ${className || ''}`}
    {...props}
  >
    {children}
  </th>
);

const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className, ...props }) => (
  <td
    className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className || ''}`}
    {...props}
  >
    {children}
  </td>
);

const Badge: React.FC<{ children: React.ReactNode, variant?: "default" | "secondary" | "destructive" | "outline" }> = ({ children, variant = "default" }) => {
  let baseClass = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  if (variant === "default") baseClass += " border-transparent bg-primary text-primary-foreground hover:bg-primary/80";
  if (variant === "secondary") baseClass += " border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80";
  if (variant === "destructive") baseClass += " border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80";
  if (variant === "outline") baseClass += " text-foreground";
  return <span className={baseClass}>{children}</span>;
};

// =================================================================
// تعريف أعمدة الجدول (Columns Definition)
// =================================================================

const columns: ColumnDef<InventoryMovement>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="text-right"
      >
        رقم الحركة
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-right font-medium">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "movement_date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="text-right"
      >
        التاريخ
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-right">{new Date(row.getValue("movement_date")).toLocaleDateString('ar-EG')}</div>,
  },
  {
    accessorKey: "type",
    header: "النوع",
    cell: ({ row }) => {
      const type: MovementType = row.getValue("type");
      return (
        <Badge variant={type === "إدخال" ? "default" : "secondary"}>
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "item_name",
    header: "اسم الصنف",
    cell: ({ row }) => <div className="text-right">{row.getValue("item_name")}</div>,
  },
  {
    accessorKey: "quantity",
    header: "الكمية",
    cell: ({ row }) => <div className="text-right">{row.getValue("quantity")} {row.original.unit}</div>,
  },
  {
    accessorKey: "source_destination",
    header: "المصدر / الوجهة",
    cell: ({ row }) => <div className="text-right">{row.getValue("source_destination")}</div>,
  },
  {
    accessorKey: "user",
    header: "المستخدم",
    cell: ({ row }) => <div className="text-right">{row.getValue("user")}</div>,
  },
  {
    id: "actions",
    header: "الإجراءات",
    cell: () => (
      <div className="text-right">
        <Button variant="ghost" className="h-8 w-8 p-0">
          {/* محاكاة لمكون DropdownMenu */}
          ...
        </Button>
      </div>
    ),
  },
];

// =================================================================
// تعريف مخطط التحقق (Validation Schema) لنموذج التصفية
// =================================================================

const filterSchema = z.object({
  search: z.string().optional(),
  type: z.enum(["all", "إدخال", "إخراج"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type FilterValues = z.infer<typeof filterSchema>;

// =================================================================
// المكون الرئيسي: InventoryMovements
// =================================================================

const InventoryMovements: React.FC = () => {
  const [data, setData] = useState<InventoryMovement[]>(mockMovements);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // محاكاة جلب البيانات
  const fetchData = async (filters: FilterValues) => {
    setIsLoading(true);
    setError(null);
    try {
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 1000));

      let filteredData = mockMovements.filter(movement => {
        // تطبيق فلتر البحث العام
        if (filters.search && !Object.values(movement).some(val => 
            String(val).toLowerCase().includes(filters.search!.toLowerCase())
        )) {
          return false;
        }

        // تطبيق فلتر النوع
        if (filters.type && filters.type !== "all" && movement.type !== filters.type) {
          return false;
        }

        // تطبيق فلتر التاريخ (تبسيط)
        const movementDate = new Date(movement.movement_date).getTime();
        if (filters.startDate) {
          const start = new Date(filters.startDate).getTime();
          if (movementDate < start) return false;
        }
        if (filters.endDate) {
          const end = new Date(filters.endDate).getTime();
          if (movementDate > end) return false;
        }

        return true;
      });

      setData(filteredData);
    } catch (err) {
      setError("فشل في جلب بيانات حركات المخزون.");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // تهيئة نموذج التصفية
  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      search: "",
      type: "all",
      startDate: "",
      endDate: "",
    },
  });

  const onSubmit = (values: FilterValues) => {
    setGlobalFilter(values.search || '');
    fetchData(values);
  };

  // تهيئة جدول البيانات
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-right">حركات المخزون</h2>
          <Button>
            <PlusCircle className="ml-2 h-4 w-4" />
            إضافة حركة جديدة
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>تصفية وبحث</CardTitle>
            <CardDescription>استخدم خيارات التصفية أدناه للبحث عن حركات محددة.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* نموذج التصفية */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              {/* حقل البحث العام */}
              <div className="col-span-1 md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 text-right mb-1">بحث عام</label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="ابحث برقم الحركة، اسم الصنف، أو المستخدم..."
                    {...form.register("search")}
                    className="pr-10"
                  />
                </div>
              </div>

              {/* حقل نوع الحركة (محاكاة Select) */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 text-right mb-1">نوع الحركة</label>
                <select
                  id="type"
                  {...form.register("type")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-right"
                >
                  <option value="all">الكل</option>
                  <option value="إدخال">إدخال</option>
                  <option value="إخراج">إخراج</option>
                </select>
              </div>

              {/* حقل تاريخ البدء (محاكاة DatePicker) */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 text-right mb-1">من تاريخ</label>
                <Input type="date" id="startDate" {...form.register("startDate")} />
              </div>

              {/* حقل تاريخ الانتهاء (محاكاة DatePicker) */}
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 text-right mb-1">إلى تاريخ</label>
                <Input type="date" id="endDate" {...form.register("endDate")} />
              </div>

              {/* زر التصفية */}
              <Button type="submit" className="w-full md:col-span-1" disabled={isLoading}>
                {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Filter className="ml-2 h-4 w-4" />}
                تطبيق التصفية
              </Button>
            </form>
            {form.formState.errors.search && <p className="text-red-500 text-sm mt-2 text-right">{form.formState.errors.search.message}</p>}
          </CardContent>
        </Card>

        {/* جدول عرض البيانات */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة الحركات</CardTitle>
            <CardDescription>عرض جميع حركات المخزون (إدخال وإخراج).</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 text-right" role="alert">
                <span className="font-medium">خطأ:</span> {error}
              </div>
            )}
            <div className="rounded-md border">
              <Table>
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
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                        <p className="mt-2">جاري تحميل البيانات...</p>
                      </TableCell>
                    </TableRow>
                  ) : table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
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
                        لا توجد حركات مخزون مطابقة لنتائج البحث.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* أدوات التنقل بين الصفحات (Pagination) */}
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground text-right">
                {table.getFilteredRowModel().rows.length} صفوف مطابقة.
              </div>
              <div className="space-x-2">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InventoryMovements;
