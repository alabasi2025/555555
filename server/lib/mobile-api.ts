/**
 * واجهة برمجة التطبيقات للهاتف المحمول (Mobile API)
 * يوفر نقاط نهاية مخصصة لتطبيقات iOS و Android
 */

import crypto from 'crypto';

// أنواع الأجهزة
export enum DeviceType {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
  WEB = 'WEB',
}

// معلومات الجهاز
export interface DeviceInfo {
  deviceId: string;
  deviceType: DeviceType;
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  pushToken?: string;
  lastActive?: Date;
}

// جلسة الهاتف
export interface MobileSession {
  sessionId: string;
  userId: number;
  deviceId: string;
  deviceType: DeviceType;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  lastUsed: Date;
}

// طلب تسجيل الدخول
export interface MobileLoginRequest {
  username: string;
  password: string;
  deviceInfo: DeviceInfo;
  twoFactorCode?: string;
}

// استجابة تسجيل الدخول
export interface MobileLoginResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: {
    id: number;
    username: string;
    name: string;
    role: string;
    permissions: string[];
  };
  requiresTwoFactor?: boolean;
  errorMessage?: string;
}

// بيانات لوحة التحكم للهاتف
export interface MobileDashboardData {
  summary: {
    totalCustomers: number;
    activeMeters: number;
    pendingInvoices: number;
    totalRevenue: number;
    overdueAmount: number;
  };
  recentActivities: {
    id: number;
    type: string;
    description: string;
    timestamp: Date;
  }[];
  alerts: {
    id: number;
    type: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
    timestamp: Date;
  }[];
  quickStats: {
    todayReadings: number;
    todayPayments: number;
    pendingTasks: number;
  };
}

// طلب مزامنة البيانات
export interface SyncRequest {
  lastSyncTime: Date;
  deviceId: string;
  dataTypes: ('customers' | 'meters' | 'readings' | 'invoices' | 'payments')[];
}

// استجابة المزامنة
export interface SyncResponse {
  success: boolean;
  syncTime: Date;
  data: {
    customers?: any[];
    meters?: any[];
    readings?: any[];
    invoices?: any[];
    payments?: any[];
  };
  deletedIds: {
    customers?: number[];
    meters?: number[];
    readings?: number[];
    invoices?: number[];
    payments?: number[];
  };
}

/**
 * مدير جلسات الهاتف
 */
class MobileSessionManager {
  private sessions: Map<string, MobileSession> = new Map();
  private readonly ACCESS_TOKEN_EXPIRY = 60 * 60 * 1000; // ساعة واحدة
  private readonly REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 يوم

  /**
   * إنشاء جلسة جديدة
   */
  createSession(userId: number, deviceInfo: DeviceInfo): MobileSession {
    const sessionId = crypto.randomUUID();
    const accessToken = this.generateToken();
    const refreshToken = this.generateToken();

    const session: MobileSession = {
      sessionId,
      userId,
      deviceId: deviceInfo.deviceId,
      deviceType: deviceInfo.deviceType,
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + this.ACCESS_TOKEN_EXPIRY),
      createdAt: new Date(),
      lastUsed: new Date(),
    };

    this.sessions.set(accessToken, session);
    return session;
  }

  /**
   * التحقق من صحة الرمز
   */
  validateToken(accessToken: string): MobileSession | null {
    const session = this.sessions.get(accessToken);
    
    if (!session) return null;
    if (new Date() > session.expiresAt) {
      this.sessions.delete(accessToken);
      return null;
    }

    session.lastUsed = new Date();
    return session;
  }

  /**
   * تجديد الرمز
   */
  refreshSession(refreshToken: string): MobileSession | null {
    // البحث عن الجلسة بواسطة refresh token
    for (const [token, session] of Array.from(this.sessions.entries())) {
      if (session.refreshToken === refreshToken) {
        // إنشاء رمز وصول جديد
        const newAccessToken = this.generateToken();
        session.accessToken = newAccessToken;
        session.expiresAt = new Date(Date.now() + this.ACCESS_TOKEN_EXPIRY);
        session.lastUsed = new Date();

        this.sessions.delete(token);
        this.sessions.set(newAccessToken, session);

        return session;
      }
    }
    return null;
  }

  /**
   * إنهاء الجلسة
   */
  revokeSession(accessToken: string): boolean {
    return this.sessions.delete(accessToken);
  }

  /**
   * إنهاء جميع جلسات المستخدم
   */
  revokeAllUserSessions(userId: number): number {
    let count = 0;
    for (const [token, session] of Array.from(this.sessions.entries())) {
      if (session.userId === userId) {
        this.sessions.delete(token);
        count++;
      }
    }
    return count;
  }

  /**
   * توليد رمز عشوائي
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

/**
 * مدير الإشعارات الفورية
 */
