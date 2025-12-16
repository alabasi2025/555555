import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, PlusCircle } from "lucide-react";

// استيراد المكونات من shadcn/ui
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table"; // افتراض وجود هذا المكون
import DashboardLayout from "@/components/DashboardLayout"; // استخدام DashboardLayout

// افتراض وجود ملف trpc.ts في المسار الصحيح
import { api } from "@/lib/trpc";

// -----------------------------------------------------------------------------
// 1. تعريف أنواع البيانات (Mock)
// -----------------------------------------------------------------------------

type WorkOrderStatus = "جديد" | "قيد التنفيذ" | "مكتمل" | "ملغى";
type WorkOrderPriority = "عاجل" | "مرتفع" | "متوسط" | "منخفض";

interface WorkOrder {
  id: string;
  title: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  createdAt: Date;
  description: string;
}

// -----------------------------------------------------------------------------
// 2. تعريف أعمدة الجدول (TanStack Table)
// -----------------------------------------------------------------------------

const getStatusBadge = (status: WorkOrderStatus) => {
  switch (status) {
    case "جديد":
      return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">{status}</Badge>;
    case "قيد التنفيذ":
      return <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">{status}</Badge>;
    case "مكتمل":
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600">{status}</Badge>;
    case "ملغى":
      return <Badge variant="default" className="bg-red-500 hover:bg-red-600">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getPriorityBadge = (priority: WorkOrderPriority) => {
  switch (priority) {
    case "عاجل":
      return <Badge variant="destructive">{priority}</Badge>;
    case "مرتفع":
      return <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">{priority}</Badge>;
    case "متوسط":
      return <Badge variant="default" className="bg-lime-500 hover:bg-lime-600">{priority}</Badge>;
    case "منخفض":
      return <Badge variant="secondary">{priority}</Badge>;
    default:
      return <Badge variant="secondary">{priority}</Badge>;
  }
};

const columns: ColumnDef<WorkOrder>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          عنوان أمر العمل
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-right">{row.getValue("title")}</div>,
  },
  {
    accessorKey: "status",
    header: "الحالة",
    cell: ({ row }) => <div className="text-right">{getStatusBadge(row.getValue("status"))}</div>,
  },
  {
    accessorKey: "priority",
    header: "الأولوية",
    cell: ({ row }) => <div className="text-right">{getPriorityBadge(row.getValue("priority"))}</div>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          تاريخ الإنشاء
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      const formatted = date.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    header: "الإجراءات",
    cell: ({ row }) => {
      const workOrder = row.original;

      return (
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">فتح القائمة</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(workOrder.id)}
            >
              نسخ معرف أمر العمل
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DialogTrigger asChild>
              <DropdownMenuItem onClick={() => handleEdit(workOrder)}>
                تعديل
              </DropdownMenuItem>
            </DialogTrigger>
            <DropdownMenuItem onClick={() => handleDelete(workOrder.id)}>
              حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// -----------------------------------------------------------------------------
// 3. نموذج إضافة/تعديل البيانات
// -----------------------------------------------------------------------------

interface WorkOrderFormProps {
  initialData?: WorkOrder | null;
  onSave: (data: Omit<WorkOrder, "id" | "createdAt">) => void;
  onClose: () => void;
}

const WorkOrderForm: React.FC<WorkOrderFormProps> = ({
  initialData,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [status, setStatus] = useState<WorkOrderStatus>(
    initialData?.status || "جديد"
  );
  const [priority, setPriority] = useState<WorkOrderPriority>(
    initialData?.priority || "متوسط"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, description, status, priority });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="title">عنوان أمر العمل</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          dir="rtl"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">الوصف</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          dir="rtl"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="status">الحالة</Label>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as WorkOrderStatus)}
            dir="rtl"
          >
            <SelectTrigger id="status" dir="rtl">
              <SelectValue placeholder="اختر الحالة" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="جديد">جديد</SelectItem>
              <SelectItem value="قيد التنفيذ">قيد التنفيذ</SelectItem>
              <SelectItem value="مكتمل">مكتمل</SelectItem>
              <SelectItem value="ملغى">ملغى</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="priority">الأولوية</Label>
          <Select
            value={priority}
            onValueChange={(value) => setPriority(value as WorkOrderPriority)}
            dir="rtl"
          >
            <SelectTrigger id="priority" dir="rtl">
              <SelectValue placeholder="اختر الأولوية" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="عاجل">عاجل</SelectItem>
              <SelectItem value="مرتفع">مرتفع</SelectItem>
              <SelectItem value="متوسط">متوسط</SelectItem>
              <SelectItem value="منخفض">منخفض</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" className="w-full">
        {initialData ? "حفظ التعديلات" : "إضافة أمر عمل"}
      </Button>
    </form>
  );
};

// -----------------------------------------------------------------------------
// 4. المكون الرئيسي WorkOrdersList
// -----------------------------------------------------------------------------

const WorkOrdersList = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(
    null
  );

  // 2. استخدام tRPC للاتصال بالـ API (افتراضي)
  // نفترض وجود workOrders.list و workOrders.create و workOrders.update و workOrders.delete
  // سنستخدم بيانات وهمية لغرض العرض
  const mockData: WorkOrder[] = [
    {
      id: "WO-001",
      title: "صيانة دورية للمولد رقم 3",
      status: "قيد التنفيذ",
      priority: "عاجل",
      createdAt: new Date("2025-12-10T10:00:00Z"),
      description: "فحص واستبدال الزيوت والفلاتر للمولد رقم 3.",
    },
    {
      id: "WO-002",
      title: "تركيب عداد جديد في محطة فرعية (أ)",
      status: "جديد",
      priority: "مرتفع",
      createdAt: new Date("2025-12-12T14:30:00Z"),
      description: "تركيب عداد كهرباء ذكي جديد.",
    },
    {
      id: "WO-003",
      title: "إصلاح عطل في لوحة التحكم الرئيسية",
      status: "مكتمل",
      priority: "متوسط",
      createdAt: new Date("2025-12-08T08:00:00Z"),
      description: "تم إصلاح العطل بنجاح.",
    },
    {
      id: "WO-004",
      title: "فحص نظام التبريد للمحول رقم 5",
      status: "ملغى",
      priority: "منخفض",
      createdAt: new Date("2025-12-05T11:00:00Z"),
      description: "تم إلغاء الأمر بسبب عدم توفر قطع الغيار.",
    },
  ];

  // استخدام tRPC (افتراضي)
  // const { data: workOrders, isLoading } = api.workOrders.list.useQuery();
  const workOrders = mockData;
  const isLoading = false;

  const handleAdd = () => {
    setEditingWorkOrder(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (workOrder: WorkOrder) => {
    setEditingWorkOrder(workOrder);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(`هل أنت متأكد من حذف أمر العمل رقم ${id}؟`)) {
      // api.workOrders.delete.mutate({ id });
      console.log(`حذف أمر العمل: ${id}`);
    }
  };

  const handleSave = (data: Omit<WorkOrder, "id" | "createdAt">) => {
    if (editingWorkOrder) {
      // api.workOrders.update.mutate({ id: editingWorkOrder.id, ...data });
      console.log("تعديل أمر عمل:", { id: editingWorkOrder.id, ...data });
    } else {
      // api.workOrders.create.mutate(data);
      console.log("إضافة أمر عمل جديد:", data);
    }
  };

  if (isLoading) {
    return <DashboardLayout title="قائمة أوامر العمل">جاري تحميل البيانات...</DashboardLayout>;
  }

  return (
    <DashboardLayout title="قائمة أوامر العمل">
      <div className="flex justify-end mb-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <PlusCircle className="ml-2 h-4 w-4" />
              إضافة أمر عمل جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]" dir="rtl">
            <DialogHeader className="text-right">
              <DialogTitle>
                {editingWorkOrder ? "تعديل أمر عمل" : "إضافة أمر عمل جديد"}
              </DialogTitle>
              <DialogDescription>
                املأ الحقول المطلوبة لإدارة أمر العمل.
              </DialogDescription>
            </DialogHeader>
            <WorkOrderForm
              initialData={editingWorkOrder}
              onSave={handleSave}
              onClose={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* 3. جدول لعرض البيانات باستخدام TanStack Table */}
      <div className="rounded-md border">
        <DataTable columns={columns} data={workOrders} filterColumn="title" filterPlaceholder="البحث بالعنوان..." />
      </div>
    </DashboardLayout>
  );
};

export default WorkOrdersList;
