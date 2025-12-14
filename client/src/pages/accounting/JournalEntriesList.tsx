// @ts-nocheck
// JournalEntriesList.tsx
// هذا المكون هو واجهة قائمة القيود اليومية (Journal Entries List)
// تم تطويره باستخدام React 19, TypeScript, shadcn/ui, و Tailwind CSS 4.
// يدعم اللغة العربية (RTL) بالكامل.

import React, { useState, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table';
import { ArrowUpDown, Search, Plus, Edit, Eye, Trash2, MoreHorizontal, Filter } from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// 1. تعريف الهياكل (Interfaces)
// -----------------------------------------------------------------------------

/** يمثل سطرًا واحدًا في القيد المحاسبي (مدين أو دائن) */
export interface JournalEntryLine {
  id: string;
  accountId: string;
  accountName: string; // اسم الحساب (مثل: الصندوق، العملاء)
  debit: number; // المبلغ المدين
  credit: number; // المبلغ الدائن
  description: string; // وصف السطر
}

/** يمثل القيد المحاسبي اليومي الكامل */
export interface JournalEntry {
  id: string;
  date: string; // تاريخ القيد (YYYY-MM-DD)
  description: string; // وصف القيد العام
  reference: string; // رقم مرجعي (مثل: رقم الفاتورة)
  totalDebit: number;
  totalCredit: number;
  status: 'Draft' | 'Posted' | 'Reversed'; // حالة القيد
  lines: JournalEntryLine[];
}

// 2. البيانات التجريبية (Mock Data)
// -----------------------------------------------------------------------------

const MOCK_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'JE-2024-0001',
    date: '2024-10-01',
    description: 'تسجيل فاتورة مبيعات رقم 1001',
    reference: 'INV-1001',
    totalDebit: 5000.00,
    totalCredit: 5000.00,
    status: 'Posted',
    lines: [
      { id: 'L1', accountId: '1210', accountName: 'العملاء', debit: 5000.00, credit: 0, description: 'استحقاق مبلغ الفاتورة' },
      { id: 'L2', accountId: '4100', accountName: 'إيرادات المبيعات', debit: 0, credit: 4500.00, description: 'قيمة المبيعات' },
      { id: 'L3', accountId: '2300', accountName: 'ضريبة القيمة المضافة', debit: 0, credit: 500.00, description: 'ضريبة المبيعات' },
    ],
  },
  {
    id: 'JE-2024-0002',
    date: '2024-10-05',
    description: 'دفع إيجار المكتب لشهر أكتوبر',
    reference: 'PAY-1002',
    totalDebit: 2500.00,
    totalCredit: 2500.00,
    status: 'Posted',
    lines: [
      { id: 'L4', accountId: '6100', accountName: 'مصروف الإيجار', debit: 2500.00, credit: 0, description: 'إيجار شهر أكتوبر' },
      { id: 'L5', accountId: '1110', accountName: 'الصندوق', debit: 0, credit: 2500.00, description: 'دفع نقدي' },
    ],
  },
  {
    id: 'JE-2024-0003',
    date: '2024-10-10',
    description: 'إيداع نقدي في البنك',
    reference: 'DEP-001',
    totalDebit: 10000.00,
    totalCredit: 10000.00,
    status: 'Draft',
    lines: [
      { id: 'L6', accountId: '1120', accountName: 'البنك', debit: 10000.00, credit: 0, description: 'إيداع من الصندوق' },
      { id: 'L7', accountId: '1110', accountName: 'الصندوق', debit: 0, credit: 10000.00, description: 'سحب نقدي للإيداع' },
    ],
  },
  {
    id: 'JE-2024-0004',
    date: '2024-10-15',
    description: 'قيد تسوية لمصروفات مستحقة',
    reference: 'ADJ-001',
    totalDebit: 800.00,
    totalCredit: 800.00,
    status: 'Reversed',
    lines: [
      { id: 'L8', accountId: '6200', accountName: 'مصروفات مستحقة', debit: 800.00, credit: 0, description: 'تسجيل مصروف مستحق' },
      { id: 'L9', accountId: '2200', accountName: 'موردون', debit: 0, credit: 800.00, description: 'تسجيل التزام' },
    ],
  },
];

