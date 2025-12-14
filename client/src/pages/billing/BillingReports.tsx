import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function BillingReports() {
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
