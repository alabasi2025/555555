import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { db } from "../db";
// افتراض أن مسار جدول الصلاحيات هو "../../drizzle/schema" واسمه permissionsTable
import { permissionsTable } from "../../drizzle/schema";
import { eq, like, and, sql, inArray } from "drizzle-orm";

// =================================================================
// 1. Validation Schemas
// =================================================================

// Schema أساسي لإنشاء الصلاحية
const createPermissionSchema = z.object({
  name: z.string().min(1, "اسم الصلاحية مطلوب ويجب ألا يكون فارغاً"),
  description: z.string().optional(),
  roleId: z.number().int().positive("معرف الدور (Role ID) مطلوب ويجب أن يكون رقماً صحيحاً موجباً"),
});

// Schema لإنشاء مجموعة من الصلاحيات
const bulkCreatePermissionsSchema = z.array(createPermissionSchema);

// Schema للتحديث
const updatePermissionSchema = z.object({
  id: z.number().int().positive("معرف الصلاحية (ID) مطلوب ويجب أن يكون رقماً صحيحاً موجباً"),
  name: z.string().min(1, "اسم الصلاحية مطلوب ويجب ألا يكون فارغاً").optional(),
  description: z.string().optional(),
  roleId: z.number().int().positive("معرف الدور (Role ID) يجب أن يكون رقماً صحيحاً موجباً").optional(),
});

// Schema لجلب عنصر واحد أو حذفه (Soft Delete)
const idSchema = z.object({
  id: z.number().int().positive("معرف الصلاحية (ID) مطلوب ويجب أن يكون رقماً صحيحاً موجباً"),
});

// Schema لجلب الصلاحيات حسب معرف الدور
const roleIdSchema = z.object({
  roleId: z.number().int().positive("معرف الدور (Role ID) مطلوب ويجب أن يكون رقماً صحيحاً موجباً"),
});

// Schema لجلب القائمة مع Pagination والبحث والتصفية
const listPermissionsSchema = z.object({
  page: z.number().int().positive("رقم الصفحة يجب أن يكون رقماً صحيحاً موجباً").default(1),
  limit: z.number().int().positive("عدد العناصر في الصفحة يجب أن يكون رقماً صحيحاً موجباً").default(10),
  search: z.string().optional(), // للبحث في حقل الاسم
  roleId: z.number().int().positive("تصفية حسب معرف الدور").optional(),
  isActive: z.boolean().optional().default(true), // افتراض جلب النشطين فقط
});

// =================================================================
// 2. Router Implementation
// =================================================================

