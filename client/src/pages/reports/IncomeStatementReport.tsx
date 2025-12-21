// @ts-nocheck
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function IncomeStatementReport() {
  const { data: reportsData, isLoading, error } = trpc.reports.getFinancialSummary.useQuery();
  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>قائمة الدخل</CardTitle>
        </CardHeader>
      </Card>
    </DashboardLayout>
  );
}
