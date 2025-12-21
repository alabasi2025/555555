// @ts-nocheck
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield,
  Users,
  Key,
  Plus,
  Edit,
  Trash2,
  Search,
  Copy,
  CheckCircle2,
  XCircle,
  Settings,
  Lock,
  Unlock,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

// ============================================
// أنواع البيانات
// ============================================

interface PermissionGroup {
  id: number;
  name: string;
  nameAr: string;
  description: string;
  module: string;
  sortOrder: number;
  isActive: boolean;
  permissionCount: number;
}

interface Permission {
  id: number;
  groupId: number;
  code: string;
  name: string;
  nameAr: string;
  resource: string;
  action: string;
  isActive: boolean;
  groupNameAr: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  permissionCount: number;
  userCount: number;
  permissions: number[];
}

// ============================================
// بيانات تجريبية
// ============================================

const samplePermissionGroups: PermissionGroup[] = [
  { id: 1, name: "accounting", nameAr: "المحاسبة", description: "صلاحيات المحاسبة والقيود", module: "accounting", sortOrder: 1, isActive: true, permissionCount: 10 },
  { id: 2, name: "billing", nameAr: "الفوترة", description: "صلاحيات الفواتير والمدفوعات", module: "billing", sortOrder: 2, isActive: true, permissionCount: 8 },
  { id: 3, name: "customers", nameAr: "العملاء", description: "صلاحيات إدارة العملاء", module: "customers", sortOrder: 3, isActive: true, permissionCount: 6 },
  { id: 4, name: "inventory", nameAr: "المخزون", description: "صلاحيات المخزون والأصناف", module: "inventory", sortOrder: 4, isActive: true, permissionCount: 8 },
  { id: 5, name: "operations", nameAr: "العمليات", description: "صلاحيات العمليات الميدانية", module: "operations", sortOrder: 5, isActive: true, permissionCount: 10 },
  { id: 6, name: "admin", nameAr: "الإدارة", description: "صلاحيات إدارة النظام", module: "admin", sortOrder: 6, isActive: true, permissionCount: 12 },
];

const samplePermissions: Permission[] = [
  { id: 1, groupId: 1, code: "accounting.view", name: "View Accounting", nameAr: "عرض المحاسبة", resource: "accounting", action: "read", isActive: true, groupNameAr: "المحاسبة" },
  { id: 2, groupId: 1, code: "accounting.create", name: "Create Entries", nameAr: "إنشاء قيود", resource: "accounting", action: "create", isActive: true, groupNameAr: "المحاسبة" },
  { id: 3, groupId: 1, code: "accounting.edit", name: "Edit Entries", nameAr: "تعديل قيود", resource: "accounting", action: "update", isActive: true, groupNameAr: "المحاسبة" },
  { id: 4, groupId: 1, code: "accounting.delete", name: "Delete Entries", nameAr: "حذف قيود", resource: "accounting", action: "delete", isActive: true, groupNameAr: "المحاسبة" },
  { id: 5, groupId: 2, code: "invoices.view", name: "View Invoices", nameAr: "عرض الفواتير", resource: "invoices", action: "read", isActive: true, groupNameAr: "الفوترة" },
  { id: 6, groupId: 2, code: "invoices.create", name: "Create Invoices", nameAr: "إنشاء فواتير", resource: "invoices", action: "create", isActive: true, groupNameAr: "الفوترة" },
  { id: 7, groupId: 2, code: "invoices.edit", name: "Edit Invoices", nameAr: "تعديل فواتير", resource: "invoices", action: "update", isActive: true, groupNameAr: "الفوترة" },
  { id: 8, groupId: 2, code: "invoices.delete", name: "Delete Invoices", nameAr: "حذف فواتير", resource: "invoices", action: "delete", isActive: true, groupNameAr: "الفوترة" },
  { id: 9, groupId: 3, code: "customers.view", name: "View Customers", nameAr: "عرض العملاء", resource: "customers", action: "read", isActive: true, groupNameAr: "العملاء" },
  { id: 10, groupId: 3, code: "customers.create", name: "Create Customers", nameAr: "إنشاء عملاء", resource: "customers", action: "create", isActive: true, groupNameAr: "العملاء" },
  { id: 11, groupId: 4, code: "inventory.view", name: "View Inventory", nameAr: "عرض المخزون", resource: "inventory", action: "read", isActive: true, groupNameAr: "المخزون" },
  { id: 12, groupId: 4, code: "inventory.manage", name: "Manage Inventory", nameAr: "إدارة المخزون", resource: "inventory", action: "update", isActive: true, groupNameAr: "المخزون" },
  { id: 13, groupId: 5, code: "workorders.view", name: "View Work Orders", nameAr: "عرض أوامر العمل", resource: "workorders", action: "read", isActive: true, groupNameAr: "العمليات" },
  { id: 14, groupId: 5, code: "workorders.manage", name: "Manage Work Orders", nameAr: "إدارة أوامر العمل", resource: "workorders", action: "update", isActive: true, groupNameAr: "العمليات" },
  { id: 15, groupId: 6, code: "users.view", name: "View Users", nameAr: "عرض المستخدمين", resource: "users", action: "read", isActive: true, groupNameAr: "الإدارة" },
  { id: 16, groupId: 6, code: "users.manage", name: "Manage Users", nameAr: "إدارة المستخدمين", resource: "users", action: "update", isActive: true, groupNameAr: "الإدارة" },
  { id: 17, groupId: 6, code: "roles.view", name: "View Roles", nameAr: "عرض الأدوار", resource: "roles", action: "read", isActive: true, groupNameAr: "الإدارة" },
  { id: 18, groupId: 6, code: "roles.manage", name: "Manage Roles", nameAr: "إدارة الأدوار", resource: "roles", action: "update", isActive: true, groupNameAr: "الإدارة" },
];

