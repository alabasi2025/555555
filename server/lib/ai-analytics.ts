/**
 * نظام الذكاء الاصطناعي للتنبؤ والتحليل
 * يوفر تحليلات متقدمة وتنبؤات للاستهلاك والصيانة
 */

// أنواع التنبؤات
export enum PredictionType {
  CONSUMPTION = 'CONSUMPTION',
  MAINTENANCE = 'MAINTENANCE',
  REVENUE = 'REVENUE',
  CUSTOMER_CHURN = 'CUSTOMER_CHURN',
  ANOMALY = 'ANOMALY',
}

// نتيجة التنبؤ
export interface PredictionResult {
  type: PredictionType;
  value: number;
  confidence: number; // 0-100
  trend: 'up' | 'down' | 'stable';
  factors: string[];
  recommendations: string[];
  timestamp: Date;
}

// بيانات الاستهلاك التاريخية
export interface ConsumptionData {
  date: Date;
  value: number;
  temperature?: number;
  dayOfWeek?: number;
  isHoliday?: boolean;
}

// نتيجة اكتشاف الشذوذ
export interface AnomalyResult {
  isAnomaly: boolean;
  score: number; // 0-100
  expectedValue: number;
  actualValue: number;
  deviation: number;
  possibleCauses: string[];
}

// تحليل العميل
export interface CustomerAnalysis {
  customerId: number;
  segment: string;
  lifetimeValue: number;
  churnRisk: number; // 0-100
  paymentBehavior: 'excellent' | 'good' | 'average' | 'poor';
  consumptionPattern: 'low' | 'medium' | 'high' | 'variable';
  recommendations: string[];
}

/**
 * محرك التنبؤ بالاستهلاك
 */
class ConsumptionPredictor {
  /**
   * التنبؤ بالاستهلاك المستقبلي
   */
  predict(
    historicalData: ConsumptionData[],
    daysAhead: number = 30
  ): PredictionResult[] {
    const predictions: PredictionResult[] = [];
    
    if (historicalData.length < 7) {
      return predictions;
    }

    // حساب المتوسط والانحراف المعياري
    const values = historicalData.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    );

    // حساب الاتجاه
    const trend = this.calculateTrend(values);

    // توليد التنبؤات
    for (let i = 1; i <= daysAhead; i++) {
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + i);

      // تعديل بناءً على يوم الأسبوع
      const dayFactor = this.getDayFactor(baseDate.getDay());
      
      // تعديل بناءً على الموسم
      const seasonFactor = this.getSeasonFactor(baseDate.getMonth());

      const predictedValue = mean * (1 + trend * i / 100) * dayFactor * seasonFactor;
      const confidence = Math.max(50, 95 - i * 1.5); // تقل الثقة مع زيادة المدة

      predictions.push({
        type: PredictionType.CONSUMPTION,
        value: Math.round(predictedValue * 100) / 100,
        confidence: Math.round(confidence),
        trend: trend > 0.5 ? 'up' : trend < -0.5 ? 'down' : 'stable',
        factors: this.getInfluencingFactors(baseDate),
        recommendations: this.getRecommendations(predictedValue, mean),
        timestamp: baseDate,
      });
    }

    return predictions;
  }

  /**
   * حساب الاتجاه
   */
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  /**
   * عامل يوم الأسبوع
   */
  private getDayFactor(dayOfWeek: number): number {
    const factors: Record<number, number> = {
      0: 0.85, // الأحد
      1: 1.0,  // الاثنين
      2: 1.0,  // الثلاثاء
      3: 1.0,  // الأربعاء
      4: 1.05, // الخميس
      5: 0.9,  // الجمعة
      6: 0.95, // السبت
    };
    return factors[dayOfWeek] || 1.0;
  }

  /**
   * عامل الموسم
   */
  private getSeasonFactor(month: number): number {
    // الصيف في السعودية (استهلاك مرتفع للتكييف)
    if (month >= 5 && month <= 8) return 1.4;
    // الشتاء
    if (month >= 11 || month <= 1) return 0.9;
    // الربيع والخريف
    return 1.0;
  }

  /**
   * العوامل المؤثرة
   */
  private getInfluencingFactors(date: Date): string[] {
    const factors: string[] = [];
    const month = date.getMonth();
    const day = date.getDay();

    if (month >= 5 && month <= 8) {
      factors.push('موسم الصيف - استهلاك مرتفع للتكييف');
    }
    if (day === 5) {
      factors.push('يوم الجمعة - استهلاك منخفض');
    }
    if (month === 8) {
      factors.push('شهر رمضان المتوقع - تغير في أنماط الاستهلاك');
    }

    return factors;
  }

  /**
   * التوصيات
   */
  private getRecommendations(predicted: number, average: number): string[] {
    const recommendations: string[] = [];
    const ratio = predicted / average;

    if (ratio > 1.2) {
      recommendations.push('يُتوقع استهلاك مرتفع - يُنصح بمراجعة كفاءة التكييف');
      recommendations.push('التحقق من عزل المباني');
    }
    if (ratio > 1.5) {
      recommendations.push('تنبيه: استهلاك مرتفع جداً متوقع');
      recommendations.push('النظر في استخدام الطاقة الشمسية');
    }

    return recommendations;
  }
}

