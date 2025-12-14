import { useState, useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Calendar as CalendarIcon, MoreHorizontal, PlusCircle, Search } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

// استيراد مكونات shadcn/ui
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DashboardLayout } from "@/components/layout/DashboardLayout"; // افتراض وجود هذا المكون

// -----------------------------------------------------------------------------
// 1. تعريف أنواع البيانات (Types)
// -----------------------------------------------------------------------------

type InvoiceStatus = "pending" | "paid" | "failed" | "draft";

interface Invoice {
  id: string;
  customerName: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: Date;
  service: string;
}

// -----------------------------------------------------------------------------
// 2. بيانات وهمية (Mock Data)
// -----------------------------------------------------------------------------

const mockInvoices: Invoice[] = [
  { id: "INV001", customerName: "شركة النور للطاقة", amount: 4500.5, status: "paid", dueDate: new Date(2025, 10, 15), service: "صيانة دورية" },
  { id: "INV002", customerName: "مؤسسة الأمل للإنشاءات", amount: 12000.0, status: "pending", dueDate: new Date(2025, 11, 1), service: "توريد قطع غيار" },
  { id: "INV003", customerName: "مصنع الرياض للحديد", amount: 890.75, status: "failed", dueDate: new Date(2025, 9, 28), service: "خدمة استشارية" },
  { id: "INV004", customerName: "الشركة المتحدة للخدمات", amount: 2500.0, status: "draft", dueDate: new Date(2025, 11, 20), service: "تركيب محطة فرعية" },
  { id: "INV005", customerName: "مجموعة الفهد القابضة", amount: 6700.0, status: "paid", dueDate: new Date(2025, 10, 5), service: "صيانة دورية" },
];

