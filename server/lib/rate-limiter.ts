/**
 * نظام تحديد معدل الطلبات (Rate Limiting)
 * يحمي النظام من الهجمات والاستخدام المفرط
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitOptions {
  windowMs?: number; // نافذة الوقت بالمللي ثانية
  maxRequests?: number; // الحد الأقصى للطلبات
  message?: string; // رسالة الخطأ
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private defaultWindowMs: number = 60 * 1000; // دقيقة واحدة
  private defaultMaxRequests: number = 100; // 100 طلب في الدقيقة

  constructor() {
    // تنظيف دوري للسجلات القديمة
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  /**
   * التحقق من معدل الطلبات
   */
  check(
    key: string,
    options?: RateLimitOptions
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const windowMs = options?.windowMs || this.defaultWindowMs;
    const maxRequests = options?.maxRequests || this.defaultMaxRequests;
    const now = Date.now();

    let entry = this.limits.get(key);

    // إنشاء سجل جديد أو إعادة تعيين إذا انتهت النافذة
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    entry.count++;
    this.limits.set(key, entry);

    const allowed = entry.count <= maxRequests;
    const remaining = Math.max(0, maxRequests - entry.count);

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime
    };
  }

  /**
   * إعادة تعيين حد معين
   */
  reset(key: string): void {
    this.limits.delete(key);
  }

  /**
   * الحصول على حالة حد معين
   */
  getStatus(key: string): RateLimitEntry | null {
    return this.limits.get(key) || null;
  }

  /**
   * تنظيف السجلات القديمة
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of Array.from(this.limits.entries())) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

// إنشاء نسخة واحدة
export const rateLimiter = new RateLimiter();

// حدود مختلفة لأنواع مختلفة من الطلبات
export const RateLimits = {
  // طلبات API العامة
  api: {
    windowMs: 60 * 1000, // دقيقة
    maxRequests: 100
  },
  // تسجيل الدخول
  login: {
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    maxRequests: 5
  },
  // إنشاء الحسابات
  register: {
    windowMs: 60 * 60 * 1000, // ساعة
    maxRequests: 3
  },
  // إعادة تعيين كلمة المرور
  passwordReset: {
    windowMs: 60 * 60 * 1000, // ساعة
    maxRequests: 3
  },
  // تصدير البيانات
  export: {
    windowMs: 60 * 60 * 1000, // ساعة
    maxRequests: 10
  },
  // التقارير الثقيلة
  reports: {
    windowMs: 5 * 60 * 1000, // 5 دقائق
    maxRequests: 20
  }
};

/**
 * دالة مساعدة للتحقق من معدل الطلبات
 */
export function checkRateLimit(
  identifier: string,
  type: keyof typeof RateLimits = 'api'
): { allowed: boolean; remaining: number; resetTime: number; message?: string } {
  const limits = RateLimits[type];
  const result = rateLimiter.check(identifier, limits);
  
  if (!result.allowed) {
    const waitSeconds = Math.ceil((result.resetTime - Date.now()) / 1000);
    return {
      ...result,
      message: `تم تجاوز الحد الأقصى للطلبات. يرجى الانتظار ${waitSeconds} ثانية.`
    };
  }
  
  return result;
}

export default rateLimiter;
