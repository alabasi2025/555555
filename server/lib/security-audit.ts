/**
 * نظام سجل الأمان (Security Audit Log)
 * يسجل جميع الأحداث الأمنية للمراجعة والتحليل
 */

// import { db } from '../db';

// أنواع الأحداث الأمنية
export enum SecurityEventType {
  // المصادقة
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_COMPLETE = 'PASSWORD_RESET_COMPLETE',
  
  // المصادقة الثنائية
  TWO_FACTOR_ENABLED = 'TWO_FACTOR_ENABLED',
  TWO_FACTOR_DISABLED = 'TWO_FACTOR_DISABLED',
  TWO_FACTOR_SUCCESS = 'TWO_FACTOR_SUCCESS',
  TWO_FACTOR_FAILED = 'TWO_FACTOR_FAILED',
  BACKUP_CODE_USED = 'BACKUP_CODE_USED',
  
  // إدارة المستخدمين
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_LOCKED = 'USER_LOCKED',
  USER_UNLOCKED = 'USER_UNLOCKED',
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
  ROLE_REMOVED = 'ROLE_REMOVED',
  
  // الصلاحيات
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  
  // البيانات
  DATA_EXPORT = 'DATA_EXPORT',
  DATA_IMPORT = 'DATA_IMPORT',
  BULK_DELETE = 'BULK_DELETE',
  SENSITIVE_DATA_ACCESS = 'SENSITIVE_DATA_ACCESS',
  
  // النظام
  SYSTEM_CONFIG_CHANGE = 'SYSTEM_CONFIG_CHANGE',
  API_KEY_CREATED = 'API_KEY_CREATED',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY'
}

// مستويات الخطورة
export enum SecuritySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

interface SecurityEvent {
  type: SecurityEventType;
  severity: SecuritySeverity;
  userId?: number;
  username?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  details?: Record<string, any>;
  success: boolean;
  timestamp: Date;
}

// تخزين مؤقت للأحداث قبل الكتابة للقاعدة
const eventBuffer: SecurityEvent[] = [];
const BUFFER_SIZE = 100;
const FLUSH_INTERVAL = 30000; // 30 ثانية

/**
 * تسجيل حدث أمني
 */
export async function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): Promise<void> {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: new Date()
  };
  
  eventBuffer.push(fullEvent);
  
  // كتابة فورية للأحداث الحرجة
  if (event.severity === SecuritySeverity.CRITICAL || event.severity === SecuritySeverity.HIGH) {
    await flushEvents();
  } else if (eventBuffer.length >= BUFFER_SIZE) {
    await flushEvents();
  }
  
  // طباعة في وحدة التحكم للتطوير
  console.log(`[SECURITY] ${event.severity} - ${event.type}:`, {
    userId: event.userId,
    username: event.username,
    ip: event.ipAddress,
    success: event.success,
    details: event.details
  });
}

/**
 * كتابة الأحداث المخزنة مؤقتاً إلى قاعدة البيانات
 */
async function flushEvents(): Promise<void> {
  if (eventBuffer.length === 0) return;
  
  const eventsToWrite = [...eventBuffer];
  eventBuffer.length = 0;
  
  try {
    // يمكن إضافة جدول لسجل الأمان في قاعدة البيانات
    // await db.insert(securityLogs).values(eventsToWrite);
    
    // حالياً نكتب في ملف أو نرسل لنظام مراقبة خارجي
    console.log(`[SECURITY] Flushed ${eventsToWrite.length} events`);
  } catch (error) {
    console.error('[SECURITY] Failed to flush events:', error);
    // إعادة الأحداث للمخزن المؤقت
    eventBuffer.push(...eventsToWrite);
  }
}

// كتابة دورية للأحداث
setInterval(flushEvents, FLUSH_INTERVAL);

/**
 * دوال مساعدة لتسجيل أحداث شائعة
 */
export const SecurityLog = {
  loginSuccess: (userId: number, username: string, ip?: string, userAgent?: string) =>
    logSecurityEvent({
      type: SecurityEventType.LOGIN_SUCCESS,
      severity: SecuritySeverity.LOW,
      userId,
      username,
      ipAddress: ip,
      userAgent,
      success: true
    }),
    
  loginFailed: (username: string, ip?: string, userAgent?: string, reason?: string) =>
    logSecurityEvent({
      type: SecurityEventType.LOGIN_FAILED,
      severity: SecuritySeverity.MEDIUM,
      username,
      ipAddress: ip,
      userAgent,
      details: { reason },
      success: false
    }),
    
  logout: (userId: number, username: string, ip?: string) =>
    logSecurityEvent({
      type: SecurityEventType.LOGOUT,
      severity: SecuritySeverity.LOW,
      userId,
      username,
      ipAddress: ip,
      success: true
    }),
    
  passwordChange: (userId: number, username: string, ip?: string) =>
    logSecurityEvent({
      type: SecurityEventType.PASSWORD_CHANGE,
      severity: SecuritySeverity.MEDIUM,
      userId,
      username,
      ipAddress: ip,
      success: true
    }),
    
  twoFactorEnabled: (userId: number, username: string) =>
    logSecurityEvent({
      type: SecurityEventType.TWO_FACTOR_ENABLED,
      severity: SecuritySeverity.MEDIUM,
      userId,
      username,
      success: true
    }),
    
  twoFactorFailed: (userId: number, username: string, ip?: string) =>
    logSecurityEvent({
      type: SecurityEventType.TWO_FACTOR_FAILED,
      severity: SecuritySeverity.HIGH,
      userId,
      username,
      ipAddress: ip,
      success: false
    }),
    
  accessDenied: (userId: number, username: string, resource: string, ip?: string) =>
    logSecurityEvent({
      type: SecurityEventType.ACCESS_DENIED,
      severity: SecuritySeverity.HIGH,
      userId,
      username,
      resource,
      ipAddress: ip,
      success: false
    }),
    
  dataExport: (userId: number, username: string, resource: string, recordCount: number) =>
    logSecurityEvent({
      type: SecurityEventType.DATA_EXPORT,
      severity: SecuritySeverity.MEDIUM,
      userId,
      username,
      resource,
      details: { recordCount },
      success: true
    }),
    
  rateLimitExceeded: (identifier: string, ip?: string) =>
    logSecurityEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      severity: SecuritySeverity.HIGH,
      ipAddress: ip,
      details: { identifier },
      success: false
    }),
    
  suspiciousActivity: (description: string, ip?: string, details?: Record<string, any>) =>
    logSecurityEvent({
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      severity: SecuritySeverity.CRITICAL,
      ipAddress: ip,
      details: { description, ...details },
      success: false
    })
};

export default SecurityLog;
