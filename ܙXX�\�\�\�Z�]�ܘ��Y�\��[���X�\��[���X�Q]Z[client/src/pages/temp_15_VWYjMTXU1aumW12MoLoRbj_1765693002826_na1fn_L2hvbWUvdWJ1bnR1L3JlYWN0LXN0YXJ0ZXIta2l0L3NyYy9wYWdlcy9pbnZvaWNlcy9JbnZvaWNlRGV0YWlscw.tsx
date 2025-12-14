import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Printer, AlertTriangle } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout'; // افتراض وجود هذا المكون

// 1. تعريف واجهات البيانات
interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceDetails {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Cancelled';
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  supplierName: string;
  supplierAddress: string;
  supplierEmail: string;
  items: InvoiceItem[];
  subTotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  notes: string;
}

// 2. بيانات وهمية للمحاكاة
const mockInvoice: InvoiceDetails = {
  id: 'INV-2025-001',
  invoiceNumber: 'INV-2025-001',
  issueDate: '2025-12-01',
  dueDate: '2025-12-31',
  status: 'Paid',
  clientName: 'شركة النور للطاقة',
  clientAddress: 'الرياض، المملكة العربية السعودية',
  clientEmail: 'client@alnoor.com',
  supplierName: 'محطة الكهرباء المركزية',
  supplierAddress: 'جدة، المنطقة الصناعية',
  supplierEmail: 'info@powerstation.com',
  items: [
    {
      id: 1,
      description: 'استهلاك كهرباء شهر ديسمبر',
      quantity: 1,
      unitPrice: 15000.0,
      total: 15000.0,
    },
    {
      id: 2,
      description: 'رسوم صيانة شهرية',
      quantity: 1,
      unitPrice: 500.0,
      total: 500.0,
    },
    {
      id: 3,
      description: 'تركيب عداد ذكي',
      quantity: 2,
      unitPrice: 250.0,
      total: 500.0,
    },
  ],
  subTotal: 16000.0,
  taxRate: 0.15, // 15% VAT
  taxAmount: 2400.0,
  totalAmount: 18400.0,
  notes: 'يرجى الدفع في الموعد المحدد لتجنب انقطاع الخدمة.',
};

// 3. دالة محاكاة لجلب البيانات
const fetchInvoiceDetails = (id: string): Promise<InvoiceDetails> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === 'INV-2025-001') {
        resolve(mockInvoice);
      } else if (id === 'error') {
        reject(new Error('فشل في جلب بيانات الفاتورة.'));
      } else {
        reject(new Error('الفاتورة غير موجودة.'));
      }
    }, 1000);
  });
};

