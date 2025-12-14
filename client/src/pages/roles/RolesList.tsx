import React, { useState, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';
// استيراد المكونات من shadcn/ui (محاكاة)
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Badge } from '@/components/ui/badge';
// import { MoreHorizontal } from 'lucide-react';

// محاكاة لمكونات shadcn/ui
const Button = ({ children, onClick, variant = 'default', className = '' }: any) => <button className={`p-2 rounded ${className}`} onClick={onClick}>{children}</button>;
const Input = ({ placeholder, value, onChange }: any) => <input className="border p-2 rounded w-full" placeholder={placeholder} value={value} onChange={onChange} />;
const Table = ({ children }: any) => <div className="border rounded-lg overflow-hidden">{children}</div>;
const TableHeader = ({ children }: any) => <thead className="bg-gray-100">{children}</thead>;
const TableBody = ({ children }: any) => <tbody>{children}</tbody>;
const TableRow = ({ children }: any) => <tr className="border-b hover:bg-gray-50">{children}</tr>;
const TableHead = ({ children }: any) => <th className="p-4 text-right font-bold">{children}</th>;
const TableCell = ({ children }: any) => <td className="p-4 text-right">{children}</td>;
const Dialog = ({ children }: any) => <div>{children}</div>;
const DialogTrigger = ({ children }: any) => <span>{children}</span>;
const DialogContent = ({ children }: any) => <div className="bg-white p-6 rounded-lg shadow-xl">{children}</div>;
const DialogHeader = ({ children }: any) => <div className="mb-4">{children}</div>;
const DialogTitle = ({ children }: any) => <h3 className="text-xl font-semibold">{children}</h3>;
const Badge = ({ children }: any) => <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{children}</span>;
const MoreHorizontal = () => <span>...</span>;

// محاكاة لمكون DashboardLayout
const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="p-8" dir="rtl">
    <h1 className="text-3xl font-bold mb-6 text-right">إدارة الأدوار والصلاحيات</h1>
    {children}
  </div>
);

// 1. تعريف هيكل البيانات
interface Role {
  id: string;
  name: string; // اسم الدور
  permissions: string[]; // الصلاحيات
  createdAt: Date;
}

// 2. بيانات وهمية
const mockRoles: Role[] = [
  { id: '1', name: 'مدير النظام', permissions: ['قراءة', 'كتابة', 'حذف', 'تعديل'], createdAt: new Date('2023-01-15') },
  { id: '2', name: 'مشغل محطة', permissions: ['قراءة', 'تعديل'], createdAt: new Date('2023-03-20') },
  { id: '3', name: 'فني صيانة', permissions: ['قراءة', 'كتابة'], createdAt: new Date('2023-05-10') },
  { id: '4', name: 'مراقب', permissions: ['قراءة'], createdAt: new Date('2023-07-01') },
];

