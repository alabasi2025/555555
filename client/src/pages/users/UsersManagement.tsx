// @ts-nocheck
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Users,
  Search,
  MoreVertical,
  Shield,
  Clock,
  Activity,
  LogOut,
  Eye,
  Edit,
  Ban,
  CheckCircle2,
  XCircle,
  Monitor,
  Smartphone,
  Globe,
  RefreshCw,
  UserPlus,
  History,
  Settings,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

// ============================================
// أنواع البيانات
// ============================================

interface User {
  id: number;
  openId: string;
  name: string;
  email: string;
  loginMethod: string;
  role: string;
  createdAt: string;
  lastSignedIn: string;
  activeSessions: number;
  lastActivity: string | null;
  lastActivityDescription: string | null;
  isActive: boolean;
}

interface Session {
  id: number;
  userId: number;
  userName: string;
  ipAddress: string;
  userAgent: string;
  deviceInfo: string;
  isActive: boolean;
  lastActivity: string;
  createdAt: string;
}

interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  action: string;
  entityType: string;
  entityName: string | null;
  description: string;
  status: string;
  createdAt: string;
  ipAddress: string;
}

// ============================================
// بيانات تجريبية
// ============================================

const sampleUsers: User[] = [
  { id: 1, openId: "user1", name: "أحمد محمد", email: "ahmed@example.com", loginMethod: "email", role: "admin", createdAt: "2024-01-15T10:00:00Z", lastSignedIn: new Date().toISOString(), activeSessions: 1, lastActivity: new Date().toISOString(), lastActivityDescription: "تسجيل دخول", isActive: true },
  { id: 2, openId: "user2", name: "سارة علي", email: "sara@example.com", loginMethod: "email", role: "user", createdAt: "2024-02-20T14:30:00Z", lastSignedIn: new Date(Date.now() - 3600000).toISOString(), activeSessions: 1, lastActivity: new Date(Date.now() - 1800000).toISOString(), lastActivityDescription: "تعديل فاتورة", isActive: true },
  { id: 3, openId: "user3", name: "محمد خالد", email: "mohammed@example.com", loginMethod: "google", role: "user", createdAt: "2024-03-10T09:15:00Z", lastSignedIn: new Date(Date.now() - 7200000).toISOString(), activeSessions: 0, lastActivity: null, lastActivityDescription: null, isActive: true },
  { id: 4, openId: "user4", name: "فاطمة أحمد", email: "fatima@example.com", loginMethod: "email", role: "user", createdAt: "2024-04-05T11:45:00Z", lastSignedIn: new Date(Date.now() - 86400000).toISOString(), activeSessions: 0, lastActivity: new Date(Date.now() - 86400000).toISOString(), lastActivityDescription: "عرض تقرير", isActive: true },
  { id: 5, openId: "user5", name: "عمر حسن", email: "omar@example.com", loginMethod: "google", role: "user", createdAt: "2024-05-12T16:20:00Z", lastSignedIn: new Date(Date.now() - 172800000).toISOString(), activeSessions: 0, lastActivity: null, lastActivityDescription: null, isActive: false },
];

const sampleSessions: Session[] = [
  { id: 1, userId: 1, userName: "أحمد محمد", ipAddress: "192.168.1.1", userAgent: "Chrome/120.0", deviceInfo: "Windows 10", isActive: true, lastActivity: new Date().toISOString(), createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, userId: 2, userName: "سارة علي", ipAddress: "192.168.1.2", userAgent: "Firefox/121.0", deviceInfo: "macOS", isActive: true, lastActivity: new Date(Date.now() - 1800000).toISOString(), createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 3, userId: 1, userName: "أحمد محمد", ipAddress: "10.0.0.5", userAgent: "Safari/17.0", deviceInfo: "iPhone", isActive: true, lastActivity: new Date(Date.now() - 600000).toISOString(), createdAt: new Date(Date.now() - 1800000).toISOString() },
];

