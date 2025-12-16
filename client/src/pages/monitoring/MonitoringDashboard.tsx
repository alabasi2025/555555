// @ts-nocheck
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Zap,
  Gauge,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  Server,
  Wifi,
  WifiOff,
  ThermometerSun,
  Droplets,
  Wind,
} from "lucide-react";

// بيانات تجريبية للمحطات
const stationsData = [
  {
    id: 1,
    name: "محطة الرياض الرئيسية",
    status: "online",
    load: 78,
    voltage: 220,
    current: 150,
    power: 33000,
    temperature: 42,
    humidity: 35,
    lastUpdate: "منذ دقيقتين",
    alerts: 0,
  },
  {
    id: 2,
    name: "محطة جدة الشمالية",
    status: "online",
    load: 65,
    voltage: 218,
    current: 120,
    power: 26160,
    temperature: 38,
    humidity: 55,
    lastUpdate: "منذ دقيقة",
    alerts: 1,
  },
  {
    id: 3,
    name: "محطة الدمام الصناعية",
    status: "warning",
    load: 92,
    voltage: 215,
    current: 180,
    power: 38700,
    temperature: 55,
    humidity: 40,
    lastUpdate: "منذ 5 دقائق",
    alerts: 3,
  },
  {
    id: 4,
    name: "محطة المدينة المنورة",
    status: "online",
    load: 45,
    voltage: 221,
    current: 85,
    power: 18785,
    temperature: 35,
    humidity: 30,
    lastUpdate: "منذ دقيقة",
    alerts: 0,
  },
  {
    id: 5,
    name: "محطة الطائف",
    status: "offline",
    load: 0,
    voltage: 0,
    current: 0,
    power: 0,
    temperature: 28,
    humidity: 45,
    lastUpdate: "منذ ساعة",
    alerts: 5,
  },
];

// بيانات التنبيهات
const alertsData = [
  { id: 1, station: "محطة الدمام الصناعية", type: "critical", message: "ارتفاع درجة الحرارة فوق الحد المسموح", time: "منذ 10 دقائق" },
  { id: 2, station: "محطة الدمام الصناعية", type: "warning", message: "الحمل يقترب من الحد الأقصى (92%)", time: "منذ 15 دقيقة" },
  { id: 3, station: "محطة الطائف", type: "critical", message: "فقدان الاتصال بالمحطة", time: "منذ ساعة" },
  { id: 4, station: "محطة جدة الشمالية", type: "info", message: "صيانة مجدولة خلال 24 ساعة", time: "منذ ساعتين" },
  { id: 5, station: "محطة الدمام الصناعية", type: "warning", message: "انخفاض الجهد عن المستوى الطبيعي", time: "منذ 20 دقيقة" },
];

