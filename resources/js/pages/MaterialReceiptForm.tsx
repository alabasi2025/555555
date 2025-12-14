import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Plus, Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react';

// استيراد مكونات shadcn/ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout'; // افتراض وجود هذا المكون للتخطيط

// -----------------------------------------------------------------------------
// 1. تعريف مخطط التحقق (Zod Schema)
// -----------------------------------------------------------------------------

const materialSchema = z.object({
  materialId: z.string().min(1, { message: 'يجب اختيار المادة.' }),
  materialName: z.string(), // اسم المادة للعرض
  orderedQuantity: z.number().min(1, { message: 'الكمية المطلوبة غير صالحة.' }),
  unit: z.string().min(1, { message: 'الوحدة مطلوبة.' }),
  receivedQuantity: z.number().min(1, { message: 'يجب إدخال الكمية المستلمة.' }),
  batchNumber: z.string().optional(),
}).refine(data => data.receivedQuantity <= data.orderedQuantity, {
  message: 'الكمية المستلمة لا يمكن أن تتجاوز الكمية المطلوبة.',
  path: ['receivedQuantity'],
});

const formSchema = z.object({
  purchaseOrderNumber: z.string().min(5, { message: 'رقم أمر الشراء مطلوب (5 أحرف على الأقل).' }),
  supplierName: z.string().min(2, { message: 'اسم المورد مطلوب.' }),
  receiptDate: z.string().min(1, { message: 'تاريخ الاستلام مطلوب.' }),
  supplierInvoiceNumber: z.string().min(1, { message: 'رقم فاتورة المورد مطلوب.' }),
  receiverName: z.string().min(2, { message: 'اسم المستلم مطلوب.' }),
  shipmentStatus: z.enum(['كاملة', 'ناقصة', 'تالفة'], {
    errorMap: () => ({ message: 'يجب اختيار حالة الشحنة.' }),
  }),
  notes: z.string().max(500, { message: 'الحد الأقصى للملاحظات هو 500 حرف.' }).optional(),
  materials: z.array(materialSchema).min(1, { message: 'يجب إضافة مادة واحدة على الأقل.' }),
});

type MaterialReceiptFormValues = z.infer<typeof formSchema>;

// -----------------------------------------------------------------------------
// 2. بيانات وهمية (لأغراض العرض)
// -----------------------------------------------------------------------------

const mockMaterials = [
  { id: 'M001', name: 'كابل نحاسي 10 مم', unit: 'متر', orderedQuantity: 500 },
  { id: 'M002', name: 'قاطع دائرة 100 أمبير', unit: 'قطعة', orderedQuantity: 50 },
  { id: 'M003', name: 'محول جهد 11 كيلو فولت', unit: 'وحدة', orderedQuantity: 5 },
];

// -----------------------------------------------------------------------------
// 3. المكون الرئيسي
// -----------------------------------------------------------------------------

