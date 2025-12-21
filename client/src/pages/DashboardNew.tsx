// @ts-nocheck
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  DollarSign,
  Package,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  Zap,
  Gauge,
  Calendar,
  Bell,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Link, useLocation } from "wouter";

// ============================================
// أنواع البيانات
// ============================================

interface MainStats {
  invoices: {
    total: number;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    changePercent: string;
  };
  payments: {
    total: number;
    totalAmount: number;
  };
  customers: {
    total: number;
    active: number;
  };
  suppliers: {
    total: number;
    active: number;
  };
  inventory: {
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
  };
  meters: {
    total: number;
    active: number;
    faulty: number;
  };
  workOrders: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
  assets: {
    total: number;
    totalValue: number;
  };
}

interface QuickSummary {
  todayInvoices: { count: number; total: number };
  todayPayments: { count: number; total: number };
  todayWorkOrders: number;
  todayCustomers: number;
}

interface Activity {
  id: number;
  activityType: string;
  entityType: string;
  entityName: string;
  description: string;
  createdAt: string;
}

interface OverdueInvoice {
  id: number;
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
  remainingAmount: number;
  daysOverdue: number;
}

interface MaintenanceItem {
  id: number;
  assetName: string;
  maintenanceType: string;
  nextMaintenanceDate: string;
  estimatedCost: number;
}

interface LowStockItem {
  id: number;
  itemName: string;
  currentQuantity: number;
  minQuantity: number;
  deficit: number;
}

// ============================================
// بيانات تجريبية
// ============================================

const sampleMainStats: MainStats = {
  invoices: { total: 156, totalAmount: 485000, paidAmount: 320000, remainingAmount: 165000, changePercent: "12.5" },
  payments: { total: 89, totalAmount: 320000 },
  customers: { total: 245, active: 198 },
  suppliers: { total: 45, active: 38 },
  inventory: { totalItems: 1250, totalValue: 890000, lowStockItems: 12 },
  meters: { total: 1850, active: 1720, faulty: 45 },
  workOrders: { total: 234, pending: 28, inProgress: 15, completed: 191 },
  assets: { total: 156, totalValue: 2450000 },
};

const sampleQuickSummary: QuickSummary = {
  todayInvoices: { count: 8, total: 24500 },
  todayPayments: { count: 5, total: 18000 },
  todayWorkOrders: 3,
  todayCustomers: 2,
};

const sampleActivities: Activity[] = [
  { id: 1, activityType: "create", entityType: "invoice", entityName: "فاتورة #1056", description: "إنشاء فاتورة جديدة", createdAt: new Date().toISOString() },
  { id: 2, activityType: "update", entityType: "customer", entityName: "شركة الأمل", description: "تحديث بيانات العميل", createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 3, activityType: "create", entityType: "payment", entityName: "دفعة #892", description: "تسجيل دفعة جديدة", createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 4, activityType: "complete", entityType: "work_order", entityName: "أمر عمل #456", description: "إكمال أمر العمل", createdAt: new Date(Date.now() - 10800000).toISOString() },
  { id: 5, activityType: "create", entityType: "meter_reading", entityName: "قراءة عداد #1234", description: "تسجيل قراءة عداد", createdAt: new Date(Date.now() - 14400000).toISOString() },
];

const sampleOverdueInvoices: OverdueInvoice[] = [
  { id: 1, invoiceNumber: "INV-1045", customerName: "شركة النور", totalAmount: 15000, remainingAmount: 15000, daysOverdue: 15 },
  { id: 2, invoiceNumber: "INV-1032", customerName: "مؤسسة الفجر", totalAmount: 8500, remainingAmount: 5000, daysOverdue: 22 },
  { id: 3, invoiceNumber: "INV-1028", customerName: "شركة الأمل", totalAmount: 12000, remainingAmount: 12000, daysOverdue: 30 },
];

const sampleUpcomingMaintenance: MaintenanceItem[] = [
  { id: 1, assetName: "محول كهربائي #12", maintenanceType: "صيانة دورية", nextMaintenanceDate: new Date(Date.now() + 86400000 * 3).toISOString(), estimatedCost: 2500 },
  { id: 2, assetName: "مولد احتياطي #5", maintenanceType: "فحص شامل", nextMaintenanceDate: new Date(Date.now() + 86400000 * 7).toISOString(), estimatedCost: 5000 },
  { id: 3, assetName: "لوحة توزيع #8", maintenanceType: "صيانة وقائية", nextMaintenanceDate: new Date(Date.now() + 86400000 * 14).toISOString(), estimatedCost: 1500 },
];

