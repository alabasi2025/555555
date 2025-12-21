import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Loader2,
  AlertTriangle,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  Download,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/DashboardLayout';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

export const CustomersList: React.FC = () => {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [newCustomer, setNewCustomer] = useState({
    customerCode: '',
    customerName: '',
    email: '',
    phone: '',
    address: '',
    customerType: 'individual' as 'individual' | 'company' | 'government',
  });

  // جلب البيانات من الـ Backend
  const { data: customers, isLoading, error, refetch } = trpc.customers.list.useQuery();
  
  // Mutations
  const createMutation = trpc.customers.create.useMutation({
    onSuccess: () => {
      toast.success('تم إضافة العميل بنجاح');
      setIsAddDialogOpen(false);
      setNewCustomer({
        customerCode: '',
        customerName: '',
        email: '',
        phone: '',
        address: '',
        customerType: 'individual' as 'individual' | 'company' | 'government',
      });
      refetch();
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });

  const deleteMutation = trpc.customers.delete.useMutation({
    onSuccess: () => {
      toast.success('تم حذف العميل بنجاح');
      setIsDeleteDialogOpen(false);
      setSelectedCustomer(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });

  // فلترة البيانات
  const filteredCustomers = React.useMemo(() => {
    if (!customers) return [];
    
    let filtered = [...customers];

    // الفلترة حسب الحالة
    if (filterStatus !== 'all') {
      filtered = filtered.filter((c: any) => c.status === filterStatus);
    }

    // البحث
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c: any) =>
          c.name?.toLowerCase().includes(lowerSearch) ||
          c.email?.toLowerCase().includes(lowerSearch) ||
          c.phone?.includes(searchTerm) ||
          c.accountNumber?.toLowerCase().includes(lowerSearch)
      );
    }

    return filtered;
  }, [customers, searchTerm, filterStatus]);

  // إحصائيات
  const stats = React.useMemo(() => {
    if (!customers) return { total: 0, active: 0, inactive: 0, suspended: 0 };
    return {
      total: customers.length,
      active: customers.filter((c: any) => c.status === 'active').length,
      inactive: customers.filter((c: any) => c.status === 'inactive').length,
      suspended: customers.filter((c: any) => c.status === 'suspended').length,
    };
  }, [customers]);

  const handleAddCustomer = () => {
    if (!newCustomer.customerCode || !newCustomer.customerName) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    createMutation.mutate(newCustomer);
  };

  const handleDeleteCustomer = () => {
    if (selectedCustomer) {
      deleteMutation.mutate({ id: selectedCustomer.id });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">نشط</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">غير نشط</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">موقوف</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCustomerTypeBadge = (type: string) => {
    switch (type) {
      case 'residential':
        return <Badge variant="outline">سكني</Badge>;
      case 'commercial':
        return <Badge className="bg-blue-100 text-blue-800">تجاري</Badge>;
      case 'industrial':
        return <Badge className="bg-purple-100 text-purple-800">صناعي</Badge>;
      case 'government':
        return <Badge className="bg-yellow-100 text-yellow-800">حكومي</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir="rtl">
        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي العملاء</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">العملاء النشطين</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-full">
                <Users className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">غير النشطين</p>
                <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الموقوفين</p>
                <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* البطاقة الرئيسية */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-2xl font-bold">قائمة العملاء</CardTitle>
              <CardDescription>
                إدارة وعرض جميع العملاء المسجلين في النظام
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 ml-2" />
                تحديث
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 ml-2" />
                تصدير
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 ml-2" />
                إضافة عميل
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* شريط البحث والفلترة */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ابحث بالاسم أو البريد أو رقم الهاتف أو رقم الحساب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 ml-2" />
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                  <SelectItem value="suspended">موقوف</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* حالة التحميل */}
            {isLoading && (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="mr-2">جاري تحميل بيانات العملاء...</span>
              </div>
            )}

            {/* حالة الخطأ */}
            {error && (
              <div className="flex flex-col items-center justify-center h-64 text-red-600">
                <AlertTriangle className="h-8 w-8 mb-2" />
                <p className="font-bold">حدث خطأ أثناء جلب البيانات</p>
                <p className="text-sm">{error.message}</p>
                <Button onClick={() => refetch()} className="mt-4">
                  إعادة المحاولة
                </Button>
              </div>
            )}

            {/* الجدول */}
            {!isLoading && !error && (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">رقم الحساب</TableHead>
                      <TableHead className="text-right">الاسم</TableHead>
                      <TableHead className="text-right">البريد الإلكتروني</TableHead>
                      <TableHead className="text-right">الهاتف</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">تاريخ التسجيل</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer: any) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">
                            {customer.accountNumber || '-'}
                          </TableCell>
                          <TableCell>{customer.name}</TableCell>
                          <TableCell>{customer.email || '-'}</TableCell>
                          <TableCell dir="ltr" className="text-right">
                            {customer.phone || '-'}
                          </TableCell>
                          <TableCell>
                            {getCustomerTypeBadge(customer.customerType)}
                          </TableCell>
                          <TableCell>{getStatusBadge(customer.status)}</TableCell>
                          <TableCell>
                            {customer.createdAt
                              ? new Date(customer.createdAt).toLocaleDateString('ar-SA')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setLocation(`/customers/${customer.id}`)}
                                >
                                  <Eye className="h-4 w-4 ml-2" />
                                  عرض التفاصيل
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setLocation(`/customers/${customer.id}/edit`)}
                                >
                                  <Pencil className="h-4 w-4 ml-2" />
                                  تعديل
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedCustomer(customer);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 ml-2" />
                                  حذف
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">لا يوجد عملاء</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* عدد النتائج */}
            {!isLoading && !error && (
              <div className="mt-4 text-sm text-muted-foreground">
                عرض {filteredCustomers.length} من {customers?.length || 0} عميل
              </div>
            )}
          </CardContent>
        </Card>

        {/* نافذة إضافة عميل */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة عميل جديد</DialogTitle>
              <DialogDescription>
                أدخل بيانات العميل الجديد
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customerCode">رقم العميل *</Label>
                <Input
                  id="customerCode"
                  value={newCustomer.customerCode}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, customerCode: e.target.value })
                  }
                  placeholder="CUS-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerName">اسم العميل *</Label>
                <Input
                  id="customerName"
                  value={newCustomer.customerName}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, customerName: e.target.value })
                  }
                  placeholder="اسم العميل"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, email: e.target.value })
                  }
                  placeholder="example@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  placeholder="05xxxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <Input
                  id="address"
                  value={newCustomer.address}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, address: e.target.value })
                  }
                  placeholder="العنوان"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerType">نوع العميل</Label>
                <Select
                  value={newCustomer.customerType}
                  onValueChange={(value: 'individual' | 'company' | 'government') =>
                    setNewCustomer({ ...newCustomer, customerType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">فردي</SelectItem>
                    <SelectItem value="company">شركة</SelectItem>
                    <SelectItem value="government">حكومي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleAddCustomer} disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                )}
                إضافة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* نافذة تأكيد الحذف */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>تأكيد الحذف</DialogTitle>
              <DialogDescription>
                هل أنت متأكد من حذف العميل "{selectedCustomer?.name}"؟
                <br />
                هذا الإجراء لا يمكن التراجع عنه.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteCustomer}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && (
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                )}
                حذف
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CustomersList;
