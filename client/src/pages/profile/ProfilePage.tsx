import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Shield,
  Key,
  Bell,
  Globe,
  Palette,
  Camera,
  Edit3,
  Save,
  X,
  Check,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Clock,
  Activity,
  LogOut,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // حالة البيانات الشخصية
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "أحمد محمد",
    email: user?.email || "ahmed@example.com",
    phone: "+966 50 123 4567",
    address: "الرياض، المملكة العربية السعودية",
    department: "تقنية المعلومات",
    jobTitle: "مدير النظام",
    bio: "مدير نظام متخصص في إدارة البنية التحتية وأنظمة الطاقة.",
    joinDate: "2023-01-15",
  });

  // حالة الأمان
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    emailNotifications: true,
    smsNotifications: false,
    loginAlerts: true,
  });

  // حالة كلمة المرور
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // حالة التفضيلات
  const [preferences, setPreferences] = useState({
    language: "ar",
    timezone: "Asia/Riyadh",
    dateFormat: "dd/MM/yyyy",
    theme: "system",
  });

  // الجلسات النشطة
  const [activeSessions] = useState([
    {
      id: 1,
      device: "Chrome على Windows",
      location: "الرياض، السعودية",
      ip: "192.168.1.100",
      lastActive: "الآن",
      current: true,
      icon: Monitor,
    },
    {
      id: 2,
      device: "Safari على iPhone",
      location: "جدة، السعودية",
      ip: "192.168.1.101",
      lastActive: "منذ ساعتين",
      current: false,
      icon: Smartphone,
    },
  ]);

  // سجل النشاط
  const [activityLog] = useState([
    { id: 1, action: "تسجيل دخول", time: "اليوم 10:30 ص", status: "success" },
    { id: 2, action: "تحديث الملف الشخصي", time: "أمس 3:45 م", status: "success" },
    { id: 3, action: "تغيير كلمة المرور", time: "منذ 3 أيام", status: "success" },
    { id: 4, action: "محاولة دخول فاشلة", time: "منذ أسبوع", status: "error" },
  ]);

  // حساب قوة كلمة المرور
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 15;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 10;
    return Math.min(strength, 100);
  };

  const passwordStrength = calculatePasswordStrength(passwordData.newPassword);

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 30) return "bg-red-500";
    if (strength < 60) return "bg-yellow-500";
    if (strength < 80) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 30) return "ضعيفة";
    if (strength < 60) return "متوسطة";
    if (strength < 80) return "جيدة";
    return "قوية";
  };

  // معالجة حفظ البيانات
  const handleSaveProfile = () => {
    setIsEditing(false);
    toast({
      title: "تم الحفظ",
      description: "تم تحديث بيانات الملف الشخصي بنجاح",
    });
  };

  // معالجة تغيير كلمة المرور
  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمة المرور الجديدة غير متطابقة",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "تم التغيير",
      description: "تم تغيير كلمة المرور بنجاح",
    });
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  // معالجة رفع الصورة
  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({
        title: "تم الرفع",
        description: "تم تحديث صورة الملف الشخصي",
      });
    }
  };

  // إنهاء جلسة
  const handleEndSession = (sessionId: number) => {
    toast({
      title: "تم الإنهاء",
      description: "تم إنهاء الجلسة بنجاح",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">الملف الشخصي</h1>
            <p className="text-muted-foreground">
              إدارة معلوماتك الشخصية وإعدادات الحساب
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="ml-2 h-4 w-4" />
              تصدير البيانات
            </Button>
          </div>
        </div>

        {/* Profile Header Card */}
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          <CardContent className="relative pt-0">
            <div className="flex flex-col items-center -mt-16 md:flex-row md:items-end md:gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    {profileData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-lg"
                  onClick={handleAvatarUpload}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Info */}
              <div className="mt-4 text-center md:mt-0 md:text-right md:flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{profileData.name}</h2>
                    <p className="text-muted-foreground">{profileData.jobTitle}</p>
                    <div className="flex items-center justify-center gap-2 mt-2 md:justify-start">
                      <Badge variant="secondary" className="gap-1">
                        <Building2 className="h-3 w-3" />
                        {profileData.department}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Calendar className="h-3 w-3" />
                        منذ {new Date(profileData.joinDate).toLocaleDateString("ar-SA", { year: "numeric", month: "long" })}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)}>
                        <Edit3 className="ml-2 h-4 w-4" />
                        تعديل الملف
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          <X className="ml-2 h-4 w-4" />
                          إلغاء
                        </Button>
                        <Button onClick={handleSaveProfile}>
                          <Save className="ml-2 h-4 w-4" />
                          حفظ
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="personal" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">البيانات الشخصية</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">الأمان</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">التفضيلات</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">النشاط</span>
            </TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="personal" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">المعلومات الأساسية</CardTitle>
                  <CardDescription>بياناتك الشخصية الأساسية</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">الاسم الكامل</Label>
                    <div className="relative">
                      <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        disabled={!isEditing}
                        className="pr-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        disabled={!isEditing}
                        className="pr-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="pr-10"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">العنوان</Label>
                    <div className="relative">
                      <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        disabled={!isEditing}
                        className="pr-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Work Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">معلومات العمل</CardTitle>
                  <CardDescription>بيانات الوظيفة والقسم</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">القسم</Label>
                    <div className="relative">
                      <Building2 className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="department"
                        value={profileData.department}
                        onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                        disabled={!isEditing}
                        className="pr-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">المسمى الوظيفي</Label>
                    <Input
                      id="jobTitle"
                      value={profileData.jobTitle}
                      onChange={(e) => setProfileData({ ...profileData, jobTitle: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">نبذة تعريفية</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      disabled={!isEditing}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>تاريخ الانضمام</Label>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(profileData.joinDate).toLocaleDateString("ar-SA", { 
                        year: "numeric", 
                        month: "long", 
                        day: "numeric" 
                      })}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Password Change */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    تغيير كلمة المرور
                  </CardTitle>
                  <CardDescription>تحديث كلمة المرور الخاصة بك</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="pl-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute left-1 top-1 h-7 w-7"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="pl-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute left-1 top-1 h-7 w-7"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {passwordData.newPassword && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>قوة كلمة المرور</span>
                          <span className={`font-medium ${
                            passwordStrength < 30 ? "text-red-500" :
                            passwordStrength < 60 ? "text-yellow-500" :
                            passwordStrength < 80 ? "text-blue-500" : "text-green-500"
                          }`}>
                            {getPasswordStrengthText(passwordStrength)}
                          </span>
                        </div>
                        <Progress value={passwordStrength} className={`h-1.5 ${getPasswordStrengthColor(passwordStrength)}`} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="pl-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute left-1 top-1 h-7 w-7"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        كلمة المرور غير متطابقة
                      </p>
                    )}
                    {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                      <p className="text-xs text-green-500 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        كلمة المرور متطابقة
                      </p>
                    )}
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={handleChangePassword}
                    disabled={!passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                  >
                    <RefreshCw className="ml-2 h-4 w-4" />
                    تغيير كلمة المرور
                  </Button>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    إعدادات الأمان
                  </CardTitle>
                  <CardDescription>تكوين خيارات الأمان</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">المصادقة الثنائية</Label>
                      <p className="text-sm text-muted-foreground">
                        إضافة طبقة أمان إضافية لحسابك
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorEnabled}
                      onCheckedChange={(checked) => 
                        setSecuritySettings({ ...securitySettings, twoFactorEnabled: checked })
                      }
                    />
                  </div>
                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">إشعارات البريد</Label>
                      <p className="text-sm text-muted-foreground">
                        استلام إشعارات عبر البريد الإلكتروني
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setSecuritySettings({ ...securitySettings, emailNotifications: checked })
                      }
                    />
                  </div>
                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">إشعارات SMS</Label>
                      <p className="text-sm text-muted-foreground">
                        استلام إشعارات عبر الرسائل النصية
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.smsNotifications}
                      onCheckedChange={(checked) => 
                        setSecuritySettings({ ...securitySettings, smsNotifications: checked })
                      }
                    />
                  </div>
                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">تنبيهات تسجيل الدخول</Label>
                      <p className="text-sm text-muted-foreground">
                        إشعار عند تسجيل الدخول من جهاز جديد
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.loginAlerts}
                      onCheckedChange={(checked) => 
                        setSecuritySettings({ ...securitySettings, loginAlerts: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Active Sessions */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    الجلسات النشطة
                  </CardTitle>
                  <CardDescription>الأجهزة المتصلة بحسابك حالياً</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeSessions.map((session) => (
                      <div
                        key={session.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          session.current ? "bg-primary/5 border-primary/20" : ""
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            session.current ? "bg-primary/10 text-primary" : "bg-muted"
                          }`}>
                            <session.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{session.device}</p>
                              {session.current && (
                                <Badge variant="secondary" className="text-xs">
                                  الجلسة الحالية
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {session.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {session.lastActive}
                              </span>
                            </div>
                          </div>
                        </div>
                        {!session.current && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleEndSession(session.id)}
                          >
                            <LogOut className="ml-2 h-4 w-4" />
                            إنهاء
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    اللغة والمنطقة
                  </CardTitle>
                  <CardDescription>إعدادات اللغة والتوقيت</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>اللغة</Label>
                    <Select
                      value={preferences.language}
                      onValueChange={(value) => setPreferences({ ...preferences, language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>المنطقة الزمنية</Label>
                    <Select
                      value={preferences.timezone}
                      onValueChange={(value) => setPreferences({ ...preferences, timezone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Riyadh">الرياض (GMT+3)</SelectItem>
                        <SelectItem value="Asia/Dubai">دبي (GMT+4)</SelectItem>
                        <SelectItem value="Africa/Cairo">القاهرة (GMT+2)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>تنسيق التاريخ</Label>
                    <Select
                      value={preferences.dateFormat}
                      onValueChange={(value) => setPreferences({ ...preferences, dateFormat: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dd/MM/yyyy">يوم/شهر/سنة</SelectItem>
                        <SelectItem value="MM/dd/yyyy">شهر/يوم/سنة</SelectItem>
                        <SelectItem value="yyyy-MM-dd">سنة-شهر-يوم</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    المظهر
                  </CardTitle>
                  <CardDescription>تخصيص مظهر التطبيق</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>وضع العرض</Label>
                    <Select
                      value={preferences.theme}
                      onValueChange={(value) => setPreferences({ ...preferences, theme: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">فاتح</SelectItem>
                        <SelectItem value="dark">داكن</SelectItem>
                        <SelectItem value="system">تلقائي (حسب النظام)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4">
                    <Button variant="outline" className="w-full">
                      <RefreshCw className="ml-2 h-4 w-4" />
                      إعادة تعيين التفضيلات
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="md:col-span-2 border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    منطقة الخطر
                  </CardTitle>
                  <CardDescription>إجراءات لا يمكن التراجع عنها</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="text-destructive hover:text-destructive">
                        <LogOut className="ml-2 h-4 w-4" />
                        تسجيل الخروج من جميع الأجهزة
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>تسجيل الخروج من جميع الأجهزة؟</AlertDialogTitle>
                        <AlertDialogDescription>
                          سيتم تسجيل خروجك من جميع الأجهزة المتصلة بحسابك. ستحتاج لتسجيل الدخول مرة أخرى.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          تأكيد
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="ml-2 h-4 w-4" />
                        حذف الحساب
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد من حذف الحساب؟</AlertDialogTitle>
                        <AlertDialogDescription>
                          هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك نهائياً.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          حذف الحساب
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  سجل النشاط
                </CardTitle>
                <CardDescription>آخر الأنشطة على حسابك</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLog.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          activity.status === "success" 
                            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
                            : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {activity.status === "success" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                      <Badge variant={activity.status === "success" ? "secondary" : "destructive"}>
                        {activity.status === "success" ? "ناجح" : "فاشل"}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <Button variant="outline">
                    عرض المزيد
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
