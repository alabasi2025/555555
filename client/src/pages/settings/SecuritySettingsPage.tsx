import { useState } from 'react';
import { trpc } from '../../lib/trpc';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  Key, 
  Smartphone, 
  Lock, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Copy,
  RefreshCw,
  History
} from 'lucide-react';

export default function SecuritySettingsPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [sessions] = useState([
    { id: 1, device: 'Chrome على Windows', location: 'الرياض، السعودية', lastActive: 'الآن', current: true },
    { id: 2, device: 'Safari على iPhone', location: 'جدة، السعودية', lastActive: 'منذ ساعتين', current: false },
    { id: 3, device: 'Firefox على MacOS', location: 'الدمام، السعودية', lastActive: 'منذ يومين', current: false },
  ]);

  const [activityLog] = useState([
    { id: 1, action: 'تسجيل دخول ناجح', ip: '192.168.1.1', time: '2025-12-20 10:30', status: 'success' },
    { id: 2, action: 'تغيير كلمة المرور', ip: '192.168.1.1', time: '2025-12-19 15:45', status: 'success' },
    { id: 3, action: 'محاولة تسجيل دخول فاشلة', ip: '10.0.0.5', time: '2025-12-18 08:20', status: 'failed' },
    { id: 4, action: 'تفعيل المصادقة الثنائية', ip: '192.168.1.1', time: '2025-12-17 14:00', status: 'success' },
  ]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('كلمات المرور غير متطابقة');
      return;
    }
    // تنفيذ تغيير كلمة المرور
    console.log('تغيير كلمة المرور');
  };

  const handleEnable2FA = async () => {
    // محاكاة توليد QR Code
    setQrCodeUrl('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/PowerStation:admin?secret=JBSWY3DPEHPK3PXP&issuer=PowerStation');
    setBackupCodes([
      'ABCD-1234', 'EFGH-5678', 'IJKL-9012', 'MNOP-3456',
      'QRST-7890', 'UVWX-1234', 'YZAB-5678', 'CDEF-9012'
    ]);
  };

  const handleVerify2FA = async () => {
    if (verificationCode.length === 6) {
      setTwoFactorEnabled(true);
      setShowBackupCodes(true);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    alert('تم نسخ الأكواد الاحتياطية');
  };

  const terminateSession = (sessionId: number) => {
    console.log('إنهاء الجلسة:', sessionId);
  };

  const terminateAllSessions = () => {
    console.log('إنهاء جميع الجلسات الأخرى');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">إعدادات الأمان</h1>
          <p className="text-gray-500">إدارة أمان حسابك وحمايته</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* تغيير كلمة المرور */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              تغيير كلمة المرور
            </CardTitle>
            <CardDescription>
              قم بتحديث كلمة المرور بشكل دوري للحفاظ على أمان حسابك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="pl-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="pl-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </div>

              <div className="text-sm text-gray-500 space-y-1">
                <p>متطلبات كلمة المرور:</p>
                <ul className="list-disc list-inside">
                  <li>8 أحرف على الأقل</li>
                  <li>حرف كبير واحد على الأقل</li>
                  <li>رقم واحد على الأقل</li>
                  <li>رمز خاص واحد على الأقل</li>
                </ul>
              </div>

              <Button type="submit" className="w-full">
                <Lock className="h-4 w-4 ml-2" />
                تحديث كلمة المرور
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* المصادقة الثنائية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              المصادقة الثنائية (2FA)
            </CardTitle>
            <CardDescription>
              أضف طبقة أمان إضافية لحسابك باستخدام تطبيق المصادقة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${twoFactorEnabled ? 'bg-green-100' : 'bg-gray-200'}`}>
                  <Shield className={`h-5 w-5 ${twoFactorEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="font-medium">المصادقة الثنائية</p>
                  <p className="text-sm text-gray-500">
                    {twoFactorEnabled ? 'مفعّلة' : 'غير مفعّلة'}
                  </p>
                </div>
              </div>
              <Badge variant={twoFactorEnabled ? 'default' : 'secondary'}>
                {twoFactorEnabled ? 'نشط' : 'غير نشط'}
              </Badge>
            </div>

            {!twoFactorEnabled ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={handleEnable2FA} className="w-full">
                    تفعيل المصادقة الثنائية
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>تفعيل المصادقة الثنائية</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-4">
                        امسح رمز QR باستخدام تطبيق المصادقة (Google Authenticator أو Authy)
                      </p>
                      {qrCodeUrl && (
                        <img src={qrCodeUrl} alt="QR Code" className="mx-auto border rounded-lg" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>أدخل رمز التحقق</Label>
                      <Input
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                        className="text-center text-2xl tracking-widest"
                      />
                    </div>
                    <Button onClick={handleVerify2FA} className="w-full">
                      تأكيد وتفعيل
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <div className="space-y-3">
                <Alert>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    المصادقة الثنائية مفعّلة. حسابك محمي بطبقة أمان إضافية.
                  </AlertDescription>
                </Alert>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      عرض الأكواد الاحتياطية
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>الأكواد الاحتياطية</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          احفظ هذه الأكواد في مكان آمن. يمكنك استخدامها للدخول إذا فقدت الوصول لتطبيق المصادقة.
                        </AlertDescription>
                      </Alert>
                      <div className="grid grid-cols-2 gap-2">
                        {backupCodes.map((code, index) => (
                          <div key={index} className="p-2 bg-gray-100 rounded text-center font-mono">
                            {code}
                          </div>
                        ))}
                      </div>
                      <Button onClick={copyBackupCodes} variant="outline" className="w-full">
                        <Copy className="h-4 w-4 ml-2" />
                        نسخ الأكواد
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="destructive" className="w-full">
                  تعطيل المصادقة الثنائية
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* الجلسات النشطة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              الجلسات النشطة
            </CardTitle>
            <CardDescription>
              إدارة الأجهزة المتصلة بحسابك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg border ${session.current ? 'border-blue-200 bg-blue-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{session.device}</p>
                        {session.current && (
                          <Badge variant="secondary" className="text-xs">الجلسة الحالية</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{session.location}</p>
                      <p className="text-xs text-gray-400">{session.lastActive}</p>
                    </div>
                    {!session.current && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => terminateSession(session.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        إنهاء
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4 text-red-600 hover:text-red-700"
              onClick={terminateAllSessions}
            >
              إنهاء جميع الجلسات الأخرى
            </Button>
          </CardContent>
        </Card>

        {/* سجل النشاط الأمني */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              سجل النشاط الأمني
            </CardTitle>
            <CardDescription>
              آخر الأنشطة الأمنية على حسابك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activityLog.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-full ${
                      activity.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {activity.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-xs text-gray-500">IP: {activity.ip}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              ))}
            </div>
            <Button variant="link" className="w-full mt-2">
              عرض السجل الكامل
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
