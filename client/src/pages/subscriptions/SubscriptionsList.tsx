// @ts-nocheck
import { trpc } from '@/lib/trpc';
import React, { useState, useMemo } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, SortingState, ColumnFiltersState } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  RefreshCw,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar,
  Zap,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ============================================
// أنواع البيانات
// ============================================
interface Subscription {
  id: string;
  subscriptionNumber: string;
  customerName: string;
  customerId: string;
  meterNumber: string;
  subscriptionType: 'residential' | 'commercial' | 'industrial' | 'governmental';
  tariffType: 'prepaid' | 'postpaid' | 'flat_rate';
  status: 'active' | 'inactive' | 'suspended' | 'pending' | 'cancelled';
  powerStation: string;
  connectionDate: string;
  contractEndDate: string;
  monthlyConsumption: number;
  currentBalance: number;
  lastPaymentDate: string;
  lastPaymentAmount: number;
  address: string;
  phone: string;
  email: string;
  notes: string;
}

interface SubscriptionStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  pending: number;
  totalRevenue: number;
  averageConsumption: number;
  overduePayments: number;
}

// ============================================
// بيانات تجريبية
// ============================================
const mockSubscriptions: Subscription[] = [
  {
    id: 'sub-001',
    subscriptionNumber: 'SUB-2024-001',
    customerName: 'شركة الأمل للصناعات',
    customerId: 'CUS-001',
    meterNumber: 'MTR-001234',
    subscriptionType: 'industrial',
    tariffType: 'postpaid',
    status: 'active',
    powerStation: 'محطة الشمال 1',
    connectionDate: '2023-01-15',
    contractEndDate: '2026-01-15',
    monthlyConsumption: 15000,
    currentBalance: -2500,
    lastPaymentDate: '2024-12-01',
    lastPaymentAmount: 8500,
    address: 'المنطقة الصناعية، شارع 15',
    phone: '0501234567',
    email: 'info@alamal.com',
    notes: 'عميل مميز - خصم 5%',
  },
  {
    id: 'sub-002',
    subscriptionNumber: 'SUB-2024-002',
    customerName: 'مجمع النور السكني',
    customerId: 'CUS-002',
    meterNumber: 'MTR-002345',
    subscriptionType: 'residential',
    tariffType: 'prepaid',
    status: 'active',
    powerStation: 'محطة الجنوب 3',
    connectionDate: '2024-03-20',
    contractEndDate: '2027-03-20',
    monthlyConsumption: 2500,
    currentBalance: 1200,
    lastPaymentDate: '2024-12-10',
    lastPaymentAmount: 500,
    address: 'حي النور، شارع الملك فهد',
    phone: '0559876543',
    email: 'alnoor@email.com',
    notes: '',
  },
  {
    id: 'sub-003',
    subscriptionNumber: 'SUB-2024-003',
    customerName: 'مركز التسوق الكبير',
    customerId: 'CUS-003',
    meterNumber: 'MTR-003456',
    subscriptionType: 'commercial',
    tariffType: 'postpaid',
    status: 'suspended',
    powerStation: 'محطة الوسط 2',
    connectionDate: '2022-06-01',
    contractEndDate: '2025-06-01',
    monthlyConsumption: 8500,
    currentBalance: -12000,
    lastPaymentDate: '2024-09-15',
    lastPaymentAmount: 5000,
    address: 'شارع التحلية، مركز المدينة',
    phone: '0541112233',
    email: 'mall@shopping.com',
    notes: 'متأخر في السداد - تم الإيقاف',
  },
  {
    id: 'sub-004',
    subscriptionNumber: 'SUB-2024-004',
    customerName: 'مدرسة الفجر الحكومية',
    customerId: 'CUS-004',
    meterNumber: 'MTR-004567',
    subscriptionType: 'governmental',
    tariffType: 'flat_rate',
    status: 'active',
    powerStation: 'محطة الشرق 4',
    connectionDate: '2020-09-01',
    contractEndDate: '2030-09-01',
    monthlyConsumption: 3200,
    currentBalance: 0,
    lastPaymentDate: '2024-12-05',
    lastPaymentAmount: 2800,
    address: 'حي الفجر، شارع المدارس',
    phone: '0533334444',
    email: 'school@gov.sa',
    notes: 'جهة حكومية - سعر مخفض',
  },
  {
    id: 'sub-005',
    subscriptionNumber: 'SUB-2024-005',
    customerName: 'مصنع الحديد والصلب',
    customerId: 'CUS-005',
    meterNumber: 'MTR-005678',
    subscriptionType: 'industrial',
    tariffType: 'postpaid',
    status: 'pending',
    powerStation: 'محطة الشمال 1',
    connectionDate: '2024-12-01',
    contractEndDate: '2027-12-01',
    monthlyConsumption: 0,
    currentBalance: 5000,
    lastPaymentDate: '2024-12-01',
    lastPaymentAmount: 5000,
    address: 'المنطقة الصناعية الثانية',
    phone: '0522223333',
    email: 'steel@factory.com',
    notes: 'اشتراك جديد - قيد التفعيل',
  },
  {
    id: 'sub-006',
    subscriptionNumber: 'SUB-2024-006',
    customerName: 'فيلا السعادة',
    customerId: 'CUS-006',
    meterNumber: 'MTR-006789',
    subscriptionType: 'residential',
    tariffType: 'prepaid',
    status: 'inactive',
    powerStation: 'محطة الغرب 5',
    connectionDate: '2021-04-10',
    contractEndDate: '2024-04-10',
    monthlyConsumption: 0,
    currentBalance: 0,
    lastPaymentDate: '2024-03-01',
    lastPaymentAmount: 300,
    address: 'حي السعادة، فيلا 25',
    phone: '0566667777',
    email: 'villa@email.com',
    notes: 'انتهى العقد - لم يجدد',
  },
];

