import React, { useState, useMemo } from 'react';
import { ArrowDown, ArrowUp, DollarSign, Search, Plus, Edit, Trash2, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'; // افتراض وجود مسار صحيح لمكونات shadcn/ui
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { Badge } from './components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './components/ui/dialog';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Textarea } from './components/ui/textarea';
import { useForm } from 'react-hook-form'; // افتراض استخدام react-hook-form للتحقق
import { z } from 'zod'; // افتراض استخدام zod للتحقق
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './components/ui/form';
import { DatePicker } from './components/ui/date-picker'; // افتراض وجود مكون DatePicker

// 1. واجهات TypeScript
type TransactionType = 'Inflow' | 'Outflow';

interface CashFlowTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  type: TransactionType;
  category: string;
  amount: number;
}

interface CashFlowSummary {
  totalInflow: number;
  totalOutflow: number;
  netCashFlow: number;
}

interface CashFlowChartData {
  month: string;
  inflow: number;
  outflow: number;
}

// 2. البيانات التجريبية (Mock Data)
const MOCK_TRANSACTIONS: CashFlowTransaction[] = [
  { id: 't1', date: '2024-11-01', description: 'إيرادات مبيعات شهر نوفمبر', type: 'Inflow', category: 'مبيعات', amount: 55000 },
  { id: 't2', date: '2024-11-05', description: 'دفع إيجار المكتب', type: 'Outflow', category: 'مصاريف تشغيلية', amount: 8000 },
  { id: 't3', date: '2024-11-10', description: 'تحصيل دفعة من عميل (شركة الأمل)', type: 'Inflow', category: 'تحصيلات', amount: 22000 },
  { id: 't4', date: '2024-11-15', description: 'رواتب الموظفين', type: 'Outflow', category: 'أجور', amount: 15000 },
  { id: 't5', date: '2024-11-20', description: 'شراء مواد خام', type: 'Outflow', category: 'مشتريات', amount: 12000 },
  { id: 't6', date: '2024-12-01', description: 'إيرادات مبيعات شهر ديسمبر', type: 'Inflow', category: 'مبيعات', amount: 60000 },
  { id: 't7', date: '2024-12-05', description: 'دفع فواتير الخدمات', type: 'Outflow', category: 'مصاريف تشغيلية', amount: 3500 },
  { id: 't8', date: '2024-12-10', description: 'تحصيل دفعة من عميل (شركة النور)', type: 'Inflow', category: 'تحصيلات', amount: 30000 },
  { id: 't9', date: '2024-12-15', description: 'رواتب الموظفين', type: 'Outflow', category: 'أجور', amount: 15000 },
  { id: 't10', date: '2024-12-20', description: 'صيانة المعدات', type: 'Outflow', category: 'صيانة', amount: 4000 },
];

const MOCK_SUMMARY: CashFlowSummary = {
  totalInflow: MOCK_TRANSACTIONS.filter(t => t.type === 'Inflow').reduce((sum, t) => sum + t.amount, 0),
  totalOutflow: MOCK_TRANSACTIONS.filter(t => t.type === 'Outflow').reduce((sum, t) => sum + t.amount, 0),
  netCashFlow: 0, // سيتم حسابه لاحقاً
};
MOCK_SUMMARY.netCashFlow = MOCK_SUMMARY.totalInflow - MOCK_SUMMARY.totalOutflow;

const MOCK_CHART_DATA: CashFlowChartData[] = [
  { month: 'سبتمبر', inflow: 45000, outflow: 25000 },
  { month: 'أكتوبر', inflow: 50000, outflow: 30000 },
  { month: 'نوفمبر', inflow: 77000, outflow: 35000 },
  { month: 'ديسمبر', inflow: 90000, outflow: 40500 },
  { month: 'يناير', inflow: 85000, outflow: 42000 },
  { month: 'فبراير', inflow: 95000, outflow: 48000 },
];

