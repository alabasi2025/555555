// @ts-nocheck
// بسبب الحاجة إلى تضمين جميع المكونات والمنطق في ملف واحد لمحاكاة بيئة shadcn/ui و react-table.

import React, { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// =============================================================================
// 1. تعريف الأنواع (Types) والبيانات الوهمية (Mock Data)
// =============================================================================

interface Permission {
  id: string;
  name_ar: string;
  description_ar: string;
}

interface Role {
  id: string;
  name_ar: string;
  permissions: string[]; // قائمة بمعرفات الصلاحيات
}

// قائمة الصلاحيات المتاحة
const MOCK_PERMISSIONS: Permission[] = [
  { id: 'user:read', name_ar: 'عرض المستخدمين', description_ar: 'عرض قائمة المستخدمين وبياناتهم.' },
  { id: 'user:write', name_ar: 'إدارة المستخدمين', description_ar: 'إضافة، تعديل، وحذف المستخدمين.' },
  { id: 'role:read', name_ar: 'عرض الأدوار', description_ar: 'عرض قائمة الأدوار والصلاحيات.' },
  { id: 'role:write', name_ar: 'إدارة الأدوار', description_ar: 'إضافة، تعديل، وحذف الأدوار.' },
  { id: 'product:read', name_ar: 'عرض المنتجات', description_ar: 'عرض قائمة المنتجات.' },
  { id: 'product:write', name_ar: 'إدارة المنتجات', description_ar: 'إضافة، تعديل، وحذف المنتجات.' },
];

// قائمة الأدوار الوهمية
const MOCK_ROLES: Role[] = [
  { id: '1', name_ar: 'المدير العام', permissions: ['user:read', 'user:write', 'role:read', 'role:write', 'product:read', 'product:write'] },
  { id: '2', name_ar: 'مدير المنتجات', permissions: ['product:read', 'product:write'] },
  { id: '3', name_ar: 'المستخدم العادي', permissions: ['product:read'] },
];

// =============================================================================
// 2. مخطط التحقق (Zod Schema)
// =============================================================================

const RoleFormSchema = z.object({
  name_ar: z.string().min(3, { message: 'يجب أن لا يقل اسم الدور عن 3 أحرف.' }).max(50, { message: 'يجب أن لا يزيد اسم الدور عن 50 حرفًا.' }),
  permissions: z.array(z.string()).min(1, { message: 'يجب اختيار صلاحية واحدة على الأقل.' }),
});

type RoleFormValues = z.infer<typeof RoleFormSchema>;

// =============================================================================
// 3. محاكاة مكونات shadcn/ui الأساسية (Mock shadcn/ui Components)
// =============================================================================

// ملاحظة: في مشروع React حقيقي، سيتم استيراد هذه المكونات من @/components/ui/...
// ولكن هنا، يتم تعريفها محليًا لضمان عمل المكون بشكل مستقل.

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'destructive', size?: 'default' | 'sm' | 'lg' }> = ({ children, className = '', variant = 'default', size = 'default', ...props }) => {
  const baseStyle = 'rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantStyles = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  const sizeStyles = {
    default: 'px-4 py-2 text-sm',
    sm: 'px-3 py-1.5 text-xs',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
);

const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ className = '', ...props }) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props} />
);

const Checkbox: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input type="checkbox" className={`peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white ${className}`} {...props} />
);

const Dialog: React.FC<{ open: boolean, onOpenChange: (open: boolean) => void, children: React.ReactNode }> = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => onOpenChange(false)}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

const DialogHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col space-y-1.5 p-6 border-b">
    {children}
  </div>
);

const DialogTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-lg font-semibold leading-none tracking-tight">{children}</h2>
);

const DialogDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-gray-500">{children}</p>
);

const DialogContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-6">
    {children}
  </div>
);

const DialogFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex justify-end p-6 border-t space-x-2">
    {children}
  </div>
);

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`rounded-xl border bg-white text-gray-900 shadow ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col space-y-1.5 p-6">
    {children}
  </div>
);

const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="font-semibold leading-none tracking-tight">{children}</h3>
);

const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-6 pt-0">
    {children}
  </div>
);

const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative w-full overflow-auto">
    <table className="w-full caption-bottom text-sm">
      {children}
    </table>
  </div>
);

const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="[&_tr]:border-b">
    {children}
  </thead>
);

const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody className="[&_tr:last-child]:border-0">
    {children}
  </tbody>
);

const TableRow: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <tr className={`border-b transition-colors hover:bg-gray-100/50 data-[state=selected]:bg-gray-100 ${className}`}>
    {children}
  </tr>
);

const TableHead: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <th className={`h-12 px-4 text-right align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 ${className}`}>
    {children}
  </th>
);

const TableCell: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}>
    {children}
  </td>
);

const Alert: React.FC<{ variant?: 'destructive', children: React.ReactNode }> = ({ variant, children }) => (
  <div className={`p-4 rounded-md text-sm ${variant === 'destructive' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>
    {children}
  </div>
);

// =============================================================================
// 4. مكون إدارة الصلاحيات (Permissions Management Component)
// =============================================================================

interface PermissionsFormProps {
  control: any; // من react-hook-form
  errors: any; // من react-hook-form
  permissions: Permission[];
}

