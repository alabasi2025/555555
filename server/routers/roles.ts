import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { db } from "../db";
import { roles, permissionsToRoles } from "../../drizzle/schema"; // افتراض وجود هذه الجداول
import { eq, like, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// =================================================================
// 1. Zod Validation Schemas (مع رسائل خطأ عربية)
// =================================================================

// Schema for base role fields
const roleBaseSchema = z.object({
  name: z.string().min(1, "اسم الدور مطلوب ولا يمكن أن يكون فارغًا").max(100, "يجب ألا يتجاوز اسم الدور 100 حرف"),
  description: z.string().max(255, "يجب ألا يتجاوز الوصف 255 حرفًا").optional(),
});

// Schema for creating a new role
const createRoleSchema = roleBaseSchema;

// Schema for updating an existing role
const updateRoleSchema = roleBaseSchema.extend({
  id: z.number().int("يجب أن يكون المعرف رقمًا صحيحًا").positive("معرف الدور مطلوب"),
});

// Schema for getting a role by ID
const getRoleSchema = z.object({
  id: z.number().int("يجب أن يكون المعرف رقمًا صحيحًا").positive("معرف الدور مطلوب"),
});

// Schema for soft deleting a role
const deleteRoleSchema = z.object({
  id: z.number().int("يجب أن يكون المعرف رقمًا صحيحًا").positive("معرف الدور مطلوب للحذف"),
});

// Schema for listing roles (with pagination, search, and filters)
const listRolesSchema = z.object({
  page: z.number().int("يجب أن يكون رقم الصفحة رقمًا صحيحًا").min(1, "يجب أن تكون الصفحة 1 على الأقل").default(1),
  limit: z.number().int("يجب أن يكون الحد رقمًا صحيحًا").min(1, "يجب أن يكون الحد 1 على الأقل").max(100, "الحد الأقصى هو 100").default(10),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Schema for assigning permissions to a role
const assignPermissionsSchema = z.object({
  roleId: z.number().int("يجب أن يكون معرف الدور رقمًا صحيحًا").positive("معرف الدور مطلوب"),
  permissionIds: z.array(z.number().int("يجب أن يكون معرف الإذن رقمًا صحيحًا").positive("معرف إذن غير صالح"))
    .min(1, "يجب تحديد إذن واحد على الأقل للدور"),
});

// =================================================================
// 2. Roles Router
// =================================================================

export const rolesRouter = router({
  
  // 1. list: جلب قائمة مع pagination وsearch وfilters
  list: protectedProcedure
    .input(listRolesSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { page, limit, search, isActive } = input;
        const offset = (page - 1) * limit;
        
        const conditions = [];
        
        // Search condition
        if (search) {
          conditions.push(like(roles.name, `%${search}%`));
        }
        
        // Filter by isActive (default to true if not specified)
        conditions.push(eq(roles.isActive, isActive !== undefined ? isActive : true));
        
        // Get total count for pagination
        const totalResult = await db.select({ count: sql<number>`count(*)` })
          .from(roles)
          .where(and(...conditions));
          
        const total = totalResult[0].count;

        // Get items
        const items = await db.select()
          .from(roles)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(roles.createdAt);
          
        return { 
          items, 
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      } catch (error) {
        console.error("Error in list procedure:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "فشل في جلب قائمة الأدوار. يرجى المحاولة مرة أخرى.",
        });
      }
    }),
    
  // 2. getById: جلب عنصر واحد بالـ ID
  getById: protectedProcedure
    .input(getRoleSchema)
    .query(async ({ input, ctx }) => {
      try {
        const role = await db.select()
          .from(roles)
          .where(eq(roles.id, input.id))
          .limit(1);
          
        if (role.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: "الدور المطلوب غير موجود.",
          });
        }
        
        return role[0];
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error in getById procedure:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "فشل في جلب تفاصيل الدور. يرجى التحقق من المعرف.",
        });
      }
    }),
    
  // 3. create: إنشاء عنصر جديد مع validation كامل
  create: protectedProcedure
    .input(createRoleSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await db.insert(roles).values({
          ...input,
          isActive: true, // Default to active
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }).returning({ id: roles.id });
        
        return { success: true, id: result[0].id, message: "تم إنشاء الدور بنجاح." };
      } catch (error) {
        console.error("Error in create procedure:", error);
        // Handle potential unique constraint violation (e.g., role name already exists)
        if (error.message.includes("duplicate key")) {
             throw new TRPCError({
                code: 'CONFLICT',
                message: "اسم الدور موجود بالفعل. يرجى اختيار اسم آخر.",
            });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "فشل في إنشاء الدور. يرجى المحاولة مرة أخرى.",
        });
      }
    }),
    
  // 4. update: تحديث عنصر موجود
  update: protectedProcedure
    .input(updateRoleSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...data } = input;
        
        // 1. Check if the role exists
        const existingRole = await db.select({ id: roles.id })
          .from(roles)
          .where(eq(roles.id, id))
          .limit(1);
          
        if (existingRole.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: "لا يمكن تحديث الدور. الدور غير موجود.",
          });
        }
        
        // 2. Perform the update
        const result = await db.update(roles)
          .set({
            ...data,
            updatedBy: ctx.user.id,
            updatedAt: new Date(),
          })
          .where(eq(roles.id, id))
          .returning({ id: roles.id });
          
        return { success: true, id: result[0].id, message: "تم تحديث الدور بنجاح." };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error in update procedure:", error);
        // Handle potential unique constraint violation
        if (error.message.includes("duplicate key")) {
             throw new TRPCError({
                code: 'CONFLICT',
                message: "اسم الدور موجود بالفعل. يرجى اختيار اسم آخر.",
            });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "فشل في تحديث الدور. يرجى المحاولة مرة أخرى.",
        });
      }
    }),
    
  // 5. delete: حذف soft delete (isActive = false)
  delete: protectedProcedure
    .input(deleteRoleSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id } = input;
        
        // 1. Check if the role exists and is active
        const existingRole = await db.select({ id: roles.id, isActive: roles.isActive })
          .from(roles)
          .where(eq(roles.id, id))
          .limit(1);
          
        if (existingRole.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: "لا يمكن حذف الدور. الدور غير موجود.",
          });
        }
        
        if (!existingRole[0].isActive) {
            return { success: true, id, message: "الدور محذوف بالفعل (غير نشط)." };
        }
        
        // 2. Perform soft delete
        const result = await db.update(roles)
          .set({
            isActive: false,
            updatedBy: ctx.user.id,
            updatedAt: new Date(),
          })
          .where(eq(roles.id, id))
          .returning({ id: roles.id });
          
        return { success: true, id: result[0].id, message: "تم حذف الدور (تعطيله) بنجاح." };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error in delete procedure:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "فشل في حذف الدور. يرجى المحاولة مرة أخرى.",
        });
      }
    }),
    
  // 6. assignPermissions: ربط مجموعة من الأذونات بالدور
  assignPermissions: protectedProcedure
    .input(assignPermissionsSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { roleId, permissionIds } = input;
        
        // 1. Check if the role exists
        const existingRole = await db.select({ id: roles.id })
          .from(roles)
          .where(eq(roles.id, roleId))
          .limit(1);
          
        if (existingRole.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: "لا يمكن تعيين الأذونات. الدور غير موجود.",
          });
        }
        
        // 2. Start a transaction to ensure atomicity
        await db.transaction(async (tx) => {
          // 2.1. Delete existing permissions for the role
          await tx.delete(permissionsToRoles).where(eq(permissionsToRoles.roleId, roleId));
          
          // 2.2. Insert new permissions
          if (permissionIds.length > 0) {
            const newAssignments = permissionIds.map(permissionId => ({
              roleId,
              permissionId,
              createdBy: ctx.user.id,
              updatedBy: ctx.user.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            }));
            
            await tx.insert(permissionsToRoles).values(newAssignments);
          }
        });
        
        return { success: true, roleId, count: permissionIds.length, message: "تم تعيين الأذونات للدور بنجاح." };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error in assignPermissions procedure:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "فشل في تعيين الأذونات للدور. يرجى التأكد من صحة معرفات الأذونات.",
        });
      }
    }),
});
