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
import DashboardLayout from '@/components/DashboardLayout';
import {
  Search, Plus, Download, MoreHorizontal, Edit, Trash2, Eye, ClipboardList, Clock,
  AlertTriangle, CheckCircle2, User, Calendar, ArrowUpDown, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Wrench, MapPin, Play, Pause, Check, X,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ============================================
// أنواع البيانات
// ============================================
interface WorkOrder {
  id: string;
  orderNumber: string;
  title: string;
  description: string;
  type: 'installation' | 'maintenance' | 'repair' | 'inspection' | 'disconnection' | 'reconnection' | 'meter_reading';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  customerId: string;
  customerName: string;
  meterId?: string;
  meterNumber?: string;
  assetId?: string;
  assetName?: string;
  assignedTo: string;
  assignedToName: string;
  location: string;
  scheduledDate: string;
  scheduledTime: string;
  startedAt?: string;
  completedAt?: string;
  estimatedDuration: number;
  actualDuration?: number;
  notes: string;
  createdAt: string;
  createdBy: string;
}

interface WorkOrderStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  todayOrders: number;
  avgCompletionTime: number;
}

// ============================================
// بيانات تجريبية
// ============================================
const mockWorkOrders: WorkOrder[] = [
  {
    id: 'wo-001',
    orderNumber: 'WO-2024-001234',
    title: 'تركيب عداد جديد',
    description: 'تركيب عداد ثلاثي الطور لمصنع جديد في المنطقة الصناعية',
    type: 'installation',
    priority: 'high',
    status: 'in_progress',
    customerId: 'CUS-005',
    customerName: 'مصنع الحديد والصلب',
    meterId: 'mtr-005',
    meterNumber: 'MTR-005678',
    assignedTo: 'EMP-001',
    assignedToName: 'أحمد محمد',
    location: 'المنطقة الصناعية الثانية، قطعة 15',
    scheduledDate: '2024-12-16',
    scheduledTime: '09:00',
    startedAt: '2024-12-16T09:15:00',
    estimatedDuration: 180,
    notes: 'يحتاج معدات خاصة للتركيب',
    createdAt: '2024-12-14',
    createdBy: 'مدير العمليات',
  },
  {
    id: 'wo-002',
    orderNumber: 'WO-2024-001235',
    title: 'صيانة عداد معطل',
    description: 'إصلاح عطل في وحدة القياس للعداد',
    type: 'repair',
    priority: 'urgent',
    status: 'pending',
    customerId: 'CUS-003',
    customerName: 'مركز التسوق الكبير',
    meterId: 'mtr-003',
    meterNumber: 'MTR-003456',
    assignedTo: 'EMP-002',
    assignedToName: 'خالد عبدالله',
    location: 'شارع التحلية، مركز المدينة',
    scheduledDate: '2024-12-16',
    scheduledTime: '14:00',
    estimatedDuration: 120,
    notes: 'العميل يشتكي من توقف العداد منذ أسبوع',
    createdAt: '2024-12-15',
    createdBy: 'خدمة العملاء',
  },
  {
    id: 'wo-003',
    orderNumber: 'WO-2024-001236',
    title: 'قراءة عدادات شهرية',
    description: 'قراءة عدادات حي النور السكني',
    type: 'meter_reading',
    priority: 'medium',
    status: 'assigned',
    customerId: '',
    customerName: 'حي النور السكني',
    assignedTo: 'EMP-003',
    assignedToName: 'سعيد علي',
    location: 'حي النور، شارع الملك فهد',
    scheduledDate: '2024-12-17',
    scheduledTime: '08:00',
    estimatedDuration: 240,
    notes: '25 عداد للقراءة',
    createdAt: '2024-12-15',
    createdBy: 'النظام',
  },
  {
    id: 'wo-004',
    orderNumber: 'WO-2024-001237',
    title: 'فحص دوري للمحول',
    description: 'فحص وصيانة دورية للمحول الرئيسي',
    type: 'inspection',
    priority: 'low',
    status: 'completed',
    customerId: '',
    customerName: 'محطة الشمال 1',
    assetId: 'AST-001',
    assetName: 'المحول الرئيسي T1',
    assignedTo: 'EMP-004',
    assignedToName: 'محمد فهد',
    location: 'محطة الشمال 1',
    scheduledDate: '2024-12-15',
    scheduledTime: '10:00',
    startedAt: '2024-12-15T10:05:00',
    completedAt: '2024-12-15T12:30:00',
    estimatedDuration: 180,
    actualDuration: 145,
    notes: 'تم الفحص بنجاح - لا توجد مشاكل',
    createdAt: '2024-12-10',
    createdBy: 'مدير الصيانة',
  },
  {
    id: 'wo-005',
    orderNumber: 'WO-2024-001238',
    title: 'إعادة توصيل الخدمة',
    description: 'إعادة توصيل الكهرباء بعد سداد المستحقات',
    type: 'reconnection',
    priority: 'medium',
    status: 'pending',
    customerId: 'CUS-006',
    customerName: 'فيلا السعادة',
    meterId: 'mtr-006',
    meterNumber: 'MTR-006789',
    assignedTo: 'EMP-001',
    assignedToName: 'أحمد محمد',
    location: 'حي السعادة، فيلا 25',
    scheduledDate: '2024-12-17',
    scheduledTime: '11:00',
    estimatedDuration: 30,
    notes: 'تم سداد جميع المستحقات',
    createdAt: '2024-12-16',
    createdBy: 'قسم التحصيل',
  },
  {
    id: 'wo-006',
    orderNumber: 'WO-2024-001239',
    title: 'صيانة وقائية للكابلات',
    description: 'فحص وصيانة الكابلات الأرضية في المنطقة الصناعية',
    type: 'maintenance',
    priority: 'medium',
    status: 'on_hold',
    customerId: '',
    customerName: 'المنطقة الصناعية',
    assetId: 'AST-010',
    assetName: 'الكابلات الأرضية - القطاع أ',
    assignedTo: 'EMP-005',
    assignedToName: 'عبدالرحمن سالم',
    location: 'المنطقة الصناعية، القطاع أ',
    scheduledDate: '2024-12-18',
    scheduledTime: '07:00',
    estimatedDuration: 360,
    notes: 'معلق بسبب انتظار قطع الغيار',
    createdAt: '2024-12-12',
    createdBy: 'مدير الصيانة',
  },
];