const PermissionsForm: React.FC<PermissionsFormProps> = ({ control, errors, permissions }) => {
  const groupedPermissions = useMemo(() => {
    // تجميع الصلاحيات حسب الجزء الأول من الـ ID (مثال: user, role, product)
    return permissions.reduce((acc, perm) => {
      const groupKey = perm.id.split(':')[0];
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(perm);
      return acc;
    }, {} as Record<string, Permission[]>);
  }, [permissions]);

  const getGroupName = (key: string) => {
    switch (key) {
      case 'user': return 'إدارة المستخدمين';
      case 'role': return 'إدارة الأدوار والصلاحيات';
      case 'product': return 'إدارة المنتجات';
      default: return key;
    }
  };

  return (
    <div className="space-y-6">
      <h4 className="text-base font-semibold text-gray-700">تحديد الصلاحيات</h4>
      <Controller
        name="permissions"
        control={control}
        render={({ field }) => (
          <div className="space-y-4">
            {Object.entries(groupedPermissions).map(([groupKey, perms]) => (
              <Card key={groupKey}>
                <CardHeader>
                  <CardTitle>{getGroupName(groupKey)}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {perms.map((perm) => (
                    <div key={perm.id} className="flex items-start space-x-3 rtl:space-x-reverse">
                      <Checkbox
                        id={perm.id}
                        checked={field.value.includes(perm.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...field.value, perm.id]);
                          } else {
                            field.onChange(field.value.filter((id: string) => id !== perm.id));
                          }
                        }}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor={perm.id} className="font-medium cursor-pointer">
                          {perm.name_ar}
                        </Label>
                        <p className="text-sm text-gray-500">{perm.description_ar}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
            {errors.permissions && (
              <p className="text-sm font-medium text-red-600 mt-2">{errors.permissions.message}</p>
            )}
          </div>
        )}
      />
    </div>
  );
};

// =============================================================================
// 5. نموذج إضافة/تعديل الدور (Role Form Dialog)
// =============================================================================

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleToEdit: Role | null;
  onSave: (role: Role) => void;
}

const RoleFormDialog: React.FC<RoleFormDialogProps> = ({ open, onOpenChange, roleToEdit, onSave }) => {
  const isEdit = !!roleToEdit;

  const defaultValues: RoleFormValues = useMemo(() => ({
    name_ar: roleToEdit?.name_ar || '',
    permissions: roleToEdit?.permissions || [],
  }), [roleToEdit]);

  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(RoleFormSchema),
    defaultValues,
  });

  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = (data: RoleFormValues) => {
    const newRole: Role = {
      ...data,
      id: roleToEdit?.id || String(Date.now()), // توليد ID وهمي
    };
    onSave(newRole);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'تعديل الدور' : 'إضافة دور جديد'}</DialogTitle>
          <DialogDescription>
            {isEdit ? `تعديل صلاحيات الدور: ${roleToEdit?.name_ar}` : 'أدخل اسم الدور وحدد الصلاحيات الخاصة به.'}
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="name_ar">اسم الدور (بالعربية)</Label>
              <Input
                id="name_ar"
                placeholder="مثال: مدير النظام"
                {...register('name_ar')}
                disabled={isSubmitting}
              />
              {errors.name_ar && (
                <p className="text-sm font-medium text-red-600">{errors.name_ar.message}</p>
              )}
            </div>

            <PermissionsForm
              control={control}
              errors={errors}
              permissions={MOCK_PERMISSIONS}
            />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ الدور'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};

// =============================================================================
// 6. المكون الرئيسي (Roles And Permissions Management)
// =============================================================================

export const RolesAndPermissionsManagement: React.FC = () => {
  const { data: usersListData } = trpc.users.list.useQuery();
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);

  const handleAddRole = () => {
    setRoleToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setRoleToEdit(role);
    setIsDialogOpen(true);
  };

  const handleDeleteRole = (roleId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الدور؟')) {
      setRoles(roles.filter(r => r.id !== roleId));
    }
  };

  const handleSaveRole = (newRole: Role) => {
    if (roleToEdit) {
      // تعديل
      setRoles(roles.map(r => (r.id === newRole.id ? newRole : r)));
    } else {
      // إضافة
      setRoles([...roles, newRole]);
    }
  };

  const getPermissionCount = (role: Role) => {
    return role.permissions.length;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6" dir="rtl">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">إدارة الأدوار والصلاحيات</h1>
        <Button onClick={handleAddRole}>
          + إضافة دور جديد
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الأدوار</CardTitle>
          <DialogDescription>
            يمكنك عرض، تعديل، أو حذف الأدوار الموجودة في النظام.
          </DialogDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">المعرف</TableHead>
                <TableHead>اسم الدور</TableHead>
                <TableHead>عدد الصلاحيات</TableHead>
                <TableHead className="text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                    لا توجد أدوار متاحة حاليًا.
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.id}</TableCell>
                    <TableCell>{role.name_ar}</TableCell>
                    <TableCell>{getPermissionCount(role)}</TableCell>
                    <TableCell className="text-center space-x-2 rtl:space-x-reverse">
                      <Button variant="outline" size="sm" onClick={() => handleEditRole(role)}>
                        تعديل
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteRole(role.id)}>
                        حذف
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RoleFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        roleToEdit={roleToEdit}
        onSave={handleSaveRole}
      />
    </div>
  );
};

// تصدير المكون الرئيسي ليتوافق مع متطلبات الملف الكامل
export default RolesAndPermissionsManagement;
