// @ts-nocheck
import { trpc } from '@/lib/trpc';
import React, { useState, useMemo } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, SortingState } from '@tanstack/react-table';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Search, Plus, Download, MoreHorizontal, Edit, Trash2, Eye, Box, DollarSign,
  AlertTriangle, CheckCircle2, Calendar, ArrowUpDown, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Wrench, MapPin, Activity, Settings, History,
  FileText, BarChart3, Zap, Thermometer,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ============================================
// أنواع البيانات
// ============================================
interface Asset {
  id: string;
  assetCode: string;
  name: string;
  description: string;
  category: 'transformer' | 'generator' | 'switchgear' | 'cable' | 'meter' | 'pole' | 'panel' | 'other';
  type: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  status: 'operational' | 'maintenance' | 'faulty' | 'decommissioned' | 'standby';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  location: string;
  stationId: string;
  stationName: string;
  installationDate: string;
  warrantyExpiry: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  purchasePrice: number;
  currentValue: number;
  depreciationRate: number;
  specifications: Record<string, string>;
  notes: string;
  createdAt: string;
}

interface MaintenanceRecord {
  id: string;
  assetId: string;
  type: 'preventive' | 'corrective' | 'inspection';
  description: string;
  performedBy: string;
  date: string;
  cost: number;
  notes: string;
}

interface AssetStats {
  total: number;
  operational: number;
  maintenance: number;
  faulty: number;
  totalValue: number;
  maintenanceDue: number;
  warrantyExpiring: number;
}

