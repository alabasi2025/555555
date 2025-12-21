// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Calendar as CalendarIcon, Users, Briefcase, Clock, MapPin, AlertTriangle, CheckCircle, XCircle, Plus, CalendarDays } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// استيراد مكونات shadcn/ui (نفترض أنها موجودة في @/components)
// بما أننا نعمل في بيئة وهمية، سنقوم بتعريف المكونات الأساسية أو استخدام أسماءها مباشرة
// في بيئة React حقيقية، يجب استبدال هذه بـ: import { Button, Card, ... } from '@/components/ui'

// تعريفات وهمية للمكونات الأساسية
const Button = (props: any) => <button {...props} className={`p-2 rounded ${props.className}`}>{props.children}</button>;
const Card = (props: any) => <div {...props} className={`bg-white shadow-lg rounded-xl p-6 ${props.className}`}>{props.children}</div>;
const CardHeader = (props: any) => <div {...props} className={`mb-4 border-b pb-2 ${props.className}`}>{props.children}</div>;
const CardTitle = (props: any) => <h2 {...props} className={`text-xl font-bold ${props.className}`}>{props.children}</h2>;
const CardContent = (props: any) => <div {...props} className={`mt-4 ${props.className}`}>{props.children}</div>;
const Input = (props: any) => <input {...props} className={`w-full p-2 border rounded ${props.className}`} />;
const Textarea = (props: any) => <textarea {...props} className={`w-full p-2 border rounded ${props.className}`} />;
const Label = (props: any) => <label {...props} className={`block text-sm font-medium mb-1 ${props.className}`}>{props.children}</label>;
const Select = (props: any) => <select {...props} className={`w-full p-2 border rounded ${props.className}`}>{props.children}</select>;
const Dialog = (props: any) => props.open ? <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">{props.children}</div> : null;
const DialogContent = (props: any) => <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4">{props.children}</div>;
const DialogHeader = (props: any) => <div className="border-b pb-2 mb-4">{props.children}</div>;
const DialogTitle = (props: any) => <h3 className="text-lg font-semibold">{props.children}</h3>;
const DialogFooter = (props: any) => <div className="flex justify-end space-x-2 mt-4">{props.children}</div>;
const Form = (props: any) => <form {...props}>{props.children}</form>;
const FormField = (props: any) => <div className="mb-4">{props.children}</div>;
const FormItem = (props: any) => <div className="space-y-2">{props.children}</div>;
const FormLabel = Label;
const FormControl = (props: any) => <div {...props}>{props.children}</div>;
const FormMessage = (props: any) => <p className="text-red-500 text-xs mt-1">{props.children}</p>;
const Popover = (props: any) => <div className="relative">{props.children}</div>;
const PopoverContent = (props: any) => <div className="absolute z-10 bg-white shadow-xl rounded-lg p-4 mt-2 border">{props.children}</div>;
const Calendar = (props: any) => <div className="p-2 border rounded bg-gray-50 text-center">تقويم وهمي: {props.date?.toLocaleDateString('ar-EG')}</div>;
const Badge = (props: any) => <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${props.className}`}>{props.children}</span>;

// -----------------------------------------------------------------------------
// 1. تعريف أنواع البيانات (Types)
// -----------------------------------------------------------------------------

interface Technician {
  id: string;
  name: string; // اسم الفني
  status: 'available' | 'busy' | 'on_leave'; // الحالة
  status_ar: string; // الحالة بالعربية
  skills: string[]; // المهارات
  color: string; // لون لتمييزه في التقويم
}

interface ServiceRequest {
  id: string;
  description: string; // الوصف
  location: string; // الموقع
  duration_minutes: number; // المدة بالدقائق
  priority: 'high' | 'medium' | 'low'; // الأولوية
  priority_ar: string; // الأولوية بالعربية
  status: 'pending' | 'scheduled' | 'completed'; // حالة الطلب
  scheduled_time?: Date; // وقت الجدولة
  technician_id?: string; // الفني المعين
}

interface LeaveRequest {
  id: string;
  technician_id: string;
  start_date: Date; // تاريخ البدء
  end_date: Date; // تاريخ الانتهاء
  reason: string; // السبب
  status: 'pending' | 'approved' | 'rejected'; // حالة الطلب
}

interface ScheduleSlot {
  id: string;
  technician_id: string;
  request_id: string;
  start: Date;
  end: Date;
  title: string; // عنوان الفعالية
  type: 'request' | 'leave'; // نوع الفعالية
}

// -----------------------------------------------------------------------------
// 2. البيانات التجريبية (Mock Data)
// -----------------------------------------------------------------------------

const MOCK_TECHNICIANS: Technician[] = [
  { id: 't1', name: 'أحمد السالم', status: 'available', status_ar: 'متاح', skills: ['كهرباء', 'سباكة'], color: 'bg-blue-500' },
  { id: 't2', name: 'فاطمة الزهراني', status: 'busy', status_ar: 'مشغول', skills: ['تكييف', 'تبريد'], color: 'bg-green-500' },
  { id: 't3', name: 'خالد العتيبي', status: 'on_leave', status_ar: 'في إجازة', skills: ['شبكات', 'صيانة حاسوب'], color: 'bg-red-500' },
  { id: 't4', name: 'سارة محمد', status: 'available', status_ar: 'متاح', skills: ['كهرباء', 'تكييف'], color: 'bg-yellow-500' },
];

const MOCK_REQUESTS: ServiceRequest[] = [
  {
    id: 'r1',
    description: 'إصلاح عطل كهربائي في الطابق الأول',
    location: 'الرياض، حي النرجس',
    duration_minutes: 90,
    priority: 'high',
    priority_ar: 'عالية',
    status: 'pending',
  },
  {
    id: 'r2',
    description: 'صيانة دورية لوحدة التكييف المركزية',
    location: 'جدة، شارع الأمير سلطان',
    duration_minutes: 120,
    priority: 'medium',
    priority_ar: 'متوسطة',
    status: 'scheduled',
    scheduled_time: new Date(new Date().setHours(10, 0, 0, 0)),
    technician_id: 't2',
  },
  {
    id: 'r3',
    description: 'تركيب نقطة شبكة جديدة في المكتب 305',
    location: 'الدمام، طريق الملك فهد',
    duration_minutes: 60,
    priority: 'low',
    priority_ar: 'منخفضة',
    status: 'pending',
  },
];

const MOCK_LEAVES: LeaveRequest[] = [
  {
    id: 'l1',
    technician_id: 't3',
    start_date: new Date(new Date().setDate(new Date().getDate() - 1)),
    end_date: new Date(new Date().setDate(new Date().getDate() + 5)),
    reason: 'إجازة سنوية',
    status: 'approved',
  },
];

const MOCK_SCHEDULE: ScheduleSlot[] = [
  {
    id: 's1',
    technician_id: 't2',
    request_id: 'r2',
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(12, 0, 0, 0)),
    title: 'صيانة تكييف (رقم r2)',
    type: 'request',
  },
  {
    id: 's2',
    technician_id: 't3',
    request_id: '', // لا يوجد طلب خدمة
    start: new Date(new Date().setDate(new Date().getDate() + 1)),
    end: new Date(new Date().setDate(new Date().getDate() + 1)),
    title: 'إجازة خالد العتيبي',
    type: 'leave',
  },
];

// -----------------------------------------------------------------------------
// 3. تعريف مخططات Zod ونماذج Form
// -----------------------------------------------------------------------------

// رسائل الخطأ باللغة العربية
const ARABIC_ERROR_MAP = {
  required: 'هذا الحقل مطلوب.',
  invalid_date: 'التاريخ غير صالح.',
  invalid_string: 'القيمة المدخلة غير صالحة.',
  min_length: (min: number) => `يجب أن لا يقل عن ${min} أحرف.`,
  max_length: (max: number) => `يجب أن لا يزيد عن ${max} أحرف.`,
  date_order: 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء.',
};

// مخطط إضافة طلب إجازة
const LeaveRequestSchema = z.object({
  technician_id: z.string().min(1, { message: ARABIC_ERROR_MAP.required }),
  start_date: z.date({ required_error: ARABIC_ERROR_MAP.required, invalid_type_error: ARABIC_ERROR_MAP.invalid_date }),
  end_date: z.date({ required_error: ARABIC_ERROR_MAP.required, invalid_type_error: ARABIC_ERROR_MAP.invalid_date }),
  reason: z.string().min(5, { message: ARABIC_ERROR_MAP.min_length(5) }),
}).refine((data) => data.end_date > data.start_date, {
  message: ARABIC_ERROR_MAP.date_order,
  path: ['end_date'],
});

type LeaveRequestFormValues = z.infer<typeof LeaveRequestSchema>;

// مخطط تعيين طلب خدمة
const ScheduleRequestSchema = z.object({
  request_id: z.string().min(1, { message: ARABIC_ERROR_MAP.required }),
  technician_id: z.string().min(1, { message: ARABIC_ERROR_MAP.required }),
  scheduled_time: z.date({ required_error: ARABIC_ERROR_MAP.required, invalid_type_error: ARABIC_ERROR_MAP.invalid_date }),
});

type ScheduleRequestFormValues = z.infer<typeof ScheduleRequestSchema>;

// -----------------------------------------------------------------------------
// 4. المكونات الفرعية (Sub-Components)
// -----------------------------------------------------------------------------

// مكون عرض تفاصيل الطلب
const RequestDetails = ({ request }: { request: ServiceRequest }) => (
  <div className="space-y-3 text-right">
    <h4 className="text-lg font-semibold text-gray-800">{request.description}</h4>
    <div className="flex items-center justify-end text-sm text-gray-600">
      <MapPin className="w-4 h-4 ml-2" />
      <span>{request.location}</span>
    </div>
    <div className="flex items-center justify-end text-sm text-gray-600">
      <Clock className="w-4 h-4 ml-2" />
      <span>{request.duration_minutes} دقيقة</span>
    </div>
    <Badge className={`mr-2 ${request.priority === 'high' ? 'bg-red-100 text-red-800' : request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
      {request.priority_ar}
    </Badge>
    <Badge className={`mr-2 ${request.status === 'pending' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>
      {request.status === 'pending' ? 'معلق' : 'مجدول'}
    </Badge>
  </div>
);

// مكون بطاقة الفني
const TechnicianCard = ({ technician }: { technician: Technician }) => (
  <Card className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
    <div className="flex items-center">
      <div className={`w-3 h-3 rounded-full ml-3 ${technician.color}`} />
      <div>
        <p className="font-medium">{technician.name}</p>
        <p className="text-xs text-gray-500">{technician.skills.join('، ')}</p>
      </div>
    </div>
    <Badge className={`text-xs ${technician.status === 'available' ? 'bg-green-100 text-green-800' : technician.status === 'busy' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
      {technician.status_ar}
    </Badge>
  </Card>
);

// مكون نموذج إضافة إجازة
const LeaveForm = ({ technicians, onClose }: { technicians: Technician[], onClose: () => void }) => {
  const form = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(LeaveRequestSchema),
    defaultValues: {
      technician_id: '',
      start_date: new Date(),
      end_date: new Date(),
      reason: '',
    },
  });

  const onSubmit = (data: LeaveRequestFormValues) => {
    console.log('بيانات طلب الإجازة:', data);
    // هنا يتم إرسال البيانات إلى الخادم
    alert('تم إرسال طلب الإجازة بنجاح (وهمي)');
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-right">
        <FormField
          control={form.control}
          name="technician_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الفني</FormLabel>
              <FormControl>
                <Select {...field} dir="rtl">
                  <option value="">اختر فني</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </Select>
              </FormControl>
              <FormMessage>{form.formState.errors.technician_id?.message}</FormMessage>
            </FormItem>
          )}
        />

        <div className="flex space-x-4 space-x-reverse">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>تاريخ البدء</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value ? field.value.toISOString().split('T')[0] : ''}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.start_date?.message}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>تاريخ الانتهاء</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value ? field.value.toISOString().split('T')[0] : ''}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.end_date?.message}</FormMessage>
              </FormItem>
            )}
          />
        </div>
        <FormMessage>{form.formState.errors.end_date?.message}</FormMessage> {/* لعرض خطأ الترتيب */}

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>السبب</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="أدخل سبب الإجازة" dir="rtl" />
              </FormControl>
              <FormMessage>{form.formState.errors.reason?.message}</FormMessage>
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 hover:bg-gray-300">إلغاء</Button>
          <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">إرسال الطلب</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// مكون نموذج تعيين طلب
