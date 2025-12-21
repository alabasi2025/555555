// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { useRoute } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Save, AlertTriangle, CheckCircle } from 'lucide-react';

// افتراض وجود هذه المكونات في المشروع (shadcn/ui)
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
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// افتراض وجود هذا المكون للتخطيط العام
import DashboardLayout from '@/components/DashboardLayout';

// -----------------------------------------------------------------------------
// 1. مخطط البيانات والتحقق (Schema and Validation)
// -----------------------------------------------------------------------------

const formSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: 'يجب أن يحتوي الاسم على 3 أحرف على الأقل.' })
      .max(50, { message: 'يجب ألا يتجاوز الاسم 50 حرفًا.' }),
    email: z.string().email({ message: 'البريد الإلكتروني غير صالح.' }),
    role: z.enum(['admin', 'user', 'viewer'], {
      required_error: 'الرجاء تحديد دور الحساب.',
    }),
    status: z.enum(['active', 'inactive'], {
      required_error: 'الرجاء تحديد حالة الحساب.',
    }),
    password: z
      .string()
      .min(8, { message: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل.' })
      .optional()
      .or(z.literal('')), // للسماح بحقل فارغ إذا لم يرغب المستخدم في التغيير
    confirmPassword: z
      .string()
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين.',
    path: ['confirmPassword'],
  });

type AccountFormValues = z.infer<typeof formSchema>;

// -----------------------------------------------------------------------------
// 2. البيانات الوهمية (Mock Data)
// -----------------------------------------------------------------------------

interface Account {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  status: 'active' | 'inactive';
}

const mockFetchAccount = (id: string): Promise<Account> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        name: 'أحمد علي',
        email: 'ahmad.ali@example.com',
        role: 'user',
        status: 'active',
      });
    }, 1000);
  });
};

const mockUpdateAccount = (
  id: string,
  data: Partial<AccountFormValues>,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // محاكاة خطأ في حالة معينة
      if (data.email === 'error@example.com') {
        reject(new Error('البريد الإلكتروني مستخدم بالفعل.'));
      } else {
        console.log(`Updating account ${id} with data:`, data);
        resolve();
      }
    }, 1500);
  });
};

// -----------------------------------------------------------------------------
// 3. المكون الرئيسي (Main Component)
// -----------------------------------------------------------------------------

const EditAccount: React.FC = () => {
  const { id } = useRoute<{ id: string }>();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'user',
      status: 'active',
      password: '',
      confirmPassword: '',
    },
  });

  // جلب بيانات الحساب عند تحميل المكون
  useEffect(() => {
    if (!id) {
      setFetchError('معرف الحساب غير متوفر.');
      setIsLoading(false);
      return;
    }

    const fetchAccount = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);
        const accountData = await mockFetchAccount(id);
        // تعيين القيم الافتراضية للنموذج
        form.reset({
          name: accountData.name,
          email: accountData.email,
          role: accountData.role,
          status: accountData.status,
          password: '', // لا يتم جلب كلمة المرور لأسباب أمنية
          confirmPassword: '',
        });
      } catch (error) {
        setFetchError('فشل في جلب بيانات الحساب. الرجاء المحاولة لاحقًا.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccount();
  }, [id, form]);

  // معالجة إرسال النموذج
  const onSubmit = async (values: AccountFormValues) => {
    setIsSubmitting(true);
    try {
      // إزالة الحقول الفارغة أو غير المطلوبة من بيانات الإرسال
      const dataToUpdate: Partial<AccountFormValues> = {
        name: values.name,
        email: values.email,
        role: values.role,
        status: values.status,
      };

      // إضافة كلمة المرور فقط إذا تم إدخالها
      if (values.password) {
        dataToUpdate.password = values.password;
      }

      await mockUpdateAccount(id!, dataToUpdate);

      toast({
        title: 'تم التحديث بنجاح',
        description: 'تم تعديل بيانات الحساب بنجاح.',
        action: <CheckCircle className="h-5 w-5 text-green-500" />,
      });

      // إعادة تعيين حقول كلمة المرور بعد التحديث الناجح
      form.setValue('password', '');
      form.setValue('confirmPassword', '');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'حدث خطأ غير متوقع أثناء التحديث.';
      toast({
        title: 'فشل التحديث',
        description: errorMessage,
        variant: 'destructive',
        action: <AlertTriangle className="h-5 w-5 text-white" />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // عرض حالة التحميل
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="mr-2 text-lg">جاري تحميل بيانات الحساب...</span>
        </div>
      </DashboardLayout>
    );
  }

  // عرض حالة الخطأ في الجلب
  if (fetchError) {
    return (
      <DashboardLayout>
        <Alert variant="destructive" className="max-w-xl mx-auto mt-10">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>خطأ في النظام</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-10">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-right">
              تعديل حساب المستخدم
            </CardTitle>
            <CardDescription className="text-right">
              قم بتحديث معلومات الحساب والدور والحالة لكافة المستخدمين.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                dir="rtl"
              >
                {/* حقل الاسم */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>الاسم الكامل</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="أدخل الاسم الكامل"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* حقل البريد الإلكتروني */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="example@domain.com"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* حقل الدور */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>دور الحساب</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger dir="rtl">
                            <SelectValue placeholder="اختر دور الحساب" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent dir="rtl">
                          <SelectItem value="admin">مسؤول (Admin)</SelectItem>
                          <SelectItem value="user">مستخدم (User)</SelectItem>
                          <SelectItem value="viewer">عارض (Viewer)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* حقل الحالة */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>حالة الحساب</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger dir="rtl">
                            <SelectValue placeholder="اختر حالة الحساب" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent dir="rtl">
                          <SelectItem value="active">نشط</SelectItem>
                          <SelectItem value="inactive">غير نشط</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-6 mt-6 space-y-6">
                  <h3 className="text-lg font-semibold text-right">
                    تغيير كلمة المرور (اختياري)
                  </h3>

                  {/* حقل كلمة المرور الجديدة */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>كلمة المرور الجديدة</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="اترك فارغًا للإبقاء على كلمة المرور الحالية"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* حقل تأكيد كلمة المرور */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>تأكيد كلمة المرور الجديدة</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="أعد إدخال كلمة المرور الجديدة"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* زر الإرسال */}
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="ml-2 h-4 w-4" />
                        حفظ التغييرات
                      </>
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

export default EditAccount;
