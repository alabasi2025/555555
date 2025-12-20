import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';

export default function SystemUpdatesPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const [formData, setFormData] = useState({
    version: '',
    releaseType: 'minor',
    title: '',
    description: '',
    changelog: '',
    breakingChanges: '',
  });

  const { data: updates, refetch } = trpc.systemMaintenance.getUpdates.useQuery();
  const { data: latestRelease } = trpc.systemMaintenance.getLatestRelease.useQuery();
  const { data: changeLogs } = trpc.systemMaintenance.getChangeLogs.useQuery();

  const createMutation = trpc.systemMaintenance.createUpdate.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setFormData({ version: '', releaseType: 'minor', title: '', description: '', changelog: '', breakingChanges: '' });
    },
  });

  const releaseMutation = trpc.systemMaintenance.releaseUpdate.useMutation({
    onSuccess: () => refetch(),
  });

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      testing: 'bg-yellow-100 text-yellow-800',
      released: 'bg-green-100 text-green-800',
      deprecated: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      draft: 'مسودة',
      testing: 'قيد الاختبار',
      released: 'منشور',
      deprecated: 'متقادم',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getReleaseTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      major: 'bg-red-100 text-red-800',
      minor: 'bg-blue-100 text-blue-800',
      patch: 'bg-green-100 text-green-800',
      hotfix: 'bg-orange-100 text-orange-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">التحديثات والإصدارات</h1>
        <p className="text-gray-600">إدارة إصدارات النظام وسجل التغييرات</p>
      </div>

      {/* الإصدار الحالي */}
      {latestRelease && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-green-800">الإصدار الحالي</h3>
              <p className="text-2xl font-bold text-green-700">{latestRelease.version}</p>
              <p className="text-sm text-green-600">{latestRelease.title}</p>
            </div>
            <div className="text-left">
              <span className="text-sm text-green-600">تاريخ الإصدار</span>
              <p className="font-medium">
                {latestRelease.releaseDate 
                  ? new Date(latestRelease.releaseDate).toLocaleDateString('ar-SA')
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* قائمة التحديثات */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">التحديثات</h2>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              إصدار جديد
            </button>
          </div>
          <div className="divide-y">
            {updates?.map((update: any) => (
              <div
                key={update.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedUpdate?.id === update.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedUpdate(update)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-lg font-bold">{update.version}</span>
                    <span className="mr-2">{update.title}</span>
                  </div>
                  <div className="flex gap-2">
                    {getReleaseTypeBadge(update.releaseType)}
                    {getStatusBadge(update.status)}
                  </div>
                </div>
                {update.description && (
                  <p className="text-sm text-gray-600">{update.description}</p>
                )}
                <div className="text-xs text-gray-400 mt-2">
                  {update.releaseDate 
                    ? new Date(update.releaseDate).toLocaleDateString('ar-SA')
                    : 'لم يُنشر بعد'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* تفاصيل التحديث */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">تفاصيل التحديث</h2>
          </div>
          {selectedUpdate ? (
            <div className="p-4">
              <div className="mb-4">
                <span className="text-2xl font-bold">{selectedUpdate.version}</span>
                <div className="flex gap-2 mt-2">
                  {getReleaseTypeBadge(selectedUpdate.releaseType)}
                  {getStatusBadge(selectedUpdate.status)}
                </div>
              </div>
              <div className="mb-4">
                <h4 className="font-medium mb-1">{selectedUpdate.title}</h4>
                <p className="text-sm text-gray-600">{selectedUpdate.description}</p>
              </div>
              {selectedUpdate.changelog && (
                <div className="mb-4">
                  <h4 className="font-medium mb-1">سجل التغييرات</h4>
                  <pre className="text-sm bg-gray-50 p-2 rounded whitespace-pre-wrap">
                    {selectedUpdate.changelog}
                  </pre>
                </div>
              )}
              {selectedUpdate.breakingChanges && (
                <div className="mb-4">
                  <h4 className="font-medium mb-1 text-red-600">تغييرات جذرية</h4>
                  <pre className="text-sm bg-red-50 p-2 rounded whitespace-pre-wrap text-red-700">
                    {selectedUpdate.breakingChanges}
                  </pre>
                </div>
              )}
              {selectedUpdate.status !== 'released' && (
                <div className="border-t pt-4 mt-4">
                  <button
                    onClick={() => releaseMutation.mutate({ id: selectedUpdate.id })}
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                  >
                    نشر الإصدار
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              اختر تحديثاً لعرض التفاصيل
            </div>
          )}
        </div>
      </div>

      {/* سجل التغييرات الأخير */}
      <div className="mt-6 bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">سجل التغييرات الأخير</h2>
        </div>
        <div className="divide-y">
          {changeLogs?.slice(0, 10).map((log: any) => (
            <div key={log.id} className="p-4 flex items-start gap-4">
              <span className={`px-2 py-1 rounded text-xs ${
                log.changeType === 'added' ? 'bg-green-100 text-green-800' :
                log.changeType === 'changed' ? 'bg-blue-100 text-blue-800' :
                log.changeType === 'fixed' ? 'bg-yellow-100 text-yellow-800' :
                log.changeType === 'removed' ? 'bg-red-100 text-red-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {log.changeType}
              </span>
              <div className="flex-1">
                <p className="text-sm">{log.description}</p>
                {log.module && (
                  <span className="text-xs text-gray-500">الوحدة: {log.module}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* نموذج إضافة تحديث */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">إصدار جديد</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">رقم الإصدار</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="مثال: 1.0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">نوع الإصدار</label>
                  <select
                    value={formData.releaseType}
                    onChange={(e) => setFormData({ ...formData, releaseType: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="major">رئيسي (Major)</option>
                    <option value="minor">ثانوي (Minor)</option>
                    <option value="patch">تصحيح (Patch)</option>
                    <option value="hotfix">إصلاح سريع (Hotfix)</option>
                  </select>
                </div>
              </div>
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
                <label className="block text-sm font-medium mb-1">سجل التغييرات</label>
                <textarea
                  value={formData.changelog}
                  onChange={(e) => setFormData({ ...formData, changelog: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={4}
                  placeholder="- إضافة ميزة جديدة&#10;- إصلاح خطأ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">تغييرات جذرية (إن وجدت)</label>
                <textarea
                  value={formData.breakingChanges}
                  onChange={(e) => setFormData({ ...formData, breakingChanges: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
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
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
