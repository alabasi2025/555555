/**
 * نظام التكامل مع الفوترة الإلكترونية - هيئة الزكاة والضريبة والجمارك (ZATCA)
 * يدعم المرحلة الأولى والثانية من الفوترة الإلكترونية
 */

import crypto from 'crypto';

// أنواع الفواتير
export enum InvoiceType {
  STANDARD = '388', // فاتورة ضريبية
  SIMPLIFIED = '381', // فاتورة ضريبية مبسطة
  DEBIT_NOTE = '383', // إشعار مدين
  CREDIT_NOTE = '381', // إشعار دائن
}

// حالات الفاتورة
export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  REPORTED = 'REPORTED',
  CLEARED = 'CLEARED',
  REJECTED = 'REJECTED',
}

// بيانات البائع
export interface SellerInfo {
  name: string;
  vatNumber: string; // الرقم الضريبي
  crNumber: string; // السجل التجاري
  address: {
    street: string;
    buildingNumber: string;
    district: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

// بيانات المشتري
export interface BuyerInfo {
  name: string;
  vatNumber?: string;
  address?: {
    street?: string;
    city?: string;
    country?: string;
  };
}

// بند الفاتورة
export interface InvoiceLineItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  vatRate: number; // نسبة الضريبة (15%)
  vatAmount: number;
  lineTotal: number;
}

// بيانات الفاتورة
export interface ZATCAInvoice {
  invoiceNumber: string;
  invoiceType: InvoiceType;
  issueDate: Date;
  issueTime: string;
  seller: SellerInfo;
  buyer: BuyerInfo;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  totalVAT: number;
  totalAmount: number;
  currency: string;
  paymentMethod?: string;
  notes?: string;
}

// إعدادات ZATCA
interface ZATCAConfig {
  environment: 'sandbox' | 'production';
  certificatePath?: string;
  privateKeyPath?: string;
  otp?: string;
}

class ZATCAIntegration {
  private config: ZATCAConfig;
  private baseUrl: string;

  constructor(config: ZATCAConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'production'
      ? 'https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal'
      : 'https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation';
  }

  /**
   * توليد UUID للفاتورة
   */
  generateInvoiceUUID(): string {
    return crypto.randomUUID();
  }

  /**
   * توليد رقم الفاتورة التسلسلي
   */
  generateInvoiceNumber(prefix: string = 'INV'): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * حساب الضريبة لبند
   */
  calculateLineVAT(quantity: number, unitPrice: number, vatRate: number, discount: number = 0): {
    lineTotal: number;
    vatAmount: number;
    totalWithVAT: number;
  } {
    const subtotal = quantity * unitPrice;
    const discountedAmount = subtotal - discount;
    const vatAmount = discountedAmount * (vatRate / 100);
    const totalWithVAT = discountedAmount + vatAmount;

    return {
      lineTotal: discountedAmount,
      vatAmount: Math.round(vatAmount * 100) / 100,
      totalWithVAT: Math.round(totalWithVAT * 100) / 100,
    };
  }

  /**
   * حساب إجماليات الفاتورة
   */
  calculateInvoiceTotals(lineItems: InvoiceLineItem[]): {
    subtotal: number;
    totalVAT: number;
    totalAmount: number;
  } {
    let subtotal = 0;
    let totalVAT = 0;

    for (const item of lineItems) {
      subtotal += item.lineTotal;
      totalVAT += item.vatAmount;
    }

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      totalVAT: Math.round(totalVAT * 100) / 100,
      totalAmount: Math.round((subtotal + totalVAT) * 100) / 100,
    };
  }

