import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useLocation } from "wouter";

export default function SimpleLogin() {
  const [username, setUsername] = useState("");
  const [, setLocation] = useLocation();

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
    
    // التوجيه إلى لوحة التحكم
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">نظام إدارة محطات الكهرباء</CardTitle>
          <CardDescription>
            قم بتسجيل الدخول للوصول إلى النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <Input
                id="username"
                type="text"
                placeholder="أدخل اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="أدخل كلمة المرور"
                dir="rtl"
              />
            </div>
            <Button type="submit" className="w-full">
              تسجيل الدخول
            </Button>
            <p className="text-sm text-gray-500 text-center mt-4">
              نظام تجريبي - يمكنك استخدام أي اسم مستخدم
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