const sampleAuditLogs: AuditLog[] = [
  { id: 1, userId: 1, userName: "أحمد محمد", action: "login", entityType: "auth", entityName: null, description: "تسجيل دخول ناجح", status: "success", createdAt: new Date().toISOString(), ipAddress: "192.168.1.1" },
  { id: 2, userId: 1, userName: "أحمد محمد", action: "create", entityType: "invoice", entityName: "فاتورة #100", description: "إنشاء فاتورة جديدة", status: "success", createdAt: new Date(Date.now() - 3600000).toISOString(), ipAddress: "192.168.1.1" },
  { id: 3, userId: 2, userName: "سارة علي", action: "update", entityType: "customer", entityName: "شركة الأمل", description: "تحديث بيانات العميل", status: "success", createdAt: new Date(Date.now() - 7200000).toISOString(), ipAddress: "192.168.1.2" },
  { id: 4, userId: 1, userName: "أحمد محمد", action: "export", entityType: "report", entityName: "تقرير المبيعات", description: "تصدير تقرير المبيعات", status: "success", createdAt: new Date(Date.now() - 10800000).toISOString(), ipAddress: "192.168.1.1" },
  { id: 5, userId: 3, userName: "محمد خالد", action: "delete", entityType: "item", entityName: "صنف #25", description: "محاولة حذف صنف من المخزون", status: "failed", createdAt: new Date(Date.now() - 14400000).toISOString(), ipAddress: "192.168.1.3" },
  { id: 6, userId: 2, userName: "سارة علي", action: "login", entityType: "auth", entityName: null, description: "تسجيل دخول ناجح", status: "success", createdAt: new Date(Date.now() - 18000000).toISOString(), ipAddress: "192.168.1.2" },
];

// ============================================
// مكونات مساعدة
// ============================================

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "الآن";
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  return formatDate(dateString);
}

function getDeviceIcon(deviceInfo: string) {
  if (deviceInfo.toLowerCase().includes("iphone") || deviceInfo.toLowerCase().includes("android") || deviceInfo.toLowerCase().includes("ios")) {
    return <Smartphone className="h-4 w-4" />;
  }
  return <Monitor className="h-4 w-4" />;
}

function getActionBadge(action: string) {
  const actionColors: Record<string, string> = {
    login: "bg-blue-100 text-blue-700",
    logout: "bg-gray-100 text-gray-700",
    create: "bg-green-100 text-green-700",
    update: "bg-yellow-100 text-yellow-700",
    delete: "bg-red-100 text-red-700",
    export: "bg-purple-100 text-purple-700",
  };
  const actionLabels: Record<string, string> = {
    login: "تسجيل دخول",
    logout: "تسجيل خروج",
    create: "إنشاء",
    update: "تعديل",
    delete: "حذف",
    export: "تصدير",
  };
  return (
    <Badge className={actionColors[action] || "bg-gray-100 text-gray-700"}>
      {actionLabels[action] || action}
    </Badge>
  );
}

// ============================================
// المكون الرئيسي
// ============================================

