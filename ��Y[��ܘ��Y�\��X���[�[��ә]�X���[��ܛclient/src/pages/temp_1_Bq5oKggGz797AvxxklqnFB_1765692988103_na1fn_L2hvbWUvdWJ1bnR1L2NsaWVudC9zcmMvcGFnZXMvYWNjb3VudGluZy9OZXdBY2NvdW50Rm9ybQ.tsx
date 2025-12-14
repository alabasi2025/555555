import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, PlusCircle } from "lucide-react";

// استيراد مكونات shadcn/ui (افتراض وجودها في المسارات التالية)
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast"; // افتراض وجود مكون Toast

// افتراض وجود مكون التخطيط الرئيسي
const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="p-8 space-y-4 max-w-4xl mx-auto" dir="rtl">
    {children}
  </div>
);

// قائمة أنواع الحسابات المحاسبية
const AccountTypes = [
  { label: "أصول", value: "asset" },
  { label: "خصوم", value: "liability" },
  { label: "حقوق ملكية", value: "equity" },
  { label: "إيرادات", value: "revenue" },
  { label: "مصروفات", value: "expense" },
] as const;

// قائمة افتراضية للحسابات الأب (لأغراض العرض)
const ParentAccounts = [
  { label: "لا يوجد حساب أب", value: "" },
  { label: "1000 - الأصول المتداولة", value: "1000" },
  { label: "2000 - الخصوم المتداولة", value: "2000" },
  { label: "3000 - رأس المال", value: "3000" },
] as const;

// 1. تعريف مخطط التحقق (Validation Schema) باستخدام Zod
const formSchema = z.object({
  accountName: z
    .string({ required_error: "اسم الحساب مطلوب." })
    .min(3, { message: "يجب أن لا يقل اسم الحساب عن 3 أحرف." })
    .max(100, { message: "يجب أن لا يزيد اسم الحساب عن 100 حرف." }),
  accountNumber: z
    .string({ required_error: "رقم الحساب مطلوب." })
    .regex(/^[0-9]+$/, { message: "يجب أن يكون رقم الحساب أرقاماً فقط." })
    .min(4, { message: "يجب أن لا يقل رقم الحساب عن 4 أرقام." }),
  accountType: z.enum(AccountTypes.map((t) => t.value) as [string, ...string[]], {
    required_error: "نوع الحساب مطلوب.",
  }),
  parentAccount: z.string().optional(),
  initialBalance: z.coerce
    .number({ invalid_type_error: "يجب أن يكون الرصيد الافتتاحي رقماً." })
    .min(0, { message: "يجب أن يكون الرصيد الافتتاحي صفراً أو أكبر." })
    .optional()
    .default(0),
  description: z.string().max(500, { message: "الحد الأقصى للوصف هو 500 حرف." }).optional(),
});

type NewAccountFormValues = z.infer<typeof formSchema>;

// القيم الافتراضية للنموذج
const defaultValues: Partial<NewAccountFormValues> = {
  accountName: "",
  accountNumber: "",
  accountType: undefined,
  parentAccount: "",
  initialBalance: 0,
  description: "",
};

export default function NewAccountForm() {
  const { toast } = useToast(); // افتراض استخدام useToast من shadcn/ui

  // 2. تهيئة النموذج باستخدام react-hook-form و zodResolver
  const form = useForm<NewAccountFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  const isLoading = form.formState.isSubmitting;
  const isError = form.formState.errors && Object.keys(form.formState.errors).length > 0;

  // 3. دالة معالجة الإرسال
  async function onSubmit(values: NewAccountFormValues) {
    // محاكاة عملية إرسال API
    console.log("بيانات النموذج:", values);

    try {
      // محاكاة تأخير الشبكة
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // محاكاة نجاح الإرسال
      console.log("تم إنشاء الحساب بنجاح.");
      toast({
        title: "نجاح العملية",
        description: `تم إضافة الحساب "${values.accountName}" بنجاح.`,
      });

      // إعادة تعيين النموذج بعد النجاح
      form.reset(defaultValues);
    } catch (error) {
      // محاكاة فشل الإرسال
      console.error("خطأ في إنشاء الحساب:", error);
      toast({
        title: "فشل العملية",
        description: "حدث خطأ أثناء محاولة إضافة الحساب. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  }

  return (
    <DashboardLayout>
      <Card className="w-full" dir="rtl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <PlusCircle className="w-6 h-6 text-primary" />
            إضافة حساب محاسبي جديد
          </CardTitle>
          <CardDescription>
            قم بملء الحقول التالية لإنشاء حساب جديد في شجرة الحسابات. الحقول المشار إليها بعلامة (*) مطلوبة.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* عرض رسالة خطأ عامة إذا كان هناك خطأ في التحقق */}
          {isError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              يرجى مراجعة الحقول التي تحتوي على أخطاء قبل الإرسال.
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* حقل اسم الحساب */}
              <FormField
                control={form.control}
                name="accountName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الحساب (*)</FormLabel>
                    <FormControl>
                      <Input placeholder="مثل: نقدية في الصندوق" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>
                      الاسم الذي سيظهر في شجرة الحسابات والتقارير.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* حقل رقم الحساب */}
              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الحساب (*)</FormLabel>
                    <FormControl>
                      <Input placeholder="مثل: 1101" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>
                      رقم فريد لتحديد الحساب في النظام.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* حقل نوع الحساب */}
              <FormField
                control={form.control}
                name="accountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع الحساب (*)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger dir="rtl">
                          <SelectValue placeholder="اختر نوع الحساب" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent dir="rtl">
                        {AccountTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      يحدد طبيعة الحساب (أصول، خصوم، إيرادات، إلخ).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* حقل الحساب الأب */}
              <FormField
                control={form.control}
                name="parentAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحساب الأب (اختياري)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger dir="rtl">
                          <SelectValue placeholder="اختر الحساب الأب" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent dir="rtl">
                        {ParentAccounts.map((account) => (
                          <SelectItem key={account.value} value={account.value}>
                            {account.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      لربط هذا الحساب بحساب رئيسي في شجرة الحسابات.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* حقل الرصيد الافتتاحي */}
              <FormField
                control={form.control}
                name="initialBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الرصيد الافتتاحي (اختياري)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      الرصيد الذي يبدأ به الحساب. (يجب أن يكون صفراً أو موجباً).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* حقل الوصف */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوصف (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="أضف وصفاً مختصراً للحساب..."
                        className="resize-none"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* زر الإرسال مع حالة التحميل */}
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الإضافة...
                  </>
                ) : (
                  "إضافة الحساب"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