const ScheduleForm = ({ requests, technicians, onClose, initialRequestId }: { requests: ServiceRequest[], technicians: Technician[], onClose: () => void, initialRequestId?: string }) => {
  const form = useForm<ScheduleRequestFormValues>({
    resolver: zodResolver(ScheduleRequestSchema),
    defaultValues: {
      request_id: initialRequestId || '',
      technician_id: '',
      scheduled_time: new Date(),
    },
  });

  const onSubmit = (data: ScheduleRequestFormValues) => {
    console.log('بيانات الجدولة:', data);
    // هنا يتم إرسال البيانات إلى الخادم
    alert('تم تعيين الطلب بنجاح (وهمي)');
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-right">
        <FormField
          control={form.control}
          name="request_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>طلب الخدمة</FormLabel>
              <FormControl>
                <Select {...field} dir="rtl" disabled={!!initialRequestId}>
                  <option value="">اختر طلب خدمة</option>
                  {requests.filter(r => r.status === 'pending' || r.id === initialRequestId).map((r) => (
                    <option key={r.id} value={r.id}>{r.description} ({r.location})</option>
                  ))}
                </Select>
              </FormControl>
              <FormMessage>{form.formState.errors.request_id?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="technician_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الفني المعين</FormLabel>
              <FormControl>
                <Select {...field} dir="rtl">
                  <option value="">اختر فني</option>
                  {technicians.filter(t => t.status !== 'on_leave').map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.status_ar})</option>
                  ))}
                </Select>
              </FormControl>
              <FormMessage>{form.formState.errors.technician_id?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scheduled_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تاريخ ووقت البدء</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  // تحويل التاريخ إلى تنسيق datetime-local
                  value={field.value ? new Date(field.value.getTime() - (field.value.getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.scheduled_time?.message}</FormMessage>
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 hover:bg-gray-300">إلغاء</Button>
          <Button type="submit" className="bg-green-600 text-white hover:bg-green-700">تعيين</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// -----------------------------------------------------------------------------
// 5. المكون الرئيسي (TechnicianSchedulingScreen)
// -----------------------------------------------------------------------------

const TechnicianSchedulingScreen: React.FC = () => {
  const [technicians, setTechnicians] = useState<Technician[]>(MOCK_TECHNICIANS);
  const [requests, setRequests] = useState<ServiceRequest[]>(MOCK_REQUESTS);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>(MOCK_SCHEDULE);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedPendingRequestId, setSelectedPendingRequestId] = useState<string | undefined>(undefined);

  // الطلبات المعلقة
  const pendingRequests = useMemo(() => requests.filter(r => r.status === 'pending'), [requests]);

  // دالة وهمية لتحسين التوزيع
  const handleOptimize = () => {
    alert('تم تشغيل خوارزمية تحسين التوزيع (وهمي).');
    // في التطبيق الحقيقي، يتم هنا استدعاء API لتحسين الجدولة
  };

  // مكون عرض أحداث التقويم (وهمي)
  const CalendarView = ({ schedule, technicians }: { schedule: ScheduleSlot[], technicians: Technician[] }) => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>تقويم الجدولة</span>
            <span className="text-sm font-normal text-gray-500">{formattedDate}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto">
          <div className="space-y-4">
            {schedule.length === 0 ? (
              <p className="text-center text-gray-500 p-10">لا توجد فعاليات مجدولة لهذا اليوم.</p>
            ) : (
              schedule.map((slot) => {
                const technician = technicians.find(t => t.id === slot.technician_id);
                const request = requests.find(r => r.id === slot.request_id);
                const bgColor = technician?.color || 'bg-gray-400';

                return (
                  <div key={slot.id} className={`p-3 rounded-lg shadow-md ${bgColor} bg-opacity-10 border-r-4 ${bgColor.replace('bg-', 'border-')}`}>
                    <div className="flex justify-between items-start text-right">
                      <div>
                        <p className="font-semibold text-gray-800">{slot.title}</p>
                        <p className="text-sm text-gray-600">
                          {slot.start.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })} -
                          {slot.end.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        <Users className="w-4 h-4 inline ml-1" />
                        {technician?.name || 'فني غير معروف'}
                      </div>
                    </div>
                    {slot.type === 'request' && request && (
                      <p className="text-xs text-gray-500 mt-1 truncate">الموقع: {request.location}</p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // مكون قائمة الطلبات المعلقة
  const PendingRequestsList = () => (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>طلبات الخدمة المعلقة ({pendingRequests.length})</span>
          <Button
            onClick={handleOptimize}
            className="bg-purple-600 text-white hover:bg-purple-700 text-sm p-2"
          >
            تحسين التوزيع
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-4">
        {pendingRequests.length === 0 ? (
          <p className="text-center text-gray-500 p-10">لا توجد طلبات معلقة حاليًا.</p>
        ) : (
          pendingRequests.map((request) => (
            <Card key={request.id} className="p-4 border border-gray-200 hover:border-blue-400 transition-colors">
              <RequestDetails request={request} />
              <div className="mt-3 flex justify-end">
                <Button
                  onClick={() => {
                    setSelectedPendingRequestId(request.id);
                    setIsScheduleDialogOpen(true);
                  }}
                  className="bg-blue-600 text-white hover:bg-blue-700 text-sm p-2"
                >
                  تعيين فني
                </Button>
              </div>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );

  // مكون قائمة الفنيين والإجازات
  const TechnicianAndLeaveManagement = () => (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>إدارة الفنيين والإجازات</span>
          <Button
            onClick={() => setIsLeaveDialogOpen(true)}
            className="bg-red-600 text-white hover:bg-red-700 text-sm p-2 flex items-center"
          >
            <Plus className="w-4 h-4 ml-1" />
            إضافة إجازة
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-6">
        {/* قائمة الفنيين */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg border-b pb-1 text-right">الفنيون ({technicians.length})</h3>
          {technicians.map((t) => (
            <TechnicianCard key={t.id} technician={t} />
          ))}
        </div>

        {/* قائمة الإجازات */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg border-b pb-1 text-right">طلبات الإجازة ({MOCK_LEAVES.length})</h3>
          {MOCK_LEAVES.map((leave) => {
            const technician = technicians.find(t => t.id === leave.technician_id);
            const statusIcon = leave.status === 'approved' ? <CheckCircle className="w-4 h-4 text-green-500 ml-1" /> : leave.status === 'pending' ? <AlertTriangle className="w-4 h-4 text-yellow-500 ml-1" /> : <XCircle className="w-4 h-4 text-red-500 ml-1" />;
            const statusText = leave.status === 'approved' ? 'موافق عليها' : leave.status === 'pending' ? 'قيد الانتظار' : 'مرفوضة';

            return (
              <div key={leave.id} className="p-3 border rounded-lg flex justify-between items-center text-right">
                <div>
                  <p className="font-medium">{technician?.name || 'فني غير معروف'}</p>
                  <p className="text-xs text-gray-500">
                    {leave.start_date.toLocaleDateString('ar-EG')} - {leave.end_date.toLocaleDateString('ar-EG')}
                  </p>
                  <p className="text-xs text-gray-700 mt-1">السبب: {leave.reason}</p>
                </div>
                <Badge className={`flex items-center ${leave.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {statusIcon}
                  {statusText}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans" dir="rtl">
      {/* العنوان الرئيسي */}
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
          <CalendarDays className="w-8 h-8 ml-3 text-blue-600" />
          شاشة جدولة الفنيين
        </h1>
        <p className="text-gray-600 mt-1">إدارة شاملة لطلبات الخدمة، تعيين الفنيين، والإجازات.</p>
      </header>

      {/* الشبكة الرئيسية (Responsive Layout) */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-150px)]">
        {/* العمود الأيمن: إدارة الفنيين والإجازات */}
        <div className="lg:col-span-1">
          <TechnicianAndLeaveManagement />
        </div>

        {/* العمود الأوسط: التقويم */}
        <div className="lg:col-span-1">
          <CalendarView schedule={schedule} technicians={technicians} />
        </div>

        {/* العمود الأيسر: الطلبات المعلقة */}
        <div className="lg:col-span-1">
          <PendingRequestsList />
        </div>
      </main>

      {/* نموذج إضافة إجازة (Dialog) */}
      <Dialog open={isLeaveDialogOpen} onClose={() => setIsLeaveDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة طلب إجازة جديد</DialogTitle>
          </DialogHeader>
          <LeaveForm technicians={technicians} onClose={() => setIsLeaveDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* نموذج تعيين طلب (Dialog) */}
      <Dialog open={isScheduleDialogOpen} onClose={() => { setIsScheduleDialogOpen(false); setSelectedPendingRequestId(undefined); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعيين طلب خدمة لفني</DialogTitle>
          </DialogHeader>
          <ScheduleForm
            requests={requests}
            technicians={technicians}
            onClose={() => { setIsScheduleDialogOpen(false); setSelectedPendingRequestId(undefined); }}
            initialRequestId={selectedPendingRequestId}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// تصدير المكون
export default TechnicianSchedulingScreen;
