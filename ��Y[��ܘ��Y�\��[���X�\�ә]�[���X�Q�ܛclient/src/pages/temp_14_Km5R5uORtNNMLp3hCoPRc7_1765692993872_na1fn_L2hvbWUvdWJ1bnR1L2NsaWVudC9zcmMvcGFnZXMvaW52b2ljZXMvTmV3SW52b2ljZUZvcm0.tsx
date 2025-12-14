import React, { useState, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils'; // افتراض وجود دالة مساعدة لدمج الفئات

// 1. تعريف مخطط Zod للأصناف (Line Items)
const lineItemSchema = z.object({
  itemName: z.string().min(1, { message: 'اسم الصنف مطلوب' }),
  quantity: z.coerce.number().min(1, { message: 'الكمية يجب أن تكون 1 على الأقل' }),
  unitPrice: z.coerce.number().min(0.01, { message: 'سعر الوحدة مطلوب' }),
  description: z.string().optional(),
});

// 2. تعريف مخطط Zod للنموذج الرئيسي
const formSchema = z.object({
  customerName: z.string().min(3, { message: 'يجب اختيار أو إدخال اسم العميل' }),
  invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'تاريخ الفاتورة غير صحيح' }), // مثال: YYYY-MM-DD
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'تاريخ الاستحقاق غير صحيح' }),
  status: z.enum(['Draft', 'Sent', 'Paid'], { message: 'حالة الفاتورة غير صالحة' }),
  taxRate: z.coerce.number().min(0).max(100, { message: 'معدل الضريبة يجب أن يكون بين 0 و 100' }).default(15),
  notes: z.string().max(500, { message: 'الحد الأقصى للملاحظات هو 500 حرف' }).optional(),
  items: z.array(lineItemSchema).min(1, { message: 'يجب إضافة صنف واحد على الأقل للفاتورة' }),
});

// 3. تعريف الأنواع
type LineItem = z.infer<typeof lineItemSchema> & { total: number };
type InvoiceFormValues = z.infer<typeof formSchema>;

// 4. مكون تخطيط لوحة القيادة (DashboardLayout Placeholder)
// في مشروع حقيقي، سيتم استبدال هذا بالمكون الفعلي للتخطيط
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
    <header className="mb-6">
      <h1 className="text-3xl font-bold text-gray-800 text-right">إنشاء فاتورة جديدة</h1>
      <p className="text-sm text-gray-500 text-right">املأ الحقول المطلوبة لإنشاء فاتورة متقدمة.</p>
    </header>
    <main className="max-w-6xl mx-auto">
      {children}
    </main>
  </div>
);

