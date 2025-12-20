/**
 * نظام خدمات المراسلة
 * يدعم SMS، Email، WhatsApp، والإشعارات الفورية
 */

import crypto from 'crypto';

// أنواع الرسائل
export enum MessageType {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  PUSH = 'PUSH',
}

// حالات الرسالة
export enum MessageStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
}

// قوالب الرسائل
export enum MessageTemplate {
  // الفواتير
  INVOICE_CREATED = 'INVOICE_CREATED',
  INVOICE_DUE = 'INVOICE_DUE',
  INVOICE_OVERDUE = 'INVOICE_OVERDUE',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_REMINDER = 'PAYMENT_REMINDER',
  
  // القراءات
  READING_SCHEDULED = 'READING_SCHEDULED',
  READING_COMPLETED = 'READING_COMPLETED',
  HIGH_CONSUMPTION_ALERT = 'HIGH_CONSUMPTION_ALERT',
  
  // الصيانة
  MAINTENANCE_SCHEDULED = 'MAINTENANCE_SCHEDULED',
  MAINTENANCE_COMPLETED = 'MAINTENANCE_COMPLETED',
  OUTAGE_NOTIFICATION = 'OUTAGE_NOTIFICATION',
  SERVICE_RESTORED = 'SERVICE_RESTORED',
  
  // الحساب
  WELCOME = 'WELCOME',
  PASSWORD_RESET = 'PASSWORD_RESET',
  TWO_FACTOR_CODE = 'TWO_FACTOR_CODE',
  ACCOUNT_UPDATE = 'ACCOUNT_UPDATE',
}

// بيانات الرسالة
export interface Message {
  id?: string;
  type: MessageType;
  template?: MessageTemplate;
  recipient: string;
  subject?: string;
  body: string;
  htmlBody?: string;
  attachments?: Attachment[];
  metadata?: Record<string, any>;
  scheduledAt?: Date;
  priority?: 'low' | 'normal' | 'high';
}

// المرفقات
export interface Attachment {
  filename: string;
  content: string | Buffer;
  contentType: string;
}

// نتيجة الإرسال
export interface SendResult {
  success: boolean;
  messageId?: string;
  status: MessageStatus;
  errorMessage?: string;
  cost?: number;
}

