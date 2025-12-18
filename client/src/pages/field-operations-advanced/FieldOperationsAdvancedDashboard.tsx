import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { trpc } from '../../lib/trpc';

export default function FieldOperationsAdvancedDashboard() {
  const [activeTab, setActiveTab] = useState<'plans' | 'schedules' | 'tracking' | 'performance'>('plans');

  const { data: plans } = trpc.fieldOperationsAdvanced.getOperationPlans.useQuery();
  const { data: schedules } = trpc.fieldOperationsAdvanced.getOperationSchedules.useQuery();
  const { data: locations } = trpc.fieldOperationsAdvanced.getWorkerLocations.useQuery();
  const { data: performance } = trpc.fieldOperationsAdvanced.getPerformanceEvaluations.useQuery();

  return (
    <DashboardLayout title="العمليات الميدانية المتقدمة">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">العمليات الميدانية المتقدمة</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            + خطة جديدة
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">خطط العمليات</h3>
            <p className="text-2xl font-bold text-blue-600">{plans?.length || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">جداول اليوم</h3>
            <p className="text-2xl font-bold text-green-600">{schedules?.length || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">فرق في الميدان</h3>
            <p className="text-2xl font-bold text-orange-600">{locations?.length || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">تقييمات الأداء</h3>
            <p className="text-2xl font-bold text-purple-600">{performance?.length || 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 space-x-reverse">
            {[
              { id: 'plans', label: 'خطط العمليات' },
              { id: 'schedules', label: 'الجداول' },
              { id: 'tracking', label: 'تتبع الموقع' },
              { id: 'performance', label: 'تقييمات الأداء' },
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
          {activeTab === 'plans' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم الخطة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ البدء</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الانتهاء</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plans?.map((plan: any) => (
                  <tr key={plan.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.planName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.planType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {plan.startDate ? new Date(plan.startDate).toLocaleDateString('ar-SA') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {plan.endDate ? new Date(plan.endDate).toLocaleDateString('ar-SA') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        plan.status === 'active' ? 'bg-green-100 text-green-800' :
                        plan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {plan.status === 'active' ? 'نشط' : plan.status === 'completed' ? 'مكتمل' : plan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-900 ml-2">عرض</button>
                      <button className="text-green-600 hover:text-green-900">تعديل</button>
                    </td>
                  </tr>
                ))}
                {(!plans || plans.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">لا توجد خطط عمليات</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'schedules' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العامل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules?.map((schedule: any) => (
                  <tr key={schedule.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.scheduleDate ? new Date(schedule.scheduleDate).toLocaleDateString('ar-SA') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">عامل #{schedule.workerId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        schedule.status === 'completed' ? 'bg-green-100 text-green-800' :
                        schedule.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {schedule.status === 'completed' ? 'مكتمل' : schedule.status === 'in_progress' ? 'قيد التنفيذ' : schedule.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!schedules || schedules.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">لا توجد جداول</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'tracking' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locations?.map((track: any) => (
                  <div key={track.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">العامل #{track.workerId}</h4>
                        <p className="text-sm text-gray-500">آخر تحديث: {track.timestamp ? new Date(track.timestamp).toLocaleString('ar-SA') : '-'}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        track.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {track.status === 'active' ? 'نشط' : track.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      <p>الموقع: {track.latitude}, {track.longitude}</p>
                    </div>
                  </div>
                ))}
                {(!locations || locations.length === 0) && (
                  <div className="col-span-3 text-center text-gray-500 py-8">لا توجد بيانات تتبع</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العامل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفترة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التقييم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الملاحظات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {performance?.map((perf: any) => (
                  <tr key={perf.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">عامل #{perf.workerId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{perf.evaluationPeriod}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        perf.overallRating >= 4 ? 'bg-green-100 text-green-800' :
                        perf.overallRating >= 3 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {perf.overallRating}/5
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{perf.comments || '-'}</td>
                  </tr>
                ))}
                {(!performance || performance.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">لا توجد تقييمات أداء</td>
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
