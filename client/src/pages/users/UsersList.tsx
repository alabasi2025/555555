import React, { useState, useMemo } from 'react';
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
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout'; // افتراض وجود هذا المكون

// 1. تعريف نوع البيانات (Type Definition)
interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User' | 'Manager';
  status: 'Active' | 'Inactive';
}

// 2. بيانات وهمية (Mock Data)
const mockUsers: User[] = [
  { id: '1', name: 'أحمد علي', email: 'ahmad.ali@example.com', role: 'Admin', status: 'Active' },
  { id: '2', name: 'فاطمة محمد', email: 'fatima.m@example.com', role: 'User', status: 'Active' },
  { id: '3', name: 'خالد سعيد', email: 'khaled.s@example.com', role: 'Manager', status: 'Inactive' },
  { id: '4', name: 'ليلى حسن', email: 'layla.h@example.com', role: 'User', status: 'Active' },
  { id: '5', name: 'يوسف طارق', email: 'yousef.t@example.com', role: 'Admin', status: 'Active' },
];

// 3. محاكاة لـ tRPC (Mock tRPC Hook)
// في التطبيق الحقيقي، سيتم استبدال هذا بالاستدعاء الفعلي لـ tRPC
const useUsers = () => {
  // محاكاة استدعاء tRPC لجلب قائمة المستخدمين
  return {
    data: mockUsers,
    isLoading: false,
    error: null,
    refetch: () => console.log('Refetching users...'),
  };
};

// 4. تعريف مخطط النموذج (Form Schema)
const userFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: 'الاسم يجب أن يحتوي على حرفين على الأقل.' }),
  email: z.string().email({ message: 'البريد الإلكتروني غير صالح.' }),
  role: z.enum(['Admin', 'User', 'Manager'], { message: 'يرجى اختيار دور.' }),
});

type UserFormValues = z.infer<typeof userFormSchema>;

// 5. مكون نموذج الإضافة/التعديل (Add/Edit Form Component)
interface UserFormProps {
  user?: User; // إذا تم تمرير مستخدم، فهذا يعني تعديل
  onSave: (data: UserFormValues) => void;
  onClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onClose }) => {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: user || { name: '', email: '', role: 'User' },
  });

  const onSubmit = (data: UserFormValues) => {
    onSave(data);
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الاسم</FormLabel>
              <FormControl>
                <Input placeholder="أدخل اسم المستخدم" {...field} className="text-right" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>البريد الإلكتروني</FormLabel>
              <FormControl>
                <Input placeholder="أدخل البريد الإلكتروني" {...field} className="text-right" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الدور</FormLabel>
              <FormControl>
                {/* يمكن استبدال هذا بـ Select component من shadcn/ui */}
                <select
                  {...field}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-right"
                >
                  <option value="User">مستخدم</option>
                  <option value="Manager">مدير</option>
                  <option value="Admin">مسؤول</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {user ? 'حفظ التعديلات' : 'إضافة مستخدم'}
        </Button>
      </form>
    </Form>
  );
};

// 6. المكون الرئيسي (UsersList)
const UsersList: React.FC = () => {
  const { data: users, isLoading } = useUsers();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);

  // 7. تعريف الأعمدة (Column Definitions)
  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'الاسم',
        cell: ({ row }) => <div className="text-right">{row.getValue('name')}</div>,
      },
      {
        accessorKey: 'email',
        header: 'البريد الإلكتروني',
        cell: ({ row }) => <div className="text-right">{row.getValue('email')}</div>,
      },
      {
        accessorKey: 'role',
        header: 'الدور',
        cell: ({ row }) => <div className="text-right">{row.getValue('role')}</div>,
        filterFn: 'includesString',
      },
      {
        accessorKey: 'status',
        header: 'الحالة',
        cell: ({ row }) => (
          <div className={`text-right font-medium ${row.getValue('status') === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
            {row.getValue('status') === 'Active' ? 'نشط' : 'غير نشط'}
          </div>
        ),
        filterFn: 'includesString',
      },
      {
        id: 'actions',
        header: 'الإجراءات',
        cell: ({ row }) => {
          const user = row.original;

          const handleEdit = () => {
            setEditingUser(user);
            setIsDialogOpen(true);
          };

          const handleDelete = () => {
            // محاكاة عملية الحذف باستخدام tRPC
            if (window.confirm(`هل أنت متأكد من حذف المستخدم ${user.name}؟`)) {
              console.log(`Deleting user ${user.id}`);
              // هنا يتم استدعاء tRPC mutation للحذف
            }
          };

          return (
            <div className="flex justify-end space-x-2 space-x-reverse">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 ml-2" />
                تعديل
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 ml-2" />
                حذف
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: users || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handleSave = (data: UserFormValues) => {
    // هنا يتم استدعاء tRPC mutation للإضافة أو التعديل
    console.log('Saving user data:', data);
    setEditingUser(undefined);
  };

  const handleOpenDialog = (user?: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(undefined);
  };

  if (isLoading) {
    return <DashboardLayout title="قائمة المستخدمين">جاري تحميل البيانات...</DashboardLayout>;
  }

  return (
    <DashboardLayout title="قائمة المستخدمين">
      <div className="flex flex-col space-y-4 p-6 bg-white rounded-lg shadow-lg" dir="rtl">
        {/* شريط الأدوات (بحث وإضافة) */}
        <div className="flex justify-between items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ابحث عن مستخدم بالاسم أو البريد الإلكتروني..."
              value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('name')?.setFilterValue(event.target.value)
              }
              className="pr-10 text-right"
            />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 ml-2" />
                إضافة مستخدم جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] dir-rtl">
              <DialogHeader className="text-right">
                <DialogTitle>{editingUser ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'}</DialogTitle>
              </DialogHeader>
              <UserForm user={editingUser} onSave={handleSave} onClose={handleCloseDialog} />
            </DialogContent>
          </Dialog>
        </div>

        {/* جدول عرض البيانات */}
        <div className="rounded-md border">
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
                      <TableCell key={cell.id}>
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

        {/* أدوات التنقل بين الصفحات (Pagination) */}
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
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            الصفحة{' '}
            <strong>
              {table.getState().pagination.pageIndex + 1} من {table.getPageCount()}
            </strong>
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UsersList;
