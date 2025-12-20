import { useAuth } from "@/_core/hooks/useAuth";
import { TopHeader } from "./TopHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

import { useIsMobile } from "@/hooks/useMobile";
import { 
  LayoutDashboard, 
  LogOut, 
  PanelLeft, 
  Users, 
  Building2,
  FileText,
  CreditCard,
  Package,
  ShoppingCart,
  BarChart3,
  BookOpen,
  GitCompare,
  Shield,
  Calendar,
  Gauge,
  ClipboardList,
  Wrench,
  Activity,
  UserCircle,
  Clock,
  Wallet,
  Database,
  RefreshCw,
  HeartPulse,
  FileQuestion,
  Rocket,
  MessageSquare,
  Zap,
  Home,
  UserCog,
  Receipt,
  Banknote,
  Calculator,
  Boxes,
  Truck,
  HardDrive,
  Settings2,
  CalendarClock,
  Headphones,
  BookMarked,
  MonitorCheck,
  ChevronDown,
  ChevronLeft
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// ==========================================
// تعريف مجموعات القائمة الجانبية المحسنة
// ==========================================

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  color: string;
  badge?: string;
}

interface MenuGroup {
  title: string;
  icon: any;
  color: string;
  items: MenuItem[];
  defaultOpen?: boolean;
}

