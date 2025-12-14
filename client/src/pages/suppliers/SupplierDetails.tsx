import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import DashboardLayout from '@/components/DashboardLayout'; // افتراض وجود هذا المكون
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Save, X, Edit, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast'; // افتراض وجود نظام إشعارات

// 1. تعريف أنواع البيانات (Types)
interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  registrationDate: string;
  isActive: boolean;
}

interface Purchase {
  id: string;
  invoiceNumber: string;
  date: string;
  totalAmount: number;
  status: 'تم الدفع' | 'قيد المراجعة' | 'ملغاة';
}

// 2. تعريف مخطط التحقق (Validation Schema)
const supplierFormSchema = z.object({
  name: z.string().min(2, { message: 'يجب أن يحتوي الاسم على حرفين على الأقل.' }),
  contactPerson: z.string().min(2, { message: 'يجب إدخال اسم شخص الاتصال.' }),
  phone: z.string().regex(/^(\+?\d{1,4}[\s-]?)?(\(?\d{3}\)?[\s-]?)?[\d\s-]{7,15}$/, {
    message: 'صيغة رقم الهاتف غير صحيحة.',
  }),
  email: z.string().email({ message: 'صيغة البريد الإلكتروني غير صحيحة.' }),
  address: z.string().min(5, { message: 'يجب إدخال عنوان كامل.' }),
});

type SupplierFormValues = z.infer<typeof supplierFormSchema>;

// 3. بيانات وهمية (Mock Data)
const mockSupplier: Supplier = {
  id: 'SUP001',
  name: 'شركة النور للمعدات الكهربائية',
  contactPerson: 'أحمد محمود',
  phone: '+966 50 123 4567',
  email: 'ahmad.mahmoud@alnoor.com',
  address: 'الرياض، حي الصناعية، شارع 10، مبنى 5',
  registrationDate: '2022-05-15',
  isActive: true,
};

const mockPurchases: Purchase[] = [
  { id: 'INV001', invoiceNumber: 'P-2024-001', date: '2024-10-01', totalAmount: 150000.5, status: 'تم الدفع' },
  { id: 'INV002', invoiceNumber: 'P-2024-002', date: '2024-10-15', totalAmount: 85000.0, status: 'قيد المراجعة' },
  { id: 'INV003', invoiceNumber: 'P-2024-003', date: '2024-11-05', totalAmount: 220000.75, status: 'تم الدفع' },
  { id: 'INV004', invoiceNumber: 'P-2024-004', date: '2024-11-20', totalAmount: 45000.0, status: 'ملغاة' },
];

