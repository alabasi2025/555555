import React, { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import DashboardLayout from "@/components/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Edit, Trash2, Calendar, Clock, Search } from "lucide-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// 1. تعريف نوع البيانات (Mock Type)
interface MaintenanceSchedule {
  id: string;
  stationName: string;
  equipment: string;
  scheduleDate: string; // تاريخ الصيانة
  status: 'مجدولة' | 'قيد التنفيذ' | 'مكتملة' | 'ملغاة';
  technician: string;
}

// 2. محاكاة بيانات tRPC (Mock tRPC Data)
// في التطبيق الحقيقي، سيتم استبدال هذا بـ api.maintenance.getSchedules.useQuery()
const mockSchedules: MaintenanceSchedule[] = [
  { id: '1', stationName: 'محطة الرياض 1', equipment: 'توربين غازي #3', scheduleDate: '2025-12-20', status: 'مجدولة', technician: 'أحمد علي' },
  { id: '2', stationName: 'محطة جدة 2', equipment: 'مولد ديزل احتياطي', scheduleDate: '2025-12-25', status: 'قيد التنفيذ', technician: 'فاطمة محمد' },
  { id: '3', stationName: 'محطة الدمام 3', equipment: 'نظام تبريد رئيسي', scheduleDate: '2025-12-15', status: 'مكتملة', technician: 'خالد سعيد' },
  { id: '4', stationName: 'محطة الرياض 1', equipment: 'محول كهربائي', scheduleDate: '2026-01-05', status: 'مجدولة', technician: 'أحمد علي' },
];

// 3. محاكاة tRPC للاتصال بالـ API
// في التطبيق الحقيقي، سيتم استخدام tRPC hooks مثل useQuery و useMutation
const useMaintenanceSchedules = () => {
  // محاكاة استعلام tRPC
  // const { data, isLoading } = api.maintenance.getSchedules.useQuery();
  const data = mockSchedules;
  const isLoading = false;
  return { data, isLoading };
};

const useAddOrUpdateSchedule = () => {
  // محاكاة طفرة tRPC
  // const mutation = api.maintenance.addOrUpdateSchedule.useMutation();
  const mutate = (schedule: MaintenanceSchedule) => {
    console.log('Mock tRPC Mutate:', schedule);
    // منطق تحديث الواجهة الأمامية هنا
  };
  const isLoading = false;
  return { mutate, isLoading };
};

const useDeleteSchedule = () => {
  // محاكاة طفرة tRPC
  // const mutation = api.maintenance.deleteSchedule.useMutation();
  const mutate = (id: string) => {
    console.log('Mock tRPC Delete:', id);
    // منطق تحديث الواجهة الأمامية هنا
  };
  const isLoading = false;
  return { mutate, isLoading };
};

// 4. نموذج لإضافة/تعديل البيانات (Add/Edit Form Component)
interface ScheduleFormProps {
  schedule?: MaintenanceSchedule;
  onSave: (data: MaintenanceSchedule) => void;
  onClose: () => void;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ schedule, onSave, onClose }) => {
  const [formData, setFormData] = useState<MaintenanceSchedule>(
    schedule || {
      id: '',
      stationName: '',
      equipment: '',
      scheduleDate: '',
      status: 'مجدولة',
      technician: '',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string, id: keyof MaintenanceSchedule) => {
    setFormData(prev => ({ ...prev, [id]: value as any }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: formData.id || Date.now().toString() }); // توليد ID مؤقت
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stationName">اسم المحطة</Label>
          <Input id="stationName" value={formData.stationName} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="equipment">المعدة/الجهاز</Label>
          <Input id="equipment" value={formData.equipment} onChange={handleChange} required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="scheduleDate">تاريخ الصيانة</Label>
          <Input id="scheduleDate" type="date" value={formData.scheduleDate} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="technician">الفني المسؤول</Label>
          <Input id="technician" value={formData.technician} onChange={handleChange} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">الحالة</Label>
        <Select value={formData.status} onValueChange={(value) => handleSelectChange(value, 'status')}>
          <SelectTrigger id="status">
            <SelectValue placeholder="اختر حالة الصيانة" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            <SelectItem value="مجدولة">مجدولة</SelectItem>
            <SelectItem value="قيد التنفيذ">قيد التنفيذ</SelectItem>
            <SelectItem value="مكتملة">مكتملة</SelectItem>
            <SelectItem value="ملغاة">ملغاة</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {schedule ? 'حفظ التعديلات' : 'إضافة جدول صيانة'}
        </Button>
      </DialogFooter>
    </form>
  );
};

// 3. جدول لعرض البيانات باستخدام TanStack Table
const columns: ColumnDef<MaintenanceSchedule>[] = [
  {
    accessorKey: "stationName",
    header: "اسم المحطة",
    cell: ({ row }) => <div className="text-right">{row.original.stationName}</div>,
  },
  {
    accessorKey: "equipment",
    header: "المعدة/الجهاز",
    cell: ({ row }) => <div className="text-right">{row.original.equipment}</div>,
  },
  {
    accessorKey: "scheduleDate",
    header: () => <div className="text-right">تاريخ الصيانة</div>,
    cell: ({ row }) => {
      const date = new Date(row.original.scheduleDate).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      return <div className="text-right font-medium flex items-center justify-end space-x-1 rtl:space-x-reverse"><Calendar className="w-4 h-4 ml-1" /><span>{date}</span></div>;
    },
  },
  {
    accessorKey: "technician",
    header: "الفني المسؤول",
    cell: ({ row }) => <div className="text-right">{row.original.technician}</div>,
  },
  {
    accessorKey: "status",
    header: "الحالة",
    cell: ({ row }) => {
      const status = row.original.status;
      let color = 'bg-gray-100 text-gray-800';
      if (status === 'مجدولة') color = 'bg-blue-100 text-blue-800';
      if (status === 'قيد التنفيذ') color = 'bg-yellow-100 text-yellow-800';
      if (status === 'مكتملة') color = 'bg-green-100 text-green-800';
      if (status === 'ملغاة') color = 'bg-red-100 text-red-800';

      return (
        <div className={`text-center p-1 rounded-full text-xs font-medium ${color} w-24 mx-auto`}>
          {status}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">الإجراءات</div>,
    cell: ({ row }) => {
      const schedule = row.original;
      const { mutate: deleteMutate } = useDeleteSchedule();
      const { mutate: updateMutate } = useAddOrUpdateSchedule();
      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

      const handleDelete = () => {
        if (window.confirm(`هل أنت متأكد من حذف جدول الصيانة للمعدة ${schedule.equipment}؟`)) {
          deleteMutate(schedule.id);
        }
      };

      const handleUpdate = (data: MaintenanceSchedule) => {
        updateMutate(data);
        setIsEditDialogOpen(false);
      };

      return (
        <div className="text-center">
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">فتح القائمة</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="ml-2 h-4 w-4" />
                    تعديل
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]" dir="rtl">
                  <DialogHeader>
                    <DialogTitle className="text-right">تعديل جدول الصيانة</DialogTitle>
                  </DialogHeader>
                  <ScheduleForm schedule={schedule} onSave={handleUpdate} onClose={() => setIsEditDialogOpen(false)} />
                </DialogContent>
              </Dialog>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                <Trash2 className="ml-2 h-4 w-4" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

// المكون الرئيسي
export default function MaintenanceSchedulePage() {
  const { data: schedules, isLoading } = useMaintenanceSchedules();
  const { mutate: addMutate } = useAddOrUpdateSchedule();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data: schedules || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const handleAdd = (data: MaintenanceSchedule) => {
    addMutate(data);
    setIsAddDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header and Add Button */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">جدول الصيانة</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <PlusCircle className="ml-2 h-4 w-4" />
                إضافة جدول صيانة جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">إضافة جدول صيانة جديد</DialogTitle>
              </DialogHeader>
              <ScheduleForm onSave={handleAdd} onClose={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">الصيانة المجدولة القادمة</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search Input */}
            <div className="flex items-center py-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="ابحث في الجداول..."
                  value={globalFilter ?? ''}
                  onChange={(event) => setGlobalFilter(event.target.value)}
                  className="w-full pr-10 text-right"
                />
              </div>
            </div>

            {/* Table */}
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
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        جاري تحميل البيانات...
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
                        لا توجد جداول صيانة.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4 rtl:space-x-reverse">
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
