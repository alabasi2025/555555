// @ts-nocheck
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddJournalEntry() {
  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>إضافة قيد محاسبي</CardTitle>
        </CardHeader>
      </Card>
    </DashboardLayout>
  );
}
