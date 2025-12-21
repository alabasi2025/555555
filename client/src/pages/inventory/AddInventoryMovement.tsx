// @ts-nocheck
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddInventoryMovement() {
  const { data: inventoryData, isLoading, error } = trpc.inventory.list.useQuery();
  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>إضافة حركة مخزون</CardTitle>
        </CardHeader>
      </Card>
    </DashboardLayout>
  );
}