// قوالب الرسائل
const templates: Record<MessageTemplate, { subject?: string; body: string; htmlBody?: string }> = {
  [MessageTemplate.INVOICE_CREATED]: {
    subject: 'فاتورة جديدة - {{invoiceNumber}}',
    body: 'عزيزي {{customerName}}،\n\nتم إصدار فاتورة جديدة برقم {{invoiceNumber}} بمبلغ {{amount}} ريال.\n\nتاريخ الاستحقاق: {{dueDate}}\n\nشكراً لكم.',
    htmlBody: '<h2>فاتورة جديدة</h2><p>عزيزي {{customerName}}،</p><p>تم إصدار فاتورة جديدة برقم <strong>{{invoiceNumber}}</strong> بمبلغ <strong>{{amount}} ريال</strong>.</p><p>تاريخ الاستحقاق: {{dueDate}}</p>',
  },
  [MessageTemplate.INVOICE_DUE]: {
    subject: 'تذكير بموعد استحقاق الفاتورة - {{invoiceNumber}}',
    body: 'عزيزي {{customerName}}،\n\nنذكركم بأن الفاتورة رقم {{invoiceNumber}} بمبلغ {{amount}} ريال مستحقة في {{dueDate}}.\n\nيرجى السداد قبل الموعد المحدد.',
  },
  [MessageTemplate.INVOICE_OVERDUE]: {
    subject: 'فاتورة متأخرة - {{invoiceNumber}}',
    body: 'عزيزي {{customerName}}،\n\nالفاتورة رقم {{invoiceNumber}} بمبلغ {{amount}} ريال متأخرة عن موعد السداد.\n\nيرجى السداد في أقرب وقت لتجنب أي رسوم إضافية.',
  },
  [MessageTemplate.PAYMENT_RECEIVED]: {
    subject: 'تم استلام الدفعة - {{receiptNumber}}',
    body: 'عزيزي {{customerName}}،\n\nتم استلام دفعتكم بمبلغ {{amount}} ريال بنجاح.\n\nرقم الإيصال: {{receiptNumber}}\n\nشكراً لكم.',
  },
  [MessageTemplate.PAYMENT_REMINDER]: {
    subject: 'تذكير بالسداد',
    body: 'عزيزي {{customerName}}،\n\nنذكركم بضرورة سداد المبالغ المستحقة.\n\nإجمالي المستحق: {{totalDue}} ريال',
  },
  [MessageTemplate.READING_SCHEDULED]: {
    subject: 'موعد قراءة العداد',
    body: 'عزيزي {{customerName}}،\n\nسيتم قراءة عدادكم في {{readingDate}}.\n\nيرجى التأكد من إمكانية الوصول للعداد.',
  },
  [MessageTemplate.READING_COMPLETED]: {
    subject: 'تم تسجيل قراءة العداد',
    body: 'عزيزي {{customerName}}،\n\nتم تسجيل قراءة عدادكم.\n\nالقراءة: {{reading}}\nالاستهلاك: {{consumption}} كيلوواط',
  },
  [MessageTemplate.HIGH_CONSUMPTION_ALERT]: {
    subject: 'تنبيه: استهلاك مرتفع',
    body: 'عزيزي {{customerName}}،\n\nلاحظنا ارتفاعاً في استهلاككم للكهرباء.\n\nالاستهلاك الحالي: {{currentConsumption}}\nالمتوسط: {{averageConsumption}}\n\nيرجى التحقق من أجهزتكم.',
  },
  [MessageTemplate.MAINTENANCE_SCHEDULED]: {
    subject: 'صيانة مجدولة',
    body: 'عزيزي {{customerName}}،\n\nسيتم إجراء صيانة في منطقتكم.\n\nالتاريخ: {{maintenanceDate}}\nالمدة المتوقعة: {{duration}}\n\nنعتذر عن أي إزعاج.',
  },
  [MessageTemplate.MAINTENANCE_COMPLETED]: {
    subject: 'اكتمال الصيانة',
    body: 'عزيزي {{customerName}}،\n\nتم الانتهاء من أعمال الصيانة بنجاح.\n\nشكراً لصبركم.',
  },
  [MessageTemplate.OUTAGE_NOTIFICATION]: {
    subject: 'إشعار انقطاع الخدمة',
    body: 'عزيزي {{customerName}}،\n\nنعلمكم بوجود انقطاع في الخدمة في منطقتكم.\n\nالسبب: {{reason}}\nالوقت المتوقع للإصلاح: {{estimatedRestoration}}\n\nنعتذر عن الإزعاج.',
  },
  [MessageTemplate.SERVICE_RESTORED]: {
    subject: 'تم استعادة الخدمة',
    body: 'عزيزي {{customerName}}،\n\nتم استعادة الخدمة في منطقتكم.\n\nشكراً لصبركم.',
  },
  [MessageTemplate.WELCOME]: {
    subject: 'مرحباً بكم',
    body: 'عزيزي {{customerName}}،\n\nمرحباً بكم في خدماتنا.\n\nرقم الاشتراك: {{subscriptionNumber}}\n\nنتطلع لخدمتكم.',
  },
  [MessageTemplate.PASSWORD_RESET]: {
    subject: 'إعادة تعيين كلمة المرور',
    body: 'لإعادة تعيين كلمة المرور، استخدم الرابط التالي:\n\n{{resetLink}}\n\nالرابط صالح لمدة {{validityPeriod}}.',
  },
  [MessageTemplate.TWO_FACTOR_CODE]: {
    subject: 'رمز التحقق',
    body: 'رمز التحقق الخاص بك: {{code}}\n\nصالح لمدة {{validityPeriod}} دقائق.',
  },
  [MessageTemplate.ACCOUNT_UPDATE]: {
    subject: 'تحديث الحساب',
    body: 'عزيزي {{customerName}}،\n\nتم تحديث بيانات حسابكم بنجاح.',
  },
};

/**
 * خدمة SMS
 */
class SMSService {
  private provider: string;
  private apiKey: string;
  private senderId: string;

