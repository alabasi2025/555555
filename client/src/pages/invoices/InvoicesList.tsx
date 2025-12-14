// @ts-nocheck
import React, { useState } from "react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PlusCircle, Search, Calendar, Filter, Trash2, Edit, Eye } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";


// Mock Form Components (Simplified for demonstration)
const InvoiceForm: React.FC<{ invoice?: Invoice; onSubmit: (data: Invoice) => void }> = ({ invoice, onSubmit }) => {
  const [formData, setFormData] = useState<Partial<Invoice>>(invoice || {});

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Basic validation and submission logic
    if (formData.clientName && formData.amount) {
      const newInvoice: Invoice = {
        id: invoice?.id || "inv_" + Date.now(),
        invoiceNumber: invoice?.invoiceNumber || "INV-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 1000),
        currency: formData.currency || "SAR",
        status: formData.status || "pending",
        issueDate: formData.issueDate || new Date().toISOString().split('T')[0],
        dueDate: formData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentMethod: formData.paymentMethod || "تحويل بنكي",
        ...formData,
      } as Invoice;
      onSubmit(newInvoice);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientName">اسم العميل</Label>
          <Input
            id="clientName"
            value={formData.clientName || ""}
            onChange={(e: any) => setFormData({ ...formData, clientName: (e.target as HTMLInputElement).value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">المبلغ</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount || ""}
            onChange={(e: any) => setFormData({ ...formData, amount: parseFloat((e.target as HTMLInputElement).value) })}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">الحالة</Label>
          <Select
            value={formData.status || "pending"}
            onValueChange={(value) => setFormData({ ...formData, status: value as Invoice["status"] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الحالة" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="paid">مدفوعة</SelectItem>
              <SelectItem value="pending">قيد الانتظار</SelectItem>
              <SelectItem value="overdue">متأخرة</SelectItem>
              <SelectItem value="cancelled">ملغاة</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate || ""}
            onChange={(e: any) => setFormData({ ...formData, dueDate: (e.target as HTMLInputElement).value })}
            required
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">{invoice ? "حفظ التعديلات" : "إضافة فاتورة"}</Button>
      </DialogFooter>
    </form>
  );
};

// Main Component
export function InvoicesList() {
  const [data, setData] = useState<Invoice[]>(mockInvoices);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"add" | "edit" | "view" | "delete" | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>(undefined);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // CRUD Operations Handlers (Mocked)
  const handleAddInvoice = (newInvoice: Invoice) => {
    setData((prev) => [...prev, newInvoice]);
    setIsDialogOpen(false);
  };

  const handleEditInvoice = (updatedInvoice: Invoice) => {
    setData((prev) => prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv)));
    setIsDialogOpen(false);
  };

  const handleDeleteInvoice = (id: string) => {
    setData((prev) => prev.filter((inv) => inv.id !== id));
    setIsDialogOpen(false);
  };

  const openDialog = (type: "add" | "edit" | "view" | "delete", invoice?: Invoice) => {
    setDialogType(type);
    setSelectedInvoice(invoice);
    setIsDialogOpen(true);
  };

  const renderDialogContent = () => {
    switch (dialogType) {
      case "add":
        return (
          <>
            <DialogHeader>
              <DialogTitle>إضافة فاتورة جديدة</DialogTitle>
              <DialogDescription>أدخل تفاصيل الفاتورة الجديدة.</DialogDescription>
            </DialogHeader>
            <InvoiceForm onSubmit={handleAddInvoice} />
          </>
        );
      case "edit":
        return (
          <>
            <DialogHeader>
              <DialogTitle>تعديل الفاتورة: {selectedInvoice?.invoiceNumber}</DialogTitle>
              <DialogDescription>قم بتحديث تفاصيل الفاتورة.</DialogDescription>
            </DialogHeader>
            <InvoiceForm invoice={selectedInvoice} onSubmit={handleEditInvoice} />
          </>
        );
      case "delete":
        return (
          <>
            <DialogHeader>
              <DialogTitle>تأكيد الحذف</DialogTitle>
              <DialogDescription>
                هل أنت متأكد من حذف الفاتورة رقم <span className="font-bold">{selectedInvoice?.invoiceNumber}</span>؟ لا يمكن التراجع عن هذا الإجراء.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
              <Button variant="destructive" onClick={() => handleDeleteInvoice(selectedInvoice!.id)}>حذف</Button>
            </DialogFooter>
          </>
        );
      case "view":
        return (
          <>
            <DialogHeader>
              <DialogTitle>تفاصيل الفاتورة: {selectedInvoice?.invoiceNumber}</DialogTitle>
              <DialogDescription>عرض جميع المعلومات المتعلقة بالفاتورة.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between">
                <span className="font-medium">اسم العميل:</span>
                <span>{selectedInvoice?.clientName}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">المبلغ:</span>
                <span>{selectedInvoice?.amount} {selectedInvoice?.currency}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">الحالة:</span>
                <Badge variant={selectedInvoice?.status === "paid" ? "default" : "secondary"}>{selectedInvoice?.status}</Badge>
              </div>
              {/* Add more details here */}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>إغلاق</Button>
            </DialogFooter>
          </>
        );
      default:
        return null;
    }
  };

  // Status Filter Options
  const statusOptions = [
    { value: "paid", label: "مدفوعة" },
    { value: "pending", label: "قيد الانتظار" },
    { value: "overdue", label: "متأخرة" },
    { value: "cancelled", label: "ملغاة" },
  ];

  const handleStatusFilterChange = (value: string) => {
    if (value === "all") {
      table.getColumn("status")?.setFilterValue(undefined);
    } else {
      table.getColumn("status")?.setFilterValue([value]);
    }
  };

  return (
    <div className="w-full p-6 space-y-6 bg-white rounded-lg shadow-lg" dir="rtl">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">قائمة الفواتير</h1>
        <Button onClick={() => openDialog("add")} className="flex items-center space-x-2">
          <PlusCircle className="h-5 w-5 ml-2" />
          <span>إضافة فاتورة جديدة</span>
        </Button>
      </header>

      <div className="flex items-center py-4 space-x-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="ابحث برقم الفاتورة أو اسم العميل..."
            value={(table.getColumn("clientName")?.getFilterValue() as string) ?? ""}
            onChange={(event: any) =>
              table.getColumn("clientName")?.setFilterValue((event.target as HTMLInputElement).value)
            }
            className="pr-10"
          />
        </div>

        {/* Status Filter */}
        <Select onValueChange={handleStatusFilterChange} defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 ml-2" />
            <SelectValue placeholder="فلترة حسب الحالة" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            <SelectItem value="all">جميع الحالات</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Filter (Placeholder) */}
        <Button variant="outline" className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 ml-2" />
          <span>فلترة حسب التاريخ</span>
        </Button>

        {/* Column Visibility Dropdown */}
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              الأعمدة
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {/* Simple mapping for Arabic column names */}
                    {column.id === "invoiceNumber" && "رقم الفاتورة"}
                    {column.id === "clientName" && "اسم العميل"}
                    {column.id === "amount" && "المبلغ"}
                    {column.id === "status" && "الحالة"}
                    {column.id === "issueDate" && "تاريخ الإصدار"}
                    {column.id === "select" && "تحديد"}
                    {column.id === "actions" && "إجراءات"}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Data Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  لا توجد فواتير.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination and Bulk Actions */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} من{" "}
          {table.getFilteredRowModel().rows.length} صفوف محددة.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            السابق
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            التالي
          </Button>
        </div>
      </div>

      {/* CRUD Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} dir="rtl">
        <DialogContent className="sm:max-w-[600px]">
          {renderDialogContent()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Export the component to be used in a DashboardLayout (as requested)
// Note: The actual DashboardLayout component is assumed to exist in the starter kit.
// For a standalone file, we export the component directly.
export default InvoicesList;
