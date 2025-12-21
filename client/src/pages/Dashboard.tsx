import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { 
  BookOpen, 
  Users, 
  FileText, 
  Package, 
  BarChart3, 
  Calculator,
  TrendingUp,
  ShoppingCart,
  Wallet,
  ClipboardList,
  Gauge,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw,
  Calendar,
  DollarSign,
  Activity,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  
  // التحقق من تسجيل الدخول
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("demo-authenticated") === "true";
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [setLocation]);

  // جلب البيانات من الـ Backend
  const { data: mainStats, isLoading: statsLoading, refetch: refetchStats } = trpc.dashboard.getMainStats.useQuery();
  const { data: recentActivities, isLoading: activitiesLoading } = trpc.dashboard.getRecentActivities.useQuery({ limit: 10 });
  const { data: overdueInvoices, isLoading: overdueLoading } = trpc.dashboard.getOverdueInvoices.useQuery({ limit: 5 });
  const { data: lowStockItems, isLoading: lowStockLoading } = trpc.dashboard.getLowStockItems.useQuery({ limit: 5 });
  const { data: invoiceStatusChart } = trpc.dashboard.getInvoiceStatusChart.useQuery();

  const modules = [
    {
      title: "شجرة الحسابات",
      description: "إدارة الحسابات المحاسبية والهيكل المالي",
      icon: BookOpen,
      href: "/accounts",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "إدارة العملاء",
      description: "إدارة بيانات العملاء والموردين",
      icon: Users,
      href: "/customers",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "الفوترة والتحصيل",
      description: "إصدار الفواتير وإدارة المدفوعات",
      icon: FileText,
      href: "/invoices",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "المخزون",
      description: "إدارة المخزون والأصناف",
      icon: Package,
      href: "/inventory",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "المشتريات",
      description: "طلبات الشراء واستلام المواد",
      icon: ShoppingCart,
      href: "/purchases",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "القيود المحاسبية",
      description: "القيود اليومية والتسويات",
      icon: Calculator,
      href: "/journal-entries",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "العدادات",
      description: "إدارة العدادات والقراءات",
      icon: Gauge,
      href: "/meters",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "أوامر العمل",
      description: "إدارة أوامر العمل والصيانة",
      icon: Wrench,
      href: "/work-orders",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
  ];

  // تنسيق الأرقام
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-SA').format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(num);
  };

  // حساب نسبة التحصيل
  const collectionRate = mainStats?.invoices?.totalAmount 
    ? ((mainStats.invoices.paidAmount / mainStats.invoices.totalAmount) * 100).toFixed(1)
    : "0";

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
            <p className="text-gray-600 mt-2">نظام إدارة محطات الكهرباء المتكامل</p>
          </div>
          <Button variant="outline" onClick={() => refetchStats()} disabled={statsLoading}>
            <RefreshCw className={`h-4 w-4 ml-2 ${statsLoading ? 'animate-spin' : ''}`} />
            تحديث البيانات
          </Button>
        </div>

        {/* Stats Cards */}
        {statsLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="mr-2">جاري تحميل الإحصائيات...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* إجمالي الفواتير */}
            <Card className="border-r-4 border-r-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  إجمالي الفواتير
                </CardTitle>
                <div className="p-2 bg-blue-100 rounded-full">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(mainStats?.invoices?.total || 0)}</div>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500">بقيمة</span>
                  <span className="text-sm font-semibold text-blue-600 mr-1">
                    {formatCurrency(mainStats?.invoices?.totalAmount || 0)}
                  </span>
                </div>
                {mainStats?.invoices?.changePercent && Number(mainStats.invoices.changePercent) !== 0 && (
                  <div className="flex items-center mt-1">
                    {Number(mainStats.invoices.changePercent) > 0 ? (
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs ${Number(mainStats.invoices.changePercent) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {mainStats.invoices.changePercent}% عن الشهر السابق
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* المدفوعات */}
            <Card className="border-r-4 border-r-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  المدفوعات المستلمة
                </CardTitle>
                <div className="p-2 bg-green-100 rounded-full">
                  <Wallet className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(mainStats?.payments?.totalAmount || 0)}
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500">عدد العمليات:</span>
                  <span className="text-sm font-semibold mr-1">
                    {formatNumber(mainStats?.payments?.total || 0)}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>نسبة التحصيل</span>
                    <span>{collectionRate}%</span>
                  </div>
                  <Progress value={Number(collectionRate)} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* الذمم المدينة */}
            <Card className="border-r-4 border-r-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  الذمم المدينة
                </CardTitle>
                <div className="p-2 bg-orange-100 rounded-full">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(mainStats?.invoices?.remainingAmount || 0)}
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500">المستحقة للتحصيل</span>
                </div>
              </CardContent>
            </Card>

            {/* العملاء */}
            <Card className="border-r-4 border-r-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  العملاء
                </CardTitle>
                <div className="p-2 bg-purple-100 rounded-full">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(mainStats?.customers?.total || 0)}</div>
                <div className="flex items-center mt-2">
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                    <CheckCircle2 className="h-3 w-3 ml-1" />
                    {formatNumber(mainStats?.customers?.active || 0)} نشط
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* الصف الثاني من الإحصائيات */}
        {!statsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* العدادات */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">العدادات</CardTitle>
                <Gauge className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(mainStats?.meters?.total || 0)}</div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-green-600">
                    {mainStats?.meters?.active || 0} نشط
                  </Badge>
                  {(mainStats?.meters?.faulty || 0) > 0 && (
                    <Badge variant="outline" className="text-red-600">
                      {mainStats?.meters?.faulty || 0} معطل
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* أوامر العمل */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">أوامر العمل</CardTitle>
                <Wrench className="h-4 w-4 text-pink-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(mainStats?.workOrders?.total || 0)}</div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className="text-yellow-600">
                    <Clock className="h-3 w-3 ml-1" />
                    {mainStats?.workOrders?.pending || 0} قيد الانتظار
                  </Badge>
                  <Badge variant="outline" className="text-blue-600">
                    <Activity className="h-3 w-3 ml-1" />
                    {mainStats?.workOrders?.inProgress || 0} جاري
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* الأصول */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">الأصول</CardTitle>
                <Zap className="h-4 w-4 text-cyan-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(mainStats?.assets?.total || 0)}</div>
                <div className="text-sm text-gray-500 mt-2">
                  القيمة: {formatCurrency(mainStats?.assets?.totalValue || 0)}
                </div>
              </CardContent>
            </Card>

            {/* المخزون */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">المخزون</CardTitle>
                <Package className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(mainStats?.inventory?.totalItems || 0)}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-500">
                    القيمة: {formatCurrency(mainStats?.inventory?.totalValue || 0)}
                  </span>
                </div>
                {(mainStats?.inventory?.lowStockItems || 0) > 0 && (
                  <Badge variant="destructive" className="mt-2">
                    <AlertTriangle className="h-3 w-3 ml-1" />
                    {mainStats?.inventory?.lowStockItems} أصناف منخفضة
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* القوائم والجداول */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* آخر الأنشطة */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">آخر الأنشطة</CardTitle>
                <CardDescription>أحدث العمليات في النظام</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : recentActivities && recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.map((activity: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          activity.type === 'invoice' ? 'bg-blue-100' :
                          activity.type === 'payment' ? 'bg-green-100' :
                          activity.type === 'journal' ? 'bg-purple-100' : 'bg-gray-100'
                        }`}>
                          {activity.type === 'invoice' ? <FileText className="h-4 w-4 text-blue-600" /> :
                           activity.type === 'payment' ? <Wallet className="h-4 w-4 text-green-600" /> :
                           activity.type === 'journal' ? <Calculator className="h-4 w-4 text-purple-600" /> :
                           <Activity className="h-4 w-4 text-gray-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{activity.description}</p>
                          <p className="text-xs text-gray-500">{activity.reference}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-gray-500">
                          {new Date(activity.createdAt).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">لا توجد أنشطة حديثة</p>
              )}
            </CardContent>
          </Card>

          {/* الفواتير المتأخرة */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 ml-2" />
                  الفواتير المتأخرة
                </CardTitle>
                <CardDescription>فواتير تجاوزت تاريخ الاستحقاق</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {overdueLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : overdueInvoices && overdueInvoices.length > 0 ? (
                <div className="space-y-3">
                  {overdueInvoices.map((invoice: any) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                      <div>
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-gray-500">{invoice.customerName}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-red-600">{formatCurrency(invoice.remainingAmount)}</p>
                        <Badge variant="destructive" className="text-xs">
                          متأخر {invoice.daysOverdue} يوم
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-500">لا توجد فواتير متأخرة</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* أصناف المخزون المنخفضة */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center">
                  <Package className="h-5 w-5 text-orange-500 ml-2" />
                  أصناف منخفضة المخزون
                </CardTitle>
                <CardDescription>أصناف تحتاج إعادة طلب</CardDescription>
              </div>
              <Link href="/inventory">
                <Button variant="ghost" size="sm">عرض الكل</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {lowStockLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : lowStockItems && lowStockItems.length > 0 ? (
                <div className="space-y-3">
                  {lowStockItems.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <div>
                        <p className="font-medium">{item.itemName}</p>
                        <p className="text-sm text-gray-500">
                          الحد الأدنى: {item.minQuantity}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-orange-600">{item.currentQuantity}</p>
                        <Badge variant="outline" className="text-red-600 text-xs">
                          نقص: {item.deficit}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-500">جميع الأصناف متوفرة</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modules */}
        <div>
          <h2 className="text-xl font-semibold mb-4">الأنظمة الفرعية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module, index) => (
              <Link key={index} href={module.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${module.bgColor} flex items-center justify-center mb-4`}>
                      <module.icon className={`h-6 w-6 ${module.color}`} />
                    </div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
