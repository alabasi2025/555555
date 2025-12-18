import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { trpc } from "@/lib/trpc";

export default function AdvancedReportsDashboard() {
  const [activeTab, setActiveTab] = useState<"kpi" | "analytics" | "comparison">("kpi");

  // جلب البيانات
  const { data: kpis, isLoading: loadingKpis } = trpc.advancedReports.getCustomReports.useQuery({});
  const analytics = { totalRevenue: 0, totalExpenses: 0, netProfit: 0, profitMargin: 0, revenueByCategory: {} };
  const loadingAnalytics = false;

  const tabs = [
    { id: "kpi" as const, label: "مؤشرات الأداء", count: kpis?.length || 0 },
    { id: "analytics" as const, label: "التحليلات المالية", count: 0 },
    { id: "comparison" as const, label: "المقارنات", count: 0 },
  ];

  return (
    <DashboardLayout title="التقارير المتقدمة">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">التقارير المالية المتقدمة</h1>
            <p className="text-gray-600 mt-1">مؤشرات الأداء والتحليلات المالية والمقارنات</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            تصدير التقرير
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 space-x-reverse">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === "kpi" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">مؤشرات الأداء الرئيسية (KPIs)</h2>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
                  + إضافة مؤشر
                </button>
              </div>
              {loadingKpis ? (
                <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
              ) : kpis && kpis.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {kpis.map((kpi: any) => (
                    <div key={kpi.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{kpi.kpiName}</div>
                          <div className="text-sm text-gray-500">{kpi.category}</div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          kpi.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {kpi.isActive ? "نشط" : "غير نشط"}
                        </span>
                      </div>
                      <div className="mt-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {kpi.currentValue || 0} {kpi.unit}
                        </div>
                        <div className="text-sm text-gray-500">
                          الهدف: {kpi.targetValue || 0} {kpi.unit}
                        </div>
                        {kpi.targetValue && kpi.currentValue && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${Math.min((kpi.currentValue / kpi.targetValue) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">لا توجد مؤشرات أداء</div>
              )}
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">التحليلات المالية</h2>
              {loadingAnalytics ? (
                <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
              ) : analytics ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-green-600">إجمالي الإيرادات</div>
                      <div className="text-2xl font-bold text-green-700">{analytics.totalRevenue || 0} ر.س</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-sm text-red-600">إجمالي المصروفات</div>
                      <div className="text-2xl font-bold text-red-700">{analytics.totalExpenses || 0} ر.س</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-blue-600">صافي الربح</div>
                      <div className="text-2xl font-bold text-blue-700">{analytics.netProfit || 0} ر.س</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-sm text-purple-600">هامش الربح</div>
                      <div className="text-2xl font-bold text-purple-700">{analytics.profitMargin || 0}%</div>
                    </div>
                  </div>

                  {/* Revenue by Category */}
                  {analytics.revenueByCategory && (
                    <div>
                      <h3 className="font-medium mb-3">الإيرادات حسب الفئة</h3>
                      <div className="space-y-2">
                        {Object.entries(analytics.revenueByCategory).map(([category, value]: [string, any]) => (
                          <div key={category} className="flex items-center">
                            <div className="w-32 text-sm text-gray-600">{category}</div>
                            <div className="flex-1 bg-gray-200 rounded-full h-4 mx-4">
                              <div 
                                className="bg-blue-600 h-4 rounded-full" 
                                style={{ width: `${(value / analytics.totalRevenue) * 100}%` }}
                              ></div>
                            </div>
                            <div className="w-24 text-sm text-right">{value} ر.س</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">لا توجد بيانات</div>
              )}
            </div>
          )}

          {activeTab === "comparison" && (
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">المقارنات المالية</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Year over Year */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-4">مقارنة سنوية</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">إيرادات السنة الحالية</span>
                      <span className="font-bold text-green-600">0 ر.س</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">إيرادات السنة السابقة</span>
                      <span className="font-bold text-gray-600">0 ر.س</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="text-gray-600">نسبة التغيير</span>
                      <span className="font-bold text-blue-600">0%</span>
                    </div>
                  </div>
                </div>

                {/* Quarter over Quarter */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-4">مقارنة ربع سنوية</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">الربع الحالي</span>
                      <span className="font-bold text-green-600">0 ر.س</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">الربع السابق</span>
                      <span className="font-bold text-gray-600">0 ر.س</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="text-gray-600">نسبة التغيير</span>
                      <span className="font-bold text-blue-600">0%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
