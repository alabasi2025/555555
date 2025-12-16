import React, { useState } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'; // افتراض وجود مسار shadcn/ui
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/DashboardLayout'; // استخدام DashboardLayout

// 1. تعريف نوع البيانات (Mock)
interface Subscription {
  id: string;
  name: string; // اسم الاشتراك
  status: 'active' | 'inactive' | 'pending'; // حالة الاشتراك
  startDate: string; // تاريخ البدء
  endDate: string; // تاريخ الانتهاء
  powerStation: string; // محطة الكهرباء المرتبطة
}

// 2. محاكاة اتصال tRPC
// في بيئة حقيقية، سيتم استبدال هذا بـ:
// const { data: subscriptions, isLoading, error } = trpc.subscriptions.list.useQuery();
const useSubscriptions = () => {
  const mockData: Subscription[] = [
    {
      id: 'sub-001',
      name: 'اشتراك المصنع أ',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2025-01-01',
      powerStation: 'محطة الشمال 1',
    },
    {
      id: 'sub-002',
      name: 'اشتراك المجمع السكني',
      status: 'pending',
      startDate: '2024-12-15',
      endDate: '2025-12-15',
      powerStation: 'محطة الجنوب 3',
    },
    {
      id: 'sub-003',
      name: 'اشتراك المتجر الكبير',
      status: 'inactive',
      startDate: '2023-05-20',
      endDate: '2024-05-20',
      powerStation: 'محطة الوسط 2',
    },
  ];
  return { data: mockData, isLoading: false, error: null };
};

// 4. نموذج لإضافة/تعديل البيانات (Mock Component)
const SubscriptionForm: React.FC<{ subscription?: Subscription; onClose: () => void }> = ({
  subscription,
  onClose,
}) => {
  const isEdit = !!subscription;
  const title = isEdit ? 'تعديل بيانات الاشتراك' : 'إضافة اشتراك جديد';

  // محاكاة لـ tRPC mutation
  // const mutation = isEdit ? trpc.subscriptions.update.useMutation() : trpc.subscriptions.create.useMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // هنا يتم استدعاء mutation.mutate(...)
    console.log(isEdit ? 'تعديل الاشتراك' : 'إضافة اشتراك', subscription?.id);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="grid gap-2">
        <Label htmlFor="name">اسم الاشتراك</Label>
        <Input id="name" defaultValue={subscription?.name || ''} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="powerStation">محطة الكهرباء</Label>
        <Input id="powerStation" defaultValue={subscription?.powerStation || ''} required />
      </div>
      {/* يمكن إضافة المزيد من الحقول هنا */}
      <Button type="submit" className="w-full">
        {isEdit ? 'حفظ التعديلات' : 'إضافة الاشتراك'}
      </Button>
    </form>
  );
};

// 3. تعريف أعمدة TanStack Table
const columns: ColumnDef<Subscription>[] = [
  {
    accessorKey: 'name',
    header: 'اسم الاشتراك',
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'powerStation',
    header: 'محطة الكهرباء',
  },
  {
    accessorKey: 'startDate',
    header: 'تاريخ البدء',
  },
  {
    accessorKey: 'endDate',
    header: 'تاريخ الانتهاء',
  },
  {
    accessorKey: 'status',
    header: 'الحالة',
    cell: ({ row }) => {
      const status = row.getValue('status') as Subscription['status'];
      const statusMap = {
        active: { text: 'نشط', variant: 'default' },
        inactive: { text: 'غير نشط', variant: 'destructive' },
        pending: { text: 'قيد الانتظار', variant: 'secondary' },
      };
      const { text, variant } = statusMap[status] || { text: 'غير معروف', variant: 'outline' };
      return <Badge variant={variant as any}>{text}</Badge>;
    },
  },
  {
    id: 'actions',
    header: 'الإجراءات',
    cell: ({ row }) => {
      const subscription = row.original;
      const [isDialogOpen, setIsDialogOpen] = useState(false);

      const handleDelete = () => {
        if (window.confirm(`هل أنت متأكد من حذف الاشتراك: ${subscription.name}?`)) {
          // هنا يتم استدعاء tRPC mutation للحذف
          console.log('حذف الاشتراك:', subscription.id);
        }
      };

      return (
        <div className="flex space-x-2 space-x-reverse">
          {/* 5. أزرار التعديل والحذف */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                تعديل
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>تعديل الاشتراك</DialogTitle>
              </DialogHeader>
              <SubscriptionForm subscription={subscription} onClose={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            حذف
          </Button>
        </div>
      );
    },
  },
];

// 6. و 7. التصميم الاحترافي باللغة العربية واستخدام DashboardLayout
const SubscriptionsList: React.FC = () => {
  const { data: subscriptions, isLoading, error } = useSubscriptions();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const table = useReactTable({
    data: subscriptions || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <DashboardLayout title="قائمة الاشتراكات">جاري تحميل البيانات...</DashboardLayout>;
  }

  if (error) {
    return <DashboardLayout title="قائمة الاشتراكات">حدث خطأ: {error.message}</DashboardLayout>;
  }

  return (
    <DashboardLayout title="قائمة الاشتراكات">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">إدارة الاشتراكات</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>إضافة اشتراك جديد</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة اشتراك جديد</DialogTitle>
            </DialogHeader>
            <SubscriptionForm onClose={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table dir="rtl"> {/* تحديد اتجاه الجدول ليتناسب مع اللغة العربية */}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
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
                  لا توجد اشتراكات.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionsList;