// 5. المكون الرئيسي
const NewInvoiceForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // بعد 7 أيام
      status: 'Draft',
      taxRate: 15,
      notes: '',
      items: [
        { itemName: '', quantity: 1, unitPrice: 0, description: '' },
      ],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // 6. حساب الإجمالي
  const { subtotal, taxAmount, grandTotal } = useMemo(() => {
    const items = form.getValues('items');
    const taxRate = form.getValues('taxRate') / 100;

    const calculatedSubtotal = items.reduce((acc, item) => {
      const total = (item.quantity || 0) * (item.unitPrice || 0);
      return acc + total;
    }, 0);

    const calculatedTaxAmount = calculatedSubtotal * taxRate;
    const calculatedGrandTotal = calculatedSubtotal + calculatedTaxAmount;

    return {
      subtotal: calculatedSubtotal,
      taxAmount: calculatedTaxAmount,
      grandTotal: calculatedGrandTotal,
    };
  }, [form.watch('items'), form.watch('taxRate')]); // إعادة الحساب عند تغيير الأصناف أو معدل الضريبة

  // 7. معالجة الإرسال
  const onSubmit = async (data: InvoiceFormValues) => {
    setIsLoading(true);
    setApiError(null);
    console.log('بيانات الفاتورة للإرسال:', data);

    // محاكاة استدعاء API
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // في حالة النجاح
      console.log('تم إنشاء الفاتورة بنجاح!');
      // form.reset(); // يمكن إعادة تعيين النموذج بعد النجاح
    } catch (error) {
      setApiError('فشل في إنشاء الفاتورة. يرجى التحقق من اتصال الشبكة والمحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* رسالة خطأ عامة */}
          {apiError && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded text-right">
              <p>{apiError}</p>
            </div>
          )}

          {/* القسم الأول: معلومات الفاتورة الأساسية */}
          <Card className="shadow-lg">
            <CardHeader className="text-right">
              <CardTitle>تفاصيل الفاتورة</CardTitle>
              <CardDescription>المعلومات الأساسية للعميل وتواريخ الفاتورة.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* اسم العميل */}
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>اسم العميل</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل اسم العميل أو اختر من القائمة" {...field} dir="rtl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* تاريخ الفاتورة */}
                <FormField
                  control={form.control}
                  name="invoiceDate"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>تاريخ الفاتورة</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} dir="rtl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* تاريخ الاستحقاق */}
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>تاريخ الاستحقاق</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} dir="rtl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* حالة الفاتورة */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>الحالة</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} dir="rtl">
                        <FormControl>
                          <SelectTrigger className="text-right">
                            <SelectValue placeholder="اختر حالة الفاتورة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent dir="rtl">
                          <SelectItem value="Draft">مسودة</SelectItem>
                          <SelectItem value="Sent">مرسلة</SelectItem>
                          <SelectItem value="Paid">مدفوعة</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* معدل الضريبة */}
                <FormField
                  control={form.control}
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>معدل الضريبة (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="مثال: 15" {...field} dir="rtl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* القسم الثاني: الأصناف (Line Items) */}
          <Card className="shadow-lg">
            <CardHeader className="text-right">
              <CardTitle>الأصناف والخدمات</CardTitle>
              <CardDescription>أضف المنتجات أو الخدمات التي سيتم فوترتها.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="w-full text-right">
                <TableHeader>
                  <TableRow className="rtl:text-right">
                    <TableHead className="w-[40%] text-right">الصنف/الوصف</TableHead>
                    <TableHead className="w-[15%] text-right">الكمية</TableHead>
                    <TableHead className="w-[20%] text-right">سعر الوحدة</TableHead>
                    <TableHead className="w-[20%] text-right">الإجمالي</TableHead>
                    <TableHead className="w-[5%] text-right">إجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id} className={cn(form.formState.errors.items?.[index] && 'bg-red-50')}>
                      {/* اسم الصنف */}
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.itemName`}
                          render={({ field: itemField }) => (
                            <FormItem className="space-y-1">
                              <FormControl>
                                <Input placeholder="اسم الصنف" {...itemField} dir="rtl" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field: descField }) => (
                            <FormItem className="mt-1">
                              <FormControl>
                                <Input placeholder="وصف قصير (اختياري)" {...descField} dir="rtl" className="text-xs" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TableCell>

                      {/* الكمية */}
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field: quantityField }) => (
                            <FormItem className="space-y-1">
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...quantityField}
                                  onChange={(e) => {
                                    quantityField.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value));
                                    form.trigger(`items.${index}.quantity`);
                                  }}
                                  dir="rtl"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>

                      {/* سعر الوحدة */}
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.unitPrice`}
                          render={({ field: priceField }) => (
                            <FormItem className="space-y-1">
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  step="0.01"
                                  {...priceField}
                                  onChange={(e) => {
                                    priceField.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value));
                                    form.trigger(`items.${index}.unitPrice`);
                                  }}
                                  dir="rtl"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>

                      {/* الإجمالي المحسوب */}
                      <TableCell className="font-semibold">
                        {(form.getValues(`items.${index}.quantity`) * form.getValues(`items.${index}.unitPrice`)).toFixed(2)}
                      </TableCell>

                      {/* زر الحذف */}
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* زر إضافة صنف */}
              <Button
                type="button"
                variant="outline"
                className="mt-4 w-full justify-center gap-2"
                onClick={() => append({ itemName: '', quantity: 1, unitPrice: 0, description: '' })}
              >
                <Plus className="h-4 w-4" />
                إضافة صنف جديد
              </Button>
              {form.formState.errors.items?.root && (
                <p className="text-sm font-medium text-red-500 mt-2 text-right">
                  {form.formState.errors.items.root.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* القسم الثالث: الملاحظات والإجمالي */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* الملاحظات */}
            <div className="md:col-span-2">
              <Card className="shadow-lg h-full">
                <CardHeader className="text-right">
                  <CardTitle>ملاحظات</CardTitle>
                  <CardDescription>أي ملاحظات إضافية أو شروط للدفع.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="text-right">
                        <FormControl>
                          <Textarea
                            placeholder="أدخل ملاحظات الفاتورة هنا..."
                            className="resize-none min-h-[150px]"
                            {...field}
                            dir="rtl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* ملخص الإجمالي */}
            <div className="md:col-span-1">
              <Card className="shadow-lg">
                <CardHeader className="text-right">
                  <CardTitle>ملخص الفاتورة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">الإجمالي الفرعي:</span>
                    <span className="font-medium">{subtotal.toFixed(2)} ريال</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">الضريبة ({form.getValues('taxRate')}%):</span>
                    <span className="font-medium">{taxAmount.toFixed(2)} ريال</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold">
                    <span>الإجمالي الكلي:</span>
                    <span className="text-primary">{grandTotal.toFixed(2)} ريال</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* زر الإرسال */}
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading} className="min-w-[150px] gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                'إنشاء الفاتورة'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </DashboardLayout>
  );
};

export default NewInvoiceForm;
