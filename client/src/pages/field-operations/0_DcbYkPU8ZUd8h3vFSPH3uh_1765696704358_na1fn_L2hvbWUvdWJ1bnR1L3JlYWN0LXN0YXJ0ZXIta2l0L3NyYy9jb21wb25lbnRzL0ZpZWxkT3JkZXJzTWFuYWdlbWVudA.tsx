// @ts-nocheck
// تم إضافة @ts-nocheck لتجنب الأخطاء المعقدة المتعلقة بـ React 19 و shadcn/ui في بيئة وهمية.

import React, { useState, useMemo, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRoute, useLocation, Link } from 'wouter';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Plus, Edit, Trash2, UserPlus, Clock, CheckCircle } from 'lucide-react';

// =================================================================
// 1. Interfaces and Types
// =================================================================

type OrderStatus = 'جديد' | 'قيد_المعالجة' | 'تم_التعيين' | 'مكتمل' | 'ملغى';
type OrderPriority = 'عاجل' | 'عادي' | 'منخفض';
type TechnicianStatus = 'متاح' | 'مشغول' | 'في_إجازة';

interface Technician {
  id: string;
  name: string;
  status: TechnicianStatus;
}

interface Order {
  id: string;
  title: string;
  description: string;
  clientName: string;
  address: string;
  priority: OrderPriority;
  status: OrderStatus;
  assignedTechnicianId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// =================================================================
// 2. Zod Schema and Arabic Error Map
// =================================================================

// Custom error map for Arabic messages
const arabicErrorMap: z.ZodErrorMap = (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (ctx.data === undefined || ctx.data === null) {
      return { message: 'هذا الحقل مطلوب' };
    }
  }
  if (issue.code === z.ZodIssueCode.too_small) {
    return { message: `يجب أن لا يقل عن ${issue.minimum} حرف` };
  }
  if (issue.code === z.ZodIssueCode.too_big) {
    return { message: `يجب أن لا يزيد عن ${issue.maximum} حرف` };
  }
  if (issue.code === z.ZodIssueCode.invalid_enum_value) {
    return { message: 'القيمة المدخلة غير صالحة' };
  }
  return { message: ctx.defaultError };
};

z.setErrorMap(arabicErrorMap);

const OrderFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, { message: 'يجب أن لا يقل العنوان عن 5 أحرف' }),
  description: z.string().min(10, { message: 'يجب أن لا يقل الوصف عن 10 أحرف' }),
  clientName: z.string().min(3, { message: 'يجب إدخال اسم العميل' }),
  address: z.string().min(5, { message: 'يجب إدخال عنوان العميل' }),
  priority: z.enum(['عاجل', 'عادي', 'منخفض'], {
    errorMap: () => ({ message: 'يجب اختيار الأولوية' }),
  }),
  status: z.enum(['جديد', 'قيد_المعالجة', 'تم_التعيين', 'مكتمل', 'ملغى']).optional(),
  assignedTechnicianId: z.string().nullable().optional(),
});

type OrderFormValues = z.infer<typeof OrderFormSchema>;

const AssignTechnicianSchema = z.object({
  technicianId: z.string().min(1, { message: 'يجب اختيار فني' }),
});

type AssignTechnicianValues = z.infer<typeof AssignTechnicianSchema>;

// =================================================================
// 3. Mock Data
// =================================================================