// ============================================
// بيانات تجريبية
// ============================================
const mockAssets: Asset[] = [
  {
    id: 'ast-001',
    assetCode: 'TRF-001',
    name: 'المحول الرئيسي T1',
    description: 'محول قدرة رئيسي للمحطة الشمالية',
    category: 'transformer',
    type: 'محول قدرة',
    manufacturer: 'ABB',
    model: 'TRAFO-500',
    serialNumber: 'ABB-2020-TRF-001234',
    status: 'operational',
    condition: 'excellent',
    location: 'المحطة الشمالية - القسم أ',
    stationId: 'STN-001',
    stationName: 'محطة الشمال 1',
    installationDate: '2020-03-15',
    warrantyExpiry: '2025-03-15',
    lastMaintenanceDate: '2024-11-20',
    nextMaintenanceDate: '2025-02-20',
    purchasePrice: 850000,
    currentValue: 680000,
    depreciationRate: 5,
    specifications: {
      'القدرة': '500 كيلو فولت أمبير',
      'الجهد الابتدائي': '33 كيلو فولت',
      'الجهد الثانوي': '11 كيلو فولت',
      'نوع التبريد': 'زيتي ONAN',
    },
    notes: 'يعمل بكفاءة عالية',
    createdAt: '2020-03-15',
  },
  {
    id: 'ast-002',
    assetCode: 'GEN-001',
    name: 'المولد الاحتياطي G1',
    description: 'مولد ديزل احتياطي للطوارئ',
    category: 'generator',
    type: 'مولد ديزل',
    manufacturer: 'Caterpillar',
    model: 'CAT-3512',
    serialNumber: 'CAT-2019-GEN-005678',
    status: 'standby',
    condition: 'good',
    location: 'المحطة الشمالية - غرفة المولدات',
    stationId: 'STN-001',
    stationName: 'محطة الشمال 1',
    installationDate: '2019-08-10',
    warrantyExpiry: '2024-08-10',
    lastMaintenanceDate: '2024-10-15',
    nextMaintenanceDate: '2025-01-15',
    purchasePrice: 450000,
    currentValue: 315000,
    depreciationRate: 7,
    specifications: {
      'القدرة': '1000 كيلو واط',
      'الجهد': '400 فولت',
      'التردد': '50 هرتز',
      'نوع الوقود': 'ديزل',
    },
    notes: 'يحتاج فحص دوري كل 3 أشهر',
    createdAt: '2019-08-10',
  },
  {
    id: 'ast-003',
    assetCode: 'SWG-001',
    name: 'لوحة التوزيع الرئيسية',
    description: 'لوحة توزيع الجهد المتوسط',
    category: 'switchgear',
    type: 'لوحة توزيع',
    manufacturer: 'Schneider Electric',
    model: 'SM6-24',
    serialNumber: 'SE-2021-SWG-009012',
    status: 'operational',
    condition: 'excellent',
    location: 'المحطة الجنوبية - غرفة التحكم',
    stationId: 'STN-002',
    stationName: 'محطة الجنوب 1',
    installationDate: '2021-05-20',
    warrantyExpiry: '2026-05-20',
    lastMaintenanceDate: '2024-09-10',
    nextMaintenanceDate: '2025-03-10',
    purchasePrice: 320000,
    currentValue: 272000,
    depreciationRate: 5,
    specifications: {
      'الجهد المقنن': '24 كيلو فولت',
      'التيار المقنن': '630 أمبير',
      'عدد الخلايا': '8 خلايا',
      'نوع العزل': 'SF6',
    },
    notes: 'تم تحديث البرمجيات في الصيانة الأخيرة',
    createdAt: '2021-05-20',
  },
  {
    id: 'ast-004',
    assetCode: 'CBL-001',
    name: 'الكابل الأرضي الرئيسي',
    description: 'كابل نقل أرضي للجهد المتوسط',
    category: 'cable',
    type: 'كابل أرضي',
    manufacturer: 'Nexans',
    model: 'N2XSY-33kV',
    serialNumber: 'NX-2022-CBL-003456',
    status: 'operational',
    condition: 'good',
    location: 'من محطة الشمال إلى محطة الوسط',
    stationId: 'STN-001',
    stationName: 'محطة الشمال 1',
    installationDate: '2022-01-15',
    warrantyExpiry: '2032-01-15',
    lastMaintenanceDate: '2024-06-20',
    nextMaintenanceDate: '2025-06-20',
    purchasePrice: 180000,
    currentValue: 162000,
    depreciationRate: 3,
    specifications: {
      'الجهد': '33 كيلو فولت',
      'المقطع': '240 مم²',
      'الطول': '2.5 كم',
      'نوع العزل': 'XLPE',
    },
    notes: 'تم فحص العزل - النتائج ممتازة',
    createdAt: '2022-01-15',
  },
  {
    id: 'ast-005',
    assetCode: 'TRF-002',
    name: 'محول التوزيع T2',
    description: 'محول توزيع للحي السكني',
    category: 'transformer',
    type: 'محول توزيع',
    manufacturer: 'Siemens',
    model: 'GEAFOL-250',
    serialNumber: 'SI-2018-TRF-007890',
    status: 'maintenance',
    condition: 'fair',
    location: 'حي النور - محطة فرعية 5',
    stationId: 'STN-003',
    stationName: 'محطة فرعية 5',
    installationDate: '2018-11-05',
    warrantyExpiry: '2023-11-05',
    lastMaintenanceDate: '2024-12-10',
    nextMaintenanceDate: '2024-12-20',
    purchasePrice: 120000,
    currentValue: 72000,
    depreciationRate: 6,
    specifications: {
      'القدرة': '250 كيلو فولت أمبير',
      'الجهد الابتدائي': '11 كيلو فولت',
      'الجهد الثانوي': '400 فولت',
      'نوع التبريد': 'جاف',
    },
    notes: 'قيد الصيانة - استبدال الملفات',
    createdAt: '2018-11-05',
  },
  {
    id: 'ast-006',
    assetCode: 'PNL-001',
    name: 'لوحة التحكم المركزية',
    description: 'لوحة تحكم SCADA للمحطة',
    category: 'panel',
    type: 'لوحة تحكم',
    manufacturer: 'GE',
    model: 'MarkVIe',
    serialNumber: 'GE-2023-PNL-001122',
    status: 'operational',
    condition: 'excellent',
    location: 'المحطة الرئيسية - غرفة التحكم',
    stationId: 'STN-001',
    stationName: 'محطة الشمال 1',
    installationDate: '2023-02-28',
    warrantyExpiry: '2028-02-28',
    lastMaintenanceDate: '2024-08-15',
    nextMaintenanceDate: '2025-02-15',
    purchasePrice: 95000,
    currentValue: 85500,
    depreciationRate: 10,
    specifications: {
      'نوع النظام': 'SCADA',
      'عدد النقاط': '500 نقطة',
      'البروتوكول': 'IEC 61850',
      'الشاشات': '3 شاشات',
    },
    notes: 'نظام حديث مع دعم فني مستمر',
    createdAt: '2023-02-28',
  },
];