/**
 * محرك اكتشاف الشذوذ
 */
class AnomalyDetector {
  private threshold: number = 2.5; // عدد الانحرافات المعيارية

  /**
   * اكتشاف الشذوذ في قراءة
   */
  detect(
    currentValue: number,
    historicalData: ConsumptionData[]
  ): AnomalyResult {
    if (historicalData.length < 10) {
      return {
        isAnomaly: false,
        score: 0,
        expectedValue: currentValue,
        actualValue: currentValue,
        deviation: 0,
        possibleCauses: [],
      };
    }

    const values = historicalData.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    );

    const zScore = Math.abs((currentValue - mean) / stdDev);
    const isAnomaly = zScore > this.threshold;
    const score = Math.min(100, (zScore / this.threshold) * 50);
    const deviation = ((currentValue - mean) / mean) * 100;

    return {
      isAnomaly,
      score: Math.round(score),
      expectedValue: Math.round(mean * 100) / 100,
      actualValue: currentValue,
      deviation: Math.round(deviation * 100) / 100,
      possibleCauses: this.getPossibleCauses(currentValue, mean, deviation),
    };
  }

  /**
   * الأسباب المحتملة
   */
  private getPossibleCauses(actual: number, expected: number, deviation: number): string[] {
    const causes: string[] = [];

    if (deviation > 50) {
      causes.push('تسرب محتمل في الشبكة');
      causes.push('عداد معطل أو قراءة خاطئة');
      causes.push('استخدام غير مصرح به');
    } else if (deviation > 30) {
      causes.push('زيادة في عدد الأجهزة الكهربائية');
      causes.push('تغير في أنماط الاستخدام');
      causes.push('عطل في أحد الأجهزة');
    } else if (deviation < -30) {
      causes.push('انقطاع مؤقت في الخدمة');
      causes.push('سفر أو إجازة');
      causes.push('خطأ في القراءة');
    }

    return causes;
  }
}

/**
 * محرك التنبؤ بالصيانة
 */