// 3. محاكاة اتصال tRPC
// const { data: roles, isLoading } = trpc.roles.list.useQuery();
const useRoles = () => {
  const [isLoading, setIsLoading] = useState(true);
  React.useEffect(() => {
    // محاكاة تأخير الشبكة
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);
  return { data: mockRoles, isLoading };
};

// 4. نموذج لإضافة/تعديل البيانات (RoleForm)
const RoleForm = ({ role, onClose }: { role?: Role, onClose: () => void }) => {
  const [roleName, setRoleName] = useState(role?.name || '');
  const [selectedPermissions, setSelectedPermissions] = useState(role?.permissions || []);
  const isEdit = !!role;

  const allPermissions = ['قراءة', 'كتابة', 'تعديل', 'حذف', 'إدارة المستخدمين', 'إدارة المحطات'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(isEdit ? 'تعديل الدور' : 'إضافة دور جديد', { roleName, selectedPermissions });
    // محاكاة اتصال tRPC للإضافة/التعديل
    onClose();
  };

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'تعديل الدور' : 'إضافة دور جديد'}</DialogTitle>
      </DialogHeader>
      <div>
        <label htmlFor="roleName" className="block text-sm font-medium text-gray-700 mb-1">اسم الدور</label>
        <Input
          id="roleName"
          placeholder="أدخل اسم الدور"
          value={roleName}
          onChange={(e: any) => setRoleName(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">الصلاحيات</label>
        <div className="grid grid-cols-2 gap-2">
          {allPermissions.map(permission => (
            <Button
              key={permission}
              type="button"
              onClick={() => handlePermissionToggle(permission)}
              className={`text-sm ${selectedPermissions.includes(permission) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              {permission}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex justify-end space-x-2 space-x-reverse">
        <Button type="button" onClick={onClose} className="bg-gray-300 text-gray-800">إلغاء</Button>
        <Button type="submit" className="bg-blue-600 text-white">
          {isEdit ? 'حفظ التعديلات' : 'إضافة الدور'}
        </Button>
      </div>
    </form>
  );
};

// 5. تعريف أعمدة TanStack Table
const columns: ColumnDef<Role>[] = [
  {
    accessorKey: 'name',
    header: () => <div className="text-right">اسم الدور</div>,
    cell: ({ row }) => <TableCell>{row.getValue('name')}</TableCell>,
  },
  {
    accessorKey: 'permissions',
    header: () => <div className="text-right">الصلاحيات</div>,
    cell: ({ row }) => (
      <TableCell>
        <div className="flex flex-wrap gap-2 justify-end">
          {(row.getValue('permissions') as string[]).map(permission => (
            <Badge key={permission}>{permission}</Badge>
          ))}
        </div>
      </TableCell>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: () => <div className="text-right">تاريخ الإنشاء</div>,
    cell: ({ row }) => <TableCell>{new Date(row.getValue('createdAt') as Date).toLocaleDateString('ar-EG')}</TableCell>,
  },
  {
    id: 'actions',
    header: () => <div className="text-center">الإجراءات</div>,
    cell: ({ row }) => {
      const role = row.original;
      const [isDialogOpen, setIsDialogOpen] = useState(false);

      const handleDelete = () => {
        if (window.confirm(`هل أنت متأكد من حذف الدور: ${role.name}؟`)) {
          console.log('حذف الدور:', role.id);
          // محاكاة اتصال tRPC للحذف
        }
      };

      return (
        <TableCell className="text-center">
          <div className="flex justify-center space-x-2 space-x-reverse">
            {/* زر التعديل */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-yellow-500 text-white text-sm">تعديل</Button>
              </DialogTrigger>
              <DialogContent>
                <RoleForm role={role} onClose={() => setIsDialogOpen(false)} />
              </DialogContent>
            </Dialog>
            {/* زر الحذف */}
            <Button variant="destructive" onClick={handleDelete} className="bg-red-600 text-white text-sm">حذف</Button>
          </div>
        </TableCell>
      );
    },
  },
];

// 6. المكون الرئيسي لقائمة الأدوار (RolesList)
export const RolesList = () => {
  const { data: roles, isLoading } = useRoles();
  const [globalFilter, setGlobalFilter] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const table = useReactTable({
    data: roles || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  if (isLoading) {
    return <DashboardLayout><div className="text-center py-10" dir="rtl">جاري تحميل الأدوار...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-4" dir="rtl">
        <Input
          placeholder="ابحث عن دور..."
          value={globalFilter ?? ''}
          onChange={(e: any) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 text-white">إضافة دور جديد</Button>
          </DialogTrigger>
          <DialogContent>
            <RoleForm onClose={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border" dir="rtl">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  لا توجد أدوار لعرضها.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 space-x-reverse py-4" dir="rtl">
        <Button
          variant="outline"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="bg-gray-200"
        >
          السابق
        </Button>
        <Button
          variant="outline"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="bg-gray-200"
        >
          التالي
        </Button>
        <span className="flex items-center gap-1 text-sm">
          الصفحة
          <strong>
            {table.getState().pagination.pageIndex + 1} من {table.getPageCount()}
          </strong>
        </span>
      </div>
    </DashboardLayout>
  );
};

export default RolesList;
