import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { trpc } from "@/lib/trpc";

export default function AdvancedBillingDashboard() {
  const [activeTab, setActiveTab] = useState<"templates" | "credit-notes" | "refunds">("templates");

  // جلب البيانات
  const { data: templates, isLoading: loadingTemplates } = trpc.advancedBilling.getInvoiceTemplates.useQuery();
  const { data: creditNotes, isLoading: loadingCreditNotes } = trpc.advancedBilling.getCreditNotes.useQuery({});
  const refunds: any[] = [];
  const loadingRefunds = false;

  const tabs = [
    { id: "templates" as const, label: "قوالب الفواتير", count: templates?.length || 0 },
    { id: "credit-notes" as const, label: "إشعارات الدائن", count: creditNotes?.length || 0 },
    { id: "refunds" as const, label: "المرتجعات", count: refunds?.length || 0 },
  ];

  return (
    <DashboardLayout title="الفوترة المتقدمة">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">الفوترة المتقدمة</h1>
            <p className="text-gray-600 mt-1">إدارة قوالب الفواتير وإشعارات الدائن والمرتجعات</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            + إضافة جديد
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
                <span className="mr-2 bg-gray-100 text-gray-600 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === "templates" && (
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">قوالب الفواتير</h2>
              {loadingTemplates ? (
                <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
              ) : templates && templates.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم القالب</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {templates.map((template: any) => (
                        <tr key={template.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {template.templateName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {template.templateType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              template.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}>
                              {template.isActive ? "نشط" : "غير نشط"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button className="text-blue-600 hover:text-blue-900 ml-3">تعديل</button>
                            <button className="text-red-600 hover:text-red-900">حذف</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">لا توجد قوالب</div>
              )}
            </div>
          )}

          {activeTab === "credit-notes" && (
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">إشعارات الدائن</h2>
              {loadingCreditNotes ? (
                <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
              ) : creditNotes && creditNotes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الإشعار</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العميل</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {creditNotes.map((note: any) => (
                        <tr key={note.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {note.creditNoteNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {note.customerId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {note.totalAmount} ر.س
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              note.status === "approved" ? "bg-green-100 text-green-800" :
                              note.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {note.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">لا توجد إشعارات دائن</div>
              )}
            </div>
          )}

          {activeTab === "refunds" && (
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">المرتجعات</h2>
              {loadingRefunds ? (
                <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
              ) : refunds && refunds.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم المرتجع</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">طريقة الاسترداد</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {refunds.map((refund: any) => (
                        <tr key={refund.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {refund.refundNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {refund.refundAmount} ر.س
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {refund.refundMethod}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              refund.status === "completed" ? "bg-green-100 text-green-800" :
                              refund.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {refund.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">لا توجد مرتجعات</div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