class PushNotificationManager {
  private deviceTokens: Map<string, { userId: number; token: string; type: DeviceType }> = new Map();

  /**
   * تسجيل رمز الجهاز
   */
  registerDevice(userId: number, deviceId: string, pushToken: string, deviceType: DeviceType): void {
    this.deviceTokens.set(deviceId, { userId, token: pushToken, type: deviceType });
    console.log(`[Push] Registered device ${deviceId} for user ${userId}`);
  }

  /**
   * إلغاء تسجيل الجهاز
   */
  unregisterDevice(deviceId: string): void {
    this.deviceTokens.delete(deviceId);
  }

  /**
   * إرسال إشعار للمستخدم
   */
  async sendToUser(userId: number, title: string, body: string, data?: Record<string, any>): Promise<number> {
    let sent = 0;
    
    for (const [deviceId, device] of Array.from(this.deviceTokens.entries())) {
      if (device.userId === userId) {
        await this.sendNotification(device.token, device.type, title, body, data);
        sent++;
      }
    }

    return sent;
  }

  /**
   * إرسال إشعار لجميع المستخدمين
   */
  async broadcast(title: string, body: string, data?: Record<string, any>): Promise<number> {
    let sent = 0;

    for (const device of Array.from(this.deviceTokens.values())) {
      await this.sendNotification(device.token, device.type, title, body, data);
      sent++;
    }

    return sent;
  }

  /**
   * إرسال الإشعار الفعلي
   */
  private async sendNotification(
    token: string,
    deviceType: DeviceType,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<boolean> {
    try {
      console.log(`[Push] Sending to ${deviceType} device: ${title}`);
      
      // في الإنتاج، يتم استخدام Firebase Cloud Messaging أو APNs
      // هذا محاكاة للإرسال
      
      return true;
    } catch (error) {
      console.error('[Push] Failed to send notification:', error);
      return false;
    }
  }
}

/**
 * مدير مزامنة البيانات
 */
class DataSyncManager {
  /**
   * الحصول على البيانات المحدثة منذ آخر مزامنة
   */
  async getUpdatedData(request: SyncRequest): Promise<SyncResponse> {
    const syncTime = new Date();
    const data: SyncResponse['data'] = {};
    const deletedIds: SyncResponse['deletedIds'] = {};

    // في الإنتاج، يتم جلب البيانات من قاعدة البيانات
    // هذا محاكاة للاستجابة

    for (const dataType of request.dataTypes) {
      switch (dataType) {
        case 'customers':
          data.customers = [];
          deletedIds.customers = [];
          break;
        case 'meters':
          data.meters = [];
          deletedIds.meters = [];
          break;
        case 'readings':
          data.readings = [];
          deletedIds.readings = [];
          break;
        case 'invoices':
          data.invoices = [];
          deletedIds.invoices = [];
          break;
        case 'payments':
          data.payments = [];
          deletedIds.payments = [];
          break;
      }
    }

    return {
      success: true,
      syncTime,
      data,
      deletedIds,
    };
  }

  /**
   * رفع البيانات من الجهاز
   */
  async uploadData(deviceId: string, data: {
    readings?: any[];
    payments?: any[];
    notes?: any[];
  }): Promise<{ success: boolean; processed: number; errors: string[] }> {
    const errors: string[] = [];
    let processed = 0;

    // معالجة القراءات
    if (data.readings) {
      for (const reading of data.readings) {
        try {
          // حفظ القراءة في قاعدة البيانات
          processed++;
        } catch (error) {
          errors.push(`فشل حفظ القراءة: ${(error as Error).message}`);
        }
      }
    }

    // معالجة المدفوعات
    if (data.payments) {
      for (const payment of data.payments) {
        try {
          // حفظ الدفعة في قاعدة البيانات
          processed++;
        } catch (error) {
          errors.push(`فشل حفظ الدفعة: ${(error as Error).message}`);
        }
      }
    }

    return { success: errors.length === 0, processed, errors };
  }
}

/**
 * واجهة API للهاتف المحمول
 */
class MobileAPI {
  private sessionManager: MobileSessionManager;
  private pushManager: PushNotificationManager;
  private syncManager: DataSyncManager;

