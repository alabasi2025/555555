import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { trpc } from "@/lib/trpc";

export default function AdvancedInventoryDashboard() {
  const [activeTab, setActiveTab] = useState<"lots" | "alerts" | "forecasts" | "movements">("lots");

  // جلب البيانات
  const { data: lots, isLoading: loadingLots } = trpc.advancedInventory.getInventoryLots.useQuery({});
  const { data: alerts, isLoading: loadingAlerts } = trpc.advancedInventory.getInventoryAlerts.useQuery({ isResolved: false });
  const { data: forecasts, isLoading: loadingForecasts } = trpc.advancedInventory.getInventoryForecasts.useQuery({});
  const { data: movements, isLoading: loadingMovements } = trpc.advancedInventory.getInventoryMovements.useQuery({});
  const { data: analytics } = trpc.advancedInventory.getInventoryAnalytics.useQuery({});

  const tabs = [
    { id: "lots" as const, label: "الدفعات", count: lots?.length || 0 },
    { id: "alerts" as const, label: "التنبيهات", count: alerts?.length || 0 },
    { id: "forecasts" as const, label: "التنبؤات", count: forecasts?.length || 0 },
    { id: "movements" as const, label: "الحركات", count: movements?.length || 0 },
  ];

  return (
    <DashboardLayout title="المخزون المتقدم">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">المخزون المتقدم</h1>
            <p className="text-gray-600 mt-1">إدارة الدفعات والتنبيهات والتنبؤات وحركات المخزون</p>
          </div>
        </div>

        {/* Stats Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">إجمالي الأصناف</div>
              <div className="text-xl font-bold text-blue-600">{analytics.totalItems || 0}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">الموردين</div>
              <div className="text-xl font-bold text-green-600">{analytics.totalSuppliers || 0}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">التنبيهات النشطة</div>
              <div className="text-xl font-bold text-orange-600">{analytics.activeAlerts || 0}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">تنبيهات حرجة</div>
              <div className="text-xl font-bold text-red-600">{analytics.criticalAlerts || 0}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">دفعات نشطة</div>
              <div className="text-xl font-bold text-purple-600">{analytics.activeLots || 0}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">دفعات منتهية</div>
              <div className="text-xl font-bold text-gray-600">{analytics.expiredLots || 0}</div>
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
          {activeTab === "lots" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">دفعات المخزون</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                  + إضافة دفعة
                </button>
              </div>
              {loadingLots ? (
                <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
              ) : lots && lots.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الدفعة</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الصنف</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكمية</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المتاح</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الانتهاء</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {lots.map((lot: any) => (
                        <tr key={lot.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {lot.lotNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            صنف #{lot.itemId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {lot.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {lot.availableQuantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {lot.expiryDate ? new Date(lot.expiryDate).toLocaleDateString("ar-SA") : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              lot.status === "available" ? "bg-green-100 text-green-800" :
                              lot.status === "expired" ? "bg-red-100 text-red-800" :
                              lot.status === "quarantine" ? "bg-yellow-100 text-yellow-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {lot.status === "available" ? "متاح" :
                               lot.status === "expired" ? "منتهي" :
                               lot.status === "quarantine" ? "حجر" : lot.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">لا توجد دفعات</div>
              )}
            </div>
          )}

          {activeTab === "alerts" && (
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">تنبيهات المخزون</h2>
              {loadingAlerts ? (
                <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
              ) : alerts && alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert: any) => (
                    <div key={alert.id} className={`border-r-4 p-4 rounded-lg ${
                      alert.severity === "critical" ? "border-red-500 bg-red-50" :
                      alert.severity === "warning" ? "border-yellow-500 bg-yellow-50" :
                      "border-blue-500 bg-blue-50"
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{alert.message}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            نوع التنبيه: {alert.alertType} | صنف #{alert.itemId}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            alert.severity === "critical" ? "bg-red-100 text-red-800" :
                            alert.severity === "warning" ? "bg-yellow-100 text-yellow-800" :
                            "bg-blue-100 text-blue-800"
                          }`}>
                            {alert.severity === "critical" ? "حرج" :
                             alert.severity === "warning" ? "تحذير" : "معلومات"}
                          </span>
                          <button className="text-blue-600 hover:text-blue-900 text-sm">معالجة</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">لا توجد تنبيهات نشطة</div>
              )}
            </div>
          )}

          {activeTab === "forecasts" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">تنبؤات المخزون</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                  + إنشاء تنبؤ
                </button>
              </div>
              {loadingForecasts ? (
                <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
              ) : forecasts && forecasts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الصنف</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نوع التنبؤ</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكمية المتوقعة</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">مستوى الثقة</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {forecasts.map((forecast: any) => (
                        <tr key={forecast.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            صنف #{forecast.itemId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {forecast.forecastType === "demand" ? "طلب" :
                             forecast.forecastType === "supply" ? "توريد" : "مستوى المخزون"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(forecast.forecastDate).toLocaleDateString("ar-SA")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {forecast.forecastQuantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {forecast.confidenceLevel ? `${forecast.confidenceLevel}%` : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">لا توجد تنبؤات</div>
              )}
            </div>
          )}

          {activeTab === "movements" && (
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">حركات المخزون</h2>
              {loadingMovements ? (
                <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
              ) : movements && movements.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الحركة</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الصنف</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكمية</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {movements.map((movement: any) => (
                        <tr key={movement.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {movement.movementNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            صنف #{movement.itemId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              movement.movementType === "in" ? "bg-green-100 text-green-800" :
                              movement.movementType === "out" ? "bg-red-100 text-red-800" :
                              "bg-blue-100 text-blue-800"
                            }`}>
                              {movement.movementType === "in" ? "وارد" :
                               movement.movementType === "out" ? "صادر" :
                               movement.movementType === "transfer" ? "تحويل" : "تسوية"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {movement.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(movement.movementDate).toLocaleDateString("ar-SA")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">لا توجد حركات</div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
