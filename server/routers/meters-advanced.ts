import { z } from 'zod';
import { router, publicProcedure } from '../_core/trpc';

// ============================================
// أنواع البيانات
// ============================================
const MeterStatus = z.enum(['active', 'inactive', 'faulty', 'maintenance', 'disconnected']);
const MeterType = z.enum(['smart', 'analog', 'digital', 'prepaid']);
const ConnectionType = z.enum(['single_phase', 'three_phase']);

// ============================================
// Router العدادات المتقدم
// ============================================
export const metersAdvancedRouter = router({
  // الحصول على جميع العدادات
  getAll: publicProcedure
    .input(z.object({
      page: z.number().default(1),
      pageSize: z.number().default(10),
      status: MeterStatus.optional(),
      type: MeterType.optional(),
      stationId: z.string().optional(),
      search: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const meters = [
        {
          id: 'mtr-001',
          meterNumber: 'MTR-2024-001',
          serialNumber: 'SN123456789',
          type: 'smart',
          status: 'active',
          connectionType: 'three_phase',
          customerId: 'cust-001',
          customerName: 'شركة الأمل للتجارة',
          stationId: 'st-001',
          stationName: 'محطة الشمال 1',
          location: 'الرياض - حي العليا',
          currentReading: 45230,
          lastReadingDate: '2024-12-15',
          installationDate: '2024-01-15',
          lastMaintenanceDate: '2024-10-15',
          manufacturer: 'Schneider Electric',
          model: 'iEM3255',
          voltage: 220,
          maxCurrent: 100,
          accuracy: 'Class 1',
          communicationType: 'RS485',
          isOnline: true,
          signalStrength: 95,
        },
        {
          id: 'mtr-002',
          meterNumber: 'MTR-2024-002',
          serialNumber: 'SN987654321',
          type: 'smart',
          status: 'active',
          connectionType: 'three_phase',
          customerId: 'cust-002',
          customerName: 'مؤسسة النور',
          stationId: 'st-002',
          stationName: 'محطة الجنوب 1',
          location: 'جدة - المنطقة الصناعية',
          currentReading: 125000,
          lastReadingDate: '2024-12-15',
          installationDate: '2024-02-20',
          lastMaintenanceDate: '2024-09-20',
          manufacturer: 'ABB',
          model: 'A44',
          voltage: 380,
          maxCurrent: 200,
          accuracy: 'Class 0.5',
          communicationType: 'Modbus TCP',
          isOnline: true,
          signalStrength: 88,
        },
        {
          id: 'mtr-003',
          meterNumber: 'MTR-2024-003',
          serialNumber: 'SN456789123',
          type: 'digital',
          status: 'faulty',
          connectionType: 'single_phase',
          customerId: 'cust-003',
          customerName: 'أحمد محمد العلي',
          stationId: 'st-001',
          stationName: 'محطة الشمال 1',
          location: 'الدمام - حي الفيصلية',
          currentReading: 8500,
          lastReadingDate: '2024-12-10',
          installationDate: '2024-03-10',
          lastMaintenanceDate: '2024-08-10',
          manufacturer: 'Siemens',
          model: 'PAC3200',
          voltage: 220,
          maxCurrent: 60,
          accuracy: 'Class 1',
          communicationType: 'RS232',
          isOnline: false,
          signalStrength: 0,
        },
        {
          id: 'mtr-004',
          meterNumber: 'MTR-2024-004',
          serialNumber: 'SN789123456',
          type: 'prepaid',
          status: 'active',
          connectionType: 'single_phase',
          customerId: 'cust-004',
          customerName: 'فاطمة علي',
          stationId: 'st-003',
          stationName: 'محطة فرعية 5',
          location: 'المدينة - حي السلام',
          currentReading: 3200,
          lastReadingDate: '2024-12-14',
          installationDate: '2024-05-01',
          lastMaintenanceDate: null,
          manufacturer: 'Hexing',
          model: 'HXE110',
          voltage: 220,
          maxCurrent: 40,
          accuracy: 'Class 1',
          communicationType: 'GPRS',
          isOnline: true,
          signalStrength: 75,
          prepaidBalance: 150.50,
        },
      ];

      const { page = 1, pageSize = 10, status, type, stationId, search } = input || {};
      
      let filtered = meters;
      
      if (status) filtered = filtered.filter(m => m.status === status);
      if (type) filtered = filtered.filter(m => m.type === type);
      if (stationId) filtered = filtered.filter(m => m.stationId === stationId);
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(m => 
          m.meterNumber.toLowerCase().includes(searchLower) ||
          m.serialNumber.toLowerCase().includes(searchLower) ||
          m.customerName.toLowerCase().includes(searchLower)
        );
      }

      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const data = filtered.slice(start, start + pageSize);

      return { data, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
    }),

  // الحصول على عداد واحد بالتفصيل
  getById: publicProcedure
    .input(z.string())
    .query(async ({ input: id }) => {
      return {
        id,
        meterNumber: 'MTR-2024-001',
        serialNumber: 'SN123456789',
        type: 'smart',
        status: 'active',
        connectionType: 'three_phase',
        customerId: 'cust-001',
        customerName: 'شركة الأمل للتجارة',
        stationId: 'st-001',
        stationName: 'محطة الشمال 1',
        location: 'الرياض - حي العليا',
        currentReading: 45230,
        lastReadingDate: '2024-12-15',
        installationDate: '2024-01-15',
        lastMaintenanceDate: '2024-10-15',
        manufacturer: 'Schneider Electric',
        model: 'iEM3255',
        voltage: 220,
        maxCurrent: 100,
        accuracy: 'Class 1',
        communicationType: 'RS485',
        isOnline: true,
        signalStrength: 95,
        readingHistory: [
          { date: '2024-12-15', reading: 45230, consumption: 730 },
          { date: '2024-11-15', reading: 44500, consumption: 680 },
          { date: '2024-10-15', reading: 43820, consumption: 720 },
        ],
        alerts: [
          { date: '2024-12-10', type: 'info', message: 'قراءة تلقائية ناجحة' },
        ],
      };
    }),

  // إنشاء عداد جديد
  create: publicProcedure
    .input(z.object({
      serialNumber: z.string(),
      type: MeterType,
      connectionType: ConnectionType,
      customerId: z.string().optional(),
      stationId: z.string(),
      location: z.string(),
      manufacturer: z.string(),
      model: z.string(),
      voltage: z.number(),
      maxCurrent: z.number(),
      accuracy: z.string().optional(),
      communicationType: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = `mtr-${Date.now()}`;
      const meterNumber = `MTR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      
      return {
        success: true,
        meter: {
          id,
          meterNumber,
          ...input,
          status: 'inactive',
          currentReading: 0,
          installationDate: new Date().toISOString().split('T')[0],
          isOnline: false,
        },
      };
    }),

  // تحديث عداد
  update: publicProcedure
    .input(z.object({
      id: z.string(),
      status: MeterStatus.optional(),
      location: z.string().optional(),
      customerId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return { success: true, message: 'تم تحديث العداد بنجاح' };
    }),

  // تسجيل قراءة
  recordReading: publicProcedure
    .input(z.object({
      meterId: z.string(),
      reading: z.number(),
      readingDate: z.string(),
      readBy: z.string().optional(),
      readingType: z.enum(['manual', 'automatic']).default('manual'),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: 'تم تسجيل القراءة بنجاح',
        consumption: 730,
      };
    }),

  // إحصائيات العدادات
  getStats: publicProcedure.query(async () => {
    return {
      total: 1850,
      active: 1650,
      inactive: 80,
      faulty: 45,
      maintenance: 30,
      disconnected: 45,
      online: 1580,
      offline: 270,
      byType: { smart: 1200, digital: 400, analog: 150, prepaid: 100 },
      avgSignalStrength: 82,
    };
  }),

  // الحصول على قراءات العداد
  getReadings: publicProcedure
    .input(z.object({
      meterId: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      limit: z.number().default(30),
    }))
    .query(async ({ input }) => {
      return {
        readings: [
          { date: '2024-12-15', reading: 45230, consumption: 730 },
          { date: '2024-11-15', reading: 44500, consumption: 680 },
          { date: '2024-10-15', reading: 43820, consumption: 720 },
          { date: '2024-09-15', reading: 43100, consumption: 650 },
          { date: '2024-08-15', reading: 42450, consumption: 700 },
        ],
      };
    }),

  // إرسال أمر للعداد الذكي
  sendCommand: publicProcedure
    .input(z.object({
      meterId: z.string(),
      command: z.enum(['connect', 'disconnect', 'reset', 'read', 'sync']),
    }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: `تم إرسال الأمر ${input.command} بنجاح`,
        response: { status: 'executed', timestamp: new Date().toISOString() },
      };
    }),
});

export type MetersAdvancedRouter = typeof metersAdvancedRouter;
