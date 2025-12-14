// @ts-nocheck
// هذا الملف هو مكون React كامل جاهز للاستخدام

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { CalendarIcon, ClockIcon, MoreHorizontal, PlusCircle, Search } from "lucide-react";

// استيراد مكونات shadcn/ui (نفترض أنها موجودة في @/components/ui)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// =================================================================
// 1. المخطط والأنواع (Schema & Types)
// =================================================================

// رسائل خطأ عربية لـ Zod
const arMessages = {
  required: "هذا الحقل مطلوب",
  min: (min: number) => `يجب أن لا يقل عن ${min} أحرف`,
  max: (max: number) => `يجب أن لا يزيد عن ${max} أحرف`,
  invalid_date: "تاريخ غير صالح",
  invalid_enum: "قيمة غير صالحة",
  invalid_time: "صيغة الوقت غير صحيحة (HH:MM)",
};

// مخطط نموذج التذكير
const reminderFormSchema = z.object({
  title: z.string().min(1, { message: arMessages.required }).max(100, { message: arMessages.max(100) }),
  description: z.string().max(500, { message: arMessages.max(500) }).optional(),
  date: z.date({ required_error: arMessages.required, invalid_type_error: arMessages.invalid_date }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: arMessages.invalid_time }),
  priority: z.enum(["عالية", "متوسطة", "منخفضة"], { required_error: arMessages.required, invalid_type_error: arMessages.invalid_enum }),
  contact: z.string().optional(),
});

type ReminderFormValues = z.infer<typeof reminderFormSchema>;

// نوع بيانات التذكير للجدول
type Reminder = {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: "عالية" | "متوسطة" | "منخفضة";
  status: "مكتمل" | "قيد المتابعة" | "مؤجل";
  contact?: string;
  createdAt: Date;
};

// =================================================================
// 2. البيانات الوهمية (Dummy Data)
// =================================================================

const dummyReminders: Reminder[] = [
  {
    id: "r-001",
    title: "متابعة عرض سعر العميل أحمد",
    description: "الاتصال بالعميل أحمد بخصوص عرض سعر مشروع تطوير الموقع.",
    dueDate: new Date(2025, 11, 18, 10, 30), // 18 ديسمبر 2025
    priority: "عالية",
    status: "قيد المتابعة",
    contact: "أحمد العلي (0501234567)",
    createdAt: new Date(2025, 11, 10),
  },
  {
    id: "r-002",
    title: "اجتماع الفريق الأسبوعي",
    description: "تحضير تقرير الإنجازات الأسبوعي ومناقشة خطة الأسبوع القادم.",
    dueDate: new Date(2025, 11, 15, 9, 0), // 15 ديسمبر 2025
    priority: "متوسطة",
    status: "مكتمل",
    contact: "فريق العمل",
    createdAt: new Date(2025, 11, 8),
  },
  {
    id: "r-003",
    title: "تجديد اشتراك الخادم",
    description: "مراجعة فاتورة تجديد اشتراك خادم الإنتاج والدفع قبل الموعد النهائي.",
    dueDate: new Date(2025, 11, 25, 14, 0), // 25 ديسمبر 2025
    priority: "عالية",
    status: "مؤجل",
    contact: "قسم المالية",
    createdAt: new Date(2025, 11, 12),
  },
  {
    id: "r-004",
    title: "إرسال تقرير الأداء الشهري",
    description: "تجميع بيانات الأداء وإرسالها للإدارة العليا.",
    dueDate: new Date(2025, 11, 30, 17, 0), // 30 ديسمبر 2025
    priority: "منخفضة",
    status: "قيد المتابعة",
    contact: "المدير العام",
    createdAt: new Date(2025, 11, 14),
  },
];

// =================================================================
// 3. مكون نموذج إضافة تذكير (Add Reminder Form Component)
// =================================================================

