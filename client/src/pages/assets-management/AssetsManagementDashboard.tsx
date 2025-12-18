import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { trpc } from '../../lib/trpc';

export default function AssetsManagementDashboard() {
  const [activeTab, setActiveTab] = useState<'depreciation' | 'inventory'>('depreciation');

  const { data: depreciationRecords } = trpc.assetsManagement.getDepreciationRecords.useQuery();
  const { data: inventoryRecords } = trpc.assetsManagement.getAssetInventoryCounts.useQuery();
  const { data: stats } = trpc.assetsManagement.getAssetsManagementStats.useQuery();

  return (
    <DashboardLayout title="إدارة الأصول المتقدمة">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">إدارة الأصول المتقدمة</h1>
          <div className="space-x-2 space-x-reverse">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              + حساب الإهلاك
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              + جرد جديد
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">سجلات الإهلاك</h3>
            <p className="text-2xl font-bold text-blue-600">{stats?.totalDepreciationRecords || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">إجمالي الإهلاك</h3>
            <p className="text-2xl font-bold text-orange-600">{stats?.totalDepreciationAmount || 0} ر.س</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">عمليات الجرد</h3>
            <p className="text-2xl font-bold text-green-600">{stats?.totalInventoryCounts || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">الفروقات المكتشفة</h3>
            <p className="text-2xl font-bold text-purple-600">{stats?.discrepanciesFound || 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 space-x-reverse">
            {[
              { id: 'depreciation', label: 'الإهلاك' },
              { id: 'inventory', label: 'جرد الأصول' },
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
          {activeTab === 'depreciation' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الأصل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفترة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">قيمة الإهلاك</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإهلاك المتراكم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">القيمة الدفترية</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {depreciationRecords?.map((record: any) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">أصل #{record.assetId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.depreciationPeriod}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.depreciationAmount ? parseFloat(record.depreciationAmount).toLocaleString() : 0} ر.س
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.accumulatedDepreciation ? parseFloat(record.accumulatedDepreciation).toLocaleString() : 0} ر.س
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.netBookValue ? parseFloat(record.netBookValue).toLocaleString() : 0} ر.س
                    </td>
                  </tr>
                ))}
                {(!depreciationRecords || depreciationRecords.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">لا توجد سجلات إهلاك</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'inventory' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الجرد</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الموقع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventoryRecords?.map((record: any) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.countNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.countDate ? new Date(record.countDate).toLocaleDateString('ar-SA') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.location || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        record.status === 'completed' ? 'bg-green-100 text-green-800' :
                        record.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {record.status === 'completed' ? 'مكتمل' : 
                         record.status === 'in_progress' ? 'قيد التنفيذ' : record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-900 ml-2">عرض</button>
                      <button className="text-green-600 hover:text-green-900">تسوية</button>
                    </td>
                  </tr>
                ))}
                {(!inventoryRecords || inventoryRecords.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">لا توجد سجلات جرد</td>
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
