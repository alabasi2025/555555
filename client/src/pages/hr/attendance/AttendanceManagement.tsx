/**
 * صفحة إدارة الحضور والانصراف
 * Attendance Management Page
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Clock, 
  Calendar,
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle,
  XCircle,
  LogIn,
  LogOut,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Timer,
  CalendarDays,
  TrendingUp
} from 'lucide-react';

// بيانات تجريبية للحضور اليوم
const mockTodayAttendance = [
  { id: 1, employeeName: 'أحمد محمد', employeeNumber: 'EMP001', department: 'تقنية المعلومات', checkIn: '08:05', checkOut: '17:00', status: 'present', workedHours: '8:55' },
  { id: 2, employeeName: 'فاطمة علي', employeeNumber: 'EMP002', department: 'الموارد البشرية', checkIn: '08:30', checkOut: null, status: 'present', workedHours: '-' },
  { id: 3, employeeName: 'خالد سعود', employeeNumber: 'EMP003', department: 'المالية', checkIn: null, checkOut: null, status: 'absent', workedHours: '-' },
  { id: 4, employeeName: 'نورة عبدالله', employeeNumber: 'EMP004', department: 'العمليات', checkIn: '08:45', checkOut: null, status: 'late', workedHours: '-' },
  { id: 5, employeeName: 'محمد إبراهيم', employeeNumber: 'EMP005', department: 'الصيانة', checkIn: '07:55', checkOut: '16:30', status: 'present', workedHours: '8:35' },
  { id: 6, employeeName: 'سارة أحمد', employeeNumber: 'EMP006', department: 'المبيعات', checkIn: null, checkOut: null, status: 'on_leave', workedHours: '-' },
];

// بيانات تجريبية للتقرير الشهري
const mockMonthlyData = [
  { date: '2024-12-01', present: 45, absent: 3, late: 2, onLeave: 5 },
  { date: '2024-12-02', present: 48, absent: 1, late: 1, onLeave: 5 },
  { date: '2024-12-03', present: 46, absent: 2, late: 3, onLeave: 4 },
  { date: '2024-12-04', present: 47, absent: 2, late: 1, onLeave: 5 },
  { date: '2024-12-05', present: 44, absent: 4, late: 2, onLeave: 5 },
];

const statusColors: Record<string, string> = {
  present: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
  late: 'bg-yellow-100 text-yellow-800',
  on_leave: 'bg-blue-100 text-blue-800',
  half_day: 'bg-orange-100 text-orange-800',
};

const statusLabels: Record<string, string> = {
  present: 'حاضر',
  absent: 'غائب',
  late: 'متأخر',
  on_leave: 'إجازة',
  half_day: 'نصف يوم',
};

export default function AttendanceManagement() {
  const [activeTab, setActiveTab] = useState<'today' | 'monthly' | 'shifts'>('today');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  // إحصائيات اليوم
  const todayStats = {
    totalEmployees: 55,
    present: 42,
    absent: 3,
    late: 4,
    onLeave: 6,
    attendanceRate: '76%',
  };

  // تصفية الحضور
  const filteredAttendance = mockTodayAttendance.filter(record =>
    record.employeeName.includes(searchTerm) ||
    record.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* العنوان */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">الحضور والانصراف</h1>
            <p className="text-gray-600 mt-1">متابعة حضور وانصراف الموظفين</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              تصدير التقرير
            </Button>
            <Button className="gap-2 bg-green-600 hover:bg-green-700">
              <LogIn className="h-4 w-4" />
              تسجيل حضور يدوي
            </Button>
          </div>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-900">{todayStats.totalEmployees}</p>
              <p className="text-sm text-blue-600">إجمالي الموظفين</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 text-center">
              <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-900">{todayStats.present}</p>
              <p className="text-sm text-green-600">حاضر</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4 text-center">
              <UserX className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-900">{todayStats.absent}</p>
              <p className="text-sm text-red-600">غائب</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-900">{todayStats.late}</p>
              <p className="text-sm text-yellow-600">متأخر</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-900">{todayStats.onLeave}</p>
              <p className="text-sm text-purple-600">في إجازة</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-indigo-900">{todayStats.attendanceRate}</p>
              <p className="text-sm text-indigo-600">نسبة الحضور</p>
            </CardContent>
          </Card>
        </div>

        {/* التبويبات */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('today')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'today'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Clock className="inline-block h-4 w-4 ml-2" />
              حضور اليوم
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'monthly'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <CalendarDays className="inline-block h-4 w-4 ml-2" />
              التقرير الشهري
            </button>
            <button
              onClick={() => setActiveTab('shifts')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'shifts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Timer className="inline-block h-4 w-4 ml-2" />
              أوردية العمل
            </button>
          </nav>
        </div>

        {activeTab === 'today' && (
          <>
            {/* أدوات البحث */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="البحث بالاسم أو الرقم الوظيفي..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto"
                  />
                  <select className="px-3 py-2 border border-gray-300 rounded-md">
                    <option value="all">جميع الحالات</option>
                    <option value="present">حاضر</option>
                    <option value="absent">غائب</option>
                    <option value="late">متأخر</option>
                    <option value="on_leave">إجازة</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* جدول الحضور */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">الموظف</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">الرقم الوظيفي</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">القسم</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">وقت الحضور</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">وقت الانصراف</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">ساعات العمل</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">الحالة</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredAttendance.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-sm">
                                  {record.employeeName.charAt(0)}
                                </span>
                              </div>
                              <span className="font-medium">{record.employeeName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{record.employeeNumber}</td>
                          <td className="py-3 px-4 text-gray-600">{record.department}</td>
                          <td className="py-3 px-4 text-center">
                            {record.checkIn ? (
                              <span className="flex items-center justify-center gap-1 text-green-600">
                                <LogIn className="h-4 w-4" />
                                {record.checkIn}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {record.checkOut ? (
                              <span className="flex items-center justify-center gap-1 text-red-600">
                                <LogOut className="h-4 w-4" />
                                {record.checkOut}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center font-medium">{record.workedHours}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[record.status]}`}>
                              {statusLabels[record.status]}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center gap-1">
                              {!record.checkIn && record.status !== 'on_leave' && (
                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                                  <LogIn className="h-3 w-3" />
                                  تسجيل حضور
                                </Button>
                              )}
                              {record.checkIn && !record.checkOut && (
                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                                  <LogOut className="h-3 w-3" />
                                  تسجيل انصراف
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'monthly' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* التقويم */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>ديسمبر 2024</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 text-center">
                  {['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map(day => (
                    <div key={day} className="py-2 text-sm font-medium text-gray-500">{day}</div>
                  ))}
                  {Array.from({ length: 31 }, (_, i) => (
                    <div
                      key={i}
                      className={`py-3 rounded-lg text-sm cursor-pointer transition-colors ${
                        i + 1 === new Date().getDate()
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ملخص الشهر */}
            <Card>
              <CardHeader>
                <CardTitle>ملخص الشهر</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-700">أيام الحضور</span>
                  <span className="font-bold text-green-700">22</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-red-700">أيام الغياب</span>
                  <span className="font-bold text-red-700">2</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-yellow-700">أيام التأخير</span>
                  <span className="font-bold text-yellow-700">3</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-700">أيام الإجازة</span>
                  <span className="font-bold text-blue-700">4</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">إجمالي ساعات العمل</span>
                    <span className="font-bold text-gray-900">176 ساعة</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">الساعات الإضافية</span>
                    <span className="font-bold text-green-600">+12 ساعة</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">دقائق التأخير</span>
                    <span className="font-bold text-red-600">45 دقيقة</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'shifts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'الوردية الصباحية', code: 'MORNING', start: '08:00', end: '16:00', employees: 35 },
              { name: 'الوردية المسائية', code: 'EVENING', start: '16:00', end: '00:00', employees: 15 },
              { name: 'الوردية الليلية', code: 'NIGHT', start: '00:00', end: '08:00', employees: 5 },
              { name: 'دوام مرن', code: 'FLEXIBLE', start: '07:00-10:00', end: '15:00-18:00', employees: 10 },
            ].map((shift, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Timer className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{shift.code}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{shift.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>وقت البداية:</span>
                      <span className="font-medium">{shift.start}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>وقت النهاية:</span>
                      <span className="font-medium">{shift.end}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>عدد الموظفين:</span>
                      <span className="font-medium">{shift.employees}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    إدارة الوردية
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