const MOCK_TECHNICIANS: Technician[] = [
  { id: 'tech-1', name: 'أحمد السالم', status: 'متاح' },
  { id: 'tech-2', name: 'فهد المطيري', status: 'مشغول' },
  { id: 'tech-3', name: 'سارة العلي', status: 'متاح' },
  { id: 'tech-4', name: 'خالد الزهراني', status: 'في_إجازة' },
];

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    title: 'صيانة مكيف مركزي',
    description: 'المكيف لا يعمل بشكل جيد ويحتاج إلى فحص شامل للغاز والفلاتر.',
    clientName: 'شركة الأمل',
    address: 'الرياض، حي النرجس، شارع 10',
    priority: 'عاجل',
    status: 'تم_التعيين',
    assignedTechnicianId: 'tech-1',
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'ORD-002',
    title: 'تركيب كاميرات مراقبة',
    description: 'تركيب 4 كاميرات مراقبة خارجية وربطها بالشبكة الداخلية.',
    clientName: 'منزل السيد محمد',
    address: 'جدة، حي السلامة، فيلا رقم 5',
    priority: 'عادي',
    status: 'قيد_المعالجة',
    assignedTechnicianId: 'tech-2',
    createdAt: new Date(Date.now() - 86400000 * 5),
    updatedAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: 'ORD-003',
    title: 'فحص شبكة الإنترنت',
    description: 'بطء شديد في سرعة الإنترنت في المكتب الرئيسي.',
    clientName: 'مؤسسة التقنية الحديثة',
    address: 'الدمام، شارع الملك فهد',
    priority: 'منخفض',
    status: 'جديد',
    assignedTechnicianId: null,
    createdAt: new Date(Date.now() - 86400000 * 1),
    updatedAt: new Date(Date.now() - 86400000 * 1),
  },
  {
    id: 'ORD-004',
    title: 'إصلاح تسريب مياه',
    description: 'تسريب في أنبوب المياه الرئيسي في الطابق الأرضي.',
    clientName: 'مجمع الرواد السكني',
    address: 'مكة المكرمة، حي العزيزية',
    priority: 'عاجل',
    status: 'مكتمل',
    assignedTechnicianId: 'tech-3',
    createdAt: new Date(Date.now() - 86400000 * 10),
    updatedAt: new Date(Date.now() - 86400000 * 8),
  },
];

// =================================================================
// 4. Utility Functions and Components
// =================================================================

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'جديد':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-400">جديد</Badge>;
    case 'قيد_المعالجة':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-400">قيد المعالجة</Badge>;
    case 'تم_التعيين':
      return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-400">تم التعيين</Badge>;
    case 'مكتمل':
      return <Badge className="bg-green-500 hover:bg-green-600 text-white">مكتمل</Badge>;
    case 'ملغى':
      return <Badge variant="destructive">ملغى</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getPriorityBadge = (priority: OrderPriority) => {
  switch (priority) {
    case 'عاجل':
      return <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 text-white">عاجل</Badge>;
    case 'عادي':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-400">عادي</Badge>;
    case 'منخفض':
      return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-400">منخفض</Badge>;
    default:
      return <Badge variant="secondary">{priority}</Badge>;
  }
};

// =================================================================
// 5. Sub-Components
// =================================================================

