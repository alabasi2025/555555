// @ts-nocheck
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function AccountsList() {
  const [searchTerm, setSearchTerm] = useState("");

  // بيانات تجريبية
  const accounts = [
    { id: 1, code: "1000", name: "الأصول", nameEn: "Assets", type: "asset", isHeader: true, level: 1 },
    { id: 2, code: "1100", name: "الأصول المتداولة", nameEn: "Current Assets", type: "asset", isHeader: true, level: 2 },
    { id: 3, code: "1110", name: "النقد في الصندوق", nameEn: "Cash in Hand", type: "asset", isHeader: false, level: 3 },
    { id: 4, code: "1120", name: "البنك", nameEn: "Bank", type: "asset", isHeader: false, level: 3 },
    { id: 5, code: "2000", name: "الخصوم", nameEn: "Liabilities", type: "liability", isHeader: true, level: 1 },
    { id: 6, code: "3000", name: "حقوق الملكية", nameEn: "Equity", type: "equity", isHeader: true, level: 1 },
    { id: 7, code: "4000", name: "الإيرادات", nameEn: "Revenue", type: "revenue", isHeader: true, level: 1 },
    { id: 8, code: "5000", name: "المصروفات", nameEn: "Expenses", type: "expense", isHeader: true, level: 1 },
  ];

  const accountTypeLabels: Record<string, string> = {
    asset: "أصول",
    liability: "خصوم",
    equity: "حقوق ملكية",
    revenue: "إيرادات",
    expense: "مصروفات",
  };

  const accountTypeColors: Record<string, string> = {
    asset: "bg-blue-100 text-blue-800",
    liability: "bg-red-100 text-red-800",
    equity: "bg-green-100 text-green-800",
    revenue: "bg-purple-100 text-purple-800",
    expense: "bg-orange-100 text-orange-800",
  };

  const filteredAccounts = accounts.filter(
    (account) =>
      account.name.includes(searchTerm) ||
      account.code.includes(searchTerm) ||
      account.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">شجرة الحسابات</h1>
            <p className="text-gray-600 mt-2">إدارة الحسابات المحاسبية</p>
          </div>
          <Link href="/accounts/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة حساب جديد
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث برقم الحساب أو الاسم..."
                  value={searchTerm}
                  onChange={(e: any) => setSearchTerm((e.target as HTMLInputElement).value)}
                  className="pr-10"
                />
              </div>
              <Link href="/accounts/tree">
                <Button variant="outline">عرض الشجرة الهرمية</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Accounts Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة الحسابات ({filteredAccounts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">رقم الحساب</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">اسم الحساب</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">الاسم بالإنجليزية</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">النوع</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">المستوى</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((account) => (
                    <tr key={account.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className={`font-mono ${account.isHeader ? 'font-bold' : ''}`}>
                          {account.code}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={account.isHeader ? 'font-bold' : ''}>
                          {account.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{account.nameEn}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${accountTypeColors[account.type]}`}>
                          {accountTypeLabels[account.type]}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600">المستوى {account.level}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <Link href={`/accounts/${account.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/accounts/${account.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
