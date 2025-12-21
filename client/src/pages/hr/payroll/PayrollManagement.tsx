/**
 * صفحة إدارة الرواتب والمكافآت
 * Payroll Management Page
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Wallet,
  DollarSign,
  Calculator,
  FileText,
  Download,
  Upload,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Eye,
  Printer,
  Send,
  Plus,
  Gift,
  Banknote,
  PiggyBank,
  Receipt
} from 'lucide-react';

// بيانات تجريبية لفترات الرواتب
const mockPayrollPeriods = [
  { id: 1, name: 'ديسمبر 2024', year: 2024, month: 12, status: 'draft', totalEmployees: 55, totalGross: 825000, totalNet: 742500, processedAt: null },
  { id: 2, name: 'نوفمبر 2024', year: 2024, month: 11, status: 'paid', totalEmployees: 54, totalGross: 810000, totalNet: 729000, processedAt: '2024-11-28' },
  { id: 3, name: 'أكتوبر 2024', year: 2024, month: 10, status: 'paid', totalEmployees: 53, totalGross: 795000, totalNet: 715500, processedAt: '2024-10-28' },
];

// بيانات تجريبية لكشوف الرواتب
const mockPayslips = [
  { id: 1, employeeName: 'أحمد محمد', employeeNumber: 'EMP001', department: 'تقنية المعلومات', baseSalary: 15000, allowances: 4500, deductions: 1462, netSalary: 18038, status: 'pending' },
  { id: 2, employeeName: 'فاطمة علي', employeeNumber: 'EMP002', department: 'الموارد البشرية', baseSalary: 20000, allowances: 6000, deductions: 1950, netSalary: 24050, status: 'pending' },
  { id: 3, employeeName: 'خالد سعود', employeeNumber: 'EMP003', department: 'المالية', baseSalary: 12000, allowances: 3600, deductions: 1170, netSalary: 14430, status: 'pending' },
  { id: 4, employeeName: 'نورة عبدالله', employeeNumber: 'EMP004', department: 'العمليات', baseSalary: 18000, allowances: 5400, deductions: 1755, netSalary: 21645, status: 'pending' },
  { id: 5, employeeName: 'محمد إبراهيم', employeeNumber: 'EMP005', department: 'الصيانة', baseSalary: 8000, allowances: 2400, deductions: 780, netSalary: 9620, status: 'pending' },
];

// بيانات تجريبية للسلف والقروض
const mockLoans = [
  { id: 1, employeeName: 'أحمد محمد', type: 'advance', amount: 5000, monthlyDeduction: 500, remainingAmount: 3000, status: 'active' },
  { id: 2, employeeName: 'خالد سعود', type: 'loan', amount: 20000, monthlyDeduction: 1000, remainingAmount: 15000, status: 'active' },
  { id: 3, employeeName: 'محمد إبراهيم', type: 'advance', amount: 3000, monthlyDeduction: 500, remainingAmount: 0, status: 'completed' },
];

// بيانات تجريبية للمكافآت
const mockBonuses = [
  { id: 1, employeeName: 'فاطمة علي', type: 'performance', amount: 5000, reason: 'أداء متميز في الربع الثالث', status: 'approved' },
  { id: 2, employeeName: 'نورة عبدالله', type: 'project', amount: 3000, reason: 'إنجاز مشروع التحول الرقمي', status: 'pending' },
  { id: 3, employeeName: 'أحمد محمد', type: 'overtime', amount: 2500, reason: 'ساعات عمل إضافية', status: 'approved' },
];

const periodStatusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  processing: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  closed: 'bg-purple-100 text-purple-800',
};

const periodStatusLabels: Record<string, string> = {
  draft: 'مسودة',
  processing: 'قيد المعالجة',
  approved: 'معتمد',
  paid: 'مدفوع',
  closed: 'مغلق',
};

const loanTypeLabels: Record<string, string> = {
  advance: 'سلفة',
  loan: 'قرض',
};

const bonusTypeLabels: Record<string, string> = {
  performance: 'مكافأة أداء',
  annual: 'مكافأة سنوية',
  project: 'مكافأة مشروع',
  overtime: 'ساعات إضافية',
  special: 'مكافأة خاصة',
};

export default function PayrollManagement() {
  const [activeTab, setActiveTab] = useState<'periods' | 'payslips' | 'loans' | 'bonuses'>('periods');
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(1);
  const [searchTerm, setSearchTerm] = useState('');

  // إحصائيات
  const stats = {
    currentPeriodTotal: 825000,
    paidThisYear: 9450000,
    pendingLoans: 18000,
    pendingBonuses: 3000,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* العنوان */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الرواتب</h1>
            <p className="text-gray-600 mt-1">معالجة الرواتب والسلف والمكافآت</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              تصدير
            </Button>
            <Button className="gap-2 bg-green-600 hover:bg-green-700">
              <Calculator className="h-4 w-4" />
              معالجة الرواتب
            </Button>
          </div>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">رواتب الشهر الحالي</p>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats.currentPeriodTotal)}</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-lg">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">إجمالي المدفوع (2024)</p>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.paidThisYear)}</p>
                </div>
                <div className="p-3 bg-green-500 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">السلف والقروض المعلقة</p>
                  <p className="text-2xl font-bold text-yellow-900">{formatCurrency(stats.pendingLoans)}</p>
                </div>
                <div className="p-3 bg-yellow-500 rounded-lg">
                  <PiggyBank className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">مكافآت معلقة</p>
                  <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.pendingBonuses)}</p>
                </div>
                <div className="p-3 bg-purple-500 rounded-lg">
                  <Gift className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* التبويبات */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('periods')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'periods'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar className="inline-block h-4 w-4 ml-2" />
              فترات الرواتب
            </button>
            <button
              onClick={() => setActiveTab('payslips')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payslips'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Receipt className="inline-block h-4 w-4 ml-2" />
              كشوف الرواتب
            </button>
            <button
              onClick={() => setActiveTab('loans')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'loans'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Banknote className="inline-block h-4 w-4 ml-2" />
              السلف والقروض
            </button>
            <button
              onClick={() => setActiveTab('bonuses')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bonuses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Gift className="inline-block h-4 w-4 ml-2" />
              المكافآت
            </button>
          </nav>
        </div>

        {activeTab === 'periods' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* قائمة الفترات */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>فترات الرواتب</CardTitle>
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    جديد
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockPayrollPeriods.map((period) => (
                  <div
                    key={period.id}
                    onClick={() => setSelectedPeriod(period.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedPeriod === period.id
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{period.name}</p>
                        <p className="text-sm text-gray-500">{period.totalEmployees} موظف</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${periodStatusColors[period.status]}`}>
                        {periodStatusLabels[period.status]}
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-gray-600">الإجمالي: </span>
                      <span className="font-medium">{formatCurrency(period.totalNet)}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* تفاصيل الفترة */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>تفاصيل فترة ديسمبر 2024</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Printer className="h-4 w-4" />
                      طباعة
                    </Button>
                    <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700">
                      <Send className="h-4 w-4" />
                      صرف الرواتب
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">الراتب الأساسي</p>
                    <p className="text-lg font-bold">{formatCurrency(550000)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">البدلات</p>
                    <p className="text-lg font-bold text-green-600">+{formatCurrency(275000)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">الخصومات</p>
                    <p className="text-lg font-bold text-red-600">-{formatCurrency(82500)}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">صافي الرواتب</p>
                    <p className="text-lg font-bold text-blue-700">{formatCurrency(742500)}</p>
                  </div>
                </div>

                {/* تفاصيل الخصومات */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">تفاصيل الخصومات</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">التأمينات الاجتماعية (9.75%)</span>
                      <span>{formatCurrency(53625)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">أقساط السلف والقروض</span>
                      <span>{formatCurrency(18000)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">خصم الغياب</span>
                      <span>{formatCurrency(6500)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">خصم التأخير</span>
                      <span>{formatCurrency(4375)}</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span>إجمالي الخصومات</span>
                      <span className="text-red-600">{formatCurrency(82500)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'payslips' && (
          <>
            {/* أدوات البحث */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="البحث بالاسم أو الرقم الوظيفي..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                  <select className="px-3 py-2 border border-gray-300 rounded-md">
                    <option value="12-2024">ديسمبر 2024</option>
                    <option value="11-2024">نوفمبر 2024</option>
                    <option value="10-2024">أكتوبر 2024</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* جدول كشوف الرواتب */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">الموظف</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">القسم</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">الراتب الأساسي</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">البدلات</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">الخصومات</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">الصافي</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {mockPayslips.map((payslip) => (
                        <tr key={payslip.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{payslip.employeeName}</p>
                              <p className="text-sm text-gray-500">{payslip.employeeNumber}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{payslip.department}</td>
                          <td className="py-3 px-4">{formatCurrency(payslip.baseSalary)}</td>
                          <td className="py-3 px-4 text-green-600">+{formatCurrency(payslip.allowances)}</td>
                          <td className="py-3 px-4 text-red-600">-{formatCurrency(payslip.deductions)}</td>
                          <td className="py-3 px-4 font-bold">{formatCurrency(payslip.netSalary)}</td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Printer className="h-4 w-4 text-gray-500" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Download className="h-4 w-4 text-green-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'loans' && (
          <>
            <div className="flex justify-end">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                طلب سلفة/قرض
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">الموظف</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">النوع</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">المبلغ</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">القسط الشهري</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">المتبقي</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">الحالة</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {mockLoans.map((loan) => (
                        <tr key={loan.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{loan.employeeName}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              loan.type === 'advance' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {loanTypeLabels[loan.type]}
                            </span>
                          </td>
                          <td className="py-3 px-4">{formatCurrency(loan.amount)}</td>
                          <td className="py-3 px-4">{formatCurrency(loan.monthlyDeduction)}</td>
                          <td className="py-3 px-4 font-medium">{formatCurrency(loan.remainingAmount)}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              loan.status === 'active' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {loan.status === 'active' ? 'نشط' : 'مكتمل'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4 text-blue-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'bonuses' && (
          <>
            <div className="flex justify-end">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة مكافأة
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">الموظف</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">نوع المكافأة</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">المبلغ</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">السبب</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">الحالة</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {mockBonuses.map((bonus) => (
                        <tr key={bonus.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{bonus.employeeName}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {bonusTypeLabels[bonus.type]}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-green-600">{formatCurrency(bonus.amount)}</td>
                          <td className="py-3 px-4 text-gray-600 text-sm">{bonus.reason}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              bonus.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {bonus.status === 'approved' ? 'معتمد' : 'معلق'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center gap-1">
                              {bonus.status === 'pending' && (
                                <>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                  </Button>
                                </>
                              )}
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4 text-blue-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
