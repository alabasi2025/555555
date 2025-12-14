import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { db } from "../db";
// افتراض أن لديك مخطط Drizzle لجدول الصيانة
// يجب استبدال 'maintenanceTable' بالاسم الفعلي لمخطط جدول الصيانة في Drizzle
import { maintenanceTable } from "../../drizzle/schema";
import { eq, like, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// -----------------------------------------------------------------------------
// 1. Validation Schemas
// -----------------------------------------------------------------------------

const MaintenanceStatus = z.enum(["Pending", "InProgress", "Completed", "Cancelled"], {
  required_error: "حالة الصيانة مطلوبة",
  invalid_type_error: "حالة صيانة غير صالحة",
});

const MaintenancePriority = z.enum(["Low", "Medium", "High"], {
  required_error: "أولوية الصيانة مطلوبة",
  invalid_type_error: "أولوية صيانة غير صالحة",
});

// Schema for creating a new maintenance request
const createSchema = z.object({
  assetId: z.number({
    required_error: "معرف الأصل (Asset ID) مطلوب",
    invalid_type_error: "يجب أن يكون معرف الأصل رقماً",
  }).int("يجب أن يكون معرف الأصل عدداً صحيحاً").positive("يجب أن يكون معرف الأصل موجباً"),
  description: z.string({
    required_error: "الوصف مطلوب",
  }).min(10, "يجب أن لا يقل الوصف عن 10 أحرف").max(500, "يجب أن لا يزيد الوصف عن 500 حرف"),
  priority: MaintenancePriority,
  scheduledDate: z.string({
    required_error: "تاريخ الجدولة مطلوب",
  }).regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "صيغة تاريخ الجدولة غير صحيحة (ISO 8601)"),
});

// Schema for updating an existing maintenance request
const updateSchema = z.object({
  id: z.number({
    required_error: "معرف الصيانة مطلوب",
    invalid_type_error: "يجب أن يكون معرف الصيانة رقماً",
  }).int("يجب أن يكون معرف الصيانة عدداً صحيحاً").positive("يجب أن يكون معرف الصيانة موجباً"),
  assetId: z.number({
    invalid_type_error: "يجب أن يكون معرف الأصل رقماً",
  }).int("يجب أن يكون معرف الأصل عدداً صحيحاً").positive("يجب أن يكون معرف الأصل موجباً").optional(),
  description: z.string().min(10, "يجب أن لا يقل الوصف عن 10 أحرف").max(500, "يجب أن لا يزيد الوصف عن 500 حرف").optional(),
  priority: MaintenancePriority.optional(),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "صيغة تاريخ الجدولة غير صحيحة (ISO 8601)").optional(),
  status: MaintenanceStatus.optional(),
});

// Schema for procedures that require only the ID (getById, complete, cancel, delete)
const idSchema = z.object({
  id: z.number({
    required_error: "معرف الصيانة مطلوب",
    invalid_type_error: "يجب أن يكون معرف الصيانة رقماً",
  }).int("يجب أن يكون معرف الصيانة عدداً صحيحاً").positive("يجب أن يكون معرف الصيانة موجباً"),
});

// Schema for listing with pagination, search, and filters
const listSchema = z.object({
  page: z.number().int("يجب أن يكون رقم الصفحة عدداً صحيحاً").positive("يجب أن يكون رقم الصفحة موجباً").default(1),
  limit: z.number().int("يجب أن يكون عدد العناصر عدداً صحيحاً").positive("يجب أن يكون عدد العناصر موجباً").max(100, "الحد الأقصى 100 عنصر").default(10),
  search: z.string().optional(),
  statusFilter: MaintenanceStatus.optional(),
  priorityFilter: MaintenancePriority.optional(),
  assetIdFilter: z.number().int("يجب أن يكون معرف الأصل عدداً صحيحاً").positive("يجب أن يكون معرف الأصل موجباً").optional(),
});

// Schema for getByAssetId
const getByAssetIdSchema = z.object({
  assetId: z.number({
    required_error: "معرف الأصل (Asset ID) مطلوب",
    invalid_type_error: "يجب أن يكون معرف الأصل رقماً",
  }).int("يجب أن يكون معرف الأصل عدداً صحيحاً").positive("يجب أن يكون معرف الأصل موجباً"),
});

