import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { db } from "../db";
import { eq, like, and, sql } from "drizzle-orm";
import { pgTable, serial, text, timestamp, boolean, varchar } from "drizzle-orm/pg-core";

// =================================================================
// 1. Drizzle Schema Definition (Conceptual for this file)
//    In a real project, this would be imported from a separate schema file.
// =================================================================

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  serialNumber: varchar("serial_number", { length: 256 }).unique().notNull(),
  assetStatus: varchar("asset_status", { length: 50, enum: ['active', 'retired', 'maintenance'] }).default('active').notNull(),
  
  // Security and Audit fields
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: text("created_by").notNull(),
  updatedBy: text("updated_by").notNull(),
});

// =================================================================
// 2. Validation Schemas (Zod)
// =================================================================

const AssetStatusEnum = z.enum(['active', 'retired', 'maintenance'], {
  errorMap: () => ({ message: "حالة الأصل غير صالحة" })
});

const getByIdSchema = z.object({
  id: z.number({ invalid_type_error: "يجب أن يكون المعرف رقمًا صحيحًا" }).int().positive("المعرف يجب أن يكون رقمًا موجبًا"),
});

const createAssetSchema = z.object({
  name: z.string().min(3, "اسم الأصل يجب أن لا يقل عن 3 أحرف").max(255, "اسم الأصل طويل جداً"),
  serialNumber: z.string().min(1, "الرقم التسلسلي مطلوب").max(255, "الرقم التسلسلي طويل جداً"),
  assetStatus: AssetStatusEnum.default('active'),
});

const updateAssetSchema = z.object({
  id: getByIdSchema.shape.id,
  name: z.string().min(3, "اسم الأصل يجب أن لا يقل عن 3 أحرف").max(255, "اسم الأصل طويل جداً").optional(),
  serialNumber: z.string().min(1, "الرقم التسلسلي مطلوب").max(255, "الرقم التسلسلي طويل جداً").optional(),
  assetStatus: AssetStatusEnum.optional(),
});

const listAssetsSchema = z.object({
  page: z.number().int().positive("رقم الصفحة يجب أن يكون موجبًا").default(1),
  limit: z.number().int().positive("الحد يجب أن يكون موجبًا").default(10),
  search: z.string().optional(),
  statusFilter: AssetStatusEnum.optional(),
  includeInactive: z.boolean().default(false),
});

// =================================================================
// 3. tRPC Router Implementation
// =================================================================

