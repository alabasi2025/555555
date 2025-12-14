import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Link } from "wouter";

export default function SuppliersList() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">قائمة الموردين</h1>
            <p className="text-gray-600 mt-2">إدارة الموردين</p>
          </div>
          <Link href="/suppliers/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة مورد جديد
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="البحث عن مورد..." className="pr-10" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الموردين</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">لا توجد بيانات متاحة حالياً</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