  constructor() {
    this.provider = process.env.SMS_PROVIDER || 'unifonic';
    this.apiKey = process.env.SMS_API_KEY || '';
    this.senderId = process.env.SMS_SENDER_ID || 'PowerStation';
  }

  async send(phone: string, message: string): Promise<SendResult> {
    try {
      console.log(`[SMS] Sending to ${phone}: ${message.substring(0, 50)}...`);

      // محاكاة إرسال SMS
      const messageId = `sms_${crypto.randomBytes(8).toString('hex')}`;

      return {
        success: true,
        messageId,
        status: MessageStatus.SENT,
        cost: 0.05, // تكلفة تقريبية
      };
    } catch (error) {
      return {
        success: false,
        status: MessageStatus.FAILED,
        errorMessage: (error as Error).message,
      };
    }
  }

  formatPhoneNumber(phone: string): string {
    // تنسيق رقم الهاتف السعودي
    let formatted = phone.replace(/\D/g, '');
    if (formatted.startsWith('0')) {
      formatted = '966' + formatted.substring(1);
    } else if (!formatted.startsWith('966')) {
      formatted = '966' + formatted;
    }
    return formatted;
  }
}

/**
 * خدمة البريد الإلكتروني
 */
class EmailService {
  private provider: string;
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'sendgrid';
    this.apiKey = process.env.EMAIL_API_KEY || '';
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@powerstation.sa';
    this.fromName = process.env.EMAIL_FROM_NAME || 'نظام إدارة محطات الكهرباء';
  }

  async send(
    to: string,
    subject: string,
    body: string,
    htmlBody?: string,
    attachments?: Attachment[]
  ): Promise<SendResult> {
    try {
      console.log(`[Email] Sending to ${to}: ${subject}`);

      // محاكاة إرسال البريد
      const messageId = `email_${crypto.randomBytes(8).toString('hex')}`;

      return {
        success: true,
        messageId,
        status: MessageStatus.SENT,
      };
    } catch (error) {
      return {
        success: false,
        status: MessageStatus.FAILED,
        errorMessage: (error as Error).message,
      };
    }
  }
}

/**
 * خدمة WhatsApp
 */
class WhatsAppService {
  private apiUrl: string;
  private apiKey: string;
  private phoneNumberId: string;

  constructor() {
    this.apiUrl = 'https://graph.facebook.com/v17.0';
    this.apiKey = process.env.WHATSAPP_API_KEY || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_ID || '';
  }

  async send(phone: string, message: string): Promise<SendResult> {
    try {
      console.log(`[WhatsApp] Sending to ${phone}: ${message.substring(0, 50)}...`);

      // محاكاة إرسال WhatsApp
      const messageId = `wa_${crypto.randomBytes(8).toString('hex')}`;

      return {
        success: true,
        messageId,
        status: MessageStatus.SENT,
      };
    } catch (error) {
      return {
        success: false,
        status: MessageStatus.FAILED,
        errorMessage: (error as Error).message,
      };
    }
  }

  async sendTemplate(
    phone: string,
    templateName: string,
    parameters: Record<string, string>
  ): Promise<SendResult> {
    try {
      console.log(`[WhatsApp] Sending template ${templateName} to ${phone}`);

      const messageId = `wa_${crypto.randomBytes(8).toString('hex')}`;

      return {
        success: true,
        messageId,
        status: MessageStatus.SENT,
      };
    } catch (error) {
      return {
        success: false,
        status: MessageStatus.FAILED,
        errorMessage: (error as Error).message,
      };
    }
  }
}

/**
 * خدمة الإشعارات الفورية
 */
class PushNotificationService {
  private firebaseKey: string;

  constructor() {
    this.firebaseKey = process.env.FIREBASE_SERVER_KEY || '';
  }