export const assetsRouter = router({
  
  // 1. list: جلب قائمة مع pagination وsearch وfilters
  list: protectedProcedure
    .input(listAssetsSchema)
    .query(async ({ input }) => {
      try {
        const { page, limit, search, statusFilter, includeInactive } = input;
        const offset = (page - 1) * limit;
        
        const conditions: any[] = [];
        
        if (!includeInactive) {
          conditions.push(eq(assets.isActive, true));
        }

        if (search) {
          conditions.push(like(assets.name, `%${search}%`));
        }
        
        if (statusFilter) {
          conditions.push(eq(assets.assetStatus, statusFilter));
        }
        
        const items = await db.select()
          .from(assets)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset);
          
        // For a real-world scenario, we would use a separate count query for the total
        const totalResult = await db.select({ count: sql<number>`count(*)` })
          .from(assets)
          .where(and(...conditions));
          
        const total = totalResult[0]?.count || 0;

        return { items, total, page, limit };
      } catch (error) {
        console.error("Error in list procedure:", error);
        throw new Error("فشل في جلب قائمة الأصول");
      }
    }),
    
  // 2. getById: جلب عنصر واحد بالـ ID
  getById: protectedProcedure
    .input(getByIdSchema)
    .query(async ({ input }) => {
      try {
        const item = await db.select()
          .from(assets)
          .where(eq(assets.id, input.id))
          .limit(1);
          
        if (item.length === 0) {
          throw new Error("لم يتم العثور على الأصل بالمعرف المحدد");
        }
        
        return item[0];
      } catch (error) {
        console.error("Error in getById procedure:", error);
        throw new Error(error instanceof Error ? error.message : "فشل في جلب الأصل");
      }
    }),
    
  // 3. create: إنشاء عنصر جديد مع validation كامل
  create: protectedProcedure
    .input(createAssetSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await db.insert(assets).values({
          ...input,
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        }).returning({ id: assets.id });
        
        return { success: true, id: result[0].id };
      } catch (error) {
        console.error("Error in create procedure:", error);
        // Check for unique constraint violation (e.g., serialNumber)
        if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
          throw new Error("الرقم التسلسلي موجود بالفعل. يرجى استخدام رقم تسلسلي فريد.");
        }
        throw new Error("فشل في إنشاء الأصل الجديد");
      }
    }),
    
  // 4. update: تحديث عنصر موجود
  update: protectedProcedure
    .input(updateAssetSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...dataToUpdate } = input;
        
        // 1. Check if the asset exists
        const existingAsset = await db.select({ id: assets.id }).from(assets).where(eq(assets.id, id)).limit(1);
        if (existingAsset.length === 0) {
          throw new Error("فشل التحديث: لم يتم العثور على الأصل بالمعرف المحدد");
        }

        // 2. Perform the update
        const result = await db.update(assets)
          .set({
            ...dataToUpdate,
            updatedAt: new Date(),
            updatedBy: ctx.user.id,
          })
          .where(eq(assets.id, id))
          .returning({ id: assets.id });
          
        return { success: result.length > 0, id };
      } catch (error) {
        console.error("Error in update procedure:", error);
        throw new Error(error instanceof Error ? error.message : "فشل في تحديث الأصل");
      }
    }),
    
  // 5. delete: حذف soft delete (isActive = false)
  delete: protectedProcedure
    .input(getByIdSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // 1. Check if the asset exists and is active
        const existingAsset = await db.select({ id: assets.id, isActive: assets.isActive })
          .from(assets)
          .where(eq(assets.id, input.id))
          .limit(1);
          
        if (existingAsset.length === 0) {
          throw new Error("فشل الحذف: لم يتم العثور على الأصل بالمعرف المحدد");
        }
        
        if (!existingAsset[0].isActive) {
          return { success: true, id: input.id, message: "الأصل محذوف بالفعل (Soft Deleted)" };
        }

        // 2. Perform soft delete
        const result = await db.update(assets)
          .set({
            isActive: false,
            updatedAt: new Date(),
            updatedBy: ctx.user.id,
          })
          .where(eq(assets.id, input.id))
          .returning({ id: assets.id });
          
        return { success: result.length > 0, id: input.id, message: "تم حذف الأصل بنجاح (Soft Delete)" };
      } catch (error) {
        console.error("Error in delete procedure:", error);
        throw new Error(error instanceof Error ? error.message : "فشل في حذف الأصل");
      }
    }),
    
  // 6. retire: تغيير حالة الأصل إلى 'retired'
  retire: protectedProcedure
    .input(getByIdSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // 1. Check if the asset exists
        const existingAsset = await db.select({ id: assets.id, assetStatus: assets.assetStatus })
          .from(assets)
          .where(eq(assets.id, input.id))
          .limit(1);
          
        if (existingAsset.length === 0) {
          throw new Error("فشل الإحالة للتقاعد: لم يتم العثور على الأصل بالمعرف المحدد");
        }
        
        if (existingAsset[0].assetStatus === 'retired') {
          return { success: true, id: input.id, message: "الأصل محال للتقاعد بالفعل" };
        }

        // 2. Perform status update
        const result = await db.update(assets)
          .set({
            assetStatus: 'retired',
            updatedAt: new Date(),
            updatedBy: ctx.user.id,
          })
          .where(eq(assets.id, input.id))
          .returning({ id: assets.id });
          
        return { success: result.length > 0, id: input.id, message: "تم إحالة الأصل للتقاعد بنجاح" };
      } catch (error) {
        console.error("Error in retire procedure:", error);
        throw new Error(error instanceof Error ? error.message : "فشل في إحالة الأصل للتقاعد");
      }
    }),
});
