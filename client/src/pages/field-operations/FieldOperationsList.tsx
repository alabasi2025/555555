import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function FieldOperationsList() {
  const [activeTab, setActiveTab] = useState<"teams" | "routes" | "tasks" | "visits">("teams");
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  const { data: teams, refetch: refetchTeams } = trpc.fieldOperations.getTeams.useQuery();
  // Routes will be added later
  const routes: any[] = [];
  const { data: tasks, refetch: refetchTasks } = trpc.fieldOperations.getTasks.useQuery({
    status: statusFilter as any || undefined,
  });
  // Visits will be added later
  const visits: any[] = [];
  const { data: stats } = trpc.fieldOperations.getStats.useQuery();

  // Delete team mutation placeholder
  const deleteTeamMutation = { mutate: (data: any) => console.log(data), isPending: false };

  const statusLabels: Record<string, string> = {
    pending: "معلق",
    in_progress: "قيد التنفيذ",
    completed: "مكتمل",
    cancelled: "ملغي",
    planned: "مخطط",
    active: "نشط",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    planned: "bg-purple-100 text-purple-800",
    active: "bg-green-100 text-green-800",
  };

  const taskTypeLabels: Record<string, string> = {
    installation: "تركيب",
    maintenance: "صيانة",
    reading: "قراءة",
    disconnection: "فصل",
    reconnection: "إعادة توصيل",
    inspection: "فحص",
  };

  return (
    <DashboardLayout title="العمليات الميدانية">
      <div className="space-y-6">
        {/* الإحصائيات */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xs text-gray-500">الفرق</h3>
            <p className="text-xl font-bold text-blue-600">{stats?.totalTeams || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xs text-gray-500">الفرق النشطة</h3>
            <p className="text-xl font-bold text-green-600">{stats?.totalTeams || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xs text-gray-500">المهام اليوم</h3>
            <p className="text-xl font-bold text-purple-600">{stats?.totalTasks || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xs text-gray-500">المهام المكتملة</h3>
            <p className="text-xl font-bold text-green-600">{stats?.completedTasks || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xs text-gray-500">المهام المعلقة</h3>
            <p className="text-xl font-bold text-yellow-600">{stats?.pendingTasks || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xs text-gray-500">الزيارات اليوم</h3>
            <p className="text-xl font-bold text-orange-600">{stats?.completedTasks || 0}</p>
          </div>
        </div>

        {/* التبويبات */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("teams")}
                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === "teams"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                الفرق الميدانية ({teams?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("routes")}
                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === "routes"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                المسارات ({routes?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("tasks")}
                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === "tasks"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                المهام ({tasks?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("visits")}
                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === "visits"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                الزيارات ({visits?.length || 0})
              </button>
            </nav>
          </div>

          <div className="p-4">
            {/* الفرق الميدانية */}
            {activeTab === "teams" && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Link
                    to="/field-operations/teams/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    + إضافة فريق
                  </Link>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكود</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم الفريق</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">قائد الفريق</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عدد الأعضاء</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المنطقة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teams?.map((team) => (
                      <tr key={team.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {team.teamCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {team.teamName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {team.teamLeaderId ? `الموظف #${team.teamLeaderId}` : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          0
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {team.region || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            team.isActive 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {team.isActive ? "نشط" : "غير نشط"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <Link
                              to={`/field-operations/teams/${team.id}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              عرض
                            </Link>
                            <button
                              onClick={() => {
                                if (confirm("هل أنت متأكد من حذف هذا الفريق؟")) {
                                  deleteTeamMutation.mutate({ id: team.id });
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
              </div>
            )}

            {/* المسارات */}
            {activeTab === "routes" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border rounded-lg px-4 py-2"
                  >
                    <option value="">جميع الحالات</option>
                    <option value="planned">مخطط</option>
                    <option value="active">نشط</option>
                    <option value="completed">مكتمل</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                  <Link
                    to="/field-operations/routes/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    + إنشاء مسار
                  </Link>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم المسار</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفريق</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المحطات</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المسافة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {routes?.map((route) => (
                      <tr key={route.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {route.routeNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {route.teamId ? `الفريق #${route.teamId}` : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(route.routeDate).toLocaleDateString("ar-SA")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {route.totalStops || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {route.estimatedDistance ? `${route.estimatedDistance} كم` : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${statusColors[route.status]}`}>
                            {statusLabels[route.status] || route.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            to={`/field-operations/routes/${route.id}`}
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

            {/* المهام */}
            {activeTab === "tasks" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border rounded-lg px-4 py-2"
                  >
                    <option value="">جميع الحالات</option>
                    <option value="pending">معلق</option>
                    <option value="in_progress">قيد التنفيذ</option>
                    <option value="completed">مكتمل</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                  <Link
                    to="/field-operations/tasks/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    + إنشاء مهمة
                  </Link>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم المهمة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفريق</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ المجدول</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الأولوية</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks?.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {task.taskNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {taskTypeLabels[task.taskType] || task.taskType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {task.teamId ? `الفريق #${task.teamId}` : "غير معين"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(task.scheduledDate).toLocaleDateString("ar-SA")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            task.priority === "urgent" ? "bg-red-100 text-red-800" :
                            task.priority === "high" ? "bg-orange-100 text-orange-800" :
                            task.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {task.priority === "urgent" ? "عاجل" :
                             task.priority === "high" ? "عالي" :
                             task.priority === "medium" ? "متوسط" : "منخفض"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${statusColors[task.status]}`}>
                            {statusLabels[task.status] || task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            to={`/field-operations/tasks/${task.id}`}
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

            {/* الزيارات */}
            {activeTab === "visits" && (
              <div className="space-y-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المهمة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">وقت الوصول</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">وقت المغادرة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النتيجة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">توقيع العميل</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {visits?.map((visit) => (
                      <tr key={visit.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          المهمة #{visit.taskId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {visit.arrivalTime 
                            ? new Date(visit.arrivalTime).toLocaleString("ar-SA")
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {visit.departureTime 
                            ? new Date(visit.departureTime).toLocaleString("ar-SA")
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            visit.visitResult === "completed" ? "bg-green-100 text-green-800" :
                            visit.visitResult === "partial" ? "bg-yellow-100 text-yellow-800" :
                            visit.visitResult === "failed" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {visit.visitResult === "completed" ? "مكتمل" :
                             visit.visitResult === "partial" ? "جزئي" :
                             visit.visitResult === "failed" ? "فشل" :
                             visit.visitResult === "rescheduled" ? "أعيد جدولته" : "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {visit.customerSignature ? "✓" : "-"}
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
