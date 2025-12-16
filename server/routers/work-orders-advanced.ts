import { z } from 'zod';
import { router, publicProcedure } from '../_core/trpc';

// ============================================
// أنواع البيانات
// ============================================
const WorkOrderStatus = z.enum(['pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'on_hold']);
const WorkOrderPriority = z.enum(['critical', 'high', 'medium', 'low']);
const WorkOrderType = z.enum(['installation', 'maintenance', 'repair', 'inspection', 'disconnection', 'reconnection', 'meter_reading', 'complaint']);

// ============================================
// Router أوامر العمل المتقدم
// ============================================
export const workOrdersAdvancedRouter = router({
  // الحصول على جميع أوامر العمل
  getAll: publicProcedure
    .input(z.object({
      page: z.number().default(1),
      pageSize: z.number().default(10),
      status: WorkOrderStatus.optional(),
      priority: WorkOrderPriority.optional(),
      type: WorkOrderType.optional(),
      assignedTo: z.string().optional(),
      search: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const workOrders = [
        {
          id: 'wo-001',
          orderNumber: 'WO-2024-001',
          type: 'installation',
          priority: 'high',
          status: 'in_progress',
          title: 'تركيب عداد جديد',
          description: 'تركيب عداد ذكي جديد للعميل في حي العليا',
          customerId: 'cust-001',
          customerName: 'شركة الأمل للتجارة',
          customerPhone: '0501234567',
          location: 'الرياض - حي العليا - شارع التحلية',
          assignedTeam: 'فريق التركيب أ',
          assignedTechnicians: ['أحمد محمد', 'خالد علي'],
          scheduledDate: '2024-12-16',
          scheduledTime: '09:00',
          estimatedDuration: 2,
          createdAt: '2024-12-14',
          createdBy: 'محمد سعيد',
        },
        {
          id: 'wo-002',
          orderNumber: 'WO-2024-002',
          type: 'repair',
          priority: 'critical',
          status: 'pending',
          title: 'إصلاح عطل في العداد',
          description: 'العداد لا يعمل - العميل بدون كهرباء',
          customerId: 'cust-003',
          customerName: 'أحمد محمد العلي',
          customerPhone: '0509876543',
          location: 'الدمام - حي الفيصلية',
          assignedTeam: null,
          assignedTechnicians: [],
          scheduledDate: null,
          scheduledTime: null,
          estimatedDuration: 3,
          createdAt: '2024-12-16',
          createdBy: 'خدمة العملاء',
        },
        {
          id: 'wo-003',
          orderNumber: 'WO-2024-003',
          type: 'meter_reading',
          priority: 'medium',
          status: 'completed',
          title: 'قراءة عدادات منطقة الشمال',
          description: 'قراءة دورية لعدادات منطقة الشمال',
          customerId: null,
          customerName: 'متعدد',
          customerPhone: null,
          location: 'الرياض - منطقة الشمال',
          assignedTeam: 'فريق القراءة',
          assignedTechnicians: ['سعد محمد'],
          scheduledDate: '2024-12-15',
          scheduledTime: '08:00',
          estimatedDuration: 6,
          actualDuration: 5.5,
          completedAt: '2024-12-15',
          createdAt: '2024-12-10',
          createdBy: 'النظام',
          notes: 'تم قراءة 45 عداد بنجاح',
        },
        {
          id: 'wo-004',
          orderNumber: 'WO-2024-004',
          type: 'disconnection',
          priority: 'low',
          status: 'assigned',
          title: 'فصل خدمة - عدم السداد',
          description: 'فصل الخدمة بسبب تأخر السداد لأكثر من 90 يوم',
          customerId: 'cust-005',
          customerName: 'مؤسسة الفجر',
          customerPhone: '0507654321',
          location: 'جدة - حي النزهة',
          assignedTeam: 'فريق الفصل',
          assignedTechnicians: ['عمر حسن'],
          scheduledDate: '2024-12-18',
          scheduledTime: '10:00',
          estimatedDuration: 1,
          createdAt: '2024-12-15',
          createdBy: 'قسم التحصيل',
        },
      ];

      const { page = 1, pageSize = 10, status, priority, type, assignedTo, search } = input || {};
      
      let filtered = workOrders;
      
      if (status) filtered = filtered.filter(wo => wo.status === status);
      if (priority) filtered = filtered.filter(wo => wo.priority === priority);
      if (type) filtered = filtered.filter(wo => wo.type === type);
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(wo => 
          wo.orderNumber.toLowerCase().includes(searchLower) ||
          wo.title.toLowerCase().includes(searchLower) ||
          wo.customerName?.toLowerCase().includes(searchLower)
        );
      }

      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const data = filtered.slice(start, start + pageSize);

      return { data, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
    }),

  // الحصول على أمر عمل واحد
  getById: publicProcedure
    .input(z.string())
    .query(async ({ input: id }) => {
      return {
        id,
        orderNumber: 'WO-2024-001',
        type: 'installation',
        priority: 'high',
        status: 'in_progress',
        title: 'تركيب عداد جديد',
        description: 'تركيب عداد ذكي جديد للعميل في حي العليا',
        customerId: 'cust-001',
        customerName: 'شركة الأمل للتجارة',
        customerPhone: '0501234567',
        customerEmail: 'info@alamal.com',
        location: 'الرياض - حي العليا - شارع التحلية',
        coordinates: { lat: 24.7136, lng: 46.6753 },
        assignedTeam: 'فريق التركيب أ',
        assignedTechnicians: [
          { id: 'tech-001', name: 'أحمد محمد', phone: '0501111111' },
          { id: 'tech-002', name: 'خالد علي', phone: '0502222222' },
        ],
        scheduledDate: '2024-12-16',
        scheduledTime: '09:00',
        estimatedDuration: 2,
        materials: [
          { name: 'عداد ذكي', quantity: 1, unit: 'قطعة' },
          { name: 'كابل', quantity: 10, unit: 'متر' },
          { name: 'قاطع كهربائي', quantity: 1, unit: 'قطعة' },
        ],
        checklist: [
          { item: 'فحص الموقع', completed: true },
          { item: 'تركيب العداد', completed: true },
          { item: 'توصيل الكابلات', completed: false },
          { item: 'اختبار التشغيل', completed: false },
        ],
        timeline: [
          { date: '2024-12-14 10:00', action: 'إنشاء أمر العمل', by: 'محمد سعيد' },
          { date: '2024-12-14 14:00', action: 'تعيين الفريق', by: 'مدير العمليات' },
          { date: '2024-12-16 09:00', action: 'بدء التنفيذ', by: 'أحمد محمد' },
        ],
        createdAt: '2024-12-14',
        createdBy: 'محمد سعيد',
      };
    }),

  // إنشاء أمر عمل جديد
  create: publicProcedure
    .input(z.object({
      type: WorkOrderType,
      priority: WorkOrderPriority,
      title: z.string(),
      description: z.string().optional(),
      customerId: z.string().optional(),
      location: z.string(),
      scheduledDate: z.string().optional(),
      scheduledTime: z.string().optional(),
      estimatedDuration: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = `wo-${Date.now()}`;
      const orderNumber = `WO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      
      return {
        success: true,
        workOrder: {
          id,
          orderNumber,
          ...input,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      };
    }),

  // تحديث أمر عمل
  update: publicProcedure
    .input(z.object({
      id: z.string(),
      status: WorkOrderStatus.optional(),
      priority: WorkOrderPriority.optional(),
      assignedTeam: z.string().optional(),
      scheduledDate: z.string().optional(),
      scheduledTime: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return { success: true, message: 'تم تحديث أمر العمل بنجاح' };
    }),

  // تعيين فريق لأمر العمل
  assignTeam: publicProcedure
    .input(z.object({
      workOrderId: z.string(),
      teamId: z.string(),
      technicianIds: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      return { success: true, message: 'تم تعيين الفريق بنجاح' };
    }),

  // بدء تنفيذ أمر العمل
  start: publicProcedure
    .input(z.object({
      workOrderId: z.string(),
      startedBy: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return { success: true, message: 'تم بدء تنفيذ أمر العمل' };
    }),

  // إكمال أمر العمل
  complete: publicProcedure
    .input(z.object({
      workOrderId: z.string(),
      completedBy: z.string(),
      actualDuration: z.number(),
      notes: z.string().optional(),
      signature: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return { success: true, message: 'تم إكمال أمر العمل بنجاح' };
    }),

  // إلغاء أمر العمل
  cancel: publicProcedure
    .input(z.object({
      workOrderId: z.string(),
      reason: z.string(),
    }))
    .mutation(async ({ input }) => {
      return { success: true, message: 'تم إلغاء أمر العمل' };
    }),

  // إحصائيات أوامر العمل
  getStats: publicProcedure.query(async () => {
    return {
      total: 234,
      pending: 28,
      assigned: 15,
      inProgress: 12,
      completed: 165,
      cancelled: 8,
      onHold: 6,
      todayOrders: 8,
      weekOrders: 35,
      avgCompletionTime: 2.5,
      byType: {
        installation: 45,
        maintenance: 38,
        repair: 52,
        inspection: 30,
        disconnection: 25,
        reconnection: 18,
        meter_reading: 20,
        complaint: 6,
      },
      byPriority: {
        critical: 12,
        high: 45,
        medium: 120,
        low: 57,
      },
    };
  }),

  // الحصول على أوامر العمل للفني
  getByTechnician: publicProcedure
    .input(z.object({
      technicianId: z.string(),
      status: WorkOrderStatus.optional(),
      date: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return {
        technician: { id: input.technicianId, name: 'أحمد محمد' },
        workOrders: [
          { id: 'wo-001', orderNumber: 'WO-2024-001', title: 'تركيب عداد جديد', status: 'in_progress', scheduledTime: '09:00' },
          { id: 'wo-005', orderNumber: 'WO-2024-005', title: 'صيانة دورية', status: 'assigned', scheduledTime: '14:00' },
        ],
      };
    }),
});

export type WorkOrdersAdvancedRouter = typeof workOrdersAdvancedRouter;
