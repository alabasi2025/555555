// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, User, DollarSign, ListChecks, MapPin, Mail, Phone } from 'lucide-react';

// افتراض وجود هذا المكون للتخطيط العام
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-6 bg-gray-50 min-h-screen" dir="rtl">
    <header className="mb-6">
      <h1 className="text-3xl font-bold text-gray-800">لوحة التحكم</h1>
    </header>
    <main>{children}</main>
  </div>
);

// 1. نماذج البيانات (Interfaces)
interface AccountDetails {
  id: string;
  accountNumber: string;
  customerName: string;
  customerID: string;
  status: 'Active' | 'Suspended' | 'Closed';
  openingDate: string; // ISO Date string
  address: string;
  contactEmail: string;
  contactPhone: string;
}

interface AccountBalance {
  currentBalance: number;
  creditLimit: number;
  lastPaymentDate: string; // ISO Date string
  lastPaymentAmount: number;
  currency: string;
}

interface Transaction {
  id: string;
  date: string; // ISO Date string
  type: 'Deposit' | 'Withdrawal' | 'Payment' | 'Adjustment';
  description: string;
  amount: number;
  balanceAfter: number;
}

interface AccountData {
  details: AccountDetails;
  balance: AccountBalance;
  transactions: Transaction[];
}

// 2. دالة جلب البيانات الوهمية (محاكاة لـ API Call)
const fetchAccountData = async (accountId: string): Promise<AccountData> => {
  // محاكاة تأخير الشبكة
  await new Promise(resolve => setTimeout(resolve, 1500));

  if (accountId === 'error') {
    throw new Error('فشل في جلب بيانات الحساب. يرجى المحاولة مرة أخرى.');
  }

  // بيانات وهمية
  return {
    details: {
      id: accountId,
      accountNumber: `ACC-${accountId.slice(0, 8).toUpperCase()}`,
      customerName: 'شركة النور للطاقة',
      customerID: 'CUST-98765',
      status: 'Active',
      openingDate: '2020-01-15',
      address: 'الرياض، حي المروج، شارع الأمير محمد بن سلمان',
      contactEmail: 'info@alnoorpower.com',
      contactPhone: '+966 50 123 4567',
    },
    balance: {
      currentBalance: 150000.75,
      creditLimit: 500000.00,
      lastPaymentDate: '2025-12-10',
      lastPaymentAmount: 50000.00,
      currency: 'ريال سعودي',
    },
    transactions: [
      { id: 'T1', date: '2025-12-15', type: 'Payment', description: 'سداد فاتورة شهر ديسمبر', amount: -50000.00, balanceAfter: 150000.75 },
      { id: 'T2', date: '2025-12-01', type: 'Withdrawal', description: 'استهلاك طاقة شهر نوفمبر', amount: -120000.50, balanceAfter: 200000.75 },
      { id: 'T3', date: '2025-11-15', type: 'Deposit', description: 'إيداع تأمين إضافي', amount: 70000.00, balanceAfter: 320001.25 },
      { id: 'T4', date: '2025-10-20', type: 'Adjustment', description: 'تعديل رسوم خدمة', amount: -500.00, balanceAfter: 250001.25 },
    ],
  };
};

