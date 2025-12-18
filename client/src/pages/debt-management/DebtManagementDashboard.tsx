import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { trpc } from "@/lib/trpc";

export default function DebtManagementDashboard() {
  const [activeTab, setActiveTab] = useState<"debts" | "plans" | "aging">("debts");

  // جلب البيانات
  const { data: debts, isLoading: loadingDebts } = trpc.debtManagement.getDebtRecords.useQuery({});
  const { data: plans, isLoading: loadingPlans } = trpc.debtManagement.getPaymentPlans.useQuery({});
  const { data: stats } = trpc.debtManagement.getDebtStats.useQuery();
  const aging = { current: 0, days30: 0, days60: 0, days90: 0, days120Plus: 0 };

  const tabs = [
    { id: "debts" as const, label: "الديون", count: debts?.length || 0 },
    { id: "plans" as const, label: "خطط السداد", count: plans?.length || 0 },
    { id: "aging" as const, label: "تقادم الديون", count: 0 },
  ];

  return (
    <DashboardLayout title="إدارة الديون">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الديون</h1>
            <p className="text-gray-600 mt-1">تتبع الديون وخطط السداد وتحليل التقادم</p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">إجمالي الديون</div>
              <div className="text-2xl font-bold text-red-600">{stats.totalDebts || 0}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">الديون المتأخرة</div>
              <div className="text-2xl font-bold text-orange-600">{stats.activeDebts || 0}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">خطط السداد النشطة</div>
              <div className="text-2xl font-bold text-blue-600">{stats.activePlans || 0}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">نسبة التحصيل</div>
              <div className="text-2xl font-bold text-green-600">{stats.pendingPenalties || 0}</div>
            </div>
          </div>
        )}

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
          {activeTab === "debts" && (
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">قائمة الديون</h2>
              {loadingDebts ? (
                <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
              ) : debts && debts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العميل</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ الأصلي</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ المتبقي</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الاستحقاق</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {debts.map((debt: any) => (
                        <tr key={debt.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            عميل #{debt.customerId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {debt.originalAmount} ر.س
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                            {debt.remainingAmount} ر.س
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(debt.dueDate).toLocaleDateString("ar-SA")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              debt.status === "paid" ? "bg-green-100 text-green-800" :
                              debt.status === "overdue" ? "bg-red-100 text-red-800" :
                              debt.status === "in_payment_plan" ? "bg-blue-100 text-blue-800" :
                              "bg-yellow-100 text-yellow-800"
                            }`}>
                              {debt.status === "paid" ? "مدفوع" :
                               debt.status === "overdue" ? "متأخر" :
                               debt.status === "in_payment_plan" ? "خطة سداد" : "معلق"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button className="text-blue-600 hover:text-blue-900 ml-3">خطة سداد</button>
                            <button className="text-green-600 hover:text-green-900">تحصيل</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">لا توجد ديون</div>
              )}
            </div>
          )}

          {activeTab === "plans" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">خطط السداد</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                  + إنشاء خطة
                </button>
              </div>
              {loadingPlans ? (
                <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
              ) : plans && plans.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الخطة</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العميل</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ الإجمالي</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الدفعات</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {plans.map((plan: any) => (
                        <tr key={plan.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {plan.planNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            عميل #{plan.customerId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {plan.totalAmount} ر.س
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {plan.paidPayments || 0} / {plan.numberOfPayments}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              plan.status === "active" ? "bg-green-100 text-green-800" :
                              plan.status === "completed" ? "bg-blue-100 text-blue-800" :
                              plan.status === "defaulted" ? "bg-red-100 text-red-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {plan.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">لا توجد خطط سداد</div>
              )}
            </div>
          )}

          {activeTab === "aging" && (
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">تقرير تقادم الديون</h2>
              {aging ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-sm text-green-600">0-30 يوم</div>
                    <div className="text-2xl font-bold text-green-700">{aging.current || 0} ر.س</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="text-sm text-yellow-600">31-60 يوم</div>
                    <div className="text-2xl font-bold text-yellow-700">{aging.days30 || 0} ر.س</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="text-sm text-orange-600">61-90 يوم</div>
                    <div className="text-2xl font-bold text-orange-700">{aging.days60 || 0} ر.س</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="text-sm text-red-600">91-120 يوم</div>
                    <div className="text-2xl font-bold text-red-700">{aging.days90 || 0} ر.س</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600">أكثر من 120 يوم</div>
                    <div className="text-2xl font-bold text-gray-700">{aging.days120Plus || 0} ر.س</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">جاري تحميل التقرير...</div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
