import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { trpc } from '../../lib/trpc';

export default function MaterialsEquipmentDashboard() {
  const [activeTab, setActiveTab] = useState<'distributions' | 'equipment' | 'maintenance'>('distributions');

  const { data: distributions } = trpc.materialsEquipment.getMaterialDistributions.useQuery();
  const { data: equipment } = trpc.materialsEquipment.getEquipmentTracking.useQuery();
  const { data: equipmentMaintenance } = trpc.materialsEquipment.getEquipmentMaintenance.useQuery();
  const { data: stats } = trpc.materialsEquipment.getMaterialsEquipmentStats.useQuery();

  return (
    <DashboardLayout title="إدارة المواد والمعدات">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">إدارة المواد والمعدات</h1>
          <div className="space-x-2 space-x-reverse">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              + توزيع مواد
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              + معدة جديدة
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
<div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">إجمالي التوزيعات</h3>
            <p className="text-2xl font-bold text-blue-600">{stats?.totalDistributions || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">تعيينات المعدات</h3>
            <p className="text-2xl font-bold text-green-600">{stats?.totalEquipmentAssignments || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">سجلات الصيانة</h3>
            <p className="text-2xl font-bold text-orange-600">{stats?.totalMaintenanceRecords || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">التوزيعات المعلقة</h3>
            <p className="text-2xl font-bold text-purple-600">{stats?.pendingDistributions || 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 space-x-reverse">
            {[
              { id: 'distributions', label: 'توزيع المواد' },
              { id: 'equipment', label: 'المعدات' },
              { id: 'maintenance', label: 'صيانة المعدات' },
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
          {activeTab === 'distributions' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم التوزيع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفريق</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {distributions?.map((dist: any) => (
                  <tr key={dist.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dist.distributionNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">فريق #{dist.teamId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dist.distributionDate ? new Date(dist.distributionDate).toLocaleDateString('ar-SA') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        dist.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        dist.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {dist.status === 'delivered' ? 'تم التسليم' : dist.status === 'pending' ? 'معلق' : dist.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-900 ml-2">عرض</button>
                      <button className="text-green-600 hover:text-green-900">تأكيد</button>
                    </td>
                  </tr>
                ))}
                {(!distributions || distributions.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">لا توجد توزيعات</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'equipment' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">كود المعدة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الموقع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {equipment?.map((eq: any) => (
                  <tr key={eq.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{eq.equipmentCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{eq.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{eq.equipmentType}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        eq.status === 'available' ? 'bg-green-100 text-green-800' :
                        eq.status === 'in_use' ? 'bg-blue-100 text-blue-800' :
                        eq.status === 'maintenance' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {eq.status === 'available' ? 'متاح' : 
                         eq.status === 'in_use' ? 'قيد الاستخدام' : 
                         eq.status === 'maintenance' ? 'صيانة' : eq.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{eq.currentLocation || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-900 ml-2">عرض</button>
                      <button className="text-orange-600 hover:text-orange-900">صيانة</button>
                    </td>
                  </tr>
                ))}
                {(!equipment || equipment.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">لا توجد معدات</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'maintenance' && (
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
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">لا توجد سجلات صيانة</td>
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