  async send(
    deviceToken: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<SendResult> {
    try {
      console.log(`[Push] Sending to device: ${title}`);

      const messageId = `push_${crypto.randomBytes(8).toString('hex')}`;

      return {
        success: true,
        messageId,
        status: MessageStatus.SENT,
      };
    } catch (error) {
      return {
        success: false,
        status: MessageStatus.FAILED,
        errorMessage: (error as Error).message,
      };
    }
  }

  async sendToTopic(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<SendResult> {
    try {
      console.log(`[Push] Sending to topic ${topic}: ${title}`);

      const messageId = `push_${crypto.randomBytes(8).toString('hex')}`;

      return {
        success: true,
        messageId,
        status: MessageStatus.SENT,
      };
    } catch (error) {
      return {
        success: false,
        status: MessageStatus.FAILED,
        errorMessage: (error as Error).message,
      };
    }
  }
}

/**
 * مدير خدمات المراسلة
 */
class MessagingManager {
  private smsService: SMSService;
  private emailService: EmailService;
  private whatsappService: WhatsAppService;
  private pushService: PushNotificationService;

  constructor() {
    this.smsService = new SMSService();
    this.emailService = new EmailService();
    this.whatsappService = new WhatsAppService();
    this.pushService = new PushNotificationService();
  }

  /**
   * استبدال المتغيرات في القالب
   */
  private replaceVariables(text: string, variables: Record<string, string>): string {
    let result = text;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }

  /**
   * إرسال رسالة باستخدام قالب
   */
  async sendFromTemplate(
    type: MessageType,
    template: MessageTemplate,
    recipient: string,
    variables: Record<string, string>
  ): Promise<SendResult> {
    const templateData = templates[template];
    if (!templateData) {
      return {
        success: false,
        status: MessageStatus.FAILED,
        errorMessage: 'القالب غير موجود',
      };
    }

    const body = this.replaceVariables(templateData.body, variables);
    const subject = templateData.subject
      ? this.replaceVariables(templateData.subject, variables)
      : undefined;
    const htmlBody = templateData.htmlBody
      ? this.replaceVariables(templateData.htmlBody, variables)
      : undefined;

    return this.send({
      type,
      recipient,
      subject,
      body,
      htmlBody,
    });
  }

  /**
   * إرسال رسالة
   */
  async send(message: Message): Promise<SendResult> {
    switch (message.type) {
      case MessageType.SMS:
        const formattedPhone = this.smsService.formatPhoneNumber(message.recipient);
        return this.smsService.send(formattedPhone, message.body);

      case MessageType.EMAIL:
        return this.emailService.send(
          message.recipient,
          message.subject || 'إشعار',
          message.body,
          message.htmlBody,
          message.attachments
        );

      case MessageType.WHATSAPP:
        return this.whatsappService.send(message.recipient, message.body);

      case MessageType.PUSH:
        return this.pushService.send(
          message.recipient,
          message.subject || 'إشعار',
          message.body,
          message.metadata
        );

      default:
        return {
          success: false,
          status: MessageStatus.FAILED,
          errorMessage: 'نوع الرسالة غير مدعوم',
        };
    }
  }

  /**
   * إرسال رسالة متعددة القنوات
   */
  async sendMultiChannel(
    channels: MessageType[],
    recipient: { phone?: string; email?: string; deviceToken?: string },
    subject: string,
    body: string
  ): Promise<Map<MessageType, SendResult>> {
    const results = new Map<MessageType, SendResult>();

    for (const channel of channels) {
      let recipientAddress: string;

      switch (channel) {
        case MessageType.SMS:
        case MessageType.WHATSAPP:
          recipientAddress = recipient.phone || '';
          break;
        case MessageType.EMAIL:
          recipientAddress = recipient.email || '';
          break;
        case MessageType.PUSH:
          recipientAddress = recipient.deviceToken || '';
          break;
        default:
          continue;
      }

      if (recipientAddress) {
        const result = await this.send({
          type: channel,
          recipient: recipientAddress,
          subject,
          body,
        });
        results.set(channel, result);
      }
    }

    return results;
  }

  /**
   * إرسال رسالة جماعية
   */
  async sendBulk(
    type: MessageType,
    recipients: string[],
    subject: string,
    body: string
  ): Promise<{ sent: number; failed: number; results: SendResult[] }> {
    const results: SendResult[] = [];
    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      const result = await this.send({
        type,
        recipient,
        subject,
        body,
      });

      results.push(result);
      if (result.success) {
        sent++;
      } else {
        failed++;
      }

      // تأخير بسيط لتجنب تجاوز حدود API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { sent, failed, results };
  }
}

// إنشاء نسخة واحدة
export const messagingManager = new MessagingManager();

export default messagingManager;
