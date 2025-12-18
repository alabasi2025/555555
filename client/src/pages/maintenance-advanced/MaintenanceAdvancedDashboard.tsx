import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { trpc } from '../../lib/trpc';

export default function MaintenanceAdvancedDashboard() {
  const [activeTab, setActiveTab] = useState<'preventive' | 'emergency' | 'parts' | 'equipment'>('preventive');

  const { data: preventiveSchedules } = trpc.maintenanceAdvanced.getPreventiveSchedules.useQuery();
  const { data: emergencyRequests } = trpc.maintenanceAdvanced.getEmergencyRequests.useQuery();
  const { data: partsUsed } = trpc.maintenanceAdvanced.getPartsUsed.useQuery();
  const { data: equipmentMaintenance } = trpc.maintenanceAdvanced.getEquipmentMaintenance.useQuery();
  const { data: stats } = trpc.maintenanceAdvanced.getMaintenanceStats.useQuery();

  return (
    <DashboardLayout title="الصيانة المتقدمة">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">الصيانة المتقدمة</h1>
          <div className="space-x-2 space-x-reverse">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              + جدول صيانة وقائية
            </button>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              + طلب صيانة طارئة
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">جداول الصيانة الوقائية</h3>
            <p className="text-2xl font-bold text-blue-600">{stats?.totalPreventiveSchedules || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">الجداول المتأخرة</h3>
            <p className="text-2xl font-bold text-red-600">{stats?.overdueSchedules || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">طلبات الطوارئ المعلقة</h3>
            <p className="text-2xl font-bold text-orange-600">{stats?.pendingRequests || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">الطلبات المكتملة</h3>
            <p className="text-2xl font-bold text-green-600">{stats?.completedRequests || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">إجمالي تكلفة الصيانة</h3>
            <p className="text-2xl font-bold text-purple-600">{stats?.totalMaintenanceCost || 0} ر.س</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 space-x-reverse">
            {[
              { id: 'preventive', label: 'الصيانة الوقائية' },
              { id: 'emergency', label: 'الصيانة الطارئة' },
              { id: 'parts', label: 'قطع الغيار المستخدمة' },
              { id: 'equipment', label: 'صيانة المعدات' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {activeTab === 'preventive' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم الجدول</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نوع الصيانة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التكرار</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الصيانة القادمة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preventiveSchedules?.map((schedule: any) => (
                  <tr key={schedule.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{schedule.scheduleName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{schedule.maintenanceType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{schedule.frequency}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {schedule.nextMaintenanceDate ? new Date(schedule.nextMaintenanceDate).toLocaleDateString('ar-SA') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        schedule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {schedule.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-900 ml-2">عرض</button>
                      <button className="text-green-600 hover:text-green-900">تنفيذ</button>
                    </td>
                  </tr>
                ))}
                {(!preventiveSchedules || preventiveSchedules.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">لا توجد جداول صيانة وقائية</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'emergency' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الطلب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوصف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">مستوى الطوارئ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفني المعين</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {emergencyRequests?.map((request: any) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.requestNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{request.problemDescription}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        request.urgencyLevel === 'critical' ? 'bg-red-100 text-red-800' :
                        request.urgencyLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                        request.urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.urgencyLevel === 'critical' ? 'حرج' :
                         request.urgencyLevel === 'high' ? 'عالي' :
                         request.urgencyLevel === 'medium' ? 'متوسط' : 'منخفض'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        request.status === 'completed' ? 'bg-green-100 text-green-800' :
                        request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        request.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status === 'completed' ? 'مكتمل' :
                         request.status === 'in_progress' ? 'قيد التنفيذ' :
                         request.status === 'assigned' ? 'تم التعيين' : 'معلق'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.assignedTechnicianId ? `فني #${request.assignedTechnicianId}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-900 ml-2">عرض</button>
                      <button className="text-green-600 hover:text-green-900">تعيين</button>
                    </td>
                  </tr>
                ))}
                {(!emergencyRequests || emergencyRequests.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">لا توجد طلبات صيانة طارئة</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'parts' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم القطعة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكمية</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تكلفة الوحدة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التكلفة الإجمالية</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {partsUsed?.map((part: any) => (
                  <tr key={part.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{part.partName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{part.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {part.unitCost ? `${parseFloat(part.unitCost).toLocaleString()} ر.س` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {part.totalCost ? `${parseFloat(part.totalCost).toLocaleString()} ر.س` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {part.createdAt ? new Date(part.createdAt).toLocaleDateString('ar-SA') : '-'}
                    </td>
                  </tr>
                ))}
                {(!partsUsed || partsUsed.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">لا توجد قطع غيار مستخدمة</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'equipment' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المعدة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نوع الصيانة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ المجدول</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التكلفة</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {equipmentMaintenance?.map((maint: any) => (
                  <tr key={maint.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">معدة #{maint.equipmentId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{maint.maintenanceType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {maint.scheduledDate ? new Date(maint.scheduledDate).toLocaleDateString('ar-SA') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        maint.status === 'completed' ? 'bg-green-100 text-green-800' :
                        maint.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {maint.status === 'completed' ? 'مكتمل' : 
                         maint.status === 'scheduled' ? 'مجدول' : maint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {maint.cost ? `${parseFloat(maint.cost).toLocaleString()} ر.س` : '-'}
                    </td>
                  </tr>
                ))}
                {(!equipmentMaintenance || equipmentMaintenance.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">لا توجد سجلات صيانة معدات</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