const mockStats: SubscriptionStats = {
  total: 156,
  active: 128,
  inactive: 12,
  suspended: 8,
  pending: 8,
  totalRevenue: 485000,
  averageConsumption: 4850,
  overduePayments: 15,
};

// ============================================
// مكونات فرعية
// ============================================

// بطاقة الإحصائيات
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color: string;
}> = ({ title, value, icon, trend, color }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% من الشهر الماضي
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

// نموذج إضافة/تعديل الاشتراك
const SubscriptionForm: React.FC<{
  subscription?: Subscription;
  onClose: () => void;
  onSave: (data: Partial<Subscription>) => void;
}> = ({ subscription, onClose, onSave }) => {
  const isEdit = !!subscription;
  const [formData, setFormData] = useState<Partial<Subscription>>(
    subscription || {
      subscriptionType: 'residential',
      tariffType: 'prepaid',
      status: 'pending',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">اسم العميل *</Label>
          <Input
            id="customerName"
            value={formData.customerName || ''}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            required
            dir="rtl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meterNumber">رقم العداد *</Label>
          <Input
            id="meterNumber"
            value={formData.meterNumber || ''}
            onChange={(e) => setFormData({ ...formData, meterNumber: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subscriptionType">نوع الاشتراك *</Label>
          <Select
            value={formData.subscriptionType}
            onValueChange={(value) => setFormData({ ...formData, subscriptionType: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع الاشتراك" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residential">سكني</SelectItem>
              <SelectItem value="commercial">تجاري</SelectItem>
              <SelectItem value="industrial">صناعي</SelectItem>
              <SelectItem value="governmental">حكومي</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tariffType">نوع التعرفة *</Label>
          <Select
            value={formData.tariffType}
            onValueChange={(value) => setFormData({ ...formData, tariffType: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع التعرفة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prepaid">مسبق الدفع</SelectItem>
              <SelectItem value="postpaid">آجل الدفع</SelectItem>
              <SelectItem value="flat_rate">سعر ثابت</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="powerStation">محطة الكهرباء *</Label>
          <Select
            value={formData.powerStation}
            onValueChange={(value) => setFormData({ ...formData, powerStation: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المحطة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="محطة الشمال 1">محطة الشمال 1</SelectItem>
              <SelectItem value="محطة الجنوب 3">محطة الجنوب 3</SelectItem>
              <SelectItem value="محطة الوسط 2">محطة الوسط 2</SelectItem>
              <SelectItem value="محطة الشرق 4">محطة الشرق 4</SelectItem>
              <SelectItem value="محطة الغرب 5">محطة الغرب 5</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">الحالة</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">نشط</SelectItem>
              <SelectItem value="inactive">غير نشط</SelectItem>
              <SelectItem value="suspended">موقوف</SelectItem>
              <SelectItem value="pending">قيد الانتظار</SelectItem>
              <SelectItem value="cancelled">ملغي</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="connectionDate">تاريخ التوصيل</Label>
          <Input
            id="connectionDate"
            type="date"
            value={formData.connectionDate || ''}
            onChange={(e) => setFormData({ ...formData, connectionDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contractEndDate">تاريخ انتهاء العقد</Label>
          <Input
            id="contractEndDate"
            type="date"
            value={formData.contractEndDate || ''}
            onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">رقم الهاتف</Label>
          <Input
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            dir="ltr"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">العنوان</Label>
        <Input
          id="address"
          value={formData.address || ''}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          dir="rtl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">ملاحظات</Label>
        <Textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          dir="rtl"
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          إلغاء
        </Button>
        <Button type="submit">
          {isEdit ? 'حفظ التعديلات' : 'إضافة الاشتراك'}
        </Button>
      </DialogFooter>
    </form>
  );
};

// عرض تفاصيل الاشتراك
const SubscriptionDetails: React.FC<{ subscription: Subscription; onClose: () => void }> = ({
  subscription,
  onClose,
}) => {
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<string, string> = {
    active: 'نشط',
    inactive: 'غير نشط',
    suspended: 'موقوف',
    pending: 'قيد الانتظار',
    cancelled: 'ملغي',
  };

  const typeLabels: Record<string, string> = {
    residential: 'سكني',
    commercial: 'تجاري',
    industrial: 'صناعي',
    governmental: 'حكومي',
  };

  const tariffLabels: Record<string, string> = {
    prepaid: 'مسبق الدفع',
    postpaid: 'آجل الدفع',
    flat_rate: 'سعر ثابت',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{subscription.customerName}</h3>
          <p className="text-sm text-gray-500">{subscription.subscriptionNumber}</p>
        </div>
        <Badge className={statusColors[subscription.status]}>
          {statusLabels[subscription.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">معلومات الاشتراك</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">رقم العداد:</span>
              <span className="font-medium">{subscription.meterNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">نوع الاشتراك:</span>
              <span className="font-medium">{typeLabels[subscription.subscriptionType]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">نوع التعرفة:</span>
              <span className="font-medium">{tariffLabels[subscription.tariffType]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">المحطة:</span>
              <span className="font-medium">{subscription.powerStation}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">معلومات مالية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">الرصيد الحالي:</span>
              <span className={`font-medium ${subscription.currentBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {subscription.currentBalance.toLocaleString('ar-SA')} ر.س
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">الاستهلاك الشهري:</span>
              <span className="font-medium">{subscription.monthlyConsumption.toLocaleString('ar-SA')} ك.و.س</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">آخر دفعة:</span>
              <span className="font-medium">{subscription.lastPaymentAmount.toLocaleString('ar-SA')} ر.س</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">تاريخ آخر دفعة:</span>
              <span className="font-medium">{subscription.lastPaymentDate}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">معلومات التواصل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">العنوان:</span>
            <span className="font-medium">{subscription.address}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">الهاتف:</span>
            <span className="font-medium" dir="ltr">{subscription.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">البريد الإلكتروني:</span>
            <span className="font-medium" dir="ltr">{subscription.email}</span>
          </div>
        </CardContent>
      </Card>

      {subscription.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">ملاحظات</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{subscription.notes}</p>
          </CardContent>
        </Card>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          إغلاق
        </Button>
        <Button>
          <FileText className="h-4 w-4 ml-2" />
          طباعة التفاصيل
        </Button>
      </DialogFooter>
    </div>
  );
};

// ============================================
// المكون الرئيسي
// ============================================
const SubscriptionsList: React.FC = () => {
  const { data: listData } = trpc.dashboard.getStats.useQuery();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [stats] = useState<SubscriptionStats>(mockStats);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [viewingSubscription, setViewingSubscription] = useState<Subscription | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // تصفية البيانات
  const filteredData = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
      const matchesType = typeFilter === 'all' || sub.subscriptionType === typeFilter;
      const matchesSearch = globalFilter === '' ||
        sub.customerName.toLowerCase().includes(globalFilter.toLowerCase()) ||
        sub.subscriptionNumber.toLowerCase().includes(globalFilter.toLowerCase()) ||
        sub.meterNumber.toLowerCase().includes(globalFilter.toLowerCase());
      return matchesStatus && matchesType && matchesSearch;
    });
  }, [subscriptions, statusFilter, typeFilter, globalFilter]);

  // تعريف الأعمدة
  const columns: ColumnDef<Subscription>[] = [
    {
      accessorKey: 'subscriptionNumber',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          رقم الاشتراك
          <ArrowUpDown className="mr-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium text-blue-600">{row.getValue('subscriptionNumber')}</div>,
    },
    {
      accessorKey: 'customerName',
      header: 'اسم العميل',
      cell: ({ row }) => <div className="font-medium">{row.getValue('customerName')}</div>,
    },
    {
      accessorKey: 'meterNumber',
      header: 'رقم العداد',
    },
    {
      accessorKey: 'subscriptionType',
      header: 'النوع',
      cell: ({ row }) => {
        const type = row.getValue('subscriptionType') as string;
        const typeLabels: Record<string, { text: string; color: string }> = {
          residential: { text: 'سكني', color: 'bg-blue-100 text-blue-800' },
          commercial: { text: 'تجاري', color: 'bg-purple-100 text-purple-800' },
          industrial: { text: 'صناعي', color: 'bg-orange-100 text-orange-800' },
          governmental: { text: 'حكومي', color: 'bg-green-100 text-green-800' },
        };
        const { text, color } = typeLabels[type] || { text: type, color: 'bg-gray-100' };
        return <Badge className={color}>{text}</Badge>;
      },
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const statusMap: Record<string, { text: string; color: string }> = {
          active: { text: 'نشط', color: 'bg-green-100 text-green-800' },
          inactive: { text: 'غير نشط', color: 'bg-gray-100 text-gray-800' },
          suspended: { text: 'موقوف', color: 'bg-red-100 text-red-800' },
          pending: { text: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-800' },
          cancelled: { text: 'ملغي', color: 'bg-red-100 text-red-800' },
        };
        const { text, color } = statusMap[status] || { text: status, color: 'bg-gray-100' };
        return <Badge className={color}>{text}</Badge>;
      },
    },
    {
      accessorKey: 'monthlyConsumption',
      header: 'الاستهلاك الشهري',
      cell: ({ row }) => (
        <div className="text-left" dir="ltr">
          {(row.getValue('monthlyConsumption') as number).toLocaleString('ar-SA')} ك.و.س
        </div>
      ),
    },
    {
      accessorKey: 'currentBalance',
      header: 'الرصيد',
      cell: ({ row }) => {
        const balance = row.getValue('currentBalance') as number;
        return (
          <div className={`text-left font-medium ${balance < 0 ? 'text-red-600' : 'text-green-600'}`} dir="ltr">
            {balance.toLocaleString('ar-SA')} ر.س
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      cell: ({ row }) => {
        const subscription = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setViewingSubscription(subscription)}>
                <Eye className="ml-2 h-4 w-4" />
                عرض التفاصيل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditingSubscription(subscription)}>
                <Edit className="ml-2 h-4 w-4" />
                تعديل
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  if (window.confirm(`هل أنت متأكد من حذف الاشتراك: ${subscription.customerName}?`)) {
                    setSubscriptions(subscriptions.filter((s) => s.id !== subscription.id));
                  }
                }}
              >
                <Trash2 className="ml-2 h-4 w-4" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handleSaveSubscription = (data: Partial<Subscription>) => {
    if (editingSubscription) {
      setSubscriptions(
        subscriptions.map((s) => (s.id === editingSubscription.id ? { ...s, ...data } : s))
      );
    } else {
      const newSubscription: Subscription = {
        ...data,
        id: `sub-${Date.now()}`,
        subscriptionNumber: `SUB-${new Date().getFullYear()}-${String(subscriptions.length + 1).padStart(3, '0')}`,
        currentBalance: 0,
        monthlyConsumption: 0,
        lastPaymentDate: '',
        lastPaymentAmount: 0,
      } as Subscription;
      setSubscriptions([...subscriptions, newSubscription]);
    }
    setEditingSubscription(null);
  };

  return (
    <DashboardLayout title="إدارة الاشتراكات">
      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="إجمالي الاشتراكات"
          value={stats.total}
          icon={<Users className="h-6 w-6 text-blue-600" />}
          trend={{ value: 8, isPositive: true }}
          color="bg-blue-100"
        />
        <StatCard
          title="الاشتراكات النشطة"
          value={stats.active}
          icon={<CheckCircle2 className="h-6 w-6 text-green-600" />}
          color="bg-green-100"
        />
        <StatCard
          title="الاشتراكات الموقوفة"
          value={stats.suspended}
          icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
          color="bg-red-100"
        />
        <StatCard
          title="إجمالي الإيرادات"
          value={`${stats.totalRevenue.toLocaleString('ar-SA')} ر.س`}
          icon={<DollarSign className="h-6 w-6 text-purple-600" />}
          trend={{ value: 12, isPositive: true }}
          color="bg-purple-100"
        />
      </div>

      {/* شريط الأدوات */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="بحث بالاسم أو رقم الاشتراك أو العداد..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pr-10"
                  dir="rtl"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                  <SelectItem value="suspended">موقوف</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="residential">سكني</SelectItem>
                  <SelectItem value="commercial">تجاري</SelectItem>
                  <SelectItem value="industrial">صناعي</SelectItem>
                  <SelectItem value="governmental">حكومي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 ml-2" />
                تصدير
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 ml-2" />
                استيراد
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة اشتراك
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>إضافة اشتراك جديد</DialogTitle>
                    <DialogDescription>
                      أدخل بيانات الاشتراك الجديد
                    </DialogDescription>
                  </DialogHeader>
                  <SubscriptionForm
                    onClose={() => setIsAddDialogOpen(false)}
                    onSave={handleSaveSubscription}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* جدول البيانات */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table dir="rtl">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-right">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      لا توجد اشتراكات مطابقة للبحث.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* التصفح */}
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-500">
              عرض {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} إلى{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                filteredData.length
              )}{' '}
              من {filteredData.length} اشتراك
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                صفحة {table.getState().pagination.pageIndex + 1} من {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* نافذة التعديل */}
      <Dialog open={!!editingSubscription} onOpenChange={() => setEditingSubscription(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل الاشتراك</DialogTitle>
            <DialogDescription>
              تعديل بيانات الاشتراك: {editingSubscription?.subscriptionNumber}
            </DialogDescription>
          </DialogHeader>
          {editingSubscription && (
            <SubscriptionForm
              subscription={editingSubscription}
              onClose={() => setEditingSubscription(null)}
              onSave={handleSaveSubscription}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* نافذة عرض التفاصيل */}
      <Dialog open={!!viewingSubscription} onOpenChange={() => setViewingSubscription(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل الاشتراك</DialogTitle>
          </DialogHeader>
          {viewingSubscription && (
            <SubscriptionDetails
              subscription={viewingSubscription}
              onClose={() => setViewingSubscription(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SubscriptionsList;
