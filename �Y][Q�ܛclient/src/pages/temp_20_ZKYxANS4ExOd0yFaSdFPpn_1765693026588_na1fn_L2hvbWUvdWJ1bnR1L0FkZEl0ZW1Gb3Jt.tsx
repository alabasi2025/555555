import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";

// استيراد مكونات shadcn/ui (يُفترض أنها موجودة في المسارات التالية)
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
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

// مكون تخطيط وهمي لتمثيل DashboardLayout
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-8 bg-gray-50 min-h-screen" dir="rtl">
    <div className="max-w-4xl mx-auto">{children}</div>
  </div>
);

// 1. تعريف مخطط التحقق (Zod Schema)
const itemSchema = z.object({
  name: z.string().min(3, {
    message: "يجب أن يحتوي اسم الصنف على 3 أحرف على الأقل.",
  }),
  code: z.string().min(1, {
    message: "رمز الصنف مطلوب.",
  }),
  category: z.string().min(1, {
    message: "يجب اختيار فئة.",
  }),
  unitOfMeasure: z.string().min(1, {
    message: "يجب اختيار وحدة قياس.",
  }),
  initialQuantity: z.coerce.number().min(0, {
    message: "يجب أن تكون الكمية الأولية رقماً موجباً.",
  }),
  minStockLevel: z.coerce.number().min(0, {
    message: "يجب أن يكون الحد الأدنى للمخزون رقماً موجباً.",
  }),
  location: z.string().min(1, {
    message: "يجب اختيار موقع.",
  }),
  description: z.string().max(500, {
    message: "يجب ألا يتجاوز الوصف 500 حرف.",
  }).optional().or(z.literal('')),
  supplier: z.string().optional().or(z.literal('')),
});

type ItemFormValues = z.infer<typeof itemSchema>;

// بيانات وهمية للقوائم المنسدلة
const categories = [
  { id: "1", name: "كهربائية" },
  { id: "2", name: "ميكانيكية" },
  { id: "3", name: "استهلاكية" },
];

const units = [
  { id: "1", name: "قطعة" },
  { id: "2", name: "متر" },
  { id: "3", name: "كيلوغرام" },
];

const locations = [
  { id: "1", name: "المستودع الرئيسي" },
  { id: "2", name: "مخزن المحطة أ" },
  { id: "3", name: "مخزن المحطة ب" },
];

// المكون الرئيسي
export const AddItemForm: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: "",
      code: "",
      category: "",
      unitOfMeasure: "",
      initialQuantity: 0,
      minStockLevel: 0,
      location: "",
      description: "",
      supplier: "",
    },
  });

  // 2. دالة معالجة الإرسال (Submit Handler)
  async function onSubmit(values: ItemFormValues) {
    setIsLoading(true);
    setIsError(false);
    console.log("بيانات النموذج:", values);

    // محاكاة استدعاء API (POST /api/inventory/items)
    try {
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 1500));

      // محاكاة خطأ عشوائي بنسبة 20%
      if (Math.random() < 0.2) {
        throw new Error("فشل في الاتصال بالخادم.");
      }

      toast({
        title: "نجاح الإضافة",
        description: `تمت إضافة الصنف "${values.name}" بنجاح.`,
        variant: "default",
      });
      form.reset(); // إعادة تعيين النموذج بعد النجاح

    } catch (error) {
      setIsError(true);
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع أثناء إضافة الصنف.";
      toast({
        title: "خطأ في الإضافة",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <Card className="w-full shadow-lg" dir="rtl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-right border-b pb-2">
            إضافة صنف جديد للمخزون
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* رسالة خطأ عامة */}
              {isError && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-right">
                  عفواً، حدث خطأ أثناء محاولة حفظ البيانات. يرجى التحقق من الاتصال والمحاولة مرة أخرى.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* اسم الصنف */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>اسم الصنف <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: محول كهربائي 1000KVA" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage className="text-right" />
                    </FormItem>
                  )}
                />

                {/* رمز الصنف */}
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>رمز الصنف <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: TR-1000-A" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage className="text-right" />
                    </FormItem>
                  )}
                />

                {/* الفئة */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>الفئة <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger dir="rtl">
                            <SelectValue placeholder="اختر فئة الصنف" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent dir="rtl">
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-right" />
                    </FormItem>
                  )}
                />

                {/* وحدة القياس */}
                <FormField
                  control={form.control}
                  name="unitOfMeasure"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>وحدة القياس <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger dir="rtl">
                            <SelectValue placeholder="اختر وحدة القياس" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent dir="rtl">
                          {units.map((unit) => (
                            <SelectItem key={unit.id} value={unit.name}>
                              {unit.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-right" />
                    </FormItem>
                  )}
                />

                {/* الكمية الأولية */}
                <FormField
                  control={form.control}
                  name="initialQuantity"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>الكمية الأولية <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} disabled={isLoading} />
                      </FormControl>
                      <FormMessage className="text-right" />
                    </FormItem>
                  )}
                />

                {/* الحد الأدنى للمخزون */}
                <FormField
                  control={form.control}
                  name="minStockLevel"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>الحد الأدنى للمخزون <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="10" {...field} onChange={e => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} disabled={isLoading} />
                      </FormControl>
                      <FormMessage className="text-right" />
                    </FormItem>
                  )}
                />

                {/* الموقع/المستودع */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>الموقع/المستودع <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger dir="rtl">
                            <SelectValue placeholder="اختر موقع التخزين" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent dir="rtl">
                          {locations.map((loc) => (
                            <SelectItem key={loc.id} value={loc.name}>
                              {loc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-right" />
                    </FormItem>
                  )}
                />

                {/* المورد (اختياري) */}
                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel>المورد (اختياري)</FormLabel>
                      <FormControl>
                        <Input placeholder="اسم المورد" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage className="text-right" />
                    </FormItem>
                  )}
                />
              </div>

              {/* الوصف */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="text-right">
                    <FormLabel>الوصف (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="وصف تفصيلي للصنف واستخداماته..."
                        className="resize-none"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />

              {/* زر الإرسال */}
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الإضافة...
                    </>
                  ) : (
                    "إضافة الصنف"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

// ملاحظة: يجب التأكد من تثبيت وتكوين shadcn/ui و react-hook-form و zod في المشروع.
// كما يجب توفير مكون useToast و DashboardLayout.
export default AddItemForm;
