import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { trpc } from "@/lib/trpc";

export default function SecurityDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "audits" | "assessments" | "findings" | "policies" | "privacy">("overview");
  
  const { data: dashboard, isLoading } = trpc.security.getSecurityDashboard.useQuery();
  const { data: assessments } = trpc.security.getSecurityAssessments.useQuery();
  const { data: findings } = trpc.security.getSecurityFindings.useQuery({});
  const { data: policies } = trpc.security.getSecurityPolicies.useQuery();
  const { data: privacyRequests } = trpc.security.getPrivacyRequests.useQuery();
  
  const utils = trpc.useUtils();
  
  const createAssessment = trpc.security.createSecurityAssessment.useMutation({
    onSuccess: () => {
      utils.security.getSecurityAssessments.invalidate();
      utils.security.getSecurityDashboard.invalidate();
    },
  });
  
  const updateFinding = trpc.security.updateSecurityFinding.useMutation({
    onSuccess: () => {
      utils.security.getSecurityFindings.invalidate();
      utils.security.getSecurityDashboard.invalidate();
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout title="الأمان والتدقيق">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="الأمان والتدقيق">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-500">التقييمات الأمنية</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard?.totalAssessments || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-500">الثغرات المفتوحة</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard?.openFindings || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-500">السياسات الأمنية</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard?.totalPolicies || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-500">طلبات الخصوصية</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard?.pendingPrivacyRequests || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {[
                { id: "overview", label: "نظرة عامة" },
                { id: "audits", label: "سجلات التدقيق" },
                { id: "assessments", label: "التقييمات" },
                { id: "findings", label: "الثغرات" },
                { id: "policies", label: "السياسات" },
                { id: "privacy", label: "الخصوصية" },
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
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recent Audit Logs */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">آخر سجلات التدقيق</h3>
                    <div className="space-y-3">
                      {dashboard?.recentAuditLogs?.slice(0, 5).map((log: any) => (
                        <div key={log.id} className="flex items-center justify-between bg-white p-3 rounded">
                          <div>
                            <p className="font-medium">{log.action}</p>
                            <p className="text-sm text-gray-500">{log.entityType} - {log.userName || "مجهول"}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            log.status === "success" ? "bg-green-100 text-green-800" :
                            log.status === "failed" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {log.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Security Score */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">مؤشر الأمان</h3>
                    <div className="flex items-center justify-center">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#e5e7eb"
                            strokeWidth="12"
                            fill="none"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#10b981"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={`${(85 / 100) * 352} 352`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-bold text-gray-900">85%</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-center text-gray-500 mt-4">مستوى الأمان جيد</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "audits" && (
              <div>
                <h3 className="text-lg font-medium mb-4">سجلات التدقيق</h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المستخدم</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراء</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكيان</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">IP</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboard?.recentAuditLogs?.map((log: any) => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(log.createdAt).toLocaleString("ar-SA")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{log.userName || "مجهول"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{log.action}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{log.entityType}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            log.status === "success" ? "bg-green-100 text-green-800" :
                            log.status === "failed" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{log.ipAddress || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "assessments" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">التقييمات الأمنية</h3>
                  <button
                    onClick={() => createAssessment.mutate({ assessmentType: "vulnerability" })}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    تقييم جديد
                  </button>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكود</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الثغرات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assessments?.map((assessment) => (
                      <tr key={assessment.id}>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{assessment.assessmentCode}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{assessment.assessmentType}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            assessment.status === "completed" ? "bg-green-100 text-green-800" :
                            assessment.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {assessment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-red-600">{assessment.criticalFindings || 0} حرج</span>
                          <span className="text-orange-600 mr-2">{assessment.highFindings || 0} عالي</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "findings" && (
              <div>
                <h3 className="text-lg font-medium mb-4">الثغرات الأمنية</h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكود</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العنوان</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الخطورة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {findings?.map((finding) => (
                      <tr key={finding.id}>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{finding.findingCode}</td>
                        <td className="px-6 py-4">{finding.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            finding.severity === "critical" ? "bg-red-100 text-red-800" :
                            finding.severity === "high" ? "bg-orange-100 text-orange-800" :
                            finding.severity === "medium" ? "bg-yellow-100 text-yellow-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {finding.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            finding.status === "resolved" ? "bg-green-100 text-green-800" :
                            finding.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {finding.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {finding.status === "open" && (
                            <button
                              onClick={() => updateFinding.mutate({ id: finding.id, status: "in_progress" })}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              بدء المعالجة
                            </button>
                          )}
                          {finding.status === "in_progress" && (
                            <button
                              onClick={() => updateFinding.mutate({ id: finding.id, status: "resolved" })}
                              className="text-green-600 hover:text-green-800"
                            >
                              تم الحل
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "policies" && (
              <div>
                <h3 className="text-lg font-medium mb-4">السياسات الأمنية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {policies?.map((policy) => (
                    <div key={policy.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{policy.policyName}</h4>
                          <p className="text-sm text-gray-500 mt-1">{policy.category}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          policy.status === "active" ? "bg-green-100 text-green-800" :
                          policy.status === "draft" ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {policy.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{policy.description}</p>
                      <div className="mt-3 text-xs text-gray-400">
                        الإصدار: {policy.version}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div>
                <h3 className="text-lg font-medium mb-4">طلبات الخصوصية</h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الطلب</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">مقدم الطلب</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الاستحقاق</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {privacyRequests?.map((request) => (
                      <tr key={request.id}>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{request.requestNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{request.requestType}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{request.requesterName || request.requesterEmail}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            request.status === "completed" ? "bg-green-100 text-green-800" :
                            request.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                            request.status === "rejected" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {request.dueDate ? new Date(request.dueDate).toLocaleDateString("ar-SA") : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
