import { z } from 'zod';
import { router, publicProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { 
  supportTickets, 
  supportTicketComments,
  knowledgeBase,
  faqs
} from '../../drizzle/schema';
import { eq, desc, and, like, sql } from 'drizzle-orm';

export const supportRouter = router({
  // تذاكر الدعم
  getTickets: publicProcedure
    .input(z.object({
      status: z.string().optional(),
      priority: z.string().optional(),
      assignedTo: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      return await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
    }),

  getTicketById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.select().from(supportTickets)
        .where(eq(supportTickets.id, input.id));
      return result[0] || null;
    }),

  createTicket: publicProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      priority: z.string().optional(),
      reportedBy: z.number().optional(),
      affectedModule: z.string().optional(),
      affectedVersion: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // Generate ticket number
      const count = await db.select({ count: sql<number>`count(*)` }).from(supportTickets);
      const ticketNumber = `TKT-${String((count[0]?.count || 0) + 1).padStart(6, '0')}`;
      
      const result = await db.insert(supportTickets).values({
        ...input,
        ticketNumber,
      });
      return { id: result[0].insertId, ticketNumber };
    }),

  updateTicket: publicProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      priority: z.string().optional(),
      status: z.string().optional(),
      assignedTo: z.number().optional(),
      resolution: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { id, ...data } = input;
      
      const updateData: any = { ...data };
      if (data.status === 'resolved') {
        updateData.resolvedAt = new Date();
      } else if (data.status === 'closed') {
        updateData.closedAt = new Date();
      }
      
      await db.update(supportTickets).set(updateData).where(eq(supportTickets.id, id));
      return { success: true };
    }),

  assignTicket: publicProcedure
    .input(z.object({
      id: z.number(),
      assignedTo: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.update(supportTickets).set({
        assignedTo: input.assignedTo,
        status: 'in_progress',
      }).where(eq(supportTickets.id, input.id));
      return { success: true };
    }),

  resolveTicket: publicProcedure
    .input(z.object({
      id: z.number(),
      resolution: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.update(supportTickets).set({
        status: 'resolved',
        resolution: input.resolution,
        resolvedAt: new Date(),
      }).where(eq(supportTickets.id, input.id));
      return { success: true };
    }),

  // تعليقات التذاكر
  getTicketComments: publicProcedure
    .input(z.object({ ticketId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      return await db.select().from(supportTicketComments)
        .where(eq(supportTicketComments.ticketId, input.ticketId))
        .orderBy(supportTicketComments.createdAt);
    }),

  addTicketComment: publicProcedure
    .input(z.object({
      ticketId: z.number(),
      userId: z.number(),
      comment: z.string(),
      isInternal: z.boolean().optional(),
      attachments: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(supportTicketComments).values(input);
      return { id: result[0].insertId };
    }),

  // قاعدة المعرفة
  getKnowledgeArticles: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      status: z.string().optional(),
      search: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      return await db.select().from(knowledgeBase).orderBy(desc(knowledgeBase.viewCount));
    }),

  getKnowledgeArticleBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.select().from(knowledgeBase)
        .where(eq(knowledgeBase.slug, input.slug));
      
      if (result[0]) {
        // Increment view count
        await db.update(knowledgeBase).set({
          viewCount: (result[0].viewCount || 0) + 1,
        }).where(eq(knowledgeBase.id, result[0].id));
      }
      
      return result[0] || null;
    }),

  createKnowledgeArticle: publicProcedure
    .input(z.object({
      title: z.string(),
      slug: z.string(),
      content: z.string().optional(),
      category: z.string().optional(),
      tags: z.any().optional(),
      status: z.string().optional(),
      authorId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(knowledgeBase).values(input);
      return { id: result[0].insertId };
    }),

  updateKnowledgeArticle: publicProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      content: z.string().optional(),
      category: z.string().optional(),
      tags: z.any().optional(),
      status: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { id, ...data } = input;
      
      const updateData: any = { ...data };
      if (data.status === 'published') {
        updateData.publishedAt = new Date();
      }
      
      await db.update(knowledgeBase).set(updateData).where(eq(knowledgeBase.id, id));
      return { success: true };
    }),

  rateKnowledgeArticle: publicProcedure
    .input(z.object({
      id: z.number(),
      helpful: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const article = await db.select().from(knowledgeBase).where(eq(knowledgeBase.id, input.id));
      if (article[0]) {
        if (input.helpful) {
          await db.update(knowledgeBase).set({
            helpfulCount: (article[0].helpfulCount || 0) + 1,
          }).where(eq(knowledgeBase.id, input.id));
        } else {
          await db.update(knowledgeBase).set({
            notHelpfulCount: (article[0].notHelpfulCount || 0) + 1,
          }).where(eq(knowledgeBase.id, input.id));
        }
      }
      return { success: true };
    }),

  // الأسئلة الشائعة
  getFaqs: publicProcedure
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      return await db.select().from(faqs)
        .where(eq(faqs.isActive, true))
        .orderBy(faqs.order);
    }),

  createFaq: publicProcedure
    .input(z.object({
      question: z.string(),
      answer: z.string(),
      category: z.string().optional(),
      order: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.insert(faqs).values(input);
      return { id: result[0].insertId };
    }),

  updateFaq: publicProcedure
    .input(z.object({
      id: z.number(),
      question: z.string().optional(),
      answer: z.string().optional(),
      category: z.string().optional(),
      order: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { id, ...data } = input;
      await db.update(faqs).set(data).where(eq(faqs.id, id));
      return { success: true };
    }),

  deleteFaq: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      await db.delete(faqs).where(eq(faqs.id, input.id));
      return { success: true };
    }),

  // إحصائيات الدعم
  getSupportStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const totalTickets = await db.select({ count: sql<number>`count(*)` }).from(supportTickets);
    const openTickets = await db.select({ count: sql<number>`count(*)` }).from(supportTickets)
      .where(eq(supportTickets.status, 'open'));
    const resolvedTickets = await db.select({ count: sql<number>`count(*)` }).from(supportTickets)
      .where(eq(supportTickets.status, 'resolved'));
    const criticalTickets = await db.select({ count: sql<number>`count(*)` }).from(supportTickets)
      .where(and(eq(supportTickets.priority, 'critical'), eq(supportTickets.status, 'open')));
    
    const totalArticles = await db.select({ count: sql<number>`count(*)` }).from(knowledgeBase)
      .where(eq(knowledgeBase.status, 'published'));
    const totalFaqs = await db.select({ count: sql<number>`count(*)` }).from(faqs)
      .where(eq(faqs.isActive, true));
    
    return {
      totalTickets: totalTickets[0]?.count || 0,
      openTickets: openTickets[0]?.count || 0,
      resolvedTickets: resolvedTickets[0]?.count || 0,
      criticalTickets: criticalTickets[0]?.count || 0,
      totalArticles: totalArticles[0]?.count || 0,
      totalFaqs: totalFaqs[0]?.count || 0,
    };
  }),
});
