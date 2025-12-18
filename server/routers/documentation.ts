import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { systemDocuments, apiDocumentation } from "../../drizzle/schema";
import { eq, desc, and, count } from "drizzle-orm";

export const documentationRouter = router({
  // ==================== System Documents ====================
  
  getDocuments: publicProcedure
    .input(z.object({
      category: z.enum(["user_guide", "admin_guide", "api_docs", "technical", "training", "policy"]).optional(),
      status: z.enum(["draft", "published", "archived"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let result = await db.select().from(systemDocuments).orderBy(desc(systemDocuments.createdAt));
      
      if (input.category) {
        result = result.filter(doc => doc.category === input.category);
      }
      if (input.status) {
        result = result.filter(doc => doc.status === input.status);
      }
      
      return result;
    }),

  getDocumentById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [document] = await db.select().from(systemDocuments).where(eq(systemDocuments.id, input.id));
      return document;
    }),

  createDocument: publicProcedure
    .input(z.object({
      title: z.string(),
      category: z.enum(["user_guide", "admin_guide", "api_docs", "technical", "training", "policy"]),
      content: z.string().optional(),
      version: z.string().optional(),
      language: z.string().optional(),
      fileUrl: z.string().optional(),
      authorId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const documentCode = `DOC-${Date.now()}`;
      const [result] = await db.insert(systemDocuments).values({
        documentCode,
        title: input.title,
        category: input.category,
        content: input.content,
        version: input.version || "1.0",
        language: input.language || "ar",
        fileUrl: input.fileUrl,
        authorId: input.authorId,
        status: "draft",
      });
      return { id: result.insertId, documentCode };
    }),

  updateDocument: publicProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      content: z.string().optional(),
      version: z.string().optional(),
      status: z.enum(["draft", "published", "archived"]).optional(),
      reviewerId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.status === "published") {
        updateData.publishedAt = new Date();
      }
      await db.update(systemDocuments).set(updateData).where(eq(systemDocuments.id, id));
      return { success: true };
    }),

  deleteDocument: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.delete(systemDocuments).where(eq(systemDocuments.id, input.id));
      return { success: true };
    }),

  // ==================== API Documentation ====================

  getApiDocs: publicProcedure
    .input(z.object({
      method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).optional(),
      version: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let result = await db.select().from(apiDocumentation).orderBy(apiDocumentation.endpoint);
      
      if (input.method) {
        result = result.filter(doc => doc.method === input.method);
      }
      if (input.version) {
        result = result.filter(doc => doc.version === input.version);
      }
      
      return result;
    }),

  getApiDocById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [doc] = await db.select().from(apiDocumentation).where(eq(apiDocumentation.id, input.id));
      return doc;
    }),

  createApiDoc: publicProcedure
    .input(z.object({
      endpoint: z.string(),
      method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
      description: z.string().optional(),
      requestSchema: z.any().optional(),
      responseSchema: z.any().optional(),
      exampleRequest: z.any().optional(),
      exampleResponse: z.any().optional(),
      authentication: z.string().optional(),
      rateLimit: z.string().optional(),
      version: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [result] = await db.insert(apiDocumentation).values({
        endpoint: input.endpoint,
        method: input.method,
        description: input.description,
        requestSchema: input.requestSchema,
        responseSchema: input.responseSchema,
        exampleRequest: input.exampleRequest,
        exampleResponse: input.exampleResponse,
        authentication: input.authentication,
        rateLimit: input.rateLimit,
        version: input.version || "v1",
      });
      return { id: result.insertId };
    }),

  updateApiDoc: publicProcedure
    .input(z.object({
      id: z.number(),
      description: z.string().optional(),
      requestSchema: z.any().optional(),
      responseSchema: z.any().optional(),
      exampleRequest: z.any().optional(),
      exampleResponse: z.any().optional(),
      isDeprecated: z.boolean().optional(),
      deprecationDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, deprecationDate, ...data } = input;
      const updateData: any = { ...data };
      if (deprecationDate) {
        updateData.deprecationDate = new Date(deprecationDate);
      }
      await db.update(apiDocumentation).set(updateData).where(eq(apiDocumentation.id, id));
      return { success: true };
    }),

  deleteApiDoc: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.delete(apiDocumentation).where(eq(apiDocumentation.id, input.id));
      return { success: true };
    }),

  // ==================== Documentation Dashboard ====================

  getDocumentationDashboard: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const [docsCount] = await db.select({ count: count() }).from(systemDocuments);
    const [publishedDocs] = await db.select({ count: count() }).from(systemDocuments).where(eq(systemDocuments.status, "published"));
    const [apiDocsCount] = await db.select({ count: count() }).from(apiDocumentation);
    
    const recentDocs = await db.select().from(systemDocuments).orderBy(desc(systemDocuments.updatedAt)).limit(5);
    
    // Count by category
    const allDocs = await db.select().from(systemDocuments);
    const byCategory = {
      user_guide: allDocs.filter(d => d.category === "user_guide").length,
      admin_guide: allDocs.filter(d => d.category === "admin_guide").length,
      api_docs: allDocs.filter(d => d.category === "api_docs").length,
      technical: allDocs.filter(d => d.category === "technical").length,
      training: allDocs.filter(d => d.category === "training").length,
      policy: allDocs.filter(d => d.category === "policy").length,
    };
    
    return {
      totalDocuments: docsCount?.count || 0,
      publishedDocuments: publishedDocs?.count || 0,
      totalApiDocs: apiDocsCount?.count || 0,
      recentDocuments: recentDocs,
      documentsByCategory: byCategory,
    };
  }),
});