export default function UsersManagement() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

  // التحقق من تسجيل الدخول
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("demo-authenticated") === "true";
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [setLocation]);

  const [users, setUsers] = useState(sampleUsers);
  const [sessions, setSessions] = useState(sampleSessions);
  const [auditLogs] = useState(sampleAuditLogs);

  // فلترة المستخدمين
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // تغيير دور المستخدم
  const changeUserRole = (userId: number, newRole: string) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, role: newRole } : user
    ));
    toast.success("تم تغيير دور المستخدم بنجاح");
    setIsRoleDialogOpen(false);
  };

  // إنهاء جلسة
  const terminateSession = (sessionId: number) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    toast.success("تم إنهاء الجلسة بنجاح");
  };

  // إنهاء جميع جلسات المستخدم
  const terminateAllUserSessions = (userId: number) => {
    setSessions(prev => prev.filter(s => s.userId !== userId));
    toast.success("تم إنهاء جميع جلسات المستخدم");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* العنوان */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8" />
              إدارة المستخدمين
            </h1>
            <p className="text-muted-foreground">إدارة المستخدمين والجلسات وسجل التدقيق</p>
          </div>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">نشط الآن</p>
                  <p className="text-2xl font-bold">{sessions.filter(s => s.isActive).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المدراء</p>
                  <p className="text-2xl font-bold">{users.filter(u => u.role === "admin").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <History className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">سجلات اليوم</p>
                  <p className="text-2xl font-bold">{auditLogs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* التبويبات */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="users">المستخدمين</TabsTrigger>
            <TabsTrigger value="sessions">الجلسات النشطة</TabsTrigger>
            <TabsTrigger value="audit">سجل التدقيق</TabsTrigger>
          </TabsList>

          {/* المستخدمين */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative w-64">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث بالاسم أو البريد..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأدوار</SelectItem>
                    <SelectItem value="admin">مدير</SelectItem>
                    <SelectItem value="user">مستخدم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>
                <UserPlus className="h-4 w-4 ml-2" />
                دعوة مستخدم
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>الدور</TableHead>
                    <TableHead>طريقة الدخول</TableHead>
                    <TableHead>آخر نشاط</TableHead>
                    <TableHead>الجلسات</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role === "admin" ? "مدير" : "مستخدم"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          {user.loginMethod}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.lastActivity ? (
                          <div>
                            <p className="text-sm">{getRelativeTime(user.lastActivity)}</p>
                            {user.lastActivityDescription && (
                              <p className="text-xs text-muted-foreground">{user.lastActivityDescription}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.activeSessions > 0 ? "default" : "outline"}>
                          {user.activeSessions} جلسة
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <Badge className="bg-green-100 text-green-700">نشط</Badge>
                        ) : (
                          <Badge variant="destructive">معطل</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user);
                              setIsUserDialogOpen(true);
                            }}>
                              <Eye className="h-4 w-4 ml-2" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user);
                              setIsRoleDialogOpen(true);
                            }}>
                              <Shield className="h-4 w-4 ml-2" />
                              تغيير الدور
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => terminateAllUserSessions(user.id)}>
                              <LogOut className="h-4 w-4 ml-2" />
                              إنهاء الجلسات
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Ban className="h-4 w-4 ml-2" />
                              تعطيل الحساب
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* الجلسات النشطة */}
          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>الجلسات النشطة</CardTitle>
                <CardDescription>جميع الجلسات المتصلة حالياً</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المستخدم</TableHead>
                      <TableHead>الجهاز</TableHead>
                      <TableHead>عنوان IP</TableHead>
                      <TableHead>آخر نشاط</TableHead>
                      <TableHead>بدء الجلسة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">{session.userName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(session.deviceInfo)}
                            <div>
                              <p className="text-sm">{session.deviceInfo}</p>
                              <p className="text-xs text-muted-foreground">{session.userAgent}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{session.ipAddress}</TableCell>
                        <TableCell>{getRelativeTime(session.lastActivity)}</TableCell>
                        <TableCell>{formatDateTime(session.createdAt)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => terminateSession(session.id)}
                          >
                            <LogOut className="h-4 w-4 ml-2" />
                            إنهاء
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* سجل التدقيق */}
          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>سجل التدقيق</CardTitle>
                <CardDescription>جميع الأنشطة والعمليات في النظام</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المستخدم</TableHead>
                      <TableHead>الإجراء</TableHead>
                      <TableHead>الكيان</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.userName}</TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{log.entityType}</p>
                            {log.entityName && (
                              <p className="text-xs text-muted-foreground">{log.entityName}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{log.description}</TableCell>
                        <TableCell>
                          {log.status === "success" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                        <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* نافذة تفاصيل المستخدم */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>تفاصيل المستخدم</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-2xl">{selectedUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">الدور</p>
                    <p className="font-medium">{selectedUser.role === "admin" ? "مدير" : "مستخدم"}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">طريقة الدخول</p>
                    <p className="font-medium">{selectedUser.loginMethod}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">تاريخ الإنشاء</p>
                    <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">آخر تسجيل دخول</p>
                    <p className="font-medium">{formatDateTime(selectedUser.lastSignedIn)}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* نافذة تغيير الدور */}
        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تغيير دور المستخدم</DialogTitle>
              <DialogDescription>
                تغيير دور {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>الدور الجديد</Label>
                <Select defaultValue={selectedUser?.role}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">مدير</SelectItem>
                    <SelectItem value="user">مستخدم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={() => selectedUser && changeUserRole(selectedUser.id, "user")}>
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