const mockMaintenanceRecords: MaintenanceRecord[] = [
  { id: 'mnt-001', assetId: 'ast-001', type: 'preventive', description: 'صيانة دورية - فحص الزيت', performedBy: 'فريق الصيانة أ', date: '2024-11-20', cost: 5000, notes: 'تم استبدال الزيت' },
  { id: 'mnt-002', assetId: 'ast-001', type: 'inspection', description: 'فحص حراري', performedBy: 'مهندس الفحص', date: '2024-10-15', cost: 1500, notes: 'لا توجد نقاط ساخنة' },
  { id: 'mnt-003', assetId: 'ast-002', type: 'preventive', description: 'تغيير فلاتر وزيوت', performedBy: 'فريق المولدات', date: '2024-10-15', cost: 8000, notes: 'تم تشغيل اختباري' },
];

const mockStats: AssetStats = {
  total: 156,
  operational: 128,
  maintenance: 15,
  faulty: 8,
  totalValue: 2450000,
  maintenanceDue: 12,
  warrantyExpiring: 5,
};

// ============================================
// مكونات فرعية
// ============================================
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
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
    </CardContent>
  </Card>
);

// نموذج إضافة/تعديل الأصل
const AssetForm: React.FC<{
  asset?: Asset;
  onClose: () => void;
  onSave: (data: Partial<Asset>) => void;
}> = ({ asset, onClose, onSave }) => {
  const isEdit = !!asset;
  const [formData, setFormData] = useState<Partial<Asset>>(
    asset || { category: 'transformer', status: 'operational', condition: 'good' }
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
          <Label htmlFor="name">اسم الأصل *</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            dir="rtl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="assetCode">رمز الأصل *</Label>
          <Input
            id="assetCode"
            value={formData.assetCode || ''}
            onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">الفئة *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الفئة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transformer">محول</SelectItem>
              <SelectItem value="generator">مولد</SelectItem>
              <SelectItem value="switchgear">لوحة توزيع</SelectItem>
              <SelectItem value="cable">كابل</SelectItem>
              <SelectItem value="meter">عداد</SelectItem>
              <SelectItem value="pole">عمود</SelectItem>
              <SelectItem value="panel">لوحة تحكم</SelectItem>
              <SelectItem value="other">أخرى</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">النوع</Label>
          <Input
            id="type"
            value={formData.type || ''}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            dir="rtl"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="manufacturer">الشركة المصنعة</Label>
          <Input
            id="manufacturer"
            value={formData.manufacturer || ''}
            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">الموديل</Label>
          <Input
            id="model"
            value={formData.model || ''}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="serialNumber">الرقم التسلسلي</Label>
          <Input
            id="serialNumber"
            value={formData.serialNumber || ''}
            onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">الحالة *</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="operational">يعمل</SelectItem>
              <SelectItem value="maintenance">قيد الصيانة</SelectItem>
              <SelectItem value="faulty">معطل</SelectItem>
              <SelectItem value="standby">احتياطي</SelectItem>
              <SelectItem value="decommissioned">خارج الخدمة</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="condition">الحالة الفنية</Label>
          <Select
            value={formData.condition}
            onValueChange={(value) => setFormData({ ...formData, condition: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الحالة الفنية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">ممتازة</SelectItem>
              <SelectItem value="good">جيدة</SelectItem>
              <SelectItem value="fair">مقبولة</SelectItem>
              <SelectItem value="poor">سيئة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stationName">المحطة</Label>
          <Input
            id="stationName"
            value={formData.stationName || ''}
            onChange={(e) => setFormData({ ...formData, stationName: e.target.value })}
            dir="rtl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">الموقع التفصيلي</Label>
          <Input
            id="location"
            value={formData.location || ''}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            dir="rtl"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="installationDate">تاريخ التركيب</Label>
          <Input
            id="installationDate"
            type="date"
            value={formData.installationDate || ''}
            onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="warrantyExpiry">انتهاء الضمان</Label>
          <Input
            id="warrantyExpiry"
            type="date"
            value={formData.warrantyExpiry || ''}
            onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nextMaintenanceDate">الصيانة القادمة</Label>
          <Input
            id="nextMaintenanceDate"
            type="date"
            value={formData.nextMaintenanceDate || ''}
            onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="purchasePrice">سعر الشراء (ر.س)</Label>
          <Input
            id="purchasePrice"
            type="number"
            value={formData.purchasePrice || ''}
            onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currentValue">القيمة الحالية (ر.س)</Label>
          <Input
            id="currentValue"
            type="number"
            value={formData.currentValue || ''}
            onChange={(e) => setFormData({ ...formData, currentValue: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="depreciationRate">نسبة الإهلاك (%)</Label>
          <Input
            id="depreciationRate"
            type="number"
            value={formData.depreciationRate || ''}
            onChange={(e) => setFormData({ ...formData, depreciationRate: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          dir="rtl"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">ملاحظات</Label>
        <Textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          dir="rtl"
          rows={2}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
        <Button type="submit">{isEdit ? 'حفظ التعديلات' : 'إضافة الأصل'}</Button>
      </DialogFooter>
    </form>
  );
};

// عرض تفاصيل الأصل
const AssetDetails: React.FC<{ asset: Asset; maintenanceRecords: MaintenanceRecord[]; onClose: () => void }> = ({ asset, maintenanceRecords, onClose }) => {
  const statusColors: Record<string, string> = {
    operational: 'bg-green-100 text-green-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    faulty: 'bg-red-100 text-red-800',
    standby: 'bg-blue-100 text-blue-800',
    decommissioned: 'bg-gray-100 text-gray-800',
  };

  const statusLabels: Record<string, string> = {
    operational: 'يعمل',
    maintenance: 'قيد الصيانة',
    faulty: 'معطل',
    standby: 'احتياطي',
    decommissioned: 'خارج الخدمة',
  };

  const conditionColors: Record<string, string> = {
    excellent: 'bg-green-100 text-green-800',
    good: 'bg-blue-100 text-blue-800',
    fair: 'bg-yellow-100 text-yellow-800',
    poor: 'bg-red-100 text-red-800',
  };

  const conditionLabels: Record<string, string> = {
    excellent: 'ممتازة',
    good: 'جيدة',
    fair: 'مقبولة',
    poor: 'سيئة',
  };

  const categoryLabels: Record<string, string> = {
    transformer: 'محول',
    generator: 'مولد',
    switchgear: 'لوحة توزيع',
    cable: 'كابل',
    meter: 'عداد',
    pole: 'عمود',
    panel: 'لوحة تحكم',
    other: 'أخرى',
  };

  const assetRecords = maintenanceRecords.filter(r => r.assetId === asset.id);
  const depreciationPercent = ((asset.purchasePrice - asset.currentValue) / asset.purchasePrice) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{asset.name}</h3>
          <p className="text-sm text-gray-500">{asset.assetCode} - {categoryLabels[asset.category]}</p>
        </div>
        <div className="flex gap-2">
          <Badge className={conditionColors[asset.condition]}>{conditionLabels[asset.condition]}</Badge>
          <Badge className={statusColors[asset.status]}>{statusLabels[asset.status]}</Badge>
        </div>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">المعلومات</TabsTrigger>
          <TabsTrigger value="specs">المواصفات</TabsTrigger>
          <TabsTrigger value="financial">المالية</TabsTrigger>
          <TabsTrigger value="maintenance">الصيانة</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">الشركة المصنعة:</span>
                  <span className="font-medium">{asset.manufacturer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">الموديل:</span>
                  <span className="font-medium">{asset.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">الرقم التسلسلي:</span>
                  <span className="font-medium">{asset.serialNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">المحطة:</span>
                  <span className="font-medium">{asset.stationName}</span>
                </div>
                <div className="flex justify-between col-span-2">
                  <span className="text-gray-500">الموقع:</span>
                  <span className="font-medium">{asset.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">تاريخ التركيب:</span>
                  <span className="font-medium">{asset.installationDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">انتهاء الضمان:</span>
                  <span className="font-medium">{asset.warrantyExpiry}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {asset.description && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">الوصف</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{asset.description}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="specs" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">المواصفات الفنية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(asset.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm py-2 border-b last:border-0">
                    <span className="text-gray-500">{key}:</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">سعر الشراء:</span>
                  <span className="font-medium">{asset.purchasePrice.toLocaleString('ar-SA')} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">القيمة الحالية:</span>
                  <span className="font-medium">{asset.currentValue.toLocaleString('ar-SA')} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">نسبة الإهلاك السنوي:</span>
                  <span className="font-medium">{asset.depreciationRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">إجمالي الإهلاك:</span>
                  <span className="font-medium">{(asset.purchasePrice - asset.currentValue).toLocaleString('ar-SA')} ر.س</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>نسبة الإهلاك المتراكم</span>
                  <span>{depreciationPercent.toFixed(1)}%</span>
                </div>
                <Progress value={depreciationPercent} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">آخر صيانة:</span>
                  <span className="font-medium">{asset.lastMaintenanceDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">الصيانة القادمة:</span>
                  <span className="font-medium">{asset.nextMaintenanceDate}</span>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-sm">سجل الصيانة</h4>
                {assetRecords.length > 0 ? (
                  assetRecords.map((record) => (
                    <div key={record.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{record.description}</p>
                          <p className="text-xs text-gray-500">{record.date} - {record.performedBy}</p>
                        </div>
                        <Badge variant="outline">{record.cost.toLocaleString('ar-SA')} ر.س</Badge>
                      </div>
                      {record.notes && <p className="text-xs text-gray-600 mt-1">{record.notes}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">لا توجد سجلات صيانة</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>إغلاق</Button>
      </DialogFooter>
    </div>
  );
};

// ============================================
// المكون الرئيسي
// ============================================
const AssetsList: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [stats] = useState<AssetStats>(mockStats);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredData = useMemo(() => {
    return assets.filter((asset) => {
      const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;
      const matchesSearch = globalFilter === '' ||
        asset.assetCode.toLowerCase().includes(globalFilter.toLowerCase()) ||
        asset.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
        asset.manufacturer.toLowerCase().includes(globalFilter.toLowerCase());
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [assets, statusFilter, categoryFilter, globalFilter]);

  const columns: ColumnDef<Asset>[] = [
    {
      accessorKey: 'assetCode',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          رمز الأصل
          <ArrowUpDown className="mr-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium text-blue-600">{row.getValue('assetCode')}</div>,
    },
    {
      accessorKey: 'name',
      header: 'اسم الأصل',
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.getValue('name')}>
          {row.getValue('name')}
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'الفئة',
      cell: ({ row }) => {
        const category = row.getValue('category') as string;
        const categoryLabels: Record<string, string> = {
          transformer: 'محول',
          generator: 'مولد',
          switchgear: 'لوحة توزيع',
          cable: 'كابل',
          meter: 'عداد',
          pole: 'عمود',
          panel: 'لوحة تحكم',
          other: 'أخرى',
        };
        return <span>{categoryLabels[category] || category}</span>;
      },
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const statusMap: Record<string, { text: string; color: string }> = {
          operational: { text: 'يعمل', color: 'bg-green-100 text-green-800' },
          maintenance: { text: 'قيد الصيانة', color: 'bg-yellow-100 text-yellow-800' },
          faulty: { text: 'معطل', color: 'bg-red-100 text-red-800' },
          standby: { text: 'احتياطي', color: 'bg-blue-100 text-blue-800' },
          decommissioned: { text: 'خارج الخدمة', color: 'bg-gray-100 text-gray-800' },
        };
        const { text, color } = statusMap[status] || { text: status, color: 'bg-gray-100' };
        return <Badge className={color}>{text}</Badge>;
      },
    },
    {
      accessorKey: 'condition',
      header: 'الحالة الفنية',
      cell: ({ row }) => {
        const condition = row.getValue('condition') as string;
        const conditionMap: Record<string, { text: string; color: string }> = {
          excellent: { text: 'ممتازة', color: 'bg-green-100 text-green-800' },
          good: { text: 'جيدة', color: 'bg-blue-100 text-blue-800' },
          fair: { text: 'مقبولة', color: 'bg-yellow-100 text-yellow-800' },
          poor: { text: 'سيئة', color: 'bg-red-100 text-red-800' },
        };
        const { text, color } = conditionMap[condition] || { text: condition, color: 'bg-gray-100' };
        return <Badge className={color}>{text}</Badge>;
      },
    },
    {
      accessorKey: 'stationName',
      header: 'المحطة',
    },
    {
      accessorKey: 'currentValue',
      header: 'القيمة الحالية',
      cell: ({ row }) => (
        <div className="text-sm font-medium">
          {(row.getValue('currentValue') as number).toLocaleString('ar-SA')} ر.س
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      cell: ({ row }) => {
        const asset = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setViewingAsset(asset)}>
                <Eye className="ml-2 h-4 w-4" />
                عرض التفاصيل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditingAsset(asset)}>
                <Edit className="ml-2 h-4 w-4" />
                تعديل
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Wrench className="ml-2 h-4 w-4" />
                جدولة صيانة
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  if (window.confirm(`هل أنت متأكد من حذف الأصل: ${asset.name}?`)) {
                    setAssets(assets.filter((a) => a.id !== asset.id));
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
    state: { sorting },
    initialState: { pagination: { pageSize: 10 } },
  });

  const handleSaveAsset = (data: Partial<Asset>) => {
    if (editingAsset) {
      setAssets(assets.map((a) => (a.id === editingAsset.id ? { ...a, ...data } : a)));
    } else {
      const newAsset: Asset = {
        ...data,
        id: `ast-${Date.now()}`,
        assetCode: data.assetCode || `AST-${String(assets.length + 1).padStart(3, '0')}`,
        specifications: {},
        createdAt: new Date().toISOString().split('T')[0],
      } as Asset;
      setAssets([...assets, newAsset]);
    }
    setEditingAsset(null);
  };

  return (
    <DashboardLayout title="إدارة الأصول">
      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="إجمالي الأصول"
          value={stats.total}
          icon={<Box className="h-6 w-6 text-blue-600" />}
          color="bg-blue-100"
        />
        <StatCard
          title="الأصول العاملة"
          value={stats.operational}
          icon={<CheckCircle2 className="h-6 w-6 text-green-600" />}
          color="bg-green-100"
        />
        <StatCard
          title="قيد الصيانة"
          value={stats.maintenance}
          icon={<Wrench className="h-6 w-6 text-yellow-600" />}
          color="bg-yellow-100"
        />
        <StatCard
          title="إجمالي القيمة"
          value={`${(stats.totalValue / 1000000).toFixed(1)}M ر.س`}
          icon={<DollarSign className="h-6 w-6 text-indigo-600" />}
          color="bg-indigo-100"
        />
      </div>

      {/* شريط الأدوات */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 items-center flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="بحث بالرمز أو الاسم..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pr-10"
                  dir="rtl"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="operational">يعمل</SelectItem>
                  <SelectItem value="maintenance">قيد الصيانة</SelectItem>
                  <SelectItem value="faulty">معطل</SelectItem>
                  <SelectItem value="standby">احتياطي</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="الفئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  <SelectItem value="transformer">محولات</SelectItem>
                  <SelectItem value="generator">مولدات</SelectItem>
                  <SelectItem value="switchgear">لوحات توزيع</SelectItem>
                  <SelectItem value="cable">كابلات</SelectItem>
                  <SelectItem value="panel">لوحات تحكم</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 ml-2" />
                تصدير
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة أصل
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>إضافة أصل جديد</DialogTitle>
                    <DialogDescription>أدخل بيانات الأصل الجديد</DialogDescription>
                  </DialogHeader>
                  <AssetForm onClose={() => setIsAddDialogOpen(false)} onSave={handleSaveAsset} />
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
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
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
                      لا توجد أصول مطابقة للبحث.
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
              {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, filteredData.length)}{' '}
              من {filteredData.length} أصل
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                <ChevronsRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="text-sm">صفحة {table.getState().pagination.pageIndex + 1} من {table.getPageCount()}</span>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* نافذة التعديل */}
      <Dialog open={!!editingAsset} onOpenChange={() => setEditingAsset(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل الأصل</DialogTitle>
            <DialogDescription>تعديل بيانات الأصل: {editingAsset?.name}</DialogDescription>
          </DialogHeader>
          {editingAsset && <AssetForm asset={editingAsset} onClose={() => setEditingAsset(null)} onSave={handleSaveAsset} />}
        </DialogContent>
      </Dialog>

      {/* نافذة عرض التفاصيل */}
      <Dialog open={!!viewingAsset} onOpenChange={() => setViewingAsset(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل الأصل</DialogTitle>
          </DialogHeader>
          {viewingAsset && <AssetDetails asset={viewingAsset} maintenanceRecords={mockMaintenanceRecords} onClose={() => setViewingAsset(null)} />}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AssetsList;
