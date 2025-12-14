import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MoreHorizontal, PlusCircle, Search, ArrowUpDown, Edit, Trash2, Eye } from "lucide-react";

// *****************************************************************
// 1. TYPESCRIPT INTERFACES (الواجهات)
// *****************************************************************

type Category = 'current' | 'non-current';

interface BalanceSheetItem {
  id: string;
  name: string; // اسم البند
  amount: number; // المبلغ
  category: Category; // متداول / غير متداول
  description?: string; // وصف إضافي
}

interface BalanceSheetSection {
  title: string; // عنوان القسم (مثل: الأصول، الخصوم)
  items: BalanceSheetItem[];
  total: number;
}

export interface BalanceSheetReport {
  date: string; // تاريخ التقرير
  assets: BalanceSheetSection;
  liabilities: BalanceSheetSection;
  equity: BalanceSheetSection;
  totalAssets: number;
  totalLiabilitiesAndEquity: number;
}

// *****************************************************************
// 2. MOCK DATA (البيانات التجريبية)
// *****************************************************************

const generateMockData = (): BalanceSheetReport => {
  const assetsItems: BalanceSheetItem[] = [
    // Current Assets
    { id: "A001", name: "النقد وما يعادله", amount: 150000, category: "current", description: "النقد في البنوك والصندوق" },
    { id: "A002", name: "الذمم المدينة", amount: 85000, category: "current", description: "مستحقات من العملاء" },
    { id: "A003", name: "المخزون", amount: 120000, category: "current", description: "بضاعة جاهزة للبيع" },
    // Non-Current Assets
    { id: "A004", name: "المباني والمعدات", amount: 450000, category: "non-current", description: "الأصول الثابتة بعد الاستهلاك" },
    { id: "A005", name: "استثمارات طويلة الأجل", amount: 90000, category: "non-current", description: "أسهم وسندات" },
  ];
  const totalAssets = assetsItems.reduce((sum, item) => sum + item.amount, 0);

  const liabilitiesItems: BalanceSheetItem[] = [
    // Current Liabilities
    { id: "L001", name: "الذمم الدائنة", amount: 60000, category: "current", description: "مستحقات للموردين" },
    { id: "L002", name: "قروض قصيرة الأجل", amount: 40000, category: "current", description: "قروض مستحقة خلال سنة" },
    // Non-Current Liabilities
    { id: "L003", name: "قروض طويلة الأجل", amount: 150000, category: "non-current", description: "قروض مستحقة بعد سنة" },
  ];
  const totalLiabilities = liabilitiesItems.reduce((sum, item) => sum + item.amount, 0);

  const equityItems: BalanceSheetItem[] = [
    { id: "E001", name: "رأس المال", amount: 500000, category: "non-current", description: "رأس مال المالك" },
    { id: "E002", name: "الأرباح المحتجزة", amount: totalAssets - totalLiabilities - 500000, category: "non-current", description: "صافي الأرباح المتراكمة" },
  ];
  const totalEquity = equityItems.reduce((sum, item) => sum + item.amount, 0);

  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  return {
    date: "2025-12-31",
    assets: { title: "الأصول", items: assetsItems, total: totalAssets },
    liabilities: { title: "الخصوم", items: liabilitiesItems, total: totalLiabilities },
    equity: { title: "حقوق الملكية", items: equityItems, total: totalEquity },
    totalAssets: totalAssets,
    totalLiabilitiesAndEquity: totalLiabilitiesAndEquity,
  };
};

// *****************************************************************
// 3. FORM VALIDATION (التحقق من صحة النماذج)
// *****************************************************************

const formSchema = z.object({
  name: z.string().min(2, { message: "يجب أن يحتوي الاسم على حرفين على الأقل." }),
  amount: z.number().min(0.01, { message: "يجب أن يكون المبلغ أكبر من صفر." }),
  category: z.enum(["current", "non-current"], {
    required_error: "يجب اختيار نوع البند (متداول أو غير متداول).",
  }),
  description: z.string().optional(),
  section: z.enum(["assets", "liabilities", "equity"], {
    required_error: "يجب تحديد القسم (الأصول، الخصوم، حقوق الملكية).",
  }),
});

