import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';

export default function MaintenanceWindowsPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'scheduled',
    scheduledStart: '',
    scheduledEnd: '',
  });

  const { data: windows, refetch } = trpc.systemMaintenance.getMaintenanceWindows.useQuery();
  const { data: upcoming } = trpc.systemMaintenance.getUpcomingMaintenance.useQuery();
  const { data: stats } = trpc.systemMaintenance.getSystemMaintenanceStats.useQuery();

  const createMutation = trpc.systemMaintenance.createMaintenanceWindow.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setFormData({ title: '', description: '', type: 'scheduled', scheduledStart: '', scheduledEnd: '' });
    },
  });

  const startMutation = trpc.systemMaintenance.startMaintenance.useMutation({
    onSuccess: () => refetch(),
  });

  const completeMutation = trpc.systemMaintenance.completeMaintenance.useMutation({
    onSuccess: () => refetch(),
  });

  const cancelMutation = trpc.systemMaintenance.cancelMaintenance.useMutation({
    onSuccess: () => refetch(),
  });

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      scheduled: 'مجدول',
      in_progress: 'جاري',
      completed: 'مكتمل',
      cancelled: 'ملغي',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      emergency: 'bg-red-100 text-red-800',
      hotfix: 'bg-orange-100 text-orange-800',
    };
    const labels: Record<string, string> = {
      scheduled: 'مجدول',
      emergency: 'طارئ',
      hotfix: 'إصلاح سريع',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
        {labels[type] || type}
      </span>
    );
  };

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">نوافذ الصيانة</h1>
        <p className="text-gray-600">جدولة وإدارة فترات الصيانة</p>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">إجمالي النوافذ</div>
          <div className="text-2xl font-bold text-blue-600">{stats?.totalMaintenanceWindows || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">مجدولة</div>
          <div className="text-2xl font-bold text-yellow-600">{stats?.scheduledWindows || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">مكتملة</div>
          <div className="text-2xl font-bold text-green-600">{stats?.completedWindows || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">التحديثات المنشورة</div>
          <div className="text-2xl font-bold text-purple-600">{stats?.releasedUpdates || 0}</div>
        </div>
      </div>

      {/* الصيانة القادمة */}
      {upcoming && upcoming.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">صيانة قادمة</h3>
          <div className="space-y-2">
            {upcoming.map((m: any) => (
              <div key={m.id} className="flex justify-between items-center">
                <span>{m.title}</span>
                <span className="text-sm text-yellow-700">
                  {new Date(m.scheduledStart).toLocaleString('ar-SA')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* قائمة نوافذ الصيانة */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">نوافذ الصيانة</h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            جدولة صيانة جديدة
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">العنوان</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">النوع</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">البداية المجدولة</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">النهاية المجدولة</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الحالة</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {windows?.map((window: any) => (
                <tr key={window.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{window.title}</div>
                    {window.description && (
                      <div className="text-sm text-gray-500">{window.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">{getTypeBadge(window.type)}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(window.scheduledStart).toLocaleString('ar-SA')}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(window.scheduledEnd).toLocaleString('ar-SA')}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(window.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {window.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => startMutation.mutate({ id: window.id })}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            بدء
                          </button>
                          <button
                            onClick={() => cancelMutation.mutate({ id: window.id })}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            إلغاء
                          </button>
                        </>
                      )}
                      {window.status === 'in_progress' && (
                        <button
                          onClick={() => completeMutation.mutate({ id: window.id })}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          إكمال
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* نموذج إضافة نافذة صيانة */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">جدولة صيانة جديدة</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">العنوان</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">النوع</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="scheduled">مجدول</option>
                  <option value="emergency">طارئ</option>
                  <option value="hotfix">إصلاح سريع</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">وقت البداية</label>
                <input
                  type="datetime-local"
                  value={formData.scheduledStart}
                  onChange={(e) => setFormData({ ...formData, scheduledStart: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">وقت النهاية</label>
                <input
                  type="datetime-local"
                  value={formData.scheduledEnd}
                  onChange={(e) => setFormData({ ...formData, scheduledEnd: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                جدولة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
