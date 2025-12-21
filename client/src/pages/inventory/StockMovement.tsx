// @ts-nocheck
"use client";

import React, { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ArrowUpDown,
  CalendarIcon,
  Pencil,
  Trash2,
  PlusCircle,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils"; // افتراض وجود دالة مساعدة لدمج الفئات

// 1. تعريف الواجهات (Interfaces)
// -----------------------------------------------------------------------------

type MovementType = "IN" | "OUT";

interface InventoryItem {
  id: string;
  name: string;
  unit: string; // وحدة القياس (مثل: قطعة، كجم، لتر)
  currentStock: number;
}

interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: MovementType;
  quantity: number;
  date: Date;
  notes?: string;
}

// 2. البيانات التجريبية (Mock Data)
// -----------------------------------------------------------------------------

const inventoryItems: InventoryItem[] = [
  { id: "item-1", name: "كمبيوتر محمول (موديل X)", unit: "قطعة", currentStock: 50 },
  { id: "item-2", name: "شاشة عرض 27 بوصة", unit: "قطعة", currentStock: 120 },
  { id: "item-3", name: "كابل شبكة Cat6 (3 متر)", unit: "وحدة", currentStock: 300 },
  { id: "item-4", name: "طابعة ليزر متعددة الوظائف", unit: "قطعة", currentStock: 30 },
];

const initialMovements: StockMovement[] = [
  {
    id: "mov-1",
    itemId: "item-1",
    itemName: "كمبيوتر محمول (موديل X)",
    type: "IN",
    quantity: 10,
    date: new Date("2024-10-01"),
    notes: "شراء دفعة جديدة",
  },
  {
    id: "mov-2",
    itemId: "item-2",
    itemName: "شاشة عرض 27 بوصة",
    type: "OUT",
    quantity: 5,
    date: new Date("2024-10-05"),
    notes: "صرف لقسم المبيعات",
  },
  {
    id: "mov-3",
    itemId: "item-3",
    itemName: "كابل شبكة Cat6 (3 متر)",
    type: "IN",
    quantity: 100,
    date: new Date("2024-10-10"),
    notes: "استلام من المورد",
  },
  {
    id: "mov-4",
    itemId: "item-1",
    itemName: "كمبيوتر محمول (موديل X)",
    type: "OUT",
    quantity: 2,
    date: new Date("2024-10-15"),
    notes: "بيع لعميل",
  },
];

// 3. مخطط التحقق (Zod Schema)
// -----------------------------------------------------------------------------

const MovementSchema = z.object({
  itemId: z.string().min(1, { message: "يجب اختيار الصنف." }),
  type: z.enum(["IN", "OUT"], {
    required_error: "يجب تحديد نوع الحركة.",
  }),
  quantity: z.coerce
    .number()
    .min(1, { message: "يجب أن تكون الكمية أكبر من صفر." }),
  date: z.date({
    required_error: "يجب تحديد تاريخ الحركة.",
  }),
  notes: z.string().max(255).optional(),
});

type MovementFormValues = z.infer<typeof MovementSchema>;

// 4. مكون نموذج الحركة (MovementForm)
// -----------------------------------------------------------------------------

interface MovementFormProps {
  initialData?: StockMovement;
  onSubmit: (data: MovementFormValues) => void;
  onClose: () => void;
}

