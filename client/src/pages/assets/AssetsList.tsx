import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/components/DashboardLayout'; // استخدام DashboardLayout
import { Edit, Trash2, PlusCircle } from 'lucide-react';

// 1. تعريف أنواع البيانات (Mock Data/Types)
interface Asset {
  id: string;
  name: string;
  location: string;
  status: 'Active' | 'Maintenance' | 'Decommissioned';
  lastMaintenance: string;
}

// 2. محاكاة جلب البيانات باستخدام tRPC
// في بيئة حقيقية، سيتم استخدام: const { data: assets, isLoading } = trpc.assets.list.useQuery();
const useAssetsQuery = () => {
  const mockAssets: Asset[] = [
    { id: 'A001', name: 'توربين غازي 1', location: 'المحطة أ - الوحدة 1', status: 'Active', lastMaintenance: '2024-10-01' },
    { id: 'A002', name: 'مولد كهربائي 2', location: 'المحطة أ - الوحدة 2', status: 'Maintenance', lastMaintenance: '2024-09-15' },
    { id: 'A003', name: 'محول رئيسي 3', location: 'المحطة ب - الوحدة 3', status: 'Active', lastMaintenance: '2024-11-20' },
    { id: 'A004', name: 'نظام تبريد 4', location: 'المحطة ب - الوحدة 4', status: 'Decommissioned', lastMaintenance: '2023-05-10' },
  ];
  return { data: mockAssets, isLoading: false };
};

// 3. تعريف أعمدة الجدول (TanStack Table) باللغة العربية
const columns: ColumnDef<Asset>[] = [
  {
    accessorKey: 'id',
    header: 'معرف الأصل',
  },
  {
    accessorKey: 'name',
    header: 'اسم الأصل',
  },
  {
    accessorKey: 'location',
    header: 'الموقع',
  },
  {
    accessorKey: 'status',
    header: 'الحالة',
    cell: ({ row }) => {
      const status = row.getValue('status');
      let color = 'text-green-500';
      if (status === 'Maintenance') color = 'text-yellow-500';
      if (status === 'Decommissioned') color = 'text-red-500';
      return <span className={color}>{status === 'Active' ? 'نشط' : status === 'Maintenance' ? 'صيانة' : 'خارج الخدمة'}</span>;
    },
  },
  {
    accessorKey: 'lastMaintenance',
    header: 'آخر صيانة',
  },
  {
    id: 'actions',
    header: 'الإجراءات',
    cell: ({ row }) => {
      const asset = row.original;

      // 5. أزرار للحذف والتعديل
      const handleEdit = () => {
        console.log('تعديل الأصل:', asset.id);
        // هنا يتم فتح نموذج التعديل
      };

      const handleDelete = () => {
        console.log('حذف الأصل:', asset.id);
        // هنا يتم استدعاء tRPC لحذف الأصل
      };

      return (
        <div className="flex space-x-2 space-x-reverse">
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
];

// 4. نموذج لإضافة/تعديل البيانات (Mock Form Component)
const AssetForm = ({ asset }: { asset?: Asset }) => {
  const isEdit = !!asset;
  const [assetName, setAssetName] = useState(asset?.name || '');
  const [assetLocation, setAssetLocation] = useState(asset?.location || '');

  const handleSubmit = () => {
    if (isEdit) {
      console.log('حفظ التعديلات:', { id: asset.id, name: assetName, location: assetLocation });
      // هنا يتم استدعاء tRPC للتعديل
    } else {
      console.log('إضافة أصل جديد:', { name: assetName, location: assetLocation });
      // هنا يتم استدعاء tRPC للإضافة
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader className="text-right">
        <DialogTitle>{isEdit ? 'تعديل الأصل' : 'إضافة أصل جديد'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'قم بتعديل بيانات الأصل المحدد.' : 'قم بإدخال بيانات الأصل الجديد لنظام إدارة محطات الكهرباء.'}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            اسم الأصل
          </Label>
          <Input
            id="name"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            className="col-span-3 text-right"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="location" className="text-right">
            الموقع
          </Label>
          <Input
            id="location"
            value={assetLocation}
            onChange={(e) => setAssetLocation(e.target.value)}
            className="col-span-3 text-right"
          />
        </div>
      </div>
      <DialogFooter className="sm:justify-start">
        <Button type="submit" onClick={handleSubmit}>
          {isEdit ? 'حفظ التعديلات' : 'إضافة الأصل'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

// 7. استخدام DashboardLayout وتجميع المكونات
const AssetsList = () => {
  const { data: assets, isLoading } = useAssetsQuery(); // استخدام محاكاة tRPC

  const table = useReactTable({
    data: assets || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
    return <DashboardLayout title="قائمة الأصول">جاري تحميل البيانات...</DashboardLayout>;
  }

  return (
    <DashboardLayout title="قائمة الأصول">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">إدارة أصول محطات الكهرباء</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 ml-2" />
              إضافة أصل جديد
            </Button>
          </DialogTrigger>
          <AssetForm />
        </Dialog>
      </div>

      {/* 3. جدول لعرض البيانات باستخدام TanStack Table و shadcn/ui */}
      <div className="rounded-md border">
        <Table dir="rtl"> {/* 6. تصميم احترافي باللغة العربية - استخدام dir="rtl" */}
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
                    <TableCell key={cell.id} className="text-right">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  لا توجد أصول لعرضها.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
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
      </div>
    </DashboardLayout>
  );
};

export default AssetsList;
