import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function DiscountsList() {
  const [activeTab, setActiveTab] = useState<"rules" | "promotions" | "coupons">("rules");
  const [typeFilter, setTypeFilter] = useState<string>("");
  
  const { data: rules, refetch: refetchRules } = trpc.discounts.getRules.useQuery({
    discountType: typeFilter as any || undefined,
  });
  
  const { data: promotions, refetch: refetchPromotions } = trpc.discounts.getPromotions.useQuery();
  const { data: activePromotions } = trpc.discounts.getActivePromotions.useQuery();
  const { data: coupons, refetch: refetchCoupons } = trpc.discounts.getCoupons.useQuery();
  const { data: stats } = trpc.discounts.getStats.useQuery();

  const deleteRuleMutation = trpc.discounts.deleteRule.useMutation({
    onSuccess: () => refetchRules(),
  });

  const deletePromotionMutation = trpc.discounts.deletePromotion.useMutation({
    onSuccess: () => refetchPromotions(),
  });

  const discountTypeLabels: Record<string, string> = {
    percentage: "نسبة مئوية",
    fixed_amount: "مبلغ ثابت",
    buy_x_get_y: "اشترِ X واحصل على Y",
    tiered: "متدرج",
  };

  const promotionTypeLabels: Record<string, string> = {
    seasonal: "موسمي",
    clearance: "تصفية",
    loyalty: "ولاء",
    bundle: "حزمة",
    flash_sale: "عرض سريع",
  };

  return (
    <DashboardLayout title="الخصومات والعروض">
      <div className="space-y-6">
        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500">قواعد الخصم النشطة</h3>
            <p className="text-2xl font-bold text-blue-600">{stats?.activeRules || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500">العروض النشطة</h3>
            <p className="text-2xl font-bold text-green-600">{stats?.activePromotions || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500">الكوبونات المستخدمة</h3>
            <p className="text-2xl font-bold text-purple-600">{stats?.usedCoupons || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500">إجمالي الخصومات</h3>
            <p className="text-2xl font-bold text-orange-600">
              {parseFloat(String(stats?.totalDiscount || 0)).toLocaleString()} ر.س
            </p>
          </div>
        </div>

        {/* التبويبات */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("rules")}
                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === "rules"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                قواعد الخصم ({rules?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("promotions")}
                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === "promotions"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                العروض الترويجية ({promotions?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("coupons")}
                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === "coupons"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                الكوبونات ({coupons?.length || 0})
              </button>
            </nav>
          </div>

          <div className="p-4">
            {/* قواعد الخصم */}
            {activeTab === "rules" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="border rounded-lg px-4 py-2"
                  >
                    <option value="">جميع الأنواع</option>
                    <option value="percentage">نسبة مئوية</option>
                    <option value="fixed_amount">مبلغ ثابت</option>
                    <option value="buy_x_get_y">اشترِ X واحصل على Y</option>
                    <option value="tiered">متدرج</option>
                  </select>
                  <Link
                    to="/discounts/rules/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    + إضافة قاعدة خصم
                  </Link>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكود</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">القيمة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rules?.map((rule) => (
                      <tr key={rule.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {rule.ruleCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {rule.ruleName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {discountTypeLabels[rule.discountType] || rule.discountType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {rule.discountType === "percentage" 
                            ? `${rule.discountValue}%` 
                            : `${rule.discountValue} ر.س`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            rule.isActive 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {rule.isActive ? "نشط" : "غير نشط"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <Link
                              to={`/discounts/rules/${rule.id}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              عرض
                            </Link>
                            <button
                              onClick={() => {
                                if (confirm("هل أنت متأكد من حذف هذه القاعدة؟")) {
                                  deleteRuleMutation.mutate({ id: rule.id });
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

            {/* العروض الترويجية */}
            {activeTab === "promotions" && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Link
                    to="/discounts/promotions/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    + إضافة عرض ترويجي
                  </Link>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكود</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ البداية</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ النهاية</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {promotions?.map((promo) => (
                      <tr key={promo.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {promo.promotionCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {promo.promotionName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {promotionTypeLabels[promo.promotionType] || promo.promotionType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(promo.startDate).toLocaleDateString("ar-SA")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(promo.endDate).toLocaleDateString("ar-SA")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            promo.isActive 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {promo.isActive ? "نشط" : "غير نشط"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <Link
                              to={`/discounts/promotions/${promo.id}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              عرض
                            </Link>
                            <button
                              onClick={() => {
                                if (confirm("هل أنت متأكد من حذف هذا العرض؟")) {
                                  deletePromotionMutation.mutate({ id: promo.id });
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

            {/* الكوبونات */}
            {activeTab === "coupons" && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Link
                    to="/discounts/coupons/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    + إنشاء كوبونات
                  </Link>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكود</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاستخدامات</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحد الأقصى</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الانتهاء</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {coupons?.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">
                          {coupon.couponCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {coupon.usageCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {coupon.usageLimit || "غير محدود"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {coupon.expiryDate 
                            ? new Date(coupon.expiryDate).toLocaleDateString("ar-SA")
                            : "غير محدد"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            coupon.isActive 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {coupon.isActive ? "نشط" : "غير نشط"}
                          </span>
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
