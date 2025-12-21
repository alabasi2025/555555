// @ts-nocheck
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function GeneralLedger() {
  const { data: journalListData } = trpc.journalEntries.list.useQuery();
  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>دفتر الأستاذ العام</CardTitle>
        </CardHeader>
      </Card>
    </DashboardLayout>
  );
}