const sampleRoles: Role[] = [
  { id: 1, name: "مدير النظام", description: "صلاحيات كاملة على جميع أجزاء النظام", isActive: true, permissionCount: 18, userCount: 1, permissions: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18] },
  { id: 2, name: "محاسب", description: "صلاحيات المحاسبة والفوترة", isActive: true, permissionCount: 8, userCount: 3, permissions: [1,2,3,4,5,6,7,8] },
  { id: 3, name: "موظف مبيعات", description: "صلاحيات العملاء والفواتير", isActive: true, permissionCount: 6, userCount: 5, permissions: [5,6,9,10] },
  { id: 4, name: "فني ميداني", description: "صلاحيات العمليات الميدانية", isActive: true, permissionCount: 4, userCount: 8, permissions: [13,14] },
  { id: 5, name: "مدير المخزون", description: "صلاحيات إدارة المخزون", isActive: true, permissionCount: 4, userCount: 2, permissions: [11,12] },
];

// ============================================
// المكون الرئيسي
// ============================================

export default function PermissionsManagement() {
  const { data: usersListData } = trpc.users.list.useQuery();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("roles");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  // التحقق من تسجيل الدخول
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("demo-authenticated") === "true";
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [setLocation]);

  const [roles, setRoles] = useState(sampleRoles);
  const [permissionGroups] = useState(samplePermissionGroups);
  const [permissions] = useState(samplePermissions);

  // فلترة الأدوار
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // فلترة الصلاحيات
  const filteredPermissions = permissions.filter(permission =>
    permission.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // تحديد/إلغاء تحديد صلاحية
  const togglePermission = (permissionId: number) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  // تحديد جميع صلاحيات مجموعة
  const toggleGroupPermissions = (groupId: number) => {
    const groupPermissionIds = permissions
      .filter(p => p.groupId === groupId)
      .map(p => p.id);
    
    const allSelected = groupPermissionIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(id => !groupPermissionIds.includes(id)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...groupPermissionIds])]);
    }
  };

  // حفظ صلاحيات الدور
  const saveRolePermissions = () => {
    if (selectedRole) {
      setRoles(prev => prev.map(role =>
        role.id === selectedRole.id
          ? { ...role, permissions: selectedPermissions, permissionCount: selectedPermissions.length }
          : role
      ));
      toast.success("تم حفظ الصلاحيات بنجاح");
      setIsPermissionDialogOpen(false);
    }
  };

  // فتح نافذة تعديل صلاحيات الدور
  const openPermissionDialog = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions);
    setIsPermissionDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* العنوان */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8" />
              إدارة الأدوار والصلاحيات
            </h1>
            <p className="text-muted-foreground">تحكم في صلاحيات المستخدمين والأدوار</p>
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
                  <p className="text-sm text-muted-foreground">الأدوار</p>
                  <p className="text-2xl font-bold">{roles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <Key className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الصلاحيات</p>
                  <p className="text-2xl font-bold">{permissions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <Settings className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المجموعات</p>
                  <p className="text-2xl font-bold">{permissionGroups.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المستخدمين</p>
                  <p className="text-2xl font-bold">{roles.reduce((sum, r) => sum + r.userCount, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* التبويبات */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="roles">الأدوار</TabsTrigger>
            <TabsTrigger value="permissions">الصلاحيات</TabsTrigger>
            <TabsTrigger value="groups">المجموعات</TabsTrigger>
          </TabsList>

          {/* الأدوار */}
          <TabsContent value="roles" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative w-64">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث في الأدوار..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Button onClick={() => setIsRoleDialogOpen(true)}>
                <Plus className="h-4 w-4 ml-2" />
                إضافة دور
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الدور</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>الصلاحيات</TableHead>
                    <TableHead>المستخدمين</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell className="text-muted-foreground">{role.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{role.permissionCount} صلاحية</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{role.userCount} مستخدم</Badge>
                      </TableCell>
                      <TableCell>
                        {role.isActive ? (
                          <Badge className="bg-green-100 text-green-700">نشط</Badge>
                        ) : (
                          <Badge variant="destructive">غير نشط</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openPermissionDialog(role)}
                            title="تعديل الصلاحيات"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="تعديل">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="نسخ">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* الصلاحيات */}
          <TabsContent value="permissions" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative w-64">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث في الصلاحيات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الكود</TableHead>
                    <TableHead>الصلاحية</TableHead>
                    <TableHead>المجموعة</TableHead>
                    <TableHead>المورد</TableHead>
                    <TableHead>الإجراء</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPermissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-mono text-sm">{permission.code}</TableCell>
                      <TableCell className="font-medium">{permission.nameAr}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{permission.groupNameAr}</Badge>
                      </TableCell>
                      <TableCell>{permission.resource}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{permission.action}</Badge>
                      </TableCell>
                      <TableCell>
                        {permission.isActive ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* المجموعات */}
          <TabsContent value="groups" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {permissionGroups.map((group) => (
                <Card key={group.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{group.nameAr}</span>
                      {group.isActive ? (
                        <Unlock className="h-5 w-5 text-green-600" />
                      ) : (
                        <Lock className="h-5 w-5 text-red-600" />
                      )}
                    </CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{group.permissionCount} صلاحية</Badge>
                      <Badge variant="outline">{group.module}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* نافذة تعديل صلاحيات الدور */}
        <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تعديل صلاحيات: {selectedRole?.name}</DialogTitle>
              <DialogDescription>
                حدد الصلاحيات المناسبة لهذا الدور
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {permissionGroups.map((group) => {
                const groupPermissions = permissions.filter(p => p.groupId === group.id);
                const selectedCount = groupPermissions.filter(p => selectedPermissions.includes(p.id)).length;
                const allSelected = selectedCount === groupPermissions.length;

                return (
                  <div key={group.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={() => toggleGroupPermissions(group.id)}
                        />
                        <span className="font-medium">{group.nameAr}</span>
                        <Badge variant="secondary">{selectedCount}/{groupPermissions.length}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {groupPermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={() => togglePermission(permission.id)}
                          />
                          <span className="text-sm">{permission.nameAr}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPermissionDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={saveRolePermissions}>
                حفظ الصلاحيات
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* نافذة إضافة دور */}
        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة دور جديد</DialogTitle>
              <DialogDescription>
                أدخل بيانات الدور الجديد
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>اسم الدور</Label>
                <Input placeholder="مثال: مدير المبيعات" />
              </div>
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Textarea placeholder="وصف مختصر للدور وصلاحياته" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={() => {
                toast.success("تم إضافة الدور بنجاح");
                setIsRoleDialogOpen(false);
              }}>
                إضافة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
