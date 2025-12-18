import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { trpc } from "@/lib/trpc";

export default function AdvancedCollectionDashboard() {
  const [activeTab, setActiveTab] = useState<"auto" | "wallets" | "installments">("auto");

  // جلب البيانات
  const { data: autoCollections, isLoading: loadingAuto } = trpc.advancedCollection.getAutoCollectionRules.useQuery();
  const { data: wallets, isLoading: loadingWallets } = trpc.advancedCollection.getCustomerWallets.useQuery({});
  const installments: any[] = [];
  const loadingInstallments = false;
  const { data: stats } = trpc.advancedCollection.getCollectionStats.useQuery();

  const tabs = [
    { id: "auto" as const, label: "التحصيل الآلي", count: autoCollections?.length || 0 },
    { id: "wallets" as const, label: "المحافظ الرقمية", count: wallets?.length || 0 },
    { id: "installments" as const, label: "خطط التقسيط", count: installments?.length || 0 },
  ];

  return (
    <DashboardLayout title="التحصيل المتقدم">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">التحصيل المتقدم</h1>
            <p className="text-gray-600 mt-1">إدارة التحصيل الآلي والمحافظ الرقمية وخطط التقسيط</p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">إجمالي المحصل</div>
              <div className="text-2xl font-bold text-green-600">{stats.totalWallets || 0}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">المحافظ النشطة</div>
              <div className="text-2xl font-bold text-blue-600">{stats.activeWallets || 0}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">خطط التقسيط</div>
              <div className="text-2xl font-bold text-purple-600">{stats.activeWallets || 0}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">قواعد التحصيل</div>
              <div className="text-2xl font-bold text-orange-600">{stats.activeRules || 0}</div>
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
                <span className="mr-2 bg-gray-100 text-gray-600 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === "auto" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">قواعد التحصيل الآلي</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                  + إضافة قاعدة
                </button>
              </div>
              {loadingAuto ? (
                <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
              ) : autoCollections && autoCollections.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم القاعدة</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التكرار</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {autoCollections.map((rule: any) => (
                        <tr key={rule.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {rule.ruleName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {rule.collectionType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {rule.frequency}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              rule.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}>
                              {rule.isActive ? "نشط" : "غير نشط"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">لا توجد قواعد تحصيل</div>
              )}
            </div>
          )}

          {activeTab === "wallets" && (
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">المحافظ الرقمية</h2>
              {loadingWallets ? (
                <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
              ) : wallets && wallets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {wallets.map((wallet: any) => (
                    <div key={wallet.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">عميل #{wallet.customerId}</div>
                          <div className="text-sm text-gray-500">{wallet.walletType}</div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          wallet.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {wallet.status}
                        </span>
                      </div>
                      <div className="mt-4">
                        <div className="text-2xl font-bold text-blue-600">{wallet.balance} ر.س</div>
                        <div className="text-sm text-gray-500">الرصيد الحالي</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">لا توجد محافظ</div>
              )}
            </div>
          )}

          {activeTab === "installments" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">خطط التقسيط</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                  + إنشاء خطة
                </button>
              </div>
              {loadingInstallments ? (
                <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
              ) : installments && installments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الخطة</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العميل</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ الإجمالي</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الأقساط</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {installments.map((plan: any) => (
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
                            {plan.paidInstallments || 0} / {plan.numberOfInstallments}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              plan.status === "active" ? "bg-green-100 text-green-800" :
                              plan.status === "completed" ? "bg-blue-100 text-blue-800" :
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
                <div className="text-center py-8 text-gray-500">لا توجد خطط تقسيط</div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
