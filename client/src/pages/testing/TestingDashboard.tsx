import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { trpc } from "@/lib/trpc";

export default function TestingDashboard() {
  const [activeTab, setActiveTab] = useState<"suites" | "cases" | "runs" | "coverage">("suites");
  const [showSuiteForm, setShowSuiteForm] = useState(false);
  const [showCaseForm, setShowCaseForm] = useState(false);
  
  const { data: dashboard, isLoading } = trpc.testing.getTestingDashboard.useQuery();
  const { data: suites } = trpc.testing.getTestSuites.useQuery();
  const { data: testCases } = trpc.testing.getTestCases.useQuery({});
  const { data: runs } = trpc.testing.getTestRuns.useQuery({});
  
  const utils = trpc.useUtils();
  
  const createSuite = trpc.testing.createTestSuite.useMutation({
    onSuccess: () => {
      utils.testing.getTestSuites.invalidate();
      utils.testing.getTestingDashboard.invalidate();
      setShowSuiteForm(false);
    },
  });
  
  const createRun = trpc.testing.createTestRun.useMutation({
    onSuccess: () => {
      utils.testing.getTestRuns.invalidate();
      utils.testing.getTestingDashboard.invalidate();
    },
  });
  
  const deleteSuite = trpc.testing.deleteTestSuite.useMutation({
    onSuccess: () => {
      utils.testing.getTestSuites.invalidate();
      utils.testing.getTestingDashboard.invalidate();
    },
  });

  const [newSuite, setNewSuite] = useState({
    suiteName: "",
    suiteType: "unit" as const,
    description: "",
    module: "",
  });

  if (isLoading) {
    return (
      <DashboardLayout title="نظام الاختبارات">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="نظام الاختبارات">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-500">مجموعات الاختبار</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard?.totalSuites || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-500">حالات الاختبار</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard?.totalCases || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-500">عمليات التشغيل</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard?.totalRuns || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-500">معدل النجاح</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard?.passRate || 0}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: "suites", label: "مجموعات الاختبار" },
                { id: "cases", label: "حالات الاختبار" },
                { id: "runs", label: "عمليات التشغيل" },
                { id: "coverage", label: "التغطية" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
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
            {activeTab === "suites" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">مجموعات الاختبار</h3>
                  <button
                    onClick={() => setShowSuiteForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    إضافة مجموعة
                  </button>
                </div>
                
                {showSuiteForm && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="اسم المجموعة"
                        value={newSuite.suiteName}
                        onChange={(e) => setNewSuite({ ...newSuite, suiteName: e.target.value })}
                        className="border rounded-lg px-3 py-2"
                      />
                      <select
                        value={newSuite.suiteType}
                        onChange={(e) => setNewSuite({ ...newSuite, suiteType: e.target.value as any })}
                        className="border rounded-lg px-3 py-2"
                      >
                        <option value="unit">اختبار الوحدة</option>
                        <option value="integration">اختبار التكامل</option>
                        <option value="e2e">اختبار E2E</option>
                        <option value="performance">اختبار الأداء</option>
                        <option value="security">اختبار الأمان</option>
                      </select>
                      <input
                        type="text"
                        placeholder="الوصف"
                        value={newSuite.description}
                        onChange={(e) => setNewSuite({ ...newSuite, description: e.target.value })}
                        className="border rounded-lg px-3 py-2"
                      />
                      <input
                        type="text"
                        placeholder="الوحدة/الموديول"
                        value={newSuite.module}
                        onChange={(e) => setNewSuite({ ...newSuite, module: e.target.value })}
                        className="border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => createSuite.mutate(newSuite)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        حفظ
                      </button>
                      <button
                        onClick={() => setShowSuiteForm(false)}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}
                
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوحدة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {suites?.map((suite) => (
                      <tr key={suite.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{suite.suiteName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            suite.suiteType === "unit" ? "bg-blue-100 text-blue-800" :
                            suite.suiteType === "integration" ? "bg-green-100 text-green-800" :
                            suite.suiteType === "e2e" ? "bg-purple-100 text-purple-800" :
                            suite.suiteType === "performance" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {suite.suiteType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{suite.module || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${suite.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                            {suite.isActive ? "نشط" : "غير نشط"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => createRun.mutate({ suiteId: suite.id })}
                            className="text-blue-600 hover:text-blue-800 ml-2"
                          >
                            تشغيل
                          </button>
                          <button
                            onClick={() => deleteSuite.mutate({ id: suite.id })}
                            className="text-red-600 hover:text-red-800"
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "runs" && (
              <div>
                <h3 className="text-lg font-medium mb-4">عمليات التشغيل الأخيرة</h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم التشغيل</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">البيئة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النتائج</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {runs?.map((run) => (
                      <tr key={run.id}>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{run.runNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{run.runType}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{run.environment}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            run.status === "completed" ? "bg-green-100 text-green-800" :
                            run.status === "running" ? "bg-blue-100 text-blue-800" :
                            run.status === "failed" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {run.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-green-600">{run.passedTests || 0} ✓</span>
                          <span className="text-red-600 mr-2">{run.failedTests || 0} ✗</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "cases" && (
              <div>
                <h3 className="text-lg font-medium mb-4">حالات الاختبار</h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الأولوية</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">آلي</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {testCases?.map((tc) => (
                      <tr key={tc.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{tc.testName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            tc.priority === "critical" ? "bg-red-100 text-red-800" :
                            tc.priority === "high" ? "bg-orange-100 text-orange-800" :
                            tc.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {tc.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{tc.isAutomated ? "نعم" : "لا"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${tc.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                            {tc.isActive ? "نشط" : "غير نشط"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "coverage" && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">تقارير التغطية</h3>
                <p className="text-gray-500">قم بتشغيل الاختبارات لعرض تقارير التغطية</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