class MaintenancePredictor {
  /**
   * التنبؤ بالصيانة الوقائية
   */
  predictMaintenance(
    equipmentId: number,
    lastMaintenanceDate: Date,
    operatingHours: number,
    failureHistory: { date: Date; type: string }[]
  ): PredictionResult {
    const daysSinceLastMaintenance = Math.floor(
      (Date.now() - lastMaintenanceDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // حساب احتمالية العطل
    let failureProbability = 0;

    // عامل الوقت
    failureProbability += Math.min(30, daysSinceLastMaintenance / 10);

    // عامل ساعات التشغيل
    failureProbability += Math.min(30, operatingHours / 1000);

    // عامل تاريخ الأعطال
    const recentFailures = failureHistory.filter(
      f => Date.now() - f.date.getTime() < 365 * 24 * 60 * 60 * 1000
    ).length;
    failureProbability += recentFailures * 10;

    const confidence = Math.min(95, 60 + recentFailures * 5);

    // تحديد الاتجاه
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (failureProbability > 60) trend = 'up';
    else if (failureProbability < 30) trend = 'down';

    // التوصيات
    const recommendations: string[] = [];
    if (failureProbability > 70) {
      recommendations.push('صيانة عاجلة مطلوبة');
      recommendations.push('جدولة فحص شامل');
    } else if (failureProbability > 50) {
      recommendations.push('جدولة صيانة وقائية قريباً');
      recommendations.push('مراقبة مؤشرات الأداء');
    } else if (daysSinceLastMaintenance > 180) {
      recommendations.push('صيانة دورية موصى بها');
    }

    return {
      type: PredictionType.MAINTENANCE,
      value: Math.round(failureProbability),
      confidence,
      trend,
      factors: [
        `${daysSinceLastMaintenance} يوم منذ آخر صيانة`,
        `${operatingHours} ساعة تشغيل`,
        `${recentFailures} أعطال في السنة الماضية`,
      ],
      recommendations,
      timestamp: new Date(),
    };
  }
}

/**
 * محرك تحليل العملاء
 */
class CustomerAnalyzer {
  /**
   * تحليل شامل للعميل
   */
  analyze(
    customerId: number,
    paymentHistory: { date: Date; amount: number; onTime: boolean }[],
    consumptionHistory: ConsumptionData[],
    ticketHistory: { date: Date; resolved: boolean }[]
  ): CustomerAnalysis {
    // تحليل سلوك الدفع
    const onTimePayments = paymentHistory.filter(p => p.onTime).length;
    const paymentRate = paymentHistory.length > 0
      ? (onTimePayments / paymentHistory.length) * 100
      : 100;

    let paymentBehavior: 'excellent' | 'good' | 'average' | 'poor';
    if (paymentRate >= 95) paymentBehavior = 'excellent';
    else if (paymentRate >= 80) paymentBehavior = 'good';
    else if (paymentRate >= 60) paymentBehavior = 'average';
    else paymentBehavior = 'poor';

    // تحليل نمط الاستهلاك
    const avgConsumption = consumptionHistory.length > 0
      ? consumptionHistory.reduce((sum, c) => sum + c.value, 0) / consumptionHistory.length
      : 0;

    let consumptionPattern: 'low' | 'medium' | 'high' | 'variable';
    if (avgConsumption < 500) consumptionPattern = 'low';
    else if (avgConsumption < 1500) consumptionPattern = 'medium';
    else consumptionPattern = 'high';

    // حساب القيمة الدائمة
    const totalPayments = paymentHistory.reduce((sum, p) => sum + p.amount, 0);
    const monthsActive = paymentHistory.length;
    const lifetimeValue = monthsActive > 0
      ? (totalPayments / monthsActive) * 12 * 5 // تقدير 5 سنوات
      : 0;

    // حساب خطر المغادرة
    let churnRisk = 0;
    if (paymentBehavior === 'poor') churnRisk += 30;
    if (ticketHistory.filter(t => !t.resolved).length > 2) churnRisk += 25;
    if (consumptionHistory.length > 3) {
      const recentConsumption = consumptionHistory.slice(-3);
      const trend = recentConsumption[2]?.value - recentConsumption[0]?.value;
      if (trend < -avgConsumption * 0.2) churnRisk += 20;
    }

    // تحديد الشريحة
    let segment: string;
    if (lifetimeValue > 100000 && paymentBehavior === 'excellent') {
      segment = 'VIP';
    } else if (lifetimeValue > 50000) {
      segment = 'Premium';
    } else if (paymentBehavior === 'excellent') {
      segment = 'Loyal';
    } else if (churnRisk > 50) {
      segment = 'At Risk';
    } else {
      segment = 'Standard';
    }

    // التوصيات
    const recommendations: string[] = [];
    if (segment === 'VIP') {
      recommendations.push('تقديم خدمات مميزة');
      recommendations.push('مدير حساب مخصص');
    }
    if (churnRisk > 50) {
      recommendations.push('التواصل الفوري مع العميل');
      recommendations.push('تقديم عروض للاحتفاظ');
    }
    if (paymentBehavior === 'poor') {
      recommendations.push('مراجعة خطة الدفع');
      recommendations.push('تقديم خيارات تقسيط');
    }

    return {
      customerId,
      segment,
      lifetimeValue: Math.round(lifetimeValue),
      churnRisk: Math.round(churnRisk),
      paymentBehavior,
      consumptionPattern,
      recommendations,
    };
  }
}

/**
 * مدير التحليلات الذكية
 */
class AIAnalyticsManager {
  private consumptionPredictor: ConsumptionPredictor;
  private anomalyDetector: AnomalyDetector;
  private maintenancePredictor: MaintenancePredictor;
  private customerAnalyzer: CustomerAnalyzer;

  constructor() {
    this.consumptionPredictor = new ConsumptionPredictor();
    this.anomalyDetector = new AnomalyDetector();
    this.maintenancePredictor = new MaintenancePredictor();
    this.customerAnalyzer = new CustomerAnalyzer();
  }

  /**
   * التنبؤ بالاستهلاك
   */
  predictConsumption(
    historicalData: ConsumptionData[],
    daysAhead: number = 30
  ): PredictionResult[] {
    return this.consumptionPredictor.predict(historicalData, daysAhead);
  }

  /**
   * اكتشاف الشذوذ
   */
  detectAnomaly(
    currentValue: number,
    historicalData: ConsumptionData[]
  ): AnomalyResult {
    return this.anomalyDetector.detect(currentValue, historicalData);
  }

  /**
   * التنبؤ بالصيانة
   */
  predictMaintenance(
    equipmentId: number,
    lastMaintenanceDate: Date,
    operatingHours: number,
    failureHistory: { date: Date; type: string }[]
  ): PredictionResult {
    return this.maintenancePredictor.predictMaintenance(
      equipmentId,
      lastMaintenanceDate,
      operatingHours,
      failureHistory
    );
  }

  /**
   * تحليل العميل
   */
  analyzeCustomer(
    customerId: number,
    paymentHistory: { date: Date; amount: number; onTime: boolean }[],
    consumptionHistory: ConsumptionData[],
    ticketHistory: { date: Date; resolved: boolean }[]
  ): CustomerAnalysis {
    return this.customerAnalyzer.analyze(
      customerId,
      paymentHistory,
      consumptionHistory,
      ticketHistory
    );
  }

  /**
   * ملخص التحليلات
   */
  generateInsightsSummary(data: {
    totalCustomers: number;
    totalConsumption: number;
    avgConsumption: number;
    overdueInvoices: number;
    pendingMaintenance: number;
  }): {
    insights: string[];
    alerts: string[];
    recommendations: string[];
  } {
    const insights: string[] = [];
    const alerts: string[] = [];
    const recommendations: string[] = [];

    // تحليل الاستهلاك
    if (data.avgConsumption > 1500) {
      insights.push('متوسط الاستهلاك أعلى من المعدل الطبيعي');
      recommendations.push('تقديم برامج ترشيد الاستهلاك');
    }

    // تحليل الفواتير المتأخرة
    const overdueRate = (data.overdueInvoices / data.totalCustomers) * 100;
    if (overdueRate > 10) {
      alerts.push(`نسبة الفواتير المتأخرة مرتفعة: ${overdueRate.toFixed(1)}%`);
      recommendations.push('مراجعة سياسة التحصيل');
    }

    // تحليل الصيانة
    if (data.pendingMaintenance > 5) {
      alerts.push(`${data.pendingMaintenance} طلب صيانة معلق`);
      recommendations.push('زيادة فريق الصيانة أو جدولة أفضل');
    }

    return { insights, alerts, recommendations };
  }
}

// إنشاء نسخة واحدة
export const aiAnalytics = new AIAnalyticsManager();

export default aiAnalytics;