const sampleLowStockItems: LowStockItem[] = [
  { id: 1, itemName: "كابل نحاسي 16mm", currentQuantity: 25, minQuantity: 100, deficit: 75 },
  { id: 2, itemName: "قاطع تيار 32A", currentQuantity: 8, minQuantity: 50, deficit: 42 },
  { id: 3, itemName: "عداد أحادي الطور", currentQuantity: 15, minQuantity: 40, deficit: 25 },
];

// ============================================
// مكونات مساعدة
// ============================================

function StatCard({ 
  title, 
  value, 
  subValue, 
  icon: Icon, 
  trend, 
  trendValue,
  color = "blue"
}: {
  title: string;
  value: string | number;
  subValue?: string;
  icon: any;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "blue" | "green" | "yellow" | "red" | "purple";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {subValue && (
              <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
            )}
            {trend && trendValue && (
              <div className={`flex items-center gap-1 mt-2 text-xs ${
                trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-600"
              }`}>
                {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : 
                 trend === "down" ? <ArrowDownRight className="h-3 w-3" /> : null}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============================================
// المكون الرئيسي
// ============================================

export default function DashboardNew() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // التحقق من تسجيل الدخول
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("demo-authenticated") === "true";
    if (!isAuthenticated) {
      setLocation("/login");
    }
    // محاكاة تحميل البيانات
    setTimeout(() => setIsLoading(false), 500);
  }, [setLocation]);

  const mainStats = sampleMainStats;
  const quickSummary = sampleQuickSummary;
  const activities = sampleActivities;
  const overdueInvoices = sampleOverdueInvoices;
  const upcomingMaintenance = sampleUpcomingMaintenance;
  const lowStockItems = sampleLowStockItems;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* العنوان */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">لوحة التحكم</h1>
            <p className="text-muted-foreground">نظرة عامة على أداء النظام</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 ml-2" />
              اليوم
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 ml-2" />
              تحديث
            </Button>
          </div>
        </div>

        {/* ملخص اليوم */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">ملخص اليوم</h3>
              <Badge variant="secondary">{new Date().toLocaleDateString("ar-SA")}</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <FileText className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <p className="text-2xl font-bold">{quickSummary.todayInvoices.count}</p>
                <p className="text-xs text-muted-foreground">فواتير اليوم</p>
                <p className="text-sm font-medium text-blue-600">{formatCurrency(quickSummary.todayInvoices.total)}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <DollarSign className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold">{quickSummary.todayPayments.count}</p>
                <p className="text-xs text-muted-foreground">مدفوعات اليوم</p>
                <p className="text-sm font-medium text-green-600">{formatCurrency(quickSummary.todayPayments.total)}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <Wrench className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                <p className="text-2xl font-bold">{quickSummary.todayWorkOrders}</p>
                <p className="text-xs text-muted-foreground">أوامر عمل</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <Users className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <p className="text-2xl font-bold">{quickSummary.todayCustomers}</p>
                <p className="text-xs text-muted-foreground">عملاء جدد</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* التبويبات */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="financial">المالية</TabsTrigger>
            <TabsTrigger value="operations">العمليات</TabsTrigger>
            <TabsTrigger value="alerts">التنبيهات</TabsTrigger>
          </TabsList>

          {/* نظرة عامة */}
          <TabsContent value="overview" className="space-y-6">
            {/* الإحصائيات الرئيسية */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="إجمالي الفواتير"
                value={mainStats.invoices.total}
                subValue={formatCurrency(mainStats.invoices.totalAmount)}
                icon={FileText}
                trend={parseFloat(mainStats.invoices.changePercent) > 0 ? "up" : "down"}
                trendValue={`${mainStats.invoices.changePercent}% من الشهر الماضي`}
                color="blue"
              />
              <StatCard
                title="المدفوعات"
                value={mainStats.payments.total}
                subValue={formatCurrency(mainStats.payments.totalAmount)}
                icon={DollarSign}
                color="green"
              />
              <StatCard
                title="العملاء"
                value={mainStats.customers.total}
                subValue={`${mainStats.customers.active} نشط`}
                icon={Users}
                color="purple"
              />
              <StatCard
                title="المخزون"
                value={mainStats.inventory.totalItems}
                subValue={`${mainStats.inventory.lowStockItems} منخفض`}
                icon={Package}
                trend={mainStats.inventory.lowStockItems > 10 ? "down" : "neutral"}
                trendValue={mainStats.inventory.lowStockItems > 10 ? "يحتاج إعادة تعبئة" : ""}
                color="yellow"
              />
            </div>

            {/* الصف الثاني */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="العدادات"
                value={mainStats.meters.total}
                subValue={`${mainStats.meters.active} نشط | ${mainStats.meters.faulty} معطل`}
                icon={Gauge}
                color="blue"
              />
              <StatCard
                title="أوامر العمل"
                value={mainStats.workOrders.total}
                subValue={`${mainStats.workOrders.pending} قيد الانتظار`}
                icon={Wrench}
                color="yellow"
              />
              <StatCard
                title="الأصول"
                value={mainStats.assets.total}
                subValue={formatCurrency(mainStats.assets.totalValue)}
                icon={Zap}
                color="purple"
              />
              <StatCard
                title="المستحقات"
                value={formatCurrency(mainStats.invoices.remainingAmount)}
                subValue={`من ${mainStats.invoices.total} فاتورة`}
                icon={AlertTriangle}
                trend="down"
                trendValue="يجب المتابعة"
                color="red"
              />
            </div>

            {/* الأنشطة الأخيرة */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  الأنشطة الأخيرة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                      <div className={`p-2 rounded-full ${
                        activity.activityType === "create" ? "bg-green-100 text-green-600" :
                        activity.activityType === "update" ? "bg-blue-100 text-blue-600" :
                        activity.activityType === "complete" ? "bg-purple-100 text-purple-600" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {activity.activityType === "create" ? <CheckCircle2 className="h-4 w-4" /> :
                         activity.activityType === "update" ? <RefreshCw className="h-4 w-4" /> :
                         <Activity className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.entityName}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatTime(activity.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* المالية */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* الفواتير المتأخرة */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    الفواتير المتأخرة
                  </CardTitle>
                  <CardDescription>فواتير تجاوزت تاريخ الاستحقاق</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {overdueInvoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-muted-foreground">{invoice.customerName}</p>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-red-600">{formatCurrency(invoice.remainingAmount)}</p>
                          <Badge variant="destructive" className="text-xs">
                            متأخر {invoice.daysOverdue} يوم
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/invoices">عرض جميع الفواتير</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* ملخص التحصيل */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    ملخص التحصيل
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">نسبة التحصيل</span>
                        <span className="text-sm font-medium">
                          {((mainStats.invoices.paidAmount / mainStats.invoices.totalAmount) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={(mainStats.invoices.paidAmount / mainStats.invoices.totalAmount) * 100} 
                        className="h-3"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600">المحصل</p>
                        <p className="text-xl font-bold text-green-700">{formatCurrency(mainStats.invoices.paidAmount)}</p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-600">المتبقي</p>
                        <p className="text-xl font-bold text-red-700">{formatCurrency(mainStats.invoices.remainingAmount)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* العمليات */}
          <TabsContent value="operations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* أوامر العمل */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    حالة أوامر العمل
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span>قيد الانتظار</span>
                      </div>
                      <span className="font-bold">{mainStats.workOrders.pending}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>قيد التنفيذ</span>
                      </div>
                      <span className="font-bold">{mainStats.workOrders.inProgress}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>مكتمل</span>
                      </div>
                      <span className="font-bold">{mainStats.workOrders.completed}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/work-orders">إدارة أوامر العمل</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* الصيانة القادمة */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    الصيانة القادمة
                  </CardTitle>
                  <CardDescription>خلال الـ 30 يوم القادمة</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingMaintenance.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.assetName}</p>
                          <p className="text-sm text-muted-foreground">{item.maintenanceType}</p>
                        </div>
                        <div className="text-left">
                          <p className="text-sm">{formatDate(item.nextMaintenanceDate)}</p>
                          <p className="text-sm font-medium text-blue-600">{formatCurrency(item.estimatedCost)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/maintenance">جدول الصيانة</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* التنبيهات */}
          <TabsContent value="alerts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* أصناف منخفضة المخزون */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-600">
                    <Package className="h-5 w-5" />
                    أصناف منخفضة المخزون
                  </CardTitle>
                  <CardDescription>أصناف تحتاج إلى إعادة تعبئة</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lowStockItems.map((item) => (
                      <div key={item.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{item.itemName}</p>
                          <Badge variant="destructive">نقص {item.deficit}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(item.currentQuantity / item.minQuantity) * 100} 
                            className="h-2 flex-1"
                          />
                          <span className="text-sm text-muted-foreground">
                            {item.currentQuantity} / {item.minQuantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/inventory">إدارة المخزون</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* العدادات المعطلة */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Gauge className="h-5 w-5" />
                    العدادات المعطلة
                  </CardTitle>
                  <CardDescription>عدادات تحتاج إلى صيانة أو استبدال</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-5xl font-bold text-red-600 mb-2">{mainStats.meters.faulty}</div>
                    <p className="text-muted-foreground">عداد معطل</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      من إجمالي {mainStats.meters.total} عداد
                    </p>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/meters">إدارة العدادات</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
