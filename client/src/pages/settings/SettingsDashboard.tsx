import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { trpc } from "@/lib/trpc";

export default function SettingsDashboard() {
  const [activeTab, setActiveTab] = useState<"general" | "backups" | "alerts" | "logs" | "notifications">("general");
  
  const { data: dashboard, isLoading } = trpc.settings.getSettingsDashboard.useQuery();
  const { data: settings } = trpc.settings.getSettings.useQuery({});
  const { data: backups } = trpc.settings.getBackups.useQuery();
  const { data: alerts } = trpc.settings.getSystemAlerts.useQuery({});
  const { data: logs } = trpc.settings.getSystemLogs.useQuery({ limit: 50 });
  const { data: templates } = trpc.settings.getNotificationTemplates.useQuery({});
  
  const utils = trpc.useUtils();
  
  const createBackup = trpc.settings.createBackup.useMutation({
    onSuccess: () => {
      utils.settings.getBackups.invalidate();
      utils.settings.getSettingsDashboard.invalidate();
    },
  });
  
  const acknowledgeAlert = trpc.settings.acknowledgeAlert.useMutation({
    onSuccess: () => {
      utils.settings.getSystemAlerts.invalidate();
      utils.settings.getSettingsDashboard.invalidate();
    },
  });
  
  const resolveAlert = trpc.settings.resolveAlert.useMutation({
    onSuccess: () => {
      utils.settings.getSystemAlerts.invalidate();
      utils.settings.getSettingsDashboard.invalidate();
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout title="الإعدادات">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="الإعدادات">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-500">الإعدادات</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard?.totalSettings || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-500">النسخ الاحتياطية</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard?.completedBackups || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-500">التنبيهات النشطة</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard?.activeAlerts || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-500">قوالب الإشعارات</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard?.totalTemplates || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {[
                { id: "general", label: "الإعدادات العامة" },
                { id: "backups", label: "النسخ الاحتياطي" },
                { id: "alerts", label: "التنبيهات" },
                { id: "logs", label: "السجلات" },
                { id: "notifications", label: "الإشعارات" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "general" && (
              <div>
                <h3 className="text-lg font-medium mb-4">الإعدادات العامة</h3>
                <div className="space-y-4">
                  {settings?.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                      <div>
                        <p className="font-medium">{setting.settingKey}</p>
                        <p className="text-sm text-gray-500">{setting.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm bg-gray-200 px-3 py-1 rounded font-mono">
                          {setting.settingValue || setting.defaultValue || "-"}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          setting.settingType === "boolean" ? "bg-blue-100 text-blue-800" :
                          setting.settingType === "number" ? "bg-green-100 text-green-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {setting.settingType}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {(!settings || settings.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      لا توجد إعدادات محفوظة
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "backups" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">النسخ الاحتياطي</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => createBackup.mutate({ backupType: "full" })}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      نسخة كاملة
                    </button>
                    <button
                      onClick={() => createBackup.mutate({ backupType: "incremental" })}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      نسخة تزايدية
                    </button>
                  </div>
                </div>
                
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكود</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحجم</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">انتهاء الصلاحية</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {backups?.map((backup) => (
                      <tr key={backup.id}>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{backup.backupCode}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            backup.backupType === "full" ? "bg-blue-100 text-blue-800" :
                            backup.backupType === "incremental" ? "bg-green-100 text-green-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {backup.backupType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            backup.status === "completed" ? "bg-green-100 text-green-800" :
                            backup.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                            backup.status === "failed" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {backup.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {backup.fileSize ? `${(backup.fileSize / 1024 / 1024).toFixed(2)} MB` : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {backup.createdAt ? new Date(backup.createdAt).toLocaleString("ar-SA") : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {backup.expiresAt ? new Date(backup.expiresAt).toLocaleDateString("ar-SA") : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "alerts" && (
              <div>
                <h3 className="text-lg font-medium mb-4">التنبيهات</h3>
                <div className="space-y-4">
                  {alerts?.map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-lg border-r-4 ${
                      alert.severity === "critical" ? "bg-red-50 border-red-500" :
                      alert.severity === "high" ? "bg-orange-50 border-orange-500" :
                      alert.severity === "medium" ? "bg-yellow-50 border-yellow-500" :
                      "bg-blue-50 border-blue-500"
                    }`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{alert.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              alert.severity === "critical" ? "bg-red-100 text-red-800" :
                              alert.severity === "high" ? "bg-orange-100 text-orange-800" :
                              alert.severity === "medium" ? "bg-yellow-100 text-yellow-800" :
                              "bg-blue-100 text-blue-800"
                            }`}>
                              {alert.severity}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              alert.status === "active" ? "bg-red-100 text-red-800" :
                              alert.status === "acknowledged" ? "bg-yellow-100 text-yellow-800" :
                              "bg-green-100 text-green-800"
                            }`}>
                              {alert.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {alert.createdAt ? new Date(alert.createdAt).toLocaleString("ar-SA") : ""}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {alert.status === "active" && (
                            <button
                              onClick={() => acknowledgeAlert.mutate({ id: alert.id, acknowledgedBy: 1 })}
                              className="text-yellow-600 hover:text-yellow-800 text-sm"
                            >
                              استلام
                            </button>
                          )}
                          {(alert.status === "active" || alert.status === "acknowledged") && (
                            <button
                              onClick={() => resolveAlert.mutate({ id: alert.id, resolvedBy: 1 })}
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              حل
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!alerts || alerts.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      لا توجد تنبيهات
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "logs" && (
              <div>
                <h3 className="text-lg font-medium mb-4">سجلات النظام</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المستوى</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المصدر</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الرسالة</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {logs?.map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {log.createdAt ? new Date(log.createdAt).toLocaleString("ar-SA") : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              log.logLevel === "critical" ? "bg-red-100 text-red-800" :
                              log.logLevel === "error" ? "bg-red-100 text-red-800" :
                              log.logLevel === "warning" ? "bg-yellow-100 text-yellow-800" :
                              log.logLevel === "info" ? "bg-blue-100 text-blue-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {log.logLevel}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{log.source || "-"}</td>
                          <td className="px-6 py-4 text-sm max-w-md truncate">{log.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div>
                <h3 className="text-lg font-medium mb-4">قوالب الإشعارات</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates?.map((template) => (
                    <div key={template.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{template.templateName}</h4>
                          <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${
                            template.channel === "email" ? "bg-blue-100 text-blue-800" :
                            template.channel === "sms" ? "bg-green-100 text-green-800" :
                            template.channel === "push" ? "bg-purple-100 text-purple-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {template.channel}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          template.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {template.isActive ? "نشط" : "غير نشط"}
                        </span>
                      </div>
                      {template.subject && (
                        <p className="text-sm text-gray-600 mt-2">الموضوع: {template.subject}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        الكود: {template.templateCode}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