// 3. تعريف مخطط التحقق (Validation Schema) لنموذج الإدخال
// -----------------------------------------------------------------------------

const JournalEntryLineSchema = z.object({
  accountId: z.string().min(1, { message: 'يجب اختيار حساب.' }),
  accountName: z.string(), // سيتم ملؤه تلقائيًا
  debit: z.number().min(0, { message: 'يجب أن يكون المبلغ المدين موجبًا.' }),
  credit: z.number().min(0, { message: 'يجب أن يكون المبلغ الدائن موجبًا.' }),
  // يجب أن يكون أحد الحقلين (مدين أو دائن) أكبر من صفر والآخر صفر
}).refine(data => (data.debit > 0 && data.credit === 0) || (data.credit > 0 && data.debit === 0), {
  message: 'يجب إدخال مبلغ في حقل المدين أو الدائن فقط.',
  path: ['debit'],
});

const JournalEntryFormSchema = z.object({
  date: z.string().min(1, { message: 'التاريخ مطلوب.' }),
  description: z.string().min(5, { message: 'الوصف مطلوب ولا يقل عن 5 أحرف.' }),
  reference: z.string().optional(),
  status: z.enum(['Draft', 'Posted', 'Reversed'], {
    required_error: 'حالة القيد مطلوبة.',
  }),
  lines: z.array(JournalEntryLineSchema).min(2, { message: 'يجب أن يحتوي القيد على سطرين على الأقل.' }),
}).refine(data => {
  const totalDebit = data.lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = data.lines.reduce((sum, line) => sum + line.credit, 0);
  return totalDebit === totalCredit;
}, {
  message: 'يجب أن يتساوى إجمالي المدين مع إجمالي الدائن.',
  path: ['lines'], // يمكن أن يشير إلى حقل معين أو إلى النموذج بأكمله
});

type JournalEntryFormValues = z.infer<typeof JournalEntryFormSchema>;

// 4. مكونات مساعدة (Helper Components)
// -----------------------------------------------------------------------------

