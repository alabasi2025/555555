import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

// مدة الجلسة بالميلي ثانية
const SESSION_DURATION = 24 * 60 * 60 * 1000; // يوم واحد
const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 يوم

export default function SimpleLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  // التحقق من وجود جلسة محفوظة عند تحميل الصفحة
  useEffect(() => {
    const savedCredentials = localStorage.getItem("remembered-credentials");
    const sessionExpiry = localStorage.getItem("session-expiry");
    const isAuthenticated = localStorage.getItem("demo-authenticated");
    
    // التحقق من صلاحية الجلسة - توجيه المستخدم المسجل إلى لوحة التحكم
    if (isAuthenticated === "true") {
      if (sessionExpiry && new Date().getTime() < parseInt(sessionExpiry)) {
        setLocation("/dashboard");
        return;
      } else {
        // انتهت صلاحية الجلسة، حذف بيانات المصادقة
        localStorage.removeItem("demo-authenticated");
        localStorage.removeItem("demo-user");
        localStorage.removeItem("session-expiry");
      }
    }
    
    // استرجاع بيانات "تذكرني" إذا كانت موجودة
    if (savedCredentials) {
      try {
        const credentials = JSON.parse(savedCredentials);
        const rememberExpiry = localStorage.getItem("remember-expiry");
        
        // التحقق من صلاحية "تذكرني"
        if (rememberExpiry && new Date().getTime() < parseInt(rememberExpiry)) {
          setUsername(credentials.username || "");
          setRememberMe(true);
        } else {
          // انتهت صلاحية "تذكرني"، حذف البيانات
          localStorage.removeItem("remembered-credentials");
          localStorage.removeItem("remember-expiry");
        }
      } catch (e) {
        console.error("Error parsing saved credentials:", e);
        localStorage.removeItem("remembered-credentials");
      }
    }
  }, [setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          rememberMe,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "فشل تسجيل الدخول");
        setIsLoading(false);
        return;
      }

      // حفظ بيانات المستخدم
      localStorage.setItem("demo-user", JSON.stringify(data.user));
      localStorage.setItem("demo-authenticated", "true");
      
      // حساب مدة الجلسة
      const sessionDuration = rememberMe ? REMEMBER_ME_DURATION : SESSION_DURATION;
      const expiryTime = new Date().getTime() + sessionDuration;
      localStorage.setItem("session-expiry", expiryTime.toString());
      
      // حفظ بيانات "تذكرني" إذا تم تفعيله
      if (rememberMe) {
        const credentials = {
          username: username,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem("remembered-credentials", JSON.stringify(credentials));
        localStorage.setItem("remember-expiry", (new Date().getTime() + REMEMBER_ME_DURATION).toString());
      } else {
        localStorage.removeItem("remembered-credentials");
        localStorage.removeItem("remember-expiry");
      }

      setSuccess("تم تسجيل الدخول بنجاح!");
      
      // التوجيه إلى لوحة التحكم بعد ثانية
      setTimeout(() => {
        setLocation("/dashboard");
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    
    // إذا تم إلغاء التفعيل، حذف البيانات المحفوظة
    if (!checked) {
      localStorage.removeItem("remembered-credentials");
      localStorage.removeItem("remember-expiry");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold">نظام إدارة محطات الكهرباء</CardTitle>
          <CardDescription className="text-gray-600">
            قم بتسجيل الدخول للوصول إلى النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* رسائل الخطأ والنجاح */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="border-green-500 bg-green-50 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-right block">اسم المستخدم</Label>
              <Input
                id="username"
                type="text"
                placeholder="أدخل اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                dir="rtl"
                className="text-right"
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-right block">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="rtl"
                className="text-right"
                disabled={isLoading}
                required
              />
            </div>
            
            {/* حقل تذكرني */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={handleRememberMeChange}
                  className="data-[state=checked]:bg-blue-600"
                  disabled={isLoading}
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
                >
                  تذكرني
                </Label>
              </div>
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  alert("سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني");
                }}
              >
                نسيت كلمة المرور؟
              </a>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </Button>
            
            {/* معلومات الحساب الافتراضي */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-700 text-center font-semibold mb-2">
                بيانات الدخول الافتراضية
              </p>
              <div className="text-xs text-blue-600 text-center space-y-1">
                <p><span className="font-medium">اسم المستخدم:</span> admin</p>
                <p><span className="font-medium">كلمة المرور:</span> admin123</p>
              </div>
              {rememberMe && (
                <p className="text-xs text-blue-500 text-center mt-2 pt-2 border-t border-blue-200">
                  سيتم حفظ بيانات الدخول لمدة 30 يوم
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