const mockStats: WorkOrderStats = {
  total: 234,
  pending: 28,
  inProgress: 15,
  completed: 180,
  overdue: 8,
  todayOrders: 12,
  avgCompletionTime: 95,
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
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% من الأسبوع الماضي
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
    </CardContent>
  </Card>
);

// نموذج إضافة/تعديل أمر العمل
const WorkOrderForm: React.FC<{
  workOrder?: WorkOrder;
  onClose: () => void;
  onSave: (data: Partial<WorkOrder>) => void;
}> = ({ workOrder, onClose, onSave }) => {
  const isEdit = !!workOrder;
  const [formData, setFormData] = useState<Partial<WorkOrder>>(
    workOrder || { type: 'maintenance', priority: 'medium', status: 'pending' }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">عنوان أمر العمل *</Label>
        <Input
          id="title"
          value={formData.title || ''}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          dir="rtl"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">نوع العمل *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع العمل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="installation">تركيب</SelectItem>
              <SelectItem value="maintenance">صيانة</SelectItem>
              <SelectItem value="repair">إصلاح</SelectItem>
              <SelectItem value="inspection">فحص</SelectItem>
              <SelectItem value="disconnection">فصل</SelectItem>
              <SelectItem value="reconnection">إعادة توصيل</SelectItem>
              <SelectItem value="meter_reading">قراءة عداد</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">الأولوية *</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الأولوية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">منخفضة</SelectItem>
              <SelectItem value="medium">متوسطة</SelectItem>
              <SelectItem value="high">عالية</SelectItem>
              <SelectItem value="urgent">عاجلة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">اسم العميل/الموقع *</Label>
          <Input
            id="customerName"
            value={formData.customerName || ''}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            required
            dir="rtl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="assignedToName">الفني المسؤول *</Label>
          <Select
            value={formData.assignedTo}
            onValueChange={(value) => {
              const techNames: Record<string, string> = {
                'EMP-001': 'أحمد محمد',
                'EMP-002': 'خالد عبدالله',
                'EMP-003': 'سعيد علي',
                'EMP-004': 'محمد فهد',
                'EMP-005': 'عبدالرحمن سالم',
              };
              setFormData({ ...formData, assignedTo: value, assignedToName: techNames[value] });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الفني" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EMP-001">أحمد محمد</SelectItem>
              <SelectItem value="EMP-002">خالد عبدالله</SelectItem>
              <SelectItem value="EMP-003">سعيد علي</SelectItem>
              <SelectItem value="EMP-004">محمد فهد</SelectItem>
              <SelectItem value="EMP-005">عبدالرحمن سالم</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="scheduledDate">تاريخ التنفيذ *</Label>
          <Input
            id="scheduledDate"
            type="date"
            value={formData.scheduledDate || ''}
            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="scheduledTime">وقت التنفيذ *</Label>
          <Input
            id="scheduledTime"
            type="time"
            value={formData.scheduledTime || ''}
            onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimatedDuration">المدة المتوقعة (دقيقة)</Label>
          <Input
            id="estimatedDuration"
            type="number"
            value={formData.estimatedDuration || ''}
            onChange={(e) => setFormData({ ...formData, estimatedDuration: Number(e.target.value) })}
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
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          dir="rtl"
          rows={3}
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
        <Button type="submit">{isEdit ? 'حفظ التعديلات' : 'إنشاء أمر العمل'}</Button>
      </DialogFooter>
    </form>
  );
};

// عرض تفاصيل أمر العمل
const WorkOrderDetails: React.FC<{ workOrder: WorkOrder; onClose: () => void; onStatusChange: (status: string) => void }> = ({ workOrder, onClose, onStatusChange }) => {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    assigned: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-indigo-100 text-indigo-800',
    on_hold: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    assigned: 'تم التعيين',
    in_progress: 'قيد التنفيذ',
    on_hold: 'معلق',
    completed: 'مكتمل',
    cancelled: 'ملغي',
  };

  const typeLabels: Record<string, string> = {
    installation: 'تركيب',
    maintenance: 'صيانة',
    repair: 'إصلاح',
    inspection: 'فحص',
    disconnection: 'فصل',
    reconnection: 'إعادة توصيل',
    meter_reading: 'قراءة عداد',
  };

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };

  const priorityLabels: Record<string, string> = {
    low: 'منخفضة',
    medium: 'متوسطة',
    high: 'عالية',
    urgent: 'عاجلة',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{workOrder.orderNumber}</h3>
          <p className="text-sm text-gray-500">{workOrder.title}</p>
        </div>
        <div className="flex gap-2">
          <Badge className={priorityColors[workOrder.priority]}>{priorityLabels[workOrder.priority]}</Badge>
          <Badge className={statusColors[workOrder.status]}>{statusLabels[workOrder.status]}</Badge>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">التفاصيل</TabsTrigger>
          <TabsTrigger value="timeline">الجدول الزمني</TabsTrigger>
          <TabsTrigger value="actions">الإجراءات</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">نوع العمل:</span>
                  <span className="font-medium">{typeLabels[workOrder.type]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">العميل/الموقع:</span>
                  <span className="font-medium">{workOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">الفني المسؤول:</span>
                  <span className="font-medium">{workOrder.assignedToName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">المدة المتوقعة:</span>
                  <span className="font-medium">{workOrder.estimatedDuration} دقيقة</span>
                </div>
                {workOrder.meterNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">رقم العداد:</span>
                    <span className="font-medium">{workOrder.meterNumber}</span>
                  </div>
                )}
                {workOrder.assetName && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">الأصل:</span>
                    <span className="font-medium">{workOrder.assetName}</span>
                  </div>
                )}
                <div className="flex justify-between col-span-2">
                  <span className="text-gray-500">الموقع:</span>
                  <span className="font-medium">{workOrder.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {workOrder.description && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">الوصف</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{workOrder.description}</p>
              </CardContent>
            </Card>
          )}

          {workOrder.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">ملاحظات</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{workOrder.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">تم إنشاء أمر العمل</p>
                    <p className="text-xs text-gray-500">{workOrder.createdAt} - بواسطة {workOrder.createdBy}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">موعد التنفيذ المجدول</p>
                    <p className="text-xs text-gray-500">{workOrder.scheduledDate} - {workOrder.scheduledTime}</p>
                  </div>
                </div>
                {workOrder.startedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">بدء التنفيذ</p>
                      <p className="text-xs text-gray-500">{new Date(workOrder.startedAt).toLocaleString('ar-SA')}</p>
                    </div>
                  </div>
                )}
                {workOrder.completedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">تم الإكمال</p>
                      <p className="text-xs text-gray-500">{new Date(workOrder.completedAt).toLocaleString('ar-SA')}</p>
                      {workOrder.actualDuration && (
                        <p className="text-xs text-gray-500">المدة الفعلية: {workOrder.actualDuration} دقيقة</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {workOrder.status === 'pending' && (
                  <Button onClick={() => onStatusChange('assigned')} className="w-full">
                    <User className="h-4 w-4 ml-2" />
                    تعيين الفني
                  </Button>
                )}
                {(workOrder.status === 'pending' || workOrder.status === 'assigned') && (
                  <Button onClick={() => onStatusChange('in_progress')} className="w-full bg-indigo-600 hover:bg-indigo-700">
                    <Play className="h-4 w-4 ml-2" />
                    بدء التنفيذ
                  </Button>
                )}
                {workOrder.status === 'in_progress' && (
                  <>
                    <Button onClick={() => onStatusChange('on_hold')} variant="outline" className="w-full">
                      <Pause className="h-4 w-4 ml-2" />
                      تعليق
                    </Button>
                    <Button onClick={() => onStatusChange('completed')} className="w-full bg-green-600 hover:bg-green-700">
                      <Check className="h-4 w-4 ml-2" />
                      إكمال
                    </Button>
                  </>
                )}
                {workOrder.status === 'on_hold' && (
                  <Button onClick={() => onStatusChange('in_progress')} className="w-full bg-indigo-600 hover:bg-indigo-700">
                    <Play className="h-4 w-4 ml-2" />
                    استئناف
                  </Button>
                )}
                {workOrder.status !== 'completed' && workOrder.status !== 'cancelled' && (
                  <Button onClick={() => onStatusChange('cancelled')} variant="destructive" className="w-full">
                    <X className="h-4 w-4 ml-2" />
                    إلغاء
                  </Button>
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
const WorkOrdersList: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(mockWorkOrders);
  const [stats] = useState<WorkOrderStats>(mockStats);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);
  const [viewingOrder, setViewingOrder] = useState<WorkOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredData = useMemo(() => {
    return workOrders.filter((wo) => {
      const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;
      const matchesType = typeFilter === 'all' || wo.type === typeFilter;
      const matchesPriority = priorityFilter === 'all' || wo.priority === priorityFilter;
      const matchesSearch = globalFilter === '' ||
        wo.orderNumber.toLowerCase().includes(globalFilter.toLowerCase()) ||
        wo.title.toLowerCase().includes(globalFilter.toLowerCase()) ||
        wo.customerName.toLowerCase().includes(globalFilter.toLowerCase());
      return matchesStatus && matchesType && matchesPriority && matchesSearch;
    });
  }, [workOrders, statusFilter, typeFilter, priorityFilter, globalFilter]);

  const columns: ColumnDef<WorkOrder>[] = [
    {
      accessorKey: 'orderNumber',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          رقم الأمر
          <ArrowUpDown className="mr-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium text-blue-600">{row.getValue('orderNumber')}</div>,
    },
    {
      accessorKey: 'title',
      header: 'العنوان',
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.getValue('title')}>
          {row.getValue('title')}
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'النوع',
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        const typeLabels: Record<string, string> = {
          installation: 'تركيب',
          maintenance: 'صيانة',
          repair: 'إصلاح',
          inspection: 'فحص',
          disconnection: 'فصل',
          reconnection: 'إعادة توصيل',
          meter_reading: 'قراءة عداد',
        };
        return <span>{typeLabels[type] || type}</span>;
      },
    },
    {
      accessorKey: 'priority',
      header: 'الأولوية',
      cell: ({ row }) => {
        const priority = row.getValue('priority') as string;
        const priorityMap: Record<string, { text: string; color: string }> = {
          low: { text: 'منخفضة', color: 'bg-gray-100 text-gray-800' },
          medium: { text: 'متوسطة', color: 'bg-blue-100 text-blue-800' },
          high: { text: 'عالية', color: 'bg-orange-100 text-orange-800' },
          urgent: { text: 'عاجلة', color: 'bg-red-100 text-red-800' },
        };
        const { text, color } = priorityMap[priority] || { text: priority, color: 'bg-gray-100' };
        return <Badge className={color}>{text}</Badge>;
      },
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const statusMap: Record<string, { text: string; color: string }> = {
          pending: { text: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-800' },
          assigned: { text: 'تم التعيين', color: 'bg-blue-100 text-blue-800' },
          in_progress: { text: 'قيد التنفيذ', color: 'bg-indigo-100 text-indigo-800' },
          on_hold: { text: 'معلق', color: 'bg-orange-100 text-orange-800' },
          completed: { text: 'مكتمل', color: 'bg-green-100 text-green-800' },
          cancelled: { text: 'ملغي', color: 'bg-red-100 text-red-800' },
        };
        const { text, color } = statusMap[status] || { text: status, color: 'bg-gray-100' };
        return <Badge className={color}>{text}</Badge>;
      },
    },
    {
      accessorKey: 'assignedToName',
      header: 'الفني',
    },
    {
      accessorKey: 'scheduledDate',
      header: 'التاريخ',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.getValue('scheduledDate')}
          <br />
          <span className="text-gray-500">{row.original.scheduledTime}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      cell: ({ row }) => {
        const order = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setViewingOrder(order)}>
                <Eye className="ml-2 h-4 w-4" />
                عرض التفاصيل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditingOrder(order)}>
                <Edit className="ml-2 h-4 w-4" />
                تعديل
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  if (window.confirm(`هل أنت متأكد من حذف أمر العمل: ${order.orderNumber}?`)) {
                    setWorkOrders(workOrders.filter((wo) => wo.id !== order.id));
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

  const handleSaveOrder = (data: Partial<WorkOrder>) => {
    if (editingOrder) {
      setWorkOrders(workOrders.map((wo) => (wo.id === editingOrder.id ? { ...wo, ...data } : wo)));
    } else {
      const newOrder: WorkOrder = {
        ...data,
        id: `wo-${Date.now()}`,
        orderNumber: `WO-2024-${String(workOrders.length + 1).padStart(6, '0')}`,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'المستخدم الحالي',
      } as WorkOrder;
      setWorkOrders([...workOrders, newOrder]);
    }
    setEditingOrder(null);
  };

  const handleStatusChange = (newStatus: string) => {
    if (viewingOrder) {
      const updates: Partial<WorkOrder> = { status: newStatus as any };
      if (newStatus === 'in_progress' && !viewingOrder.startedAt) {
        updates.startedAt = new Date().toISOString();
      }
      if (newStatus === 'completed') {
        updates.completedAt = new Date().toISOString();
        if (viewingOrder.startedAt) {
          updates.actualDuration = Math.round((Date.now() - new Date(viewingOrder.startedAt).getTime()) / 60000);
        }
      }
      setWorkOrders(workOrders.map((wo) => (wo.id === viewingOrder.id ? { ...wo, ...updates } : wo)));
      setViewingOrder({ ...viewingOrder, ...updates });
    }
  };

  return (
    <DashboardLayout title="إدارة أوامر العمل">
      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="إجمالي أوامر العمل"
          value={stats.total}
          icon={<ClipboardList className="h-6 w-6 text-blue-600" />}
          color="bg-blue-100"
        />
        <StatCard
          title="قيد الانتظار"
          value={stats.pending}
          icon={<Clock className="h-6 w-6 text-yellow-600" />}
          color="bg-yellow-100"
        />
        <StatCard
          title="قيد التنفيذ"
          value={stats.inProgress}
          icon={<Wrench className="h-6 w-6 text-indigo-600" />}
          color="bg-indigo-100"
        />
        <StatCard
          title="المتأخرة"
          value={stats.overdue}
          icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
          color="bg-red-100"
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
                  placeholder="بحث برقم الأمر أو العنوان..."
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
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="assigned">تم التعيين</SelectItem>
                  <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                  <SelectItem value="on_hold">معلق</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="الأولوية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأولويات</SelectItem>
                  <SelectItem value="urgent">عاجلة</SelectItem>
                  <SelectItem value="high">عالية</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="low">منخفضة</SelectItem>
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
                    أمر عمل جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>إنشاء أمر عمل جديد</DialogTitle>
                    <DialogDescription>أدخل بيانات أمر العمل الجديد</DialogDescription>
                  </DialogHeader>
                  <WorkOrderForm onClose={() => setIsAddDialogOpen(false)} onSave={handleSaveOrder} />
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
                      لا توجد أوامر عمل مطابقة للبحث.
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
              من {filteredData.length} أمر عمل
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
      <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل أمر العمل</DialogTitle>
            <DialogDescription>تعديل بيانات أمر العمل: {editingOrder?.orderNumber}</DialogDescription>
          </DialogHeader>
          {editingOrder && <WorkOrderForm workOrder={editingOrder} onClose={() => setEditingOrder(null)} onSave={handleSaveOrder} />}
        </DialogContent>
      </Dialog>

      {/* نافذة عرض التفاصيل */}
      <Dialog open={!!viewingOrder} onOpenChange={() => setViewingOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل أمر العمل</DialogTitle>
          </DialogHeader>
          {viewingOrder && <WorkOrderDetails workOrder={viewingOrder} onClose={() => setViewingOrder(null)} onStatusChange={handleStatusChange} />}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default WorkOrdersList;
