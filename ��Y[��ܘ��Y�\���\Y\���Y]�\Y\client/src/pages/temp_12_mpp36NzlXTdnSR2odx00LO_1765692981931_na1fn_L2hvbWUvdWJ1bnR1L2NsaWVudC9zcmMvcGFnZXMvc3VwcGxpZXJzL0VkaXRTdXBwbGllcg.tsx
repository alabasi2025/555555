import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, XCircle } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout"; // افتراض وجود هذا المكون

// 1. تعريف مخطط التحقق (Validation Schema) باستخدام Zod
const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "يجب أن لا يقل اسم المورد عن 3 أحرف." })
    .max(100, { message: "يجب أن لا يتجاوز اسم المورد 100 حرف." }),
  taxId: z.string().optional(),
  commercialRegNo: z.string().optional(),
  email: z
    .string()
    .email({ message: "البريد الإلكتروني غير صحيح." })
    .min(1, { message: "البريد الإلكتروني مطلوب." }),
  phone: z
    .string()
    .min(8, { message: "رقم الهاتف غير صحيح." })
    .max(15, { message: "رقم الهاتف طويل جداً." }),
  address: z.string().optional(),
});

// 2. تعريف نوع البيانات (TypeScript Type)
type SupplierFormValues = z.infer<typeof formSchema>;

// 3. بيانات مورد وهمية (للمحاكاة)
const mockSupplierData = {
  id: "supp-123",
  name: "شركة النور للمعدات الكهربائية",
  taxId: "3001234567890",
  commercialRegNo: "1010000001",
  email: "info@alnoor.com",
  phone: "0501234567",
  address: "الرياض، حي الملز، شارع الجامعة",
};

// 4. محاكاة وظائف API
const fetchSupplier = (id: string): Promise<SupplierFormValues> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === mockSupplierData.id) {
        resolve(mockSupplierData);
      } else {
        reject(new Error("المورد غير موجود."));
      }
    }, 1000);
  });
};

const updateSupplier = (
  id: string,
  data: SupplierFormValues
): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Updating supplier ${id} with data:`, data);
      resolve();
    }, 1500);
  });
};

// 5. المكون الرئيسي
const EditSupplier = () => {
  const { id } = useParams<{ id: string }>(); // افتراض استخدام react-router-dom للحصول على الـ ID
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      taxId: "",
      commercialRegNo: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  // جلب بيانات المورد عند تحميل المكون
  useEffect(() => {
    if (!id) {
      setError("لم يتم تحديد معرف المورد.");
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchSupplier(id);
        form.reset(data); // تعبئة النموذج بالبيانات المسترجعة
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "حدث خطأ أثناء جلب بيانات المورد."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, form]);

  // دالة معالجة الإرسال
  const onSubmit = async (values: SupplierFormValues) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await updateSupplier(id, values);
      toast({
        title: "تم بنجاح",
        description: "تم تحديث بيانات المورد بنجاح.",
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "خطأ في التحديث",
        description:
          "حدث خطأ أثناء محاولة تحديث بيانات المورد. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // عرض حالة التحميل أو الخطأ
  if (isLoading) {
    return (
      <DashboardLayout title="تعديل مورد">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="mr-2 text-lg">جاري تحميل بيانات المورد...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="تعديل مورد">
        <div className="flex flex-col items-center justify-center h-64 text-red-600 bg-red-50 p-6 rounded-lg border border-red-200">
          <XCircle className="h-10 w-10 mb-4" />
          <h2 className="text-xl font-bold">خطأ</h2>
          <p className="text-center mt-2">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="تعديل مورد">
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-100" dir="rtl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
          تعديل بيانات المورد: {form.getValues("name") || "..."}
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* معلومات أساسية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right block">
                      اسم المورد <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="أدخل اسم المورد"
                        {...field}
                        disabled={isSubmitting}
                        className="text-right"
                      />
                    </FormControl>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right block">الرقم الضريبي</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="أدخل الرقم الضريبي"
                        {...field}
                        disabled={isSubmitting}
                        className="text-right"
                      />
                    </FormControl>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="commercialRegNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right block">
                      رقم السجل التجاري
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="أدخل رقم السجل التجاري"
                        {...field}
                        disabled={isSubmitting}
                        className="text-right"
                      />
                    </FormControl>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />
            </div>

            {/* معلومات الاتصال */}
            <h2 className="text-xl font-semibold mt-8 mb-4 border-b pb-1 text-gray-700">
              بيانات الاتصال
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right block">
                      البريد الإلكتروني <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="example@domain.com"
                        {...field}
                        disabled={isSubmitting}
                        className="text-right"
                      />
                    </FormControl>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right block">
                      رقم الهاتف <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="05xxxxxxxx"
                        {...field}
                        disabled={isSubmitting}
                        className="text-right"
                      />
                    </FormControl>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-right block">العنوان</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أدخل عنوان المورد بالتفصيل"
                      {...field}
                      disabled={isSubmitting}
                      className="text-right min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage className="text-right" />
                </FormItem>
              )}
            />

            {/* زر الإرسال */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isDirty}
                className="w-full md:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 ml-2" />
                    حفظ التعديلات
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default EditSupplier;
