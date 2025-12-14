import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { db } from "../db";
import { metersTable } from "../../drizzle/schema"; // افتراض وجود جدول metersTable
import { eq, like, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// =================================================================
// 1. Validation Schemas (مخططات التحقق)
// =================================================================

// مخطط إنشاء عداد جديد
const createMeterSchema = z.object({
  meterNumber: z.string().min(1, "رقم العداد مطلوب."),
  customerId: z.string().min(1, "معرف العميل مطلوب."),
  type: z.enum(["electric", "water", "gas"], {
    errorMap: () => ({ message: "نوع العداد غير صالح. يجب أن يكون (electric, water, gas)." }),
  }),
  status: z.enum(["active", "inactive", "maintenance"], {
    errorMap: () => ({ message: "حالة العداد غير صالحة. يجب أن تكون (active, inactive, maintenance)." }),
  }),
});

// مخطط تحديث عداد موجود
const updateMeterSchema = z.object({
  id: z.string().min(1, "معرف العداد مطلوب للتحديث."),
  meterNumber: z.string().min(1, "رقم العداد مطلوب.").optional(),
  customerId: z.string().min(1, "معرف العميل مطلوب.").optional(),
  type: z.enum(["electric", "water", "gas"], {
    errorMap: () => ({ message: "نوع العداد غير صالح. يجب أن يكون (electric, water, gas)." }),
  }).optional(),
  status: z.enum(["active", "inactive", "maintenance"], {
    errorMap: () => ({ message: "حالة العداد غير صالحة. يجب أن تكون (active, inactive, maintenance)." }),
  }).optional(),
});

// مخطط جلب عداد بالمعرف
const getByIdSchema = z.object({
  id: z.string().min(1, "معرف العداد مطلوب."),
});

// مخطط الحذف (Soft Delete)
const deleteSchema = z.object({
  id: z.string().min(1, "معرف العداد مطلوب للحذف."),
});

// مخطط جلب عدادات العميل
const getByCustomerIdSchema = z.object({
  customerId: z.string().min(1, "معرف العميل مطلوب."),
});

// مخطط قائمة العدادات (مع Pagination والبحث)
const listMetersSchema = z.object({
  page: z.number().int().positive("يجب أن يكون رقم الصفحة موجبًا.").default(1),
  limit: z.number().int().positive("يجب أن يكون عدد العناصر موجبًا.").default(10),
  search: z.string().optional(), // البحث برقم العداد
  type: z.enum(["electric", "water", "gas"]).optional(), // فلتر حسب النوع
  status: z.enum(["active", "inactive", "maintenance"]).optional(), // فلتر حسب الحالة
  includeInactive: z.boolean().default(false), // تضمين المحذوف منطقياً
});

// =================================================================
// 2. Router Procedures (إجراءات الـ Router)
// =================================================================

export const metersRouter = router({
  // ----------------------------------------------------------------
  // 1. جلب قائمة العدادات (list)
  // ----------------------------------------------------------------
  list: protectedProcedure
    .input(listMetersSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { page, limit, search, type, status, includeInactive } = input;
        const offset = (page - 1) * limit;

        const conditions = [];
        
        // شرط عدم تضمين المحذوف منطقياً (isActive = true)
        if (!includeInactive) {
          conditions.push(eq(metersTable.isActive, true));
        }

        // شرط البحث برقم العداد
        if (search) {
          conditions.push(like(metersTable.meterNumber, `%${search}%`));
        }

        // شرط الفلتر حسب النوع
        if (type) {
          conditions.push(eq(metersTable.type, type));
        }

        // شرط الفلتر حسب الحالة
        if (status) {
          conditions.push(eq(metersTable.status, status));
        }

        // جلب البيانات
        const items = await db.select()
          .from(metersTable)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset);
          
        // جلب العدد الكلي
        const totalResult = await db.select({ count: sql<number>`count(*)` })
          .from(metersTable)
          .where(and(...conditions));
          
        const total = totalResult[0]?.count ?? 0;

        return { items, total, page, limit };
      } catch (error) {
        console.error("خطأ في جلب قائمة العدادات:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في جلب قائمة العدادات. يرجى المحاولة مرة أخرى.",
        });
      }
    }),

  // ----------------------------------------------------------------
  // 2. جلب عداد بالمعرف (getById)
  // ----------------------------------------------------------------
  getById: protectedProcedure
    .input(getByIdSchema)
    .query(async ({ input }) => {
      try {
        const item = await db.select()
          .from(metersTable)
          .where(eq(metersTable.id, input.id))
          .limit(1);

        if (!item || item.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "لم يتم العثور على العداد المطلوب.",
          });
        }

        return item[0];
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("خطأ في جلب العداد بالمعرف:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في جلب بيانات العداد. يرجى التحقق من المعرف.",
        });
      }
    }),

  // ----------------------------------------------------------------
  // 3. إنشاء عداد جديد (create)
  // ----------------------------------------------------------------
  create: protectedProcedure
    .input(createMeterSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const now = new Date();
        const result = await db.insert(metersTable).values({
          ...input,
          isActive: true,
          createdAt: now,
          updatedAt: now,
          createdBy: ctx.user.id, // افتراض أن ctx.user.id متاح
          updatedBy: ctx.user.id,
        });
        
        // افتراض أن Drizzle يعيد ID السجل المُنشأ
        const insertedId = result[0]?.id ?? "غير محدد"; 

        return { success: true, id: insertedId, message: "تم إنشاء العداد بنجاح." };
      } catch (error) {
        console.error("خطأ في إنشاء العداد:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في إنشاء العداد. قد يكون رقم العداد مكررًا أو هناك خطأ في البيانات.",
        });
      }
    }),

  // ----------------------------------------------------------------
  // 4. تحديث عداد موجود (update)
  // ----------------------------------------------------------------
  update: protectedProcedure
    .input(updateMeterSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...dataToUpdate } = input;

        // التحقق من وجود العداد
        const existingMeter = await db.select({ id: metersTable.id })
          .from(metersTable)
          .where(eq(metersTable.id, id))
          .limit(1);

        if (existingMeter.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "لا يمكن تحديث العداد. لم يتم العثور على سجل بالمعرف المحدد.",
          });
        }

        // تنفيذ التحديث
        await db.update(metersTable)
          .set({
            ...dataToUpdate,
            updatedAt: new Date(),
            updatedBy: ctx.user.id,
          })
          .where(eq(metersTable.id, id));

        return { success: true, id, message: "تم تحديث بيانات العداد بنجاح." };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("خطأ في تحديث العداد:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في تحديث العداد. يرجى مراجعة البيانات المدخلة.",
        });
      }
    }),

  // ----------------------------------------------------------------
  // 5. حذف منطقي (soft delete)
  // ----------------------------------------------------------------
  delete: protectedProcedure
    .input(deleteSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // التحقق من وجود العداد
        const existingMeter = await db.select({ id: metersTable.id })
          .from(metersTable)
          .where(eq(metersTable.id, input.id))
          .limit(1);

        if (existingMeter.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "لا يمكن حذف العداد. لم يتم العثور على سجل بالمعرف المحدد.",
          });
        }

        // تنفيذ الحذف المنطقي (Soft Delete)
        await db.update(metersTable)
          .set({
            isActive: false,
            updatedAt: new Date(),
            updatedBy: ctx.user.id,
          })
          .where(eq(metersTable.id, input.id));

        return { success: true, id: input.id, message: "تم حذف العداد منطقيًا بنجاح." };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("خطأ في الحذف المنطقي للعداد:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في تنفيذ عملية الحذف المنطقي.",
        });
      }
    }),
    
  // ----------------------------------------------------------------
  // 6. جلب عدادات العميل (getByCustomerId)
  // ----------------------------------------------------------------
  getByCustomerId: protectedProcedure
    .input(getByCustomerIdSchema)
    .query(async ({ input }) => {
      try {
        const items = await db.select()
          .from(metersTable)
          .where(and(
            eq(metersTable.customerId, input.customerId),
            eq(metersTable.isActive, true) // جلب العدادات النشطة فقط
          ));

        return items;
      } catch (error) {
        console.error("خطأ في جلب عدادات العميل:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في جلب عدادات العميل. يرجى التحقق من معرف العميل.",
        });
      }
    }),
});