  constructor() {
    this.sessionManager = new MobileSessionManager();
    this.pushManager = new PushNotificationManager();
    this.syncManager = new DataSyncManager();
  }

  /**
   * تسجيل الدخول
   */
  async login(request: MobileLoginRequest): Promise<MobileLoginResponse> {
    try {
      // في الإنتاج، يتم التحقق من بيانات المستخدم من قاعدة البيانات
      // هذا محاكاة للتحقق
      
      if (request.username === 'admin' && request.password === 'admin') {
        const session = this.sessionManager.createSession(1, request.deviceInfo);

        // تسجيل رمز الإشعارات
        if (request.deviceInfo.pushToken) {
          this.pushManager.registerDevice(
            1,
            request.deviceInfo.deviceId,
            request.deviceInfo.pushToken,
            request.deviceInfo.deviceType
          );
        }

        return {
          success: true,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          expiresIn: 3600,
          user: {
            id: 1,
            username: 'admin',
            name: 'مدير النظام',
            role: 'admin',
            permissions: ['all'],
          },
        };
      }

      return {
        success: false,
        errorMessage: 'اسم المستخدم أو كلمة المرور غير صحيحة',
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: (error as Error).message,
      };
    }
  }

  /**
   * تجديد الرمز
   */
  async refreshToken(refreshToken: string): Promise<MobileLoginResponse> {
    const session = this.sessionManager.refreshSession(refreshToken);

    if (session) {
      return {
        success: true,
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresIn: 3600,
      };
    }

    return {
      success: false,
      errorMessage: 'رمز التجديد غير صالح',
    };
  }

  /**
   * تسجيل الخروج
   */
  async logout(accessToken: string): Promise<boolean> {
    return this.sessionManager.revokeSession(accessToken);
  }

  /**
   * الحصول على بيانات لوحة التحكم
   */
  async getDashboard(accessToken: string): Promise<MobileDashboardData | null> {
    const session = this.sessionManager.validateToken(accessToken);
    if (!session) return null;

    // في الإنتاج، يتم جلب البيانات من قاعدة البيانات
    return {
      summary: {
        totalCustomers: 1250,
        activeMeters: 1180,
        pendingInvoices: 45,
        totalRevenue: 2500000,
        overdueAmount: 125000,
      },
      recentActivities: [
        { id: 1, type: 'payment', description: 'دفعة جديدة من العميل #1234', timestamp: new Date() },
        { id: 2, type: 'reading', description: 'قراءة عداد #5678', timestamp: new Date() },
      ],
      alerts: [
        { id: 1, type: 'warning', message: '5 فواتير متأخرة', severity: 'warning', timestamp: new Date() },
      ],
      quickStats: {
        todayReadings: 25,
        todayPayments: 12,
        pendingTasks: 8,
      },
    };
  }

  /**
   * مزامنة البيانات
   */
  async syncData(accessToken: string, request: SyncRequest): Promise<SyncResponse | null> {
    const session = this.sessionManager.validateToken(accessToken);
    if (!session) return null;

    return this.syncManager.getUpdatedData(request);
  }

  /**
   * رفع البيانات
   */
  async uploadData(
    accessToken: string,
    data: { readings?: any[]; payments?: any[]; notes?: any[] }
  ): Promise<{ success: boolean; processed: number; errors: string[] } | null> {
    const session = this.sessionManager.validateToken(accessToken);
    if (!session) return null;

    return this.syncManager.uploadData(session.deviceId, data);
  }

  /**
   * إرسال إشعار للمستخدم
   */
  async sendPushNotification(userId: number, title: string, body: string, data?: Record<string, any>): Promise<number> {
    return this.pushManager.sendToUser(userId, title, body, data);
  }

  /**
   * إرسال إشعار للجميع
   */
  async broadcastNotification(title: string, body: string, data?: Record<string, any>): Promise<number> {
    return this.pushManager.broadcast(title, body, data);
  }
}

// إنشاء نسخة واحدة
export const mobileAPI = new MobileAPI();

export default mobileAPI;