type FormValues = z.infer<typeof formSchema>;

// *****************************************************************
// 4. UTILITY COMPONENTS (مكونات مساعدة)
// *****************************************************************

// Mock Chart Component (استبدل بمكتبة رسوم بيانية حقيقية مثل Recharts أو Chart.js)
const MockChart: React.FC<{ title: string; data: { name: string; value: number }[] }> = ({ title, data }) => (
  <Card className="h-full">
    <CardHeader>
      <CardTitle className="text-right text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col items-center justify-center h-48">
      <div className="w-full h-full flex flex-col justify-end p-4 space-y-1">
        {data.map((item, index) => (
          <div key={index} className="flex items-center" dir="rtl">
            <div className="text-xs w-1/4 text-right truncate">{item.name}</div>
            <div className="flex-1 h-4 bg-gray-200 rounded-sm overflow-hidden mr-2">
              <div
                className="h-full rounded-sm"
                style={{
                  width: `${(item.value / data.reduce((max, d) => Math.max(max, d.value), 1)) * 100}%`,
                  backgroundColor: index % 3 === 0 ? '#3b82f6' : index % 3 === 1 ? '#10b981' : '#f59e0b',
                }}
              />
            </div>
            <div className="text-xs font-medium w-1/4 text-left">
              {item.value.toLocaleString('ar-EG', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 })}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// CRUD Dialog Component
const ItemFormDialog: React.FC<{
  item?: BalanceSheetItem & { section: "assets" | "liabilities" | "equity" };
  mode: "add" | "edit" | "view";
  onSave: (data: FormValues) => void;
  onDelete?: (id: string) => void;
}> = ({ item, mode, onSave, onDelete }) => {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const defaultValues: FormValues = isEdit || isView
    ? {
        name: item?.name || "",
        amount: item?.amount || 0,
        category: item?.category || "current",
        description: item?.description || "",
        section: item?.section || "assets",
      }
    : {
        name: "",
        amount: 0,
        category: "current",
        description: "",
        section: "assets",
      };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const onSubmit = (data: FormValues) => {
    onSave(data);
    // Close dialog logic would go here
  };

  const titleMap = {
    add: "إضافة بند جديد",
    edit: "تعديل بند الميزانية",
    view: "عرض تفاصيل البند",
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {isAdd ? (
          <Button className="w-full sm:w-auto">
            <PlusCircle className="ml-2 h-4 w-4" />
            إضافة بند
          </Button>
        ) : isEdit ? (
          <DropdownMenuItem onSelect={(e: React.FormEvent) => e.preventDefault()}>
            <Edit className="ml-2 h-4 w-4" />
            تعديل
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={(e: React.FormEvent) => e.preventDefault()}>
            <Eye className="ml-2 h-4 w-4" />
            عرض
          </DropdownMenuItem>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{titleMap[mode]}</DialogTitle>
          <DialogDescription>
            {isView ? "تفاصيل البند المالي." : "أدخل بيانات البند المالي الجديد أو قم بتعديل البيانات الحالية."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم البند</FormLabel>
                  <FormControl>
                    <Input placeholder="مثل: النقد في البنك" {...field} disabled={isView} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المبلغ (ريال سعودي)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      onChange={(e: React.FormEvent) => field.onChange(parseFloat(e.target.value) || 0)}
                      disabled={isView}
                      dir="ltr"
                      className="text-right"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="section"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>القسم</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isView || isEdit}>
                    <FormControl>
                      <SelectTrigger dir="rtl">
                        <SelectValue placeholder="اختر القسم" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent dir="rtl">
                      <SelectItem value="assets">الأصول</SelectItem>
                      <SelectItem value="liabilities">الخصوم</SelectItem>
                      <SelectItem value="equity">حقوق الملكية</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>النوع</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isView}>
                    <FormControl>
                      <SelectTrigger dir="rtl">
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent dir="rtl">
                      <SelectItem value="current">متداول</SelectItem>
                      <SelectItem value="non-current">غير متداول</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="وصف تفصيلي للبند" {...field} disabled={isView} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2 sm:space-x-reverse pt-4">
              {isEdit && onDelete && (
                <Button type="button" variant="destructive" onClick={() => onDelete(item!.id)}>
                  <Trash2 className="ml-2 h-4 w-4" />
                  حذف البند
                </Button>
              )}
              {!isView && (
                <Button type="submit" className="sm:ml-auto">
                  {isAdd ? "إضافة" : "حفظ التعديلات"}
                </Button>
              )}
              {isView && (
                <DialogTrigger asChild>
                    <Button type="button" variant="outline" className="sm:ml-auto">
                        إغلاق
                    </Button>
                </DialogTrigger>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Table Component
const BalanceSheetTable: React.FC<{
  section: BalanceSheetSection;
  sectionKey: "assets" | "liabilities" | "equity";
  onAction: (action: "add" | "edit" | "delete" | "view", item: BalanceSheetItem & { section: "assets" | "liabilities" | "equity" }) => void;
}> = ({ section, sectionKey, onAction }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof BalanceSheetItem; direction: 'ascending' | 'descending' } | null>(null);

  const filteredAndSortedItems = useMemo(() => {
    let sortableItems = [...section.items];

    // 1. Filter
    if (searchTerm) {
      sortableItems = sortableItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Sort
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableItems;
  }, [section.items, searchTerm, sortConfig]);

  const requestSort = (key: keyof BalanceSheetItem) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof BalanceSheetItem) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    if (sortConfig.direction === 'ascending') return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return <ArrowUpDown className="ml-2 h-4 w-4 rotate-180" />;
  };

  const handleAction = (action: "edit" | "view" | "delete", item: BalanceSheetItem) => {
    onAction(action, { ...item, section: sectionKey });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{section.title}</CardTitle>
        <div className="relative w-full max-w-sm ml-auto mr-4">
          <Search className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو الوصف..."
            value={searchTerm}
            onChange={(e: React.FormEvent) => setSearchTerm(e.target.value)}
            className="w-full pr-8"
            dir="rtl"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] text-right">
                  <Button variant="ghost" onClick={() => requestSort('id')} className="p-0 h-auto">
                    الرقم {getSortIcon('id')}
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => requestSort('name')} className="p-0 h-auto">
                    اسم البند {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => requestSort('category')} className="p-0 h-auto">
                    النوع {getSortIcon('category')}
                  </Button>
                </TableHead>
                <TableHead className="text-left">
                  <Button variant="ghost" onClick={() => requestSort('amount')} className="p-0 h-auto">
                    المبلغ (ر.س) {getSortIcon('amount')}
                  </Button>
                </TableHead>
                <TableHead className="text-center w-[50px]">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-right">{item.id}</TableCell>
                  <TableCell className="text-right">{item.name}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={item.category === 'current' ? 'default' : 'secondary'}>
                      {item.category === 'current' ? 'متداول' : 'غير متداول'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left font-mono">
                    {item.amount.toLocaleString('ar-EG', { style: 'currency', currency: 'SAR', minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu dir="rtl">
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">فتح القائمة</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                        <ItemFormDialog item={{ ...item, section: sectionKey }} mode="view" onSave={() => {}} />
                        <ItemFormDialog item={{ ...item, section: sectionKey }} mode="edit" onSave={() => {}} onDelete={() => handleAction("delete", item)} />
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleAction("delete", item)}>
                          <Trash2 className="ml-2 h-4 w-4" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAndSortedItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    لا توجد بيانات مطابقة.
                  </TableCell>
                </TableRow>
              )}
              <TableRow className="bg-gray-50 font-bold hover:bg-gray-100">
                <TableCell colSpan={3} className="text-right text-lg">
                  الإجمالي
                </TableCell>
                <TableCell className="text-left text-lg font-mono">
                  {section.total.toLocaleString('ar-EG', { style: 'currency', currency: 'SAR', minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

// Mock Dashboard Layout Component
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-50 p-4 sm:p-8" dir="rtl">
    <header className="mb-6">
      <h1 className="text-3xl font-extrabold text-gray-900">نظام التقارير المالية</h1>
      <p className="text-gray-500">لوحة تحكم شاملة للبيانات المالية</p>
      <Separator className="mt-4" />
    </header>
    <main>{children}</main>
  </div>
);

// *****************************************************************
// 5. MAIN COMPONENT (المكون الرئيسي)
// *****************************************************************

export const BalanceSheet: React.FC = () => {
  const [reportData, setReportData] = useState<BalanceSheetReport>(generateMockData());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Placeholder for CRUD operations (for demonstration)
  const handleSaveItem = (data: FormValues) => {
    console.log("Saving item:", data);
    // In a real application, you would update the state or call an API here
    // For simplicity, we just log and close the dialog
    setIsDialogOpen(false);
    // Recalculate totals after a change (mock update)
    setReportData(generateMockData());
  };

  const handleDeleteItem = (id: string) => {
    console.log("Deleting item with ID:", id);
    // In a real application, you would update the state or call an API here
    // Recalculate totals after a change (mock update)
    setReportData(generateMockData());
  };

  const handleTableAction = (action: "add" | "edit" | "delete" | "view", item: BalanceSheetItem & { section: "assets" | "liabilities" | "equity" }) => {
    if (action === "delete") {
      handleDeleteItem(item.id);
    } else {
      // For 'edit' and 'view', the dialog component handles the trigger
      console.log(`${action} action triggered for item:`, item);
    }
  };

  // Chart Data Preparation
  const assetsChartData = reportData.assets.items.map(item => ({ name: item.name, value: item.amount }));
  const liabilitiesChartData = reportData.liabilities.items.map(item => ({ name: item.name, value: item.amount }));
  const equityChartData = reportData.equity.items.map(item => ({ name: item.name, value: item.amount }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header and Summary */}
        <Card className="shadow-xl border-t-4 border-blue-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">تقرير الميزانية العمومية</CardTitle>
            <div className="flex items-center space-x-2 space-x-reverse">
              <ItemFormDialog mode="add" onSave={handleSaveItem} />
              <Button variant="outline">تصدير PDF</Button>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-lg mb-4">
              التاريخ: <span className="font-semibold">{reportData.date}</span>
            </CardDescription>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-600">إجمالي الأصول</p>
                <p className="text-2xl font-extrabold text-blue-800 mt-1" dir="ltr">
                  {reportData.totalAssets.toLocaleString('ar-EG', { style: 'currency', currency: 'SAR', minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-600">إجمالي الخصوم</p>
                <p className="text-2xl font-extrabold text-red-800 mt-1" dir="ltr">
                  {reportData.liabilities.total.toLocaleString('ar-EG', { style: 'currency', currency: 'SAR', minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-600">إجمالي حقوق الملكية</p>
                <p className="text-2xl font-extrabold text-green-800 mt-1" dir="ltr">
                  {reportData.equity.total.toLocaleString('ar-EG', { style: 'currency', currency: 'SAR', minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
                <p className="text-lg font-bold text-yellow-800">
                    معادلة الميزانية: الأصول ({reportData.totalAssets.toLocaleString('ar-EG')}) = الخصوم وحقوق الملكية ({reportData.totalLiabilitiesAndEquity.toLocaleString('ar-EG')})
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                    {reportData.totalAssets === reportData.totalLiabilitiesAndEquity ? "الميزانية متوازنة." : "تحقق من التوازن."}
                </p>
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MockChart title="توزيع الأصول" data={assetsChartData} />
          <MockChart title="توزيع الخصوم" data={liabilitiesChartData} />
          <MockChart title="توزيع حقوق الملكية" data={equityChartData} />
        </div>

        {/* Assets Table */}
        <BalanceSheetTable
          section={reportData.assets}
          sectionKey="assets"
          onAction={handleTableAction}
        />

        {/* Liabilities Table */}
        <BalanceSheetTable
          section={reportData.liabilities}
          sectionKey="liabilities"
          onAction={handleTableAction}
        />

        {/* Equity Table */}
        <BalanceSheetTable
          section={reportData.equity}
          sectionKey="equity"
          onAction={handleTableAction}
        />
      </div>
    </DashboardLayout>
  );
};

// Export the component for use
export default BalanceSheet;