// 4. المكون الرئيسي
const InvoiceDetailsPage: React.FC = () => {
  // افتراض استخدام react-router-dom لجلب الـ ID
  const { id } = useParams<{ id: string }>();
  const invoiceId = id || 'INV-2025-001'; // استخدام قيمة افتراضية إذا لم يتم العثور على ID
  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // جلب البيانات
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchInvoiceDetails(invoiceId)
      .then((data) => {
        setInvoice(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [invoiceId]);

  // دالة الطباعة
  const handlePrint = useCallback(() => {
    if (printRef.current) {
      // هذه طريقة بسيطة للطباعة، في تطبيق حقيقي قد تحتاج إلى مكتبة مثل react-to-print
      const printContent = printRef.current.innerHTML;
      const originalContent = document.body.innerHTML;
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload(); // إعادة تحميل الصفحة لاستعادة الحالة الأصلية
    }
  }, []);

  // دالة مساعدة لتنسيق العملة
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  // حالة التحميل
  if (loading) {
    return (
      <DashboardLayout title="تفاصيل الفاتورة">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
          <span className="text-lg font-medium">جاري تحميل بيانات الفاتورة...</span>
        </div>
      </DashboardLayout>
    );
  }

  // حالة الخطأ
  if (error) {
    return (
      <DashboardLayout title="تفاصيل الفاتورة">
        <Alert variant="destructive" className="max-w-3xl mx-auto mt-10 text-right">
          <AlertTriangle className="h-4 w-4 ml-2" />
          <AlertTitle>خطأ في التحميل</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  // حالة عدم وجود بيانات (يجب أن يتم التعامل معها بواسطة حالة الخطأ، ولكن كإجراء إضافي)
  if (!invoice) {
    return (
      <DashboardLayout title="تفاصيل الفاتورة">
        <Alert variant="default" className="max-w-3xl mx-auto mt-10 text-right">
          <AlertTitle>الفاتورة غير موجودة</AlertTitle>
          <AlertDescription>لم يتم العثور على الفاتورة بالرقم {invoiceId}.</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  // عرض تفاصيل الفاتورة
  const getStatusBadge = (status: InvoiceDetails['status']) => {
    switch (status) {
      case 'Paid':
        return <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">مدفوعة</span>;
      case 'Pending':
        return <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">قيد الانتظار</span>;
      case 'Cancelled':
        return <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">ملغاة</span>;
      default:
        return <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">غير معروف</span>;
    }
  };

  return (
    <DashboardLayout title={`تفاصيل الفاتورة #${invoice.invoiceNumber}`}>
      <div className="flex justify-end mb-4 print:hidden">
        <Button onClick={handlePrint} className="flex items-center">
          <Printer className="h-4 w-4 ml-2" />
          طباعة الفاتورة
        </Button>
      </div>

      <Card className="max-w-4xl mx-auto shadow-lg print:shadow-none" dir="rtl" ref={printRef}>
        <CardHeader className="border-b pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold text-primary">فاتورة ضريبية</CardTitle>
              <CardDescription className="mt-1 text-lg">
                رقم الفاتورة: <span className="font-semibold text-gray-900">{invoice.invoiceNumber}</span>
              </CardDescription>
            </div>
            <div className="text-left">
              {getStatusBadge(invoice.status)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div className="text-right">
              <p><strong>تاريخ الإصدار:</strong> {invoice.issueDate}</p>
              <p><strong>تاريخ الاستحقاق:</strong> {invoice.dueDate}</p>
            </div>
            <div className="text-left">
              <p className="text-2xl font-extrabold text-red-600">
                المبلغ الإجمالي: {formatCurrency(invoice.totalAmount)}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* معلومات المورد والعميل */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-b pb-6">
            {/* معلومات المورد */}
            <div className="text-right">
              <h3 className="text-lg font-semibold mb-2 border-b pb-1">من: (المورد)</h3>
              <p className="font-medium">{invoice.supplierName}</p>
              <p className="text-sm text-gray-600">{invoice.supplierAddress}</p>
              <p className="text-sm text-gray-600">{invoice.supplierEmail}</p>
            </div>
            {/* معلومات العميل */}
            <div className="text-right">
              <h3 className="text-lg font-semibold mb-2 border-b pb-1">إلى: (العميل)</h3>
              <p className="font-medium">{invoice.clientName}</p>
              <p className="text-sm text-gray-600">{invoice.clientAddress}</p>
              <p className="text-sm text-gray-600">{invoice.clientEmail}</p>
            </div>
          </div>

          {/* جدول تفاصيل البنود */}
          <h3 className="text-xl font-bold mb-4 text-right">تفاصيل البنود</h3>
          <Table className="w-full border">
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-[50%] text-right font-bold">الوصف</TableHead>
                <TableHead className="text-center font-bold">الكمية</TableHead>
                <TableHead className="text-right font-bold">سعر الوحدة</TableHead>
                <TableHead className="text-right font-bold">الإجمالي</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-right">{item.description}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="text-right font-bold">المجموع الفرعي</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(invoice.subTotal)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className="text-right font-bold">ضريبة القيمة المضافة ({invoice.taxRate * 100}%)</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(invoice.taxAmount)}</TableCell>
              </TableRow>
              <TableRow className="bg-primary/10 hover:bg-primary/10">
                <TableCell colSpan={3} className="text-right text-lg font-extrabold text-primary">المبلغ الإجمالي المستحق</TableCell>
                <TableCell className="text-right text-lg font-extrabold text-primary">{formatCurrency(invoice.totalAmount)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>

          {/* الملاحظات */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg text-right">
            <h4 className="text-md font-semibold mb-2">ملاحظات:</h4>
            <p className="text-sm text-gray-700">{invoice.notes}</p>
          </div>

          {/* تذييل الطباعة */}
          <div className="mt-8 pt-4 border-t text-center text-xs text-gray-500 print:block hidden">
            <p>شكراً لتعاملك معنا. هذه الفاتورة تم إنشاؤها آلياً ولا تتطلب توقيعاً.</p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default InvoiceDetailsPage;