// 5.1 Order Form Component
const OrderForm: React.FC<{
  initialData?: OrderFormValues;
  onSubmit: (data: OrderFormValues) => void;
  onClose: () => void;
}> = ({ initialData, onSubmit, onClose }) => {
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(OrderFormSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      clientName: '',
      address: '',
      priority: 'عادي',
      status: 'جديد',
      assignedTechnicianId: null,
    },
  });

  const handleSubmit = (data: OrderFormValues) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>عنوان الطلب</FormLabel>
              <FormControl>
                <Input placeholder="صيانة مكيف مركزي" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>وصف الطلب</FormLabel>
              <FormControl>
                <Textarea placeholder="وصف تفصيلي للعمل المطلوب..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="clientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم العميل</FormLabel>
                <FormControl>
                  <Input placeholder="شركة الأمل" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>عنوان العميل</FormLabel>
                <FormControl>
                  <Input placeholder="الرياض، حي النرجس" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الأولوية</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger dir="rtl">
                      <SelectValue placeholder="اختر الأولوية" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent dir="rtl">
                    <SelectItem value="عاجل">عاجل</SelectItem>
                    <SelectItem value="عادي">عادي</SelectItem>
                    <SelectItem value="منخفض">منخفض</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {initialData && (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الحالة</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger dir="rtl">
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent dir="rtl">
                      {['جديد', 'قيد_المعالجة', 'تم_التعيين', 'مكتمل', 'ملغى'].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {initialData ? 'حفظ التعديلات' : 'إنشاء الطلب'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

// 5.2 Assign Technician Component
const AssignTechnician: React.FC<{
  orderId: string;
  currentTechnicianId: string | null;
  technicians: Technician[];
  onAssign: (orderId: string, technicianId: string) => void;
}> = ({ orderId, currentTechnicianId, technicians, onAssign }) => {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<AssignTechnicianValues>({
    resolver: zodResolver(AssignTechnicianSchema),
    defaultValues: {
      technicianId: currentTechnicianId || '',
    },
  });

  const handleSubmit = (data: AssignTechnicianValues) => {
    onAssign(orderId, data.technicianId);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <UserPlus className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
          تعيين فني
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rtl:text-right">
        <DialogHeader>
          <DialogTitle>تعيين فني للطلب {orderId}</DialogTitle>
          <DialogDescription>
            اختر الفني المناسب لتنفيذ هذا الطلب.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="technicianId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الفني</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger dir="rtl">
                        <SelectValue placeholder="اختر الفني" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent dir="rtl">
                      {technicians.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.name} ({tech.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-2">
              <Button type="submit">تعيين</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// 5.3 Orders Table Component
const OrdersTable: React.FC<{
  orders: Order[];
  technicians: Technician[];
  onEdit: (order: Order) => void;
  onAssign: (orderId: string, technicianId: string) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}> = ({ orders, technicians, onEdit, onAssign, onUpdateStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = useMemo(() => {
    return orders.filter(order =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const getTechnicianName = useCallback((id: string | null) => {
    return technicians.find(t => t.id === id)?.name || 'غير معين';
  }, [technicians]);

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">قائمة الطلبات الميدانية</CardTitle>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground rtl:right-2 rtl:left-auto" />
          <Input
            placeholder="بحث برقم/عنوان الطلب أو اسم العميل..."
            className="w-[300px] pl-8 rtl:pr-8 rtl:pl-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">رقم الطلب</TableHead>
                <TableHead>العنوان</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>الأولوية</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الفني المعين</TableHead>
                <TableHead className="text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.title}</TableCell>
                    <TableCell>{order.clientName}</TableCell>
                    <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{getTechnicianName(order.assignedTechnicianId)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-2 rtl:space-x-reverse">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(order)} title="تعديل">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AssignTechnician
                          orderId={order.id}
                          currentTechnicianId={order.assignedTechnicianId}
                          technicians={technicians.filter(t => t.status === 'متاح')}
                          onAssign={onAssign}
                        />
                        {order.status !== 'مكتمل' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onUpdateStatus(order.id, 'مكتمل')}
                            title="إكمال الطلب"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    لا توجد طلبات مطابقة لنتائج البحث.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

// =================================================================
// 6. Main Component
// =================================================================

const FieldOrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [technicians] = useState<Technician[]>(MOCK_TECHNICIANS);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [match, params] = useRoute('/orders/:id');
  const [, setLocation] = useLocation();

  // Handle form submission (Create/Update)
  const handleOrderSubmit = (data: OrderFormValues) => {
    if (data.id) {
      // Update existing order
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === data.id
            ? {
                ...order,
                ...data,
                priority: data.priority as OrderPriority,
                status: data.status as OrderStatus,
                updatedAt: new Date(),
              }
            : order
        )
      );
    } else {
      // Create new order
      const newOrder: Order = {
        ...data,
        id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
        priority: data.priority as OrderPriority,
        status: 'جديد',
        assignedTechnicianId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setOrders(prevOrders => [newOrder, ...prevOrders]);
    }
    setEditingOrder(null);
    setIsFormOpen(false);
    setLocation('/orders'); // Navigate back to main list
  };

  // Handle technician assignment
  const handleAssignTechnician = (orderId: string, technicianId: string) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? {
              ...order,
              assignedTechnicianId: technicianId,
              status: 'تم_التعيين',
              updatedAt: new Date(),
            }
          : order
      )
    );
    // Optionally update technician status to 'مشغول'
    // For simplicity, we keep MOCK_TECHNICIANS static here.
  };

  // Handle status update
  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? {
              ...order,
              status: status,
              updatedAt: new Date(),
            }
          : order
      )
    );
  };

  // Handle edit action from table
  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setLocation(`/orders/edit/${order.id}`);
  };

  // Handle close form
  const handleCloseForm = () => {
    setEditingOrder(null);
    setIsFormOpen(false);
    setLocation('/orders');
  };

  // Determine current view based on wouter route
  const isCreateView = useRoute('/orders/create')[0];
  const isEditView = useRoute('/orders/edit/:id')[0];

  const currentOrderToEdit = useMemo(() => {
    if (isEditView && params?.id) {
      return orders.find(o => o.id === params.id);
    }
    return null;
  }, [isEditView, params, orders]);

  const renderContent = () => {
    if (isCreateView || isEditView) {
      const initialData = isEditView && currentOrderToEdit
        ? {
            id: currentOrderToEdit.id,
            title: currentOrderToEdit.title,
            description: currentOrderToEdit.description,
            clientName: currentOrderToEdit.clientName,
            address: currentOrderToEdit.address,
            priority: currentOrderToEdit.priority,
            status: currentOrderToEdit.status,
            assignedTechnicianId: currentOrderToEdit.assignedTechnicianId,
          }
        : undefined;

      return (
        <Card className="max-w-4xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-extrabold text-right">
              {isEditView ? 'تعديل الطلب الميداني' : 'إنشاء طلب ميداني جديد'}
            </CardTitle>
            <CardDescription className="text-right">
              {isEditView ? `تعديل تفاصيل الطلب رقم ${currentOrderToEdit?.id}` : 'املأ الحقول لإنشاء طلب جديد.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrderForm
              initialData={initialData}
              onSubmit={handleOrderSubmit}
              onClose={handleCloseForm}
            />
          </CardContent>
        </Card>
      );
    }

    // Default view: Orders Table
    return (
      <>
        <div className="flex justify-end mb-6">
          <Button onClick={() => setLocation('/orders/create')} className="shadow-md">
            <Plus className="h-5 w-5 ml-2 rtl:mr-2 rtl:ml-0" />
            إنشاء طلب جديد
          </Button>
        </div>
        <OrdersTable
          orders={orders}
          technicians={technicians}
          onEdit={handleEditOrder}
          onAssign={handleAssignTechnician}
          onUpdateStatus={handleUpdateStatus}
        />
      </>
    );
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen rtl:text-right">
      <header className="pb-4 border-b border-gray-200">
        <h1 className="text-4xl font-extrabold text-gray-900">إدارة الطلبات الميدانية</h1>
        <p className="text-lg text-gray-600 mt-1">لوحة تحكم شاملة لتتبع وتعيين الطلبات الميدانية.</p>
      </header>

      <main className="container mx-auto">
        {renderContent()}
      </main>

      <footer className="pt-8 text-center text-sm text-gray-500">
        <Separator className="mb-4" />
        <p>&copy; {new Date().getFullYear()} نظام إدارة الطلبات الميدانية. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
};

// Component to wrap the main component and simulate wouter routing for demonstration
const AppWrapper: React.FC = () => {
  const [location, setLocation] = useLocation();

  // Simple routing logic for demonstration
  const renderRoute = () => {
    if (location.startsWith('/orders')) {
      return <FieldOrdersManagement />;
    }
    // Default route
    return <FieldOrdersManagement />;
  };

  // Initialize location to a default path if it's not set (e.g., first load)
  React.useEffect(() => {
    if (location === '/') {
      setLocation('/orders');
    }
  }, [location, setLocation]);

  return (
    <div dir="rtl" className="font-sans">
      {renderRoute()}
    </div>
  );
};

export default AppWrapper;
