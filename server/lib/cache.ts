/**
 * نظام التخزين المؤقت (Caching System)
 * يوفر تخزين مؤقت في الذاكرة لتحسين أداء الاستعلامات
 */

interface CacheItem<T> {
  data: T;
  expiry: number;
  createdAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
}

class MemoryCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes default
  private maxSize: number = 1000;
  private hits: number = 0;
  private misses: number = 0;

  constructor(options?: CacheOptions) {
    if (options?.ttl) this.defaultTTL = options.ttl;
    if (options?.maxSize) this.maxSize = options.maxSize;
    
    // تنظيف دوري للعناصر المنتهية الصلاحية
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  /**
   * تخزين قيمة في الذاكرة المؤقتة
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // إزالة العناصر القديمة إذا تجاوز الحد الأقصى
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, {
      data,
      expiry,
      createdAt: Date.now()
    });
  }

  /**
   * استرجاع قيمة من الذاكرة المؤقتة
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.misses++;
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return item.data as T;
  }

  /**
   * حذف قيمة من الذاكرة المؤقتة
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * حذف جميع القيم التي تبدأ بنمط معين
   */
  deletePattern(pattern: string): number {
    let deleted = 0;
    for (const key of Array.from(this.cache.keys())) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
        deleted++;
      }
    }
    return deleted;
  }

  /**
   * مسح جميع القيم
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * الحصول على إحصائيات الذاكرة المؤقتة
   */
  getStats(): {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  } {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0
    };
  }

  /**
   * تنظيف العناصر المنتهية الصلاحية
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of Array.from(this.cache.entries())) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * إزالة أقدم العناصر
   */
  private evictOldest(): void {
    let oldest: { key: string; createdAt: number } | null = null;
    
    for (const [key, item] of Array.from(this.cache.entries())) {
      if (!oldest || item.createdAt < oldest.createdAt) {
        oldest = { key, createdAt: item.createdAt };
      }
    }
    
    if (oldest) {
      this.cache.delete(oldest.key);
    }
  }

  /**
   * استرجاع أو تخزين قيمة (Cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await factory();
    this.set(key, data, ttl);
    return data;
  }
}

// إنشاء نسخة واحدة من الذاكرة المؤقتة
export const cache = new MemoryCache({
  ttl: 5 * 60 * 1000, // 5 دقائق
  maxSize: 1000
});

// مفاتيح الذاكرة المؤقتة
export const CacheKeys = {
  // العملاء
  customers: () => 'customers:all',
  customer: (id: number) => `customers:${id}`,
  customerStats: () => 'customers:stats',
  
  // الموردين
  suppliers: () => 'suppliers:all',
  supplier: (id: number) => `suppliers:${id}`,
  
  // الفواتير
  invoices: () => 'invoices:all',
  invoice: (id: number) => `invoices:${id}`,
  invoiceStats: () => 'invoices:stats',
  
  // المخزون
  inventory: () => 'inventory:all',
  inventoryItem: (id: number) => `inventory:${id}`,
  inventoryStats: () => 'inventory:stats',
  
  // الحسابات
  accounts: () => 'accounts:all',
  account: (id: number) => `accounts:${id}`,
  accountTree: () => 'accounts:tree',
  
  // التقارير
  report: (type: string, params: string) => `reports:${type}:${params}`,
  
  // لوحة التحكم
  dashboardStats: () => 'dashboard:stats',
  dashboardActivities: () => 'dashboard:activities',
  
  // المستخدمين
  users: () => 'users:all',
  user: (id: number) => `users:${id}`,
  userPermissions: (id: number) => `users:${id}:permissions`,
};

// دالة مساعدة لإبطال الذاكرة المؤقتة عند التحديث
export const invalidateCache = {
  customers: () => {
    cache.deletePattern('customers:');
    cache.delete(CacheKeys.dashboardStats());
  },
  suppliers: () => {
    cache.deletePattern('suppliers:');
  },
  invoices: () => {
    cache.deletePattern('invoices:');
    cache.delete(CacheKeys.dashboardStats());
    cache.delete(CacheKeys.dashboardActivities());
  },
  inventory: () => {
    cache.deletePattern('inventory:');
    cache.delete(CacheKeys.dashboardStats());
  },
  accounts: () => {
    cache.deletePattern('accounts:');
  },
  users: () => {
    cache.deletePattern('users:');
  },
  all: () => {
    cache.clear();
  }
};

export default cache;