const MaterialReceiptForm: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPoLoaded, setIsPoLoaded] = useState(false);

  const form = useForm<MaterialReceiptFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purchaseOrderNumber: '',
      supplierName: '',
      receiptDate: new Date().toISOString().split('T')[0],
      supplierInvoiceNumber: '',
      receiverName: 'المستخدم الحالي', // افتراض اسم مستخدم
      shipmentStatus: 'كاملة',
      notes: '',
      materials: [],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'materials',
  });

  // محاكاة تحميل بيانات أمر الشراء
  const loadPurchaseOrder = (poNumber: string) => {
    if (poNumber.length < 5) return;
    setIsLoading(true);
    // محاكاة طلب API: GET /api/purchase-orders/{poNumber}
    setTimeout(() => {
      setIsLoading(false);
      if (poNumber === 'PO-12345') {
        form.setValue('supplierName', 'شركة النور للتوريدات');
        form.setValue('materials', [
          { ...mockMaterials[0], receivedQuantity: 0 },
          { ...mockMaterials[1], receivedQuantity: 0 },
        ] as any);
        setIsPoLoaded(true);
        toast({
          title: 'تم تحميل أمر الشراء بنجاح',
          description: 'تم جلب بيانات المورد والمواد المرتبطة بأمر الشراء.',
          action: <CheckCircle className="h-5 w-5 text-green-500" />,
        });
      } else {
        form.setError('purchaseOrderNumber', { message: 'رقم أمر الشراء غير موجود أو تم استلامه بالكامل.' });
        form.setValue('supplierName', '');
        form.setValue('materials', []);
        setIsPoLoaded(false);
        toast({
          title: 'خطأ في التحميل',
          description: 'تعذر العثور على أمر الشراء المحدد.',
          action: <XCircle className="h-5 w-5 text-red-500" />,
          variant: 'destructive',
        });
      }
    }, 1500);
  };

  const onSubmit = async (data: MaterialReceiptFormValues) => {
    setIsLoading(true);
    console.log('بيانات النموذج المرسلة:', data);

    // محاكاة طلب API: POST /api/material-receipts
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsLoading(false);
    toast({
      title: 'تم الاستلام بنجاح',
      description: `تم تسجيل استلام المواد بنجاح برقم فاتورة ${data.supplierInvoiceNumber}.`,
      action: <CheckCircle className="h-5 w-5 text-green-500" />,
    });
    // إعادة تعيين النموذج بعد الإرسال الناجح
    form.reset();
    setIsPoLoaded(false);
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">واجهة استلام المواد</h1>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>بيانات الاستلام الأساسية</CardTitle>
                <CardDescription>
                  يرجى ملء تفاصيل أمر الشراء والمورد وتاريخ الاستلام.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* رقم أمر الشراء */}
                <FormField
                  control={form.control}
                  name="purchaseOrderNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم أمر الشراء</FormLabel>
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <FormControl>
                          <Input
                            placeholder="أدخل رقم أمر الشراء"
                            {...field}
                            disabled={isLoading}
                            onBlur={() => loadPurchaseOrder(field.value)}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          onClick={() => loadPurchaseOrder(field.value)}
                          disabled={isLoading || field.value.length < 5}
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'تحميل'}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* اسم المورد */}
                <FormField
                  control={form.control}
                  name="supplierName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المورد</FormLabel>
                      <FormControl>
                        <Input placeholder="اسم المورد" {...field} disabled={!isPoLoaded || isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* تاريخ الاستلام */}
                <FormField
                  control={form.control}
                  name="receiptDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ الاستلام</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* رقم فاتورة المورد */}
                <FormField
                  control={form.control}
                  name="supplierInvoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم فاتورة المورد</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل رقم فاتورة المورد" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* المستلم */}
                <FormField
                  control={form.control}
                  name="receiverName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المستلم</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* حالة الشحنة */}
                <FormField
                  control={form.control}
                  name="shipmentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>حالة الشحنة</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger dir="rtl">
                            <SelectValue placeholder="اختر حالة الشحنة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent dir="rtl">
                          <SelectItem value="كاملة">كاملة</SelectItem>
                          <SelectItem value="ناقصة">ناقصة</SelectItem>
                          <SelectItem value="تالفة">تالفة</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>تفاصيل المواد المستلمة</CardTitle>
                <CardDescription>
                  يرجى تسجيل الكميات المستلمة لكل مادة.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table dir="rtl">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">اسم المادة</TableHead>
                      <TableHead className="w-[15%] text-center">الكمية المطلوبة</TableHead>
                      <TableHead className="w-[20%]">الكمية المستلمة</TableHead>
                      <TableHead className="w-[15%] text-center">الوحدة</TableHead>
                      <TableHead className="w-[15%]">رقم الدفعة/التسلسل</TableHead>
                      <TableHead className="w-[5%] text-center">إجراء</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        {/* اسم المادة (للعرض فقط) */}
                        <TableCell className="font-medium">
                          {form.getValues(`materials.${index}.materialName`)}
                          <FormField
                            control={form.control}
                            name={`materials.${index}.materialId`}
                            render={() => <FormMessage />}
                          />
                        </TableCell>

                        {/* الكمية المطلوبة (للعرض فقط) */}
                        <TableCell className="text-center">
                          {form.getValues(`materials.${index}.orderedQuantity`)}
                        </TableCell>

                        {/* الكمية المستلمة */}
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`materials.${index}.receivedQuantity`}
                            render={({ field: receivedField }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="الكمية"
                                    {...receivedField}
                                    onChange={e => {
                                      receivedField.onChange(e.target.value === '' ? '' : Number(e.target.value));
                                    }}
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>

                        {/* الوحدة (للعرض فقط) */}
                        <TableCell className="text-center">
                          {form.getValues(`materials.${index}.unit`)}
                        </TableCell>

                        {/* رقم الدفعة/التسلسل */}
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`materials.${index}.batchNumber`}
                            render={({ field: batchField }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <Input placeholder="رقم الدفعة" {...batchField} disabled={isLoading} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>

                        {/* زر الحذف */}
                        <TableCell className="text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            disabled={isLoading || fields.length === 1}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* رسالة خطأ للمواد */}
                {form.formState.errors.materials && (
                  <p className="text-sm font-medium text-red-500 mt-2">
                    {form.formState.errors.materials.message}
                  </p>
                )}

                {/* زر إضافة مادة (لإضافة مواد غير موجودة في أمر الشراء - اختياري) */}
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    // محاكاة إضافة مادة جديدة يدوياً
                    append({
                      materialId: `M${Date.now()}`,
                      materialName: 'مادة مضافة يدوياً',
                      orderedQuantity: 9999, // كمية كبيرة لتمكين الاستلام اليدوي
                      unit: 'غير محدد',
                      receivedQuantity: 0,
                      batchNumber: '',
                    } as any);
                  }}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة مادة يدوياً
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ملاحظات إضافية</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملاحظات</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="أضف أي ملاحظات مهمة حول عملية الاستلام..."
                          rows={4}
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading || !form.formState.isValid}>
                {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                تسجيل الاستلام
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
};

export default MaterialReceiptForm;