const MovementForm: React.FC<MovementFormProps> = ({
  initialData,
  onSubmit,
  onClose,
}) => {
  const defaultValues: MovementFormValues = initialData
    ? {
        itemId: initialData.itemId,
        type: initialData.type,
        quantity: initialData.quantity,
        date: initialData.date,
        notes: initialData.notes || "",
      }
    : {
        itemId: "",
        type: "IN",
        quantity: 1,
        date: new Date(),
        notes: "",
      };

  const form = useForm<MovementFormValues>({
    resolver: zodResolver(MovementSchema),
    defaultValues,
  });

  const handleSubmit = (data: MovementFormValues) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
        dir="rtl"
      >
        <FormField
          control={form.control}
          name="itemId"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>الصنف</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger dir="rtl">
                    <SelectValue placeholder="اختر الصنف" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent dir="rtl">
                  {inventoryItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>نوع الحركة</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger dir="rtl">
                    <SelectValue placeholder="اختر نوع الحركة" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent dir="rtl">
                  <SelectItem value="IN">إدخال (وارد)</SelectItem>
                  <SelectItem value="OUT">إخراج (صادر)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>الكمية</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="أدخل الكمية"
                  {...field}
                  dir="rtl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }: { field: any }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-right">تاريخ الحركة</FormLabel>
              <Popover dir="rtl">
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-right font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      dir="rtl"
                    >
                      <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                      {field.value ? (
                        format(field.value, "PPP", { locale: ar })
                      ) : (
                        <span>اختر تاريخاً</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start" dir="rtl">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                    locale={ar}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>ملاحظات (اختياري)</FormLabel>
              <FormControl>
                <Input
                  placeholder="ملاحظات حول الحركة"
                  {...field}
                  dir="rtl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="flex flex-row-reverse justify-between pt-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {initialData ? "حفظ التعديلات" : "إضافة الحركة"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// 5. مكون حركة المخزون الرئيسي (StockMovement)
// -----------------------------------------------------------------------------

const StockMovementComponent: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>(initialMovements);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<StockMovement | undefined>(
    undefined
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<keyof StockMovement>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // 5.1. عمليات CRUD
  // -----------------------------------------------------------------------------

  const addMovement = (data: MovementFormValues) => {
    const item = inventoryItems.find((i) => i.id === data.itemId);
    if (!item) return;

    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      itemId: data.itemId,
      itemName: item.name,
      type: data.type,
      quantity: data.quantity,
      date: data.date,
      notes: data.notes,
    };
    setMovements((prev) => [newMovement, ...prev]);
  };

  const editMovement = (id: string, data: MovementFormValues) => {
    const item = inventoryItems.find((i) => i.id === data.itemId);
    if (!item) return;

    setMovements((prev) =>
      prev.map((mov) =>
        mov.id === id
          ? {
              ...mov,
              itemId: data.itemId,
              itemName: item.name,
              type: data.type,
              quantity: data.quantity,
              date: data.date,
              notes: data.notes,
            }
          : mov
      )
    );
    setEditingMovement(undefined);
  };

  const deleteMovement = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الحركة؟")) {
      setMovements((prev) => prev.filter((mov) => mov.id !== id));
    }
  };

  const handleOpenDialog = (movement?: StockMovement) => {
    setEditingMovement(movement);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMovement(undefined);
  };

  const handleFormSubmit = (data: MovementFormValues) => {
    if (editingMovement) {
      editMovement(editingMovement.id, data);
    } else {
      addMovement(data);
    }
  };

  // 5.2. البحث والفرز
  // -----------------------------------------------------------------------------

  const filteredAndSortedMovements = useMemo(() => {
    let filtered = movements.filter((mov) =>
      mov.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      let comparison = 0;
      if (aValue > bValue) {
        comparison = 1;
      } else if (aValue < bValue) {
        comparison = -1;
      }

      return sortDirection === "desc" ? comparison * -1 : comparison;
    });

    return filtered;
  }, [movements, searchTerm, sortBy, sortDirection]);

  const handleSort = (column: keyof StockMovement) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column: keyof StockMovement) => {
    if (sortBy !== column) return null;
    return (
      <ArrowUpDown
        className={cn("ml-2 h-4 w-4", sortDirection === "desc" ? "rotate-180" : "")}
      />
    );
  };

  // 5.3. عرض المكون
  // -----------------------------------------------------------------------------

  return (
    // محاكاة DashboardLayout
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50" dir="rtl">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="text-right">
            <CardTitle className="text-3xl font-bold text-primary">
              حركات المخزون
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              إدارة وتسجيل جميع حركات إدخال وإخراج الأصناف من المخزون.
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => handleOpenDialog()}
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                إضافة حركة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
              <DialogHeader className="text-right">
                <DialogTitle>
                  {editingMovement ? "تعديل حركة مخزون" : "إضافة حركة مخزون جديدة"}
                </DialogTitle>
                <DialogDescription>
                  املأ الحقول لتسجيل حركة مخزون (إدخال/إخراج).
                </DialogDescription>
              </DialogHeader>
              <MovementForm
                initialData={editingMovement}
                onSubmit={handleFormSubmit}
                onClose={handleCloseDialog}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ابحث بالصنف أو الملاحظات..."
                value={searchTerm}
                onChange={(e: any) => setSearchTerm((e.target as HTMLInputElement).value)}
                className="pr-10"
                dir="rtl"
              />
            </div>
          </div>
          <div className="rounded-md border overflow-x-auto">
            <Table dir="rtl">
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="w-[150px] cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("itemName")}
                  >
                    <div className="flex items-center justify-end">
                      الصنف
                      {getSortIcon("itemName")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-[100px] cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("type")}
                  >
                    <div className="flex items-center justify-end">
                      النوع
                      {getSortIcon("type")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-[100px] cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("quantity")}
                  >
                    <div className="flex items-center justify-end">
                      الكمية
                      {getSortIcon("quantity")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-[150px] cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center justify-end">
                      التاريخ
                      {getSortIcon("date")}
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[200px] text-right">
                    ملاحظات
                  </TableHead>
                  <TableHead className="w-[100px] text-center">
                    الإجراءات
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedMovements.length ? (
                  filteredAndSortedMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="font-medium text-right">
                        {movement.itemName}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-semibold",
                            movement.type === "IN"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          )}
                        >
                          {movement.type === "IN" ? "إدخال" : "إخراج"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {movement.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {format(movement.date, "PPP", { locale: ar })}
                      </TableCell>
                      <TableCell className="text-right">
                        {movement.notes || "-"}
                      </TableCell>
                      <TableCell className="text-center space-x-2 space-x-reverse">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(movement)}
                          title="تعديل"
                        >
                          <Pencil className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMovement(movement.id)}
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      لا توجد حركات مطابقة.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* محاكاة التجاوب (Pagination) */}
          <div className="flex items-center justify-between space-x-2 py-4 text-sm text-muted-foreground">
            <div className="flex-1 text-right">
              عرض {filteredAndSortedMovements.length} من {movements.length} حركة.
            </div>
            {/* يمكن إضافة مكونات Pagination هنا */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockMovementComponent;
