import React, { useMemo, useState } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ArrowUpDown, Edit, Trash2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
// افتراض وجود هذا المكون في مسار مناسب
import DashboardLayout from '@/components/DashboardLayout'; 
// افتراض وجود إعداد tRPC في هذا المسار
import { api } from '@/lib/trpc'; 

// -----------------------------------------------------------------------------
// 1. تعريف أنواع البيانات
// -----------------------------------------------------------------------------

interface Meter {
  id: string;
  name: string;
  location: string;
  lastReading: number;
  unit: string;
  status: 'active' | 'inactive' | 'maintenance';
}

// -----------------------------------------------------------------------------
// 2. مكون نموذج الإضافة/التعديل (MeterForm)
// -----------------------------------------------------------------------------

interface MeterFormProps {
  meter?: Meter;
  onSave: (data: Omit<Meter, 'id'>) => void;
  onClose: () => void;
}

const MeterForm: React.FC<MeterFormProps> = ({ meter, onSave, onClose }) => {
  const [formData, setFormData] = useState<Omit<Meter, 'id'>>(
    meter || {
      name: '',
      location: '',
      lastReading: 0,
      unit: 'kWh',
      status: 'active',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: id === 'lastReading' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4" dir="rtl">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          اسم العداد
        </Label>
        <Input id="name" value={formData.name} onChange={handleChange} className="col-span-3 text-right" required />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="location" className="text-right">
          الموقع
        </Label>
        <Input id="location" value={formData.location} onChange={handleChange} className="col-span-3 text-right" required />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="lastReading" className="text-right">
          آخر قراءة
        </Label>
        <Input
          id="lastReading"
          type="number"
          value={formData.lastReading}
          onChange={handleChange}
          className="col-span-3 text-right"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="unit" className="text-right">
          الوحدة
        </Label>
        <Input id="unit" value={formData.unit} onChange={handleChange} className="col-span-3 text-right" required />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="status" className="text-right">
          الحالة
        </Label>
        <select
          id="status"
          value={formData.status}
          onChange={handleChange}
          className="col-span-3 p-2 border rounded-md text-right"
        >
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
          <option value="maintenance">صيانة</option>
        </select>
      </div>
      <Button type="submit" className="mt-4">
        {meter ? 'حفظ التعديلات' : 'إضافة العداد'}
      </Button>
    </form>
  );
};

// -----------------------------------------------------------------------------
// 3. مكون قائمة العدادات (MetersList)
// -----------------------------------------------------------------------------

const MetersList: React.FC = () => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeter, setEditingMeter] = useState<Meter | undefined>(undefined);

  // 2. استخدام tRPC للاتصال بالـ API (Mock/Placeholder)
  // افتراض وجود hook لاسترجاع القائمة
  const { data: meters, isLoading, refetch } = api.meter.list.useQuery();
  // افتراض وجود hook للحذف
  const deleteMutation = api.meter.delete.useMutation({
    onSuccess: () => {
      toast({ title: 'نجاح', description: 'تم حذف العداد بنجاح.' });
      refetch();
    },
    onError: (error) => {
      toast({ title: 'خطأ', description: `فشل الحذف: ${error.message}`, variant: 'destructive' });
    },
  });
  // افتراض وجود hook للإضافة/التعديل
  const saveMutation = api.meter.save.useMutation({
    onSuccess: () => {
      toast({ title: 'نجاح', description: 'تم حفظ بيانات العداد بنجاح.' });
      refetch();
    },
    onError: (error) => {
      toast({ title: 'خطأ', description: `فشل الحفظ: ${error.message}`, variant: 'destructive' });
    },
  });

  const handleSave = (data: Omit<Meter, 'id'>) => {
    // في بيئة حقيقية، سيتم تمرير البيانات إلى saveMutation
    // saveMutation.mutate({ id: editingMeter?.id, ...data });
    console.log('Saving data:', data, 'for meter ID:', editingMeter?.id);
    setEditingMeter(undefined);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العداد؟')) {
      // في بيئة حقيقية، سيتم استدعاء deleteMutation
      // deleteMutation.mutate({ id });
      console.log('Deleting meter with ID:', id);
    }
  };

  const handleEdit = (meter: Meter) => {
    setEditingMeter(meter);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingMeter(undefined);
    setIsFormOpen(true);
  };

  // 3. جدول لعرض البيانات باستخدام TanStack Table
  const columns: ColumnDef<Meter>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="text-right w-full justify-end"
          >
            اسم العداد
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="text-right">{row.getValue('name')}</div>,
      },
      {
        accessorKey: 'location',
        header: () => <div className="text-right">الموقع</div>,
        cell: ({ row }) => <div className="text-right">{row.getValue('location')}</div>,
      },
      {
        accessorKey: 'lastReading',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="text-right w-full justify-end"
          >
            آخر قراءة
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const meter = row.original;
          return (
            <div className="text-right font-medium">
              {meter.lastReading.toFixed(2)} {meter.unit}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: () => <div className="text-right">الحالة</div>,
        cell: ({ row }) => {
          const status = row.getValue('status') as Meter['status'];
          const statusText = {
            active: 'نشط',
            inactive: 'غير نشط',
            maintenance: 'صيانة',
          }[status];
          return <div className="text-right">{statusText}</div>;
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-center">الإجراءات</div>,
        cell: ({ row }) => (
          <div className="flex justify-center space-x-2 space-x-reverse">
            {/* 5. أزرار للحذف والتعديل */}
            <Button variant="outline" size="icon" onClick={() => handleEdit(row.original)} title="تعديل">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={() => handleDelete(row.original.id)} title="حذف">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: meters || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    // إضافة دعم للفرز
    manualSorting: false,
  });

  // 7. استخدام DashboardLayout
  return (
    <DashboardLayout title="قائمة العدادات" description="إدارة وعرض جميع عدادات نظام محطات الكهرباء">
      <div className="p-6" dir="rtl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">قائمة العدادات</h1>
          {/* 4. نموذج لإضافة/تعديل البيانات (زر الإضافة) */}
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAdd}>
                <PlusCircle className="ml-2 h-4 w-4" />
                إضافة عداد جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">{editingMeter ? 'تعديل العداد' : 'إضافة عداد جديد'}</DialogTitle>
              </DialogHeader>
              <MeterForm
                meter={editingMeter}
                onSave={handleSave}
                onClose={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border">
          {isLoading ? (
            <div className="p-4 text-center">جاري تحميل البيانات...</div>
          ) : (
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="text-right">
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
                      لا توجد عدادات لعرضها.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MetersList;
