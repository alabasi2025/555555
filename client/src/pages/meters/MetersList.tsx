// @ts-nocheck
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Search, Plus, Download, Upload, MoreHorizontal, Edit, Trash2, Eye, Gauge, Activity,
  AlertTriangle, CheckCircle2, Clock, Zap, MapPin, Calendar, ArrowUpDown, ChevronLeft,
  ChevronRight, ChevronsLeft, ChevronsRight, RefreshCw, Settings, History, TrendingUp,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ============================================
// أنواع البيانات
// ============================================
interface Meter {
  id: string;
  meterNumber: string;
  serialNumber: string;
  customerName: string;
  customerId: string;
  subscriptionId: string;
  meterType: 'single_phase' | 'three_phase' | 'smart' | 'prepaid';
  status: 'active' | 'inactive' | 'faulty' | 'disconnected' | 'pending_installation';
  powerStation: string;
  location: string;
  installationDate: string;
  lastReadingDate: string;
  lastReading: number;
  previousReading: number;
  consumption: number;
  maxLoad: number;
  currentLoad: number;
  voltage: number;
  manufacturer: string;
  model: string;
  accuracy: string;
  calibrationDate: string;
  nextCalibrationDate: string;
  notes: string;
}

interface MeterStats {
  total: number;
  active: number;
  faulty: number;
  disconnected: number;
  pendingInstallation: number;
  totalConsumption: number;
  averageConsumption: number;
  smartMeters: number;
}

// ============================================
// بيانات تجريبية
// ============================================
const mockMeters: Meter[] = [
  {
    id: 'mtr-001',
    meterNumber: 'MTR-001234',
    serialNumber: 'SN-2024-001234',
    customerName: 'شركة الأمل للصناعات',
    customerId: 'CUS-001',
    subscriptionId: 'SUB-001',
    meterType: 'three_phase',
    status: 'active',
    powerStation: 'محطة الشمال 1',
    location: 'المنطقة الصناعية، شارع 15',
    installationDate: '2023-01-15',
    lastReadingDate: '2024-12-15',
    lastReading: 125000,
    previousReading: 110000,
    consumption: 15000,
    maxLoad: 500,
    currentLoad: 320,
    voltage: 380,
    manufacturer: 'Schneider Electric',
    model: 'PM5560',
    accuracy: '0.5S',
    calibrationDate: '2024-01-15',
    nextCalibrationDate: '2025-01-15',
    notes: 'عداد صناعي - قراءة تلقائية',
  },
  {
    id: 'mtr-002',
    meterNumber: 'MTR-002345',
    serialNumber: 'SN-2024-002345',
    customerName: 'مجمع النور السكني',
    customerId: 'CUS-002',
    subscriptionId: 'SUB-002',
    meterType: 'smart',
    status: 'active',
    powerStation: 'محطة الجنوب 3',
    location: 'حي النور، شارع الملك فهد',
    installationDate: '2024-03-20',
    lastReadingDate: '2024-12-16',
    lastReading: 8500,
    previousReading: 6000,
    consumption: 2500,
    maxLoad: 100,
    currentLoad: 45,
    voltage: 220,
    manufacturer: 'Itron',
    model: 'OpenWay Riva',
    accuracy: '1.0',
    calibrationDate: '2024-03-20',
    nextCalibrationDate: '2026-03-20',
    notes: 'عداد ذكي - قراءة كل 15 دقيقة',
  },
  {
    id: 'mtr-003',
    meterNumber: 'MTR-003456',
    serialNumber: 'SN-2022-003456',
    customerName: 'مركز التسوق الكبير',
    customerId: 'CUS-003',
    subscriptionId: 'SUB-003',
    meterType: 'three_phase',
    status: 'faulty',
    powerStation: 'محطة الوسط 2',
    location: 'شارع التحلية، مركز المدينة',
    installationDate: '2022-06-01',
    lastReadingDate: '2024-12-10',
    lastReading: 85000,
    previousReading: 76500,
    consumption: 8500,
    maxLoad: 300,
    currentLoad: 0,
    voltage: 0,
    manufacturer: 'ABB',
    model: 'A44',
    accuracy: '0.5S',
    calibrationDate: '2023-06-01',
    nextCalibrationDate: '2024-06-01',
    notes: 'عطل في وحدة القياس - يحتاج صيانة',
  },
  {
    id: 'mtr-004',
    meterNumber: 'MTR-004567',
    serialNumber: 'SN-2020-004567',
    customerName: 'مدرسة الفجر الحكومية',
    customerId: 'CUS-004',
    subscriptionId: 'SUB-004',
    meterType: 'single_phase',
    status: 'active',
    powerStation: 'محطة الشرق 4',
    location: 'حي الفجر، شارع المدارس',
    installationDate: '2020-09-01',
    lastReadingDate: '2024-12-14',
    lastReading: 45000,
    previousReading: 41800,
    consumption: 3200,
    maxLoad: 80,
    currentLoad: 35,
    voltage: 220,
    manufacturer: 'Landis+Gyr',
    model: 'E350',
    accuracy: '1.0',
    calibrationDate: '2024-09-01',
    nextCalibrationDate: '2025-09-01',
    notes: '',
  },
  {
    id: 'mtr-005',
    meterNumber: 'MTR-005678',
    serialNumber: 'SN-2024-005678',
    customerName: 'مصنع الحديد والصلب',
    customerId: 'CUS-005',
    subscriptionId: 'SUB-005',
    meterType: 'three_phase',
    status: 'pending_installation',
    powerStation: 'محطة الشمال 1',
    location: 'المنطقة الصناعية الثانية',
    installationDate: '',
    lastReadingDate: '',
    lastReading: 0,
    previousReading: 0,
    consumption: 0,
    maxLoad: 1000,
    currentLoad: 0,
    voltage: 0,
    manufacturer: 'Siemens',
    model: 'SENTRON PAC4200',
    accuracy: '0.2S',
    calibrationDate: '',
    nextCalibrationDate: '',
    notes: 'عداد جديد - قيد التركيب',
  },
  {
    id: 'mtr-006',
    meterNumber: 'MTR-006789',
    serialNumber: 'SN-2021-006789',
    customerName: 'فيلا السعادة',
    customerId: 'CUS-006',
    subscriptionId: 'SUB-006',
    meterType: 'prepaid',
    status: 'disconnected',
    powerStation: 'محطة الغرب 5',
    location: 'حي السعادة، فيلا 25',
    installationDate: '2021-04-10',
    lastReadingDate: '2024-03-01',
    lastReading: 12000,
    previousReading: 12000,
    consumption: 0,
    maxLoad: 60,
    currentLoad: 0,
    voltage: 0,
    manufacturer: 'Hexing',
    model: 'HXE110',
    accuracy: '1.0',
    calibrationDate: '2023-04-10',
    nextCalibrationDate: '2025-04-10',
    notes: 'تم الفصل - انتهاء الرصيد',
  },
];

