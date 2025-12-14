import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = localStorage.getItem("demo-authenticated") === "true";

  // تحميل معلومات المستخدم من localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("demo-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // توجيه المستخدم المسجل إلى لوحة التحكم تلقائياً
  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  const logout = () => {
    localStorage.removeItem("demo-user");
    localStorage.removeItem("demo-authenticated");
    setUser(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto text-center px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          نظام إدارة محطات الكهرباء
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          نظام محاسبي متكامل لإدارة محطات الكهرباء يشمل شجرة الحسابات، الفوترة، التحصيل، المخزون، والتقارير المالية
        </p>
        
        {isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-lg text-gray-700">مرحباً {user?.name || 'بك'}</p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => setLocation("/dashboard")} className="gap-2">
                الذهاب إلى لوحة التحكم
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={logout}>
                تسجيل الخروج
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Button size="lg" onClick={() => setLocation("/login")} className="gap-2">
              تسجيل الدخول
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        )}


      </div>
    </div>
  );
}