// 4. المكون الرئيسي
const SupplierDetails: React.FC = () => {
  // افتراض استخراج الـ ID من المسار
  const { id } = useRoute<{ id: string }>();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
    },
  });

  // محاكاة جلب البيانات
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // محاكاة جلب تفاصيل المورد (GET /api/suppliers/{id})
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSupplier(mockSupplier);
        form.reset({
          name: mockSupplier.name,
          contactPerson: mockSupplier.contactPerson,
          phone: mockSupplier.phone,
          email: mockSupplier.email,
          address: mockSupplier.address,
        });

        // محاكاة جلب قائمة المشتريات (GET /api/suppliers/{id}/purchases)
        await new Promise(resolve => setTimeout(resolve, 500));
        setPurchases(mockPurchases);
      } catch (err) {
        setError('فشل في جلب بيانات المورد. يرجى المحاولة مرة أخرى.');
        toast({
          title: 'خطأ',
          description: 'حدث خطأ أثناء تحميل البيانات.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // دالة معالجة إرسال النموذج
  const onSubmit = async (values: SupplierFormValues) => {
    setIsSaving(true);
    setError(null);
    try {
      // محاكاة إرسال تحديث البيانات (PUT /api/suppliers/{id})
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSupplier(prev => (prev ? { ...prev, ...values } : null));
      setIsEditing(false);
      toast({
        title: 'نجاح',
        description: 'تم تحديث بيانات المورد بنجاح.',
      });
    } catch (err) {
      setError('فشل في تحديث بيانات المورد.');
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ البيانات.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // حالة التحميل
  if (isLoading) {
    return (
      <DashboardLayout title="تفاصيل المورد">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="mr-2">جاري تحميل البيانات...</span>
        </div>
      </DashboardLayout>
    );
  }

  // حالة الخطأ
  if (error) {
    return (
      <DashboardLayout title="تفاصيل المورد">
        <div className="flex flex-col items-center justify-center h-64 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">خطأ في التحميل</h2>
          <p className="text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            إعادة المحاولة
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!supplier) {
    return (
      <DashboardLayout title="تفاصيل المورد">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-700">المورد غير موجود</h2>
          <p className="text-gray-500 mt-2">لم يتم العثور على مورد بالمعرف: {id}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`تفاصيل المورد: ${supplier.name}`}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">
              {supplier.name}
            </CardTitle>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  supplier.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {supplier.isActive ? 'نشط' : 'غير نشط'}
              </span>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  <Edit className="h-4 w-4 ml-2 rtl:mr-2" />
                  تعديل
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              تاريخ التسجيل: {new Date(supplier.registrationDate).toLocaleDateString('ar-EG')}
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">معلومات المورد</TabsTrigger>
            <TabsTrigger value="purchases">قائمة المشتريات</TabsTrigger>
          </TabsList>

          {/* تبويب معلومات المورد */}
          <TabsContent value="info" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>بيانات المورد الأساسية</CardTitle>
                <CardDescription>عرض وتعديل بيانات الاتصال والعنوان للمورد.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* حقل اسم المورد */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اسم المورد</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="اسم الشركة"
                                {...field}
                                disabled={!isEditing || isSaving}
                                dir="rtl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* حقل شخص الاتصال */}
                      <FormField
                        control={form.control}
                        name="contactPerson"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>شخص الاتصال</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="اسم المسؤول"
                                {...field}
                                disabled={!isEditing || isSaving}
                                dir="rtl"
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
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>البريد الإلكتروني</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="example@company.com"
                                {...field}
                                disabled={!isEditing || isSaving}
                                dir="ltr"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* حقل رقم الهاتف */}
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>رقم الهاتف</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+966 5x xxx xxxx"
                                {...field}
                                disabled={!isEditing || isSaving}
                                dir="ltr"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* حقل العنوان */}
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>العنوان</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="العنوان التفصيلي للمورد"
                              {...field}
                              disabled={!isEditing || isSaving}
                              dir="rtl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {isEditing && (
                      <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            form.reset(supplier);
                            setIsEditing(false);
                          }}
                          disabled={isSaving}
                        >
                          <X className="h-4 w-4 ml-2 rtl:mr-2" />
                          إلغاء
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin ml-2 rtl:mr-2" />
                          ) : (
                            <Save className="h-4 w-4 ml-2 rtl:mr-2" />
                          )}
                          حفظ التعديلات
                        </Button>
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب قائمة المشتريات */}
          <TabsContent value="purchases" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>سجل المشتريات</CardTitle>
                <CardDescription>قائمة بجميع فواتير المشتريات من هذا المورد.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">رقم الفاتورة</TableHead>
                        <TableHead>التاريخ</TableHead>
                        <TableHead className="text-right">المبلغ الإجمالي</TableHead>
                        <TableHead className="text-center">الحالة</TableHead>
                        <TableHead className="text-center">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchases.length > 0 ? (
                        purchases.map(purchase => (
                          <TableRow key={purchase.id}>
                            <TableCell className="font-medium">{purchase.invoiceNumber}</TableCell>
                            <TableCell>{new Date(purchase.date).toLocaleDateString('ar-EG')}</TableCell>
                            <TableCell className="text-right">
                              {purchase.totalAmount.toLocaleString('ar-EG', {
                                style: 'currency',
                                currency: 'SAR',
                              })}
                            </TableCell>
                            <TableCell className="text-center">
                              <span
                                className={`px-3 py-1 text-xs font-medium rounded-full ${
                                  purchase.status === 'تم الدفع'
                                    ? 'bg-green-100 text-green-800'
                                    : purchase.status === 'قيد المراجعة'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {purchase.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button variant="ghost" size="sm" className="p-1 h-auto">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="p-1 h-auto text-red-500 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            لا توجد سجلات مشتريات لهذا المورد.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SupplierDetails;
