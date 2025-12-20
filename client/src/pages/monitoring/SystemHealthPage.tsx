import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';

export default function SystemHealthPage() {
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [alertFormData, setAlertFormData] = useState<{
    alertType: 'performance' | 'info' | 'warning' | 'error' | 'security';
    source: string;
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>({
    alertType: 'warning',
    source: '',
    title: '',
    message: '',
    severity: 'medium',
  });
  const [ruleFormData, setRuleFormData] = useState({
    name: '',
    description: '',
    metricName: '',
    condition: 'gt',
    threshold: '',
    severity: 'medium',
  });

  const { data: healthChecks } = trpc.systemHealth.getHealthChecks.useQuery();
  const { data: alerts, refetch: refetchAlerts } = trpc.systemHealth.getSystemAlerts.useQuery();
  const { data: alertRules, refetch: refetchRules } = trpc.systemHealth.getAlertRules.useQuery();
  const { data: stats } = trpc.systemHealth.getSystemHealthStats.useQuery();
  const { data: surveyResults } = trpc.systemHealth.getSurveyResults.useQuery();

  const createAlertMutation = trpc.systemHealth.createSystemAlert.useMutation({
    onSuccess: () => {
      refetchAlerts();
      setShowAlertForm(false);
      setAlertFormData({ alertType: 'warning', source: '', title: '', message: '', severity: 'medium' });
    },
  });

  const acknowledgeAlertMutation = trpc.systemHealth.acknowledgeSystemAlert.useMutation({
    onSuccess: () => refetchAlerts(),
  });

  const resolveAlertMutation = trpc.systemHealth.resolveSystemAlert.useMutation({
    onSuccess: () => refetchAlerts(),
  });

  const createRuleMutation = trpc.systemHealth.createAlertRule.useMutation({
    onSuccess: () => {
      refetchRules();
      setShowRuleForm(false);
      setRuleFormData({ name: '', description: '', metricName: '', condition: 'gt', threshold: '', severity: 'medium' });
    },
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      healthy: 'bg-green-100 text-green-800',
      degraded: 'bg-yellow-100 text-yellow-800',
      unhealthy: 'bg-red-100 text-red-800',
      active: 'bg-red-100 text-red-800',
      acknowledged: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
    };
    const labels: Record<string, string> = {
      healthy: 'سليم',
      degraded: 'متدهور',
      unhealthy: 'غير سليم',
      active: 'نشط',
      acknowledged: 'تم الاعتراف',
      resolved: 'تم الحل',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      low: 'منخفضة',
      medium: 'متوسطة',
      high: 'عالية',
      critical: 'حرجة',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[severity] || 'bg-gray-100 text-gray-800'}`}>
        {labels[severity] || severity}
      </span>
    );
  };

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">صحة النظام والمراقبة</h1>
        <p className="text-gray-600">مراقبة أداء النظام والتنبيهات</p>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">الخدمات السليمة</div>
          <div className="text-2xl font-bold text-green-600">{stats?.healthyServices || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">الخدمات المتدهورة</div>
          <div className="text-2xl font-bold text-yellow-600">{stats?.degradedServices || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">التنبيهات النشطة</div>
          <div className="text-2xl font-bold text-red-600">{stats?.activeAlerts || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">التنبيهات الحرجة</div>
          <div className="text-2xl font-bold text-red-800">{stats?.criticalAlerts || 0}</div>
        </div>
      </div>

      {/* رضا المستخدمين */}
      {surveyResults && surveyResults.totalSurveys > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="font-semibold mb-4">رضا المستخدمين</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{surveyResults.averageOverallRating}</div>
              <div className="text-xs text-gray-500">التقييم العام</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{surveyResults.averageEaseOfUse}</div>
              <div className="text-xs text-gray-500">سهولة الاستخدام</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{surveyResults.averagePerformance}</div>
              <div className="text-xs text-gray-500">الأداء</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{surveyResults.averageFeatures}</div>
              <div className="text-xs text-gray-500">الميزات</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-teal-600">{surveyResults.averageSupport}</div>
              <div className="text-xs text-gray-500">الدعم</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">{surveyResults.recommendationRate}%</div>
              <div className="text-xs text-gray-500">نسبة التوصية</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* فحوصات الصحة */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">فحوصات صحة النظام</h2>
          </div>
          <div className="divide-y max-h-80 overflow-y-auto">
            {healthChecks?.map((check: any) => (
              <div key={check.id} className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-medium">{check.serviceName}</div>
                  <div className="text-sm text-gray-500">{check.checkType}</div>
                </div>
                <div className="text-left">
                  {getStatusBadge(check.lastStatus || 'unknown')}
                  {check.lastResponseTime && (
                    <div className="text-xs text-gray-500 mt-1">
                      {check.lastResponseTime}ms
                    </div>
                  )}
                </div>
              </div>
            ))}
            {(!healthChecks || healthChecks.length === 0) && (
              <div className="p-8 text-center text-gray-500">
                لا توجد فحوصات مسجلة
              </div>
            )}
          </div>
        </div>

        {/* التنبيهات */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">التنبيهات</h2>
            <button
              onClick={() => setShowAlertForm(true)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              + تنبيه جديد
            </button>
          </div>
          <div className="divide-y max-h-80 overflow-y-auto">
            {alerts?.map((alert: any) => (
              <div key={alert.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">{alert.title}</div>
                  <div className="flex gap-2">
                    {getSeverityBadge(alert.severity)}
                    {getStatusBadge(alert.status)}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    {new Date(alert.createdAt).toLocaleString('ar-SA')}
                  </span>
                  {alert.status === 'active' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => acknowledgeAlertMutation.mutate({ id: alert.id, acknowledgedBy: 1 })}
                        className="text-yellow-600 hover:text-yellow-800 text-xs"
                      >
                        اعتراف
                      </button>
                      <button
                        onClick={() => resolveAlertMutation.mutate({ id: alert.id, resolvedBy: 1 })}
                        className="text-green-600 hover:text-green-800 text-xs"
                      >
                        حل
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {(!alerts || alerts.length === 0) && (
              <div className="p-8 text-center text-gray-500">
                لا توجد تنبيهات
              </div>
            )}
          </div>
        </div>
      </div>

      {/* قواعد التنبيه */}
      <div className="mt-6 bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">قواعد التنبيه</h2>
          <button
            onClick={() => setShowRuleForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            قاعدة جديدة
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الاسم</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">المقياس</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الشرط</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الحد</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الخطورة</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {alertRules?.map((rule: any) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{rule.name}</div>
                    {rule.description && (
                      <div className="text-sm text-gray-500">{rule.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{rule.metricName || '-'}</td>
                  <td className="px-4 py-3 text-sm">{rule.condition}</td>
                  <td className="px-4 py-3 text-sm">{rule.threshold}</td>
                  <td className="px-4 py-3">{getSeverityBadge(rule.severity)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {rule.isActive ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* نموذج إضافة تنبيه */}
      {showAlertForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">تنبيه جديد</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">العنوان</label>
                <input
                  type="text"
                  value={alertFormData.title}
                  onChange={(e) => setAlertFormData({ ...alertFormData, title: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">المصدر</label>
                <input
                  type="text"
                  value={alertFormData.source}
                  onChange={(e) => setAlertFormData({ ...alertFormData, source: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الرسالة</label>
                <textarea
                  value={alertFormData.message}
                  onChange={(e) => setAlertFormData({ ...alertFormData, message: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">النوع</label>
                  <select
                    value={alertFormData.alertType}
                    onChange={(e) => setAlertFormData({ ...alertFormData, alertType: e.target.value as 'performance' | 'info' | 'warning' | 'error' | 'security' })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="info">معلومات</option>
                    <option value="warning">تحذير</option>
                    <option value="error">خطأ</option>
                    <option value="performance">أداء</option>
                    <option value="security">أمان</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الخطورة</label>
                  <select
                    value={alertFormData.severity}
                    onChange={(e) => setAlertFormData({ ...alertFormData, severity: e.target.value as 'low' | 'medium' | 'high' | 'critical' })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="low">منخفضة</option>
                    <option value="medium">متوسطة</option>
                    <option value="high">عالية</option>
                    <option value="critical">حرجة</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAlertForm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={() => createAlertMutation.mutate(alertFormData)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                إنشاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نموذج إضافة قاعدة */}
      {showRuleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">قاعدة تنبيه جديدة</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">الاسم</label>
                <input
                  type="text"
                  value={ruleFormData.name}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الوصف</label>
                <textarea
                  value={ruleFormData.description}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">اسم المقياس</label>
                <input
                  type="text"
                  value={ruleFormData.metricName}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, metricName: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">الشرط</label>
                  <select
                    value={ruleFormData.condition}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, condition: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="gt">أكبر من</option>
                    <option value="lt">أصغر من</option>
                    <option value="eq">يساوي</option>
                    <option value="gte">أكبر أو يساوي</option>
                    <option value="lte">أصغر أو يساوي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الحد</label>
                  <input
                    type="text"
                    value={ruleFormData.threshold}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, threshold: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الخطورة</label>
                <select
                  value={ruleFormData.severity}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, severity: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="low">منخفضة</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عالية</option>
                  <option value="critical">حرجة</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowRuleForm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={() => createRuleMutation.mutate(ruleFormData)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                إنشاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
