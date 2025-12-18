import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { eq, desc } from 'drizzle-orm';
import {
  materialDistributions,
  materialDistributionItems,
  equipmentTracking,
  equipmentMaintenance,
} from '../../drizzle/schema';

export const materialsEquipmentRouter = router({
  // --- توزيع المواد ---
  getMaterialDistributions: publicProcedure
    .input(z.object({
      status: z.string().optional(),
      warehouseId: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      let result = await db.select().from(materialDistributions).orderBy(desc(materialDistributions.createdAt));
      if (input?.status) {
        result = result.filter(d => d.status === input.status);
      }
      if (input?.warehouseId) {
        result = result.filter(d => d.fromWarehouseId === input.warehouseId);
      }
      return result;
    }),

  getDistributionById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const distribution = await db.select().from(materialDistributions).where(eq(materialDistributions.id, input.id));
      const items = await db.select().from(materialDistributionItems).where(eq(materialDistributionItems.distributionId, input.id));
      return { distribution: distribution[0], items };
    }),

  createMaterialDistribution: publicProcedure
    .input(z.object({
      distributionNumber: z.string(),
      fromWarehouseId: z.number(),
      toWorkerId: z.number().optional(),
      toTeamId: z.number().optional(),
      distributionDate: z.string(),
      notes: z.string().optional(),
      createdBy: z.number().optional(),
      items: z.array(z.object({
        itemId: z.number(),
        quantity: z.string(),
        unitCost: z.string().optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      let totalItems = 0;
      let totalValue = 0;
      
      for (const item of input.items) {
        totalItems += parseFloat(item.quantity);
        if (item.unitCost) {
          totalValue += parseFloat(item.quantity) * parseFloat(item.unitCost);
        }
      }
      
      const result = await db.insert(materialDistributions).values({
        distributionNumber: input.distributionNumber,
        fromWarehouseId: input.fromWarehouseId,
        toWorkerId: input.toWorkerId,
        toTeamId: input.toTeamId,
        distributionDate: new Date(input.distributionDate),
        notes: input.notes,
        createdBy: input.createdBy,
        totalItems,
        totalValue: totalValue.toString(),
      });
      
      const distributionId = result[0].insertId;
      
      for (const item of input.items) {
        const totalCost = item.unitCost ? (parseFloat(item.quantity) * parseFloat(item.unitCost)).toString() : null;
        await db.insert(materialDistributionItems).values({
          distributionId,
          itemId: item.itemId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          totalCost,
        });
      }
      
      return { success: true, id: distributionId };
    }),

  updateDistributionStatus: publicProcedure
    .input(z.object({
      id: z.number(),
      status: z.string(),
      approvedBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.update(materialDistributions)
        .set({
          status: input.status,
          approvedBy: input.approvedBy,
        })
        .where(eq(materialDistributions.id, input.id));
      return { success: true };
    }),

  // --- تتبع المعدات ---
  getEquipmentTracking: publicProcedure
    .input(z.object({
      equipmentId: z.number().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      let result = await db.select().from(equipmentTracking).orderBy(desc(equipmentTracking.assignmentDate));
      if (input?.equipmentId) {
        result = result.filter(t => t.equipmentId === input.equipmentId);
      }
      if (input?.status) {
        result = result.filter(t => t.status === input.status);
      }
      return result;
    }),

  assignEquipment: publicProcedure
    .input(z.object({
      equipmentId: z.number(),
      assignedToWorkerId: z.number().optional(),
      assignedToTeamId: z.number().optional(),
      assignmentDate: z.string(),
      currentLocation: z.string().optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(equipmentTracking).values({
        equipmentId: input.equipmentId,
        assignedToWorkerId: input.assignedToWorkerId,
        assignedToTeamId: input.assignedToTeamId,
        assignmentDate: new Date(input.assignmentDate),
        currentLocation: input.currentLocation,
        latitude: input.latitude,
        longitude: input.longitude,
        notes: input.notes,
      });
      return { success: true, id: result[0].insertId };
    }),

  returnEquipment: publicProcedure
    .input(z.object({
      id: z.number(),
      returnDate: z.string(),
      condition: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.update(equipmentTracking)
        .set({
          returnDate: new Date(input.returnDate),
          condition: input.condition,
          status: 'returned',
          notes: input.notes,
        })
        .where(eq(equipmentTracking.id, input.id));
      return { success: true };
    }),

  updateEquipmentLocation: publicProcedure
    .input(z.object({
      id: z.number(),
      currentLocation: z.string(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.update(equipmentTracking)
        .set({
          currentLocation: input.currentLocation,
          latitude: input.latitude,
          longitude: input.longitude,
        })
        .where(eq(equipmentTracking.id, input.id));
      return { success: true };
    }),

  // --- صيانة المعدات ---
  getEquipmentMaintenance: publicProcedure
    .input(z.object({
      equipmentId: z.number().optional(),
      status: z.string().optional(),
      maintenanceType: z.string().optional(),
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
      if (input?.maintenanceType) {
        result = result.filter(m => m.maintenanceType === input.maintenanceType);
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
  getMaterialsEquipmentStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const distributions = await db.select().from(materialDistributions);
    const tracking = await db.select().from(equipmentTracking);
    const maintenance = await db.select().from(equipmentMaintenance);
    
    return {
      totalDistributions: distributions.length,
      pendingDistributions: distributions.filter(d => d.status === 'pending').length,
      completedDistributions: distributions.filter(d => d.status === 'completed').length,
      totalEquipmentAssignments: tracking.length,
      activeAssignments: tracking.filter(t => t.status === 'assigned').length,
      totalMaintenanceRecords: maintenance.length,
      scheduledMaintenance: maintenance.filter(m => m.status === 'scheduled').length,
      completedMaintenance: maintenance.filter(m => m.status === 'completed').length,
    };
  }),
});
