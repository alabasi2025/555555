import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
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
  ClipboardList
} from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  
  // التحقق من تسجيل الدخول
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("demo-authenticated") === "true";
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [setLocation]);
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
      title: "التقارير المالية",
      description: "الميزانية والأرباح والخسائر",
      icon: BarChart3,
      href: "/reports",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
    },
    {
      title: "دفتر الأستاذ",
      description: "السجل المحاسبي الشامل",
      icon: ClipboardList,
      href: "/ledger",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
  ];

  const stats = [
    {
      title: "إجمالي الفواتير",
      value: "0",
      description: "هذا الشهر",
      icon: FileText,
      trend: "+0%",
    },
    {
      title: "المدفوعات المستلمة",
      value: "0 ر.س",
      description: "هذا الشهر",
      icon: Wallet,
      trend: "+0%",
    },
    {
      title: "الذمم المدينة",
      value: "0 ر.س",
      description: "المستحقة",
      icon: TrendingUp,
      trend: "0%",
    },
    {
      title: "قيمة المخزون",
      value: "0 ر.س",
      description: "الحالية",
      icon: Package,
      trend: "0%",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-600 mt-2">نظام إدارة محطات الكهرباء المتكامل</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stat.description}
                  <span className="text-green-600 mr-2">{stat.trend}</span>
                </p>
              </CardContent>
            </Card>
          ))}
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