const mockStats: MeterStats = {
  total: 1850,
  active: 1720,
  faulty: 45,
  disconnected: 60,
  pendingInstallation: 25,
  totalConsumption: 8500000,
  averageConsumption: 4594,
  smartMeters: 650,
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
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% من الشهر الماضي
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
    </CardContent>
  </Card>
);

// نموذج إضافة/تعديل العداد
const MeterForm: React.FC<{
  meter?: Meter;
  onClose: () => void;
  onSave: (data: Partial<Meter>) => void;
}> = ({ meter, onClose, onSave }) => {
  const isEdit = !!meter;
  const [formData, setFormData] = useState<Partial<Meter>>(
    meter || { meterType: 'single_phase', status: 'pending_installation' }
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
          <Label htmlFor="meterNumber">رقم العداد *</Label>
          <Input
            id="meterNumber"
            value={formData.meterNumber || ''}
            onChange={(e) => setFormData({ ...formData, meterNumber: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="serialNumber">الرقم التسلسلي *</Label>
          <Input
            id="serialNumber"
            value={formData.serialNumber || ''}
            onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
            required
          />
        </div>
      </div>

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
          <Label htmlFor="meterType">نوع العداد *</Label>
          <Select
            value={formData.meterType}
            onValueChange={(value) => setFormData({ ...formData, meterType: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع العداد" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single_phase">أحادي الطور</SelectItem>
              <SelectItem value="three_phase">ثلاثي الطور</SelectItem>
              <SelectItem value="smart">ذكي</SelectItem>
              <SelectItem value="prepaid">مسبق الدفع</SelectItem>
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
              <SelectItem value="faulty">معطل</SelectItem>
              <SelectItem value="disconnected">مفصول</SelectItem>
              <SelectItem value="pending_installation">قيد التركيب</SelectItem>
            </SelectContent>
          </Select>
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
          <Label htmlFor="accuracy">الدقة</Label>
          <Input
            id="accuracy"
            value={formData.accuracy || ''}
            onChange={(e) => setFormData({ ...formData, accuracy: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxLoad">الحمل الأقصى (كيلوواط)</Label>
          <Input
            id="maxLoad"
            type="number"
            value={formData.maxLoad || ''}
            onChange={(e) => setFormData({ ...formData, maxLoad: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="voltage">الجهد (فولت)</Label>
          <Input
            id="voltage"
            type="number"
            value={formData.voltage || ''}
            onChange={(e) => setFormData({ ...formData, voltage: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">الموقع</Label>
        <Input
          id="location"
          value={formData.location || ''}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
        <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
        <Button type="submit">{isEdit ? 'حفظ التعديلات' : 'إضافة العداد'}</Button>
      </DialogFooter>
    </form>
  );
};

// نموذج تسجيل قراءة
const ReadingForm: React.FC<{
  meter: Meter;
  onClose: () => void;
  onSave: (reading: number, notes: string) => void;
}> = ({ meter, onClose, onSave }) => {
  const [reading, setReading] = useState<number>(meter.lastReading || 0);
  const [notes, setNotes] = useState('');

  const consumption = reading - (meter.lastReading || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(reading, notes);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-500">رقم العداد:</span>
          <span className="font-medium">{meter.meterNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">القراءة السابقة:</span>
          <span className="font-medium">{meter.lastReading?.toLocaleString('ar-SA')} ك.و.س</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">تاريخ القراءة السابقة:</span>
          <span className="font-medium">{meter.lastReadingDate || 'لا يوجد'}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reading">القراءة الجديدة *</Label>
        <Input
          id="reading"
          type="number"
          value={reading}
          onChange={(e) => setReading(Number(e.target.value))}
          required
          min={meter.lastReading || 0}
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-blue-700">الاستهلاك المحسوب:</span>
          <span className={`text-xl font-bold ${consumption >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
            {consumption.toLocaleString('ar-SA')} ك.و.س
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">ملاحظات</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          dir="rtl"
          rows={2}
          placeholder="أي ملاحظات على القراءة..."
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
        <Button type="submit" disabled={consumption < 0}>تسجيل القراءة</Button>
      </DialogFooter>
    </form>
  );
};

// عرض تفاصيل العداد
const MeterDetails: React.FC<{ meter: Meter; onClose: () => void }> = ({ meter, onClose }) => {
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    faulty: 'bg-red-100 text-red-800',
    disconnected: 'bg-orange-100 text-orange-800',
    pending_installation: 'bg-yellow-100 text-yellow-800',
  };

  const statusLabels: Record<string, string> = {
    active: 'نشط',
    inactive: 'غير نشط',
    faulty: 'معطل',
    disconnected: 'مفصول',
    pending_installation: 'قيد التركيب',
  };

  const typeLabels: Record<string, string> = {
    single_phase: 'أحادي الطور',
    three_phase: 'ثلاثي الطور',
    smart: 'ذكي',
    prepaid: 'مسبق الدفع',
  };

  const loadPercentage = meter.maxLoad > 0 ? (meter.currentLoad / meter.maxLoad) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{meter.meterNumber}</h3>
          <p className="text-sm text-gray-500">{meter.customerName}</p>
        </div>
        <Badge className={statusColors[meter.status]}>{statusLabels[meter.status]}</Badge>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">معلومات العداد</TabsTrigger>
          <TabsTrigger value="readings">القراءات</TabsTrigger>
          <TabsTrigger value="technical">البيانات الفنية</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">الرقم التسلسلي:</span>
                  <span className="font-medium">{meter.serialNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">نوع العداد:</span>
                  <span className="font-medium">{typeLabels[meter.meterType]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">المحطة:</span>
                  <span className="font-medium">{meter.powerStation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">تاريخ التركيب:</span>
                  <span className="font-medium">{meter.installationDate || 'لم يُركب بعد'}</span>
                </div>
                <div className="flex justify-between col-span-2">
                  <span className="text-gray-500">الموقع:</span>
                  <span className="font-medium">{meter.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {meter.status === 'active' && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">الحمل الحالي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{meter.currentLoad} كيلوواط</span>
                    <span>{meter.maxLoad} كيلوواط (الحد الأقصى)</span>
                  </div>
                  <Progress value={loadPercentage} className={loadPercentage > 80 ? 'bg-red-200' : ''} />
                  <p className={`text-xs ${loadPercentage > 80 ? 'text-red-600' : 'text-gray-500'}`}>
                    {loadPercentage.toFixed(1)}% من السعة القصوى
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="readings" className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">آخر قراءة:</span>
                  <span className="font-medium">{meter.lastReading?.toLocaleString('ar-SA')} ك.و.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">تاريخ آخر قراءة:</span>
                  <span className="font-medium">{meter.lastReadingDate || 'لا يوجد'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">القراءة السابقة:</span>
                  <span className="font-medium">{meter.previousReading?.toLocaleString('ar-SA')} ك.و.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">الاستهلاك:</span>
                  <span className="font-medium text-blue-600">{meter.consumption?.toLocaleString('ar-SA')} ك.و.س</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">الشركة المصنعة:</span>
                  <span className="font-medium">{meter.manufacturer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">الموديل:</span>
                  <span className="font-medium">{meter.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">الدقة:</span>
                  <span className="font-medium">{meter.accuracy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">الجهد:</span>
                  <span className="font-medium">{meter.voltage} فولت</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">تاريخ المعايرة:</span>
                  <span className="font-medium">{meter.calibrationDate || 'لم يُعاير'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">المعايرة القادمة:</span>
                  <span className="font-medium">{meter.nextCalibrationDate || 'غير محدد'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {meter.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">ملاحظات</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{meter.notes}</p>
          </CardContent>
        </Card>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>إغلاق</Button>
      </DialogFooter>
    </div>
  );
};

// ============================================
// المكون الرئيسي
// ============================================
const MetersList: React.FC = () => {
  const [meters, setMeters] = useState<Meter[]>(mockMeters);
  const [stats] = useState<MeterStats>(mockStats);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMeter, setEditingMeter] = useState<Meter | null>(null);
  const [viewingMeter, setViewingMeter] = useState<Meter | null>(null);
  const [readingMeter, setReadingMeter] = useState<Meter | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredData = useMemo(() => {
    return meters.filter((m) => {
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      const matchesType = typeFilter === 'all' || m.meterType === typeFilter;
      const matchesSearch = globalFilter === '' ||
        m.meterNumber.toLowerCase().includes(globalFilter.toLowerCase()) ||
        m.customerName.toLowerCase().includes(globalFilter.toLowerCase()) ||
        m.serialNumber.toLowerCase().includes(globalFilter.toLowerCase());
      return matchesStatus && matchesType && matchesSearch;
    });
  }, [meters, statusFilter, typeFilter, globalFilter]);

  const columns: ColumnDef<Meter>[] = [
    {
      accessorKey: 'meterNumber',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          رقم العداد
          <ArrowUpDown className="mr-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium text-blue-600">{row.getValue('meterNumber')}</div>,
    },
    {
      accessorKey: 'customerName',
      header: 'اسم العميل',
    },
    {
      accessorKey: 'meterType',
      header: 'النوع',
      cell: ({ row }) => {
        const type = row.getValue('meterType') as string;
        const typeLabels: Record<string, { text: string; color: string }> = {
          single_phase: { text: 'أحادي', color: 'bg-blue-100 text-blue-800' },
          three_phase: { text: 'ثلاثي', color: 'bg-purple-100 text-purple-800' },
          smart: { text: 'ذكي', color: 'bg-green-100 text-green-800' },
          prepaid: { text: 'مسبق الدفع', color: 'bg-orange-100 text-orange-800' },
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
          faulty: { text: 'معطل', color: 'bg-red-100 text-red-800' },
          disconnected: { text: 'مفصول', color: 'bg-orange-100 text-orange-800' },
          pending_installation: { text: 'قيد التركيب', color: 'bg-yellow-100 text-yellow-800' },
        };
        const { text, color } = statusMap[status] || { text: status, color: 'bg-gray-100' };
        return <Badge className={color}>{text}</Badge>;
      },
    },
    {
      accessorKey: 'lastReading',
      header: 'آخر قراءة',
      cell: ({ row }) => (
        <div dir="ltr" className="text-left">
          {(row.getValue('lastReading') as number)?.toLocaleString('ar-SA') || '0'} ك.و.س
        </div>
      ),
    },
    {
      accessorKey: 'consumption',
      header: 'الاستهلاك',
      cell: ({ row }) => (
        <div dir="ltr" className="text-left text-blue-600 font-medium">
          {(row.getValue('consumption') as number)?.toLocaleString('ar-SA') || '0'} ك.و.س
        </div>
      ),
    },
    {
      accessorKey: 'powerStation',
      header: 'المحطة',
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      cell: ({ row }) => {
        const meter = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setViewingMeter(meter)}>
                <Eye className="ml-2 h-4 w-4" />
                عرض التفاصيل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setReadingMeter(meter)}>
                <Gauge className="ml-2 h-4 w-4" />
                تسجيل قراءة
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditingMeter(meter)}>
                <Edit className="ml-2 h-4 w-4" />
                تعديل
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  if (window.confirm(`هل أنت متأكد من حذف العداد: ${meter.meterNumber}?`)) {
                    setMeters(meters.filter((m) => m.id !== meter.id));
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

  const handleSaveMeter = (data: Partial<Meter>) => {
    if (editingMeter) {
      setMeters(meters.map((m) => (m.id === editingMeter.id ? { ...m, ...data } : m)));
    } else {
      const newMeter: Meter = {
        ...data,
        id: `mtr-${Date.now()}`,
        meterNumber: data.meterNumber || `MTR-${String(meters.length + 1).padStart(6, '0')}`,
        lastReading: 0,
        previousReading: 0,
        consumption: 0,
        currentLoad: 0,
      } as Meter;
      setMeters([...meters, newMeter]);
    }
    setEditingMeter(null);
  };

  const handleSaveReading = (reading: number, notes: string) => {
    if (readingMeter) {
      setMeters(meters.map((m) => {
        if (m.id === readingMeter.id) {
          return {
            ...m,
            previousReading: m.lastReading,
            lastReading: reading,
            consumption: reading - m.lastReading,
            lastReadingDate: new Date().toISOString().split('T')[0],
          };
        }
        return m;
      }));
    }
    setReadingMeter(null);
  };

  return (
    <DashboardLayout title="إدارة العدادات">
      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="إجمالي العدادات"
          value={stats.total.toLocaleString('ar-SA')}
          icon={<Gauge className="h-6 w-6 text-blue-600" />}
          color="bg-blue-100"
        />
        <StatCard
          title="العدادات النشطة"
          value={stats.active.toLocaleString('ar-SA')}
          icon={<CheckCircle2 className="h-6 w-6 text-green-600" />}
          color="bg-green-100"
        />
        <StatCard
          title="العدادات المعطلة"
          value={stats.faulty}
          icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
          color="bg-red-100"
        />
        <StatCard
          title="العدادات الذكية"
          value={stats.smartMeters.toLocaleString('ar-SA')}
          icon={<Zap className="h-6 w-6 text-purple-600" />}
          trend={{ value: 15, isPositive: true }}
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
                  placeholder="بحث برقم العداد أو اسم العميل..."
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
                  <SelectItem value="faulty">معطل</SelectItem>
                  <SelectItem value="disconnected">مفصول</SelectItem>
                  <SelectItem value="pending_installation">قيد التركيب</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="single_phase">أحادي الطور</SelectItem>
                  <SelectItem value="three_phase">ثلاثي الطور</SelectItem>
                  <SelectItem value="smart">ذكي</SelectItem>
                  <SelectItem value="prepaid">مسبق الدفع</SelectItem>
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
                    إضافة عداد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>إضافة عداد جديد</DialogTitle>
                    <DialogDescription>أدخل بيانات العداد الجديد</DialogDescription>
                  </DialogHeader>
                  <MeterForm onClose={() => setIsAddDialogOpen(false)} onSave={handleSaveMeter} />
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
                      لا توجد عدادات مطابقة للبحث.
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
              من {filteredData.length} عداد
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
      <Dialog open={!!editingMeter} onOpenChange={() => setEditingMeter(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل العداد</DialogTitle>
            <DialogDescription>تعديل بيانات العداد: {editingMeter?.meterNumber}</DialogDescription>
          </DialogHeader>
          {editingMeter && <MeterForm meter={editingMeter} onClose={() => setEditingMeter(null)} onSave={handleSaveMeter} />}
        </DialogContent>
      </Dialog>

      {/* نافذة عرض التفاصيل */}
      <Dialog open={!!viewingMeter} onOpenChange={() => setViewingMeter(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل العداد</DialogTitle>
          </DialogHeader>
          {viewingMeter && <MeterDetails meter={viewingMeter} onClose={() => setViewingMeter(null)} />}
        </DialogContent>
      </Dialog>

      {/* نافذة تسجيل القراءة */}
      <Dialog open={!!readingMeter} onOpenChange={() => setReadingMeter(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تسجيل قراءة جديدة</DialogTitle>
            <DialogDescription>تسجيل قراءة للعداد: {readingMeter?.meterNumber}</DialogDescription>
          </DialogHeader>
          {readingMeter && <ReadingForm meter={readingMeter} onClose={() => setReadingMeter(null)} onSave={handleSaveReading} />}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MetersList;
