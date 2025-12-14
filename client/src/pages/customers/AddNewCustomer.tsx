"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

// افتراض أن هذه المكونات موجودة في مسار shadcn/ui القياسي
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// افتراض وجود مكون التخطيط المطلوب
// يجب استبدال هذا بالمسار الفعلي في المشروع
import DashboardLayout from "@/components/DashboardLayout";

// 1. تعريف مخطط التحقق (Zod Schema)
const CustomerSchema = z.object({
  customerName: z
    .string()
    .min(3, {
      message: "يجب أن يحتوي اسم العميل على 3 أحرف على الأقل.",
    })
    .max(100, {
      message: "يجب ألا يتجاوز اسم العميل 100 حرف.",
    }),
  customerType: z.enum(["individual", "company"], {
    required_error: "الرجاء تحديد نوع العميل.",
  }),
  contactPerson: z
    .string()
    .min(3, {
      message: "يجب إدخال اسم شخص الاتصال.",
    }),
  phoneNumber: z
    .string()
    .regex(/^(\+?\d{1,4}[\s-]?)?(\d{9,15})$/, {
      message: "الرجاء إدخال رقم هاتف صحيح.",
    }),
  email: z
    .string()
    .email({
      message: "الرجاء إدخال بريد إلكتروني صحيح.",
    })
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .min(10, {
      message: "الرجاء إدخال عنوان مفصل (10 أحرف على الأقل).",
    }),
  nationalId: z
    .string()
    .min(5, {
      message: "الرجاء إدخال رقم الهوية أو السجل التجاري.",
    }),
});

type CustomerFormValues = z.infer<typeof CustomerSchema>;

// القيم الافتراضية للنموذج
const defaultValues: Partial<CustomerFormValues> = {
  customerName: "",
  customerType: "individual",
  contactPerson: "",
  phoneNumber: "",
  email: "",
  address: "",
  nationalId: "",
};

export default function AddNewCustomerPage() {
  const { toast } = useToast();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(CustomerSchema),
    defaultValues,
    mode: "onChange",
  });

  const { isSubmitting } = form.formState;

  // 2. دالة معالجة الإرسال (onSubmit)
  async function onSubmit(values: CustomerFormValues) {
    // محاكاة طلب API
    console.log("بيانات النموذج المرسلة:", values);

    try {
      // محاكاة تأخير الشبكة
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // محاكاة نجاح أو فشل عشوائي
          if (Math.random() > 0.1) {
            resolve(true); // نجاح
          } else {
            reject(new Error("فشل في الاتصال بقاعدة البيانات.")); // فشل
          }
        }, 1500);
      });

      // حالة النجاح
      toast({
        title: (
          <div className="flex items-center">
            <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
            <span>نجاح</span>
          </div>
        ),
        description: "تمت إضافة العميل الجديد بنجاح.",
        variant: "default",
      });

      // إعادة تعيين النموذج بعد النجاح
      form.reset(defaultValues);
    } catch (error) {
      // حالة الخطأ
      const errorMessage =
        error instanceof Error ? error.message : "حدث خطأ غير متوقع أثناء الإضافة.";
      toast({
        title: (
          <div className="flex items-center">
            <XCircle className="ml-2 h-5 w-5 text-red-500" />
            <span>خطأ في الإرسال</span>
          </div>
        ),
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

  return (
    <DashboardLayout>
      <div className="flex justify-center p-4 md:p-8">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-right">
              إضافة عميل جديد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                dir="rtl" // لضمان اتجاه النص من اليمين لليسار
              >
                {/* اسم العميل */}
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم العميل</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="أدخل الاسم الكامل للعميل"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* نوع العميل */}
                <FormField
                  control={form.control}
                  name="customerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع العميل</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger dir="rtl">
                            <SelectValue placeholder="اختر نوع العميل" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent dir="rtl">
                          <SelectItem value="individual">فرد</SelectItem>
                          <SelectItem value="company">شركة</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* شخص الاتصال */}
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>شخص الاتصال</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="اسم الشخص المسؤول عن التواصل"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* رقم الهاتف */}
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الهاتف</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="مثال: 05xxxxxxxx"
                          {...field}
                          disabled={isSubmitting}
                          dir="ltr" // للحفاظ على تنسيق الأرقام
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* البريد الإلكتروني */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني (اختياري)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="example@domain.com"
                          {...field}
                          disabled={isSubmitting}
                          dir="ltr" // للحفاظ على تنسيق البريد
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* رقم الهوية/السجل التجاري */}
                <FormField
                  control={form.control}
                  name="nationalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الهوية الوطنية / السجل التجاري</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="أدخل الرقم التعريفي الرسمي"
                          {...field}
                          disabled={isSubmitting}
                          dir="ltr" // للحفاظ على تنسيق الأرقام
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* العنوان */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>العنوان التفصيلي</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="أدخل العنوان الكامل للعميل"
                          {...field}
                          disabled={isSubmitting}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* زر الإرسال مع حالة التحميل */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                  إضافة العميل
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
