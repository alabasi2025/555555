// @ts-nocheck
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function MaterialReceiptForm() {
  const { data: purchasesData, isLoading, error } = trpc.purchases.list.useQuery();
  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>استلام المواد</CardTitle>
        </CardHeader>
      </Card>
    </DashboardLayout>
  );
}
