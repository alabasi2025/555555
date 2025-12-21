/**
 * صفحة إدارة الموظفين
 * Employee Management Page
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  UserPlus,
  Building2,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  Edit,
  Eye,
  Trash2,
  Download,
  Upload,
  MoreVertical,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';

// بيانات تجريبية للموظفين
const mockEmployees = [
  {
    id: 1,
    employeeNumber: 'EMP001',
    firstName: 'أحمد',
    lastName: 'محمد',
    fullNameAr: 'أحمد محمد العلي',
    email: 'ahmed@company.com',
    phone: '0501234567',
    department: 'تقنية المعلومات',
    position: 'مطور برمجيات',
    status: 'active',
    employmentType: 'full_time',
    hireDate: '2022-01-15',
    baseSalary: 15000,
  },
  {
    id: 2,
    employeeNumber: 'EMP002',
    firstName: 'فاطمة',
    lastName: 'علي',
    fullNameAr: 'فاطمة علي الأحمد',
    email: 'fatima@company.com',
    phone: '0509876543',
    department: 'الموارد البشرية',
    position: 'مدير الموارد البشرية',
    status: 'active',
    employmentType: 'full_time',
    hireDate: '2021-06-01',
    baseSalary: 20000,
  },
  {
    id: 3,
    employeeNumber: 'EMP003',
    firstName: 'خالد',
    lastName: 'سعود',
    fullNameAr: 'خالد سعود القحطاني',
    email: 'khalid@company.com',
    phone: '0551112233',
    department: 'المالية',
    position: 'محاسب',
    status: 'on_leave',
    employmentType: 'full_time',
    hireDate: '2023-03-10',
    baseSalary: 12000,
  },
  {
    id: 4,
    employeeNumber: 'EMP004',
    firstName: 'نورة',
    lastName: 'عبدالله',
    fullNameAr: 'نورة عبدالله السالم',
    email: 'noura@company.com',
    phone: '0544455566',
    department: 'العمليات',
    position: 'مهندس عمليات',
    status: 'active',
    employmentType: 'contract',
    hireDate: '2024-01-01',
    baseSalary: 18000,
  },
  {
    id: 5,
    employeeNumber: 'EMP005',
    firstName: 'محمد',
    lastName: 'إبراهيم',
    fullNameAr: 'محمد إبراهيم الدوسري',
    email: 'mohammed@company.com',
    phone: '0533334444',
    department: 'الصيانة',
    position: 'فني صيانة',
    status: 'active',
    employmentType: 'full_time',
    hireDate: '2022-08-20',
    baseSalary: 8000,
  },
];

// بيانات تجريبية للأقسام
const mockDepartments = [
  { id: 1, name: 'تقنية المعلومات', employeeCount: 15 },
  { id: 2, name: 'الموارد البشرية', employeeCount: 8 },
  { id: 3, name: 'المالية', employeeCount: 12 },
  { id: 4, name: 'العمليات', employeeCount: 25 },
  { id: 5, name: 'الصيانة', employeeCount: 20 },
];

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  on_leave: 'bg-yellow-100 text-yellow-800',
  suspended: 'bg-red-100 text-red-800',
  terminated: 'bg-gray-100 text-gray-800',
  resigned: 'bg-orange-100 text-orange-800',
};

const statusLabels: Record<string, string> = {
  active: 'نشط',
  on_leave: 'في إجازة',
  suspended: 'موقوف',
  terminated: 'منتهي',
  resigned: 'مستقيل',
};

const employmentTypeLabels: Record<string, string> = {
  full_time: 'دوام كامل',
  part_time: 'دوام جزئي',
  contract: 'عقد',
  temporary: 'مؤقت',
  intern: 'متدرب',
};

export default function EmployeesList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'departments' | 'positions'>('list');

  // جلب البيانات من الـ Backend
  const { data: employeesData, isLoading, error, refetch } = trpc.employees.list.useQuery();
  
  // استخدام البيانات من الـ Backend أو البيانات الوهمية كاحتياطي
  const employees = (employeesData as any)?.data || employeesData || mockEmployees;

  // إحصائيات
  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter((e: any) => e.status === 'active').length,
    onLeave: employees.filter((e: any) => e.status === 'on_leave').length,
    newThisMonth: 2,
  };

  // تصفية الموظفين
  const filteredEmployees = employees.filter((emp: any) => {
    const matchesSearch = emp.fullNameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || emp.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || emp.status === selectedStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* العنوان والإجراءات */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الموظفين</h1>
            <p className="text-gray-600 mt-1">إدارة بيانات الموظفين والأقسام والمناصب</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              تصدير
            </Button>
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              استيراد
            </Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddModal(true)}>
              <UserPlus className="h-4 w-4" />
              إضافة موظف
            </Button>
          </div>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">إجمالي الموظفين</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalEmployees}</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">الموظفين النشطين</p>
                  <p className="text-2xl font-bold text-green-900">{stats.activeEmployees}</p>
                </div>
                <div className="p-3 bg-green-500 rounded-lg">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">في إجازة</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.onLeave}</p>
                </div>
                <div className="p-3 bg-yellow-500 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">جدد هذا الشهر</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.newThisMonth}</p>
                </div>
                <div className="p-3 bg-purple-500 rounded-lg">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* التبويبات */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="inline-block h-4 w-4 ml-2" />
              قائمة الموظفين
            </button>
            <button
              onClick={() => setActiveTab('departments')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'departments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 className="inline-block h-4 w-4 ml-2" />
              الأقسام
            </button>
            <button
              onClick={() => setActiveTab('positions')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'positions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Briefcase className="inline-block h-4 w-4 ml-2" />
              المناصب
            </button>
          </nav>
        </div>

        {activeTab === 'list' && (
          <>
            {/* أدوات البحث والتصفية */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="البحث بالاسم أو الرقم الوظيفي أو البريد..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">جميع الأقسام</option>
                    {mockDepartments.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">جميع الحالات</option>
                    <option value="active">نشط</option>
                    <option value="on_leave">في إجازة</option>
                    <option value="suspended">موقوف</option>
                    <option value="terminated">منتهي</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* جدول الموظفين */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">الموظف</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">الرقم الوظيفي</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">القسم</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">المنصب</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">نوع التوظيف</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">تاريخ التعيين</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">الحالة</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredEmployees.map((employee: any) => (
                        <tr key={employee.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium">
                                  {employee.firstName.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{employee.fullNameAr}</p>
                                <p className="text-sm text-gray-500">{employee.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{employee.employeeNumber}</td>
                          <td className="py-3 px-4 text-gray-600">{employee.department}</td>
                          <td className="py-3 px-4 text-gray-600">{employee.position}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {employmentTypeLabels[employee.employmentType]}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(employee.hireDate).toLocaleDateString('ar-SA')}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[employee.status]}`}>
                              {statusLabels[employee.status]}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4 text-gray-500" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4 text-gray-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ترقيم الصفحات */}
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-gray-600">
                    عرض {filteredEmployees.length} من {mockEmployees.length} موظف
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>السابق</Button>
                    <Button variant="outline" size="sm" className="bg-blue-50">1</Button>
                    <Button variant="outline" size="sm">2</Button>
                    <Button variant="outline" size="sm">التالي</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'departments' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockDepartments.map((dept) => (
              <Card key={dept.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{dept.name}</h3>
                        <p className="text-sm text-gray-500">{dept.employeeCount} موظف</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card className="border-dashed border-2 hover:border-blue-400 cursor-pointer transition-colors">
              <CardContent className="p-4 flex items-center justify-center h-full min-h-[100px]">
                <div className="text-center">
                  <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">إضافة قسم جديد</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'positions' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>المناصب الوظيفية</CardTitle>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  إضافة منصب
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['مدير عام', 'مدير قسم', 'مشرف', 'مطور برمجيات', 'محاسب', 'فني صيانة', 'موظف استقبال'].map((position, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                      <span className="font-medium">{position}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
