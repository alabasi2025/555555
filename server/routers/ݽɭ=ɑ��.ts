import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { db } from "../db";
import { workOrders as workOrdersTable } from "../../drizzle/schema"; // افتراض وجود جدول workOrders
import { eq, like, and, sql, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// =================================================================
// 1. Enums and Core Schemas
// =================================================================

const StatusEnum = z.enum(["pending", "assigned", "completed", "cancelled"], {
  errorMap: () => ({ message: "حالة أمر العمل غير صالحة. يجب أن تكون: pending, assigned, completed, أو cancelled" }),
});

const PriorityEnum = z.enum(["low", "medium", "high"], {
  errorMap: () => ({ message: "أولوية أمر العمل غير صالحة. يجب أن تكون: low, medium, أو high" }),
});

const IdSchema = z.object({
  id: z.string().min(1, "معرّف أمر العمل مطلوب"),
});

// =================================================================
// 2. Validation Schemas for Procedures
// =================================================================

// 2.1. List Input Schema
const ListInputSchema = z.object({
  page: z.number().int("يجب أن يكون رقمًا صحيحًا").min(1, "يجب أن تكون الصفحة أكبر من 0").default(1),
  limit: z.number().int("يجب أن يكون رقمًا صحيحًا").min(1, "يجب أن يكون الحد أكبر من 0").default(10),
  search: z.string().optional(),
  status: StatusEnum.optional(),
  priority: PriorityEnum.optional(),
  assignedToId: z.string().optional(),
});

// 2.2. Create Input Schema
const CreateInputSchema = z.object({
  title: z.string().min(3, "عنوان أمر العمل مطلوب ولا يقل عن 3 أحرف"),
  description: z.string().optional(),
  priority: PriorityEnum.default("medium"),
  dueDate: z.string().datetime("صيغة تاريخ الاستحقاق غير صحيحة").optional(),
});

// 2.3. Update Input Schema
const UpdateInputSchema = z.object({
  id: z.string().min(1, "معرّف أمر العمل مطلوب للتحديث"),
  title: z.string().min(3, "عنوان أمر العمل مطلوب ولا يقل عن 3 أحرف").optional(),
  description: z.string().optional(),
  priority: PriorityEnum.optional(),
  dueDate: z.string().datetime("صيغة تاريخ الاستحقاق غير صحيحة").optional().nullable(),
});

// 2.4. Assign Input Schema
const AssignInputSchema = z.object({
  id: z.string().min(1, "معرّف أمر العمل مطلوب للتخصيص"),
  assignedToId: z.string().min(1, "معرّف الموظف المخصص له مطلوب"),
});

// =================================================================
// 3. Work Orders Router
// =================================================================

export const workOrdersRouter = router({
  // 3.1. list: جلب قائمة مع pagination وsearch وfilters
  list: protectedProcedure
    .input(ListInputSchema)
    .query(async ({ input }) => {
      try {
        const { page, limit, search, status, priority, assignedToId } = input;
        const offset = (page - 1) * limit;

        const conditions = [eq(workOrdersTable.isActive, true)];

        if (search) {
          conditions.push(like(workOrdersTable.title, `%${search}%`));
        }
        if (status) {
          conditions.push(eq(workOrdersTable.status, status));
        }
        if (priority) {
          conditions.push(eq(workOrdersTable.priority, priority));
        }
        if (assignedToId) {
          conditions.push(eq(workOrdersTable.assignedToId, assignedToId));
        }

        const items = await db.select()
          .from(workOrdersTable)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(workOrdersTable.createdAt));

        const totalResult = await db.select({ count: sql<number>`count(*)` })
          .from(workOrdersTable)
          .where(and(...conditions));

        const total = totalResult[0]?.count ?? 0;

        return { items, total, page, limit };
      } catch (error) {
        console.error("Error in list procedure:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في جلب قائمة أوامر العمل. يرجى المحاولة مرة أخرى.",
        });
      }
    }),

  // 3.2. getById: جلب عنصر واحد بالـ ID
  getById: protectedProcedure
    .input(IdSchema)
    .query(async ({ input }) => {
      try {
        const item = await db.select()
          .from(workOrdersTable)
          .where(and(eq(workOrdersTable.id, input.id), eq(workOrdersTable.isActive, true)))
          .limit(1);

        if (!item.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "لم يتم العثور على أمر العمل المطلوب.",
          });
        }

        return item[0];
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error in getById procedure:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في جلب تفاصيل أمر العمل.",
        });
      }
    }),

  // 3.3. create: إنشاء عنصر جديد مع validation كامل
  create: protectedProcedure
    .input(CreateInputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const [result] = await db.insert(workOrdersTable).values({
          ...input,
          status: "pending", // الحالة الافتراضية
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        }).returning({ id: workOrdersTable.id });

        return { success: true, id: result.id, message: "تم إنشاء أمر العمل بنجاح." };
      } catch (error) {
        console.error("Error in create procedure:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في إنشاء أمر العمل. يرجى التحقق من البيانات والمحاولة مرة أخرى.",
        });
      }
    }),

  // 3.4. update: تحديث عنصر موجود
  update: protectedProcedure
    .input(UpdateInputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...dataToUpdate } = input;

        const [existingItem] = await db.select({ id: workOrdersTable.id })
          .from(workOrdersTable)
          .where(and(eq(workOrdersTable.id, id), eq(workOrdersTable.isActive, true)));

        if (!existingItem) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "لا يمكن تحديث أمر العمل. السجل غير موجود أو محذوف.",
          });
        }

        const [result] = await db.update(workOrdersTable)
          .set({
            ...dataToUpdate,
            updatedAt: new Date(),
            updatedBy: ctx.user.id,
          })
          .where(eq(workOrdersTable.id, id))
          .returning({ id: workOrdersTable.id });

        return { success: true, id: result.id, message: "تم تحديث أمر العمل بنجاح." };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error in update procedure:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في تحديث أمر العمل. يرجى المحاولة مرة أخرى.",
        });
      }
    }),

  // 3.5. assign: تخصيص أمر العمل لموظف
  assign: protectedProcedure
    .input(AssignInputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, assignedToId } = input;

        const [existingItem] = await db.select({ id: workOrdersTable.id, status: workOrdersTable.status })
          .from(workOrdersTable)
          .where(and(eq(workOrdersTable.id, id), eq(workOrdersTable.isActive, true)));

        if (!existingItem) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "لا يمكن تخصيص أمر العمل. السجل غير موجود أو محذوف.",
          });
        }

        const newStatus = existingItem.status === "pending" ? "assigned" : existingItem.status;

        const [result] = await db.update(workOrdersTable)
          .set({
            assignedToId: assignedToId,
            status: newStatus,
            updatedAt: new Date(),
            updatedBy: ctx.user.id,
          })
          .where(eq(workOrdersTable.id, id))
          .returning({ id: workOrdersTable.id });

        return { success: true, id: result.id, message: "تم تخصيص أمر العمل بنجاح." };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error in assign procedure:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في تخصيص أمر العمل. يرجى المحاولة مرة أخرى.",
        });
      }
    }),

  // 3.6. complete: وضع علامة "مكتمل" على أمر العمل
  complete: protectedProcedure
    .input(IdSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const [existingItem] = await db.select({ id: workOrdersTable.id })
          .from(workOrdersTable)
          .where(and(eq(workOrdersTable.id, input.id), eq(workOrdersTable.isActive, true)));

        if (!existingItem) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "لا يمكن إكمال أمر العمل. السجل غير موجود أو محذوف.",
          });
        }

        const [result] = await db.update(workOrdersTable)
          .set({
            status: "completed",
            updatedAt: new Date(),
            updatedBy: ctx.user.id,
          })
          .where(eq(workOrdersTable.id, input.id))
          .returning({ id: workOrdersTable.id });

        return { success: true, id: result.id, message: "تم إكمال أمر العمل بنجاح." };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error in complete procedure:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في إكمال أمر العمل. يرجى المحاولة مرة أخرى.",
        });
      }
    }),

  // 3.7. cancel: إلغاء أمر العمل
  cancel: protectedProcedure
    .input(IdSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const [existingItem] = await db.select({ id: workOrdersTable.id })
          .from(workOrdersTable)
          .where(and(eq(workOrdersTable.id, input.id), eq(workOrdersTable.isActive, true)));

        if (!existingItem) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "لا يمكن إلغاء أمر العمل. السجل غير موجود أو محذوف.",
          });
        }

        const [result] = await db.update(workOrdersTable)
          .set({
            status: "cancelled",
            updatedAt: new Date(),
            updatedBy: ctx.user.id,
          })
          .where(eq(workOrdersTable.id, input.id))
          .returning({ id: workOrdersTable.id });

        return { success: true, id: result.id, message: "تم إلغاء أمر العمل بنجاح." };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error in cancel procedure:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في إلغاء أمر العمل. يرجى المحاولة مرة أخرى.",
        });
      }
    }),

  // 3.8. delete: حذف soft delete (isActive = false)
  delete: protectedProcedure
    .input(IdSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const [existingItem] = await db.select({ id: workOrdersTable.id })
          .from(workOrdersTable)
          .where(and(eq(workOrdersTable.id, input.id), eq(workOrdersTable.isActive, true)));

        if (!existingItem) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "لا يمكن حذف أمر العمل. السجل غير موجود أو محذوف مسبقاً.",
          });
        }

        const [result] = await db.update(workOrdersTable)
          .set({
            isActive: false,
            updatedAt: new Date(),
            updatedBy: ctx.user.id,
          })
          .where(eq(workOrdersTable.id, input.id))
          .returning({ id: workOrdersTable.id });

        return { success: true, id: result.id, message: "تم حذف أمر العمل بنجاح (حذف ناعم)." };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error in delete procedure:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في حذف أمر العمل. يرجى المحاولة مرة أخرى.",
        });
      }
    }),
});