export default function MonitoringDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 ml-1" /> متصل</Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 ml-1" /> تحذير</Badge>;
      case "offline":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 ml-1" /> غير متصل</Badge>;
      default:
        return <Badge variant="secondary">غير معروف</Badge>;
    }
  };

  const getLoadColor = (load: number) => {
    if (load >= 90) return "bg-red-500";
    if (load >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const onlineStations = stationsData.filter(s => s.status === "online").length;
  const warningStations = stationsData.filter(s => s.status === "warning").length;
  const offlineStations = stationsData.filter(s => s.status === "offline").length;
  const totalPower = stationsData.reduce((sum, s) => sum + s.power, 0);
  const avgLoad = stationsData.filter(s => s.status !== "offline").reduce((sum, s) => sum + s.load, 0) / (onlineStations + warningStations) || 0;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6" dir="rtl">
        {/* العنوان وزر التحديث */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">مراقبة المحطات</h1>
            <p className="text-muted-foreground">مراقبة حية لجميع محطات الكهرباء</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 ml-2 ${isRefreshing ? "animate-spin" : ""}`} />
            تحديث
          </Button>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">المحطات المتصلة</CardTitle>
              <Wifi className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{onlineStations}</div>
              <p className="text-xs text-muted-foreground">من أصل {stationsData.length} محطة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">تحذيرات نشطة</CardTitle>
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{warningStations}</div>
              <p className="text-xs text-muted-foreground">محطات تحتاج انتباه</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الطاقة</CardTitle>
              <Zap className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(totalPower / 1000).toFixed(1)} MW</div>
              <p className="text-xs text-muted-foreground">الإنتاج الحالي</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">متوسط الحمل</CardTitle>
              <Gauge className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgLoad.toFixed(1)}%</div>
              <Progress value={avgLoad} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* التبويبات */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="stations">المحطات</TabsTrigger>
            <TabsTrigger value="alerts">التنبيهات ({alertsData.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* قائمة المحطات المختصرة */}
              <Card>
                <CardHeader>
                  <CardTitle>حالة المحطات</CardTitle>
                  <CardDescription>نظرة سريعة على جميع المحطات</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stationsData.map((station) => (
                      <div key={station.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {station.status === "online" ? (
                            <Wifi className="w-5 h-5 text-green-500" />
                          ) : station.status === "warning" ? (
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <WifiOff className="w-5 h-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">{station.name}</p>
                            <p className="text-sm text-muted-foreground">{station.lastUpdate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-left">
                            <p className="text-sm font-medium">{station.load}%</p>
                            <Progress value={station.load} className={`w-20 h-2 ${getLoadColor(station.load)}`} />
                          </div>
                          {getStatusBadge(station.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* آخر التنبيهات */}
              <Card>
                <CardHeader>
                  <CardTitle>آخر التنبيهات</CardTitle>
                  <CardDescription>التنبيهات الأخيرة من جميع المحطات</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alertsData.slice(0, 5).map((alert) => (
                      <div key={alert.id} className={`p-3 rounded-lg border-r-4 ${
                        alert.type === "critical" ? "border-red-500 bg-red-50" :
                        alert.type === "warning" ? "border-yellow-500 bg-yellow-50" :
                        "border-blue-500 bg-blue-50"
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{alert.station}</p>
                            <p className="text-sm text-muted-foreground">{alert.message}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">{alert.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stations" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stationsData.map((station) => (
                <Card key={station.id} className={station.status === "offline" ? "opacity-60" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{station.name}</CardTitle>
                      {getStatusBadge(station.status)}
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {station.lastUpdate}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Gauge className="w-3 h-3" /> الحمل
                        </p>
                        <p className="text-lg font-bold">{station.load}%</p>
                        <Progress value={station.load} className="h-2" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Zap className="w-3 h-3" /> الطاقة
                        </p>
                        <p className="text-lg font-bold">{(station.power / 1000).toFixed(1)} kW</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <ThermometerSun className="w-3 h-3" /> الحرارة
                        </p>
                        <p className="text-lg font-bold">{station.temperature}°C</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Droplets className="w-3 h-3" /> الرطوبة
                        </p>
                        <p className="text-lg font-bold">{station.humidity}%</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t flex justify-between text-sm">
                      <span>الجهد: {station.voltage}V</span>
                      <span>التيار: {station.current}A</span>
                    </div>
                    {station.alerts > 0 && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {station.alerts} تنبيهات نشطة
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>جميع التنبيهات</CardTitle>
                <CardDescription>قائمة بجميع التنبيهات النشطة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alertsData.map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-lg border ${
                      alert.type === "critical" ? "border-red-200 bg-red-50" :
                      alert.type === "warning" ? "border-yellow-200 bg-yellow-50" :
                      "border-blue-200 bg-blue-50"
                    }`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          {alert.type === "critical" ? (
                            <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                          ) : alert.type === "warning" ? (
                            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                          ) : (
                            <Activity className="w-5 h-5 text-blue-500 mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium">{alert.station}</p>
                            <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <Badge variant={alert.type === "critical" ? "destructive" : alert.type === "warning" ? "secondary" : "default"}>
                            {alert.type === "critical" ? "حرج" : alert.type === "warning" ? "تحذير" : "معلومات"}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
