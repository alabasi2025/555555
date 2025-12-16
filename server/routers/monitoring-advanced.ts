import { z } from 'zod';
import { router, publicProcedure } from '../_core/trpc';

// ============================================
// أنواع البيانات
// ============================================
const AlertSeverity = z.enum(['critical', 'warning', 'info']);
const AlertStatus = z.enum(['active', 'acknowledged', 'resolved']);
const StationStatus = z.enum(['online', 'offline', 'warning', 'maintenance']);

// ============================================
// Router المراقبة والتنبيهات
// ============================================
export const monitoringAdvancedRouter = router({
  // الحصول على حالة جميع المحطات
  getStationsStatus: publicProcedure.query(async () => {
    return {
      stations: [
        {
          id: 'st-001',
          name: 'محطة الشمال 1',
          status: 'online',
          load: 78,
          voltage: 220,
          current: 150,
          power: 33000,
          frequency: 60.02,
          powerFactor: 0.95,
          temperature: 42,
          humidity: 35,
          lastUpdate: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          alerts: 0,
          coordinates: { lat: 24.7136, lng: 46.6753 },
        },
        {
          id: 'st-002',
          name: 'محطة الجنوب 1',
          status: 'warning',
          load: 92,
          voltage: 215,
          current: 180,
          power: 38700,
          frequency: 59.98,
          powerFactor: 0.92,
          temperature: 55,
          humidity: 40,
          lastUpdate: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          alerts: 3,
          coordinates: { lat: 21.4858, lng: 39.1925 },
        },
        {
          id: 'st-003',
          name: 'محطة فرعية 5',
          status: 'online',
          load: 45,
          voltage: 221,
          current: 85,
          power: 18785,
          frequency: 60.01,
          powerFactor: 0.97,
          temperature: 35,
          humidity: 30,
          lastUpdate: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
          alerts: 0,
          coordinates: { lat: 26.4207, lng: 50.0888 },
        },
        {
          id: 'st-004',
          name: 'محطة الطائف',
          status: 'offline',
          load: 0,
          voltage: 0,
          current: 0,
          power: 0,
          frequency: 0,
          powerFactor: 0,
          temperature: 28,
          humidity: 45,
          lastUpdate: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          alerts: 5,
          coordinates: { lat: 21.2703, lng: 40.4158 },
        },
      ],
      summary: {
        total: 4,
        online: 2,
        warning: 1,
        offline: 1,
        totalPower: 90485,
        avgLoad: 71.67,
        totalAlerts: 8,
      },
    };
  }),

  // الحصول على تفاصيل محطة واحدة
  getStationDetails: publicProcedure
    .input(z.string())
    .query(async ({ input: stationId }) => {
      return {
        id: stationId,
        name: 'محطة الشمال 1',
        status: 'online',
        type: 'main',
        capacity: 50000,
        currentLoad: 33000,
        loadPercentage: 66,
        voltage: { phase1: 220, phase2: 219, phase3: 221, average: 220 },
        current: { phase1: 150, phase2: 148, phase3: 152, average: 150 },
        power: { active: 33000, reactive: 10890, apparent: 34747 },
        frequency: 60.02,
        powerFactor: 0.95,
        energy: { today: 792000, month: 23760000, year: 285120000 },
        environment: { temperature: 42, humidity: 35, pressure: 1013 },
        equipment: [
          { id: 'eq-001', name: 'المحول T1', status: 'operational', load: 78 },
          { id: 'eq-002', name: 'المحول T2', status: 'operational', load: 54 },
          { id: 'eq-003', name: 'المولد G1', status: 'standby', load: 0 },
        ],
        recentReadings: [
          { timestamp: new Date(Date.now() - 0 * 60 * 1000).toISOString(), power: 33000, voltage: 220 },
          { timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), power: 32500, voltage: 219 },
          { timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), power: 33200, voltage: 221 },
          { timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), power: 32800, voltage: 220 },
        ],
        lastUpdate: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      };
    }),

  // الحصول على التنبيهات
  getAlerts: publicProcedure
    .input(z.object({
      page: z.number().default(1),
      pageSize: z.number().default(20),
      severity: AlertSeverity.optional(),
      status: AlertStatus.optional(),
      stationId: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const alerts = [
        {
          id: 'alert-001',
          stationId: 'st-002',
          stationName: 'محطة الجنوب 1',
          severity: 'critical',
          status: 'active',
          type: 'temperature',
          title: 'ارتفاع درجة الحرارة',
          message: 'درجة حرارة المحول تجاوزت الحد المسموح (55°C)',
          value: 55,
          threshold: 50,
          unit: '°C',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          acknowledgedBy: null,
          resolvedBy: null,
        },
        {
          id: 'alert-002',
          stationId: 'st-002',
          stationName: 'محطة الجنوب 1',
          severity: 'warning',
          status: 'active',
          type: 'load',
          title: 'حمل مرتفع',
          message: 'الحمل يقترب من الحد الأقصى (92%)',
          value: 92,
          threshold: 85,
          unit: '%',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          acknowledgedBy: null,
          resolvedBy: null,
        },
        {
          id: 'alert-003',
          stationId: 'st-004',
          stationName: 'محطة الطائف',
          severity: 'critical',
          status: 'active',
          type: 'connection',
          title: 'فقدان الاتصال',
          message: 'فقدان الاتصال بالمحطة منذ ساعة',
          value: null,
          threshold: null,
          unit: null,
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          acknowledgedBy: null,
          resolvedBy: null,
        },
        {
          id: 'alert-004',
          stationId: 'st-002',
          stationName: 'محطة الجنوب 1',
          severity: 'warning',
          status: 'acknowledged',
          type: 'voltage',
          title: 'انخفاض الجهد',
          message: 'الجهد أقل من المستوى الطبيعي (215V)',
          value: 215,
          threshold: 218,
          unit: 'V',
          timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          acknowledgedBy: 'أحمد محمد',
          resolvedBy: null,
        },
        {
          id: 'alert-005',
          stationId: 'st-001',
          stationName: 'محطة الشمال 1',
          severity: 'info',
          status: 'resolved',
          type: 'maintenance',
          title: 'صيانة مجدولة',
          message: 'صيانة دورية للمحول T1 مكتملة',
          value: null,
          threshold: null,
          unit: null,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          acknowledgedBy: 'خالد علي',
          resolvedBy: 'خالد علي',
        },
      ];

      const { page = 1, pageSize = 20, severity, status, stationId } = input || {};
      
      let filtered = alerts;
      if (severity) filtered = filtered.filter(a => a.severity === severity);
      if (status) filtered = filtered.filter(a => a.status === status);
      if (stationId) filtered = filtered.filter(a => a.stationId === stationId);

      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const data = filtered.slice(start, start + pageSize);

      return { data, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
    }),

  // الاعتراف بتنبيه
  acknowledgeAlert: publicProcedure
    .input(z.object({
      alertId: z.string(),
      acknowledgedBy: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return { success: true, message: 'تم الاعتراف بالتنبيه' };
    }),

  // حل تنبيه
  resolveAlert: publicProcedure
    .input(z.object({
      alertId: z.string(),
      resolvedBy: z.string(),
      resolution: z.string(),
    }))
    .mutation(async ({ input }) => {
      return { success: true, message: 'تم حل التنبيه' };
    }),

  // إحصائيات المراقبة
  getStats: publicProcedure.query(async () => {
    return {
      stations: { total: 4, online: 2, warning: 1, offline: 1 },
      alerts: { total: 8, critical: 2, warning: 4, info: 2, active: 5, acknowledged: 2, resolved: 1 },
      power: { current: 90485, peak: 125000, average: 85000 },
      uptime: { percentage: 99.2, downtime: 7.2 },
      performance: {
        avgResponseTime: 150,
        dataPointsToday: 28800,
        alertsToday: 12,
      },
    };
  }),

  // الحصول على البيانات التاريخية
  getHistoricalData: publicProcedure
    .input(z.object({
      stationId: z.string(),
      metric: z.enum(['power', 'voltage', 'current', 'temperature', 'load']),
      period: z.enum(['hour', 'day', 'week', 'month']),
    }))
    .query(async ({ input }) => {
      const now = Date.now();
      const points = [];
      const intervals = input.period === 'hour' ? 12 : input.period === 'day' ? 24 : input.period === 'week' ? 7 : 30;
      
      for (let i = intervals; i >= 0; i--) {
        const timestamp = new Date(now - i * (input.period === 'hour' ? 5 * 60 * 1000 : input.period === 'day' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000));
        points.push({
          timestamp: timestamp.toISOString(),
          value: Math.floor(Math.random() * 20) + 30, // قيمة عشوائية للتوضيح
        });
      }

      return { stationId: input.stationId, metric: input.metric, period: input.period, data: points };
    }),

  // إعدادات التنبيهات
  getAlertSettings: publicProcedure.query(async () => {
    return {
      thresholds: [
        { metric: 'temperature', warning: 45, critical: 50, unit: '°C' },
        { metric: 'load', warning: 85, critical: 95, unit: '%' },
        { metric: 'voltage_low', warning: 218, critical: 210, unit: 'V' },
        { metric: 'voltage_high', warning: 235, critical: 245, unit: 'V' },
        { metric: 'frequency_low', warning: 59.5, critical: 59.0, unit: 'Hz' },
        { metric: 'frequency_high', warning: 60.5, critical: 61.0, unit: 'Hz' },
      ],
      notifications: {
        email: true,
        sms: true,
        push: true,
        recipients: ['admin@company.com', 'operations@company.com'],
      },
    };
  }),

  // تحديث إعدادات التنبيهات
  updateAlertSettings: publicProcedure
    .input(z.object({
      thresholds: z.array(z.object({
        metric: z.string(),
        warning: z.number(),
        critical: z.number(),
      })).optional(),
      notifications: z.object({
        email: z.boolean(),
        sms: z.boolean(),
        push: z.boolean(),
        recipients: z.array(z.string()),
      }).optional(),
    }))
    .mutation(async ({ input }) => {
      return { success: true, message: 'تم تحديث إعدادات التنبيهات' };
    }),
});

export type MonitoringAdvancedRouter = typeof monitoringAdvancedRouter;