// مكون لعرض تفاصيل القيد (View/Edit Dialog)
const JournalEntryDetailsDialog: React.FC<{ entry: JournalEntry; isEdit: boolean; onSave: (data: JournalEntryFormValues) => void }> = ({ entry, isEdit, onSave }) => {
  const form = useForm<JournalEntryFormValues>({
    resolver: zodResolver(JournalEntryFormSchema),
    defaultValues: {
      date: entry.date,
      description: entry.description,
      reference: entry.reference,
      status: entry.status,
      lines: entry.lines.map(line => ({
        accountId: line.accountId,
        accountName: line.accountName,
        debit: line.debit,
        credit: line.credit,
        description: line.description,
      })),
    },
  });

  const onSubmit = (data: JournalEntryFormValues) => {
    onSave(data);
  };

  const totalDebit = form.watch('lines').reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = form.watch('lines').reduce((sum, line) => sum + line.credit, 0);

  // قائمة حسابات وهمية للاختيار
  const MOCK_ACCOUNTS = [
    { id: '1110', name: 'الصندوق' },
    { id: '1120', name: 'البنك' },
    { id: '1210', name: 'العملاء' },
    { id: '2200', name: 'الموردون' },
    { id: '2300', name: 'ضريبة القيمة المضافة' },
    { id: '4100', name: 'إيرادات المبيعات' },
    { id: '6100', name: 'مصروف الإيجار' },
    { id: '6200', name: 'مصروفات مستحقة' },
  ];

  // دالة وهمية لإضافة سطر جديد
  const addLine = () => {
    const currentLines = form.getValues('lines');
    form.setValue('lines', [
      ...currentLines,
      { id: `L${currentLines.length + 1}`, accountId: '', accountName: '', debit: 0, credit: 0, description: '' }
    ]);
  };

  // دالة وهمية لحذف سطر
  const removeLine = (index: number) => {
    const currentLines = form.getValues('lines');
    form.setValue('lines', currentLines.filter((_, i) => i !== index));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>التاريخ</FormLabel>
                <FormControl>
                  <Input type="date" {...field} disabled={!isEdit} className="text-right" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reference"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>المرجع</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!isEdit} className="text-right" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>الحالة</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEdit}>
                  <FormControl>
                    <SelectTrigger dir="rtl">
                      <SelectValue placeholder="اختر حالة القيد" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent dir="rtl">
                    <SelectItem value="Draft">مسودة</SelectItem>
                    <SelectItem value="Posted">مرحل</SelectItem>
                    <SelectItem value="Reversed">معكوس</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>الوصف العام للقيد</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} disabled={!isEdit} className="text-right" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <h3 className="text-lg font-semibold text-right">تفاصيل أسطر القيد</h3>
        <div className="overflow-x-auto">
          <Table dir="rtl" className="min-w-full">
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                <TableHead className="w-[200px] text-right">الحساب</TableHead>
                <TableHead className="w-[150px] text-right">مدين</TableHead>
                <TableHead className="w-[150px] text-right">دائن</TableHead>
                <TableHead className="text-right">الوصف</TableHead>
                {isEdit && <TableHead className="w-[50px] text-center">إجراء</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {form.watch('lines').map((line, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`lines.${index}.accountId`}
                      render={({ field }: { field: any }) => (
                        <FormItem className="space-y-0">
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              const selectedAccount = MOCK_ACCOUNTS.find(acc => acc.id === value);
                              form.setValue(`lines.${index}.accountName`, selectedAccount?.name || '');
                            }}
                            defaultValue={field.value}
                            disabled={!isEdit}
                          >
                            <FormControl>
                              <SelectTrigger dir="rtl">
                                <SelectValue placeholder="اختر حساب" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent dir="rtl">
                              {MOCK_ACCOUNTS.map(account => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.name} ({account.id})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`lines.${index}.debit`}
                      render={({ field }: { field: any }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e: any) => field.onChange(parseFloat((e.target as HTMLInputElement).value) || 0)}
                              disabled={!isEdit}
                              className="text-right"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`lines.${index}.credit`}
                      render={({ field }: { field: any }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e: any) => field.onChange(parseFloat((e.target as HTMLInputElement).value) || 0)}
                              disabled={!isEdit}
                              className="text-right"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`lines.${index}.description`}
                      render={({ field }: { field: any }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input {...field} disabled={!isEdit} className="text-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  {isEdit && (
                    <TableCell className="text-center">
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeLine(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="font-bold bg-gray-100 dark:bg-gray-700">
                <TableCell className="text-right">الإجمالي</TableCell>
                <TableCell className={`text-right ${totalDebit !== totalCredit ? 'text-red-500' : 'text-green-600'}`}>
                  {totalDebit.toFixed(2)}
                </TableCell>
                <TableCell className={`text-right ${totalDebit !== totalCredit ? 'text-red-500' : 'text-green-600'}`}>
                  {totalCredit.toFixed(2)}
                </TableCell>
                <TableCell colSpan={isEdit ? 2 : 1} className="text-right">
                  {totalDebit !== totalCredit && <span className="text-red-500">المدين لا يساوي الدائن!</span>}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        {isEdit && (
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={addLine}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة سطر قيد
            </Button>
          </div>
        )}

        <DialogFooter className="sm:justify-start">
          {isEdit ? (
            <Button type="submit" disabled={!form.formState.isValid}>حفظ التعديلات</Button>
          ) : (
            <Button type="button" onClick={() => { /* Mock print/export logic */ }}>طباعة / تصدير</Button>
          )}
        </DialogFooter>
      </form>
    </Form>
  );
};

// 5. تعريف الأعمدة (Column Definitions) لجدول tanstack/react-table
// -----------------------------------------------------------------------------

const columns: ColumnDef<JournalEntry>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        dir="rtl"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        dir="rtl"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="text-right w-full justify-end"
        >
          رقم القيد
          <ArrowUpDown className="mr-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-right font-medium">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'date',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="text-right w-full justify-end"
        >
          التاريخ
          <ArrowUpDown className="mr-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-right">{row.getValue('date')}</div>,
  },
  {
    accessorKey: 'description',
    header: 'الوصف',
    cell: ({ row }) => <div className="text-right max-w-[300px] truncate">{row.getValue('description')}</div>,
  },
  {
    accessorKey: 'totalDebit',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="text-right w-full justify-end"
        >
          الإجمالي (مدين)
          <ArrowUpDown className="mr-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('totalDebit'));
      const formatted = new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR',
      }).format(amount);

      return <div className="text-right font-bold">{formatted}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="text-right w-full justify-end"
        >
          الحالة
          <ArrowUpDown className="mr-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as JournalEntry['status'];
      let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
      let text = '';

      switch (status) {
        case 'Posted':
          variant = 'default';
          text = 'مرحل';
          break;
        case 'Draft':
          variant = 'outline';
          text = 'مسودة';
          break;
        case 'Reversed':
          variant = 'destructive';
          text = 'معكوس';
          break;
      }

      return (
        <div className="text-right">
          <Badge variant={variant} className="min-w-[70px] justify-center">
            {text}
          </Badge>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const entry = row.original;
      const [isViewOpen, setIsViewOpen] = useState(false);
      const [isEditOpen, setIsEditOpen] = useState(false);
      const [isDeleteOpen, setIsDeleteOpen] = useState(false);

      const handleSave = (data: JournalEntryFormValues) => {
        console.log('Mock Save/Update:', data);
        // هنا يتم استدعاء API لحفظ البيانات
        setIsEditOpen(false);
        // تحديث البيانات في الجدول (في بيئة حقيقية)
      };

      const handleDelete = () => {
        console.log('Mock Delete:', entry.id);
        // هنا يتم استدعاء API لحذف القيد
        setIsDeleteOpen(false);
        // تحديث البيانات في الجدول (في بيئة حقيقية)
      };

      return (
        <div className="text-left">
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">فتح القائمة</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel className="text-right">إجراءات</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setIsViewOpen(true)} className="justify-end">
                <Eye className="ml-2 h-4 w-4" />
                عرض التفاصيل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="justify-end">
                <Edit className="ml-2 h-4 w-4" />
                تعديل القيد
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="text-red-600 justify-end">
                <Trash2 className="ml-2 h-4 w-4" />
                حذف القيد
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Dialog */}
          <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto" dir="rtl">
              <DialogHeader className="text-right">
                <DialogTitle>عرض تفاصيل القيد: {entry.id}</DialogTitle>
                <DialogDescription>
                  تفاصيل القيد المحاسبي اليومي ورصيد المدين والدائن.
                </DialogDescription>
              </DialogHeader>
              <JournalEntryDetailsDialog entry={entry} isEdit={false} onSave={() => {}} />
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto" dir="rtl">
              <DialogHeader className="text-right">
                <DialogTitle>تعديل القيد: {entry.id}</DialogTitle>
                <DialogDescription>
                  قم بتعديل بيانات القيد المحاسبي اليومي.
                </DialogDescription>
              </DialogHeader>
              <JournalEntryDetailsDialog entry={entry} isEdit={true} onSave={handleSave} />
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
              <DialogHeader className="text-right">
                <DialogTitle>تأكيد الحذف</DialogTitle>
                <DialogDescription>
                  هل أنت متأكد من حذف القيد رقم <span className="font-bold">{entry.id}</span>؟ لا يمكن التراجع عن هذا الإجراء.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-start">
                <Button variant="destructive" onClick={handleDelete}>
                  حذف
                </Button>
                <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                  إلغاء
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
];

// 6. المكون الرئيسي (Main Component)
// -----------------------------------------------------------------------------

// مكون وهمي لـ DashboardLayout
const DashboardLayout: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => (
  <div className="p-4 md:p-8 lg:p-12 max-w-full mx-auto" dir="rtl">
    <h1 className="text-3xl font-bold mb-6 text-right">{title}</h1>
    {children}
  </div>
);

export const JournalEntriesList: React.FC = () => {
  const [data, setData] = useState<JournalEntry[]>(MOCK_JOURNAL_ENTRIES);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // دالة وهمية لإضافة قيد جديد
  const handleAddEntry = (formData: JournalEntryFormValues) => {
    const newEntry: JournalEntry = {
      ...formData,
      id: `JE-2024-${(data.length + 1).toString().padStart(4, '0')}`,
      totalDebit: formData.lines.reduce((sum, line) => sum + line.debit, 0),
      totalCredit: formData.lines.reduce((sum, line) => sum + line.credit, 0),
    };
    setData(prev => [newEntry, ...prev]);
    setIsAddOpen(false);
    console.log('Mock Add New Entry:', newEntry);
  };

  // مكون نموذج الإضافة (Add Dialog)
  const AddJournalEntryDialog: React.FC<{ onSave: (data: JournalEntryFormValues) => void }> = ({ onSave }) => {
    const form = useForm<JournalEntryFormValues>({
      resolver: zodResolver(JournalEntryFormSchema),
      defaultValues: {
        date: new Date().toISOString().split('T')[0],
        description: '',
        reference: '',
        status: 'Draft',
        lines: [
          { accountId: '', accountName: '', debit: 0, credit: 0, description: '' },
          { accountId: '', accountName: '', debit: 0, credit: 0, description: '' },
        ],
      },
    });

    const onSubmit = (data: JournalEntryFormValues) => {
      onSave(data);
      form.reset();
    };

    return (
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            إضافة قيد يومي جديد
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle>إضافة قيد يومي جديد</DialogTitle>
            <DialogDescription>
              يرجى إدخال تفاصيل القيد المحاسبي والتأكد من توازن المدين والدائن.
            </DialogDescription>
          </DialogHeader>
          <JournalEntryDetailsDialog entry={form.getValues() as JournalEntry} isEdit={true} onSave={handleAddEntry} />
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <DashboardLayout title="قائمة القيود اليومية">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 border-b">
          <CardTitle className="text-xl font-semibold text-right">إدارة القيود</CardTitle>
          <div className="flex items-center space-x-2 space-x-reverse">
            <AddJournalEntryDialog onSave={handleAddEntry} />
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  <Filter className="ml-2 h-4 w-4" />
                  الأعمدة
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[150px]">
                <DropdownMenuLabel className="text-right">تبديل الأعمدة</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize text-right"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id === 'id' && 'رقم القيد'}
                        {column.id === 'date' && 'التاريخ'}
                        {column.id === 'description' && 'الوصف'}
                        {column.id === 'totalDebit' && 'الإجمالي (مدين)'}
                        {column.id === 'status' && 'الحالة'}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center py-4 space-x-4 space-x-reverse">
            <div className="relative w-full max-w-sm">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="بحث عام (رقم القيد، الوصف...)"
                value={globalFilter ?? ''}
                onChange={(event: any) => setGlobalFilter((event.target as HTMLInputElement).value)}
                className="w-full pr-10 text-right"
                dir="rtl"
              />
            </div>
            {/* مثال على فلتر الحالة */}
            <Select
              onValueChange={(value) => {
                const statusFilter = table.getColumn('status')?.getFilterValue() as string[] ?? [];
                if (value === 'all') {
                  table.getColumn('status')?.setFilterValue(undefined);
                } else if (statusFilter.includes(value)) {
                  table.getColumn('status')?.setFilterValue(statusFilter.filter(s => s !== value));
                } else {
                  table.getColumn('status')?.setFilterValue([value]);
                }
              }}
            >
              <SelectTrigger className="w-[180px]" dir="rtl">
                <Filter className="ml-2 h-4 w-4" />
                <SelectValue placeholder="تصفية حسب الحالة" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="Posted">مرحل</SelectItem>
                <SelectItem value="Draft">مسودة</SelectItem>
                <SelectItem value="Reversed">معكوس</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                      لا توجد قيود يومية.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between space-x-2 space-x-reverse py-4">
            <div className="flex-1 text-sm text-muted-foreground text-right">
              تم تحديد {table.getFilteredSelectedRowModel().rows.length} من أصل{' '}
              {table.getFilteredRowModel().rows.length} قيد(قيود).
            </div>
            <div className="flex items-center space-x-6 space-x-reverse">
              <div className="flex items-center space-x-2 space-x-reverse">
                <p className="text-sm font-medium">الصفوف في الصفحة</p>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]" dir="rtl">
                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top" dir="rtl">
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
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
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

// ملاحظة: يجب استبدال المسارات الوهمية (مثل '@/components/ui/table') بالمسارات الصحيحة في بيئة المشروع الفعلية.
// تم افتراض وجود المكونات الأساسية لـ shadcn/ui.
