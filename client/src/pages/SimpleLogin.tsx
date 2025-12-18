import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

// مدة الجلسة بالميلي ثانية
const SESSION_DURATION = 24 * 60 * 60 * 1000; // يوم واحد
const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 يوم

export default function SimpleLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // تخزين معلومات المستخدم في localStorage
    const mockUser = {
      id: "1",
      name: username || "مستخدم تجريبي",
      email: "demo@powerstation.com",
      role: "admin",
      openId: "demo-user",
    };
    
    localStorage.setItem("demo-user", JSON.stringify(mockUser));
    localStorage.setItem("demo-authenticated", "true");
    
    // تعيين مدة الجلسة
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
      // حذف بيانات "تذكرني" إذا لم يتم تفعيله
      localStorage.removeItem("remembered-credentials");
      localStorage.removeItem("remember-expiry");
    }
    
    // التوجيه إلى لوحة التحكم
    setLocation("/dashboard");
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
            
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition-colors">
              تسجيل الدخول
            </Button>
            
            {/* معلومات إضافية */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-700 text-center">
                <span className="font-semibold">نظام تجريبي</span> - يمكنك استخدام أي اسم مستخدم
              </p>
              {rememberMe && (
                <p className="text-xs text-blue-600 text-center mt-1">
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
