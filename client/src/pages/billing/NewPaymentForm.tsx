// @ts-nocheck
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

// 1. Placeholder for DashboardLayout and Toast (Assuming they are set up in the project)
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-4 sm:p-8 bg-gray-50 min-h-screen" dir="rtl">
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-xl border border-gray-200">
      {children}
    </div>
  </div>
);

// 2. Define Schema for Validation
const paymentSchema = z.object({
  invoiceId: z.string().min(1, { message: 'رقم الفاتورة مطلوب.' }),
  paymentDate: z.date({
    required_error: 'تاريخ الدفع مطلوب.',
  }),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'credit_card'], {
    required_error: 'طريقة الدفع مطلوبة.',
  }),
  amount: z.coerce.number().min(0.01, { message: 'يجب أن يكون المبلغ أكبر من صفر.' }),
  referenceNumber: z.string().optional(),
  notes: z.string().max(500, { message: 'الحد الأقصى للملاحظات هو 500 حرف.' }).optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

// 3. Define the Component
const NewPaymentForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      invoiceId: '',
      paymentDate: new Date(),
      paymentMethod: 'cash',
      amount: 0,
      referenceNumber: '',
      notes: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: PaymentFormValues) => {
    setIsLoading(true);
    setError(null);
    console.log('بيانات الدفعة:', values);

    // Simulate API call (POST /api/payments)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

      // Simulate a successful response
      toast({
        title: 'نجاح العملية',
        description: `تم تسجيل دفعة جديدة للفاتورة رقم ${values.invoiceId} بنجاح.`,
      });

      form.reset({
        invoiceId: '',
        paymentDate: new Date(),
        paymentMethod: 'cash',
        amount: 0,
        referenceNumber: '',
        notes: '',
      });
    } catch (err) {
      // Simulate an API error
      const errorMessage = 'فشل في تسجيل الدفعة. يرجى التحقق من البيانات والمحاولة مرة أخرى.';
      setError(errorMessage);
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <h1 className="text-3xl font-bold text-gray-800 border-b pb-2">تسجيل دفعة جديدة للفاتورة</h1>
        <p className="text-gray-600">يرجى ملء الحقول التالية لتسجيل دفعة جديدة مقابل فاتورة مستحقة.</p>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg" role="alert">
            <p className="font-bold">خطأ في الإرسال:</p>
            <p>{error}</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* حقل رقم الفاتورة */}
              <FormField
                control={form.control}
                name="invoiceId"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>رقم الفاتورة</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل رقم الفاتورة" {...field} disabled={isLoading} className="text-right" />
                    </FormControl>
                    <FormDescription className="text-right">
                      رقم الفاتورة المستحقة الدفع.
                    </FormDescription>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />

              {/* حقل المبلغ المدفوع */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>المبلغ المدفوع (بالعملة المحلية)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={e => field.onChange((e.target as HTMLInputElement).value === '' ? 0 : parseFloat((e.target as HTMLInputElement).value))}
                        disabled={isLoading}
                        className="text-right"
                      />
                    </FormControl>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />

              {/* حقل تاريخ الدفع */}
              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }: { field: any }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-2">تاريخ الدفع</FormLabel>
                    <Popover dir="rtl">
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full justify-end text-right font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                            disabled={isLoading}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: ar })
                            ) : (
                              <span>اختر تاريخًا</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                          locale={ar}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />

              {/* حقل طريقة الدفع */}
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>طريقة الدفع</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger dir="rtl">
                          <SelectValue placeholder="اختر طريقة الدفع" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent dir="rtl">
                        <SelectItem value="cash">نقدًا</SelectItem>
                        <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                        <SelectItem value="credit_card">بطاقة ائتمان</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />

              {/* حقل الرقم المرجعي (يظهر فقط للتحويل البنكي والبطاقة) */}
              {['bank_transfer', 'credit_card'].includes(form.watch('paymentMethod')) && (
                <FormField
                  control={form.control}
                  name="referenceNumber"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>الرقم المرجعي/رقم العملية</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل الرقم المرجعي" {...field} disabled={isLoading} className="text-right" />
                      </FormControl>
                      <FormDescription className="text-right">
                        رقم تأكيد التحويل البنكي أو رقم العملية للبطاقة.
                      </FormDescription>
                      <FormMessage className="text-right" />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* حقل الملاحظات */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>ملاحظات إضافية</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أضف أي ملاحظات ذات صلة بالدفعة..."
                      className="resize-none text-right"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-right" />
                </FormItem>
              )}
            />

            {/* زر الإرسال مع حالة التحميل */}
            <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جارٍ التسجيل...
                </>
              ) : (
                'تسجيل الدفعة'
              )}
            </Button>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default NewPaymentForm;
