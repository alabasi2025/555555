// @ts-nocheck
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function CategoriesList() {
  const { data: inventoryData, isLoading, error } = trpc.inventory.list.useQuery();
  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>CategoriesList</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">لا توجد بيانات متاحة حالياً</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
