import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function WarehousesList() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  
  const { data: warehouses, isLoading, refetch } = trpc.warehouses.getAll.useQuery({
    search: search || undefined,
    type: typeFilter as any || undefined,
  });
  
  const { data: stats } = trpc.warehouses.getStats.useQuery();
  
  const deleteMutation = trpc.warehouses.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا المستودع؟")) {
      deleteMutation.mutate({ id });
    }
  };

  const warehouseTypes: Record<string, string> = {
    main: "رئيسي",
    branch: "فرعي",
    transit: "عبور",
    virtual: "افتراضي",
  };

  return (
    <DashboardLayout title="إدارة المستودعات">
      <div className="space-y-6">
        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500">إجمالي المستودعات</h3>
            <p className="text-2xl font-bold text-blue-600">{stats?.totalWarehouses || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500">المستودعات النشطة</h3>
            <p className="text-2xl font-bold text-green-600">{stats?.activeWarehouses || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500">تحويلات معلقة</h3>
            <p className="text-2xl font-bold text-orange-600">{stats?.pendingTransfers || 0}</p>
          </div>
        </div>

        {/* شريط البحث والفلترة */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 flex-wrap">
              <input
                type="text"
                placeholder="بحث..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded-lg px-4 py-2 w-64"
              />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border rounded-lg px-4 py-2"
              >
                <option value="">جميع الأنواع</option>
                <option value="main">رئيسي</option>
                <option value="branch">فرعي</option>
                <option value="transit">عبور</option>
                <option value="virtual">افتراضي</option>
              </select>
            </div>
            <Link
              to="/warehouses/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + إضافة مستودع
            </Link>
          </div>
        </div>

        {/* جدول المستودعات */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">جاري التحميل...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكود</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المدينة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {warehouses?.map((warehouse) => (
                  <tr key={warehouse.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {warehouse.warehouseCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {warehouse.warehouseName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {warehouseTypes[warehouse.warehouseType] || warehouse.warehouseType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {warehouse.city || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        warehouse.isActive 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {warehouse.isActive ? "نشط" : "غير نشط"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <Link
                          to={`/warehouses/${warehouse.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          عرض
                        </Link>
                        <Link
                          to={`/warehouses/${warehouse.id}/edit`}
                          className="text-green-600 hover:text-green-800"
                        >
                          تعديل
                        </Link>
                        <button
                          onClick={() => handleDelete(warehouse.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
