// @ts-nocheck
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function BillingReports() {
  const { data: billingData } = trpc.invoices.list.useQuery();
  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>تقارير الفواتير</CardTitle>
        </CardHeader>
      </Card>
    </DashboardLayout>
  );
}
