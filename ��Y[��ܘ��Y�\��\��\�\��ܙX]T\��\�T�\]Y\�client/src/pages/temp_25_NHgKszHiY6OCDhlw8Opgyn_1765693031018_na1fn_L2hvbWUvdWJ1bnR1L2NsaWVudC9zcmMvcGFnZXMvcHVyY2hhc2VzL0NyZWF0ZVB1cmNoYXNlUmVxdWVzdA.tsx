import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, Loader2, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// افتراض توفر المكونات التالية من shadcn/ui ومكون تخطيط مخصص
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils'; // دالة مساعدة لدمج فئات Tailwind
import DashboardLayout from '@/components/layout/DashboardLayout'; // افتراض وجود مكون التخطيط

// 1. تعريف مخطط التحقق (Validation Schema)
const itemSchema = z.object({
  name: z.string().min(3, { message: 'يجب أن لا يقل اسم الصنف عن 3 أحرف.' }),
  quantity: z.number().min(1, { message: 'يجب أن تكون الكمية 1 على الأقل.' }),
  unit: z.string().min(1, { message: 'الوحدة مطلوبة.' }),
  estimatedPrice: z.number().min(0, { message: 'يجب أن يكون السعر التقديري موجباً.' }).optional(),
});

const formSchema = z.object({
  title: z.string().min(5, { message: 'يجب أن لا يقل عنوان الطلب عن 5 أحرف.' }),
  departmentId: z.string().min(1, { message: 'القسم المطلوب.' }),
  requiredDeliveryDate: z.date({ required_error: 'تاريخ التسليم المطلوب إلزامي.' }),
  justification: z.string().min(10, { message: 'يجب تقديم مبرر مفصل للطلب.' }),
  items: z.array(itemSchema).min(1, { message: 'يجب إضافة صنف واحد على الأقل لطلب الشراء.' }),
});

type PurchaseRequestFormValues = z.infer<typeof formSchema>;

// بيانات وهمية للأقسام والوحدات
const departments = [
  { id: '1', name: 'قسم الصيانة' },
  { id: '2', name: 'قسم التشغيل' },
  { id: '3', name: 'قسم المشتريات' },
];

const units = ['قطعة', 'كجم', 'لتر', 'متر', 'صندوق'];

const CreatePurchaseRequest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<PurchaseRequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      departmentId: '',
      justification: '',
      items: [{ name: '', quantity: 1, unit: units[0], estimatedPrice: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const onSubmit = async (values: PurchaseRequestFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // محاكاة لعملية إرسال البيانات إلى الخادم
    try {
      console.log('بيانات طلب الشراء المرسلة:', values);
      // هنا يتم استدعاء API: POST /api/purchase-requests
      await new Promise(resolve => setTimeout(resolve, 2000)); // محاكاة تأخير الشبكة

      setSuccess('تم إرسال طلب الشراء بنجاح. سيتم مراجعته من قبل الإدارة.');
      form.reset(); // إعادة تعيين النموذج بعد النجاح
    } catch (err) {
      setError('فشل إرسال طلب الشراء. يرجى التحقق من اتصالك والمحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-10 px-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-right">إنشاء طلب شراء جديد</CardTitle>
            <CardDescription className="text-right">
              يرجى ملء جميع الحقول المطلوبة لتقديم طلب شراء.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* رسائل الحالة */}
                {error && (
                  <Alert variant="destructive" className="text-right">
                    <AlertTitle>خطأ في الإرسال</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="bg-green-50 border-green-200 text-green-700 text-right">
                    <AlertTitle>نجاح</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {/* معلومات الطلب الأساسية */}
                <h3 className="text-lg font-semibold border-b pb-2 text-right">1. تفاصيل الطلب الأساسية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* عنوان الطلب */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="text-right">
                        <FormLabel>عنوان الطلب</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: طلب شراء قطع غيار لمولد رقم 3" {...field} className="text-right" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* القسم المطلوب */}
                  <FormField
                    control={form.control}
                    name="departmentId"
                    render={({ field }) => (
                      <FormItem className="text-right">
                        <FormLabel>القسم الطالب</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger dir="rtl" className="text-right">
                              <SelectValue placeholder="اختر القسم" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent dir="rtl">
                            {departments.map(dept => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* تاريخ التسليم المطلوب */}
                  <FormField
                    control={form.control}
                    name="requiredDeliveryDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col text-right">
                        <FormLabel className="mb-2">تاريخ التسليم المطلوب</FormLabel>
                        <Popover dir="rtl">
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full justify-end text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP', { locale: ar })
                                ) : (
                                  <span>اختر تاريخاً</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              locale={ar}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* مبررات الطلب */}
                <FormField
                  control={form.control}
                  name="justification"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>مبررات/غرض الطلب</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="اشرح بالتفصيل سبب الحاجة لهذه المشتريات وأهميتها."
                          className="resize-none text-right"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                {/* قائمة الأصناف المطلوبة */}
                <h3 className="text-lg font-semibold border-b pb-2 text-right">2. قائمة الأصناف</h3>
                <div className="space-y-4">
                  {fields.map((item, index) => (
                    <Card key={item.id} className="p-4 bg-gray-50/50">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-right">الصنف رقم {index + 1}</h4>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => remove(index)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4 ml-2" />
                            حذف الصنف
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* اسم الصنف */}
                        <FormField
                          control={form.control}
                          name={`items.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2 text-right">
                              <FormLabel>اسم/وصف الصنف</FormLabel>
                              <FormControl>
                                <Input placeholder="مثال: زيت محركات صناعي" {...field} className="text-right" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* الكمية */}
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem className="text-right">
                              <FormLabel>الكمية</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="الكمية"
                                  {...field}
                                  onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                  className="text-right"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* الوحدة */}
                        <FormField
                          control={form.control}
                          name={`items.${index}.unit`}
                          render={({ field }) => (
                            <FormItem className="text-right">
                              <FormLabel>الوحدة</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger dir="rtl" className="text-right">
                                    <SelectValue placeholder="اختر وحدة" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent dir="rtl">
                                  {units.map(unit => (
                                    <SelectItem key={unit} value={unit}>
                                      {unit}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* السعر التقديري (اختياري) */}
                        <FormField
                          control={form.control}
                          name={`items.${index}.estimatedPrice`}
                          render={({ field }) => (
                            <FormItem className="text-right">
                              <FormLabel>السعر التقديري (اختياري)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="السعر بالريال"
                                  {...field}
                                  value={field.value === undefined ? '' : field.value}
                                  onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                  className="text-right"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  ))}

                  {/* زر إضافة صنف جديد */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ name: '', quantity: 1, unit: units[0], estimatedPrice: undefined })}
                    disabled={isLoading}
                    className="w-full justify-center mt-4"
                  >
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة صنف جديد
                  </Button>
                  {form.formState.errors.items && (
                    <p className="text-sm font-medium text-destructive text-right mt-2">
                      {form.formState.errors.items.message}
                    </p>
                  )}
                </div>

                <Separator />

                {/* زر الإرسال */}
                <div className="flex justify-end space-x-4 space-x-reverse pt-4">
                  <Button type="button" variant="outline" disabled={isLoading}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      'إرسال طلب الشراء'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreatePurchaseRequest;