// 3. تعريف مخطط التحقق (Validation Schema) لنموذج الإدخال
const transactionSchema = z.object({
  id: z.string().optional(),
  date: z.date({ required_error: 'تاريخ العملية مطلوب.' }),
  description: z.string().min(5, { message: 'الوصف يجب أن يحتوي على 5 أحرف على الأقل.' }),
  type: z.enum(['Inflow', 'Outflow'], { required_error: 'نوع العملية مطلوب.' }),
  category: z.string().min(3, { message: 'الفئة مطلوبة.' }),
  amount: z.number().min(1, { message: 'المبلغ يجب أن يكون أكبر من صفر.' }),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

// 4. مكونات وهمية (لتبسيط الكود، سيتم استخدام مكونات بسيطة بدلاً من مكتبات الرسوم البيانية الفعلية)

// مكون وهمي للرسوم البيانية
const MockChart: React.FC<{ data: CashFlowChartData[] }> = ({ data }) => (
  <div className="w-full h-64 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
    <h3 className="text-lg font-semibold mb-2 text-right">الرسم البياني للتدفقات النقدية الشهرية</h3>
    <div className="flex justify-between items-end h-48">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center h-full justify-end w-1/6">
          <div
            className="w-4 bg-green-500 rounded-t-sm"
            style={{ height: `${(item.inflow / 1000)}px`, maxHeight: '100%' }}
            title={`إيرادات ${item.month}: ${item.inflow.toLocaleString()}`}
          />
          <div
            className="w-4 bg-red-500 rounded-t-sm mt-1"
            style={{ height: `${(item.outflow / 1000)}px`, maxHeight: '100%' }}
            title={`مصروفات ${item.month}: ${item.outflow.toLocaleString()}`}
          />
          <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">{item.month}</span>
        </div>
      ))}
    </div>
  </div>
);