// 3. المكونات الفرعية
const AccountInfoCard: React.FC<{ details: AccountDetails }> = ({ details }) => {
  const getStatusBadge = (status: AccountDetails['status']) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">نشط</Badge>;
      case 'Suspended':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">موقوف</Badge>;
      case 'Closed':
        return <Badge className="bg-red-500 hover:bg-red-600 text-white">مغلق</Badge>;
      default:
        return <Badge variant="secondary">غير محدد</Badge>;
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold text-gray-700 flex items-center">
          <User className="w-5 h-5 ml-2" />
          معلومات العميل والحساب
        </CardTitle>
        {getStatusBadge(details.status)}
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <p className="flex items-center">
            <span className="font-semibold w-32 text-gray-600">اسم العميل:</span>
            <span className="text-gray-800">{details.customerName}</span>
          </p>
          <p className="flex items-center">
            <span className="font-semibold w-32 text-gray-600">رقم الحساب:</span>
            <span className="text-gray-800 font-mono">{details.accountNumber}</span>
          </p>
          <p className="flex items-center">
            <span className="font-semibold w-32 text-gray-600">هوية العميل:</span>
            <span className="text-gray-800">{details.customerID}</span>
          </p>
          <p className="flex items-center">
            <span className="font-semibold w-32 text-gray-600">تاريخ الافتتاح:</span>
            <span className="text-gray-800">{new Date(details.openingDate).toLocaleDateString('ar-SA')}</span>
          </p>
        </div>
        <div className="space-y-2 border-r pr-4">
          <p className="flex items-center">
            <MapPin className="w-4 h-4 ml-2 text-blue-500" />
            <span className="font-semibold w-32 text-gray-600">العنوان:</span>
            <span className="text-gray-800">{details.address}</span>
          </p>
          <p className="flex items-center">
            <Mail className="w-4 h-4 ml-2 text-blue-500" />
            <span className="font-semibold w-32 text-gray-600">البريد الإلكتروني:</span>
            <span className="text-blue-600 hover:underline">{details.contactEmail}</span>
          </p>
          <p className="flex items-center">
            <Phone className="w-4 h-4 ml-2 text-blue-500" />
            <span className="font-semibold w-32 text-gray-600">رقم الهاتف:</span>
            <span className="text-gray-800">{details.contactPhone}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const BalanceCard: React.FC<{ balance: AccountBalance }> = ({ balance }) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR', // افتراض العملة السعودية للتعريب
      minimumFractionDigits: 2,
    }).format(amount).replace('SAR', currency);
  };

  return (
    <Card className="shadow-lg bg-blue-50 border-blue-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold text-blue-700 flex items-center">
          <DollarSign className="w-5 h-5 ml-2" />
          الأرصدة والمدفوعات
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="p-3 bg-white rounded-lg border">
          <p className="text-sm font-medium text-gray-500">الرصيد الحالي</p>
          <p className="text-2xl font-extrabold text-blue-800 mt-1">
            {formatCurrency(balance.currentBalance, balance.currency)}
          </p>
        </div>
        <div className="p-3 bg-white rounded-lg border">
          <p className="text-sm font-medium text-gray-500">حد الائتمان</p>
          <p className="text-2xl font-bold text-green-700 mt-1">
            {formatCurrency(balance.creditLimit, balance.currency)}
          </p>
        </div>
        <div className="p-3 bg-white rounded-lg border">
          <p className="text-sm font-medium text-gray-500">آخر دفعة</p>
          <p className="text-lg font-bold text-gray-800 mt-1">
            {formatCurrency(balance.lastPaymentAmount, balance.currency)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            بتاريخ: {new Date(balance.lastPaymentDate).toLocaleDateString('ar-SA')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const TransactionsTable: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
    }).format(amount).replace('SAR', currency);
  };

  const getAmountColor = (amount: number) => {
    return amount < 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold';
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table dir="rtl">
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="w-[100px] text-right">التاريخ</TableHead>
            <TableHead className="text-right">الوصف</TableHead>
            <TableHead className="text-right">النوع</TableHead>
            <TableHead className="text-right">المبلغ</TableHead>
            <TableHead className="text-right">الرصيد بعد الحركة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length > 0 ? (
            transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="font-medium">
                  {new Date(tx.date).toLocaleDateString('ar-SA')}
                </TableCell>
                <TableCell>{tx.description}</TableCell>
                <TableCell>{tx.type === 'Deposit' ? 'إيداع' : tx.type === 'Withdrawal' ? 'سحب' : tx.type === 'Payment' ? 'دفع' : 'تعديل'}</TableCell>
                <TableCell className={getAmountColor(tx.amount)}>
                  {formatCurrency(tx.amount, 'ر.س')}
                </TableCell>
                <TableCell>
                  {formatCurrency(tx.balanceAfter, 'ر.س')}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                لا توجد حركات مسجلة لهذا الحساب.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

// 4. المكون الرئيسي
const AccountDetailsPage: React.FC = () => {
  // استخدام useRoute لمحاكاة جلب معرف الحساب من المسار
  // في تطبيق حقيقي، قد يكون هذا: const { accountId } = useRoute<{ accountId: string }>();
  const accountId = 'ACC-12345678'; // قيمة وهمية لغرض العرض

  const [data, setData] = useState<AccountData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchAccountData(accountId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف أثناء جلب البيانات.');
    } finally {
      setIsLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="mr-3 text-lg text-gray-600">جاري تحميل تفاصيل الحساب...</span>
        </div>
      );
    }

    if (error) {
      return (
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">خطأ في التحميل</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadData} variant="outline" className="text-red-600 border-red-600 hover:bg-red-100">
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (!data) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>لا توجد بيانات</CardTitle>
            <CardDescription>لم يتم العثور على بيانات لهذا الحساب.</CardDescription>
          </CardHeader>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <AccountInfoCard details={data.details} />
        <BalanceCard balance={data.balance} />

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-700 flex items-center">
              <ListChecks className="w-5 h-5 ml-2" />
              سجل الحركات المالية
            </CardTitle>
            <CardDescription>عرض جميع الحركات المدينة والدائنة على الحساب.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="transactions">
              <TabsList className="grid w-full grid-cols-2 md:w-[300px]">
                <TabsTrigger value="transactions">الحركات الأخيرة</TabsTrigger>
                <TabsTrigger value="invoices">الفواتير (قريباً)</TabsTrigger>
              </TabsList>
              <TabsContent value="transactions" className="mt-4">
                <TransactionsTable transactions={data.transactions} />
              </TabsContent>
              <TabsContent value="invoices" className="mt-4">
                <div className="p-4 text-center text-gray-500 border border-dashed rounded-lg">
                  ميزة عرض الفواتير قيد التطوير.
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        تفاصيل الحساب: <span className="text-blue-600">{accountId}</span>
      </h2>
      {renderContent()}
    </DashboardLayout>
  );
};

export default AccountDetailsPage;