const statusMap: Record<InvoiceStatus, { label: string; color: string }> = {
  pending: { label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-800" },
  paid: { label: "مدفوعة", color: "bg-green-100 text-green-800" },
  failed: { label: "فشلت", color: "bg-red-100 text-red-800" },
  draft: { label: "مسودة", color: "bg-gray-100 text-gray-800" },
};

// -----------------------------------------------------------------------------
// 3. تعريف أعمدة الجدول (Columns Definition)
// -----------------------------------------------------------------------------

const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="text-right"
      >
        رقم الفاتورة
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-right font-medium">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "customerName",
    header: "اسم العميل",
    cell: ({ row }) => <div className="text-right">{row.getValue("customerName")}</div>,
  },
  {
    accessorKey: "service",
    header: "الخدمة",
    cell: ({ row }) => <div className="text-right">{row.getValue("service")}</div>,
  },
  {
    accessorKey: "status",
    header: "الحالة",
    cell: ({ row }) => {
      const status: InvoiceStatus = row.getValue("status");
      const { label, color } = statusMap[status];
      return (
        <Badge className={`w-24 justify-center ${color}`}>
          {label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="text-right"
      >
        المبلغ
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("ar-SA", {
        style: "currency",
        currency: "SAR",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="text-right"
      >
        تاريخ الاستحقاق
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date: Date = row.getValue("dueDate");
      return <div className="text-right">{format(date, "dd MMMM yyyy", { locale: ar })}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const invoice = row.original;

      return (
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">فتح القائمة</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(invoice.id)}
            >
              نسخ رقم الفاتورة
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>عرض تفاصيل الفاتورة</DropdownMenuItem>
            <DropdownMenuItem>تعديل</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">حذف</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// -----------------------------------------------------------------------------
// 4. تعريف مخطط الفلترة (Filter Schema)
// -----------------------------------------------------------------------------

const filterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["all", "pending", "paid", "failed", "draft"]).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

type FilterValues = z.infer<typeof filterSchema>;

// -----------------------------------------------------------------------------
// 5. المكون الرئيسي (InvoicesList)
// -----------------------------------------------------------------------------

export function InvoicesList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>({});

  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      search: "",
      status: "all",
    },
  });

  // محاكاة جلب البيانات من API
  useEffect(() => {
    const fetchInvoices = () => {
      setLoading(true);
      setError(null);
      // محاكاة تأخير الشبكة
      setTimeout(() => {
        try {
          // محاكاة خطأ في بعض الأحيان
          // if (Math.random() < 0.1) throw new Error("فشل في تحميل البيانات.");
          setInvoices(mockInvoices);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setLoading(false);
        }
      }, 1000);
    };

    fetchInvoices();
  }, []);

  // منطق الفلترة
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      // فلترة البحث النصي
      if (filters.search && filters.search.trim() !== "") {
        const searchTerm = filters.search.toLowerCase();
        const matches =
          invoice.id.toLowerCase().includes(searchTerm) ||
          invoice.customerName.toLowerCase().includes(searchTerm) ||
          invoice.service.toLowerCase().includes(searchTerm);
        if (!matches) return false;
      }

      // فلترة الحالة
      if (filters.status && filters.status !== "all") {
        if (invoice.status !== filters.status) return false;
      }

      // فلترة تاريخ البداية
      if (filters.dateFrom) {
        if (invoice.dueDate < filters.dateFrom) return false;
      }

      // فلترة تاريخ النهاية
      if (filters.dateTo) {
        // إضافة يوم واحد لضمان شمول اليوم المحدد
        const dateToPlusOne = new Date(filters.dateTo);
        dateToPlusOne.setDate(dateToPlusOne.getDate() + 1);
        if (invoice.dueDate >= dateToPlusOne) return false;
      }

      return true;
    });
  }, [invoices, filters]);

  const onSubmit = (data: FilterValues) => {
    setFilters(data);
  };

  // -----------------------------------------------------------------------------
  // 6. عرض المكون (Render)
  // -----------------------------------------------------------------------------

  return (
    <DashboardLayout title="قائمة الفواتير" description="عرض جميع الفواتير الصادرة والواردة مع إمكانية الفلترة والبحث.">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">قائمة الفواتير</h1>
          <Button>
            <PlusCircle className="ml-2 h-4 w-4" />
            إنشاء فاتورة جديدة
          </Button>
        </div>

        {/* شريط الفلترة والبحث */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {/* حقل البحث */}
                <FormField
                  control={form.control}
                  name="search"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البحث</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            placeholder="ابحث برقم الفاتورة أو اسم العميل..."
                            className="pr-10 text-right"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* حقل الحالة */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الحالة</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger dir="rtl">
                            <SelectValue placeholder="اختر حالة الفاتورة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent dir="rtl">
                          <SelectItem value="all">جميع الحالات</SelectItem>
                          {Object.entries(statusMap).map(([key, { label }]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* حقل تاريخ من */}
                <FormField
                  control={form.control}
                  name="dateFrom"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="mb-1">تاريخ الاستحقاق من</FormLabel>
                      <Popover dir="rtl">
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full justify-start text-right font-normal ${!field.value && "text-muted-foreground"}`}
                            >
                              <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                              {field.value ? format(field.value, "dd MMMM yyyy", { locale: ar }) : <span>اختر تاريخ</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            locale={ar}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* حقل تاريخ إلى */}
                <FormField
                  control={form.control}
                  name="dateTo"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="mb-1">تاريخ الاستحقاق إلى</FormLabel>
                      <Popover dir="rtl">
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full justify-start text-right font-normal ${!field.value && "text-muted-foreground"}`}
                            >
                              <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                              {field.value ? format(field.value, "dd MMMM yyyy", { locale: ar }) : <span>اختر تاريخ</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            locale={ar}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2 space-x-reverse">
                <Button type="button" variant="outline" onClick={() => form.reset()}>
                  إعادة تعيين
                </Button>
                <Button type="submit">
                  <Search className="ml-2 h-4 w-4" />
                  تطبيق الفلتر
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* عرض حالة التحميل والخطأ */}
        {loading && (
          <div className="flex h-64 items-center justify-center rounded-lg border bg-white">
            <div className="text-center">
              <svg className="mx-auto h-8 w-8 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-sm text-gray-600">جاري تحميل الفواتير...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-400 bg-red-50 p-4 text-red-700">
            <p className="font-bold">خطأ في النظام:</p>
            <p>{error}</p>
            <Button variant="link" onClick={() => window.location.reload()} className="p-0 text-red-700">
              حاول مرة أخرى
            </Button>
          </div>
        )}

        {/* جدول عرض الفواتير */}
        {!loading && !error && (
          <div className="rounded-lg border bg-white shadow-sm">
            <DataTable columns={columns} data={filteredInvoices} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// تصدير المكون افتراضياً
export default InvoicesList;
