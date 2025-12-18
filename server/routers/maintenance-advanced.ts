import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { eq, desc } from 'drizzle-orm';
import {
  preventiveMaintenanceSchedules,
  preventiveMaintenanceRecords,
  emergencyMaintenanceRequests,
  maintenancePartsUsed,
  equipmentMaintenance,
} from '../../drizzle/schema';

export const maintenanceAdvancedRouter = router({
  // --- الصيانة الوقائية ---
  getPreventiveSchedules: publicProcedure
    .input(z.object({
      assetId: z.number().optional(),
      isActive: z.boolean().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      let result = await db.select().from(preventiveMaintenanceSchedules).orderBy(desc(preventiveMaintenanceSchedules.nextMaintenanceDate));
      if (input?.assetId) {
        result = result.filter(s => s.assetId === input.assetId);
      }
      if (input?.isActive !== undefined) {
        result = result.filter(s => s.isActive === input.isActive);
      }
      return result;
    }),

  createPreventiveSchedule: publicProcedure
    .input(z.object({
      scheduleName: z.string(),
      assetId: z.number().optional(),
      equipmentId: z.number().optional(),
      maintenanceType: z.string(),
      frequency: z.string(),
      intervalDays: z.number().optional(),
      lastMaintenanceDate: z.string().optional(),
      nextMaintenanceDate: z.string(),
      estimatedDuration: z.number().optional(),
      estimatedCost: z.string().optional(),
      assignedTechnicianId: z.number().optional(),
      checklistId: z.number().optional(),
      priority: z.string().optional(),
      notes: z.string().optional(),
      createdBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(preventiveMaintenanceSchedules).values({
        scheduleName: input.scheduleName,
        assetId: input.assetId,
        equipmentId: input.equipmentId,
        maintenanceType: input.maintenanceType,
        frequency: input.frequency,
        intervalDays: input.intervalDays,
        lastMaintenanceDate: input.lastMaintenanceDate ? new Date(input.lastMaintenanceDate) : null,
        nextMaintenanceDate: input.nextMaintenanceDate ? new Date(input.nextMaintenanceDate) : null,
        estimatedDuration: input.estimatedDuration,
        estimatedCost: input.estimatedCost,
        assignedTechnicianId: input.assignedTechnicianId,
        checklistId: input.checklistId,
        priority: input.priority || 'medium',
        notes: input.notes,
        createdBy: input.createdBy,
      });
      return { success: true, id: result[0].insertId };
    }),

  updatePreventiveSchedule: publicProcedure
    .input(z.object({
      id: z.number(),
      lastMaintenanceDate: z.string(),
      nextMaintenanceDate: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.update(preventiveMaintenanceSchedules)
        .set({
          lastMaintenanceDate: new Date(input.lastMaintenanceDate),
          nextMaintenanceDate: new Date(input.nextMaintenanceDate),
        })
        .where(eq(preventiveMaintenanceSchedules.id, input.id));
      return { success: true };
    }),

  // --- سجلات الصيانة الوقائية ---
  getPreventiveRecords: publicProcedure
    .input(z.object({
      scheduleId: z.number().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      let result = await db.select().from(preventiveMaintenanceRecords).orderBy(desc(preventiveMaintenanceRecords.scheduledDate));
      if (input?.scheduleId) {
        result = result.filter(r => r.scheduleId === input.scheduleId);
      }
      if (input?.status) {
        result = result.filter(r => r.status === input.status);
      }
      return result;
    }),

  createPreventiveRecord: publicProcedure
    .input(z.object({
      scheduleId: z.number(),
      maintenanceNumber: z.string(),
      scheduledDate: z.string(),
      technicianId: z.number().optional(),
      actualDuration: z.number().optional(),
      laborCost: z.string().optional(),
      partsCost: z.string().optional(),
      totalCost: z.string().optional(),
      findings: z.string().optional(),
      actionsPerformed: z.string().optional(),
      nextMaintenanceDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(preventiveMaintenanceRecords).values({
        scheduleId: input.scheduleId,
        maintenanceNumber: input.maintenanceNumber,
        scheduledDate: new Date(input.scheduledDate),
        technicianId: input.technicianId,
        actualDuration: input.actualDuration,
        laborCost: input.laborCost,
        partsCost: input.partsCost,
        totalCost: input.totalCost,
        findings: input.findings,
        actionsPerformed: input.actionsPerformed,
        nextMaintenanceDate: input.nextMaintenanceDate ? new Date(input.nextMaintenanceDate) : null,
        notes: input.notes,
      });
      return { success: true, id: result[0].insertId };
    }),

  completePreventiveRecord: publicProcedure
    .input(z.object({
      id: z.number(),
      completedAt: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.update(preventiveMaintenanceRecords)
        .set({
          status: 'completed',
          completedAt: new Date(input.completedAt),
        })
        .where(eq(preventiveMaintenanceRecords.id, input.id));
      return { success: true };
    }),

  // --- طلبات الصيانة الطارئة ---
  getEmergencyRequests: publicProcedure
    .input(z.object({
      status: z.string().optional(),
      urgencyLevel: z.string().optional(),
      assetId: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      let result = await db.select().from(emergencyMaintenanceRequests).orderBy(desc(emergencyMaintenanceRequests.createdAt));
      if (input?.status) {
        result = result.filter(r => r.status === input.status);
      }
      if (input?.urgencyLevel) {
        result = result.filter(r => r.urgencyLevel === input.urgencyLevel);
      }
      if (input?.assetId) {
        result = result.filter(r => r.assetId === input.assetId);
      }
      return result;
    }),

  createEmergencyRequest: publicProcedure
    .input(z.object({
      requestNumber: z.string(),
      assetId: z.number().optional(),
      equipmentId: z.number().optional(),
      requesterId: z.number(),
      urgencyLevel: z.string(),
      problemDescription: z.string(),
      location: z.string().optional(),
      contactPhone: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(emergencyMaintenanceRequests).values({
        requestNumber: input.requestNumber,
        assetId: input.assetId,
        equipmentId: input.equipmentId,
        requesterId: input.requesterId,
        urgencyLevel: input.urgencyLevel,
        problemDescription: input.problemDescription,
        location: input.location,
        contactPhone: input.contactPhone,
      });
      return { success: true, id: result[0].insertId };
    }),

  assignEmergencyRequest: publicProcedure
    .input(z.object({
      id: z.number(),
      assignedTechnicianId: z.number(),
      estimatedArrival: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.update(emergencyMaintenanceRequests)
        .set({
          status: 'assigned',
          assignedTechnicianId: input.assignedTechnicianId,
          assignedAt: new Date(),
          estimatedArrival: input.estimatedArrival ? new Date(input.estimatedArrival) : null,
        })
        .where(eq(emergencyMaintenanceRequests.id, input.id));
      return { success: true };
    }),

  completeEmergencyRequest: publicProcedure
    .input(z.object({
      id: z.number(),
      resolution: z.string(),
      laborCost: z.string().optional(),
      partsCost: z.string().optional(),
      totalCost: z.string().optional(),
      customerSatisfaction: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.update(emergencyMaintenanceRequests)
        .set({
          status: 'completed',
          resolution: input.resolution,
          laborCost: input.laborCost,
          partsCost: input.partsCost,
          totalCost: input.totalCost,
          customerSatisfaction: input.customerSatisfaction,
          completedAt: new Date(),
        })
        .where(eq(emergencyMaintenanceRequests.id, input.id));
      return { success: true };
    }),

  // --- قطع الغيار المستخدمة ---
  getPartsUsed: publicProcedure
    .input(z.object({
      maintenanceRecordId: z.number().optional(),
      emergencyRequestId: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      let result = await db.select().from(maintenancePartsUsed).orderBy(desc(maintenancePartsUsed.createdAt));
      if (input?.maintenanceRecordId) {
        result = result.filter(p => p.maintenanceRecordId === input.maintenanceRecordId);
      }
      if (input?.emergencyRequestId) {
        result = result.filter(p => p.emergencyRequestId === input.emergencyRequestId);
      }
      return result;
    }),

  recordPartUsage: publicProcedure
    .input(z.object({
      maintenanceRecordId: z.number().optional(),
      emergencyRequestId: z.number().optional(),
      partId: z.number(),
      partName: z.string(),
      quantity: z.string(),
      unitCost: z.string().optional(),
      warehouseId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const totalCost = input.unitCost ? (parseFloat(input.quantity) * parseFloat(input.unitCost)).toString() : null;
      
      const result = await db.insert(maintenancePartsUsed).values({
        maintenanceRecordId: input.maintenanceRecordId,
        emergencyRequestId: input.emergencyRequestId,
        partId: input.partId,
        partName: input.partName,
        quantity: input.quantity,
        unitCost: input.unitCost,
        totalCost,
        warehouseId: input.warehouseId,
        notes: input.notes,
      });
      
      return { success: true, id: result[0].insertId };
    }),

  // --- صيانة المعدات ---
  getEquipmentMaintenance: publicProcedure
    .input(z.object({
      equipmentId: z.number().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      let result = await db.select().from(equipmentMaintenance).orderBy(desc(equipmentMaintenance.createdAt));
      if (input?.equipmentId) {
        result = result.filter(m => m.equipmentId === input.equipmentId);
      }
      if (input?.status) {
        result = result.filter(m => m.status === input.status);
      }
      return result;
    }),

  createEquipmentMaintenance: publicProcedure
    .input(z.object({
      equipmentId: z.number(),
      maintenanceType: z.string(),
      scheduledDate: z.string().optional(),
      description: z.string().optional(),
      cost: z.string().optional(),
      performedBy: z.string().optional(),
      nextMaintenanceDate: z.string().optional(),
      notes: z.string().optional(),
      createdBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(equipmentMaintenance).values({
        equipmentId: input.equipmentId,
        maintenanceType: input.maintenanceType,
        scheduledDate: input.scheduledDate ? new Date(input.scheduledDate) : null,
        description: input.description,
        cost: input.cost,
        performedBy: input.performedBy,
        nextMaintenanceDate: input.nextMaintenanceDate ? new Date(input.nextMaintenanceDate) : null,
        notes: input.notes,
        createdBy: input.createdBy,
      });
      return { success: true, id: result[0].insertId };
    }),

  completeEquipmentMaintenance: publicProcedure
    .input(z.object({
      id: z.number(),
      completedDate: z.string(),
      cost: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.update(equipmentMaintenance)
        .set({
          completedDate: new Date(input.completedDate),
          status: 'completed',
          cost: input.cost,
          notes: input.notes,
        })
        .where(eq(equipmentMaintenance.id, input.id));
      return { success: true };
    }),

  // --- إحصائيات ---
  getMaintenanceStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const schedules = await db.select().from(preventiveMaintenanceSchedules);
    const records = await db.select().from(preventiveMaintenanceRecords);
    const emergencyRequests = await db.select().from(emergencyMaintenanceRequests);
    const equipmentMaintenanceRecords = await db.select().from(equipmentMaintenance);
    
    const totalCost = records.reduce((sum, r) => sum + parseFloat(r.totalCost || '0'), 0);
    
    return {
      totalPreventiveSchedules: schedules.length,
      activeSchedules: schedules.filter(s => s.isActive).length,
      overdueSchedules: schedules.filter(s => s.nextMaintenanceDate && new Date(s.nextMaintenanceDate) < new Date()).length,
      totalPreventiveRecords: records.length,
      completedRecords: records.filter(r => r.status === 'completed').length,
      totalEmergencyRequests: emergencyRequests.length,
      pendingRequests: emergencyRequests.filter(r => r.status === 'submitted').length,
      inProgressRequests: emergencyRequests.filter(r => r.status === 'in_progress').length,
      completedRequests: emergencyRequests.filter(r => r.status === 'completed').length,
      totalEquipmentMaintenance: equipmentMaintenanceRecords.length,
      totalMaintenanceCost: totalCost.toFixed(2),
    };
  }),
});
