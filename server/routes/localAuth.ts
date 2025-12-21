/**
 * مسارات المصادقة المحلية - Local Authentication Routes
 * API endpoints لتسجيل الدخول والخروج وإدارة الحساب
 */

import { Router, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import localAuth from "../_core/localAuth";

const router = Router();

// ==================== تسجيل الدخول ====================
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password, rememberMe } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "اسم المستخدم وكلمة المرور مطلوبان",
      });
    }
    
    // محاولة تسجيل الدخول
    const result = await localAuth.login(username, password);
    
    if (!result.success || !result.user) {
      return res.status(401).json({
        success: false,
        error: result.error,
      });
    }
    
    // إنشاء session token للتوافق مع tRPC context
    const sessionToken = await localAuth.createSessionToken(result.user);
    
    // تعيين الكوكي
    const cookieOptions = getSessionCookieOptions(req);
    const maxAge = rememberMe ? ONE_YEAR_MS : 24 * 60 * 60 * 1000; // يوم واحد أو سنة
    
    res.cookie(COOKIE_NAME, sessionToken, {
      ...cookieOptions,
      maxAge,
    });
    
    return res.json({
      success: true,
      user: result.user,
      message: "تم تسجيل الدخول بنجاح",
    });
  } catch (error) {
    console.error("[LocalAuth Route] Login error:", error);
    return res.status(500).json({
      success: false,
      error: "حدث خطأ في الخادم",
    });
  }
});

// ==================== تسجيل الخروج ====================
router.post("/logout", async (req: Request, res: Response) => {
  try {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    
    return res.json({
      success: true,
      message: "تم تسجيل الخروج بنجاح",
    });
  } catch (error) {
    console.error("[LocalAuth Route] Logout error:", error);
    return res.status(500).json({
      success: false,
      error: "حدث خطأ في الخادم",
    });
  }
});

// ==================== التسجيل (إنشاء حساب جديد) ====================
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { username, email, password, name } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "اسم المستخدم وكلمة المرور مطلوبان",
      });
    }
    
    // التحقق من طول كلمة المرور
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
      });
    }
    
    // إنشاء المستخدم
    const result = await localAuth.createUser({
      username,
      email,
      password,
      name,
      role: "user",
    });
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }
    
    return res.status(201).json({
      success: true,
      userId: result.userId,
      message: "تم إنشاء الحساب بنجاح",
    });
  } catch (error) {
    console.error("[LocalAuth Route] Register error:", error);
    return res.status(500).json({
      success: false,
      error: "حدث خطأ في الخادم",
    });
  }
});

// ==================== الحصول على المستخدم الحالي ====================
router.get("/me", async (req: Request, res: Response) => {
  try {
    const user = await localAuth.authenticateRequest(req);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "غير مصرح",
      });
    }
    
    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("[LocalAuth Route] Get me error:", error);
    return res.status(500).json({
      success: false,
      error: "حدث خطأ في الخادم",
    });
  }
});

// ==================== تغيير كلمة المرور ====================
router.post("/change-password", async (req: Request, res: Response) => {
  try {
    const user = await localAuth.authenticateRequest(req);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "غير مصرح",
      });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "كلمة المرور الحالية والجديدة مطلوبتان",
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل",
      });
    }
    
    // التحقق من كلمة المرور الحالية
    const dbUser = await localAuth.findUserById(user.id);
    if (!dbUser) {
      return res.status(404).json({
        success: false,
        error: "المستخدم غير موجود",
      });
    }
    
    const isValid = await localAuth.verifyPassword(currentPassword, dbUser.password_hash);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: "كلمة المرور الحالية غير صحيحة",
      });
    }
    
    // تحديث كلمة المرور
    const updated = await localAuth.updatePassword(user.id, newPassword);
    
    if (!updated) {
      return res.status(500).json({
        success: false,
        error: "فشل في تحديث كلمة المرور",
      });
    }
    
    return res.json({
      success: true,
      message: "تم تغيير كلمة المرور بنجاح",
    });
  } catch (error) {
    console.error("[LocalAuth Route] Change password error:", error);
    return res.status(500).json({
      success: false,
      error: "حدث خطأ في الخادم",
    });
  }
});

// ==================== تجديد التوكن ====================
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: "Refresh token مطلوب",
      });
    }
    
    const result = await localAuth.refreshAccessToken(refreshToken);
    
    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: result.error,
      });
    }
    
    // تحديث الكوكي
    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, result.accessToken!, {
      ...cookieOptions,
      maxAge: ONE_YEAR_MS,
    });
    
    return res.json({
      success: true,
      user: result.user,
    });
  } catch (error) {
    console.error("[LocalAuth Route] Refresh error:", error);
    return res.status(500).json({
      success: false,
      error: "حدث خطأ في الخادم",
    });
  }
});

export default router;
