import { z } from 'zod';
import { router, publicProcedure } from '../_core/trpc';

// ============================================
// أنواع البيانات
// ============================================
const AssetStatus = z.enum(['operational', 'maintenance', 'faulty', 'decommissioned', 'standby']);
const AssetCategory = z.enum(['transformer', 'generator', 'switchgear', 'cable', 'meter', 'protection', 'control', 'other']);
const ConditionRating = z.enum(['excellent', 'good', 'fair', 'poor', 'critical']);

// ============================================
// Router الأصول المتقدم
// ============================================
export const assetsAdvancedRouter = router({
  // الحصول على جميع الأصول
  getAll: publicProcedure
    .input(z.object({
      page: z.number().default(1),
      pageSize: z.number().default(10),
      status: AssetStatus.optional(),
      category: AssetCategory.optional(),
      stationId: z.string().optional(),
      search: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const assets = [
        {
          id: 'ast-001',
          assetCode: 'TRF-001',
          name: 'المحول الرئيسي T1',
          category: 'transformer',
          status: 'operational',
          condition: 'good',
          stationId: 'st-001',
          stationName: 'محطة الشمال 1',
          location: 'المبنى الرئيسي - الطابق الأرضي',
          manufacturer: 'ABB',
          model: 'KTRT 500',
          serialNumber: 'ABB-TRF-2020-001',
          purchaseDate: '2020-03-15',
          installationDate: '2020-04-01',
          warrantyExpiry: '2025-04-01',
          purchasePrice: 850000,
          currentValue: 680000,
          specifications: {
            capacity: '500 KVA',
            voltage: '11KV/400V',
            cooling: 'ONAN',
          },
          lastMaintenanceDate: '2024-09-20',
          nextMaintenanceDate: '2025-03-20',
          maintenanceInterval: 180,
        },
        {
          id: 'ast-002',
          assetCode: 'GEN-001',
          name: 'المولد الاحتياطي G1',
          category: 'generator',
          status: 'standby',
          condition: 'excellent',
          stationId: 'st-001',
          stationName: 'محطة الشمال 1',
          location: 'غرفة المولدات',
          manufacturer: 'Caterpillar',
          model: 'C18',
          serialNumber: 'CAT-GEN-2021-001',
          purchaseDate: '2021-06-10',
          installationDate: '2021-07-01',
          warrantyExpiry: '2026-07-01',
          purchasePrice: 450000,
          currentValue: 382500,
          specifications: {
            capacity: '500 KW',
            fuel: 'Diesel',
            runtime: '24 hours',
          },
          lastMaintenanceDate: '2024-11-10',
          nextMaintenanceDate: '2025-01-10',
          maintenanceInterval: 60,
        },
        {
          id: 'ast-003',
          assetCode: 'SWG-001',
          name: 'لوحة التوزيع الرئيسية',
          category: 'switchgear',
          status: 'operational',
          condition: 'good',
          stationId: 'st-002',
          stationName: 'محطة الجنوب 1',
          location: 'غرفة التوزيع',
          manufacturer: 'Schneider Electric',
          model: 'Prisma Plus',
          serialNumber: 'SE-SWG-2019-001',
          purchaseDate: '2019-01-20',
          installationDate: '2019-02-15',
          warrantyExpiry: '2024-02-15',
          purchasePrice: 320000,
          currentValue: 224000,
          specifications: {
            voltage: '400V',
            current: '4000A',
            panels: 12,
          },
          lastMaintenanceDate: '2024-08-15',
          nextMaintenanceDate: '2025-02-15',
          maintenanceInterval: 180,
        },
        {
          id: 'ast-004',
          assetCode: 'CBL-001',
          name: 'الكابل الأرضي الرئيسي',
          category: 'cable',
          status: 'operational',
          condition: 'fair',
          stationId: 'st-001',
          stationName: 'محطة الشمال 1',
          location: 'تحت الأرض - المسار الرئيسي',
          manufacturer: 'Nexans',
          model: 'XLPE 11KV',
          serialNumber: 'NX-CBL-2018-001',
          purchaseDate: '2018-05-10',
          installationDate: '2018-06-01',
          warrantyExpiry: '2028-06-01',
          purchasePrice: 180000,
          currentValue: 126000,
          specifications: {
            voltage: '11KV',
            length: '2500m',
            crossSection: '240mm²',
          },
          lastMaintenanceDate: '2024-12-10',
          nextMaintenanceDate: '2025-12-10',
          maintenanceInterval: 365,
        },
      ];

      const { page = 1, pageSize = 10, status, category, stationId, search } = input || {};
      
      let filtered = assets;
      
      if (status) filtered = filtered.filter(a => a.status === status);
      if (category) filtered = filtered.filter(a => a.category === category);
      if (stationId) filtered = filtered.filter(a => a.stationId === stationId);
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(a => 
          a.assetCode.toLowerCase().includes(searchLower) ||
          a.name.toLowerCase().includes(searchLower) ||
          a.serialNumber.toLowerCase().includes(searchLower)
        );
      }

      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const data = filtered.slice(start, start + pageSize);

      return { data, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
    }),

  // الحصول على أصل واحد بالتفصيل
  getById: publicProcedure
    .input(z.string())
    .query(async ({ input: id }) => {
      return {
        id,
        assetCode: 'TRF-001',
        name: 'المحول الرئيسي T1',
        category: 'transformer',
        status: 'operational',
        condition: 'good',
        stationId: 'st-001',
        stationName: 'محطة الشمال 1',
        location: 'المبنى الرئيسي - الطابق الأرضي',
        manufacturer: 'ABB',
        model: 'KTRT 500',
        serialNumber: 'ABB-TRF-2020-001',
        purchaseDate: '2020-03-15',
        installationDate: '2020-04-01',
        warrantyExpiry: '2025-04-01',
        purchasePrice: 850000,
        currentValue: 680000,
        depreciationRate: 5,
        specifications: {
          capacity: '500 KVA',
          voltage: '11KV/400V',
          cooling: 'ONAN',
          weight: '2500 kg',
          dimensions: '2.5m x 1.5m x 2m',
        },
        lastMaintenanceDate: '2024-09-20',
        nextMaintenanceDate: '2025-03-20',
        maintenanceInterval: 180,
        maintenanceHistory: [
          { date: '2024-09-20', type: 'preventive', description: 'صيانة دورية - فحص الزيت', cost: 5000, technician: 'أحمد محمد' },
          { date: '2024-03-20', type: 'preventive', description: 'صيانة دورية - فحص العوازل', cost: 4500, technician: 'خالد علي' },
          { date: '2023-09-20', type: 'corrective', description: 'إصلاح تسرب زيت', cost: 12000, technician: 'أحمد محمد' },
        ],
        documents: [
          { name: 'دليل التشغيل', type: 'pdf', uploadDate: '2020-04-01' },
          { name: 'شهادة الضمان', type: 'pdf', uploadDate: '2020-04-01' },
          { name: 'تقرير الفحص الأخير', type: 'pdf', uploadDate: '2024-09-20' },
        ],
        alerts: [
          { date: '2024-12-01', type: 'info', message: 'صيانة مجدولة خلال 90 يوم' },
        ],
      };
    }),

  // إنشاء أصل جديد
  create: publicProcedure
    .input(z.object({
      name: z.string(),
      category: AssetCategory,
      stationId: z.string(),
      location: z.string(),
      manufacturer: z.string(),
      model: z.string(),
      serialNumber: z.string(),
      purchaseDate: z.string(),
      installationDate: z.string().optional(),
      warrantyExpiry: z.string().optional(),
      purchasePrice: z.number(),
      specifications: z.record(z.string(), z.string()).optional(),
      maintenanceInterval: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = `ast-${Date.now()}`;
      const assetCode = `${input.category.substring(0, 3).toUpperCase()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      
      return {
        success: true,
        asset: {
          id,
          assetCode,
          ...input,
          status: 'operational',
          condition: 'excellent',
          currentValue: input.purchasePrice,
          createdAt: new Date().toISOString(),
        },
      };
    }),

  // تحديث أصل
  update: publicProcedure
    .input(z.object({
      id: z.string(),
      status: AssetStatus.optional(),
      condition: ConditionRating.optional(),
      location: z.string().optional(),
      currentValue: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      return { success: true, message: 'تم تحديث الأصل بنجاح' };
    }),

  // تسجيل صيانة للأصل
  recordMaintenance: publicProcedure
    .input(z.object({
      assetId: z.string(),
      type: z.enum(['preventive', 'corrective', 'inspection']),
      description: z.string(),
      cost: z.number().optional(),
      technician: z.string(),
      date: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return { success: true, message: 'تم تسجيل الصيانة بنجاح' };
    }),

  // إحصائيات الأصول
  getStats: publicProcedure.query(async () => {
    return {
      total: 156,
      operational: 128,
      maintenance: 12,
      faulty: 8,
      decommissioned: 5,
      standby: 3,
      totalValue: 24500000,
      depreciatedValue: 18750000,
      maintenanceDue: 15,
      warrantyExpiring: 8,
      byCategory: {
        transformer: 25,
        generator: 12,
        switchgear: 35,
        cable: 40,
        meter: 30,
        protection: 8,
        control: 4,
        other: 2,
      },
      byCondition: {
        excellent: 45,
        good: 68,
        fair: 30,
        poor: 10,
        critical: 3,
      },
    };
  }),

  // الأصول التي تحتاج صيانة
  getDueMaintenance: publicProcedure
    .input(z.object({
      days: z.number().default(30),
    }).optional())
    .query(async ({ input }) => {
      return {
        assets: [
          { id: 'ast-002', assetCode: 'GEN-001', name: 'المولد الاحتياطي G1', nextMaintenanceDate: '2025-01-10', daysRemaining: 25 },
          { id: 'ast-003', assetCode: 'SWG-001', name: 'لوحة التوزيع الرئيسية', nextMaintenanceDate: '2025-02-15', daysRemaining: 61 },
        ],
      };
    }),

  // حساب الإهلاك
  calculateDepreciation: publicProcedure
    .input(z.object({
      assetId: z.string(),
      method: z.enum(['straight_line', 'declining_balance']).default('straight_line'),
    }))
    .query(async ({ input }) => {
      return {
        assetId: input.assetId,
        purchasePrice: 850000,
        currentValue: 680000,
        accumulatedDepreciation: 170000,
        annualDepreciation: 42500,
        usefulLife: 20,
        remainingLife: 16,
        depreciationSchedule: [
          { year: 2020, depreciation: 42500, bookValue: 807500 },
          { year: 2021, depreciation: 42500, bookValue: 765000 },
          { year: 2022, depreciation: 42500, bookValue: 722500 },
          { year: 2023, depreciation: 42500, bookValue: 680000 },
        ],
      };
    }),
});

export type AssetsAdvancedRouter = typeof assetsAdvancedRouter;
