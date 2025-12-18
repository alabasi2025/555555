import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { trpc } from '../../lib/trpc';

export default function InspectionsDashboard() {
  const [activeTab, setActiveTab] = useState<'inspections' | 'signatures'>('inspections');

  const { data: inspections } = trpc.inspections.getInspections.useQuery();
  const { data: signatures } = trpc.inspections.getSignatures.useQuery({ entityType: 'inspection', entityId: 0 });
  const { data: stats } = trpc.inspections.getInspectionsStats.useQuery();

  return (
    <DashboardLayout title="الفحص والقبول">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">الفحص والقبول</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            + فحص جديد
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">إجمالي الفحوصات</h3>
            <p className="text-2xl font-bold text-blue-600">{stats?.totalInspections || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">بانتظار الموافقة</h3>
            <p className="text-2xl font-bold text-orange-600">{stats?.pendingInspections || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">تم القبول</h3>
            <p className="text-2xl font-bold text-green-600">{stats?.passedInspections || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">تم الرفض</h3>
            <p className="text-2xl font-bold text-red-600">{stats?.failedInspections || 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 space-x-reverse">
            {[
              { id: 'inspections', label: 'الفحوصات' },
              { id: 'signatures', label: 'التوقيعات' },
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
          {activeTab === 'inspections' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الفحص</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفاحص</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النتيجة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inspections?.map((inspection: any) => (
                  <tr key={inspection.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inspection.inspectionNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inspection.inspectionType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inspection.inspectionDate ? new Date(inspection.inspectionDate).toLocaleDateString('ar-SA') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">فاحص #{inspection.inspectorId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        inspection.result === 'passed' ? 'bg-green-100 text-green-800' :
                        inspection.result === 'failed' ? 'bg-red-100 text-red-800' :
                        inspection.result === 'conditional' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {inspection.result === 'passed' ? 'ناجح' : 
                         inspection.result === 'failed' ? 'فاشل' : 
                         inspection.result === 'conditional' ? 'مشروط' : inspection.result || 'معلق'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-900 ml-2">عرض</button>
                      <button className="text-green-600 hover:text-green-900">موافقة</button>
                    </td>
                  </tr>
                ))}
                {(!inspections || inspections.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">لا توجد فحوصات</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'signatures' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الفحص</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الموقع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الدور</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {signatures?.map((sig: any) => (
                  <tr key={sig.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">فحص #{sig.inspectionId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">مستخدم #{sig.signedBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sig.signerRole}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sig.signedAt ? new Date(sig.signedAt).toLocaleDateString('ar-SA') : '-'}
                    </td>
                  </tr>
                ))}
                {(!signatures || signatures.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">لا توجد توقيعات</td>
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
