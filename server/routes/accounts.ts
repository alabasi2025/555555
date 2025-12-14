import { Router } from "express";
import { getDb } from "../db";
import { chartOfAccounts, accountBalances } from "../../drizzle/schema";
import { eq, like, or, desc } from "drizzle-orm";

const router = Router();

// GET /api/accounts - Get all accounts
router.get("/", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({
        success: false,
        message: "Database not available",
      });
    }

    const accounts = await db.select().from(chartOfAccounts);
    
    res.json({
      success: true,
      data: accounts,
      count: accounts.length,
    });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch accounts",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/accounts/tree - Get accounts in tree structure
router.get("/tree", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({
        success: false,
        message: "Database not available",
      });
    }
    
    const accounts = await db.select().from(chartOfAccounts).orderBy(chartOfAccounts.accountCode);
    
    // Build tree structure
    const accountMap = new Map();
    const tree: any[] = [];
    
    // First pass: create map
    accounts.forEach((account: any) => {
      accountMap.set(account.id, { ...account, children: [] });
    });
    
    // Second pass: build tree
    accounts.forEach((account: any) => {
      const node = accountMap.get(account.id);
      if (account.parentAccountId) {
        const parent = accountMap.get(account.parentAccountId);
        if (parent) {
          parent.children.push(node);
        } else {
          tree.push(node);
        }
      } else {
        tree.push(node);
      }
    });
    
    res.json({
      success: true,
      data: tree,
    });
  } catch (error) {
    console.error("Error fetching account tree:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch account tree",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/accounts/:id - Get account by ID
router.get("/:id", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({
        success: false,
        message: "Database not available",
      });
    }

    const { id } = req.params;
    
    const account = await db.select()
      .from(chartOfAccounts)
      .where(eq(chartOfAccounts.id, parseInt(id)))
      .limit(1);
    
    if (account.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }
    
    // Get account balances
    const balances = await db.select()
      .from(accountBalances)
      .where(eq(accountBalances.accountId, parseInt(id)))
      .orderBy(desc(accountBalances.balanceDate));
    
    res.json({
      success: true,
      data: {
        ...account[0],
        balances,
      },
    });
  } catch (error) {
    console.error("Error fetching account:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch account",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// POST /api/accounts - Create new account
router.post("/", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({
        success: false,
        message: "Database not available",
      });
    }

    const {
      accountCode,
      accountName,
      accountNameEn,
      accountType,
      parentAccountId,
      isHeader,
      level,
      description,
      createdBy,
    } = req.body;
    
    // Validate required fields
    if (!accountCode || !accountName || !accountType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: accountCode, accountName, accountType",
      });
    }
    
    // Check if account code already exists
    const existing = await db.select()
      .from(chartOfAccounts)
      .where(eq(chartOfAccounts.accountCode, accountCode))
      .limit(1);
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Account code already exists",
      });
    }
    
    const result = await db.insert(chartOfAccounts).values({
      accountCode,
      accountName,
      accountNameEn,
      accountType,
      parentAccountId: parentAccountId || null,
      isHeader: isHeader || false,
      level: level || 1,
      description,
      createdBy,
      isActive: true,
    });
    
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: { id: result[0].insertId },
    });
  } catch (error) {
    console.error("Error creating account:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create account",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// PUT /api/accounts/:id - Update account
router.put("/:id", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({
        success: false,
        message: "Database not available",
      });
    }

    const { id } = req.params;
    const {
      accountCode,
      accountName,
      accountNameEn,
      accountType,
      parentAccountId,
      isHeader,
      level,
      description,
      isActive,
      updatedBy,
    } = req.body;
    
    // Check if account exists
    const existing = await db.select()
      .from(chartOfAccounts)
      .where(eq(chartOfAccounts.id, parseInt(id)))
      .limit(1);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }
    
    // If account code is being changed, check if new code already exists
    if (accountCode && accountCode !== existing[0].accountCode) {
      const codeExists = await db.select()
        .from(chartOfAccounts)
        .where(eq(chartOfAccounts.accountCode, accountCode))
        .limit(1);
      
      if (codeExists.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Account code already exists",
        });
      }
    }
    
    await db.update(chartOfAccounts)
      .set({
        accountCode,
        accountName,
        accountNameEn,
        accountType,
        parentAccountId: parentAccountId || null,
        isHeader,
        level,
        description,
        isActive,
        updatedBy,
      })
      .where(eq(chartOfAccounts.id, parseInt(id)));
    
    res.json({
      success: true,
      message: "Account updated successfully",
    });
  } catch (error) {
    console.error("Error updating account:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update account",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// DELETE /api/accounts/:id - Delete account
router.delete("/:id", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({
        success: false,
        message: "Database not available",
      });
    }

    const { id } = req.params;
    
    // Check if account exists
    const existing = await db.select()
      .from(chartOfAccounts)
      .where(eq(chartOfAccounts.id, parseInt(id)))
      .limit(1);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }
    
    // Check if account has children
    const children = await db.select()
      .from(chartOfAccounts)
      .where(eq(chartOfAccounts.parentAccountId, parseInt(id)))
      .limit(1);
    
    if (children.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete account with child accounts",
      });
    }
    
    await db.delete(chartOfAccounts)
      .where(eq(chartOfAccounts.id, parseInt(id)));
    
    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete account",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
