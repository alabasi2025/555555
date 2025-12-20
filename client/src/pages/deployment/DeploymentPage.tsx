import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';

export default function DeploymentPage() {
  const [showEnvForm, setShowEnvForm] = useState(false);
  const [showDeployForm, setShowDeployForm] = useState(false);
  const [selectedEnv, setSelectedEnv] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'development',
    url: '',
    serverIp: '',
    databaseHost: '',
    databaseName: '',
  });
  const [deployData, setDeployData] = useState({
    version: '',
    branch: 'main',
    notes: '',
  });

  const { data: environments, refetch: refetchEnvs } = trpc.deployment.getEnvironments.useQuery();
  const { data: deployments, refetch: refetchDeploys } = trpc.deployment.getDeployments.useQuery();
  const { data: stats } = trpc.deployment.getDeploymentStats.useQuery();

  const createEnvMutation = trpc.deployment.createEnvironment.useMutation({
    onSuccess: () => {
      refetchEnvs();
      setShowEnvForm(false);
      setFormData({ name: '', type: 'development', url: '', serverIp: '', databaseHost: '', databaseName: '' });
    },
  });

  const createDeployMutation = trpc.deployment.createDeployment.useMutation({
    onSuccess: () => {
      refetchDeploys();
      setShowDeployForm(false);
      setDeployData({ version: '', branch: 'main', notes: '' });
    },
  });

  const updateStatusMutation = trpc.deployment.updateDeploymentStatus.useMutation({
    onSuccess: () => refetchDeploys(),
  });

  const handleCreateEnv = () => {
    createEnvMutation.mutate(formData);
  };

  const handleDeploy = () => {
    if (!selectedEnv) return;
    createDeployMutation.mutate({
      environmentId: selectedEnv,
      version: deployData.version,
      branch: deployData.branch,
      notes: deployData.notes,
      deployedBy: 1,
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      rolled_back: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getEnvTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      development: 'bg-blue-100 text-blue-800',
      staging: 'bg-yellow-100 text-yellow-800',
      production: 'bg-green-100 text-green-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">إدارة النشر</h1>
        <p className="text-gray-600">إدارة بيئات النشر وعمليات الإطلاق</p>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">إجمالي البيئات</div>
          <div className="text-2xl font-bold text-blue-600">{stats?.totalEnvironments || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">إجمالي عمليات النشر</div>
          <div className="text-2xl font-bold text-purple-600">{stats?.totalDeployments || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">عمليات ناجحة</div>
          <div className="text-2xl font-bold text-green-600">{stats?.successfulDeployments || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">نسبة النجاح</div>
          <div className="text-2xl font-bold text-emerald-600">{stats?.successRate || 0}%</div>
        </div>
      </div>

      {/* بيئات النشر */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">بيئات النشر</h2>
          <button
            onClick={() => setShowEnvForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            إضافة بيئة جديدة
          </button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {environments?.map((env: any) => (
              <div
                key={env.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedEnv === env.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
                }`}
                onClick={() => setSelectedEnv(env.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{env.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${getEnvTypeBadge(env.type)}`}>
                    {env.type}
                  </span>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  {env.url && <div>URL: {env.url}</div>}
                  {env.serverIp && <div>IP: {env.serverIp}</div>}
                  <div>الحالة: {env.status || 'غير نشط'}</div>
                </div>
                {selectedEnv === env.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeployForm(true);
                    }}
                    className="mt-3 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                  >
                    نشر إلى هذه البيئة
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* سجل عمليات النشر */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">سجل عمليات النشر</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الإصدار</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الفرع</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الحالة</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">تاريخ البدء</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">تاريخ الانتهاء</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {deployments?.map((deploy: any) => (
                <tr key={deploy.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{deploy.version}</td>
                  <td className="px-4 py-3 text-sm">{deploy.branch || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(deploy.status)}`}>
                      {deploy.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {deploy.startedAt ? new Date(deploy.startedAt).toLocaleString('ar-SA') : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {deploy.completedAt ? new Date(deploy.completedAt).toLocaleString('ar-SA') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {deploy.status === 'pending' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: deploy.id, status: 'in_progress' })}
                        className="text-blue-600 hover:text-blue-800 text-sm ml-2"
                      >
                        بدء
                      </button>
                    )}
                    {deploy.status === 'in_progress' && (
                      <>
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: deploy.id, status: 'success' })}
                          className="text-green-600 hover:text-green-800 text-sm ml-2"
                        >
                          نجاح
                        </button>
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: deploy.id, status: 'failed' })}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          فشل
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* نموذج إضافة بيئة */}
      {showEnvForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">إضافة بيئة جديدة</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم البيئة</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">النوع</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="development">تطوير</option>
                  <option value="staging">اختبار</option>
                  <option value="production">إنتاج</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL</label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">عنوان IP</label>
                <input
                  type="text"
                  value={formData.serverIp}
                  onChange={(e) => setFormData({ ...formData, serverIp: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowEnvForm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreateEnv}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                إضافة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نموذج النشر */}
      {showDeployForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">نشر جديد</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">رقم الإصدار</label>
                <input
                  type="text"
                  value={deployData.version}
                  onChange={(e) => setDeployData({ ...deployData, version: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="مثال: 1.0.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الفرع</label>
                <input
                  type="text"
                  value={deployData.branch}
                  onChange={(e) => setDeployData({ ...deployData, branch: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ملاحظات</label>
                <textarea
                  value={deployData.notes}
                  onChange={(e) => setDeployData({ ...deployData, notes: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowDeployForm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeploy}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                نشر
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
