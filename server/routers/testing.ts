import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { testSuites, testCases, testRuns, testResults, testCoverage } from "../../drizzle/schema";
import { eq, desc, and, sql, count, avg, sum } from "drizzle-orm";

export const testingRouter = router({
  // ==================== Test Suites ====================
  
  getTestSuites: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const suites = await db.select().from(testSuites).orderBy(desc(testSuites.createdAt));
    return suites;
  }),

  getTestSuiteById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [suite] = await db.select().from(testSuites).where(eq(testSuites.id, input.id));
      return suite;
    }),

  createTestSuite: publicProcedure
    .input(z.object({
      suiteName: z.string(),
      suiteType: z.enum(["unit", "integration", "e2e", "performance", "security"]),
      description: z.string().optional(),
      module: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [result] = await db.insert(testSuites).values({
        suiteName: input.suiteName,
        suiteType: input.suiteType,
        description: input.description,
        module: input.module,
      });
      return { id: result.insertId };
    }),

  updateTestSuite: publicProcedure
    .input(z.object({
      id: z.number(),
      suiteName: z.string().optional(),
      suiteType: z.enum(["unit", "integration", "e2e", "performance", "security"]).optional(),
      description: z.string().optional(),
      module: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      await db.update(testSuites).set(data).where(eq(testSuites.id, id));
      return { success: true };
    }),

  deleteTestSuite: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.delete(testSuites).where(eq(testSuites.id, input.id));
      return { success: true };
    }),

  // ==================== Test Cases ====================

  getTestCases: publicProcedure
    .input(z.object({ suiteId: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      if (input.suiteId) {
        return await db.select().from(testCases).where(eq(testCases.suiteId, input.suiteId));
      }
      return await db.select().from(testCases).orderBy(desc(testCases.createdAt));
    }),

  createTestCase: publicProcedure
    .input(z.object({
      suiteId: z.number(),
      testName: z.string(),
      testCode: z.string(),
      description: z.string().optional(),
      expectedResult: z.string().optional(),
      priority: z.enum(["critical", "high", "medium", "low"]).optional(),
      isAutomated: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [result] = await db.insert(testCases).values({
        suiteId: input.suiteId,
        testName: input.testName,
        testCode: input.testCode,
        description: input.description,
        expectedResult: input.expectedResult,
        priority: input.priority,
        isAutomated: input.isAutomated,
      });
      return { id: result.insertId };
    }),

  updateTestCase: publicProcedure
    .input(z.object({
      id: z.number(),
      testName: z.string().optional(),
      description: z.string().optional(),
      expectedResult: z.string().optional(),
      priority: z.enum(["critical", "high", "medium", "low"]).optional(),
      isAutomated: z.boolean().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      await db.update(testCases).set(data).where(eq(testCases.id, id));
      return { success: true };
    }),

  deleteTestCase: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.delete(testCases).where(eq(testCases.id, input.id));
      return { success: true };
    }),

  // ==================== Test Runs ====================

  getTestRuns: publicProcedure
    .input(z.object({ suiteId: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      if (input.suiteId) {
        return await db.select().from(testRuns).where(eq(testRuns.suiteId, input.suiteId)).orderBy(desc(testRuns.createdAt));
      }
      return await db.select().from(testRuns).orderBy(desc(testRuns.createdAt));
    }),

  createTestRun: publicProcedure
    .input(z.object({
      suiteId: z.number().optional(),
      runType: z.enum(["manual", "automated", "scheduled"]).optional(),
      environment: z.enum(["development", "staging", "production"]).optional(),
      triggeredBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const runNumber = `RUN-${Date.now()}`;
      const [result] = await db.insert(testRuns).values({
        runNumber,
        suiteId: input.suiteId,
        runType: input.runType,
        environment: input.environment,
        status: "pending",
        triggeredBy: input.triggeredBy,
        startedAt: new Date(),
      });
      return { id: result.insertId, runNumber };
    }),

  updateTestRun: publicProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "running", "completed", "failed", "cancelled"]).optional(),
      totalTests: z.number().optional(),
      passedTests: z.number().optional(),
      failedTests: z.number().optional(),
      skippedTests: z.number().optional(),
      duration: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.status === "completed" || data.status === "failed") {
        updateData.completedAt = new Date();
      }
      await db.update(testRuns).set(updateData).where(eq(testRuns.id, id));
      return { success: true };
    }),

  // ==================== Test Results ====================

  getTestResults: publicProcedure
    .input(z.object({ runId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      return await db.select().from(testResults).where(eq(testResults.runId, input.runId));
    }),

  createTestResult: publicProcedure
    .input(z.object({
      runId: z.number(),
      testCaseId: z.number(),
      status: z.enum(["passed", "failed", "skipped", "error"]),
      actualResult: z.string().optional(),
      errorMessage: z.string().optional(),
      stackTrace: z.string().optional(),
      duration: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [result] = await db.insert(testResults).values({
        runId: input.runId,
        testCaseId: input.testCaseId,
        status: input.status,
        actualResult: input.actualResult,
        errorMessage: input.errorMessage,
        stackTrace: input.stackTrace,
        duration: input.duration,
      });
      return { id: result.insertId };
    }),

  // ==================== Test Coverage ====================

  getTestCoverage: publicProcedure
    .input(z.object({ runId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      return await db.select().from(testCoverage).where(eq(testCoverage.runId, input.runId));
    }),

  createTestCoverage: publicProcedure
    .input(z.object({
      runId: z.number(),
      module: z.string(),
      totalLines: z.number(),
      coveredLines: z.number(),
      totalFunctions: z.number().optional(),
      coveredFunctions: z.number().optional(),
      totalBranches: z.number().optional(),
      coveredBranches: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const coveragePercent = (input.coveredLines / input.totalLines) * 100;
      const [result] = await db.insert(testCoverage).values({
        runId: input.runId,
        module: input.module,
        totalLines: input.totalLines,
        coveredLines: input.coveredLines,
        coveragePercent: coveragePercent.toFixed(2),
        totalFunctions: input.totalFunctions,
        coveredFunctions: input.coveredFunctions,
        totalBranches: input.totalBranches,
        coveredBranches: input.coveredBranches,
      });
      return { id: result.insertId };
    }),

  // ==================== Dashboard Stats ====================

  getTestingDashboard: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const [suitesCount] = await db.select({ count: count() }).from(testSuites);
    const [casesCount] = await db.select({ count: count() }).from(testCases);
    const [runsCount] = await db.select({ count: count() }).from(testRuns);
    
    const recentRuns = await db.select().from(testRuns).orderBy(desc(testRuns.createdAt)).limit(5);
    
    // حساب معدل النجاح
    const [passRate] = await db.select({
      totalPassed: sum(testRuns.passedTests),
      totalTests: sum(testRuns.totalTests),
    }).from(testRuns).where(eq(testRuns.status, "completed"));
    
    return {
      totalSuites: suitesCount?.count || 0,
      totalCases: casesCount?.count || 0,
      totalRuns: runsCount?.count || 0,
      recentRuns,
      passRate: passRate?.totalTests ? 
        ((Number(passRate.totalPassed) / Number(passRate.totalTests)) * 100).toFixed(2) : 0,
    };
  }),
});
