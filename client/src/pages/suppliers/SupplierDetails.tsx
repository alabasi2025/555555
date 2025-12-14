// @ts-nocheck
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SupplierDetails() {
  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل المورد</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">لا توجد بيانات متاحة حالياً</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
