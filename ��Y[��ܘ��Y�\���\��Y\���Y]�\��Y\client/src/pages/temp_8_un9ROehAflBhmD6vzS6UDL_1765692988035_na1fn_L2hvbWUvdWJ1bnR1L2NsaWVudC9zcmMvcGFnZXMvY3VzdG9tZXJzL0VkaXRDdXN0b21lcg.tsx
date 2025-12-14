import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { DashboardLayout } from "@/components/layouts/DashboardLayout"; // افتراض وجود هذا المكون
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useParams } from "react-router-dom"; // افتراض استخدام react-router-dom

// 1. تعريف مخطط التحقق (Validation Schema) باستخدام Zod
const customerSchema = z.object({
  name: z.string().min(2, { message: "الاسم يجب أن يحتوي على حرفين على الأقل." }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح." }),
  phone: z.string().regex(/^(\+966|0)?5\d{8}$/, { message: "رقم الهاتف غير صالح (يجب أن يكون سعودياً ويبدأ بـ 05 أو +9665)." }),
  address: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

// بيانات عميل وهمية للمحاكاة
const mockCustomerData = {
  id: "cust-123",
  name: "أحمد محمد العلي",
  email: "ahmad.ali@example.com",
  phone: "+966501234567",
  address: "الرياض، حي النرجس، شارع الأمير تركي",
};

// محاكاة جلب بيانات العميل
const fetchCustomer = (id: string): Promise<CustomerFormValues> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Fetching customer with ID: ${id}`);
      resolve(mockCustomerData);
    }, 1000);
  });
};

// محاكاة تحديث بيانات العميل
const updateCustomer = (id: string, data: CustomerFormValues): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Updating customer ${id} with data:`, data);
      resolve();
    }, 1500);
  });
};

export default function EditCustomer() {
  const { id } = useParams<{ id: string }>(); // افتراض جلب الـ ID من المسار
  const { toast } = useToast();
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
    mode: "onChange",
  });

  // جلب بيانات العميل عند تحميل المكون
  useEffect(() => {
    if (!id) {
      setFetchError("لم يتم تحديد معرف العميل.");
      setIsFetching(false);
      return;
    }

    const loadCustomer = async () => {
      try {
        setIsFetching(true);
        setFetchError(null);
        const data = await fetchCustomer(id);
        form.reset(data); // تعبئة النموذج بالبيانات المسترجعة
      } catch (error) {
        setFetchError("فشل في جلب بيانات العميل. يرجى المحاولة مرة أخرى.");
        console.error(error);
      } finally {
        setIsFetching(false);
      }
    };

    loadCustomer();
  }, [id, form]);

  // معالج إرسال النموذج
  async function onSubmit(values: CustomerFormValues) {
    try {
      await updateCustomer(id || mockCustomerData.id, values);
      toast({
        title: "تم بنجاح",
        description: "تم تحديث بيانات العميل بنجاح.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث البيانات. يرجى التحقق من الاتصال والمحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  }

  // حالة التحميل أثناء جلب البيانات
  if (isFetching) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-lg text-gray-600">جاري تحميل بيانات العميل...</p>
        </div>
      </DashboardLayout>
    );
  }

  // حالة الخطأ أثناء جلب البيانات
  if (fetchError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600">خطأ</h1>
          <p className="mt-2 text-lg text-gray-700">{fetchError}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            إعادة المحاولة
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    // استخدام DashboardLayout للتخطيط العام
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8" dir="rtl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-right">تعديل بيانات العميل</CardTitle>
            <CardDescription className="text-right">
              قم بتحديث معلومات العميل الحالي. الحقول المطلوبة محددة بعلامة (*).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* حقل الاسم */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>الاسم الكامل (*)</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل الاسم الكامل" {...field} className="text-right" />
                      </FormControl>
                      <FormMessage className="text-right" />
                    </FormItem>
                  )}
                />

                {/* حقل البريد الإلكتروني */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>البريد الإلكتروني (*)</FormLabel>
                      <FormControl>
                        <Input placeholder="example@domain.com" {...field} className="text-right ltr:text-left" dir="ltr" />
                      </FormControl>
                      <FormMessage className="text-right" />
                    </FormItem>
                  )}
                />

                {/* حقل رقم الهاتف */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>رقم الهاتف (*)</FormLabel>
                      <FormControl>
                        <Input placeholder="+9665xxxxxxxx" {...field} className="text-right ltr:text-left" dir="ltr" />
                      </FormControl>
                      <FormMessage className="text-right" />
                    </FormItem>
                  )}
                />

                {/* حقل العنوان */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>العنوان</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="أدخل عنوان العميل بالتفصيل"
                          className="resize-none text-right"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-right" />
                    </FormItem>
                  )}
                />

                {/* زر الإرسال مع حالة التحميل */}
                <div className="flex justify-end">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      "حفظ التعديلات"
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
}
