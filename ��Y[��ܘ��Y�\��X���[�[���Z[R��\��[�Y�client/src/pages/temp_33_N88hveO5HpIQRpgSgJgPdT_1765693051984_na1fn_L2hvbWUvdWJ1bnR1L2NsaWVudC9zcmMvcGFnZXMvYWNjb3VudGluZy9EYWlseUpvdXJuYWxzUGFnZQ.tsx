// client/src/pages/accounting/DailyJournalsPage.tsx

import React, { useState, useMemo } from 'react';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// افتراض وجود هذا المكون لتخطيط الصفحة
// يجب استبداله بالمكون الفعلي في المشروع
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-8 bg-gray-50 min-h-screen" dir="rtl">
    {children}
  </div>
);

// 1. تعريف هيكل البيانات (Types & Schema)

interface JournalLine {
  id: string;
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
  notes: string;
}

interface DailyJournal {
  id: string;
  date: Date;
  description: string;
  status: 'Draft' | 'Posted' | 'Cancelled';
  totalDebit: number;
  totalCredit: number;
  entries: JournalLine[];
}

// قائمة حسابات وهمية للاستخدام في القائمة المنسدلة
const mockAccounts = [
  { id: '101', name: 'الصندوق' },
  { id: '102', name: 'البنك' },
  { id: '201', name: 'الموردون' },
  { id: '301', name: 'رأس المال' },
  { id: '401', name: 'إيرادات المبيعات' },
];

// دالة التحقق المخصصة للتأكد من توازن القيد (المدين = الدائن)
const JournalSchema = z
  .object({
    date: z.date({
      required_error: 'تاريخ القيد مطلوب.',
    }),
    description: z
      .string()
      .min(5, { message: 'الوصف يجب أن لا يقل عن 5 أحرف.' }),
    entries: z
      .array(
        z.object({
          accountId: z.string().min(1, { message: 'اختيار الحساب مطلوب.' }),
          debit: z.number().min(0, { message: 'يجب أن يكون المدين قيمة موجبة.' }),
          credit: z.number().min(0, { message: 'يجب أن يكون الدائن قيمة موجبة.' }),
          notes: z.string().optional(),
        })
      )
      .min(2, { message: 'يجب أن يحتوي القيد على سطرين على الأقل.' }),
  })
  .refine(
    (data) => {
      const totalDebit = data.entries.reduce((sum, entry) => sum + entry.debit, 0);
      const totalCredit = data.entries.reduce((sum, entry) => sum + entry.credit, 0);
      return totalDebit === totalCredit && totalDebit > 0;
    },
    {
      message: 'يجب أن يتساوى إجمالي المدين مع إجمالي الدائن وأن يكون أكبر من الصفر.',
      path: ['entries'], // يمكن توجيه رسالة الخطأ إلى حقل معين إذا لزم الأمر
    }
  );

type JournalFormValues = z.infer<typeof JournalSchema>;

// 2. بيانات وهمية للجدول

const mockJournals: DailyJournal[] = [
  {
    id: 'J-001',
    date: new Date(2025, 11, 10),
    description: 'شراء مواد خام من المورد أ',
    status: 'Posted',
    totalDebit: 5000,
    totalCredit: 5000,
    entries: [],
  },
  {
    id: 'J-002',
    date: new Date(2025, 11, 12),
    description: 'تحصيل إيراد مبيعات نقداً',
    status: 'Draft',
    totalDebit: 1200,
    totalCredit: 1200,
    entries: [],
  },
  {
    id: 'J-003',
    date: new Date(2025, 11, 15),
    description: 'دفع إيجار المكتب',
    status: 'Posted',
    totalDebit: 3000,
    totalCredit: 3000,
    entries: [],
  },
];

// 3. مكون نموذج إضافة/تعديل قيد يومي

interface JournalFormProps {
  onSave: (data: JournalFormValues) => Promise<void>;
  initialData?: DailyJournal;
  onClose: () => void;
}

const DailyJournalForm: React.FC<JournalFormProps> = ({ onSave, initialData, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<JournalFormValues>({
    resolver: zodResolver(JournalSchema),
    defaultValues: initialData
      ? {
          date: initialData.date,
          description: initialData.description,
          entries: initialData.entries.map((e) => ({
            accountId: e.accountId,
            debit: e.debit,
            credit: e.credit,
            notes: e.notes,
          })),
        }
      : {
          date: new Date(),
          description: '',
          entries: [
            { accountId: '', debit: 0, credit: 0, notes: '' },
            { accountId: '', debit: 0, credit: 0, notes: '' },
          ],
        },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'entries',
  });

  const onSubmit = async (data: JournalFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await onSave(data);
      onClose();
    } catch (err) {
      setError('فشل في حفظ القيد. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalDebit = form.watch('entries').reduce((sum, entry) => sum + (entry.debit || 0), 0);
  const totalCredit = form.watch('entries').reduce((sum, entry) => sum + (entry.credit || 0), 0);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" dir="rtl">
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* حقل التاريخ */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-right">تاريخ القيد</FormLabel>
                <Popover dir="rtl">
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full justify-start text-right font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                        {field.value ? (
                          format(field.value, 'PPP', { locale: ar })
                        ) : (
                          <span>اختر تاريخاً</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start" dir="rtl">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                      initialFocus
                      locale={ar}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage className="text-right" />
              </FormItem>
            )}
          />

          {/* حقل الوصف */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right">الوصف/البيان</FormLabel>
                <FormControl>
                  <Input placeholder="وصف مختصر للقيد" {...field} className="text-right" />
                </FormControl>
                <FormMessage className="text-right" />
              </FormItem>
            )}
          />
        </div>

        {/* جدول سطور القيد */}
        <div className="space-y-4 border p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-right">تفاصيل القيد</h3>
          <Table dir="rtl">
            <TableHeader>
              <TableRow className="text-right">
                <TableHead className="w-[40%] text-right">الحساب</TableHead>
                <TableHead className="w-[20%] text-right">مدين</TableHead>
                <TableHead className="w-[20%] text-right">دائن</TableHead>
                <TableHead className="w-[15%] text-right">ملاحظات</TableHead>
                <TableHead className="w-[5%] text-right">إجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  {/* اختيار الحساب */}
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`entries.${index}.accountId`}
                      render={({ field: accountField }) => (
                        <FormItem className="mb-0">
                          <Select
                            onValueChange={accountField.onChange}
                            defaultValue={accountField.value}
                            dir="rtl"
                          >
                            <FormControl>
                              <SelectTrigger className="text-right">
                                <SelectValue placeholder="اختر حساباً" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent dir="rtl">
                              {mockAccounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-right" />
                        </FormItem>
                      )}
                    />
                  </TableCell>

                  {/* حقل المدين */}
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`entries.${index}.debit`}
                      render={({ field }) => (
                        <FormItem className="mb-0">
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              className="text-left"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage className="text-right" />
                        </FormItem>
                      )}
                    />
                  </TableCell>

                  {/* حقل الدائن */}
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`entries.${index}.credit`}
                      render={({ field }) => (
                        <FormItem className="mb-0">
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              className="text-left"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage className="text-right" />
                        </FormItem>
                      )}
                    />
                  </TableCell>

                  {/* حقل الملاحظات */}
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`entries.${index}.notes`}
                      render={({ field }) => (
                        <FormItem className="mb-0">
                          <FormControl>
                            <Input placeholder="ملاحظات" {...field} className="text-right" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </TableCell>

                  {/* زر الحذف */}
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 2}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ accountId: '', debit: 0, credit: 0, notes: '' })}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة سطر
            </Button>
            <div className="text-lg font-bold flex space-x-4 space-x-reverse">
              <span className={cn('text-red-600', totalDebit !== totalCredit && 'text-red-600')}>
                إجمالي المدين: {totalDebit.toFixed(2)}
              </span>
              <span className={cn('text-green-600', totalDebit !== totalCredit && 'text-red-600')}>
                إجمالي الدائن: {totalCredit.toFixed(2)}
              </span>
            </div>
          </div>
          {/* رسالة خطأ التحقق من التوازن */}
          {form.formState.errors.entries && (
            <p className="text-sm font-medium text-red-600 text-right mt-2">
              {form.formState.errors.entries.message}
            </p>
          )}
        </div>

        <DialogFooter className="flex justify-end pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            {initialData ? 'حفظ التعديلات' : 'إنشاء القيد'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// 4. المكون الرئيسي للواجهة

const DailyJournalsPage: React.FC = () => {
  const [journals, setJournals] = useState<DailyJournal[]>(mockJournals);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<DailyJournal | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // محاكاة جلب البيانات
  const fetchJournals = async () => {
    setIsLoading(true);
    setError(null);
    // محاكاة تأخير API
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      // هنا يتم استدعاء GET /api/v1/accounting/daily-journals
      setJournals(mockJournals);
    } catch (e) {
      setError('فشل في جلب القيود اليومية.');
    } finally {
      setIsLoading(false);
    }
  };

  // محاكاة عملية الحفظ
  const handleSaveJournal = async (data: JournalFormValues) => {
    // محاكاة تأخير API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newJournal: DailyJournal = {
      id: selectedJournal ? selectedJournal.id : `J-${Math.floor(Math.random() * 1000)}`,
      date: data.date,
      description: data.description,
      status: 'Draft', // دائماً يبدأ كمسودة
      totalDebit: data.entries.reduce((sum, entry) => sum + entry.debit, 0),
      totalCredit: data.entries.reduce((sum, entry) => sum + entry.credit, 0),
      entries: data.entries.map((e, index) => ({
        ...e,
        id: `${new Date().getTime()}-${index}`,
        accountName: mockAccounts.find(acc => acc.id === e.accountId)?.name || 'غير معروف',
      })),
    };

    if (selectedJournal) {
      // هنا يتم استدعاء PUT /api/v1/accounting/daily-journals/{id}
      setJournals(journals.map((j) => (j.id === newJournal.id ? newJournal : j)));
    } else {
      // هنا يتم استدعاء POST /api/v1/accounting/daily-journals
      setJournals([newJournal, ...journals]);
    }
  };

  const handleEdit = (journal: DailyJournal) => {
    setSelectedJournal(journal);
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setSelectedJournal(undefined);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedJournal(undefined);
  };

  // تأثير جانبي لجلب البيانات عند التحميل
  React.useEffect(() => {
    fetchJournals();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto" dir="rtl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">القيود اليومية</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNew} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 ml-2" />
                قيد يومي جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]" dir="rtl">
              <DialogHeader className="text-right">
                <DialogTitle>{selectedJournal ? 'تعديل القيد اليومي' : 'إنشاء قيد يومي جديد'}</DialogTitle>
              </DialogHeader>
              <DailyJournalForm
                onSave={handleSaveJournal}
                initialData={selectedJournal}
                onClose={handleCloseDialog}
              />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="mr-2 text-lg">جاري تحميل القيود...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-700 bg-red-100 border border-red-200 rounded-md">
            {error}
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <Table dir="rtl">
              <TableHeader>
                <TableRow className="bg-gray-50 text-right">
                  <TableHead className="w-[100px] text-right">رقم القيد</TableHead>
                  <TableHead className="w-[150px] text-right">التاريخ</TableHead>
                  <TableHead className="text-right">الوصف</TableHead>
                  <TableHead className="w-[120px] text-right">إجمالي المدين</TableHead>
                  <TableHead className="w-[120px] text-right">إجمالي الدائن</TableHead>
                  <TableHead className="w-[100px] text-right">الحالة</TableHead>
                  <TableHead className="w-[100px] text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {journals.map((journal) => (
                  <TableRow key={journal.id}>
                    <TableCell className="font-medium">{journal.id}</TableCell>
                    <TableCell>
                      {format(journal.date, 'PPP', { locale: ar })}
                    </TableCell>
                    <TableCell>{journal.description}</TableCell>
                    <TableCell className="text-left font-semibold text-red-600">
                      {journal.totalDebit.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-left font-semibold text-green-600">
                      {journal.totalCredit.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          journal.status === 'Posted' && 'bg-green-100 text-green-800',
                          journal.status === 'Draft' && 'bg-yellow-100 text-yellow-800',
                          journal.status === 'Cancelled' && 'bg-red-100 text-red-800'
                        )}
                      >
                        {journal.status === 'Posted'
                          ? 'مرحل'
                          : journal.status === 'Draft'
                          ? 'مسودة'
                          : 'ملغي'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(journal)}
                        disabled={journal.status === 'Posted'}
                      >
                        تعديل
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {journals.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                لا توجد قيود يومية مسجلة.
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DailyJournalsPage;
