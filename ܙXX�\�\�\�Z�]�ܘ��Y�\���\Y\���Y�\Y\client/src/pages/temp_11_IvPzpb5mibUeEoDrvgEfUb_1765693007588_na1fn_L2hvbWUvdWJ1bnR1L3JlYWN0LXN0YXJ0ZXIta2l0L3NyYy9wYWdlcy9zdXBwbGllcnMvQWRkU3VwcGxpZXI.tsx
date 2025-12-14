import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

// افتراض وجود هذا المكون في المشروع
import DashboardLayout from '@/layouts/DashboardLayout';

// 1. تحديد مخطط التحقق (Schema) باستخدام Zod
const formSchema = z.object({
  name: z.string().min(2, { message: 'يجب أن يحتوي اسم المورد على حرفين على الأقل.' }),
  contactPerson: z.string().min(2, { message: 'يجب أن يحتوي اسم مسؤول الاتصال على حرفين على الأقل.' }),
  email: z.string().email({ message: 'البريد الإلكتروني غير صالح.' }),
  phone: z.string().regex(/^(\+?\d{1,3})?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/, {
    message: 'رقم الهاتف غير صالح.',
  }),
  address: z.string().min(10, { message: 'يجب إدخال عنوان مفصل للمورد.' }),
  supplierType: z.enum(['local', 'international'], {
    errorMap: () => ({ message: 'الرجاء اختيار نوع المورد.' }),
  }),
  taxId: z.string().optional(),
});

type SupplierFormValues = z.infer<typeof formSchema>;

const AddSupplier: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      supplierType: 'local',
      taxId: '',
    },
  });

  // 2. دالة معالجة الإرسال
  const onSubmit = async (values: SupplierFormValues) => {
    setIsLoading(true);
    setError(null);
    console.log('بيانات النموذج المرسلة:', values);

    // محاكاة استدعاء API
    try {
      // افتراض أن الاستدعاء سيستغرق 1.5 ثانية
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // محاكاة خطأ بنسبة 10%
          if (Math.random() < 0.1) {
            reject(new Error('فشل في الاتصال بالخادم.'));
          } else {
            resolve(true);
          }
        }, 1500);
      });

      toast({
        title: 'تم بنجاح',
        description: `تم إضافة المورد "${values.name}" بنجاح.`,
        variant: 'default',
      });
      form.reset(); // إعادة تعيين النموذج بعد النجاح
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء الإضافة.';
      setError(errorMessage);
      toast({
        title: 'خطأ في الإرسال',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10 max-w-3xl">
        <Card className="w-full">
          <CardHeader className="text-right">
            <CardTitle className="text-2xl font-bold">إضافة مورد جديد</CardTitle>
            <CardDescription>
              املأ الحقول التالية لإضافة مورد جديد إلى نظام إدارة محطات الكهرباء.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-right">
                <p className="font-bold">خطأ:</p>
                <p>{error}</p>
              </div>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* اسم المورد */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>اسم المورد</FormLabel>
                      <FormControl>
                        <Input placeholder="شركة الكهرباء الوطنية" {...field} dir="rtl" />
                      </FormControl>
                      <FormMessage className="text-right" />
                    </FormItem>
                  )}
                />

                {/* اسم مسؤول الاتصال */}
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>اسم مسؤول الاتصال</FormLabel>
                      <FormControl>
                        <Input placeholder="أحمد محمد" {...field} dir="rtl" />
                      </FormControl>
                      <FormMessage className="text-right" />
                    </FormItem>
                  )}
                />

                {/* البريد الإلكتروني */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <Input placeholder="info@supplier.com" {...field} dir="ltr" />
                      </FormControl>
                      <FormMessage className="text-right" />
                    </FormItem>
                  )}
                />

                {/* رقم الهاتف */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>رقم الهاتف</FormLabel>
                      <FormControl>
                        <Input placeholder="+966 50 123 4567" {...field} dir="ltr" />
                      </FormControl>
                      <FormMessage className="text-right" />
                    </FormItem>
                  )}
                />

                {/* نوع المورد */}
                <FormField
                  control={form.control}
                  name="supplierType"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>نوع المورد</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} dir="rtl">
                        <FormControl>
                          <SelectTrigger className="text-right">
                            <SelectValue placeholder="اختر نوع المورد" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent dir="rtl">
                          <SelectItem value="local">مورد محلي</SelectItem>
                          <SelectItem value="international">مورد دولي</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-right" />
                    </FormItem>
                  )}
                />

                {/* الرقم الضريبي (اختياري) */}
                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>الرقم الضريبي (اختياري)</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890" {...field} dir="ltr" />
                      </FormControl>
                      <FormMessage className="text-right" />
                    </FormItem>
                  )}
                />

                {/* العنوان */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>العنوان التفصيلي</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="الرياض، حي النرجس، شارع الأمير تركي بن عبد العزيز الأول"
                          className="resize-none text-right"
                          {...field}
                          dir="rtl"
                        />
                      </FormControl>
                      <FormMessage className="text-right" />
                    </FormItem>
                  )}
                />

                {/* زر الإرسال مع حالة التحميل */}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الإضافة...
                    </>
                  ) : (
                    'إضافة المورد'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AddSupplier;