const AddReminderForm = ({ onReminderAdded }: { onReminderAdded: (data: ReminderFormValues) => void }) => {
  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      title: "",
      description: "",
      time: "09:00",
      priority: "متوسطة",
      contact: "",
    },
  });

  const onSubmit = (data: ReminderFormValues) => {
    console.log("بيانات التذكير المرسلة:", data);
    onReminderAdded(data);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>عنوان التذكير</FormLabel>
              <FormControl>
                <Input placeholder="مثال: متابعة العميل خالد" {...field} />
              </FormControl>
              <FormMessage dir="rtl" />
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
                <Textarea placeholder="تفاصيل التذكير..." {...field} />
              </FormControl>
              <FormMessage dir="rtl" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-right">تاريخ التذكير</FormLabel>
                <Popover dir="rtl">
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full justify-start text-right font-normal ${!field.value && "text-muted-foreground"}`}
                      >
                        <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                        {field.value ? format(field.value, "PPP", { locale: ar }) : <span>اختر تاريخًا</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      locale={ar}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage dir="rtl" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الوقت</FormLabel>
                <FormControl>
                  <div className="relative">
                    <ClockIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input type="time" placeholder="HH:MM" className="pr-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage dir="rtl" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الأولوية</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} dir="rtl">
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الأولوية" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="عالية">عالية</SelectItem>
                    <SelectItem value="متوسطة">متوسطة</SelectItem>
                    <SelectItem value="منخفضة">منخفضة</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage dir="rtl" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>جهة الاتصال/المعني (اختياري)</FormLabel>
              <FormControl>
                <Input placeholder="مثال: خالد محمد أو قسم المبيعات" {...field} />
              </FormControl>
              <FormDescription dir="rtl">
                الشخص أو الجهة المرتبطة بهذا التذكير.
              </FormDescription>
              <FormMessage dir="rtl" />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          <PlusCircle className="ml-2 h-4 w-4" />
          إضافة تذكير جديد
        </Button>
      </form>
    </Form>
  );
};

// =================================================================
// 4. مكون جدول التذكيرات (Reminders Table Component)
// =================================================================

const ReminderTable = ({ data }: { data: Reminder[] }) => {
  const getPriorityBadge = (priority: Reminder["priority"]) => {
    switch (priority) {
      case "عالية":
        return <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">عالية</Badge>;
      case "متوسطة":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900">متوسطة</Badge>;
      case "منخفضة":
        return <Badge variant="secondary">منخفضة</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: Reminder["status"]) => {
    switch (status) {
      case "مكتمل":
        return <Badge className="bg-green-500 hover:bg-green-600">مكتمل</Badge>;
      case "قيد المتابعة":
        return <Badge variant="outline" className="border-blue-500 text-blue-600">قيد المتابعة</Badge>;
      case "مؤجل":
        return <Badge variant="secondary" className="bg-gray-400 hover:bg-gray-500">مؤجل</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table dir="rtl">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px] text-right">العنوان</TableHead>
            <TableHead className="w-[150px] text-right">تاريخ الاستحقاق</TableHead>
            <TableHead className="w-[100px] text-right">الأولوية</TableHead>
            <TableHead className="w-[120px] text-right">الحالة</TableHead>
            <TableHead className="text-right hidden md:table-cell">جهة الاتصال</TableHead>
            <TableHead className="text-right w-[50px]">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((reminder) => (
            <TableRow key={reminder.id}>
              <TableCell className="font-medium">
                {reminder.title}
                <p className="text-sm text-muted-foreground truncate max-w-xs">{reminder.description}</p>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end md:justify-start">
                  <CalendarIcon className="ml-1 h-4 w-4 text-muted-foreground hidden md:inline" />
                  {format(reminder.dueDate, "dd MMMM yyyy", { locale: ar })}
                  <span className="text-sm text-muted-foreground mr-2">
                    ({format(reminder.dueDate, "HH:mm")})
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">{getPriorityBadge(reminder.priority)}</TableCell>
              <TableCell className="text-right">{getStatusBadge(reminder.status)}</TableCell>
              <TableCell className="hidden md:table-cell text-right">{reminder.contact || "لا يوجد"}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu dir="rtl">
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">فتح القائمة</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => console.log("عرض تفاصيل", reminder.id)}>
                      عرض التفاصيل
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log("تغيير الحالة", reminder.id)}>
                      تغيير الحالة
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={() => console.log("حذف", reminder.id)}>
                      حذف التذكير
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// =================================================================
// 5. المكون الرئيسي (Main Component)
// =================================================================

const RemindersAndFollowUpScreen = () => {
  const [reminders, setReminders] = React.useState<Reminder[]>(dummyReminders);
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleReminderAdded = (data: ReminderFormValues) => {
    const newReminder: Reminder = {
      id: `r-${Date.now()}`,
      title: data.title,
      description: data.description,
      dueDate: new Date(data.date.getFullYear(), data.date.getMonth(), data.date.getDate(), parseInt(data.time.split(":")[0]), parseInt(data.time.split(":")[1])),
      priority: data.priority,
      status: "قيد المتابعة",
      contact: data.contact,
      createdAt: new Date(),
    };
    setReminders((prev) => [newReminder, ...prev]);
    console.log("تمت إضافة تذكير جديد:", newReminder);
  };

  const filteredReminders = reminders.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto" dir="rtl">
      {/* العنوان الرئيسي */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <h1 className="text-3xl font-bold">شاشة التذكيرات والمتابعة</h1>
        <Dialog dir="rtl">
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <PlusCircle className="ml-2 h-4 w-4" />
              إضافة تذكير جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>إنشاء تذكير ومتابعة جديد</DialogTitle>
            </DialogHeader>
            <AddReminderForm onReminderAdded={handleReminderAdded} />
          </DialogContent>
        </Dialog>
      </header>

      <Separator />

      {/* قسم الجدول */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-semibold">قائمة التذكيرات</CardTitle>
          <div className="relative w-full max-w-sm">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ابحث عن تذكير..."
              className="w-full pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <ReminderTable data={filteredReminders} />
          {filteredReminders.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              لا توجد تذكيرات مطابقة لنتائج البحث.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RemindersAndFollowUpScreen;