// -----------------------------------------------------------------------------
// 2. Router Procedures
// -----------------------------------------------------------------------------

export const maintenanceRouter = router({
  // 1. list: جلب قائمة مع pagination وsearch وfilters
  list: protectedProcedure
    .input(listSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { page, limit, search, statusFilter, priorityFilter, assetIdFilter } = input;
        const offset = (page - 1) * limit;

        const conditions = [eq(maintenanceTable.isActive, true)];

        if (search) {
          // البحث في الوصف (افتراضاً)
          conditions.push(like(maintenanceTable.description, `%${search}%`));
        }
        if (statusFilter) {
          conditions.push(eq(maintenanceTable.status, statusFilter));
        }
        if (priorityFilter) {
          conditions.push(eq(maintenanceTable.priority, priorityFilter));
        }
        if (assetIdFilter) {
          conditions.push(eq(maintenanceTable.assetId, assetIdFilter));
        }

        // جلب إجمالي عدد السجلات
        const totalResult = await db.select({ count: sql<number>`count(*)` })
          .from(maintenanceTable)
          .where(and(...conditions));
        const total = totalResult[0]?.count || 0;

        // جلب قائمة السجلات
        const items = await db.select()
          .from(maintenanceTable)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(maintenanceTable.createdAt); // ترتيب افتراضي

        return { items, total, page, limit };
      } catch (error) {
        console.error("Error in list procedure:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "فشل في جلب قائمة طلبات الصيانة",
        });
      }
    }),

  // 2. getById: جلب عنصر واحد بالـ ID
  getById: protectedProcedure
    .input(idSchema)
    .query(async ({ input }) => {
      try {
        const item = await db.select()
          .from(maintenanceTable)
          .where(and(eq(maintenanceTable.id, input.id), eq(maintenanceTable.isActive, true)))
          .limit(1);

        if (!item.length) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: "لم يتم العثور على طلب الصيانة",
          });
        }

        return item[0];
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error in getById procedure:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "فشل في جلب طلب الصيانة",
        });
      }
    }),

  // 3. create: إنشاء عنصر جديد مع validation كامل
  create: protectedProcedure
    .input(createSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const [result] = await db.insert(maintenanceTable).values({
          ...input,
          status: 'Pending', // الحالة الافتراضية
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        }).returning({ id: maintenanceTable.id });

        return { success: true, id: result.id, message: "تم إنشاء طلب الصيانة بنجاح" };
      } catch (error) {
        console.error("Error in create procedure:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "فشل في إنشاء طلب الصيانة",
        });
      }
    }),

  // 4. update: تحديث عنصر موجود
  update: protectedProcedure
    .input(updateSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...data } = input;

        // 1. التحقق من وجود السجل ونشاطه
        const existing = await db.select({ id: maintenanceTable.id })
          .from(maintenanceTable)
          .where(and(eq(maintenanceTable.id, id), eq(maintenanceTable.isActive, true)))
          .limit(1);

        if (!existing.length) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: "لا يمكن تحديث: لم يتم العثور على طلب الصيانة أو أنه غير نشط",
          });
        }

        // 2. تنفيذ التحديث
        const [result] = await db.update(maintenanceTable)
          .set({
            ...data,
            updatedAt: new Date(),
            updatedBy: ctx.user.id,
          })
          .where(eq(maintenanceTable.id, id))
          .returning({ id: maintenanceTable.id });

        return { success: true, id: result.id, message: "تم تحديث طلب الصيانة بنجاح" };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error in update procedure:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "فشل في تحديث طلب الصيانة",
        });
      }
    }),

  // 5. complete: تغيير حالة الصيانة إلى 'Completed'
  complete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // 1. التحقق من وجود السجل ونشاطه
        const existing = await db.select({ id: maintenanceTable.id, status: maintenanceTable.status })
          .from(maintenanceTable)
          .where(and(eq(maintenanceTable.id, input.id), eq(maintenanceTable.isActive, true)))
          .limit(1);

        if (!existing.length) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: "لا يمكن إكمال: لم يتم العثور على طلب الصيانة أو أنه غير نشط",
          });
        }

        if (existing[0].status === 'Completed') {
          return { success: true, id: input.id, message: "طلب الصيانة مكتمل بالفعل" };
        }
        
        if (existing[0].status === 'Cancelled') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: "لا يمكن إكمال طلب صيانة تم إلغاؤه",
          });
        }

        // 2. تنفيذ التحديث
        const [result] = await db.update(maintenanceTable)
          .set({
            status: 'Completed',
            completionDate: new Date(),
            updatedAt: new Date(),
            updatedBy: ctx.user.id,
          })
          .where(eq(maintenanceTable.id, input.id))
          .returning({ id: maintenanceTable.id });

        return { success: true, id: result.id, message: "تم إكمال طلب الصيانة بنجاح" };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error in complete procedure:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "فشل في إكمال طلب الصيانة",
        });
      }
    }),

  // 6. cancel: تغيير حالة الصيانة إلى 'Cancelled'
  cancel: protectedProcedure
    .input(idSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // 1. التحقق من وجود السجل ونشاطه
        const existing = await db.select({ id: maintenanceTable.id, status: maintenanceTable.status })
          .from(maintenanceTable)
          .where(and(eq(maintenanceTable.id, input.id), eq(maintenanceTable.isActive, true)))
          .limit(1);

        if (!existing.length) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: "لا يمكن إلغاء: لم يتم العثور على طلب الصيانة أو أنه غير نشط",
          });
        }
        
        if (existing[0].status === 'Cancelled') {
          return { success: true, id: input.id, message: "طلب الصيانة ملغى بالفعل" };
        }
        
        if (existing[0].status === 'Completed') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: "لا يمكن إلغاء طلب صيانة مكتمل",
          });
        }

        // 2. تنفيذ التحديث
        const [result] = await db.update(maintenanceTable)
          .set({
            status: 'Cancelled',
            updatedAt: new Date(),
            updatedBy: ctx.user.id,
          })
          .where(eq(maintenanceTable.id, input.id))
          .returning({ id: maintenanceTable.id });

        return { success: true, id: result.id, message: "تم إلغاء طلب الصيانة بنجاح" };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error in cancel procedure:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "فشل في إلغاء طلب الصيانة",
        });
      }
    }),

  // 7. getByAssetId: جلب طلبات الصيانة الخاصة بأصل معين
  getByAssetId: protectedProcedure
    .input(getByAssetIdSchema)
    .query(async ({ input }) => {
      try {
        const items = await db.select()
          .from(maintenanceTable)
          .where(and(eq(maintenanceTable.assetId, input.assetId), eq(maintenanceTable.isActive, true)))
          .orderBy(maintenanceTable.createdAt);

        return items;
      } catch (error) {
        console.error("Error in getByAssetId procedure:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "فشل في جلب طلبات الصيانة للأصل المحدد",
        });
      }
    }),

  // 8. delete: حذف soft delete (isActive = false)
  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // 1. التحقق من وجود السجل ونشاطه
        const existing = await db.select({ id: maintenanceTable.id })
          .from(maintenanceTable)
          .where(and(eq(maintenanceTable.id, input.id), eq(maintenanceTable.isActive, true)))
          .limit(1);

        if (!existing.length) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: "لا يمكن حذف: لم يتم العثور على طلب الصيانة أو أنه غير نشط بالفعل",
          });
        }

        // 2. تنفيذ الحذف الناعم (Soft Delete)
        const [result] = await db.update(maintenanceTable)
          .set({
            isActive: false,
            updatedAt: new Date(),
            updatedBy: ctx.user.id,
          })
          .where(eq(maintenanceTable.id, input.id))
          .returning({ id: maintenanceTable.id });

        return { success: true, id: result.id, message: "تم حذف طلب الصيانة بنجاح (حذف ناعم)" };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error in delete procedure:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "فشل في حذف طلب الصيانة",
        });
      }
    }),
});

// ملاحظة: يجب التأكد من استبدال 'maintenanceTable' و 'db' و 'protectedProcedure' و 'router' بالمسارات الصحيحة في مشروعك.
// تم إضافة 8 procedures: list, getById, create, update, complete, cancel, getByAssetId, delete.
