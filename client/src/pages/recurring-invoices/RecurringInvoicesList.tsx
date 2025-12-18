import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function RecurringInvoicesList() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  const { data: invoices, isLoading, refetch } = trpc.recurringInvoices.getAll.useQuery({
    status: statusFilter as any || undefined,
  });
  
  const { data: stats } = trpc.recurringInvoices.getStats.useQuery();
  const { data: dueInvoices } = trpc.recurringInvoices.getDueForGeneration.useQuery();
  
  const generateMutation = trpc.recurringInvoices.generateDueInvoices.useMutation({
    onSuccess: (data) => {
      alert(`تم توليد ${data.count} فاتورة بنجاح`);
      refetch();
    },
  });

  const toggleMutation = trpc.recurringInvoices.toggleStatus.useMutation({
    onSuccess: () => refetch(),
  });

  const frequencyLabels: Record<string, string> = {
    daily: "يومي",
    weekly: "أسبوعي",
    biweekly: "نصف شهري",
    monthly: "شهري",
    quarterly: "ربع سنوي",
    yearly: "سنوي",
  };

  const statusLabels: Record<string, string> = {
    active: "نشط",
    paused: "متوقف",
    completed: "مكتمل",
    cancelled: "ملغي",
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    paused: "bg-yellow-100 text-yellow-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <DashboardLayout title="الفواتير الدورية">
      <div className="space-y-6">
        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500">إجمالي الفواتير الدورية</h3>
            <p className="text-2xl font-bold text-blue-600">{stats?.total || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500">الفواتير النشطة</h3>
            <p className="text-2xl font-bold text-green-600">{stats?.active || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500">الفواتير المولدة</h3>
            <p className="text-2xl font-bold text-purple-600">{stats?.totalGenerated || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500">مستحقة للتوليد</h3>
            <p className="text-2xl font-bold text-orange-600">{dueInvoices?.length || 0}</p>
          </div>
        </div>

        {/* شريط الأدوات */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-lg px-4 py-2"
              >
                <option value="">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="paused">متوقف</option>
                <option value="completed">مكتمل</option>
                <option value="cancelled">ملغي</option>
              </select>
              {(dueInvoices?.length || 0) > 0 && (
                <button
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {generateMutation.isPending ? "جاري التوليد..." : `توليد ${dueInvoices?.length} فاتورة`}
                </button>
              )}
            </div>
            <Link
              to="/recurring-invoices/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + إضافة فاتورة دورية
            </Link>
          </div>
        </div>

        {/* جدول الفواتير الدورية */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">جاري التحميل...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم القالب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التكرار</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفاتورة التالية</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفواتير المولدة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices?.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.templateName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {frequencyLabels[invoice.frequency] || invoice.frequency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {parseFloat(invoice.totalAmount || "0").toLocaleString()} ر.س
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.nextInvoiceDate ? new Date(invoice.nextInvoiceDate).toLocaleDateString("ar-SA") : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.invoicesGenerated || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[invoice.status]}`}>
                        {statusLabels[invoice.status] || invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <Link
                          to={`/recurring-invoices/${invoice.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          عرض
                        </Link>
                        {invoice.status === "active" ? (
                          <button
                            onClick={() => toggleMutation.mutate({ id: invoice.id, status: "paused" })}
                            className="text-yellow-600 hover:text-yellow-800"
                          >
                            إيقاف
                          </button>
                        ) : invoice.status === "paused" ? (
                          <button
                            onClick={() => toggleMutation.mutate({ id: invoice.id, status: "active" })}
                            className="text-green-600 hover:text-green-800"
                          >
                            تفعيل
                          </button>
                        ) : null}
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
