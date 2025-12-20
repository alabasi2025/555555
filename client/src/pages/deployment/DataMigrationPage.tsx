import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';

export default function DataMigrationPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sourceSystem: '',
    targetTable: '',
    priority: 1,
    totalRecords: 0,
  });

  const { data: tasks, refetch } = trpc.dataMigration.getTasks.useQuery();
  const { data: stats } = trpc.dataMigration.getMigrationStats.useQuery();

  const createMutation = trpc.dataMigration.createTask.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setFormData({ name: '', description: '', sourceSystem: '', targetTable: '', priority: 1, totalRecords: 0 });
    },
  });

  const startMutation = trpc.dataMigration.startTask.useMutation({
    onSuccess: () => refetch(),
  });

  const completeMutation = trpc.dataMigration.completeTask.useMutation({
    onSuccess: () => refetch(),
  });

  const deleteMutation = trpc.dataMigration.deleteTask.useMutation({
    onSuccess: () => refetch(),
  });

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      pending: 'قيد الانتظار',
      in_progress: 'جاري التنفيذ',
      completed: 'مكتمل',
      failed: 'فشل',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getProgress = (task: any) => {
    if (!task.totalRecords || task.totalRecords === 0) return 0;
    return Math.round((task.processedRecords / task.totalRecords) * 100);
  };

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">هجرة البيانات</h1>
        <p className="text-gray-600">إدارة مهام نقل وهجرة البيانات</p>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">إجمالي المهام</div>
          <div className="text-2xl font-bold text-blue-600">{stats?.totalTasks || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">مهام مكتملة</div>
          <div className="text-2xl font-bold text-green-600">{stats?.completedTasks || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">قيد التنفيذ</div>
          <div className="text-2xl font-bold text-yellow-600">{stats?.inProgressTasks || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">سجلات تمت معالجتها</div>
          <div className="text-2xl font-bold text-purple-600">{stats?.processedRecords || 0}</div>
        </div>
      </div>

      {/* قائمة المهام */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">مهام الهجرة</h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            إضافة مهمة جديدة
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">اسم المهمة</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">النظام المصدر</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الجدول الهدف</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">التقدم</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الحالة</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tasks?.map((task: any) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{task.name}</div>
                    {task.description && (
                      <div className="text-sm text-gray-500">{task.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{task.sourceSystem || '-'}</td>
                  <td className="px-4 py-3 text-sm">{task.targetTable || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${getProgress(task)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {task.processedRecords || 0} / {task.totalRecords || 0} ({getProgress(task)}%)
                    </div>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(task.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {task.status === 'pending' && (
                        <button
                          onClick={() => startMutation.mutate({ id: task.id })}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          بدء
                        </button>
                      )}
                      {task.status === 'in_progress' && (
                        <>
                          <button
                            onClick={() => completeMutation.mutate({ id: task.id, status: 'completed' })}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            إكمال
                          </button>
                          <button
                            onClick={() => completeMutation.mutate({ id: task.id, status: 'failed' })}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            فشل
                          </button>
                        </>
                      )}
                      {(task.status === 'completed' || task.status === 'failed') && (
                        <button
                          onClick={() => deleteMutation.mutate({ id: task.id })}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          حذف
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

      {/* نموذج إضافة مهمة */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">إضافة مهمة هجرة جديدة</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم المهمة</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                <label className="block text-sm font-medium mb-1">النظام المصدر</label>
                <input
                  type="text"
                  value={formData.sourceSystem}
                  onChange={(e) => setFormData({ ...formData, sourceSystem: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الجدول الهدف</label>
                <input
                  type="text"
                  value={formData.targetTable}
                  onChange={(e) => setFormData({ ...formData, targetTable: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">عدد السجلات</label>
                <input
                  type="number"
                  value={formData.totalRecords}
                  onChange={(e) => setFormData({ ...formData, totalRecords: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الأولوية</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value={1}>عالية</option>
                  <option value={2}>متوسطة</option>
                  <option value={3}>منخفضة</option>
                </select>
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
                إضافة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
