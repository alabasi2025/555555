import { useAuth } from "@/_core/hooks/useAuth";
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
  Key,
  Calendar,
  Gauge,
  ClipboardList,
  Wrench,
  Activity
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";

// المرحلة 0: الأنظمة الأساسية
const phase0MenuItems = [
  { 
    icon: LayoutDashboard, 
    label: "لوحة التحكم", 
    path: "/dashboard",
    color: "text-blue-500"
  },
  { 
    icon: BookOpen, 
    label: "شجرة الحسابات", 
    path: "/accounts",
    color: "text-green-500"
  },
  { 
    icon: Users, 
    label: "إدارة العملاء", 
    path: "/customers",
    color: "text-purple-500"
  },
  { 
    icon: Building2, 
    label: "إدارة الموردين", 
    path: "/suppliers",
    color: "text-orange-500"
  },
  { 
    icon: FileText, 
    label: "الفواتير", 
    path: "/invoices",
    color: "text-red-500"
  },
  { 
    icon: CreditCard, 
    label: "المدفوعات", 
    path: "/invoices/payments",
    color: "text-teal-500"
  },
  { 
    icon: Package, 
    label: "المخزون", 
    path: "/inventory",
    color: "text-indigo-500"
  },
  { 
    icon: ShoppingCart, 
    label: "المشتريات", 
    path: "/purchases/requests",
    color: "text-pink-500"
  },
  { 
    icon: BarChart3, 
    label: "التقارير المالية", 
    path: "/reports/account-balances",
    color: "text-cyan-500"
  },
  { 
    icon: BookOpen, 
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
];

// المرحلة 1: الأنظمة المتقدمة
const phase1MenuItems = [
  { 
    icon: Shield, 
    label: "الأدوار والصلاحيات", 
    path: "/roles",
    color: "text-violet-500"
  },
  { 
    icon: Users, 
    label: "إدارة المستخدمين", 
    path: "/users",
    color: "text-fuchsia-500"
  },
  { 
    icon: Calendar, 
    label: "الاشتراكات", 
    path: "/subscriptions",
    color: "text-rose-500"
  },
  { 
    icon: Gauge, 
    label: "العدادات", 
    path: "/meters",
    color: "text-sky-500"
  },
  { 
    icon: ClipboardList, 
    label: "أوامر العمل", 
    path: "/work-orders",
    color: "text-emerald-500"
  },
  { 
    icon: Package, 
    label: "الأصول", 
    path: "/assets",
    color: "text-yellow-500"
  },
  { 
    icon: Wrench, 
    label: "الصيانة", 
    path: "/maintenance",
    color: "text-gray-500"
  },
  { 
    icon: Activity, 
    label: "المراقبة", 
    path: "/monitoring",
    color: "text-blue-600"
  },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              تسجيل الدخول للمتابعة
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
            className="w-full shadow-lg hover:shadow-xl transition-all"
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
  const allMenuItems = [...phase0MenuItems, ...phase1MenuItems];
  const activeMenuItem = allMenuItems.find(item => item.path === location);
  const isMobile = useIsMobile();

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

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold tracking-tight truncate">
                    نظام إدارة محطات الكهرباء
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            {/* المرحلة 0: الأنظمة الأساسية */}
            <SidebarGroup>
              <SidebarGroupLabel className="px-2 text-xs font-semibold text-muted-foreground">
                الأنظمة الأساسية
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="px-2 py-1">
                  {phase0MenuItems.map(item => {
                    const isActive = location === item.path;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => setLocation(item.path)}
                          tooltip={item.label}
                          className={`h-10 transition-all font-normal`}
                        >
                          <item.icon
                            className={`h-4 w-4 ${isActive ? item.color : "text-muted-foreground"}`}
                          />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* المرحلة 1: الأنظمة المتقدمة */}
            <SidebarGroup>
              <SidebarGroupLabel className="px-2 text-xs font-semibold text-muted-foreground">
                الأنظمة المتقدمة
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="px-2 py-1">
                  {phase1MenuItems.map(item => {
                    const isActive = location === item.path;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => setLocation(item.path)}
                          tooltip={item.label}
                          className={`h-10 transition-all font-normal`}
                        >
                          <item.icon
                            className={`h-4 w-4 ${isActive ? item.color : "text-muted-foreground"}`}
                          />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      مدير النظام
                    </p>
                  </div>
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
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-foreground">
                    {activeMenuItem?.label ?? "القائمة"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </>
  );
}