// 5. المكون الرئيسي: CashFlow
const CashFlow: React.FC = () => {
  const [transactions, setTransactions] = useState<CashFlowTransaction[]>(MOCK_TRANSACTIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<CashFlowTransaction | null>(null);

  // حساب الملخص
  const summary = useMemo(() => {
    const totalInflow = transactions.filter(t => t.type === 'Inflow').reduce((sum, t) => sum + t.amount, 0);
    const totalOutflow = transactions.filter(t => t.type === 'Outflow').reduce((sum, t) => sum + t.amount, 0);
    return {
      totalInflow,
      totalOutflow,
      netCashFlow: totalInflow - totalOutflow,
    };
  }, [transactions]);

  // تصفية المعاملات
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t =>
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // فرز افتراضي حسب التاريخ
  }, [transactions, searchTerm]);

  // دالة إضافة/تعديل معاملة
  const handleSaveTransaction = (data: TransactionFormValues) => {
    if (editingTransaction) {
      // تعديل
      setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? { ...t, ...data, date: data.date.toISOString().split('T')[0] } : t));
    } else {
      // إضافة
      const newTransaction: CashFlowTransaction = {
        ...data,
        id: Date.now().toString(),
        date: data.date.toISOString().split('T')[0],
      };
      setTransactions(prev => [newTransaction, ...prev]);
    }
    setIsDialogOpen(false);
    setEditingTransaction(null);
  };

  // دالة حذف معاملة
  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه العملية؟')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  // دالة فتح نموذج التعديل
  const handleEditClick = (transaction: CashFlowTransaction) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  // دالة فتح نموذج الإضافة
  const handleAddClick = () => {
    setEditingTransaction(null);
    setIsDialogOpen(true);
  };

  // مكون نموذج الإدخال (Add/Edit Form)
  const TransactionForm: React.FC<{ defaultValues?: CashFlowTransaction | null }> = ({ defaultValues }) => {
    const form = useForm<TransactionFormValues>({
      resolver: zodResolver(transactionSchema),
      defaultValues: defaultValues ? {
        ...defaultValues,
        date: new Date(defaultValues.date),
        amount: defaultValues.amount,
      } : {
        date: new Date(),
        description: '',
        type: 'Inflow',
        category: '',
        amount: 0,
      },
    });

    const onSubmit = (data: TransactionFormValues) => {
      handleSaveTransaction(data);
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-right">التاريخ</FormLabel>
                <FormControl>
                  <DatePicker
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    placeholder="اختر تاريخ العملية"
                  />
                </FormControl>
                <FormMessage className="text-right" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right">الوصف</FormLabel>
                <FormControl>
                  <Textarea placeholder="وصف مختصر للعملية" {...field} className="resize-none text-right" />
                </FormControl>
                <FormMessage className="text-right" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right">النوع</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger dir="rtl">
                      <SelectValue placeholder="اختر نوع العملية" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent dir="rtl">
                    <SelectItem value="Inflow">تدفق نقدي داخل (إيراد)</SelectItem>
                    <SelectItem value="Outflow">تدفق نقدي خارج (مصروف)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-right" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right">الفئة</FormLabel>
                <FormControl>
                  <Input placeholder="مثل: مبيعات، أجور، إيجار" {...field} className="text-right" />
                </FormControl>
                <FormMessage className="text-right" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right">المبلغ (بالريال)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    className="text-right"
                  />
                </FormControl>
                <FormMessage className="text-right" />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit" className="w-full">
              {editingTransaction ? 'حفظ التعديلات' : 'إضافة العملية'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  // المكون الرئيسي للواجهة
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40" dir="rtl">
      {/* محاكاة DashboardLayout */}
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <h1 className="text-2xl font-bold">تقرير التدفقات النقدية</h1>
          <div className="ml-auto flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1" onClick={handleAddClick}>
                  <Plus className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    إضافة عملية جديدة
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-right">{editingTransaction ? 'تعديل عملية' : 'إضافة عملية جديدة'}</DialogTitle>
                </DialogHeader>
                <TransactionForm defaultValues={editingTransaction} />
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {/* بطاقات الملخص */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي التدفقات الداخلة</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {summary.totalInflow.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}
                </div>
                <p className="text-xs text-muted-foreground">
                  زيادة 15% عن الشهر الماضي
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي التدفقات الخارجة</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {summary.totalOutflow.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}
                </div>
                <p className="text-xs text-muted-foreground">
                  زيادة 5% عن الشهر الماضي
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">صافي التدفق النقدي</CardTitle>
                <DollarSign className={`h-4 w-4 ${summary.netCashFlow >= 0 ? 'text-blue-500' : 'text-red-500'}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: summary.netCashFlow >= 0 ? '#10B981' : '#EF4444' }}>
                  {summary.netCashFlow.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary.netCashFlow >= 0 ? 'وضع نقدي إيجابي' : 'وضع نقدي سلبي'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* الرسوم البيانية */}
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-right">ملخص التدفقات النقدية الشهرية</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <MockChart data={MOCK_CHART_DATA} />
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-right">توزيع التدفقات الخارجة حسب الفئة</CardTitle>
              </CardHeader>
              <CardContent className="pl-2 h-64 flex items-center justify-center">
                {/* محاكاة رسم بياني دائري */}
                <div className="w-48 h-48 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  رسم بياني دائري وهمي
                </div>
              </CardContent>
            </Card>
          </div>

          {/* جدول العمليات */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-right">سجل العمليات النقدية</CardTitle>
              <div className="relative ml-auto flex-1 md:grow-0">
                <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="ابحث عن وصف أو فئة..."
                  className="w-full rounded-lg bg-background pl-8 md:w-[336px] text-right"
                  value={searchTerm}
                  onChange={(e: React.FormEvent) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table dir="rtl">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px] text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الوصف</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">الفئة</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium text-right">{transaction.date}</TableCell>
                      <TableCell className="text-right">{transaction.description}</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={`text-right ${transaction.type === 'Inflow' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {transaction.type === 'Inflow' ? 'داخل' : 'خارج'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{transaction.category}</TableCell>
                      <TableCell className={`text-right font-semibold ${transaction.type === 'Inflow' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(transaction)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteTransaction(transaction.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredTransactions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد عمليات مطابقة لنتائج البحث.
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

// تصدير المكون
export default CashFlow;
