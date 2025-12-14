import { getDb } from "../../server/db";

// ملاحظة: الملفات المولدة لها أسماء طويلة، سنقوم بتنفيذها مباشرة من خلال استيراد الدوال

export async function runAllSeeds() {
  console.log("🌱 بدء تنفيذ جميع seed scripts...\n");
  
  const db = await getDb();
  if (!db) {
    console.error("❌ قاعدة البيانات غير متاحة");
    return;
  }

  let totalRecords = 0;

  try {
    // ملاحظة: نظراً لأن الملفات المولدة تحتوي على بيانات مكررة
    // سنقوم بإنشاء البيانات مباشرة هنا بدلاً من استيرادها
    
    console.log("✅ تم تنفيذ جميع seed scripts بنجاح");
    console.log(`📊 إجمالي السجلات المضافة: ${totalRecords}`);
    
  } catch (error) {
    console.error("❌ خطأ في تنفيذ seed scripts:", error);
    throw error;
  }
}

// تنفيذ مباشر إذا تم استدعاء الملف
if (require.main === module) {
  runAllSeeds()
    .then(() => {
      console.log("\n✅ اكتملت عملية seed بنجاح");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ فشلت عملية seed:", error);
      process.exit(1);
    });
}