// تعريف المجموعات المحسنة
const menuGroups: MenuGroup[] = [
  {
    title: "الرئيسية",
    icon: Home,
    color: "text-blue-500",
    defaultOpen: true,
    items: [
      { 
        icon: LayoutDashboard, 
        label: "لوحة التحكم", 
        path: "/dashboard",
        color: "text-blue-500"
      },
    ],
  },
  {
    title: "إدارة العملاء",
    icon: Users,
    color: "text-purple-500",
    defaultOpen: true,
    items: [
      { 
        icon: Users, 
        label: "العملاء", 
        path: "/customers",
        color: "text-purple-500"
      },
      { 
        icon: Building2, 
        label: "الموردين", 
        path: "/suppliers",
        color: "text-orange-500"
      },
      { 
        icon: Calendar, 
        label: "الاشتراكات", 
        path: "/subscriptions",
        color: "text-rose-500"
      },
    ],
  },
  {
    title: "العدادات",
    icon: Gauge,
    color: "text-cyan-500",
    defaultOpen: true,
    items: [
      { 
        icon: Gauge, 
        label: "إدارة العدادات", 
        path: "/meters",
        color: "text-cyan-500"
      },
      { 
        icon: Activity, 
        label: "القراءات", 
        path: "/readings",
        color: "text-teal-500"
      },
    ],
  },
  {
    title: "الفوترة",
    icon: Receipt,
    color: "text-red-500",
    defaultOpen: true,
    items: [
      { 
        icon: FileText, 
        label: "الفواتير", 
        path: "/invoices",
        color: "text-red-500"
      },
      { 
        icon: Banknote, 
        label: "المدفوعات", 
        path: "/invoices/payments",
        color: "text-green-500"
      },
    ],
  },
  {
    title: "المحاسبة",
    icon: Calculator,
    color: "text-emerald-500",
    defaultOpen: false,
    items: [
      { 
        icon: BookOpen, 
        label: "شجرة الحسابات", 
        path: "/accounts",
        color: "text-emerald-500"
      },
      { 
        icon: BookMarked, 
        label: "القيود المحاسبية", 
        path: "/journal-entries",
        color: "text-amber-500"
      },
      { 
        icon: GitCompare, 
        label: "التسوية البنكية", 
        path: "/journal-entries/reconciliation",
        color: "text-lime-500"
      },
      { 
        icon: BarChart3, 
        label: "التقارير المالية", 
        path: "/reports/account-balances",
        color: "text-indigo-500"
      },
    ],
  },
  {
    title: "المخزون",
    icon: Boxes,
    color: "text-indigo-500",
    defaultOpen: false,
    items: [
      { 
        icon: Package, 
        label: "إدارة المخزون", 
        path: "/inventory",
        color: "text-indigo-500"
      },
      { 
        icon: Truck, 
        label: "المشتريات", 
        path: "/purchases/requests",
        color: "text-pink-500"
      },
    ],
  },
  {
    title: "الأصول والصيانة",
    icon: HardDrive,
    color: "text-yellow-500",
    defaultOpen: false,
    items: [
      { 
        icon: HardDrive, 
        label: "الأصول", 
        path: "/assets",
        color: "text-yellow-500"
      },
      { 
        icon: ClipboardList, 
        label: "أوامر العمل", 
        path: "/work-orders",
        color: "text-emerald-500"
      },
      { 
        icon: Wrench, 
        label: "الصيانة", 
        path: "/maintenance",
        color: "text-gray-500"
      },
      { 
        icon: CalendarClock, 
        label: "نوافذ الصيانة", 
        path: "/maintenance-windows",
        color: "text-orange-500"
      },
    ],
  },
  {
    title: "الموارد البشرية",
    icon: UserCog,
    color: "text-violet-500",
    defaultOpen: false,
    items: [
      { 
        icon: UserCircle, 
        label: "الموظفين", 
        path: "/hr/employees",
        color: "text-violet-500"
      },
      { 
        icon: Clock, 
        label: "الحضور والانصراف", 
        path: "/hr/attendance",
        color: "text-teal-500"
      },
      { 
        icon: Wallet, 
        label: "الرواتب", 
        path: "/hr/payroll",
        color: "text-green-600"
      },
    ],
  },
  {
    title: "النشر والتحديثات",
    icon: Rocket,
    color: "text-purple-500",
    defaultOpen: false,
    items: [
      { 
        icon: Rocket, 
        label: "إدارة النشر", 
        path: "/deployment",
        color: "text-purple-500"
      },
      { 
        icon: Database, 
        label: "هجرة البيانات", 
        path: "/data-migration",
        color: "text-blue-500"
      },
      { 
        icon: RefreshCw, 
        label: "التحديثات", 
        path: "/system-updates",
        color: "text-green-500"
      },
    ],
  },
  {
    title: "الدعم الفني",
    icon: Headphones,
    color: "text-blue-500",
    defaultOpen: false,
    items: [
      { 
        icon: MessageSquare, 
        label: "تذاكر الدعم", 
        path: "/support-tickets",
        color: "text-blue-500"
      },
      { 
        icon: FileQuestion, 
        label: "قاعدة المعرفة", 
        path: "/knowledge-base",
        color: "text-amber-500"
      },
    ],
  },
  {
    title: "المراقبة",
    icon: MonitorCheck,
    color: "text-red-500",
    defaultOpen: false,
    items: [
      { 
        icon: HeartPulse, 
        label: "صحة النظام", 
        path: "/system-health",
        color: "text-red-500"
      },
      { 
        icon: Activity, 
        label: "مراقبة الأداء", 
        path: "/monitoring",
        color: "text-blue-600"
      },
    ],
  },
  {
    title: "الإعدادات",
    icon: Settings2,
    color: "text-gray-500",
    defaultOpen: false,
    items: [
      { 
        icon: Shield, 
        label: "الأدوار والصلاحيات", 
        path: "/roles",
        color: "text-violet-500"
      },
      { 
        icon: Users, 
        label: "المستخدمين", 
        path: "/users",
        color: "text-fuchsia-500"
      },
    ],
  },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 220;
const MAX_WIDTH = 400;

export default function DashboardLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("demo-authenticated") === "true";
    const storedUser = localStorage.getItem("demo-user");
    if (isAuthenticated && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          <div className="flex flex-col items-center gap-6">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-center text-gray-900 dark:text-white">
              نظام إدارة محطات الكهرباء
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              الوصول إلى لوحة التحكم يتطلب المصادقة. انقر للمتابعة.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = "/login";
            }}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    menuGroups.forEach((group, index) => {
      initial[index.toString()] = group.defaultOpen ?? false;
    });
    return initial;
  });
  
  // جمع كل العناصر للبحث عن العنصر النشط
  const allMenuItems = menuGroups.flatMap(group => group.items);
  const activeMenuItem = allMenuItems.find(item => item.path === location);
  const isMobile = useIsMobile();

  // فتح المجموعة التي تحتوي على الصفحة النشطة
  useEffect(() => {
    menuGroups.forEach((group, index) => {
      if (group.items.some(item => item.path === location)) {
        setOpenGroups(prev => ({ ...prev, [index.toString()]: true }));
      }
    });
  }, [location]);

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  const toggleGroup = (index: string) => {
    setOpenGroups(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r border-border/50"
          disableTransition={isResizing}
        >
          {/* Header */}
          <SidebarHeader className="h-16 border-b border-border/50">
            <div className="flex items-center gap-3 px-3 transition-all w-full h-full">
              <button
                onClick={toggleSidebar}
                className="h-9 w-9 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              {!isCollapsed && (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-sm tracking-tight truncate">
                    محطات الكهرباء
                  </span>
                </div>
              )}
            </div>
          </SidebarHeader>

          {/* Content */}
          <SidebarContent className="gap-1 p-2">
            {menuGroups.map((group, groupIndex) => {
              const isOpen = openGroups[groupIndex.toString()];
              const hasActiveItem = group.items.some(item => item.path === location);
              
              return (
                <Collapsible
                  key={groupIndex}
                  open={isOpen}
                  onOpenChange={() => toggleGroup(groupIndex.toString())}
                >
                  <SidebarGroup className="p-0">
                    <CollapsibleTrigger asChild>
                      <button
                        className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-accent/50 ${
                          hasActiveItem ? 'bg-accent/30 text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        <group.icon className={`h-4 w-4 ${hasActiveItem ? group.color : ''}`} />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-right">{group.title}</span>
                            <ChevronDown 
                              className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                            />
                          </>
                        )}
                      </button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="mt-1">
                      <SidebarGroupContent>
                        <SidebarMenu className="gap-0.5">
                          {group.items.map((item, itemIndex) => {
                            const isActive = location === item.path;
                            return (
                              <SidebarMenuItem key={`${groupIndex}-${itemIndex}`}>
                                <SidebarMenuButton
                                  isActive={isActive}
                                  onClick={() => setLocation(item.path)}
                                  tooltip={item.label}
                                  className={`h-9 transition-all font-normal rounded-lg mx-1 ${
                                    isActive 
                                      ? 'bg-primary/10 text-primary font-medium' 
                                      : 'hover:bg-accent/50'
                                  }`}
                                >
                                  <item.icon
                                    className={`h-4 w-4 ${isActive ? item.color : "text-muted-foreground"}`}
                                  />
                                  <span className={isActive ? 'text-foreground' : ''}>{item.label}</span>
                                  {isActive && (
                                    <div className="mr-auto h-1.5 w-1.5 rounded-full bg-primary" />
                                  )}
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            );
                          })}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </CollapsibleContent>
                  </SidebarGroup>
                </Collapsible>
              );
            })}
          </SidebarContent>

          {/* Footer */}
          <SidebarFooter className="p-3 border-t border-border/50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border-2 border-primary/20 shrink-0">
                    <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate leading-none">
                        {user?.name || "-"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        مدير النظام
                      </p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        
        {/* Resize Handle */}
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/30 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {/* Top Header */}
        <TopHeader 
          title={activeMenuItem?.label}
          showMenuButton={isMobile}
          onMenuClick={toggleSidebar}
        />
        
        {/* Main Content */}
        <main className="flex-1 p-4 bg-muted/30 dark:bg-background">{children}</main>
      </SidebarInset>
    </>
  );
}
