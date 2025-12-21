// @ts-nocheck
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function PostJournalEntries() {
  const { data: journalListData } = trpc.journalEntries.list.useQuery();
  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>ترحيل القيود</CardTitle>
        </CardHeader>
      </Card>
    </DashboardLayout>
  );
}
