import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function TicketsList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  
  const { data: tickets, isLoading, refetch } = trpc.tickets.getAll.useQuery({
    search: search || undefined,
    status: statusFilter as any || undefined,
    category: categoryFilter as any || undefined,
    priority: priorityFilter as any || undefined,
  });
  
  const { data: stats } = trpc.tickets.getStats.useQuery();
  const { data: unassigned } = trpc.tickets.getUnassigned.useQuery();

  const deleteMutation = trpc.tickets.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const statusLabels: Record<string, string> = {
    open: "مفتوحة",
    in_progress: "قيد المعالجة",
    pending_customer: "بانتظار العميل",
    resolved: "تم الحل",
    closed: "مغلقة",
    cancelled: "ملغية",
  };

  const statusColors: Record<string, string> = {
    open: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    pending_customer: "bg-purple-100 text-purple-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const categoryLabels: Record<string, string> = {
    billing: "الفوترة",
    technical: "تقني",
    service: "خدمة",
    complaint: "شكوى",
    inquiry: "استفسار",
    other: "أخرى",
  };

  const priorityLabels: Record<string, string> = {
    low: "منخفضة",
    medium: "متوسطة",
    high: "عالية",
    urgent: "عاجلة",
  };

  const priorityColors: Record<string, string> = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-blue-100 text-blue-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };

  return (
    <DashboardLayout title="نظام التذاكر">
      <div className="space-y-6">
        {/* الإحصائيات */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xs text-gray-500">الإجمالي</h3>
            <p className="text-xl font-bold text-blue-600">{stats?.total || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xs text-gray-500">مفتوحة</h3>
            <p className="text-xl font-bold text-blue-600">{stats?.open || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xs text-gray-500">قيد المعالجة</h3>
            <p className="text-xl font-bold text-yellow-600">{stats?.inProgress || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xs text-gray-500">تم الحل</h3>
            <p className="text-xl font-bold text-green-600">{stats?.resolved || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xs text-gray-500">مغلقة</h3>
            <p className="text-xl font-bold text-gray-600">{stats?.closed || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xs text-gray-500">عاجلة</h3>
            <p className="text-xl font-bold text-red-600">{stats?.urgent || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xs text-gray-500">متأخرة</h3>
            <p className="text-xl font-bold text-red-600">{stats?.overdue || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xs text-gray-500">التقييم</h3>
            <p className="text-xl font-bold text-purple-600">
              {stats?.avgRating ? parseFloat(String(stats.avgRating)).toFixed(1) : "-"} ⭐
            </p>
          </div>
        </div>

        {/* تنبيه التذاكر غير المعينة */}
        {(unassigned?.length || 0) > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-yellow-600">⚠️</span>
                <span className="text-yellow-800 font-medium">
                  يوجد {unassigned?.length} تذكرة غير معينة
                </span>
              </div>
              <Link
                to="/tickets?filter=unassigned"
                className="text-yellow-600 hover:text-yellow-800 text-sm"
              >
                عرض الكل
              </Link>
            </div>
          </div>
        )}

        {/* شريط البحث والفلترة */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 flex-wrap">
              <input
                type="text"
                placeholder="بحث برقم التذكرة أو الموضوع..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded-lg px-4 py-2 w-64"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-lg px-4 py-2"
              >
                <option value="">جميع الحالات</option>
                <option value="open">مفتوحة</option>
                <option value="in_progress">قيد المعالجة</option>
                <option value="pending_customer">بانتظار العميل</option>
                <option value="resolved">تم الحل</option>
                <option value="closed">مغلقة</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border rounded-lg px-4 py-2"
              >
                <option value="">جميع التصنيفات</option>
                <option value="billing">الفوترة</option>
                <option value="technical">تقني</option>
                <option value="service">خدمة</option>
                <option value="complaint">شكوى</option>
                <option value="inquiry">استفسار</option>
                <option value="other">أخرى</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="border rounded-lg px-4 py-2"
              >
                <option value="">جميع الأولويات</option>
                <option value="urgent">عاجلة</option>
                <option value="high">عالية</option>
                <option value="medium">متوسطة</option>
                <option value="low">منخفضة</option>
              </select>
            </div>
            <Link
              to="/tickets/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + إنشاء تذكرة
            </Link>
          </div>
        </div>

        {/* جدول التذاكر */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">جاري التحميل...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم التذكرة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الموضوع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التصنيف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الأولوية</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الإنشاء</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets?.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      <Link to={`/tickets/${ticket.id}`}>
                        {ticket.ticketNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {ticket.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {categoryLabels[ticket.category] || ticket.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[ticket.priority]}`}>
                        {priorityLabels[ticket.priority] || ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[ticket.status]}`}>
                        {statusLabels[ticket.status] || ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <Link
                          to={`/tickets/${ticket.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          عرض
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm("هل أنت متأكد من حذف هذه التذكرة؟")) {
                              deleteMutation.mutate({ id: ticket.id });
                            }
                          }}
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