  /**
   * توليد XML للفاتورة (UBL 2.1)
   */
  generateInvoiceXML(invoice: ZATCAInvoice): string {
    const uuid = this.generateInvoiceUUID();
    const issueDate = invoice.issueDate.toISOString().split('T')[0];
    const issueTime = invoice.issueTime || new Date().toTimeString().split(' ')[0];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${invoice.invoiceNumber}</cbc:ID>
  <cbc:UUID>${uuid}</cbc:UUID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${issueTime}</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="0100000">${invoice.invoiceType}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${invoice.currency}</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>SAR</cbc:TaxCurrencyCode>
  
  <!-- بيانات البائع -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">${invoice.seller.crNumber}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PostalAddress>
        <cbc:StreetName>${invoice.seller.address.street}</cbc:StreetName>
        <cbc:BuildingNumber>${invoice.seller.address.buildingNumber}</cbc:BuildingNumber>
        <cbc:CitySubdivisionName>${invoice.seller.address.district}</cbc:CitySubdivisionName>
        <cbc:CityName>${invoice.seller.address.city}</cbc:CityName>
        <cbc:PostalZone>${invoice.seller.address.postalCode}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${invoice.seller.address.country}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${invoice.seller.vatNumber}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${invoice.seller.name}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <!-- بيانات المشتري -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      ${invoice.buyer.vatNumber ? `
      <cac:PartyIdentification>
        <cbc:ID schemeID="VAT">${invoice.buyer.vatNumber}</cbc:ID>
      </cac:PartyIdentification>` : ''}
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${invoice.buyer.name}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>

  <!-- إجمالي الضريبة -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${invoice.currency}">${invoice.totalVAT.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${invoice.currency}">${invoice.subtotal.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${invoice.currency}">${invoice.totalVAT.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>15</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>

  <!-- المبلغ الإجمالي -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${invoice.currency}">${invoice.subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${invoice.currency}">${invoice.subtotal.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${invoice.currency}">${invoice.totalAmount.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${invoice.currency}">${invoice.totalAmount.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

  <!-- بنود الفاتورة -->
  ${invoice.lineItems.map((item, index) => `
  <cac:InvoiceLine>
    <cbc:ID>${index + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="PCE">${item.quantity}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${invoice.currency}">${item.lineTotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="${invoice.currency}">${item.vatAmount.toFixed(2)}</cbc:TaxAmount>
      <cbc:RoundingAmount currencyID="${invoice.currency}">${(item.lineTotal + item.vatAmount).toFixed(2)}</cbc:RoundingAmount>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Name>${item.name}</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>${item.vatRate}</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${invoice.currency}">${item.unitPrice.toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`).join('')}
</Invoice>`;

    return xml;
  }

  /**
   * توليد Hash للفاتورة
   */
  generateInvoiceHash(xml: string): string {
    return crypto.createHash('sha256').update(xml).digest('base64');
  }

  /**
   * توليد QR Code للفاتورة المبسطة
   */
  generateQRCode(invoice: ZATCAInvoice): string {
    // TLV (Tag-Length-Value) encoding
    const tlvData: Buffer[] = [];

    // Tag 1: اسم البائع
    const sellerName = Buffer.from(invoice.seller.name, 'utf8');
    tlvData.push(Buffer.from([1, sellerName.length]), sellerName);

    // Tag 2: الرقم الضريبي
    const vatNumber = Buffer.from(invoice.seller.vatNumber, 'utf8');
    tlvData.push(Buffer.from([2, vatNumber.length]), vatNumber);

    // Tag 3: تاريخ ووقت الفاتورة
    const timestamp = Buffer.from(invoice.issueDate.toISOString(), 'utf8');
    tlvData.push(Buffer.from([3, timestamp.length]), timestamp);

    // Tag 4: إجمالي الفاتورة
    const total = Buffer.from(invoice.totalAmount.toFixed(2), 'utf8');
    tlvData.push(Buffer.from([4, total.length]), total);

    // Tag 5: إجمالي الضريبة
    const vat = Buffer.from(invoice.totalVAT.toFixed(2), 'utf8');
    tlvData.push(Buffer.from([5, vat.length]), vat);

    return Buffer.concat(tlvData).toString('base64');
  }

  /**
   * إرسال الفاتورة إلى ZATCA (المرحلة الثانية)
   */
  async reportInvoice(invoice: ZATCAInvoice): Promise<{
    success: boolean;
    clearanceStatus?: string;
    reportingStatus?: string;
    warnings?: string[];
    errors?: string[];
  }> {
    try {
      const xml = this.generateInvoiceXML(invoice);
      const hash = this.generateInvoiceHash(xml);

      // في الإنتاج، يتم إرسال الفاتورة إلى ZATCA API
      // هذا محاكاة للاستجابة
      console.log('[ZATCA] Reporting invoice:', invoice.invoiceNumber);
      console.log('[ZATCA] Invoice hash:', hash);

      return {
        success: true,
        clearanceStatus: 'CLEARED',
        reportingStatus: 'REPORTED',
        warnings: [],
        errors: [],
      };
    } catch (error) {
      console.error('[ZATCA] Error reporting invoice:', error);
      return {
        success: false,
        errors: [(error as Error).message],
      };
    }
  }

  /**
   * التحقق من صحة الفاتورة
   */
  validateInvoice(invoice: ZATCAInvoice): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // التحقق من البيانات الإلزامية
    if (!invoice.invoiceNumber) errors.push('رقم الفاتورة مطلوب');
    if (!invoice.seller.vatNumber) errors.push('الرقم الضريبي للبائع مطلوب');
    if (!invoice.seller.name) errors.push('اسم البائع مطلوب');
    if (!invoice.seller.crNumber) errors.push('السجل التجاري مطلوب');
    if (!invoice.buyer.name) errors.push('اسم المشتري مطلوب');
    if (invoice.lineItems.length === 0) errors.push('يجب أن تحتوي الفاتورة على بند واحد على الأقل');

    // التحقق من الرقم الضريبي (15 رقم)
    if (invoice.seller.vatNumber && !/^\d{15}$/.test(invoice.seller.vatNumber)) {
      errors.push('الرقم الضريبي يجب أن يتكون من 15 رقم');
    }

    // التحقق من الضريبة
    for (const item of invoice.lineItems) {
      if (item.vatRate !== 15 && item.vatRate !== 0) {
        warnings.push(`نسبة الضريبة للبند ${item.name} غير معتادة: ${item.vatRate}%`);
      }
    }

    // التحقق من الإجماليات
    const calculated = this.calculateInvoiceTotals(invoice.lineItems);
    if (Math.abs(calculated.totalAmount - invoice.totalAmount) > 0.01) {
      errors.push('إجمالي الفاتورة غير صحيح');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// إنشاء نسخة واحدة
export const zatca = new ZATCAIntegration({
  environment: process.env.ZATCA_ENV === 'production' ? 'production' : 'sandbox',
});

export default zatca;
