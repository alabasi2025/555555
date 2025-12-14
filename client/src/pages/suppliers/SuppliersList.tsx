import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Edit } from "lucide-react";
import { useLocation } from "wouter";

const mockSuppliers = [
  { id: "SUP001", name: "شركة النور للكهرباء", email: "info@alnoor.com", phone: "0501234567", status: "نشط", balance: 150000 },
  { id: "SUP002", name: "مؤسسة الطاقة المتجددة", email: "contact@renewable.com", phone: "0559876543", status: "نشط", balance: 85000 },
  { id: "SUP003", name: "شركة الكابلات الحديثة", email: "sales@cables.com", phone: "0561122334", status: "معلق", balance: 45000 },
];

export default function SuppliersList() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSuppliers = mockSuppliers.filter(s => 
    s.name.includes(searchTerm) || s.id.includes(searchTerm)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">قائمة الموردين</h1>
            <p className="text-gray-600 mt-2">إدارة الموردين</p>
          </div>
          <Button onClick={() => setLocation("/suppliers/new")} className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة مورد جديد
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="البحث عن مورد..." 
                className="pr-10" 
                value={searchTerm}
                onChange={(e: React.FormEvent) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الموردين ({filteredSuppliers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المعرف</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>البريد</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>الرصيد</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map(supplier => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-mono">{supplier.id}</TableCell>
                    <TableCell className="font-semibold">{supplier.name}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>{supplier.balance.toLocaleString()} ر.س</TableCell>
                    <TableCell>
                      <Badge variant={supplier.status === "نشط" ? "default" : "secondary"}>
                        {supplier.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setLocation(`/suppliers/${supplier.id}`)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setLocation(`/suppliers/${supplier.id}/edit`)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
