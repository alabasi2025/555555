import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function InvoiceDetails() {
  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الفاتورة</CardTitle>
        </CardHeader>
      </Card>
    </DashboardLayout>
  );
}
