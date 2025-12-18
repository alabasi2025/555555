import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function InventoryCountsList() {
  const [activeTab, setActiveTab] = useState<"counts" | "adjustments">("counts");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  
  const { data: counts, isLoading, refetch: refetchCounts } = trpc.inventoryCounts.getAll.useQuery({
    status: statusFilter as any || undefined,
    countType: typeFilter as any || undefined,
  });
  
  const { data: adjustments, refetch: refetchAdjustments } = trpc.inventoryCounts.getAdjustments.useQuery();
  const { data: stats } = trpc.inventoryCounts.getStats.useQuery();

  const cancelMutation = trpc.inventoryCounts.cancel.useMutation({
    onSuccess: () => refetchCounts(),
  });

  const statusLabels: Record<string, string> = {
    draft: "مسودة",
    in_progress: "قيد التنفيذ",
    pending_approval: "بانتظار الموافقة",
    approved: "معتمد",
    cancelled: "ملغي",
  };

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    pending_approval: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const countTypeLabels: Record<string, string> = {
    full: "جرد كامل",
    partial: "جرد جزئي",
    cycle: "جرد دوري",
    spot: "جرد عشوائي",
  };

  const adjustmentTypeLabels: Record<string, string> = {
    count_variance: "فرق جرد",
    damage: "تالف",
    expiry: "منتهي الصلاحية",
    theft: "سرقة",
    other: "أخرى",
  };

  return (
    <DashboardLayout title="الجرد وتسويات المخزون">
      <div className="space-y-6">
        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500">إجمالي عمليات الجرد</h3>
            <p className="text-2xl font-bold text-blue-600">{stats?.totalCounts || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500">بانتظار الموافقة</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats?.pendingCounts || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500">إجمالي التسويات</h3>
            <p className="text-2xl font-bold text-purple-600">{stats?.totalAdjustments || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500">قيمة التسويات</h3>
            <p className="text-2xl font-bold text-orange-600">
              {parseFloat(String(stats?.totalAdjustmentValue || 0)).toLocaleString()} ر.س
            </p>
          </div>
        </div>

        {/* التبويبات */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("counts")}
                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === "counts"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                عمليات الجرد ({counts?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("adjustments")}
                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === "adjustments"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                التسويات ({adjustments?.length || 0})
              </button>
            </nav>
          </div>

          <div className="p-4">
            {/* عمليات الجرد */}
            {activeTab === "counts" && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex gap-4 flex-wrap">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border rounded-lg px-4 py-2"
                    >
                      <option value="">جميع الحالات</option>
                      <option value="draft">مسودة</option>
                      <option value="in_progress">قيد التنفيذ</option>
                      <option value="pending_approval">بانتظار الموافقة</option>
                      <option value="approved">معتمد</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="border rounded-lg px-4 py-2"
                    >
                      <option value="">جميع الأنواع</option>
                      <option value="full">جرد كامل</option>
                      <option value="partial">جرد جزئي</option>
                      <option value="cycle">جرد دوري</option>
                      <option value="spot">جرد عشوائي</option>
                    </select>
                  </div>
                  <Link
                    to="/inventory-counts/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    + بدء جرد جديد
                  </Link>
                </div>

                {isLoading ? (
                  <div className="p-8 text-center">جاري التحميل...</div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الجرد</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجمالي الأصناف</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {counts?.map((count) => (
                        <tr key={count.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {count.countNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {countTypeLabels[count.countType] || count.countType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(count.countDate).toLocaleDateString("ar-SA")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            0
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${statusColors[count.status]}`}>
                              {statusLabels[count.status] || count.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              <Link
                                to={`/inventory-counts/${count.id}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {count.status === "in_progress" ? "متابعة" : "عرض"}
                              </Link>
                              {count.status === "draft" && (
                                <button
                                  onClick={() => {
                                    if (confirm("هل أنت متأكد من إلغاء هذا الجرد؟")) {
                                      cancelMutation.mutate({ id: count.id });
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  إلغاء
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* التسويات */}
            {activeTab === "adjustments" && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Link
                    to="/inventory-counts/adjustments/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    + إنشاء تسوية يدوية
                  </Link>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم التسوية</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">القيمة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {adjustments?.map((adj) => (
                      <tr key={adj.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {adj.adjustmentNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {adjustmentTypeLabels[adj.adjustmentType] || adj.adjustmentType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(adj.adjustmentDate).toLocaleDateString("ar-SA")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {parseFloat(adj.totalValue || "0").toLocaleString()} ر.س
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${statusColors[adj.status]}`}>
                            {statusLabels[adj.status] || adj.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            to={`/inventory-counts/adjustments/${adj.id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            عرض
                          </Link>
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
