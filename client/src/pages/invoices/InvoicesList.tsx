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
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Printer,
  Send,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/DashboardLayout';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

export const InvoicesList: React.FC = () => {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // جلب البيانات من الـ Backend
  const { data: invoices, isLoading, error, refetch } = trpc.invoices.list.useQuery();

  // Mutations
  const deleteMutation = trpc.invoices.delete.useMutation({
    onSuccess: () => {
      toast.success('تم حذف الفاتورة بنجاح');
      setIsDeleteDialogOpen(false);
      setSelectedInvoice(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });

  const updateStatusMutation = trpc.invoices.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث حالة الفاتورة');
      refetch();
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });

  // فلترة البيانات
  const filteredInvoices = React.useMemo(() => {
    if (!invoices) return [];
    
    let filtered = [...invoices];

    if (filterStatus !== 'all') {
      filtered = filtered.filter((inv: any) => inv.status === filterStatus);
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (inv: any) =>
          inv.invoiceNumber?.toLowerCase().includes(lowerSearch) ||
          inv.customer?.name?.toLowerCase().includes(lowerSearch)
      );
    }

    return filtered;
  }, [invoices, searchTerm, filterStatus]);

  // إحصائيات
  const stats = React.useMemo(() => {
    if (!invoices) return { total: 0, paid: 0, pending: 0, overdue: 0, totalAmount: 0 };
    return {
      total: invoices.length,
      paid: invoices.filter((inv: any) => inv.status === 'paid').length,
      pending: invoices.filter((inv: any) => inv.status === 'pending').length,
      overdue: invoices.filter((inv: any) => inv.status === 'overdue').length,
      totalAmount: invoices.reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0),
    };
  }, [invoices]);

  const handleDeleteInvoice = () => {
    if (selectedInvoice) {
      deleteMutation.mutate({ id: selectedInvoice.id });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">مدفوعة</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">معلقة</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">متأخرة</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">ملغاة</Badge>;
      case 'draft':
        return <Badge variant="outline">مسودة</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir="rtl">
        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الفواتير</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المدفوعة</p>
                <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المعلقة</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المتأخرة</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المبالغ</p>
                <p className="text-lg font-bold text-purple-600">{formatCurrency(stats.totalAmount)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* البطاقة الرئيسية */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-2xl font-bold">قائمة الفواتير</CardTitle>
              <CardDescription>
                إدارة وعرض جميع الفواتير في النظام
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
              <Button onClick={() => setLocation('/invoices/new')}>
                <Plus className="h-4 w-4 ml-2" />
                فاتورة جديدة
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* شريط البحث والفلترة */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ابحث برقم الفاتورة أو اسم العميل..."
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
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="pending">معلقة</SelectItem>
                  <SelectItem value="paid">مدفوعة</SelectItem>
                  <SelectItem value="overdue">متأخرة</SelectItem>
                  <SelectItem value="cancelled">ملغاة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* حالة التحميل */}
            {isLoading && (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="mr-2">جاري تحميل الفواتير...</span>
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
                      <TableHead className="text-right">رقم الفاتورة</TableHead>
                      <TableHead className="text-right">العميل</TableHead>
                      <TableHead className="text-right">تاريخ الإصدار</TableHead>
                      <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.length > 0 ? (
                      filteredInvoices.map((invoice: any) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell>{invoice.customer?.name || '-'}</TableCell>
                          <TableCell>
                            {invoice.issueDate
                              ? new Date(invoice.issueDate).toLocaleDateString('ar-SA')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {invoice.dueDate
                              ? new Date(invoice.dueDate).toLocaleDateString('ar-SA')
                              : '-'}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(invoice.totalAmount || 0)}
                          </TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
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
                                  onClick={() => setLocation(`/invoices/${invoice.id}`)}
                                >
                                  <Eye className="h-4 w-4 ml-2" />
                                  عرض التفاصيل
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Printer className="h-4 w-4 ml-2" />
                                  طباعة
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Send className="h-4 w-4 ml-2" />
                                  إرسال للعميل
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {invoice.status === 'pending' && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateStatusMutation.mutate({
                                        id: invoice.id,
                                        status: 'paid',
                                      })
                                    }
                                  >
                                    <CheckCircle className="h-4 w-4 ml-2" />
                                    تحديد كمدفوعة
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => setLocation(`/invoices/${invoice.id}/edit`)}
                                >
                                  <Pencil className="h-4 w-4 ml-2" />
                                  تعديل
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedInvoice(invoice);
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
                        <TableCell colSpan={7} className="text-center py-8">
                          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">لا توجد فواتير</p>
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
                عرض {filteredInvoices.length} من {invoices?.length || 0} فاتورة
              </div>
            )}
          </CardContent>
        </Card>

        {/* نافذة تأكيد الحذف */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>تأكيد الحذف</DialogTitle>
              <DialogDescription>
                هل أنت متأكد من حذف الفاتورة "{selectedInvoice?.invoiceNumber}"؟
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
                onClick={handleDeleteInvoice}
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

export default InvoicesList;
