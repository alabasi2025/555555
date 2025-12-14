// @ts-nocheck
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function NewAccountForm() {
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<string>("");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    parentId: "",
    description: "",
    isActive: true,
  });

  const accountTypes = [
    { value: "asset", label: "أصول" },
    { value: "liability", label: "خصوم" },
    { value: "equity", label: "حقوق ملكية" },
    { value: "revenue", label: "إيرادات" },
    { value: "expense", label: "مصروفات" },
  ];

  const handleSubmit = (e: any) => {
    e.preventDefault();
    
    // Validation
    if (!formData.code || !formData.name || !selectedType) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    // TODO: إضافة API call لحفظ البيانات
    toast.success("تم إضافة الحساب بنجاح");
    setLocation("/accounts");
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">إضافة حساب جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="code">رمز الحساب *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e: any) => setFormData({ ...formData, code: (e.target as HTMLInputElement).value })}
                    placeholder="مثال: 1010"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">اسم الحساب *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e: any) => setFormData({ ...formData, name: (e.target as HTMLInputElement).value })}
                    placeholder="مثال: النقدية"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">نوع الحساب *</Label>
                  <Select
                    value={selectedType || undefined}
                    onValueChange={(value) => setSelectedType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الحساب" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentId">الحساب الأب (اختياري)</Label>
                  <Input
                    id="parentId"
                    value={formData.parentId}
                    onChange={(e: any) => setFormData({ ...formData, parentId: (e.target as HTMLInputElement).value })}
                    placeholder="رمز الحساب الأب"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: any) => setFormData({ ...formData, description: (e.target as HTMLInputElement).value })}
                  placeholder="وصف الحساب..."
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e: any) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="isActive" className="cursor-pointer">الحساب نشط</Label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1">
                  حفظ الحساب
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setLocation("/accounts")}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