export const permissionsRouter = router({
  // 1. جلب قائمة مع pagination وsearch وfilters
  list: protectedProcedure
    .input(listPermissionsSchema)
    .query(async ({ input }) => {
      try {
        const { page, limit, search, roleId, isActive } = input;
        const offset = (page - 1) * limit;
        
        const conditions = [eq(permissionsTable.isActive, isActive)];
        
        if (search) {
          conditions.push(like(permissionsTable.name, `%${search}%`));
        }
        
        if (roleId) {
          conditions.push(eq(permissionsTable.roleId, roleId));
        }
        
        const items = await db.select()
          .from(permissionsTable)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset);
          
        // جلب العدد الكلي للسجلات (لأغراض الـ pagination)
        const totalResult = await db.select({ count: sql<number>`count(*)` })
          .from(permissionsTable)
          .where(and(...conditions));
          
        const total = totalResult[0]?.count || 0;
          
        return { items, total, page, limit };
      } catch (error) {
        console.error("Error in list procedure:", error);
        throw new Error("فشل في جلب قائمة الصلاحيات. يرجى المحاولة لاحقاً.");
      }
    }),
    
  // 2. جلب عنصر واحد بالـ ID
  getById: protectedProcedure
    .input(idSchema)
    .query(async ({ input }) => {
      try {
        const item = await db.select()
          .from(permissionsTable)
          .where(eq(permissionsTable.id, input.id))
          .limit(1);
          
        if (item.length === 0) {
          throw new Error("لم يتم العثور على الصلاحية المطلوبة.");
        }
        
        return item[0];
      } catch (error) {
        console.error("Error in getById procedure:", error);
        throw new Error(error instanceof Error ? error.message : "فشل في جلب الصلاحية. يرجى التأكد من المعرف.");
      }
    }),
    
  // 3. إنشاء عنصر جديد
  create: protectedProcedure
    .input(createPermissionSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await db.insert(permissionsTable).values({
          ...input,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        }).returning({ id: permissionsTable.id });
        
        if (result.length === 0) {
            throw new Error("فشل في إنشاء الصلاحية، لم يتم إرجاع معرف.");
        }
        
        return { success: true, id: result[0].id };
      } catch (error) {
        console.error("Error in create procedure:", error);
        throw new Error("فشل في إنشاء الصلاحية. يرجى التحقق من البيانات المدخلة.");
      }
    }),
    
  // 4. تحديث عنصر موجود
  update: protectedProcedure
    .input(updatePermissionSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...data } = input;
        
        // التحقق من وجود السجل قبل التحديث
        const existing = await db.select({ id: permissionsTable.id })
          .from(permissionsTable)
          .where(eq(permissionsTable.id, id))
          .limit(1);
          
        if (existing.length === 0) {
          throw new Error("لا يمكن تحديث الصلاحية. السجل غير موجود.");
        }
        
        const result = await db.update(permissionsTable)
          .set({
            ...data,
            updatedAt: new Date(),
            updatedBy: ctx.user.id,
          })
          .where(eq(permissionsTable.id, id))
          .returning({ id: permissionsTable.id });
          
        return { success: result.length > 0 };
      } catch (error) {
        console.error("Error in update procedure:", error);
        throw new Error(error instanceof Error ? error.message : "فشل في تحديث الصلاحية. يرجى المحاولة لاحقاً.");
      }
    }),
    
  // 5. حذف soft delete (isActive = false)
  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // التحقق من وجود السجل قبل الحذف
        const existing = await db.select({ id: permissionsTable.id })
          .from(permissionsTable)
          .where(eq(permissionsTable.id, input.id))
          .limit(1);
          
        if (existing.length === 0) {
          throw new Error("لا يمكن حذف الصلاحية. السجل غير موجود.");
        }
        
        const result = await db.update(permissionsTable)
          .set({
            isActive: false,
            updatedAt: new Date(),
            updatedBy: ctx.user.id,
          })
          .where(eq(permissionsTable.id, input.id))
          .returning({ id: permissionsTable.id });
          
        return { success: result.length > 0 };
      } catch (error) {
        console.error("Error in delete procedure:", error);
        throw new Error(error instanceof Error ? error.message : "فشل في حذف الصلاحية. يرجى المحاولة لاحقاً.");
      }
    }),
    
  // 6. جلب الصلاحيات حسب معرف الدور (getByRoleId)
  getByRoleId: protectedProcedure
    .input(roleIdSchema)
    .query(async ({ input }) => {
      try {
        const items = await db.select()
          .from(permissionsTable)
          .where(and(
            eq(permissionsTable.roleId, input.roleId),
            eq(permissionsTable.isActive, true)
          ));
          
        return items;
      } catch (error) {
        console.error("Error in getByRoleId procedure:", error);
        throw new Error("فشل في جلب الصلاحيات للدور المحدد. يرجى التأكد من معرف الدور.");
      }
    }),
    
  // 7. إنشاء مجموعة من الصلاحيات (bulkCreate)
  bulkCreate: protectedProcedure
    .input(bulkCreatePermissionsSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        if (input.length === 0) {
          return { success: true, count: 0 };
        }
        
        const permissionsToInsert = input.map(p => ({
          ...p,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        }));
        
        // استخدام insert مع values مصفوفة لـ bulk insert
        const result = await db.insert(permissionsTable).values(permissionsToInsert).returning({ id: permissionsTable.id });
        
        return { success: true, count: result.length, ids: result.map(r => r.id) };
      } catch (error) {
        console.error("Error in bulkCreate procedure:", error);
        throw new Error("فشل في إنشاء مجموعة الصلاحيات. يرجى التحقق من البيانات المدخلة.");
      }
    }),
});
