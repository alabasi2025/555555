import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddSupplier() {
  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>إضافة مورد جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <Label>اسم المورد</Label>
              <Input placeholder="أدخل اسم المورد" />
            </div>
            <Button type="submit">حفظ</Button>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
