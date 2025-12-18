import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function CustomerPortalDashboard() {
  const [activeTab, setActiveTab] = useState<"users" | "sessions" | "notifications">("users");
  
  const { data: stats } = trpc.customerPortal.getPortalStats.useQuery();
  // Portal users will be fetched differently
  const users: any[] = [];
  const refetchUsers = () => {};
  // Sessions will be fetched differently
  const sessions: any[] = [];

  // Toggle user mutation placeholder
  const toggleUserMutation = { mutate: (data: any) => console.log(data), isPending: false };

  return (
    <DashboardLayout title="بوابة العملاء">
      <div className="space-y-6">
        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500">إجمالي المستخدمين</h3>
            <p className="text-2xl font-bold text-blue-600">{stats?.totalUsers || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500">المستخدمين النشطين</h3>
            <p className="text-2xl font-bold text-green-600">{stats?.activeUsers || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500">المستخدمين الموثقين</h3>
            <p className="text-2xl font-bold text-purple-600">{stats?.verifiedUsers || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500">الجلسات النشطة</h3>
            <p className="text-2xl font-bold text-orange-600">{sessions?.length || 0}</p>
          </div>
        </div>

        {/* التبويبات */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("users")}
                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === "users"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                المستخدمين ({users?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("sessions")}
                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === "sessions"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                الجلسات النشطة ({sessions?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === "notifications"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                الإشعارات
              </button>
            </nav>
          </div>

          <div className="p-4">
            {/* المستخدمين */}
            {activeTab === "users" && (
              <div className="space-y-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العميل</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">البريد الإلكتروني</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الهاتف</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">موثق</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">آخر دخول</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users?.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          العميل #{user.customerId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.phone || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.isVerified 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {user.isVerified ? "موثق" : "غير موثق"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastLogin 
                            ? new Date(user.lastLogin).toLocaleDateString("ar-SA")
                            : "لم يسجل دخول"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.isActive 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {user.isActive ? "نشط" : "معطل"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => toggleUserMutation.mutate({ 
                              id: user.id, 
                              isActive: !user.isActive 
                            })}
                            className={`${
                              user.isActive 
                                ? "text-red-600 hover:text-red-800" 
                                : "text-green-600 hover:text-green-800"
                            }`}
                          >
                            {user.isActive ? "تعطيل" : "تفعيل"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* الجلسات النشطة */}
            {activeTab === "sessions" && (
              <div className="space-y-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المستخدم</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">IP</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المتصفح</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">بدء الجلسة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">آخر نشاط</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sessions?.map((session) => (
                      <tr key={session.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          المستخدم #{session.userId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          {session.ipAddress || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.userAgent?.substring(0, 50) || "-"}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(session.createdAt).toLocaleString("ar-SA")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.lastActivity 
                            ? new Date(session.lastActivity).toLocaleString("ar-SA")
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* الإشعارات */}
            {activeTab === "notifications" && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Link
                    to="/customer-portal/notifications/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    + إرسال إشعار جماعي
                  </Link>
                </div>
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                  <p>يمكنك إرسال إشعارات للعملاء من هنا</p>
                  <p className="text-sm mt-2">اختر العملاء وأنشئ إشعاراً جديداً</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* روابط سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/customer-portal/settings"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-medium text-gray-900">إعدادات البوابة</h3>
            <p className="text-sm text-gray-500 mt-2">
              تخصيص مظهر وإعدادات بوابة العملاء
            </p>
          </Link>
          <Link
            to="/customer-portal/faq"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-medium text-gray-900">الأسئلة الشائعة</h3>
            <p className="text-sm text-gray-500 mt-2">
              إدارة الأسئلة الشائعة للعملاء
            </p>
          </Link>
          <Link
            to="/customer-portal/analytics"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-medium text-gray-900">تحليلات البوابة</h3>
            <p className="text-sm text-gray-500 mt-2">
              عرض إحصائيات استخدام البوابة
            </p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
