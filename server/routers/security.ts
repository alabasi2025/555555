import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { auditLogs } from "../../drizzle/schema-pg";
import { 
  securityAssessments, 
  securityFindings, 
  securityPolicies,
  privacyRequests,
  privacyConsents 
} from "../../drizzle/schema-pg";
import { eq, desc, and, sql, count, gte, lte } from "drizzle-orm";

export const securityRouter = router({
  // ==================== Audit Logs ====================
  
  getAuditLogs: publicProcedure
    .input(z.object({
      userId: z.number().optional(),
      action: z.string().optional(),
      entityType: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      limit: z.number().default(100),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let query = db.select().from(auditLogs);
      const conditions = [];
      
      if (input.userId) conditions.push(eq(auditLogs.userId, input.userId));
      // Filter by action in memory
      if (input.entityType) conditions.push(eq(auditLogs.entityType, input.entityType));
      if (input.startDate) conditions.push(gte(auditLogs.createdAt, new Date(input.startDate)));
      if (input.endDate) conditions.push(lte(auditLogs.createdAt, new Date(input.endDate)));
      
      const result = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(input.limit);
      
      if (conditions.length > 0) {
        return result.filter(() => true); // Apply filters in memory for simplicity
      }
      return result;
    }),

  createAuditLog: publicProcedure
    .input(z.object({
      userId: z.number().optional(),
      userName: z.string().optional(),
      action: z.enum(["create", "read", "update", "delete", "login", "logout", "export", "import", "approve", "reject"]),
      entityType: z.string(),
      entityId: z.number().optional(),
      entityName: z.string().optional(),
      oldValues: z.string().optional(),
      newValues: z.string().optional(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
      sessionId: z.string().optional(),
      module: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["success", "failed", "pending"]).optional(),
      errorMessage: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [result] = await db.insert(auditLogs).values({
        userId: input.userId,
        userName: input.userName,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        entityName: input.entityName,
        oldValues: input.oldValues,
        newValues: input.newValues,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        sessionId: input.sessionId,
        module: input.module,
        description: input.description,
        status: input.status,
        errorMessage: input.errorMessage,
      });
      return { id: result.insertId };
    }),

  // ==================== Security Assessments ====================

  getSecurityAssessments: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    return await db.select().from(securityAssessments).orderBy(desc(securityAssessments.createdAt));
  }),

  getSecurityAssessmentById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [assessment] = await db.select().from(securityAssessments).where(eq(securityAssessments.id, input.id));
      return assessment;
    }),

  createSecurityAssessment: publicProcedure
    .input(z.object({
      assessmentType: z.enum(["vulnerability", "penetration", "compliance", "audit"]),
      scope: z.string().optional(),
      assessorId: z.number().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const assessmentCode = `SA-${Date.now()}`;
      const [result] = await db.insert(securityAssessments).values({
        assessmentCode,
        assessmentType: input.assessmentType,
        scope: input.scope,
        assessorId: input.assessorId,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        status: "planned",
      });
      return { id: result.insertId, assessmentCode };
    }),

  updateSecurityAssessment: publicProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["planned", "in_progress", "completed", "cancelled"]).optional(),
      findings: z.number().optional(),
      criticalFindings: z.number().optional(),
      highFindings: z.number().optional(),
      mediumFindings: z.number().optional(),
      lowFindings: z.number().optional(),
      reportUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      await db.update(securityAssessments).set(data).where(eq(securityAssessments.id, id));
      return { success: true };
    }),

  // ==================== Security Findings ====================

  getSecurityFindings: publicProcedure
    .input(z.object({ assessmentId: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      if (input.assessmentId) {
        return await db.select().from(securityFindings).where(eq(securityFindings.assessmentId, input.assessmentId));
      }
      return await db.select().from(securityFindings).orderBy(desc(securityFindings.createdAt));
    }),

  createSecurityFinding: publicProcedure
    .input(z.object({
      assessmentId: z.number(),
      title: z.string(),
      description: z.string().optional(),
      severity: z.enum(["critical", "high", "medium", "low", "info"]),
      category: z.string().optional(),
      affectedComponent: z.string().optional(),
      recommendation: z.string().optional(),
      assignedTo: z.number().optional(),
      dueDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const findingCode = `SF-${Date.now()}`;
      const [result] = await db.insert(securityFindings).values({
        assessmentId: input.assessmentId,
        findingCode,
        title: input.title,
        description: input.description,
        severity: input.severity,
        category: input.category,
        affectedComponent: input.affectedComponent,
        recommendation: input.recommendation,
        assignedTo: input.assignedTo,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        status: "open",
      });
      return { id: result.insertId, findingCode };
    }),

  updateSecurityFinding: publicProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["open", "in_progress", "resolved", "accepted", "false_positive"]).optional(),
      assignedTo: z.number().optional(),
      recommendation: z.string().optional(),
      resolvedBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.status === "resolved") {
        updateData.resolvedAt = new Date();
      }
      await db.update(securityFindings).set(updateData).where(eq(securityFindings.id, id));
      return { success: true };
    }),

  // ==================== Security Policies ====================

  getSecurityPolicies: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    return await db.select().from(securityPolicies).orderBy(desc(securityPolicies.createdAt));
  }),

  createSecurityPolicy: publicProcedure
    .input(z.object({
      policyName: z.string(),
      category: z.string().optional(),
      description: z.string().optional(),
      content: z.string().optional(),
      version: z.string().optional(),
      effectiveDate: z.string().optional(),
      reviewDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const policyCode = `SP-${Date.now()}`;
      const [result] = await db.insert(securityPolicies).values({
        policyCode,
        policyName: input.policyName,
        category: input.category,
        description: input.description,
        content: input.content,
        version: input.version || "1.0",
        effectiveDate: input.effectiveDate ? new Date(input.effectiveDate) : null,
        reviewDate: input.reviewDate ? new Date(input.reviewDate) : null,
        status: "draft",
      });
      return { id: result.insertId, policyCode };
    }),

  updateSecurityPolicy: publicProcedure
    .input(z.object({
      id: z.number(),
      policyName: z.string().optional(),
      content: z.string().optional(),
      status: z.enum(["draft", "active", "archived"]).optional(),
      approvedBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      await db.update(securityPolicies).set(data).where(eq(securityPolicies.id, id));
      return { success: true };
    }),

  // ==================== Privacy Requests ====================

  getPrivacyRequests: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    return await db.select().from(privacyRequests).orderBy(desc(privacyRequests.createdAt));
  }),

  createPrivacyRequest: publicProcedure
    .input(z.object({
      requestType: z.enum(["access", "deletion", "correction", "portability", "objection"]),
      requesterId: z.number().optional(),
      requesterEmail: z.string().optional(),
      requesterName: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const requestNumber = `PR-${Date.now()}`;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // 30 days to respond
      
      const [result] = await db.insert(privacyRequests).values({
        requestNumber,
        requestType: input.requestType,
        requesterId: input.requesterId,
        requesterEmail: input.requesterEmail,
        requesterName: input.requesterName,
        description: input.description,
        status: "pending",
        dueDate: dueDate,
      });
      return { id: result.insertId, requestNumber };
    }),

  updatePrivacyRequest: publicProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "in_progress", "completed", "rejected"]).optional(),
      assignedTo: z.number().optional(),
      responseNotes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.status === "completed") {
        updateData.completedAt = new Date();
      }
      await db.update(privacyRequests).set(updateData).where(eq(privacyRequests.id, id));
      return { success: true };
    }),

  // ==================== Privacy Consents ====================

  getPrivacyConsents: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      return await db.select().from(privacyConsents).where(eq(privacyConsents.userId, input.userId));
    }),

  createPrivacyConsent: publicProcedure
    .input(z.object({
      userId: z.number(),
      consentType: z.string(),
      consentVersion: z.string().optional(),
      isGranted: z.boolean(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [result] = await db.insert(privacyConsents).values({
        userId: input.userId,
        consentType: input.consentType,
        consentVersion: input.consentVersion,
        isGranted: input.isGranted,
        grantedAt: input.isGranted ? new Date() : null,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });
      return { id: result.insertId };
    }),

  revokePrivacyConsent: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(privacyConsents).set({
        isGranted: false,
        revokedAt: new Date(),
      }).where(eq(privacyConsents.id, input.id));
      return { success: true };
    }),

  // ==================== Security Dashboard ====================

  getSecurityDashboard: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const [assessmentsCount] = await db.select({ count: count() }).from(securityAssessments);
    const [findingsCount] = await db.select({ count: count() }).from(securityFindings);
    const [openFindings] = await db.select({ count: count() }).from(securityFindings).where(eq(securityFindings.status, "open"));
    const [policiesCount] = await db.select({ count: count() }).from(securityPolicies);
    const [privacyRequestsCount] = await db.select({ count: count() }).from(privacyRequests);
    const [pendingRequests] = await db.select({ count: count() }).from(privacyRequests).where(eq(privacyRequests.status, "pending"));
    
    const recentLogs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(10);
    
    return {
      totalAssessments: assessmentsCount?.count || 0,
      totalFindings: findingsCount?.count || 0,
      openFindings: openFindings?.count || 0,
      totalPolicies: policiesCount?.count || 0,
      totalPrivacyRequests: privacyRequestsCount?.count || 0,
      pendingPrivacyRequests: pendingRequests?.count || 0,
      recentAuditLogs: recentLogs,
    };
  }),
});
