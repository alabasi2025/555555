import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Loader2, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout'; // افتراض وجود هذا المكون

// 1. تعريف نموذج البيانات
interface Category {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  createdAt: string;
}

// 2. تعريف مخطط التحقق من الصحة (Validation Schema)
const categorySchema = z.object({
  name: z.string().min(3, { message: 'يجب أن لا يقل اسم الصنف عن 3 أحرف.' }),
  description: z.string().max(500, { message: 'الحد الأقصى للوصف هو 500 حرف.' }).optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

// 3. بيانات وهمية (Mock Data)
const initialCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'قطع غيار توربينات الغاز',
    description: 'جميع القطع المتعلقة بصيانة وتشغيل توربينات الغاز.',
    itemCount: 150,
    createdAt: '2024-01-10',
  },
  {
    id: 'cat-2',
    name: 'معدات السلامة',
    description: 'معدات الحماية الشخصية وأدوات السلامة في الموقع.',
    itemCount: 45,
    createdAt: '2024-03-22',
  },
  {
    id: 'cat-3',
    name: 'زيوت ومواد تشحيم',
    description: 'الزيوت والمواد الكيميائية اللازمة لتشغيل المحطات.',
    itemCount: 80,
    createdAt: '2023-11-01',
  },
];

// 4. مكون نموذج الإضافة/التعديل
interface CategoryFormProps {
  initialData?: Category;
  onSave: (data: CategoryFormValues) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  initialData,
  onSave,
  onClose,
  isLoading,
}) => {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData || { name: '', description: '' },
  });

  const onSubmit = async (data: CategoryFormValues) => {
    await onSave(data);
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم الصنف</FormLabel>
              <FormControl>
                <Input placeholder="مثال: قطع غيار التوربينات" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الوصف (اختياري)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="وصف مختصر للصنف"
                  className="resize-none"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : initialData ? (
              'حفظ التعديلات'
            ) : (
              'إنشاء الصنف'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// 5. مكون قائمة الأصناف الرئيسية
const CategoriesList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // محاكاة استدعاء API
  const simulateApiCall = (delay = 1000) =>
    new Promise((resolve) => setTimeout(resolve, delay));

  // عمليات CRUD
  const handleSave = async (data: CategoryFormValues) => {
    setIsLoading(true);
    try {
      await simulateApiCall(); // محاكاة POST/PUT
      if (selectedCategory) {
        // تحديث
        setCategories((prev) =>
          prev.map((cat) => (cat.id === selectedCategory.id ? { ...cat, ...data } : cat))
        );
        toast({
          title: 'تم التحديث بنجاح',
          description: `تم تحديث الصنف "${data.name}".`,
        });
      } else {
        // إنشاء
        const newCategory: Category = {
          id: `cat-${Date.now()}`,
          ...data,
          itemCount: 0,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setCategories((prev) => [newCategory, ...prev]);
        toast({
          title: 'تم الإنشاء بنجاح',
          description: `تم إنشاء الصنف "${data.name}".`,
        });
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ البيانات.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
      setSelectedCategory(undefined);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الصنف؟')) return;

    setIsLoading(true);
    try {
      await simulateApiCall(); // محاكاة DELETE
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      toast({
        title: 'تم الحذف بنجاح',
        description: 'تم حذف الصنف المحدد.',
      });
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حذف الصنف.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (category?: Category) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  // 6. تعريف أعمدة الجدول
  const columns: ColumnDef<Category>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'اسم الصنف',
        cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
      },
      {
        accessorKey: 'description',
        header: 'الوصف',
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground line-clamp-1">
            {row.original.description || 'لا يوجد وصف'}
          </div>
        ),
      },
      {
        accessorKey: 'itemCount',
        header: 'عدد الأصناف',
        cell: ({ row }) => (
          <div className="text-center font-mono">{row.original.itemCount}</div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'تاريخ الإنشاء',
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString('ar-EG')}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'الإجراءات',
        cell: ({ row }) => (
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">فتح القائمة</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleOpenDialog(row.original)}
                className="cursor-pointer"
              >
                <Edit className="ml-2 h-4 w-4" />
                تعديل
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(row.original.id)}
                className="cursor-pointer text-red-600 focus:text-red-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="ml-2 h-4 w-4" />
                )}
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [isLoading]
  );

  // 7. عرض حالة التحميل/الخطأ (Loading/Error States)
  if (isLoading && categories.length === 0) {
    return (
      <DashboardLayout title="قائمة الأصناف">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="mr-2 text-lg">جاري تحميل الأصناف...</span>
        </div>
      </DashboardLayout>
    );
  }

  // 8. المكون الرئيسي
  return (
    <DashboardLayout title="قائمة الأصناف" description="إدارة وتصنيف أصناف المخزون في النظام.">
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenDialog()} disabled={isLoading}>
          <PlusCircle className="ml-2 h-4 w-4" />
          إضافة صنف جديد
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table dir="rtl">
          <TableHeader>
            {/* هنا يجب استخدام مكون DataTable من shadcn/ui ولكن لتبسيط الكود سأستخدم مكون Table الأساسي */}
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.accessorKey || column.id} className="text-right">
                  {column.header as React.ReactNode}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length ? (
              categories.map((category) => (
                <TableRow key={category.id}>
                  {columns.map((column) => (
                    <TableCell key={column.accessorKey || column.id}>
                      {column.cell({ row: { original: category } } as any)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  لا توجد أصناف مسجلة حالياً.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* مكون الحوار (Dialog) للإضافة والتعديل */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? 'تعديل الصنف' : 'إضافة صنف جديد'}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            initialData={selectedCategory}
            onSave={handleSave}
            onClose={() => setIsDialogOpen(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CategoriesList;

// ملاحظة: تم افتراض وجود المكونات التالية في المسارات المحددة:
// - '@/components/ui/table'
// - '@/components/ui/button'
// - '@/components/ui/input'
// - '@/components/ui/textarea'
// - '@/components/ui/dialog'
// - '@/components/ui/form'
// - '@/components/ui/dropdown-menu'
// - '@/components/ui/use-toast'
// - '@/components/layout/DashboardLayout'
// - '@hookform/resolvers/zod'
// - 'zod'
// - '@tanstack/react-table'
